import packageMetadata from '../../../package.json'
import { assertPureJsonValue, canonicalizeJson, compareCodePoints } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { createEnvironmentHash } from './environmentHash'
import {
  createCanonicalFileManifestHash,
  hashCanonicalJson,
  sha256Utf8,
  utf8ByteLength,
  type Sha256Hash
} from './hash'
import { requirePackageId } from './ids'
import {
  OfficialPrecompiledRegistryArtifactSchema,
  OfficialPrecompiledRegistryMetadataSchema,
  type CacheEnvironmentIdentity,
  type OfficialPrecompiledRegistryArtifact,
  type OfficialPrecompiledRegistryMetadata
} from './precompiledRegistrySchema'
import { createPublicJsonSchema } from './publicSchemas'
import {
  RegistrySnapshotError,
  createSerializableRegistrySnapshot,
  restoreRegistrySetFromSnapshot,
  type RegistryDefinition,
  type RegistryEntry,
  type RegistrySet,
  type SerializableRegistrySnapshot
} from './registry'
import { PUBLIC_JSON_SCHEMAS } from './schemas'
import { validateUnknown } from './schemaValidation'

export const OFFICIAL_PRECOMPILED_ARTIFACT_FORMAT_VERSION = 1 as const
export const OFFICIAL_CACHE_FORMAT_VERSION = 1 as const
export const OFFICIAL_ENGINE_API_VERSION = '1'
export const OFFICIAL_CONTENT_SCHEMA_VERSION = '1'
export const OFFICIAL_LOADER_VERSION = '1'
export const OFFICIAL_CONTENT_COMPILER_VERSION = '1'
export const OFFICIAL_TRUST_POLICY_VERSION = 'builtin-official-1'
export const OFFICIAL_PACKAGE_ID = requirePackageId('taoyuan-core')

const EMPTY_CONFIGURATION_HASH = hashCanonicalJson({ schemaVersion: '1', values: {} })

export type OfficialPrecompiledArtifactErrorKind =
  | 'invalid-json'
  | 'format-version'
  | 'structure'
  | 'environment-hash'
  | 'environment-mismatch'
  | 'snapshot'

export class OfficialPrecompiledArtifactError extends Error {
  readonly kind: OfficialPrecompiledArtifactErrorKind
  readonly diagnostics: readonly ModDiagnostic[]
  readonly cause?: unknown

  constructor(
    kind: OfficialPrecompiledArtifactErrorKind,
    message: string,
    diagnostics: readonly ModDiagnostic[],
    cause?: unknown
  ) {
    super(message)
    this.name = 'OfficialPrecompiledArtifactError'
    this.kind = kind
    this.diagnostics = diagnostics
    this.cause = cause
  }
}

const artifactDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('CACHE-INVALID-001', {
  stage,
  details,
  recovery: 'retry'
})

const throwArtifactError = (
  kind: OfficialPrecompiledArtifactErrorKind,
  message: string,
  stage: string,
  details: Record<string, string | number | boolean | null> = {},
  cause?: unknown
): never => {
  throw new OfficialPrecompiledArtifactError(
    kind,
    message,
    [artifactDiagnostic(stage, details)],
    cause
  )
}

export const createOfficialSchemaSetHash = (): Sha256Hash => hashCanonicalJson(
  Object.entries(PUBLIC_JSON_SCHEMAS)
    .sort(([left], [right]) => compareCodePoints(left, right))
    .map(([fileName, schema]) => ({ fileName, schema: createPublicJsonSchema(schema) }))
)

export const createOfficialContentHash = (
  snapshot: SerializableRegistrySnapshot
): Sha256Hash => createCanonicalFileManifestHash(
  snapshot.registries.map((registry, index) => {
    const payload = canonicalizeJson(registry)
    const registryPath = registry.registryId.replace(':', '/')
    return {
      path: `registries/${String(index).padStart(3, '0')}-${registryPath}.json`,
      size: utf8ByteLength(payload),
      sha256: sha256Utf8(payload)
    }
  })
)

