import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection,
  type ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import type { ThirdPartyDataPackRuntimePublicationPreflightResult } from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPhaseSummary,
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

const liveRegistryBoundary: ThirdPartyDataPackTransactionWriteBoundary = {
  id: 'live-registry',
  status: 'deferred',
  writeAllowed: false,
  reason: 'The live registry reference cannot be swapped until package, settings and lockfile writes are verified.'
}

const liveRegistryPhase: ThirdPartyDataPackTransactionPreCommitPhaseSummary = {
  id: 'live-registry-swap',
  status: 'deferred',
  writeBoundaryIds: ['live-registry'],
  rollbackCheckpointIds: ['before-live-registry-swap'],
  reason: 'Swap the live registry only after package and persistent-state writes are verified.'
}

const liveRegistryRollbackCheckpoint: ThirdPartyDataPackTransactionRollbackCheckpoint = {
  id: 'before-live-registry-swap',
  status: 'required',
  reason: 'The live registry swap must have the previous registry identity available for rollback diagnostics.'
}

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
  phases: [
    {
      id: 'pre-commit-inspection',
      status: 'satisfied',
      writeBoundaryIds: [],
      rollbackCheckpointIds: [],
      reason: 'Upstream no-write reports are consistent.'
    },
    liveRegistryPhase
  ],
  writeBoundaries: [liveRegistryBoundary],
  rollbackCheckpoints: [liveRegistryRollbackCheckpoint],
  effects: publicationEffects,
  ...overrides
})

