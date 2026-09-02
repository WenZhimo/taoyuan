import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackElectronStartupGateDecisionEnvelope,
  type ThirdPartyDataPackElectronStartupGateDecisionEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronStartupGateDecisionEnvelope'
import {
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
  type ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult
} from '@/domain/mods/thirdPartyDataPackElectronStartupGatePersistentStateExecution'
import {
  buildThirdPartyDataPackLauncherBoundaryPreflight,
  type ThirdPartyDataPackLauncherBoundaryPreflightResult
} from '@/domain/mods/thirdPartyDataPackLauncherBoundaryPreflight'
import {
  createThirdPartyDataPackNormalStartupContinuationPipeline
} from '@/domain/mods/thirdPartyDataPackNormalStartupContinuationPipeline'
import {
  ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError,
  type ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult,
  type ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  type ThirdPartyDataPackNormalStartupHandoffHostResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupHandoffExecutionSource'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSource'
import type {
  ThirdPartyDataPackAppFactoryBindingHostEnvelope,
  ThirdPartyDataPackAppFactoryBindingHostResult
} from '@/domain/mods/thirdPartyDataPackAppFactoryBindingSource'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateHash = testHash('c')
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

const persistentStateProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
} as const

const startupStateSnapshot = {
  formatVersion: 1,
  kind: 'startup-persistent-state-snapshot',
  commandId: 'install',
  packageId,
  candidateHash,
  lockfileHash,
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
  messageKey: 'mods.startup.persistent.state.electron.ready',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false,
  summary,
  diagnostics: []
} as const

const adapterEffects = {
  startupPersistentStateSourceAdapterCalled: true,
  injectedSourceHostCalled: true,
  startupStateSnapshotReceived: true,
  startupStateSnapshotNormalized: true
} as const

const createAdapterResult = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult => ({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  reason: 'startup gate persistent state source adapter executed the injected-test-only host and normalized its path-free startup snapshot',
  startupPersistentStateSourceAdapterAllowed: true,
  startupStateSnapshotNormalized: true,
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
  startupStateSnapshot,
  diagnostics: [],
  summary,
  effects: adapterEffects,
  ...overrides
} as unknown as ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult)

const createExecutionResult = (
  adapterResult = createAdapterResult(),
  overrides: Partial<ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult> = {}
): ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult => ({
  kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
  platform: 'electron',
  startupGateHandoffStatus: 'deferred',
  persistentStatePreflight: {
    status: 'deferred'
  },
  sourceAdapterExecution: {
    adapterResult
  },
  ...overrides
} as unknown as ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult)

const createReadyEnvelope = (): ThirdPartyDataPackElectronStartupGateDecisionEnvelope =>
  buildThirdPartyDataPackElectronStartupGateDecisionEnvelope({
    execution: createExecutionResult()
  })

const createReadyLauncherBoundary = (): ThirdPartyDataPackLauncherBoundaryPreflightResult =>
  buildThirdPartyDataPackLauncherBoundaryPreflight({
    startupDecisionEnvelope: createReadyEnvelope()
  })

const createPersistentStateSource = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStateSourceResult> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceResult => ({
  status: 'ready',
  reason: 'path-free persistent startup state snapshot accepted',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  normalStartupContinuationAllowed: true,
  sourceAdapterStatus: 'executed',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  lockfileHash,
  persistentStateProofs,
  diagnostics: [],
  summary,
  effects: {
    startupGatePersistentStateSourceCalled: true,
    persistentStateSourceAdapterCalled: true,
    startupStateSnapshotAccepted: true,
    normalStartupContinuationAllowed: true,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  },
  ...overrides
} as unknown as ThirdPartyDataPackStartupGatePersistentStateSourceResult)

const createAcceptedAppFactoryBindingHostResult = (
  envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope,
  overrides: Partial<ThirdPartyDataPackAppFactoryBindingHostResult> = {}
): ThirdPartyDataPackAppFactoryBindingHostResult => ({
  status: 'accepted',
  platform: envelope.platform,
  startupGateDecision: envelope.startupGateDecision,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: [],
  effects: {
    appFactoryBindingHostCalled: true,
    appFactoryBindingHostAccepted: true,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  },
  ...overrides
})

