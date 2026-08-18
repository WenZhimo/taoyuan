import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  deliverThirdPartyDataPackAndroidResponseDeliverySinkAdapter
} from '@/domain/mods/thirdPartyDataPackAndroidResponseDeliverySinkAdapter'
import {
  deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter
} from '@/domain/mods/thirdPartyDataPackElectronResponseDeliverySinkAdapter'
import {
  createThirdPartyDataPackInMemoryAndroidResponseDeliveryHost,
  createThirdPartyDataPackInMemoryElectronResponseDeliveryHost,
  createThirdPartyDataPackInMemoryWebResponseDeliveryHost,
  type ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHost
} from '@/domain/mods/thirdPartyDataPackInMemoryUiIpcResponseDeliveryHost'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight,
  type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract,
  type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  deliverThirdPartyDataPackWebResponseDeliverySinkAdapter
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliverySinkAdapter'

const packageId = 'sample_pack' as PackageId
const alternatePackageId = 'alternate_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const sourceEffects: ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary = {
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
  effects: sourceEffects,
  ...overrides
})

const createResponseDeliveryPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult =>
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
    envelopeContract: createEnvelopeContract(overrides)
  })

const createPlatformSplitContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult =>
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
    responseDeliveryPreflight: createResponseDeliveryPreflight(overrides)
  })

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectHostRecord = (
  host: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHost,
  platform: 'electron' | 'web' | 'android',
  channel: 'electron-preload-response-channel' | 'web-ui-response-event-sink' | 'android-native-response-event-sink'
): void => {
  expect(host.channel).toBe(channel)
  expect(Object.isFrozen(host)).toBe(true)
  const records = host.getDeliveryRecords()
  expect(records).toEqual([
    {
      sequence: 1,
      platform,
      channel,
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      retryable: false,
      rollbackRequired: false,
      summary,
      diagnosticCount: 0
    }
  ])
  const [record] = records
  expect(record).toBeDefined()
  expect(host.getLastDeliveryRecord()).toEqual(record)
  expect('deliveryEnvelope' in record!).toBe(false)
  expect('platformSplitContract' in record!).toBe(false)
  expect('electronHost' in record!).toBe(false)
  expect('webHost' in record!).toBe(false)
  expect('androidHost' in record!).toBe(false)
  expectJsonGraphFrozen(records)

  host.clearDeliveryRecords()
  expect(host.getDeliveryRecords()).toEqual([])
  expect(host.getLastDeliveryRecord()).toBeUndefined()
}

describe('third-party in-memory UI/IPC response delivery host', () => {
  it('acts as a fixed-channel real host for Electron, Web and Android sink adapters', async () => {
    const electronHost = createThirdPartyDataPackInMemoryElectronResponseDeliveryHost()
    const electronResult = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: createPlatformSplitContract(),
      host: electronHost
    })
    expect(electronResult.status).toBe('delivered')
    expect(electronResult.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'electron-preload-response-channel',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expectHostRecord(electronHost, 'electron', 'electron-preload-response-channel')

    const webHost = createThirdPartyDataPackInMemoryWebResponseDeliveryHost()
    const webResult = await deliverThirdPartyDataPackWebResponseDeliverySinkAdapter({
      platformSplitContract: createPlatformSplitContract(),
      host: webHost
    })
    expect(webResult.status).toBe('delivered')
    expect(webResult.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'web-ui-response-event-sink',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expectHostRecord(webHost, 'web', 'web-ui-response-event-sink')

    const androidHost = createThirdPartyDataPackInMemoryAndroidResponseDeliveryHost()
    const androidResult = await deliverThirdPartyDataPackAndroidResponseDeliverySinkAdapter({
      platformSplitContract: createPlatformSplitContract(),
      host: androidHost
    })
    expect(androidResult.status).toBe('delivered')
    expect(androidResult.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'android-native-response-event-sink',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expectHostRecord(androidHost, 'android', 'android-native-response-event-sink')
  })

  it('rejects direct unsafe or unfrozen envelopes without storing raw host or path data', () => {
    const source = createPlatformSplitContract()
    const host = createThirdPartyDataPackInMemoryWebResponseDeliveryHost()
    const unfrozenEnvelope = {
      ...source.deliveryEnvelope!
    } as ThirdPartyDataPackUiIpcResultEnvelope
    const unfrozenAcknowledgement = host.deliver(unfrozenEnvelope)
    const pathBearingEnvelope = Object.freeze({
      ...source.deliveryEnvelope!,
      window: {
        location: 'C:/Users/LENOVO/taoyuan/private-window'
      }
    }) as unknown as ThirdPartyDataPackUiIpcResultEnvelope
    const pathBearingAcknowledgement = host.deliver(pathBearingEnvelope)

    expect(unfrozenAcknowledgement).toEqual({
      status: 'rejected',
      channel: 'web-ui-response-event-sink',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.response.delivery.rejected'
    })
    expect(pathBearingAcknowledgement).toEqual(unfrozenAcknowledgement)
    expect(host.getDeliveryRecords()).toEqual([])
    expect(JSON.stringify(unfrozenAcknowledgement)).not.toContain('C:/Users')
    expect(JSON.stringify(pathBearingAcknowledgement)).not.toContain('LENOVO')
    expect(JSON.stringify(host.getDeliveryRecords())).not.toContain('private-window')
  })

  it('lets existing sink adapters block rejected host acknowledgements without recording delivery', async () => {
    const source = createPlatformSplitContract()
    const host = createThirdPartyDataPackInMemoryElectronResponseDeliveryHost({
      expectedPackageId: alternatePackageId
    })

    const result = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('Electron response delivery sink host returned an invalid acknowledgement')
    expect(result.electronResponseDeliveryAttempted).toBe(true)
    expect(result.electronResponseDelivered).toBe(false)
    expect(result.acknowledgement).toBeUndefined()
    expect(host.getDeliveryRecords()).toEqual([])
    expect(JSON.stringify(result)).not.toContain(alternatePackageId)
    expectJsonGraphFrozen(result)
  })
})
