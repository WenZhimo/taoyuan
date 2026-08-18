import {
  deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter,
  type ThirdPartyDataPackElectronResponseDeliverySinkHost
} from './thirdPartyDataPackElectronResponseDeliverySinkAdapter'
import {
  buildThirdPartyDataPackElectronResponseDeliveryStartupGateHandoff
} from './thirdPartyDataPackElectronResponseDeliveryStartupGateHandoff'
import {
  createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource
} from './thirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource'
import {
  buildThirdPartyDataPackStartupGateHandoffPreflight
} from './thirdPartyDataPackStartupGateHandoffPreflight'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource,
  type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from './thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight
} from './thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff,
  type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
} from './thirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource
} from './thirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract,
  type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import {
  buildThirdPartyDataPackUiIpcResultEnvelopeContract
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from './thirdPartyDataPackUiIpcResultNormalizationPreflight'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from './thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackElectronUiIpcResponseDeliveryPipelineOptions {
  readonly enabled?: boolean
  readonly readResultNormalizationPreflight?: () =>
    Awaitable<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult>
  readonly readPostCommitVerificationUiIpcOutcomeHandoff?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>
  readonly host?: ThirdPartyDataPackElectronResponseDeliverySinkHost
}

export const createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline = (
  options: CreateThirdPartyDataPackElectronUiIpcResponseDeliveryPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>) => {
  let resultNormalizationPreflight:
    Promise<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult>
    | undefined
  let outcomeHandoff:
    Promise<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>
    | undefined
  let orchestrationHandoff:
    Promise<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult>
    | undefined
  let orchestrationSourceResult:
    ReturnType<ReturnType<typeof createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource>>
    | undefined

  const readResultNormalizationPreflightOnce = async() => {
    resultNormalizationPreflight ??= Promise.resolve().then(() => {
      if (options.readResultNormalizationPreflight === undefined) {
        throw new Error('third-party Electron UI/IPC response delivery pipeline missing result normalization preflight reader')
      }
      return options.readResultNormalizationPreflight()
    })
    return resultNormalizationPreflight
  }

  const readOutcomeHandoffOnce = async() => {
    outcomeHandoff ??= Promise.resolve().then(() => {
      if (options.readPostCommitVerificationUiIpcOutcomeHandoff === undefined) {
        throw new Error('third-party Electron UI/IPC response delivery pipeline missing post-commit UI/IPC outcome handoff reader')
      }
      return options.readPostCommitVerificationUiIpcOutcomeHandoff()
    })
    return outcomeHandoff
  }

  const readOrchestrationHandoffOnce = async() => {
    orchestrationHandoff ??= Promise.all([
      readResultNormalizationPreflightOnce(),
      readOutcomeHandoffOnce()
    ]).then(([resultNormalizationPreflight, postCommitVerificationUiIpcOutcomeHandoff]) =>
      buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff({
        resultNormalizationPreflight,
        postCommitVerificationUiIpcOutcomeHandoff
      })
    )
    return orchestrationHandoff
  }

  const readOrchestrationSourceOnce = async() => {
    const source = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      enabled: options.enabled,
      readUiIpcResponseDeliveryOrchestrationHandoff: readOrchestrationHandoffOnce
    })
    orchestrationSourceResult ??= source()
    return orchestrationSourceResult
  }

  const readPlatformSplitContract = async():
    Promise<ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult> => {
    await readOrchestrationSourceOnce()

    const resultNormalizationPreflight = await readResultNormalizationPreflightOnce()
    const postCommitVerificationUiIpcOutcomeHandoff = await readOutcomeHandoffOnce()
    if (postCommitVerificationUiIpcOutcomeHandoff.outcome === undefined) {
      throw new Error('third-party Electron UI/IPC response delivery pipeline missing path-free UI/IPC outcome source')
    }

    const envelopeContract = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
      preflight: resultNormalizationPreflight,
      outcome: postCommitVerificationUiIpcOutcomeHandoff.outcome
    })
    const responseDeliveryPreflight = buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
      envelopeContract
    })
    return buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
      responseDeliveryPreflight
    })
  }

  const readElectronResponseDeliveryStartupGateHandoff = async() => {
    const [responseDeliveryOrchestrationHandoff, platformSplitContract] = await Promise.all([
      readOrchestrationHandoffOnce(),
      readPlatformSplitContract()
    ])
    const electronResponseDelivery = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract,
      host: options.host
    })
    const startupGateHandoffPreflight = buildThirdPartyDataPackStartupGateHandoffPreflight({
      responseDeliveryOrchestrationHandoff
    })

    return buildThirdPartyDataPackElectronResponseDeliveryStartupGateHandoff({
      electronResponseDelivery,
      startupGateHandoffPreflight
    })
  }

  const readElectronResponseDeliveryStartupGateHandoffSource =
    createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      enabled: options.enabled,
      readElectronResponseDeliveryStartupGateHandoff
    })

  return createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
    enabled: options.enabled,
    platform: 'electron',
    readElectronResponseDeliveryStartupGateHandoffSource
  })
}

export const thirdPartyDataPackElectronUiIpcResponseDeliveryPipeline =
  createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline()