const expectNoWriteEffects = (result: ThirdPartyDataPackLiveRegistrySwapProtectionResult): void => {
  expect(result.effects).toEqual(swapProtectionEffects)
  expect(Object.isFrozen(result.effects)).toBe(true)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectDeferredProtection = (result: ThirdPartyDataPackLiveRegistrySwapProtectionResult): void => {
  expect(result.status).toBe('deferred')
  expect(result.runtimePublicationPreflightStatus).toBe('deferred')
  expect(result.transactionPreCommitPlanStatus).toBe('deferred')
  expect(result.reason).toBe(
    'live registry swap protection is inspect-only until single-assignment swap, previous registry retention and rollback diagnostics exist'
  )
  expect(result.liveRegistrySwap).toBe('deferred')
  expect(result.swapAllowed).toBe(false)
  expect(result.liveRegistryMutable).toBe(false)
  expect(result.selectedPackageIds).toEqual(['discovery_valid'])
  expect(result.loadOrder).toEqual(['discovery_valid'])
  expect(result.registryCount).toBe(54)
  expect(result.entryCount).toBe(4244)
  expect(result.packageCount).toBe(1)
  expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
  expect(result.lockfileHash).toBe(lockfileHash)
  expect(result.protectionChecks.map(check => ({
    id: check.id,
    status: check.status
  }))).toEqual([
    { id: 'runtime-publication-preflight-deferred', status: 'satisfied' },
    { id: 'transaction-precommit-plan-deferred', status: 'satisfied' },
    { id: 'candidate-identity-consistent', status: 'satisfied' },
    { id: 'lockfile-hash-consistent', status: 'satisfied' },
    { id: 'live-registry-boundary-deferred', status: 'satisfied' },
    { id: 'live-swap-rollback-checkpoint-required', status: 'satisfied' },
    { id: 'no-live-registry-effects-intact', status: 'satisfied' }
  ])
  expect(result.requiredProtections.map(requirement => ({
    id: requirement.id,
    status: requirement.status
  }))).toEqual([
    { id: 'single-assignment-live-registry-reference', status: 'required' },
    { id: 'previous-registry-identity-retention', status: 'required' },
    { id: 'candidate-artifact-visibility-barrier', status: 'required' },
    { id: 'post-swap-verification', status: 'required' },
    { id: 'rollback-restore-diagnostics', status: 'required' }
  ])
  expect(result.protectionChecks.every(check => check.reason.length > 0)).toBe(true)
  expect(result.requiredProtections.every(requirement => requirement.reason.length > 0)).toBe(true)
}

describe('third-party data pack live registry swap protection', () => {
  it('defers live registry swaps while exposing deterministic protection checks', () => {
    const protection = buildThirdPartyDataPackLiveRegistrySwapProtection({
      runtimePublicationPreflight: createRuntimePublicationPreflight(),
      transactionPreCommitPlan: createTransactionPreCommitPlan()
    } as never)

    expectDeferredProtection(protection)
    expect('runtimePublicationPreflight' in protection).toBe(false)
    expect('transactionPreCommitPlan' in protection).toBe(false)
    expect('candidateRegistrySet' in protection).toBe(false)
    expect('candidateSnapshot' in protection).toBe(false)
    expect('lockfileDraft' in protection).toBe(false)
    expectNoWriteEffects(protection)
    expectJsonGraphFrozen(protection)

    const frozenOutputSnapshot = JSON.stringify(protection)
    const firstCheck = protection.protectionChecks[0]
    const firstRequirement = protection.requiredProtections[0]
    if (!firstCheck || !firstRequirement) throw new Error('Expected frozen live swap protection entries.')
    expect(() => {
      (protection.protectionChecks as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (protection.requiredProtections as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(protection as unknown as Record<string, unknown>, 'swapAllowed', true)).toBe(false)
    expect(Reflect.set(firstCheck as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(Reflect.set(firstRequirement as unknown as Record<string, unknown>, 'status', 'satisfied')).toBe(false)
    expect(Reflect.set(protection.effects as unknown as Record<string, unknown>, 'liveRegistrySwapped', true)).toBe(false)
    expect(JSON.stringify(protection)).toBe(frozenOutputSnapshot)
  })

  it('skips live registry swap protection when no third-party packages are selected', () => {
    const protection = buildThirdPartyDataPackLiveRegistrySwapProtection({
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
      })
    } as never)

    expect(protection.status).toBe('skipped')
    expect(protection.reason).toBe('no selected third-party data packs')
    expect(protection.protectionChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(protection.requiredProtections).toEqual([])
    expectNoWriteEffects(protection)
    expectJsonGraphFrozen(protection)
  })

  it('blocks live registry swap protection when upstream reports are blocked', () => {
    const diagnostic = createDiagnostic('SCHEMA-VALIDATE-001', {
      stage: 'third-party.live-registry-swap-protection.test',
      severity: 'error',
      packageId,
      recovery: 'remove-package'
    })
    const protection = buildThirdPartyDataPackLiveRegistrySwapProtection({
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
      })
    } as never)

    expect(protection.status).toBe('blocked')
    expect(protection.reason).toBe('discovery failed')
    expect(protection.protectionChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(protection.requiredProtections).toEqual([])
    expect(protection.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        stage: 'third-party.live-registry-swap-protection.test'
      })
    ]))
    expect(Object.is(protection.diagnostics[0], diagnostic)).toBe(false)
    expectNoWriteEffects(protection)
    expectJsonGraphFrozen(protection)
  })

  it('blocks when live swap inputs diverge or lose their no-write boundary', () => {
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
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile hash',
        runtime: createRuntimePublicationPreflight({
          lockfileHash: testHash('8')
        }),
        plan: createTransactionPreCommitPlan(),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'live registry boundary',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan({
          writeBoundaries: [],
          phases: [
            {
              ...liveRegistryPhase,
              writeBoundaryIds: []
            }
          ]
        }),
        blockedCheckId: 'live-registry-boundary-deferred'
      },
      {
        label: 'rollback checkpoint',
        runtime: createRuntimePublicationPreflight(),
        plan: createTransactionPreCommitPlan({
          rollbackCheckpoints: [],
          phases: [
            {
              ...liveRegistryPhase,
              rollbackCheckpointIds: []
            }
          ]
        }),
        blockedCheckId: 'live-swap-rollback-checkpoint-required'
      },
      {
        label: 'live registry effect',
        runtime: createRuntimePublicationPreflight({
          effects: {
            ...publicationEffects,
            liveRegistryMutated: true
          } as never
        }),
        plan: createTransactionPreCommitPlan(),
        blockedCheckId: 'no-live-registry-effects-intact'
      }
    ]

    for (const currentCase of cases) {
      const protection = buildThirdPartyDataPackLiveRegistrySwapProtection({
        runtimePublicationPreflight: currentCase.runtime,
        transactionPreCommitPlan: currentCase.plan
      } as never)

      expect(protection.status).toBe('blocked')
      expect(protection.reason).toBe('live registry swap protection inputs are inconsistent')
      expect(protection.protectionChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(protection.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.live-registry-swap-protection.checks',
          fieldPath: `/protectionChecks/${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(protection)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(protection)).toContain(currentCase.label === 'candidate hash'
        ? 'candidate-identity-consistent'
        : currentCase.blockedCheckId)
      expect(protection.requiredProtections).toEqual([])
      expectNoWriteEffects(protection)
      expectJsonGraphFrozen(protection)
    }
  })

  it('copies package summaries and diagnostics before exposing the protection report', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/live-registry-swap-${label}-length`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.live-registry-swap-protection.proxy-test',
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

    const protection = buildThirdPartyDataPackLiveRegistrySwapProtection({
      runtimePublicationPreflight: createRuntimePublicationPreflight(),
      transactionPreCommitPlan: createTransactionPreCommitPlan({
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      })
    } as never)

    expect(protection.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(protection.selectedPackageIds).toEqual(['discovery_valid'])
    expect(protection.blockedPackageIds).toEqual(['blocked_pack'])
    expect(protection.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(protection.loadOrder).toEqual(['discovery_valid'])
    expect(protection.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.live-registry-swap-protection.proxy-test',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(protection.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(protection.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(protection.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(protection.loadOrder, loadOrder)).toBe(false)
    expect(Object.is(protection.diagnostics[0], diagnostic)).toBe(false)
    expect(JSON.stringify(protection)).not.toContain('C:/Users')
    expect(JSON.stringify(protection)).not.toContain('LENOVO')
    expect(JSON.stringify(protection)).not.toContain('live-registry-swap-selected-package-ids-length')
    expectNoWriteEffects(protection)
    expectJsonGraphFrozen(protection)
  })
})
