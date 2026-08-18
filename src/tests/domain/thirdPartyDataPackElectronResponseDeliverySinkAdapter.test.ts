import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter,
  type ThirdPartyDataPackElectronResponseDeliverySinkAdapterResult
} from '@/domain/mods/thirdPartyDataPackElectronResponseDeliverySinkAdapter'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight,
  type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract,
  type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'

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

const sourceEffects: ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary = {
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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
}

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

const createEnvelopeContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResultEnvelopeContractResult => ({
  status: 'ready',
  sourcePreflightStatus: 'deferred',
  reason: 'UI/IPC result envelope contract is ready as a path-free domain source; response delivery remains disabled',
  resultEnvelopeContract: 'ready',
  readOnly: true,
  envelopeNormalized: true,
  uiIpcResponseDeliveryAllowed: false,
  electronIpcAllowed: false,
  webUiBridgeAllowed: false,
  androidUiBridgeAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
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
  summary,
  envelope: {
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
    diagnostics: []
  },
  effects: sourceEffects,
  ...overrides
})

const createResponseDeliveryPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult =>
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
    envelopeContract: createEnvelopeContract(overrides)
  })

const createPlatformSplitContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult =>
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
    responseDeliveryPreflight: createResponseDeliveryPreflight(overrides)
  })

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoWritesOrRuntimeEffects = (
  result: ThirdPartyDataPackElectronResponseDeliverySinkAdapterResult
): void => {
  expect(result.webUiBridgeAllowed).toBe(false)
  expect(result.webResponseDeliveryAllowed).toBe(false)
  expect(result.androidUiBridgeAllowed).toBe(false)
  expect(result.androidResponseDeliveryAllowed).toBe(false)
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.officialRegistryPublished).toBe(false)
  expect(result.effects.thirdPartyRegistryPublished).toBe(false)
  expect(result.effects.liveRegistryMutated).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.atomicCommitExecutorCalled).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

