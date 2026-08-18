import {
  createThirdPartyDataPackPostCommitPersistentReadsSource,
  type CreateThirdPartyDataPackPostCommitPersistentReadsSourceOptions,
  type ThirdPartyDataPackPostCommitPersistentReadsSourceResult
} from './thirdPartyDataPackPostCommitPersistentReadsSource'
import {
  createThirdPartyDataPackPostCommitPersistentVerificationReadSource,
  type ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
} from './thirdPartyDataPackPostCommitPersistentVerificationReadSource'
import {
  createThirdPartyDataPackPostCommitVerificationExecutorSource,
  type CreateThirdPartyDataPackPostCommitVerificationExecutorSourceOptions,
  type ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
} from './thirdPartyDataPackPostCommitVerificationExecutorSource'
import {
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource,
  type ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from './thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
} from './thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from './thirdPartyDataPackSettingsLockfileCommitSource'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions {
  readonly enabled?: boolean
  readonly readSettingsLockfileCommitSource?: () => Awaitable<ThirdPartyDataPackSettingsLockfileCommitSourceResult>
  readonly readPostCommitVerificationExecutorAdapter?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult>
  readonly readPostCommitPersistentState?:
    CreateThirdPartyDataPackPostCommitPersistentReadsSourceOptions['readPostCommitPersistentState']
  readonly executePostCommitVerification?:
    CreateThirdPartyDataPackPostCommitVerificationExecutorSourceOptions['executePostCommitVerification']
}

export const createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline = (
  options: CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult>) => {
  let postCommitPersistentReadsSource:
    Promise<ThirdPartyDataPackPostCommitPersistentReadsSourceResult>
    | undefined
  let postCommitPersistentVerificationReadSource:
    Promise<ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult>
    | undefined
  let postCommitVerificationExecutorSource:
    Promise<ThirdPartyDataPackPostCommitVerificationExecutorSourceResult>
    | undefined

  const readPostCommitPersistentReadsSourceOnce = async() => {
    const source = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: options.enabled,
      readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
      readPostCommitPersistentState: options.readPostCommitPersistentState
    })
    postCommitPersistentReadsSource ??= source()
    return postCommitPersistentReadsSource
  }

  const readPostCommitPersistentVerificationReadSourceOnce = async() => {
    const source = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      enabled: options.enabled,
      readPostCommitPersistentReadsSource: readPostCommitPersistentReadsSourceOnce
    })
    postCommitPersistentVerificationReadSource ??= source()
    return postCommitPersistentVerificationReadSource
  }

  const readPostCommitVerificationExecutorSourceOnce = async() => {
    const source = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: options.enabled,
      readPostCommitVerificationExecutorAdapter: options.readPostCommitVerificationExecutorAdapter,
      executePostCommitVerification: options.executePostCommitVerification
    })
    postCommitVerificationExecutorSource ??= source()
    return postCommitVerificationExecutorSource
  }

  return createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
    enabled: options.enabled,
    readPostCommitVerificationExecutorSource: readPostCommitVerificationExecutorSourceOnce,
    readPostCommitPersistentVerificationReadSource: readPostCommitPersistentVerificationReadSourceOnce
  })
}

export const thirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline =
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline()
