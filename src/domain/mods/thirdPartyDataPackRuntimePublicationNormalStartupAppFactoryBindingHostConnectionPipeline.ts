import {
  createThirdPartyDataPackAppFactoryBindingHost,
  type CreateThirdPartyDataPackAppFactoryBindingHostOptions,
  type ThirdPartyDataPackAppFactoryBindingHost
} from './thirdPartyDataPackAppFactoryBindingHost'
import {
  createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline,
  type CreateThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipelineOptions
} from './thirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline'

export interface CreateThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipelineOptions
  extends Omit<
    CreateThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipelineOptions,
    'acknowledgeAppFactoryBinding'
  > {
  readonly appFactoryBindingHost?: ThirdPartyDataPackAppFactoryBindingHost
  readonly appFactoryBindingHostOptions?: CreateThirdPartyDataPackAppFactoryBindingHostOptions
}

export const createThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipelineOptions = {}
) => {
  const appFactoryBindingHost = options.appFactoryBindingHost
    ?? createThirdPartyDataPackAppFactoryBindingHost(options.appFactoryBindingHostOptions)

  return createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline({
    enabled: options.enabled,
    readLauncherBoundaryPreflight: options.readLauncherBoundaryPreflight,
    readStartupGatePersistentStateSource: options.readStartupGatePersistentStateSource,
    readRuntimePublicationLiveRegistrySwap: options.readRuntimePublicationLiveRegistrySwap,
    acknowledgeAppFactoryBinding: appFactoryBindingHost.acknowledgeAppFactoryBinding,
    acknowledgeNormalStartupHandoff: options.acknowledgeNormalStartupHandoff
  })
}

export const thirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipeline =
  createThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipeline()
