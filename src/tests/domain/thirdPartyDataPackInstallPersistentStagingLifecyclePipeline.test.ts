import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackInstallPersistentStagingLifecyclePipeline,
  type ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingLifecyclePipeline'
import type {
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import type {
  ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
} from '@/domain/mods/thirdPartyDataPackPackageFilePersistentStagingPipeline'

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

const stagingEffects = (
  overrides: Partial<ThirdPartyDataPackPackageFilePersistentStagingPipelineResult['effects']> = {}
): ThirdPartyDataPackPackageFilePersistentStagingPipelineResult['effects'] => ({
  packageFilePersistentStagingPipelineCalled: true,
  packageFileStagingSourceCalled: true,
  atomicCommitPreflightSourceCalled: true,
  packageFilePersistentWriteProbeCalled: true,
  injectedPackageFileStagingHostCalled: true,
  packageFileStagingHostAccepted: true,
  commandContinuationAllowed: true,
  appBootstrapContinuationAllowed: true,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: true,
  packageBackupsWritten: true,
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

const lifecycleEffects = (
  overrides: Partial<ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['effects']> = {}
): ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['effects'] => ({
  installCommandPostCommitAcknowledgementSourceCalled: true,
  transactionCommandDispatcherSourceCalled: true,
  atomicTransactionCommitExecutorSourceCalled: true,
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  commandDispatched: true,
  atomicCommitExecutorAcknowledged: true,
  injectedCommitHostCalled: false,
  realAtomicCommitExecutorCalled: false,
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

const createStagingResult = (
  overrides: Partial<ThirdPartyDataPackPackageFilePersistentStagingPipelineResult> = {}
): ThirdPartyDataPackPackageFilePersistentStagingPipelineResult => ({
  kind: 'third-party-package-file-persistent-staging-pipeline',
  mode: 'default-disabled-package-file-persistent-staging-pipeline',
  status: 'written',
  reason: 'package file staging source accepted a persistent package-file write probe acknowledgement',
  enabled: true,
  packageFileStagingSourceStatus: 'accepted',
  packageFilePersistentWriteProbeStatus: 'written',
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
  packageFileWriteProbe: 'written',
  writeProbeAllowed: true,
  persistentWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  writtenFiles: [
    {
      path: 'manifest.json',
      sha256: testHash('e'),
      bytesWritten: 128,
      backupWritten: true
    },
    {
      path: 'data/items.json',
      sha256: testHash('f'),
      bytesWritten: 256,
      backupWritten: false
    }
  ],
  diagnostics: [],
  effects: stagingEffects(),
  ...overrides
} as ThirdPartyDataPackPackageFilePersistentStagingPipelineResult)

const createLifecycleResult = (
  overrides: Partial<ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult> = {}
): ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult => ({
  kind: 'third-party-install-command-post-commit-acknowledgement-source',
  mode: 'default-disabled-install-command-post-commit-acknowledgement-source',
  status: 'ready',
  reason: 'third-party install command post-commit acknowledgement accepted matching dispatch, commit and verified persistent-read proof',
  readOnly: true,
  enabled: true,
  transactionCommandDispatcherSourceCalled: true,
  atomicTransactionCommitExecutorSourceCalled: true,
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  transactionCommandDispatcherSourceStatus: 'dispatched',
  atomicTransactionCommitExecutorSourceStatus: 'executed',
  postCommitVerificationReadAcknowledgementSourceStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  verificationOutcomeKind: 'verified',
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
  checks: [
    {
      id: 'transaction-command-dispatched',
      status: 'satisfied',
      reason: 'dispatched'
    }
  ],
  diagnostics: [],
  effects: lifecycleEffects(),
  ...overrides
} as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectContainedBoundary = (
  result: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  ready: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.commandContinuationAllowed).toBe(ready)
  expect(result.effects.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.packageFilesWritten).toBe(true)
  expect(result.effects.packageBackupsWritten).toBe(true)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party install persistent staging lifecycle pipeline', () => {
  it('is disabled by default and does not read staging or lifecycle sources', async() => {
    const readPackageFilePersistentStagingPipeline = vi.fn()
    const readInstallCommandLifecyclePipeline = vi.fn()
    const pipeline = createThirdPartyDataPackInstallPersistentStagingLifecyclePipeline({
      readPackageFilePersistentStagingPipeline,
      readInstallCommandLifecyclePipeline
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(result.packageFilePersistentStagingPipelineStatus).toBeUndefined()
    expect(result.installCommandLifecyclePipelineStatus).toBeUndefined()
    expect(readPackageFilePersistentStagingPipeline).not.toHaveBeenCalled()
    expect(readInstallCommandLifecyclePipeline).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.effects.packageFilePersistentStagingPipelineCalled).toBe(false)
    expect(result.effects.installCommandLifecyclePipelineCalled).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('requires persistent package-file staging before install command lifecycle continuation', async() => {
    const calls: string[] = []
    const readPackageFilePersistentStagingPipeline = vi.fn(async() => {
      calls.push('package-file-persistent-staging')
      return createStagingResult()
    })
    const readInstallCommandLifecyclePipeline = vi.fn(async() => {
      calls.push('install-command-lifecycle')
      return createLifecycleResult()
    })
    const pipeline = createThirdPartyDataPackInstallPersistentStagingLifecyclePipeline({
      enabled: true,
      readPackageFilePersistentStagingPipeline,
      readInstallCommandLifecyclePipeline
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.readOnly).toBe(false)
    expect(result.packageFilePersistentStagingPipelineStatus).toBe('written')
    expect(result.installCommandLifecyclePipelineStatus).toBe('ready')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentWriteExecuted).toBe(true)
    expect(result.writtenFileCount).toBe(2)
    expect(result.backedUpFileCount).toBe(1)
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.packageFilePersistentWriteAcknowledged).toBe(true)
    expect(result.effects.installCommandLifecycleAcknowledged).toBe(true)
    expect(result.effects.commandDispatched).toBe(true)
    expect(result.effects.atomicCommitExecutorAcknowledged).toBe(true)
    expect(result.effects.postCommitVerificationAcknowledged).toBe(true)
    expect(result.effects.persistentReadProofAcknowledged).toBe(true)
    expect(calls).toEqual([
      'package-file-persistent-staging',
      'install-command-lifecycle'
    ])
    expectContainedBoundary(result, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('C:/Users')
    expectJsonGraphFrozen(result)
  })

  it('blocks before lifecycle when package-file persistent staging is not written', async() => {
    const readInstallCommandLifecyclePipeline = vi.fn()
    const pipeline = createThirdPartyDataPackInstallPersistentStagingLifecyclePipeline({
      enabled: true,
      readPackageFilePersistentStagingPipeline: async() => createStagingResult({
        status: 'deferred',
        packageFilePersistentWriteProbeStatus: 'deferred',
        packageFileWriteProbe: 'deferred',
        writeProbeAllowed: false,
        persistentWriteExecuted: false,
        writtenFileCount: 0,
        backedUpFileCount: 0,
        writtenFiles: [],
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.package-file-persistent-staging-pipeline.deferred',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
            recovery: 'retry'
          } as never
        ],
        effects: stagingEffects({
          packageFilesWritten: false,
          packageBackupsWritten: false
        })
      }),
      readInstallCommandLifecyclePipeline
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(true)
    expect(result.packageFilePersistentStagingPipelineStatus).toBe('deferred')
    expect(result.installCommandLifecyclePipelineStatus).toBeUndefined()
    expect(readInstallCommandLifecyclePipeline).not.toHaveBeenCalled()
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.package-file-persistent-staging-pipeline.deferred',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-lifecycle-pipeline.staging-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('manifest.json')
    expectJsonGraphFrozen(result)
  })

  it('blocks identity drift after lifecycle without exposing upstream objects', async() => {
    const pipeline = createThirdPartyDataPackInstallPersistentStagingLifecyclePipeline({
      enabled: true,
      readPackageFilePersistentStagingPipeline: async() => createStagingResult(),
      readInstallCommandLifecyclePipeline: async() => createLifecycleResult({
        targetPackageId: otherPackageId,
        selectedPackageIds: [otherPackageId],
        loadOrder: [otherPackageId],
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('9')
        },
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.install-command-lifecycle-pipeline.drift',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId: otherPackageId,
            programDirectoryPath: 'C:/Users/LENOVO/taoyuan',
            recovery: 'retry'
          } as never
        ]
      })
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(false)
    expect(result.packageFilePersistentStagingPipelineStatus).toBe('written')
    expect(result.installCommandLifecyclePipelineStatus).toBe('ready')
    expect(result.checks).toEqual(expect.arrayContaining([
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
      })
    ]))
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.effects.commandDispatched).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.install-command-lifecycle-pipeline.drift',
        packageId: otherPackageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-lifecycle-pipeline.lifecycle-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expectJsonGraphFrozen(result)
  })
})
