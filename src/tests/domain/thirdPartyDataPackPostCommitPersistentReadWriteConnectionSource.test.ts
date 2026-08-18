import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary,
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'
import {
  createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_MODE,
  ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError,
  type ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary,
  type ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult,
  type ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadWriteConnectionSource'

const packageId = 'sample_pack' as PackageId
const otherPackageId = 'other_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const transactionEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary => ({
  installPersistentStagingSettingsLockfileTransactionCommitConnectionSourceCalled: true,
  installPersistentStagingSettingsLockfileLifecyclePipelineCalled: true,
  installTransactionCommitConnectionHostCalled: true,
  installTransactionCommitConnectionHostAccepted: true,
  transactionCommitConnectionAcknowledged: true,
  packageFilePersistentWriteAcknowledged: true,
  installCommandLifecycleAcknowledged: true,
  settingsLockfilePersistentWriterAcknowledged: true,
  commandDispatched: true,
  atomicCommitExecutorAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  persistentReadProofAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
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
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  packageFilesWritten: true,
  packageBackupsWritten: true,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
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

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary => ({
  postCommitPersistentReadWriteConnectionHostCalled: true,
  postCommitPersistentReadWriteConnectionHostAccepted: true,
  transactionCommitted: false,
  transactionLogPrepared: false,
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

const createTransactionConnectionResult = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult => ({
  kind: 'third-party-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
  mode: 'default-disabled-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
  status: 'accepted',
  reason: 'third-party install persistent staging settings-lockfile transaction commit connection accepted matching contained write acknowledgements',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installPersistentStagingSettingsLockfileLifecyclePipelineStatus: 'ready',
  installTransactionCommitConnectionHostStatus: 'accepted',
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
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  persistentPackageWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  persistentSettingsLockfileWriteExecuted: true,
  transactionCommitConnectionAcknowledged: true,
  checks: [
    {
      id: 'transaction-commit-connection-accepted',
      status: 'satisfied',
      reason: 'host accepted'
    }
  ],
  diagnostics: [],
  effects: transactionEffects(),
  ...overrides
} as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult)

const createHostResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult> = {}
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  persistentPackageWriteExecuted: true,
  persistentSettingsLockfileWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  transactionCommitConnectionAcknowledged: true,
  diagnostics: [],
  effects: hostEffects(),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectContainedBoundary = (
  result: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult,
  accepted: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(accepted)
  expect(result.uiIpcResultContinuationAllowed).toBe(accepted)
  expect(result.effects.commandContinuationAllowed).toBe(accepted)
  expect(result.effects.uiIpcResultContinuationAllowed).toBe(accepted)
  expect(result.effects.packageFilesWritten).toBe(true)
  expect(result.effects.packageBackupsWritten).toBe(true)
  expect(result.effects.settingsWritten).toBe(true)
  expect(result.effects.lockfileWritten).toBe(true)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveCacheIsolationChecked).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

const captureBlockedResult = async(
  source: () => Promise<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult>
): Promise<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult> => {
  try {
    await source()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError)
    return (error as ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError).result
  }
  throw new Error('expected blocked post-commit persistent read/write connection source')
}

describe('third-party post-commit persistent read/write connection source', () => {
  it('is disabled by default and does not read transaction or connection hosts', async() => {
    const readTransactionCommitConnectionSource = vi.fn()
    const acknowledgePostCommitPersistentReadWrite = vi.fn()
    const source = createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource({
      readTransactionCommitConnectionSource,
      acknowledgePostCommitPersistentReadWrite
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(result.transactionCommitConnectionSourceStatus).toBeUndefined()
    expect(result.postCommitPersistentReadWriteConnectionHostStatus).toBeUndefined()
    expect(readTransactionCommitConnectionSource).not.toHaveBeenCalled()
    expect(acknowledgePostCommitPersistentReadWrite).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.postCommitPersistentReadWriteConnectionAcknowledged).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a matching path-free post-commit read/write acknowledgement after transaction connection', async() => {
    const calls: string[] = []
    const acknowledgePostCommitPersistentReadWrite = vi.fn(async envelope => {
      calls.push('post-commit-read-write-connection')
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
        persistentPackageWriteExecuted: true,
        persistentSettingsLockfileWriteExecuted: true,
        writtenFileCount: 2,
        backedUpFileCount: 1,
        transactionCommitConnectionAcknowledged: true
      })
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('programDirectoryPath' in envelope).toBe(false)
      expect('transactionLogReader' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      return createHostResult()
    })
    const source = createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource({
      enabled: true,
      readTransactionCommitConnectionSource: async() => {
        calls.push('transaction-commit-connection-source')
        return createTransactionConnectionResult()
      },
      acknowledgePostCommitPersistentReadWrite
    })

    const result = await source()

    expect(result.status).toBe('accepted')
    expect(result.readOnly).toBe(false)
    expect(result.transactionCommitConnectionSourceStatus).toBe('accepted')
    expect(result.postCommitPersistentReadWriteConnectionHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.transactionCommitConnectionAcknowledged).toBe(true)
    expect(result.postCommitPersistentReadWriteConnectionAcknowledged).toBe(true)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.transactionCommitConnectionAcknowledged).toBe(true)
    expect(result.effects.postCommitPersistentReadWriteConnectionAcknowledged).toBe(true)
    expect(result.effects.postCommitPersistentReadWriteConnectionHostCalled).toBe(true)
    expect(calls).toEqual([
      'transaction-commit-connection-source',
      'post-commit-read-write-connection'
    ])
    expectContainedBoundary(result, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('transactionLogReader')
    expect(serialized).not.toContain('C:/Users')
    expectJsonGraphFrozen(result)
  })

  it('blocks before post-commit host when transaction connection source is not accepted', async() => {
    const acknowledgePostCommitPersistentReadWrite = vi.fn()
    const source = createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource({
      enabled: true,
      readTransactionCommitConnectionSource: async() => createTransactionConnectionResult({
        status: 'blocked',
        commandContinuationAllowed: false,
        uiIpcResultContinuationAllowed: false,
        transactionCommitConnectionAcknowledged: false,
        persistentPackageWriteExecuted: false,
        persistentSettingsLockfileWriteExecuted: false,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.blocked',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
            recovery: 'retry'
          } as never
        ],
        effects: transactionEffects({
          transactionCommitConnectionAcknowledged: false,
          packageFilePersistentWriteAcknowledged: false,
          settingsLockfilePersistentWriterAcknowledged: false,
          commandContinuationAllowed: false,
          uiIpcResultContinuationAllowed: false,
          packageFilesWritten: false,
          packageBackupsWritten: false,
          settingsWritten: false,
          lockfileWritten: false
        })
      }),
      acknowledgePostCommitPersistentReadWrite
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(true)
    expect(result.transactionCommitConnectionSourceStatus).toBe('blocked')
    expect(result.postCommitPersistentReadWriteConnectionHostStatus).toBeUndefined()
    expect(acknowledgePostCommitPersistentReadWrite).not.toHaveBeenCalled()
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.blocked',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.post-commit-persistent-read-write-connection-source.transaction-source-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('manifest.json')
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe post-commit host drift without exposing paths', async() => {
    const source = createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource({
      enabled: true,
      readTransactionCommitConnectionSource: async() => createTransactionConnectionResult(),
      acknowledgePostCommitPersistentReadWrite: async() => createHostResult({
        targetPackageId: otherPackageId,
        selectedPackageIds: [otherPackageId],
        loadOrder: [otherPackageId],
        candidateHash: testHash('9'),
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.post-commit-persistent-read-write-connection-host.drift',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId: otherPackageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/post-commit.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...hostEffects(),
          transactionLogRead: true
        } as never
      } as never)
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(false)
    expect(result.transactionCommitConnectionSourceStatus).toBe('accepted')
    expect(result.postCommitPersistentReadWriteConnectionHostStatus).toBe('accepted')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'persistent-read-write-connection-accepted',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'install-target-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'package-summary-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'candidate-hash-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'contained-read-write-effects-intact',
        status: 'blocked'
      })
    ]))
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(result.effects.transactionLogRead).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.post-commit-persistent-read-write-connection-host.drift',
        packageId: otherPackageId
      }),
      expect.objectContaining({
        stage: 'third-party.post-commit-persistent-read-write-connection-source.unsafe-connection-host-result',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.post-commit-persistent-read-write-connection-source.connection-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('post-commit.json')
    expectJsonGraphFrozen(result)
  })
})
