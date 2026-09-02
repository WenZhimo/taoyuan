import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  bootstrapSharedRendererThirdPartyDataPackStartupGate,
  createThirdPartyDataPackSharedRendererStartupGateBootstrapSource
} from '@/domain/mods/thirdPartyDataPackSharedRendererStartupGateBootstrapSource'
import {
  ThirdPartyDataPackStartupGateBootstrapBlockedError
} from '@/domain/mods/thirdPartyDataPackStartupGateBootstrapSource'
import {
  createThirdPartyStartupGateProductProbeBootstrapSource,
  createThirdPartyStartupPersistentStateProductProbeBootstrapSource
} from '@/runtime/thirdPartyStartupGateProductProbe'
import {
  createInMemoryWebIndexedDbImportPersistenceStore
} from '@/domain/mods/webIndexedDbImportPersistence'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import { getOfficialItemDef } from '@/domain/mods/contentAccess'
import { resetLiveContentRegistryForTests } from '@/domain/mods/liveContentRegistry'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope,
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult,
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const
const lockfileHash = testHash('d')

const readinessEffects = (): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary => ({
  runtimePublicationCommitAppStartupReadinessPipelineCalled: true,
  runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: true,
  runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: true,
  runtimePublicationCommitAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  liveRegistrySwapAcknowledged: true,
  appFactoryBindingAcknowledged: true,
  normalStartupHandoffAcknowledged: true,
  appStartupReadinessAllowed: true,
  appBootstrapContinuationAllowed: true,
  normalStartupContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  realRuntimePublicationCommitCalled: false,
  realNormalStartupHostCalled: false,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: true,
  liveRegistryMutated: true,
  liveRegistrySwapped: true,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: true,
  launcherAppFactoryCalled: false,
  gameAppFactoryCalled: false,
  launcherAppCreated: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  saveRead: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
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

const hostEffects = (): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary => ({
  appStartupHostCalled: true,
  appStartupHostAccepted: true,
  realAppStartupHostCalled: false,
  launcherAppFactoryCalled: false,
  gameAppFactoryCalled: false,
  launcherAppCreated: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  saveRead: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const createReadyAppStartupReadiness = ():
  ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult => ({
    kind: 'third-party-runtime-publication-commit-app-startup-readiness-pipeline',
    mode: 'default-disabled-runtime-publication-commit-app-startup-readiness-pipeline',
    status: 'ready',
    reason: 'app startup readiness is satisfied after live-registry swap and normal-startup app-factory binding',
    readOnly: true,
    runtimeOnly: true,
    persistentWrite: false,
    enabled: true,
    runtimePublicationCommitLiveRegistrySwapHostConnectionSourceCalled: true,
    runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSourceCalled: true,
    appStartupReadinessAllowed: true,
    appBootstrapContinuationAllowed: true,
    normalStartupContinuationAllowed: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
    runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionStatus: 'ready',
    requestedCommandId: 'install',
    targetPackageId: packageId,
    selectedPackageIds: [packageId],
    blockedPackageIds: [],
    loadOrder: [packageId],
    registryCount: 55,
    entryCount: 4243,
    packageCount: 1,
    candidateIdentity,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    checks: [],
    diagnostics: [],
    effects: readinessEffects()
  } as unknown as ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult)

const createAcceptedHostAcknowledgement = (
  envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult => ({
  status: 'accepted',
  platform: envelope.platform,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateIdentity: envelope.candidateIdentity,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  appStartupReadinessAccepted: true,
  diagnostics: [],
  effects: hostEffects()
})

const createAcceptedAppStartupHostConnection = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult => ({
  kind: 'third-party-runtime-publication-commit-app-startup-host-connection-pipeline',
  mode: 'default-disabled-runtime-publication-commit-app-startup-host-connection-pipeline',
  platform: 'web',
  status: 'accepted',
  reason: 'app startup host connection accepted a Web/Electron path-free host acknowledgement after app-startup readiness',
  readOnly: true,
  runtimeOnly: true,
  persistentWrite: false,
  enabled: true,
  runtimePublicationCommitAppStartupReadinessSourceCalled: true,
  appStartupHostConnectionCalled: true,
  appStartupReadinessStatus: 'ready',
  appStartupHostStatus: 'accepted',
  appStartupReadinessAllowed: true,
  appStartupHostWiringAllowed: true,
  appBootstrapContinuationAllowed: true,
  normalStartupContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  checks: [],
  diagnostics: [],
  effects: {
    runtimePublicationCommitAppStartupHostConnectionPipelineCalled: true,
    runtimePublicationCommitAppStartupReadinessPipelineCalled: true,
    injectedAppStartupHostCalled: true,
    appStartupHostCalled: true,
    appStartupHostAccepted: true,
    runtimePublicationCommitAcknowledged: true,
    postCommitVerificationAcknowledged: true,
    liveRegistrySwapAcknowledged: true,
    appFactoryBindingAcknowledged: true,
    normalStartupHandoffAcknowledged: true,
    appStartupReadinessAcknowledged: true,
    appStartupHostWiringAllowed: true,
    appBootstrapContinuationAllowed: true,
    normalStartupContinuationAllowed: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    realAppStartupHostCalled: false,
    realRuntimePublicationCommitCalled: false,
    realNormalStartupHostCalled: false,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: true,
    liveRegistryMutated: true,
    liveRegistrySwapped: true,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: true,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
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
} as unknown as ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult)

describe('third-party shared renderer startup gate bootstrap source', () => {
  afterEach(() => {
    resetLiveContentRegistryForTests()
  })

  it('keeps the shared renderer startup gate disabled by default', async() => {
    const result = await bootstrapSharedRendererThirdPartyDataPackStartupGate()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(false)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.piniaCreated).toBe(false)
    expect(result.effects.routerMounted).toBe(false)
    expect(result.effects.saveRead).toBe(false)
  })

  it('routes enabled shared renderer startup through the app-startup host connection reader', async() => {
    const readRuntimePublicationCommitAppStartupHostConnection = vi.fn(async() =>
      createAcceptedAppStartupHostConnection())
    const readStartupGatePersistentStateSource = vi.fn()
    const readAppFactoryBindingSource = vi.fn()
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        readRuntimePublicationCommitAppStartupHostConnection,
        readStartupGatePersistentStateSource,
        readAppFactoryBindingSource
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(readRuntimePublicationCommitAppStartupHostConnection).toHaveBeenCalledOnce()
    expect(readStartupGatePersistentStateSource).not.toHaveBeenCalled()
    expect(readAppFactoryBindingSource).not.toHaveBeenCalled()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.piniaCreated).toBe(false)
    expect(result.effects.routerMounted).toBe(false)
    expect(result.effects.saveRead).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
  })

  it('composes the real app-startup host connection pipeline for enabled shared renderer startup', async() => {
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn(async() => createReadyAppStartupReadiness())
    const acknowledgeAppStartupHostWiring = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.platform).toBe('web')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('gameAppFactory' in envelope).toBe(false)
      expect('pinia' in envelope).toBe(false)
      expect('router' in envelope).toBe(false)
      return createAcceptedHostAcknowledgement(envelope)
    })
    const readStartupGatePersistentStateSource = vi.fn()
    const readAppFactoryBindingSource = vi.fn()
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        platform: 'web',
        readRuntimePublicationCommitAppStartupReadiness,
        acknowledgeAppStartupHostWiring,
        readStartupGatePersistentStateSource,
        readAppFactoryBindingSource
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(readRuntimePublicationCommitAppStartupReadiness).toHaveBeenCalledOnce()
    expect(acknowledgeAppStartupHostWiring).toHaveBeenCalledOnce()
    expect(readStartupGatePersistentStateSource).not.toHaveBeenCalled()
    expect(readAppFactoryBindingSource).not.toHaveBeenCalled()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.piniaCreated).toBe(false)
    expect(result.effects.routerMounted).toBe(false)
    expect(result.effects.saveRead).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(JSON.stringify(result)).not.toContain('candidateRegistrySet')
    expect(JSON.stringify(result)).not.toContain('C:/Users')
  })

  it('infers Electron app-startup host platform from a renderer preload host', async() => {
    const runtimeHost = {
      electronAPI: {
        deliverThirdPartyDataPackResponse: vi.fn()
      }
    }
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn(async() => createReadyAppStartupReadiness())
    const acknowledgeAppStartupHostWiring = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope
    ) => {
      expect(envelope.platform).toBe('electron')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('runtimeHost' in envelope).toBe(false)
      expect('electronAPI' in envelope).toBe(false)
      return createAcceptedHostAcknowledgement(envelope)
    })
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        runtimeHost,
        readRuntimePublicationCommitAppStartupReadiness,
        acknowledgeAppStartupHostWiring
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(readRuntimePublicationCommitAppStartupReadiness).toHaveBeenCalledOnce()
    expect(acknowledgeAppStartupHostWiring).toHaveBeenCalledOnce()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.piniaCreated).toBe(false)
    expect(result.effects.routerMounted).toBe(false)
    expect(result.effects.saveRead).toBe(false)
    expect(JSON.stringify(result)).not.toContain('electronAPI')
  })

  it('uses an Electron renderer host acknowledgement when no startup host is injected', async() => {
    const runtimeHost = {
      electronAPI: {
        deliverThirdPartyDataPackResponse: vi.fn()
      }
    }
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn(async() => createReadyAppStartupReadiness())
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        runtimeHost,
        readRuntimePublicationCommitAppStartupReadiness
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(readRuntimePublicationCommitAppStartupReadiness).toHaveBeenCalledOnce()
    expect(runtimeHost.electronAPI.deliverThirdPartyDataPackResponse).not.toHaveBeenCalled()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.commandDispatched).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('runtimeHost')
    expect(serialized).not.toContain('electronAPI')
    expect(serialized).not.toContain('deliverThirdPartyDataPackResponse')
  })

  it('infers Web app-startup host platform from a renderer EventTarget host', async() => {
    const runtimeHost = new EventTarget()
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn(async() => createReadyAppStartupReadiness())
    const acknowledgeAppStartupHostWiring = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope
    ) => {
      expect(envelope.platform).toBe('web')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('runtimeHost' in envelope).toBe(false)
      return createAcceptedHostAcknowledgement(envelope)
    })
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        runtimeHost,
        readRuntimePublicationCommitAppStartupReadiness,
        acknowledgeAppStartupHostWiring
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(readRuntimePublicationCommitAppStartupReadiness).toHaveBeenCalledOnce()
    expect(acknowledgeAppStartupHostWiring).toHaveBeenCalledOnce()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
  })

  it('uses a Web renderer host acknowledgement when no startup host is injected', async() => {
    const runtimeHost = new EventTarget()
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn(async() => createReadyAppStartupReadiness())
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        runtimeHost,
        readRuntimePublicationCommitAppStartupReadiness
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(readRuntimePublicationCommitAppStartupReadiness).toHaveBeenCalledOnce()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.commandDispatched).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('runtimeHost')
    expect(serialized).not.toContain('webTarget')
    expect(serialized).not.toContain('window')
    expect(serialized).not.toContain('document')
  })

  it('uses a Window-like Web renderer host acknowledgement across renderer realms', async() => {
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn(async() => createReadyAppStartupReadiness())
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        runtimeHost: window,
        readRuntimePublicationCommitAppStartupReadiness
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(readRuntimePublicationCommitAppStartupReadiness).toHaveBeenCalledOnce()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.commandDispatched).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('runtimeHost')
    expect(serialized).not.toContain('window')
    expect(serialized).not.toContain('document')
  })

  it('composes the Web product probe app-startup readiness path through the shared live registry', async() => {
    const runtimeHost = new EventTarget()
    const bootstrapThirdPartyStartupGate =
      createThirdPartyStartupGateProductProbeBootstrapSource(runtimeHost)

    const result = await bootstrapThirdPartyStartupGate()

    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4243)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(true)
    expect(getOfficialItemDef('sample_pack:linen_ribbon')?.name.fallback)
      .toBe('sample_pack Startup Gate Linen Ribbon')
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(JSON.stringify(result)).not.toContain('window')
    expect(JSON.stringify(result)).not.toContain('document')
  })

  it('targets the Electron ordinary terminal product profile when requested', async() => {
    const runtimeHost = {
      electronAPI: {
        deliverThirdPartyDataPackResponse: vi.fn()
      }
    }
    const bootstrapThirdPartyStartupGate =
      createThirdPartyStartupGateProductProbeBootstrapSource({
        runtimeHost,
        profile: 'electron-ordinary-terminal'
      })

    const result = await bootstrapThirdPartyStartupGate()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe('product_probe_pack')
    expect(result.selectedPackageIds).toEqual(['product_probe_pack'])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4243)
    expect(result.effects.appStartupHostConnectionSourceCalled).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(true)
    expect(getOfficialItemDef('product_probe_pack:linen_ribbon')?.name.fallback)
      .toBe('product_probe_pack Startup Gate Linen Ribbon')
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('electronAPI')
    expect(serialized).not.toContain('deliverThirdPartyDataPackResponse')
    expect(serialized).not.toContain('C:/Users')
  })

  it('composes the probe-only Web IndexedDB startup persistent state path through shared renderer startup', async() => {
    const runtimeHost = new EventTarget()
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const bootstrapThirdPartyStartupGate =
      createThirdPartyStartupPersistentStateProductProbeBootstrapSource({
        runtimeHost,
        store,
        settingsLockfileStore
      })

    const result = await bootstrapThirdPartyStartupGate()
    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.startupPersistentStateSourceStatus).toBe('ready')
    expect(result.startupPersistentStateSourceHostMode)
      .toBe('web-indexeddb-startup-persistent-state')
    expect(result.startupPersistentStateInjectedSourceHostMode)
      .toBe('web-indexeddb-startup-persistent-state')
    expect(result.appFactoryBindingSourceStatus).toBe('ready')
    expect(result.webResponseDeliveryStartupGateHandoffStatus).toBe('ready')
    expect(result.responseDeliveryStartupGateHandoffPrepared).toBe(true)
    expect(result.webResponseDeliveryAcknowledgementConsumed).toBe(true)
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4243)
    expect(result.persistentStateProofs).toEqual({
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    expect(result.effects.startupPersistentStateSourceCalled).toBe(true)
    expect(result.effects.startupStateSnapshotAccepted).toBe(true)
    expect(result.effects.appFactoryBindingSourceCalled).toBe(true)
    expect(result.effects.appFactoryBindingContinuationAllowed).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('indexedDb')
    expect(serialized).not.toContain('IndexedDB')
    expect(serialized).not.toContain('startup-persistent-state-snapshot.json')
    expect(serialized).not.toContain('window')
    expect(serialized).not.toContain('document')
    expect(serialized).not.toContain('runtimeHost')
  })

  it('composes the installed Electron startup persistent state path through app-startup handoff', async() => {
    const electronPackageId = 'product_probe_pack' as PackageId
    const electronRuntimeHost = new EventTarget()
    const fileTexts = new Map<string, string>([
      [
        'product-probe-pack/manifest.json',
        `${JSON.stringify({
          id: electronPackageId,
          name: { key: `${electronPackageId}.package.name`, fallback: `${electronPackageId} startup gate probe pack` },
          version: '1.0.0',
          gameVersion: '2.4.0',
          engineApiVersion: '1',
          contentSchemaVersion: '1',
          defaultLocale: 'zh-CN',
          locales: { 'zh-CN': 'locales/zh-CN.json' },
          authors: [{ name: 'Startup Gate Product Probe', role: 'developer' }],
          license: 'MIT',
          dependencies: [],
          entrypoints: { 'taoyuan:item': ['data/items.json'] }
        }, null, 2)}\n`
      ],
      [
        'product-probe-pack/data/items.json',
        `${JSON.stringify([
          {
            id: `${electronPackageId}:linen_ribbon`,
            name: {
              key: `${electronPackageId}.item.linen_ribbon.name`,
              fallback: `${electronPackageId} Startup Gate Linen Ribbon`
            },
            category: 'gift',
            description: {
              key: `${electronPackageId}.item.linen_ribbon.description`,
              fallback: 'Runtime-only item used to prove startup gate live registry swap identity.'
            },
            sellPrice: 8,
            edible: false
          }
        ], null, 2)}\n`
      ],
      ['product-probe-pack/locales/zh-CN.json', '{}\n']
    ])
    const directories = new Set([
      '',
      'product-probe-pack',
      'product-probe-pack/data',
      'product-probe-pack/locales'
    ])
    const entryName = (sourcePath: string): string => {
      if (sourcePath === '') return 'mods'
      const parts = sourcePath.split('/')
      return parts[parts.length - 1] ?? sourcePath
    }
    const entryForPath = (sourcePath: string) => {
      if (directories.has(sourcePath)) {
        return { name: entryName(sourcePath), kind: 'directory', isSymbolicLink: false }
      }
      if (fileTexts.has(sourcePath)) {
        return { name: entryName(sourcePath), kind: 'file', isSymbolicLink: false }
      }
      return null
    }
    const listDirectory = (sourcePath: string) => {
      const prefix = sourcePath === '' ? '' : `${sourcePath}/`
      const entries = new Map<string, ReturnType<typeof entryForPath>>()
      for (const directory of directories) {
        if (directory === sourcePath) continue
        if (!directory.startsWith(prefix)) continue
        const remainder = directory.slice(prefix.length)
        if (remainder === '' || remainder.includes('/')) continue
        entries.set(remainder, entryForPath(directory))
      }
      for (const filePath of fileTexts.keys()) {
        if (!filePath.startsWith(prefix)) continue
        const remainder = filePath.slice(prefix.length)
        if (remainder === '' || remainder.includes('/')) continue
        entries.set(remainder, entryForPath(filePath))
      }
      return [...entries.values()].filter(entry => entry !== null)
    }

    Object.defineProperty(electronRuntimeHost, 'electronAPI', {
      enumerable: true,
      value: {
        electronReadonlyDirectorySource: {
          getEntry: vi.fn(async(sourcePath: string) => ({
            ok: true,
            value: entryForPath(sourcePath)
          })),
          readDirectory: vi.fn(async(sourcePath: string) => ({
            ok: true,
            value: listDirectory(sourcePath)
          })),
          readTextFile: vi.fn(async(sourcePath: string) => ({
            ok: true,
            value: fileTexts.get(sourcePath) ?? ''
          }))
        },
        readThirdPartyDataPackStartupPersistentState: vi.fn(async(request: {
          readonly packageId: PackageId
          readonly candidateIdentity: typeof candidateIdentity
          readonly lockfileHash: Sha256Hash
        }) => ({
          kind: 'startup-persistent-state-snapshot',
          settled: true,
          packageId: request.packageId,
          candidateIdentity: request.candidateIdentity,
          lockfileHash: request.lockfileHash,
          transactionLogCommitted: true,
          packageStateMatched: true,
          settingsStateMatched: true,
          modLockStateMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        }))
      }
    })
    const bootstrapThirdPartyStartupGate =
      createThirdPartyStartupPersistentStateProductProbeBootstrapSource({
        runtimeHost: electronRuntimeHost,
        profile: 'electron-ordinary-terminal',
        sourceKind: 'electron-program-directory-userdata'
      })

    const result = await bootstrapThirdPartyStartupGate()

    expect(result.status).toBe('ready')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.startupPersistentStateSourceStatus).toBe('ready')
    expect(result.startupPersistentStateSourceKind).toBe('electron-program-directory-userdata')
    expect(result.startupPersistentStateSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(result.startupPersistentStateInjectedSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(result.targetPackageId).toBe(electronPackageId)
    expect(result.selectedPackageIds).toEqual([electronPackageId])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4243)
    expect(result.effects.startupPersistentStateSourceCalled).toBe(true)
    expect(result.effects.startupStateSnapshotAccepted).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(true)
    expect(result.effects.runtimePublicationCommitted).toBe(true)
    expect(getOfficialItemDef('product_probe_pack:linen_ribbon')?.name.fallback)
      .toBe('product_probe_pack Startup Gate Linen Ribbon')
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('electronAPI')
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('startup-persistent-state-snapshot.json')
  })

  it('does not read accessor-backed renderer host fields while resolving the startup platform', async() => {
    let getterRead = false
    const runtimeHost = {}
    Object.defineProperty(runtimeHost, 'electronAPI', {
      enumerable: true,
      get() {
        getterRead = true
        throw new Error('C:/Users/LENOVO/hostile-shared-renderer-electron-api')
      }
    })
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn()
    const bootstrapThirdPartyStartupGate =
      createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
        enabled: true,
        runtimeHost,
        readRuntimePublicationCommitAppStartupReadiness
      })

    await expect(bootstrapThirdPartyStartupGate()).rejects.toBeInstanceOf(
      ThirdPartyDataPackStartupGateBootstrapBlockedError
    )

    try {
      await bootstrapThirdPartyStartupGate()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackStartupGateBootstrapBlockedError)
      const result = (error as ThirdPartyDataPackStartupGateBootstrapBlockedError).result
      expect(getterRead).toBe(false)
      expect(readRuntimePublicationCommitAppStartupReadiness).not.toHaveBeenCalled()
      expect(result.status).toBe('blocked')
      expect(result.appBootstrapContinuationAllowed).toBe(false)
      expect(result.appStartupHostConnectionSourceStatus).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.startup-gate-bootstrap-source.unsafe-app-startup-host-connection-source'
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('electronAPI')
    }
  })
})
