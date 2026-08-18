import {
  createThirdPartyDataPackModLockTransactionSemanticsSource,
  ThirdPartyDataPackModLockTransactionSemanticsBlockedError,
  type CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions
} from './thirdPartyDataPackModLockTransactionSemanticsSource'
import {
  createThirdPartyDataPackOrdinaryInstallTransactionPipeline,
  type CreateThirdPartyDataPackOrdinaryInstallTransactionPipelineOptions
} from './thirdPartyDataPackOrdinaryInstallTransactionPipeline'

export interface CreateThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipelineOptions
  extends Omit<
    CreateThirdPartyDataPackOrdinaryInstallTransactionPipelineOptions,
    'readModLockTransactionSemanticsSource'
  > {
  readonly readPostCommitUiIpcDeliveryContinuationSource?:
    CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions['readPostCommitUiIpcDeliveryContinuationSource']
  readonly readRollbackRecoveryExecutionSource?:
    CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions['readRollbackRecoveryExecutionSource']
}

export const createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline = (
  options: CreateThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipelineOptions = {}
) => {
  let modLockTransactionSemanticsSource:
    ReturnType<ReturnType<typeof createThirdPartyDataPackModLockTransactionSemanticsSource>>
    | undefined

  const readModLockTransactionSemanticsSourceOnce = async() => {
    const source = createThirdPartyDataPackModLockTransactionSemanticsSource({
      enabled: options.enabled,
      readPostCommitUiIpcDeliveryContinuationSource: options.readPostCommitUiIpcDeliveryContinuationSource,
      readRollbackRecoveryExecutionSource: options.readRollbackRecoveryExecutionSource
    })
    modLockTransactionSemanticsSource ??= source().catch(error => {
      if (error instanceof ThirdPartyDataPackModLockTransactionSemanticsBlockedError) {
        return error.result
      }
      throw error
    })
    return modLockTransactionSemanticsSource
  }

  return createThirdPartyDataPackOrdinaryInstallTransactionPipeline({
    enabled: options.enabled,
    readModLockTransactionSemanticsSource: readModLockTransactionSemanticsSourceOnce
  })
}

export const thirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline =
  createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline()
