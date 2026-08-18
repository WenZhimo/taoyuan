import { describe, expect, it, vi } from 'vitest'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackTransactionWriteBoundarySource,
  THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_MODE,
  ThirdPartyDataPackTransactionWriteBoundaryBlockedError,
  type ThirdPartyDataPackTransactionWriteBoundaryHostEffectSummary,
  type ThirdPartyDataPackTransactionWriteBoundarySourceResult
} from '@/domain/mods/thirdPartyDataPackTransactionWriteBoundarySource'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary,
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId

const planEffects: ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary = {
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
  commandDispatched: false,
  transactionCommitted: false,
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

const createPlan = (
  overrides: Partial<ThirdPartyDataPackInstallTransactionDispatchPlanResult> = {}
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => ({
  status: 'skipped',
  transactionCommandPreflightStatus: 'skipped',
  modLockWriteProbeStatus: 'skipped',
  transactionLogWriteProbeStatus: 'skipped',
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
  installTransactionDispatchPlan: 'deferred',
  readOnly: true,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  checks: [],
  stages: [],
  requirements: [],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'skipped',
    transactionLogWriteProbeStatus: 'skipped',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  effects: planEffects,
  ...overrides
} as unknown as ThirdPartyDataPackInstallTransactionDispatchPlanResult)

const createDeferredPlan = (
  overrides: Partial<ThirdPartyDataPackInstallTransactionDispatchPlanResult> = {}
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => createPlan({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  reason: 'install transaction dispatch plan is inspect-only',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  checks: [
    {
      id: 'write-probe-effects-contained',
      status: 'satisfied',
      reason: 'isolated probes were contained'
    }
  ],
  stages: [
    {
      id: 'dispatch-plan-inspection',
      status: 'satisfied',
      requirementIds: ['install-command-dispatcher'],
      reason: 'ready to inspect future dispatch'
    }
  ],
  requirements: [
    {
      id: 'atomic-settings-lockfile-commit',
      status: 'required',
      reason: 'future writes require atomic commit'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  ...overrides
})

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackTransactionWriteBoundaryHostEffectSummary> = {}
): ThirdPartyDataPackTransactionWriteBoundaryHostEffectSummary => ({
  transactionWriteBoundaryHostCalled: true,
  transactionWriteBoundaryHostAccepted: true,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrPersistentWrites = (
  result: ThirdPartyDataPackTransactionWriteBoundarySourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.commandContinuationAllowed).toBe(continuationAllowed)

  const {
    transactionWriteBoundarySourceCalled: _transactionWriteBoundarySourceCalled,
    installTransactionDispatchPlanSourceCalled: _installTransactionDispatchPlanSourceCalled,
    injectedTransactionWriteBoundaryHostCalled: _injectedTransactionWriteBoundaryHostCalled,
    transactionWriteBoundaryHostCalled: _transactionWriteBoundaryHostCalled,
    transactionWriteBoundaryHostAccepted: _transactionWriteBoundaryHostAccepted,
    realTransactionWriteBoundaryHostCalled: _realTransactionWriteBoundaryHostCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party transaction write boundary source', () => {
  it('is disabled by default and does not call the install dispatch plan source', async() => {
    const readInstallTransactionDispatchPlan = vi.fn()
    const source = createThirdPartyDataPackTransactionWriteBoundarySource({
      readInstallTransactionDispatchPlan
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readInstallTransactionDispatchPlan).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled source reports a skipped install dispatch plan', async() => {
    const readInstallTransactionDispatchPlan = vi.fn(async() => createPlan({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      writeProbeEvidence: {
        modLockWriteProbeStatus: 'skipped',
        transactionLogWriteProbeStatus: 'skipped',
        modLockPersistentWriteExecuted: false,
        transactionLogPersistentWriteExecuted: false
      }
    }))
    const source = createThirdPartyDataPackTransactionWriteBoundarySource({
      enabled: true,
      readInstallTransactionDispatchPlan
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readInstallTransactionDispatchPlan).toHaveBeenCalledOnce()
    expect(result.installTransactionDispatchPlanStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.writeProbeEvidence.modLockPersistentWriteExecuted).toBe(false)
    expect('transactionCommandPreflight' in result).toBe(false)
    expect('modLockWriteProbe' in result).toBe(false)
    expect('transactionLogWriteProbe' in result).toBe(false)
    expect('transactionWriteHost' in result).toBe(false)
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks deferred install dispatch plans before real writes can run', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/write-boundary-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.transaction-write-boundary-source.deferred-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/transaction.json',
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackTransactionWriteBoundarySource({
      enabled: true,
      readInstallTransactionDispatchPlan: async() => createDeferredPlan({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackTransactionWriteBoundaryBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionWriteBoundaryBlockedError)
      const result = (error as ThirdPartyDataPackTransactionWriteBoundaryBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.installTransactionDispatchPlanStatus).toBe('deferred')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.writeProbeEvidence).toEqual({
        modLockWriteProbeStatus: 'written',
        transactionLogWriteProbeStatus: 'written',
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true
      })
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.transaction-write-boundary-source.deferred-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.transaction-write-boundary-source.write-boundary-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('transaction.json')
      expect(serialized).not.toContain('hostPath')
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('accepts an injected path-free write boundary host without running real writes', async() => {
    const executeTransactionWriteBoundary = vi.fn(async envelope => {
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
        transactionCommandPreflightStatus: 'deferred',
        modLockWriteProbeStatus: 'written',
        transactionLogWriteProbeStatus: 'written',
        writeProbeEvidence: {
          modLockWriteProbeStatus: 'written',
          transactionLogWriteProbeStatus: 'written',
          modLockPersistentWriteExecuted: true,
          transactionLogPersistentWriteExecuted: true
        }
      })
      expect('transactionCommandPreflight' in envelope).toBe(false)
      expect('modLockWriteProbe' in envelope).toBe(false)
      expect('transactionLogWriteProbe' in envelope).toBe(false)
      expect('lockfileDraft' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.transaction-write-boundary-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.writeBoundaryHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackTransactionWriteBoundarySource({
      enabled: true,
      readInstallTransactionDispatchPlan: async() => createDeferredPlan(),
      executeTransactionWriteBoundary
    })

    const result = await source()

    expect(result.status).toBe('accepted')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.installTransactionDispatchPlanStatus).toBe('deferred')
    expect(result.transactionWriteBoundaryHostStatus).toBe('accepted')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.writeProbeEvidence.modLockPersistentWriteExecuted).toBe(true)
    expect(executeTransactionWriteBoundary).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.transaction-write-boundary-source.host-accepted',
        packageId
      })
    ])
    expect(result.effects.injectedTransactionWriteBoundaryHostCalled).toBe(true)
    expect(result.effects.transactionWriteBoundaryHostCalled).toBe(true)
    expect(result.effects.transactionWriteBoundaryHostAccepted).toBe(true)
    expect(result.effects.realTransactionWriteBoundaryHostCalled).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect('transactionCommandPreflight' in result).toBe(false)
    expect('modLockWriteProbe' in result).toBe(false)
    expect('transactionLogWriteProbe' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe write boundary host results without exposing host paths', async() => {
    const source = createThirdPartyDataPackTransactionWriteBoundarySource({
      enabled: true,
      readInstallTransactionDispatchPlan: async() => createDeferredPlan(),
      executeTransactionWriteBoundary: async() => ({
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.transaction-write-boundary-source.host-unsafe',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/transaction.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...hostEffects(),
          settingsWritten: true
        } as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackTransactionWriteBoundaryBlockedError
    )

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionWriteBoundaryBlockedError)
      const result = (error as ThirdPartyDataPackTransactionWriteBoundaryBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.transactionWriteBoundaryHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.transaction-write-boundary-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.transaction-write-boundary-source.unsafe-write-boundary-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.transaction-write-boundary-source.write-boundary-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('transaction.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.transactionWriteBoundaryHostCalled).toBe(true)
      expect(result.effects.transactionWriteBoundaryHostAccepted).toBe(true)
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing and throwing sources without exposing thrown details', async() => {
    const missingSource = createThirdPartyDataPackTransactionWriteBoundarySource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackTransactionWriteBoundarySource({
      enabled: true,
      readInstallTransactionDispatchPlan: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/write-boundary-source')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackTransactionWriteBoundaryBlockedError
    )
    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionWriteBoundaryBlockedError)
      const result = (error as ThirdPartyDataPackTransactionWriteBoundaryBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.transaction-write-boundary-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrPersistentWrites(result, false)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/write-boundary-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackTransactionWriteBoundarySource({
      enabled: true,
      readInstallTransactionDispatchPlan: async() => createPlan({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        transactionWriteHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...planEffects,
          settingsWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackInstallTransactionDispatchPlanResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackTransactionWriteBoundaryBlockedError)
      const result = (error as ThirdPartyDataPackTransactionWriteBoundaryBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.transaction-write-boundary-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('write-boundary-selected-package-ids')
      expect('transactionWriteHost' in result).toBe(false)
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
