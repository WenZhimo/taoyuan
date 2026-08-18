import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackTransactionCommandDispatcherSource,
  THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_MODE,
  ThirdPartyDataPackTransactionCommandDispatcherBlockedError,
  type ThirdPartyDataPackTransactionCommandDispatcherSourceResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary,
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherHandoff'

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

const handoffEffects: ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  transactionCommitted: false,
  postCommitVerificationExecuted: false,
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
  diagnosticsWritten: false
}

const dispatchEffects = {
  commandDispatcherCalled: true,
  commandDispatched: true,
  transactionCommitted: false,
  postCommitVerificationExecuted: false,
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
  diagnosticsWritten: false
} as const

const createHandoff = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult> = {}
): ThirdPartyDataPackTransactionCommandDispatcherHandoffResult => ({
  status: 'skipped',
  transactionCommandPreflightStatus: 'skipped',
  installTransactionDispatchPlanStatus: 'skipped',
  postCommitVerificationPlanStatus: 'skipped',
  reason: 'no selected third-party data packs',
  requestedCommandId: undefined,
  targetPackageId: undefined,
  diagnostics: [],
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  transactionCommandDispatcherHandoff: 'deferred',
  readOnly: true,
  dispatcherHandoffAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  handoffChecks: [],
  handoffStages: [],
  dispatcherRequirements: [],
  effects: handoffEffects,
  ...overrides
} as unknown as ThirdPartyDataPackTransactionCommandDispatcherHandoffResult)

const createDeferredHandoff = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult> = {}
): ThirdPartyDataPackTransactionCommandDispatcherHandoffResult => createHandoff({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  postCommitVerificationPlanStatus: 'deferred',
  reason: 'transaction command dispatcher handoff is inspect-only',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  dispatcherRequirements: [
    {
      id: 'transaction-command-dispatcher',
      status: 'required',
      reason: 'A real dispatcher is still required.'
    }
  ],
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(false)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)

  const {
    transactionCommandDispatcherSourceCalled: _transactionCommandDispatcherSourceCalled,
    transactionCommandDispatcherHandoffSourceCalled: _transactionCommandDispatcherHandoffSourceCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

const expectOnlyCommandDispatchEffects = (
  result: ThirdPartyDataPackTransactionCommandDispatcherSourceResult
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(false)
  expect(result.commandContinuationAllowed).toBe(true)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(false)
  expect(result.effects.commandDispatcherCalled).toBe(true)
  expect(result.effects.commandDispatched).toBe(true)

  const {
    transactionCommandDispatcherSourceCalled: _transactionCommandDispatcherSourceCalled,
    transactionCommandDispatcherHandoffSourceCalled: _transactionCommandDispatcherHandoffSourceCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    commandDispatcherCalled: _commandDispatcherCalled,
    commandDispatched: _commandDispatched,
    ...persistentEffects
  } = result.effects
  expect(Object.values(persistentEffects).every(value => value === false)).toBe(true)
}

describe('third-party transaction command dispatcher source', () => {
  it('is disabled by default and does not call the dispatcher handoff source', async() => {
    const readTransactionCommandDispatcherHandoff = vi.fn()
    const source = createThirdPartyDataPackTransactionCommandDispatcherSource({
      readTransactionCommandDispatcherHandoff
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(readTransactionCommandDispatcherHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows bootstrap to continue when an enabled source reports a skipped dispatcher handoff', async() => {
    const readTransactionCommandDispatcherHandoff = vi.fn(async() => createHandoff({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity,
      lockfileHash
    }))
    const source = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true,
      readTransactionCommandDispatcherHandoff
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readTransactionCommandDispatcherHandoff).toHaveBeenCalledOnce()
    expect(result.transactionCommandDispatcherHandoffStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect('transactionCommandPreflight' in result).toBe(false)
    expect('installTransactionDispatchPlan' in result).toBe(false)
    expect('commandDispatcher' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('dispatches deferred install commands through an injected path-free dispatcher host', async() => {
    const dispatchTransactionCommand = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        lockfileHash
      })
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'dispatched' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.transaction-command-dispatcher-source.host-dispatched',
            messageKey: 'mods.info.lifecycle.transaction.dispatched',
            packageId,
            recovery: 'none'
          }
        ],
        effects: dispatchEffects
      }
    })
    const source = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDeferredHandoff(),
      dispatchTransactionCommand
    })

    const result = await source()

    expect(result.status).toBe('dispatched')
    expect(result.transactionCommandDispatcherHandoffStatus).toBe('deferred')
    expect(result.transactionCommandDispatcherHostStatus).toBe('dispatched')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.transaction-command-dispatcher-source.host-dispatched',
        packageId
      })
    ])
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('programDirectoryPath')
    expectOnlyCommandDispatchEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe dispatcher host results without exposing host details', async() => {
    const dispatchTransactionCommand = vi.fn(async() => ({
      status: 'dispatched' as const,
      requestedCommandId: 'install' as const,
      targetPackageId: packageId,
      programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.transaction-command-dispatcher-source.host-unsafe',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          recovery: 'retry',
          file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/manifest.json'
        }
      ],
      effects: {
        ...dispatchEffects,
        transactionCommitted: true
      } as never
    }))
    const source = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDeferredHandoff(),
      dispatchTransactionCommand
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackTransactionCommandDispatcherBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionCommandDispatcherBlockedError)
      const result = (error as ThirdPartyDataPackTransactionCommandDispatcherBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.transactionCommandDispatcherHostStatus).toBe('dispatched')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.unsafe-dispatcher-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.dispatcher-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('manifest.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks deferred dispatcher handoff results when no dispatcher host is injected', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/dispatcher-source-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.transaction-command-dispatcher-source.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/transaction.json',
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDeferredHandoff({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackTransactionCommandDispatcherBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionCommandDispatcherBlockedError)
      const result = (error as ThirdPartyDataPackTransactionCommandDispatcherBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.appBootstrapContinuationAllowed).toBe(false)
      expect(result.transactionCommandDispatcherHandoffStatus).toBe('deferred')
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.blocked-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.missing-dispatcher-host',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('transaction.json')
      expect(serialized).not.toContain('hostPath')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing and throwing sources without exposing thrown details', async() => {
    const missingSource = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/dispatcher-source')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackTransactionCommandDispatcherBlockedError
    )
    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionCommandDispatcherBlockedError)
      const result = (error as ThirdPartyDataPackTransactionCommandDispatcherBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe skipped sources and copies package arrays without reading hostile lengths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/dispatcher-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createHandoff({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        commandDispatcher: () => undefined,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: {
          ...handoffEffects,
          commandDispatched: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionCommandDispatcherBlockedError)
      const result = (error as ThirdPartyDataPackTransactionCommandDispatcherBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('dispatcher-source-selected-package-ids')
      expect('commandDispatcher' in result).toBe(false)
      expect('programDirectoryPath' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
