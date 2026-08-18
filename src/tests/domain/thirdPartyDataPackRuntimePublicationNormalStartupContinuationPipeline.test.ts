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
  createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline'
import {
  ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError,
  type ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult,
  type ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  type ThirdPartyDataPackNormalStartupHandoffHostResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupHandoffExecutionSource'
import type {
  ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
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

const startupEffects = (
  overrides: Record<string, boolean> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceResult['effects'] => ({
  startupGatePersistentStateSourceCalled: true,
  persistentStateSourceAdapterCalled: true,
  startupStateSnapshotAccepted: true,
  normalStartupContinuationAllowed: true,
  launcherAppCreated: false,
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
  diagnosticsWritten: false,
  ...overrides
} as unknown as ThirdPartyDataPackStartupGatePersistentStateSourceResult['effects'])

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
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateHash,
  lockfileHash,
  persistentStateProofs,
  diagnostics: [],
  summary,
  effects: startupEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackStartupGatePersistentStateSourceResult)

const runtimeEffects = (
  overrides: Record<string, boolean> = {}
): ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult['effects'] => ({
  liveRegistrySwapExecutionSourceCalled: true,
  liveRegistrySwapProtectionSourceCalled: true,
  injectedLiveRegistrySwapHostCalled: true,
  liveRegistrySwapHostCalled: true,
  liveRegistrySwapHostAccepted: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  thirdPartyRegistryPublished: true,
  liveRegistryMutated: true,
  liveRegistrySwapped: true,
  runtimeEnablementAllowed: true,
  officialRegistryPublished: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
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
  diagnosticsWritten: false,
  ...overrides
} as unknown as ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult['effects'])

const createRuntimeSwapSource = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult> = {}
): ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult => ({
  status: 'swapped',
  reason: 'live registry swap execution source accepted a runtime-only host swap acknowledgement',
  runtimeOnly: true,
  persistentWrite: false,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  liveRegistrySwapProtectionStatus: 'deferred',
  liveRegistrySwapHostStatus: 'swapped',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity: {
    formatVersion: 1,
    contentHash: testHash('a'),
    snapshotHash: testHash('b'),
    candidateHash
  },
  lockfileHash,
  requiredProtectionIds: [],
  diagnostics: [],
  effects: runtimeEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult)

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

const expectNoStartupOrWriteEffects = (
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

describe('third-party runtime publication normal startup continuation pipeline', () => {
  it('is disabled by default and does not read sources or call hosts', async() => {
    const readLauncherBoundaryPreflight = vi.fn()
    const readStartupGatePersistentStateSource = vi.fn()
    const readRuntimePublicationLiveRegistrySwap = vi.fn()
    const acknowledgeAppFactoryBinding = vi.fn()
    const acknowledgeNormalStartupHandoff = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline({
      readLauncherBoundaryPreflight,
      readStartupGatePersistentStateSource,
      readRuntimePublicationLiveRegistrySwap,
      acknowledgeAppFactoryBinding,
      acknowledgeNormalStartupHandoff
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readLauncherBoundaryPreflight).not.toHaveBeenCalled()
    expect(readStartupGatePersistentStateSource).not.toHaveBeenCalled()
    expect(readRuntimePublicationLiveRegistrySwap).not.toHaveBeenCalled()
    expect(acknowledgeAppFactoryBinding).not.toHaveBeenCalled()
    expect(acknowledgeNormalStartupHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoStartupOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('threads runtime publication startup state into app factory and normal startup handoff', async() => {
    const calls: string[] = []
    const readStartupGatePersistentStateSource = vi.fn(async() => {
      calls.push('startup-state')
      return createPersistentStateSource()
    })
    const readRuntimePublicationLiveRegistrySwap = vi.fn(async() => {
      calls.push('runtime-swap')
      return createRuntimeSwapSource()
    })
    const readLauncherBoundaryPreflight = vi.fn(async() => {
      calls.push('launcher-boundary')
      return createReadyLauncherBoundary()
    })
    const acknowledgeAppFactoryBinding = vi.fn(async(
      envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
    ) => {
      calls.push('app-factory-binding')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
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
      calls.push('normal-startup-handoff')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.persistentStateProofs).toEqual(persistentStateProofs)
      expect('launcherAppFactory' in envelope).toBe(false)
      expect('gameAppFactory' in envelope).toBe(false)
      expect('pinia' in envelope).toBe(false)
      expect('router' in envelope).toBe(false)
      return createAcceptedNormalStartupHandoffHostResult(envelope)
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline({
      enabled: true,
      readLauncherBoundaryPreflight,
      readStartupGatePersistentStateSource,
      readRuntimePublicationLiveRegistrySwap,
      acknowledgeAppFactoryBinding,
      acknowledgeNormalStartupHandoff
    })

    const result = await pipeline()

    expect(calls).toEqual([
      'startup-state',
      'runtime-swap',
      'launcher-boundary',
      'app-factory-binding',
      'normal-startup-handoff'
    ])
    expect(result.status).toBe('ready')
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
    expect('runtimePublicationLiveRegistrySwap' in result).toBe(false)
    expect('startupStateSnapshot' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('liveRegistryReference' in result).toBe(false)
    expect('launcherAppFactory' in result).toBe(false)
    expect('gameAppFactory' in result).toBe(false)
    expect('pinia' in result).toBe(false)
    expect('router' in result).toBe(false)
    expectNoStartupOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks runtime/startup summary drift before launcher boundary or hosts run', async() => {
    const readLauncherBoundaryPreflight = vi.fn(async() => createReadyLauncherBoundary())
    const acknowledgeAppFactoryBinding = vi.fn()
    const acknowledgeNormalStartupHandoff = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline({
      enabled: true,
      readLauncherBoundaryPreflight,
      readStartupGatePersistentStateSource: async() => createPersistentStateSource(),
      readRuntimePublicationLiveRegistrySwap: async() => createRuntimeSwapSource({
        candidateIdentity: {
          formatVersion: 1,
          contentHash: testHash('a'),
          snapshotHash: testHash('b'),
          candidateHash: testHash('e')
        }
      } as unknown as Partial<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>),
      acknowledgeAppFactoryBinding,
      acknowledgeNormalStartupHandoff
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError
    )
    expect(readLauncherBoundaryPreflight).not.toHaveBeenCalled()
    expect(acknowledgeAppFactoryBinding).not.toHaveBeenCalled()
    expect(acknowledgeNormalStartupHandoff).not.toHaveBeenCalled()

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError)
      const result = (error as ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(JSON.stringify(result)).not.toContain('candidateIdentity')
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(JSON.stringify(result)).not.toContain('liveRegistryReference')
      expectNoStartupOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('short-circuits unsafe startup state before runtime publication or startup hosts run', async() => {
    const readRuntimePublicationLiveRegistrySwap = vi.fn(async() => createRuntimeSwapSource())
    const readLauncherBoundaryPreflight = vi.fn(async() => createReadyLauncherBoundary())
    const acknowledgeAppFactoryBinding = vi.fn()
    const acknowledgeNormalStartupHandoff = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline({
      enabled: true,
      readLauncherBoundaryPreflight,
      readStartupGatePersistentStateSource: async() => createPersistentStateSource({
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: startupEffects({
          transactionCommitted: true
        })
      } as unknown as Partial<ThirdPartyDataPackStartupGatePersistentStateSourceResult>),
      readRuntimePublicationLiveRegistrySwap,
      acknowledgeAppFactoryBinding,
      acknowledgeNormalStartupHandoff
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError
    )
    expect(readRuntimePublicationLiveRegistrySwap).not.toHaveBeenCalled()
    expect(readLauncherBoundaryPreflight).not.toHaveBeenCalled()
    expect(acknowledgeAppFactoryBinding).not.toHaveBeenCalled()
    expect(acknowledgeNormalStartupHandoff).not.toHaveBeenCalled()

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError)
      const result = (error as ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError).result
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('programDirectoryPath')
      expectNoStartupOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
