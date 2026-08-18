import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackRuntimePublicationPreflightResult } from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan,
  type ThirdPartyDataPackTransactionPreCommitPlanResult
} from '@/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
import type { ThirdPartyDataPackTransactionPreflightResult } from '@/domain/mods/thirdPartyDataPackTransactionPreflight'
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

const transactionEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
} as const

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

const createTransactionPreflight = (
  overrides: Partial<ThirdPartyDataPackTransactionPreflightResult> = {}
): ThirdPartyDataPackTransactionPreflightResult => ({
  status: 'deferred',
  runtimeGateStatus: 'deferred',
  reason: 'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
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
  transactionCommit: 'deferred',
  commitAllowed: false,
  recoveryRequired: false,
  rollbackRequired: false,
  requiredTransactions: [],
  lifecycleOperations: [],
  effects: transactionEffects,
  ...overrides
})

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

const expectNoWriteEffects = (plan: ThirdPartyDataPackTransactionPreCommitPlanResult): void => {
  expect(plan.effects).toEqual(publicationEffects)
  expect(Object.isFrozen(plan.effects)).toBe(true)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectDeferredPlan = (plan: ThirdPartyDataPackTransactionPreCommitPlanResult): void => {
  expect(plan.status).toBe('deferred')
  expect(plan.transactionPreflightStatus).toBe('deferred')
  expect(plan.runtimePublicationPreflightStatus).toBe('deferred')
  expect(plan.reason).toBe(
    'transaction pre-commit plan is inspect-only until write adapters, recovery logs and rollback verification exist'
  )
  expect(plan.preCommitPlan).toBe('deferred')
  expect(plan.commitAllowed).toBe(false)
  expect(plan.writeAllowed).toBe(false)
  expect(plan.recoveryRequired).toBe(false)
  expect(plan.rollbackRequired).toBe(false)
  expect(plan.selectedPackageIds).toEqual(['discovery_valid'])
  expect(plan.loadOrder).toEqual(['discovery_valid'])
  expect(plan.registryCount).toBe(54)
  expect(plan.entryCount).toBe(4244)
  expect(plan.packageCount).toBe(1)
  expect(plan.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
  expect(plan.lockfileHash).toBe(lockfileHash)
  expect(plan.preCommitChecks.map(check => ({
    id: check.id,
    status: check.status
  }))).toEqual([
    { id: 'transaction-preflight-deferred', status: 'satisfied' },
    { id: 'runtime-publication-preflight-deferred', status: 'satisfied' },
    { id: 'candidate-identity-consistent', status: 'satisfied' },
    { id: 'lockfile-hash-consistent', status: 'satisfied' },
    { id: 'no-write-effects-intact', status: 'satisfied' }
  ])
  expect(plan.phases.map(phase => ({
    id: phase.id,
    status: phase.status
  }))).toEqual([
    { id: 'pre-commit-inspection', status: 'satisfied' },
    { id: 'transaction-log-prepare', status: 'deferred' },
    { id: 'package-write-stage', status: 'deferred' },
    { id: 'settings-lockfile-stage', status: 'deferred' },
    { id: 'live-registry-swap', status: 'deferred' },
    { id: 'post-commit-verification', status: 'deferred' },
    { id: 'rollback-finalization', status: 'deferred' }
  ])
  expect(plan.writeBoundaries.map(boundary => ({
    id: boundary.id,
    status: boundary.status,
    writeAllowed: boundary.writeAllowed
  }))).toEqual([
    { id: 'transaction-log', status: 'deferred', writeAllowed: false },
    { id: 'package-files', status: 'deferred', writeAllowed: false },
    { id: 'package-backups', status: 'deferred', writeAllowed: false },
    { id: 'installation-settings', status: 'deferred', writeAllowed: false },
    { id: 'mod-lockfile', status: 'deferred', writeAllowed: false },
    { id: 'live-registry', status: 'deferred', writeAllowed: false },
    { id: 'player-saves', status: 'deferred', writeAllowed: false },
    { id: 'official-cache', status: 'deferred', writeAllowed: false }
  ])
  expect(plan.rollbackCheckpoints.map(checkpoint => ({
    id: checkpoint.id,
    status: checkpoint.status
  }))).toEqual([
    { id: 'before-transaction-log-write', status: 'required' },
    { id: 'before-package-files-write', status: 'required' },
    { id: 'before-settings-lockfile-write', status: 'required' },
    { id: 'before-live-registry-swap', status: 'required' },
    { id: 'after-failure-restore-verification', status: 'required' }
  ])
  expect(plan.preCommitChecks.every(check => check.reason.length > 0)).toBe(true)
  expect(plan.phases.every(phase => phase.reason.length > 0)).toBe(true)
  expect(plan.writeBoundaries.every(boundary => boundary.reason.length > 0)).toBe(true)
  expect(plan.rollbackCheckpoints.every(checkpoint => checkpoint.reason.length > 0)).toBe(true)
}

describe('third-party data pack transaction pre-commit plan', () => {
  it('defers all write boundaries while exposing a deterministic pre-commit state machine', () => {
    const transactionPreflight = createTransactionPreflight()
    const runtimePublicationPreflight = createRuntimePublicationPreflight()

    const plan = buildThirdPartyDataPackTransactionPreCommitPlan({
      transactionPreflight,
      runtimePublicationPreflight
    } as never)

    expectDeferredPlan(plan)
    expect('transactionPreflight' in plan).toBe(false)
    expect('runtimePublicationPreflight' in plan).toBe(false)
    expect('candidateRegistrySet' in plan).toBe(false)
    expect('candidateSnapshot' in plan).toBe(false)
    expect('lockfileDraft' in plan).toBe(false)
    expectNoWriteEffects(plan)
    expectJsonGraphFrozen(plan)

    const frozenOutputSnapshot = JSON.stringify(plan)
    const firstCheck = plan.preCommitChecks[0]
    const firstPhase = plan.phases[0]
    const firstBoundary = plan.writeBoundaries[0]
    const firstCheckpoint = plan.rollbackCheckpoints[0]
    if (!firstCheck || !firstPhase || !firstBoundary || !firstCheckpoint) {
      throw new Error('Expected frozen pre-commit plan entries.')
    }
    expect(() => {
      (plan.preCommitChecks as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (plan.phases as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (plan.writeBoundaries as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (plan.rollbackCheckpoints as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstCheck as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(Reflect.set(firstPhase as unknown as Record<string, unknown>, 'status', 'committed')).toBe(false)
    expect(Reflect.set(firstBoundary as unknown as Record<string, unknown>, 'writeAllowed', true)).toBe(false)
    expect(Reflect.set(firstCheckpoint as unknown as Record<string, unknown>, 'status', 'satisfied')).toBe(false)
    expect(Reflect.set(plan.effects as unknown as Record<string, unknown>, 'lockfileWritten', true)).toBe(false)
    expect(JSON.stringify(plan)).toBe(frozenOutputSnapshot)
  })

  it('skips pre-commit planning when no third-party packages are selected', () => {
    const plan = buildThirdPartyDataPackTransactionPreCommitPlan({
      transactionPreflight: createTransactionPreflight({
        status: 'skipped',
        runtimeGateStatus: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
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
      })
    } as never)

    expect(plan.status).toBe('skipped')
    expect(plan.reason).toBe('no selected third-party data packs')
    expect(plan.preCommitChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(plan.phases.every(phase => phase.status === 'skipped')).toBe(true)
    expect(plan.writeBoundaries).toEqual([])
    expect(plan.rollbackCheckpoints).toEqual([])
    expectNoWriteEffects(plan)
    expectJsonGraphFrozen(plan)
  })

  it('blocks pre-commit planning when upstream reports are blocked', () => {
    const diagnostic = createDiagnostic('SCHEMA-VALIDATE-001', {
      stage: 'third-party.transaction-precommit.test',
      severity: 'error',
      packageId,
      recovery: 'remove-package'
    })
    const plan = buildThirdPartyDataPackTransactionPreCommitPlan({
      transactionPreflight: createTransactionPreflight({
        status: 'blocked',
        runtimeGateStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      }),
      runtimePublicationPreflight: createRuntimePublicationPreflight({
        status: 'blocked',
        mountInputStatus: 'blocked',
        sourceAdapterGateStatus: 'blocked',
        reason: 'discovery failed',
        diagnostics: [diagnostic],
        blockedPackageIds: [blockedPackageId],
        entryCount: 4242
      })
    } as never)

    expect(plan.status).toBe('blocked')
    expect(plan.reason).toBe('discovery failed')
    expect(plan.preCommitChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(plan.phases.every(phase => phase.status === 'blocked')).toBe(true)
    expect(plan.writeBoundaries).toEqual([])
    expect(plan.rollbackCheckpoints).toEqual([])
    expect(plan.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        stage: 'third-party.transaction-precommit.test'
      })
    ]))
    expect(Object.is(plan.diagnostics[0], diagnostic)).toBe(false)
    expectNoWriteEffects(plan)
    expectJsonGraphFrozen(plan)
  })

  it('blocks when transaction and publication identities diverge', () => {
    const cases = [
      {
        label: 'candidate hash',
        publication: createRuntimePublicationPreflight({
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('9')
          }
        }),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile hash',
        publication: createRuntimePublicationPreflight({
          lockfileHash: testHash('8')
        }),
        blockedCheckId: 'lockfile-hash-consistent'
      }
    ]

    for (const currentCase of cases) {
      const plan = buildThirdPartyDataPackTransactionPreCommitPlan({
        transactionPreflight: createTransactionPreflight(),
        runtimePublicationPreflight: currentCase.publication
      } as never)

      expect(plan.status).toBe('blocked')
      expect(plan.reason).toBe('transaction pre-commit plan inputs are inconsistent')
      expect(plan.preCommitChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(plan.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.transaction-precommit.checks',
          fieldPath: `/preCommitChecks/${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(plan)).toContain(currentCase.label === 'candidate hash'
        ? 'candidate-identity-consistent'
        : 'lockfile-hash-consistent')
      expect(plan.writeBoundaries).toEqual([])
      expectNoWriteEffects(plan)
      expectJsonGraphFrozen(plan)
    }
  })

  it('copies package summaries and diagnostics before exposing the plan', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/transaction-precommit-${label}-length`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.transaction-precommit.proxy-test',
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

    const plan = buildThirdPartyDataPackTransactionPreCommitPlan({
      transactionPreflight: createTransactionPreflight({
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      }),
      runtimePublicationPreflight: createRuntimePublicationPreflight()
    } as never)

    expect(plan.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(plan.selectedPackageIds).toEqual(['discovery_valid'])
    expect(plan.blockedPackageIds).toEqual(['blocked_pack'])
    expect(plan.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(plan.loadOrder).toEqual(['discovery_valid'])
    expect(plan.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.transaction-precommit.proxy-test',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(plan.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(plan.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(plan.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(plan.loadOrder, loadOrder)).toBe(false)
    expect(Object.is(plan.diagnostics[0], diagnostic)).toBe(false)
    expect(JSON.stringify(plan)).not.toContain('C:/Users')
    expect(JSON.stringify(plan)).not.toContain('LENOVO')
    expect(JSON.stringify(plan)).not.toContain('transaction-precommit-selected-package-ids-length')
    expectNoWriteEffects(plan)
    expectJsonGraphFrozen(plan)
  })
})
