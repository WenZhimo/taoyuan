import { assertPureJsonValue, type JsonValue } from '@/domain/mods/canonicalJson'
import { createDiagnostic, type ModDiagnostic } from '@/domain/mods/diagnostics'
import { isNamespacedId, isPackageId, type NamespacedId, type PackageId } from '@/domain/mods/ids'

export interface PersistedPackageSettingsEntry {
  readonly schemaVersion: string
  readonly values: Readonly<Record<NamespacedId, JsonValue>>
}

export type PersistedPackageSettings = Readonly<Record<PackageId, PersistedPackageSettingsEntry>>

export class SavePackageSettingsError extends Error {
  readonly diagnostics: readonly ModDiagnostic[]

  constructor(message: string, diagnostics: readonly ModDiagnostic[]) {
    super(message)
    this.name = 'SavePackageSettingsError'
    this.diagnostics = diagnostics
  }
}

export const createMissingPackageSettingsError = (): SavePackageSettingsError =>
  new SavePackageSettingsError(
    'Current save is missing package settings',
    [packageSettingsDiagnostic({ reason: 'missing' })]
  )

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const packageSettingsDiagnostic = (
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('SAVE-PACKAGE-SETTINGS-001', {
  stage: 'save.package-settings.structure',
  details,
  recovery: 'safe-mode'
})

const throwPackageSettingsError = (
  message: string,
  details: Record<string, string | number | boolean | null>
): never => {
  throw new SavePackageSettingsError(message, [packageSettingsDiagnostic(details)])
}

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return Object.freeze(value.map(item => cloneJsonValue(item))) as JsonValue
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    for (const [key, entry] of Object.entries(value)) result[key] = cloneJsonValue(entry)
    return Object.freeze(result) as JsonValue
  }
  return value
}

const cloneEntry = (entry: PersistedPackageSettingsEntry): PersistedPackageSettingsEntry => {
  const values: Record<string, JsonValue> = {}
  for (const [settingId, value] of Object.entries(entry.values)) {
    values[settingId] = cloneJsonValue(value)
  }
  return Object.freeze({
    schemaVersion: entry.schemaVersion,
    values: Object.freeze(values) as Readonly<Record<NamespacedId, JsonValue>>
  })
}

const freezeSettings = (
  entries: readonly (readonly [PackageId, PersistedPackageSettingsEntry])[]
): PersistedPackageSettings => {
  const result: Record<string, PersistedPackageSettingsEntry> = {}
  for (const [packageId, entry] of entries) {
    Object.defineProperty(result, packageId, {
      configurable: false,
      enumerable: true,
      value: cloneEntry(entry),
      writable: false
    })
  }
  return Object.freeze(result) as PersistedPackageSettings
}

export const createEmptyPersistedPackageSettings = (): PersistedPackageSettings =>
  Object.freeze({}) as PersistedPackageSettings

const readEntry = (
  packageId: PackageId,
  value: unknown
): PersistedPackageSettingsEntry => {
  if (!isRecord(value)) {
    return throwPackageSettingsError(
      'Package settings entry must be an object',
      { packageId, reason: 'entry-not-object' }
    )
  }

  const allowedKeys = new Set(['schemaVersion', 'values'])
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      return throwPackageSettingsError(
        'Unknown package settings field',
        { packageId, field: key }
      )
    }
  }

  if (typeof value.schemaVersion !== 'string' || value.schemaVersion.length === 0) {
    return throwPackageSettingsError(
      'Package settings schema version must be a non-empty string',
      { packageId, field: 'schemaVersion' }
    )
  }
  if (!isRecord(value.values)) {
    return throwPackageSettingsError(
      'Package settings values must be an object',
      { packageId, field: 'values' }
    )
  }

  const values: Record<string, JsonValue> = {}
  for (const [settingId, settingValue] of Object.entries(value.values)) {
    if (!isNamespacedId(settingId)) {
      return throwPackageSettingsError(
        'Package setting ID must be namespaced',
        { packageId, field: settingId }
      )
    }
    try {
      assertPureJsonValue(settingValue)
    } catch (error) {
      return throwPackageSettingsError(
        error instanceof Error ? error.message : 'Package setting value is not valid JSON',
        { packageId, field: settingId }
      )
    }
    values[settingId] = cloneJsonValue(settingValue as JsonValue)
  }

  return { schemaVersion: value.schemaVersion, values }
}

export const normalizePersistedPackageSettings = (
  value: unknown
): PersistedPackageSettings => {
  if (value === undefined) return createEmptyPersistedPackageSettings()
  if (!isRecord(value)) {
    return throwPackageSettingsError(
      'Package settings must be an object',
      { reason: 'not-object' }
    )
  }

  const entries: [PackageId, PersistedPackageSettingsEntry][] = []
  for (const [packageIdValue, entryValue] of Object.entries(value)) {
    if (!isPackageId(packageIdValue)) {
      return throwPackageSettingsError(
        'Package settings key must be a valid PackageId',
        { packageId: packageIdValue, reason: 'invalid-package-id' }
      )
    }
    entries.push([packageIdValue, readEntry(packageIdValue, entryValue)])
  }
  return freezeSettings(entries)
}
