import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyDataPackElectronResponseDeliveryAcknowledgement,
  ThirdPartyDataPackElectronResponseDeliverySinkHost
} from './thirdPartyDataPackElectronResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export const thirdPartyDataPackElectronResponseDeliveryIpcChannel =
  'third-party-data-pack-response-delivery'

export interface ThirdPartyDataPackElectronIpcResponseDeliveryBridge {
  readonly invoke: (
    channel: typeof thirdPartyDataPackElectronResponseDeliveryIpcChannel,
    envelope: ThirdPartyDataPackUiIpcResultEnvelope
  ) => unknown | Promise<unknown>
}

const electronChannel = 'electron-preload-response-channel'
const safeMessageKeyPattern = /^[A-Za-z0-9_.:-]{1,160}$/
const outcomeKinds = new Set<ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind>([
  'success',
  'failure',
  'retry',
  'rollback'
])

const rejectedAcknowledgement: ThirdPartyDataPackElectronResponseDeliveryAcknowledgement = Object.freeze({
  status: 'rejected',
  channel: electronChannel,
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
  status: ThirdPartyDataPackElectronResponseDeliveryAcknowledgement['status']
): ThirdPartyDataPackElectronResponseDeliveryAcknowledgement => Object.freeze({
  status,
  channel: electronChannel,
  packageId: envelope.packageId,
  envelopeKind: envelope.kind,
  messageKey: envelope.messageKey
})

const acknowledgementFromRawIpcResult = (
  value: unknown,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackElectronResponseDeliveryAcknowledgement | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const status = readOwnStringField(value, 'status')
  if (status !== 'acknowledged' && status !== 'rejected') return undefined
  if (
    readOwnStringField(value, 'channel') !== electronChannel
    || readOwnStringField(value, 'packageId') !== envelope.packageId
    || readOwnStringField(value, 'envelopeKind') !== envelope.kind
    || readOwnStringField(value, 'messageKey') !== envelope.messageKey
  ) {
    return undefined
  }
  return responseAcknowledgement(envelope, status)
}

export const createThirdPartyDataPackElectronIpcResponseDeliverySinkHost = (
  bridge: ThirdPartyDataPackElectronIpcResponseDeliveryBridge
): ThirdPartyDataPackElectronResponseDeliverySinkHost => Object.freeze({
  channel: electronChannel,
  deliver: async (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => {
    const rawAcknowledgement = await bridge.invoke(
      thirdPartyDataPackElectronResponseDeliveryIpcChannel,
      envelope
    )
    return acknowledgementFromRawIpcResult(rawAcknowledgement, envelope)
      ?? responseAcknowledgement(envelope, 'rejected')
  }
})

export const acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope = (
  envelope: unknown
): ThirdPartyDataPackElectronResponseDeliveryAcknowledgement => {
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
    channel: electronChannel,
    packageId,
    envelopeKind: kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
    messageKey
  })
}

export const createThirdPartyDataPackElectronIpcResponseDeliveryMainHandler = () =>
  acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope
