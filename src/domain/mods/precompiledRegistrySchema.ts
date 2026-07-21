import { Type, type Static } from '@sinclair/typebox'
import { PACKAGE_ID_PATTERN } from './ids'
import { SerializableRegistrySnapshotSchema } from './registrySnapshotSchema'

const Sha256HashSchema = Type.String({ pattern: '^sha256:[0-9a-f]{64}$' })
const VersionSchema = Type.String({ minLength: 1 })
const PackageIdSchema = Type.String({ pattern: PACKAGE_ID_PATTERN })

export const CacheEnvironmentPackageSchema = Type.Object(
  {
    id: PackageIdSchema,
    version: VersionSchema,
    contentHash: Sha256HashSchema,
    configurationHash: Sha256HashSchema,
    loadIndex: Type.Integer({ minimum: 0 }),
    resolvedDependencies: Type.Array(PackageIdSchema, { uniqueItems: true })
  },
  { additionalProperties: false }
)

export const CacheEnvironmentIdentitySchema = Type.Object(
  {
    gameVersion: VersionSchema,
    engineApiVersion: VersionSchema,
    contentSchemaVersion: VersionSchema,
    loaderVersion: VersionSchema,
    contentCompilerVersion: VersionSchema,
    schemaSetHash: Sha256HashSchema,
    cacheFormatVersion: Type.Integer({ minimum: 1 }),
    trustPolicyVersion: VersionSchema,
    packages: Type.Array(CacheEnvironmentPackageSchema)
  },
  {
    $id: 'taoyuan.schema.CacheEnvironmentIdentityV1',
    additionalProperties: false
  }
)

export const OfficialPrecompiledRegistryArtifactSchema = Type.Object(
  {
    artifactFormatVersion: Type.Literal(1),
    environment: CacheEnvironmentIdentitySchema,
    environmentHash: Sha256HashSchema,
    snapshot: SerializableRegistrySnapshotSchema
  },
  {
    $id: 'taoyuan.schema.OfficialPrecompiledRegistryArtifactV1',
    additionalProperties: false
  }
)

export const OfficialPrecompiledRegistryMetadataSchema = Type.Object(
  {
    artifactFormatVersion: Type.Literal(1),
    artifactHash: Sha256HashSchema,
    contentHash: Sha256HashSchema,
    schemaSetHash: Sha256HashSchema,
    environmentHash: Sha256HashSchema,
    snapshotHash: Sha256HashSchema,
    registryCount: Type.Integer({ minimum: 0 }),
    entryCount: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

// This is an internal rebuild cache envelope, not part of the public content
// schema set. Adding it to PUBLIC_JSON_SCHEMAS would change schemaSetHash.
export const OfficialRegistryCacheEnvelopeSchema = Type.Object(
  {
    cacheFormatVersion: Type.Literal(2),
    identity: Type.Object(
      {
        artifactHash: Sha256HashSchema,
        contentHash: Sha256HashSchema,
        schemaSetHash: Sha256HashSchema,
        environmentHash: Sha256HashSchema,
        snapshotHash: Sha256HashSchema
      },
      { additionalProperties: false }
    ),
    payloadHash: Sha256HashSchema,
    artifact: Type.Unknown()
  },
  {
    $id: 'taoyuan.internal.OfficialRegistryCacheEnvelopeV2',
    additionalProperties: false
  }
)

export type CacheEnvironmentPackage = Static<typeof CacheEnvironmentPackageSchema>
export type CacheEnvironmentIdentity = Static<typeof CacheEnvironmentIdentitySchema>
export type OfficialPrecompiledRegistryArtifact = Static<typeof OfficialPrecompiledRegistryArtifactSchema>
export type OfficialPrecompiledRegistryMetadata = Static<typeof OfficialPrecompiledRegistryMetadataSchema>
export type OfficialRegistryCacheEnvelope = Static<typeof OfficialRegistryCacheEnvelopeSchema>
