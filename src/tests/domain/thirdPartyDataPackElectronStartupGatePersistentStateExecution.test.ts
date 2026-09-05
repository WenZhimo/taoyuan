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
  executeThirdPartyDataPackElectronStartupGatePersistentStateExecution,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE
} from '@/domain/mods/thirdPartyDataPackElectronStartupGatePersistentStateExecution'
import {
  createThirdPartyDataPackElectronStartupPersistentStateSourceHost,
  resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGateHandoffEffectSummary,
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGateHandoffPreflight'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-startup-gate-execution-'))
  roots.push(root)
  return root
}

const packageId = 'sample_pack' as PackageId
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

const summary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
} as const

const sourceEffects: ThirdPartyDataPackStartupGateHandoffEffectSummary = {
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
  responseDeliveryOrchestrationConsumed: true,
  startupGateHandoffPrepared: true
}

const createStartupGateHandoffPreflight = (
  overrides: Partial<ThirdPartyDataPackStartupGateHandoffPreflightResult> = {}
): ThirdPartyDataPackStartupGateHandoffPreflightResult => ({
  status: 'deferred',
  responseDeliveryOrchestrationStatus: 'deferred',
  reason: 'startup gate handoff is prepared as a path-free preflight; LauncherApp, GameApp creation and persistent startup reads remain separate',
  startupGateHandoffPreflight: 'deferred',
  readOnly: true,
  startupGateHandoffPrepared: true,
  responseDeliveryOrchestrationConsumed: true,
  startupGateHandoffAllowed: false,
  launcherAppAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  saveReadAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  deliveryAcknowledgementAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  envelopeKind: 'success',
  messageKey: 'mods.ui.ipc.result.install.success',
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  deliveryEnvelope: {
    formatVersion: 1,
    kind: 'success',
    commandId: 'install',
    packageId,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    messageKey: 'mods.ui.ipc.result.install.success',
    recovery: 'none',
    retryable: false,
    rollbackRequired: false,
    summary,
    diagnostics: []
  },
  checks: [],
  diagnostics: [],
  startupStages: [
    {
      id: 'response-delivery-orchestration-consumed',
      status: 'satisfied',
      requirementIds: ['startup-gate-contract', 'no-startup-side-effect-guard'],
      reason: 'Response delivery orchestration is consistent enough to describe startup handoff requirements.'
    },
    {
      id: 'startup-gate-preflight',
      status: 'satisfied',
      requirementIds: ['startup-gate-contract'],
      reason: 'Startup handoff inputs were inspected without invoking LauncherApp, GameApp or persistent reads.'
    },
    {
      id: 'persistent-install-state-read',
      status: 'deferred',
      requirementIds: ['persistent-install-state-source'],
      reason: 'Persistent package, settings, lockfile and transaction-log reads remain deferred.'
    }
  ],
  startupRequirements: [
    {
      id: 'startup-gate-contract',
      status: 'required',
      reason: 'Define the explicit startup gate contract.'
    },
    {
      id: 'launcher-app-boundary',
      status: 'required',
      reason: 'Launcher startup must stay separate from pure domain response orchestration.'
    },
    {
      id: 'persistent-install-state-source',
      status: 'required',
      reason: 'A later startup gate must read verified persistent install state.'
    },
    {
      id: 'live-registry-identity-source',
      status: 'required',
      reason: 'GameApp creation must wait until live registry identity matches persistent state.'
    },
    {
      id: 'save-cache-isolation-source',
      status: 'required',
      reason: 'Startup handoff must prove player saves and official cache state remain isolated.'
    },
    {
      id: 'game-app-creation-gate',
      status: 'required',
      reason: 'Pinia, router and GameApp creation must remain behind one gate.'
    },
    {
      id: 'startup-failure-reporting',
      status: 'required',
      reason: 'Startup failure reporting must use redacted diagnostics.'
    },
    {
      id: 'no-startup-side-effect-guard',
      status: 'required',
      reason: 'This preflight must not mount UI, read saves or write persistent data.'
    }
  ],
  summary,
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
    commandId: 'install',
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

describe('third-party Electron startup gate persistent state execution', () => {
  it('chains startup handoff preflight to Electron persistent state source execution without normal startup effects', async() => {
    const root = await createRoot()
    await writeSnapshot(root)

    const result = await executeThirdPartyDataPackElectronStartupGatePersistentStateExecution({
      startupGateHandoffPreflight: createStartupGateHandoffPreflight(),
      electronHost: createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
        programDirectoryPath: root
      })
    })

    expect(Object.isFrozen(result)).toBe(true)
    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE)
    expect(result.platform).toBe('electron')
    expect(result.startupGateHandoffStatus).toBe('deferred')
    expect(result.persistentStatePreflight.status).toBe('deferred')
    expect(result.persistentStatePreflight.startupGateHandoffConsumed).toBe(true)
    expect(result.persistentStatePreflight.persistentStateSourcePrepared).toBe(true)
    expect(result.sourceAdapterExecution.adapterResult.status).toBe('executed')
    expect(result.sourceAdapterExecution.adapterResult.startupStateSnapshot).toEqual(expect.objectContaining({
      kind: 'startup-persistent-state-snapshot',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      messageKey: 'mods.startup.persistent.state.electron.ready'
    }))
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('electronHost' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expect(JSON.stringify(result)).not.toContain(root)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expectNoRealStartupWrites(result.sourceAdapterExecution.adapterResult)
  })

  it('does not read the Electron host when the startup handoff is skipped', async() => {
    let readCalled = false

    const result = await executeThirdPartyDataPackElectronStartupGatePersistentStateExecution({
      startupGateHandoffPreflight: createStartupGateHandoffPreflight({
        status: 'skipped',
        startupGateHandoffPreflight: 'skipped',
        reason: 'no selected third-party data packs',
        startupGateHandoffPrepared: false,
        responseDeliveryOrchestrationConsumed: false,
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
      electronHost: {
        kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
        mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
        inspect: async() => {
          throw new Error('C:/Users/LENOVO/mods/electron-startup-gate-inspect')
        },
        read: async() => {
          readCalled = true
          throw new Error('C:/Users/LENOVO/mods/electron-startup-gate-read')
        }
      }
    })

    expect(readCalled).toBe(false)
    expect(result.persistentStatePreflight.status).toBe('skipped')
    expect(result.sourceAdapterExecution.adapterResult.status).toBe('skipped')
    expect(result.sourceAdapterExecution.adapterResult.sourceHostCalled).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoRealStartupWrites(result.sourceAdapterExecution.adapterResult)
  })

  it('blocks inconsistent startup handoff inputs before Electron persistent state reads', async() => {
    let readCalled = false

    const result = await executeThirdPartyDataPackElectronStartupGatePersistentStateExecution({
      startupGateHandoffPreflight: createStartupGateHandoffPreflight({
        startupGateHandoffPrepared: false
      }),
      electronHost: {
        kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
        mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
        inspect: async() => {
          throw new Error('C:/Users/LENOVO/mods/electron-startup-gate-blocked-inspect')
        },
        read: async() => {
          readCalled = true
          throw new Error('C:/Users/LENOVO/mods/electron-startup-gate-blocked-read')
        }
      }
    })

    expect(readCalled).toBe(false)
    expect(result.persistentStatePreflight.status).toBe('blocked')
    expect(result.persistentStatePreflight.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'startup-gate-handoff-prepared',
        status: 'blocked'
      })
    ]))
    expect(result.sourceAdapterExecution.adapterResult.status).toBe('blocked')
    expect(result.sourceAdapterExecution.adapterResult.sourceHostCalled).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoRealStartupWrites(result.sourceAdapterExecution.adapterResult)
  })
})
