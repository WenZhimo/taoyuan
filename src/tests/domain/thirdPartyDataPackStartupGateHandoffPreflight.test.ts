import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackStartupGateHandoffPreflight,
  type ThirdPartyDataPackStartupGateHandoffEffectSummary,
  type ThirdPartyDataPackStartupGateHandoffPreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGateHandoffPreflight'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary,
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff'

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

const sourceEffects: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
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
  uiIpcOutcomeConsumed: true,
  resultEnvelopeNormalized: true,
  responseDeliveryPreflightPrepared: true,
  platformSplitPrepared: true
}

const expectedEffects: ThirdPartyDataPackStartupGateHandoffEffectSummary = {
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

const createSource = (
  overrides: Partial<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult => ({
  status: 'deferred',
  resultNormalizationPreflightStatus: 'deferred',
  postCommitVerificationUiIpcOutcomeHandoffStatus: 'ready',
  resultEnvelopeContractStatus: 'ready',
  responseDeliveryPreflightStatus: 'deferred',
  platformSplitContractStatus: 'deferred',
  reason: 'UI/IPC result envelope and platform response delivery orchestration is prepared; real platform sinks and startup handoff remain separate',
  uiIpcResponseDeliveryOrchestrationHandoff: 'deferred',
  readOnly: true,
  orchestrationPrepared: true,
  envelopeNormalized: true,
  deliveryEnvelopePrepared: true,
  platformSplitPrepared: true,
  uiIpcResponseDeliveryAllowed: false,
  electronIpcAllowed: false,
  electronResponseDeliveryAllowed: false,
  webUiBridgeAllowed: false,
  webResponseDeliveryAllowed: false,
  androidUiBridgeAllowed: false,
  androidResponseDeliveryAllowed: false,
  startupGateHandoffAllowed: false,
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
  orchestrationStages: [
    {
      id: 'response-delivery-orchestration-inspection',
      status: 'satisfied',
      requirementIds: ['path-free-outcome-source', 'no-delivery-side-effect-guard'],
      reason: 'Response delivery orchestration inspected.'
    },
    {
      id: 'startup-gate-handoff',
      status: 'deferred',
      requirementIds: ['startup-gate-result-handoff'],
      reason: 'Startup gate result handoff remains deferred.'
    }
  ],
  orchestrationRequirements: [
    {
      id: 'startup-gate-result-handoff',
      status: 'required',
      reason: 'Startup handoff must remain explicit.'
    }
  ],
  platformAdapters: [
    {
      platform: 'electron',
      status: 'deferred',
      stageId: 'electron-response-delivery-adapter',
      transport: 'electron-preload-response-channel',
      requirementIds: ['electron-preload-response-channel', 'delivery-acknowledgement-source'],
      targetPackageId: packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      reason: 'Electron response delivery remains deferred.'
    },
    {
      platform: 'web',
      status: 'deferred',
      stageId: 'web-response-delivery-adapter',
      transport: 'web-ui-response-event-sink',
      requirementIds: ['web-ui-response-event-sink', 'delivery-acknowledgement-source'],
      targetPackageId: packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      reason: 'Web response delivery remains deferred.'
    },
    {
      platform: 'android',
      status: 'deferred',
      stageId: 'android-response-delivery-adapter',
      transport: 'android-native-response-event-sink',
      requirementIds: ['android-native-response-event-sink', 'delivery-acknowledgement-source'],
      targetPackageId: packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      reason: 'Android response delivery remains deferred.'
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

const expectNoStartupEffects = (
  result: ThirdPartyDataPackStartupGateHandoffPreflightResult,
  prepared: boolean
): void => {
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.launcherAppAllowed).toBe(false)
  expect(result.gameAppCreationAllowed).toBe(false)
  expect(result.piniaCreationAllowed).toBe(false)
  expect(result.routerMountAllowed).toBe(false)
  expect(result.saveReadAllowed).toBe(false)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.deliveryAcknowledgementAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.responseDeliveryOrchestrationConsumed).toBe(prepared)
  expect(result.effects.startupGateHandoffPrepared).toBe(prepared)
  const {
    responseDeliveryOrchestrationConsumed: _responseDeliveryOrchestrationConsumed,
    startupGateHandoffPrepared: _startupGateHandoffPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party startup gate handoff preflight', () => {
  it('prepares startup handoff requirements from response delivery orchestration without startup effects', () => {
    const result = buildThirdPartyDataPackStartupGateHandoffPreflight({
      responseDeliveryOrchestrationHandoff: createSource()
    })

    expect(result.status).toBe('deferred')
    expect(result.startupGateHandoffPreflight).toBe('deferred')
    expect(result.responseDeliveryOrchestrationStatus).toBe('deferred')
    expect(result.startupGateHandoffPrepared).toBe(true)
    expect(result.responseDeliveryOrchestrationConsumed).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.deliveryEnvelope?.packageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.startupStages.map(stage => [stage.id, stage.status])).toEqual([
      ['response-delivery-orchestration-consumed', 'satisfied'],
      ['startup-gate-preflight', 'satisfied'],
      ['launcher-startup-boundary', 'deferred'],
      ['persistent-install-state-read', 'deferred'],
      ['live-registry-identity-gate', 'deferred'],
      ['save-open-protection', 'deferred'],
      ['game-app-creation', 'deferred']
    ])
    expect(result.startupRequirements.map(requirement => requirement.id)).toEqual([
      'startup-gate-contract',
      'launcher-app-boundary',
      'persistent-install-state-source',
      'live-registry-identity-source',
      'save-cache-isolation-source',
      'game-app-creation-gate',
      'startup-failure-reporting',
      'no-startup-side-effect-guard'
    ])
    expect('responseDeliveryOrchestrationHandoff' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expect(result.effects).toEqual(expectedEffects)
    expectNoStartupEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks when response delivery orchestration has no startup-ready state', () => {
    const skipped = buildThirdPartyDataPackStartupGateHandoffPreflight({
      responseDeliveryOrchestrationHandoff: createSource({
        status: 'skipped',
        reason: 'no selected third-party data packs',
        uiIpcResponseDeliveryOrchestrationHandoff: 'skipped',
        orchestrationPrepared: false,
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        targetPackageId: undefined,
        candidateIdentity: undefined,
        lockfileHash: undefined,
        deliveryEnvelope: undefined
      })
    })
    const blocked = buildThirdPartyDataPackStartupGateHandoffPreflight({
      responseDeliveryOrchestrationHandoff: createSource({
        status: 'blocked',
        reason: 'response delivery orchestration blocked before startup handoff',
        uiIpcResponseDeliveryOrchestrationHandoff: 'blocked',
        orchestrationPrepared: false,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.startup-gate.path-strip-test',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/manifest.json',
            recovery: 'retry'
          }
        ] as never
      })
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.startupRequirements).toEqual([])
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.reason).toBe('response delivery orchestration blocked before startup handoff')
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.startup-gate.path-strip-test',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expectNoStartupEffects(skipped, false)
    expectNoStartupEffects(blocked, false)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks orchestration, target, startup deferral and effect drift before startup handoff', () => {
    const cases = [
      {
        label: 'unprepared orchestration',
        source: createSource({ orchestrationPrepared: false }),
        blockedCheckId: 'orchestration-prepared'
      },
      {
        label: 'missing envelope',
        source: createSource({ deliveryEnvelope: undefined }),
        blockedCheckId: 'path-free-delivery-envelope-present'
      },
      {
        label: 'platform split missing',
        source: createSource({ platformSplitPrepared: false }),
        blockedCheckId: 'platform-split-prepared'
      },
      {
        label: 'startup stage missing',
        source: createSource({ orchestrationStages: [] }),
        blockedCheckId: 'startup-gate-explicitly-deferred'
      },
      {
        label: 'target drift',
        source: createSource({
          targetPackageId: blockedPackageId,
          selectedPackageIds: [blockedPackageId]
        }),
        blockedCheckId: 'target-package-selected'
      },
      {
        label: 'response already delivered',
        source: createSource({
          effects: {
            ...sourceEffects,
            uiIpcResponseDelivered: true
          } as never
        }),
        blockedCheckId: 'no-response-delivery-effects'
      },
      {
        label: 'startup already allowed',
        source: createSource({ startupGateHandoffAllowed: true as never }),
        blockedCheckId: 'startup-gate-explicitly-deferred'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackStartupGateHandoffPreflight({
        responseDeliveryOrchestrationHandoff: currentCase.source
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('startup gate handoff preflight inputs are inconsistent')
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.startup-gate-handoff-preflight.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(result.startupRequirements).toEqual([])
      expectNoStartupEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package summaries and diagnostics without reading hostile getters', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/startup-gate-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const unsafeDiagnostic = {}
    Object.defineProperties(unsafeDiagnostic, {
      code: {
        enumerable: true,
        get: () => {
          throw new Error('C:/Users/LENOVO/mods/startup-gate-diagnostic-code')
        }
      },
      messageKey: {
        enumerable: true,
        get: () => {
          throw new Error('startup-gate-hostile-fragment')
        }
      }
    })

    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([unsafeDiagnostic], 'diagnostics')
    const result = buildThirdPartyDataPackStartupGateHandoffPreflight({
      responseDeliveryOrchestrationHandoff: createSource({
        selectedPackageIds,
        blockedPackageIds,
        loadOrder,
        diagnostics: diagnostics as never,
        deliveryEnvelope: {
          ...createSource().deliveryEnvelope!,
          diagnostics: diagnostics as never
        }
      })
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics.length).toBeGreaterThan(0)
    expect(result.diagnostics.every(diagnostic => diagnostic.code === 'LIFECYCLE-TRANSACTION-001')).toBe(true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('startup-gate-hostile-fragment')
    expect(serialized).not.toContain('startup-gate-selected-package-ids')
    expectNoStartupEffects(result, true)
    expectJsonGraphFrozen(result)
  })
})
