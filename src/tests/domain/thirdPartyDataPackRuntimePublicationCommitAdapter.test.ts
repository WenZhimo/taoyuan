import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import type {
  ThirdPartyDataPackPublicationRollbackRecoveryAction,
  ThirdPartyDataPackPublicationRollbackRecoveryResult
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import {
  buildThirdPartyDataPackRuntimePublicationCommitAdapter,
  type ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackRuntimePublicationRequirement,
  ThirdPartyDataPackRuntimePublicationPreflightResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPlanResult,
  ThirdPartyDataPackTransactionRollbackCheckpoint,
  ThirdPartyDataPackTransactionWriteBoundary
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

const liveSwapEffects = {
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

const commitEffects = recoveryEffects

const runtimePublicationRequirements: readonly ThirdPartyDataPackRuntimePublicationRequirement[] = [
  {
    id: 'runtime-publication-commit-adapter',
    status: 'required',
    reason: 'Define the final atomic commit adapter before replacing the live GameApp registry reference.'
  },
  {
    id: 'live-registry-swap-protection',
    status: 'required',
    reason: 'Define single-assignment live registry swap protection.'
  },
  {
    id: 'publication-failure-rollback',
    status: 'required',
    reason: 'Define rollback diagnostics and recovery before failed publication can affect startup or saves.'
  }
]

const writeBoundaries: readonly ThirdPartyDataPackTransactionWriteBoundary[] = [
  'transaction-log',
  'package-files',
  'package-backups',
  'installation-settings',
  'mod-lockfile',
  'live-registry',
  'player-saves',
  'official-cache'
].map(id => ({
  id: id as ThirdPartyDataPackTransactionWriteBoundary['id'],
  status: 'deferred',
  writeAllowed: false,
  reason: `${id} writes remain deferred.`
}))

const rollbackCheckpoints: readonly ThirdPartyDataPackTransactionRollbackCheckpoint[] = [
  'before-transaction-log-write',
  'before-package-files-write',
  'before-settings-lockfile-write',
  'before-live-registry-swap',
  'after-failure-restore-verification'
].map(id => ({
  id: id as ThirdPartyDataPackTransactionRollbackCheckpoint['id'],
  status: 'required',
  reason: `${id} remains required.`
}))

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
  remainingRequirements: runtimePublicationRequirements,
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
  writeBoundaries,
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
  requiredProtections: [],
  effects: liveSwapEffects,
  ...overrides
})

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
  recoveryStages: [],
  requiredRecoveryActions: recoveryActions,
  effects: recoveryEffects,
  ...overrides
})

