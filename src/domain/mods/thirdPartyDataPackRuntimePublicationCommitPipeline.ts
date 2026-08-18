import {
  buildThirdPartyDataPackRuntimePublicationCommitAdapter
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import {
  createThirdPartyDataPackRuntimePublicationCommitSource,
  type CreateThirdPartyDataPackRuntimePublicationCommitSourceOptions,
  type ThirdPartyDataPackRuntimePublicationCommitSourceResult
} from './thirdPartyDataPackRuntimePublicationCommitSource'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from './thirdPartyDataPackLiveRegistrySwapProtection'
import type {
  ThirdPartyDataPackPublicationRollbackRecoveryResult
} from './thirdPartyDataPackPublicationRollbackRecovery'
import type {
  ThirdPartyDataPackRuntimePublicationPreflightResult
} from './thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPlanResult
} from './thirdPartyDataPackTransactionPreCommitPlan'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackRuntimePublicationCommitPipelineOptions {
  readonly enabled?: boolean
  readonly readRuntimePublicationPreflight?: () => Awaitable<ThirdPartyDataPackRuntimePublicationPreflightResult>
  readonly readTransactionPreCommitPlan?: () => Awaitable<ThirdPartyDataPackTransactionPreCommitPlanResult>
  readonly readLiveRegistrySwapProtection?: () => Awaitable<ThirdPartyDataPackLiveRegistrySwapProtectionResult>
  readonly readPublicationRollbackRecovery?: () => Awaitable<ThirdPartyDataPackPublicationRollbackRecoveryResult>
  readonly acknowledgeRuntimePublicationCommit?:
    CreateThirdPartyDataPackRuntimePublicationCommitSourceOptions['acknowledgeRuntimePublicationCommit']
}

export const createThirdPartyDataPackRuntimePublicationCommitPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitSourceResult>) => {
  const readRuntimePublicationCommitAdapter = async() => {
    if (
      options.readRuntimePublicationPreflight === undefined
      || options.readTransactionPreCommitPlan === undefined
      || options.readLiveRegistrySwapProtection === undefined
      || options.readPublicationRollbackRecovery === undefined
    ) {
      throw new Error('third-party runtime publication commit pipeline missing upstream readers')
    }

    const [
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      publicationRollbackRecovery
    ] = await Promise.all([
      options.readRuntimePublicationPreflight(),
      options.readTransactionPreCommitPlan(),
      options.readLiveRegistrySwapProtection(),
      options.readPublicationRollbackRecovery()
    ])

    return buildThirdPartyDataPackRuntimePublicationCommitAdapter({
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      publicationRollbackRecovery
    } as never)
  }

  return createThirdPartyDataPackRuntimePublicationCommitSource({
    enabled: options.enabled,
    readRuntimePublicationCommitAdapter,
    acknowledgeRuntimePublicationCommit: options.acknowledgeRuntimePublicationCommit
  })
}

export const thirdPartyDataPackRuntimePublicationCommitPipeline =
  createThirdPartyDataPackRuntimePublicationCommitPipeline()
