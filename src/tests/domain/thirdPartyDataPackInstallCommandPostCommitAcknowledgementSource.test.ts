import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorSource'
import {
  createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource,
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError,
  type ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import type {
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherSourceResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'

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

const commandEffects = {
  transactionCommandDispatcherSourceCalled: true,
  transactionCommandDispatcherHandoffSourceCalled: true,
  appBootstrapContinuationAllowed: false,
  commandDispatcherCalled: true,
  commandDispatched: true,
  transactionCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
} as const

const skippedCommandEffects = {
  transactionCommandDispatcherSourceCalled: true,
  transactionCommandDispatcherHandoffSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandDispatcherCalled: false,
  commandDispatched: false,
  transactionCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
} as const

const commitEffects = {
  atomicTransactionCommitExecutorSourceCalled: true,
  atomicTransactionCommitExecutorAdapterSourceCalled: true,
  injectedAtomicCommitAdapterExecuted: true,
  injectedCommitHostCalled: true,
  atomicCommitExecutorHostCalled: true,
  atomicCommitExecutorHostAccepted: true,
  commitOutcomeReceived: true,
  commitOutcomeNormalized: true,
  committedOutcomeReceived: true,
  failedOutcomeReceived: false,
  retryOutcomeReceived: false,
  rollbackOutcomeReceived: false,
  realAtomicCommitExecutorCalled: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
} as const

const acknowledgementEffects = {
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  postCommitVerificationExecutorSourceCalled: true,
  postCommitPersistentVerificationReadSourceCalled: true,
  postCommitVerificationExecutorAccepted: true,
  persistentVerificationReadAccepted: true,
  verifiedOutcomeAcknowledged: true,
  persistentReadProofAcknowledged: true,
  realPostCommitVerificationAcknowledgementHostCalled: false,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
} as const

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

const createCommandSource = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherSourceResult> = {}
): ThirdPartyDataPackTransactionCommandDispatcherSourceResult => ({
  kind: 'third-party-transaction-command-dispatcher-source',
  mode: 'default-disabled-transaction-command-dispatcher-source',
  status: 'dispatched',
  reason: 'third-party transaction command dispatcher accepted an injected path-free install dispatch result',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: false,
  commandContinuationAllowed: true,
  transactionCommandDispatcherHandoffStatus: 'deferred',
  transactionCommandDispatcherHostStatus: 'dispatched',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  diagnostics: [],
  effects: commandEffects,
  ...overrides
} as unknown as ThirdPartyDataPackTransactionCommandDispatcherSourceResult)

const createSkippedCommandSource = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherSourceResult> = {}
): ThirdPartyDataPackTransactionCommandDispatcherSourceResult => ({
  kind: 'third-party-transaction-command-dispatcher-source',
  mode: 'default-disabled-transaction-command-dispatcher-source',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: false,
  transactionCommandDispatcherHandoffStatus: 'skipped',
  requestedCommandId: undefined,
  targetPackageId: undefined,
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  diagnostics: [],
  effects: skippedCommandEffects,
  ...overrides
} as unknown as ThirdPartyDataPackTransactionCommandDispatcherSourceResult)

const createCommitSource = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult => ({
  kind: 'third-party-atomic-transaction-commit-executor-source',
  mode: 'default-disabled-atomic-transaction-commit-executor-source',
  status: 'executed',
  reason: 'third-party atomic transaction commit executor source accepted a path-free commit host result',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  commandContinuationAllowed: true,
  atomicTransactionCommitExecutorAdapterStatus: 'executed',
  atomicTransactionCommitExecutorHostStatus: 'accepted',
  sourcePreflightStatus: 'deferred',
  outcomeContractStatus: 'ready',
  atomicTransactionCommitExecutorHostMode: 'injected-test-only',
  injectedExecutorHostMode: 'injected-test-only',
  commitOutcomeKind: 'committed',
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
  diagnostics: [],
  summary,
  effects: commitEffects,
  ...overrides
} as unknown as ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult)

