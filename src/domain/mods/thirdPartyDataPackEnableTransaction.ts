import type { RegistrySet } from './registry'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyCandidateIdentitySummary } from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
import type { ThirdPartyDataPackMountInputResult } from './thirdPartyDataPackMountInput'
import {
  createThirdPartyDataPackLiveRegistrySwapHost,
  type ThirdPartyDataPackInMemoryLiveRegistryReference
} from './thirdPartyDataPackLiveRegistrySwapHost'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId,
} from './thirdPartyDataPackLiveRegistrySwapProtection'
import type {
  ThirdPartyDataPackLiveRegistrySwapHostResult
} from './thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  createThirdPartyDataPackRuntimePublicationCommitHost,
} from './thirdPartyDataPackRuntimePublicationCommitHost'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId,
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackRuntimePublicationCommitHostResult,
  ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary
} from './thirdPartyDataPackRuntimePublicationCommitSource'

export const THIRD_PARTY_DATA_PACK_ENABLE_COMMAND_ID = 'enable' as const

export interface ThirdPartyDataPackEnableState {
  readonly requestedCommandId: typeof THIRD_PARTY_DATA_PACK_ENABLE_COMMAND_ID
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly []
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
}

export interface ThirdPartyDataPackEnableTransactionTerminal {
  readonly status: 'ready' | 'blocked'
  readonly requestedCommandId: typeof THIRD_PARTY_DATA_PACK_ENABLE_COMMAND_ID
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly []
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly settingsWritten: boolean
  readonly lockfileWritten: boolean
  readonly startupStateWritten: boolean
  readonly packageFilesPreserved: boolean
  readonly runtimePublicationIncluded: boolean
  readonly liveRegistrySwapped: boolean
  readonly appStartupHandoffAccepted: boolean
  readonly reason: string
}

export interface ThirdPartyDataPackEnablePersistentWriteResult {
  readonly settingsWritten: boolean
  readonly lockfileWritten: boolean
  readonly startupStateWritten: boolean
  readonly packageFilesPreserved: boolean
}

export interface ThirdPartyDataPackEnableTransactionResult {
  readonly terminal: ThirdPartyDataPackEnableTransactionTerminal
  readonly runtimePublicationCommit?: ThirdPartyDataPackRuntimePublicationCommitHostResult
  readonly liveRegistrySwap?: ThirdPartyDataPackLiveRegistrySwapHostResult
}

export interface CreateThirdPartyDataPackEnableStateOptions {
  readonly disabledDraft: ThirdPartyDataPackLockfileDraft
  readonly enabledMountInput: ThirdPartyDataPackMountInputResult
  readonly targetPackageId: PackageId
}

export interface ThirdPartyDataPackEnablePersistentRecord {
  readonly recordId: string
  readonly requestedCommandId: typeof THIRD_PARTY_DATA_PACK_ENABLE_COMMAND_ID
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly []
  readonly loadOrder: readonly PackageId[]
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
}

export interface ThirdPartyDataPackEnableStartupPersistentStateSnapshot {
  readonly formatVersion: 1
  readonly kind: 'electron-startup-persistent-state-snapshot' | 'web-startup-persistent-state-snapshot'
  readonly packageId: PackageId
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly transactionLog: { readonly committed: true }
  readonly packageState: { readonly matched: true }
  readonly settingsState: { readonly matched: true }
  readonly modLockState: { readonly matched: true }
  readonly liveRegistry: { readonly matched: true }
  readonly saveCache: { readonly isolated: true }
}

const freeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child)
  }
  return value
}

const cloneDraft = (draft: ThirdPartyDataPackLockfileDraft): ThirdPartyDataPackLockfileDraft =>
  JSON.parse(JSON.stringify(draft)) as ThirdPartyDataPackLockfileDraft

const draftBodyHash = (draft: ThirdPartyDataPackLockfileDraft): Sha256Hash => {
  const { lockfileHash: _lockfileHash, ...body } = draft
  return hashCanonicalJson(body) as Sha256Hash
}

