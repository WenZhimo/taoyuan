import {
  buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter
} from './thirdPartyDataPackRecoveryLogReplayRestoreAdapter'
import {
  createThirdPartyDataPackRecoveryLogReplayRestoreSource,
  type CreateThirdPartyDataPackRecoveryLogReplayRestoreSourceOptions,
  type ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
} from './thirdPartyDataPackRecoveryLogReplayRestoreSource'
import type {
  ThirdPartyDataPackPublicationRollbackRecoveryResult
} from './thirdPartyDataPackPublicationRollbackRecovery'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackRecoveryLogReplayRestorePipelineOptions {
  readonly enabled?: boolean
  readonly readPublicationRollbackRecovery?: () => Awaitable<ThirdPartyDataPackPublicationRollbackRecoveryResult>
  readonly readRuntimePublicationCommitAdapter?: () => Awaitable<ThirdPartyDataPackRuntimePublicationCommitAdapterResult>
  readonly executeRecoveryLogReplayRestore?: CreateThirdPartyDataPackRecoveryLogReplayRestoreSourceOptions['executeRecoveryLogReplayRestore']
}

export const createThirdPartyDataPackRecoveryLogReplayRestorePipeline = (
  options: CreateThirdPartyDataPackRecoveryLogReplayRestorePipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult>) => {
  const readRecoveryLogReplayRestoreAdapter = async() => {
    if (
      options.readPublicationRollbackRecovery === undefined
      || options.readRuntimePublicationCommitAdapter === undefined
    ) {
      throw new Error('third-party recovery log replay restore pipeline missing upstream readers')
    }

    const publicationRollbackRecovery = await options.readPublicationRollbackRecovery()
    const runtimePublicationCommitAdapter = await options.readRuntimePublicationCommitAdapter()

    return buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
      publicationRollbackRecovery,
      runtimePublicationCommitAdapter
    } as never)
  }

  return createThirdPartyDataPackRecoveryLogReplayRestoreSource({
    enabled: options.enabled,
    readRecoveryLogReplayRestoreAdapter,
    executeRecoveryLogReplayRestore: options.executeRecoveryLogReplayRestore
  })
}

export const thirdPartyDataPackRecoveryLogReplayRestorePipeline =
  createThirdPartyDataPackRecoveryLogReplayRestorePipeline()
