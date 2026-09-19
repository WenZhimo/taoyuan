import { Type } from '@sinclair/typebox'
import metadataJson from '../../generated/mods/official-precompiled-metadata.json'
import { assertPureJsonValue, canonicalizeJson } from './canonicalJson'
import { createEnvironmentHash } from './environmentHash'
import type { CacheEnvironmentIdentity } from './precompiledRegistrySchema'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import {
  createOfficialContentHash,
  createOfficialCacheEnvironmentIdentityFromContentHash
} from './officialPrecompiled'
import { ThirdPartyDataPackLockfileDraftSchema } from './schemas'
import { CacheEnvironmentIdentitySchema } from './precompiledRegistrySchema'
import {
  createSerializableRegistrySnapshot,
  restoreRegistrySetFromSnapshot,
  type RegistrySet,
  type SerializableRegistrySnapshot
} from './registry'
import { OFFICIAL_REGISTRY_DEFINITIONS } from './officialRegistryDefinitions'
import { validateUnknown } from './schemaValidation'
import {
  type ThirdPartyCandidateOfficialIdentitySummary,
  type ThirdPartyCandidateIdentitySummary,
  type ThirdPartyCandidateRegistrySnapshotResult
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import type { ThirdPartyDataPackSelectionReport } from './thirdPartyDataPackSelection'
import type {
  ThirdPartyDataPackLockfileDraft,
  ThirdPartyDataPackLockfileDraftResult
} from './thirdPartyDataPackLockfileDraft'

export const THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FORMAT_VERSION = 1 as const
export const THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FILE_NAME =
  'third-party-registry-cache-v1.json'
export const THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES = 32 * 1024 * 1024

export interface ThirdPartyDataPackCandidateRegistryCacheStore {
  read(environmentHash: Sha256Hash): Promise<string | null>
  write(environmentHash: Sha256Hash, contents: string): Promise<void>
}

export interface ThirdPartyDataPackCandidateRegistryCacheEnvelope {
  readonly cacheFormatVersion: typeof THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FORMAT_VERSION
  readonly environment: CacheEnvironmentIdentity
  readonly environmentHash: Sha256Hash
  readonly payloadHash: Sha256Hash
  readonly candidateSnapshot: SerializableRegistrySnapshot
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
}

export interface RestoredThirdPartyDataPackCandidateRegistryCache {
  readonly envelope: ThirdPartyDataPackCandidateRegistryCacheEnvelope
  readonly candidateRegistrySet: RegistrySet
}

const sha256Pattern = /^sha256:[0-9a-f]{64}$/

const CandidateRegistryCacheEnvelopeSchema = Type.Object({
  cacheFormatVersion: Type.Literal(THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FORMAT_VERSION),
  environment: CacheEnvironmentIdentitySchema,
  environmentHash: Type.String({ pattern: '^sha256:[0-9a-f]{64}$' }),
  payloadHash: Type.String({ pattern: '^sha256:[0-9a-f]{64}$' }),
  candidateSnapshot: Type.Unknown(),
  lockfileDraft: ThirdPartyDataPackLockfileDraftSchema
}, { additionalProperties: false })

const cacheDiagnostic = (message: string): Error =>
  new Error(`Third-party candidate registry cache is invalid: ${message}`)

const parseCachedLockfileDraft = (
  value: unknown
): ThirdPartyDataPackLockfileDraft => {
  const result = validateUnknown(ThirdPartyDataPackLockfileDraftSchema, value, {
    stage: 'third-party.candidate-registry-cache.lockfile'
  })
  if (!result.ok) throw cacheDiagnostic('lockfile draft structure is invalid')
  const draft = result.data as unknown as ThirdPartyDataPackLockfileDraft
  const { lockfileHash: _lockfileHash, ...body } = draft
  if (draft.lockfileHash !== hashCanonicalJson(body)) {
    throw cacheDiagnostic('lockfile draft hash does not match its body')
  }
  return draft
}

const countRegistryEntries = (registrySet: RegistrySet): {
  readonly registryCount: number
  readonly entryCount: number
} => ({
  registryCount: registrySet.registryIds().length,
  entryCount: registrySet.registryIds().reduce(
    (total, registryId) => total + registrySet.get(registryId).entries().length,
    0
  )
})

const createOfficialIdentity = (
  officialRegistrySet: RegistrySet
): ThirdPartyCandidateOfficialIdentitySummary => {
  const snapshot = createSerializableRegistrySnapshot(officialRegistrySet)
  return {
    artifactHash: metadataJson.artifactHash as Sha256Hash,
    contentHash: createOfficialContentHash(snapshot),
    schemaSetHash: metadataJson.schemaSetHash as Sha256Hash,
    environmentHash: metadataJson.environmentHash as Sha256Hash,
    snapshotHash: snapshot.snapshotHash as Sha256Hash,
    ...countRegistryEntries(officialRegistrySet)
  }
}

const createCandidateCacheEnvironment = (
  draft: ThirdPartyDataPackLockfileDraft
): CacheEnvironmentIdentity => {
  const official = createOfficialCacheEnvironmentIdentityFromContentHash(
    draft.officialIdentity.contentHash
  )
  return {
    ...official,
    packages: [
      official.packages[0]!,
      ...draft.packages.map(pkg => ({
        id: pkg.packageId,
        version: pkg.version,
        contentHash: pkg.contentHash,
        configurationHash: pkg.configurationHash,
        loadIndex: pkg.loadIndex + 1,
        resolvedDependencies: [...pkg.resolvedDependencies]
      }))
    ]
  }
}

export const createThirdPartyDataPackCandidateRegistryCacheEnvironment = (
  draft: ThirdPartyDataPackLockfileDraft
): CacheEnvironmentIdentity => createCandidateCacheEnvironment(draft)

export const createThirdPartyDataPackCandidateRegistryCacheEnvironmentHash = (
  draft: ThirdPartyDataPackLockfileDraft
): Sha256Hash => createEnvironmentHash(createCandidateCacheEnvironment(draft))

const candidateIdentityFromDraft = (
  draft: ThirdPartyDataPackLockfileDraft
): ThirdPartyCandidateIdentitySummary => {
  const selectedPackages = draft.packages.map(pkg => ({
    packageId: pkg.packageId,
    version: pkg.version
  }))
  const identityBody = {
    formatVersion: 1,
    officialIdentity: draft.officialIdentity,
    selectedPackages,
    loadOrder: draft.loadOrder,
    contentHash: draft.candidateIdentity.contentHash,
    snapshotHash: draft.candidateIdentity.snapshotHash
  }
  return {
    formatVersion: 1,
    contentHash: draft.candidateIdentity.contentHash,
    snapshotHash: draft.candidateIdentity.snapshotHash,
    candidateHash: hashCanonicalJson(identityBody)
  }
}

const cachePayload = (
  environment: CacheEnvironmentIdentity,
  environmentHash: Sha256Hash,
  candidateSnapshot: SerializableRegistrySnapshot,
  lockfileDraft: ThirdPartyDataPackLockfileDraft
) => ({
  cacheFormatVersion: THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FORMAT_VERSION,
  environment,
  environmentHash,
  candidateSnapshot,
  lockfileDraft
})

const assertCacheEnvelope = (
  value: unknown
): ThirdPartyDataPackCandidateRegistryCacheEnvelope => {
  try {
    assertPureJsonValue(value)
  } catch {
    throw cacheDiagnostic('cache envelope is not pure JSON')
  }

  const result = validateUnknown(
    CandidateRegistryCacheEnvelopeSchema,
    value,
    { stage: 'third-party.candidate-registry-cache.structure' }
  )
  if (!result.ok) throw cacheDiagnostic('cache envelope structure is invalid')

  const envelope = result.data as unknown as ThirdPartyDataPackCandidateRegistryCacheEnvelope
  const expectedEnvironmentHash = createEnvironmentHash(envelope.environment)
  if (envelope.environmentHash !== expectedEnvironmentHash) {
    throw cacheDiagnostic('environment hash does not match the environment identity')
  }

  const payload = cachePayload(
    envelope.environment,
    envelope.environmentHash,
    envelope.candidateSnapshot,
    envelope.lockfileDraft
  )
  if (envelope.payloadHash !== hashCanonicalJson(payload)) {
    throw cacheDiagnostic('payload hash does not match the cached payload')
  }

  const parsedDraft = parseCachedLockfileDraft(envelope.lockfileDraft)
  const expectedEnvironment = createCandidateCacheEnvironment(parsedDraft)
  if (canonicalizeJson(envelope.environment) !== canonicalizeJson(expectedEnvironment)) {
    throw cacheDiagnostic('environment does not match the lockfile package set')
  }
  if (candidateIdentityFromDraft(parsedDraft).candidateHash !== parsedDraft.candidateIdentity.candidateHash) {
    throw cacheDiagnostic('candidate identity hash does not match the lockfile draft')
  }
  if (parsedDraft.candidateIdentity.snapshotHash !== envelope.candidateSnapshot.snapshotHash) {
    throw cacheDiagnostic('candidate identity does not match the candidate snapshot')
  }
  if (!sha256Pattern.test(envelope.candidateSnapshot.snapshotHash)) {
    throw cacheDiagnostic('candidate snapshot hash is invalid')
  }
  return Object.freeze({
    ...envelope,
    lockfileDraft: parsedDraft
  })
}

export const createThirdPartyDataPackCandidateRegistryCacheText = (
  candidateSnapshot: SerializableRegistrySnapshot,
  lockfileDraft: ThirdPartyDataPackLockfileDraft
): string => {
  const environment = createCandidateCacheEnvironment(lockfileDraft)
  const environmentHash = createEnvironmentHash(environment)
  const payload = cachePayload(environment, environmentHash, candidateSnapshot, lockfileDraft)
  const envelope = {
    ...payload,
    payloadHash: hashCanonicalJson(payload)
  }
  assertCacheEnvelope(envelope)
  return `${canonicalizeJson(envelope)}\n`
}

export const parseThirdPartyDataPackCandidateRegistryCacheText = (
  text: string
): RestoredThirdPartyDataPackCandidateRegistryCache => {
  if (new TextEncoder().encode(text).byteLength > THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES) {
    throw cacheDiagnostic('cache exceeds the size limit')
  }
  let value: unknown
  try {
    value = JSON.parse(text) as unknown
  } catch {
    throw cacheDiagnostic('cache is not valid JSON')
  }
  const envelope = assertCacheEnvelope(value)
  let candidateRegistrySet: RegistrySet
  try {
    candidateRegistrySet = restoreRegistrySetFromSnapshot(
      OFFICIAL_REGISTRY_DEFINITIONS,
      envelope.candidateSnapshot
    )
  } catch {
    throw cacheDiagnostic('candidate snapshot could not be restored')
  }
  const restoredSnapshot = createSerializableRegistrySnapshot(candidateRegistrySet)
  if (restoredSnapshot.snapshotHash !== envelope.candidateSnapshot.snapshotHash) {
    throw cacheDiagnostic('restored candidate snapshot hash does not match the cache')
  }
  return Object.freeze({ envelope, candidateRegistrySet })
}

export const createCachedThirdPartyCandidateRegistrySnapshotResult = (options: {
  readonly restored: RestoredThirdPartyDataPackCandidateRegistryCache
  readonly officialRegistrySet: RegistrySet
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly selectionReport: ThirdPartyDataPackSelectionReport
}): ThirdPartyCandidateRegistrySnapshotResult => {
  const { envelope } = options.restored
  const officialIdentity = createOfficialIdentity(options.officialRegistrySet)
  return Object.freeze({
    status: 'valid',
    sourceSummary: Object.freeze({
      discoveryStatus: options.discoveryReport.status,
      candidateCount: options.discoveryReport.summary.candidateCount,
      validPackageCount: options.discoveryReport.summary.validPackageCount,
      invalidPackageCount: options.discoveryReport.summary.invalidPackageCount,
      selectedPackageCount: options.selectionReport.summary.selectedPackageCount,
      blockedPackageCount: options.selectionReport.summary.blockedPackageCount,
      issueCount: options.discoveryReport.summary.issueCount + options.selectionReport.summary.issueCount
    }),
    selectedPackageIds: Object.freeze([...envelope.lockfileDraft.selectedPackageIds]),
    blockedPackageIds: Object.freeze(options.selectionReport.blockedPackages
      .flatMap(pkg => pkg.packageId === undefined ? [] : [pkg.packageId])),
    blockedCandidatePaths: Object.freeze(options.selectionReport.blockedPackages.map(pkg => pkg.path)),
    loadOrder: Object.freeze([...envelope.lockfileDraft.loadOrder]),
    diagnostics: Object.freeze([]),
    registryCount: envelope.lockfileDraft.registryCount,
    entryCount: envelope.lockfileDraft.entryCount,
    officialIdentity,
    candidateIdentity: Object.freeze({ ...envelope.lockfileDraft.candidateIdentity }),
    candidateSnapshot: envelope.candidateSnapshot,
    candidateRegistrySet: options.restored.candidateRegistrySet
  })
}

export const createCachedThirdPartyDataPackLockfileDraftResult = (
  draft: ThirdPartyDataPackLockfileDraft
): ThirdPartyDataPackLockfileDraftResult => Object.freeze({
  status: 'valid',
  diagnostics: Object.freeze([]),
  selectedPackageIds: Object.freeze([...draft.selectedPackageIds]),
  blockedPackageIds: Object.freeze([]),
  loadOrder: Object.freeze([...draft.loadOrder]),
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  officialIdentity: Object.freeze({ ...draft.officialIdentity }),
  candidateIdentity: Object.freeze({ ...draft.candidateIdentity }),
  draft
})

export const createInMemoryThirdPartyDataPackCandidateRegistryCacheStore = (): ThirdPartyDataPackCandidateRegistryCacheStore => {
  const records = new Map<Sha256Hash, string>()
  return {
    async read(environmentHash) {
      return records.get(environmentHash) ?? null
    },
    async write(environmentHash, contents) {
      parseThirdPartyDataPackCandidateRegistryCacheText(contents)
      records.set(environmentHash, contents)
    }
  }
}
