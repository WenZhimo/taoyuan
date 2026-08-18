import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitPersistentReadWriteConnectionEffectSummary,
  ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadWriteConnectionSource'
import {
  createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_MODE,
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError,
  type ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceEffectSummary,
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'

const packageId = 'sample_pack' as PackageId
const otherPackageId = 'other_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const otherCandidateIdentity: ThirdPartyCandidateIdentitySummary = {
  ...candidateIdentity,
  candidateHash: testHash('e')
}

const lockfileHash = testHash('d')

const summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const postCommitEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionEffectSummary => ({
  postCommitPersistentReadWriteConnectionSourceCalled: true,
  transactionCommitConnectionSourceCalled: true,
  postCommitPersistentReadWriteConnectionHostCalled: true,
  postCommitPersistentReadWriteConnectionHostAccepted: true,
  transactionCommitConnectionAcknowledged: true,
  postCommitPersistentReadWriteConnectionAcknowledged: true,
  packageFilePersistentWriteAcknowledged: true,
  settingsLockfilePersistentWriterAcknowledged: true,
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

const uiIpcEffects = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  overrides: Record<string, unknown> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceEffectSummary => ({
  uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: true,
  selectedPlatformHandoffSourceCalled: true,
  selectedPlatformHandoffAccepted: true,
  deliveryAcknowledgementConverged: true,
  startupGateContinuationAllowed: true,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  electronIpcExposed: false,
  electronIpcResponseSent: platform === 'electron',
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: platform === 'web',
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: platform === 'android',
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: true,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
  uiIpcResponseDelivered: true,
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
  electronResponseDeliveryAcknowledgementConsumed: platform === 'electron',
  webResponseDeliveryAcknowledgementConsumed: platform === 'web',
  androidResponseDeliveryAcknowledgementConsumed: platform === 'android',
  startupGateHandoffPreflightConsumed: true,
  responseDeliveryStartupGateHandoffPrepared: true,
  ...overrides
} as ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceEffectSummary)

const createPostCommitSource = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult> = {}
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult => ({
  kind: 'third-party-post-commit-persistent-read-write-connection-source',
  mode: 'default-disabled-post-commit-persistent-read-write-connection-source',
  status: 'accepted',
  reason: 'post-commit persistent read/write connection accepted',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  transactionCommitConnectionSourceStatus: 'accepted',
  postCommitPersistentReadWriteConnectionHostStatus: 'accepted',
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
  persistentSettingsLockfileWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  transactionCommitConnectionAcknowledged: true,
  postCommitPersistentReadWriteConnectionAcknowledged: true,
  checks: [
    {
      id: 'contained-read-write-effects-intact',
      status: 'satisfied',
      reason: 'contained effects intact'
    }
  ],
  diagnostics: [],
  effects: postCommitEffects(),
  ...overrides
})

const createUiIpcSource = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform = 'web',
  overrides: Partial<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult => ({
  kind: 'third-party-ui-ipc-response-delivery-acknowledgement-convergence-source',
  mode: 'default-disabled-ui-ipc-response-delivery-acknowledgement-convergence-source',
  selectedPlatform: platform,
  status: 'ready',
  reason: 'UI/IPC response delivery acknowledgement converged',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  startupGateContinuationAllowed: true,
  platformSourceStatus: 'ready',
  platformResponseDeliveryStatus: 'delivered',
  startupGateHandoffPreflightStatus: 'deferred',
  platformResponseDelivered: true,
  deliveryAcknowledgementConsumed: true,
  startupGateHandoffPreflightConsumed: true,
  responseDeliveryStartupGateHandoffPrepared: true,
  startupGateHandoffAllowed: false,
  launcherAppAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  saveReadAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  deliveryAcknowledgementAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  envelopeKind: 'success',
  messageKey: 'mods.ui.ipc.result.install.success',
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  deliveryEnvelopeSummary: {
    formatVersion: 1,
    kind: 'success',
    commandId: 'install',
    packageId,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    messageKey: 'mods.ui.ipc.result.install.success',
    recovery: 'none',
    retryable: false,
    rollbackRequired: false,
    summary,
    diagnosticCount: 0
  },
  acknowledgement: {
    status: 'acknowledged',
    channel: platform === 'electron'
      ? 'electron-preload-response-channel'
      : platform === 'android'
        ? 'android-native-response-event-sink'
        : 'web-ui-response-event-sink',
    packageId,
    envelopeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success'
  },
  checks: [
    {
      id: `${platform}-response-delivery-delivered`,
      status: 'satisfied',
      reason: `${platform} response delivery was delivered`
    }
  ],
  diagnostics: [],
  summary,
  effects: uiIpcEffects(platform),
  ...overrides
})

const createSkippedPostCommitSource = (): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult =>
  createPostCommitSource({
    status: 'skipped',
    reason: 'post-commit source disabled',
    readOnly: true,
    sourceCalled: false,
    commandContinuationAllowed: false,
    uiIpcResultContinuationAllowed: false,
    requestedCommandId: undefined,
    targetPackageId: undefined,
    selectedPackageIds: [],
    blockedCandidatePaths: [],
    loadOrder: [],
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    candidateIdentity: undefined,
    candidateHash: undefined,
    lockfileHash: undefined,
    persistentPackageWriteExecuted: false,
    persistentSettingsLockfileWriteExecuted: false,
    writtenFileCount: 0,
    backedUpFileCount: 0,
    transactionCommitConnectionAcknowledged: false,
    postCommitPersistentReadWriteConnectionAcknowledged: false,
    effects: postCommitEffects({
      postCommitPersistentReadWriteConnectionHostAccepted: false,
      transactionCommitConnectionAcknowledged: false,
      postCommitPersistentReadWriteConnectionAcknowledged: false,
      packageFilePersistentWriteAcknowledged: false,
      settingsLockfilePersistentWriterAcknowledged: false,
      appBootstrapContinuationAllowed: true,
      commandContinuationAllowed: false,
      uiIpcResultContinuationAllowed: false,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      settingsWritten: false,
      lockfileWritten: false
    })
  })

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrPersistentDrift = (
  result: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult,
  ready: boolean,
  containedWrites: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.uiIpcResponseDelivered).toBe(ready)
  expect(result.effects.packageFilesWritten).toBe(containedWrites)
  expect(result.effects.settingsWritten).toBe(containedWrites)
  expect(result.effects.lockfileWritten).toBe(containedWrites)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveRead).toBe(false)
  expect(result.effects.saveCacheIsolationChecked).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect('postCommitPersistentReadWriteConnectionSource' in result).toBe(false)
  expect('uiIpcResponseDeliveryAcknowledgementConvergenceSource' in result).toBe(false)
  expect('deliveryEnvelope' in result).toBe(false)
  expect('candidateRegistrySet' in result).toBe(false)
  expect('webHost' in result).toBe(false)
  expect('window' in result).toBe(false)
}

