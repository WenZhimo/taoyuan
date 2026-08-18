import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackStartupGateHandoffPreflight
} from '@/domain/mods/thirdPartyDataPackStartupGateHandoffPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary,
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  deliverThirdPartyDataPackWebResponseDeliverySinkAdapter,
  type ThirdPartyDataPackWebResponseDeliverySinkAdapterResult
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliverySinkAdapter'
import {
  buildThirdPartyDataPackWebResponseDeliveryStartupGateHandoff,
  THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_KIND,
  THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_MODE,
  type ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliveryStartupGateHandoff'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const alternatePackageId = 'alternate_pack' as PackageId
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

const envelopeEffects: ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary = {
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
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
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
  diagnosticsWritten: false
}

const orchestrationEffects: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary = {
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

const createEnvelopeContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResultEnvelopeContractResult => ({
  status: 'ready',
  sourcePreflightStatus: 'deferred',
  reason: 'UI/IPC result envelope contract is ready as a path-free domain source; response delivery remains disabled',
  resultEnvelopeContract: 'ready',
  readOnly: true,
  envelopeNormalized: true,
  uiIpcResponseDeliveryAllowed: false,
  electronIpcAllowed: false,
  webUiBridgeAllowed: false,
  androidUiBridgeAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
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
  checks: [],
  diagnostics: [],
  summary,
  envelope: {
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
  effects: envelopeEffects,
  ...overrides
})

const createPlatformSplit = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
) => buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
  responseDeliveryPreflight: buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
    envelopeContract: createEnvelopeContract(overrides)
  })
})

const createAcknowledgement = (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => ({
  status: 'acknowledged' as const,
  channel: 'web-ui-response-event-sink' as const,
  packageId: envelope.packageId,
  envelopeKind: envelope.kind,
  messageKey: envelope.messageKey
})

const createDeliveredWebResponse = async (): Promise<ThirdPartyDataPackWebResponseDeliverySinkAdapterResult> =>
  deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
    platformSplitContract: createPlatformSplit(),
    host: {
      channel: 'web-ui-response-event-sink',
      deliver: envelope => createAcknowledgement(envelope)
    }
  })

const createStartupSource = (
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
  deliveryEnvelope: createEnvelopeContract().envelope,
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
  effects: orchestrationEffects,
  ...overrides
})

const createStartupPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult> = {}
) => buildThirdPartyDataPackStartupGateHandoffPreflight({
  responseDeliveryOrchestrationHandoff: createStartupSource(overrides)
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoStartupRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult,
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
  expect(result.effects.webResponseDeliveryAcknowledgementConsumed).toBe(prepared)
  expect(result.effects.startupGateHandoffPreflightConsumed).toBe(prepared)
  expect(result.effects.responseDeliveryStartupGateHandoffPrepared).toBe(prepared)

  const {
    webResponseDeliveryAcknowledgementConsumed: _webResponseDeliveryAcknowledgementConsumed,
    startupGateHandoffPreflightConsumed: _startupGateHandoffPreflightConsumed,
    responseDeliveryStartupGateHandoffPrepared: _responseDeliveryStartupGateHandoffPrepared,
    webUiResponsePublished: _webUiResponsePublished,
    successEnvelopeDelivered: _successEnvelopeDelivered,
    failureEnvelopeDelivered: _failureEnvelopeDelivered,
    retryStateDelivered: _retryStateDelivered,
    rollbackStateDelivered: _rollbackStateDelivered,
    uiIpcResponseDelivered: _uiIpcResponseDelivered,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party Web response delivery startup gate handoff', () => {
  it('connects a delivered Web acknowledgement to startup handoff evidence without startup side effects', async () => {
    const result = buildThirdPartyDataPackWebResponseDeliveryStartupGateHandoff({
      webResponseDelivery: await createDeliveredWebResponse(),
      startupGateHandoffPreflight: createStartupPreflight()
    })

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_MODE)
    expect(result.platform).toBe('web')
    expect(result.status).toBe('ready')
    expect(result.webResponseDeliveryStartupGateHandoff).toBe('ready')
    expect(result.webResponseDeliveryStatus).toBe('delivered')
    expect(result.startupGateHandoffPreflightStatus).toBe('deferred')
    expect(result.webResponseDelivered).toBe(true)
    expect(result.deliveryAcknowledgementConsumed).toBe(true)
    expect(result.startupGateHandoffPreflightConsumed).toBe(true)
    expect(result.responseDeliveryStartupGateHandoffPrepared).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.deliveryEnvelope?.packageId).toBe(packageId)
    expect(result.acknowledgement).toEqual(createAcknowledgement(result.deliveryEnvelope!))
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.webUiResponsePublished).toBe(true)
    expect(result.effects.successEnvelopeDelivered).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect('webResponseDelivery' in result).toBe(false)
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('platformSplitContract' in result).toBe(false)
    expect('responseDeliveryOrchestrationHandoff' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoStartupRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks terminal upstream states while stripping path-bearing diagnostics', async () => {
    const skipped = buildThirdPartyDataPackWebResponseDeliveryStartupGateHandoff({
      webResponseDelivery: await deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
        platformSplitContract: createPlatformSplit({
          status: 'skipped',
          reason: 'no selected third-party data packs',
          resultEnvelopeContract: 'skipped',
          envelopeNormalized: false,
          requestedCommandId: undefined,
          targetPackageId: undefined,
          selectedPackageIds: [],
          loadOrder: [],
          registryCount: 54,
          entryCount: 4242,
          packageCount: 0,
          candidateIdentity: undefined,
          lockfileHash: undefined,
          envelope: undefined
        })
      }),
      startupGateHandoffPreflight: createStartupPreflight({
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
    const blocked = buildThirdPartyDataPackWebResponseDeliveryStartupGateHandoff({
      webResponseDelivery: await createDeliveredWebResponse(),
      startupGateHandoffPreflight: createStartupPreflight({
        status: 'blocked',
        reason: 'startup handoff blocked before Web delivery handoff',
        uiIpcResponseDeliveryOrchestrationHandoff: 'blocked',
        orchestrationPrepared: false,
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.web-response-delivery-startup-gate.blocked-source',
            severity: 'error',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/manifest.json',
            details: {
              hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack'
            },
            recovery: 'retry'
          })
        ]
      })
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.webResponseDelivered).toBe(false)
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.webResponseDelivered).toBe(false)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.web-response-delivery-startup-gate.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoStartupRuntimeOrWriteEffects(skipped, false)
    expectNoStartupRuntimeOrWriteEffects(blocked, false)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks acknowledgement, target, package summary and effect drift before startup handoff is marked ready', async () => {
    const delivery = await createDeliveredWebResponse()
    const startup = createStartupPreflight()
    const driftCases = [
      {
        name: 'missing acknowledgement',
        delivery: {
          ...delivery,
          acknowledgement: undefined
        },
        startup,
        blockedCheckId: 'web-delivery-acknowledgement-present'
      },
      {
        name: 'target drift',
        delivery,
        startup: {
          ...startup,
          targetPackageId: alternatePackageId
        },
        blockedCheckId: 'delivery-envelope-consistent'
      },
      {
        name: 'package summary drift',
        delivery,
        startup: {
          ...startup,
          registryCount: 56
        },
        blockedCheckId: 'package-summary-consistent'
      },
      {
        name: 'candidate hash drift',
        delivery,
        startup: {
          ...startup,
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          }
        },
        blockedCheckId: 'candidate-lockfile-consistent'
      },
      {
        name: 'web delivery effect drift',
        delivery: {
          ...delivery,
          effects: {
            ...delivery.effects,
            transactionCommitted: true
          }
        },
        startup,
        blockedCheckId: 'no-startup-runtime-or-write-effects'
      }
    ] as const

    for (const currentCase of driftCases) {
      const result = buildThirdPartyDataPackWebResponseDeliveryStartupGateHandoff({
        webResponseDelivery: currentCase.delivery as ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
        startupGateHandoffPreflight: currentCase.startup
      })

      expect(result.status, currentCase.name).toBe('blocked')
      expect(result.reason).toBe('web response delivery startup handoff inputs are inconsistent')
      expect(result.responseDeliveryStartupGateHandoffPrepared).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: `third-party.web-response-delivery-startup-gate-handoff.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(result.effects.transactionCommitted).toBe(false)
      expectNoStartupRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package summaries and diagnostics without reading hostile accessors', async () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/web-delivery-startup-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/web-delivery-startup-diagnostic')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.web-response-delivery-startup.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const delivery = await createDeliveredWebResponse()

    const result = buildThirdPartyDataPackWebResponseDeliveryStartupGateHandoff({
      webResponseDelivery: {
        ...delivery,
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: createHostileArray([diagnostic], 'diagnostics') as never
      },
      startupGateHandoffPreflight: createStartupPreflight()
    })

    expect(result.status).toBe('blocked')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.web-response-delivery-startup.proxy-test',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('hostPath')
    expect(serialized).not.toContain('web-delivery-startup-selected-package-ids')
    expectNoStartupRuntimeOrWriteEffects(result, false)
    expectJsonGraphFrozen(result)
  })
})
