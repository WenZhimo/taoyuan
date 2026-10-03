import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import { createDiagnostic, type ModDiagnostic } from '@/domain/mods/diagnostics'
import { assertPureJsonValue } from '@/domain/mods/canonicalJson'
import {
  createEnvironmentHash,
  normalizeCacheEnvironmentIdentity
} from '@/domain/mods/environmentHash'
import {
  createOfficialCacheEnvironmentIdentityFromContentHash,
  OFFICIAL_PACKAGE_ID
} from '@/domain/mods/officialPrecompiled'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { CacheEnvironmentIdentity, OfficialPrecompiledRegistryMetadata } from '@/domain/mods/precompiledRegistrySchema'
import { isPackageId, type PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  normalizePersistedPluginData,
  SavePluginDataError,
  type PluginSaveDataOwner,
  type PersistedPluginData
} from './savePluginData'
import {
  createMissingPackageSettingsError,
  normalizePersistedPackageSettings,
  SavePackageSettingsError,
  type PersistedPackageSettings
} from './savePackageSettings'

export const CURRENT_SAVE_FORMAT_VERSION = 3 as const
export const SAVE_CONTENT_ENVIRONMENT_FORMAT_VERSION = 1 as const

export type SaveContentEnvironment = CacheEnvironmentIdentity & {
  readonly formatVersion: typeof SAVE_CONTENT_ENVIRONMENT_FORMAT_VERSION
  readonly environmentHash: Sha256Hash
}

export interface SaveContentEnvironmentPackageSummary {
  readonly packageId: PackageId
  readonly version: string
}

export interface SaveContentEnvironmentSummary {
  readonly environmentHash: Sha256Hash
  readonly packages: readonly SaveContentEnvironmentPackageSummary[]
}

export type SaveRootMigrationStatus = 'legacy-migrated' | 'current' | 'third-party-copy-migrated'
export type SaveRootCompatibilityStatus =
  | 'compatible'
  | 'migratable'
  | 'copy-migratable'
  | 'incompatible'
  | 'invalid'
export type SaveRootMigrationWriteMode = 'in-place' | 'copy-only'

export class SaveContentEnvironmentError extends Error {
  readonly kind: 'format' | 'structure' | 'hash' | 'migration'
  readonly diagnostics: readonly ModDiagnostic[]

