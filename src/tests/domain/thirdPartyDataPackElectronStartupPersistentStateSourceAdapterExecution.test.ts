/// <reference types="node" />

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  executeThirdPartyDataPackElectronStartupPersistentStateSourceAdapter,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateSourceAdapterExecution'
import {
  createThirdPartyDataPackElectronStartupPersistentStateSourceHost,
  resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import {
  type ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackStartupGatePersistentStateEffectSummary,
  ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStatePreflight'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-startup-state-execution-'))
  roots.push(root)
  return root
}

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

const sourceEffects: ThirdPartyDataPackStartupGatePersistentStateEffectSummary = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  electronIpcExposed: false,
  electronIpcResponseSent: false,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false,
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
  saveRead: false,
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
  diagnosticsWritten: false,
  startupGateHandoffConsumed: true,
  persistentStateSourcePrepared: true
}

const createPreflight = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStatePreflightResult> = {}
): ThirdPartyDataPackStartupGatePersistentStatePreflightResult => ({
  status: 'deferred',
  startupGateHandoffPreflightStatus: 'deferred',
  reason: 'startup gate persistent state sources are prepared as path-free requirements; real startup reads, LauncherApp, GameApp and writes remain separate',
  startupGatePersistentStatePreflight: 'deferred',
  readOnly: true,
  startupGateHandoffConsumed: true,
  persistentStateSourcePrepared: true,
  persistentStartupReadAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  startupFailureReportingAllowed: false,
  launcherAppAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  envelopeKind: 'success',
  messageKey: 'mods.ui.ipc.result.install.success',
  selectedPackageIds: [packageId],
  blockedPackageIds: [blockedPackageId],
  blockedCandidateCount: 1,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  checks: [],
  diagnostics: [],
  persistentStateStages: [
    {
      id: 'startup-gate-handoff-consumed',
      status: 'satisfied',
      requirementIds: ['no-startup-read-write-side-effect-guard'],
      reason: 'Startup gate handoff was inspected without invoking LauncherApp, GameApp or persistent reads.'
    },
    {
      id: 'persistent-state-source-contract',
      status: 'satisfied',
      requirementIds: [
        'committed-transaction-log-source',
        'package-state-source',
        'settings-state-source',
        'mod-lock-state-source'
      ],
      reason: 'Persistent startup state source contract is prepared as a path-free requirement matrix.'
    },
    {
      id: 'transaction-log-state-read',
      status: 'deferred',
      requirementIds: ['committed-transaction-log-source'],
      reason: 'Transaction log reading remains deferred to a later real startup source adapter.'
    },
    {
      id: 'package-state-read',
      status: 'deferred',
      requirementIds: ['package-state-source'],
      reason: 'Package state reading remains deferred to a later real startup source adapter.'
    },
    {
      id: 'settings-state-read',
      status: 'deferred',
      requirementIds: ['settings-state-source'],
      reason: 'Settings reading remains deferred to a later real startup source adapter.'
    },
    {
      id: 'mod-lock-state-read',
      status: 'deferred',
      requirementIds: ['mod-lock-state-source'],
      reason: 'Mod-lock reading remains deferred to a later real startup source adapter.'
    },
    {
      id: 'live-registry-identity-read',
      status: 'deferred',
      requirementIds: ['live-registry-identity-source'],
      reason: 'Live registry identity reading remains deferred until runtime publication is actually enabled.'
    },
    {
      id: 'save-cache-isolation-read',
      status: 'deferred',
      requirementIds: ['save-cache-isolation-source'],
      reason: 'Save/cache isolation checks remain deferred and must not touch player saves or official caches here.'
    },
    {
      id: 'startup-failure-reporting',
      status: 'deferred',
      requirementIds: ['startup-failure-reporting-source'],
      reason: 'Startup failure reporting remains deferred to the existing redacted diagnostic channel.'
    },
    {
      id: 'launcher-gameapp-gate',
      status: 'deferred',
      requirementIds: ['live-registry-identity-source', 'save-cache-isolation-source'],
      reason: 'LauncherApp, GameApp, Pinia and router creation remain behind the future startup gate.'
    }
  ],
  persistentStateRequirements: [
    {
      id: 'committed-transaction-log-source',
      status: 'required',
      sourceKind: 'transaction-log',
      reason: 'Startup must read a committed transaction log summary before treating the install command as settled.'
    },
    {
      id: 'package-state-source',
      status: 'required',
      sourceKind: 'package-state',
      reason: 'Startup must verify committed package state still matches the selected candidate identity.'
    },
    {
      id: 'settings-state-source',
      status: 'required',
      sourceKind: 'settings',
      reason: 'Startup must verify global settings describe the expected enabled package set without touching saves.'
    },
    {
      id: 'mod-lock-state-source',
      status: 'required',
      sourceKind: 'mod-lock',
      reason: 'Startup must verify mod-lock state matches the expected lockfile hash and load order.'
    },
    {
      id: 'live-registry-identity-source',
      status: 'required',
      sourceKind: 'live-registry',
      reason: 'GameApp creation must wait for a live registry identity that matches the persistent install state.'
    },
    {
      id: 'save-cache-isolation-source',
      status: 'required',
      sourceKind: 'save-cache',
      reason: 'Startup must prove player saves and official cache data remain isolated before opening a writable session.'
    },
    {
      id: 'startup-failure-reporting-source',
      status: 'required',
      sourceKind: 'diagnostic',
      reason: 'Startup failure reporting must be path-free and use the existing redacted diagnostic channel.'
    },
    {
      id: 'no-startup-read-write-side-effect-guard',
      status: 'required',
      sourceKind: 'side-effect-guard',
      reason: 'This preflight may only describe required sources and must not read or write persistent state.'
    }
  ],
  summary: {
    selectedPackageCount: 1,
    blockedPackageCount: 1,
    blockedCandidateCount: 1,
    loadOrderCount: 1,
    registryCount: 55,
    entryCount: 4243,
    packageCount: 1,
    diagnosticCount: 0
  },
  effects: sourceEffects,
  ...overrides
})

