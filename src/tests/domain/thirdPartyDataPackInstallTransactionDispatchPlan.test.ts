import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackInstallTransactionDispatchPlan,
  type ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary,
  type ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackModLockWriteProbeResult
} from '@/domain/mods/thirdPartyDataPackModLockWriteProbe'
import type {
  ThirdPartyDataPackTransactionCommandPreflightResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandPreflight'
import type {
  ThirdPartyDataPackTransactionLogWriteProbeResult
} from '@/domain/mods/thirdPartyDataPackTransactionLogWriteProbe'
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

const modLockEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
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

const transactionLogEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
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

const expectedPlanEffects: ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary = {
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

const createModLockWriteProbe = (
  overrides: Partial<ThirdPartyDataPackModLockWriteProbeResult> = {}
): ThirdPartyDataPackModLockWriteProbeResult => ({
  status: 'deferred',
  recoveryLogReplayRestoreStatus: 'deferred',
  reason: 'mod-lock write probe is deferred until an isolated persistent write probe is explicitly authorized',
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
  modLockWriteProbe: 'deferred',
  writeProbeAllowed: false,
  persistentWriteExecuted: false,
  writeChecks: [],
  effects: modLockEffects,
  ...overrides
})

const createTransactionLogWriteProbe = (
  overrides: Partial<ThirdPartyDataPackTransactionLogWriteProbeResult> = {}
): ThirdPartyDataPackTransactionLogWriteProbeResult => ({
  status: 'deferred',
  recoveryLogReplayRestoreStatus: 'deferred',
  reason: 'transaction log write probe is deferred until an isolated persistent write probe is explicitly authorized',
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
  transactionLogWriteProbe: 'deferred',
  writeProbeAllowed: false,
  persistentWriteExecuted: false,
  writeChecks: [],
  effects: transactionLogEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoInstallTransactionEffects = (
  result: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): void => {
  expect(result.effects).toEqual(expectedPlanEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.commitAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
}

describe('third-party install transaction dispatch plan', () => {
  it('defers install dispatch while accepting contained isolated write-probe evidence', () => {
    const result = buildThirdPartyDataPackInstallTransactionDispatchPlan({
      transactionCommandPreflight: createCommandPreflight(),
      modLockWriteProbe: createModLockWriteProbe({
        status: 'written',
        reason: 'mod-lock write probe completed an isolated lockfile-only persistent write',
        modLockWriteProbe: 'written',
        writeProbeAllowed: true,
        persistentWriteExecuted: true,
        storageStatus: 'written',
        effects: {
          ...modLockEffects,
          lockfileWritten: true
        }
      }),
      transactionLogWriteProbe: createTransactionLogWriteProbe({
        status: 'written',
        reason: 'transaction log write probe completed an isolated transaction-log-only persistent write',
        transactionLogWriteProbe: 'written',
        writeProbeAllowed: true,
        persistentWriteExecuted: true,
        storageStatus: 'written',
        effects: {
          ...transactionLogEffects,
          transactionLogWritten: true
        }
      })
    })

    expect(result.status).toBe('deferred')
    expect(result.installTransactionDispatchPlan).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedCandidatePaths).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.stages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'dispatch-plan-inspection', status: 'satisfied' },
      { id: 'install-command-dispatch', status: 'deferred' },
      { id: 'transaction-log-prepare', status: 'deferred' },
      { id: 'package-file-stage', status: 'deferred' },
      { id: 'settings-lockfile-commit', status: 'deferred' },
      { id: 'runtime-publication-commit', status: 'deferred' },
      { id: 'post-commit-ui-ipc-response', status: 'deferred' },
      { id: 'rollback-recovery-handoff', status: 'deferred' }
    ])
    expect(result.requirements.map(requirement => requirement.id)).toEqual([
      'install-command-dispatcher',
      'verified-transaction-log-entry',
      'staged-package-file-commit',
      'atomic-settings-lockfile-commit',
      'runtime-publication-commit-adapter',
      'rollback-recovery-orchestrator',
      'path-free-ui-ipc-result'
    ])
    expect(result.writeProbeEvidence).toEqual({
      modLockWriteProbeStatus: 'written',
      transactionLogWriteProbeStatus: 'written',
      modLockPersistentWriteExecuted: true,
      transactionLogPersistentWriteExecuted: true
    })
    expect('transactionCommandPreflight' in result).toBe(false)
    expect('modLockWriteProbe' in result).toBe(false)
    expect('transactionLogWriteProbe' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoInstallTransactionEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips when command preflight or write probes have no selected package state', () => {
    const commandSkipped = buildThirdPartyDataPackInstallTransactionDispatchPlan({
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
      modLockWriteProbe: createModLockWriteProbe(),
      transactionLogWriteProbe: createTransactionLogWriteProbe()
    })
    const probeSkipped = buildThirdPartyDataPackInstallTransactionDispatchPlan({
      transactionCommandPreflight: createCommandPreflight(),
      modLockWriteProbe: createModLockWriteProbe({
        status: 'skipped',
        reason: 'no selected third-party data packs',
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
      transactionLogWriteProbe: createTransactionLogWriteProbe({
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
    expect(commandSkipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(commandSkipped.requirements).toEqual([])
    expect(probeSkipped.status).toBe('skipped')
    expect(probeSkipped.reason).toBe('no selected third-party data packs')
    expect(probeSkipped.writeProbeEvidence.modLockWriteProbeStatus).toBe('skipped')
    expectNoInstallTransactionEffects(commandSkipped)
    expectNoInstallTransactionEffects(probeSkipped)
    expectJsonGraphFrozen(commandSkipped)
    expectJsonGraphFrozen(probeSkipped)
  })

  it('blocks upstream failures while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.install-transaction-dispatch-plan.path-strip-test',
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

    const result = buildThirdPartyDataPackInstallTransactionDispatchPlan({
      transactionCommandPreflight: createCommandPreflight({
        status: 'blocked',
        reason: 'command preflight blocked before install dispatch planning',
        diagnostics: [diagnostic] as never
      }),
      modLockWriteProbe: createModLockWriteProbe({
        diagnostics: [diagnostic]
      }),
      transactionLogWriteProbe: createTransactionLogWriteProbe({
        diagnostics: [diagnostic]
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('command preflight blocked before install dispatch planning')
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.install-transaction-dispatch-plan.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoInstallTransactionEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks command, identity, package summary and probe-effect drift before dispatch', () => {
    const cases = [
      {
        label: 'not install',
        command: createCommandPreflight({ requestedCommandId: 'enable' }),
        modLock: createModLockWriteProbe(),
        transactionLog: createTransactionLogWriteProbe(),
        blockedCheckId: 'install-command-confirmed'
      },
      {
        label: 'unknown target',
        command: createCommandPreflight({ targetPackageId: blockedPackageId }),
        modLock: createModLockWriteProbe(),
        transactionLog: createTransactionLogWriteProbe(),
        blockedCheckId: 'target-package-selected'
      },
      {
        label: 'candidate drift',
        command: createCommandPreflight(),
        modLock: createModLockWriteProbe({
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          }
        }),
        transactionLog: createTransactionLogWriteProbe(),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile drift',
        command: createCommandPreflight(),
        modLock: createModLockWriteProbe({ lockfileHash: testHash('f') }),
        transactionLog: createTransactionLogWriteProbe(),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'package summary drift',
        command: createCommandPreflight(),
        modLock: createModLockWriteProbe({ packageCount: 2 }),
        transactionLog: createTransactionLogWriteProbe(),
        blockedCheckId: 'package-summary-consistent'
      },
      {
        label: 'probe effect drift',
        command: createCommandPreflight(),
        modLock: createModLockWriteProbe({
          status: 'written',
          modLockWriteProbe: 'written',
          persistentWriteExecuted: true,
          effects: {
            ...modLockEffects,
            lockfileWritten: true,
            settingsWritten: true
          } as never
        }),
        transactionLog: createTransactionLogWriteProbe(),
        blockedCheckId: 'write-probe-effects-contained'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackInstallTransactionDispatchPlan({
        transactionCommandPreflight: currentCase.command,
        modLockWriteProbe: currentCase.modLock,
        transactionLogWriteProbe: currentCase.transactionLog
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('install transaction dispatch plan inputs are inconsistent')
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.install-transaction-dispatch-plan.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(result.requirements).toEqual([])
      expectNoInstallTransactionEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/install-transaction-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/install-transaction-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.install-transaction-dispatch-plan.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackInstallTransactionDispatchPlan({
      transactionCommandPreflight: createCommandPreflight({
        selectedPackageIds,
        blockedPackageIds,
        loadOrder,
        diagnostics: diagnostics as never
      }),
      modLockWriteProbe: createModLockWriteProbe({
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder,
        diagnostics: diagnostics as never
      }),
      transactionLogWriteProbe: createTransactionLogWriteProbe({
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
        stage: 'third-party.install-transaction-dispatch-plan.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.install-transaction-dispatch-plan.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.install-transaction-dispatch-plan.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('install-transaction-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoInstallTransactionEffects(result)
    expectJsonGraphFrozen(result)
  })
})
