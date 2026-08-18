import {
  buildThirdPartyDataPackAppBootstrapWiringPreflight
} from './thirdPartyDataPackAppBootstrapWiringPreflight'
import {
  buildThirdPartyDataPackAppFactoryBindingPreflight
} from './thirdPartyDataPackAppFactoryBindingPreflight'
import {
  createThirdPartyDataPackAppFactoryBindingSource,
  type CreateThirdPartyDataPackAppFactoryBindingSourceOptions
} from './thirdPartyDataPackAppFactoryBindingSource'
import type {
  ThirdPartyDataPackLauncherBoundaryPreflightResult
} from './thirdPartyDataPackLauncherBoundaryPreflight'
import {
  buildThirdPartyDataPackNormalStartupGatePreflight
} from './thirdPartyDataPackNormalStartupGatePreflight'
import {
  createThirdPartyDataPackNormalStartupHandoffExecutionSource,
  type CreateThirdPartyDataPackNormalStartupHandoffExecutionSourceOptions,
  type ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
} from './thirdPartyDataPackNormalStartupHandoffExecutionSource'
import {
  createThirdPartyDataPackStartupGateBootstrapSource
} from './thirdPartyDataPackStartupGateBootstrapSource'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from './thirdPartyDataPackStartupGatePersistentStateSource'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackNormalStartupContinuationPipelineOptions {
  readonly enabled?: boolean
  readonly readLauncherBoundaryPreflight?: () => Awaitable<ThirdPartyDataPackLauncherBoundaryPreflightResult>
  readonly readStartupGatePersistentStateSource?: () =>
    Awaitable<ThirdPartyDataPackStartupGatePersistentStateSourceResult>
  readonly acknowledgeAppFactoryBinding?: CreateThirdPartyDataPackAppFactoryBindingSourceOptions['acknowledgeAppFactoryBinding']
  readonly acknowledgeNormalStartupHandoff?: CreateThirdPartyDataPackNormalStartupHandoffExecutionSourceOptions['acknowledgeNormalStartupHandoff']
}

export const createThirdPartyDataPackNormalStartupContinuationPipeline = (
  options: CreateThirdPartyDataPackNormalStartupContinuationPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult>) => {
  let launcherBoundaryPreflight:
    Promise<ThirdPartyDataPackLauncherBoundaryPreflightResult>
    | undefined
  let normalStartupGatePreflight:
    Promise<ReturnType<typeof buildThirdPartyDataPackNormalStartupGatePreflight>>
    | undefined
  let appBootstrapWiringPreflight:
    Promise<ReturnType<typeof buildThirdPartyDataPackAppBootstrapWiringPreflight>>
    | undefined
  let appFactoryBindingPreflight:
    Promise<ReturnType<typeof buildThirdPartyDataPackAppFactoryBindingPreflight>>
    | undefined
  let appFactoryBindingSource:
    ReturnType<ReturnType<typeof createThirdPartyDataPackAppFactoryBindingSource>>
    | undefined
  let startupGateBootstrapSource:
    ReturnType<ReturnType<typeof createThirdPartyDataPackStartupGateBootstrapSource>>
    | undefined

  const readLauncherBoundaryPreflightOnce = async() => {
    launcherBoundaryPreflight ??= Promise.resolve().then(() => {
      if (options.readLauncherBoundaryPreflight === undefined) {
        throw new Error('third-party normal startup continuation pipeline missing launcher boundary preflight reader')
      }
      return options.readLauncherBoundaryPreflight()
    })
    return launcherBoundaryPreflight
  }

  const readNormalStartupGatePreflightOnce = async() => {
    normalStartupGatePreflight ??= readLauncherBoundaryPreflightOnce()
      .then(launcherBoundaryPreflight =>
        buildThirdPartyDataPackNormalStartupGatePreflight({
          launcherBoundaryPreflight
        })
      )
    return normalStartupGatePreflight
  }

  const readAppBootstrapWiringPreflightOnce = async() => {
    appBootstrapWiringPreflight ??= readNormalStartupGatePreflightOnce()
      .then(normalStartupGatePreflight =>
        buildThirdPartyDataPackAppBootstrapWiringPreflight({
          normalStartupGatePreflight
        })
      )
    return appBootstrapWiringPreflight
  }

  const readAppFactoryBindingPreflightOnce = async() => {
    appFactoryBindingPreflight ??= readAppBootstrapWiringPreflightOnce()
      .then(appBootstrapWiringPreflight =>
        buildThirdPartyDataPackAppFactoryBindingPreflight({
          appBootstrapWiringPreflight
        })
      )
    return appFactoryBindingPreflight
  }

  const readAppFactoryBindingSourceOnce = async() => {
    const source = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: options.enabled,
      readAppFactoryBindingPreflight: readAppFactoryBindingPreflightOnce,
      acknowledgeAppFactoryBinding: options.acknowledgeAppFactoryBinding
    })
    appFactoryBindingSource ??= source()
    return appFactoryBindingSource
  }

  const readStartupGateBootstrapSourceOnce = async() => {
    const source = createThirdPartyDataPackStartupGateBootstrapSource({
      enabled: options.enabled,
      readStartupGatePersistentStateSource: options.readStartupGatePersistentStateSource,
      readAppFactoryBindingSource: readAppFactoryBindingSourceOnce
    })
    startupGateBootstrapSource ??= source()
    return startupGateBootstrapSource
  }

  return createThirdPartyDataPackNormalStartupHandoffExecutionSource({
    enabled: options.enabled,
    readStartupGateBootstrapSource: readStartupGateBootstrapSourceOnce,
    acknowledgeNormalStartupHandoff: options.acknowledgeNormalStartupHandoff
  })
}

export const thirdPartyDataPackNormalStartupContinuationPipeline =
  createThirdPartyDataPackNormalStartupContinuationPipeline()
