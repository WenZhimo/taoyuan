import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSourceResult
} from '@/domain/mods/thirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource,
  THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_MODE,
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError,
  type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource'

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

const platformStatusField = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => `${platform}ResponseDeliveryStatus`

const platformDeliveredField = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => `${platform}ResponseDelivered`

const platformAcknowledgementEffectField = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => `${platform}ResponseDeliveryAcknowledgementConsumed`

const acknowledgementChannel = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => ({
  electron: 'electron-preload-response-channel',
  web: 'web-ui-response-event-sink',
  android: 'android-native-response-event-sink'
})[platform]

const createPlatformEffects = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  prepared: boolean,
  overrides: Record<string, unknown> = {}
) => ({
  [`${platform}ResponseDeliveryStartupGateHandoffSourceCalled`]: true,
  [`${platform}ResponseDeliveryStartupGateHandoffReaderCalled`]: true,
  responseDeliveryStartupGateHandoffAccepted: prepared,
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
  electronIpcResponseSent: platform === 'electron' && prepared,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: platform === 'web' && prepared,
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: platform === 'android' && prepared,
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
  successEnvelopeDelivered: prepared,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
  uiIpcResponseDelivered: prepared,
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
  [platformAcknowledgementEffectField(platform)]: prepared,
  startupGateHandoffPreflightConsumed: prepared,
  responseDeliveryStartupGateHandoffPrepared: prepared,
  ...overrides
})

const createPlatformSource = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  overrides: Record<string, unknown> = {}
) => ({
  kind: `third-party-${platform}-response-delivery-startup-gate-handoff-source`,
  mode: `default-disabled-${platform}-response-delivery-startup-gate-handoff-source`,
  platform,
  status: 'ready',
  reason: `${platform} response delivery acknowledgement is connected to startup gate handoff evidence`,
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  startupGateContinuationAllowed: true,
  sourceHandoffStatus: 'ready',
  [platformStatusField(platform)]: 'delivered',
  startupGateHandoffPreflightStatus: 'deferred',
  [platformDeliveredField(platform)]: true,
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
    channel: acknowledgementChannel(platform),
    packageId,
    envelopeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success'
  },
  checks: [
    {
      id: `${platform}-response-delivery-delivered`,
      status: 'satisfied',
      reason: `${platform} response delivery was delivered.`
    },
    {
      id: 'startup-gate-preflight-deferred',
      status: 'satisfied',
      reason: 'Startup gate remains deferred.'
    }
  ],
  diagnostics: [],
  summary,
  effects: createPlatformEffects(platform, true),
  ...overrides
})