export const createOfficialCacheEnvironmentIdentityFromContentHash = (
  contentHash: Sha256Hash
): CacheEnvironmentIdentity => ({
  gameVersion: packageMetadata.version,
  engineApiVersion: OFFICIAL_ENGINE_API_VERSION,
  contentSchemaVersion: OFFICIAL_CONTENT_SCHEMA_VERSION,
  loaderVersion: OFFICIAL_LOADER_VERSION,
  contentCompilerVersion: OFFICIAL_CONTENT_COMPILER_VERSION,
  schemaSetHash: createOfficialSchemaSetHash(),
  cacheFormatVersion: OFFICIAL_CACHE_FORMAT_VERSION,
  trustPolicyVersion: OFFICIAL_TRUST_POLICY_VERSION,
  packages: [{
    id: OFFICIAL_PACKAGE_ID,
    version: packageMetadata.version,
    contentHash,
    configurationHash: EMPTY_CONFIGURATION_HASH,
    loadIndex: 0,
    resolvedDependencies: []
  }]
})

export const createOfficialPrecompiledRegistryArtifact = (
  registrySet: RegistrySet
): OfficialPrecompiledRegistryArtifact => {
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  const environment = createOfficialCacheEnvironmentIdentityFromContentHash(
    createOfficialContentHash(snapshot)
  )
  return parseOfficialPrecompiledRegistryArtifact({
    artifactFormatVersion: OFFICIAL_PRECOMPILED_ARTIFACT_FORMAT_VERSION,
    environment,
    environmentHash: createEnvironmentHash(environment),
    snapshot
  })
}

const assertArtifactIsPureJson = (value: unknown): void => {
  try {
    assertPureJsonValue(value)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new OfficialPrecompiledArtifactError(
      'structure',
      message,
      [createDiagnostic('SCHEMA-VALIDATE-001', {
        stage: 'official-precompiled.structure',
        details: { message }
      })],
      error
    )
  }
}

export const parseOfficialPrecompiledRegistryArtifact = (
  value: unknown,
  expectedEnvironmentHash?: Sha256Hash
): OfficialPrecompiledRegistryArtifact => {
  assertArtifactIsPureJson(value)
  if (
    value
    && typeof value === 'object'
    && 'artifactFormatVersion' in value
    && (value as { artifactFormatVersion?: unknown }).artifactFormatVersion !== 1
  ) {
    throwArtifactError(
      'format-version',
      `Unsupported official precompiled artifact format: ${String((value as { artifactFormatVersion?: unknown }).artifactFormatVersion)}`,
      'official-precompiled.format',
      { expected: 1, actual: String((value as { artifactFormatVersion?: unknown }).artifactFormatVersion) }
    )
  }
  if (
    value
    && typeof value === 'object'
    && 'snapshot' in value
    && (value as { snapshot?: unknown }).snapshot
    && typeof (value as { snapshot: unknown }).snapshot === 'object'
    && 'formatVersion' in ((value as { snapshot: object }).snapshot)
    && ((value as { snapshot: { formatVersion?: unknown } }).snapshot).formatVersion !== 2
  ) {
    throwArtifactError(
      'format-version',
      'Unsupported registry snapshot format in official precompiled artifact',
      'official-precompiled.snapshot-format',
      { expected: 2, actual: String((value as { snapshot: { formatVersion?: unknown } }).snapshot.formatVersion) }
    )
  }

  const result = validateUnknown(OfficialPrecompiledRegistryArtifactSchema, value, {
    stage: 'official-precompiled.structure'
  })
  if (!result.ok) {
    throw new OfficialPrecompiledArtifactError(
      'structure',
      `Official precompiled artifact structure invalid at ${result.diagnostics[0]?.fieldPath ?? '/'}`,
      result.diagnostics
    )
  }

  const artifact = result.data
  const packages = artifact.environment.packages
  const officialPackage = packages[0]
  if (
    !officialPackage
    || packages.length !== 1
    || officialPackage.id !== OFFICIAL_PACKAGE_ID
    || officialPackage.loadIndex !== 0
    || officialPackage.resolvedDependencies.length !== 0
  ) {
    return throwArtifactError(
      'environment-hash',
      'Official precompiled artifact has an invalid package set',
      'official-precompiled.package-set',
      { packageCount: packages.length }
    )
  }

  const actualContentHash = createOfficialContentHash(artifact.snapshot)
  if (officialPackage.contentHash !== actualContentHash) {
    throwArtifactError(
      'environment-hash',
      'Official precompiled artifact content hash mismatch',
      'official-precompiled.content-hash',
      { expected: actualContentHash, actual: officialPackage.contentHash }
    )
  }

  const actualEnvironmentHash = createEnvironmentHash(artifact.environment)
  if (artifact.environmentHash !== actualEnvironmentHash) {
    throwArtifactError(
      'environment-hash',
      'Official precompiled artifact environment hash mismatch',
      'official-precompiled.environment-hash',
      { expected: actualEnvironmentHash, actual: artifact.environmentHash }
    )
  }
  if (expectedEnvironmentHash && artifact.environmentHash !== expectedEnvironmentHash) {
    throwArtifactError(
      'environment-mismatch',
      'Official precompiled artifact does not match the current environment',
      'official-precompiled.environment',
      { expected: expectedEnvironmentHash, actual: artifact.environmentHash }
    )
  }
  return artifact
}

