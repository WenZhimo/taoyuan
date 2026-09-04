import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  acknowledgeThirdPartyDataPackElectronInstallCommandDispatchIpcEnvelope,
  createThirdPartyDataPackElectronInstallCommandDispatchHost,
  createThirdPartyDataPackElectronInstallCommandDispatchMainHandler,
  thirdPartyDataPackElectronInstallCommandDispatchIpcChannel
} from '@/domain/mods/thirdPartyDataPackElectronInstallCommandDispatchBridge'
import {
  createThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationHost,
  thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel
} from '@/domain/mods/thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope,
  ThirdPartyDataPackTransactionCommandDispatcherHostResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createEnvelope = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope> = {}
): ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope => Object.freeze({
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: Object.freeze([packageId]),
  blockedPackageIds: Object.freeze([]),
  loadOrder: Object.freeze([packageId]),
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity: Object.freeze({
    formatVersion: 1,
    contentHash: testHash('a'),
    snapshotHash: testHash('b'),
    candidateHash: testHash('c')
  }),
  lockfileHash: testHash('d'),
  ...overrides
})

const expectNoPersistentEffects = (
  result: ThirdPartyDataPackTransactionCommandDispatcherHostResult,
  dispatched: boolean
): void => {
  expect(result.effects.commandDispatcherCalled).toBe(true)
  expect(result.effects.commandDispatched).toBe(dispatched)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.lockfileRestored).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.settingsRestored).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.recoveryLogReplayed).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party Electron install command dispatch bridge', () => {
  it('dispatches a path-free install command through the fixed preload/main IPC channel', async() => {
    const envelope = createEnvelope()
    const proofs: unknown[] = []
    const mainHandler = createThirdPartyDataPackElectronInstallCommandDispatchMainHandler({
      onDispatched: proof => proofs.push(proof)
    })
    const invocations: {
      readonly channel: string
      readonly envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    }[] = []
    const host = createThirdPartyDataPackElectronInstallCommandDispatchHost({
      invoke: (channel, currentEnvelope) => {
        invocations.push({ channel, envelope: currentEnvelope })
        return mainHandler(currentEnvelope)
      }
    })

    const result = await host.dispatch(envelope)

    expect(Object.isFrozen(host)).toBe(true)
    expect(invocations).toEqual([{ channel: thirdPartyDataPackElectronInstallCommandDispatchIpcChannel, envelope }])
    expect(result).toMatchObject({
      status: 'dispatched',
      requestedCommandId: 'install',
      targetPackageId: packageId,
      diagnostics: []
    })
    expect(proofs).toEqual([
      expect.objectContaining({
        status: 'dispatched',
        requestedCommandId: 'install',
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateIdentity: expect.objectContaining({
          candidateHash: testHash('c')
        }),
        lockfileHash: testHash('d')
      })
    ])
    expect(Object.isFrozen(proofs[0])).toBe(true)
    expect(Object.isFrozen((proofs[0] as { candidateIdentity: unknown }).candidateIdentity)).toBe(true)
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.effects)).toBe(true)
    expectNoPersistentEffects(result, true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
    expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
  })

  it('rejects unsafe main-process command envelopes without reading path-bearing getters', () => {
    let packageGetterRead = false
    const unsafeEnvelope = {
      requestedCommandId: 'install',
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity: {
        formatVersion: 1,
        contentHash: testHash('a'),
        snapshotHash: testHash('b'),
        candidateHash: testHash('c')
      },
      lockfileHash: testHash('d')
    }
    Object.defineProperty(unsafeEnvelope, 'targetPackageId', {
      enumerable: true,
      get() {
        packageGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/private-package')
      }
    })

    const result = acknowledgeThirdPartyDataPackElectronInstallCommandDispatchIpcEnvelope(unsafeEnvelope)
    const proofs: unknown[] = []
    const mainHandler = createThirdPartyDataPackElectronInstallCommandDispatchMainHandler({
      onDispatched: proof => proofs.push(proof)
    })
    const handledResult = mainHandler(unsafeEnvelope)

    expect(packageGetterRead).toBe(false)
    expect(result.status).toBe('blocked')
    expect(handledResult.status).toBe('blocked')
    expect(proofs).toEqual([])
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBeUndefined()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.electron-install-command-dispatch.invalid-envelope'
      })
    ])
    expectNoPersistentEffects(result, false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
  })

  it('blocks invalid main IPC results before they reach the renderer dispatcher source', async() => {
    const host = createThirdPartyDataPackElectronInstallCommandDispatchHost({
      invoke: () => ({
        status: 'dispatched',
        requestedCommandId: 'install',
        targetPackageId: packageId,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: {
          commandDispatcherCalled: true,
          commandDispatched: true,
          transactionCommitted: true
        }
      })
    })

    const result = await host.dispatch(createEnvelope())

    expect(result.status).toBe('blocked')
    expect(result.targetPackageId).toBe(packageId)
    expectNoPersistentEffects(result, false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
  })

  it('wires Electron preload and main to the shared fixed install command dispatch channel', () => {
    const preloadSource = readFileSync('electron/preload.js', 'utf8')
    const mainSource = readFileSync('electron/main.js', 'utf8')

    expect(preloadSource).toContain(
      "ipcRenderer.invoke('third-party-data-pack-install-command-dispatch', envelope)"
    )
    expect(preloadSource).toContain('dispatchThirdPartyDataPackInstallCommand')
    expect(preloadSource).toContain(
      "ipcRenderer.invoke('third-party-data-pack-ordinary-install-terminal-continuation', envelope)"
    )
    expect(preloadSource).toContain('continueThirdPartyDataPackOrdinaryInstallTerminal')
    expect(preloadSource).toContain(
      "ipcRenderer.invoke('third-party-data-pack-startup-persistent-state-read', request)"
    )
    expect(preloadSource).toContain('readThirdPartyDataPackStartupPersistentState')
    expect(mainSource).toContain('thirdPartyDataPackElectronInstallCommandDispatchIpcChannel')
    expect(mainSource).toContain('thirdPartyDataPackInstallCommandDispatchHandler(envelope)')
    expect(mainSource).toContain('thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel')
    expect(mainSource).toContain('continueOrdinaryInstallTerminalFromRenderer(envelope)')
    expect(mainSource).toContain('thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel')
    expect(mainSource).toContain('thirdPartyDataPackStartupPersistentStateReadHandler(request)')
    expect(mainSource).toContain('createMemoryContentPackageSource')
    expect(mainSource).toContain('discoverThirdPartyDataPacks')
    expect(mainSource).toContain('buildThirdPartyDataPackMountInput')
    expect(mainSource).toContain('restoreOfficialPrecompiledRegistryArtifact')
    expect(mainSource).toContain('OFFICIAL_REGISTRY_DEFINITIONS')
    expect(mainSource).toContain('buildThirdPartyDataPackRuntimePublicationCommitAdapter')
    expect(mainSource).toContain('createThirdPartyDataPackRuntimePublicationCommitHost')
    expect(mainSource).toContain('createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline')
    expect(mainSource).toContain('createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline')
    const failureContinuationSource = mainSource.slice(
      mainSource.indexOf('const createOrdinaryInstallTerminalFailureUiIpcContinuationResult'),
      mainSource.indexOf('const electronVisibleImportContinuationRootPath')
    )
    expect(failureContinuationSource).toContain("envelopeKind: 'failure'")
    expect(failureContinuationSource).toContain("recovery: 'retry'")
    expect(failureContinuationSource).toContain('retryable: true')
    expect(failureContinuationSource).toContain('rollbackRequired: false')
    expect(mainSource).not.toContain("from '../src/domain/mods/staticAdapters'")
    expect(mainSource).not.toContain('buildOfficialRegistrySetFromStaticData')
    expect(mainSource).not.toContain('third-party-data-pack-install-command-dispatch-log')
    expect(mainSource).not.toContain('third-party-data-pack-install-command-dispatch-write')
  })

  it('preserves safe runtime publication continuation results from Electron main', async() => {
    const host = createThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationHost({
      invoke: channel => {
        expect(channel).toBe(thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel)
        return {
          status: 'ready',
          reason: 'safe runtime publication continuation',
          installCommandPostCommitAcknowledgement: { status: 'ready' },
          postCommitUiIpcDeliveryContinuation: { status: 'ready' },
          ordinaryInstallTransactionTerminalConnection: { status: 'ready' },
          runtimePublicationCommitAfterPostCommitVerification: { status: 'accepted' },
          runtimePublicationCommitLiveRegistrySwapHostConnection: { status: 'swapped' },
          runtimePublicationCommitAppStartupReadiness: { status: 'ready' },
          runtimePublicationCommitAppStartupHostConnection: { status: 'accepted' },
          startupPersistentStateSnapshotWrite: {
            status: 'written',
            storageKind: 'electron-program-directory-userdata-startup-persistent-state',
            targetPackageId: packageId,
            snapshotWritten: true
          },
          diagnostics: []
        }
      }
    })

    const result = await host.continueOrdinaryInstallTerminal({} as never)

    expect(result.status).toBe('ready')
    expect(result.runtimePublicationCommitAfterPostCommitVerification?.status).toBe('accepted')
    expect(result.runtimePublicationCommitLiveRegistrySwapHostConnection?.status).toBe('swapped')
    expect(result.runtimePublicationCommitAppStartupReadiness?.status).toBe('ready')
    expect(result.runtimePublicationCommitAppStartupHostConnection?.status).toBe('accepted')
    expect(result.startupPersistentStateSnapshotWrite?.status).toBe('written')
    expect(result.startupPersistentStateSnapshotWrite?.targetPackageId).toBe(packageId)
    expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
    expect(JSON.stringify(result)).not.toContain('liveRegistryReference')
  })

  it('preserves retryable failure terminal results without a successful lifecycle acknowledgement', async() => {
    const host = createThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationHost({
      invoke: channel => {
        expect(channel).toBe(thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel)
        return {
          status: 'ready',
          reason: 'safe retryable failure continuation',
          installCommandPostCommitAcknowledgement: {
            status: 'blocked',
            reason: 'success lifecycle did not reach post-commit verification'
          },
          postCommitUiIpcDeliveryContinuation: {
            status: 'ready',
            envelopeKind: 'failure'
          },
          ordinaryInstallTransactionTerminalConnection: {
            status: 'ready',
            outcomeKind: 'failure',
            retryable: true,
            rollbackRequired: false,
            effects: {
              failureOutcomeAccepted: true
            }
          },
          diagnostics: []
        }
      }
    })

    const result = await host.continueOrdinaryInstallTerminal({} as never)

    expect(result.status).toBe('ready')
    expect(result.installCommandPostCommitAcknowledgement?.status).toBe('blocked')
    expect(result.postCommitUiIpcDeliveryContinuation?.status).toBe('ready')
    expect(result.ordinaryInstallTransactionTerminalConnection?.status).toBe('ready')
    expect(result.ordinaryInstallTransactionTerminalConnection?.outcomeKind).toBe('failure')
    expect(result.ordinaryInstallTransactionTerminalConnection?.retryable).toBe(true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
  })

  it('blocks unsafe ordinary terminal continuation results before they reach renderer state', async() => {
    const cyclicResult: Record<string, unknown> = {
      status: 'ready',
      reason: 'unsafe cyclic result',
      installCommandPostCommitAcknowledgement: { status: 'ready' },
      postCommitUiIpcDeliveryContinuation: { status: 'ready' },
      ordinaryInstallTransactionTerminalConnection: { status: 'ready' },
      diagnostics: []
    }
    cyclicResult.self = cyclicResult
    const host = createThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationHost({
      invoke: channel => {
        expect(channel).toBe(thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel)
        return cyclicResult
      }
    })

    const result = await host.continueOrdinaryInstallTerminal({} as never)

    expect(result.status).toBe('blocked')
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
  })
})
