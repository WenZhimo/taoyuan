import {
  createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource,
  ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError,
  type CreateThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceOptions,
  type ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult
} from './thirdPartyDataPackPostCommitPersistentReadWriteConnectionSource'
import {
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline,
  type CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineOptions,
  type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'
import {
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource,
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError,
  type CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceOptions,
  type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'
import {
  createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource,
  type CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceOptions,
  type ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from './thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import {
  createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline,
  type CreateThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipelineOptions
} from './thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline,
  type CreateThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipelineOptions
} from './thirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline'
import {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError,
  type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from './thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipelineOptions
  extends Omit<CreateThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceOptions, 'readTransactionCommitConnectionSource'>,
    CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceOptions,
    CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineOptions,
    CreateThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipelineOptions,
    Omit<
      CreateThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipelineOptions,
      | 'enabled'
      | 'platform'
      | 'readResultNormalizationPreflight'
      | 'readPostCommitVerificationUiIpcOutcomeHandoff'
    > {
  readonly readTransactionCommitConnectionSource?:
    CreateThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceOptions['readTransactionCommitConnectionSource']
  readonly readUiIpcResponseDeliveryAcknowledgementConvergenceSource?:
    CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceOptions['readUiIpcResponseDeliveryAcknowledgementConvergenceSource']
  readonly useRendererUiIpcResponseDeliveryBridge?: boolean
}

const hasInstallPersistentStagingSettingsLockfileLifecycleInputs = (
  options: CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipelineOptions
): boolean => options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline !== undefined
  || options.readInstallPersistentStagingLifecyclePipeline !== undefined
  || options.readPackageFilePersistentStagingPipeline !== undefined
  || options.readInstallCommandLifecyclePipeline !== undefined
  || options.readSettingsLockfilePersistentWriterSource !== undefined
  || options.readSettingsLockfileCommitSource !== undefined
  || options.writeSettingsLockfile !== undefined

const hasTransactionCommitConnectionInputs = (
  options: CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipelineOptions
): boolean => options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline !== undefined
  || options.acknowledgeInstallTransactionCommit !== undefined
  || hasInstallPersistentStagingSettingsLockfileLifecycleInputs(options)

const hasRendererUiIpcResponseDeliveryBridgeInputs = (
  options: CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipelineOptions
): boolean => options.useRendererUiIpcResponseDeliveryBridge === true
  || 'runtimeHost' in options
  || options.resolveRuntimeHost !== undefined
  || options.webEventName !== undefined

export const createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline = (
  options: CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>) => {
  let installPersistentStagingSettingsLockfileLifecyclePipeline:
    Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult>
    | undefined
  let transactionCommitConnectionSource:
    Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult>
    | undefined
  let postCommitPersistentReadWriteConnectionSource:
    Promise<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult>
    | undefined
  let uiIpcResponseDeliveryAcknowledgementConvergenceSource:
    Awaitable<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>
    | undefined

  const readComposedInstallPersistentStagingSettingsLockfileLifecyclePipelineOnce = async() => {
    const source = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      enabled: options.enabled,
      readInstallPersistentStagingLifecyclePipeline: options.readInstallPersistentStagingLifecyclePipeline,
      readPackageFilePersistentStagingPipeline: options.readPackageFilePersistentStagingPipeline,
      readInstallCommandLifecyclePipeline: options.readInstallCommandLifecyclePipeline,
      readSettingsLockfilePersistentWriterSource: options.readSettingsLockfilePersistentWriterSource,
      readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
      writeSettingsLockfile: options.writeSettingsLockfile
    })
    installPersistentStagingSettingsLockfileLifecyclePipeline ??= source()
    return installPersistentStagingSettingsLockfileLifecyclePipeline
  }

  const readInstallPersistentStagingSettingsLockfileLifecyclePipeline =
    options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline
    ?? (
      hasInstallPersistentStagingSettingsLockfileLifecycleInputs(options)
        ? readComposedInstallPersistentStagingSettingsLockfileLifecyclePipelineOnce
        : undefined
    )

  const readComposedTransactionCommitConnectionSourceOnce = async() => {
    const source = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource({
      enabled: options.enabled,
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline,
      acknowledgeInstallTransactionCommit: options.acknowledgeInstallTransactionCommit
    })
    transactionCommitConnectionSource ??= source().catch(error => {
      if (error instanceof ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError) {
        return error.result
      }
      throw error
    })
    return transactionCommitConnectionSource
  }

  const readTransactionCommitConnectionSource =
    options.readTransactionCommitConnectionSource
    ?? (
      hasTransactionCommitConnectionInputs(options)
        ? readComposedTransactionCommitConnectionSourceOnce
        : undefined
    )

  const readPostCommitPersistentReadWriteConnectionSourceOnce = async() => {
    const source = createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource({
      enabled: options.enabled,
      readTransactionCommitConnectionSource,
      acknowledgePostCommitPersistentReadWrite: options.acknowledgePostCommitPersistentReadWrite
    })
    postCommitPersistentReadWriteConnectionSource ??= source().catch(error => {
      if (error instanceof ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError) {
        return error.result
      }
      throw error
    })
    return postCommitPersistentReadWriteConnectionSource
  }

  const cacheUiIpcResponseDeliveryAcknowledgementConvergenceSource = (
    source: () => Awaitable<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>
  ): Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult> => {
    uiIpcResponseDeliveryAcknowledgementConvergenceSource ??= Promise.resolve(source()).catch(error => {
      if (error instanceof ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError) {
        return error.result
      }
      throw error
    })
    return Promise.resolve(uiIpcResponseDeliveryAcknowledgementConvergenceSource)
  }

  const readComposedHostConnectionUiIpcResponseDeliveryAcknowledgementConvergenceSourceOnce = async() => {
    const source = createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline({
      enabled: options.enabled,
      platform: options.platform,
      readResultNormalizationPreflight: options.readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff: options.readPostCommitVerificationUiIpcOutcomeHandoff,
      expectedPackageId: options.expectedPackageId,
      expectedEnvelopeKind: options.expectedEnvelopeKind,
      expectedMessageKey: options.expectedMessageKey
    })
    return await cacheUiIpcResponseDeliveryAcknowledgementConvergenceSource(source)
  }

  const readComposedRendererUiIpcResponseDeliveryAcknowledgementConvergenceSourceOnce = async() => {
    const source = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: options.enabled,
      platform: options.platform,
      runtimeHost: options.runtimeHost,
      resolveRuntimeHost: options.resolveRuntimeHost,
      readResultNormalizationPreflight: options.readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff: options.readPostCommitVerificationUiIpcOutcomeHandoff,
      webEventName: options.webEventName
    })
    return await cacheUiIpcResponseDeliveryAcknowledgementConvergenceSource(source)
  }

  const readUiIpcResponseDeliveryAcknowledgementConvergenceSource =
    options.readUiIpcResponseDeliveryAcknowledgementConvergenceSource
    ?? (
      hasRendererUiIpcResponseDeliveryBridgeInputs(options)
        ? readComposedRendererUiIpcResponseDeliveryAcknowledgementConvergenceSourceOnce
        : readComposedHostConnectionUiIpcResponseDeliveryAcknowledgementConvergenceSourceOnce
    )

  return createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource({
    enabled: options.enabled,
    readPostCommitPersistentReadWriteConnectionSource: readPostCommitPersistentReadWriteConnectionSourceOnce,
    readUiIpcResponseDeliveryAcknowledgementConvergenceSource
  })
}

export const thirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline =
  createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline()
