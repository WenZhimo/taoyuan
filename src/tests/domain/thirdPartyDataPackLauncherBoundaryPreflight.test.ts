import { describe, expect, it } from 'vitest'
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
  THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_MODE,
  type ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope,
  type ThirdPartyDataPackLauncherBoundaryPreflightResult
} from '@/domain/mods/thirdPartyDataPackLauncherBoundaryPreflight'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
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

const createReadyPlatformEnvelope = (
  platform: 'web' | 'android'
): ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope => {
  const envelope = createReadyEnvelope()
  const platformEffectKey = platform === 'web'
    ? 'webStartupGateExecutionConsumed'
    : 'androidStartupGateExecutionConsumed'
  return {
    ...envelope,
    kind: `${platform}-startup-gate-decision-envelope`,
    platform,
    effects: {
      ...envelope.effects,
      electronStartupGateExecutionConsumed: false,
      [platformEffectKey]: true
    }
  } as unknown as ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoLauncherRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackLauncherBoundaryPreflightResult,
  prepared: boolean
): void => {
  expect(result.launcherBoundaryAllowed).toBe(false)
  expect(result.launcherAppAllowed).toBe(false)
  expect(result.launcherAppCreationAllowed).toBe(false)
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
  expect(result.effects.startupDecisionEnvelopeConsumed).toBe(prepared)
  expect(result.effects.launcherBoundaryPreflightPrepared).toBe(prepared)

  const {
    startupDecisionEnvelopeConsumed: _startupDecisionEnvelopeConsumed,
    launcherBoundaryPreflightPrepared: _launcherBoundaryPreflightPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party Launcher boundary preflight', () => {
  it('prepares a path-free Launcher boundary preflight without creating app runtime objects', () => {
    const result = buildThirdPartyDataPackLauncherBoundaryPreflight({
      startupDecisionEnvelope: createReadyEnvelope()
    })

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_MODE)
    expect(result.platform).toBe('electron')
    expect(result.status).toBe('deferred')
    expect(result.launcherBoundaryPreflight).toBe('deferred')
    expect(result.startupDecisionEnvelopeStatus).toBe('ready')
    expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
    expect(result.startupDecisionEnvelopeConsumed).toBe(true)
    expect(result.launcherBoundaryPreflightPrepared).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateHash).toBe(candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentStateProofs).toEqual({
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.launcherStages.map(stage => [stage.id, stage.status])).toEqual([
      ['startup-decision-envelope-consumed', 'satisfied'],
      ['launcher-boundary-preflight', 'satisfied'],
      ['launcher-app-creation', 'deferred'],
      ['game-app-creation', 'deferred'],
      ['pinia-router-mount', 'deferred'],
      ['save-open-protection', 'deferred'],
      ['ui-ipc-final-result-delivery', 'deferred'],
      ['runtime-publication-commit', 'deferred']
    ])
    expect(result.launcherRequirements.map(requirement => requirement.id)).toEqual([
      'launcher-boundary-contract',
      'explicit-startup-decision',
      'persistent-state-proof-summary',
      'game-app-creation-gate',
      'pinia-router-boundary',
      'save-open-protection',
      'path-free-launcher-diagnostics',
      'no-launcher-side-effect-guard'
    ])
    expect('startupDecisionEnvelope' in result).toBe(false)
    expect('sourceAdapterExecution' in result).toBe(false)
    expect('adapterResult' in result).toBe(false)
    expect('startupStateSnapshot' in result).toBe(false)
    expect('launcherApp' in result).toBe(false)
    expect('gameApp' in result).toBe(false)
    expect('pinia' in result).toBe(false)
    expect('router' in result).toBe(false)
    expectNoLauncherRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts Web and Android startup decision envelopes as Launcher boundary inputs', () => {
    const web = buildThirdPartyDataPackLauncherBoundaryPreflight({
      startupDecisionEnvelope: createReadyPlatformEnvelope('web')
    })
    const android = buildThirdPartyDataPackLauncherBoundaryPreflight({
      startupDecisionEnvelope: createReadyPlatformEnvelope('android')
    })

    for (const result of [web, android]) {
      expect(result.status).toBe('deferred')
      expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
      expect(result.startupDecisionEnvelopeConsumed).toBe(true)
      expect(result.launcherBoundaryPreflightPrepared).toBe(true)
      expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.candidateHash).toBe(candidateHash)
      expect(result.lockfileHash).toBe(lockfileHash)
      expect(result.persistentStateProofs).toEqual({
        transactionLogCommitted: true,
        packageStateMatched: true,
        settingsStateMatched: true,
        modLockStateMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      })
      expect('startupDecisionEnvelope' in result).toBe(false)
      expect('sourceAdapterExecution' in result).toBe(false)
      expect('adapterResult' in result).toBe(false)
      expect('startupStateSnapshot' in result).toBe(false)
      expectNoLauncherRuntimeOrWriteEffects(result, true)
      expectJsonGraphFrozen(result)
    }
    expect(web.platform).toBe('web')
    expect(android.platform).toBe('android')
  })

  it('skips and blocks terminal startup decisions without adding launcher requirements', () => {
    const readyEnvelope = createReadyEnvelope()
    const skippedEnvelope = {
      ...readyEnvelope,
      status: 'skipped',
      startupGateDecision: 'not-required',
      reason: 'no selected third-party data packs',
      selectedPackageIds: [],
      loadOrder: [],
      targetPackageId: undefined,
      persistentStateProofs: undefined
    } as unknown as ThirdPartyDataPackElectronStartupGateDecisionEnvelope
    const blockedEnvelope = {
      ...readyEnvelope,
      status: 'blocked',
      startupGateDecision: 'blocked-before-launcher-boundary',
      reason: 'startup decision envelope blocked upstream',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.launcher-boundary.blocked-source',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
          recovery: 'retry'
        }
      ]
    } as unknown as ThirdPartyDataPackElectronStartupGateDecisionEnvelope

    const skipped = buildThirdPartyDataPackLauncherBoundaryPreflight({
      startupDecisionEnvelope: skippedEnvelope
    })
    const blocked = buildThirdPartyDataPackLauncherBoundaryPreflight({
      startupDecisionEnvelope: blockedEnvelope
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.launcherRequirements).toEqual([])
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.launcherRequirements).toEqual([])
    expect(blocked.launcherStages.every(stage => stage.status === 'blocked')).toBe(true)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.launcher-boundary.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expectNoLauncherRuntimeOrWriteEffects(skipped, false)
    expectNoLauncherRuntimeOrWriteEffects(blocked, false)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks forbidden launcher objects and startup effect drift before app creation is allowed', () => {
    const envelope = createReadyEnvelope()
    const result = buildThirdPartyDataPackLauncherBoundaryPreflight({
      startupDecisionEnvelope: {
        ...envelope,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/mods',
        effects: {
          ...envelope.effects,
          transactionCommitted: true
        }
      } as unknown as ThirdPartyDataPackElectronStartupGateDecisionEnvelope
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('launcher boundary preflight inputs are inconsistent')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'path-free-decision-envelope',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'no-launcher-runtime-or-write-effects',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.launcher-boundary-preflight.checks.path-free-decision-envelope'
      }),
      expect.objectContaining({
        stage: 'third-party.launcher-boundary-preflight.checks.no-launcher-runtime-or-write-effects'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(result.effects.transactionCommitted).toBe(false)
    expectNoLauncherRuntimeOrWriteEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('copies package summaries and diagnostics without reading hostile accessors', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/launcher-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/launcher-diagnostic')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.launcher-boundary.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })

    const result = buildThirdPartyDataPackLauncherBoundaryPreflight({
      startupDecisionEnvelope: {
        ...createReadyEnvelope(),
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: createHostileArray([diagnostic], 'diagnostics') as never
      } as unknown as ThirdPartyDataPackElectronStartupGateDecisionEnvelope
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.launcher-boundary.proxy-test',
        packageId
      })
    ])
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('hostPath')
    expect(serialized).not.toContain('launcher-selected-package-ids')
    expectNoLauncherRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })
})
