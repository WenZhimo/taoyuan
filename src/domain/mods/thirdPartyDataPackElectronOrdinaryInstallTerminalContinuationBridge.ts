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
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'
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
import type {
  ThirdPartyDataPackDisableTransactionTerminal
} from './thirdPartyDataPackDisableTransaction'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

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
  readonly settingsLockfileLifecycle?:
    ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
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
  readonly disabledReplacementTerminal?: ThirdPartyDataPackDisableTransactionTerminal
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

const hasStatus = (
  value: unknown,
  expectedStatus: string
): boolean =>
  value !== null
  && typeof value === 'object'
  && readOwnDataField(value, 'status') === expectedStatus

const readRuntimePublicationCommandId = (value: unknown) => {
  const requestedCommandId = readOwnDataField(value, 'requestedCommandId')
  return typeof requestedCommandId === 'string'
    ? readThirdPartyDataPackEnabledRuntimeCommandId(requestedCommandId)
    : undefined
}

const effectFlag = (
  value: unknown,
  fieldName: string
): boolean => {
  const effects = readOwnDataField(value, 'effects')
  return effects !== null
    && typeof effects === 'object'
    && readOwnDataField(effects, fieldName) === true
}

const stringListMatches = (
  value: unknown,
  expectedValues: readonly string[]
): boolean =>
  Array.isArray(value)
  && value.length === expectedValues.length
  && value.every((currentValue, index) => currentValue === expectedValues[index])

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
  const settingsLockfileLifecycle = readOwnDataField(
    value,
    'settingsLockfileLifecycle'
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
  const disabledReplacementTerminal = readOwnDataField(
    value,
    'disabledReplacementTerminal'
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
  const runtimePublicationContinuationCommandId =
    readRuntimePublicationCommandId(runtimePublicationCommitAfterPostCommitVerification)
  const runtimePublicationContinuationReady =
    runtimePublicationContinuationCommandId !== undefined
    && runtimePublicationContinuationCommandId
      === readRuntimePublicationCommandId(runtimePublicationCommitLiveRegistrySwapHostConnection)
    && runtimePublicationContinuationCommandId
      === readRuntimePublicationCommandId(runtimePublicationCommitAppStartupReadiness)
    && runtimePublicationContinuationCommandId
      === readRuntimePublicationCommandId(runtimePublicationCommitAppStartupHostConnection)
    && runtimePublicationCommitAfterPostCommitVerification !== null
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
  const hasDisabledReplacementTerminal =
    disabledReplacementTerminal !== undefined
  const disabledReplacementTargetPackageId = readOwnDataField(
    disabledReplacementTerminal,
    'targetPackageId'
  )
  const disabledReplacementTerminalReady =
    disabledReplacementTerminal !== null
    && typeof disabledReplacementTerminal === 'object'
    && readOwnDataField(disabledReplacementTerminal, 'status') === 'ready'
    && readOwnDataField(disabledReplacementTerminal, 'requestedCommandId') === 'disable'
    && isPackageId(disabledReplacementTargetPackageId)
    && stringListMatches(
      readOwnDataField(disabledReplacementTerminal, 'selectedPackageIds'),
      []
    )
    && stringListMatches(
      readOwnDataField(disabledReplacementTerminal, 'blockedPackageIds'),
      [disabledReplacementTargetPackageId]
    )
    && stringListMatches(
      readOwnDataField(disabledReplacementTerminal, 'loadOrder'),
      []
    )
    && readOwnDataField(disabledReplacementTerminal, 'settingsWritten') === true
    && readOwnDataField(disabledReplacementTerminal, 'lockfileWritten') === true
    && readOwnDataField(disabledReplacementTerminal, 'startupStateWritten') === true
    && readOwnDataField(disabledReplacementTerminal, 'packageFilesPreserved') === true
    && readOwnDataField(disabledReplacementTerminal, 'runtimePublicationExcluded') === true
    && readOwnDataField(disabledReplacementTerminal, 'realRuntimePublicationCommitCalled') === true
    && readOwnDataField(disabledReplacementTerminal, 'runtimePublicationCommitted') === true
    && readOwnDataField(disabledReplacementTerminal, 'liveRegistrySwapped') === true
    && readOwnDataField(disabledReplacementTerminal, 'appStartupHandoffAccepted') === true
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
  const installCommandPostCommitAcknowledgementReady =
    installCommandPostCommitAcknowledgement !== null
    && typeof installCommandPostCommitAcknowledgement === 'object'
    && readOwnDataField(installCommandPostCommitAcknowledgement, 'status') === 'ready'
  const hasSettingsLockfileLifecycle = settingsLockfileLifecycle !== undefined
  const settingsLockfileLifecycleReady =
    settingsLockfileLifecycle !== null
    && typeof settingsLockfileLifecycle === 'object'
    && readOwnDataField(settingsLockfileLifecycle, 'status') === 'ready'
    && readOwnDataField(
      settingsLockfileLifecycle,
      'settingsLockfilePersistentWriterSourceStatus'
    ) === 'written'
    && readOwnDataField(settingsLockfileLifecycle, 'persistentPackageWriteExecuted') === true
    && readOwnDataField(settingsLockfileLifecycle, 'persistentSettingsLockfileWriteExecuted') === true
    && effectFlag(settingsLockfileLifecycle, 'settingsWritten')
    && effectFlag(settingsLockfileLifecycle, 'lockfileWritten')
  const postCommitUiIpcDeliveryContinuationReady =
    hasStatus(postCommitUiIpcDeliveryContinuation, 'ready')
  const ordinaryInstallTransactionTerminalConnectionReady =
    hasStatus(ordinaryInstallTransactionTerminalConnection, 'ready')
  const runtimePublicationSuccessTerminalReady =
    installCommandPostCommitAcknowledgementReady
    && postCommitUiIpcDeliveryContinuationReady
    && ordinaryInstallTransactionTerminalConnectionReady
    && readOwnDataField(postCommitUiIpcDeliveryContinuation, 'envelopeKind') === 'success'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'outcomeKind') === 'success'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'retryable') === false
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'rollbackRequired') === false
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'ordinaryInstallTransactionReady')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'successOutcomeAccepted')
    && (!hasSettingsLockfileLifecycle || settingsLockfileLifecycleReady)
    && installTransactionFinalizationReady
    && runtimePublicationContinuationReady
    && startupPersistentStateSnapshotWriteReady
  const disabledReplacementSuccessTerminalReady =
    installCommandPostCommitAcknowledgementReady
    && postCommitUiIpcDeliveryContinuationReady
    && ordinaryInstallTransactionTerminalConnectionReady
    && readOwnDataField(postCommitUiIpcDeliveryContinuation, 'envelopeKind') === 'success'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'outcomeKind') === 'success'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'retryable') === false
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'rollbackRequired') === false
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'ordinaryInstallTransactionReady')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'successOutcomeAccepted')
    && (!hasSettingsLockfileLifecycle || settingsLockfileLifecycleReady)
    && installTransactionFinalizationReady
    && !hasRuntimePublicationContinuation
    && disabledReplacementTerminalReady
    && startupPersistentStateSnapshotWriteReady
  const successTerminalReady =
    runtimePublicationSuccessTerminalReady || disabledReplacementSuccessTerminalReady
  const retryableFailureTerminalReady =
    (
      hasStatus(installCommandPostCommitAcknowledgement, 'ready')
      || hasStatus(installCommandPostCommitAcknowledgement, 'blocked')
    )
    && postCommitUiIpcDeliveryContinuationReady
    && ordinaryInstallTransactionTerminalConnectionReady
    && readOwnDataField(postCommitUiIpcDeliveryContinuation, 'envelopeKind') === 'failure'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'outcomeKind') === 'failure'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'retryable') === true
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'rollbackRequired') === false
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'failureOutcomeAccepted')
  const rollbackTerminalReady =
    installCommandPostCommitAcknowledgementReady
    && postCommitUiIpcDeliveryContinuationReady
    && ordinaryInstallTransactionTerminalConnectionReady
    && readOwnDataField(postCommitUiIpcDeliveryContinuation, 'envelopeKind') === 'rollback'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'outcomeKind') === 'rollback'
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'retryable') === false
    && readOwnDataField(ordinaryInstallTransactionTerminalConnection, 'rollbackRequired') === true
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'rollbackOutcomeAccepted')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'rollbackRecoveryExecutionAcknowledged')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'realRecoveryLogReplayRestoreCalled')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'recoveryLogRead')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'recoveryLogReplayed')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'packageFilesRestored')
    && effectFlag(ordinaryInstallTransactionTerminalConnection, 'rollbackExecuted')
  const terminalClassReady =
    successTerminalReady || retryableFailureTerminalReady || rollbackTerminalReady
  const nonSuccessTerminalCarriesSuccessOnlyState =
    !successTerminalReady
    && (
      hasInstallTransactionFinalization
      || hasRuntimePublicationContinuation
      || hasSettingsLockfileLifecycle
      || hasStartupPersistentStateSnapshotWrite
      || hasDisabledReplacementTerminal
    )

  if (
    status !== 'ready'
    || typeof reason !== 'string'
    || installCommandPostCommitAcknowledgement === null
    || typeof installCommandPostCommitAcknowledgement !== 'object'
    || !terminalClassReady
    || nonSuccessTerminalCarriesSuccessOnlyState
    || postCommitUiIpcDeliveryContinuation === null
    || typeof postCommitUiIpcDeliveryContinuation !== 'object'
    || ordinaryInstallTransactionTerminalConnection === null
    || typeof ordinaryInstallTransactionTerminalConnection !== 'object'
    || (hasSettingsLockfileLifecycle && !settingsLockfileLifecycleReady)
    || (hasInstallTransactionFinalization && !installTransactionFinalizationReady)
    || (hasRuntimePublicationContinuation && !runtimePublicationContinuationReady)
    || (hasDisabledReplacementTerminal && !disabledReplacementTerminalReady)
    || (hasDisabledReplacementTerminal && hasRuntimePublicationContinuation)
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
    ...(hasSettingsLockfileLifecycle
      ? {
          settingsLockfileLifecycle:
            settingsLockfileLifecycle as
              ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
        }
      : {}),
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
    ...(hasDisabledReplacementTerminal
      ? {
          disabledReplacementTerminal:
            disabledReplacementTerminal as ThirdPartyDataPackDisableTransactionTerminal
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
