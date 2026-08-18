import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery,
  type ThirdPartyDataPackPublicationRollbackRecoveryResult
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionRequirement,
  ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import type { ThirdPartyDataPackRuntimePublicationPreflightResult } from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPlanResult,
  ThirdPartyDataPackTransactionRollbackCheckpoint
} from '@/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
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

const publicationEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
} as const

const swapProtectionEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
} as const

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

const rollbackCheckpoints: readonly ThirdPartyDataPackTransactionRollbackCheckpoint[] = [
  {
    id: 'before-transaction-log-write',
    status: 'required',
    reason: 'A failed recovery-log prepare step must leave no observable install state.'
  },
  {
    id: 'before-package-files-write',
    status: 'required',
    reason: 'Package writes must be restorable before staged files can replace or add installed content.'
  },
  {
    id: 'before-settings-lockfile-write',
    status: 'required',
    reason: 'Settings and mod-lock writes must be checked against the same candidate identity before commit.'
  },
  {
    id: 'before-live-registry-swap',
    status: 'required',
    reason: 'The live registry swap must have the previous registry identity available for rollback diagnostics.'
  },
  {
    id: 'after-failure-restore-verification',
    status: 'required',
    reason: 'Rollback completion must verify every touched boundary returned to a consistent state.'
  }
]

const requiredProtections: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirement[] = [
  {
    id: 'single-assignment-live-registry-reference',
    status: 'required',
    reason: 'The live registry reference must be swapped only once.'
  },
  {
    id: 'previous-registry-identity-retention',
    status: 'required',
    reason: 'The previous registry identity must be retained until rollback finalization.'
  },
  {
    id: 'candidate-artifact-visibility-barrier',
    status: 'required',
    reason: 'Candidate artifacts must not leak to GameApp consumers.'
  },
  {
    id: 'post-swap-verification',
    status: 'required',
    reason: 'Post-swap verification must prove identity consistency.'
  },
  {
    id: 'rollback-restore-diagnostics',
    status: 'required',
    reason: 'Rollback must emit diagnostics proving restore behavior.'
  }
]

const createRuntimePublicationPreflight = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationPreflightResult> = {}
): ThirdPartyDataPackRuntimePublicationPreflightResult => ({
  status: 'deferred',
  mountInputStatus: 'ready',
  sourceAdapterGateStatus: 'deferred',
  reason: 'runtime publication handoff is inspect-only until commit adapter, live swap protection and rollback recovery exist',
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
  runtimePublication: 'deferred',
  publicationAllowed: false,
  candidateRegistryFrozen: true,
  candidateSnapshotAvailable: true,
  lockfileDraftAvailable: true,
  handoffChecks: [],
  remainingRequirements: [],
  effects: publicationEffects,
  ...overrides
})

const createTransactionPreCommitPlan = (
  overrides: Partial<ThirdPartyDataPackTransactionPreCommitPlanResult> = {}
): ThirdPartyDataPackTransactionPreCommitPlanResult => ({
  status: 'deferred',
  transactionPreflightStatus: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  reason: 'transaction pre-commit plan is inspect-only until write adapters, recovery logs and rollback verification exist',
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
  preCommitPlan: 'deferred',
  commitAllowed: false,
  writeAllowed: false,
  recoveryRequired: false,
  rollbackRequired: false,
  preCommitChecks: [],
  phases: [],
  writeBoundaries: [],
  rollbackCheckpoints,
  effects: publicationEffects,
  ...overrides
})

const createLiveRegistrySwapProtection = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapProtectionResult> = {}
): ThirdPartyDataPackLiveRegistrySwapProtectionResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  reason: 'live registry swap protection is inspect-only until single-assignment swap, previous registry retention and rollback diagnostics exist',
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
  liveRegistrySwap: 'deferred',
  swapAllowed: false,
  liveRegistryMutable: false,
  protectionChecks: [],
  requiredProtections,
  effects: swapProtectionEffects,
  ...overrides
})

