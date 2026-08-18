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
  type ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope,
  type ThirdPartyDataPackLauncherBoundaryPreflightResult
} from '@/domain/mods/thirdPartyDataPackLauncherBoundaryPreflight'
import {
  buildThirdPartyDataPackNormalStartupGatePreflight,
  THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_MODE,
  type ThirdPartyDataPackNormalStartupGatePreflightResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupGatePreflight'
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

const createReadyLauncherBoundary = (
  platform: 'electron' | 'web' | 'android' = 'electron'
): ThirdPartyDataPackLauncherBoundaryPreflightResult =>
  buildThirdPartyDataPackLauncherBoundaryPreflight({
    startupDecisionEnvelope: platform === 'electron'
      ? createReadyEnvelope()
      : createReadyPlatformEnvelope(platform)
  })

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoNormalStartupRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackNormalStartupGatePreflightResult,
  prepared: boolean
): void => {
  expect(result.normalStartupGateAllowed).toBe(false)
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
  expect(result.effects.launcherBoundaryPreflightConsumed).toBe(prepared)
  expect(result.effects.normalStartupGatePreflightPrepared).toBe(prepared)

  const {
    launcherBoundaryPreflightConsumed: _launcherBoundaryPreflightConsumed,
    normalStartupGatePreflightPrepared: _normalStartupGatePreflightPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party normal startup gate preflight', () => {
  it('prepares a path-free normal startup gate preflight without app bootstrap effects', () => {
    const result = buildThirdPartyDataPackNormalStartupGatePreflight({
      launcherBoundaryPreflight: createReadyLauncherBoundary()
    })

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_MODE)
    expect(result.platform).toBe('electron')
    expect(result.status).toBe('deferred')
    expect(result.normalStartupGatePreflight).toBe('deferred')
    expect(result.launcherBoundaryPreflightStatus).toBe('deferred')
    expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
    expect(result.launcherBoundaryPreflightConsumed).toBe(true)
    expect(result.normalStartupGatePreflightPrepared).toBe(true)
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
    expect(result.normalStartupStages.map(stage => [stage.id, stage.status])).toEqual([
      ['launcher-boundary-preflight-consumed', 'satisfied'],
      ['normal-startup-gate-preflight', 'satisfied'],
      ['launcher-app-startup-wiring', 'deferred'],
      ['game-app-startup-wiring', 'deferred'],
      ['pinia-router-bootstrap', 'deferred'],
      ['save-open-gate', 'deferred'],
      ['ui-ipc-completion-handoff', 'deferred'],
      ['runtime-publication-handoff', 'deferred']
    ])
    expect(result.normalStartupRequirements.map(requirement => requirement.id)).toEqual([
      'normal-startup-gate-contract',
      'launcher-boundary-result',
      'persistent-state-proof-summary',
      'app-bootstrap-boundary',
      'pinia-router-bootstrap-boundary',
      'save-open-protection',
      'path-free-startup-diagnostics',
      'no-normal-startup-side-effect-guard'
    ])
    expect('launcherBoundaryPreflight' in result).toBe(false)
    expect('startupDecisionEnvelope' in result).toBe(false)
    expect('sourceAdapterExecution' in result).toBe(false)
    expect('adapterResult' in result).toBe(false)
    expect('startupStateSnapshot' in result).toBe(false)
    expect('launcherApp' in result).toBe(false)
    expect('gameApp' in result).toBe(false)
    expect('pinia' in result).toBe(false)
    expect('router' in result).toBe(false)
    expectNoNormalStartupRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts Web and Android launcher boundaries as normal startup gate inputs', () => {
    const web = buildThirdPartyDataPackNormalStartupGatePreflight({
      launcherBoundaryPreflight: createReadyLauncherBoundary('web')
    })
    const android = buildThirdPartyDataPackNormalStartupGatePreflight({
      launcherBoundaryPreflight: createReadyLauncherBoundary('android')
    })

    for (const result of [web, android]) {
      expect(result.status).toBe('deferred')
      expect(result.normalStartupGatePreflight).toBe('deferred')
      expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
      expect(result.launcherBoundaryPreflightConsumed).toBe(true)
      expect(result.normalStartupGatePreflightPrepared).toBe(true)
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
      expect('launcherBoundaryPreflight' in result).toBe(false)
      expect('startupDecisionEnvelope' in result).toBe(false)
      expect('sourceAdapterExecution' in result).toBe(false)
      expect('adapterResult' in result).toBe(false)
      expect('startupStateSnapshot' in result).toBe(false)
      expect('webSourceHost' in result).toBe(false)
      expect('indexedDb' in result).toBe(false)
      expect('androidHost' in result).toBe(false)
      expect('appDataBridge' in result).toBe(false)
      expectNoNormalStartupRuntimeOrWriteEffects(result, true)
      expectJsonGraphFrozen(result)
    }
    expect(web.platform).toBe('web')
    expect(android.platform).toBe('android')
  })

  it('skips and blocks terminal launcher boundary results without normal startup requirements', () => {
    const readyBoundary = createReadyLauncherBoundary()
    const skippedBoundary = {
      ...readyBoundary,
      status: 'skipped',
      launcherBoundaryPreflight: 'skipped',
      startupGateDecision: 'not-required',
      reason: 'no selected third-party data packs',
      selectedPackageIds: [],
      loadOrder: [],
      targetPackageId: undefined,
      persistentStateProofs: undefined
    } as unknown as ThirdPartyDataPackLauncherBoundaryPreflightResult
    const blockedBoundary = {
      ...readyBoundary,
      status: 'blocked',
      launcherBoundaryPreflight: 'blocked',
      reason: 'launcher boundary preflight blocked upstream',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.normal-startup.blocked-source',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
          recovery: 'retry'
        }
      ]
    } as unknown as ThirdPartyDataPackLauncherBoundaryPreflightResult

    const skipped = buildThirdPartyDataPackNormalStartupGatePreflight({
      launcherBoundaryPreflight: skippedBoundary
    })
    const blocked = buildThirdPartyDataPackNormalStartupGatePreflight({
      launcherBoundaryPreflight: blockedBoundary
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.normalStartupRequirements).toEqual([])
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.normalStartupRequirements).toEqual([])
    expect(blocked.normalStartupStages.every(stage => stage.status === 'blocked')).toBe(true)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.normal-startup.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expectNoNormalStartupRuntimeOrWriteEffects(skipped, false)
    expectNoNormalStartupRuntimeOrWriteEffects(blocked, false)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks forbidden app objects and startup effect drift before normal startup is allowed', () => {
    const result = buildThirdPartyDataPackNormalStartupGatePreflight({
      launcherBoundaryPreflight: {
        ...createReadyLauncherBoundary(),
        launcherApp: { mount: () => undefined },
        webSourceHost: { open: () => undefined },
        androidPrivatePath: '/data/data/com.games.wenzi.taoyuan/files/mods',
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/mods',
        effects: {
          ...createReadyLauncherBoundary().effects,
          routerMounted: true
        }
      } as unknown as ThirdPartyDataPackLauncherBoundaryPreflightResult
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('normal startup gate preflight inputs are inconsistent')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'path-free-launcher-boundary',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'no-normal-startup-runtime-or-write-effects',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.normal-startup-gate-preflight.checks.path-free-launcher-boundary'
      }),
      expect.objectContaining({
        stage: 'third-party.normal-startup-gate-preflight.checks.no-normal-startup-runtime-or-write-effects'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(result.effects.routerMounted).toBe(false)
    expectNoNormalStartupRuntimeOrWriteEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('copies package summaries and diagnostics without reading hostile accessors', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/normal-startup-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/normal-startup-diagnostic')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.normal-startup.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })

    const result = buildThirdPartyDataPackNormalStartupGatePreflight({
      launcherBoundaryPreflight: {
        ...createReadyLauncherBoundary(),
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: createHostileArray([diagnostic], 'diagnostics') as never
      } as unknown as ThirdPartyDataPackLauncherBoundaryPreflightResult
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.normal-startup.proxy-test',
        packageId
      })
    ])
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('hostPath')
    expect(serialized).not.toContain('normal-startup-selected-package-ids')
    expectNoNormalStartupRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })
})