const expectNoWriteEffects = (commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult): void => {
  expect(commitAdapter.effects).toEqual(commitEffects)
  expect(Object.isFrozen(commitAdapter.effects)).toBe(true)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectDeferredCommitAdapter = (
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): void => {
  expect(commitAdapter.status).toBe('deferred')
  expect(commitAdapter.runtimePublicationPreflightStatus).toBe('deferred')
  expect(commitAdapter.transactionPreCommitPlanStatus).toBe('deferred')
  expect(commitAdapter.liveRegistrySwapProtectionStatus).toBe('deferred')
  expect(commitAdapter.publicationRollbackRecoveryStatus).toBe('deferred')
  expect(commitAdapter.reason).toBe(
    'runtime publication commit adapter is inspect-only until atomic commit adapter, persistent writers and post-commit verification exist'
  )
  expect(commitAdapter.runtimePublicationCommit).toBe('deferred')
  expect(commitAdapter.commitAllowed).toBe(false)
  expect(commitAdapter.publicationAllowed).toBe(false)
  expect(commitAdapter.writeAllowed).toBe(false)
  expect(commitAdapter.liveRegistryMutable).toBe(false)
  expect(commitAdapter.rollbackExecutionAllowed).toBe(false)
  expect(commitAdapter.selectedPackageIds).toEqual(['discovery_valid'])
  expect(commitAdapter.loadOrder).toEqual(['discovery_valid'])
  expect(commitAdapter.registryCount).toBe(54)
  expect(commitAdapter.entryCount).toBe(4244)
  expect(commitAdapter.packageCount).toBe(1)
  expect(commitAdapter.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
  expect(commitAdapter.lockfileHash).toBe(lockfileHash)
  expect(commitAdapter.commitChecks.map(check => ({
    id: check.id,
    status: check.status
  }))).toEqual([
    { id: 'runtime-publication-preflight-deferred', status: 'satisfied' },
    { id: 'transaction-precommit-plan-deferred', status: 'satisfied' },
    { id: 'live-registry-swap-protection-deferred', status: 'satisfied' },
    { id: 'publication-rollback-recovery-deferred', status: 'satisfied' },
    { id: 'candidate-identity-consistent', status: 'satisfied' },
    { id: 'lockfile-hash-consistent', status: 'satisfied' },
    { id: 'commit-adapter-boundary-required', status: 'satisfied' },
    { id: 'transaction-write-boundaries-deferred', status: 'satisfied' },
    { id: 'rollback-recovery-boundary-required', status: 'satisfied' },
    { id: 'no-commit-effects-intact', status: 'satisfied' }
  ])
  expect(commitAdapter.commitStages.map(stage => ({
    id: stage.id,
    status: stage.status
  }))).toEqual([
    { id: 'commit-adapter-inspection', status: 'satisfied' },
    { id: 'transaction-log-prepare', status: 'deferred' },
    { id: 'package-files-commit', status: 'deferred' },
    { id: 'settings-lockfile-commit', status: 'deferred' },
    { id: 'live-registry-publication', status: 'deferred' },
    { id: 'post-commit-verification', status: 'deferred' },
    { id: 'rollback-recovery-handoff', status: 'deferred' },
    { id: 'commit-diagnostics-finalization', status: 'deferred' }
  ])
  expect(commitAdapter.requiredCommitAdapters.map(adapter => ({
    id: adapter.id,
    status: adapter.status
  }))).toEqual([
    { id: 'atomic-runtime-publication-commit-adapter', status: 'required' },
    { id: 'transaction-log-writer', status: 'required' },
    { id: 'package-file-commit-adapter', status: 'required' },
    { id: 'settings-lockfile-commit-adapter', status: 'required' },
    { id: 'live-registry-publication-adapter', status: 'required' },
    { id: 'post-commit-verification-adapter', status: 'required' },
    { id: 'rollback-recovery-orchestrator', status: 'required' }
  ])
  expect(commitAdapter.commitChecks.every(check => check.reason.length > 0)).toBe(true)
  expect(commitAdapter.commitStages.every(stage => stage.reason.length > 0)).toBe(true)
  expect(commitAdapter.requiredCommitAdapters.every(adapter => adapter.reason.length > 0)).toBe(true)
}

describe('third-party data pack runtime publication commit adapter', () => {
  it('defers runtime publication commit while exposing deterministic adapter checks and stages', () => {
    const commitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
      runtimePublicationPreflight: createRuntimePublicationPreflight(),
      transactionPreCommitPlan: createTransactionPreCommitPlan(),
      liveRegistrySwapProtection: createLiveRegistrySwapProtection(),
      publicationRollbackRecovery: createPublicationRollbackRecovery()
    } as never)

    expectDeferredCommitAdapter(commitAdapter)
    expect('runtimePublicationPreflight' in commitAdapter).toBe(false)
    expect('transactionPreCommitPlan' in commitAdapter).toBe(false)
    expect('liveRegistrySwapProtection' in commitAdapter).toBe(false)
    expect('publicationRollbackRecovery' in commitAdapter).toBe(false)
    expect('candidateRegistrySet' in commitAdapter).toBe(false)
    expect('candidateSnapshot' in commitAdapter).toBe(false)
    expect('lockfileDraft' in commitAdapter).toBe(false)
    expectNoWriteEffects(commitAdapter)
    expectJsonGraphFrozen(commitAdapter)

    const frozenOutputSnapshot = JSON.stringify(commitAdapter)
    const firstCheck = commitAdapter.commitChecks[0]
    const firstStage = commitAdapter.commitStages[0]
    const firstAdapter = commitAdapter.requiredCommitAdapters[0]
    if (!firstCheck || !firstStage || !firstAdapter) throw new Error('Expected frozen commit adapter entries.')
    expect(() => {
      (commitAdapter.commitChecks as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (commitAdapter.commitStages as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (commitAdapter.requiredCommitAdapters as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(commitAdapter as unknown as Record<string, unknown>, 'commitAllowed', true)).toBe(false)
    expect(Reflect.set(firstCheck as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(Reflect.set(firstStage as unknown as Record<string, unknown>, 'status', 'committed')).toBe(false)
    expect(Reflect.set(firstAdapter as unknown as Record<string, unknown>, 'status', 'satisfied')).toBe(false)
    expect(Reflect.set(commitAdapter.effects as unknown as Record<string, unknown>, 'lockfileWritten', true)).toBe(false)
    expect(JSON.stringify(commitAdapter)).toBe(frozenOutputSnapshot)
  })

  it('skips runtime publication commit when no third-party packages are selected', () => {
    const commitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
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
      }),
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
      })
    } as never)

    expect(commitAdapter.status).toBe('skipped')
    expect(commitAdapter.reason).toBe('no selected third-party data packs')
    expect(commitAdapter.commitChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(commitAdapter.commitStages.every(stage => stage.status === 'skipped')).toBe(true)
    expect(commitAdapter.requiredCommitAdapters).toEqual([])
    expectNoWriteEffects(commitAdapter)
    expectJsonGraphFrozen(commitAdapter)
  })

  it('blocks runtime publication commit when upstream reports are blocked', () => {
    const diagnostic = createDiagnostic('SCHEMA-VALIDATE-001', {
      stage: 'third-party.runtime-publication-commit-adapter.test',
      severity: 'error',
      packageId,
      recovery: 'remove-package'
    })
    const commitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
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
      }),
      publicationRollbackRecovery: createPublicationRollbackRecovery({
        status: 'blocked',
        runtimePublicationPreflightStatus: 'blocked',
        transactionPreCommitPlanStatus: 'blocked',
        liveRegistrySwapProtectionStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      })
    } as never)

    expect(commitAdapter.status).toBe('blocked')
    expect(commitAdapter.reason).toBe('discovery failed')
    expect(commitAdapter.commitChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(commitAdapter.commitStages.every(stage => stage.status === 'blocked')).toBe(true)
    expect(commitAdapter.requiredCommitAdapters).toEqual([])
    expect(commitAdapter.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        stage: 'third-party.runtime-publication-commit-adapter.test'
      })
    ]))
    expect(Object.is(commitAdapter.diagnostics[0], diagnostic)).toBe(false)
    expectNoWriteEffects(commitAdapter)
    expectJsonGraphFrozen(commitAdapter)
  })

  it('blocks when commit inputs diverge or lose required commit boundaries', () => {
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
        recovery: createPublicationRollbackRecovery(),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile hash',
        runtime: createRuntimePublicationPreflight({
          lockfileHash: testHash('8')
        }),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection(),
        recovery: createPublicationRollbackRecovery(),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'commit adapter requirement',
        runtime: createRuntimePublicationPreflight({
          remainingRequirements: runtimePublicationRequirements.filter(
            requirement => requirement.id !== 'runtime-publication-commit-adapter'
          )
        }),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection(),
        recovery: createPublicationRollbackRecovery(),
        blockedCheckId: 'commit-adapter-boundary-required'
      },
      {
        label: 'write boundary',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan({
          writeBoundaries: writeBoundaries.filter(boundary => boundary.id !== 'mod-lockfile')
        }),
        protection: createLiveRegistrySwapProtection(),
        recovery: createPublicationRollbackRecovery(),
        blockedCheckId: 'transaction-write-boundaries-deferred'
      },
      {
        label: 'recovery action',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection(),
        recovery: createPublicationRollbackRecovery({
          requiredRecoveryActions: recoveryActions.filter(action => action.id !== 'idempotent-replay')
        }),
        blockedCheckId: 'rollback-recovery-boundary-required'
      },
      {
        label: 'commit effect',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan(),
        protection: createLiveRegistrySwapProtection(),
        recovery: createPublicationRollbackRecovery({
          effects: {
            ...recoveryEffects,
            transactionLogWritten: true
          } as never
        }),
        blockedCheckId: 'no-commit-effects-intact'
      }
    ]

    for (const currentCase of cases) {
      const commitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
        runtimePublicationPreflight: currentCase.runtime,
        transactionPreCommitPlan: currentCase.plan,
        liveRegistrySwapProtection: currentCase.protection,
        publicationRollbackRecovery: currentCase.recovery
      } as never)

      expect(commitAdapter.status).toBe('blocked')
      expect(commitAdapter.reason).toBe('runtime publication commit adapter inputs are inconsistent')
      expect(commitAdapter.commitChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(commitAdapter.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.runtime-publication-commit-adapter.checks',
          fieldPath: `/commitChecks/${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(commitAdapter)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(commitAdapter)).toContain(currentCase.label === 'candidate hash'
        ? 'candidate-identity-consistent'
        : currentCase.blockedCheckId)
      expect(commitAdapter.requiredCommitAdapters).toEqual([])
      expectNoWriteEffects(commitAdapter)
      expectJsonGraphFrozen(commitAdapter)
    }
  })

  it('copies package summaries and diagnostics before exposing the commit adapter report', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/runtime-commit-${label}-length`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.runtime-publication-commit-adapter.proxy-test',
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

    const commitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
      runtimePublicationPreflight: createRuntimePublicationPreflight(),
      transactionPreCommitPlan: createTransactionPreCommitPlan(),
      liveRegistrySwapProtection: createLiveRegistrySwapProtection(),
      publicationRollbackRecovery: createPublicationRollbackRecovery({
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      })
    } as never)

    expect(commitAdapter.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(commitAdapter.selectedPackageIds).toEqual(['discovery_valid'])
    expect(commitAdapter.blockedPackageIds).toEqual(['blocked_pack'])
    expect(commitAdapter.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(commitAdapter.loadOrder).toEqual(['discovery_valid'])
    expect(commitAdapter.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.runtime-publication-commit-adapter.proxy-test',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(commitAdapter.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(commitAdapter.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(commitAdapter.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(commitAdapter.loadOrder, loadOrder)).toBe(false)
    expect(Object.is(commitAdapter.diagnostics[0], diagnostic)).toBe(false)
    expect(JSON.stringify(commitAdapter)).not.toContain('C:/Users')
    expect(JSON.stringify(commitAdapter)).not.toContain('LENOVO')
    expect(JSON.stringify(commitAdapter)).not.toContain('runtime-commit-selected-package-ids-length')
    expectNoWriteEffects(commitAdapter)
    expectJsonGraphFrozen(commitAdapter)
  })
})
