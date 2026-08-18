import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError,
  createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource'
import type {
  ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
  type ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSource'

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

const createStartupSource = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStateSourceResult> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceResult => ({
  kind: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
  mode: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
  status: 'ready',
  reason: 'path-free startup persistent-state source accepted',
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

const createSkippedStartupSource = (): ThirdPartyDataPackStartupGatePersistentStateSourceResult =>
  createStartupSource({
    status: 'skipped',
    reason: 'no selected third-party startup state',
    sourceAdapterStatus: 'skipped',
    selectedPackageIds: [],
    blockedPackageIds: [],
    blockedCandidateCount: 0,
    loadOrder: [],
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    candidateHash: undefined,
    lockfileHash: undefined,
    persistentStateProofs: undefined,
    summary: {
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      blockedCandidateCount: 0,
      loadOrderCount: 0,
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      diagnosticCount: 0
    },
    effects: startupEffects({
      startupStateSnapshotAccepted: false
    })
  })

const createSkippedRuntimeSource = (): ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult =>
  createRuntimeSwapSource({
    status: 'skipped',
    reason: 'no selected third-party runtime publication',
    liveRegistrySwapProtectionStatus: 'skipped',
    liveRegistrySwapHostStatus: undefined,
    requestedCommandId: undefined,
    targetPackageId: undefined,
    selectedPackageIds: [],
    blockedPackageIds: [],
    blockedCandidatePaths: [],
    loadOrder: [],
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    candidateIdentity: undefined,
    lockfileHash: undefined,
    effects: runtimeEffects({
      injectedLiveRegistrySwapHostCalled: false,
      liveRegistrySwapHostCalled: false,
      liveRegistrySwapHostAccepted: false,
      thirdPartyRegistryPublished: false,
      liveRegistryMutated: false,
      liveRegistrySwapped: false,
      runtimeEnablementAllowed: false
    })
  })

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackStartupGatePersistentStateSourceResult,
  accepted: boolean
): void => {
  expect(result.effects.startupStateSnapshotAccepted).toBe(accepted)
  expect(result.effects.normalStartupContinuationAllowed).toBe(result.status !== 'blocked')
  const {
    startupGatePersistentStateSourceCalled: _startupGatePersistentStateSourceCalled,
    persistentStateSourceAdapterCalled: _persistentStateSourceAdapterCalled,
    startupStateSnapshotAccepted: _startupStateSnapshotAccepted,
    normalStartupContinuationAllowed: _normalStartupContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party runtime publication startup persistent-state connection source', () => {
  it('is disabled by default and does not read startup or runtime publication sources', async() => {
    const readStartupGatePersistentStateSource = vi.fn()
    const readRuntimePublicationLiveRegistrySwap = vi.fn()
    const source = createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource({
      readStartupGatePersistentStateSource,
      readRuntimePublicationLiveRegistrySwap
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readStartupGatePersistentStateSource).not.toHaveBeenCalled()
    expect(readRuntimePublicationLiveRegistrySwap).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts matching startup persistent-state and runtime live-registry swap summaries', async() => {
    const calls: string[] = []
    const readStartupGatePersistentStateSource = vi.fn(async() => {
      calls.push('startup-source')
      return createStartupSource()
    })
    const readRuntimePublicationLiveRegistrySwap = vi.fn(async() => {
      calls.push('runtime-live-registry-swap')
      return createRuntimeSwapSource()
    })
    const source = createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource({
      enabled: true,
      readStartupGatePersistentStateSource,
      readRuntimePublicationLiveRegistrySwap
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(calls).toEqual([
      'startup-source',
      'runtime-live-registry-swap'
    ])
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentStateProofs).toEqual(persistentStateProofs)
    expect(result.summary).toEqual(expect.objectContaining({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243
    }))
    expect('startupStateSnapshot' in result).toBe(false)
    expect('candidateIdentity' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('liveRegistryReference' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('preserves skipped startup when runtime publication is also skipped', async() => {
    const source = createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource({
      enabled: true,
      readStartupGatePersistentStateSource: async() => createSkippedStartupSource(),
      readRuntimePublicationLiveRegistrySwap: async() => createSkippedRuntimeSource()
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.normalStartupContinuationAllowed).toBe(true)
    expect(result.selectedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe startup sources before executing the runtime live-registry swap source', async() => {
    const readRuntimePublicationLiveRegistrySwap = vi.fn(async() => createRuntimeSwapSource())
    const source = createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource({
      enabled: true,
      readStartupGatePersistentStateSource: async() => createStartupSource({
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: startupEffects({
          transactionCommitted: true
        })
      } as unknown as Partial<ThirdPartyDataPackStartupGatePersistentStateSourceResult>),
      readRuntimePublicationLiveRegistrySwap
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError
    )
    expect(readRuntimePublicationLiveRegistrySwap).not.toHaveBeenCalled()

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(
        ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError
      )
      const result = (error as ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.runtime-publication-startup-state-connection.unsafe-startup-source',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('programDirectoryPath')
      expect('programDirectoryPath' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks runtime publication mismatch without exposing source paths', async() => {
    const pathDiagnostic = {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.runtime-publication-live-registry-swap.path-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
      recovery: 'retry'
    }
    const source = createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource({
      enabled: true,
      readStartupGatePersistentStateSource: async() => createStartupSource(),
      readRuntimePublicationLiveRegistrySwap: async() => createRuntimeSwapSource({
        candidateIdentity: {
          formatVersion: 1,
          contentHash: testHash('a'),
          snapshotHash: testHash('b'),
          candidateHash: testHash('e')
        },
        diagnostics: [pathDiagnostic]
      } as unknown as Partial<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>)
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError
    )

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(
        ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError
      )
      const result = (error as ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.runtime-publication-startup-state-connection.summary-mismatch',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.runtime-publication-live-registry-swap.path-source',
          packageId
        })
      ]))
      expect(result.blockedPackageIds).toEqual([])
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('manifest.json')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
