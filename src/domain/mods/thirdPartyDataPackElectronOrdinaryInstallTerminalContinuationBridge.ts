import type {
  ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile
} from './thirdPartyDataPackPackageFilePersistentWriteProbe'
import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from './thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from './thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackInstallTransactionCommitFinalizationResult
} from './thirdPartyDataPackInstallTransactionCommitFinalizationPipeline'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
} from './thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
} from './thirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline'
import type {
  ThirdPartyDataPackLockfileDraft
} from './thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult
} from './thirdPartyDataPackOrdinaryInstallTransactionPipeline'
import type {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from './thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from './thirdPartyDataPackTransactionCommandDispatcherHandoff'

type Awaitable<T> = T | Promise<T>

export const thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel =
  'third-party-data-pack-ordinary-install-terminal-continuation'

export interface ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope {
  readonly transactionCommandDispatcherHandoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
  readonly installTransactionDispatchPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
  readonly packageFilePayload: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[]
}

export interface ThirdPartyDataPackElectronStartupPersistentStateSnapshotWriteResult {
  readonly status: 'written'
  readonly storageKind: 'electron-program-directory-userdata-startup-persistent-state'
  readonly targetPackageId: PackageId
  readonly snapshotWritten: true
}

export type ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationStatus =
  | 'ready'
  | 'blocked'

export interface ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult {
  readonly status: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationStatus
  readonly reason: string
  readonly installCommandPostCommitAcknowledgement?:
    ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
  readonly postCommitUiIpcDeliveryContinuation?:
    ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
  readonly ordinaryInstallTransactionTerminalConnection?:
    ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult
  readonly installTransactionLogPrepared?: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
  readonly installTransactionLogPreparedPersistentReadVerification?:
    ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
  readonly installTransactionCommitFinalization?:
    ThirdPartyDataPackInstallTransactionCommitFinalizationResult
  readonly runtimePublicationCommitAfterPostCommitVerification?:
    ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
  readonly runtimePublicationCommitLiveRegistrySwapHostConnection?:
    ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
  readonly runtimePublicationCommitAppStartupReadiness?:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
  readonly runtimePublicationCommitAppStartupHostConnection?:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
  readonly startupPersistentStateSnapshotWrite?:
    ThirdPartyDataPackElectronStartupPersistentStateSnapshotWriteResult
  readonly diagnostics: readonly unknown[]
}

export interface ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge {
  readonly invoke: (
    channel: typeof thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel,
    envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
  ) => Awaitable<unknown>
}

const blockedResult = (
  reason = 'third-party Electron ordinary install terminal continuation bridge blocked an unsafe result'
): ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult => Object.freeze({
  status: 'blocked',
  reason,
  diagnostics: Object.freeze([])
})

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const safeJsonStringify = (value: unknown): string | undefined => {
  try {
    return JSON.stringify(value)
  } catch {
    return undefined
  }
}

const safeResultFromRawMainProcessValue = (
  value: unknown
): ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult => {
  if (value === null || typeof value !== 'object') return blockedResult()
  const serialized = safeJsonStringify(value)
  const status = readOwnDataField(value, 'status')
  const reason = readOwnDataField(value, 'reason')
  const installCommandPostCommitAcknowledgement = readOwnDataField(
    value,
    'installCommandPostCommitAcknowledgement'
  )
  const postCommitUiIpcDeliveryContinuation = readOwnDataField(
    value,
    'postCommitUiIpcDeliveryContinuation'
  )
  const ordinaryInstallTransactionTerminalConnection = readOwnDataField(
    value,
    'ordinaryInstallTransactionTerminalConnection'
  )
  const installTransactionLogPrepared = readOwnDataField(
    value,
    'installTransactionLogPrepared'
  )
  const installTransactionLogPreparedPersistentReadVerification = readOwnDataField(
    value,
    'installTransactionLogPreparedPersistentReadVerification'
  )
  const installTransactionCommitFinalization = readOwnDataField(
    value,
    'installTransactionCommitFinalization'
  )
  const runtimePublicationCommitAfterPostCommitVerification = readOwnDataField(
    value,
    'runtimePublicationCommitAfterPostCommitVerification'
  )
  const runtimePublicationCommitLiveRegistrySwapHostConnection = readOwnDataField(
    value,
    'runtimePublicationCommitLiveRegistrySwapHostConnection'
  )
  const runtimePublicationCommitAppStartupReadiness = readOwnDataField(
    value,
    'runtimePublicationCommitAppStartupReadiness'
  )
  const runtimePublicationCommitAppStartupHostConnection = readOwnDataField(
    value,
    'runtimePublicationCommitAppStartupHostConnection'
  )
  const startupPersistentStateSnapshotWrite = readOwnDataField(
    value,
    'startupPersistentStateSnapshotWrite'
  )
  const diagnostics = readOwnDataField(value, 'diagnostics')
  const hasInstallTransactionFinalization =
    installTransactionLogPrepared !== undefined
    || installTransactionLogPreparedPersistentReadVerification !== undefined
    || installTransactionCommitFinalization !== undefined
  const installTransactionFinalizationReady =
    installTransactionLogPrepared !== null
    && typeof installTransactionLogPrepared === 'object'
    && readOwnDataField(installTransactionLogPrepared, 'status') === 'prepared'
    && installTransactionLogPreparedPersistentReadVerification !== null
    && typeof installTransactionLogPreparedPersistentReadVerification === 'object'
    && readOwnDataField(
      installTransactionLogPreparedPersistentReadVerification,
      'status'
    ) === 'verified'
    && installTransactionCommitFinalization !== null
    && typeof installTransactionCommitFinalization === 'object'
    && readOwnDataField(installTransactionCommitFinalization, 'status') === 'committed'
  const hasRuntimePublicationContinuation =
    runtimePublicationCommitAfterPostCommitVerification !== undefined
    || runtimePublicationCommitLiveRegistrySwapHostConnection !== undefined
    || runtimePublicationCommitAppStartupReadiness !== undefined
    || runtimePublicationCommitAppStartupHostConnection !== undefined
  const runtimePublicationContinuationReady =
    runtimePublicationCommitAfterPostCommitVerification !== null
    && typeof runtimePublicationCommitAfterPostCommitVerification === 'object'
    && readOwnDataField(runtimePublicationCommitAfterPostCommitVerification, 'status') === 'accepted'
    && runtimePublicationCommitLiveRegistrySwapHostConnection !== null
    && typeof runtimePublicationCommitLiveRegistrySwapHostConnection === 'object'
    && readOwnDataField(runtimePublicationCommitLiveRegistrySwapHostConnection, 'status') === 'swapped'
    && runtimePublicationCommitAppStartupReadiness !== null
    && typeof runtimePublicationCommitAppStartupReadiness === 'object'
    && readOwnDataField(runtimePublicationCommitAppStartupReadiness, 'status') === 'ready'
    && runtimePublicationCommitAppStartupHostConnection !== null
    && typeof runtimePublicationCommitAppStartupHostConnection === 'object'
    && readOwnDataField(runtimePublicationCommitAppStartupHostConnection, 'status') === 'accepted'
  const hasStartupPersistentStateSnapshotWrite =
    startupPersistentStateSnapshotWrite !== undefined
  const startupPersistentStateSnapshotWriteReady =
    startupPersistentStateSnapshotWrite !== null
    && typeof startupPersistentStateSnapshotWrite === 'object'
    && readOwnDataField(startupPersistentStateSnapshotWrite, 'status') === 'written'
    && readOwnDataField(
      startupPersistentStateSnapshotWrite,
      'storageKind'
    ) === 'electron-program-directory-userdata-startup-persistent-state'
    && isPackageId(readOwnDataField(startupPersistentStateSnapshotWrite, 'targetPackageId'))
    && readOwnDataField(startupPersistentStateSnapshotWrite, 'snapshotWritten') === true

  if (
    status !== 'ready'
    || typeof reason !== 'string'
    || installCommandPostCommitAcknowledgement === null
    || typeof installCommandPostCommitAcknowledgement !== 'object'
    || readOwnDataField(installCommandPostCommitAcknowledgement, 'status') !== 'ready'
    || postCommitUiIpcDeliveryContinuation === null
    || typeof postCommitUiIpcDeliveryContinuation !== 'object'
    || readOwnDataField(postCommitUiIpcDeliveryContinuation, 'status') !== 'ready'
    || ordinaryInstallTransactionTerminalConnection === null
    || typeof ordinaryInstallTransactionTerminalConnection !== 'object'
    || readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'status') !== 'ready'
    || (hasInstallTransactionFinalization && !installTransactionFinalizationReady)
    || (hasRuntimePublicationContinuation && !runtimePublicationContinuationReady)
    || (hasStartupPersistentStateSnapshotWrite && !startupPersistentStateSnapshotWriteReady)
    || serialized === undefined
    || serialized.includes('C:/Users')
    || serialized.includes('LENOVO')
    || serialized.includes('programDirectoryPath')
    || serialized.includes('candidateRegistrySet')
    || serialized.includes('liveRegistryReference')
  ) {
    return blockedResult(typeof reason === 'string' ? reason : undefined)
  }

  return Object.freeze({
    status: 'ready',
    reason,
    installCommandPostCommitAcknowledgement:
      installCommandPostCommitAcknowledgement as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult,
    postCommitUiIpcDeliveryContinuation:
      postCommitUiIpcDeliveryContinuation as ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult,
    ordinaryInstallTransactionTerminalConnection:
      ordinaryInstallTransactionTerminalConnection as ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult,
    ...(hasInstallTransactionFinalization
      ? {
          installTransactionLogPrepared:
            installTransactionLogPrepared as ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult,
          installTransactionLogPreparedPersistentReadVerification:
            installTransactionLogPreparedPersistentReadVerification as
              ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult,
          installTransactionCommitFinalization:
            installTransactionCommitFinalization as ThirdPartyDataPackInstallTransactionCommitFinalizationResult
        }
      : {}),
    ...(hasRuntimePublicationContinuation
      ? {
          runtimePublicationCommitAfterPostCommitVerification:
            runtimePublicationCommitAfterPostCommitVerification as
              ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult,
          runtimePublicationCommitLiveRegistrySwapHostConnection:
            runtimePublicationCommitLiveRegistrySwapHostConnection as
              ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult,
          runtimePublicationCommitAppStartupReadiness:
            runtimePublicationCommitAppStartupReadiness as
              ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult,
          runtimePublicationCommitAppStartupHostConnection:
            runtimePublicationCommitAppStartupHostConnection as
              ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
        }
      : {}),
    ...(hasStartupPersistentStateSnapshotWrite
      ? {
          startupPersistentStateSnapshotWrite:
            startupPersistentStateSnapshotWrite as
              ThirdPartyDataPackElectronStartupPersistentStateSnapshotWriteResult
        }
      : {}),
    diagnostics: Array.isArray(diagnostics) ? Object.freeze([...diagnostics]) : Object.freeze([])
  })
}

export const createThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationHost = (
  bridge: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge
) => Object.freeze({
  continueOrdinaryInstallTerminal: async(
    envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
  ): Promise<ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult> => {
    const rawResult = await bridge.invoke(
      thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel,
      envelope
    )
    return safeResultFromRawMainProcessValue(rawResult)
  }
})
