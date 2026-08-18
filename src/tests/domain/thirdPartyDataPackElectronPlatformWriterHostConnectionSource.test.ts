import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackElectronPlatformWriterAdapterPreflight'
import {
  createThirdPartyDataPackElectronPlatformWriterHostConnectionSource,
  THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE,
  ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError,
  type ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope,
  type ThirdPartyDataPackElectronPlatformWriterHostConnectionResult,
  type ThirdPartyDataPackElectronPlatformWriterHostConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackElectronPlatformWriterHostConnectionSource'

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

const electronRequirements = [
  {
    id: 'electron-program-directory-userdata-root',
    status: 'required',
    reason: 'Electron writer must resolve userdata from the program directory and never from the Windows user profile'
  },
  {
    id: 'electron-mod-lock-json-atomic-writer',
    status: 'required',
    reason: 'Electron writer must atomically persist userdata/mod-lock.json with verification'
  },
  {
    id: 'electron-settings-json-atomic-writer',
    status: 'required',
    reason: 'Electron writer must atomically persist userdata/settings.json'
  },
  {
    id: 'electron-path-free-preload-ipc',
    status: 'required',
    reason: 'Electron preload IPC must not accept renderer-supplied paths'
  }
] as const

const createAdapterEffects = (
  overrides: Partial<ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult['effects']> = {}
): ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult['effects'] => ({
  electronPlatformWriterAdapterPreflightCalled: true,
  platformWriterConnectionPreflightCalled: true,
  upstreamPlatformWriterConnectionReady: true,
  electronPlatformWriterAdapterReady: true,
  realElectronPlatformWriterHostCalled: false,
  electronPlatformWriterConnected: false,
  programDirectoryUserdataResolved: false,
  electronIpcExposed: false,
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
  overrides: Partial<ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult> = {}
): ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult => ({
  kind: 'third-party-electron-platform-writer-adapter-preflight',
  mode: 'default-disabled-electron-platform-writer-adapter-preflight',
  status: 'ready',
  reason: 'third-party Electron platform writer adapter preflight accepted path-free writer requirements',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  platformWriterConnectionPreflightStatus: 'deferred',
  electronConnectionRequirementStatus: 'required',
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
  electronRequirements,
  checks: [],
  diagnostics: [],
  effects: createAdapterEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult)

const createSkippedAdapterPreflight = (
  overrides: Partial<ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult> = {}
): ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult => createReadyAdapterPreflight({
  status: 'skipped',
  reason: 'adapter preflight skipped',
  electronConnectionRequirementStatus: 'skipped',
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
  electronRequirements: electronRequirements.map(requirement => ({
    ...requirement,
    status: 'skipped'
  })) as never,
  effects: createAdapterEffects({
    upstreamPlatformWriterConnectionReady: false,
    electronPlatformWriterAdapterReady: false,
    settingsWritten: false,
    lockfileWritten: false
  }),
  ...overrides
})

const createAcceptedHostResult = (
  envelope: ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope,
  overrides: Partial<ThirdPartyDataPackElectronPlatformWriterHostConnectionResult> = {}
): ThirdPartyDataPackElectronPlatformWriterHostConnectionResult => ({
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
  electronRequirementIds: envelope.electronRequirementIds,
  diagnostics: [],
  effects: {
    electronPlatformWriterHostCalled: true,
    electronPlatformWriterHostAccepted: true,
    electronPlatformWriterConnected: true,
    programDirectoryUserdataResolved: true,
    electronIpcExposed: false,
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
  result: ThirdPartyDataPackElectronPlatformWriterHostConnectionSourceResult,
  connected: boolean,
  upstreamWrites: boolean,
  continuationAllowed = true
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.electronPlatformWriterConnected).toBe(connected)
  expect(result.effects.programDirectoryUserdataResolved).toBe(connected)
  expect(result.effects.electronPlatformWriterHostAccepted).toBe(connected)
  expect(result.effects.realElectronPlatformWriterHostCalled).toBe(false)
  expect(result.effects.electronIpcExposed).toBe(false)
  expect(result.effects.settingsWritten).toBe(upstreamWrites)
  expect(result.effects.lockfileWritten).toBe(upstreamWrites)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party Electron platform writer host connection source', () => {
  it('is disabled by default and does not call adapter preflight or host', async() => {
    const readElectronPlatformWriterAdapterPreflight = vi.fn()
    const connectElectronPlatformWriterHost = vi.fn()
    const source = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      readElectronPlatformWriterAdapterPreflight,
      connectElectronPlatformWriterHost
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readElectronPlatformWriterAdapterPreflight).not.toHaveBeenCalled()
    expect(connectElectronPlatformWriterHost).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoWritesOrRuntime(result, false, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when the Electron adapter preflight is skipped', async() => {
    const readElectronPlatformWriterAdapterPreflight = vi.fn(async() => createSkippedAdapterPreflight())
    const connectElectronPlatformWriterHost = vi.fn()
    const source = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      enabled: true,
      readElectronPlatformWriterAdapterPreflight,
      connectElectronPlatformWriterHost
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(result.electronPlatformWriterAdapterPreflightStatus).toBe('skipped')
    expect(readElectronPlatformWriterAdapterPreflight).toHaveBeenCalledOnce()
    expect(connectElectronPlatformWriterHost).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoWritesOrRuntime(result, false, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts ready Electron adapter preflight through an injected path-free host acknowledgement', async() => {
    const readElectronPlatformWriterAdapterPreflight = vi.fn(async() => createReadyAdapterPreflight())
    const connectElectronPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.writeProbeEvidence).toEqual(writeProbeEvidence)
      expect(envelope.electronRequirementIds).toEqual([
        'electron-program-directory-userdata-root',
        'electron-mod-lock-json-atomic-writer',
        'electron-settings-json-atomic-writer',
        'electron-path-free-preload-ipc'
      ])
      expect('programDirectoryPath' in envelope).toBe(false)
      expect('electronPlatformWriterHost' in envelope).toBe(false)
      return createAcceptedHostResult(envelope)
    })
    const source = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      enabled: true,
      readElectronPlatformWriterAdapterPreflight,
      connectElectronPlatformWriterHost
    })

    const result = await source()

    expect(result.status).toBe('connected')
    expect(result.electronPlatformWriterAdapterPreflightStatus).toBe('ready')
    expect(result.electronPlatformWriterHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(readElectronPlatformWriterAdapterPreflight).toHaveBeenCalledOnce()
    expect(connectElectronPlatformWriterHost).toHaveBeenCalledOnce()
    expect('programDirectoryPath' in result).toBe(false)
    expect('electronPlatformWriterHost' in result).toBe(false)
    expectNoWritesOrRuntime(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing and throwing sources or hosts without leaking paths', async() => {
    const missingSource = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      enabled: true,
      readElectronPlatformWriterAdapterPreflight: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/AppData/Roaming/taoyuan/userdata')
      }
    })
    const throwingHost = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      enabled: true,
      readElectronPlatformWriterAdapterPreflight: async() => createReadyAdapterPreflight(),
      connectElectronPlatformWriterHost: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/AppData/Roaming/taoyuan/mod-lock.json')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError
    )
    await expect(throwingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError
    )

    try {
      await throwingHost()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError)
      const result = (error as ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.electron-platform-writer-host-connection.host-failed',
          packageId
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoWritesOrRuntime(result, false, true, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe source or host results without exposing paths or real writer handles', async() => {
    const unsafeSource = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      enabled: true,
      readElectronPlatformWriterAdapterPreflight: async() => createReadyAdapterPreflight({
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.electron-platform-writer-host-connection.upstream-path',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/AppData/Roaming/taoyuan/userdata/settings.json',
            recovery: 'retry'
          }
        ] as never,
        electronPlatformWriterHost: {
          programDirectoryPath: 'C:/Users/LENOVO/AppData/Roaming/taoyuan/userdata'
        },
        effects: createAdapterEffects({
          cacheWritten: true
        } as never)
      } as unknown as Partial<ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult>)
    })
    const unsafeHost = createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
      enabled: true,
      readElectronPlatformWriterAdapterPreflight: async() => createReadyAdapterPreflight(),
      connectElectronPlatformWriterHost: async(envelope) => createAcceptedHostResult(envelope, {
        blockedPackageIds: [blockedPackageId],
        programDirectoryPath: 'C:/Users/LENOVO/AppData/Roaming/taoyuan/userdata',
        effects: {
          ...createAcceptedHostResult(envelope).effects,
          cacheWritten: true
        }
      } as unknown as Partial<ThirdPartyDataPackElectronPlatformWriterHostConnectionResult>)
    })

    await expect(unsafeSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError
    )

    try {
      await unsafeHost()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError)
      const result = (error as ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.blockedPackageIds).toEqual([])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.electron-platform-writer-host-connection.unsafe-host',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('programDirectoryPath')
      expect('electronPlatformWriterHost' in result).toBe(false)
      expectNoWritesOrRuntime(result, false, true, false)
      expectJsonGraphFrozen(result)
    }
  })
})
