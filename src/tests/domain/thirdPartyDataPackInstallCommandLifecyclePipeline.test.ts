import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackInstallCommandLifecyclePipeline
} from '@/domain/mods/thirdPartyDataPackInstallCommandLifecyclePipeline'
import {
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError,
  type ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorSource'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary,
  ThirdPartyDataPackPostCommitPersistentReadsProofs
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  ThirdPartyDataPackPostCommitVerificationSummary
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorSource'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary,
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherHandoff'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const summary: ThirdPartyDataPackPostCommitVerificationSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const persistentReadProofs: ThirdPartyDataPackPostCommitPersistentReadsProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
}

const handoffEffects: ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  transactionCommitted: false,
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
}

const installEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatched: false,
  transactionCommitted: false,
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
} as const

const runtimeCommitEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
} as const

const createDispatcherHandoff = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult> = {}
): ThirdPartyDataPackTransactionCommandDispatcherHandoffResult => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  postCommitVerificationPlanStatus: 'deferred',
  reason: 'transaction command dispatcher handoff is inspect-only until real command dispatch exists',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  transactionCommandDispatcherHandoff: 'deferred',
  readOnly: true,
  dispatcherHandoffAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  handoffChecks: [],
  handoffStages: [
    {
      id: 'dispatcher-handoff-inspection',
      status: 'satisfied',
      requirementIds: ['confirmed-command-envelope'],
      reason: 'Command handoff is consistent enough to inspect lifecycle execution.'
    },
    {
      id: 'install-transaction-commit',
      status: 'deferred',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'Install transaction commit remains deferred.'
    },
    {
      id: 'post-commit-verification-execution',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification remains deferred.'
    },
    {
      id: 'ui-ipc-result-handoff',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result'],
      reason: 'UI and IPC result delivery remains deferred.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      requirementIds: ['rollback-recovery-orchestrator'],
      reason: 'Rollback recovery remains deferred.'
    }
  ],
  dispatcherRequirements: [
    {
      id: 'atomic-transaction-commit-executor',
      status: 'required',
      reason: 'Persistent mutation must happen through one atomic executor.'
    }
  ],
  effects: handoffEffects,
  ...overrides
} as unknown as ThirdPartyDataPackTransactionCommandDispatcherHandoffResult)

