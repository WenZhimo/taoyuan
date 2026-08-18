import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherHandoff'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const officialIdentity = {
  artifactHash: committedMetadata.artifactHash as Sha256Hash,
  contentHash: committedMetadata.contentHash as Sha256Hash,
  schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
  environmentHash: committedMetadata.environmentHash as Sha256Hash,
  snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
  registryCount: 54,
  entryCount: 4242
}

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

const commitEffects = {
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

const expectedEffects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary = {
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
  diagnosticsWritten: false
}

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
      id: 'dispatcher-handoff-inspection',
      status: 'satisfied',
      requirementIds: ['confirmed-command-envelope', 'install-dispatch-plan-consumer'],
      reason: 'Command preflight, install dispatch planning and post-commit verification planning are consistent enough to inspect dispatcher handoff requirements.'
    },
    {
      id: 'command-envelope-normalization',
      status: 'deferred',
      requirementIds: ['confirmed-command-envelope'],
      reason: 'A real dispatcher still needs to normalize the command envelope before calling any transaction stage.'
    },
    {
      id: 'transaction-command-dispatch',
      status: 'deferred',
      requirementIds: ['transaction-command-dispatcher'],
      reason: 'Command dispatch remains deferred; this report does not invoke install, enable, disable, upgrade or uninstall handlers.'
    },
    {
      id: 'install-transaction-commit',
      status: 'deferred',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'The persistent install transaction commit remains deferred and must not be simulated by this handoff report.'
    },
    {
      id: 'post-commit-verification-execution',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification execution remains deferred until real package, settings, lockfile and live registry writes exist.'
    },
    {
      id: 'ui-ipc-result-handoff',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result'],
      reason: 'UI and IPC result delivery remains deferred and must stay redacted when later implemented.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      requirementIds: ['rollback-recovery-orchestrator'],
      reason: 'Rollback recovery remains a required handoff for any future dispatcher failure path.'
    }
  ],
  dispatcherRequirements: [
    {
      id: 'confirmed-command-envelope',
      status: 'required',
      reason: 'The future dispatcher must receive a typed command envelope that already passed explicit confirmation.'
    },
    {
      id: 'transaction-command-dispatcher',
      status: 'required',
      reason: 'A real dispatcher must route install command intent without exposing UI or IPC side effects to domain reports.'
    },
    {
      id: 'install-dispatch-plan-consumer',
      status: 'required',
      reason: 'The dispatcher must consume the install dispatch plan instead of rebuilding transaction ordering ad hoc.'
    },
    {
      id: 'atomic-transaction-commit-executor',
      status: 'required',
      reason: 'Persistent package, settings, lockfile and transaction-log mutation must happen through one atomic executor.'
    },
    {
      id: 'post-commit-verification-executor',
      status: 'required',
      reason: 'The dispatcher must not surface success until post-commit verification proves persistent and live identities match.'
    },
    {
      id: 'path-free-ui-ipc-result',
      status: 'required',
      reason: 'Any UI or IPC response must expose only redacted result summaries, not host paths or candidate internals.'
    },
    {
      id: 'rollback-recovery-orchestrator',
      status: 'required',
      reason: 'Failed dispatch, commit or verification must settle through rollback recovery before startup or saves continue.'
    }
  ],
  effects: handoffEffects,
  ...overrides
})