const createAcknowledgement = (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => ({
  status: 'acknowledged' as const,
  channel: 'electron-preload-response-channel' as const,
  packageId: envelope.packageId,
  envelopeKind: envelope.kind,
  messageKey: envelope.messageKey
})

describe('third-party Electron response delivery sink adapter', () => {
  it('delivers a cloned path-free envelope through an injected fixed Electron sink host', async () => {
    const source = createPlatformSplitContract()
    let deliveredEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined

    const result = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: {
        channel: 'electron-preload-response-channel',
        deliver: envelope => {
          deliveredEnvelope = envelope
          return createAcknowledgement(envelope)
        }
      }
    })

    expect(result.status).toBe('delivered')
    expect(result.electronResponseDeliverySinkAdapter).toBe('delivered')
    expect(result.sourcePlatformSplitStatus).toBe('deferred')
    expect(result.electronResponseDeliveryAttempted).toBe(true)
    expect(result.electronResponseDelivered).toBe(true)
    expect(result.uiIpcResponseDeliveryAllowed).toBe(true)
    expect(result.electronIpcAllowed).toBe(true)
    expect(result.electronResponseDeliveryAllowed).toBe(true)
    expect(result.deliveryAcknowledgementAllowed).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.deliveryEnvelope).toEqual(source.deliveryEnvelope)
    expect(Object.is(result.deliveryEnvelope, source.deliveryEnvelope)).toBe(false)
    expect(deliveredEnvelope).toBe(result.deliveryEnvelope)
    expect(result.acknowledgement).toEqual(createAcknowledgement(result.deliveryEnvelope!))
    expect(result.effects.electronIpcExposed).toBe(false)
    expect(result.effects.electronIpcResponseSent).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect(result.effects.successEnvelopeDelivered).toBe(true)
    expect(result.effects.failureEnvelopeDelivered).toBe(false)
    expect(result.effects.retryStateDelivered).toBe(false)
    expect(result.effects.rollbackStateDelivered).toBe(false)
    expect('platformSplitContract' in result).toBe(false)
    expect('responseDeliveryPreflight' in result).toBe(false)
    expect('envelopeContract' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoWritesOrRuntimeEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks upstream platform split states while stripping path-bearing diagnostics', async () => {
    const skippedSource = createPlatformSplitContract({
      status: 'skipped',
      reason: 'no selected third-party data packs',
      resultEnvelopeContract: 'skipped',
      envelopeNormalized: false,
      requestedCommandId: undefined,
      targetPackageId: undefined,
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      candidateIdentity: undefined,
      lockfileHash: undefined,
      envelope: undefined
    })
    const blockedSource = createPlatformSplitContract({
      status: 'blocked',
      reason: 'platform split blocked before Electron delivery',
      resultEnvelopeContract: 'blocked',
      envelopeNormalized: false,
      diagnostics: [
        createDiagnostic('LIFECYCLE-TRANSACTION-001', {
          stage: 'third-party.electron-response-delivery-sink.blocked-source',
          severity: 'error',
          packageId,
          file: 'C:/Users/LENOVO/private.json',
          details: {
            hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack'
          },
          recovery: 'retry'
        })
      ],
      envelope: undefined
    })

    const skipped = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: skippedSource
    })
    const blocked = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: blockedSource
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.electronResponseDeliveryAttempted).toBe(false)
    expect(skipped.electronResponseDelivered).toBe(false)
    expect(skipped.deliveryEnvelope).toBeUndefined()
    expect(blocked.status).toBe('blocked')
    expect(blocked.electronResponseDeliveryAttempted).toBe(false)
    expect(blocked.electronResponseDelivered).toBe(false)
    expect(blocked.deliveryEnvelope).toBeUndefined()
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.electron-response-delivery-sink.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoWritesOrRuntimeEffects(skipped)
    expectNoWritesOrRuntimeEffects(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks missing host, wrong channel, missing Electron contract, missing envelope and upstream effect drift', async () => {
    const source = createPlatformSplitContract()
    const cases = [
      {
        label: 'missing host',
        source,
        host: undefined,
        blockedCheckId: 'electron-sink-host-ready'
      },
      {
        label: 'wrong channel',
        source,
        host: {
          channel: 'web-ui-response-event-sink' as never,
          deliver: (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => createAcknowledgement(envelope)
        },
        blockedCheckId: 'fixed-electron-channel'
      },
      {
        label: 'missing Electron platform adapter',
        source: {
          ...source,
          platformAdapters: source.platformAdapters.filter(adapter => adapter.platform !== 'electron')
        },
        host: {
          channel: 'electron-preload-response-channel' as const,
          deliver: (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => createAcknowledgement(envelope)
        },
        blockedCheckId: 'electron-platform-contract-present'
      },
      {
        label: 'missing envelope',
        source: {
          ...source,
          deliveryEnvelope: undefined
        },
        host: {
          channel: 'electron-preload-response-channel' as const,
          deliver: (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => createAcknowledgement(envelope)
        },
        blockedCheckId: 'path-free-envelope-present'
      },
      {
        label: 'upstream effect drift',
        source: {
          ...source,
          effects: {
            ...source.effects,
            electronIpcResponseSent: true
          }
        },
        host: {
          channel: 'electron-preload-response-channel' as const,
          deliver: (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => createAcknowledgement(envelope)
        },
        blockedCheckId: 'no-upstream-delivery-effects'
      }
    ] as const

    for (const currentCase of cases) {
      const result = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
        platformSplitContract: currentCase.source as ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult,
        host: currentCase.host
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('Electron response delivery sink inputs are inconsistent')
      expect(result.electronResponseDelivered).toBe(false)
      expect(result.deliveryEnvelope).toBeUndefined()
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.electron-response-delivery-sink.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoWritesOrRuntimeEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks host failures and invalid acknowledgements without leaking host paths', async () => {
    const source = createPlatformSplitContract()
    const hostFailure = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: {
        channel: 'electron-preload-response-channel',
        deliver: () => {
          throw new Error('EACCES C:/Users/LENOVO/mods/electron-response-delivery')
        }
      }
    })
    const invalidAcknowledgement = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: {
        channel: 'electron-preload-response-channel',
        deliver: envelope => ({
          ...createAcknowledgement(envelope),
          messageKey: 'mods.ui.ipc.result.install.other'
        })
      }
    })

    expect(hostFailure.status).toBe('blocked')
    expect(hostFailure.reason).toBe('Electron response delivery sink host failed before acknowledgement')
    expect(hostFailure.electronResponseDeliveryAttempted).toBe(true)
    expect(hostFailure.electronResponseDelivered).toBe(false)
    expect(hostFailure.deliveryEnvelope).toEqual(source.deliveryEnvelope)
    expect(hostFailure.acknowledgement).toBeUndefined()
    expect(hostFailure.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'delivery-acknowledgement-returned',
        status: 'blocked'
      })
    ]))
    expect(invalidAcknowledgement.status).toBe('blocked')
    expect(invalidAcknowledgement.reason).toBe('Electron response delivery sink host returned an invalid acknowledgement')
    expect(invalidAcknowledgement.electronResponseDeliveryAttempted).toBe(true)
    expect(invalidAcknowledgement.electronResponseDelivered).toBe(false)
    expect(invalidAcknowledgement.acknowledgement).toBeUndefined()
    expect(JSON.stringify(hostFailure)).not.toContain('C:/Users')
    expect(JSON.stringify(hostFailure)).not.toContain('LENOVO')
    expect(JSON.stringify(invalidAcknowledgement)).not.toContain('mods.ui.ipc.result.install.other')
    expectNoWritesOrRuntimeEffects(hostFailure)
    expectNoWritesOrRuntimeEffects(invalidAcknowledgement)
    expectJsonGraphFrozen(hostFailure)
    expectJsonGraphFrozen(invalidAcknowledgement)
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths', async () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/electron-sink-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/electron-sink-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.electron-response-delivery-sink.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const source = createPlatformSplitContract()
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')
    const hostileSource = {
      ...source,
      selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
      blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
      loadOrder: createHostileArray([packageId], 'load-order'),
      diagnostics: diagnostics as never,
      deliveryEnvelope: {
        ...source.deliveryEnvelope!,
        diagnostics: diagnostics as never,
        summary: {
          ...summary,
          blockedPackageCount: 1,
          diagnosticCount: 1
        }
      }
    } as ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult

    const result = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: hostileSource,
      host: {
        channel: 'electron-preload-response-channel',
        deliver: envelope => createAcknowledgement(envelope)
      }
    })

    expect(result.status).toBe('delivered')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      blockedPackageCount: 1,
      diagnosticCount: 1
    })
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.electron-response-delivery-sink.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.electron-response-delivery-sink.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('electron-sink-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoWritesOrRuntimeEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks accessor-based upstream effects without invoking path-bearing getters', async () => {
    let effectGetterRead = false
    const hostileEffects = {
      ...createPlatformSplitContract().effects
    }
    Object.defineProperty(hostileEffects, 'electronIpcResponseSent', {
      enumerable: true,
      get() {
        effectGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/electron-sink-effect-getter')
      }
    })
    const source = {
      ...createPlatformSplitContract(),
      effects: hostileEffects
    } as ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult

    const result = await deliverThirdPartyDataPackElectronResponseDeliverySinkAdapter({
      platformSplitContract: source,
      host: {
        channel: 'electron-preload-response-channel',
        deliver: envelope => createAcknowledgement(envelope)
      }
    })

    expect(result.status).toBe('blocked')
    expect(effectGetterRead).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'no-upstream-delivery-effects',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoWritesOrRuntimeEffects(result)
    expectJsonGraphFrozen(result)
  })
})
