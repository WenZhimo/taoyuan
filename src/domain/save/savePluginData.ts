import { hashPayloadJson, type Sha256Hash } from '@/domain/mods/hash'
import { createDiagnostic, type ModDiagnostic } from '@/domain/mods/diagnostics'
import { isPackageId, type PackageId } from '@/domain/mods/ids'

export interface PersistedPluginDataEnvelope {
  readonly schemaVersion: string
  readonly encoding: 'json'
  readonly payloadJson: string
  readonly payloadHash: Sha256Hash
}

export type PersistedPluginData = Readonly<Record<PackageId, PersistedPluginDataEnvelope>>

export class SavePluginDataError extends Error {
  readonly diagnostics: readonly ModDiagnostic[]

  constructor(message: string, diagnostics: readonly ModDiagnostic[]) {
    super(message)
    this.name = 'SavePluginDataError'
    this.diagnostics = diagnostics
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const pluginDataDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('SAVE-PLUGIN-DATA-001', {
  stage,
  details,
  recovery: 'safe-mode'
})

const throwPluginDataError = (
  message: string,
  stage: string,
  details: Record<string, string | number | boolean | null>
): never => {
  throw new SavePluginDataError(
    message,
    [pluginDataDiagnostic(stage, details)]
  )
}

const cloneEnvelope = (
  value: PersistedPluginDataEnvelope
): PersistedPluginDataEnvelope => Object.freeze({
  schemaVersion: value.schemaVersion,
  encoding: value.encoding,
  payloadJson: value.payloadJson,
  payloadHash: value.payloadHash
})

const freezePluginData = (
  entries: readonly (readonly [PackageId, PersistedPluginDataEnvelope])[]
): PersistedPluginData => {
  const result: Record<string, PersistedPluginDataEnvelope> = {}
  for (const [packageId, envelope] of entries) {
    Object.defineProperty(result, packageId, {
      configurable: false,
      enumerable: true,
      value: cloneEnvelope(envelope),
      writable: false
    })
  }
  return Object.freeze(result) as PersistedPluginData
}

export const createEmptyPersistedPluginData = (): PersistedPluginData =>
  Object.freeze({}) as PersistedPluginData

const readEnvelope = (
  packageId: PackageId,
  value: unknown
): PersistedPluginDataEnvelope => {
  if (!isRecord(value)) {
    return throwPluginDataError(
      'Plugin data envelope must be an object',
      'save.plugin-data.structure',
      { packageId, reason: 'envelope-not-object' }
    )
  }

  const allowedKeys = new Set(['schemaVersion', 'encoding', 'payloadJson', 'payloadHash'])
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      return throwPluginDataError(
        'Unknown plugin data envelope field',
        'save.plugin-data.structure',
        { packageId, field: key }
      )
    }
  }

  if (typeof value.schemaVersion !== 'string' || value.schemaVersion.length === 0) {
    return throwPluginDataError(
      'Plugin data schema version must be a non-empty string',
      'save.plugin-data.structure',
      { packageId, field: 'schemaVersion' }
    )
  }
  if (value.encoding !== 'json') {
    return throwPluginDataError(
      'Plugin data envelope encoding is unsupported',
      'save.plugin-data.structure',
      { packageId, field: 'encoding' }
    )
  }
  if (typeof value.payloadJson !== 'string') {
    return throwPluginDataError(
      'Plugin data payload must be a JSON string',
      'save.plugin-data.structure',
      { packageId, field: 'payloadJson' }
    )
  }

  try {
    JSON.parse(value.payloadJson)
  } catch {
    return throwPluginDataError(
      'Plugin data payload is not valid JSON',
      'save.plugin-data.structure',
      { packageId, field: 'payloadJson' }
    )
  }

  if (typeof value.payloadHash !== 'string') {
    return throwPluginDataError(
      'Plugin data payload hash is missing',
      'save.plugin-data.hash',
      { packageId, field: 'payloadHash' }
    )
  }

  const expectedHash = hashPayloadJson(value.payloadJson)
  if (value.payloadHash !== expectedHash) {
    return throwPluginDataError(
      'Plugin data payload hash does not match its JSON string',
      'save.plugin-data.hash',
      { packageId, expected: expectedHash, actual: value.payloadHash }
    )
  }

  return {
    schemaVersion: value.schemaVersion,
    encoding: 'json',
    payloadJson: value.payloadJson,
    payloadHash: expectedHash
  }
}

export const normalizePersistedPluginData = (
  value: unknown
): PersistedPluginData => {
  if (value === undefined) return createEmptyPersistedPluginData()
  if (!isRecord(value)) {
    return throwPluginDataError(
      'Plugin data must be an object',
      'save.plugin-data.structure',
      { reason: 'not-object' }
    )
  }

  const entries: [PackageId, PersistedPluginDataEnvelope][] = []
  for (const packageId of Object.keys(value)) {
    if (!isPackageId(packageId)) {
      return throwPluginDataError(
        'Plugin data package ID is invalid',
        'save.plugin-data.structure',
        { packageId }
      )
    }
    entries.push([packageId, readEnvelope(packageId, value[packageId])])
  }
  return freezePluginData(entries)
}