const createAcceptedNormalStartupHandoffHostResult = (
  envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  overrides: Partial<ThirdPartyDataPackNormalStartupHandoffHostResult> = {}
): ThirdPartyDataPackNormalStartupHandoffHostResult => ({
  status: 'accepted',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: [],
  effects: {
    normalStartupHandoffHostCalled: true,
    normalStartupHandoffHostAccepted: true,
    realNormalStartupHostCalled: false,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    gameAppMounted: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
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

const expectNoRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult,
  continuationAllowed: boolean,
  hostAcknowledged = false
): void => {
  expect(result.normalStartupContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.normalStartupContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.normalStartupHandoffHostCalled).toBe(hostAcknowledged)
  expect(result.effects.normalStartupHandoffHostAccepted).toBe(hostAcknowledged)

  const {
    normalStartupHandoffExecutionSourceCalled: _normalStartupHandoffExecutionSourceCalled,
    startupGateBootstrapSourceCalled: _startupGateBootstrapSourceCalled,
    injectedNormalStartupHandoffHostCalled: _injectedNormalStartupHandoffHostCalled,
    normalStartupHandoffHostCalled: _normalStartupHandoffHostCalled,
    normalStartupHandoffHostAccepted: _normalStartupHandoffHostAccepted,
    normalStartupContinuationAllowed: _normalStartupContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party normal startup continuation pipeline', () => {
  it('is disabled by default and does not read startup inputs or call hosts', async() => {
    const readLauncherBoundaryPreflight = vi.fn()
    const readStartupGatePersistentStateSource = vi.fn()
    const acknowledgeAppFactoryBinding = vi.fn()
    const acknowledgeNormalStartupHandoff = vi.fn()
    const pipeline = createThirdPartyDataPackNormalStartupContinuationPipeline({
      readLauncherBoundaryPreflight,
      readStartupGatePersistentStateSource,
      acknowledgeAppFactoryBinding,
      acknowledgeNormalStartupHandoff
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readLauncherBoundaryPreflight).not.toHaveBeenCalled()
    expect(readStartupGatePersistentStateSource).not.toHaveBeenCalled()
    expect(acknowledgeAppFactoryBinding).not.toHaveBeenCalled()
    expect(acknowledgeNormalStartupHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('threads normal startup gate, app bootstrap, factory binding and startup handoff acknowledgements', async() => {
    const readLauncherBoundaryPreflight = vi.fn(async() => createReadyLauncherBoundary())
    const readStartupGatePersistentStateSource = vi.fn(async() => createPersistentStateSource())
    const acknowledgeAppFactoryBinding = vi.fn(async(
      envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.platform).toBe('electron')
      expect(envelope.startupGateDecision).toBe('ready-for-launcher-boundary')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.candidateHash).toBe(candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.persistentStateProofs).toEqual(persistentStateProofs)
      expect('launcherAppFactory' in envelope).toBe(false)
      expect('gameAppFactory' in envelope).toBe(false)
      expect('pinia' in envelope).toBe(false)
      expect('router' in envelope).toBe(false)
      return createAcceptedAppFactoryBindingHostResult(envelope)
    })
    const acknowledgeNormalStartupHandoff = vi.fn(async(
      envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.persistentStateProofs).toEqual(persistentStateProofs)
      expect('launcherAppFactory' in envelope).toBe(false)
      expect('gameAppFactory' in envelope).toBe(false)
      expect('pinia' in envelope).toBe(false)
      expect('router' in envelope).toBe(false)
      return createAcceptedNormalStartupHandoffHostResult(envelope)
    })
    const pipeline = createThirdPartyDataPackNormalStartupContinuationPipeline({
      enabled: true,
      readLauncherBoundaryPreflight,
      readStartupGatePersistentStateSource,
      acknowledgeAppFactoryBinding,
      acknowledgeNormalStartupHandoff
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(result.startupGateBootstrapSourceStatus).toBe('ready')
    expect(result.normalStartupHandoffHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentStateProofs).toEqual(persistentStateProofs)
    expect(readLauncherBoundaryPreflight).toHaveBeenCalledOnce()
    expect(readStartupGatePersistentStateSource).toHaveBeenCalledOnce()
    expect(acknowledgeAppFactoryBinding).toHaveBeenCalledOnce()
    expect(acknowledgeNormalStartupHandoff).toHaveBeenCalledOnce()
    const factoryBindingCallOrder = acknowledgeAppFactoryBinding.mock.invocationCallOrder[0] as number
    const normalStartupCallOrder = acknowledgeNormalStartupHandoff.mock.invocationCallOrder[0] as number
    expect(factoryBindingCallOrder).toBeLessThan(normalStartupCallOrder)
    expect('launcherBoundaryPreflight' in result).toBe(false)
    expect('normalStartupGatePreflight' in result).toBe(false)
    expect('appBootstrapWiringPreflight' in result).toBe(false)
    expect('appFactoryBindingSource' in result).toBe(false)
    expect('startupGateBootstrapSource' in result).toBe(false)
    expect('launcherAppFactory' in result).toBe(false)
    expect('gameAppFactory' in result).toBe(false)
    expect('pinia' in result).toBe(false)
    expect('router' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe normal startup handoff hosts without exposing thrown paths', async() => {
    const acknowledgeNormalStartupHandoff = vi.fn(async() => {
      throw new Error('EACCES: C:/Users/LENOVO/mods/normal-startup-continuation-host')
    })
    const pipeline = createThirdPartyDataPackNormalStartupContinuationPipeline({
      enabled: true,
      readLauncherBoundaryPreflight: async() => createReadyLauncherBoundary(),
      readStartupGatePersistentStateSource: async() => createPersistentStateSource(),
      acknowledgeAppFactoryBinding: async(envelope) => createAcceptedAppFactoryBindingHostResult(envelope),
      acknowledgeNormalStartupHandoff
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError)
      const result = (error as ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.normal-startup-handoff-execution-source.handoff-host-failed',
          packageId
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('normal-startup-continuation-host')
      expect((error as Error).message).not.toContain('C:/Users')
      expect(acknowledgeNormalStartupHandoff).toHaveBeenCalledTimes(2)
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
