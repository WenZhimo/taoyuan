import {
  createThirdPartyDataPackRollbackRecoveryExecutionSource,
  type CreateThirdPartyDataPackRollbackRecoveryExecutionSourceOptions,
  type ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
} from './thirdPartyDataPackRollbackRecoveryExecutionSource'
import {
  createThirdPartyDataPackRollbackRecoverySettlementSource,
  type CreateThirdPartyDataPackRollbackRecoverySettlementSourceOptions,
  type ThirdPartyDataPackRollbackRecoverySettlementSourceResult
} from './thirdPartyDataPackRollbackRecoverySettlementSource'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackRollbackRecoveryExecutionPipelineOptions
  extends Omit<CreateThirdPartyDataPackRollbackRecoverySettlementSourceOptions, 'enabled'>,
    Omit<
      CreateThirdPartyDataPackRollbackRecoveryExecutionSourceOptions,
      'enabled' | 'readRollbackRecoverySettlementSource'
    > {
  readonly enabled?: boolean
  readonly readRollbackRecoverySettlementSource?: () =>
    Awaitable<ThirdPartyDataPackRollbackRecoverySettlementSourceResult>
}

export const createThirdPartyDataPackRollbackRecoveryExecutionPipeline = (
  options: CreateThirdPartyDataPackRollbackRecoveryExecutionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRollbackRecoveryExecutionSourceResult>) => {
  const readRollbackRecoverySettlementSource = options.readRollbackRecoverySettlementSource
    ?? createThirdPartyDataPackRollbackRecoverySettlementSource({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract: options.readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource: options.readRecoveryLogReplayRestoreSource
    })

  return createThirdPartyDataPackRollbackRecoveryExecutionSource({
    enabled: options.enabled,
    readRollbackRecoverySettlementSource,
    executeRollbackRecovery: options.executeRollbackRecovery
  })
}

export const thirdPartyDataPackRollbackRecoveryExecutionPipeline =
  createThirdPartyDataPackRollbackRecoveryExecutionPipeline()
