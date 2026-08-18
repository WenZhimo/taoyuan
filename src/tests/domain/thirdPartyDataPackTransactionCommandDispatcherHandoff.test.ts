import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackPostCommitVerificationPlanResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationPlan'
import {
  buildThirdPartyDataPackTransactionCommandDispatcherHandoff,
  type ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary,
  type ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherHandoff'
import type {
  ThirdPartyDataPackTransactionCommandPreflightResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandPreflight'

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

const commandEffects = {
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

const verificationEffects = {
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
} as const

const expectedEffects: ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary = {
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
}

const createCommandPreflight = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandPreflightResult> = {}
): ThirdPartyDataPackTransactionCommandPreflightResult => ({
  status: 'deferred',
  readModelStatus: 'ready',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'transaction command preflight is inspect-only until command dispatcher, atomic commit adapter and rollback handoff are implemented',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  transactionCommandPreflight: 'deferred',
  readOnly: true,
  commandDispatchAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiMountAllowed: false,
  ipcAllowed: false,
  preflightChecks: [],
  stages: [],
  requirements: [],
  effects: commandEffects,
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

const createPostCommitVerificationPlan = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationPlanResult> = {}
): ThirdPartyDataPackPostCommitVerificationPlanResult => ({
  status: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'post-commit verification plan is inspect-only until persistent install writes, runtime publication and UI/IPC result delivery exist',
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
  postCommitVerificationPlan: 'deferred',
  readOnly: true,
  postCommitVerificationAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  verificationChecks: [],
  verificationStages: [
    {
      id: 'post-commit-verification-inspection',
      status: 'satisfied',
      requirementIds: ['transaction-log-entry-verifier'],
      reason: 'Install dispatch and runtime commit plans are consistent enough to inspect post-commit verification requirements.'
    },
    {
      id: 'transaction-log-confirmation',
      status: 'deferred',
      requirementIds: ['transaction-log-entry-verifier'],
      reason: 'A committed transaction log entry must be verified before persistent install state is trusted.'
    },
    {
      id: 'package-state-verification',
      status: 'deferred',
      requirementIds: ['package-state-verifier'],
      reason: 'Package files must be verified against the selected candidate before live publication can be treated as complete.'
    },
    {
      id: 'settings-lockfile-verification',
      status: 'deferred',
      requirementIds: ['settings-lockfile-identity-verifier'],
      reason: 'Settings and mod-lock must be verified as one persistent identity.'
    },
    {
      id: 'live-registry-identity-verification',
      status: 'deferred',
      requirementIds: ['live-registry-identity-verifier'],
      reason: 'The live registry identity must not be accepted until it matches persistent install state.'
    },
    {
      id: 'save-cache-isolation-verification',
      status: 'deferred',
      requirementIds: ['save-cache-isolation-verifier'],
      reason: 'Player save and official-cache isolation must be verified before the transaction result can be surfaced.'
    },
    {
      id: 'ui-ipc-result-verification',
      status: 'deferred',
      requirementIds: ['path-free-result-verifier'],
      reason: 'Future UI and IPC responses remain deferred and must expose only redacted verification outcomes.'
    },
    {
      id: 'rollback-handoff-verification',
      status: 'deferred',
      requirementIds: ['rollback-handoff-verifier'],
      reason: 'Failed verification must hand off to rollback recovery before startup or save paths continue.'
    }
  ],
  requiredVerifiers: [
    {
      id: 'transaction-log-entry-verifier',
      status: 'required',
      reason: 'A future verifier must prove the committed transaction log entry matches the selected install command and candidate identity.'
    },
    {
      id: 'package-state-verifier',
      status: 'required',
      reason: 'Package files must be checked against the staged candidate before settings, lockfile or live registry state is trusted.'
    },
    {
      id: 'settings-lockfile-identity-verifier',
      status: 'required',
      reason: 'Installation settings and mod-lock must describe the same package set, load order, candidate hash and lockfile hash.'
    },
    {
      id: 'live-registry-identity-verifier',
      status: 'required',
      reason: 'The live registry identity must match verified persistent package and lockfile state before GameApp can continue.'
    },
    {
      id: 'save-cache-isolation-verifier',
      status: 'required',
      reason: 'Post-commit verification must prove player saves and official caches were not mutated by the install transaction.'
    },
    {
      id: 'path-free-result-verifier',
      status: 'required',
      reason: 'Future UI or IPC success/failure results must be redacted and detached from host paths or candidate internals.'
    },
    {
      id: 'rollback-handoff-verifier',
      status: 'required',
      reason: 'Any failed verification must hand off to rollback recovery with enough redacted evidence to resume safely.'
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

const expectNoDispatcherEffects = (
  result: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.dispatcherHandoffAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.commitAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
}

describe('third-party transaction command dispatcher handoff', () => {
  it('defers dispatcher handoff while exposing deterministic dispatcher requirements', () => {
    const result = buildThirdPartyDataPackTransactionCommandDispatcherHandoff({
      transactionCommandPreflight: createCommandPreflight(),
      installTransactionDispatchPlan: createInstallDispatchPlan(),
      postCommitVerificationPlan: createPostCommitVerificationPlan()
    })

    expect(result.status).toBe('deferred')
    expect(result.transactionCommandDispatcherHandoff).toBe('deferred')
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
    expect(result.handoffChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.handoffStages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'dispatcher-handoff-inspection', status: 'satisfied' },
      { id: 'command-envelope-normalization', status: 'deferred' },
      { id: 'transaction-command-dispatch', status: 'deferred' },
      { id: 'install-transaction-commit', status: 'deferred' },
      { id: 'post-commit-verification-execution', status: 'deferred' },
      { id: 'ui-ipc-result-handoff', status: 'deferred' },
      { id: 'rollback-recovery-handoff', status: 'deferred' }
    ])
    expect(result.dispatcherRequirements.map(requirement => requirement.id)).toEqual([
      'confirmed-command-envelope',
      'transaction-command-dispatcher',
      'install-dispatch-plan-consumer',
      'atomic-transaction-commit-executor',
      'post-commit-verification-executor',
      'path-free-ui-ipc-result',
      'rollback-recovery-orchestrator'
    ])
    expect('transactionCommandPreflight' in result).toBe(false)
    expect('installTransactionDispatchPlan' in result).toBe(false)
    expect('postCommitVerificationPlan' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoDispatcherEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips when any upstream plan has no selected package state', () => {
    const commandSkipped = buildThirdPartyDataPackTransactionCommandDispatcherHandoff({
      transactionCommandPreflight: createCommandPreflight({
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
      installTransactionDispatchPlan: createInstallDispatchPlan(),
      postCommitVerificationPlan: createPostCommitVerificationPlan()
    })
    const verificationSkipped = buildThirdPartyDataPackTransactionCommandDispatcherHandoff({
      transactionCommandPreflight: createCommandPreflight(),
      installTransactionDispatchPlan: createInstallDispatchPlan(),
      postCommitVerificationPlan: createPostCommitVerificationPlan({
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

    expect(commandSkipped.status).toBe('skipped')
    expect(commandSkipped.reason).toBe('no transaction command was requested')
    expect(commandSkipped.handoffChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(commandSkipped.dispatcherRequirements).toEqual([])
    expect(verificationSkipped.status).toBe('skipped')
    expect(verificationSkipped.reason).toBe('no selected third-party data packs')
    expect(verificationSkipped.dispatcherRequirements).toEqual([])
    expectNoDispatcherEffects(commandSkipped)
    expectNoDispatcherEffects(verificationSkipped)
    expectJsonGraphFrozen(commandSkipped)
    expectJsonGraphFrozen(verificationSkipped)
  })

  it('blocks upstream failures while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.transaction-command-dispatcher-handoff.path-strip-test',
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

    const result = buildThirdPartyDataPackTransactionCommandDispatcherHandoff({
      transactionCommandPreflight: createCommandPreflight({
        status: 'blocked',
        reason: 'command preflight blocked before dispatcher handoff',
        diagnostics: [diagnostic] as never
      }),
      installTransactionDispatchPlan: createInstallDispatchPlan({
        diagnostics: [diagnostic] as never
      }),
      postCommitVerificationPlan: createPostCommitVerificationPlan({
        diagnostics: [diagnostic] as never
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('command preflight blocked before dispatcher handoff')
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.transaction-command-dispatcher-handoff.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoDispatcherEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks command, target, identity, verifier and effect drift before dispatcher handoff', () => {
    const cases = [
      {
        label: 'not install',
        command: createCommandPreflight({ requestedCommandId: 'enable' }),
        installPlan: createInstallDispatchPlan(),
        verificationPlan: createPostCommitVerificationPlan(),
        blockedCheckId: 'install-command-consistent'
      },
      {
        label: 'target drift',
        command: createCommandPreflight(),
        installPlan: createInstallDispatchPlan({ targetPackageId: blockedPackageId }),
        verificationPlan: createPostCommitVerificationPlan(),
        blockedCheckId: 'target-package-consistent'
      },
      {
        label: 'package summary drift',
        command: createCommandPreflight(),
        installPlan: createInstallDispatchPlan({ packageCount: 2 }),
        verificationPlan: createPostCommitVerificationPlan(),
        blockedCheckId: 'package-summary-consistent'
      },
      {
        label: 'missing candidate',
        command: createCommandPreflight(),
        installPlan: createInstallDispatchPlan(),
        verificationPlan: createPostCommitVerificationPlan({ candidateIdentity: undefined }),
        blockedCheckId: 'candidate-identity-present'
      },
      {
        label: 'missing lockfile',
        command: createCommandPreflight(),
        installPlan: createInstallDispatchPlan(),
        verificationPlan: createPostCommitVerificationPlan({ lockfileHash: undefined }),
        blockedCheckId: 'lockfile-hash-present'
      },
      {
        label: 'missing verifier requirement',
        command: createCommandPreflight(),
        installPlan: createInstallDispatchPlan(),
        verificationPlan: createPostCommitVerificationPlan({ requiredVerifiers: [] }),
        blockedCheckId: 'post-commit-verifiers-deferred'
      },
      {
        label: 'effect drift',
        command: createCommandPreflight(),
        installPlan: createInstallDispatchPlan(),
        verificationPlan: createPostCommitVerificationPlan({
          effects: {
            ...verificationEffects,
            cacheWritten: true
          } as never
        }),
        blockedCheckId: 'no-dispatcher-handoff-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackTransactionCommandDispatcherHandoff({
        transactionCommandPreflight: currentCase.command,
        installTransactionDispatchPlan: currentCase.installPlan,
        postCommitVerificationPlan: currentCase.verificationPlan
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('transaction command dispatcher handoff inputs are inconsistent')
      expect(result.handoffChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.transaction-command-dispatcher-handoff.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(result.dispatcherRequirements).toEqual([])
      expectNoDispatcherEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/dispatcher-handoff-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/dispatcher-handoff-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.transaction-command-dispatcher-handoff.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackTransactionCommandDispatcherHandoff({
      transactionCommandPreflight: createCommandPreflight({
        selectedPackageIds,
        blockedPackageIds,
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
      postCommitVerificationPlan: createPostCommitVerificationPlan({
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
        stage: 'third-party.transaction-command-dispatcher-handoff.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.transaction-command-dispatcher-handoff.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.transaction-command-dispatcher-handoff.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('dispatcher-handoff-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoDispatcherEffects(result)
    expectJsonGraphFrozen(result)
  })
})
