import {
  createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline,
  type CreateThirdPartyDataPackAtomicTransactionCommitExecutorPipelineOptions
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPipeline'
import {
  createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource,
  type ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from './thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from './thirdPartyDataPackInstallTransactionDispatchPlan'
import {
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline,
  type CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions
} from './thirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import {
  createThirdPartyDataPackTransactionCommandDispatcherSource,
  type CreateThirdPartyDataPackTransactionCommandDispatcherSourceOptions
} from './thirdPartyDataPackTransactionCommandDispatcherSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from './thirdPartyDataPackTransactionCommandDispatcherHandoff'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackInstallCommandLifecyclePipelineOptions {
  readonly enabled?: boolean
  readonly readTransactionCommandDispatcherHandoff?: () =>
    Awaitable<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult>
  readonly dispatchTransactionCommand?:
    CreateThirdPartyDataPackTransactionCommandDispatcherSourceOptions['dispatchTransactionCommand']
  readonly readInstallTransactionDispatchPlan?: () =>
    Awaitable<ThirdPartyDataPackInstallTransactionDispatchPlanResult>
  readonly readRuntimePublicationCommitAdapter?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitAdapterResult>
  readonly executeInjectedAtomicTransactionCommit?:
    CreateThirdPartyDataPackAtomicTransactionCommitExecutorPipelineOptions['executeInjectedAtomicTransactionCommit']
  readonly executeAtomicTransactionCommit?:
    CreateThirdPartyDataPackAtomicTransactionCommitExecutorPipelineOptions['executeAtomicTransactionCommit']
  readonly readSettingsLockfileCommitSource?:
    CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions['readSettingsLockfileCommitSource']
  readonly readPostCommitVerificationExecutorAdapter?:
    CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions['readPostCommitVerificationExecutorAdapter']
  readonly readPostCommitPersistentState?:
    CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions['readPostCommitPersistentState']
  readonly executePostCommitVerification?:
    CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions['executePostCommitVerification']
}

export const createThirdPartyDataPackInstallCommandLifecyclePipeline = (
  options: CreateThirdPartyDataPackInstallCommandLifecyclePipelineOptions = {}
): (() => Promise<ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult>) => {
  let transactionCommandDispatcherHandoff:
    Promise<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult>
    | undefined
  let installTransactionDispatchPlan:
    Promise<ThirdPartyDataPackInstallTransactionDispatchPlanResult>
    | undefined
  let runtimePublicationCommitAdapter:
    Promise<ThirdPartyDataPackRuntimePublicationCommitAdapterResult>
    | undefined

  const readTransactionCommandDispatcherHandoffOnce = async() => {
    transactionCommandDispatcherHandoff ??= Promise.resolve().then(() => {
      if (options.readTransactionCommandDispatcherHandoff === undefined) {
        throw new Error('third-party install command lifecycle pipeline missing dispatcher handoff reader')
      }
      return options.readTransactionCommandDispatcherHandoff()
    })
    return transactionCommandDispatcherHandoff
  }

  const readInstallTransactionDispatchPlanOnce = async() => {
    installTransactionDispatchPlan ??= Promise.resolve().then(() => {
      if (options.readInstallTransactionDispatchPlan === undefined) {
        throw new Error('third-party install command lifecycle pipeline missing install dispatch plan reader')
      }
      return options.readInstallTransactionDispatchPlan()
    })
    return installTransactionDispatchPlan
  }

  const readRuntimePublicationCommitAdapterOnce = async() => {
    runtimePublicationCommitAdapter ??= Promise.resolve().then(() => {
      if (options.readRuntimePublicationCommitAdapter === undefined) {
        throw new Error('third-party install command lifecycle pipeline missing runtime publication commit adapter reader')
      }
      return options.readRuntimePublicationCommitAdapter()
    })
    return runtimePublicationCommitAdapter
  }

  const readTransactionCommandDispatcherSource = createThirdPartyDataPackTransactionCommandDispatcherSource({
    enabled: options.enabled,
    readTransactionCommandDispatcherHandoff: readTransactionCommandDispatcherHandoffOnce,
    dispatchTransactionCommand: options.dispatchTransactionCommand
  })

  const readAtomicTransactionCommitExecutorSource = createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline({
    enabled: options.enabled,
    readTransactionCommandDispatcherHandoff: readTransactionCommandDispatcherHandoffOnce,
    readInstallTransactionDispatchPlan: readInstallTransactionDispatchPlanOnce,
    readRuntimePublicationCommitAdapter: readRuntimePublicationCommitAdapterOnce,
    executeInjectedAtomicTransactionCommit: options.executeInjectedAtomicTransactionCommit,
    executeAtomicTransactionCommit: options.executeAtomicTransactionCommit
  })

  const readPostCommitVerificationReadAcknowledgementSource =
    createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline({
      enabled: options.enabled,
      readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
      readPostCommitVerificationExecutorAdapter: options.readPostCommitVerificationExecutorAdapter,
      readPostCommitPersistentState: options.readPostCommitPersistentState,
      executePostCommitVerification: options.executePostCommitVerification
    })

  return createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
    enabled: options.enabled,
    readTransactionCommandDispatcherSource,
    readAtomicTransactionCommitExecutorSource,
    readPostCommitVerificationReadAcknowledgementSource
  })
}

export const thirdPartyDataPackInstallCommandLifecyclePipeline =
  createThirdPartyDataPackInstallCommandLifecyclePipeline()
