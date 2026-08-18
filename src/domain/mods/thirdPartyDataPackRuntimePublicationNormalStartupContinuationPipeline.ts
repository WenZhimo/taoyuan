import type {
  CreateThirdPartyDataPackAppFactoryBindingSourceOptions
} from './thirdPartyDataPackAppFactoryBindingSource'
import type {
  ThirdPartyDataPackLauncherBoundaryPreflightResult
} from './thirdPartyDataPackLauncherBoundaryPreflight'
import {
  createThirdPartyDataPackNormalStartupContinuationPipeline
} from './thirdPartyDataPackNormalStartupContinuationPipeline'
import type {
  CreateThirdPartyDataPackNormalStartupHandoffExecutionSourceOptions,
  ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
} from './thirdPartyDataPackNormalStartupHandoffExecutionSource'
import type {
  ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from './thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource
} from './thirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from './thirdPartyDataPackStartupGatePersistentStateSource'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipelineOptions {
  readonly enabled?: boolean
  readonly readLauncherBoundaryPreflight?: () => Awaitable<ThirdPartyDataPackLauncherBoundaryPreflightResult>
  readonly readStartupGatePersistentStateSource?: () =>
    Awaitable<ThirdPartyDataPackStartupGatePersistentStateSourceResult>
  readonly readRuntimePublicationLiveRegistrySwap?: () =>
    Awaitable<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>
  readonly acknowledgeAppFactoryBinding?: CreateThirdPartyDataPackAppFactoryBindingSourceOptions['acknowledgeAppFactoryBinding']
  readonly acknowledgeNormalStartupHandoff?: CreateThirdPartyDataPackNormalStartupHandoffExecutionSourceOptions['acknowledgeNormalStartupHandoff']
}

export const createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult>) => {
  let runtimePublicationStartupStateConnection:
    ReturnType<ReturnType<typeof createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource>>
    | undefined

  const readRuntimePublicationStartupPersistentStateConnectionOnce = async() => {
    const source = createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource({
      enabled: options.enabled,
      readStartupGatePersistentStateSource: options.readStartupGatePersistentStateSource,
      readRuntimePublicationLiveRegistrySwap: options.readRuntimePublicationLiveRegistrySwap
    })
    runtimePublicationStartupStateConnection ??= source()
    return runtimePublicationStartupStateConnection
  }

  return createThirdPartyDataPackNormalStartupContinuationPipeline({
    enabled: options.enabled,
    readLauncherBoundaryPreflight: options.readLauncherBoundaryPreflight,
    readStartupGatePersistentStateSource: readRuntimePublicationStartupPersistentStateConnectionOnce,
    acknowledgeAppFactoryBinding: options.acknowledgeAppFactoryBinding,
    acknowledgeNormalStartupHandoff: options.acknowledgeNormalStartupHandoff
  })
}

export const thirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline =
  createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline()
