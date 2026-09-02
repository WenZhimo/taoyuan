import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackLiveRegistrySwapHost,
  type ThirdPartyDataPackInMemoryLiveRegistryReference,
  type ThirdPartyDataPackLiveRegistrySwapHost
} from './thirdPartyDataPackLiveRegistrySwapHost'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline,
  type CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipelineOptions
} from './thirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline'
import type { RegistrySet } from './registry'

export interface CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipelineOptions
  extends Omit<CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipelineOptions, 'executeLiveRegistrySwap'> {
  readonly liveRegistrySwapHost?: ThirdPartyDataPackLiveRegistrySwapHost
  readonly liveRegistryReference?: ThirdPartyDataPackInMemoryLiveRegistryReference
  readonly candidateRegistrySet?: RegistrySet
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
}

export const createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipelineOptions = {}
) => {
  const derivedLiveRegistrySwapHost = options.liveRegistrySwapHost ?? (
    options.liveRegistryReference === undefined
      || options.candidateRegistrySet === undefined
      || options.candidateIdentity === undefined
      ? undefined
      : createThirdPartyDataPackLiveRegistrySwapHost({
          liveRegistryReference: options.liveRegistryReference,
          candidateRegistrySet: options.candidateRegistrySet,
          candidateIdentity: options.candidateIdentity
        })
  )

  return createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline({
    enabled: options.enabled,
    readRuntimePublicationPreflight: options.readRuntimePublicationPreflight,
    readTransactionPreCommitPlan: options.readTransactionPreCommitPlan,
    readLiveRegistrySwapProtection: options.readLiveRegistrySwapProtection,
    readPublicationRollbackRecovery: options.readPublicationRollbackRecovery,
    acknowledgeRuntimePublicationCommit: options.acknowledgeRuntimePublicationCommit,
    executeLiveRegistrySwap: derivedLiveRegistrySwapHost?.executeLiveRegistrySwap
  })
}

export const thirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline =
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline()
