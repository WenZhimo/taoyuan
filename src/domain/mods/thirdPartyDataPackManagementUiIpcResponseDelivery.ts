import type { ModDiagnosticRecovery } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackWebDomResponseDeliverySinkHost
} from './thirdPartyDataPackWebDomResponseDeliveryBridge'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeCommandId,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackWebResponseDeliveryAcknowledgement
} from './thirdPartyDataPackWebResponseDeliverySinkAdapter'

export type ThirdPartyDataPackManagementUiIpcCommandId =
  Exclude<ThirdPartyDataPackUiIpcResultEnvelopeCommandId, 'install'>

export interface ThirdPartyDataPackManagementUiIpcTerminal {
  readonly status: 'ready' | 'blocked'
  readonly requestedCommandId: ThirdPartyDataPackManagementUiIpcCommandId
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
}

export interface ThirdPartyDataPackWebManagementUiIpcResponseDeliveryResult {
  readonly status: 'delivered' | 'skipped' | 'blocked'
  readonly reason: string
  readonly webResponseDelivered: boolean
  readonly uiIpcResponseDelivered: boolean
  readonly envelope?: ThirdPartyDataPackUiIpcResultEnvelope
  readonly acknowledgement?: ThirdPartyDataPackWebResponseDeliveryAcknowledgement
}

export interface DeliverThirdPartyDataPackWebManagementUiIpcResponseOptions {
  readonly terminal: ThirdPartyDataPackManagementUiIpcTerminal
  readonly target?: EventTarget | null
  readonly eventName?: string
}

const freeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child)
  }
  return value
}

const summaryForTerminal = (
  terminal: ThirdPartyDataPackManagementUiIpcTerminal,
  diagnosticCount: number
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => freeze({
  selectedPackageCount: terminal.selectedPackageIds.length,
  blockedPackageCount: terminal.blockedPackageIds.length,
  blockedCandidateCount: 0,
  loadOrderCount: terminal.loadOrder.length,
  registryCount: terminal.registryCount,
  entryCount: terminal.entryCount,
  packageCount: terminal.packageCount,
  diagnosticCount
})

const outcomeForTerminal = (
  terminal: ThirdPartyDataPackManagementUiIpcTerminal
): ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind =>
  terminal.status === 'ready' ? 'success' : 'failure'

const recoveryForOutcome = (
  outcome: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): ModDiagnosticRecovery =>
  outcome === 'success' ? 'none' : 'retry'

export const createThirdPartyDataPackManagementUiIpcResponseEnvelope = (
  terminal: ThirdPartyDataPackManagementUiIpcTerminal
): ThirdPartyDataPackUiIpcResultEnvelope => {
  const kind = outcomeForTerminal(terminal)
  return freeze({
    formatVersion: 1,
    kind,
    commandId: terminal.requestedCommandId,
    packageId: terminal.targetPackageId,
    candidateHash: terminal.candidateIdentity?.candidateHash,
    lockfileHash: terminal.lockfileHash,
    messageKey: `mods.ui.ipc.result.${terminal.requestedCommandId}.${kind}`,
    recovery: recoveryForOutcome(kind),
    retryable: kind !== 'success',
    rollbackRequired: false,
    summary: summaryForTerminal(terminal, kind === 'success' ? 0 : 1),
    diagnostics: []
  })
}

export const deliverThirdPartyDataPackWebManagementUiIpcResponse = async(
  options: DeliverThirdPartyDataPackWebManagementUiIpcResponseOptions
): Promise<ThirdPartyDataPackWebManagementUiIpcResponseDeliveryResult> => {
  if (options.target === undefined || options.target === null) {
    return freeze({
      status: 'skipped',
      reason: 'Web management UI/IPC response delivery skipped because no EventTarget host was available',
      webResponseDelivered: false,
      uiIpcResponseDelivered: false
    })
  }

  const envelope = createThirdPartyDataPackManagementUiIpcResponseEnvelope(options.terminal)
  const host = createThirdPartyDataPackWebDomResponseDeliverySinkHost({
    target: options.target,
    eventName: options.eventName
  })

  let acknowledgement: ThirdPartyDataPackWebResponseDeliveryAcknowledgement
  try {
    acknowledgement = await host.deliver(envelope)
  } catch {
    return freeze({
      status: 'blocked',
      reason: 'Web management UI/IPC response delivery host failed before acknowledgement',
      webResponseDelivered: false,
      uiIpcResponseDelivered: false,
      envelope
    })
  }

  const delivered = acknowledgement.status === 'acknowledged'
    && acknowledgement.channel === 'web-ui-response-event-sink'
    && acknowledgement.packageId === envelope.packageId
    && acknowledgement.envelopeKind === envelope.kind
    && acknowledgement.messageKey === envelope.messageKey

  return freeze({
    status: delivered ? 'delivered' : 'blocked',
    reason: delivered
      ? 'Web management UI/IPC response delivery published a path-free command result envelope'
      : 'Web management UI/IPC response delivery acknowledgement did not match the command result envelope',
    webResponseDelivered: delivered,
    uiIpcResponseDelivered: delivered,
    envelope,
    ...(delivered ? { acknowledgement } : {})
  })
}
