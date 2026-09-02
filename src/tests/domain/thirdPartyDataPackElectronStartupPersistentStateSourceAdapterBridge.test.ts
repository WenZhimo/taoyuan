/// <reference types="node" />

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import {
  requireContentId,
  requireRegistryTypeId,
  type PackageId
} from '@/domain/mods/ids'
import {
  createThirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge'
import {
  createThirdPartyDataPackElectronStartupPersistentStateSourceHost,
  resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import {
  executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter,
  type ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackStartupGatePersistentStateEffectSummary,
  ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStatePreflight'
import type {
  ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-startup-state-bridge-'))
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

const createModLockDraft = (): ThirdPartyDataPackLockfileDraft => {
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: testHash('1'),
      contentHash: testHash('2'),
      schemaSetHash: testHash('3'),
      environmentHash: testHash('4'),
      snapshotHash: testHash('5'),
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity,
    registryCount: 55,
    entryCount: 4243,
    selectedPackageIds: [packageId],
    loadOrder: [packageId],
    packages: [
      {
        packageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: 'installed-pack',
          manifestPath: 'installed-pack/manifest.json',
          contentFiles: ['installed-pack/data/items.json']
        },
        manifestHash: testHash('6'),
        contentHash: testHash('7'),
        configurationHash: testHash('8'),
        resolvedDependencies: [],
        contentFiles: [
          {
            registryId: requireRegistryTypeId('taoyuan:item'),
            path: 'data/items.json',
            entryCount: 1,
            entries: [
              {
                registryId: requireRegistryTypeId('taoyuan:item'),
                contentId: requireContentId(`${packageId}:linen_ribbon`),
                index: 0,
                canonicalHash: testHash('9')
              }
            ]
          }
        ]
      }
    ]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const modLockDraft = createModLockDraft()
const lockfileHash = modLockDraft.lockfileHash

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

const createSettingsFile = () => ({
  closeToTray: false,
  thirdPartyDataPacks: {
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    selectedPackageIds: [packageId],
    loadOrder: [packageId]
  }
})

const writeSnapshot = async(root: string): Promise<void> => {
  const paths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(root)
  await mkdir(paths.startupStateDirectoryPath, { recursive: true })
  await writeFile(paths.snapshotFilePath, `${JSON.stringify(createSnapshotFile(), null, 2)}\n`, 'utf8')
  await mkdir(paths.userDataPath, { recursive: true })
  await writeFile(paths.settingsFilePath, `${JSON.stringify(createSettingsFile(), null, 2)}\n`, 'utf8')
  await writeFile(paths.modLockFilePath, `${JSON.stringify(modLockDraft, null, 2)}\n`, 'utf8')
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

describe('third-party Electron startup persistent state source adapter bridge', () => {
  it('wraps the Electron program-directory source host as a platform startup source adapter host', async() => {
    const root = await createRoot()
    await writeSnapshot(root)
    const electronHost = createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
      programDirectoryPath: root
    })
    const bridge = createThirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge(electronHost)

    const result = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: bridge.host
    })

    expect(Object.isFrozen(bridge)).toBe(true)
    expect(Object.isFrozen(bridge.host)).toBe(true)
    expect(bridge.kind).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND)
    expect(bridge.mode).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE)
    expect(bridge.host).toMatchObject({
      kind: 'electron-program-directory-startup-persistent-state-source-adapter',
      mode: 'electron-program-directory-startup-persistent-state'
    })
    expect(result.status).toBe('executed')
    expect(result.reason).toBe(
      'startup gate persistent state source adapter executed a platform startup state source host and normalized its path-free startup snapshot'
    )
    expect(result.startupPersistentStateSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(result.injectedSourceHostMode).toBe('electron-program-directory-startup-persistent-state')
    expect(result.sourceHostCalled).toBe(true)
    expect(result.startupStateSnapshotReceived).toBe(true)
    expect(result.startupStateSnapshotNormalized).toBe(true)
    expect(result.startupStateSnapshot).toEqual(expect.objectContaining({
      kind: 'startup-persistent-state-snapshot',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      messageKey: 'mods.startup.persistent.state.electron.ready'
    }))
    expect(result.startupStateRequest?.requiredSourceIds).toEqual([
      'committed-transaction-log-source',
      'package-state-source',
      'settings-state-source',
      'mod-lock-state-source',
      'live-registry-identity-source',
      'save-cache-isolation-source',
      'startup-failure-reporting-source',
      'no-startup-read-write-side-effect-guard'
    ])
    expect(result.effects.startupPersistentStateSourceAdapterCalled).toBe(true)
    expect(result.effects.injectedSourceHostCalled).toBe(true)
    expect(result.effects.startupStateSnapshotReceived).toBe(true)
    expect(result.effects.startupStateSnapshotNormalized).toBe(true)
    expect('electronHost' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expect(JSON.stringify(result)).not.toContain(root)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expectNoRealStartupWrites(result)
  })

  it('blocks an incompatible Electron host before invoking its path-bearing read method', async() => {
    let readCalled = false
    const bridge = createThirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge({
      kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
      mode: 'unsafe-real-startup-host' as never,
      inspect: async() => {
        throw new Error('C:/Users/LENOVO/mods/startup-state-bridge-inspect')
      },
      read: async() => {
        readCalled = true
        throw new Error('C:/Users/LENOVO/mods/startup-state-bridge-read')
      }
    })

    const result = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: bridge.host
    })

    expect(readCalled).toBe(false)
    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('startup persistent state source host failed before snapshot')
    expect(result.startupPersistentStateSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(result.sourceHostCalled).toBe(true)
    expect(result.startupStateSnapshotReceived).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'startup-state-snapshot-returned',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('startup-state-bridge')
    expectNoRealStartupWrites(result)
  })

  it('keeps missing Electron snapshots inside the adapter host-failure boundary', async() => {
    const root = await createRoot()
    const bridge = createThirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge(
      createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
        programDirectoryPath: root
      })
    )

    const result = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: bridge.host
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toBe('startup persistent state source host failed before snapshot')
    expect(result.startupPersistentStateSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(result.sourceHostCalled).toBe(true)
    expect(result.startupStateSnapshotReceived).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.startup-gate-persistent-state-source-adapter.host-failed',
        packageId
      })
    ]))
    expect(JSON.stringify(result)).not.toContain(root)
    expect(JSON.stringify(result)).not.toContain('startup-persistent-state-snapshot.json')
    expectNoRealStartupWrites(result)
  })
})
