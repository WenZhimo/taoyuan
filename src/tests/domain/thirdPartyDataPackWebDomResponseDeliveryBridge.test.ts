import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackWebDomResponseDeliverySinkHost,
  thirdPartyDataPackWebResponseDeliveryEventName,
  type ThirdPartyDataPackWebDomResponseDeliveryEvent
} from '@/domain/mods/thirdPartyDataPackWebDomResponseDeliveryBridge'
import {
  deliverThirdPartyDataPackWebResponseDeliverySinkAdapter,
  type ThirdPartyDataPackWebResponseDeliverySinkAdapterResult
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult,
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'

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

const summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const sourceEffects: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitEffectSummary = {
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
  diagnosticsWritten: false
}

const createEnvelope = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelope> = {}
): ThirdPartyDataPackUiIpcResultEnvelope => Object.freeze({
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
  diagnostics: [],
  ...overrides
})

const createPlatformSplitContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult => {
  const deliveryEnvelope = createEnvelope()
  return {
    status: 'deferred',
    sourcePreflightStatus: 'deferred',
    reason: 'UI/IPC response delivery platform split is inspect-only until Electron, Web and Android response sinks are implemented',
    uiIpcResponseDeliveryPlatformSplitContract: 'deferred',
    readOnly: true,
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
    envelopeKind: deliveryEnvelope.kind,
    messageKey: deliveryEnvelope.messageKey,
    selectedPackageIds: [packageId],
    blockedPackageIds: [],
    blockedCandidateCount: 0,
    loadOrder: [packageId],
    registryCount: 55,
    entryCount: 4243,
    packageCount: 1,
    candidateIdentity,
    lockfileHash,
    deliveryEnvelope,
    checks: [],
    diagnostics: [],
    platformAdapters: [
      {
        platform: 'electron',
        status: 'deferred',
        stageId: 'electron-response-delivery-adapter',
        transport: 'electron-preload-response-channel',
        requirementIds: ['electron-preload-response-channel', 'delivery-acknowledgement-source'],
        targetPackageId: packageId,
        envelopeKind: deliveryEnvelope.kind,
        messageKey: deliveryEnvelope.messageKey,
        reason: 'Electron response delivery remains deferred.'
      },
      {
        platform: 'web',
        status: 'deferred',
        stageId: 'web-response-delivery-adapter',
        transport: 'web-ui-response-event-sink',
        requirementIds: ['web-ui-response-event-sink', 'delivery-acknowledgement-source'],
        targetPackageId: packageId,
        envelopeKind: deliveryEnvelope.kind,
        messageKey: deliveryEnvelope.messageKey,
        reason: 'Web response delivery remains deferred.'
      },
      {
        platform: 'android',
        status: 'deferred',
        stageId: 'android-response-delivery-adapter',
        transport: 'android-native-response-event-sink',
        requirementIds: ['android-native-response-event-sink', 'delivery-acknowledgement-source'],
        targetPackageId: packageId,
        envelopeKind: deliveryEnvelope.kind,
        messageKey: deliveryEnvelope.messageKey,
        reason: 'Android response delivery remains deferred.'
      }
    ],
    summary,
    effects: sourceEffects,
    ...overrides
  }
}

