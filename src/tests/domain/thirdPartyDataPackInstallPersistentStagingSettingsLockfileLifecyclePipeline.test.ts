import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingLifecyclePipeline'
import type {
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import type {
  ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
} from '@/domain/mods/thirdPartyDataPackPackageFilePersistentStagingPipeline'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import {
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline,
  type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'
import type {
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult,
  ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfilePersistentWriterSource'

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

const packageStagingEffects = (
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

const installCommandEffects = (
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

const lifecycleEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult['effects']> = {}
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult['effects'] => ({
  installPersistentStagingLifecyclePipelineCalled: true,
  packageFilePersistentStagingPipelineCalled: true,
  installCommandLifecyclePipelineCalled: true,
  packageFilePersistentWriteAcknowledged: true,
  installCommandLifecycleAcknowledged: true,
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

const settingsCommitEffects = (
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

const settingsWriterEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult['effects']> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult['effects'] => ({
  settingsLockfilePersistentWriterSourceCalled: true,
  settingsLockfileCommitSourceCalled: true,
  injectedSettingsLockfilePersistentWriterHostCalled: true,
  settingsLockfilePersistentWriterHostCalled: true,
  settingsLockfilePersistentWriterHostWritten: true,
  realSettingsLockfilePersistentWriterHostCalled: false,
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

const writerHostEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary => ({
  settingsLockfilePersistentWriterHostCalled: true,
  settingsLockfilePersistentWriterHostWritten: true,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
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

const createPackageStagingResult = (
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
  writtenFiles: [],
  diagnostics: [],
  effects: packageStagingEffects(),
  ...overrides
} as ThirdPartyDataPackPackageFilePersistentStagingPipelineResult)

const createInstallCommandResult = (
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
  effects: installCommandEffects(),
  ...overrides
} as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult)

const createLifecycleResult = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult> = {}
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult => ({
  kind: 'third-party-install-persistent-staging-lifecycle-pipeline',
  mode: 'default-disabled-install-persistent-staging-lifecycle-pipeline',
  status: 'ready',
  reason: 'third-party install persistent staging lifecycle accepted matching package-file writes and install command acknowledgement',
  readOnly: false,
  enabled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  packageFilePersistentStagingPipelineStatus: 'written',
  installCommandLifecyclePipelineStatus: 'ready',
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
  persistentWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  verificationOutcomeKind: 'verified',
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
} as ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult)

const createAcceptedCommitResult = (
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
  effects: settingsCommitEffects(),
  ...overrides
} as ThirdPartyDataPackSettingsLockfileCommitSourceResult)

const createWriterHostResult = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult => ({
  status: 'written',
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
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  modLockPersistentWriteExecuted: true,
  transactionLogPersistentWriteExecuted: true,
  diagnostics: [],
  effects: writerHostEffects(),
  ...overrides
})

const createSettingsWriterResult = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult => ({
  kind: 'third-party-settings-lockfile-persistent-writer-source',
  mode: 'default-disabled-settings-lockfile-persistent-writer-source',
  status: 'written',
  reason: 'third-party settings-lockfile persistent writer source accepted an injected contained writer result',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  settingsLockfileCommitSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
  settingsLockfilePersistentWriterHostStatus: 'written',
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
  effects: settingsWriterEffects(),
  ...overrides
} as ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectContainedBoundary = (
  result: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult,
  ready: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.commandContinuationAllowed).toBe(ready)
  expect(result.effects.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.packageFilesWritten).toBe(true)
  expect(result.effects.packageBackupsWritten).toBe(true)
  expect(result.effects.settingsWritten).toBe(true)
  expect(result.effects.lockfileWritten).toBe(true)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party install persistent staging settings-lockfile lifecycle pipeline', () => {
  it('is disabled by default and does not read lifecycle or writer sources', async() => {
    const readInstallPersistentStagingLifecyclePipeline = vi.fn()
    const readSettingsLockfilePersistentWriterSource = vi.fn()
    const pipeline = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      readInstallPersistentStagingLifecyclePipeline,
      readSettingsLockfilePersistentWriterSource
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBeUndefined()
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBeUndefined()
    expect(readInstallPersistentStagingLifecyclePipeline).not.toHaveBeenCalled()
    expect(readSettingsLockfilePersistentWriterSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.effects.installPersistentStagingLifecyclePipelineCalled).toBe(false)
    expect(result.effects.settingsLockfilePersistentWriterSourceCalled).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('requires install persistent staging before contained settings-lockfile writer continuation', async() => {
    const calls: string[] = []
    const readInstallPersistentStagingLifecyclePipeline = vi.fn(async() => {
      calls.push('install-persistent-staging-lifecycle')
      return createLifecycleResult()
    })
    const readSettingsLockfilePersistentWriterSource = vi.fn(async() => {
      calls.push('settings-lockfile-persistent-writer')
      return createSettingsWriterResult()
    })
    const pipeline = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      enabled: true,
      readInstallPersistentStagingLifecyclePipeline,
      readSettingsLockfilePersistentWriterSource
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.readOnly).toBe(false)
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBe('ready')
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.writtenFileCount).toBe(2)
    expect(result.backedUpFileCount).toBe(1)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.packageFilePersistentWriteAcknowledged).toBe(true)
    expect(result.effects.installCommandLifecycleAcknowledged).toBe(true)
    expect(result.effects.settingsLockfilePersistentWriterAcknowledged).toBe(true)
    expect(result.effects.commandDispatched).toBe(true)
    expect(calls).toEqual([
      'install-persistent-staging-lifecycle',
      'settings-lockfile-persistent-writer'
    ])
    expectContainedBoundary(result, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('settingsWriter')
    expect(serialized).not.toContain('C:/Users')
    expectJsonGraphFrozen(result)
  })

  it('keeps explicit lifecycle and writer readers ahead of composed lower inputs', async() => {
    const readInstallPersistentStagingLifecyclePipeline = vi.fn(async() => createLifecycleResult())
    const readSettingsLockfilePersistentWriterSource = vi.fn(async() => createSettingsWriterResult())
    const readPackageFilePersistentStagingPipeline = vi.fn(async() => createPackageStagingResult())
    const readInstallCommandLifecyclePipeline = vi.fn(async() => createInstallCommandResult())
    const readSettingsLockfileCommitSource = vi.fn(async() => createAcceptedCommitResult())
    const writeSettingsLockfile = vi.fn(async() => createWriterHostResult())
    const pipeline = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      enabled: true,
      readInstallPersistentStagingLifecyclePipeline,
      readSettingsLockfilePersistentWriterSource,
      readPackageFilePersistentStagingPipeline,
      readInstallCommandLifecyclePipeline,
      readSettingsLockfileCommitSource,
      writeSettingsLockfile
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(readInstallPersistentStagingLifecyclePipeline).toHaveBeenCalledOnce()
    expect(readSettingsLockfilePersistentWriterSource).toHaveBeenCalledOnce()
    expect(readPackageFilePersistentStagingPipeline).not.toHaveBeenCalled()
    expect(readInstallCommandLifecyclePipeline).not.toHaveBeenCalled()
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(writeSettingsLockfile).not.toHaveBeenCalled()
    expectContainedBoundary(result, true)
    expectJsonGraphFrozen(result)
  })

  it('composes lower package staging, install command lifecycle and settings-lockfile writer inputs', async() => {
    const calls: string[] = []
    const readPackageFilePersistentStagingPipeline = vi.fn(async() => {
      calls.push('package-file-persistent-staging')
      return createPackageStagingResult()
    })
    const readInstallCommandLifecyclePipeline = vi.fn(async() => {
      calls.push('install-command-lifecycle')
      return createInstallCommandResult()
    })
    const readSettingsLockfileCommitSource = vi.fn(async() => {
      calls.push('settings-lockfile-commit-source')
      return createAcceptedCommitResult()
    })
    const writeSettingsLockfile = vi.fn(async envelope => {
      calls.push('settings-lockfile-persistent-writer')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('settingsWriter' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return createWriterHostResult()
    })
    const pipeline = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      enabled: true,
      readPackageFilePersistentStagingPipeline,
      readInstallCommandLifecyclePipeline,
      readSettingsLockfileCommitSource,
      writeSettingsLockfile
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBe('ready')
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.effects.packageFilePersistentWriteAcknowledged).toBe(true)
    expect(result.effects.installCommandLifecycleAcknowledged).toBe(true)
    expect(result.effects.settingsLockfilePersistentWriterAcknowledged).toBe(true)
    expect(calls).toEqual([
      'package-file-persistent-staging',
      'install-command-lifecycle',
      'settings-lockfile-commit-source',
      'settings-lockfile-persistent-writer'
    ])
    expectContainedBoundary(result, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('settingsWriter')
    expectJsonGraphFrozen(result)
  })

  it('blocks before settings-lockfile writer when install persistent staging is not ready', async() => {
    const readSettingsLockfilePersistentWriterSource = vi.fn()
    const pipeline = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      enabled: true,
      readInstallPersistentStagingLifecyclePipeline: async() => createLifecycleResult({
        status: 'blocked',
        commandContinuationAllowed: false,
        uiIpcResultContinuationAllowed: false,
        persistentWriteExecuted: false,
        writtenFileCount: 0,
        backedUpFileCount: 0,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.install-persistent-staging-lifecycle-pipeline.blocked',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
            recovery: 'retry'
          } as never
        ],
        effects: lifecycleEffects({
          packageFilePersistentWriteAcknowledged: false,
          installCommandLifecycleAcknowledged: false,
          commandDispatched: false,
          atomicCommitExecutorAcknowledged: false,
          postCommitVerificationAcknowledged: false,
          persistentReadProofAcknowledged: false,
          commandContinuationAllowed: false,
          uiIpcResultContinuationAllowed: false,
          packageFilesWritten: false,
          packageBackupsWritten: false
        })
      }),
      readSettingsLockfilePersistentWriterSource
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(true)
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBe('blocked')
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBeUndefined()
    expect(readSettingsLockfilePersistentWriterSource).not.toHaveBeenCalled()
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-lifecycle-pipeline.blocked',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.lifecycle-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('manifest.json')
    expectJsonGraphFrozen(result)
  })

  it('blocks composed lower staging failures before settings-lockfile writer inputs run', async() => {
    const readInstallCommandLifecyclePipeline = vi.fn()
    const readSettingsLockfileCommitSource = vi.fn()
    const writeSettingsLockfile = vi.fn()
    const pipeline = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      enabled: true,
      readPackageFilePersistentStagingPipeline: async() => createPackageStagingResult({
        status: 'deferred',
        packageFilePersistentWriteProbeStatus: 'deferred',
        packageFileWriteProbe: 'deferred',
        writeProbeAllowed: false,
        persistentWriteExecuted: false,
        writtenFileCount: 0,
        backedUpFileCount: 0,
        effects: packageStagingEffects({
          packageFilesWritten: false,
          packageBackupsWritten: false
        })
      }),
      readInstallCommandLifecyclePipeline,
      readSettingsLockfileCommitSource,
      writeSettingsLockfile
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBe('blocked')
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBeUndefined()
    expect(readInstallCommandLifecyclePipeline).not.toHaveBeenCalled()
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(writeSettingsLockfile).not.toHaveBeenCalled()
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-lifecycle-pipeline.staging-blocked',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.lifecycle-blocked',
        packageId
      })
    ]))
    expectJsonGraphFrozen(result)
  })

  it('blocks identity drift after settings-lockfile writer without exposing upstream objects', async() => {
    const pipeline = createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
      enabled: true,
      readInstallPersistentStagingLifecyclePipeline: async() => createLifecycleResult(),
      readSettingsLockfilePersistentWriterSource: async() => createSettingsWriterResult({
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
            stage: 'third-party.settings-lockfile-persistent-writer-source.drift',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId: otherPackageId,
            programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
            recovery: 'retry'
          } as never
        ]
      })
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.readOnly).toBe(false)
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBe('ready')
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('written')
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
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.settings-lockfile-persistent-writer-source.drift',
        packageId: otherPackageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.writer-blocked',
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
