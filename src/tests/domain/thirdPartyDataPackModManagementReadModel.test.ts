import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  buildThirdPartyDataPackModManagementReadModel,
  type ThirdPartyDataPackModManagementReadModel
} from '@/domain/mods/thirdPartyDataPackModManagementReadModel'
import {
  buildThirdPartyDataPackModManagementUiIpcPreflight,
  type ThirdPartyDataPackModManagementUiIpcPreflightResult
} from '@/domain/mods/thirdPartyDataPackModManagementUiIpcPreflight'
import type {
  ThirdPartyDataPackModLockWriteProbeResult
} from '@/domain/mods/thirdPartyDataPackModLockWriteProbe'
import type {
  ThirdPartyDataPackTransactionLogWriteProbeResult
} from '@/domain/mods/thirdPartyDataPackTransactionLogWriteProbe'
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

const createModLockWriteProbe = (
  overrides: Partial<ThirdPartyDataPackModLockWriteProbeResult> = {}
): ThirdPartyDataPackModLockWriteProbeResult => ({
  status: 'deferred',
  recoveryLogReplayRestoreStatus: 'deferred',
  reason: 'mod-lock write probe is deferred until explicitly authorized',
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
  reason: 'transaction log write probe is deferred until explicitly authorized',
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

const createPreflight = (
  options: {
    readonly modLock?: Partial<ThirdPartyDataPackModLockWriteProbeResult>
    readonly transactionLog?: Partial<ThirdPartyDataPackTransactionLogWriteProbeResult>
  } = {}
): ThirdPartyDataPackModManagementUiIpcPreflightResult =>
  buildThirdPartyDataPackModManagementUiIpcPreflight({
    modLockWriteProbe: createModLockWriteProbe(options.modLock),
    transactionLogWriteProbe: createTransactionLogWriteProbe(options.transactionLog)
  })

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoExternalEffects = (
  result: ThirdPartyDataPackModManagementReadModel
): void => {
  expect(result.effects).toEqual(readModelEffects)
  expect(result.uiMountAllowed).toBe(false)
  expect(result.ipcAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.commandStates.every(command => command.status === 'disabled')).toBe(true)
  expect(result.commandStates.every(command => command.requiresExplicitConfirmation)).toBe(true)
}

const expectOfficialBaseline = (): void => {
  const registrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  expect(registrySet.registryIds()).toHaveLength(54)
  expect(registrySet.registryIds().reduce(
    (total, registryId) => total + registrySet.get(registryId).entries().length,
    0
  )).toBe(4242)
  expect(snapshot.snapshotHash).toBe(committedMetadata.snapshotHash)
}

describe('third-party mod management read model', () => {
  it('builds a frozen read-only model from deferred UI/IPC preflight output', () => {
    const result = buildThirdPartyDataPackModManagementReadModel({
      preflight: createPreflight()
    })

    expect(result.status).toBe('ready')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.readModelKind).toBe('third-party-data-pack-mod-management-read-model')
    expect(result.readOnly).toBe(true)
    expect(result.readModelAvailable).toBe(true)
    expect(result.summary).toMatchObject({
      officialRegistryCount: 54,
      officialEntryCount: 4242,
      candidateRegistryCount: 55,
      candidateEntryCount: 4243,
      packageCount: 1,
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      blockedCandidateCount: 0,
      loadOrderCount: 1
    })
    expect(result.identity).toEqual({
      official: officialIdentity,
      candidate: candidateIdentity,
      lockfileHash
    })
    expect(result.packageRows).toEqual([
      {
        packageId,
        status: 'selected',
        loadOrderIndex: 0,
        reason: 'Package is selected in the current preflight load order.'
      }
    ])
    expect(result.stageRows.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'ui-ipc-preflight-inspection', status: 'satisfied' },
      { id: 'mod-management-read-model', status: 'deferred' },
      { id: 'explicit-user-confirmation', status: 'deferred' },
      { id: 'electron-ipc-contract', status: 'deferred' },
      { id: 'web-import-ui-bridge', status: 'deferred' },
      { id: 'android-import-ui-bridge', status: 'deferred' },
      { id: 'transaction-command-dispatch', status: 'deferred' },
      { id: 'ui-diagnostics-finalization', status: 'deferred' }
    ])
    expect(result.requirementRows.map(requirement => requirement.id)).toEqual([
      'read-only-mod-management-view-model',
      'explicit-user-confirmation-gate',
      'electron-preload-ipc-contract',
      'web-file-picker-ui-bridge',
      'android-native-import-ui-bridge',
      'transaction-command-dispatcher',
      'path-free-ui-diagnostics',
      'no-startup-auto-enable-guard'
    ])
    expect(result.commandStates.map(command => command.id)).toEqual([
      'install',
      'enable',
      'disable',
      'upgrade',
      'uninstall'
    ])
    expect('candidateSnapshot' in result).toBe(false)
    expect('modLockWriteProbe' in result).toBe(false)
    expect('transactionLogWriteProbe' in result).toBe(false)
    expectNoExternalEffects(result)
    expectOfficialBaseline()
    expectJsonGraphFrozen(result)
  })

  it('returns an empty read model for skipped preflight inputs', () => {
    const result = buildThirdPartyDataPackModManagementReadModel({
      preflight: createPreflight({
        modLock: {
          status: 'skipped',
          reason: 'no selected third-party data packs',
          selectedPackageIds: [],
          loadOrder: [],
          registryCount: 54,
          entryCount: 4242,
          packageCount: 0,
          candidateIdentity: undefined,
          lockfileHash: undefined
        },
        transactionLog: {
          status: 'skipped',
          reason: 'no selected third-party data packs',
          selectedPackageIds: [],
          loadOrder: [],
          registryCount: 54,
          entryCount: 4242,
          packageCount: 0,
          candidateIdentity: undefined,
          lockfileHash: undefined
        }
      })
    })

    expect(result.status).toBe('empty')
    expect(result.sourcePreflightStatus).toBe('skipped')
    expect(result.readModelAvailable).toBe(true)
    expect(result.packageRows).toEqual([])
    expect(result.requirementRows).toEqual([])
    expect(result.summary).toMatchObject({
      candidateRegistryCount: 54,
      candidateEntryCount: 4242,
      packageCount: 0,
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      blockedCandidateCount: 0,
      loadOrderCount: 0
    })
    expect(result.identity.candidate).toBeUndefined()
    expect(result.identity.lockfileHash).toBeUndefined()
    expectNoExternalEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks command states and strips path-bearing diagnostics from blocked preflight output', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.mod-management-read-model.path-strip-test',
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
    const result = buildThirdPartyDataPackModManagementReadModel({
      preflight: createPreflight({
        modLock: {
          status: 'blocked',
          reason: 'mod-lock write probe blocked before UI/IPC',
          diagnostics: [diagnostic],
          blockedPackageIds: [blockedPackageId],
          blockedCandidatePaths: ['C:/Users/LENOVO/blocked-pack']
        }
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.readModelAvailable).toBe(false)
    expect(result.packageRows).toEqual([
      {
        packageId,
        status: 'selected',
        loadOrderIndex: 0,
        reason: 'Package is selected in the current preflight load order.'
      },
      {
        packageId: blockedPackageId,
        status: 'blocked',
        reason: 'Package is blocked by the current UI/IPC preflight inputs.'
      }
    ])
    expect(result.summary.blockedCandidateCount).toBe(1)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.mod-management-read-model.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('blocked-pack')
    expectNoExternalEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('copies package summaries without reading hostile proxy lengths', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/read-model-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const preflight = {
      ...createPreflight(),
      selectedPackageIds: createHostileArray([packageId, optionalPackageId], 'selected'),
      blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package'),
      blockedCandidatePaths: createHostileArray(['C:/Users/LENOVO/blocked-path'], 'blocked-path'),
      loadOrder: createHostileArray([optionalPackageId, packageId], 'load-order')
    } as ThirdPartyDataPackModManagementUiIpcPreflightResult

    const result = buildThirdPartyDataPackModManagementReadModel({ preflight })

    expect(lengthRead).toBe(false)
    expect(result.summary).toMatchObject({
      selectedPackageCount: 2,
      blockedPackageCount: 1,
      blockedCandidateCount: 1,
      loadOrderCount: 2
    })
    expect(result.packageRows.map(row => ({
      packageId: row.packageId,
      status: row.status,
      loadOrderIndex: row.loadOrderIndex
    }))).toEqual([
      { packageId: optionalPackageId, status: 'selected', loadOrderIndex: 0 },
      { packageId, status: 'selected', loadOrderIndex: 1 },
      { packageId: blockedPackageId, status: 'blocked', loadOrderIndex: undefined }
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('read-model-selected')
    expectNoExternalEffects(result)
    expectJsonGraphFrozen(result)
  })
})
