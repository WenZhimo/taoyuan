import {
  createThirdPartyDataPackLiveRegistrySwapExecutionSource,
  type CreateThirdPartyDataPackLiveRegistrySwapExecutionSourceOptions,
  type ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from './thirdPartyDataPackLiveRegistrySwapExecutionSource'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from './thirdPartyDataPackLiveRegistrySwapProtection'
import type {
  ThirdPartyDataPackPublicationRollbackRecoveryResult
} from './thirdPartyDataPackPublicationRollbackRecovery'
import {
  createThirdPartyDataPackRuntimePublicationCommitPipeline,
  type CreateThirdPartyDataPackRuntimePublicationCommitPipelineOptions
} from './thirdPartyDataPackRuntimePublicationCommitPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationPreflightResult
} from './thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPlanResult
} from './thirdPartyDataPackTransactionPreCommitPlan'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipelineOptions {
  readonly enabled?: boolean
  readonly readRuntimePublicationPreflight?: () => Awaitable<ThirdPartyDataPackRuntimePublicationPreflightResult>
  readonly readTransactionPreCommitPlan?: () => Awaitable<ThirdPartyDataPackTransactionPreCommitPlanResult>
  readonly readLiveRegistrySwapProtection?: () => Awaitable<ThirdPartyDataPackLiveRegistrySwapProtectionResult>
  readonly readPublicationRollbackRecovery?: () => Awaitable<ThirdPartyDataPackPublicationRollbackRecoveryResult>
  readonly acknowledgeRuntimePublicationCommit?:
    CreateThirdPartyDataPackRuntimePublicationCommitPipelineOptions['acknowledgeRuntimePublicationCommit']
  readonly executeLiveRegistrySwap?:
    CreateThirdPartyDataPackLiveRegistrySwapExecutionSourceOptions['executeLiveRegistrySwap']
}

export const createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>) => {
  const readLiveRegistrySwapProtectionAfterRuntimePublicationCommit = async() => {
    if (
      options.readRuntimePublicationPreflight === undefined
      || options.readTransactionPreCommitPlan === undefined
      || options.readLiveRegistrySwapProtection === undefined
      || options.readPublicationRollbackRecovery === undefined
    ) {
      throw new Error('third-party runtime publication live registry swap pipeline missing upstream readers')
    }

    const readConfiguredLiveRegistrySwapProtection = options.readLiveRegistrySwapProtection
    let liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult | undefined
    const readLiveRegistrySwapProtection = async() => {
      liveRegistrySwapProtection = await readConfiguredLiveRegistrySwapProtection()
      return liveRegistrySwapProtection
    }

    const runtimePublicationCommit = createThirdPartyDataPackRuntimePublicationCommitPipeline({
      enabled: true,
      readRuntimePublicationPreflight: options.readRuntimePublicationPreflight,
      readTransactionPreCommitPlan: options.readTransactionPreCommitPlan,
      readLiveRegistrySwapProtection,
      readPublicationRollbackRecovery: options.readPublicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit: options.acknowledgeRuntimePublicationCommit
    })
    await runtimePublicationCommit()

    if (liveRegistrySwapProtection === undefined) {
      throw new Error('third-party runtime publication live registry swap pipeline missing live swap protection result')
    }
    return liveRegistrySwapProtection
  }

  return createThirdPartyDataPackLiveRegistrySwapExecutionSource({
    enabled: options.enabled,
    readLiveRegistrySwapProtection: readLiveRegistrySwapProtectionAfterRuntimePublicationCommit,
    executeLiveRegistrySwap: options.executeLiveRegistrySwap
  })
}

export const thirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline =
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline()
