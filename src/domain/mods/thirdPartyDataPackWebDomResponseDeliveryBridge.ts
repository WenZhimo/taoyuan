import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackWebResponseDeliveryAcknowledgement,
  ThirdPartyDataPackWebResponseDeliverySinkHost
} from './thirdPartyDataPackWebResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export const thirdPartyDataPackWebResponseDeliveryEventName =
  'taoyuan:third-party-data-pack-response-delivery'

export interface ThirdPartyDataPackWebDomResponseDeliveryEventDetail {
  readonly formatVersion: 1
  readonly channel: 'web-ui-response-event-sink'
  readonly envelope: ThirdPartyDataPackUiIpcResultEnvelope
}

export interface ThirdPartyDataPackWebDomResponseDeliverySinkHostOptions {
  readonly target: EventTarget
  readonly eventName?: string
}

const webChannel = 'web-ui-response-event-sink'
const safeEventNamePattern = /^[A-Za-z0-9_.:-]{1,128}$/

const safeEventName = (value: string | undefined): string =>
  value !== undefined && safeEventNamePattern.test(value)
    ? value
    : thirdPartyDataPackWebResponseDeliveryEventName

const responseAcknowledgement = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope,
  acknowledged: boolean
): ThirdPartyDataPackWebResponseDeliveryAcknowledgement => Object.freeze({
  status: acknowledged ? 'acknowledged' : 'rejected',
  channel: webChannel,
  packageId: envelope.packageId,
  envelopeKind: envelope.kind,
  messageKey: envelope.messageKey
})

const createResponseEvent = (
  eventName: string,
  detail: ThirdPartyDataPackWebDomResponseDeliveryEventDetail
): Event => {
  if (typeof CustomEvent === 'function') {
    return new CustomEvent<ThirdPartyDataPackWebDomResponseDeliveryEventDetail>(eventName, {
      bubbles: false,
      cancelable: true,
      composed: false,
      detail
    })
  }

  const event = new Event(eventName, {
    bubbles: false,
    cancelable: true,
    composed: false
  })
  Object.defineProperty(event, 'detail', {
    enumerable: true,
    value: detail
  })
  return event
}

export const createThirdPartyDataPackWebDomResponseDeliverySinkHost = (
  options: ThirdPartyDataPackWebDomResponseDeliverySinkHostOptions
): ThirdPartyDataPackWebResponseDeliverySinkHost => {
  const eventName = safeEventName(options.eventName)
  const host: ThirdPartyDataPackWebResponseDeliverySinkHost = {
    channel: webChannel,
    deliver: envelope => {
      const detail: ThirdPartyDataPackWebDomResponseDeliveryEventDetail = Object.freeze({
        formatVersion: 1,
        channel: webChannel,
        envelope
      })
      const event = createResponseEvent(eventName, detail)
      const acknowledged = options.target.dispatchEvent(event)
      return responseAcknowledgement(envelope, acknowledged)
    }
  }

  return Object.freeze(host)
}

export type ThirdPartyDataPackWebDomResponseDeliveryEvent = CustomEvent<ThirdPartyDataPackWebDomResponseDeliveryEventDetail>
export type ThirdPartyDataPackWebDomResponseDeliveryPackageId = PackageId
export type ThirdPartyDataPackWebDomResponseDeliveryOutcomeKind = ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
