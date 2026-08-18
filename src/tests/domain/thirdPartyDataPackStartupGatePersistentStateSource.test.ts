import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackStartupGatePersistentStateSource,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
  ThirdPartyDataPackStartupGatePersistentStateBlockedError,
  type ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSource'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterEffectSummary,
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const summary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
} as const

const createAdapterEffects = (
  executed: boolean
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  electronIpcExposed: false,
  electronIpcResponseSent: false,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  startupPersistentStateSourceAdapterCalled: executed,
  injectedSourceHostCalled: executed,
  startupStateSnapshotReceived: executed,
  startupStateSnapshotNormalized: executed,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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
})

const startupStateSnapshot = {
  formatVersion: 1,
  kind: 'startup-persistent-state-snapshot',
  commandId: 'install',
  packageId,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
  messageKey: 'mods.startup.persistent.state.ready',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false,
  summary,
  diagnostics: []
} as const

const createAdapterResult = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult => ({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  reason: 'startup gate persistent state source adapter executed the injected-test-only host and normalized its path-free startup snapshot',
  startupGatePersistentStateSourceAdapter: 'executed',
  readOnly: true,
  injectedSourceHostRequired: true,
  injectedSourceHostMode: 'injected-test-only',
  sourceHostCalled: true,
  startupStateSnapshotReceived: true,
  startupStateSnapshotNormalized: true,
  startupPersistentStateSourceAdapterAllowed: true,
  persistentStartupReadAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  startupFailureReportingAllowed: false,
  launcherAppAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  startupStateSnapshot,
  checks: [],
  diagnostics: [],
  summary,
  effects: createAdapterEffects(true),
  ...overrides
} as unknown as ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult)

const createSkippedAdapterResult = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult => createAdapterResult({
  status: 'skipped',
  reason: 'no selected third-party data packs',
  startupGatePersistentStateSourceAdapter: 'skipped',
  sourceHostCalled: false,
  startupStateSnapshotReceived: false,
  startupStateSnapshotNormalized: false,
  startupPersistentStateSourceAdapterAllowed: false,
  requestedCommandId: undefined,
  targetPackageId: undefined,
  selectedPackageIds: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  startupStateSnapshot: undefined,
  effects: createAdapterEffects(false),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackStartupGatePersistentStateSourceResult,
  continuationAllowed: boolean,
  snapshotAccepted: boolean
): void => {
  expect(result.normalStartupContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.normalStartupContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.startupStateSnapshotAccepted).toBe(snapshotAccepted)

  const {
    startupGatePersistentStateSourceCalled: _startupGatePersistentStateSourceCalled,
    persistentStateSourceAdapterCalled: _persistentStateSourceAdapterCalled,
    startupStateSnapshotAccepted: _startupStateSnapshotAccepted,
    normalStartupContinuationAllowed: _normalStartupContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party startup gate persistent state source', () => {
  it('is disabled by default and does not call the persistent state adapter source', async() => {
    const readPersistentStateSourceAdapter = vi.fn()
    const source = createThirdPartyDataPackStartupGatePersistentStateSource({
      readPersistentStateSourceAdapter
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.normalStartupContinuationAllowed).toBe(true)
    expect(readPersistentStateSourceAdapter).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts an enabled executed adapter result with a settled path-free snapshot', async() => {
    const readPersistentStateSourceAdapter = vi.fn(async() => createAdapterResult())
    const source = createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readPersistentStateSourceAdapter).toHaveBeenCalledOnce()
    expect(result.sourceAdapterStatus).toBe('executed')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentStateProofs).toEqual({
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    expect(result.summary).toEqual(expect.objectContaining({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243
    }))
    expect('startupStateSnapshot' in result).toBe(false)
    expect('startupStateRequest' in result).toBe(false)
    expect('sourceAdapterExecution' in result).toBe(false)
    expect('electronHost' in result).toBe(false)
    expect('webHost' in result).toBe(false)
    expect('androidHost' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('allows skipped adapter results to continue without accepting a snapshot', async() => {
    const source = createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() => createSkippedAdapterResult()
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.sourceAdapterStatus).toBe('skipped')
    expect(result.normalStartupContinuationAllowed).toBe(true)
    expect(result.selectedPackageIds).toEqual([])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.persistentStateProofs).toBeUndefined()
    expectNoRuntimeOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks blocked, missing and throwing sources without exposing details', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/startup-persistent-source-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.startup-persistent-source.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/startup.json',
      recovery: 'retry'
    })
    const blockedSource = createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() => createAdapterResult({
        status: 'blocked',
        startupGatePersistentStateSourceAdapter: 'blocked',
        reason: 'upstream adapter blocked',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never,
        startupStateSnapshot: undefined,
        startupStateSnapshotNormalized: false,
        startupPersistentStateSourceAdapterAllowed: false,
        effects: createAdapterEffects(false)
      })
    })
    const missingSource = createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/startup-persistent-source')
      }
    })

    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackStartupGatePersistentStateBlockedError
    )
    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackStartupGatePersistentStateBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackStartupGatePersistentStateBlockedError)
      const result = (error as ThirdPartyDataPackStartupGatePersistentStateBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.startup-gate-persistent-state-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await blockedSource()
    } catch (error) {
      const result = (error as ThirdPartyDataPackStartupGatePersistentStateBlockedError).result
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.startup-persistent-source.blocked-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.startup-gate-persistent-state-source.persistent-state-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('startup.json')
      expect(serialized).not.toContain('hostPath')
      expectNoRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe executed sources and copies package arrays without reading hostile lengths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/persistent-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() => createAdapterResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        webHost: { read: () => undefined },
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: {
          ...createAdapterEffects(true),
          transactionCommitted: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackStartupGatePersistentStateBlockedError)
      const result = (error as ThirdPartyDataPackStartupGatePersistentStateBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.startup-gate-persistent-state-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('persistent-source-selected-package-ids')
      expect('webHost' in result).toBe(false)
      expect('programDirectoryPath' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