export const buildThirdPartyDataPackEnableState = (
  options: CreateThirdPartyDataPackEnableStateOptions
): ThirdPartyDataPackEnableState => {
  const disabledPackage = options.disabledDraft.packages.find(
    currentPackage => currentPackage.packageId === options.targetPackageId
  )
  if (disabledPackage === undefined) {
    throw new Error('Cannot enable a package that is not present in the disabled lockfile')
  }
  if (
    options.disabledDraft.selectedPackageIds.length !== 0
    || options.disabledDraft.loadOrder.length !== 0
  ) {
    throw new Error('Only a disabled installed package can be enabled by this transaction')
  }

  const mountInput = options.enabledMountInput
  const enabledDraft = mountInput.lockfileDraft
  const enabledPackage = enabledDraft?.packages.find(
    currentPackage => currentPackage.packageId === options.targetPackageId
  )
  if (
    mountInput.status !== 'ready'
    || mountInput.candidateRegistrySet === undefined
    || mountInput.candidateIdentity === undefined
    || mountInput.lockfileHash === undefined
    || enabledDraft === undefined
    || enabledPackage === undefined
    || !mountInput.selectedPackageIds.includes(options.targetPackageId)
    || !mountInput.loadOrder.includes(options.targetPackageId)
    || mountInput.blockedPackageIds.includes(options.targetPackageId)
    || enabledDraft.lockfileHash !== mountInput.lockfileHash
    || enabledDraft.lockfileHash !== draftBodyHash(enabledDraft)
    || enabledDraft.candidateIdentity.candidateHash !== mountInput.candidateIdentity.candidateHash
    || enabledDraft.selectedPackageIds.length !== mountInput.selectedPackageIds.length
    || enabledDraft.selectedPackageIds.some((packageId, index) => packageId !== mountInput.selectedPackageIds[index])
    || enabledDraft.loadOrder.length !== mountInput.loadOrder.length
    || enabledDraft.loadOrder.some((packageId, index) => packageId !== mountInput.loadOrder[index])
  ) {
    throw new Error('Enable transaction requires a ready restored package runtime candidate')
  }
  if (disabledPackage.source.candidatePath !== enabledPackage.source.candidatePath) {
    throw new Error('Enable transaction restored package source does not match the disabled package')
  }

  return freeze({
    requestedCommandId: THIRD_PARTY_DATA_PACK_ENABLE_COMMAND_ID,
    targetPackageId: options.targetPackageId,
    selectedPackageIds: [...mountInput.selectedPackageIds],
    blockedPackageIds: [],
    blockedCandidatePaths: [...mountInput.blockedCandidatePaths],
    loadOrder: [...mountInput.loadOrder],
    registryCount: mountInput.registryCount,
    entryCount: mountInput.entryCount,
    packageCount: mountInput.packageCount,
    candidateIdentity: mountInput.candidateIdentity,
    lockfileHash: mountInput.lockfileHash,
    lockfileDraft: cloneDraft(enabledDraft)
  })
}

export const createThirdPartyDataPackEnablePersistentRecord = (
  recordId: string,
  state: ThirdPartyDataPackEnableState
): ThirdPartyDataPackEnablePersistentRecord => freeze({
  recordId,
  requestedCommandId: state.requestedCommandId,
  targetPackageId: state.targetPackageId,
  selectedPackageIds: [...state.selectedPackageIds],
  blockedPackageIds: [],
  loadOrder: [...state.loadOrder],
  candidateHash: state.candidateIdentity.candidateHash,
  lockfileHash: state.lockfileHash,
  lockfileDraft: cloneDraft(state.lockfileDraft)
})

export const createThirdPartyDataPackEnableStartupPersistentStateSnapshot = (
  state: ThirdPartyDataPackEnableState,
  kind: ThirdPartyDataPackEnableStartupPersistentStateSnapshot['kind']
): ThirdPartyDataPackEnableStartupPersistentStateSnapshot => freeze({
  formatVersion: 1,
  kind,
  packageId: state.targetPackageId,
  candidateIdentity: state.candidateIdentity,
  lockfileHash: state.lockfileHash,
  transactionLog: { committed: true },
  packageState: { matched: true },
  settingsState: { matched: true },
  modLockState: { matched: true },
  liveRegistry: { matched: true },
  saveCache: { isolated: true }
})

export const createThirdPartyDataPackEnableTerminal = (options: {
  readonly state: ThirdPartyDataPackEnableState
  readonly status: 'ready' | 'blocked'
  readonly settingsWritten?: boolean
  readonly lockfileWritten?: boolean
  readonly startupStateWritten?: boolean
  readonly packageFilesPreserved?: boolean
  readonly runtimePublicationIncluded?: boolean
  readonly liveRegistrySwapped?: boolean
  readonly appStartupHandoffAccepted?: boolean
  readonly reason: string
}): ThirdPartyDataPackEnableTransactionTerminal => freeze({
  status: options.status,
  requestedCommandId: options.state.requestedCommandId,
  targetPackageId: options.state.targetPackageId,
  selectedPackageIds: [...options.state.selectedPackageIds],
  blockedPackageIds: [],
  loadOrder: [...options.state.loadOrder],
  registryCount: options.state.registryCount,
  entryCount: options.state.entryCount,
  packageCount: options.state.packageCount,
  candidateIdentity: options.state.candidateIdentity,
  lockfileHash: options.state.lockfileHash,
  settingsWritten: options.settingsWritten === true,
  lockfileWritten: options.lockfileWritten === true,
  startupStateWritten: options.startupStateWritten === true,
  packageFilesPreserved: options.packageFilesPreserved !== false,
  runtimePublicationIncluded: options.runtimePublicationIncluded ?? options.status === 'ready',
  liveRegistrySwapped: options.liveRegistrySwapped === true,
  appStartupHandoffAccepted: options.appStartupHandoffAccepted === true,
  reason: options.reason
})

const runtimeCommitAdapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[] =
  Object.freeze([
    'atomic-runtime-publication-commit-adapter',
    'transaction-log-writer',
    'package-file-commit-adapter',
    'settings-lockfile-commit-adapter',
    'live-registry-publication-adapter',
    'post-commit-verification-adapter',
    'rollback-recovery-orchestrator'
  ])

const runtimeCommitStageIds: readonly ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary['id'][] =
  Object.freeze([
    'commit-adapter-inspection',
    'transaction-log-prepare',
    'package-files-commit',
    'settings-lockfile-commit',
    'live-registry-publication',
    'post-commit-verification',
    'rollback-recovery-handoff',
    'commit-diagnostics-finalization'
  ])

const runtimeCommitStageSummaries: readonly ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary[] =
  Object.freeze(runtimeCommitStageIds.map(id => ({ id, status: 'satisfied' as const })))

const liveRegistryProtectionIds: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[] =
  Object.freeze([
    'single-assignment-live-registry-reference',
    'previous-registry-identity-retention',
    'candidate-artifact-visibility-barrier',
    'post-swap-verification',
    'rollback-restore-diagnostics'
  ])

export interface ExecuteThirdPartyDataPackEnableTransactionOptions {
  readonly state: ThirdPartyDataPackEnableState
  readonly candidateRegistrySet: RegistrySet
  readonly liveRegistryReference: ThirdPartyDataPackInMemoryLiveRegistryReference
  readonly writePersistentState: (
    record: ThirdPartyDataPackEnablePersistentRecord,
    state: ThirdPartyDataPackEnableState
  ) => Promise<ThirdPartyDataPackEnablePersistentWriteResult>
  readonly acknowledgeAppStartupHandoff: (
    state: ThirdPartyDataPackEnableState,
    liveRegistrySwap: ThirdPartyDataPackLiveRegistrySwapHostResult
  ) => boolean | Promise<boolean>
}

const createRuntimePublicationCommitEnvelope = (
  state: ThirdPartyDataPackEnableState
) => ({
  requestedCommandId: state.requestedCommandId,
  targetPackageId: state.targetPackageId,
  selectedPackageIds: [...state.selectedPackageIds],
  blockedPackageIds: [...state.blockedPackageIds],
  blockedCandidatePaths: [...state.blockedCandidatePaths],
  loadOrder: [...state.loadOrder],
  registryCount: state.registryCount,
  entryCount: state.entryCount,
  packageCount: state.packageCount,
  candidateIdentity: state.candidateIdentity,
  lockfileHash: state.lockfileHash,
  commitStageSummaries: runtimeCommitStageSummaries,
  requiredCommitAdapterIds: runtimeCommitAdapterIds
})

const createLiveRegistrySwapEnvelope = (
  state: ThirdPartyDataPackEnableState
) => ({
  requestedCommandId: state.requestedCommandId,
  targetPackageId: state.targetPackageId,
  selectedPackageIds: [...state.selectedPackageIds],
  blockedPackageIds: [...state.blockedPackageIds],
  blockedCandidatePaths: [...state.blockedCandidatePaths],
  loadOrder: [...state.loadOrder],
  registryCount: state.registryCount,
  entryCount: state.entryCount,
  packageCount: state.packageCount,
  officialIdentity: state.lockfileDraft.officialIdentity,
  candidateIdentity: state.candidateIdentity,
  lockfileHash: state.lockfileHash,
  liveRegistrySwap: 'deferred' as const,
  requiredProtectionIds: liveRegistryProtectionIds
})

