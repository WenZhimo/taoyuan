import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter,
  type ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult,
  type ThirdPartyDataPackStartupGatePersistentStateSourceHost,
  type ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackStartupGatePersistentStateEffectSummary,
  ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStatePreflight'

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
  blockedPackageIds: [],
  blockedCandidateCount: 0,
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
  summary,
  effects: sourceEffects,
  ...overrides
})

const createHost = (
  read: ThirdPartyDataPackStartupGatePersistentStateSourceHost['read'],
  mode: ThirdPartyDataPackStartupGatePersistentStateSourceHost['mode'] = 'injected-test-only'
): ThirdPartyDataPackStartupGatePersistentStateSourceHost => ({
  kind: mode === 'web-indexeddb-startup-persistent-state'
    ? 'web-indexeddb-startup-persistent-state-source-adapter'
    : mode === 'electron-program-directory-startup-persistent-state'
      ? 'electron-program-directory-startup-persistent-state-source-adapter'
      : 'injected-startup-persistent-state-source-adapter',
  mode,
  read
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealStartupReadsOrWrites = (
  result: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
): void => {
  expect(result.persistentStartupReadAllowed).toBe(false)
  expect(result.transactionLogReadAllowed).toBe(false)
  expect(result.packageStateReadAllowed).toBe(false)
  expect(result.settingsReadAllowed).toBe(false)
  expect(result.lockfileReadAllowed).toBe(false)
  expect(result.liveRegistryReadAllowed).toBe(false)
  expect(result.saveReadAllowed).toBe(false)
  expect(result.saveCacheIsolationCheckAllowed).toBe(false)
  expect(result.startupFailureReportingAllowed).toBe(false)
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
  const {
    startupPersistentStateSourceAdapterCalled: _startupPersistentStateSourceAdapterCalled,
    injectedSourceHostCalled: _injectedSourceHostCalled,
    startupStateSnapshotReceived: _startupStateSnapshotReceived,
    startupStateSnapshotNormalized: _startupStateSnapshotNormalized,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party startup gate persistent state source adapter', () => {
  it('executes an injected-test-only source host and normalizes a path-free startup snapshot', async () => {
    const preflight = createPreflight()
    let receivedRequest: ThirdPartyDataPackStartupGatePersistentStateSourceRequest | undefined

    const result = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight,
      host: createHost(request => {
        receivedRequest = request
        expect(Object.isFrozen(request)).toBe(true)
        return {
          kind: 'startup-persistent-state-snapshot',
          settled: true,
          packageId: request.packageId,
          candidateIdentity: request.candidateIdentity,
          lockfileHash: request.lockfileHash,
          transactionLogCommitted: true,
          packageStateMatched: true,
          settingsStateMatched: true,
          modLockStateMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true,
          messageKey: 'mods.startup.persistent.state.ready',
          recovery: 'none'
        }
      })
    })

    expect(result.status).toBe('executed')
    expect(result.startupGatePersistentStateSourceAdapter).toBe('executed')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.sourceHostCalled).toBe(true)
    expect(result.startupStateSnapshotReceived).toBe(true)
    expect(result.startupStateSnapshotNormalized).toBe(true)
    expect(result.startupPersistentStateSourceHostMode).toBe('injected-test-only')
    expect(result.injectedSourceHostMode).toBe('injected-test-only')
    expect(result.startupPersistentStateSourceAdapterAllowed).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.startupStateRequest).toEqual({
      formatVersion: 1,
      commandId: 'install',
      packageId,
      candidateIdentity,
      lockfileHash,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidateCount: 0,
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      requiredSourceIds: [
        'committed-transaction-log-source',
        'package-state-source',
        'settings-state-source',
        'mod-lock-state-source',
        'live-registry-identity-source',
        'save-cache-isolation-source',
        'startup-failure-reporting-source',
        'no-startup-read-write-side-effect-guard'
      ],
      deferredStageIds: [
        'transaction-log-state-read',
        'package-state-read',
        'settings-state-read',
        'mod-lock-state-read',
        'live-registry-identity-read',
        'save-cache-isolation-read',
        'startup-failure-reporting',
        'launcher-gameapp-gate'
      ]
    })
    expect(receivedRequest).toBe(result.startupStateRequest)
    expect(result.startupStateSnapshot).toEqual(expect.objectContaining({
      kind: 'startup-persistent-state-snapshot',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true,
      messageKey: 'mods.startup.persistent.state.ready'
    }))
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.startupPersistentStateSourceAdapterCalled).toBe(true)
    expect(result.effects.injectedSourceHostCalled).toBe(true)
    expect(result.effects.startupStateSnapshotReceived).toBe(true)
    expect(result.effects.startupStateSnapshotNormalized).toBe(true)
    expect('preflight' in result).toBe(false)
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRealStartupReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('executes Web and Electron startup source hosts without falling back to injected-test-only mode', async() => {
    const createRead = (): ThirdPartyDataPackStartupGatePersistentStateSourceHost['read'] => request => ({
      kind: 'startup-persistent-state-snapshot',
      settled: true,
      packageId: request.packageId,
      candidateIdentity: request.candidateIdentity,
      lockfileHash: request.lockfileHash,
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    const webResult = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: createHost(createRead(), 'web-indexeddb-startup-persistent-state')
    })
    const electronResult = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: createHost(createRead(), 'electron-program-directory-startup-persistent-state')
    })

    expect(webResult.status).toBe('executed')
    expect(webResult.startupPersistentStateSourceHostMode).toBe('web-indexeddb-startup-persistent-state')
    expect(webResult.injectedSourceHostMode).toBe('web-indexeddb-startup-persistent-state')
    expect(webResult.reason).toBe(
      'startup gate persistent state source adapter executed a platform startup state source host and normalized its path-free startup snapshot'
    )
    expect(webResult.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'injected-test-boundary',
        status: 'satisfied'
      })
    ]))
    expect(electronResult.status).toBe('executed')
    expect(electronResult.startupPersistentStateSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(electronResult.injectedSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(electronResult.reason).toBe(
      'startup gate persistent state source adapter executed a platform startup state source host and normalized its path-free startup snapshot'
    )
    expectNoRealStartupReadsOrWrites(webResult)
    expectNoRealStartupReadsOrWrites(electronResult)
    expectJsonGraphFrozen(webResult)
    expectJsonGraphFrozen(electronResult)
  })

  it('skips or blocks non-ready preflight states while stripping path-bearing diagnostics', async () => {
    let hostCalled = false
    const skipped = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight({
        status: 'skipped',
        reason: 'no selected third-party data packs',
        startupGatePersistentStatePreflight: 'skipped',
        startupGateHandoffConsumed: false,
        persistentStateSourcePrepared: false,
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
      host: createHost(() => {
        hostCalled = true
        throw new Error('should not run')
      })
    })
    const blocked = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight({
        status: 'blocked',
        reason: 'startup persistent state preflight blocked before source adapter',
        startupGatePersistentStatePreflight: 'blocked',
        startupGateHandoffConsumed: false,
        persistentStateSourcePrepared: false,
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.startup-state-source.blocked-source',
            severity: 'error',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/startup-state.json',
            fieldPath: '/startup/C:/Users/LENOVO',
            details: {
              hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack'
            },
            recovery: 'retry'
          })
        ] as never
      })
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.sourceHostCalled).toBe(false)
    expect(skipped.startupStateSnapshotNormalized).toBe(false)
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.sourceHostCalled).toBe(false)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.startup-state-source.blocked-source',
        packageId
      })
    ])
    expect(hostCalled).toBe(false)
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoRealStartupReadsOrWrites(skipped)
    expectNoRealStartupReadsOrWrites(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks missing host, non-test host, missing identities and upstream effect drift before execution', async () => {
    const baseHost = createHost(request => ({
      kind: 'startup-persistent-state-snapshot',
      settled: true,
      packageId: request.packageId,
      candidateIdentity: request.candidateIdentity,
      lockfileHash: request.lockfileHash,
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    }))
    const cases = [
      {
        label: 'missing host',
        preflight: createPreflight(),
        host: undefined,
        blockedCheckId: 'injected-source-host-ready'
      },
      {
        label: 'non-test host',
        preflight: createPreflight(),
        host: {
          ...baseHost,
          mode: 'real-platform' as never
        },
        blockedCheckId: 'injected-test-boundary'
      },
      {
        label: 'missing target',
        preflight: createPreflight({ targetPackageId: undefined }),
        host: baseHost,
        blockedCheckId: 'target-package-selected'
      },
      {
        label: 'missing candidate identity',
        preflight: createPreflight({ candidateIdentity: undefined }),
        host: baseHost,
        blockedCheckId: 'candidate-identity-present'
      },
      {
        label: 'missing lockfile hash',
        preflight: createPreflight({ lockfileHash: undefined }),
        host: baseHost,
        blockedCheckId: 'lockfile-hash-present'
      },
      {
        label: 'upstream effect drift',
        preflight: createPreflight({
          effects: {
            ...sourceEffects,
            transactionLogRead: true
          } as never
        }),
        host: baseHost,
        blockedCheckId: 'no-upstream-startup-read-write-effects'
      }
    ] as const

    for (const currentCase of cases) {
      const result = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
        preflight: currentCase.preflight,
        host: currentCase.host
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('startup gate persistent state source adapter inputs are inconsistent')
      expect(result.sourceHostCalled).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.startup-gate-persistent-state-source-adapter.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoRealStartupReadsOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks host failures, invalid snapshots and snapshot drift without leaking host details', async () => {
    const hostFailure = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: createHost(() => {
        throw new Error('EACCES C:/Users/LENOVO/mods/startup-state-source')
      })
    })
    const invalidSnapshot = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: createHost(() => undefined as never)
    })
    const driftSnapshot = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: createHost(request => ({
        kind: 'startup-persistent-state-snapshot',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: {
          ...request.candidateIdentity,
          candidateHash: testHash('e')
        },
        lockfileHash: request.lockfileHash,
        transactionLogCommitted: true,
        packageStateMatched: true,
        settingsStateMatched: true,
        modLockStateMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      }))
    })
    const missingProof = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight(),
      host: createHost(request => ({
        kind: 'startup-persistent-state-snapshot',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash,
        transactionLogCommitted: false,
        packageStateMatched: true,
        settingsStateMatched: true,
        modLockStateMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      }))
    })

    expect(hostFailure.status).toBe('blocked')
    expect(hostFailure.reason).toBe('injected startup persistent state source host failed before snapshot')
    expect(hostFailure.sourceHostCalled).toBe(true)
    expect(hostFailure.startupStateSnapshotReceived).toBe(false)
    expect(hostFailure.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'startup-state-snapshot-returned',
        status: 'blocked'
      })
    ]))
    expect(invalidSnapshot.status).toBe('blocked')
    expect(invalidSnapshot.reason).toBe('injected startup persistent state source host returned an invalid snapshot')
    expect(invalidSnapshot.sourceHostCalled).toBe(true)
    expect(invalidSnapshot.startupStateSnapshotReceived).toBe(false)
    expect(driftSnapshot.status).toBe('blocked')
    expect(driftSnapshot.reason).toBe('injected startup persistent state source snapshot failed adapter normalization')
    expect(driftSnapshot.sourceHostCalled).toBe(true)
    expect(driftSnapshot.startupStateSnapshotReceived).toBe(true)
    expect(missingProof.status).toBe('blocked')
    expect(missingProof.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'startup-state-snapshot-ready',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(hostFailure)).not.toContain('C:/Users')
    expect(JSON.stringify(hostFailure)).not.toContain('LENOVO')
    expect(JSON.stringify(driftSnapshot)).not.toContain(testHash('e'))
    expectNoRealStartupReadsOrWrites(hostFailure)
    expectNoRealStartupReadsOrWrites(invalidSnapshot)
    expectNoRealStartupReadsOrWrites(driftSnapshot)
    expectNoRealStartupReadsOrWrites(missingProof)
    expectJsonGraphFrozen(hostFailure)
    expectJsonGraphFrozen(invalidSnapshot)
    expectJsonGraphFrozen(driftSnapshot)
    expectJsonGraphFrozen(missingProof)
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths or getters', async () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/startup-state-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/startup-state-source-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.startup-state-source.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: diagnostics as never
      }),
      host: createHost(request => ({
        kind: 'startup-persistent-state-snapshot',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash,
        transactionLogCommitted: true,
        packageStateMatched: true,
        settingsStateMatched: true,
        modLockStateMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true,
        diagnostics: diagnostics as never
      }))
    })

    expect(result.status).toBe('executed')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      blockedPackageCount: 1,
      diagnosticCount: 2
    })
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.startup-state-source.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.startup-state-source.proxy-test',
        packageId
      })
    ])
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('startup-state-source-selected-package-ids')
    expect(serialized).not.toContain('hostPath')
    expectNoRealStartupReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks accessor-based upstream effects without invoking path-bearing getters', async () => {
    let effectGetterRead = false
    const hostileEffects = {
      ...sourceEffects
    }
    Object.defineProperty(hostileEffects, 'transactionLogRead', {
      enumerable: true,
      get() {
        effectGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/startup-state-source-effect-getter')
      }
    })

    const result = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
      preflight: createPreflight({
        effects: hostileEffects as never
      }),
      host: createHost(request => ({
        kind: 'startup-persistent-state-snapshot',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash,
        transactionLogCommitted: true,
        packageStateMatched: true,
        settingsStateMatched: true,
        modLockStateMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      }))
    })

    expect(result.status).toBe('blocked')
    expect(effectGetterRead).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'no-upstream-startup-read-write-effects',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoRealStartupReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })
})