const createAcknowledgementSource = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult> = {}
): ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult => ({
  kind: 'third-party-post-commit-verification-read-acknowledgement-source',
  mode: 'default-disabled-post-commit-verification-read-acknowledgement-source',
  status: 'ready',
  reason: 'third-party post-commit verification read acknowledgement accepted matching verified outcome and persistent read proofs',
  readOnly: true,
  enabled: true,
  executorSourceCalled: true,
  persistentVerificationReadSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  postCommitVerificationExecutorSourceStatus: 'executed',
  postCommitVerificationExecutorHostMode: 'injected-test-only',
  postCommitPersistentVerificationReadSourceStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  verificationOutcomeKind: 'verified',
  transactionLogMatched: true,
  packageStateMatched: true,
  settingsLockfileMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  persistentReadProofs: {
    transactionLogCommitted: true,
    packageStateMatched: true,
    settingsStateMatched: true,
    modLockStateMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true
  },
  checks: [],
  diagnostics: [],
  summary,
  effects: acknowledgementEffects,
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealEffects = (
  result: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult,
  ready: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party install command post-commit acknowledgement source', () => {
  it('is disabled by default and does not read any lifecycle source', async() => {
    const readTransactionCommandDispatcherSource = vi.fn()
    const readAtomicTransactionCommitExecutorSource = vi.fn()
    const readPostCommitVerificationReadAcknowledgementSource = vi.fn()
    const source = createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
      readTransactionCommandDispatcherSource,
      readAtomicTransactionCommitExecutorSource,
      readPostCommitVerificationReadAcknowledgementSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.transactionCommandDispatcherSourceCalled).toBe(false)
    expect(result.atomicTransactionCommitExecutorSourceCalled).toBe(false)
    expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
    expect(readTransactionCommandDispatcherSource).not.toHaveBeenCalled()
    expect(readAtomicTransactionCommitExecutorSource).not.toHaveBeenCalled()
    expect(readPostCommitVerificationReadAcknowledgementSource).not.toHaveBeenCalled()
    expectNoRealEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('threads dispatched install command, atomic commit acknowledgement and post-commit read proof', async() => {
    const readTransactionCommandDispatcherSource = vi.fn(async() => createCommandSource())
    const readAtomicTransactionCommitExecutorSource = vi.fn(async() => createCommitSource())
    const readPostCommitVerificationReadAcknowledgementSource = vi.fn(async() => createAcknowledgementSource())
    const source = createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
      enabled: true,
      readTransactionCommandDispatcherSource,
      readAtomicTransactionCommitExecutorSource,
      readPostCommitVerificationReadAcknowledgementSource
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.transactionCommandDispatcherSourceStatus).toBe('dispatched')
    expect(result.atomicTransactionCommitExecutorSourceStatus).toBe('executed')
    expect(result.atomicTransactionCommitExecutorHostMode).toBe('injected-test-only')
    expect(result.postCommitVerificationReadAcknowledgementSourceStatus).toBe('ready')
    expect(result.postCommitVerificationExecutorHostMode).toBe('injected-test-only')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.commandDispatched).toBe(true)
    expect(result.effects.atomicCommitExecutorAcknowledged).toBe(true)
    expect(result.effects.injectedCommitHostCalled).toBe(true)
    expect(result.effects.realAtomicCommitExecutorCalled).toBe(false)
    expect(result.effects.postCommitVerificationAcknowledged).toBe(true)
    expect(result.effects.persistentReadProofAcknowledged).toBe(true)
    expect(readTransactionCommandDispatcherSource).toHaveBeenCalledOnce()
    expect(readAtomicTransactionCommitExecutorSource).toHaveBeenCalledOnce()
    expect(readPostCommitVerificationReadAcknowledgementSource).toHaveBeenCalledOnce()
    expect('candidateRegistrySet' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expectNoRealEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('preserves real atomic commit host evidence through post-commit acknowledgement', async() => {
    const realCommitEffects = {
      ...commitEffects,
      injectedCommitHostCalled: false,
      realAtomicCommitExecutorCalled: true
    } as unknown as ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult['effects']
    const source = createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
      enabled: true,
      readTransactionCommandDispatcherSource: async() => createCommandSource(),
      readAtomicTransactionCommitExecutorSource: async() => createCommitSource({
        atomicTransactionCommitExecutorHostMode: 'electron-main-visible-import',
        injectedExecutorHostMode: 'electron-main-visible-import',
        effects: realCommitEffects
      }),
      readPostCommitVerificationReadAcknowledgementSource: async() => createAcknowledgementSource()
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.atomicTransactionCommitExecutorHostMode).toBe('electron-main-visible-import')
    expect(result.effects.atomicCommitExecutorAcknowledged).toBe(true)
    expect(result.effects.injectedCommitHostCalled).toBe(false)
    expect(result.effects.realAtomicCommitExecutorCalled).toBe(true)
    expectNoRealEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('skips downstream lifecycle readers when command dispatch is skipped', async() => {
    const readTransactionCommandDispatcherSource = vi.fn(async() => createSkippedCommandSource())
    const readAtomicTransactionCommitExecutorSource = vi.fn()
    const readPostCommitVerificationReadAcknowledgementSource = vi.fn()
    const source = createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
      enabled: true,
      readTransactionCommandDispatcherSource,
      readAtomicTransactionCommitExecutorSource,
      readPostCommitVerificationReadAcknowledgementSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.transactionCommandDispatcherSourceCalled).toBe(true)
    expect(result.atomicTransactionCommitExecutorSourceCalled).toBe(false)
    expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(readTransactionCommandDispatcherSource).toHaveBeenCalledOnce()
    expect(readAtomicTransactionCommitExecutorSource).not.toHaveBeenCalled()
    expect(readPostCommitVerificationReadAcknowledgementSource).not.toHaveBeenCalled()
    expectNoRealEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks identity drift before command continuation', async() => {
    const readPostCommitVerificationReadAcknowledgementSource = vi.fn(async() => createAcknowledgementSource())
    const source = createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
      enabled: true,
      readTransactionCommandDispatcherSource: async() => createCommandSource(),
      readAtomicTransactionCommitExecutorSource: async() => createCommitSource({
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('e')
        }
      }),
      readPostCommitVerificationReadAcknowledgementSource
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError
    )

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError)
      const result = (error as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'candidate-identity-consistent',
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.install-command-post-commit-acknowledgement-source.checks.candidate-identity-consistent',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.install-command-post-commit-acknowledgement-source.acknowledgement-blocked',
          packageId
        })
      ]))
      expectNoRealEffects(result, false)
      expectJsonGraphFrozen(result)
    }
    expect(readPostCommitVerificationReadAcknowledgementSource).toHaveBeenCalledTimes(2)
  })

  it('contains throwing lifecycle readers without leaking host paths', async() => {
    const readPostCommitVerificationReadAcknowledgementSource = vi.fn()
    const source = createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
      enabled: true,
      readTransactionCommandDispatcherSource: async() => createCommandSource({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.transaction-command-dispatcher-source.host-dispatched',
            messageKey: 'mods.info.lifecycle.transaction.dispatched',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
            recovery: 'none'
          }
        ] as never
      }),
      readAtomicTransactionCommitExecutorSource: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/install-command-post-commit')
      },
      readPostCommitVerificationReadAcknowledgementSource
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError)
      const result = (error as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.transactionCommandDispatcherSourceCalled).toBe(true)
      expect(result.atomicTransactionCommitExecutorSourceCalled).toBe(false)
      expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.transaction-command-dispatcher-source.host-dispatched'
        }),
        expect.objectContaining({
          stage: 'third-party.install-command-post-commit-acknowledgement-source.commit-source-failed'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('manifest.json')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealEffects(result, false)
      expectJsonGraphFrozen(result)
    }
    expect(readPostCommitVerificationReadAcknowledgementSource).not.toHaveBeenCalled()
  })
})
