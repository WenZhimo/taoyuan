import { TaoyuanModImport } from './androidNativeModImportBridge'
import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement,
  ThirdPartyDataPackAndroidResponseDeliverySinkHost
} from './thirdPartyDataPackAndroidResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export interface AndroidNativeResponseDeliveryPlugin {
  readonly deliverThirdPartyDataPackResponse: (options: {
    readonly envelope: ThirdPartyDataPackUiIpcResultEnvelope
  }) => Promise<unknown>
}

const androidChannel = 'android-native-response-event-sink'
const safeMessageKeyPattern = /^[A-Za-z0-9_.:-]{1,160}$/
const outcomeKinds = new Set<ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind>([
  'success',
  'failure',
  'retry',
  'rollback'
])

const rejectedAcknowledgement: ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement = Object.freeze({
  status: 'rejected',
  channel: androidChannel,
  packageId: 'invalid_package' as PackageId,
  envelopeKind: 'failure',
  messageKey: 'mods.ui.ipc.result.invalid'
})

const readOwnDataField = (
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const isSafeMessageKey = (value: string | undefined): value is string =>
  value !== undefined && safeMessageKeyPattern.test(value)

const responseAcknowledgement = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope,
  status: ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement['status']
): ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement => Object.freeze({
  status,
  channel: androidChannel,
  packageId: envelope.packageId,
  envelopeKind: envelope.kind,
  messageKey: envelope.messageKey
})

const acknowledgementFromRawNativeResult = (
  value: unknown,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const status = readOwnStringField(value, 'status')
  if (status !== 'acknowledged' && status !== 'rejected') return undefined
  if (
    readOwnStringField(value, 'channel') !== androidChannel
    || readOwnStringField(value, 'packageId') !== envelope.packageId
    || readOwnStringField(value, 'envelopeKind') !== envelope.kind
    || readOwnStringField(value, 'messageKey') !== envelope.messageKey
  ) {
    return undefined
  }
  return responseAcknowledgement(envelope, status)
}

export const createThirdPartyDataPackAndroidNativeResponseDeliverySinkHost = (
  plugin: AndroidNativeResponseDeliveryPlugin = TaoyuanModImport as unknown as AndroidNativeResponseDeliveryPlugin
): ThirdPartyDataPackAndroidResponseDeliverySinkHost => Object.freeze({
  channel: androidChannel,
  deliver: async (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => {
    const rawAcknowledgement = await plugin.deliverThirdPartyDataPackResponse({ envelope })
    return acknowledgementFromRawNativeResult(rawAcknowledgement, envelope)
      ?? responseAcknowledgement(envelope, 'rejected')
  }
})

export const acknowledgeThirdPartyDataPackAndroidNativeResponseDeliveryEnvelope = (
  envelope: unknown
): ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement => {
  if (envelope === null || typeof envelope !== 'object') return rejectedAcknowledgement

  const formatVersion = readOwnNumberField(envelope, 'formatVersion')
  const kind = readOwnStringField(envelope, 'kind')
  const commandId = readOwnStringField(envelope, 'commandId')
  const packageId = readOwnStringField(envelope, 'packageId')
  const messageKey = readOwnStringField(envelope, 'messageKey')

  if (
    formatVersion !== 1
    || !outcomeKinds.has(kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)
    || commandId !== 'install'
    || !isPackageId(packageId)
    || !isSafeMessageKey(messageKey)
  ) {
    return rejectedAcknowledgement
  }

  return Object.freeze({
    status: 'acknowledged',
    channel: androidChannel,
    packageId,
    envelopeKind: kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
    messageKey
  })
}
