import { createOfficialContentHash } from './officialPrecompiled'
import {
  createSerializableRegistrySnapshot,
  type RegistrySet
} from './registry'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyCandidateIdentitySummary } from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
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

export const THIRD_PARTY_DATA_PACK_DISABLE_COMMAND_ID = 'disable' as const

export interface ThirdPartyDataPackDisableState {
  readonly requestedCommandId: typeof THIRD_PARTY_DATA_PACK_DISABLE_COMMAND_ID
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly []
  readonly blockedPackageIds: readonly [PackageId]
  readonly blockedCandidatePaths: readonly []
  readonly loadOrder: readonly []
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
}

export interface ThirdPartyDataPackDisableTransactionTerminal {
  readonly status: 'ready' | 'blocked'
  readonly requestedCommandId: typeof THIRD_PARTY_DATA_PACK_DISABLE_COMMAND_ID
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly []
  readonly blockedPackageIds: readonly [PackageId]
  readonly loadOrder: readonly []
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly settingsWritten: boolean
  readonly lockfileWritten: boolean
  readonly startupStateWritten: boolean
  readonly packageFilesPreserved: boolean
  readonly runtimePublicationExcluded: boolean
  readonly liveRegistrySwapped: boolean
  readonly appStartupHandoffAccepted: boolean
  readonly reason: string
}

export interface ThirdPartyDataPackDisablePersistentWriteResult {
  readonly settingsWritten: boolean
  readonly lockfileWritten: boolean
  readonly startupStateWritten: boolean
  readonly packageFilesPreserved: boolean
}

export interface ThirdPartyDataPackDisableAppStartupHandoffEvidence {
  readonly realAppStartupHostCalled: true
  readonly gameAppCreated: true
  readonly piniaCreated: true
  readonly routerMounted: true
}

export interface ThirdPartyDataPackDisableTransactionResult {
  readonly terminal: ThirdPartyDataPackDisableTransactionTerminal
  readonly runtimePublicationCommit?: ThirdPartyDataPackRuntimePublicationCommitHostResult
  readonly liveRegistrySwap?: ThirdPartyDataPackLiveRegistrySwapHostResult
}

export interface CreateThirdPartyDataPackDisableStateOptions {
  readonly officialRegistrySet: RegistrySet
  readonly installedDraft: ThirdPartyDataPackLockfileDraft
  readonly targetPackageId: PackageId
}

export interface ThirdPartyDataPackDisablePersistentRecord {
  readonly recordId: string
  readonly requestedCommandId: typeof THIRD_PARTY_DATA_PACK_DISABLE_COMMAND_ID
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly []
  readonly blockedPackageIds: readonly [PackageId]
  readonly loadOrder: readonly []
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
}

