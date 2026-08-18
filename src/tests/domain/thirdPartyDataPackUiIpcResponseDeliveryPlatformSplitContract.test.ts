import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight,
  type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract,
  type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPlatformDeliveryEffects = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
): void => {
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.electronIpcAllowed).toBe(false)
  expect(result.electronResponseDeliveryAllowed).toBe(false)
  expect(result.webUiBridgeAllowed).toBe(false)
  expect(result.webResponseDeliveryAllowed).toBe(false)
  expect(result.androidUiBridgeAllowed).toBe(false)
  expect(result.androidResponseDeliveryAllowed).toBe(false)
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.deliveryAcknowledgementAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
}

describe('third-party UI/IPC response delivery platform split contract', () => {
  it('splits a path-free response delivery preflight into deferred Electron, Web and Android sink contracts', () => {
    const source = createResponseDeliveryPreflight()
    const result = buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
      responseDeliveryPreflight: source
    })

    expect(result.status).toBe('deferred')
    expect(result.uiIpcResponseDeliveryPlatformSplitContract).toBe('deferred')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.platformSplitPrepared).toBe(true)
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
    expect(result.platformAdapters.map(adapter => ({
      platform: adapter.platform,
      status: adapter.status,
      stageId: adapter.stageId,
      transport: adapter.transport,
      requirementIds: adapter.requirementIds
    }))).toEqual([
      {
        platform: 'electron',
        status: 'deferred',
        stageId: 'electron-response-delivery-adapter',
        transport: 'electron-preload-response-channel',
        requirementIds: ['electron-preload-response-channel', 'delivery-acknowledgement-source']
      },
      {
        platform: 'web',
        status: 'deferred',
        stageId: 'web-response-delivery-adapter',
        transport: 'web-ui-response-event-sink',
        requirementIds: ['web-ui-response-event-sink', 'delivery-acknowledgement-source']
      },
      {
        platform: 'android',
        status: 'deferred',
        stageId: 'android-response-delivery-adapter',
        transport: 'android-native-response-event-sink',
        requirementIds: ['android-native-response-event-sink', 'delivery-acknowledgement-source']
      }
    ])
    expect(result.deliveryEnvelope).toEqual(source.deliveryEnvelope)
    expect(Object.is(result.deliveryEnvelope, source.deliveryEnvelope)).toBe(false)
    expect('responseDeliveryPreflight' in result).toBe(false)
    expect('envelopeContract' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoPlatformDeliveryEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks when the response delivery preflight is not deferred while stripping path-bearing diagnostics', () => {
    const skippedSource = createResponseDeliveryPreflight({
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
    const blockedSource = createResponseDeliveryPreflight({
      status: 'blocked',
      reason: 'response delivery preflight blocked before platform split',
      resultEnvelopeContract: 'blocked',
      envelopeNormalized: false,
      diagnostics: [
        createDiagnostic('LIFECYCLE-TRANSACTION-001', {
          stage: 'third-party.ui-ipc-response-delivery-platform-split-contract.blocked-source',
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

    const skipped = buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
      responseDeliveryPreflight: skippedSource
    })
    const blocked = buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
      responseDeliveryPreflight: blockedSource
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.platformSplitPrepared).toBe(false)
    expect(skipped.platformAdapters.every(adapter => adapter.status === 'skipped')).toBe(true)
    expect(skipped.platformAdapters.every(adapter => adapter.requirementIds.length === 0)).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.platformSplitPrepared).toBe(false)
    expect(blocked.deliveryEnvelope).toBeUndefined()
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.ui-ipc-response-delivery-platform-split-contract.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoPlatformDeliveryEffects(skipped)
    expectNoPlatformDeliveryEffects(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks missing envelopes, platform stage drift, requirement drift and platform-delivery effect drift', () => {
    const source = createResponseDeliveryPreflight()
    const cases = [
      {
        label: 'missing envelope',
        source: {
          ...source,
          deliveryEnvelopePrepared: false,
          deliveryEnvelope: undefined
        },
        blockedCheckId: 'path-free-envelope-prepared'
      },
      {
        label: 'stage drift',
        source: {
          ...source,
          deliveryStages: source.deliveryStages.map(stage =>
            stage.id === 'electron-response-delivery-adapter'
              ? { ...stage, status: 'satisfied' as const }
              : stage
          )
        },
        blockedCheckId: 'platform-delivery-stages-deferred'
      },
      {
        label: 'requirement drift',
        source: {
          ...source,
          requiredDeliveryAdapters: source.requiredDeliveryAdapters.filter(adapter =>
            adapter.id !== 'electron-preload-response-channel'
          )
        },
        blockedCheckId: 'platform-delivery-requirements-present'
      },
      {
        label: 'effect drift',
        source: {
          ...source,
          effects: {
            ...source.effects,
            electronIpcResponseSent: true
          }
        },
        blockedCheckId: 'no-platform-delivery-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
        responseDeliveryPreflight: currentCase.source as never
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('UI/IPC response delivery platform split inputs are inconsistent')
      expect(result.platformSplitPrepared).toBe(false)
      expect(result.deliveryEnvelope).toBeUndefined()
      expect(result.platformAdapters.every(adapter => adapter.status === 'blocked')).toBe(true)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.ui-ipc-response-delivery-platform-split-contract.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoPlatformDeliveryEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/platform-split-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/platform-split-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.ui-ipc-response-delivery-platform-split-contract.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const source = createResponseDeliveryPreflight()
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
    } as ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult

    const result = buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
      responseDeliveryPreflight: hostileSource
    })

    expect(result.status).toBe('deferred')
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
        stage: 'third-party.ui-ipc-response-delivery-platform-split-contract.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.ui-ipc-response-delivery-platform-split-contract.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('platform-split-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoPlatformDeliveryEffects(result)
    expectJsonGraphFrozen(result)
  })
})
