import { createOfficialContentHash } from './officialPrecompiled'
import {
  createSerializableRegistrySnapshot,
  type RegistrySet
} from './registry'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope,
  ThirdPartyDataPackLiveRegistrySwapHostEffectSummary,
  ThirdPartyDataPackLiveRegistrySwapHostResult
} from './thirdPartyDataPackLiveRegistrySwapExecutionSource'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId
} from './thirdPartyDataPackLiveRegistrySwapProtection'

export interface ThirdPartyDataPackInMemoryLiveRegistryReference {
  current: RegistrySet
}

export interface ThirdPartyDataPackLiveRegistrySwapHostRecord {
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly previousRegistryCount: number
  readonly previousEntryCount: number
  readonly previousContentHash: Sha256Hash
  readonly previousSnapshotHash: Sha256Hash
  readonly candidateRegistryCount: number
  readonly candidateEntryCount: number
  readonly candidateContentHash: Sha256Hash
  readonly candidateSnapshotHash: Sha256Hash
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly sequenceNumber: number
}

export interface ThirdPartyDataPackLiveRegistrySwapHost {
  readonly executeLiveRegistrySwap: (
    envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope
  ) => Promise<ThirdPartyDataPackLiveRegistrySwapHostResult>
  readonly getLastSwapRecord: () => ThirdPartyDataPackLiveRegistrySwapHostRecord | undefined
  readonly getRetainedPreviousRegistrySet: () => RegistrySet | undefined
}

export interface CreateThirdPartyDataPackLiveRegistrySwapHostOptions {
  readonly liveRegistryReference: ThirdPartyDataPackInMemoryLiveRegistryReference
  readonly candidateRegistrySet: RegistrySet
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
}

interface RegistrySetSummary {
  readonly registryCount: number
  readonly entryCount: number
  readonly contentHash: Sha256Hash
  readonly snapshotHash: Sha256Hash
}

const requiredProtectionIds: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[] = Object.freeze([
  'single-assignment-live-registry-reference',
  'previous-registry-identity-retention',
  'candidate-artifact-visibility-barrier',
  'post-swap-verification',
  'rollback-restore-diagnostics'
])

