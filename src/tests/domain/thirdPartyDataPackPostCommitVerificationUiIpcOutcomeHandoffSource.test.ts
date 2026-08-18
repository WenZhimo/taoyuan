import { describe, expect, it, vi } from 'vitest'
import type { ModDiagnosticRecovery } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_MODE,
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError,
  type ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary,
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
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

const recoveryFor = (
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): ModDiagnosticRecovery => {
  if (kind === 'retry') return 'retry'
  if (kind === 'rollback') return 'restore-backup'
  return 'none'
}

const createEffects = (
  prepared: boolean,
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary => ({
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
  diagnosticsWritten: false,
  atomicCommitOutcomeConsumed: prepared,
  postCommitVerificationOutcomeConsumed: prepared,
  uiIpcOutcomePrepared: prepared,
  ...overrides
})

const createHandoff = (
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind = 'success',
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult> = {}
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => ({
  status: 'ready',
  resultNormalizationPreflightStatus: 'deferred',
  atomicCommitOutcomeContractStatus: 'ready',
  postCommitVerificationExecutorAdapterStatus: 'executed',
  reason: 'post-commit verification UI/IPC outcome handoff produced a path-free outcome source; response delivery remains separate',
  postCommitVerificationUiIpcOutcomeHandoff: 'ready',
  readOnly: true,
  uiIpcOutcomePrepared: true,
  uiIpcResponseDeliveryAllowed: false,
  commandDispatchAllowed: false,
  atomicCommitExecutionAllowed: false,
  transactionCommitAllowed: false,
  runtimePublicationCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  outcomeKind: kind,
  messageKey: `mods.ui.ipc.result.install.${kind}`,
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
  outcome: {
    kind,
    settled: true,
    packageId,
    candidateIdentity,
    lockfileHash,
    diagnostics: [],
    messageKey: `mods.ui.ipc.result.install.${kind}`,
    recovery: recoveryFor(kind),
    retryable: kind === 'retry',
    rollbackRequired: kind === 'rollback'
  },
  effects: createEffects(true),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult)

const createSkippedHandoff = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult> = {}
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => createHandoff('success', {
  status: 'skipped',
  resultNormalizationPreflightStatus: 'skipped',
  atomicCommitOutcomeContractStatus: 'skipped',
  postCommitVerificationExecutorAdapterStatus: 'skipped',
  reason: 'no selected third-party data packs',
  postCommitVerificationUiIpcOutcomeHandoff: 'skipped',
  uiIpcOutcomePrepared: false,
  requestedCommandId: undefined,
  targetPackageId: undefined,
  outcomeKind: undefined,
  messageKey: undefined,
  selectedPackageIds: [],
  blockedPackageIds: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  summary: {
    selectedPackageCount: 0,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 0,
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    diagnosticCount: 0
  },
  outcome: undefined,
  effects: createEffects(false),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealDeliveryEffects = (
  result: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult,
  continuationAllowed: boolean,
  handoffAccepted: boolean
): void => {
  expect(result.resultEnvelopeContinuationAllowed).toBe(continuationAllowed)
  expect(result.uiIpcResultContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.resultEnvelopeContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.uiIpcOutcomeHandoffAccepted).toBe(handoffAccepted)

  const {
    postCommitVerificationUiIpcOutcomeHandoffSourceCalled: _sourceCalled,
    postCommitVerificationUiIpcOutcomeHandoffReaderCalled: _readerCalled,
    uiIpcOutcomeHandoffAccepted: _handoffAccepted,
    uiIpcOutcomePrepared: _prepared,
    resultEnvelopeContinuationAllowed: _continuationAllowed,
    successOutcomeAccepted: _successAccepted,
    failureOutcomeAccepted: _failureAccepted,
    retryOutcomeAccepted: _retryAccepted,
    rollbackOutcomeAccepted: _rollbackAccepted,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party post-commit verification UI/IPC outcome handoff source', () => {
  it('is disabled by default and does not call the handoff reader', async() => {
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn()
    const source = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
      readPostCommitVerificationUiIpcOutcomeHandoff
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.outcomeKind).toBeUndefined()
    expectNoRealDeliveryEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled handoff source reports skipped', async() => {
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createSkippedHandoff({
      selectedPackageIds: [packageId],
      targetPackageId: packageId,
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity,
      lockfileHash,
      summary
    }))
    const source = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
      enabled: true,
      readPostCommitVerificationUiIpcOutcomeHandoff
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expect(result.handoffStatus).toBe('skipped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect('outcome' in result).toBe(false)
    expectNoRealDeliveryEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a path-free success handoff without exposing outcome or upstream internals', async() => {
    const source = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
      enabled: true,
      readPostCommitVerificationUiIpcOutcomeHandoff: async() => createHandoff()
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.handoffStatus).toBe('ready')
    expect(result.resultNormalizationPreflightStatus).toBe('deferred')
    expect(result.atomicCommitOutcomeContractStatus).toBe('ready')
    expect(result.postCommitVerificationExecutorAdapterStatus).toBe('executed')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.outcomeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243,
      diagnosticCount: 0
    })
    expect(result.effects.uiIpcOutcomePrepared).toBe(true)
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect('outcome' in result).toBe(false)
    expect('resultNormalizationPreflight' in result).toBe(false)
    expect('atomicCommitOutcomeContract' in result).toBe(false)
    expect('postCommitVerificationExecutorAdapter' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRealDeliveryEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts failure, retry and rollback outcome handoffs as path-free flags', async() => {
    const cases: readonly ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind[] = ['failure', 'retry', 'rollback']

    for (const kind of cases) {
      const source = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
        enabled: true,
        readPostCommitVerificationUiIpcOutcomeHandoff: async() => createHandoff(kind)
      })

      const result = await source()

      expect(result.status).toBe('ready')
      expect(result.outcomeKind).toBe(kind)
      expect(result.messageKey).toBe(`mods.ui.ipc.result.install.${kind}`)
      expect(result.recovery).toBe(recoveryFor(kind))
      expect(result.retryable).toBe(kind === 'retry')
      expect(result.rollbackRequired).toBe(kind === 'rollback')
      expect('outcome' in result).toBe(false)
      expectNoRealDeliveryEffects(result, true, true)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing, throwing and blocked handoff sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
      enabled: true,
      readPostCommitVerificationUiIpcOutcomeHandoff: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/ui-ipc-handoff-source')
      }
    })
    const blockedSource = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
      enabled: true,
      readPostCommitVerificationUiIpcOutcomeHandoff: async() => createHandoff('failure', {
        status: 'blocked',
        postCommitVerificationUiIpcOutcomeHandoff: 'blocked',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.post-commit-verification-ui-ipc-outcome-handoff-source.blocked-source',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/ui-ipc.json',
            recovery: 'retry'
          }
        ] as never,
        effects: createEffects(false)
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError
    )
    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-ui-ipc-outcome-handoff-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealDeliveryEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe UI/IPC delivery drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/ui-ipc-handoff-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource({
      enabled: true,
      readPostCommitVerificationUiIpcOutcomeHandoff: async() => createHandoff('success', {
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        electronHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        outcome: {
          ...createHandoff().outcome,
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...createEffects(true),
          uiIpcResponseDelivered: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-ui-ipc-outcome-handoff-source.unsafe-source'
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-ui-ipc-outcome-handoff-source.handoff-blocked'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('ui-ipc-handoff-source-selected-package-ids')
      expect('electronHost' in result).toBe(false)
      expect('outcome' in result).toBe(false)
      expectNoRealDeliveryEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
