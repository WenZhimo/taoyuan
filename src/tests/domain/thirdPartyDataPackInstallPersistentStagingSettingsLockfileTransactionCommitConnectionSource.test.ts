import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'
import {
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource,
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError,
  type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary,
  type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult,
  type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'

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

const lifecycleEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult['effects']> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult['effects'] => ({
  installPersistentStagingSettingsLockfileLifecyclePipelineCalled: true,
  installPersistentStagingLifecyclePipelineCalled: true,
  settingsLockfilePersistentWriterSourceCalled: true,
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
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary => ({
  installTransactionCommitConnectionHostCalled: true,
  installTransactionCommitConnectionHostAccepted: true,
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

const createLifecycleResult = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult => ({
  kind: 'third-party-install-persistent-staging-settings-lockfile-lifecycle-pipeline',
  mode: 'default-disabled-install-persistent-staging-settings-lockfile-lifecycle-pipeline',
  status: 'ready',
  reason: 'third-party install persistent staging settings-lockfile lifecycle accepted matching package-file and settings-lockfile write acknowledgements',
  readOnly: false,
  enabled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installPersistentStagingLifecyclePipelineStatus: 'ready',
  settingsLockfilePersistentWriterSourceStatus: 'written',
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
  checks: [
    {
      id: 'install-target-consistent',
      status: 'satisfied',
      reason: 'same target'
    }
  ],
  diagnostics: [],
  effects: lifecycleEffects(),
  ...overrides
} as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult)

const createHostResult = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult => ({
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
  result: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult,
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
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

const captureBlockedResult = async(
  source: () => Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult>
): Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult> => {
  try {
    await source()
  } catch (error) {
    expect(error).toBeInstanceOf(
      ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError
    )
    return (error as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError).result
  }
  throw new Error('expected blocked transaction commit connection source')
}

describe('third-party install persistent staging settings-lockfile transaction commit connection source', () => {
  it('is disabled by default and does not read lifecycle or transaction connection hosts', async() => {
    const readInstallPersistentStagingSettingsLockfileLifecyclePipeline = vi.fn()
    const acknowledgeInstallTransactionCommit = vi.fn()
    const source = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource({
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline,
      acknowledgeInstallTransactionCommit
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(result.installPersistentStagingSettingsLockfileLifecyclePipelineStatus).toBeUndefined()
    expect(result.installTransactionCommitConnectionHostStatus).toBeUndefined()
    expect(readInstallPersistentStagingSettingsLockfileLifecyclePipeline).not.toHaveBeenCalled()
    expect(acknowledgeInstallTransactionCommit).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.transactionCommitConnectionAcknowledged).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a matching path-free transaction commit connection after contained writes', async() => {
    const calls: string[] = []
    const acknowledgeInstallTransactionCommit = vi.fn(async envelope => {
      calls.push('transaction-commit-connection')
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
        backedUpFileCount: 1
      })
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('programDirectoryPath' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      return createHostResult()
    })
    const source = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource({
      enabled: true,
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline: async() => {
        calls.push('settings-lockfile-lifecycle')
        return createLifecycleResult()
      },
      acknowledgeInstallTransactionCommit
    })

    const result = await source()

    expect(result.status).toBe('accepted')
    expect(result.readOnly).toBe(false)
    expect(result.installPersistentStagingSettingsLockfileLifecyclePipelineStatus).toBe('ready')
    expect(result.installTransactionCommitConnectionHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.transactionCommitConnectionAcknowledged).toBe(true)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.packageFilePersistentWriteAcknowledged).toBe(true)
    expect(result.effects.installCommandLifecycleAcknowledged).toBe(true)
    expect(result.effects.settingsLockfilePersistentWriterAcknowledged).toBe(true)
    expect(result.effects.transactionCommitConnectionAcknowledged).toBe(true)
    expect(calls).toEqual([
      'settings-lockfile-lifecycle',
      'transaction-commit-connection'
    ])
    expectContainedBoundary(result, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('transactionCommitHost')
    expect(serialized).not.toContain('C:/Users')
    expectJsonGraphFrozen(result)
  })

  it('blocks before transaction connection host when settings-lockfile lifecycle is not ready', async() => {
    const acknowledgeInstallTransactionCommit = vi.fn()
    const source = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource({
      enabled: true,
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline: async() => createLifecycleResult({
        status: 'blocked',
        commandContinuationAllowed: false,
        uiIpcResultContinuationAllowed: false,
        persistentPackageWriteExecuted: false,
        persistentSettingsLockfileWriteExecuted: false,
        writtenFileCount: 0,
        backedUpFileCount: 0,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.blocked',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
            recovery: 'retry'
          } as never
        ],
        effects: lifecycleEffects({
          packageFilePersistentWriteAcknowledged: false,
          installCommandLifecycleAcknowledged: false,
          settingsLockfilePersistentWriterAcknowledged: false,
          commandDispatched: false,
          atomicCommitExecutorAcknowledged: false,
          postCommitVerificationAcknowledged: false,
          persistentReadProofAcknowledged: false,
          commandContinuationAllowed: false,
          uiIpcResultContinuationAllowed: false,
          packageFilesWritten: false,
          packageBackupsWritten: false,
          settingsWritten: false,
          lockfileWritten: false
        })
      }),
      acknowledgeInstallTransactionCommit
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(true)
    expect(result.installPersistentStagingSettingsLockfileLifecyclePipelineStatus).toBe('blocked')
    expect(result.installTransactionCommitConnectionHostStatus).toBeUndefined()
    expect(acknowledgeInstallTransactionCommit).not.toHaveBeenCalled()
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.blocked',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.lifecycle-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('manifest.json')
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe transaction connection drift without exposing host paths', async() => {
    const source = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource({
      enabled: true,
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline: async() => createLifecycleResult(),
      acknowledgeInstallTransactionCommit: async() => createHostResult({
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
            stage: 'third-party.install-transaction-commit-connection-host.drift',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId: otherPackageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/transaction.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...hostEffects(),
          transactionCommitted: true
        } as never
      } as never)
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(false)
    expect(result.installPersistentStagingSettingsLockfileLifecyclePipelineStatus).toBe('ready')
    expect(result.installTransactionCommitConnectionHostStatus).toBe('accepted')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'transaction-commit-connection-accepted',
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
        id: 'contained-effects-intact',
        status: 'blocked'
      })
    ]))
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.install-transaction-commit-connection-host.drift',
        packageId: otherPackageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.unsafe-connection-host-result',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.connection-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('transaction.json')
    expectJsonGraphFrozen(result)
  })
})
