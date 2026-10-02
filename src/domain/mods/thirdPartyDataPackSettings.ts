import { Type } from '@sinclair/typebox'
import type { JsonValue } from './canonicalJson'
import { assertPureJsonValue, compareCodePoints } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import { PackageSettingDefinitionSchema, type PackageSettingDefinition } from './schemas'
import { createModAjv, validateUnknown } from './schemaValidation'

export type { PackageSettingDefinition } from './schemas'

export const PackageSettingDefinitionsSchema = Type.Array(PackageSettingDefinitionSchema)

export type InstallationPackageSettings = Readonly<Record<string, JsonValue>>
export type InstallationPackageSettingsByPackageId = Readonly<Record<string, InstallationPackageSettings | undefined>>

export interface PackageSettingDefinitionsResult {
  readonly ok: true
  readonly definitions: readonly PackageSettingDefinition[]
}

export interface PackageSettingDefinitionsFailure {
  readonly ok: false
  readonly diagnostics: readonly ModDiagnostic[]
}

export type PackageSettingDefinitionsValidationResult =
  | PackageSettingDefinitionsResult
  | PackageSettingDefinitionsFailure

export interface InstallationPackageSettingsResult {
  readonly ok: true
  readonly values: InstallationPackageSettings
  readonly configurationHash: Sha256Hash
}

export interface InstallationPackageSettingsFailure {
  readonly ok: false
  readonly diagnostics: readonly ModDiagnostic[]
}

export type InstallationPackageSettingsValidationResult =
  | InstallationPackageSettingsResult
  | InstallationPackageSettingsFailure

interface SettingValidationContext {
  readonly packageId?: PackageId
  readonly file?: string
}

const createSettingDiagnostic = (
  code: 'CFG-SCOPE-001' | 'CFG-MIGRATE-001' | 'SCHEMA-COMPILE-001' | 'SCHEMA-VALIDATE-001',
  context: SettingValidationContext,
  fieldPath: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic(code, {
  stage: 'third-party.settings',
  packageId: context.packageId,
  file: context.file,
  fieldPath,
  details,
  recovery: 'disable-package'
})

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(item => cloneJsonValue(item))

  const result: Record<string, JsonValue> = {}
  for (const [key, child] of Object.entries(value)) result[key] = cloneJsonValue(child)
  return result
}

const cloneSettingDefinition = (definition: PackageSettingDefinition): PackageSettingDefinition => ({
  id: definition.id,
  scope: definition.scope,
  default: cloneJsonValue(definition.default as JsonValue),
  schema: cloneJsonValue(definition.schema as JsonValue)
})

const settingSchemaErrors = (
  validator: { readonly errors?: readonly { readonly keyword?: string; readonly instancePath?: string }[] },
  context: SettingValidationContext,
  fieldPath: string
): ModDiagnostic[] => (validator.errors ?? []).map(error => createSettingDiagnostic(
  'SCHEMA-VALIDATE-001',
  context,
  `${fieldPath}${error.instancePath || ''}`,
  {
    keyword: error.keyword ?? '',
    message: 'Setting value does not satisfy its declared schema'
  }
))

const compileSettingSchema = (
  definition: PackageSettingDefinition,
  context: SettingValidationContext,
  fieldPath: string
):
  | { readonly ok: true; readonly validate: (value: unknown) => boolean; readonly errors: () => readonly { readonly keyword?: string; readonly instancePath?: string }[] }
  | { readonly ok: false; readonly diagnostics: readonly ModDiagnostic[] } => {
  try {
    const validate = createModAjv().compile(definition.schema as object)
    return {
      ok: true,
      validate,
      errors: () => validate.errors ?? []
    }
  } catch (error) {
    return {
      ok: false,
      diagnostics: [createSettingDiagnostic(
        'SCHEMA-COMPILE-001',
        context,
        `${fieldPath}/schema`,
        { message: error instanceof Error ? error.message : String(error) }
      )]
    }
  }
}

const validateDefinition = (
  definition: PackageSettingDefinition,
  index: number,
  context: SettingValidationContext
): ModDiagnostic[] => {
  const fieldPath = `/${index}`
  const compiled = compileSettingSchema(definition, context, fieldPath)
  if (!compiled.ok) return [...compiled.diagnostics]
  if (compiled.validate(definition.default)) return []
  return settingSchemaErrors({ errors: compiled.errors() }, context, `${fieldPath}/default`)
}

