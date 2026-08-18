import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackAtomicTransactionCommitExecutorSource,
  THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_MODE,
  ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorSource'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorAdapter'
import type {
  ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitOutcomeContract'

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

const summary: ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const adapterEffects = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterEffectSummary> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterEffectSummary => ({
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
  atomicCommitExecutorCalled: false,
  injectedCommitHostCalled: false,
  commitOutcomeReceived: false,
  committedOutcomeReceived: false,
  failedOutcomeReceived: false,
  retryOutcomeReceived: false,
  rollbackOutcomeReceived: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
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

const outcomeEffects = (): ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary => ({
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
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
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
  diagnosticsWritten: false
})

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary => ({
  atomicCommitExecutorHostCalled: true,
  atomicCommitExecutorHostAccepted: true,
  transactionCommitted: false,
  transactionLogPrepared: false,
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

const createAdapterResult = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult => ({
  status: 'skipped',
  sourcePreflightStatus: 'skipped',
  outcomeContractStatus: undefined,
  reason: 'no selected third-party data packs',
  atomicTransactionCommitExecutorAdapter: 'skipped',
  readOnly: true,
  injectedExecutorHostRequired: true,
  injectedExecutorHostMode: 'injected-test-only',
  commitHostCalled: false,
  commitOutcomeReceived: false,
  commitOutcomeNormalized: false,
  atomicCommitExecutionAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimePublicationCommitAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: undefined,
  targetPackageId: undefined,
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  checks: [],
  diagnostics: [],
  summary: {
    selectedPackageCount: 0,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 0,
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    diagnosticCount: 0
  },
  effects: adapterEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult)

const createExecutedAdapterResult = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult => createAdapterResult({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  outcomeContractStatus: 'ready',
  reason: 'atomic transaction commit executor adapter executed the injected-test-only host',
  atomicTransactionCommitExecutorAdapter: 'executed',
  commitHostCalled: true,
  commitOutcomeReceived: true,
  commitOutcomeNormalized: true,
  atomicCommitExecutionAllowed: true,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  outcomeContract: {
    status: 'ready',
    sourcePreflightStatus: 'deferred',
    reason: 'ready',
    atomicTransactionCommitOutcomeContract: 'ready',
    readOnly: true,
    commitOutcomeNormalized: true,
    commandDispatchAllowed: false,
    atomicCommitExecutionAllowed: false,
    transactionCommitAllowed: false,
    runtimePublicationCommitAllowed: false,
    postCommitVerificationAllowed: false,
    uiIpcResponseAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: 'install',
    targetPackageId: packageId,
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
    summary,
    outcome: {
      formatVersion: 1,
      kind: 'committed',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      messageKey: 'mods.atomic.commit.install.committed',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      summary,
      diagnostics: []
    },
    effects: outcomeEffects()
  },
  summary,
  effects: adapterEffects({
    atomicCommitExecutorCalled: true,
    injectedCommitHostCalled: true,
    commitOutcomeReceived: true,
    committedOutcomeReceived: true
  }),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentWrites = (
  result: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
): void => {
  expect(result.effects.realAtomicCommitExecutorCalled).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.recoveryLogReplayed).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party atomic transaction commit executor source', () => {
  it('is disabled by default and does not call the executor adapter source', async() => {
    const readAtomicTransactionCommitExecutorAdapter = vi.fn()
    const source = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      readAtomicTransactionCommitExecutorAdapter
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(readAtomicTransactionCommitExecutorAdapter).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('allows command continuation when an enabled adapter source reports skipped', async() => {
    const readAtomicTransactionCommitExecutorAdapter = vi.fn(async() => createAdapterResult({
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
      summary
    }))
    const source = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true,
      readAtomicTransactionCommitExecutorAdapter
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readAtomicTransactionCommitExecutorAdapter).toHaveBeenCalledOnce()
    expect(result.atomicTransactionCommitExecutorAdapterStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect('commitRequest' in result).toBe(false)
    expect('outcomeContract' in result).toBe(false)
    expect('preflight' in result).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts an injected-test-only executed adapter outcome without exposing commit internals', async() => {
    const source = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true,
      readAtomicTransactionCommitExecutorAdapter: async() => createExecutedAdapterResult()
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.atomicTransactionCommitExecutorAdapterStatus).toBe('executed')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.outcomeContractStatus).toBe('ready')
    expect(result.injectedExecutorHostMode).toBe('injected-test-only')
    expect(result.commitOutcomeKind).toBe('committed')
    expect(result.effects.injectedAtomicCommitAdapterExecuted).toBe(true)
    expect(result.effects.injectedCommitHostCalled).toBe(true)
    expect(result.effects.commitOutcomeReceived).toBe(true)
    expect(result.effects.commitOutcomeNormalized).toBe(true)
    expect(result.effects.committedOutcomeReceived).toBe(true)
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243,
      diagnosticCount: 0
    })
    expect('commitRequest' in result).toBe(false)
    expect('outcomeContract' in result).toBe(false)
    expect('commitExecutorHost' in result).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts an injected path-free atomic commit host result without persistent writes', async() => {
    const executeAtomicTransactionCommit = vi.fn(async envelope => {
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
        lockfileHash,
        commitOutcomeKind: 'committed'
      })
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('commitRequest' in envelope).toBe(false)
      expect('outcomeContract' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        commitOutcomeKind: 'committed' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.atomic-transaction-commit-executor-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.atomicCommitHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true,
      readAtomicTransactionCommitExecutorAdapter: async() => createExecutedAdapterResult(),
      executeAtomicTransactionCommit
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.atomicTransactionCommitExecutorAdapterStatus).toBe('executed')
    expect(result.atomicTransactionCommitExecutorHostStatus).toBe('accepted')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.outcomeContractStatus).toBe('ready')
    expect(result.commitOutcomeKind).toBe('committed')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.atomic-transaction-commit-executor-source.host-accepted',
        packageId
      })
    ])
    expect(result.effects.injectedAtomicCommitAdapterExecuted).toBe(true)
    expect(result.effects.injectedCommitHostCalled).toBe(true)
    expect(result.effects.atomicCommitExecutorHostCalled).toBe(true)
    expect(result.effects.atomicCommitExecutorHostAccepted).toBe(true)
    expect(result.effects.realAtomicCommitExecutorCalled).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect('commitRequest' in result).toBe(false)
    expect('outcomeContract' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('commitRequest')
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('programDirectoryPath')
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe atomic commit host results without exposing host details', async() => {
    const executeAtomicTransactionCommit = vi.fn(async() => ({
      status: 'accepted' as const,
      requestedCommandId: 'install' as const,
      targetPackageId: packageId,
      commitOutcomeKind: 'committed' as const,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.atomic-transaction-commit-executor-source.host-unsafe',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          recovery: 'retry',
          file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/transaction.json'
        }
      ],
      effects: {
        ...hostEffects(),
        transactionLogWritten: true
      } as never
    }))
    const source = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true,
      readAtomicTransactionCommitExecutorAdapter: async() => createExecutedAdapterResult(),
      executeAtomicTransactionCommit
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError
    )

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError)
      const result = (error as ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.atomicTransactionCommitExecutorHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.atomic-transaction-commit-executor-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.atomic-transaction-commit-executor-source.unsafe-commit-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.atomic-transaction-commit-executor-source.commit-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('transaction.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.atomicCommitExecutorHostCalled).toBe(true)
      expect(result.effects.atomicCommitExecutorHostAccepted).toBe(true)
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks deferred, missing and throwing adapter sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true,
      readAtomicTransactionCommitExecutorAdapter: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/atomic-executor-source')
      }
    })
    const deferredSource = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true,
      readAtomicTransactionCommitExecutorAdapter: async() => createAdapterResult({
        status: 'blocked',
        sourcePreflightStatus: 'deferred',
        targetPackageId: packageId,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.atomic-transaction-commit-executor-source.blocked-source',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/transaction.json',
            recovery: 'retry'
          }
        ] as never
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError
    )
    await expect(deferredSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError)
      const result = (error as ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.atomic-transaction-commit-executor-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe real-host or write-effect drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/atomic-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackAtomicTransactionCommitExecutorSource({
      enabled: true,
      readAtomicTransactionCommitExecutorAdapter: async() => createExecutedAdapterResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        commitExecutorHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...adapterEffects({
            atomicCommitExecutorCalled: true,
            injectedCommitHostCalled: true,
            commitOutcomeReceived: true,
            committedOutcomeReceived: true
          }),
          transactionLogWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError)
      const result = (error as ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.atomic-transaction-commit-executor-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('atomic-source-selected-package-ids')
      expect('commitExecutorHost' in result).toBe(false)
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
