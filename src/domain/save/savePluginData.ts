import { hashPayloadJson, utf8ByteLength, type Sha256Hash } from '@/domain/mods/hash'
import { createDiagnostic, type ModDiagnostic } from '@/domain/mods/diagnostics'
import { isPackageId, type PackageId } from '@/domain/mods/ids'

export interface PersistedPluginDataEnvelope {
  readonly schemaVersion: string
  readonly encoding: 'json'
  readonly payloadJson: string
  readonly payloadHash: Sha256Hash
}

export type PersistedPluginData = Readonly<Record<PackageId, PersistedPluginDataEnvelope>>

export const MAX_PLUGIN_PAYLOAD_BYTES = 16 * 1024 * 1024
export const MAX_PLUGIN_DATA_TOTAL_BYTES = 128 * 1024 * 1024
export const MAX_PLUGIN_DATA_GROWTH_BYTES = 8 * 1024 * 1024
export const MAX_PLUGIN_DATA_JSON_DEPTH = 64
export const MAX_PLUGIN_DATA_JSON_NODES = 1_000_000

export interface NormalizePersistedPluginDataOptions {
  readonly previous?: PersistedPluginData
  readonly enforceGrowth?: boolean
}

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
  code: 'SAVE-PLUGIN-DATA-001' | 'SAVE-PLUGIN-DATA-002',
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic(code, {
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
    [pluginDataDiagnostic('SAVE-PLUGIN-DATA-001', stage, details)]
  )
}

const throwPluginDataQuotaError = (
  message: string,
  details: Record<string, string | number | boolean | null>
): never => {
  throw new SavePluginDataError(
    message,
    [pluginDataDiagnostic('SAVE-PLUGIN-DATA-002', 'save.plugin-data.quota', details)]
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

interface JsonPayloadUsage {
  readonly bytes: number
  readonly nodes: number
  readonly depth: number
}

const inspectJsonPayload = (
  packageId: PackageId,
  payloadJson: string,
  payload: unknown
): JsonPayloadUsage => {
  const bytes = utf8ByteLength(payloadJson)
  let nodes = 0
  let depth = 0
  const pending: { value: unknown; depth: number }[] = [{ value: payload, depth: 0 }]
  while (pending.length > 0) {
    const current = pending.pop()!
    nodes += 1
    depth = Math.max(depth, current.depth)
    if (nodes > MAX_PLUGIN_DATA_JSON_NODES) {
      return throwPluginDataQuotaError(
        'Plugin data payload exceeds its node quota',
        { packageId, metric: 'jsonNodes', actual: nodes, limit: MAX_PLUGIN_DATA_JSON_NODES }
      )
    }
    if (current.depth > MAX_PLUGIN_DATA_JSON_DEPTH) {
      return throwPluginDataQuotaError(
        'Plugin data payload exceeds its JSON depth quota',
        { packageId, metric: 'jsonDepth', actual: current.depth, limit: MAX_PLUGIN_DATA_JSON_DEPTH }
      )
    }

    if (typeof current.value === 'number' && !Number.isFinite(current.value)) {
      return throwPluginDataError(
        'Plugin data payload contains a non-finite number',
        'save.plugin-data.structure',
        { packageId, field: 'payloadJson' }
      )
    }
    if (Array.isArray(current.value)) {
      for (let index = current.value.length - 1; index >= 0; index -= 1) {
        pending.push({ value: current.value[index], depth: current.depth + 1 })
      }
    } else if (isRecord(current.value)) {
      const entries = Object.values(current.value)
      for (let index = entries.length - 1; index >= 0; index -= 1) {
        pending.push({ value: entries[index], depth: current.depth + 1 })
      }
    }
  }

  return { bytes, nodes, depth }
}

const validatePayloadTextBudget = (packageId: PackageId, payloadJson: string): void => {
  const bytes = utf8ByteLength(payloadJson)
  if (bytes > MAX_PLUGIN_PAYLOAD_BYTES) {
    return throwPluginDataQuotaError(
      'Plugin data payload exceeds its size quota',
      { packageId, metric: 'payloadBytes', actual: bytes, limit: MAX_PLUGIN_PAYLOAD_BYTES }
    )
  }

  let depth = 0
  let inString = false
  let escaped = false
  for (const character of payloadJson) {
    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }

    if (character === '"') inString = true
    else if (character === '{' || character === '[') {
      depth += 1
      if (depth > MAX_PLUGIN_DATA_JSON_DEPTH) {
        return throwPluginDataQuotaError(
          'Plugin data payload exceeds its JSON depth quota',
          { packageId, metric: 'jsonDepth', actual: depth, limit: MAX_PLUGIN_DATA_JSON_DEPTH }
        )
      }
    } else if (character === '}' || character === ']') {
      depth = Math.max(0, depth - 1)
    }
  }
}

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
  validatePayloadTextBudget(packageId, value.payloadJson)

  let payload: unknown
  try {
    payload = JSON.parse(value.payloadJson) as unknown
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

  inspectJsonPayload(packageId, value.payloadJson, payload)

  return {
    schemaVersion: value.schemaVersion,
    encoding: 'json',
    payloadJson: value.payloadJson,
    payloadHash: expectedHash
  }
}

export const normalizePersistedPluginData = (
  value: unknown,
  options: NormalizePersistedPluginDataOptions = {}
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
  let totalBytes = 0
  for (const packageId of Object.keys(value)) {
    if (!isPackageId(packageId)) {
      return throwPluginDataError(
        'Plugin data package ID is invalid',
        'save.plugin-data.structure',
        { packageId }
      )
    }
    const envelope = readEnvelope(packageId, value[packageId])
    totalBytes += utf8ByteLength(envelope.payloadJson)
    entries.push([packageId, envelope])
  }
  if (totalBytes > MAX_PLUGIN_DATA_TOTAL_BYTES) {
    return throwPluginDataQuotaError(
      'Plugin data exceeds its total size quota',
      { metric: 'totalPayloadBytes', actual: totalBytes, limit: MAX_PLUGIN_DATA_TOTAL_BYTES }
    )
  }

  if (options.enforceGrowth && options.previous) {
    const previousTotalBytes = Object.values(options.previous)
      .reduce((total, envelope) => total + utf8ByteLength(envelope.payloadJson), 0)
    const growthBytes = totalBytes - previousTotalBytes
    if (growthBytes > MAX_PLUGIN_DATA_GROWTH_BYTES) {
      return throwPluginDataQuotaError(
        'Plugin data exceeds its single-write growth quota',
        { metric: 'growthBytes', actual: growthBytes, limit: MAX_PLUGIN_DATA_GROWTH_BYTES }
      )
    }
  }
  return freezePluginData(entries)
}
