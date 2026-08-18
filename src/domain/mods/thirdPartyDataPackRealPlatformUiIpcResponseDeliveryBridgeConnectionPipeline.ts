import {
  createThirdPartyDataPackElectronIpcResponseDeliverySinkHost,
  type ThirdPartyDataPackElectronIpcResponseDeliveryBridge
} from './thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import {
  createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline
} from './thirdPartyDataPackElectronUiIpcResponseDeliveryPipeline'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from './thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource,
  type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from './thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from './thirdPartyDataPackUiIpcResultNormalizationPreflight'
import {
  createThirdPartyDataPackWebDomResponseDeliverySinkHost
} from './thirdPartyDataPackWebDomResponseDeliveryBridge'
import {
  createThirdPartyDataPackWebUiIpcResponseDeliveryPipeline
} from './thirdPartyDataPackWebUiIpcResponseDeliveryPipeline'

type Awaitable<T> = T | Promise<T>

export type ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform =
  Extract<ThirdPartyDataPackUiIpcResponseDeliveryPlatformId, 'electron' | 'web'>

export interface CreateThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly platform?: ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
  readonly readResultNormalizationPreflight?: () =>
    Awaitable<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult>
  readonly readPostCommitVerificationUiIpcOutcomeHandoff?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>
  readonly electronBridge?: ThirdPartyDataPackElectronIpcResponseDeliveryBridge
  readonly webTarget?: EventTarget
  readonly webEventName?: string
}

const missingBridgeConvergenceSource = (
  options: {
    readonly enabled?: boolean
    readonly platform?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
  }
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>) =>
  createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
    enabled: options.enabled,
    platform: options.platform
  })

export const createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline = (
  options: CreateThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>) => {
  const selectedPlatform = (
    options as { readonly platform?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId }
  ).platform
  if (selectedPlatform !== 'electron' && selectedPlatform !== 'web') {
    return missingBridgeConvergenceSource({
      enabled: options.enabled,
      platform: selectedPlatform
    })
  }

  const baseOptions = {
    enabled: options.enabled,
    readResultNormalizationPreflight: options.readResultNormalizationPreflight,
    readPostCommitVerificationUiIpcOutcomeHandoff: options.readPostCommitVerificationUiIpcOutcomeHandoff
  }

  switch (selectedPlatform) {
    case 'electron':
      return options.electronBridge === undefined
        ? missingBridgeConvergenceSource({
            enabled: options.enabled,
            platform: selectedPlatform
          })
        : createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline({
            ...baseOptions,
            host: createThirdPartyDataPackElectronIpcResponseDeliverySinkHost(options.electronBridge)
          })
    case 'web':
      return options.webTarget === undefined
        ? missingBridgeConvergenceSource({
            enabled: options.enabled,
            platform: selectedPlatform
          })
        : createThirdPartyDataPackWebUiIpcResponseDeliveryPipeline({
            ...baseOptions,
            host: createThirdPartyDataPackWebDomResponseDeliverySinkHost({
              target: options.webTarget,
              eventName: options.webEventName
            })
          })
  }
}

export const thirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline =
  createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline()