const createSnapshotFile = () => ({
  formatVersion: 1,
  kind: 'electron-startup-persistent-state-snapshot',
  packageId,
  candidateIdentity,
  lockfileHash,
  transactionLog: { committed: true },
  packageState: { matched: true },
  settingsState: { matched: true },
  modLockState: { matched: true },
  liveRegistry: { matched: true },
  saveCache: { isolated: true }
})

const writeSnapshot = async(root: string): Promise<void> => {
  const paths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(root)
  await mkdir(paths.startupStateDirectoryPath, { recursive: true })
  await writeFile(paths.snapshotFilePath, `${JSON.stringify(createSnapshotFile(), null, 2)}\n`, 'utf8')
}

const expectNoRealStartupWrites = (
  result: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
): void => {
  expect(result.launcherAppAllowed).toBe(false)
  expect(result.gameAppCreationAllowed).toBe(false)
  expect(result.piniaCreationAllowed).toBe(false)
  expect(result.routerMountAllowed).toBe(false)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.electronIpcExposed).toBe(false)
  expect(result.effects.electronIpcResponseSent).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party Electron startup persistent state source adapter execution', () => {
  it('executes the Electron host through the bridge without exposing normal startup or write effects', async() => {
    const root = await createRoot()
    await writeSnapshot(root)

    const execution = await executeThirdPartyDataPackElectronStartupPersistentStateSourceAdapter({
      preflight: createPreflight(),
      electronHost: createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
        programDirectoryPath: root
      })
    })

    expect(Object.isFrozen(execution)).toBe(true)
    expect(execution.kind).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND)
    expect(execution.mode).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE)
    expect(execution.platform).toBe('electron')
    expect(execution.bridgeKind).toBe('electron-startup-persistent-state-source-adapter-bridge')
    expect(execution.bridgeMode).toBe('electron-program-directory-source-host-to-injected-test-only-adapter')
    expect(execution.adapterResult.status).toBe('executed')
    expect(execution.adapterResult.startupStateSnapshot).toEqual(expect.objectContaining({
      kind: 'startup-persistent-state-snapshot',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      messageKey: 'mods.startup.persistent.state.electron.ready'
    }))
    expect('electronHost' in execution).toBe(false)
    expect('programDirectoryPath' in execution).toBe(false)
    expect(JSON.stringify(execution)).not.toContain(root)
    expect(JSON.stringify(execution)).not.toContain('C:/Users')
    expectNoRealStartupWrites(execution.adapterResult)
  })

  it('keeps incompatible Electron hosts behind the existing adapter host-failure boundary', async() => {
    let readCalled = false
    const execution = await executeThirdPartyDataPackElectronStartupPersistentStateSourceAdapter({
      preflight: createPreflight(),
      electronHost: {
        kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
        mode: 'unsafe-normal-startup-host' as never,
        inspect: async() => {
          throw new Error('C:/Users/LENOVO/mods/electron-startup-execution-inspect')
        },
        read: async() => {
          readCalled = true
          throw new Error('C:/Users/LENOVO/mods/electron-startup-execution-read')
        }
      }
    })

    expect(readCalled).toBe(false)
    expect(execution.adapterResult.status).toBe('blocked')
    expect(execution.adapterResult.reason).toBe('injected startup persistent state source host failed before snapshot')
    expect(execution.adapterResult.sourceHostCalled).toBe(true)
    expect(execution.adapterResult.startupStateSnapshotReceived).toBe(false)
    expect(JSON.stringify(execution)).not.toContain('C:/Users')
    expect(JSON.stringify(execution)).not.toContain('LENOVO')
    expect(JSON.stringify(execution)).not.toContain('electron-startup-execution')
    expectNoRealStartupWrites(execution.adapterResult)
  })

  it('does not call the Electron host when upstream preflight is not ready', async() => {
    let readCalled = false
    const execution = await executeThirdPartyDataPackElectronStartupPersistentStateSourceAdapter({
      preflight: createPreflight({
        status: 'skipped',
        startupGatePersistentStatePreflight: 'skipped',
        reason: 'no selected third-party data packs',
        startupGateHandoffConsumed: false,
        persistentStateSourcePrepared: false,
        selectedPackageIds: [],
        blockedPackageIds: [],
        blockedCandidateCount: 0,
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        targetPackageId: undefined,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
      electronHost: {
        kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
        mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
        inspect: async() => {
          throw new Error('C:/Users/LENOVO/mods/electron-startup-execution-inspect')
        },
        read: async() => {
          readCalled = true
          throw new Error('C:/Users/LENOVO/mods/electron-startup-execution-read')
        }
      }
    })

    expect(readCalled).toBe(false)
    expect(execution.adapterResult.status).toBe('skipped')
    expect(execution.adapterResult.sourceHostCalled).toBe(false)
    expect(execution.adapterResult.startupStateSnapshotReceived).toBe(false)
    expect(JSON.stringify(execution)).not.toContain('C:/Users')
    expect(JSON.stringify(execution)).not.toContain('LENOVO')
    expectNoRealStartupWrites(execution.adapterResult)
  })
})
