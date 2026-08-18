import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackAppBootstrapWiringPreflight,
  THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_MODE,
  type ThirdPartyDataPackAppBootstrapWiringPreflightResult
} from '@/domain/mods/thirdPartyDataPackAppBootstrapWiringPreflight'
import {
  THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_MODE,
  type ThirdPartyDataPackNormalStartupGatePreflightResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupGatePreflight'
import type { ThirdPartyDataPackLauncherBoundaryPlatform } from '@/domain/mods/thirdPartyDataPackLauncherBoundaryPreflight'

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

const persistentStateProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
} as const

const createNormalStartupEffects = () => ({
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
  diagnosticsWritten: false,
  launcherBoundaryPreflightConsumed: true,
  normalStartupGatePreflightPrepared: true
} as const)

const createReadyNormalStartupGate = (
  platform: ThirdPartyDataPackLauncherBoundaryPlatform = 'electron',
  overrides: Partial<ThirdPartyDataPackNormalStartupGatePreflightResult> = {}
): ThirdPartyDataPackNormalStartupGatePreflightResult => ({
  kind: THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_KIND,
  mode: THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_MODE,
  platform,
  status: 'deferred',
  launcherBoundaryPreflightStatus: 'deferred',
  startupGateDecision: 'ready-for-launcher-boundary',
  reason: 'normal startup gate preflight is prepared',
  normalStartupGatePreflight: 'deferred',
  readOnly: true,
  launcherBoundaryPreflightConsumed: true,
  normalStartupGatePreflightPrepared: true,
  normalStartupGateAllowed: false,
  launcherBoundaryAllowed: false,
  launcherAppAllowed: false,
  launcherAppCreationAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  saveReadAllowed: false,
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
  candidateHash,
  lockfileHash,
  recovery: 'none',
  retryable: false,
  rollbackRequired: false,
  persistentStateProofs,
  checks: [],
  diagnostics: [],
  normalStartupStages: [],
  normalStartupRequirements: [],
  summary,
  effects: createNormalStartupEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackNormalStartupGatePreflightResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoAppBootstrapRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackAppBootstrapWiringPreflightResult,
  prepared: boolean
): void => {
  expect(result.appBootstrapWiringAllowed).toBe(false)
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
  expect(result.effects.normalStartupGatePreflightConsumed).toBe(prepared)
  expect(result.effects.appBootstrapWiringPreflightPrepared).toBe(prepared)

  const {
    normalStartupGatePreflightConsumed: _normalStartupGatePreflightConsumed,
    appBootstrapWiringPreflightPrepared: _appBootstrapWiringPreflightPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party app bootstrap wiring preflight', () => {
  it('prepares a path-free app bootstrap wiring preflight without app factory effects', () => {
    const result = buildThirdPartyDataPackAppBootstrapWiringPreflight({
      normalStartupGatePreflight: createReadyNormalStartupGate()
    })

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_MODE)
    expect(result.platform).toBe('electron')
    expect(result.status).toBe('deferred')
    expect(result.appBootstrapWiringPreflight).toBe('deferred')
    expect(result.normalStartupGatePreflightStatus).toBe('deferred')
    expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
    expect(result.normalStartupGatePreflightConsumed).toBe(true)
    expect(result.appBootstrapWiringPreflightPrepared).toBe(true)
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
    expect(result.persistentStateProofs).toEqual(persistentStateProofs)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.appBootstrapStages.map(stage => [stage.id, stage.status])).toEqual([
      ['normal-startup-gate-preflight-consumed', 'satisfied'],
      ['app-bootstrap-wiring-preflight', 'satisfied'],
      ['launcher-app-factory-binding', 'deferred'],
      ['game-app-factory-binding', 'deferred'],
      ['pinia-store-bootstrap', 'deferred'],
      ['router-bootstrap', 'deferred'],
      ['save-open-sequencing', 'deferred'],
      ['ui-ipc-completion-sequencing', 'deferred'],
      ['runtime-publication-sequencing', 'deferred']
    ])
    expect(result.appBootstrapRequirements.map(requirement => requirement.id)).toEqual([
      'app-bootstrap-wiring-contract',
      'normal-startup-gate-result',
      'persistent-state-proof-summary',
      'launcher-app-factory-boundary',
      'game-app-factory-boundary',
      'pinia-bootstrap-boundary',
      'router-bootstrap-boundary',
      'save-open-protection',
      'ui-ipc-completion-boundary',
      'runtime-publication-boundary',
      'path-free-app-bootstrap-diagnostics',
      'no-app-bootstrap-side-effect-guard'
    ])
    expect('normalStartupGatePreflight' in result).toBe(false)
    expect('launcherBoundaryPreflight' in result).toBe(false)
    expect('startupDecisionEnvelope' in result).toBe(false)
    expect('sourceAdapterExecution' in result).toBe(false)
    expect('adapterResult' in result).toBe(false)
    expect('startupStateSnapshot' in result).toBe(false)
    expect('launcherApp' in result).toBe(false)
    expect('gameApp' in result).toBe(false)
    expect('pinia' in result).toBe(false)
    expect('router' in result).toBe(false)
    expect('launcherAppFactory' in result).toBe(false)
    expect('gameAppFactory' in result).toBe(false)
    expectNoAppBootstrapRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts Web and Android normal startup gates as app bootstrap wiring inputs', () => {
    const web = buildThirdPartyDataPackAppBootstrapWiringPreflight({
      normalStartupGatePreflight: createReadyNormalStartupGate('web')
    })
    const android = buildThirdPartyDataPackAppBootstrapWiringPreflight({
      normalStartupGatePreflight: createReadyNormalStartupGate('android')
    })

    for (const result of [web, android]) {
      expect(result.status).toBe('deferred')
      expect(result.appBootstrapWiringPreflight).toBe('deferred')
      expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
      expect(result.normalStartupGatePreflightConsumed).toBe(true)
      expect(result.appBootstrapWiringPreflightPrepared).toBe(true)
      expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.candidateHash).toBe(candidateHash)
      expect(result.lockfileHash).toBe(lockfileHash)
      expect(result.persistentStateProofs).toEqual(persistentStateProofs)
      expect('normalStartupGatePreflight' in result).toBe(false)
      expect('launcherBoundaryPreflight' in result).toBe(false)
      expect('startupDecisionEnvelope' in result).toBe(false)
      expect('sourceAdapterExecution' in result).toBe(false)
      expect('adapterResult' in result).toBe(false)
      expect('startupStateSnapshot' in result).toBe(false)
      expect('webSourceHost' in result).toBe(false)
      expect('indexedDb' in result).toBe(false)
      expect('androidHost' in result).toBe(false)
      expect('appDataBridge' in result).toBe(false)
      expectNoAppBootstrapRuntimeOrWriteEffects(result, true)
      expectJsonGraphFrozen(result)
    }
    expect(web.platform).toBe('web')
    expect(android.platform).toBe('android')
  })

  it('skips and blocks terminal normal startup gate results without app bootstrap requirements', () => {
    const skippedSource = createReadyNormalStartupGate('electron', {
      status: 'skipped',
      normalStartupGatePreflight: 'skipped',
      startupGateDecision: 'not-required',
      reason: 'no selected third-party data packs',
      selectedPackageIds: [],
      loadOrder: [],
      targetPackageId: undefined,
      persistentStateProofs: undefined
    } as unknown as Partial<ThirdPartyDataPackNormalStartupGatePreflightResult>)
    const blockedSource = createReadyNormalStartupGate('electron', {
      status: 'blocked',
      normalStartupGatePreflight: 'blocked',
      reason: 'normal startup gate preflight blocked upstream',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.app-bootstrap.blocked-source',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
          recovery: 'retry'
        }
      ]
    } as unknown as Partial<ThirdPartyDataPackNormalStartupGatePreflightResult>)

    const skipped = buildThirdPartyDataPackAppBootstrapWiringPreflight({
      normalStartupGatePreflight: skippedSource
    })
    const blocked = buildThirdPartyDataPackAppBootstrapWiringPreflight({
      normalStartupGatePreflight: blockedSource
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.appBootstrapRequirements).toEqual([])
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.appBootstrapRequirements).toEqual([])
    expect(blocked.appBootstrapStages.every(stage => stage.status === 'blocked')).toBe(true)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.app-bootstrap.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expectNoAppBootstrapRuntimeOrWriteEffects(skipped, false)
    expectNoAppBootstrapRuntimeOrWriteEffects(blocked, false)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks forbidden app factories and bootstrap effect drift before factory binding is allowed', () => {
    const result = buildThirdPartyDataPackAppBootstrapWiringPreflight({
      normalStartupGatePreflight: {
        ...createReadyNormalStartupGate(),
        launcherAppFactory: () => undefined,
        webSourceHost: { open: () => undefined },
        indexedDb: { name: 'taoyuan-mods' },
        androidPrivatePath: '/data/data/com.games.wenzi.taoyuan/files/mods',
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/mods',
        effects: {
          ...createNormalStartupEffects(),
          routerMounted: true
        }
      } as unknown as ThirdPartyDataPackNormalStartupGatePreflightResult
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('app bootstrap wiring preflight inputs are inconsistent')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'path-free-normal-startup-gate',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'no-app-bootstrap-runtime-or-write-effects',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.app-bootstrap-wiring-preflight.checks.path-free-normal-startup-gate'
      }),
      expect.objectContaining({
        stage: 'third-party.app-bootstrap-wiring-preflight.checks.no-app-bootstrap-runtime-or-write-effects'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(result.effects.routerMounted).toBe(false)
    expectNoAppBootstrapRuntimeOrWriteEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('copies package summaries and diagnostics without reading hostile accessors', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/app-bootstrap-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/app-bootstrap-diagnostic')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.app-bootstrap.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })

    const result = buildThirdPartyDataPackAppBootstrapWiringPreflight({
      normalStartupGatePreflight: {
        ...createReadyNormalStartupGate(),
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: createHostileArray([diagnostic], 'diagnostics') as never
      } as unknown as ThirdPartyDataPackNormalStartupGatePreflightResult
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.app-bootstrap.proxy-test',
        packageId
      })
    ])
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('hostPath')
    expect(serialized).not.toContain('app-bootstrap-selected-package-ids')
    expectNoAppBootstrapRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })
})
