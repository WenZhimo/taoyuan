import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter,
  type ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestoreAdapter'
import type {
  ThirdPartyDataPackPublicationRollbackRecoveryAction,
  ThirdPartyDataPackPublicationRollbackRecoveryResult,
  ThirdPartyDataPackPublicationRollbackRecoveryStage
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement,
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  ThirdPartyDataPackRuntimePublicationCommitStage
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = requirePackageId('discovery_valid')
const blockedPackageId = requirePackageId('blocked_pack')
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
  contentHash: testHash('1'),
  snapshotHash: testHash('2'),
  candidateHash: testHash('3')
} as const

const lockfileHash = testHash('4')

const recoveryEffects = {
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

const replayRestoreEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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

const recoveryActions: readonly ThirdPartyDataPackPublicationRollbackRecoveryAction[] = [
  'recovery-log-reader',
  'package-file-restore-adapter',
  'settings-lockfile-restore-adapter',
  'previous-live-registry-reference',
  'post-restore-verification',
  'redacted-recovery-diagnostics',
  'idempotent-replay'
].map(id => ({
  id: id as ThirdPartyDataPackPublicationRollbackRecoveryAction['id'],
  status: 'required',
  reason: `${id} remains required.`
}))

const recoveryStages: readonly ThirdPartyDataPackPublicationRollbackRecoveryStage[] = [
  {
    id: 'recovery-plan-inspection',
    status: 'satisfied',
    actionIds: [],
    rollbackCheckpointIds: [],
    reason: 'inspection ready'
  },
  {
    id: 'failure-capture',
    status: 'deferred',
    actionIds: ['recovery-log-reader'],
    rollbackCheckpointIds: ['before-transaction-log-write'],
    reason: 'failure capture remains deferred'
  },
  {
    id: 'transaction-log-replay',
    status: 'deferred',
    actionIds: ['recovery-log-reader', 'idempotent-replay'],
    rollbackCheckpointIds: ['before-transaction-log-write'],
    reason: 'transaction replay remains deferred'
  },
  {
    id: 'package-files-restore',
    status: 'deferred',
    actionIds: ['package-file-restore-adapter'],
    rollbackCheckpointIds: ['before-package-files-write'],
    reason: 'package restore remains deferred'
  },
  {
    id: 'settings-lockfile-restore',
    status: 'deferred',
    actionIds: ['settings-lockfile-restore-adapter'],
    rollbackCheckpointIds: ['before-settings-lockfile-write'],
    reason: 'settings and lockfile restore remains deferred'
  },
  {
    id: 'live-registry-restore',
    status: 'deferred',
    actionIds: ['previous-live-registry-reference'],
    rollbackCheckpointIds: ['before-live-registry-swap'],
    reason: 'live registry restore remains deferred'
  },
  {
    id: 'post-rollback-verification',
    status: 'deferred',
    actionIds: ['post-restore-verification'],
    rollbackCheckpointIds: ['after-failure-restore-verification'],
    reason: 'post restore verification remains deferred'
  },
  {
    id: 'recovery-diagnostics-finalization',
    status: 'deferred',
    actionIds: ['redacted-recovery-diagnostics'],
    rollbackCheckpointIds: ['after-failure-restore-verification'],
    reason: 'diagnostics finalization remains deferred'
  }
]

const commitStages: readonly ThirdPartyDataPackRuntimePublicationCommitStage[] = [
  {
    id: 'rollback-recovery-handoff',
    status: 'deferred',
    adapterIds: ['rollback-recovery-orchestrator'],
    writeBoundaryIds: [],
    rollbackCheckpointIds: ['after-failure-restore-verification'],
    reason: 'commit must hand off failed steps to rollback recovery'
  }
]

const requiredCommitAdapters: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement[] = [
  {
    id: 'rollback-recovery-orchestrator',
    status: 'required',
    reason: 'rollback recovery remains required'
  }
]

const createPublicationRollbackRecovery = (
  overrides: Partial<ThirdPartyDataPackPublicationRollbackRecoveryResult> = {}
): ThirdPartyDataPackPublicationRollbackRecoveryResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  reason: 'publication rollback recovery is inspect-only until recovery log replay, persistent restore adapters and post-restore verification exist',
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 54,
  entryCount: 4244,
  packageCount: 1,
  officialIdentity,
  candidateIdentity,
  lockfileHash,
  rollbackRecovery: 'deferred',
  recoveryAllowed: false,
  rollbackExecutionAllowed: false,
  liveRegistryMutable: false,
  recoveryChecks: [],
  recoveryStages,
  requiredRecoveryActions: recoveryActions,
  effects: recoveryEffects,
  ...overrides
})

