import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackUiIpcResultEnvelopeContract,
  type ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  type ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'

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

const normalizationEffects: ThirdPartyDataPackUiIpcResultNormalizationEffectSummary = {
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

const expectedEffects: ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary = {
  ...normalizationEffects
}

const createPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult> = {}
): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
  status: 'deferred',
  atomicTransactionCommitExecutorPreflightStatus: 'deferred',
  postCommitVerificationExecutorPreflightStatus: 'deferred',
  reason: 'UI/IPC result normalization preflight is inspect-only until atomic commit, post-commit verification, rollback recovery and explicit response delivery are implemented',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  uiIpcResultNormalizationPreflight: 'deferred',
  readOnly: true,
  successEnvelopeAllowed: false,
  failureEnvelopeAllowed: false,
  retryStateAllowed: false,
  rollbackStateAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  resultChecks: [],
  resultStages: [
    {
      id: 'ui-ipc-result-normalization-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'Result normalization preflight is inspect-only.'
    },
    {
      id: 'ui-ipc-response-delivery',
      status: 'deferred',
      requirementIds: ['explicit-ui-ipc-delivery-adapter'],
      reason: 'UI/IPC response delivery remains deferred.'
    }
  ],
  resultRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'UI/IPC payloads must expose redacted summaries.'
    }
  ],
  resultOutcomeStates: [],
  effects: normalizationEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoDeliveryEffects = (
  result: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.electronIpcAllowed).toBe(false)
  expect(result.webUiBridgeAllowed).toBe(false)
  expect(result.androidUiBridgeAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
}