  constructor(
    kind: 'format' | 'structure' | 'hash' | 'migration',
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
  readonly writeMode: SaveRootMigrationWriteMode
  readonly data: Record<string, any>
  readonly environment: SaveContentEnvironment
  readonly pluginData: PersistedPluginData
  readonly packageSettings: PersistedPackageSettings
}

export interface SaveRootCompatibilityResult {
  readonly status: SaveRootCompatibilityStatus
  readonly migration?: SaveRootMigrationResult
  readonly diagnostics: readonly ModDiagnostic[]
}

export interface SaveRootMigrationOptions {
  readonly pluginDataOwners?: readonly PluginSaveDataOwner[]
  readonly packageMigrations?: readonly SavePackageMigrationStep[]
}

export interface SavePackageMigrationStep {
  readonly packageId: PackageId
  readonly fromVersion: string
  readonly toVersion: string
  readonly migrate: (data: Record<string, any>) => Record<string, any>
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

const REQUIRED_VERSIONED_SAVE_ROOT_FIELDS = ['game', 'player', 'inventory', 'farm'] as const

const saveEnvironmentDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('SAVE-ENVIRONMENT-001', {
  stage,
  details,
  recovery: 'safe-mode'
})

const saveRootStructureDiagnostic = (
  field: string,
  reason: 'missing' | 'not-object'
): ModDiagnostic => createDiagnostic('SAVE-ROOT-001', {
  stage: 'save.root.structure',
  fieldPath: field,
  details: { field, reason },
  recovery: 'restore-backup'
})

const validateVersionedSaveRoot = (value: SaveRootData, version: unknown): void => {
  if (version !== 1 && version !== 2 && version !== CURRENT_SAVE_FORMAT_VERSION) return

  for (const field of REQUIRED_VERSIONED_SAVE_ROOT_FIELDS) {
    if (!(field in value)) {
      throw new SaveContentEnvironmentError(
        'structure',
        `Save root is missing required section: ${field}`,
        [saveRootStructureDiagnostic(field, 'missing')]
      )
    }
    if (!isRecord(value[field])) {
      throw new SaveContentEnvironmentError(
        'structure',
        `Save root section must be an object: ${field}`,
        [saveRootStructureDiagnostic(field, 'not-object')]
      )
    }
  }
}

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

const parseSemVer = (value: string): readonly [number, number, number] | null => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(value)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

const compareSemVer = (
  left: readonly [number, number, number],
  right: readonly [number, number, number]
): number =>
  left[0] - right[0] || left[1] - right[1] || left[2] - right[2]

const sameStringList = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const samePackageIdentity = (
  left: SaveContentEnvironment['packages'][number],
  right: SaveContentEnvironment['packages'][number]
): boolean =>
  left.id === right.id &&
  left.version === right.version &&
  left.contentHash === right.contentHash &&
  left.configurationHash === right.configurationHash &&
  left.loadIndex === right.loadIndex &&
  sameStringList(left.resolvedDependencies, right.resolvedDependencies)

const sameRuntimeIdentity = (
  left: SaveContentEnvironment,
  right: SaveContentEnvironment
): boolean =>
  left.gameVersion === right.gameVersion &&
  left.engineApiVersion === right.engineApiVersion &&
  left.contentSchemaVersion === right.contentSchemaVersion &&
  left.loaderVersion === right.loaderVersion &&
  left.contentCompilerVersion === right.contentCompilerVersion &&
  left.schemaSetHash === right.schemaSetHash &&
  left.cacheFormatVersion === right.cacheFormatVersion &&
  left.trustPolicyVersion === right.trustPolicyVersion

export const isOfficialOnlySaveContentEnvironment = (
  environment: SaveContentEnvironment
): boolean =>
  environment.packages.length === 1 && environment.packages[0]?.id === OFFICIAL_PACKAGE_ID

export const canLoadSaveContentEnvironmentInOfficialSafeMode = (
  saved: SaveContentEnvironment,
  current: SaveContentEnvironment
): boolean => {
  if (!isOfficialOnlySaveContentEnvironment(current)) return false
  if (!saved.packages.some(pkg => pkg.id !== OFFICIAL_PACKAGE_ID)) return false

  const savedOfficialPackage = saved.packages.find(pkg => pkg.id === OFFICIAL_PACKAGE_ID)
  const currentOfficialPackage = current.packages.find(pkg => pkg.id === OFFICIAL_PACKAGE_ID)
  return savedOfficialPackage !== undefined
    && currentOfficialPackage !== undefined
    && sameRuntimeIdentity(saved, current)
    && samePackageIdentity(savedOfficialPackage, currentOfficialPackage)
}

const migrationDiagnostic = (
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => saveEnvironmentDiagnostic('save.root.migration', details)

const throwMigrationError = (
  message: string,
  details: Record<string, string | number | boolean | null>
): never => {
  throw new SaveContentEnvironmentError('migration', message, [migrationDiagnostic(details)])
}

export const validateSavePackageMigrationStep = (
  step: SavePackageMigrationStep
): void => {
  if (
    !step ||
    !isPackageId(step.packageId) ||
    step.packageId === OFFICIAL_PACKAGE_ID ||
    typeof step.fromVersion !== 'string' ||
    step.fromVersion.length === 0 ||
    typeof step.toVersion !== 'string' ||
    step.toVersion.length === 0 ||
    step.fromVersion === step.toVersion ||
    typeof step.migrate !== 'function'
  ) {
    return throwMigrationError(
      'Save package migration descriptor is invalid',
      { packageId: String(step?.packageId ?? ''), reason: 'invalid-migration-descriptor' }
    )
  }

  const fromVersion = parseSemVer(step.fromVersion)
  const toVersion = parseSemVer(step.toVersion)
  if (fromVersion === null || toVersion === null || compareSemVer(fromVersion, toVersion) >= 0) {
    return throwMigrationError(
      'Save package migration must move to a higher SemVer',
      { packageId: step.packageId, fromVersion: step.fromVersion, toVersion: step.toVersion, reason: 'non-forward-migration' }
    )
  }
}

const createPackageMigrationMap = (
  steps: readonly SavePackageMigrationStep[] = []
): Map<PackageId, Map<string, SavePackageMigrationStep>> => {
  const result = new Map<PackageId, Map<string, SavePackageMigrationStep>>()
  for (const step of steps) {
    validateSavePackageMigrationStep(step)
    const packageSteps = result.get(step.packageId) ?? new Map<string, SavePackageMigrationStep>()
    if (packageSteps.has(step.fromVersion)) {
      return throwMigrationError(
        'Save package migration descriptors are ambiguous',
        { packageId: step.packageId, fromVersion: step.fromVersion, reason: 'duplicate-from-version' }
      )
    }
    packageSteps.set(step.fromVersion, step)
    result.set(step.packageId, packageSteps)
  }
  return result
}

interface ThirdPartyPackageMigrationPlan {
  readonly changedPackages: readonly {
    readonly saved: SaveContentEnvironment['packages'][number]
    readonly current: SaveContentEnvironment['packages'][number]
  }[]
}

const createThirdPartyPackageMigrationPlan = (
  saved: SaveContentEnvironment,
  current: SaveContentEnvironment
): ThirdPartyPackageMigrationPlan | null => {
  if (!sameRuntimeIdentity(saved, current) || saved.packages.length !== current.packages.length) return null

  const changedPackages: {
    saved: SaveContentEnvironment['packages'][number]
    current: SaveContentEnvironment['packages'][number]
  }[] = []

  for (let index = 0; index < saved.packages.length; index += 1) {
    const savedPackage = saved.packages[index]!
    const currentPackage = current.packages[index]!
    if (
      savedPackage.id !== currentPackage.id ||
      savedPackage.loadIndex !== currentPackage.loadIndex ||
      !sameStringList(savedPackage.resolvedDependencies, currentPackage.resolvedDependencies)
    ) return null

    if (savedPackage.id === OFFICIAL_PACKAGE_ID) {
      if (!samePackageIdentity(savedPackage, currentPackage)) return null
      continue
    }

    const identityChanged =
      savedPackage.version !== currentPackage.version ||
      savedPackage.contentHash !== currentPackage.contentHash ||
      savedPackage.configurationHash !== currentPackage.configurationHash
    if (!identityChanged) continue

    const savedVersion = parseSemVer(savedPackage.version)
    const currentVersion = parseSemVer(currentPackage.version)
    if (
      savedVersion === null ||
      currentVersion === null ||
      compareSemVer(savedVersion, currentVersion) >= 0 ||
      savedPackage.version === currentPackage.version
    ) return null

    changedPackages.push({ saved: savedPackage, current: currentPackage })
  }

  return changedPackages.length > 0 ? { changedPackages } : null
}

const cloneMigratedSaveRoot = (value: Record<string, any>): Record<string, any> => {
  try {
    assertPureJsonValue(value)
    const encoded = JSON.stringify(value)
    if (encoded === undefined) throw new Error('Save root migration result is not serializable')
    const cloned = JSON.parse(encoded) as unknown
    if (!isRecord(cloned)) throw new Error('Save root migration result must be an object')
    return cloned
  } catch (error) {
    return throwMigrationError(
      error instanceof Error ? error.message : 'Save root migration result is invalid',
      { reason: 'non-json-result' }
    )
  }
}

const applyThirdPartyPackageMigrations = (
  migration: SaveRootMigrationResult,
  currentEnvironment: SaveContentEnvironment,
  options: SaveRootMigrationOptions,
  plan: ThirdPartyPackageMigrationPlan
): SaveRootMigrationResult => {
  const migrationMap = createPackageMigrationMap(options.packageMigrations)
  let data = cloneMigratedSaveRoot(migration.data)

  for (const changedPackage of plan.changedPackages) {
    const packageSteps = migrationMap.get(changedPackage.saved.id as PackageId)
    let version = changedPackage.saved.version
    const visitedVersions = new Set<string>()

    while (version !== changedPackage.current.version) {
      if (visitedVersions.has(version)) {
        return throwMigrationError(
          'Save package migration contains a cycle',
          { packageId: changedPackage.saved.id, fromVersion: version, reason: 'migration-cycle' }
        )
      }
      visitedVersions.add(version)
      const step = packageSteps?.get(version)
      if (!step) {
        return throwMigrationError(
          'Save package has no declared migration path to the current version',
          {
            packageId: changedPackage.saved.id,
            fromVersion: version,
            toVersion: changedPackage.current.version,
            reason: 'migration-path-missing'
          }
        )
      }

      try {
        data = cloneMigratedSaveRoot(step.migrate(cloneMigratedSaveRoot(data)))
      } catch (error) {
        if (error instanceof SaveContentEnvironmentError) throw error
        return throwMigrationError(
          error instanceof Error ? error.message : 'Save package migration failed',
          {
            packageId: changedPackage.saved.id,
            fromVersion: version,
            toVersion: step.toVersion,
            reason: 'migration-failed'
          }
        )
      }
      version = step.toVersion
    }
  }

  const pluginData = normalizePersistedPluginData(data.pluginData, {
    owners: options.pluginDataOwners
  })
  const packageSettings = normalizePersistedPackageSettings(data.packageSettings)
  return {
    status: 'third-party-copy-migrated',
    writeMode: 'copy-only',
    data: {
      ...data,
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: currentEnvironment,
      pluginData,
      packageSettings
    },
    environment: currentEnvironment,
    pluginData,
    packageSettings
  }
}

const canMigrateOfficialVersion = (
  saved: SaveContentEnvironment,
  current: SaveContentEnvironment
): boolean => {
  if (saved.packages.length !== 1 || current.packages.length !== 1) return false

  const savedPackage = saved.packages[0]!
  const currentPackage = current.packages[0]!
  if (
    savedPackage.id !== OFFICIAL_PACKAGE_ID ||
    currentPackage.id !== OFFICIAL_PACKAGE_ID ||
    savedPackage.contentHash !== currentPackage.contentHash ||
    savedPackage.configurationHash !== currentPackage.configurationHash ||
    savedPackage.loadIndex !== currentPackage.loadIndex ||
    !sameStringList(savedPackage.resolvedDependencies, currentPackage.resolvedDependencies) ||
    saved.engineApiVersion !== current.engineApiVersion ||
    saved.contentSchemaVersion !== current.contentSchemaVersion ||
    saved.loaderVersion !== current.loaderVersion ||
    saved.contentCompilerVersion !== current.contentCompilerVersion ||
    saved.schemaSetHash !== current.schemaSetHash ||
    saved.cacheFormatVersion !== current.cacheFormatVersion ||
    saved.trustPolicyVersion !== current.trustPolicyVersion ||
    savedPackage.version !== saved.gameVersion ||
    currentPackage.version !== current.gameVersion
  ) return false

  const savedVersion = parseSemVer(saved.gameVersion)
  const currentVersion = parseSemVer(current.gameVersion)
  return savedVersion !== null && currentVersion !== null && compareSemVer(savedVersion, currentVersion) < 0
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

export const summarizeSaveContentEnvironment = (
  environment: SaveContentEnvironment
): SaveContentEnvironmentSummary => Object.freeze({
  environmentHash: environment.environmentHash,
  packages: Object.freeze(environment.packages.map(pkg => Object.freeze({
    packageId: pkg.id as PackageId,
    version: pkg.version
  })))
})

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

export const migrateSaveRoot = (
  value: unknown,
  options: SaveRootMigrationOptions = {}
): SaveRootMigrationResult => {
  if (!isRecord(value)) {
    throw new SaveContentEnvironmentError(
      'structure',
      'Save root must be an object',
      [saveEnvironmentDiagnostic('save.root.structure', { reason: 'not-object' })]
    )
  }

  const version = value.saveFormatVersion
  validateVersionedSaveRoot(value, version)
  const pluginData = normalizePersistedPluginData(value.pluginData, {
    owners: options.pluginDataOwners
  })
  const packageSettings = normalizePersistedPackageSettings(value.packageSettings)
  if (version === undefined || version === 1) {
    const environment = createOfficialSaveContentEnvironment()
    return {
      status: 'legacy-migrated',
      writeMode: 'in-place',
      data: {
        ...value,
        saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
        contentEnvironment: environment,
        pluginData,
        packageSettings
      },
      environment,
      pluginData,
      packageSettings
    }
  }

  if (version === 2) {
    if (!('contentEnvironment' in value)) {
      throw new SaveContentEnvironmentError(
        'structure',
        'Current save is missing content environment metadata',
        [saveEnvironmentDiagnostic('save.root.content-environment', { reason: 'missing' })]
      )
    }

    const environment = normalizeSaveContentEnvironment(value.contentEnvironment)
    return {
      status: 'legacy-migrated',
      writeMode: 'in-place',
      data: {
        ...value,
        saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
        contentEnvironment: environment,
        pluginData,
        packageSettings
      },
      environment,
      pluginData,
      packageSettings
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

  if (!('packageSettings' in value)) {
    throw createMissingPackageSettingsError()
  }

  const environment = normalizeSaveContentEnvironment(value.contentEnvironment)
  return {
    status: 'current',
    writeMode: 'in-place',
    data: {
      ...value,
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: environment,
      pluginData,
      packageSettings
    },
    environment,
    pluginData,
    packageSettings
  }
}

export const checkSaveRootCompatibility = (
  value: unknown,
  currentEnvironment: SaveContentEnvironment,
  options: SaveRootMigrationOptions = {}
): SaveRootCompatibilityResult => {
  let migration: SaveRootMigrationResult
  try {
    migration = migrateSaveRoot(value, options)
  } catch (error) {
    if (error instanceof SavePluginDataError) {
      return { status: 'invalid', diagnostics: error.diagnostics }
    }
    if (error instanceof SavePackageSettingsError) {
      return { status: 'invalid', diagnostics: error.diagnostics }
    }
    if (error instanceof SaveContentEnvironmentError) {
      return { status: 'invalid', diagnostics: error.diagnostics }
    }
    const message = error instanceof Error ? error.message : String(error)
    return {
      status: 'invalid',
      diagnostics: [saveEnvironmentDiagnostic('save.root.compatibility', { message })]
    }
  }

  if (migration.environment.environmentHash === currentEnvironment.environmentHash) {
    return { status: 'compatible', migration, diagnostics: [] }
  }

  if (canMigrateOfficialVersion(migration.environment, currentEnvironment)) {
    return {
      status: 'migratable',
      migration: {
        ...migration,
        writeMode: 'in-place',
        data: {
          ...migration.data,
          contentEnvironment: currentEnvironment
        },
        environment: currentEnvironment
      },
      diagnostics: [saveEnvironmentDiagnostic('save.root.compatibility', {
        reason: 'official-version-forward-migration',
        saved: migration.environment.gameVersion,
        current: currentEnvironment.gameVersion
      })]
    }
  }

  const thirdPartyPlan = createThirdPartyPackageMigrationPlan(
    migration.environment,
    currentEnvironment
  )
  if (thirdPartyPlan) {
    try {
      const thirdPartyMigration = applyThirdPartyPackageMigrations(
        migration,
        currentEnvironment,
        options,
        thirdPartyPlan
      )
      return {
        status: 'copy-migratable',
        migration: thirdPartyMigration,
        diagnostics: [saveEnvironmentDiagnostic('save.root.compatibility', {
          reason: 'third-party-copy-migration',
          saved: migration.environment.environmentHash,
          current: currentEnvironment.environmentHash
        })]
      }
    } catch (error) {
      if (error instanceof SavePluginDataError || error instanceof SavePackageSettingsError) {
        return { status: 'invalid', migration, diagnostics: error.diagnostics }
      }
      if (error instanceof SaveContentEnvironmentError) {
        return { status: 'incompatible', migration, diagnostics: error.diagnostics }
      }
      const message = error instanceof Error ? error.message : String(error)
      return {
        status: 'incompatible',
        migration,
        diagnostics: [saveEnvironmentDiagnostic('save.root.migration', { message })]
      }
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