const createInstallDispatchPlan = (
  overrides: Partial<ThirdPartyDataPackInstallTransactionDispatchPlanResult> = {}
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  modLockWriteProbeStatus: 'deferred',
  transactionLogWriteProbeStatus: 'deferred',
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
      id: 'dispatch-plan-inspection',
      status: 'satisfied',
      requirementIds: ['install-command-dispatcher'],
      reason: 'Install command and isolated write-probe evidence are consistent enough to inspect future dispatch requirements.'
    },
    {
      id: 'install-command-dispatch',
      status: 'deferred',
      requirementIds: ['install-command-dispatcher'],
      reason: 'Install command dispatch remains deferred.'
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
    },
    {
      id: 'post-commit-ui-ipc-response',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result'],
      reason: 'UI/IPC response remains deferred.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      requirementIds: ['rollback-recovery-orchestrator'],
      reason: 'Rollback recovery handoff remains deferred.'
    }
  ],
  requirements: [
    {
      id: 'install-command-dispatcher',
      status: 'required',
      reason: 'A future dispatcher must execute confirmed install commands.'
    },
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
    },
    {
      id: 'rollback-recovery-orchestrator',
      status: 'required',
      reason: 'A future commit must recover from partial failure.'
    },
    {
      id: 'path-free-ui-ipc-result',
      status: 'required',
      reason: 'A future response must stay path-free.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'deferred',
    transactionLogWriteProbeStatus: 'deferred',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  effects: installEffects,
  ...overrides
})

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
  officialIdentity,
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
      reason: 'Runtime publication commit adapter inputs are consistent enough to inspect commit requirements.'
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
    },
    {
      id: 'commit-diagnostics-finalization',
      status: 'deferred',
      adapterIds: [],
      writeBoundaryIds: [],
      rollbackCheckpointIds: [],
      reason: 'Commit diagnostics finalization remains deferred.'
    }
  ],
  requiredCommitAdapters: [
    {
      id: 'atomic-runtime-publication-commit-adapter',
      status: 'required',
      reason: 'Runtime publication must be committed through a future atomic adapter.'
    },
    {
      id: 'transaction-log-writer',
      status: 'required',
      reason: 'A future commit must write the transaction log.'
    },
    {
      id: 'package-file-commit-adapter',
      status: 'required',
      reason: 'A future commit must write package files.'
    },
    {
      id: 'settings-lockfile-commit-adapter',
      status: 'required',
      reason: 'A future commit must write settings and lockfile state.'
    },
    {
      id: 'live-registry-publication-adapter',
      status: 'required',
      reason: 'A future commit must publish the live registry.'
    },
    {
      id: 'post-commit-verification-adapter',
      status: 'required',
      reason: 'A future commit must verify committed state.'
    },
    {
      id: 'rollback-recovery-orchestrator',
      status: 'required',
      reason: 'A future commit must recover from failure.'
    }
  ],
  effects: commitEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoAtomicCommitEffects = (
  result: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.atomicCommitExecutionAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.commitAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.runtimePublicationCommitAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
}

