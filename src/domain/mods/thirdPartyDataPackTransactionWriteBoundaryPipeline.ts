import {
  buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import {
  createThirdPartyDataPackPackageFileStagingSource,
  type CreateThirdPartyDataPackPackageFileStagingSourceOptions
} from './thirdPartyDataPackPackageFileStagingSource'
import {
  createThirdPartyDataPackSettingsLockfileCommitSource,
  type CreateThirdPartyDataPackSettingsLockfileCommitSourceOptions,
  type ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from './thirdPartyDataPackSettingsLockfileCommitSource'
import {
  createThirdPartyDataPackTransactionWriteBoundarySource,
  type CreateThirdPartyDataPackTransactionWriteBoundarySourceOptions
} from './thirdPartyDataPackTransactionWriteBoundarySource'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from './thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from './thirdPartyDataPackTransactionCommandDispatcherHandoff'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackTransactionWriteBoundaryPipelineOptions {
  readonly enabled?: boolean
  readonly readTransactionCommandDispatcherHandoff?: () => Awaitable<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult>
  readonly readInstallTransactionDispatchPlan?: () => Awaitable<ThirdPartyDataPackInstallTransactionDispatchPlanResult>
  readonly readRuntimePublicationCommitAdapter?: () => Awaitable<ThirdPartyDataPackRuntimePublicationCommitAdapterResult>
  readonly executeTransactionWriteBoundary?: CreateThirdPartyDataPackTransactionWriteBoundarySourceOptions['executeTransactionWriteBoundary']
  readonly stagePackageFiles?: CreateThirdPartyDataPackPackageFileStagingSourceOptions['stagePackageFiles']
  readonly commitSettingsLockfile?: CreateThirdPartyDataPackSettingsLockfileCommitSourceOptions['commitSettingsLockfile']
}

export const createThirdPartyDataPackTransactionWriteBoundaryPipeline = (
  options: CreateThirdPartyDataPackTransactionWriteBoundaryPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackSettingsLockfileCommitSourceResult>) => {
  let installTransactionDispatchPlan:
    Promise<ThirdPartyDataPackInstallTransactionDispatchPlanResult>
    | undefined

  const readInstallTransactionDispatchPlanOnce = async() => {
    installTransactionDispatchPlan ??= Promise.resolve().then(() => {
      if (options.readInstallTransactionDispatchPlan === undefined) {
        throw new Error('third-party transaction write boundary pipeline missing install dispatch plan reader')
      }
      return options.readInstallTransactionDispatchPlan()
    })
    return installTransactionDispatchPlan
  }

  const readTransactionWriteBoundarySource = createThirdPartyDataPackTransactionWriteBoundarySource({
    enabled: options.enabled,
    readInstallTransactionDispatchPlan: readInstallTransactionDispatchPlanOnce,
    executeTransactionWriteBoundary: options.executeTransactionWriteBoundary
  })

  const readAtomicCommitPreflight = async() => {
    if (
      options.readTransactionCommandDispatcherHandoff === undefined
      || options.readRuntimePublicationCommitAdapter === undefined
    ) {
      throw new Error('third-party transaction write boundary pipeline missing atomic preflight readers')
    }

    await readTransactionWriteBoundarySource()

    const transactionCommandDispatcherHandoff = await options.readTransactionCommandDispatcherHandoff()
    const installTransactionDispatchPlan = await readInstallTransactionDispatchPlanOnce()
    const runtimePublicationCommitAdapter = await options.readRuntimePublicationCommitAdapter()

    return buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
      transactionCommandDispatcherHandoff,
      installTransactionDispatchPlan,
      runtimePublicationCommitAdapter
    })
  }

  const readPackageFileStagingSource = createThirdPartyDataPackPackageFileStagingSource({
    enabled: options.enabled,
    readAtomicCommitPreflight,
    stagePackageFiles: options.stagePackageFiles
  })

  return createThirdPartyDataPackSettingsLockfileCommitSource({
    enabled: options.enabled,
    readPackageFileStagingSource,
    commitSettingsLockfile: options.commitSettingsLockfile
  })
}

export const thirdPartyDataPackTransactionWriteBoundaryPipeline =
  createThirdPartyDataPackTransactionWriteBoundaryPipeline()
