import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
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

const uiIpcEffects = {
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoUiIpcEffects = (
  result: ThirdPartyDataPackModManagementUiIpcPreflightResult
): void => {
  expect(result.effects).toEqual(uiIpcEffects)
  expect(Object.isFrozen(result.effects)).toBe(true)
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

describe('third-party mod management UI/IPC preflight', () => {
  it('defers with required UI/IPC adapters and no runtime or storage effects', () => {
    const result = buildThirdPartyDataPackModManagementUiIpcPreflight({
      modLockWriteProbe: createModLockWriteProbe(),
      transactionLogWriteProbe: createTransactionLogWriteProbe()
    })

    expect(result.status).toBe('deferred')
    expect(result.modManagementUiIpcPreflight).toBe('deferred')
    expect(result.uiAllowed).toBe(false)
    expect(result.ipcAllowed).toBe(false)
    expect(result.commandDispatchAllowed).toBe(false)
    expect(result.writeAllowed).toBe(false)
    expect(result.runtimeEnablementAllowed).toBe(false)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.uiIpcChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.uiIpcStages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'ui-ipc-preflight-inspection', status: 'satisfied' },
      { id: 'mod-management-read-model', status: 'deferred' },
      { id: 'explicit-user-confirmation', status: 'deferred' },
      { id: 'electron-ipc-contract', status: 'deferred' },
      { id: 'web-import-ui-bridge', status: 'deferred' },
      { id: 'android-import-ui-bridge', status: 'deferred' },
      { id: 'transaction-command-dispatch', status: 'deferred' },
      { id: 'ui-diagnostics-finalization', status: 'deferred' }
    ])
    expect(result.requiredUiIpcAdapters.map(adapter => adapter.id)).toEqual([
      'read-only-mod-management-view-model',
      'explicit-user-confirmation-gate',
      'electron-preload-ipc-contract',
      'web-file-picker-ui-bridge',
      'android-native-import-ui-bridge',
      'transaction-command-dispatcher',
      'path-free-ui-diagnostics',
      'no-startup-auto-enable-guard'
    ])
    expect('candidateSnapshot' in result).toBe(false)
    expect('modLockWriteProbe' in result).toBe(false)
    expect('transactionLogWriteProbe' in result).toBe(false)
    expectNoUiIpcEffects(result)
    expectOfficialBaseline()
    expectJsonGraphFrozen(result)
  })

  it('blocks inconsistent write probe summaries before UI/IPC can be exposed', () => {
    const result = buildThirdPartyDataPackModManagementUiIpcPreflight({
      modLockWriteProbe: createModLockWriteProbe(),
      transactionLogWriteProbe: createTransactionLogWriteProbe({
        lockfileHash: testHash('9')
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('mod management UI/IPC preflight inputs are inconsistent')
    expect(result.requiredUiIpcAdapters).toEqual([])
    expect(result.uiIpcStages.every(stage => stage.status === 'blocked')).toBe(true)
    expect(result.uiIpcChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'lockfile-hash-consistent',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.mod-management-ui-ipc-preflight.checks',
        fieldPath: '/uiIpcChecks/lockfile-hash-consistent'
      })
    ]))
    expectNoUiIpcEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts contained isolated write-probe evidence without carrying write effects forward', () => {
    const result = buildThirdPartyDataPackModManagementUiIpcPreflight({
      modLockWriteProbe: createModLockWriteProbe({
        status: 'written',
        modLockWriteProbe: 'written',
        writeProbeAllowed: true,
        persistentWriteExecuted: true,
        effects: {
          ...modLockEffects,
          lockfileWritten: true
        }
      }),
      transactionLogWriteProbe: createTransactionLogWriteProbe({
        status: 'written',
        transactionLogWriteProbe: 'written',
        writeProbeAllowed: true,
        persistentWriteExecuted: true,
        transactionId: 'transaction-log-write-probe-test',
        transactionLogEntryHash: testHash('8'),
        effects: {
          ...transactionLogEffects,
          transactionLogWritten: true
        }
      })
    })

    expect(result.status).toBe('deferred')
    expect(result.modLockWriteProbeStatus).toBe('written')
    expect(result.transactionLogWriteProbeStatus).toBe('written')
    expect(result.uiIpcChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'isolated-write-effects-contained',
        status: 'satisfied'
      })
    ]))
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(result.effects.electronIpcExposed).toBe(false)
    expect(result.effects.modManagementUiMounted).toBe(false)
    expectNoUiIpcEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/ui-ipc-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.mod-management-ui-ipc-preflight.proxy-test',
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

    const result = buildThirdPartyDataPackModManagementUiIpcPreflight({
      modLockWriteProbe: createModLockWriteProbe({
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      }),
      transactionLogWriteProbe: createTransactionLogWriteProbe({
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      })
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['discovery_valid'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(result.loadOrder).toEqual(['discovery_valid'])
    expect(result.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.mod-management-ui-ipc-preflight.proxy-test',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(result.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(result.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(result.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(result.loadOrder, loadOrder)).toBe(false)
    expect(Object.is(result.diagnostics[0], diagnostic)).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('ui-ipc-selected-package-ids')
    expectNoUiIpcEffects(result)
    expectJsonGraphFrozen(result)
  })
})
