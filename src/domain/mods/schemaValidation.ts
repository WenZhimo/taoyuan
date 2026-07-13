import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv'
import type { Static, TSchema } from '@sinclair/typebox'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import type { PackageId } from './ids'

export interface SchemaValidationContext {
  stage: string
  packageId?: PackageId
  file?: string
}

export type SchemaValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; diagnostics: ModDiagnostic[] }

export const createModAjv = (): Ajv =>
  new Ajv({
    allErrors: true,
    strict: true,
    allowUnionTypes: true
  })

const stripNestedSchemaIds = <Schema extends TSchema>(schema: Schema): Schema => {
  const cloned = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>
  const visit = (node: unknown, isRoot: boolean): void => {
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    if (!isRoot) delete record.$id
    for (const value of Object.values(record)) visit(value, false)
  }
  visit(cloned, true)
  return cloned as unknown as Schema
}

const toFieldPath = (error: ErrorObject): string => {
  const path = error.instancePath || '/'
  if (error.keyword === 'required' && typeof error.params?.missingProperty === 'string') {
    return `${path === '/' ? '' : path}/${error.params.missingProperty}`
  }
  if (error.keyword === 'additionalProperties' && typeof error.params?.additionalProperty === 'string') {
    return `${path === '/' ? '' : path}/${error.params.additionalProperty}`
  }
  return path
}

export const compileSchema = <Schema extends TSchema>(
  schema: Schema,
  context: SchemaValidationContext
): SchemaValidationResult<ValidateFunction<Static<Schema>>> => {
  try {
    const ajv = createModAjv()
    return { ok: true, data: ajv.compile<Static<Schema>>(stripNestedSchemaIds(schema)) }
  } catch (error) {
    return {
      ok: false,
      diagnostics: [
        createDiagnostic('SCHEMA-COMPILE-001', {
          stage: context.stage,
          packageId: context.packageId,
          file: context.file,
          details: {
            message: error instanceof Error ? error.message : String(error)
          }
        })
      ]
    }
  }
}

export const validateUnknown = <Schema extends TSchema>(
  schema: Schema,
  value: unknown,
  context: SchemaValidationContext
): SchemaValidationResult<Static<Schema>> => {
  const compiled = compileSchema(schema, context)
  if (!compiled.ok) return compiled

  const validate = compiled.data
  if (validate(value)) {
    return { ok: true, data: value }
  }

  const diagnostics = (validate.errors ?? []).map(error =>
    createDiagnostic('SCHEMA-VALIDATE-001', {
      stage: context.stage,
      packageId: context.packageId,
      file: context.file,
      fieldPath: toFieldPath(error),
      details: {
        keyword: error.keyword,
        message: error.message ?? ''
      }
    })
  )
  return { ok: false, diagnostics }
}
