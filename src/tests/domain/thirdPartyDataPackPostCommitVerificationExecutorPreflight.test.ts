import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackPostCommitVerificationExecutorPreflight,
  type ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary,
  type ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorPreflight'
import type {
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

const expectedEffects: ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary = {
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoExecutorEffects = (
  result: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.verificationExecutionAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.transactionLogReadAllowed).toBe(false)
  expect(result.packageStateReadAllowed).toBe(false)
  expect(result.settingsReadAllowed).toBe(false)
  expect(result.lockfileReadAllowed).toBe(false)
  expect(result.liveRegistryReadAllowed).toBe(false)
  expect(result.saveCacheIsolationCheckAllowed).toBe(false)
  expect(result.rollbackTriggerAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
}

describe('third-party post-commit verification executor preflight', () => {
  it('defers executor preflight while exposing deterministic verifier inputs', () => {
    const result = buildThirdPartyDataPackPostCommitVerificationExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff()
    })

    expect(result.status).toBe('deferred')
    expect(result.postCommitVerificationExecutorPreflight).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.executorChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.executorStages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'post-commit-executor-preflight-inspection', status: 'satisfied' },
      { id: 'transaction-log-entry-read', status: 'deferred' },
      { id: 'package-state-read', status: 'deferred' },
      { id: 'settings-lockfile-identity-read', status: 'deferred' },
      { id: 'live-registry-identity-read', status: 'deferred' },
      { id: 'save-cache-isolation-check', status: 'deferred' },
      { id: 'ui-ipc-result-normalization', status: 'deferred' },
      { id: 'rollback-recovery-trigger', status: 'deferred' }
    ])
    expect(result.executorRequirements.map(requirement => requirement.id)).toEqual([
      'committed-transaction-log-source',
      'package-state-source',
      'settings-lockfile-state-source',
      'live-registry-identity-source',
      'save-cache-isolation-source',
      'path-free-ui-ipc-result-normalizer',
      'rollback-recovery-trigger'
    ])
    expect('transactionCommandDispatcherHandoff' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoExecutorEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips when dispatcher handoff has no selected package state', () => {
    const result = buildThirdPartyDataPackPostCommitVerificationExecutorPreflight({
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
      })
    })

    expect(result.status).toBe('skipped')
    expect(result.reason).toBe('no selected third-party data packs')
    expect(result.executorChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(result.executorRequirements).toEqual([])
    expectNoExecutorEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks upstream handoff failures while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.post-commit-verification-executor-preflight.path-strip-test',
      severity: 'error',
      packageId,
      file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/transaction.json',
      fieldPath: '/packageState/C:/Users/LENOVO',
      details: {
        hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack',
        reason: 'contains private path'
      },
      recovery: 'retry'
    })

    const result = buildThirdPartyDataPackPostCommitVerificationExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff({
        status: 'blocked',
        reason: 'dispatcher handoff blocked before executor preflight',
        diagnostics: [diagnostic] as never
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('dispatcher handoff blocked before executor preflight')
    expect(result.diagnostics).toEqual([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.post-commit-verification-executor-preflight.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoExecutorEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks target, identity, requirement, stage and effect drift before execution', () => {
    const cases = [
      {
        label: 'no install target',
        handoff: createDispatcherHandoff({ requestedCommandId: 'enable' }),
        blockedCheckId: 'install-target-present'
      },
      {
        label: 'missing candidate',
        handoff: createDispatcherHandoff({ candidateIdentity: undefined }),
        blockedCheckId: 'candidate-identity-present'
      },
      {
        label: 'missing lockfile',
        handoff: createDispatcherHandoff({ lockfileHash: undefined }),
        blockedCheckId: 'lockfile-hash-present'
      },
      {
        label: 'missing executor requirement',
        handoff: createDispatcherHandoff({ dispatcherRequirements: [] }),
        blockedCheckId: 'post-commit-executor-required'
      },
      {
        label: 'missing execution stage',
        handoff: createDispatcherHandoff({ handoffStages: [] }),
        blockedCheckId: 'post-commit-execution-deferred'
      },
      {
        label: 'effect drift',
        handoff: createDispatcherHandoff({
          effects: {
            ...handoffEffects,
            postCommitVerificationExecuted: true
          } as never
        }),
        blockedCheckId: 'no-executor-preflight-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackPostCommitVerificationExecutorPreflight({
        transactionCommandDispatcherHandoff: currentCase.handoff
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('post-commit verification executor preflight inputs are inconsistent')
      expect(result.executorChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.post-commit-verification-executor-preflight.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(result.executorRequirements).toEqual([])
      expectNoExecutorEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/executor-preflight-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/executor-preflight-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.post-commit-verification-executor-preflight.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackPostCommitVerificationExecutorPreflight({
      transactionCommandDispatcherHandoff: createDispatcherHandoff({
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
    expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.post-commit-verification-executor-preflight.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('executor-preflight-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoExecutorEffects(result)
    expectJsonGraphFrozen(result)
  })
})
