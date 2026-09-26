import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import { createDiagnostic, type ModDiagnostic } from '@/domain/mods/diagnostics'
import {
  createEnvironmentHash,
  normalizeCacheEnvironmentIdentity
} from '@/domain/mods/environmentHash'
import {
  createOfficialCacheEnvironmentIdentityFromContentHash,
} from '@/domain/mods/officialPrecompiled'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { CacheEnvironmentIdentity, OfficialPrecompiledRegistryMetadata } from '@/domain/mods/precompiledRegistrySchema'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'

export const CURRENT_SAVE_FORMAT_VERSION = 2 as const
export const SAVE_CONTENT_ENVIRONMENT_FORMAT_VERSION = 1 as const

export type SaveContentEnvironment = CacheEnvironmentIdentity & {
  readonly formatVersion: typeof SAVE_CONTENT_ENVIRONMENT_FORMAT_VERSION
  readonly environmentHash: Sha256Hash
}

export type SaveRootMigrationStatus = 'legacy-migrated' | 'current'
export type SaveRootCompatibilityStatus = 'compatible' | 'incompatible' | 'invalid'

export class SaveContentEnvironmentError extends Error {
  readonly kind: 'format' | 'structure' | 'hash'
  readonly diagnostics: readonly ModDiagnostic[]

  constructor(
    kind: 'format' | 'structure' | 'hash',
    message: string,
    diagnostics: readonly ModDiagnostic[]
  ) {
    super(message)
    this.name = 'SaveContentEnvironmentError'
    this.kind = kind
    this.diagnostics = diagnostics
  }
}

export interface SaveRootMigrationResult {
  readonly status: SaveRootMigrationStatus
  readonly data: Record<string, any>
  readonly environment: SaveContentEnvironment
}

export interface SaveRootCompatibilityResult {
  readonly status: SaveRootCompatibilityStatus
  readonly migration?: SaveRootMigrationResult
  readonly diagnostics: readonly ModDiagnostic[]
}

type SaveRootData = Record<string, any>

const metadata = metadataJson as OfficialPrecompiledRegistryMetadata
const saveEnvironmentKeys = new Set([
  'formatVersion',
  'environmentHash',
  'gameVersion',
  'engineApiVersion',
  'contentSchemaVersion',
  'loaderVersion',
  'contentCompilerVersion',
  'schemaSetHash',
  'cacheFormatVersion',
  'trustPolicyVersion',
  'packages'
])

const isRecord = (value: unknown): value is SaveRootData =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const saveEnvironmentDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('SAVE-ENVIRONMENT-001', {
  stage,
  details,
  recovery: 'safe-mode'
})

const cloneEnvironmentIdentity = (identity: CacheEnvironmentIdentity): CacheEnvironmentIdentity => ({
  ...identity,
  packages: identity.packages.map(pkg => ({
    ...pkg,
    resolvedDependencies: [...pkg.resolvedDependencies]
  }))
})

const freezeEnvironment = (environment: SaveContentEnvironment): SaveContentEnvironment => {
  for (const pkg of environment.packages) Object.freeze(pkg.resolvedDependencies)
  Object.freeze(environment.packages)
  return Object.freeze(environment)
}

export const createSaveContentEnvironment = (
  identityValue: CacheEnvironmentIdentity
): SaveContentEnvironment => {
  const identity = normalizeCacheEnvironmentIdentity(identityValue)
  return freezeEnvironment({
    ...cloneEnvironmentIdentity(identity),
    formatVersion: SAVE_CONTENT_ENVIRONMENT_FORMAT_VERSION,
    environmentHash: createEnvironmentHash(identity)
  })
}

export const createOfficialSaveContentEnvironment = (): SaveContentEnvironment =>
  createSaveContentEnvironment(
    createOfficialCacheEnvironmentIdentityFromContentHash(metadata.contentHash as Sha256Hash)
  )

export const createSaveContentEnvironmentFromLockfileDraft = (
  draft: ThirdPartyDataPackLockfileDraft,
  selectedPackageIds: readonly PackageId[]
): SaveContentEnvironment => {
  const selected = new Set(selectedPackageIds)
  const official = createOfficialCacheEnvironmentIdentityFromContentHash(
    draft.officialIdentity.contentHash
  )
  return createSaveContentEnvironment({
    ...official,
    packages: [
      official.packages[0]!,
      ...draft.packages
        .filter(pkg => selected.has(pkg.packageId))
        .map(pkg => ({
          id: pkg.packageId,
          version: pkg.version,
          contentHash: pkg.contentHash,
          configurationHash: pkg.configurationHash,
          loadIndex: pkg.loadIndex + 1,
          resolvedDependencies: [...pkg.resolvedDependencies]
        }))
    ]
  })
}

