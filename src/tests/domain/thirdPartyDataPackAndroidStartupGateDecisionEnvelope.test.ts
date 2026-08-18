import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackAndroidStartupGateDecisionEnvelope,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_DECISION_ENVELOPE_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_DECISION_ENVELOPE_MODE,
  type ThirdPartyDataPackAndroidStartupGateDecisionEnvelope
} from '@/domain/mods/thirdPartyDataPackAndroidStartupGateDecisionEnvelope'
import {
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
  type ThirdPartyDataPackAndroidStartupGatePersistentStateExecutionResult
} from '@/domain/mods/thirdPartyDataPackAndroidStartupGatePersistentStateExecution'
import type {
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

const adapterEffects = {
  startupPersistentStateSourceAdapterCalled: true,
  injectedSourceHostCalled: true,
  startupStateSnapshotReceived: true,
  startupStateSnapshotNormalized: true
} as const

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
  messageKey: 'mods.startup.persistent.state.android.ready',
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
  startupPersistentStateSourceAdapterAllowed: true,
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
  startupStateSnapshotNormalized: true,
  checks: [],
  diagnostics: [],
  summary,
  effects: adapterEffects,
  ...overrides
} as unknown as ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult)

const createExecutionResult = (
  adapterResult = createAdapterResult(),
  overrides: Partial<ThirdPartyDataPackAndroidStartupGatePersistentStateExecutionResult> = {}
): ThirdPartyDataPackAndroidStartupGatePersistentStateExecutionResult => ({
  kind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  mode: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
  platform: 'android',
  startupGateHandoffStatus: 'deferred',
  persistentStatePreflight: {
    status: 'deferred'
  },
  sourceAdapterExecution: {
    adapterResult
  },
  ...overrides
} as unknown as ThirdPartyDataPackAndroidStartupGatePersistentStateExecutionResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealStartupEffects = (
  result: ThirdPartyDataPackAndroidStartupGateDecisionEnvelope
): void => {
  expect(result.launcherAppAllowed).toBe(false)
  expect(result.gameAppCreationAllowed).toBe(false)
  expect(result.piniaCreationAllowed).toBe(false)
  expect(result.routerMountAllowed).toBe(false)
  expect(result.saveReadAllowed).toBe(false)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  const {
    androidStartupGateExecutionConsumed: _androidStartupGateExecutionConsumed,
    startupDecisionEnvelopeBuilt: _startupDecisionEnvelopeBuilt,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party Android startup gate decision envelope', () => {
  it('builds a path-free ready envelope while leaving LauncherApp and GameApp creation deferred', () => {
    const result = buildThirdPartyDataPackAndroidStartupGateDecisionEnvelope({
      execution: createExecutionResult()
    })

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_DECISION_ENVELOPE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_DECISION_ENVELOPE_MODE)
    expect(result.platform).toBe('android')
    expect(result.status).toBe('ready')
    expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
    expect(result.executionStatus).toBe('deferred')
    expect(result.persistentStatePreflightStatus).toBe('deferred')
    expect(result.sourceAdapterStatus).toBe('executed')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.messageKey).toBe('mods.startup.persistent.state.android.ready')
    expect(result.persistentStateProofs).toEqual({
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.androidStartupGateExecutionConsumed).toBe(true)
    expect(result.effects.startupDecisionEnvelopeBuilt).toBe(true)
    expect('sourceAdapterExecution' in result).toBe(false)
    expect('adapterResult' in result).toBe(false)
    expect('startupStateSnapshot' in result).toBe(false)
    expect('androidHost' in result).toBe(false)
    expect('appDataHost' in result).toBe(false)
    expect(JSON.stringify(result)).not.toContain('/data/user')
    expectNoRealStartupEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('returns a skipped envelope for skipped startup source execution without exposing internal objects', () => {
    const skippedAdapter = createAdapterResult({
      status: 'skipped',
      sourcePreflightStatus: 'skipped',
      reason: 'no selected third-party data packs',
      startupPersistentStateSourceAdapterAllowed: false,
      startupStateSnapshotReceived: false,
      startupStateSnapshotNormalized: false,
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      candidateIdentity: undefined,
      lockfileHash: undefined,
      startupStateSnapshot: undefined,
      effects: {
        startupPersistentStateSourceAdapterCalled: false,
        injectedSourceHostCalled: false,
        startupStateSnapshotReceived: false,
        startupStateSnapshotNormalized: false
      } as never
    })

    const result = buildThirdPartyDataPackAndroidStartupGateDecisionEnvelope({
      execution: createExecutionResult(skippedAdapter, {
        startupGateHandoffStatus: 'skipped',
        persistentStatePreflight: {
          status: 'skipped'
        } as never
      })
    })

    expect(result.status).toBe('skipped')
    expect(result.startupGateDecision).toBe('not-required')
    expect(result.selectedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.persistentStateProofs).toBeUndefined()
    expect(result.checks.every(check => check.status === 'skipped')).toBe(true)
    expect('startupStateSnapshot' in result).toBe(false)
    expectNoRealStartupEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks upstream failures and strips inherited path-bearing diagnostic metadata', () => {
    const diagnostic = Object.assign(Object.create({
      get privatePath() {
        throw new Error('/data/user/0/com.games.wenzi.taoyuan/mods/startup-decision-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.android-startup-gate-decision.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      recovery: 'retry'
    })
    const blockedAdapter = createAdapterResult({
      status: 'blocked',
      reason: 'injected startup persistent state source snapshot failed adapter normalization',
      startupStateSnapshotNormalized: false,
      blockedPackageIds: [blockedPackageId],
      diagnostics: [diagnostic] as never,
      startupStateSnapshot: undefined
    })

    const result = buildThirdPartyDataPackAndroidStartupGateDecisionEnvelope({
      execution: createExecutionResult(blockedAdapter)
    })

    expect(result.status).toBe('blocked')
    expect(result.startupGateDecision).toBe('blocked-before-launcher-boundary')
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.android-startup-gate-decision.blocked-source',
        packageId
      })
    ]))
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'source-adapter-executed',
        status: 'blocked'
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('/data/user')
    expect(serialized).not.toContain('com.games.wenzi')
    expect(serialized).not.toContain('privatePath')
    expectNoRealStartupEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks launcher/runtime/write effect drift before any real startup creation is allowed', () => {
    const result = buildThirdPartyDataPackAndroidStartupGateDecisionEnvelope({
      execution: createExecutionResult(createAdapterResult({
        effects: {
          ...adapterEffects,
          transactionCommitted: true
        } as never
      }))
    })

    expect(result.status).toBe('blocked')
    expect(result.startupGateDecision).toBe('blocked-before-launcher-boundary')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'no-launcher-runtime-or-write-effects',
        status: 'blocked'
      })
    ]))
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.transactionCommitAllowed).toBe(false)
    expectNoRealStartupEffects(result)
    expectJsonGraphFrozen(result)
  })
})
