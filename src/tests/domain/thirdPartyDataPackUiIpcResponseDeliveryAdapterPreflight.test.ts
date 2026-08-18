import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight,
  type ThirdPartyDataPackUiIpcResponseDeliveryAdapterEffectSummary,
  type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'

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

const expectedEffects: ThirdPartyDataPackUiIpcResponseDeliveryAdapterEffectSummary = {
  ...sourceEffects,
  electronIpcResponseSent: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoDeliveryEffects = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.electronIpcAllowed).toBe(false)
  expect(result.webUiBridgeAllowed).toBe(false)
  expect(result.androidUiBridgeAllowed).toBe(false)
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.deliveryAcknowledgementAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
}

describe('third-party UI/IPC response delivery adapter preflight', () => {
  it('defers response delivery adapters with a cloned path-free envelope and no delivery effects', () => {
    const source = createEnvelopeContract()
    const result = buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
      envelopeContract: source
    })

    expect(result.status).toBe('deferred')
    expect(result.uiIpcResponseDeliveryAdapterPreflight).toBe('deferred')
    expect(result.sourceEnvelopeContractStatus).toBe('ready')
    expect(result.deliveryEnvelopePrepared).toBe(true)
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
    expect(result.deliveryStages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'response-delivery-adapter-preflight-inspection', status: 'satisfied' },
      { id: 'path-free-envelope-serialization', status: 'deferred' },
      { id: 'electron-response-delivery-adapter', status: 'deferred' },
      { id: 'web-response-delivery-adapter', status: 'deferred' },
      { id: 'android-response-delivery-adapter', status: 'deferred' },
      { id: 'startup-gate-handoff', status: 'deferred' },
      { id: 'delivery-acknowledgement-finalization', status: 'deferred' }
    ])
    expect(result.requiredDeliveryAdapters.map(adapter => adapter.id)).toEqual([
      'path-free-envelope-serializer',
      'electron-preload-response-channel',
      'web-ui-response-event-sink',
      'android-native-response-event-sink',
      'startup-gate-result-handoff',
      'delivery-acknowledgement-source',
      'redacted-delivery-diagnostics',
      'no-delivery-side-effect-guard'
    ])
    expect(result.deliveryEnvelope).toEqual(source.envelope)
    expect(Object.is(result.deliveryEnvelope, source.envelope)).toBe(false)
    expect('envelopeContract' in result).toBe(false)
    expect('sourceContract' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoDeliveryEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks when the source envelope contract is not ready while stripping path-bearing diagnostics', () => {
    const skipped = buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
      envelopeContract: createEnvelopeContract({
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
    })
    const blocked = buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
      envelopeContract: createEnvelopeContract({
        status: 'blocked',
        reason: 'envelope contract blocked before response delivery',
        resultEnvelopeContract: 'blocked',
        envelopeNormalized: false,
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.ui-ipc-response-delivery-adapter-preflight.blocked-source',
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
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.deliveryEnvelopePrepared).toBe(false)
    expect(skipped.requiredDeliveryAdapters).toEqual([])
    expect(skipped.deliveryStages.every(stage => stage.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.deliveryEnvelopePrepared).toBe(false)
    expect(blocked.requiredDeliveryAdapters).toEqual([])
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.ui-ipc-response-delivery-adapter-preflight.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoDeliveryEffects(skipped)
    expectNoDeliveryEffects(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks envelope target drift, identity drift, lockfile drift and response-delivery effect drift', () => {
    const cases = [
      {
        label: 'target drift',
        source: createEnvelopeContract({
          envelope: {
            ...createEnvelopeContract().envelope!,
            packageId: blockedPackageId
          }
        }),
        blockedCheckId: 'target-package-consistent'
      },
      {
        label: 'candidate drift',
        source: createEnvelopeContract({
          envelope: {
            ...createEnvelopeContract().envelope!,
            candidateHash: testHash('e')
          }
        }),
        blockedCheckId: 'candidate-hash-consistent'
      },
      {
        label: 'lockfile drift',
        source: createEnvelopeContract({
          envelope: {
            ...createEnvelopeContract().envelope!,
            lockfileHash: testHash('f')
          }
        }),
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'effect drift',
        source: createEnvelopeContract({
          effects: {
            ...sourceEffects,
            uiIpcResponseDelivered: true
          } as never
        }),
        blockedCheckId: 'no-response-delivery-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
        envelopeContract: currentCase.source
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('UI/IPC response delivery adapter preflight inputs are inconsistent')
      expect(result.requiredDeliveryAdapters).toEqual([])
      expect(result.deliveryEnvelope).toBeUndefined()
      expect(result.deliveryEnvelopePrepared).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.ui-ipc-response-delivery-adapter-preflight.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoDeliveryEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package summaries and envelope diagnostics without reading hostile proxy lengths', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/response-delivery-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/response-delivery-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.ui-ipc-response-delivery-adapter-preflight.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const source = createEnvelopeContract({
      selectedPackageIds,
      blockedPackageIds,
      blockedCandidateCount: 1,
      loadOrder,
      diagnostics: diagnostics as never,
      envelope: {
        ...createEnvelopeContract().envelope!,
        diagnostics: diagnostics as never,
        summary: {
          ...summary,
          blockedPackageCount: 1,
          blockedCandidateCount: 1,
          diagnosticCount: 1
        }
      }
    })
    const result = buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
      envelopeContract: source
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      blockedPackageCount: 1,
      blockedCandidateCount: 1,
      diagnosticCount: 1
    })
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.ui-ipc-response-delivery-adapter-preflight.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.ui-ipc-response-delivery-adapter-preflight.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('response-delivery-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoDeliveryEffects(result)
    expectJsonGraphFrozen(result)
  })
})
