import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import {
  createExpectedOfficialEnvironmentHash,
  parseOfficialPrecompiledRegistryArtifact,
  parseOfficialPrecompiledRegistryMetadata,
  type OfficialPrecompiledArtifactError
} from './officialPrecompiled'
import {
  OfficialRegistryCacheEnvelopeSchema,
  type OfficialPrecompiledRegistryArtifact,
  type OfficialPrecompiledRegistryMetadata,
  type OfficialRegistryCacheEnvelope
} from './precompiledRegistrySchema'
import { validateUnknown } from './schemaValidation'
import { assertPureJsonValue } from './canonicalJson'
import { sha256Utf8, type Sha256Hash } from './hash'

export const OFFICIAL_REGISTRY_CACHE_FILE_NAME = 'official-registry-cache-v2.json'
export const OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION = 2 as const
export const OFFICIAL_REGISTRY_CACHE_MAX_BYTES = 16 * 1024 * 1024

export type OfficialRegistryCacheErrorKind =
  | 'invalid-json'
  | 'format-version'
  | 'structure'
  | 'identity-mismatch'
  | 'artifact'

export class OfficialRegistryCacheError extends Error {
  readonly kind: OfficialRegistryCacheErrorKind
  readonly diagnostics: readonly ModDiagnostic[]
  readonly cause?: unknown

  constructor(
    kind: OfficialRegistryCacheErrorKind,
    message: string,
    diagnostics: readonly ModDiagnostic[],
    cause?: unknown
  ) {
    super(message)
    this.name = 'OfficialRegistryCacheError'
    this.kind = kind
    this.diagnostics = diagnostics
    this.cause = cause
  }
}

export interface OfficialRegistryCacheIdentity {
  artifactHash: Sha256Hash
  contentHash: Sha256Hash
  schemaSetHash: Sha256Hash
  environmentHash: Sha256Hash
  snapshotHash: Sha256Hash
}

export interface ParsedOfficialRegistryCache {
  envelope: OfficialRegistryCacheEnvelope
  artifact: OfficialPrecompiledRegistryArtifact
  artifactHash: Sha256Hash
  validationMode: OfficialRegistryCacheValidationMode
}

export type OfficialRegistryCacheValidationMode = 'fast' | 'full'

const serializeJson = (value: unknown): string => JSON.stringify(value, null, 2) + '\n'

const cacheDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('CACHE-INVALID-001', {
  stage,
  details,
  recovery: 'retry'
})

const throwCacheError = (
  kind: OfficialRegistryCacheErrorKind,
  message: string,
  stage: string,
  details: Record<string, string | number | boolean | null> = {},
  cause?: unknown
): never => {
  throw new OfficialRegistryCacheError(
    kind,
    message,
    [cacheDiagnostic(stage, details)],
    cause
  )
}

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown
  } catch (error) {
    return throwCacheError(
      'invalid-json',
      'Official registry disk cache is not valid JSON',
      'official-registry-cache.json',
      { message: error instanceof Error ? error.message : String(error) },
      error
    )
  }
}

const expectedIdentityFromMetadata = (
  metadataValue: unknown
): { metadata: OfficialPrecompiledRegistryMetadata, identity: OfficialRegistryCacheIdentity } => {
  const metadata = parseOfficialPrecompiledRegistryMetadata(metadataValue)
  const expectedEnvironmentHash = createExpectedOfficialEnvironmentHash(metadata)
  const identity: OfficialRegistryCacheIdentity = {
    artifactHash: metadata.artifactHash as Sha256Hash,
    contentHash: metadata.contentHash as Sha256Hash,
    schemaSetHash: metadata.schemaSetHash as Sha256Hash,
    environmentHash: expectedEnvironmentHash,
    snapshotHash: metadata.snapshotHash as Sha256Hash
  }
  return { metadata, identity }
}