const expectNoWriteEffects = (recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult): void => {
  expect(recovery.effects).toEqual(recoveryEffects)
  expect(Object.isFrozen(recovery.effects)).toBe(true)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectDeferredRecovery = (recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult): void => {
  expect(recovery.status).toBe('deferred')
  expect(recovery.runtimePublicationPreflightStatus).toBe('deferred')
  expect(recovery.transactionPreCommitPlanStatus).toBe('deferred')
  expect(recovery.liveRegistrySwapProtectionStatus).toBe('deferred')
  expect(recovery.reason).toBe(
    'publication rollback recovery is inspect-only until recovery log replay, persistent restore adapters and post-restore verification exist'
  )
  expect(recovery.rollbackRecovery).toBe('deferred')
  expect(recovery.recoveryAllowed).toBe(false)
  expect(recovery.rollbackExecutionAllowed).toBe(false)
  expect(recovery.liveRegistryMutable).toBe(false)
  expect(recovery.selectedPackageIds).toEqual(['discovery_valid'])
  expect(recovery.loadOrder).toEqual(['discovery_valid'])
  expect(recovery.registryCount).toBe(54)
  expect(recovery.entryCount).toBe(4244)
  expect(recovery.packageCount).toBe(1)
  expect(recovery.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
  expect(recovery.lockfileHash).toBe(lockfileHash)
  expect(recovery.recoveryChecks.map(check => ({
    id: check.id,
    status: check.status
  }))).toEqual([
    { id: 'runtime-publication-preflight-deferred', status: 'satisfied' },
    { id: 'transaction-precommit-plan-deferred', status: 'satisfied' },
    { id: 'live-registry-swap-protection-deferred', status: 'satisfied' },
    { id: 'candidate-identity-consistent', status: 'satisfied' },
    { id: 'lockfile-hash-consistent', status: 'satisfied' },
    { id: 'rollback-checkpoints-required', status: 'satisfied' },
    { id: 'rollback-protections-required', status: 'satisfied' },
    { id: 'no-recovery-effects-intact', status: 'satisfied' }
  ])
  expect(recovery.recoveryStages.map(stage => ({
    id: stage.id,
    status: stage.status
  }))).toEqual([
    { id: 'recovery-plan-inspection', status: 'satisfied' },
    { id: 'failure-capture', status: 'deferred' },
    { id: 'transaction-log-replay', status: 'deferred' },
    { id: 'package-files-restore', status: 'deferred' },
    { id: 'settings-lockfile-restore', status: 'deferred' },
    { id: 'live-registry-restore', status: 'deferred' },
    { id: 'post-rollback-verification', status: 'deferred' },
    { id: 'recovery-diagnostics-finalization', status: 'deferred' }
  ])
  expect(recovery.requiredRecoveryActions.map(action => ({
    id: action.id,
    status: action.status
  }))).toEqual([
    { id: 'recovery-log-reader', status: 'required' },
    { id: 'package-file-restore-adapter', status: 'required' },
    { id: 'settings-lockfile-restore-adapter', status: 'required' },
    { id: 'previous-live-registry-reference', status: 'required' },
    { id: 'post-restore-verification', status: 'required' },
    { id: 'redacted-recovery-diagnostics', status: 'required' },
    { id: 'idempotent-replay', status: 'required' }
  ])
  expect(recovery.recoveryChecks.every(check => check.reason.length > 0)).toBe(true)
  expect(recovery.recoveryStages.every(stage => stage.reason.length > 0)).toBe(true)
  expect(recovery.requiredRecoveryActions.every(action => action.reason.length > 0)).toBe(true)
}

describe('third-party data pack publication rollback recovery', () => {
  it('defers rollback execution while exposing deterministic recovery checks and stages', () => {
    const recovery = buildThirdPartyDataPackPublicationRollbackRecovery({
      runtimePublicationPreflight: createRuntimePublicationPreflight(),
      transactionPreCommitPlan: createTransactionPreCommitPlan(),
      liveRegistrySwapProtection: createLiveRegistrySwapProtection()
    } as never)

    expectDeferredRecovery(recovery)
    expect('runtimePublicationPreflight' in recovery).toBe(false)
    expect('transactionPreCommitPlan' in recovery).toBe(false)
    expect('liveRegistrySwapProtection' in recovery).toBe(false)
    expect('candidateRegistrySet' in recovery).toBe(false)
    expect('candidateSnapshot' in recovery).toBe(false)
    expect('lockfileDraft' in recovery).toBe(false)
    expectNoWriteEffects(recovery)
    expectJsonGraphFrozen(recovery)

    const frozenOutputSnapshot = JSON.stringify(recovery)
    const firstCheck = recovery.recoveryChecks[0]
    const firstStage = recovery.recoveryStages[0]
    const firstAction = recovery.requiredRecoveryActions[0]
    if (!firstCheck || !firstStage || !firstAction) throw new Error('Expected frozen recovery entries.')
    expect(() => {
      (recovery.recoveryChecks as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (recovery.recoveryStages as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (recovery.requiredRecoveryActions as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(recovery as unknown as Record<string, unknown>, 'recoveryAllowed', true)).toBe(false)
    expect(Reflect.set(firstCheck as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(Reflect.set(firstStage as unknown as Record<string, unknown>, 'status', 'completed')).toBe(false)
    expect(Reflect.set(firstAction as unknown as Record<string, unknown>, 'status', 'satisfied')).toBe(false)
    expect(Reflect.set(recovery.effects as unknown as Record<string, unknown>, 'rollbackExecuted', true)).toBe(false)
    expect(JSON.stringify(recovery)).toBe(frozenOutputSnapshot)
  })

  it('skips rollback recovery when no third-party packages are selected', () => {
    const recovery = buildThirdPartyDataPackPublicationRollbackRecovery({
      runtimePublicationPreflight: createRuntimePublicationPreflight({
        status: 'skipped',
        mountInputStatus: 'skipped',
        sourceAdapterGateStatus: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
      transactionPreCommitPlan: createTransactionPreCommitPlan({
        status: 'skipped',
        transactionPreflightStatus: 'skipped',
        runtimePublicationPreflightStatus: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
      liveRegistrySwapProtection: createLiveRegistrySwapProtection({
        status: 'skipped',
        runtimePublicationPreflightStatus: 'skipped',
        transactionPreCommitPlanStatus: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      })
    } as never)

    expect(recovery.status).toBe('skipped')
    expect(recovery.reason).toBe('no selected third-party data packs')
    expect(recovery.recoveryChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(recovery.recoveryStages.every(stage => stage.status === 'skipped')).toBe(true)
    expect(recovery.requiredRecoveryActions).toEqual([])
    expectNoWriteEffects(recovery)
    expectJsonGraphFrozen(recovery)
  })

  it('blocks rollback recovery when upstream reports are blocked', () => {
    const diagnostic = createDiagnostic('SCHEMA-VALIDATE-001', {
      stage: 'third-party.publication-rollback-recovery.test',
      severity: 'error',
      packageId,
      recovery: 'remove-package'
    })
    const recovery = buildThirdPartyDataPackPublicationRollbackRecovery({
      runtimePublicationPreflight: createRuntimePublicationPreflight({
        status: 'blocked',
        mountInputStatus: 'blocked',
        sourceAdapterGateStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      }),
      transactionPreCommitPlan: createTransactionPreCommitPlan({
        status: 'blocked',
        transactionPreflightStatus: 'blocked',
        runtimePublicationPreflightStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      }),
      liveRegistrySwapProtection: createLiveRegistrySwapProtection({
        status: 'blocked',
        runtimePublicationPreflightStatus: 'blocked',
        transactionPreCommitPlanStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      })
    } as never)

    expect(recovery.status).toBe('blocked')
    expect(recovery.reason).toBe('discovery failed')
    expect(recovery.recoveryChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(recovery.recoveryStages.every(stage => stage.status === 'blocked')).toBe(true)
    expect(recovery.requiredRecoveryActions).toEqual([])
    expect(recovery.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        stage: 'third-party.publication-rollback-recovery.test'
      })
    ]))
    expect(Object.is(recovery.diagnostics[0], diagnostic)).toBe(false)
    expectNoWriteEffects(recovery)
    expectJsonGraphFrozen(recovery)
  })

  it('blocks when recovery inputs diverge or lose required recovery boundaries', () => {
    const cases = [
      {
        label: 'candidate hash',
        runtime: createRuntimePublicationPreflight({
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('9')
          }
        }),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection(),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile hash',
        runtime: createRuntimePublicationPreflight({
          lockfileHash: testHash('8')
        }),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection(),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'rollback checkpoints',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan({
          rollbackCheckpoints: rollbackCheckpoints.filter(checkpoint => checkpoint.id !== 'after-failure-restore-verification')
        }),
        protection: createLiveRegistrySwapProtection(),
        blockedCheckId: 'rollback-checkpoints-required'
      },
      {
        label: 'rollback protections',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection({
          requiredProtections: requiredProtections.filter(protection => protection.id !== 'rollback-restore-diagnostics')
        }),
        blockedCheckId: 'rollback-protections-required'
      },
      {
        label: 'rollback effect',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection({
          effects: {
            ...swapProtectionEffects,
            liveRegistrySwapped: true
          } as never
        }),
        blockedCheckId: 'no-recovery-effects-intact'
      }
    ]

    for (const currentCase of cases) {
      const recovery = buildThirdPartyDataPackPublicationRollbackRecovery({
        runtimePublicationPreflight: currentCase.runtime,
        transactionPreCommitPlan: currentCase.plan,
        liveRegistrySwapProtection: currentCase.protection
      } as never)

      expect(recovery.status).toBe('blocked')
      expect(recovery.reason).toBe('publication rollback recovery inputs are inconsistent')
      expect(recovery.recoveryChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(recovery.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.publication-rollback-recovery.checks',
          fieldPath: `/recoveryChecks/${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(recovery)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(recovery)).toContain(currentCase.label === 'candidate hash'
        ? 'candidate-identity-consistent'
        : currentCase.blockedCheckId)
      expect(recovery.requiredRecoveryActions).toEqual([])
      expectNoWriteEffects(recovery)
      expectJsonGraphFrozen(recovery)
    }
  })

  it('copies package summaries and diagnostics before exposing the recovery report', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/publication-rollback-${label}-length`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.publication-rollback-recovery.proxy-test',
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

    const recovery = buildThirdPartyDataPackPublicationRollbackRecovery({
      runtimePublicationPreflight: createRuntimePublicationPreflight(),
      transactionPreCommitPlan: createTransactionPreCommitPlan(),
      liveRegistrySwapProtection: createLiveRegistrySwapProtection({
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      })
    } as never)

    expect(recovery.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(recovery.selectedPackageIds).toEqual(['discovery_valid'])
    expect(recovery.blockedPackageIds).toEqual(['blocked_pack'])
    expect(recovery.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(recovery.loadOrder).toEqual(['discovery_valid'])
    expect(recovery.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.publication-rollback-recovery.proxy-test',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(recovery.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(recovery.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(recovery.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(recovery.loadOrder, loadOrder)).toBe(false)
    expect(Object.is(recovery.diagnostics[0], diagnostic)).toBe(false)
    expect(JSON.stringify(recovery)).not.toContain('C:/Users')
    expect(JSON.stringify(recovery)).not.toContain('LENOVO')
    expect(JSON.stringify(recovery)).not.toContain('publication-rollback-selected-package-ids-length')
    expectNoWriteEffects(recovery)
    expectJsonGraphFrozen(recovery)
  })
})