export const validatePackageSettingDefinitions = (
  value: unknown,
  context: SettingValidationContext = {}
): PackageSettingDefinitionsValidationResult => {
  try {
    assertPureJsonValue(value)
  } catch (error) {
    return {
      ok: false,
      diagnostics: [createSettingDiagnostic(
        'SCHEMA-VALIDATE-001',
        context,
        '/',
        { message: error instanceof Error ? error.message : String(error) }
      )]
    }
  }

  const result = validateUnknown(PackageSettingDefinitionsSchema, value, {
    stage: 'third-party.settings',
    packageId: context.packageId,
    file: context.file
  })
  if (!result.ok) return { ok: false, diagnostics: result.diagnostics }

  const definitions = result.data as PackageSettingDefinition[]
  const diagnostics: ModDiagnostic[] = []
  const seenIds = new Set<string>()
  definitions.forEach((definition, index) => {
    if (seenIds.has(definition.id)) {
      diagnostics.push(createSettingDiagnostic(
        'CFG-SCOPE-001',
        context,
        `/${index}/id`,
        { reason: 'Setting ids must be unique within a package', id: definition.id }
      ))
    }
    seenIds.add(definition.id)
    diagnostics.push(...validateDefinition(definition, index, context))
  })
  if (diagnostics.length > 0) return { ok: false, diagnostics }

  return {
    ok: true,
    definitions: definitions
      .map(definition => cloneSettingDefinition(definition))
      .sort((left, right) => compareCodePoints(left.id, right.id))
  }
}

const emptyConfigurationHash = (): Sha256Hash => hashCanonicalJson({ schemaVersion: '1', values: {} })

export const resolveInstallationPackageSettings = (
  definitions: readonly PackageSettingDefinition[],
  explicitValues: InstallationPackageSettings | undefined,
  context: SettingValidationContext = {}
): InstallationPackageSettingsValidationResult => {
  const installationDefinitions = definitions.filter(definition => definition.scope === 'installation')
  const definitionById = new Map(installationDefinitions.map(definition => [definition.id, definition]))
  const values: Record<string, JsonValue> = {}

  if (explicitValues !== undefined) {
    try {
      assertPureJsonValue(explicitValues)
    } catch (error) {
      return {
        ok: false,
        diagnostics: [createSettingDiagnostic(
          'CFG-MIGRATE-001',
          context,
          '/values',
          { reason: error instanceof Error ? error.message : String(error) }
        )]
      }
    }

    for (const key of Object.keys(explicitValues)) {
      if (definitionById.has(key)) continue
      return {
        ok: false,
        diagnostics: [createSettingDiagnostic(
          'CFG-SCOPE-001',
          context,
          `/values/${key}`,
          { reason: 'Installation settings contain an unknown or save-scoped setting', id: key }
        )]
      }
    }
  }

  const diagnostics: ModDiagnostic[] = []
  for (const definition of installationDefinitions) {
    const hasExplicitValue = explicitValues !== undefined
      && Object.prototype.hasOwnProperty.call(explicitValues, definition.id)
    const value = hasExplicitValue
      ? explicitValues![definition.id]!
      : definition.default as JsonValue
    const compiled = compileSettingSchema(definition, context, `/values/${definition.id}`)
    if (!compiled.ok) {
      diagnostics.push(...compiled.diagnostics)
      continue
    }
    if (!compiled.validate(value)) {
      diagnostics.push(...settingSchemaErrors({ errors: compiled.errors() }, context, `/values/${definition.id}`))
      continue
    }
    values[definition.id] = cloneJsonValue(value)
  }
  if (diagnostics.length > 0) return { ok: false, diagnostics }

  const configurationHash = installationDefinitions.length === 0
    ? emptyConfigurationHash()
    : hashCanonicalJson({
        schemaVersion: '1',
        definitions: installationDefinitions.map(definition => ({
          id: definition.id,
          scope: definition.scope,
          default: definition.default,
          schema: definition.schema
        })),
        values
      })

  return {
    ok: true,
    values,
    configurationHash
  }
}
