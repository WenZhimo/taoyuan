import type { TSchema } from '@sinclair/typebox'

export const PUBLIC_SCHEMA_COMMENT = 'Generated from src/domain/mods/schemas.ts. Do not edit by hand.'

export const cloneSchemaWithoutNestedIds = <Schema extends TSchema>(schema: Schema): Schema => {
  const cloned = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>
  const referencedIds = new Set<string>()
  const collectReferences = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    if (typeof record.$ref === 'string') referencedIds.add(record.$ref)
    for (const value of Object.values(record)) collectReferences(value)
  }
  collectReferences(cloned)

  const visit = (node: unknown, isRoot: boolean): void => {
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    if (!isRoot && typeof record.$id === 'string' && !referencedIds.has(record.$id)) delete record.$id
    for (const value of Object.values(record)) visit(value, false)
  }
  visit(cloned, true)
  return cloned as unknown as Schema
}

export const createPublicJsonSchema = (schema: TSchema): Record<string, unknown> => ({
  ...cloneSchemaWithoutNestedIds(schema),
  $comment: PUBLIC_SCHEMA_COMMENT
})
