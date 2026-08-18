import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline'
import {
  type ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope,
  type ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult,
  type ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackAndroidPlatformWriterHostConnectionSource'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import type {
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfilePersistentWriterSource'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const writeProbeEvidence = {
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  modLockPersistentWriteExecuted: true,
  transactionLogPersistentWriteExecuted: true
} as const

const commitEffects = (
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
  writeProbeEvidence,
  diagnostics: [],
  effects: commitEffects(),
  ...overrides
} as ThirdPartyDataPackSettingsLockfileCommitSourceResult)

const writerEffects = (
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

const createWriterResult = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult => ({
  status: 'written',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
  settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  diagnostics: [],
  effects: writerEffects(),
  ...overrides
})

const createAcceptedAndroidHostResult = (
  envelope: ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope,
  overrides: Partial<ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult> = {}
): ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult => ({
  status: 'accepted',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  androidRequirementIds: envelope.androidRequirementIds,
  diagnostics: [],
  effects: {
    androidPlatformWriterHostCalled: true,
    androidPlatformWriterHostAccepted: true,
    androidPlatformWriterConnected: true,
    androidAppDataStorageResolved: true,
    androidNativeBridgeEnvelopeExposed: false,
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
    diagnosticsWritten: false
  },
  ...overrides
})

const expectContainedPipelineEffects = (
  result: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult,
  connected: boolean,
  upstreamWrites: boolean,
  continuationAllowed = true
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.androidPlatformWriterConnected).toBe(connected)
  expect(result.effects.androidAppDataStorageResolved).toBe(connected)
  expect(result.effects.androidPlatformWriterHostAccepted).toBe(connected)
  expect(result.effects.realAndroidPlatformWriterHostCalled).toBe(false)
  expect(result.effects.androidNativeBridgeEnvelopeExposed).toBe(false)
  expect(result.effects.settingsWritten).toBe(upstreamWrites)
  expect(result.effects.lockfileWritten).toBe(upstreamWrites)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

describe('third-party Android platform writer host connection pipeline', () => {
  it('is disabled by default and does not call commit readers, persistent writers or platform hosts', async() => {
    const readSettingsLockfileCommitSource = vi.fn()
    const writeSettingsLockfile = vi.fn()
    const connectAndroidPlatformWriterHost = vi.fn()
    const pipeline = createThirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline({
      readSettingsLockfileCommitSource,
      writeSettingsLockfile,
      connectAndroidPlatformWriterHost
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(writeSettingsLockfile).not.toHaveBeenCalled()
    expect(connectAndroidPlatformWriterHost).not.toHaveBeenCalled()
    expectContainedPipelineEffects(result, false, false)
    expectJsonGraphFrozen(result)
  })

  it('keeps Android writer pipeline skipped under vanilla-only scope without touching writers or hosts', async() => {
    const readSettingsLockfileCommitSource = vi.fn(async() => createAcceptedCommitResult())
    const writeSettingsLockfile = vi.fn(async(
      envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
    ) => {
      return createWriterResult(envelope)
    })
    const connectAndroidPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope
    ) => {
      return createAcceptedAndroidHostResult(envelope)
    })
    const pipeline = createThirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource,
      writeSettingsLockfile,
      connectAndroidPlatformWriterHost
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.androidPlatformWriterAdapterPreflightStatus).toBeUndefined()
    expect(result.androidPlatformWriterHostStatus).toBeUndefined()
    expect(result.targetPackageId).toBeUndefined()
    expect(result.candidateIdentity).toBeUndefined()
    expect(result.lockfileHash).toBeUndefined()
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(writeSettingsLockfile).not.toHaveBeenCalled()
    expect(connectAndroidPlatformWriterHost).not.toHaveBeenCalled()
    expectContainedPipelineEffects(result, false, false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('appDataDirectory')
    expect(serialized).not.toContain('content://')
    expect(serialized).not.toContain('"androidNativeBridge":')
    expectJsonGraphFrozen(result)
  })

  it('does not enter Android persistent writer path even if an injected writer would reject', async() => {
    const readSettingsLockfileCommitSource = vi.fn(async() => createAcceptedCommitResult())
    const writeSettingsLockfile = vi.fn(async(
      envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
    ) => createWriterResult(envelope, {
      blockedPackageIds: [blockedPackageId],
      effects: writerEffects({
        cacheWritten: true
      } as never)
    }))
    const connectAndroidPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope
    ) => createAcceptedAndroidHostResult(envelope))
    const pipeline = createThirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource,
      writeSettingsLockfile,
      connectAndroidPlatformWriterHost
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.androidPlatformWriterAdapterPreflightStatus).toBeUndefined()
    expect(result.commandContinuationAllowed).toBe(true)
    expectContainedPipelineEffects(result, false, false)
    expect(JSON.stringify(result)).not.toContain('appDataDirectory')
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(writeSettingsLockfile).not.toHaveBeenCalled()
    expect(connectAndroidPlatformWriterHost).not.toHaveBeenCalled()
  })
})
