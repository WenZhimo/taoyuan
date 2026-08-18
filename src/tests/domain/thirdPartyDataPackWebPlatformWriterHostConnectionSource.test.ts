import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackWebPlatformWriterAdapterPreflight'
import {
  createThirdPartyDataPackWebPlatformWriterHostConnectionSource,
  THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE,
  ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionResult,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackWebPlatformWriterHostConnectionSource'

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

const writeProbeEvidence = {
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  modLockPersistentWriteExecuted: true,
  transactionLogPersistentWriteExecuted: true
} as const

const webRequirements = [
  {
    id: 'web-indexeddb-userdata-root',
    status: 'required',
    reason: 'Web writer must resolve userdata from IndexedDB-scoped browser persistence'
  },
  {
    id: 'web-mod-lock-indexeddb-atomic-writer',
    status: 'required',
    reason: 'Web writer must atomically persist the mod-lock record in IndexedDB'
  },
  {
    id: 'web-settings-indexeddb-atomic-writer',
    status: 'required',
    reason: 'Web writer must atomically persist settings in IndexedDB'
  },
  {
    id: 'web-path-free-storage-command-envelope',
    status: 'required',
    reason: 'Web storage commands must use fixed-purpose envelopes'
  }
] as const

const createAdapterEffects = (
  overrides: Partial<ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult['effects']> = {}
): ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult['effects'] => ({
  webPlatformWriterAdapterPreflightCalled: true,
  platformWriterConnectionPreflightCalled: true,
  upstreamPlatformWriterConnectionReady: true,
  webPlatformWriterAdapterReady: true,
  realWebPlatformWriterHostCalled: false,
  webPlatformWriterConnected: false,
  webIndexedDbStorageResolved: false,
  webStorageEnvelopeExposed: false,
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

const createReadyAdapterPreflight = (
  overrides: Partial<ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult> = {}
): ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult => ({
  kind: 'third-party-web-platform-writer-adapter-preflight',
  mode: 'default-disabled-web-platform-writer-adapter-preflight',
  status: 'ready',
  reason: 'third-party Web platform writer adapter preflight accepted path-free writer requirements',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  platformWriterConnectionPreflightStatus: 'deferred',
  webConnectionRequirementStatus: 'required',
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
  upstreamRequirements: [],
  webRequirements,
  checks: [],
  diagnostics: [],
  effects: createAdapterEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult)

const createSkippedAdapterPreflight = (
  overrides: Partial<ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult> = {}
): ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult => createReadyAdapterPreflight({
  status: 'skipped',
  reason: 'adapter preflight skipped',
  webConnectionRequirementStatus: 'skipped',
  targetPackageId: undefined,
  selectedPackageIds: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'skipped',
    transactionLogWriteProbeStatus: 'skipped',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  webRequirements: webRequirements.map(requirement => ({
    ...requirement,
    status: 'skipped'
  })) as never,
  effects: createAdapterEffects({
    upstreamPlatformWriterConnectionReady: false,
    webPlatformWriterAdapterReady: false,
    settingsWritten: false,
    lockfileWritten: false
  }),
  ...overrides
})

const createAcceptedHostResult = (
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoWritesOrRuntime = (
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
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party Web platform writer host connection source', () => {
  it('is disabled by default and does not call adapter preflight or host', async() => {
    const readWebPlatformWriterAdapterPreflight = vi.fn()
    const connectWebPlatformWriterHost = vi.fn()
    const source = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      readWebPlatformWriterAdapterPreflight,
      connectWebPlatformWriterHost
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readWebPlatformWriterAdapterPreflight).not.toHaveBeenCalled()
    expect(connectWebPlatformWriterHost).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoWritesOrRuntime(result, false, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when the Web adapter preflight is skipped', async() => {
    const readWebPlatformWriterAdapterPreflight = vi.fn(async() => createSkippedAdapterPreflight())
    const connectWebPlatformWriterHost = vi.fn()
    const source = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      enabled: true,
      readWebPlatformWriterAdapterPreflight,
      connectWebPlatformWriterHost
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(result.webPlatformWriterAdapterPreflightStatus).toBe('skipped')
    expect(readWebPlatformWriterAdapterPreflight).toHaveBeenCalledOnce()
    expect(connectWebPlatformWriterHost).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoWritesOrRuntime(result, false, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts ready Web adapter preflight through an injected path-free host acknowledgement', async() => {
    const readWebPlatformWriterAdapterPreflight = vi.fn(async() => createReadyAdapterPreflight())
    const connectWebPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.writeProbeEvidence).toEqual(writeProbeEvidence)
      expect(envelope.webRequirementIds).toEqual([
        'web-indexeddb-userdata-root',
        'web-mod-lock-indexeddb-atomic-writer',
        'web-settings-indexeddb-atomic-writer',
        'web-path-free-storage-command-envelope'
      ])
      expect('indexedDbDatabase' in envelope).toBe(false)
      expect('storageHandle' in envelope).toBe(false)
      expect('webPlatformWriterHost' in envelope).toBe(false)
      return createAcceptedHostResult(envelope)
    })
    const source = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      enabled: true,
      readWebPlatformWriterAdapterPreflight,
      connectWebPlatformWriterHost
    })

    const result = await source()

    expect(result.status).toBe('connected')
    expect(result.webPlatformWriterAdapterPreflightStatus).toBe('ready')
    expect(result.webPlatformWriterHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(readWebPlatformWriterAdapterPreflight).toHaveBeenCalledOnce()
    expect(connectWebPlatformWriterHost).toHaveBeenCalledOnce()
    expect('indexedDbDatabase' in result).toBe(false)
    expect('storageHandle' in result).toBe(false)
    expect('webPlatformWriterHost' in result).toBe(false)
    expectNoWritesOrRuntime(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing and throwing sources or hosts without leaking browser storage details', async() => {
    const missingSource = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      enabled: true,
      readWebPlatformWriterAdapterPreflight: async() => {
        throw new Error('EACCES: indexedDB://taoyuan-mod-storage/userdata')
      }
    })
    const throwingHost = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      enabled: true,
      readWebPlatformWriterAdapterPreflight: async() => createReadyAdapterPreflight(),
      connectWebPlatformWriterHost: async() => {
        throw new Error('EACCES: blob:https://taoyuan.example/mod-lock.json')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError
    )
    await expect(throwingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError
    )

    try {
      await throwingHost()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError)
      const result = (error as ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-host-connection.host-failed',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('indexedDB://')
      expect(serialized).not.toContain('blob:https://')
      expect((error as Error).message).not.toContain('indexedDB://')
      expect((error as Error).message).not.toContain('blob:https://')
      expectNoWritesOrRuntime(result, false, true, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe source or host results without exposing paths or browser storage handles', async() => {
    const unsafeSource = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      enabled: true,
      readWebPlatformWriterAdapterPreflight: async() => createReadyAdapterPreflight({
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.web-platform-writer-host-connection.upstream-storage',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            objectUrl: 'blob:https://taoyuan.example/imported-pack',
            recovery: 'retry'
          }
        ] as never,
        webPlatformWriterHost: {
          indexedDbDatabase: 'taoyuan-mod-storage'
        },
        effects: createAdapterEffects({
          cacheWritten: true
        } as never)
      } as unknown as Partial<ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult>)
    })
    const unsafeHost = createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
      enabled: true,
      readWebPlatformWriterAdapterPreflight: async() => createReadyAdapterPreflight(),
      connectWebPlatformWriterHost: async(envelope) => createAcceptedHostResult(envelope, {
        blockedPackageIds: [blockedPackageId],
        blobUrl: 'blob:https://taoyuan.example/imported-pack',
        browserStorage: {
          indexedDbDatabase: 'taoyuan-mod-storage'
        },
        effects: {
          ...createAcceptedHostResult(envelope).effects,
          cacheWritten: true
        }
      } as unknown as Partial<ThirdPartyDataPackWebPlatformWriterHostConnectionResult>)
    })

    await expect(unsafeSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError
    )

    try {
      await unsafeHost()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError)
      const result = (error as ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.blockedPackageIds).toEqual([])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-host-connection.unsafe-host',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('blob:https://')
      expect(serialized).not.toContain('imported-pack')
      expect(serialized).not.toContain('taoyuan-mod-storage')
      expect(serialized).not.toContain('"browserStorage":')
      expect(serialized).not.toContain('indexedDbDatabase')
      expect('webPlatformWriterHost' in result).toBe(false)
      expect('browserStorage' in result).toBe(false)
      expect('indexedDbDatabase' in result).toBe(false)
      expectNoWritesOrRuntime(result, false, true, false)
      expectJsonGraphFrozen(result)
    }
  })
})