describe('third-party UI/IPC result envelope contract', () => {
  it('normalizes a settled success outcome into a frozen path-free envelope without delivery effects', () => {
    const result = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
      preflight: createPreflight(),
      outcome: {
        kind: 'success',
        settled: true,
        packageId,
        candidateIdentity,
        lockfileHash,
        recovery: 'none'
      }
    })

    expect(result.status).toBe('ready')
    expect(result.resultEnvelopeContract).toBe('ready')
    expect(result.envelopeNormalized).toBe(true)
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      blockedCandidateCount: 0,
      loadOrderCount: 1,
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      diagnosticCount: 0
    })
    expect(result.envelope).toEqual({
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
      summary: result.summary,
      diagnostics: []
    })
    expect('preflight' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoDeliveryEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('normalizes failure, retry and rollback envelopes while stripping path-bearing diagnostics', () => {
    const diagnostic = createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage: 'third-party.ui-ipc-result-envelope-contract.path-strip-test',
      severity: 'error',
      packageId,
      file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/result.json',
      fieldPath: '/result/C:/Users/LENOVO',
      details: {
        hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack',
        message: 'contains private path'
      },
      recovery: 'retry'
    })

    const cases = [
      {
        kind: 'failure',
        retryable: false,
        rollbackRequired: true,
        recovery: 'retry'
      },
      {
        kind: 'retry',
        retryable: true,
        rollbackRequired: false,
        recovery: 'retry'
      },
      {
        kind: 'rollback',
        retryable: false,
        rollbackRequired: true,
        recovery: 'restore-backup'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
        preflight: createPreflight(),
        outcome: {
          kind: currentCase.kind,
          settled: true,
          packageId,
          diagnostics: [diagnostic],
          retryable: currentCase.retryable,
          rollbackRequired: currentCase.rollbackRequired,
          recovery: currentCase.recovery,
          messageKey: `mods.ui.ipc.result.install.${currentCase.kind}`
        }
      })

      expect(result.status).toBe('ready')
      expect(result.envelope?.kind).toBe(currentCase.kind)
      expect(result.envelope?.retryable).toBe(currentCase.retryable)
      expect(result.envelope?.rollbackRequired).toBe(currentCase.rollbackRequired)
      expect(result.envelope?.recovery).toBe(currentCase.recovery)
      expect(result.envelope?.diagnostics).toEqual([
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.ui-ipc-result-envelope-contract.path-strip-test',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          recovery: 'retry'
        }
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('hostPath')
      expectNoDeliveryEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('skips or blocks when the source preflight is not a deferred result-normalization source', () => {
    const skipped = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
      preflight: createPreflight({
        status: 'skipped',
        reason: 'no selected third-party data packs',
        requestedCommandId: undefined,
        targetPackageId: undefined,
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }),
      outcome: {
        kind: 'success',
        settled: true,
        packageId
      }
    })
    const blocked = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
      preflight: createPreflight({
        status: 'blocked',
        reason: 'preflight blocked before envelope contract',
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.ui-ipc-result-envelope-contract.blocked-preflight',
            severity: 'error',
            packageId,
            file: 'C:/Users/LENOVO/private.json'
          })
        ] as never
      }),
      outcome: {
        kind: 'failure',
        settled: true,
        packageId
      }
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.envelopeNormalized).toBe(false)
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(skipped.envelope).toBeUndefined()
    expect(blocked.status).toBe('blocked')
    expect(blocked.envelopeNormalized).toBe(false)
    expect(blocked.envelope).toBeUndefined()
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expectNoDeliveryEffects(skipped)
    expectNoDeliveryEffects(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks unsettled outcomes, target drift, success identity drift, lockfile drift and delivery effect drift', () => {
    const cases = [
      {
        label: 'unsettled',
        preflight: createPreflight(),
        outcome: {
          kind: 'success',
          settled: false,
          packageId,
          candidateIdentity,
          lockfileHash
        },
        blockedCheckId: 'settled-outcome-source'
      },
      {
        label: 'target drift',
        preflight: createPreflight(),
        outcome: {
          kind: 'success',
          settled: true,
          packageId: blockedPackageId,
          candidateIdentity,
          lockfileHash
        },
        blockedCheckId: 'target-package-consistent'
      },
      {
        label: 'candidate drift',
        preflight: createPreflight(),
        outcome: {
          kind: 'success',
          settled: true,
          packageId,
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          },
          lockfileHash
        },
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile drift',
        preflight: createPreflight(),
        outcome: {
          kind: 'success',
          settled: true,
          packageId,
          candidateIdentity,
          lockfileHash: testHash('f')
        },
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'effect drift',
        preflight: createPreflight({
          effects: {
            ...normalizationEffects,
            uiIpcResponseDelivered: true
          } as never
        }),
        outcome: {
          kind: 'failure',
          settled: true,
          packageId
        },
        blockedCheckId: 'no-ui-ipc-delivery-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
        preflight: currentCase.preflight,
        outcome: currentCase.outcome
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('UI/IPC result envelope contract inputs are inconsistent')
      expect(result.envelope).toBeUndefined()
      expect(result.envelopeNormalized).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.ui-ipc-result-envelope-contract.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoDeliveryEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/result-envelope-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/result-envelope-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.ui-ipc-result-envelope-contract.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const preflight = createPreflight({
      selectedPackageIds: createHostileArray([packageId], 'selected'),
      blockedPackageIds: createHostileArray([blockedPackageId], 'blocked'),
      loadOrder: createHostileArray([packageId], 'load-order'),
      diagnostics: createHostileArray([diagnostic], 'preflight-diagnostics') as never
    })
    const result = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
      preflight,
      outcome: {
        kind: 'failure',
        settled: true,
        packageId,
        diagnostics: createHostileArray([diagnostic], 'outcome-diagnostics') as never,
        retryable: true,
        recovery: 'retry'
      }
    })

    expect(result.status).toBe('ready')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([blockedPackageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      blockedPackageCount: 1,
      diagnosticCount: 2
    })
    expect(result.envelope?.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.ui-ipc-result-envelope-contract.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.ui-ipc-result-envelope-contract.proxy-test',
        packageId
      })
    ])
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('result-envelope-selected')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoDeliveryEffects(result)
    expectJsonGraphFrozen(result)
  })
})