const readSaveEnvironmentIdentity = (value: SaveRootData): CacheEnvironmentIdentity => {
  for (const key of Object.keys(value)) {
    if (!saveEnvironmentKeys.has(key)) {
      throw new SaveContentEnvironmentError(
        'structure',
        `Unknown save content environment field: ${key}`,
        [saveEnvironmentDiagnostic('save.content-environment.structure', { field: key })]
      )
    }
  }

  const { formatVersion, environmentHash, ...identityValue } = value
  if (formatVersion !== SAVE_CONTENT_ENVIRONMENT_FORMAT_VERSION) {
    throw new SaveContentEnvironmentError(
      'format',
      'Unsupported save content environment format version',
      [saveEnvironmentDiagnostic('save.content-environment.format', {
        expected: SAVE_CONTENT_ENVIRONMENT_FORMAT_VERSION,
        actual: typeof formatVersion === 'number' ? formatVersion : null
      })]
    )
  }

  let identity: CacheEnvironmentIdentity
  try {
    identity = normalizeCacheEnvironmentIdentity(identityValue)
  } catch (error) {
    if (error instanceof SaveContentEnvironmentError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new SaveContentEnvironmentError(
      'structure',
      message,
      [saveEnvironmentDiagnostic('save.content-environment.structure', { message })]
    )
  }

  const expectedHash = createEnvironmentHash(identity)
  if (environmentHash !== expectedHash) {
    throw new SaveContentEnvironmentError(
      'hash',
      'Save content environment hash does not match its identity',
      [saveEnvironmentDiagnostic('save.content-environment.hash', {
        expected: expectedHash,
        actual: typeof environmentHash === 'string' ? environmentHash : null
      })]
    )
  }

  return identity
}

export const normalizeSaveContentEnvironment = (value: unknown): SaveContentEnvironment => {
  if (!isRecord(value)) {
    throw new SaveContentEnvironmentError(
      'structure',
      'Save content environment must be an object',
      [saveEnvironmentDiagnostic('save.content-environment.structure', { reason: 'not-object' })]
    )
  }

  const identity = readSaveEnvironmentIdentity(value)
  return createSaveContentEnvironment(identity)
}

export const migrateSaveRoot = (value: unknown): SaveRootMigrationResult => {
  if (!isRecord(value)) {
    throw new SaveContentEnvironmentError(
      'structure',
      'Save root must be an object',
      [saveEnvironmentDiagnostic('save.root.structure', { reason: 'not-object' })]
    )
  }

  const version = value.saveFormatVersion
  if (version === undefined || version === 1) {
    const environment = createOfficialSaveContentEnvironment()
    return {
      status: 'legacy-migrated',
      data: {
        ...value,
        saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
        contentEnvironment: environment
      },
      environment
    }
  }

  if (version !== CURRENT_SAVE_FORMAT_VERSION) {
    throw new SaveContentEnvironmentError(
      'format',
      'Unsupported save format version',
      [saveEnvironmentDiagnostic('save.root.format', {
        expected: CURRENT_SAVE_FORMAT_VERSION,
        actual: typeof version === 'number' ? version : null
      })]
    )
  }

  if (!('contentEnvironment' in value)) {
    throw new SaveContentEnvironmentError(
      'structure',
      'Current save is missing content environment metadata',
      [saveEnvironmentDiagnostic('save.root.content-environment', { reason: 'missing' })]
    )
  }

  const environment = normalizeSaveContentEnvironment(value.contentEnvironment)
  return {
    status: 'current',
    data: {
      ...value,
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: environment
    },
    environment
  }
}

export const checkSaveRootCompatibility = (
  value: unknown,
  currentEnvironment: SaveContentEnvironment
): SaveRootCompatibilityResult => {
  let migration: SaveRootMigrationResult
  try {
    migration = migrateSaveRoot(value)
  } catch (error) {
    if (error instanceof SaveContentEnvironmentError) {
      return { status: 'invalid', diagnostics: error.diagnostics }
    }
    const message = error instanceof Error ? error.message : String(error)
    return {
      status: 'invalid',
      diagnostics: [saveEnvironmentDiagnostic('save.root.compatibility', { message })]
    }
  }

  if (migration.environment.environmentHash !== currentEnvironment.environmentHash) {
    return {
      status: 'incompatible',
      migration,
      diagnostics: [saveEnvironmentDiagnostic('save.root.compatibility', {
        reason: 'environment-mismatch',
        saved: migration.environment.environmentHash,
        current: currentEnvironment.environmentHash
      })]
    }
  }

  return { status: 'compatible', migration, diagnostics: [] }
}
