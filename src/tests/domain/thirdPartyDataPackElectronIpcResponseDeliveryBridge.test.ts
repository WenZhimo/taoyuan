import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope,
  createThirdPartyDataPackElectronIpcResponseDeliverySinkHost,
  thirdPartyDataPackElectronResponseDeliveryIpcChannel
} from '@/domain/mods/thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import {
  deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter,
  type ThirdPartyDataPackElectronResponseDeliverySinkAdapterResult
} from '@/domain/mods/thirdPartyDataPackElectronResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult,
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'

const packageId = 'sample_pack' as PackageId
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
  result: ThirdPartyDataPackElectronResponseDeliverySinkAdapterResult
): void => {
  expect(result.webUiBridgeAllowed).toBe(false)
  expect(result.webResponseDeliveryAllowed).toBe(false)
  expect(result.androidUiBridgeAllowed).toBe(false)
  expect(result.androidResponseDeliveryAllowed).toBe(false)
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.electronIpcExposed).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.atomicCommitExecutorCalled).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party Electron IPC response delivery bridge', () => {
  it('delivers a path-free install result through the fixed preload/main IPC channel', async () => {
    const source = createPlatformSplitContract()
    const invocations: {
      readonly channel: string
      readonly envelope: ThirdPartyDataPackUiIpcResultEnvelope
    }[] = []
    const host = createThirdPartyDataPackElectronIpcResponseDeliverySinkHost({
      invoke: (channel, envelope) => {
        invocations.push({ channel, envelope })
        return acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope)
      }
    })

    const result = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host
    })

    expect(Object.isFrozen(host)).toBe(true)
    expect(result.status).toBe('delivered')
    expect(result.electronResponseDelivered).toBe(true)
    expect(result.electronIpcAllowed).toBe(true)
    expect(result.electronResponseDeliveryAllowed).toBe(true)
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'electron-preload-response-channel',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(invocations).toHaveLength(1)
    const [invocation] = invocations
    if (invocation === undefined) throw new Error('Expected one Electron response delivery invocation')
    expect(invocation.channel).toBe(thirdPartyDataPackElectronResponseDeliveryIpcChannel)
    expect(invocation.envelope).toBe(result.deliveryEnvelope)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expectNoWritesOrRuntimeEffects(result)
  })

  it('rejects unsafe main-process envelope inputs without reading path-bearing getters', () => {
    let ownPackageGetterRead = false
    const unsafeEnvelope = {
      formatVersion: 1,
      kind: 'success',
      commandId: 'install',
      messageKey: 'mods.ui.ipc.result.install.success'
    }
    Object.defineProperty(unsafeEnvelope, 'packageId', {
      enumerable: true,
      get() {
        ownPackageGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/private-package')
      }
    })

    const acknowledgement = acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(unsafeEnvelope)

    expect(ownPackageGetterRead).toBe(false)
    expect(acknowledgement).toEqual({
      status: 'rejected',
      channel: 'electron-preload-response-channel',
      packageId: 'invalid_package',
      envelopeKind: 'failure',
      messageKey: 'mods.ui.ipc.result.invalid'
    })
    expect(JSON.stringify(acknowledgement)).not.toContain('C:/Users')
    expect(JSON.stringify(acknowledgement)).not.toContain('LENOVO')
  })

  it('blocks rejected or mismatched IPC acknowledgements through the Electron sink adapter', async () => {
    const source = createPlatformSplitContract()
    const rejectedByMain = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: createThirdPartyDataPackElectronIpcResponseDeliverySinkHost({
        invoke: (_channel, envelope) => ({
          ...acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope),
          status: 'rejected' as const
        })
      })
    })
    const pathBearingMainResult = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: createThirdPartyDataPackElectronIpcResponseDeliverySinkHost({
        invoke: (_channel, envelope) => ({
          ...acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope),
          messageKey: 'C:/Users/LENOVO/mods/response'
        })
      })
    })

    expect(rejectedByMain.status).toBe('blocked')
    expect(rejectedByMain.reason).toBe('Electron response delivery sink host returned an invalid acknowledgement')
    expect(rejectedByMain.electronResponseDeliveryAttempted).toBe(true)
    expect(rejectedByMain.electronResponseDelivered).toBe(false)
    expect(pathBearingMainResult.status).toBe('blocked')
    expect(JSON.stringify(pathBearingMainResult)).not.toContain('C:/Users')
    expect(JSON.stringify(pathBearingMainResult)).not.toContain('LENOVO')
    expectNoWritesOrRuntimeEffects(rejectedByMain)
    expectNoWritesOrRuntimeEffects(pathBearingMainResult)
  })

  it('wires Electron preload and main to the shared fixed response delivery channel', () => {
    const preloadSource = readFileSync('electron/preload.js', 'utf8')
    const mainSource = readFileSync('electron/main.js', 'utf8')

    expect(preloadSource).toContain(
      "ipcRenderer.invoke('third-party-data-pack-response-delivery', envelope)"
    )
    expect(preloadSource).toContain('deliverThirdPartyDataPackResponse')
    expect(mainSource).toContain('thirdPartyDataPackElectronResponseDeliveryIpcChannel')
    expect(mainSource).toContain('thirdPartyDataPackResponseDeliveryHandler(envelope)')
    expect(mainSource).not.toContain('third-party-data-pack-response-delivery-log')
    expect(mainSource).not.toContain('third-party-data-pack-response-delivery-write')
  })
})