const createSkippedPlatformSource = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  overrides: Record<string, unknown> = {}
) => createPlatformSource(platform, {
  status: 'skipped',
  reason: 'no selected third-party data packs',
  sourceHandoffStatus: 'skipped',
  [platformStatusField(platform)]: 'skipped',
  startupGateHandoffPreflightStatus: 'skipped',
  [platformDeliveredField(platform)]: false,
  deliveryAcknowledgementConsumed: false,
  startupGateHandoffPreflightConsumed: false,
  responseDeliveryStartupGateHandoffPrepared: false,
  requestedCommandId: undefined,
  targetPackageId: undefined,
  envelopeKind: undefined,
  messageKey: undefined,
  selectedPackageIds: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  deliveryEnvelopeSummary: undefined,
  acknowledgement: undefined,
  checks: [],
  summary: {
    ...summary,
    selectedPackageCount: 0,
    loadOrderCount: 0,
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0
  },
  effects: createPlatformEffects(platform, false),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult,
  continuationAllowed: boolean,
  accepted: boolean
): void => {
  expect(result.startupGateContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.startupGateContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.selectedPlatformHandoffAccepted).toBe(accepted)
  expect(result.effects.deliveryAcknowledgementConverged).toBe(accepted)

  const {
    uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: _sourceCalled,
    selectedPlatformHandoffSourceCalled: _readerCalled,
    selectedPlatformHandoffAccepted: _accepted,
    deliveryAcknowledgementConverged: _converged,
    startupGateContinuationAllowed: _continuationAllowed,
    electronIpcResponseSent: _electronIpcResponseSent,
    webUiResponsePublished: _webUiResponsePublished,
    androidUiResponsePublished: _androidUiResponsePublished,
    successEnvelopeDelivered: _successEnvelopeDelivered,
    failureEnvelopeDelivered: _failureEnvelopeDelivered,
    retryStateDelivered: _retryStateDelivered,
    rollbackStateDelivered: _rollbackStateDelivered,
    uiIpcResponseDelivered: _uiIpcResponseDelivered,
    electronResponseDeliveryAcknowledgementConsumed: _electronAcknowledgement,
    webResponseDeliveryAcknowledgementConsumed: _webAcknowledgement,
    androidResponseDeliveryAcknowledgementConsumed: _androidAcknowledgement,
    startupGateHandoffPreflightConsumed: _startupGateHandoffPreflightConsumed,
    responseDeliveryStartupGateHandoffPrepared: _responseDeliveryStartupGateHandoffPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party UI/IPC response delivery acknowledgement convergence source', () => {
  it('is disabled by default and does not call any platform source', async() => {
    const readElectronResponseDeliveryStartupGateHandoffSource = vi.fn()
    const readWebResponseDeliveryStartupGateHandoffSource = vi.fn()
    const readAndroidResponseDeliveryStartupGateHandoffSource = vi.fn()
    const source = createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
      platform: 'web',
      readElectronResponseDeliveryStartupGateHandoffSource,
      readWebResponseDeliveryStartupGateHandoffSource,
      readAndroidResponseDeliveryStartupGateHandoffSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readElectronResponseDeliveryStartupGateHandoffSource).not.toHaveBeenCalled()
    expect(readWebResponseDeliveryStartupGateHandoffSource).not.toHaveBeenCalled()
    expect(readAndroidResponseDeliveryStartupGateHandoffSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a ready selected-platform acknowledgement without calling other platform sources', async() => {
    const readElectronResponseDeliveryStartupGateHandoffSource = vi.fn()
    const readWebResponseDeliveryStartupGateHandoffSource = vi.fn(async() =>
      createPlatformSource('web') as unknown as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult
    )
    const readAndroidResponseDeliveryStartupGateHandoffSource = vi.fn()
    const source = createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
      enabled: true,
      platform: 'web',
      readElectronResponseDeliveryStartupGateHandoffSource,
      readWebResponseDeliveryStartupGateHandoffSource,
      readAndroidResponseDeliveryStartupGateHandoffSource
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readWebResponseDeliveryStartupGateHandoffSource).toHaveBeenCalledOnce()
    expect(readElectronResponseDeliveryStartupGateHandoffSource).not.toHaveBeenCalled()
    expect(readAndroidResponseDeliveryStartupGateHandoffSource).not.toHaveBeenCalled()
    expect(result.selectedPlatform).toBe('web')
    expect(result.platformSourceStatus).toBe('ready')
    expect(result.platformResponseDeliveryStatus).toBe('delivered')
    expect(result.startupGateHandoffPreflightStatus).toBe('deferred')
    expect(result.platformResponseDelivered).toBe(true)
    expect(result.deliveryAcknowledgementConsumed).toBe(true)
    expect(result.responseDeliveryStartupGateHandoffPrepared).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.deliveryEnvelopeSummary).toEqual({
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
    })
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'web-ui-response-event-sink',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect('webHost' in result).toBe(false)
    expect('deliveryEnvelope' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true, true)
    expect(result.effects.webUiResponsePublished).toBe(true)
    expect(result.effects.webResponseDeliveryAcknowledgementConsumed).toBe(true)
    expectJsonGraphFrozen(result)
  })

  it('allows skipped selected-platform sources to continue without convergence evidence', async() => {
    const source = createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
      enabled: true,
      platform: 'electron',
      readElectronResponseDeliveryStartupGateHandoffSource: async() =>
        createSkippedPlatformSource('electron') as unknown as
          ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSourceResult
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.selectedPlatform).toBe('electron')
    expect(result.platformSourceStatus).toBe('skipped')
    expect(result.platformResponseDelivered).toBe(false)
    expect(result.deliveryAcknowledgementConsumed).toBe(false)
    expect(result.deliveryEnvelopeSummary).toBeUndefined()
    expect(result.acknowledgement).toBeUndefined()
    expect(result.selectedPackageIds).toEqual([])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing, throwing and blocked selected-platform sources without leaking host paths', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/web-convergence-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.web-response-delivery-startup-gate-handoff-source.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/startup-handoff.json',
      recovery: 'retry'
    })
    const missingPlatform = createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
      enabled: true,
      platform: 'web',
      readWebResponseDeliveryStartupGateHandoffSource: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/web-startup-source')
      }
    })
    const blockedSource = createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
      enabled: true,
      platform: 'web',
      readWebResponseDeliveryStartupGateHandoffSource: async() => createPlatformSource('web', {
        status: 'blocked',
        reason: 'upstream Web startup handoff blocked',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic],
        webResponseDelivered: false,
        deliveryAcknowledgementConsumed: false,
        startupGateHandoffPreflightConsumed: false,
        responseDeliveryStartupGateHandoffPrepared: false,
        effects: createPlatformEffects('web', false)
      }) as unknown as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult
    })

    await expect(missingPlatform()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError
    )
    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError)
      const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await blockedSource()
    } catch (error) {
      const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-response-delivery-startup-gate-handoff-source.blocked-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.convergence-blocked',
          packageId
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks platform mismatch, unsafe fields and response-effect drift', async() => {
    const cases = [
      createPlatformSource('android'),
      createPlatformSource('web', {
        programDirectoryPath: 'C:/Users/LENOVO/mods/web'
      }),
      createPlatformSource('web', {
        effects: createPlatformEffects('web', true, {
          packageFilesWritten: true
        })
      })
    ]

    for (const currentCase of cases) {
      const source = createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
        enabled: true,
        platform: 'web',
        readWebResponseDeliveryStartupGateHandoffSource: async() =>
          currentCase as unknown as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult
      })

      try {
        await source()
      } catch (error) {
        expect(error).toBeInstanceOf(ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError)
        const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError).result
        expect(result.status).toBe('blocked')
        expect(result.diagnostics).toEqual(expect.arrayContaining([
          expect.objectContaining({
            stage: 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.convergence-blocked'
          })
        ]))
        expect(JSON.stringify(result)).not.toContain('C:/Users')
        expectNoRuntimeOrWriteEffects(result, false, false)
        expectJsonGraphFrozen(result)
      }
    }
  })
})