const createInstallTransactionDispatchPlan = (
  overrides: Partial<ThirdPartyDataPackInstallTransactionDispatchPlanResult> = {}
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  reason: 'install transaction dispatch plan is inspect-only until command dispatch and atomic commit exist',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  installTransactionDispatchPlan: 'deferred',
  readOnly: true,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  checks: [],
  stages: [
    {
      id: 'dispatch-plan-inspection',
      status: 'satisfied',
      requirementIds: ['install-command-dispatcher'],
      reason: 'Install command and isolated write-probe evidence are consistent.'
    },
    {
      id: 'transaction-log-prepare',
      status: 'deferred',
      requirementIds: ['verified-transaction-log-entry'],
      reason: 'Transaction log preparation remains deferred.'
    },
    {
      id: 'package-file-stage',
      status: 'deferred',
      requirementIds: ['staged-package-file-commit'],
      reason: 'Package file staging remains deferred.'
    },
    {
      id: 'settings-lockfile-commit',
      status: 'deferred',
      requirementIds: ['atomic-settings-lockfile-commit'],
      reason: 'Settings and lockfile commit remains deferred.'
    },
    {
      id: 'runtime-publication-commit',
      status: 'deferred',
      requirementIds: ['runtime-publication-commit-adapter'],
      reason: 'Runtime publication commit remains deferred.'
    }
  ],
  requirements: [
    {
      id: 'verified-transaction-log-entry',
      status: 'required',
      reason: 'A future commit must verify a transaction log entry.'
    },
    {
      id: 'staged-package-file-commit',
      status: 'required',
      reason: 'A future commit must stage package files.'
    },
    {
      id: 'atomic-settings-lockfile-commit',
      status: 'required',
      reason: 'A future commit must replace settings and lockfile atomically.'
    },
    {
      id: 'runtime-publication-commit-adapter',
      status: 'required',
      reason: 'A future commit must hand off runtime publication.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  effects: installEffects,
  ...overrides
} as unknown as ThirdPartyDataPackInstallTransactionDispatchPlanResult)

const createRuntimePublicationCommitAdapter = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAdapterResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  reason: 'runtime publication commit adapter is inspect-only until atomic commit exists',
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  officialIdentity: {
    artifactHash: testHash('e'),
    contentHash: testHash('f'),
    schemaSetHash: testHash('1'),
    environmentHash: testHash('2'),
    snapshotHash: testHash('3'),
    registryCount: 54,
    entryCount: 4242
  },
  candidateIdentity,
  lockfileHash,
  runtimePublicationCommit: 'deferred',
  commitAllowed: false,
  publicationAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  commitChecks: [],
  commitStages: [
    {
      id: 'commit-adapter-inspection',
      status: 'satisfied',
      adapterIds: ['atomic-runtime-publication-commit-adapter'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: [],
      reason: 'Runtime publication commit adapter inputs are consistent.'
    },
    {
      id: 'transaction-log-prepare',
      status: 'deferred',
      adapterIds: ['transaction-log-writer'],
      writeBoundaryIds: ['transaction-log'],
      rollbackCheckpointIds: ['before-transaction-log-write'],
      reason: 'Transaction log preparation remains deferred.'
    },
    {
      id: 'package-files-commit',
      status: 'deferred',
      adapterIds: ['package-file-commit-adapter'],
      writeBoundaryIds: ['package-files', 'package-backups'],
      rollbackCheckpointIds: ['before-package-files-write'],
      reason: 'Package file commit remains deferred.'
    },
    {
      id: 'settings-lockfile-commit',
      status: 'deferred',
      adapterIds: ['settings-lockfile-commit-adapter'],
      writeBoundaryIds: ['installation-settings', 'mod-lockfile'],
      rollbackCheckpointIds: ['before-settings-lockfile-write'],
      reason: 'Settings and lockfile commit remains deferred.'
    },
    {
      id: 'live-registry-publication',
      status: 'deferred',
      adapterIds: ['live-registry-publication-adapter'],
      writeBoundaryIds: ['live-registry'],
      rollbackCheckpointIds: ['before-live-registry-swap'],
      reason: 'Live registry publication remains deferred.'
    },
    {
      id: 'post-commit-verification',
      status: 'deferred',
      adapterIds: ['post-commit-verification-adapter'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'Post-commit verification remains deferred.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      adapterIds: ['rollback-recovery-orchestrator'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'Rollback recovery handoff remains deferred.'
    }
  ],
  requiredCommitAdapters: [
    {
      id: 'atomic-runtime-publication-commit-adapter',
      status: 'required',
      reason: 'Runtime publication must be committed through a future atomic adapter.'
    }
  ],
  effects: runtimeCommitEffects,
  ...overrides
} as unknown as ThirdPartyDataPackRuntimePublicationCommitAdapterResult)

const dispatcherHostEffects = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary> = {}
): ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary => ({
  commandDispatcherCalled: true,
  commandDispatched: true,
  transactionCommitted: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const atomicHostEffects = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary => ({
  atomicCommitExecutorHostCalled: true,
  atomicCommitExecutorHostAccepted: true,
  transactionCommitted: false,
  transactionLogPrepared: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const settingsEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary => ({
  settingsLockfileCommitSourceCalled: true,
  packageFileStagingSourceCalled: true,
  injectedSettingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostAccepted: true,
  realSettingsLockfileCommitHostCalled: false,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const createSettingsLockfileCommitSource = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => ({
  kind: 'third-party-settings-lockfile-commit-source',
  mode: 'default-disabled-settings-lockfile-commit-source',
  status: 'accepted',
  reason: 'settings-lockfile commit source accepted an injected host acknowledgement',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  packageFileStagingSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  diagnostics: [],
  effects: settingsEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackSettingsLockfileCommitSourceResult)

const persistentReadEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary => ({
  postCommitPersistentReadsHostCalled: true,
  postCommitPersistentReadsHostAccepted: true,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const adapterEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  transactionCommitted: false,
  postCommitVerificationExecutorCalled: true,
  injectedVerificationHostCalled: true,
  verificationOutcomeReceived: true,
  verifiedOutcomeReceived: true,
  failedOutcomeReceived: false,
  retryOutcomeReceived: false,
  rollbackOutcomeReceived: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const createPostCommitVerificationExecutorAdapter = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult => ({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  reason: 'post-commit verification executor adapter executed the injected-test-only host',
  postCommitVerificationExecutorAdapter: 'executed',
  readOnly: true,
  injectedExecutorHostRequired: true,
  injectedExecutorHostMode: 'injected-test-only',
  verificationHostCalled: true,
  verificationOutcomeReceived: true,
  verificationOutcomeNormalized: true,
  verificationExecutionAllowed: true,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  checks: [],
  diagnostics: [],
  outcome: {
    formatVersion: 1,
    kind: 'verified',
    commandId: 'install',
    packageId,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    transactionLogMatched: true,
    packageStateMatched: true,
    settingsLockfileMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true,
    messageKey: 'mods.post.commit.verification.install.verified',
    recovery: 'none',
    retryable: false,
    rollbackRequired: false,
    summary,
    diagnostics: []
  },
  summary,
  effects: adapterEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult)

const verificationHostEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary => ({
  postCommitVerificationExecutorHostCalled: true,
  postCommitVerificationExecutorHostAccepted: true,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealEffects = (
  result: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult,
  ready: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveCacheIsolationChecked).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party install command lifecycle pipeline', () => {
  it('is disabled by default and does not read sources or call injected hosts', async() => {
    const readTransactionCommandDispatcherHandoff = vi.fn()
    const readInstallTransactionDispatchPlan = vi.fn()
    const readRuntimePublicationCommitAdapter = vi.fn()
    const dispatchTransactionCommand = vi.fn()
    const executeInjectedAtomicTransactionCommit = {
      kind: 'injected-atomic-transaction-commit-executor' as const,
      mode: 'injected-test-only' as const,
      execute: vi.fn()
    }
    const executeAtomicTransactionCommit = vi.fn()
    const readSettingsLockfileCommitSource = vi.fn()
    const readPostCommitVerificationExecutorAdapter = vi.fn()
    const readPostCommitPersistentState = vi.fn()
    const executePostCommitVerification = vi.fn()
    const pipeline = createThirdPartyDataPackInstallCommandLifecyclePipeline({
      readTransactionCommandDispatcherHandoff,
      readInstallTransactionDispatchPlan,
      readRuntimePublicationCommitAdapter,
      dispatchTransactionCommand,
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit,
      readSettingsLockfileCommitSource,
      readPostCommitVerificationExecutorAdapter,
      readPostCommitPersistentState,
      executePostCommitVerification
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.transactionCommandDispatcherSourceCalled).toBe(false)
    expect(result.atomicTransactionCommitExecutorSourceCalled).toBe(false)
    expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
    expect(readTransactionCommandDispatcherHandoff).not.toHaveBeenCalled()
    expect(readInstallTransactionDispatchPlan).not.toHaveBeenCalled()
    expect(readRuntimePublicationCommitAdapter).not.toHaveBeenCalled()
    expect(dispatchTransactionCommand).not.toHaveBeenCalled()
    expect(executeInjectedAtomicTransactionCommit.execute).not.toHaveBeenCalled()
    expect(executeAtomicTransactionCommit).not.toHaveBeenCalled()
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(readPostCommitVerificationExecutorAdapter).not.toHaveBeenCalled()
    expect(readPostCommitPersistentState).not.toHaveBeenCalled()
    expect(executePostCommitVerification).not.toHaveBeenCalled()
    expectNoRealEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('threads command dispatch, atomic commit and post-commit verification acknowledgement', async() => {
    const calls: string[] = []
    const readTransactionCommandDispatcherHandoff = vi.fn(async() => createDispatcherHandoff())
    const readInstallTransactionDispatchPlan = vi.fn(async() => createInstallTransactionDispatchPlan())
    const readRuntimePublicationCommitAdapter = vi.fn(async() => createRuntimePublicationCommitAdapter())
    const dispatchTransactionCommand = vi.fn(async envelope => {
      calls.push('command-dispatch')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'dispatched' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        effects: dispatcherHostEffects()
      }
    })
    const executeInjectedAtomicTransactionCommit = {
      kind: 'injected-atomic-transaction-commit-executor' as const,
      mode: 'injected-test-only' as const,
      execute: vi.fn(request => {
        calls.push('injected-atomic-commit')
        expect(Object.isFrozen(request)).toBe(true)
        expect(request.commandId).toBe('install')
        expect(request.packageId).toBe(packageId)
        expect(request.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
        expect(request.lockfileHash).toBe(lockfileHash)
        expect('candidateRegistrySet' in request).toBe(false)
        return {
          kind: 'committed' as const,
          settled: true as const,
          packageId: request.packageId,
          candidateIdentity: request.candidateIdentity,
          lockfileHash: request.lockfileHash,
          messageKey: 'mods.atomic.commit.install.committed',
          recovery: 'none' as const
        }
      })
    }
    const executeAtomicTransactionCommit = vi.fn(async envelope => {
      calls.push('atomic-commit-host')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.commitOutcomeKind).toBe('committed')
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('commitRequest' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        commitOutcomeKind: 'committed' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        effects: atomicHostEffects()
      }
    })
    const readSettingsLockfileCommitSource = vi.fn(async() => createSettingsLockfileCommitSource())
    const readPostCommitVerificationExecutorAdapter = vi.fn(async() =>
      createPostCommitVerificationExecutorAdapter()
    )
    const readPostCommitPersistentState = vi.fn(async envelope => {
      calls.push('persistent-read-host')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('transactionLogReader' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        packageFileStagingHostStatus: 'accepted' as const,
        settingsLockfileCommitHostStatus: 'accepted' as const,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        persistentReadProofs,
        effects: persistentReadEffects()
      }
    })
    const executePostCommitVerification = vi.fn(async envelope => {
      calls.push('post-commit-verification-host')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.verificationOutcomeKind).toBe('verified')
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('verificationRequest' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        verificationOutcomeKind: 'verified' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true,
        effects: verificationHostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackInstallCommandLifecyclePipeline({
      enabled: true,
      readTransactionCommandDispatcherHandoff,
      readInstallTransactionDispatchPlan,
      readRuntimePublicationCommitAdapter,
      dispatchTransactionCommand,
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit,
      readSettingsLockfileCommitSource,
      readPostCommitVerificationExecutorAdapter,
      readPostCommitPersistentState,
      executePostCommitVerification
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.transactionCommandDispatcherSourceStatus).toBe('dispatched')
    expect(result.atomicTransactionCommitExecutorSourceStatus).toBe('executed')
    expect(result.postCommitVerificationReadAcknowledgementSourceStatus).toBe('ready')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.commandDispatched).toBe(true)
    expect(result.effects.atomicCommitExecutorAcknowledged).toBe(true)
    expect(result.effects.postCommitVerificationAcknowledged).toBe(true)
    expect(result.effects.persistentReadProofAcknowledged).toBe(true)
    expect(readTransactionCommandDispatcherHandoff).toHaveBeenCalledOnce()
    expect(readInstallTransactionDispatchPlan).toHaveBeenCalledOnce()
    expect(readRuntimePublicationCommitAdapter).toHaveBeenCalledOnce()
    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(executeInjectedAtomicTransactionCommit.execute).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(readSettingsLockfileCommitSource).toHaveBeenCalledOnce()
    expect(readPostCommitVerificationExecutorAdapter).toHaveBeenCalledOnce()
    expect(readPostCommitPersistentState).toHaveBeenCalledOnce()
    expect(executePostCommitVerification).toHaveBeenCalledOnce()
    expect(calls.slice(0, 3)).toEqual([
      'command-dispatch',
      'injected-atomic-commit',
      'atomic-commit-host'
    ])
    expect(calls).toEqual(expect.arrayContaining([
      'persistent-read-host',
      'post-commit-verification-host'
    ]))
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expectNoRealEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks atomic commit drift before post-commit acknowledgement readers run', async() => {
    const readPostCommitPersistentState = vi.fn()
    const executePostCommitVerification = vi.fn()
    const executeInjectedAtomicTransactionCommit = {
      kind: 'injected-atomic-transaction-commit-executor' as const,
      mode: 'injected-test-only' as const,
      execute: vi.fn()
    }
    const executeAtomicTransactionCommit = vi.fn()
    const pipeline = createThirdPartyDataPackInstallCommandLifecyclePipeline({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDispatcherHandoff(),
      readInstallTransactionDispatchPlan: async() => createInstallTransactionDispatchPlan(),
      readRuntimePublicationCommitAdapter: async() => createRuntimePublicationCommitAdapter({
        selectedPackageIds: [packageId, blockedPackageId],
        packageCount: 2
      }),
      dispatchTransactionCommand: async() => ({
        status: 'dispatched' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        effects: dispatcherHostEffects()
      }),
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit,
      readSettingsLockfileCommitSource: async() => createSettingsLockfileCommitSource(),
      readPostCommitVerificationExecutorAdapter: async() =>
        createPostCommitVerificationExecutorAdapter(),
      readPostCommitPersistentState,
      executePostCommitVerification
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError)
      const result = (error as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.transactionCommandDispatcherSourceStatus).toBe('dispatched')
      expect(result.atomicTransactionCommitExecutorSourceCalled).toBe(false)
      expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.install-command-post-commit-acknowledgement-source.commit-source-failed',
          packageId
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
      expectNoRealEffects(result, false)
      expectJsonGraphFrozen(result)
    }
    expect(executeInjectedAtomicTransactionCommit.execute).not.toHaveBeenCalled()
    expect(executeAtomicTransactionCommit).not.toHaveBeenCalled()
    expect(readPostCommitPersistentState).not.toHaveBeenCalled()
    expect(executePostCommitVerification).not.toHaveBeenCalled()
  })
})
