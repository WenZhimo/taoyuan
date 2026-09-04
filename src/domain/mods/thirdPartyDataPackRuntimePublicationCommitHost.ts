import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyCandidateIdentitySummary } from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitHostEnvelope,
  ThirdPartyDataPackRuntimePublicationCommitHostResult
} from './thirdPartyDataPackRuntimePublicationCommitSource'
import {
  runtimeCommandTargetMatchesPackageState,
  runtimeCommandTargetPackageId,
  type ThirdPartyDataPackRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

export interface ThirdPartyDataPackRuntimePublicationCommitHostRecord {
  readonly requestedCommandId: ThirdPartyDataPackRuntimeCommandId
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly sequenceNumber: number
}

export interface ThirdPartyDataPackRuntimePublicationCommitHost {
  readonly acknowledgeRuntimePublicationCommit: (
    envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
  ) => Promise<ThirdPartyDataPackRuntimePublicationCommitHostResult>
  readonly getLastCommitRecord: () => ThirdPartyDataPackRuntimePublicationCommitHostRecord | undefined
}

export interface CreateThirdPartyDataPackRuntimePublicationCommitHostOptions {
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
}

const requiredCommitAdapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[] =
  Object.freeze([
    'atomic-runtime-publication-commit-adapter',
    'transaction-log-writer',
    'package-file-commit-adapter',
    'settings-lockfile-commit-adapter',
    'live-registry-publication-adapter',
    'post-commit-verification-adapter',
    'rollback-recovery-orchestrator'
  ])

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const clonePackageIds = (values: readonly PackageId[]): readonly PackageId[] =>
  Object.freeze([...values])

const cloneStrings = (values: readonly string[]): readonly string[] =>
  Object.freeze([...values])

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value as object)
    } catch {
      return value
    }
    for (const key of keys) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value as object, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        deepFreezeObjectGraph(descriptor.value)
      }
    }
  }
  return value
}

const candidateIdentityMatches = (
  left: ThirdPartyCandidateIdentitySummary,
  right: ThirdPartyCandidateIdentitySummary
): boolean => left.formatVersion === right.formatVersion
  && left.contentHash === right.contentHash
  && left.snapshotHash === right.snapshotHash
  && left.candidateHash === right.candidateHash

const hasAllRequiredCommitAdapterIds = (
  ids: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[]
): boolean => requiredCommitAdapterIds.every(id => ids.includes(id))

const hostEffects = (
  accepted: boolean
): ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary => Object.freeze({
  runtimePublicationCommitHostCalled: true,
  runtimePublicationCommitHostAccepted: accepted,
  realRuntimePublicationCommitCalled: accepted,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  transactionCommitted: false,
  runtimePublicationCommitted: accepted,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const hostDiagnostic = (
  stage: string,
  packageId: PackageId,
  severity: 'info' | 'error'
) => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity,
  stage,
  messageKey: severity === 'info'
    ? 'mods.info.lifecycle.transaction.runtimePublicationCommitHostAccepted'
    : 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: severity === 'info' ? 'none' : 'retry'
})

const buildHostResult = (
  envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope,
  options: {
    readonly status: 'accepted' | 'blocked'
    readonly stage: string
    readonly effects: ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary
  }
): ThirdPartyDataPackRuntimePublicationCommitHostResult => deepFreezeObjectGraph({
  status: options.status,
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: clonePackageIds(envelope.selectedPackageIds),
  blockedPackageIds: clonePackageIds(envelope.blockedPackageIds),
  blockedCandidatePaths: cloneStrings(envelope.blockedCandidatePaths),
  loadOrder: clonePackageIds(envelope.loadOrder),
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  runtimePublicationCommitAdapterStatus: 'deferred',
  diagnostics: Object.freeze([
    hostDiagnostic(options.stage, envelope.targetPackageId, options.status === 'accepted' ? 'info' : 'error')
  ]),
  effects: options.effects
})

const validEnvelope = (
  envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope,
  options: CreateThirdPartyDataPackRuntimePublicationCommitHostOptions
): boolean => envelope.targetPackageId === runtimeCommandTargetPackageId(
    envelope.requestedCommandId,
    options.selectedPackageIds,
    options.blockedPackageIds,
    envelope.targetPackageId
  )
  && runtimeCommandTargetMatchesPackageState(
    envelope.requestedCommandId,
    envelope.targetPackageId,
    options.selectedPackageIds,
    options.blockedPackageIds,
    options.loadOrder
  )
  && arraysEqual(envelope.selectedPackageIds, options.selectedPackageIds)
  && arraysEqual(envelope.blockedPackageIds, options.blockedPackageIds)
  && arraysEqual(envelope.blockedCandidatePaths, options.blockedCandidatePaths)
  && arraysEqual(envelope.loadOrder, options.loadOrder)
  && envelope.registryCount === options.registryCount
  && envelope.entryCount === options.entryCount
  && envelope.packageCount === options.packageCount
  && candidateIdentityMatches(envelope.candidateIdentity, options.candidateIdentity)
  && envelope.lockfileHash === options.lockfileHash
  && hasAllRequiredCommitAdapterIds(envelope.requiredCommitAdapterIds)

export const createThirdPartyDataPackRuntimePublicationCommitHost = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitHostOptions
): ThirdPartyDataPackRuntimePublicationCommitHost => {
  let lastCommitRecord: ThirdPartyDataPackRuntimePublicationCommitHostRecord | undefined
  let sequenceNumber = 0

  const acknowledgeRuntimePublicationCommit = async(
    envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
  ): Promise<ThirdPartyDataPackRuntimePublicationCommitHostResult> => {
    if (!validEnvelope(envelope, options)) {
      return buildHostResult(envelope, {
        status: 'blocked',
        stage: 'third-party.runtime-publication-commit-host.blocked',
        effects: hostEffects(false)
      })
    }

    sequenceNumber += 1
    lastCommitRecord = deepFreezeObjectGraph({
      requestedCommandId: envelope.requestedCommandId,
      targetPackageId: envelope.targetPackageId,
      selectedPackageIds: clonePackageIds(envelope.selectedPackageIds),
      blockedPackageIds: clonePackageIds(envelope.blockedPackageIds),
      blockedCandidatePaths: cloneStrings(envelope.blockedCandidatePaths),
      loadOrder: clonePackageIds(envelope.loadOrder),
      registryCount: envelope.registryCount,
      entryCount: envelope.entryCount,
      packageCount: envelope.packageCount,
      candidateHash: envelope.candidateIdentity.candidateHash,
      lockfileHash: envelope.lockfileHash,
      sequenceNumber
    })

    return buildHostResult(envelope, {
      status: 'accepted',
      stage: 'third-party.runtime-publication-commit-host.accepted',
      effects: hostEffects(true)
    })
  }

  return Object.freeze({
    acknowledgeRuntimePublicationCommit,
    getLastCommitRecord: () => lastCommitRecord
  })
}
