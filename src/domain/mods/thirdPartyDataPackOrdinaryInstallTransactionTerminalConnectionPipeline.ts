import {
  createThirdPartyDataPackModLockTransactionSemanticsSource,
  ThirdPartyDataPackModLockTransactionSemanticsBlockedError,
  type CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions
} from './thirdPartyDataPackModLockTransactionSemanticsSource'
import {
  createThirdPartyDataPackOrdinaryInstallTransactionPipeline,
  type CreateThirdPartyDataPackOrdinaryInstallTransactionPipelineOptions
} from './thirdPartyDataPackOrdinaryInstallTransactionPipeline'
import {
  createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline,
  type CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipelineOptions
} from './thirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline'
import {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError
} from './thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'

export interface CreateThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipelineOptions
  extends Omit<
      CreateThirdPartyDataPackOrdinaryInstallTransactionPipelineOptions,
      'readModLockTransactionSemanticsSource'
    >,
    Omit<CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipelineOptions, 'enabled'> {
  readonly readPostCommitUiIpcDeliveryContinuationSource?:
    CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions['readPostCommitUiIpcDeliveryContinuationSource']
  readonly readRollbackRecoveryExecutionSource?:
    CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions['readRollbackRecoveryExecutionSource']
}

const hasPostCommitUiIpcDeliveryContinuationPipelineInputs = (
  options: CreateThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipelineOptions
): boolean => options.readTransactionCommitConnectionSource !== undefined
  || options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline !== undefined
  || options.readInstallPersistentStagingLifecyclePipeline !== undefined
  || options.readPackageFilePersistentStagingPipeline !== undefined
  || options.readInstallCommandLifecyclePipeline !== undefined
  || options.readSettingsLockfilePersistentWriterSource !== undefined
  || options.readSettingsLockfileCommitSource !== undefined
  || options.writeSettingsLockfile !== undefined
  || options.acknowledgeInstallTransactionCommit !== undefined
  || options.acknowledgePostCommitPersistentReadWrite !== undefined
  || options.platform !== undefined
  || options.readResultNormalizationPreflight !== undefined
  || options.readPostCommitVerificationUiIpcOutcomeHandoff !== undefined
  || options.readUiIpcResponseDeliveryAcknowledgementConvergenceSource !== undefined
  || options.useRendererUiIpcResponseDeliveryBridge === true
  || 'runtimeHost' in options
  || options.resolveRuntimeHost !== undefined
  || options.webEventName !== undefined

export const createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline = (
  options: CreateThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipelineOptions = {}
) => {
  let modLockTransactionSemanticsSource:
    ReturnType<ReturnType<typeof createThirdPartyDataPackModLockTransactionSemanticsSource>>
    | undefined
  let postCommitUiIpcDeliveryContinuationSource:
    ReturnType<ReturnType<typeof createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline>>
    | undefined

  const readComposedPostCommitUiIpcDeliveryContinuationSourceOnce = async() => {
    const source = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline({
      enabled: options.enabled,
      readTransactionCommitConnectionSource: options.readTransactionCommitConnectionSource,
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline:
        options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline,
      readInstallPersistentStagingLifecyclePipeline: options.readInstallPersistentStagingLifecyclePipeline,
      readPackageFilePersistentStagingPipeline: options.readPackageFilePersistentStagingPipeline,
      readInstallCommandLifecyclePipeline: options.readInstallCommandLifecyclePipeline,
      readSettingsLockfilePersistentWriterSource: options.readSettingsLockfilePersistentWriterSource,
      readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
      writeSettingsLockfile: options.writeSettingsLockfile,
      acknowledgeInstallTransactionCommit: options.acknowledgeInstallTransactionCommit,
      acknowledgePostCommitPersistentReadWrite: options.acknowledgePostCommitPersistentReadWrite,
      platform: options.platform,
      readResultNormalizationPreflight: options.readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff: options.readPostCommitVerificationUiIpcOutcomeHandoff,
      readUiIpcResponseDeliveryAcknowledgementConvergenceSource:
        options.readUiIpcResponseDeliveryAcknowledgementConvergenceSource,
      useRendererUiIpcResponseDeliveryBridge: options.useRendererUiIpcResponseDeliveryBridge,
      ...(options.runtimeHost !== undefined ? { runtimeHost: options.runtimeHost } : {}),
      resolveRuntimeHost: options.resolveRuntimeHost,
      webEventName: options.webEventName,
      expectedPackageId: options.expectedPackageId,
      expectedEnvelopeKind: options.expectedEnvelopeKind,
      expectedMessageKey: options.expectedMessageKey
    })
    postCommitUiIpcDeliveryContinuationSource ??= source().catch(error => {
      if (error instanceof ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError) {
        return error.result
      }
      throw error
    })
    return postCommitUiIpcDeliveryContinuationSource
  }

  const readPostCommitUiIpcDeliveryContinuationSource =
    options.readPostCommitUiIpcDeliveryContinuationSource
    ?? (
      hasPostCommitUiIpcDeliveryContinuationPipelineInputs(options)
        ? readComposedPostCommitUiIpcDeliveryContinuationSourceOnce
        : undefined
    )

  const readModLockTransactionSemanticsSourceOnce = async() => {
    const source = createThirdPartyDataPackModLockTransactionSemanticsSource({
      enabled: options.enabled,
      readPostCommitUiIpcDeliveryContinuationSource,
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
