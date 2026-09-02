import {
  thirdPartyDataPackElectronResponseDeliveryIpcChannel,
  type ThirdPartyDataPackElectronIpcResponseDeliveryBridge
} from './thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import {
  createThirdPartyDataPackWebDomResponseDeliverySinkHost
} from './thirdPartyDataPackWebDomResponseDeliveryBridge'
import {
  createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline,
  type ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
} from './thirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from './thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from './thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from './thirdPartyDataPackUiIpcResultNormalizationPreflight'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly platform?: ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
  readonly runtimeHost?: unknown
  readonly resolveRuntimeHost?: () => unknown
  readonly readResultNormalizationPreflight?: () =>
    Awaitable<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult>
  readonly readPostCommitVerificationUiIpcOutcomeHandoff?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>
  readonly webEventName?: string
}

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor ? descriptor.value : undefined
}

const acknowledgementMatchesEnvelope = (
  acknowledgement: unknown,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope
): boolean => {
  if (acknowledgement === null || typeof acknowledgement !== 'object') return false
  return readOwnDataField(acknowledgement, 'status') === 'acknowledged'
    && readOwnDataField(acknowledgement, 'packageId') === envelope.packageId
    && readOwnDataField(acknowledgement, 'envelopeKind') === envelope.kind
    && readOwnDataField(acknowledgement, 'messageKey') === envelope.messageKey
}

const createElectronBridgeFromRuntimeHost = (
  runtimeHost: unknown,
  localRendererTarget?: EventTarget,
  webEventName?: string
): ThirdPartyDataPackElectronIpcResponseDeliveryBridge | undefined => {
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  const deliverThirdPartyDataPackResponse = readOwnDataField(
    electronApi,
    'deliverThirdPartyDataPackResponse'
  )
  if (typeof deliverThirdPartyDataPackResponse !== 'function') return undefined

  return Object.freeze({
    invoke: async(
      channel: typeof thirdPartyDataPackElectronResponseDeliveryIpcChannel,
      envelope: ThirdPartyDataPackUiIpcResultEnvelope
    ) => {
      if (channel !== thirdPartyDataPackElectronResponseDeliveryIpcChannel) return undefined
      const acknowledgement = await deliverThirdPartyDataPackResponse(envelope)
      if (localRendererTarget !== undefined && acknowledgementMatchesEnvelope(acknowledgement, envelope)) {
        await createThirdPartyDataPackWebDomResponseDeliverySinkHost({
          target: localRendererTarget,
          eventName: webEventName
        }).deliver(envelope)
      }
      return acknowledgement
    }
  })
}

const webTargetFromRuntimeHost = (
  runtimeHost: unknown
): EventTarget | undefined => {
  if (typeof EventTarget !== 'undefined' && runtimeHost instanceof EventTarget) return runtimeHost
  if (runtimeHost === null || typeof runtimeHost !== 'object') return undefined

  try {
    const candidate = runtimeHost as Partial<EventTarget>
    return typeof candidate.addEventListener === 'function'
      && typeof candidate.removeEventListener === 'function'
      && typeof candidate.dispatchEvent === 'function'
      ? candidate as EventTarget
      : undefined
  } catch {
    return undefined
  }
}

const resolveRuntimeHost = (
  options: CreateThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipelineOptions
): unknown => {
  if ('runtimeHost' in options) return options.runtimeHost
  if (options.resolveRuntimeHost !== undefined) {
    try {
      return options.resolveRuntimeHost()
    } catch {
      return undefined
    }
  }
  return typeof window === 'undefined' ? undefined : window
}

export const createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline = (
  options: CreateThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>) => async() => {
  if (options.enabled !== true) {
    return await createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: false,
      platform: options.platform,
      readResultNormalizationPreflight: options.readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff: options.readPostCommitVerificationUiIpcOutcomeHandoff,
      webEventName: options.webEventName
    })()
  }

  const runtimeHost = resolveRuntimeHost(options)
  const webTarget = webTargetFromRuntimeHost(runtimeHost)
  const electronBridge = createElectronBridgeFromRuntimeHost(
    runtimeHost,
    webTarget,
    options.webEventName
  )
  const selectedPlatform = options.platform
    ?? (electronBridge !== undefined ? 'electron' : webTarget !== undefined ? 'web' : undefined)

  return await createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline({
    enabled: true,
    platform: selectedPlatform,
    readResultNormalizationPreflight: options.readResultNormalizationPreflight,
    readPostCommitVerificationUiIpcOutcomeHandoff: options.readPostCommitVerificationUiIpcOutcomeHandoff,
    electronBridge: selectedPlatform === 'electron' ? electronBridge : undefined,
    webTarget: selectedPlatform === 'web' ? webTarget : undefined,
    webEventName: options.webEventName
  })()
}

export const thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline =
  createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline()