export const executeThirdPartyDataPackEnableTransaction = async (
  options: ExecuteThirdPartyDataPackEnableTransactionOptions
): Promise<ThirdPartyDataPackEnableTransactionResult> => {
  const record = createThirdPartyDataPackEnablePersistentRecord('active', options.state)
  let persistentWrite: ThirdPartyDataPackEnablePersistentWriteResult
  try {
    persistentWrite = await options.writePersistentState(record, options.state)
  } catch {
    return {
      terminal: createThirdPartyDataPackEnableTerminal({
        state: options.state,
        status: 'blocked',
        reason: 'enable transaction persistent state write failed before runtime publication'
      })
    }
  }

  const persistentOptions = {
    settingsWritten: persistentWrite.settingsWritten,
    lockfileWritten: persistentWrite.lockfileWritten,
    startupStateWritten: persistentWrite.startupStateWritten,
    packageFilesPreserved: persistentWrite.packageFilesPreserved
  }
  if (
    persistentWrite.settingsWritten !== true
    || persistentWrite.lockfileWritten !== true
    || persistentWrite.startupStateWritten !== true
    || persistentWrite.packageFilesPreserved !== true
  ) {
    return {
      terminal: createThirdPartyDataPackEnableTerminal({
        state: options.state,
        status: 'blocked',
        ...persistentOptions,
        reason: 'enable transaction persistent state write did not settle all required boundaries'
      })
    }
  }

  const runtimePublicationCommitHost = createThirdPartyDataPackRuntimePublicationCommitHost({
    selectedPackageIds: options.state.selectedPackageIds,
    blockedPackageIds: options.state.blockedPackageIds,
    blockedCandidatePaths: options.state.blockedCandidatePaths,
    loadOrder: options.state.loadOrder,
    registryCount: options.state.registryCount,
    entryCount: options.state.entryCount,
    packageCount: options.state.packageCount,
    candidateIdentity: options.state.candidateIdentity,
    lockfileHash: options.state.lockfileHash
  })
  const runtimePublicationCommit = await runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit(
    createRuntimePublicationCommitEnvelope(options.state)
  )
  if (runtimePublicationCommit.status !== 'accepted') {
    return {
      terminal: createThirdPartyDataPackEnableTerminal({
        state: options.state,
        status: 'blocked',
        ...persistentOptions,
        runtimePublicationIncluded: false,
        reason: 'enable transaction runtime publication commit was blocked'
      }),
      runtimePublicationCommit
    }
  }

  const liveRegistryHost = createThirdPartyDataPackLiveRegistrySwapHost({
    liveRegistryReference: options.liveRegistryReference,
    candidateRegistrySet: options.candidateRegistrySet,
    candidateIdentity: options.state.candidateIdentity
  })
  const liveRegistrySwap = await liveRegistryHost.executeLiveRegistrySwap(
    createLiveRegistrySwapEnvelope(options.state)
  )
  if (liveRegistrySwap.status !== 'swapped') {
    return {
      terminal: createThirdPartyDataPackEnableTerminal({
        state: options.state,
        status: 'blocked',
        ...persistentOptions,
        runtimePublicationIncluded: true,
        reason: 'enable transaction live registry swap was blocked'
      }),
      runtimePublicationCommit,
      liveRegistrySwap
    }
  }

  let appStartupHandoffAccepted = false
  try {
    appStartupHandoffAccepted = await options.acknowledgeAppStartupHandoff(
      options.state,
      liveRegistrySwap
    )
  } catch {
    appStartupHandoffAccepted = false
  }

  return {
    terminal: createThirdPartyDataPackEnableTerminal({
      state: options.state,
      status: appStartupHandoffAccepted ? 'ready' : 'blocked',
      ...persistentOptions,
      runtimePublicationIncluded: true,
      liveRegistrySwapped: true,
      appStartupHandoffAccepted,
      reason: appStartupHandoffAccepted
        ? 'enable transaction committed and handed off to the mounted application'
        : 'enable transaction committed but mounted application startup handoff was not accepted'
    }),
    runtimePublicationCommit,
    liveRegistrySwap
  }
}