const summarizeRegistrySet = (registrySet: RegistrySet): RegistrySetSummary => {
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  return Object.freeze({
    registryCount: snapshot.registries.length,
    entryCount: snapshot.registries.reduce((total, registry) => total + registry.entries.length, 0),
    contentHash: createOfficialContentHash(snapshot),
    snapshotHash: snapshot.snapshotHash as Sha256Hash
  })
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hasAllRequiredProtectionIds = (
  protectionIds: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[]
): boolean => requiredProtectionIds.every(id => protectionIds.includes(id))

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

const hostEffects = (
  accepted: boolean
): ThirdPartyDataPackLiveRegistrySwapHostEffectSummary => Object.freeze({
  liveRegistrySwapHostCalled: true,
  liveRegistrySwapHostAccepted: accepted,
  thirdPartyRegistryPublished: accepted,
  liveRegistryMutated: accepted,
  liveRegistrySwapped: accepted,
  runtimeEnablementAllowed: accepted,
  officialRegistryPublished: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
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
    ? 'mods.info.lifecycle.transaction.liveRegistrySwapHostAccepted'
    : 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: severity === 'info' ? 'none' : 'retry'
})

const buildHostResult = (
  envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope,
  options: {
    readonly status: 'swapped' | 'blocked'
    readonly stage: string
    readonly candidateHash?: Sha256Hash
    readonly effects: ThirdPartyDataPackLiveRegistrySwapHostEffectSummary
  }
): ThirdPartyDataPackLiveRegistrySwapHostResult => deepFreezeObjectGraph({
  status: options.status,
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: clonePackageIds(envelope.selectedPackageIds),
  blockedPackageIds: clonePackageIds(envelope.blockedPackageIds),
  blockedCandidatePaths: cloneStrings(envelope.blockedCandidatePaths),
  loadOrder: clonePackageIds(envelope.loadOrder),
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: options.candidateHash ?? envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  protectionStatus: 'deferred',
  requiredProtectionIds: Object.freeze([...envelope.requiredProtectionIds]),
  diagnostics: Object.freeze([
    hostDiagnostic(options.stage, envelope.targetPackageId, options.status === 'swapped' ? 'info' : 'error')
  ]),
  effects: options.effects
})

const candidateIdentityMatches = (
  expected: ThirdPartyCandidateIdentitySummary,
  actual: ThirdPartyCandidateIdentitySummary
): boolean => expected.formatVersion === actual.formatVersion
  && expected.contentHash === actual.contentHash
  && expected.snapshotHash === actual.snapshotHash
  && expected.candidateHash === actual.candidateHash

const candidateRegistryMatchesIdentity = (
  candidate: RegistrySetSummary,
  identity: ThirdPartyCandidateIdentitySummary
): boolean => candidate.contentHash === identity.contentHash
  && candidate.snapshotHash === identity.snapshotHash

const currentRegistryMatchesOfficialEnvelope = (
  current: RegistrySetSummary,
  envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope
): boolean => current.registryCount === envelope.officialIdentity.registryCount
  && current.entryCount === envelope.officialIdentity.entryCount
  && current.contentHash === envelope.officialIdentity.contentHash
  && current.snapshotHash === envelope.officialIdentity.snapshotHash

const candidateRegistryMatchesEnvelope = (
  candidate: RegistrySetSummary,
  envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope
): boolean => candidate.registryCount === envelope.registryCount
  && candidate.entryCount === envelope.entryCount
  && candidate.contentHash === envelope.candidateIdentity.contentHash
  && candidate.snapshotHash === envelope.candidateIdentity.snapshotHash

export const createThirdPartyDataPackInMemoryLiveRegistryReference = (
  initialRegistrySet: RegistrySet
): ThirdPartyDataPackInMemoryLiveRegistryReference => ({ current: initialRegistrySet })

export const createThirdPartyDataPackLiveRegistrySwapHost = (
  options: CreateThirdPartyDataPackLiveRegistrySwapHostOptions
): ThirdPartyDataPackLiveRegistrySwapHost => {
  let retainedPreviousRegistrySet: RegistrySet | undefined
  let lastSwapRecord: ThirdPartyDataPackLiveRegistrySwapHostRecord | undefined
  let sequenceNumber = 0

  const executeLiveRegistrySwap = async(
    envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope
  ): Promise<ThirdPartyDataPackLiveRegistrySwapHostResult> => {
    const previousRegistrySet = options.liveRegistryReference.current
    const previousSummary = summarizeRegistrySet(previousRegistrySet)
    const candidateSummary = summarizeRegistrySet(options.candidateRegistrySet)

    const targetMatchesSelection = envelope.selectedPackageIds[0] === envelope.targetPackageId
    const validEnvelope = envelope.requestedCommandId === 'install'
      && envelope.liveRegistrySwap === 'deferred'
      && targetMatchesSelection
      && arraysEqual(envelope.loadOrder, envelope.selectedPackageIds)
      && hasAllRequiredProtectionIds(envelope.requiredProtectionIds)

    if (
      !validEnvelope
      || !currentRegistryMatchesOfficialEnvelope(previousSummary, envelope)
      || !candidateIdentityMatches(options.candidateIdentity, envelope.candidateIdentity)
      || !candidateRegistryMatchesIdentity(candidateSummary, options.candidateIdentity)
      || !candidateRegistryMatchesEnvelope(candidateSummary, envelope)
      || options.candidateRegistrySet.currentPhase !== 'frozen'
    ) {
      return buildHostResult(envelope, {
        status: 'blocked',
        stage: 'third-party.live-registry-swap-host.blocked',
        effects: hostEffects(false)
      })
    }

    options.liveRegistryReference.current = options.candidateRegistrySet
    retainedPreviousRegistrySet = previousRegistrySet
    sequenceNumber += 1
    lastSwapRecord = deepFreezeObjectGraph({
      requestedCommandId: 'install',
      targetPackageId: envelope.targetPackageId,
      selectedPackageIds: clonePackageIds(envelope.selectedPackageIds),
      blockedPackageIds: clonePackageIds(envelope.blockedPackageIds),
      blockedCandidatePaths: cloneStrings(envelope.blockedCandidatePaths),
      loadOrder: clonePackageIds(envelope.loadOrder),
      previousRegistryCount: previousSummary.registryCount,
      previousEntryCount: previousSummary.entryCount,
      previousContentHash: previousSummary.contentHash,
      previousSnapshotHash: previousSummary.snapshotHash,
      candidateRegistryCount: candidateSummary.registryCount,
      candidateEntryCount: candidateSummary.entryCount,
      candidateContentHash: candidateSummary.contentHash,
      candidateSnapshotHash: candidateSummary.snapshotHash,
      candidateHash: envelope.candidateIdentity.candidateHash,
      lockfileHash: envelope.lockfileHash,
      sequenceNumber
    })

    return buildHostResult(envelope, {
      status: 'swapped',
      stage: 'third-party.live-registry-swap-host.swapped',
      effects: hostEffects(true)
    })
  }

  return Object.freeze({
    executeLiveRegistrySwap,
    getLastSwapRecord: () => lastSwapRecord,
    getRetainedPreviousRegistrySet: () => retainedPreviousRegistrySet
  })
}