export interface ThirdPartyDataPackDisableStartupPersistentStateSnapshot {
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

export const buildThirdPartyDataPackDisableState = (
  options: CreateThirdPartyDataPackDisableStateOptions
): ThirdPartyDataPackDisableState => {
  const targetPackage = options.installedDraft.packages.find(
    currentPackage => currentPackage.packageId === options.targetPackageId
  )
  if (targetPackage === undefined) {
    throw new Error('Cannot disable a package that is not present in the installed lockfile')
  }

  const officialSnapshot = createSerializableRegistrySnapshot(options.officialRegistrySet)
  const officialContentHash = createOfficialContentHash(officialSnapshot)
  const officialEntryCount = officialSnapshot.registries.reduce(
    (count, registry) => count + registry.entries.length,
    0
  )
  const candidateIdentity = {
    formatVersion: 1 as const,
    contentHash: officialContentHash,
    snapshotHash: officialSnapshot.snapshotHash as Sha256Hash,
    candidateHash: hashCanonicalJson({
      formatVersion: 1,
      commandId: THIRD_PARTY_DATA_PACK_DISABLE_COMMAND_ID,
      targetPackageId: options.targetPackageId,
      officialIdentity: options.installedDraft.officialIdentity,
      selectedPackageIds: [],
      blockedPackageIds: [options.targetPackageId],
      loadOrder: [],
      contentHash: officialContentHash,
      snapshotHash: officialSnapshot.snapshotHash
    }) as Sha256Hash
  }
  const draftBody = {
    ...cloneDraft(options.installedDraft),
    registryCount: officialSnapshot.registries.length,
    entryCount: officialEntryCount,
    selectedPackageIds: [],
    loadOrder: [],
    candidateIdentity
  }
  const lockfileDraft = {
    ...draftBody,
    lockfileHash: hashCanonicalJson(draftBody) as Sha256Hash
  } as ThirdPartyDataPackLockfileDraft

  return freeze({
    requestedCommandId: THIRD_PARTY_DATA_PACK_DISABLE_COMMAND_ID,
    targetPackageId: options.targetPackageId,
    selectedPackageIds: [],
    blockedPackageIds: [options.targetPackageId],
    blockedCandidatePaths: [],
    loadOrder: [],
    registryCount: officialSnapshot.registries.length,
    entryCount: officialSnapshot.registries.reduce((count, registry) => count + registry.entries.length, 0),
    packageCount: lockfileDraft.packages.length,
    candidateIdentity,
    lockfileHash: lockfileDraft.lockfileHash,
    lockfileDraft
  })
}

export const createThirdPartyDataPackDisablePersistentRecord = (
  recordId: string,
  state: ThirdPartyDataPackDisableState
): ThirdPartyDataPackDisablePersistentRecord => freeze({
  recordId,
  requestedCommandId: state.requestedCommandId,
  targetPackageId: state.targetPackageId,
  selectedPackageIds: [],
  blockedPackageIds: [state.targetPackageId],
  loadOrder: [],
  candidateHash: state.candidateIdentity.candidateHash,
  lockfileHash: state.lockfileHash,
  lockfileDraft: cloneDraft(state.lockfileDraft)
})

export const createThirdPartyDataPackDisableStartupPersistentStateSnapshot = (
  state: ThirdPartyDataPackDisableState,
  kind: ThirdPartyDataPackDisableStartupPersistentStateSnapshot['kind']
): ThirdPartyDataPackDisableStartupPersistentStateSnapshot => freeze({
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

export const createThirdPartyDataPackDisableTerminal = (options: {
  readonly state: ThirdPartyDataPackDisableState
  readonly status: 'ready' | 'blocked'
  readonly settingsWritten?: boolean
  readonly lockfileWritten?: boolean
  readonly startupStateWritten?: boolean
  readonly packageFilesPreserved?: boolean
  readonly runtimePublicationExcluded?: boolean
  readonly liveRegistrySwapped?: boolean
  readonly appStartupHandoffAccepted?: boolean
  readonly reason: string
}): ThirdPartyDataPackDisableTransactionTerminal => freeze({
  status: options.status,
  requestedCommandId: options.state.requestedCommandId,
  targetPackageId: options.state.targetPackageId,
  selectedPackageIds: [],
  blockedPackageIds: [options.state.targetPackageId],
  loadOrder: [],
  registryCount: options.state.registryCount,
  entryCount: options.state.entryCount,
  packageCount: options.state.packageCount,
  candidateIdentity: options.state.candidateIdentity,
  lockfileHash: options.state.lockfileHash,
  settingsWritten: options.settingsWritten === true,
  lockfileWritten: options.lockfileWritten === true,
  startupStateWritten: options.startupStateWritten === true,
  packageFilesPreserved: options.packageFilesPreserved !== false,
  runtimePublicationExcluded: options.runtimePublicationExcluded ?? options.status === 'ready',
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

export interface ExecuteThirdPartyDataPackDisableTransactionOptions {
  readonly state: ThirdPartyDataPackDisableState
  readonly candidateRegistrySet: RegistrySet
  readonly liveRegistryReference: ThirdPartyDataPackInMemoryLiveRegistryReference
  readonly writePersistentState: (
    record: ThirdPartyDataPackDisablePersistentRecord,
    state: ThirdPartyDataPackDisableState
  ) => Promise<ThirdPartyDataPackDisablePersistentWriteResult>
  readonly acknowledgeAppStartupHandoff: (
    state: ThirdPartyDataPackDisableState,
    liveRegistrySwap: ThirdPartyDataPackLiveRegistrySwapHostResult
  ) => boolean | Promise<boolean>
}

const createRuntimePublicationCommitEnvelope = (
  state: ThirdPartyDataPackDisableState
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
  state: ThirdPartyDataPackDisableState
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

export const executeThirdPartyDataPackDisableTransaction = async (
  options: ExecuteThirdPartyDataPackDisableTransactionOptions
): Promise<ThirdPartyDataPackDisableTransactionResult> => {
  const record = createThirdPartyDataPackDisablePersistentRecord('active', options.state)
  let persistentWrite: ThirdPartyDataPackDisablePersistentWriteResult
  try {
    persistentWrite = await options.writePersistentState(record, options.state)
  } catch {
    return {
      terminal: createThirdPartyDataPackDisableTerminal({
        state: options.state,
        status: 'blocked',
        reason: 'disable transaction persistent state write failed before runtime publication'
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
      terminal: createThirdPartyDataPackDisableTerminal({
        state: options.state,
        status: 'blocked',
        ...persistentOptions,
        reason: 'disable transaction persistent state write did not settle all required boundaries'
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
      terminal: createThirdPartyDataPackDisableTerminal({
        state: options.state,
        status: 'blocked',
        ...persistentOptions,
        runtimePublicationExcluded: false,
        reason: 'disable transaction runtime publication commit was blocked'
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
      terminal: createThirdPartyDataPackDisableTerminal({
        state: options.state,
        status: 'blocked',
        ...persistentOptions,
        runtimePublicationExcluded: true,
        reason: 'disable transaction live registry swap was blocked'
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
    terminal: createThirdPartyDataPackDisableTerminal({
      state: options.state,
      status: appStartupHandoffAccepted ? 'ready' : 'blocked',
      ...persistentOptions,
      runtimePublicationExcluded: true,
      liveRegistrySwapped: true,
      appStartupHandoffAccepted,
      reason: appStartupHandoffAccepted
        ? 'disable transaction committed and handed off to the mounted application'
        : 'disable transaction committed but mounted application startup handoff was not accepted'
    }),
    runtimePublicationCommit,
    liveRegistrySwap
  }
}
