import {
  executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter,
  type ExecuteThirdPartyDataPackAtomicTransactionCommitExecutorAdapterOptions
} from './thirdPartyDataPackAtomicTransactionCommitExecutorAdapter'
import {
  buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import {
  createThirdPartyDataPackAtomicTransactionCommitExecutorSource,
  type CreateThirdPartyDataPackAtomicTransactionCommitExecutorSourceOptions,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorSource'
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

export interface CreateThirdPartyDataPackAtomicTransactionCommitExecutorPipelineOptions {
  readonly enabled?: boolean
  readonly readTransactionCommandDispatcherHandoff?: () => Awaitable<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult>
  readonly readInstallTransactionDispatchPlan?: () => Awaitable<ThirdPartyDataPackInstallTransactionDispatchPlanResult>
  readonly readRuntimePublicationCommitAdapter?: () => Awaitable<ThirdPartyDataPackRuntimePublicationCommitAdapterResult>
  readonly executeInjectedAtomicTransactionCommit?: ExecuteThirdPartyDataPackAtomicTransactionCommitExecutorAdapterOptions['host']
  readonly executeAtomicTransactionCommit?: CreateThirdPartyDataPackAtomicTransactionCommitExecutorSourceOptions['executeAtomicTransactionCommit']
}

export const createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline = (
  options: CreateThirdPartyDataPackAtomicTransactionCommitExecutorPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult>) => {
  const readAtomicTransactionCommitExecutorAdapter = async() => {
    if (
      options.readTransactionCommandDispatcherHandoff === undefined
      || options.readInstallTransactionDispatchPlan === undefined
      || options.readRuntimePublicationCommitAdapter === undefined
    ) {
      throw new Error('third-party atomic transaction commit executor pipeline missing upstream readers')
    }

    const transactionCommandDispatcherHandoff = await options.readTransactionCommandDispatcherHandoff()
    const installTransactionDispatchPlan = await options.readInstallTransactionDispatchPlan()
    const runtimePublicationCommitAdapter = await options.readRuntimePublicationCommitAdapter()
    const preflight = buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
      transactionCommandDispatcherHandoff,
      installTransactionDispatchPlan,
      runtimePublicationCommitAdapter
    })

    return executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight,
      host: options.executeInjectedAtomicTransactionCommit
    })
  }

  return createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
    enabled: options.enabled,
    readAtomicTransactionCommitExecutorAdapter,
    executeAtomicTransactionCommit: options.executeAtomicTransactionCommit
  })
}

export const thirdPartyDataPackAtomicTransactionCommitExecutorPipeline =
  createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline()
