import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary,
  ThirdPartyDataPackPostCommitPersistentReadsProofs
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  ThirdPartyDataPackPostCommitVerificationSummary
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorSource'
import {
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline'
import {
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError,
  type ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const persistentReadProofs: ThirdPartyDataPackPostCommitPersistentReadsProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
}

const summary: ThirdPartyDataPackPostCommitVerificationSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const settingsEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary => ({
  settingsLockfileCommitSourceCalled: true,
  packageFileStagingSourceCalled: true,
  injectedSettingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostAccepted: true,
  realSettingsLockfileCommitHostCalled: false,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
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
  diagnosticsWritten: false,
  ...overrides
})

const createAcceptedSettingsResult = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => ({
  kind: 'third-party-settings-lockfile-commit-source',
  mode: 'default-disabled-settings-lockfile-commit-source',
  status: 'accepted',
  reason: 'settings-lockfile commit source accepted an injected host acknowledgement',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  packageFileStagingSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
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
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  diagnostics: [],
  effects: settingsEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackSettingsLockfileCommitSourceResult)

const readHostEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary => ({
  postCommitPersistentReadsHostCalled: true,
  postCommitPersistentReadsHostAccepted: true,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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

const adapterEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary => ({
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
  postCommitVerificationExecutorCalled: true,
  injectedVerificationHostCalled: true,
  verificationOutcomeReceived: true,
  verifiedOutcomeReceived: true,
  failedOutcomeReceived: false,
  retryOutcomeReceived: false,
  rollbackOutcomeReceived: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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

const createExecutedAdapterResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult => ({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  reason: 'post-commit verification executor adapter executed the injected-test-only host',
  postCommitVerificationExecutorAdapter: 'executed',
  readOnly: true,
  injectedExecutorHostRequired: true,
  injectedExecutorHostMode: 'injected-test-only',
  verificationHostCalled: true,
  verificationOutcomeReceived: true,
  verificationOutcomeNormalized: true,
  verificationExecutionAllowed: true,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
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
  outcome: {
    formatVersion: 1,
    kind: 'verified',
    commandId: 'install',
    packageId,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    transactionLogMatched: true,
    packageStateMatched: true,
    settingsLockfileMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true,
    messageKey: 'mods.post.commit.verification.install.verified',
    recovery: 'none',
    retryable: false,
    rollbackRequired: false,
    summary,
    diagnostics: []
  },
  summary,
  effects: adapterEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult)

const verificationHostEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary => ({
  postCommitVerificationExecutorHostCalled: true,
  postCommitVerificationExecutorHostAccepted: true,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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

const expectNoRealEffects = (
  result: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult,
  continuationAllowed: boolean,
  ready: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.uiIpcResultContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.verifiedOutcomeAcknowledged).toBe(ready)
  expect(result.effects.persistentReadProofAcknowledged).toBe(ready)
  const {
    postCommitVerificationReadAcknowledgementSourceCalled: _ackSourceCalled,
    postCommitVerificationExecutorSourceCalled: _executorSourceCalled,
    postCommitPersistentVerificationReadSourceCalled: _readSourceCalled,
    postCommitVerificationExecutorAccepted: _executorAccepted,
    persistentVerificationReadAccepted: _readAccepted,
    verifiedOutcomeAcknowledged: _outcomeAcknowledged,
    persistentReadProofAcknowledged: _proofAcknowledged,
    realPostCommitVerificationAcknowledgementHostCalled: _realAckHostCalled,
    appBootstrapContinuationAllowed: _appContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    uiIpcResultContinuationAllowed: _uiContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party post-commit verification read acknowledgement pipeline', () => {
  it('is disabled by default and does not call upstream readers or injected hosts', async() => {
    const readSettingsLockfileCommitSource = vi.fn()
    const readPostCommitVerificationExecutorAdapter = vi.fn()
    const readPostCommitPersistentState = vi.fn()
    const executePostCommitVerification = vi.fn()
    const pipeline = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline({
      readSettingsLockfileCommitSource,
      readPostCommitVerificationExecutorAdapter,
      readPostCommitPersistentState,
      executePostCommitVerification
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.executorSourceCalled).toBe(false)
    expect(result.persistentVerificationReadSourceCalled).toBe(false)
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(readPostCommitVerificationExecutorAdapter).not.toHaveBeenCalled()
    expect(readPostCommitPersistentState).not.toHaveBeenCalled()
    expect(executePostCommitVerification).not.toHaveBeenCalled()
    expectNoRealEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('threads settings commit, persistent read proof and verification outcome into one acknowledgement', async() => {
    const readSettingsLockfileCommitSource = vi.fn(async() => createAcceptedSettingsResult())
    const readPostCommitPersistentState = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('transactionLogReader' in envelope).toBe(false)
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
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        packageFileStagingHostStatus: 'accepted' as const,
        settingsLockfileCommitHostStatus: 'accepted' as const,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        persistentReadProofs,
        effects: readHostEffects()
      }
    })
    const readPostCommitVerificationExecutorAdapter = vi.fn(async() => createExecutedAdapterResult())
    const executePostCommitVerification = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.verificationOutcomeKind).toBe('verified')
      expect('verificationRequest' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        verificationOutcomeKind: 'verified' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true,
        effects: verificationHostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline({
      enabled: true,
      readSettingsLockfileCommitSource,
      readPostCommitPersistentState,
      readPostCommitVerificationExecutorAdapter,
      executePostCommitVerification
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.postCommitVerificationExecutorSourceStatus).toBe('executed')
    expect(result.postCommitPersistentVerificationReadSourceStatus).toBe('ready')
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentReadProofs).toEqual(persistentReadProofs)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(readSettingsLockfileCommitSource).toHaveBeenCalledOnce()
    expect(readPostCommitPersistentState).toHaveBeenCalledOnce()
    expect(readPostCommitVerificationExecutorAdapter).toHaveBeenCalledOnce()
    expect(executePostCommitVerification).toHaveBeenCalledOnce()
    expect('postCommitVerificationExecutorSource' in result).toBe(false)
    expect('postCommitPersistentVerificationReadSource' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    expect('persistentReadsHost' in result).toBe(false)
    expectNoRealEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks executor and persistent-read identity drift before result continuation', async() => {
    const pipeline = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedSettingsResult(),
      readPostCommitPersistentState: async() => ({
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        packageFileStagingHostStatus: 'accepted' as const,
        settingsLockfileCommitHostStatus: 'accepted' as const,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        persistentReadProofs,
        effects: readHostEffects()
      }),
      readPostCommitVerificationExecutorAdapter: async() => createExecutedAdapterResult({
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('e')
        }
      } as never)
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'candidate-identity-consistent',
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-read-acknowledgement-source.checks.candidate-identity-consistent',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-read-acknowledgement-source.acknowledgement-blocked',
          packageId
        })
      ]))
      expectNoRealEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('contains missing upstream readers without leaking host paths', async() => {
    const pipeline = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline({
      enabled: true,
      readPostCommitVerificationExecutorAdapter: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/post-commit-pipeline-verifier')
      }
    })

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.executorSourceCalled).toBe(true)
      expect(result.persistentVerificationReadSourceCalled).toBe(false)
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-read-acknowledgement-source.executor-source-failed'
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