const createRuntimePublicationCommitAdapter = (
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
  registryCount: 54,
  entryCount: 4244,
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
  commitStages,
  requiredCommitAdapters,
  effects: recoveryEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoReplayRestoreEffects = (
  result: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): void => {
  expect(result.effects).toEqual(replayRestoreEffects)
  expect(Object.isFrozen(result.effects)).toBe(true)
}

const expectDeferredReplayRestore = (
  result: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): void => {
  expect(result.status).toBe('deferred')
  expect(result.publicationRollbackRecoveryStatus).toBe('deferred')
  expect(result.runtimePublicationCommitAdapterStatus).toBe('deferred')
  expect(result.reason).toBe(
    'recovery log replay and restore adapter is inspect-only until verified log reader, idempotent replay and persistent restore adapters exist'
  )
  expect(result.recoveryLogReplayRestore).toBe('deferred')
  expect(result.recoveryLogReplayAllowed).toBe(false)
  expect(result.persistentRestoreAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.liveRegistryMutable).toBe(false)
  expect(result.rollbackExecutionAllowed).toBe(false)
  expect(result.selectedPackageIds).toEqual(['discovery_valid'])
  expect(result.loadOrder).toEqual(['discovery_valid'])
  expect(result.registryCount).toBe(54)
  expect(result.entryCount).toBe(4244)
  expect(result.packageCount).toBe(1)
  expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
  expect(result.lockfileHash).toBe(lockfileHash)
  expect(result.replayRestoreChecks.map(check => ({
    id: check.id,
    status: check.status
  }))).toEqual([
    { id: 'publication-rollback-recovery-deferred', status: 'satisfied' },
    { id: 'runtime-publication-commit-adapter-deferred', status: 'satisfied' },
    { id: 'candidate-identity-consistent', status: 'satisfied' },
    { id: 'lockfile-hash-consistent', status: 'satisfied' },
    { id: 'recovery-actions-required', status: 'satisfied' },
    { id: 'recovery-stages-deferred', status: 'satisfied' },
    { id: 'commit-rollback-handoff-deferred', status: 'satisfied' },
    { id: 'no-replay-restore-effects-intact', status: 'satisfied' }
  ])
  expect(result.replayRestoreStages.map(stage => ({
    id: stage.id,
    status: stage.status
  }))).toEqual([
    { id: 'replay-restore-adapter-inspection', status: 'satisfied' },
    { id: 'recovery-log-load', status: 'deferred' },
    { id: 'recovery-log-replay', status: 'deferred' },
    { id: 'package-files-restore', status: 'deferred' },
    { id: 'settings-lockfile-restore', status: 'deferred' },
    { id: 'live-registry-restore', status: 'deferred' },
    { id: 'post-restore-verification', status: 'deferred' },
    { id: 'recovery-diagnostics-finalization', status: 'deferred' }
  ])
  expect(result.requiredReplayRestoreAdapters.map(adapter => ({
    id: adapter.id,
    status: adapter.status
  }))).toEqual([
    { id: 'verified-recovery-log-reader', status: 'required' },
    { id: 'idempotent-recovery-log-replay', status: 'required' },
    { id: 'package-file-restore-adapter', status: 'required' },
    { id: 'settings-lockfile-restore-adapter', status: 'required' },
    { id: 'live-registry-restore-adapter', status: 'required' },
    { id: 'post-restore-verification-adapter', status: 'required' },
    { id: 'redacted-recovery-diagnostics-adapter', status: 'required' },
    { id: 'interrupted-recovery-resume-guard', status: 'required' }
  ])
  expect(result.replayRestoreChecks.every(check => check.reason.length > 0)).toBe(true)
  expect(result.replayRestoreStages.every(stage => stage.reason.length > 0)).toBe(true)
  expect(result.requiredReplayRestoreAdapters.every(adapter => adapter.reason.length > 0)).toBe(true)
}

describe('third-party data pack recovery log replay restore adapter', () => {
  it('defers replay and restore while exposing deterministic checks and stages', () => {
    const result = buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
      publicationRollbackRecovery: createPublicationRollbackRecovery(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter()
    } as never)

    expectDeferredReplayRestore(result)
    expect('publicationRollbackRecovery' in result).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoReplayRestoreEffects(result)
    expectJsonGraphFrozen(result)

    const frozenOutputSnapshot = JSON.stringify(result)
    const firstCheck = result.replayRestoreChecks[0]
    const firstStage = result.replayRestoreStages[0]
    const firstAdapter = result.requiredReplayRestoreAdapters[0]
    if (!firstCheck || !firstStage || !firstAdapter) throw new Error('Expected frozen replay restore entries.')
    expect(() => {
      (result.replayRestoreChecks as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (result.replayRestoreStages as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (result.requiredReplayRestoreAdapters as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(result as unknown as Record<string, unknown>, 'recoveryLogReplayAllowed', true)).toBe(false)
    expect(Reflect.set(firstCheck as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(Reflect.set(firstStage as unknown as Record<string, unknown>, 'status', 'completed')).toBe(false)
    expect(Reflect.set(firstAdapter as unknown as Record<string, unknown>, 'status', 'satisfied')).toBe(false)
    expect(Reflect.set(result.effects as unknown as Record<string, unknown>, 'recoveryLogRead', true)).toBe(false)
    expect(JSON.stringify(result)).toBe(frozenOutputSnapshot)
  })

  it('skips replay and restore when no third-party packages are selected', () => {
    const result = buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
      publicationRollbackRecovery: createPublicationRollbackRecovery({
        status: 'skipped',
        runtimePublicationPreflightStatus: 'skipped',
        transactionPreCommitPlanStatus: 'skipped',
        liveRegistrySwapProtectionStatus: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
        status: 'skipped',
        runtimePublicationPreflightStatus: 'skipped',
        transactionPreCommitPlanStatus: 'skipped',
        liveRegistrySwapProtectionStatus: 'skipped',
        publicationRollbackRecoveryStatus: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      })
    } as never)

    expect(result.status).toBe('skipped')
    expect(result.reason).toBe('no selected third-party data packs')
    expect(result.replayRestoreChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(result.replayRestoreStages.every(stage => stage.status === 'skipped')).toBe(true)
    expect(result.requiredReplayRestoreAdapters).toEqual([])
    expectNoReplayRestoreEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks replay and restore when upstream reports are blocked', () => {
    const diagnostic = createDiagnostic('SCHEMA-VALIDATE-001', {
      stage: 'third-party.recovery-log-replay-restore-adapter.test',
      severity: 'error',
      packageId,
      recovery: 'remove-package'
    })
    const result = buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
      publicationRollbackRecovery: createPublicationRollbackRecovery({
        status: 'blocked',
        runtimePublicationPreflightStatus: 'blocked',
        transactionPreCommitPlanStatus: 'blocked',
        liveRegistrySwapProtectionStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      }),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
        status: 'blocked',
        runtimePublicationPreflightStatus: 'blocked',
        transactionPreCommitPlanStatus: 'blocked',
        liveRegistrySwapProtectionStatus: 'blocked',
        publicationRollbackRecoveryStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      })
    } as never)

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('discovery failed')
    expect(result.replayRestoreChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(result.replayRestoreStages.every(stage => stage.status === 'blocked')).toBe(true)
    expect(result.requiredReplayRestoreAdapters).toEqual([])
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        stage: 'third-party.recovery-log-replay-restore-adapter.test'
      })
    ]))
    expect(Object.is(result.diagnostics[0], diagnostic)).toBe(false)
    expectNoReplayRestoreEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks when replay and restore inputs diverge or lose required boundaries', () => {
    const cases = [
      {
        label: 'candidate hash',
        recovery: createPublicationRollbackRecovery({
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('9')
          }
        }),
        commit: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile hash',
        recovery: createPublicationRollbackRecovery({
          lockfileHash: testHash('8')
        }),
        commit: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'recovery action',
        recovery: createPublicationRollbackRecovery({
          requiredRecoveryActions: recoveryActions.filter(action => action.id !== 'idempotent-replay')
        }),
        commit: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'recovery-actions-required'
      },
      {
        label: 'recovery stage',
        recovery: createPublicationRollbackRecovery({
          recoveryStages: recoveryStages.filter(stage => stage.id !== 'transaction-log-replay')
        }),
        commit: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'recovery-stages-deferred'
      },
      {
        label: 'handoff',
        recovery: createPublicationRollbackRecovery(),
        commit: createRuntimePublicationCommitAdapter({
          commitStages: [],
          requiredCommitAdapters: []
        }),
        blockedCheckId: 'commit-rollback-handoff-deferred'
      },
      {
        label: 'replay effect',
        recovery: createPublicationRollbackRecovery({
          effects: {
            ...recoveryEffects,
            recoveryLogRead: true
          } as never
        }),
        commit: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'no-replay-restore-effects-intact'
      }
    ]

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
        publicationRollbackRecovery: currentCase.recovery,
        runtimePublicationCommitAdapter: currentCase.commit
      } as never)

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('recovery log replay and restore adapter inputs are inconsistent')
      expect(result.replayRestoreChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.recovery-log-replay-restore-adapter.checks',
          fieldPath: `/replayRestoreChecks/${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).toContain(currentCase.label === 'candidate hash'
        ? 'candidate-identity-consistent'
        : currentCase.blockedCheckId)
      expect(result.requiredReplayRestoreAdapters).toEqual([])
      expectNoReplayRestoreEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package summaries and diagnostics before exposing the replay restore report', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/recovery-replay-${label}-length`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.recovery-log-replay-restore-adapter.proxy-test',
      severity: 'warning',
      packageId,
      relatedPackageIds: createHostileArray([packageId], 'related-package-ids'),
      details: {
        reason: 'proxy diagnostic',
        list: createHostileArray(['first', { stable: true }], 'details-list') as never
      }
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')

    const result = buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
      publicationRollbackRecovery: createPublicationRollbackRecovery(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      })
    } as never)

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['discovery_valid'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(result.loadOrder).toEqual(['discovery_valid'])
    expect(result.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.recovery-log-replay-restore-adapter.proxy-test',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(result.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(result.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(result.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(result.loadOrder, loadOrder)).toBe(false)
    expect(Object.is(result.diagnostics[0], diagnostic)).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('recovery-replay-selected-package-ids-length')
    expectNoReplayRestoreEffects(result)
    expectJsonGraphFrozen(result)
  })
})