const captureBlockedResult = async(
  source: () => Promise<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>
): Promise<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult> => {
  try {
    await source()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError)
    return (error as ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError).result
  }
  throw new Error('expected blocked post-commit UI/IPC delivery continuation source')
}

describe('third-party post-commit UI/IPC delivery continuation source', () => {
  it('is disabled by default and does not read post-commit or UI/IPC sources', async() => {
    const readPostCommitPersistentReadWriteConnectionSource = vi.fn()
    const readUiIpcResponseDeliveryAcknowledgementConvergenceSource = vi.fn()
    const source = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource({
      readPostCommitPersistentReadWriteConnectionSource,
      readUiIpcResponseDeliveryAcknowledgementConvergenceSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(readPostCommitPersistentReadWriteConnectionSource).not.toHaveBeenCalled()
    expect(readUiIpcResponseDeliveryAcknowledgementConvergenceSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('skips downstream UI/IPC delivery when post-commit read/write is skipped', async() => {
    const readPostCommitPersistentReadWriteConnectionSource = vi.fn(async() => createSkippedPostCommitSource())
    const readUiIpcResponseDeliveryAcknowledgementConvergenceSource = vi.fn()
    const source = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource({
      enabled: true,
      readPostCommitPersistentReadWriteConnectionSource,
      readUiIpcResponseDeliveryAcknowledgementConvergenceSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.postCommitPersistentReadWriteConnectionStatus).toBe('skipped')
    expect(result.uiIpcResponseDeliveryAcknowledgementConvergenceStatus).toBeUndefined()
    expect(readPostCommitPersistentReadWriteConnectionSource).toHaveBeenCalledOnce()
    expect(readUiIpcResponseDeliveryAcknowledgementConvergenceSource).not.toHaveBeenCalled()
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('converges post-commit read/write and UI/IPC delivery acknowledgements for the same install target', async() => {
    const readPostCommitPersistentReadWriteConnectionSource = vi.fn(async() => createPostCommitSource())
    const readUiIpcResponseDeliveryAcknowledgementConvergenceSource = vi.fn(async() => createUiIpcSource('web'))
    const source = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource({
      enabled: true,
      readPostCommitPersistentReadWriteConnectionSource,
      readUiIpcResponseDeliveryAcknowledgementConvergenceSource
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.readOnly).toBe(false)
    expect(result.postCommitPersistentReadWriteConnectionStatus).toBe('accepted')
    expect(result.uiIpcResponseDeliveryAcknowledgementConvergenceStatus).toBe('ready')
    expect(result.selectedPlatform).toBe('web')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      platform: 'web',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.transactionCommitConnectionAcknowledged).toBe(true)
    expect(result.postCommitPersistentReadWriteConnectionAcknowledged).toBe(true)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(readPostCommitPersistentReadWriteConnectionSource).toHaveBeenCalledOnce()
    expect(readUiIpcResponseDeliveryAcknowledgementConvergenceSource).toHaveBeenCalledOnce()
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.webFilePickerOpened).toBe(false)
    expect(result.effects.electronIpcExposed).toBe(false)
    expect(result.effects.runtimeEnablementAllowed).toBe(false)
    expectNoRuntimeOrPersistentDrift(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks mismatched candidate identity before allowing continuation', async() => {
    const readPostCommitPersistentReadWriteConnectionSource = vi.fn(async() => createPostCommitSource())
    const readUiIpcResponseDeliveryAcknowledgementConvergenceSource = vi.fn(async() => createUiIpcSource('web', {
      candidateIdentity: otherCandidateIdentity
    }))
    const source = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource({
      enabled: true,
      readPostCommitPersistentReadWriteConnectionSource,
      readUiIpcResponseDeliveryAcknowledgementConvergenceSource
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.checks).toContainEqual(expect.objectContaining({
      id: 'candidate-hash-consistent',
      status: 'blocked'
    }))
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(readPostCommitPersistentReadWriteConnectionSource).toHaveBeenCalledOnce()
    expect(readUiIpcResponseDeliveryAcknowledgementConvergenceSource).toHaveBeenCalledOnce()
    expectNoRuntimeOrPersistentDrift(result, false, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe UI/IPC source drift without exposing platform hosts', async() => {
    const readPostCommitPersistentReadWriteConnectionSource = vi.fn(async() => createPostCommitSource())
    const readUiIpcResponseDeliveryAcknowledgementConvergenceSource = vi.fn(async() => createUiIpcSource('electron', {
      targetPackageId: otherPackageId,
      effects: uiIpcEffects('electron', {
        packageFilesWritten: true
      })
    }))
    const source = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource({
      enabled: true,
      readPostCommitPersistentReadWriteConnectionSource,
      readUiIpcResponseDeliveryAcknowledgementConvergenceSource
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.selectedPlatform).toBe('electron')
    expect(result.checks).toContainEqual(expect.objectContaining({
      id: 'install-target-consistent',
      status: 'blocked'
    }))
    expect(result.checks).toContainEqual(expect.objectContaining({
      id: 'contained-effects-intact',
      status: 'blocked'
    }))
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect('electronHost' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expectJsonGraphFrozen(result)
  })
})
