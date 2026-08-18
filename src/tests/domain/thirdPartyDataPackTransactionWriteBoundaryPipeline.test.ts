import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackTransactionWriteBoundaryPipeline
} from '@/domain/mods/thirdPartyDataPackTransactionWriteBoundaryPipeline'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary,
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackPackageFileStagingHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackPackageFileStagingSource'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import {
  ThirdPartyDataPackSettingsLockfileCommitBlockedError,
  type ThirdPartyDataPackSettingsLockfileCommitHostEffectSummary,
  type ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherHandoff'
import type {
  ThirdPartyDataPackTransactionWriteBoundaryHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackTransactionWriteBoundarySource'

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

const handoffEffects = {
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
} as const

const installEffects: ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary = {
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
}

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
  reason: 'transaction command dispatcher handoff is inspect-only until real command dispatch, atomic transaction commit, post-commit verification and UI/IPC result delivery are implemented',
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
      id: 'install-transaction-commit',
      status: 'deferred',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'Install transaction commit remains deferred.'
    },
    {
      id: 'post-commit-verification-execution',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification execution remains deferred.'
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
} as ThirdPartyDataPackTransactionCommandDispatcherHandoffResult)

const createInstallDispatchPlan = (
  overrides: Partial<ThirdPartyDataPackInstallTransactionDispatchPlanResult> = {}
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  reason: 'install transaction dispatch plan is inspect-only until command dispatch, persistent package commits, runtime publication and rollback recovery are implemented',
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
} as ThirdPartyDataPackInstallTransactionDispatchPlanResult)

const createRuntimeCommitAdapter = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAdapterResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  reason: 'runtime publication commit adapter is inspect-only until atomic commit adapter, persistent writers and post-commit verification exist',
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
} as ThirdPartyDataPackRuntimePublicationCommitAdapterResult)

