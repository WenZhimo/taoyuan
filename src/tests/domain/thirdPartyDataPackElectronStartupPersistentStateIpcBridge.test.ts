import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackElectronStartupPersistentStateReadHost,
  createThirdPartyDataPackElectronStartupPersistentStateReadMainHandler,
  thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateIpcBridge'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackStartupGatePersistentStateRequirementId,
  ThirdPartyDataPackStartupGatePersistentStateStageId
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStatePreflight'

const packageId = 'product_probe_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = Object.freeze({
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
})

const lockfileHash = testHash('d')
const requiredSourceIds = Object.freeze([
  'committed-transaction-log-source'
]) as readonly ThirdPartyDataPackStartupGatePersistentStateRequirementId[]
const deferredStageIds = Object.freeze([
  'save-cache-isolation-read'
]) as readonly ThirdPartyDataPackStartupGatePersistentStateStageId[]

const request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest = Object.freeze({
  formatVersion: 1,
  commandId: 'install',
  packageId,
  candidateIdentity,
  lockfileHash,
  selectedPackageIds: Object.freeze([packageId]),
  blockedPackageIds: Object.freeze([]),
  blockedCandidateCount: 0,
  loadOrder: Object.freeze([packageId]),
  registryCount: 54,
  entryCount: 4243,
  packageCount: 1,
  requiredSourceIds,
  deferredStageIds
})

const rawAcceptedSnapshot = () => ({
  kind: 'startup-persistent-state-snapshot',
  settled: true,
  packageId,
  candidateIdentity,
  lockfileHash,
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
})

describe('third-party Electron startup persistent-state IPC bridge', () => {
  it('reads startup persistent state through the fixed IPC channel and returns a safe snapshot', async() => {
    let invokedChannel: string | undefined
    let invokedRequest: ThirdPartyDataPackStartupGatePersistentStateSourceRequest | undefined
    const host = createThirdPartyDataPackElectronStartupPersistentStateReadHost({
      invoke: async(channel, receivedRequest) => {
        invokedChannel = channel
        invokedRequest = receivedRequest
        return rawAcceptedSnapshot()
      }
    })

    const result = await host.read(request)

    expect(invokedChannel).toBe(thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel)
    expect(invokedRequest).toBe(request)
    expect(result).toMatchObject({
      kind: 'startup-persistent-state-snapshot',
      settled: true,
      packageId,
      lockfileHash,
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    expect(result.diagnostics).toEqual([])
  })

  it('blocks invalid main-process requests before calling the source host', async() => {
    let hostCalled = false
    const host = createThirdPartyDataPackElectronStartupPersistentStateReadHost({
      invoke: async() => {
        hostCalled = true
        return rawAcceptedSnapshot()
      }
    })
    const mainHandler = createThirdPartyDataPackElectronStartupPersistentStateReadMainHandler(host)

    const result = await mainHandler({ packageId })

    expect(hostCalled).toBe(false)
    expect(result).toMatchObject({
      kind: 'startup-persistent-state-snapshot',
      settled: false,
      messageKey: 'mods.startup.persistent.state.electron.invalidRequest'
    })
  })

  it('blocks settled main-process snapshots that drift from the renderer request identity', async() => {
    const host = createThirdPartyDataPackElectronStartupPersistentStateReadHost({
      invoke: async() => ({
        ...rawAcceptedSnapshot(),
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('e')
        },
        lockfileHash: testHash('f')
      })
    })

    const result = await host.read(request)

    expect(result).toMatchObject({
      kind: 'startup-persistent-state-snapshot',
      settled: false,
      messageKey: 'mods.startup.persistent.state.electron.identityMismatch',
      retryable: true,
      rollbackRequired: false
    })
    expect(result.packageId).toBeUndefined()
    expect(result.candidateIdentity).toBeUndefined()
    expect(result.lockfileHash).toBeUndefined()
  })

  it('does not leak unsafe raw main-process fields into the renderer snapshot', async() => {
    const rawSnapshot = rawAcceptedSnapshot()
    Object.defineProperties(rawSnapshot, {
      absolutePath: {
        enumerable: true,
        get: () => {
          throw new Error('C:/Users/LENOVO/taoyuan/userdata/mod-startup-state')
        }
      },
      diagnostics: {
        enumerable: true,
        value: [{ message: 'C:/Users/LENOVO/taoyuan/userdata/mod-startup-state' }]
      },
      internalHandle: {
        enumerable: true,
        value: { fd: 7 }
      }
    })
    const host = createThirdPartyDataPackElectronStartupPersistentStateReadHost({
      invoke: async() => rawSnapshot
    })

    const result = await host.read(request)
    const serialized = JSON.stringify(result)

    expect(result.settled).toBe(true)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('mod-startup-state')
    expect(serialized).not.toContain('internalHandle')
    expect(result.diagnostics).toEqual([])
  })
})
