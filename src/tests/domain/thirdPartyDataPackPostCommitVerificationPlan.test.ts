import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import {
  buildThirdPartyDataPackPostCommitVerificationPlan,
  type ThirdPartyDataPackPostCommitVerificationPlanEffectSummary,
  type ThirdPartyDataPackPostCommitVerificationPlanResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationPlan'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
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

const expectedEffects: ThirdPartyDataPackPostCommitVerificationPlanEffectSummary = {
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
  commandDispatched: false,
  transactionCommitted: false,
  postCommitVerificationExecuted: false,
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
  stages: [],
  requirements: [],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'deferred',
    transactionLogWriteProbeStatus: 'deferred',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  effects: installEffects,
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
      id: 'post-commit-verification',
      status: 'deferred',
      adapterIds: ['post-commit-verification-adapter'],
      writeBoundaryIds: ['player-saves', 'official-cache'],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'post-commit verification remains deferred'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      adapterIds: ['rollback-recovery-orchestrator'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'rollback handoff remains deferred'
    }
  ],
  requiredCommitAdapters: [
    {
      id: 'post-commit-verification-adapter',
      status: 'required',
      reason: 'Post-commit verification must prove installed identity consistency.'
    },
    {
      id: 'rollback-recovery-orchestrator',
      status: 'required',
      reason: 'Rollback recovery must remain available after failed verification.'
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

const expectNoPostCommitEffects = (
  result: ThirdPartyDataPackPostCommitVerificationPlanResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.commitAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
}

describe('third-party post-commit verification plan', () => {
  it('defers post-commit verification while exposing deterministic verifier requirements', () => {
    const result = buildThirdPartyDataPackPostCommitVerificationPlan({
      installTransactionDispatchPlan: createInstallDispatchPlan(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter()
    })

    expect(result.status).toBe('deferred')
    expect(result.postCommitVerificationPlan).toBe('deferred')
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
    expect(result.verificationChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.verificationStages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'post-commit-verification-inspection', status: 'satisfied' },
      { id: 'transaction-log-confirmation', status: 'deferred' },
      { id: 'package-state-verification', status: 'deferred' },
      { id: 'settings-lockfile-verification', status: 'deferred' },
      { id: 'live-registry-identity-verification', status: 'deferred' },
      { id: 'save-cache-isolation-verification', status: 'deferred' },
      { id: 'ui-ipc-result-verification', status: 'deferred' },
      { id: 'rollback-handoff-verification', status: 'deferred' }
    ])
    expect(result.requiredVerifiers.map(verifier => verifier.id)).toEqual([
      'transaction-log-entry-verifier',
      'package-state-verifier',
      'settings-lockfile-identity-verifier',
      'live-registry-identity-verifier',
      'save-cache-isolation-verifier',
      'path-free-result-verifier',
      'rollback-handoff-verifier'
    ])
    expect('installTransactionDispatchPlan' in result).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoPostCommitEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips when install dispatch or runtime commit planning has no selected packages', () => {
    const installSkipped = buildThirdPartyDataPackPostCommitVerificationPlan({
      installTransactionDispatchPlan: createInstallDispatchPlan({
        status: 'skipped',
        reason: 'no transaction command was requested',
        requestedCommandId: undefined,
        targetPackageId: undefined,
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0
      }),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter()
    })
    const commitSkipped = buildThirdPartyDataPackPostCommitVerificationPlan({
      installTransactionDispatchPlan: createInstallDispatchPlan(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
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

    expect(installSkipped.status).toBe('skipped')
    expect(installSkipped.reason).toBe('no transaction command was requested')
    expect(installSkipped.verificationChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(installSkipped.requiredVerifiers).toEqual([])
    expect(commitSkipped.status).toBe('skipped')
    expect(commitSkipped.reason).toBe('no selected third-party data packs')
    expect(commitSkipped.requiredVerifiers).toEqual([])
    expectNoPostCommitEffects(installSkipped)
    expectNoPostCommitEffects(commitSkipped)
    expectJsonGraphFrozen(installSkipped)
    expectJsonGraphFrozen(commitSkipped)
  })

  it('blocks upstream failures while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.post-commit-verification-plan.path-strip-test',
      severity: 'error',
      packageId,
      file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/manifest.json',
      fieldPath: '/packages/0/source/C:/Users/LENOVO',
      details: {
        hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack',
        reason: 'contains private path'
      },
      recovery: 'retry'
    })

    const result = buildThirdPartyDataPackPostCommitVerificationPlan({
      installTransactionDispatchPlan: createInstallDispatchPlan({
        status: 'blocked',
        reason: 'install dispatch planning blocked',
        diagnostics: [diagnostic] as never
      }),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
        diagnostics: [diagnostic]
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('install dispatch planning blocked')
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.post-commit-verification-plan.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoPostCommitEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks identity, summary, verifier and effect drift before verification', () => {
    const cases = [
      {
        label: 'target missing',
        installPlan: createInstallDispatchPlan({ targetPackageId: blockedPackageId }),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'install-target-present'
      },
      {
        label: 'missing candidate',
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimePublicationCommitAdapter({ candidateIdentity: undefined }),
        blockedCheckId: 'candidate-identity-present'
      },
      {
        label: 'missing lockfile',
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimePublicationCommitAdapter({ lockfileHash: undefined }),
        blockedCheckId: 'lockfile-hash-present'
      },
      {
        label: 'package summary drift',
        installPlan: createInstallDispatchPlan({ packageCount: 2 }),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'package-summary-consistent'
      },
      {
        label: 'missing post-commit adapter',
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimePublicationCommitAdapter({ requiredCommitAdapters: [] }),
        blockedCheckId: 'post-commit-adapter-required'
      },
      {
        label: 'missing post-commit stage',
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimePublicationCommitAdapter({ commitStages: [] }),
        blockedCheckId: 'post-commit-stage-deferred'
      },
      {
        label: 'effect drift',
        installPlan: createInstallDispatchPlan(),
        commitAdapter: createRuntimePublicationCommitAdapter({
          effects: {
            ...commitEffects,
            cacheWritten: true
          } as never
        }),
        blockedCheckId: 'no-post-commit-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackPostCommitVerificationPlan({
        installTransactionDispatchPlan: currentCase.installPlan,
        runtimePublicationCommitAdapter: currentCase.commitAdapter
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('post-commit verification plan inputs are inconsistent')
      expect(result.verificationChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.post-commit-verification-plan.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(result.requiredVerifiers).toEqual([])
      expectNoPostCommitEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/post-commit-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/post-commit-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.post-commit-verification-plan.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackPostCommitVerificationPlan({
      installTransactionDispatchPlan: createInstallDispatchPlan({
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder,
        diagnostics: diagnostics as never
      }),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
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
    expect(result.blockedCandidatePaths).toEqual(['blocked-pack', 'blocked-pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.post-commit-verification-plan.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.post-commit-verification-plan.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('post-commit-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoPostCommitEffects(result)
    expectJsonGraphFrozen(result)
  })
})
