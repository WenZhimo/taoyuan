import { createOfficialContentHash } from './officialPrecompiled'
import {
  createSerializableRegistrySnapshot,
  RegistrySet,
  type RegistryEntry,
  type RegistryEntrySource,
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
import {
  runtimeCommandTargetMatchesPackageState,
  type ThirdPartyDataPackRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

export interface ThirdPartyDataPackInMemoryLiveRegistryReference {
  current: RegistrySet
}

export interface ThirdPartyDataPackLiveRegistrySwapHostRecord {
  readonly requestedCommandId: ThirdPartyDataPackRuntimeCommandId
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
  accepted: boolean,
  commandId: ThirdPartyDataPackRuntimeCommandId
): ThirdPartyDataPackLiveRegistrySwapHostEffectSummary => Object.freeze({
  liveRegistrySwapHostCalled: true,
  liveRegistrySwapHostAccepted: accepted,
  thirdPartyRegistryPublished: accepted && (commandId === 'install' || commandId === 'enable'),
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
  requestedCommandId: envelope.requestedCommandId,
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

const cloneRegistryEntrySource = (
  source: RegistryEntrySource | undefined
): Omit<RegistryEntrySource, 'packageId'> | undefined => {
  if (!source) return undefined
  return {
    file: source.file,
    localId: source.localId
  }
}

const cloneRegistrySetExcludingOwners = (
  registrySet: RegistrySet,
  excludedOwners: ReadonlySet<PackageId>
): RegistrySet => {
  const result = new RegistrySet()
  for (const registryId of registrySet.registryIds()) {
    const registry = registrySet.get<RegistryEntry>(registryId)
    result.defineRegistry(registry.definition)
  }
  result.freezeDefinitions()

  for (const registryId of registrySet.registryIds()) {
    const sourceRegistry = registrySet.get<RegistryEntry>(registryId)
    const targetRegistry = result.get<RegistryEntry>(registryId)
    for (const record of sourceRegistry.entries()) {
      if (excludedOwners.has(record.owner)) continue
      targetRegistry.register(record.owner, record.entry, cloneRegistryEntrySource(record.source))
    }
  }

  result.freezeEntries()
  return result
}

const installPreviousRegistryMatchesEnvelope = (
  previousRegistrySet: RegistrySet,
  previousSummary: RegistrySetSummary,
  envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope
): boolean => {
  if (currentRegistryMatchesOfficialEnvelope(previousSummary, envelope)) return true
  if (envelope.requestedCommandId !== 'install' || envelope.selectedPackageIds.length === 0) return false

  const selectedPackageOwners = new Set<PackageId>(envelope.selectedPackageIds)
  const baselineWithoutSelectedPackages = summarizeRegistrySet(
    cloneRegistrySetExcludingOwners(previousRegistrySet, selectedPackageOwners)
  )
  return currentRegistryMatchesOfficialEnvelope(baselineWithoutSelectedPackages, envelope)
}

const uninstallPreviousRegistryMatchesEnvelope = (
  previousRegistrySet: RegistrySet,
  previousSummary: RegistrySetSummary,
  envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope
): boolean => {
  if (currentRegistryMatchesOfficialEnvelope(previousSummary, envelope)) return true
  if (envelope.requestedCommandId !== 'uninstall') return false

  const baselineWithoutTargetPackage = summarizeRegistrySet(
    cloneRegistrySetExcludingOwners(previousRegistrySet, new Set<PackageId>([envelope.targetPackageId]))
  )
  return currentRegistryMatchesOfficialEnvelope(baselineWithoutTargetPackage, envelope)
}

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

    const validEnvelope = envelope.liveRegistrySwap === 'deferred'
      && runtimeCommandTargetMatchesPackageState(
        envelope.requestedCommandId,
        envelope.targetPackageId,
        envelope.selectedPackageIds,
        envelope.blockedPackageIds,
        envelope.loadOrder
      )
      && arraysEqual(envelope.loadOrder, envelope.selectedPackageIds)
      && hasAllRequiredProtectionIds(envelope.requiredProtectionIds)
    const previousRegistryMatchesCommand = envelope.requestedCommandId === 'disable'
      || installPreviousRegistryMatchesEnvelope(previousRegistrySet, previousSummary, envelope)
      || uninstallPreviousRegistryMatchesEnvelope(previousRegistrySet, previousSummary, envelope)

    if (
      !validEnvelope
      || !previousRegistryMatchesCommand
      || !candidateIdentityMatches(options.candidateIdentity, envelope.candidateIdentity)
      || !candidateRegistryMatchesIdentity(candidateSummary, options.candidateIdentity)
      || !candidateRegistryMatchesEnvelope(candidateSummary, envelope)
      || options.candidateRegistrySet.currentPhase !== 'frozen'
    ) {
      return buildHostResult(envelope, {
        status: 'blocked',
        stage: 'third-party.live-registry-swap-host.blocked',
        effects: hostEffects(false, envelope.requestedCommandId)
      })
    }

    options.liveRegistryReference.current = options.candidateRegistrySet
    retainedPreviousRegistrySet = previousRegistrySet
    sequenceNumber += 1
    lastSwapRecord = deepFreezeObjectGraph({
      requestedCommandId: envelope.requestedCommandId,
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
      effects: hostEffects(true, envelope.requestedCommandId)
    })
  }

  return Object.freeze({
    executeLiveRegistrySwap,
    getLastSwapRecord: () => lastSwapRecord,
    getRetainedPreviousRegistrySet: () => retainedPreviousRegistrySet
  })
}