const assertCacheIdentity = (
  actual: OfficialRegistryCacheEnvelope['identity'],
  expected: OfficialRegistryCacheIdentity
): void => {
  const keys: Array<keyof OfficialRegistryCacheIdentity> = [
    'artifactHash',
    'contentHash',
    'schemaSetHash',
    'environmentHash',
    'snapshotHash'
  ]
  for (const key of keys) {
    if (actual[key] === expected[key]) continue
    throwCacheError(
      'identity-mismatch',
      `Official registry disk cache ${key} does not match the current product`,
      `official-registry-cache.identity.${key}`,
      { expected: expected[key], actual: actual[key] }
    )
  }
}

const parseEnvelope = (text: string): OfficialRegistryCacheEnvelope => {
  const value = parseJson(text)
  try {
    assertPureJsonValue(value)
  } catch (error) {
    return throwCacheError(
      'structure',
      'Official registry disk cache contains a non-JSON value',
      'official-registry-cache.structure',
      { message: error instanceof Error ? error.message : String(error) },
      error
    )
  }
  if (
    value
    && typeof value === 'object'
    && 'cacheFormatVersion' in value
    && (value as { cacheFormatVersion?: unknown }).cacheFormatVersion
      !== OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION
  ) {
    return throwCacheError(
      'format-version',
      'Unsupported official registry disk cache format',
      'official-registry-cache.format',
      {
        expected: OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION,
        actual: String((value as { cacheFormatVersion?: unknown }).cacheFormatVersion)
      }
    )
  }

  const result = validateUnknown(OfficialRegistryCacheEnvelopeSchema, value, {
    stage: 'official-registry-cache.structure'
  })
  if (!result.ok) {
    return throwCacheError(
      'structure',
      'Official registry disk cache structure is invalid',
      'official-registry-cache.structure',
      { fieldPath: result.diagnostics[0]?.fieldPath ?? '/' },
      result.diagnostics
    )
  }
  return result.data
}

const mapArtifactError = (error: OfficialPrecompiledArtifactError): OfficialRegistryCacheError =>
  new OfficialRegistryCacheError('artifact', error.message, error.diagnostics, error)

const parseArtifact = (
  envelope: OfficialRegistryCacheEnvelope,
  identity: OfficialRegistryCacheIdentity,
  metadata: OfficialPrecompiledRegistryMetadata,
  mode: OfficialRegistryCacheValidationMode
): OfficialPrecompiledRegistryArtifact => {
  try {
    const artifactText = serializeJson(envelope.artifact)
    const actualPayloadHash = sha256Utf8(artifactText)
    const candidate = envelope.artifact as Partial<OfficialPrecompiledRegistryArtifact>
    const packages = Array.isArray(candidate.environment?.packages)
      ? candidate.environment.packages
      : []
    const officialPackage = packages[0]
    const registries = Array.isArray(candidate.snapshot?.registries)
      ? candidate.snapshot.registries
      : []
    const entryCount = registries.reduce(
      (total, registry) => total + (
        Array.isArray(registry.entries) ? registry.entries.length : 0
      ),
      0
    )

    if (
      candidate.artifactFormatVersion !== 1
      || typeof candidate.environmentHash !== 'string'
      || typeof candidate.environment?.schemaSetHash !== 'string'
      || packages.length !== 1
      || !officialPackage
      || typeof officialPackage.contentHash !== 'string'
      || typeof candidate.snapshot?.snapshotHash !== 'string'
      || !Array.isArray(candidate.snapshot.registries)
    ) {
      return throwCacheError(
        'structure',
        'Official registry disk cache payload structure is invalid',
        'official-registry-cache.payload.structure',
        {
          hasEnvironment: Boolean(candidate.environment),
          hasSnapshot: Boolean(candidate.snapshot),
          packageCount: packages.length,
          registryCount: registries.length
        }
      )
    }
    if (
      registries.length !== metadata.registryCount
      || entryCount !== metadata.entryCount
    ) {
      return throwCacheError(
        'structure',
        'Official registry disk cache payload count does not match metadata',
        'official-registry-cache.payload.count',
        {
          expectedRegistryCount: metadata.registryCount,
          actualRegistryCount: registries.length,
          expectedEntryCount: metadata.entryCount,
          actualEntryCount: entryCount
        }
      )
    }
    if (envelope.payloadHash !== actualPayloadHash) {
      return throwCacheError(
        'identity-mismatch',
        'Official registry disk cache payload hash does not match the artifact bytes',
        'official-registry-cache.identity.payloadHash',
        { expected: envelope.payloadHash, actual: actualPayloadHash }
      )
    }
    if (actualPayloadHash !== identity.artifactHash) {
      return throwCacheError(
        'identity-mismatch',
        'Official registry disk cache artifact hash does not match the current product',
        'official-registry-cache.identity.artifactHash',
        { expected: identity.artifactHash, actual: actualPayloadHash }
      )
    }

    const artifact = mode === 'full'
      ? parseOfficialPrecompiledRegistryArtifact(
        envelope.artifact,
        identity.environmentHash
      )
      : envelope.artifact as OfficialPrecompiledRegistryArtifact
    if (
      artifact.environmentHash !== identity.environmentHash
      || officialPackage.contentHash !== identity.contentHash
      || candidate.environment?.schemaSetHash !== identity.schemaSetHash
      || candidate.snapshot?.snapshotHash !== identity.snapshotHash
    ) {
      return throwCacheError(
        'identity-mismatch',
        'Official registry disk cache artifact metadata does not match its cache identity',
        'official-registry-cache.identity',
        {
          environmentHash: artifact.environmentHash === identity.environmentHash,
          contentHash: officialPackage.contentHash === identity.contentHash,
          schemaSetHash: candidate.environment?.schemaSetHash === identity.schemaSetHash,
          snapshotHash: candidate.snapshot?.snapshotHash === identity.snapshotHash,
          registryCount: artifact.snapshot.registries.length,
          entryCount
        }
      )
    }
    return artifact
  } catch (error) {
    if (error instanceof OfficialRegistryCacheError) throw error
    if (error instanceof Error && error.name === 'OfficialPrecompiledArtifactError') {
      throw mapArtifactError(error as OfficialPrecompiledArtifactError)
    }
    throw error
  }
}