export const parseOfficialPrecompiledRegistryArtifactText = (
  text: string,
  expectedEnvironmentHash?: Sha256Hash
): OfficialPrecompiledRegistryArtifact => {
  let value: unknown
  try {
    value = JSON.parse(text) as unknown
  } catch (error) {
    throwArtifactError(
      'invalid-json',
      'Official precompiled artifact is not valid JSON',
      'official-precompiled.json',
      { message: error instanceof Error ? error.message : String(error) },
      error
    )
  }
  return parseOfficialPrecompiledRegistryArtifact(value, expectedEnvironmentHash)
}

export const restoreOfficialPrecompiledRegistryArtifact = (
  definitions: readonly RegistryDefinition<RegistryEntry>[],
  value: unknown,
  expectedEnvironmentHash?: Sha256Hash
): RegistrySet => {
  const artifact = parseOfficialPrecompiledRegistryArtifact(value, expectedEnvironmentHash)
  try {
    return restoreRegistrySetFromSnapshot(definitions, artifact.snapshot as unknown)
  } catch (error) {
    if (error instanceof OfficialPrecompiledArtifactError) throw error
    if (error instanceof RegistrySnapshotError) {
      throw new OfficialPrecompiledArtifactError(
        'snapshot',
        error.message,
        error.diagnostics,
        error
      )
    }
    return throwArtifactError(
      'snapshot',
      'Official precompiled artifact could not restore registry state',
      'official-precompiled.restore',
      { message: error instanceof Error ? error.message : String(error) },
      error
    )
  }
}

export const restoreOfficialPrecompiledRegistryArtifactText = (
  definitions: readonly RegistryDefinition<RegistryEntry>[],
  text: string,
  expectedEnvironmentHash?: Sha256Hash
): RegistrySet => restoreOfficialPrecompiledRegistryArtifact(
  definitions,
  parseOfficialPrecompiledRegistryArtifactText(text, expectedEnvironmentHash),
  expectedEnvironmentHash
)

export const parseOfficialPrecompiledRegistryMetadata = (
  value: unknown
): OfficialPrecompiledRegistryMetadata => {
  assertArtifactIsPureJson(value)
  const result = validateUnknown(OfficialPrecompiledRegistryMetadataSchema, value, {
    stage: 'official-precompiled.metadata'
  })
  if (!result.ok) {
    throw new OfficialPrecompiledArtifactError(
      'structure',
      `Official precompiled metadata invalid at ${result.diagnostics[0]?.fieldPath ?? '/'}`,
      result.diagnostics
    )
  }
  return result.data
}

export const createExpectedOfficialEnvironmentHash = (
  metadataValue: unknown
): Sha256Hash => {
  const metadata = parseOfficialPrecompiledRegistryMetadata(metadataValue)
  const identity = createOfficialCacheEnvironmentIdentityFromContentHash(
    metadata.contentHash as Sha256Hash
  )
  const expectedHash = createEnvironmentHash(identity)
  if (metadata.schemaSetHash !== identity.schemaSetHash || metadata.environmentHash !== expectedHash) {
    throwArtifactError(
      'environment-mismatch',
      'Official precompiled metadata is stale for the current environment',
      'official-precompiled.metadata-environment',
      { expected: expectedHash, actual: metadata.environmentHash }
    )
  }
  return expectedHash
}