const transactionBoundaryHostEffects = (): ThirdPartyDataPackTransactionWriteBoundaryHostEffectSummary => ({
  transactionWriteBoundaryHostCalled: true,
  transactionWriteBoundaryHostAccepted: true,
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

const packageStagingHostEffects = (): ThirdPartyDataPackPackageFileStagingHostEffectSummary => ({
  packageFileStagingHostCalled: true,
  packageFileStagingHostAccepted: true,
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

const settingsCommitHostEffects = (): ThirdPartyDataPackSettingsLockfileCommitHostEffectSummary => ({
  settingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostAccepted: true,
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrPersistentWrites = (
  result: ThirdPartyDataPackSettingsLockfileCommitSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.commandContinuationAllowed).toBe(continuationAllowed)

  const {
    settingsLockfileCommitSourceCalled: _settingsLockfileCommitSourceCalled,
    packageFileStagingSourceCalled: _packageFileStagingSourceCalled,
    injectedSettingsLockfileCommitHostCalled: _injectedSettingsLockfileCommitHostCalled,
    settingsLockfileCommitHostCalled: _settingsLockfileCommitHostCalled,
    settingsLockfileCommitHostAccepted: _settingsLockfileCommitHostAccepted,
    realSettingsLockfileCommitHostCalled: _realSettingsLockfileCommitHostCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party transaction write boundary pipeline', () => {
  it('is disabled by default and does not read upstream reports or call hosts', async() => {
    const readTransactionCommandDispatcherHandoff = vi.fn()
    const readInstallTransactionDispatchPlan = vi.fn()
    const readRuntimePublicationCommitAdapter = vi.fn()
    const executeTransactionWriteBoundary = vi.fn()
    const stagePackageFiles = vi.fn()
    const commitSettingsLockfile = vi.fn()
    const pipeline = createThirdPartyDataPackTransactionWriteBoundaryPipeline({
      readTransactionCommandDispatcherHandoff,
      readInstallTransactionDispatchPlan,
      readRuntimePublicationCommitAdapter,
      executeTransactionWriteBoundary,
      stagePackageFiles,
      commitSettingsLockfile
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readTransactionCommandDispatcherHandoff).not.toHaveBeenCalled()
    expect(readInstallTransactionDispatchPlan).not.toHaveBeenCalled()
    expect(readRuntimePublicationCommitAdapter).not.toHaveBeenCalled()
    expect(executeTransactionWriteBoundary).not.toHaveBeenCalled()
    expect(stagePackageFiles).not.toHaveBeenCalled()
    expect(commitSettingsLockfile).not.toHaveBeenCalled()
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('threads write boundary, package staging and settings-lockfile acknowledgements', async() => {
    const readInstallTransactionDispatchPlan = vi.fn(async() => createInstallDispatchPlan())
    const executeTransactionWriteBoundary = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.writeProbeEvidence.modLockPersistentWriteExecuted).toBe(true)
      expect('programDirectoryPath' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
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
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        effects: transactionBoundaryHostEffects()
      }
    })
    const stagePackageFiles = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('packageWriter' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
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
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        effects: packageStagingHostEffects()
      }
    })
    const commitSettingsLockfile = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.packageFileStagingHostStatus).toBe('accepted')
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('settingsWriter' in envelope).toBe(false)
      expect('lockfileDraft' in envelope).toBe(false)
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
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        effects: settingsCommitHostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackTransactionWriteBoundaryPipeline({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDispatcherHandoff(),
      readInstallTransactionDispatchPlan,
      readRuntimePublicationCommitAdapter: async() => createRuntimeCommitAdapter(),
      executeTransactionWriteBoundary,
      stagePackageFiles,
      commitSettingsLockfile
    })

    const result = await pipeline()

    expect(result.status).toBe('accepted')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.packageFileStagingSourceStatus).toBe('accepted')
    expect(result.packageFileStagingHostStatus).toBe('accepted')
    expect(result.settingsLockfileCommitHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(readInstallTransactionDispatchPlan).toHaveBeenCalledOnce()
    expect(executeTransactionWriteBoundary).toHaveBeenCalledOnce()
    expect(stagePackageFiles).toHaveBeenCalledOnce()
    expect(commitSettingsLockfile).toHaveBeenCalledOnce()
    const writeBoundaryCallOrder = executeTransactionWriteBoundary.mock.invocationCallOrder[0] as number
    const packageStagingCallOrder = stagePackageFiles.mock.invocationCallOrder[0] as number
    const settingsCommitCallOrder = commitSettingsLockfile.mock.invocationCallOrder[0] as number
    expect(writeBoundaryCallOrder).toBeLessThan(packageStagingCallOrder)
    expect(packageStagingCallOrder).toBeLessThan(settingsCommitCallOrder)
    expect(result.effects.injectedSettingsLockfileCommitHostCalled).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect('packageFileStagingSource' in result).toBe(false)
    expect('settingsLockfileCommitHost' in result).toBe(false)
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks before package and settings hosts when atomic upstream reports diverge', async() => {
    const executeTransactionWriteBoundary = vi.fn(async envelope => ({
      status: 'accepted' as const,
      requestedCommandId: envelope.requestedCommandId,
      targetPackageId: envelope.targetPackageId,
      selectedPackageIds: envelope.selectedPackageIds,
      blockedPackageIds: envelope.blockedPackageIds,
      loadOrder: envelope.loadOrder,
      registryCount: envelope.registryCount,
      entryCount: envelope.entryCount,
      packageCount: envelope.packageCount,
      modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
      transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
      modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
      transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
      effects: transactionBoundaryHostEffects()
    }))
    const stagePackageFiles = vi.fn()
    const commitSettingsLockfile = vi.fn()
    const pipeline = createThirdPartyDataPackTransactionWriteBoundaryPipeline({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDispatcherHandoff(),
      readInstallTransactionDispatchPlan: async() => createInstallDispatchPlan(),
      readRuntimePublicationCommitAdapter: async() => createRuntimeCommitAdapter({
        selectedPackageIds: [packageId, blockedPackageId],
        packageCount: 2
      }),
      executeTransactionWriteBoundary,
      stagePackageFiles,
      commitSettingsLockfile
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackSettingsLockfileCommitBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackSettingsLockfileCommitBlockedError)
      const result = (error as ThirdPartyDataPackSettingsLockfileCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.settings-lockfile-commit-source.source-failed'
        })
      ])
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
    expect(executeTransactionWriteBoundary).toHaveBeenCalledTimes(2)
    expect(stagePackageFiles).not.toHaveBeenCalled()
    expect(commitSettingsLockfile).not.toHaveBeenCalled()
  })
})