export const createOfficialRegistryCacheText = (
  artifact: OfficialPrecompiledRegistryArtifact,
  metadataValue: unknown
): string => {
  const { metadata, identity } = expectedIdentityFromMetadata(metadataValue)
  const artifactText = serializeJson(artifact)
  const payloadHash = sha256Utf8(artifactText)
  if (payloadHash !== identity.artifactHash) {
    return throwCacheError(
      'identity-mismatch',
      'Cannot write an official registry cache for a different artifact',
      'official-registry-cache.identity.artifactHash',
      { expected: identity.artifactHash, actual: payloadHash }
    )
  }
  const parsedArtifact = parseArtifact({
    cacheFormatVersion: OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION,
    identity,
    payloadHash,
    artifact
  }, identity, metadata, 'full')
  return serializeJson({
    cacheFormatVersion: OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION,
    identity,
    payloadHash,
    artifact: parsedArtifact
  })
}

export const parseOfficialRegistryCacheText = (
  text: string,
  metadataValue: unknown,
  options?: { validationMode?: OfficialRegistryCacheValidationMode }
): ParsedOfficialRegistryCache => {
  const validationMode = options?.validationMode ?? 'fast'
  const { metadata, identity } = expectedIdentityFromMetadata(metadataValue)
  const envelope = parseEnvelope(text)
  if (envelope.cacheFormatVersion !== OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION) {
    return throwCacheError(
      'format-version',
      'Unsupported official registry disk cache format',
      'official-registry-cache.format',
      { expected: OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION, actual: envelope.cacheFormatVersion }
    )
  }
  assertCacheIdentity(envelope.identity, identity)
  const artifact = parseArtifact(envelope, identity, metadata, validationMode)
  return {
    envelope,
    artifact,
    artifactHash: identity.artifactHash,
    validationMode
  }
}

export const getOfficialRegistryCacheArtifact = (
  text: string,
  metadataValue: unknown
): OfficialPrecompiledRegistryArtifact => parseOfficialRegistryCacheText(text, metadataValue).artifact

export const getOfficialRegistryCacheIdentity = (
  metadataValue: unknown
): OfficialRegistryCacheIdentity => expectedIdentityFromMetadata(metadataValue).identity

export const serializeOfficialPrecompiledArtifact = serializeJson
