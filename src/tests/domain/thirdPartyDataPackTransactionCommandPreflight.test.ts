import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackTransactionCommandPreflight,
  type ThirdPartyDataPackTransactionCommandPreflightEffectSummary,
  type ThirdPartyDataPackTransactionCommandPreflightResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandPreflight'
import type {
  ThirdPartyDataPackModManagementCommandId,
  ThirdPartyDataPackModManagementReadModel
} from '@/domain/mods/thirdPartyDataPackModManagementReadModel'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = requirePackageId('discovery_valid')
const optionalPackageId = requirePackageId('optional_pack')
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

const commandIds: readonly ThirdPartyDataPackModManagementCommandId[] = [
  'install',
  'enable',
  'disable',
  'upgrade',
  'uninstall'
]

const readModelEffects = {
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

const commitAdapterEffects = {
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

const expectedCommandEffects: ThirdPartyDataPackTransactionCommandPreflightEffectSummary = {
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
}

const createReadModel = (
  overrides: Partial<ThirdPartyDataPackModManagementReadModel> = {}
): ThirdPartyDataPackModManagementReadModel => ({
  status: 'ready',
  reason: 'Read-only mod management model is ready for future UI rendering; command dispatch, IPC and writes remain disabled.',
  sourcePreflightStatus: 'deferred',
  readModelKind: 'third-party-data-pack-mod-management-read-model',
  readOnly: true,
  readModelAvailable: true,
  uiMountAllowed: false,
  ipcAllowed: false,
  commandDispatchAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  summary: {
    officialRegistryCount: 54,
    officialEntryCount: 4242,
    candidateRegistryCount: 55,
    candidateEntryCount: 4243,
    packageCount: 1,
    selectedPackageCount: 1,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 1
  },
  identity: {
    official: officialIdentity,
    candidate: candidateIdentity,
    lockfileHash
  },
  packageRows: [
    {
      packageId,
      status: 'selected',
      loadOrderIndex: 0,
      reason: 'Package is selected in the current preflight load order.'
    }
  ],
  diagnostics: [],
  stageRows: [],
  requirementRows: [],
  commandStates: commandIds.map(id => ({
    id,
    status: 'disabled',
    requiresExplicitConfirmation: true,
    reason: 'Commands are disabled until explicit confirmation, transaction command dispatch and persistent write boundaries are wired.'
  })),
  effects: readModelEffects,
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
  commitStages: [],
  requiredCommitAdapters: [],
  effects: commitAdapterEffects,
  ...overrides
})

const createConfirmedRequest = (
  commandId: ThirdPartyDataPackModManagementCommandId = 'install',
  currentPackageId = packageId
) => ({
  commandId,
  packageId: currentPackageId,
  confirmation: {
    commandId,
    packageId: currentPackageId,
    confirmed: true
  }
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoCommandEffects = (
  result: ThirdPartyDataPackTransactionCommandPreflightResult
): void => {
  expect(result.effects).toEqual(expectedCommandEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.commitAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.uiMountAllowed).toBe(false)
  expect(result.ipcAllowed).toBe(false)
}

describe('third-party transaction command preflight', () => {
  it('defers a confirmed command while keeping dispatcher, commit and write effects disabled', () => {
    const result = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel: createReadModel(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter(),
      request: createConfirmedRequest('install')
    })

    expect(result.status).toBe('deferred')
    expect(result.transactionCommandPreflight).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.preflightChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.stages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'command-preflight-inspection', status: 'satisfied' },
      { id: 'explicit-user-confirmation', status: 'satisfied' },
      { id: 'transaction-command-dispatcher', status: 'deferred' },
      { id: 'runtime-commit-handoff', status: 'deferred' },
      { id: 'post-command-diagnostics', status: 'deferred' }
    ])
    expect(result.requirements.map(requirement => requirement.id)).toEqual([
      'explicit-command-request',
      'explicit-confirmation-token',
      'transaction-command-dispatcher',
      'atomic-runtime-publication-commit-adapter',
      'rollback-recovery-handoff',
      'path-free-command-diagnostics'
    ])
    expect('readModel' in result).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoCommandEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips when no command is requested or no selected package state exists', () => {
    const noRequest = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel: createReadModel(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter()
    })
    const empty = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel: createReadModel({
        status: 'empty',
        reason: 'No selected third-party data packs are available for the management read model.',
        packageRows: [],
        identity: {
          official: officialIdentity
        }
      }),
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
      }),
      request: createConfirmedRequest('install')
    })

    expect(noRequest.status).toBe('skipped')
    expect(noRequest.reason).toBe('no transaction command was requested')
    expect(noRequest.preflightChecks.every(check => check.status === 'skipped')).toBe(true)
    expect(noRequest.requirements).toEqual([])
    expect(empty.status).toBe('skipped')
    expect(empty.reason).toBe('no selected third-party data packs')
    expect(empty.selectedPackageIds).toEqual([])
    expect(empty.loadOrder).toEqual([])
    expectNoCommandEffects(noRequest)
    expectNoCommandEffects(empty)
    expectJsonGraphFrozen(noRequest)
    expectJsonGraphFrozen(empty)
  })

  it('blocks upstream read model and commit adapter failures while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.transaction-command-preflight.path-strip-test',
      severity: 'error',
      packageId,
      file: 'C:/Users/LENOVO/taoyuan/mods/discovery_valid/manifest.json',
      fieldPath: '/packages/0/source/C:/Users/LENOVO',
      details: {
        hostPath: 'C:/Users/LENOVO/taoyuan/mods/discovery_valid',
        message: 'contains private path'
      },
      recovery: 'retry'
    })
    const blockedReadModel = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel: createReadModel({
        status: 'blocked',
        reason: 'read model blocked before command preflight',
        diagnostics: [diagnostic] as never
      }),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter(),
      request: createConfirmedRequest('install')
    })
    const blockedCommitAdapter = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel: createReadModel(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
        status: 'blocked',
        reason: 'commit adapter blocked before command preflight',
        diagnostics: [diagnostic]
      }),
      request: createConfirmedRequest('install')
    })

    expect(blockedReadModel.status).toBe('blocked')
    expect(blockedReadModel.reason).toBe('read model blocked before command preflight')
    expect(blockedCommitAdapter.status).toBe('blocked')
    expect(blockedCommitAdapter.reason).toBe('commit adapter blocked before command preflight')
    for (const result of [blockedReadModel, blockedCommitAdapter]) {
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.transaction-command-preflight.path-strip-test',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          recovery: 'retry'
        }
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('hostPath')
      expectNoCommandEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks invalid commands, target drift, missing confirmations and effect divergence', () => {
    const cases = [
      {
        label: 'invalid command',
        request: {
          commandId: 'repair',
          packageId,
          confirmation: { commandId: 'repair', packageId, confirmed: true }
        },
        readModel: createReadModel(),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'requested-command-known'
      },
      {
        label: 'unknown target package',
        request: createConfirmedRequest('enable', optionalPackageId),
        readModel: createReadModel(),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'target-package-known'
      },
      {
        label: 'blocked target package',
        request: createConfirmedRequest('disable', blockedPackageId),
        readModel: createReadModel({
          packageRows: [
            {
              packageId,
              status: 'selected',
              loadOrderIndex: 0,
              reason: 'Package is selected in the current preflight load order.'
            },
            {
              packageId: blockedPackageId,
              status: 'blocked',
              reason: 'Package is blocked by the current read model.'
            }
          ]
        }),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'target-package-known'
      },
      {
        label: 'missing confirmation',
        request: {
          commandId: 'upgrade',
          packageId
        },
        readModel: createReadModel(),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'explicit-confirmation-captured'
      },
      {
        label: 'mismatched confirmation',
        request: {
          commandId: 'uninstall',
          packageId,
          confirmation: { commandId: 'disable', packageId, confirmed: true }
        },
        readModel: createReadModel(),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'explicit-confirmation-captured'
      },
      {
        label: 'command effect divergence',
        request: createConfirmedRequest('install'),
        readModel: createReadModel({
          commandDispatchAllowed: true as never
        }),
        commitAdapter: createRuntimePublicationCommitAdapter(),
        blockedCheckId: 'no-command-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackTransactionCommandPreflight({
        readModel: currentCase.readModel,
        runtimePublicationCommitAdapter: currentCase.commitAdapter,
        request: currentCase.request as never
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('transaction command preflight inputs are inconsistent')
      expect(result.preflightChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.transaction-command-preflight.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).toContain(currentCase.blockedCheckId)
      expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
      expect(result.requirements).toEqual([])
      expectNoCommandEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/transaction-command-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/transaction-command-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.transaction-command-preflight.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const packageRows = createHostileArray([
      {
        packageId: optionalPackageId,
        status: 'selected',
        loadOrderIndex: 0,
        reason: 'Package is selected in the current preflight load order.'
      },
      {
        packageId,
        status: 'selected',
        loadOrderIndex: 1,
        reason: 'Package is selected in the current preflight load order.'
      },
      {
        packageId: blockedPackageId,
        status: 'blocked',
        reason: 'Package is blocked by the current read model.'
      }
    ], 'package-rows')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')
    const loadOrder = createHostileArray([optionalPackageId, packageId], 'load-order')
    const result = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel: createReadModel({
        packageRows: packageRows as never,
        diagnostics: diagnostics as never
      }),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter({
        diagnostics: diagnostics as never,
        loadOrder
      }),
      request: createConfirmedRequest('enable', packageId)
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['optional_pack', 'discovery_valid'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['optional_pack', 'discovery_valid'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.transaction-command-preflight.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.transaction-command-preflight.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('transaction-command-package-rows')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoCommandEffects(result)
    expectJsonGraphFrozen(result)
  })
})
