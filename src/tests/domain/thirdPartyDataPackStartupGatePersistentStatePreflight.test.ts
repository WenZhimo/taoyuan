import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackStartupGatePersistentStatePreflight,
  type ThirdPartyDataPackStartupGatePersistentStateEffectSummary,
  type ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStatePreflight'
import type {
  ThirdPartyDataPackStartupGateHandoffEffectSummary,
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGateHandoffPreflight'

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

const sourceEffects: ThirdPartyDataPackStartupGateHandoffEffectSummary = {
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
  responseDeliveryOrchestrationConsumed: true,
  startupGateHandoffPrepared: true
}

const expectedEffects: ThirdPartyDataPackStartupGatePersistentStateEffectSummary = {
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
  startupGateHandoffConsumed: true,
  persistentStateSourcePrepared: true
}

const createSource = (
  overrides: Partial<ThirdPartyDataPackStartupGateHandoffPreflightResult> = {}
): ThirdPartyDataPackStartupGateHandoffPreflightResult => ({
  status: 'deferred',
  responseDeliveryOrchestrationStatus: 'deferred',
  reason: 'startup gate handoff is prepared as a path-free preflight; LauncherApp, GameApp creation and persistent startup reads remain separate',
  startupGateHandoffPreflight: 'deferred',
  readOnly: true,
  startupGateHandoffPrepared: true,
  responseDeliveryOrchestrationConsumed: true,
  startupGateHandoffAllowed: false,
  launcherAppAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  saveReadAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  deliveryAcknowledgementAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  envelopeKind: 'success',
  messageKey: 'mods.ui.ipc.result.install.success',
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  deliveryEnvelope: {
    formatVersion: 1,
    kind: 'success',
    commandId: 'install',
    packageId,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    messageKey: 'mods.ui.ipc.result.install.success',
    recovery: 'none',
    retryable: false,
    rollbackRequired: false,
    summary,
    diagnostics: []
  },
  checks: [],
  diagnostics: [],
  startupStages: [
    {
      id: 'response-delivery-orchestration-consumed',
      status: 'satisfied',
      requirementIds: ['startup-gate-contract', 'no-startup-side-effect-guard'],
      reason: 'Response delivery orchestration is consistent enough to describe startup handoff requirements.'
    },
    {
      id: 'persistent-install-state-read',
      status: 'deferred',
      requirementIds: ['persistent-install-state-source'],
      reason: 'Persistent package, settings, lockfile and transaction-log reads remain deferred.'
    }
  ],
  startupRequirements: [
    {
      id: 'startup-gate-contract',
      status: 'required',
      reason: 'Define the explicit startup gate contract.'
    },
    {
      id: 'launcher-app-boundary',
      status: 'required',
      reason: 'Launcher startup must stay separate from pure domain response orchestration.'
    },
    {
      id: 'persistent-install-state-source',
      status: 'required',
      reason: 'A later startup gate must read verified persistent install state.'
    },
    {
      id: 'live-registry-identity-source',
      status: 'required',
      reason: 'GameApp creation must wait until live registry identity matches persistent state.'
    },
    {
      id: 'save-cache-isolation-source',
      status: 'required',
      reason: 'Startup handoff must prove player saves and official cache state remain isolated.'
    },
    {
      id: 'game-app-creation-gate',
      status: 'required',
      reason: 'Pinia, router and GameApp creation must remain behind one gate.'
    },
    {
      id: 'startup-failure-reporting',
      status: 'required',
      reason: 'Startup failure reporting must use redacted diagnostics.'
    },
    {
      id: 'no-startup-side-effect-guard',
      status: 'required',
      reason: 'This preflight must not mount UI, read saves or write persistent data.'
    }
  ],
  summary,
  effects: sourceEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentReadsOrWrites = (
  result: ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  prepared: boolean
): void => {
  expect(result.persistentStartupReadAllowed).toBe(false)
  expect(result.transactionLogReadAllowed).toBe(false)
  expect(result.packageStateReadAllowed).toBe(false)
  expect(result.settingsReadAllowed).toBe(false)
  expect(result.lockfileReadAllowed).toBe(false)
  expect(result.liveRegistryReadAllowed).toBe(false)
  expect(result.saveReadAllowed).toBe(false)
  expect(result.saveCacheIsolationCheckAllowed).toBe(false)
  expect(result.startupFailureReportingAllowed).toBe(false)
  expect(result.launcherAppAllowed).toBe(false)
  expect(result.gameAppCreationAllowed).toBe(false)
  expect(result.piniaCreationAllowed).toBe(false)
  expect(result.routerMountAllowed).toBe(false)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.startupGateHandoffConsumed).toBe(prepared)
  expect(result.effects.persistentStateSourcePrepared).toBe(prepared)
  const {
    startupGateHandoffConsumed: _startupGateHandoffConsumed,
    persistentStateSourcePrepared: _persistentStateSourcePrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party startup gate persistent state preflight', () => {
  it('prepares path-free persistent startup state source requirements without reads or writes', () => {
    const result = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
      startupGateHandoffPreflight: createSource()
    })

    expect(result.status).toBe('deferred')
    expect(result.startupGatePersistentStatePreflight).toBe('deferred')
    expect(result.startupGateHandoffPreflightStatus).toBe('deferred')
    expect(result.startupGateHandoffConsumed).toBe(true)
    expect(result.persistentStateSourcePrepared).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.persistentStateStages.map(stage => [stage.id, stage.status])).toEqual([
      ['startup-gate-handoff-consumed', 'satisfied'],
      ['persistent-state-source-contract', 'satisfied'],
      ['transaction-log-state-read', 'deferred'],
      ['package-state-read', 'deferred'],
      ['settings-state-read', 'deferred'],
      ['mod-lock-state-read', 'deferred'],
      ['live-registry-identity-read', 'deferred'],
      ['save-cache-isolation-read', 'deferred'],
      ['startup-failure-reporting', 'deferred'],
      ['launcher-gameapp-gate', 'deferred']
    ])
    expect(result.persistentStateRequirements.map(requirement => requirement.id)).toEqual([
      'committed-transaction-log-source',
      'package-state-source',
      'settings-state-source',
      'mod-lock-state-source',
      'live-registry-identity-source',
      'save-cache-isolation-source',
      'startup-failure-reporting-source',
      'no-startup-read-write-side-effect-guard'
    ])
    expect(result.effects).toEqual(expectedEffects)
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('deliveryEnvelope' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks non-ready startup handoff states while stripping path-bearing diagnostics', () => {
    const skipped = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
      startupGateHandoffPreflight: createSource({
        status: 'skipped',
        reason: 'no selected third-party data packs',
        startupGateHandoffPreflight: 'skipped',
        startupGateHandoffPrepared: false,
        responseDeliveryOrchestrationConsumed: false,
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        targetPackageId: undefined,
        candidateIdentity: undefined,
        lockfileHash: undefined
      })
    })
    const blocked = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
      startupGateHandoffPreflight: createSource({
        status: 'blocked',
        reason: 'startup handoff blocked before persistent state preflight',
        startupGateHandoffPreflight: 'blocked',
        startupGateHandoffPrepared: false,
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.startup-gate-persistent-state.blocked-source',
            severity: 'error',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/startup.json',
            fieldPath: '/startup/C:/Users/LENOVO',
            details: {
              hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack'
            },
            recovery: 'retry'
          })
        ] as never
      })
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.persistentStateRequirements).toEqual([])
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.reason).toBe('startup handoff blocked before persistent state preflight')
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.startup-gate-persistent-state.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoPersistentReadsOrWrites(skipped, false)
    expectNoPersistentReadsOrWrites(blocked, false)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks missing identities, missing requirements and startup read/write drift before source contract preparation', () => {
    let effectGetterRead = false
    const hostileEffects = {
      ...sourceEffects
    }
    Object.defineProperty(hostileEffects, 'lockfileRead', {
      enumerable: true,
      get() {
        effectGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/startup-persistent-state-effect-getter')
      }
    })
    const cases = [
      {
        label: 'unprepared startup handoff',
        source: createSource({ startupGateHandoffPrepared: false }),
        blockedCheckId: 'startup-gate-handoff-prepared'
      },
      {
        label: 'missing target',
        source: createSource({ targetPackageId: undefined }),
        blockedCheckId: 'install-target-present'
      },
      {
        label: 'missing candidate identity',
        source: createSource({ candidateIdentity: undefined }),
        blockedCheckId: 'candidate-identity-present'
      },
      {
        label: 'missing lockfile hash',
        source: createSource({ lockfileHash: undefined }),
        blockedCheckId: 'lockfile-hash-present'
      },
      {
        label: 'missing persistent startup requirements',
        source: createSource({ startupRequirements: [] }),
        blockedCheckId: 'persistent-state-requirements-present'
      },
      {
        label: 'save read already allowed',
        source: createSource({ saveReadAllowed: true as never }),
        blockedCheckId: 'startup-read-boundaries-deferred'
      },
      {
        label: 'effect accessor drift',
        source: createSource({ effects: hostileEffects as never }),
        blockedCheckId: 'no-startup-read-write-effects'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
        startupGateHandoffPreflight: currentCase.source
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('startup gate persistent state preflight inputs are inconsistent')
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.startup-gate-persistent-state-preflight.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
    expect(effectGetterRead).toBe(false)
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths or getters', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/startup-persistent-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const unsafeDiagnostic = {}
    Object.defineProperties(unsafeDiagnostic, {
      code: {
        enumerable: true,
        get: () => {
          throw new Error('C:/Users/LENOVO/mods/startup-persistent-diagnostic-code')
        }
      },
      messageKey: {
        enumerable: true,
        get: () => {
          throw new Error('startup-persistent-hostile-fragment')
        }
      }
    })

    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([unsafeDiagnostic], 'diagnostics')
    const result = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
      startupGateHandoffPreflight: createSource({
        selectedPackageIds,
        blockedPackageIds,
        loadOrder,
        diagnostics: diagnostics as never
      })
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.startup-gate-persistent-state-preflight.diagnostic-copy'
      })
    ])
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('startup-persistent-hostile-fragment')
    expect(serialized).not.toContain('startup-persistent-selected-package-ids')
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })
})