describe('third-party atomic transaction commit executor preflight', () => {
  it('defers atomic commit executor preflight while exposing deterministic commit requirements', () => {
    const result = buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff(),
      installTransactionDispatchPlan: createInstallDispatchPlan({
        writeProbeEvidence: {
          modLockWriteProbeStatus: 'written',
          transactionLogWriteProbeStatus: 'written',
          modLockPersistentWriteExecuted: true,
          transactionLogPersistentWriteExecuted: true
        }
      }),
      runtimePublicationCommitAdapter: createRuntimeCommitAdapter()
    })

    expect(result.status).toBe('deferred')
    expect(result.atomicTransactionCommitExecutorPreflight).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedCandidatePaths).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.writeProbeEvidence).toEqual({
      modLockWriteProbeStatus: 'written',
      transactionLogWriteProbeStatus: 'written',
      modLockPersistentWriteExecuted: true,
      transactionLogPersistentWriteExecuted: true
    })
    expect(result.executorChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.executorStages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'atomic-commit-executor-preflight-inspection', status: 'satisfied' },
      { id: 'transaction-log-prepare', status: 'deferred' },
      { id: 'package-files-commit', status: 'deferred' },
      { id: 'settings-lockfile-commit', status: 'deferred' },
      { id: 'runtime-publication-commit', status: 'deferred' },
      { id: 'post-commit-verification-handoff', status: 'deferred' },
      { id: 'ui-ipc-result-normalization', status: 'deferred' },
      { id: 'rollback-recovery-handoff', status: 'deferred' }
    ])
    expect(result.executorRequirements.map(requirement => requirement.id)).toEqual([
      'atomic-transaction-commit-executor',
      'verified-transaction-log-writer',
      'staged-package-file-commit-adapter',
      'settings-lockfile-atomic-commit-adapter',
      'runtime-publication-commit-adapter',
      'post-commit-verification-executor',
      'path-free-ui-ipc-result-normalizer',
      'rollback-recovery-orchestrator'
    ])
    expect('transactionCommandDispatcherHandoff' in result).toBe(false)
    expect('installTransactionDispatchPlan' in result).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoAtomicCommitEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips when upstream reports have no selected package state', () => {
    const handoffSkipped = buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff({
        status: 'skipped',
        reason: 'no selected third-party data packs',
        requestedCommandId: undefined,
        targetPackageId: undefined,
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
      installTransactionDispatchPlan: createInstallDispatchPlan(),
      runtimePublicationCommitAdapter: createRuntimeCommitAdapter()
    })
    const commitAdapterSkipped = buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff(),
      installTransactionDispatchPlan: createInstallDispatchPlan(),
      runtimePublicationCommitAdapter: createRuntimeCommitAdapter({
        status: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      })
    })

    expect(handoffSkipped.status).toBe('skipped')
    expect(handoffSkipped.reason).toBe('no selected third-party data packs')
    expect(handoffSkipped.executorChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(handoffSkipped.executorRequirements).toEqual([])
    expect(commitAdapterSkipped.status).toBe('skipped')
    expect(commitAdapterSkipped.reason).toBe('no selected third-party data packs')
    expect(commitAdapterSkipped.executorRequirements).toEqual([])
    expectNoAtomicCommitEffects(handoffSkipped)
    expectNoAtomicCommitEffects(commitAdapterSkipped)
    expectJsonGraphFrozen(handoffSkipped)
    expectJsonGraphFrozen(commitAdapterSkipped)
  })

  it('blocks upstream failures while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.atomic-transaction-commit-executor-preflight.path-strip-test',
      severity: 'error',
      packageId,
      file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/transaction.json',
      fieldPath: '/atomicCommit/C:/Users/LENOVO',
      details: {
        hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack',
        reason: 'contains private path'
      },
      recovery: 'retry'
    })

    const result = buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff({
        status: 'blocked',
        reason: 'dispatcher handoff blocked before atomic commit preflight',
        diagnostics: [diagnostic] as never
      }),
      installTransactionDispatchPlan: createInstallDispatchPlan({
        diagnostics: [diagnostic] as never
      }),
      runtimePublicationCommitAdapter: createRuntimeCommitAdapter({
        diagnostics: [diagnostic]
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('dispatcher handoff blocked before atomic commit preflight')
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.atomic-transaction-commit-executor-preflight.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoAtomicCommitEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks command, target, package, identity, stage, probe and effect drift before commit execution', () => {
    const cases = [
      {
        label: 'not install',
        handoff: createDispatcherHandoff({ requestedCommandId: 'enable' }),
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimeCommitAdapter(),
        blockedCheckId: 'install-command-consistent'
      },
      {
        label: 'target drift',
        handoff: createDispatcherHandoff(),
        installPlan: createInstallDispatchPlan({ targetPackageId: blockedPackageId }),
        commitAdapter: createRuntimeCommitAdapter(),
        blockedCheckId: 'target-package-consistent'
      },
      {
        label: 'package summary drift',
        handoff: createDispatcherHandoff(),
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimeCommitAdapter({ packageCount: 2 }),
        blockedCheckId: 'package-summary-consistent'
      },
      {
        label: 'candidate drift',
        handoff: createDispatcherHandoff(),
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimeCommitAdapter({
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          }
        }),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile drift',
        handoff: createDispatcherHandoff(),
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimeCommitAdapter({ lockfileHash: testHash('f') }),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'missing atomic requirement',
        handoff: createDispatcherHandoff({ dispatcherRequirements: [] }),
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimeCommitAdapter(),
        blockedCheckId: 'atomic-commit-executor-required'
      },
      {
        label: 'missing deferred stage',
        handoff: createDispatcherHandoff(),
        installPlan: createInstallDispatchPlan({ stages: [] }),
        commitAdapter: createRuntimeCommitAdapter(),
        blockedCheckId: 'commit-stages-deferred'
      },
      {
        label: 'write probe drift',
        handoff: createDispatcherHandoff(),
        installPlan: createInstallDispatchPlan({
          writeProbeEvidence: {
            modLockWriteProbeStatus: 'written',
            transactionLogWriteProbeStatus: 'deferred',
            modLockPersistentWriteExecuted: false,
            transactionLogPersistentWriteExecuted: false
          }
        }),
        commitAdapter: createRuntimeCommitAdapter(),
        blockedCheckId: 'isolated-write-probe-evidence-contained'
      },
      {
        label: 'effect drift',
        handoff: createDispatcherHandoff(),
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimeCommitAdapter({
          effects: {
            ...commitEffects,
            transactionLogWritten: true
          } as never
        }),
        blockedCheckId: 'no-atomic-commit-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
        transactionCommandDispatcherHandoff: currentCase.handoff,
        installTransactionDispatchPlan: currentCase.installPlan,
        runtimePublicationCommitAdapter: currentCase.commitAdapter
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('atomic transaction commit executor preflight inputs are inconsistent')
      expect(result.executorChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.atomic-transaction-commit-executor-preflight.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(result.executorRequirements).toEqual([])
      expectNoAtomicCommitEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/atomic-commit-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/atomic-commit-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.atomic-transaction-commit-executor-preflight.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff({
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder,
        diagnostics: diagnostics as never
      }),
      installTransactionDispatchPlan: createInstallDispatchPlan({
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder,
        diagnostics: diagnostics as never
      }),
      runtimePublicationCommitAdapter: createRuntimeCommitAdapter({
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder,
        diagnostics: diagnostics as never
      })
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.blockedCandidatePaths).toEqual(['blocked-pack', 'blocked-pack', 'blocked-pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.atomic-transaction-commit-executor-preflight.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.atomic-transaction-commit-executor-preflight.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.atomic-transaction-commit-executor-preflight.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('atomic-commit-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoAtomicCommitEffects(result)
    expectJsonGraphFrozen(result)
  })
})
