import { describe, expect, it, vi } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackWebPlatformWriterHostConnectionPipeline'
import {
  ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionResult,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackWebPlatformWriterHostConnectionSource'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import type {
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfilePersistentWriterSource'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const createDraft = (
  options: {
    readonly packageId?: PackageId
    readonly identity?: ThirdPartyCandidateIdentitySummary
  } = {}
): ThirdPartyDataPackLockfileDraft => {
  const selectedPackageId = options.packageId ?? packageId
  const identity = options.identity ?? candidateIdentity
  const itemId = `${selectedPackageId}:linen_ribbon` as ContentId
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: committedMetadata.artifactHash as Sha256Hash,
      contentHash: committedMetadata.contentHash as Sha256Hash,
      schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
      environmentHash: committedMetadata.environmentHash as Sha256Hash,
      snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity: identity,
    registryCount: 55,
    entryCount: 4243,
    selectedPackageIds: [selectedPackageId],
    loadOrder: [selectedPackageId],
    packages: [
      {
        packageId: selectedPackageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: 'sample-pack',
          manifestPath: 'sample-pack/manifest.json',
          contentFiles: ['sample-pack/data/items.json']
        },
        manifestHash: testHash('e'),
        contentHash: testHash('f'),
        configurationHash: testHash('1'),
        resolvedDependencies: [],
        contentFiles: [
          {
            registryId: 'taoyuan:item' as RegistryTypeId,
            path: 'data/items.json',
            entryCount: 1,
            entries: [
              {
                registryId: 'taoyuan:item' as RegistryTypeId,
                contentId: itemId,
                index: 0,
                canonicalHash: testHash('2')
              }
            ]
          }
        ]
      }
    ]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const writeProbeEvidence = {
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  modLockPersistentWriteExecuted: true,
  transactionLogPersistentWriteExecuted: true
} as const

const commitEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary => ({
  settingsLockfileCommitSourceCalled: true,
  packageFileStagingSourceCalled: true,
  injectedSettingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostAccepted: true,
  realSettingsLockfileCommitHostCalled: false,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const createAcceptedCommitResult = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => ({
  kind: 'third-party-settings-lockfile-commit-source',
  mode: 'default-disabled-settings-lockfile-commit-source',
  status: 'accepted',
  reason: 'settings-lockfile commit source accepted an injected host acknowledgement',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  packageFileStagingSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  writeProbeEvidence,
  diagnostics: [],
  effects: commitEffects(),
  ...overrides
} as ThirdPartyDataPackSettingsLockfileCommitSourceResult)

const createAcceptedCommitResultFromDraft = (
  draft: ThirdPartyDataPackLockfileDraft,
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => createAcceptedCommitResult({
  targetPackageId: draft.selectedPackageIds[0],
  selectedPackageIds: draft.selectedPackageIds,
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  ...overrides
})

const writerEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary => ({
  settingsLockfilePersistentWriterHostCalled: true,
  settingsLockfilePersistentWriterHostWritten: true,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const createWriterResult = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult => ({
  status: 'written',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
  settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  diagnostics: [],
  effects: writerEffects(),
  ...overrides
})

const createAcceptedWebHostResult = (
  envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope,
  overrides: Partial<ThirdPartyDataPackWebPlatformWriterHostConnectionResult> = {}
): ThirdPartyDataPackWebPlatformWriterHostConnectionResult => ({
  status: 'accepted',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  webRequirementIds: envelope.webRequirementIds,
  diagnostics: [],
  effects: {
    webPlatformWriterHostCalled: true,
    webPlatformWriterHostAccepted: true,
    webPlatformWriterConnected: true,
    webIndexedDbStorageResolved: true,
    webStorageEnvelopeExposed: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    packageFilesRestored: false,
    lockfileWritten: false,
    lockfileRestored: false,
    settingsWritten: false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  },
  ...overrides
})

const expectContainedPipelineEffects = (
  result: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult,
  connected: boolean,
  upstreamWrites: boolean,
  continuationAllowed = true
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.webPlatformWriterConnected).toBe(connected)
  expect(result.effects.webIndexedDbStorageResolved).toBe(connected)
  expect(result.effects.webPlatformWriterHostAccepted).toBe(connected)
  expect(result.effects.realWebPlatformWriterHostCalled).toBe(false)
  expect(result.effects.webStorageEnvelopeExposed).toBe(false)
  expect(result.effects.settingsWritten).toBe(upstreamWrites)
  expect(result.effects.lockfileWritten).toBe(upstreamWrites)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

describe('third-party Web platform writer host connection pipeline', () => {
  it('is disabled by default and does not call commit readers, persistent writers or platform hosts', async() => {
    const readSettingsLockfileCommitSource = vi.fn()
    const writeSettingsLockfile = vi.fn()
    const connectWebPlatformWriterHost = vi.fn()
    const pipeline = createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline({
      readSettingsLockfileCommitSource,
      writeSettingsLockfile,
      connectWebPlatformWriterHost
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(writeSettingsLockfile).not.toHaveBeenCalled()
    expect(connectWebPlatformWriterHost).not.toHaveBeenCalled()
    expectContainedPipelineEffects(result, false, false)
    expectJsonGraphFrozen(result)
  })

  it('threads contained settings-lockfile writes through Web writer preflight and host acknowledgement', async() => {
    const writeSettingsLockfile = vi.fn(async(
      envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('settingsWriter' in envelope).toBe(false)
      expect('lockfileWriter' in envelope).toBe(false)
      expect('indexedDbDatabase' in envelope).toBe(false)
      expect('storageHandle' in envelope).toBe(false)
      return createWriterResult(envelope)
    })
    const connectWebPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.webRequirementIds).toEqual([
        'web-indexeddb-userdata-root',
        'web-mod-lock-indexeddb-atomic-writer',
        'web-settings-indexeddb-atomic-writer',
        'web-path-free-storage-command-envelope'
      ])
      expect('indexedDbDatabase' in envelope).toBe(false)
      expect('storageHandle' in envelope).toBe(false)
      expect('webPlatformWriterHost' in envelope).toBe(false)
      return createAcceptedWebHostResult(envelope)
    })
    const pipeline = createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(),
      writeSettingsLockfile,
      connectWebPlatformWriterHost
    })

    const result = await pipeline()

    expect(result.status).toBe('connected')
    expect(result.webPlatformWriterAdapterPreflightStatus).toBe('ready')
    expect(result.webPlatformWriterHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(writeSettingsLockfile).toHaveBeenCalledOnce()
    expect(connectWebPlatformWriterHost).toHaveBeenCalledOnce()
    expectContainedPipelineEffects(result, true, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('indexedDB://')
    expect(serialized).not.toContain('blob:https://')
    expect(serialized).not.toContain('indexedDbDatabase')
    expect(serialized).not.toContain('"storageHandle":')
    expectJsonGraphFrozen(result)
  })

  it('constructs the Web settings-lockfile host from a Web store when no injected writer is supplied', async() => {
    const draft = createDraft()
    const store = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const connectWebPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope
    ) => createAcceptedWebHostResult(envelope))
    const pipeline = createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResultFromDraft(draft),
      webSettingsLockfileStore: store,
      readLockfileDraft: async() => draft,
      connectWebPlatformWriterHost
    })

    const result = await pipeline()
    const readBack = await store.read()

    expect(result.status).toBe('connected')
    expect(result.webPlatformWriterAdapterPreflightStatus).toBe('ready')
    expect(result.webPlatformWriterHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(draft.candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(draft.lockfileHash)
    expect(connectWebPlatformWriterHost).toHaveBeenCalledOnce()
    expect(readBack.record).toMatchObject({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      targetPackageId: packageId,
      candidateHash: draft.candidateIdentity.candidateHash,
      lockfileHash: draft.lockfileHash
    })
    expect(readBack.record?.lockfileDraft).toEqual(draft)
    expectContainedPipelineEffects(result, true, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('indexedDB')
    expect(serialized).not.toContain('indexedDbDatabase')
    expect(serialized).not.toContain('"storageHandle":')
    expectJsonGraphFrozen(result)
  })

  it('keeps injected writer precedence when Web store host inputs are also supplied', async() => {
    const draft = createDraft()
    const store = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const readLockfileDraft = vi.fn(async() => draft)
    const writeSettingsLockfile = vi.fn(async(
      envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
    ) => createWriterResult(envelope))
    const connectWebPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope
    ) => createAcceptedWebHostResult(envelope))
    const pipeline = createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(),
      writeSettingsLockfile,
      webSettingsLockfileStore: store,
      readLockfileDraft,
      connectWebPlatformWriterHost
    })

    const result = await pipeline()
    const readBack = await store.read()

    expect(result.status).toBe('connected')
    expect(writeSettingsLockfile).toHaveBeenCalledOnce()
    expect(connectWebPlatformWriterHost).toHaveBeenCalledOnce()
    expect(readLockfileDraft).not.toHaveBeenCalled()
    expect(readBack.record).toBeNull()
    expectContainedPipelineEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks before Web platform host acknowledgement when the persistent writer host rejects the envelope', async() => {
    const writeSettingsLockfile = vi.fn(async(
      envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
    ) => createWriterResult(envelope, {
      blockedPackageIds: [blockedPackageId],
      effects: writerEffects({
        cacheWritten: true
      } as never)
    }))
    const connectWebPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope
    ) => createAcceptedWebHostResult(envelope))
    const pipeline = createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(),
      writeSettingsLockfile,
      connectWebPlatformWriterHost
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError)
      const result = (error as ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-host-connection.source-failed'
        })
      ]))
      expectContainedPipelineEffects(result, false, false, false)
      expect(JSON.stringify(result)).not.toContain('indexedDB://')
    }
    expect(writeSettingsLockfile).toHaveBeenCalledTimes(2)
    expect(connectWebPlatformWriterHost).not.toHaveBeenCalled()
  })
})
