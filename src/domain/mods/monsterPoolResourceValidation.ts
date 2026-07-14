import { Type } from '@sinclair/typebox'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { parseContentId } from './ids'
import { MONSTER_POOL_RESOURCE_LIMITS } from './resourceLimits'
import {
  validateUnknown,
  type SchemaValidationContext,
  type SchemaValidationResult
} from './schemaValidation'
import { MonsterPoolDefSchema, type MonsterPoolDef } from './schemas'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null

const createLimitDiagnostic = (
  context: SchemaValidationContext,
  poolId: unknown,
  fieldPath: string,
  actual: number,
  limit: number
): ModDiagnostic => createDiagnostic('PKG-LIMIT-001', {
  stage: context.stage,
  packageId: context.packageId,
  file: context.file,
  contentId: parseContentId(poolId) ?? undefined,
  fieldPath,
  details: {
    poolId: typeof poolId === 'string' ? poolId : '(unknown)',
    actual,
    limit
  }
})

const collectPoolLimitDiagnostics = (
  pool: unknown,
  poolPath: string,
  context: SchemaValidationContext
): ModDiagnostic[] => {
  const record = asRecord(pool)
  if (!record || !Array.isArray(record.entries)) return []

  const entries = record.entries
  if (entries.length > MONSTER_POOL_RESOURCE_LIMITS.maxEntries) {
    return [createLimitDiagnostic(
      context,
      record.id,
      `${poolPath}/entries`,
      entries.length,
      MONSTER_POOL_RESOURCE_LIMITS.maxEntries
    )]
  }

  const diagnostics: ModDiagnostic[] = []
  let effectiveWeight = 0
  let hasOversizedEntry = false

  entries.forEach((entry, index) => {
    const entryRecord = asRecord(entry)
    const weight = entryRecord?.weight ?? 1
    if (typeof weight !== 'number' || !Number.isInteger(weight) || weight < 1) return

    if (weight > MONSTER_POOL_RESOURCE_LIMITS.maxEntryWeight) {
      hasOversizedEntry = true
      diagnostics.push(createLimitDiagnostic(
        context,
        record.id,
        `${poolPath}/entries/${index}/weight`,
        weight,
        MONSTER_POOL_RESOURCE_LIMITS.maxEntryWeight
      ))
      return
    }
    effectiveWeight += weight
  })

  if (!hasOversizedEntry && effectiveWeight > MONSTER_POOL_RESOURCE_LIMITS.maxEffectiveWeight) {
    diagnostics.push(createLimitDiagnostic(
      context,
      record.id,
      `${poolPath}/entries`,
      effectiveWeight,
      MONSTER_POOL_RESOURCE_LIMITS.maxEffectiveWeight
    ))
  }

  return diagnostics
}

export const getMonsterPoolDefResourceLimitDiagnostics = (
  pool: unknown,
  context: SchemaValidationContext
): ModDiagnostic[] => collectPoolLimitDiagnostics(pool, '', context)

export const getMonsterPoolsResourceLimitDiagnostics = (
  value: unknown,
  context: SchemaValidationContext
): ModDiagnostic[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((pool, index) => collectPoolLimitDiagnostics(pool, `/${index}`, context))
}

export const validateMonsterPoolsUnknown = (
  value: unknown,
  context: SchemaValidationContext
): SchemaValidationResult<MonsterPoolDef[]> => {
  const diagnostics = getMonsterPoolsResourceLimitDiagnostics(value, context)
  if (diagnostics.length > 0) return { ok: false, diagnostics }
  return validateUnknown(Type.Array(MonsterPoolDefSchema), value, context)
}
