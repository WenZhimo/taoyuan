import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorPreflight'
import {
  buildThirdPartyDataPackUiIpcResultNormalizationPreflight,
  type ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  type ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'

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

const atomicEffects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary = {
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

const verificationEffects: ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary = {
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
  postCommitVerificationExecutorCalled: false,
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
  diagnosticsWritten: false
}

const expectedEffects: ThirdPartyDataPackUiIpcResultNormalizationEffectSummary = {
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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

const createAtomicPreflight = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'atomic transaction commit executor preflight is inspect-only until real transaction-log, package, settings, lockfile, runtime publication and rollback adapters exist',
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
  atomicTransactionCommitExecutorPreflight: 'deferred',
  readOnly: true,
  atomicCommitExecutionAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimePublicationCommitAllowed: false,
  runtimeEnablementAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
  rollbackRecoveryAllowed: false,
  executorChecks: [],
  executorStages: [
    {
      id: 'atomic-commit-executor-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'Atomic commit executor preflight is inspect-only.'
    },
    {
      id: 'post-commit-verification-handoff',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification handoff remains deferred.'
    },
    {
      id: 'ui-ipc-result-normalization',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'UI/IPC result normalization remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI or IPC results must expose only redacted outcome summaries.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'deferred',
    transactionLogWriteProbeStatus: 'deferred',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  effects: atomicEffects,
  ...overrides
})

const createVerificationPreflight = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  reason: 'post-commit verification executor preflight is inspect-only until real committed state, live registry identity and UI/IPC result delivery exist',
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
  postCommitVerificationExecutorPreflight: 'deferred',
  readOnly: true,
  verificationExecutionAllowed: false,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  rollbackTriggerAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  executorChecks: [],
  executorStages: [
    {
      id: 'post-commit-executor-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['committed-transaction-log-source'],
      reason: 'Post-commit executor preflight is inspect-only.'
    },
    {
      id: 'ui-ipc-result-normalization',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'UI/IPC result normalization remains deferred.'
    },
    {
      id: 'rollback-recovery-trigger',
      status: 'deferred',
      requirementIds: ['rollback-recovery-trigger'],
      reason: 'Rollback trigger remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI or IPC results must expose only redacted outcome summaries.'
    }
  ],
  effects: verificationEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoNormalizationEffects = (
  result: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.successEnvelopeAllowed).toBe(false)
  expect(result.failureEnvelopeAllowed).toBe(false)
  expect(result.retryStateAllowed).toBe(false)
  expect(result.rollbackStateAllowed).toBe(false)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
}

describe('third-party UI/IPC result normalization preflight', () => {
  it('defers result normalization while exposing deterministic UI/IPC outcome requirements', () => {
    const result = buildThirdPartyDataPackUiIpcResultNormalizationPreflight({
      atomicTransactionCommitExecutorPreflight: createAtomicPreflight(),
      postCommitVerificationExecutorPreflight: createVerificationPreflight()
    })

    expect(result.status).toBe('deferred')
    expect(result.uiIpcResultNormalizationPreflight).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.blockedCandidateCount).toBe(0)
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.resultChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.resultStages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'ui-ipc-result-normalization-preflight-inspection', status: 'satisfied' },
      { id: 'success-envelope-normalization', status: 'deferred' },
      { id: 'failure-envelope-normalization', status: 'deferred' },
      { id: 'rollback-retry-state-normalization', status: 'deferred' },
      { id: 'path-free-diagnostics-finalization', status: 'deferred' },
      { id: 'ui-ipc-response-delivery', status: 'deferred' },
      { id: 'startup-gate-handoff', status: 'deferred' }
    ])
    expect(result.resultRequirements.map(requirement => requirement.id)).toEqual([
      'atomic-commit-outcome-source',
      'post-commit-verification-outcome-source',
      'path-free-ui-ipc-result-normalizer',
      'redacted-diagnostic-envelope',
      'rollback-recovery-state-source',
      'retry-safe-command-state-source',
      'explicit-ui-ipc-delivery-adapter',
      'no-startup-auto-success-guard'
    ])
    expect(result.resultOutcomeStates.map(outcome => ({ id: outcome.id, status: outcome.status }))).toEqual([
      { id: 'success', status: 'deferred' },
      { id: 'failure', status: 'deferred' },
      { id: 'retry', status: 'deferred' },
      { id: 'rollback', status: 'deferred' }
    ])
    expect('atomicTransactionCommitExecutorPreflight' in result).toBe(false)
    expect('postCommitVerificationExecutorPreflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoNormalizationEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips when upstream reports have no selected package state', () => {
    const result = buildThirdPartyDataPackUiIpcResultNormalizationPreflight({
      atomicTransactionCommitExecutorPreflight: createAtomicPreflight({
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
      postCommitVerificationExecutorPreflight: createVerificationPreflight()
    })

    expect(result.status).toBe('skipped')
    expect(result.reason).toBe('no selected third-party data packs')
    expect(result.resultChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(result.resultRequirements).toEqual([])
    expect(result.resultOutcomeStates.every(outcome => outcome.status === 'skipped')).toBe(true)
    expectNoNormalizationEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks upstream failures while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.ui-ipc-result-normalization-preflight.path-strip-test',
      severity: 'error',
      packageId,
      file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/transaction.json',
      fieldPath: '/uiResult/C:/Users/LENOVO',
      details: {
        hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack',
        reason: 'contains private path'
      },
      recovery: 'retry'
    })

    const result = buildThirdPartyDataPackUiIpcResultNormalizationPreflight({
      atomicTransactionCommitExecutorPreflight: createAtomicPreflight({
        status: 'blocked',
        reason: 'atomic preflight blocked before result normalization',
        diagnostics: [diagnostic] as never
      }),
      postCommitVerificationExecutorPreflight: createVerificationPreflight({
        diagnostics: [diagnostic] as never
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('atomic preflight blocked before result normalization')
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.ui-ipc-result-normalization-preflight.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoNormalizationEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks command, target, package, identity, stage, requirement and effect drift before result delivery', () => {
    const cases = [
      {
        label: 'not install',
        atomic: createAtomicPreflight({ requestedCommandId: 'enable' }),
        verification: createVerificationPreflight(),
        blockedCheckId: 'install-command-consistent'
      },
      {
        label: 'target drift',
        atomic: createAtomicPreflight(),
        verification: createVerificationPreflight({ targetPackageId: blockedPackageId }),
        blockedCheckId: 'target-package-consistent'
      },
      {
        label: 'package summary drift',
        atomic: createAtomicPreflight(),
        verification: createVerificationPreflight({ packageCount: 2 }),
        blockedCheckId: 'package-summary-consistent'
      },
      {
        label: 'candidate drift',
        atomic: createAtomicPreflight(),
        verification: createVerificationPreflight({
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          }
        }),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile drift',
        atomic: createAtomicPreflight(),
        verification: createVerificationPreflight({ lockfileHash: testHash('f') }),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'missing normalizer requirement',
        atomic: createAtomicPreflight({ executorRequirements: [] }),
        verification: createVerificationPreflight(),
        blockedCheckId: 'result-normalizer-required'
      },
      {
        label: 'missing deferred stage',
        atomic: createAtomicPreflight({ executorStages: [] }),
        verification: createVerificationPreflight(),
        blockedCheckId: 'result-normalization-stages-deferred'
      },
      {
        label: 'effect drift',
        atomic: createAtomicPreflight({
          effects: {
            ...atomicEffects,
            uiIpcResponseDelivered: true
          } as never
        }),
        verification: createVerificationPreflight(),
        blockedCheckId: 'no-result-normalization-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackUiIpcResultNormalizationPreflight({
        atomicTransactionCommitExecutorPreflight: currentCase.atomic,
        postCommitVerificationExecutorPreflight: currentCase.verification
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('UI/IPC result normalization preflight inputs are inconsistent')
      expect(result.resultChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.ui-ipc-result-normalization-preflight.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(result.resultRequirements).toEqual([])
      expect(result.resultOutcomeStates.every(outcome => outcome.status === 'blocked')).toBe(true)
      expectNoNormalizationEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/result-normalization-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/result-normalization-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.ui-ipc-result-normalization-preflight.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['C:/Users/LENOVO/blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackUiIpcResultNormalizationPreflight({
      atomicTransactionCommitExecutorPreflight: createAtomicPreflight({
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder,
        diagnostics: diagnostics as never
      }),
      postCommitVerificationExecutorPreflight: createVerificationPreflight({
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
    expect(result.blockedCandidateCount).toBe(1)
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.ui-ipc-result-normalization-preflight.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.ui-ipc-result-normalization-preflight.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('result-normalization-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoNormalizationEffects(result)
    expectJsonGraphFrozen(result)
  })
})
