import { describe, expect, it, vi } from 'vitest'
import type {
  AndroidAppDataImportBridgeHost
} from '@/domain/mods/androidAppDataImportBridge'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  executeThirdPartyDataPackAndroidStartupGatePersistentStateExecution,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE
} from '@/domain/mods/thirdPartyDataPackAndroidStartupGatePersistentStateExecution'
import {
  createThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
} from '@/domain/mods/thirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge'
import {
  executeThirdPartyDataPackAndroidStartupPersistentStateSourceAdapter,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE
} from '@/domain/mods/thirdPartyDataPackAndroidStartupPersistentStateSourceAdapterExecution'
import {
  createThirdPartyDataPackAndroidStartupPersistentStateSourceHost,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_PATH,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
} from '@/domain/mods/thirdPartyDataPackAndroidStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGateHandoffEffectSummary,
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGateHandoffPreflight'
import type {
  ThirdPartyDataPackStartupGatePersistentStateEffectSummary,
  ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStatePreflight'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

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

const handoffEffects: ThirdPartyDataPackStartupGateHandoffEffectSummary = {
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
  effects: handoffEffects,
  ...overrides
})

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

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createSnapshotText = (): string => toJson({
  formatVersion: 1,
  kind: 'android-startup-persistent-state-snapshot',
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

const createAppDataHost = (): AndroidAppDataImportBridgeHost => {
  const text = createSnapshotText()
  return {
    listImportedFiles: vi.fn(async() => [
      {
        relativePath: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_PATH,
        sizeBytes: text.length
      }
    ]),
    readImportedText: vi.fn(async(_importId: string, relativePath: string) =>
      relativePath === THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_PATH ? text : ''
    )
  }
}

const createHost = () => createThirdPartyDataPackAndroidStartupPersistentStateSourceHost({
  host: createAppDataHost()
})

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
  expect(result.effects.androidFilePickerOpened).toBe(false)
  expect(result.effects.androidUiBridgeOpened).toBe(false)
  expect(result.effects.androidUiResponsePublished).toBe(false)
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

describe('third-party Android startup gate persistent state execution', () => {
  it('wraps the Android app-data source host and executes through the existing startup source adapter', async() => {
    const bridge = createThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge(createHost())
    const execution = await executeThirdPartyDataPackAndroidStartupPersistentStateSourceAdapter({
      preflight: createPreflight(),
      androidHost: createHost()
    })

    expect(Object.isFrozen(bridge)).toBe(true)
    expect(Object.isFrozen(bridge.host)).toBe(true)
    expect(bridge.kind).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND)
    expect(bridge.mode).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE)
    expect(bridge.host).toMatchObject({
      kind: 'injected-startup-persistent-state-source-adapter',
      mode: 'injected-test-only'
    })
    expect(Object.isFrozen(execution)).toBe(true)
    expect(execution.kind).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND)
    expect(execution.mode).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE)
    expect(execution.platform).toBe('android')
    expect(execution.bridgeKind).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND)
    expect(execution.bridgeMode).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE)
    expect(execution.adapterResult.status).toBe('executed')
    expect(execution.adapterResult.startupStateSnapshot).toEqual(expect.objectContaining({
      kind: 'startup-persistent-state-snapshot',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      messageKey: 'mods.startup.persistent.state.android.ready'
    }))
    expect('androidHost' in execution).toBe(false)
    expect('appDataHost' in execution).toBe(false)
    expect(JSON.stringify(execution)).not.toContain(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_PATH)
    expect(JSON.stringify(execution)).not.toContain('/data/user')
    expectNoRealStartupWrites(execution.adapterResult)
  })

  it('keeps incompatible Android hosts behind the existing adapter host-failure boundary', async() => {
    let readCalled = false
    const execution = await executeThirdPartyDataPackAndroidStartupPersistentStateSourceAdapter({
      preflight: createPreflight(),
      androidHost: {
        kind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
        mode: 'unsafe-normal-startup-host' as never,
        inspect: async() => {
          throw new Error('/data/user/0/com.games.wenzi.taoyuan/startup-inspect')
        },
        read: async() => {
          readCalled = true
          throw new Error('/data/user/0/com.games.wenzi.taoyuan/startup-read')
        }
      }
    })

    expect(readCalled).toBe(false)
    expect(execution.adapterResult.status).toBe('blocked')
    expect(execution.adapterResult.reason).toBe('injected startup persistent state source host failed before snapshot')
    expect(execution.adapterResult.sourceHostCalled).toBe(true)
    expect(execution.adapterResult.startupStateSnapshotReceived).toBe(false)
    expect(JSON.stringify(execution)).not.toContain('/data/user')
    expect(JSON.stringify(execution)).not.toContain('com.games.wenzi')
    expectNoRealStartupWrites(execution.adapterResult)
  })

  it('chains startup handoff preflight to Android persistent state source execution without normal startup effects', async() => {
    const result = await executeThirdPartyDataPackAndroidStartupGatePersistentStateExecution({
      startupGateHandoffPreflight: createStartupGateHandoffPreflight(),
      androidHost: createHost()
    })

    expect(Object.isFrozen(result)).toBe(true)
    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE)
    expect(result.platform).toBe('android')
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
      messageKey: 'mods.startup.persistent.state.android.ready'
    }))
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('androidHost' in result).toBe(false)
    expect('appDataHost' in result).toBe(false)
    expect(JSON.stringify(result)).not.toContain(THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_PATH)
    expect(JSON.stringify(result)).not.toContain('/data/user')
    expectNoRealStartupWrites(result.sourceAdapterExecution.adapterResult)
  })

  it('does not call the Android host when upstream handoff is skipped', async() => {
    let readCalled = false
    const result = await executeThirdPartyDataPackAndroidStartupGatePersistentStateExecution({
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
      androidHost: {
        kind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
        mode: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
        inspect: async() => {
          throw new Error('/data/user/0/com.games.wenzi.taoyuan/startup-gate-inspect')
        },
        read: async() => {
          readCalled = true
          throw new Error('/data/user/0/com.games.wenzi.taoyuan/startup-gate-read')
        }
      }
    })

    expect(readCalled).toBe(false)
    expect(result.persistentStatePreflight.status).toBe('skipped')
    expect(result.sourceAdapterExecution.adapterResult.status).toBe('skipped')
    expect(result.sourceAdapterExecution.adapterResult.sourceHostCalled).toBe(false)
    expect(result.sourceAdapterExecution.adapterResult.startupStateSnapshotReceived).toBe(false)
    expect(JSON.stringify(result)).not.toContain('/data/user')
    expect(JSON.stringify(result)).not.toContain('com.games.wenzi')
    expectNoRealStartupWrites(result.sourceAdapterExecution.adapterResult)
  })
})