const expectNoWritesOrRuntimeEffects = (
  result: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult
): void => {
  const delivered = result.status === 'delivered'
  expect(result.electronIpcAllowed).toBe(false)
  expect(result.electronResponseDeliveryAllowed).toBe(false)
  expect(result.androidUiBridgeAllowed).toBe(false)
  expect(result.androidResponseDeliveryAllowed).toBe(false)
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.webFilePickerOpened).toBe(false)
  expect(result.effects.webUiBridgeOpened).toBe(false)
  expect(result.effects.webUiResponsePublished).toBe(delivered)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party Web DOM response delivery bridge', () => {
  it('delivers a path-free install result through a real EventTarget CustomEvent sink', async () => {
    const source = createPlatformSplitContract()
    const target = new EventTarget()
    const receivedEvents: ThirdPartyDataPackWebDomResponseDeliveryEvent[] = []
    target.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      receivedEvents.push(event as ThirdPartyDataPackWebDomResponseDeliveryEvent)
    })

    const host = createThirdPartyDataPackWebDomResponseDeliverySinkHost({ target })
    const result = await deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host
    })

    expect(Object.isFrozen(host)).toBe(true)
    expect(result.status).toBe('delivered')
    expect(result.webResponseDelivered).toBe(true)
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'web-ui-response-event-sink',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(receivedEvents).toHaveLength(1)
    const [receivedEvent] = receivedEvents
    expect(receivedEvent).toBeDefined()
    if (receivedEvent === undefined) throw new Error('Expected one Web DOM response delivery event')
    expect(receivedEvent.type).toBe(thirdPartyDataPackWebResponseDeliveryEventName)
    expect(receivedEvent.detail).toEqual({
      formatVersion: 1,
      channel: 'web-ui-response-event-sink',
      envelope: result.deliveryEnvelope
    })
    expect(Object.isFrozen(receivedEvent.detail)).toBe(true)
    expect(receivedEvent.detail.envelope).toBe(result.deliveryEnvelope)
    expect(JSON.stringify(receivedEvent.detail)).not.toContain('C:/Users')
    expectNoWritesOrRuntimeEffects(result)
  })

  it('uses a caller-provided safe event name and falls back from unsafe names without leaking them', async () => {
    const source = createPlatformSplitContract()
    const customTarget = new EventTarget()
    const fallbackTarget = new EventTarget()
    let customCount = 0
    let fallbackCount = 0

    customTarget.addEventListener('taoyuan:mods.response', () => {
      customCount += 1
    })
    fallbackTarget.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, () => {
      fallbackCount += 1
    })

    const customResult = await deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: createThirdPartyDataPackWebDomResponseDeliverySinkHost({
        target: customTarget,
        eventName: 'taoyuan:mods.response'
      })
    })
    const fallbackResult = await deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: createThirdPartyDataPackWebDomResponseDeliverySinkHost({
        target: fallbackTarget,
        eventName: 'C:/Users/LENOVO/mods/response'
      })
    })

    expect(customResult.status).toBe('delivered')
    expect(fallbackResult.status).toBe('delivered')
    expect(customCount).toBe(1)
    expect(fallbackCount).toBe(1)
    expect(JSON.stringify(fallbackResult)).not.toContain('C:/Users')
    expect(JSON.stringify(fallbackResult)).not.toContain('LENOVO')
    expectNoWritesOrRuntimeEffects(customResult)
    expectNoWritesOrRuntimeEffects(fallbackResult)
  })

  it('blocks delivery when the Web event is canceled, without publishing runtime or write effects', async () => {
    const target = new EventTarget()
    target.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      event.preventDefault()
    })

    const result = await deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
      platformSplitContract: createPlatformSplitContract(),
      host: createThirdPartyDataPackWebDomResponseDeliverySinkHost({ target })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('Web response delivery sink host returned an invalid acknowledgement')
    expect(result.webResponseDeliveryAttempted).toBe(true)
    expect(result.webResponseDelivered).toBe(false)
    expect(result.acknowledgement).toBeUndefined()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'delivery-acknowledgement-returned',
        status: 'blocked'
      })
    ]))
    expectNoWritesOrRuntimeEffects(result)
  })

  it('strips path-bearing diagnostics before the DOM event detail is dispatched', async () => {
    const target = new EventTarget()
    let eventDetailJson = ''
    target.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      eventDetailJson = JSON.stringify((event as ThirdPartyDataPackWebDomResponseDeliveryEvent).detail)
    })
    const source = createPlatformSplitContract({
      blockedPackageIds: [blockedPackageId],
      diagnostics: [
        createDiagnostic('LIFECYCLE-TRANSACTION-001', {
          stage: 'third-party.web-dom-response-delivery-bridge.source',
          severity: 'warning',
          packageId,
          file: 'C:/Users/LENOVO/private.json',
          fieldPath: '/mods/C:/Users/LENOVO',
          details: {
            hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack'
          },
          recovery: 'retry'
        })
      ],
      deliveryEnvelope: createEnvelope({
        diagnostics: [
          createDiagnostic('CACHE-INVALID-001', {
            stage: 'third-party.web-dom-response-delivery-bridge.envelope',
            severity: 'warning',
            packageId,
            file: 'C:/Users/LENOVO/cache.json',
            details: {
              hostPath: 'C:/Users/LENOVO/taoyuan/userdata'
            },
            recovery: 'retry'
          })
        ],
        summary: {
          ...summary,
          blockedPackageCount: 1,
          diagnosticCount: 1
        }
      })
    })

    const result = await deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: createThirdPartyDataPackWebDomResponseDeliverySinkHost({ target })
    })

    expect(result.status).toBe('delivered')
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.web-dom-response-delivery-bridge.source',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.web-dom-response-delivery-bridge.envelope',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expect(eventDetailJson).not.toContain('C:/Users')
    expect(eventDetailJson).not.toContain('LENOVO')
    expect(eventDetailJson).not.toContain('hostPath')
    expectNoWritesOrRuntimeEffects(result)
  })
})
