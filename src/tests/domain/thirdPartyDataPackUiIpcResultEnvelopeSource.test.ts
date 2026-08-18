import { describe, expect, it, vi } from 'vitest'
import type { ModDiagnosticRecovery } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackUiIpcResultEnvelopeSource,
  THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_MODE,
  ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError,
  type ThirdPartyDataPackUiIpcResultEnvelopeSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary,
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
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary> = {}
): ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary => ({
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
  ...overrides
})

const createContract = (
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind = 'success',
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
    kind,
    commandId: 'install',
    packageId,
    candidateHash: kind === 'success' ? candidateIdentity.candidateHash : undefined,
    lockfileHash: kind === 'success' ? lockfileHash : undefined,
    messageKey: `mods.ui.ipc.result.install.${kind}`,
    recovery: recoveryFor(kind),
    retryable: kind === 'retry',
    rollbackRequired: kind === 'rollback',
    summary,
    diagnostics: []
  },
  effects: createEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackUiIpcResultEnvelopeContractResult)

const createSkippedContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResultEnvelopeContractResult => createContract('success', {
  status: 'skipped',
  sourcePreflightStatus: 'skipped',
  reason: 'no selected third-party data packs',
  resultEnvelopeContract: 'skipped',
  envelopeNormalized: false,
  requestedCommandId: undefined,
  targetPackageId: undefined,
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
  envelope: undefined,
  effects: createEffects(),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealDeliveryEffects = (
  result: ThirdPartyDataPackUiIpcResultEnvelopeSourceResult,
  continuationAllowed: boolean,
  contractAccepted: boolean
): void => {
  expect(result.responseDeliveryContinuationAllowed).toBe(continuationAllowed)
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.effects.responseDeliveryContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.resultEnvelopeContractAccepted).toBe(contractAccepted)

  const {
    uiIpcResultEnvelopeSourceCalled: _sourceCalled,
    uiIpcResultEnvelopeContractReaderCalled: _readerCalled,
    resultEnvelopeContractAccepted: _accepted,
    resultEnvelopeNormalized: _normalized,
    responseDeliveryContinuationAllowed: _continuationAllowed,
    successEnvelopeAccepted: _successAccepted,
    failureEnvelopeAccepted: _failureAccepted,
    retryEnvelopeAccepted: _retryAccepted,
    rollbackEnvelopeAccepted: _rollbackAccepted,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party UI/IPC result envelope source', () => {
  it('is disabled by default and does not call the result envelope contract reader', async() => {
    const readUiIpcResultEnvelopeContract = vi.fn()
    const source = createThirdPartyDataPackUiIpcResultEnvelopeSource({
      readUiIpcResultEnvelopeContract
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readUiIpcResultEnvelopeContract).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.envelopeKind).toBeUndefined()
    expectNoRealDeliveryEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled result envelope contract reports skipped', async() => {
    const readUiIpcResultEnvelopeContract = vi.fn(async() => createSkippedContract({
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
    const source = createThirdPartyDataPackUiIpcResultEnvelopeSource({
      enabled: true,
      readUiIpcResultEnvelopeContract
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readUiIpcResultEnvelopeContract).toHaveBeenCalledOnce()
    expect(result.resultEnvelopeContractStatus).toBe('skipped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect('envelope' in result).toBe(false)
    expectNoRealDeliveryEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a path-free success envelope contract without exposing the envelope or upstream internals', async() => {
    const source = createThirdPartyDataPackUiIpcResultEnvelopeSource({
      enabled: true,
      readUiIpcResultEnvelopeContract: async() => createContract()
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.resultEnvelopeContractStatus).toBe('ready')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.recovery).toBe('none')
    expect(result.retryable).toBe(false)
    expect(result.rollbackRequired).toBe(false)
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
    expect(result.effects.resultEnvelopeNormalized).toBe(true)
    expect(result.effects.successEnvelopeAccepted).toBe(true)
    expect('envelope' in result).toBe(false)
    expect('preflight' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    expect('resultNormalizationPreflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRealDeliveryEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts failure, retry and rollback envelopes as path-free flags', async() => {
    const cases: readonly ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind[] = ['failure', 'retry', 'rollback']

    for (const kind of cases) {
      const source = createThirdPartyDataPackUiIpcResultEnvelopeSource({
        enabled: true,
        readUiIpcResultEnvelopeContract: async() => createContract(kind)
      })

      const result = await source()

      expect(result.status).toBe('ready')
      expect(result.envelopeKind).toBe(kind)
      expect(result.messageKey).toBe(`mods.ui.ipc.result.install.${kind}`)
      expect(result.recovery).toBe(recoveryFor(kind))
      expect(result.retryable).toBe(kind === 'retry')
      expect(result.rollbackRequired).toBe(kind === 'rollback')
      expect('envelope' in result).toBe(false)
      expectNoRealDeliveryEffects(result, true, true)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing, throwing and blocked contract sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackUiIpcResultEnvelopeSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackUiIpcResultEnvelopeSource({
      enabled: true,
      readUiIpcResultEnvelopeContract: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/result-envelope-source')
      }
    })
    const blockedSource = createThirdPartyDataPackUiIpcResultEnvelopeSource({
      enabled: true,
      readUiIpcResultEnvelopeContract: async() => createContract('failure', {
        status: 'blocked',
        resultEnvelopeContract: 'blocked',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.ui-ipc-result-envelope-source.blocked-source',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/result-envelope.json',
            recovery: 'retry'
          }
        ] as never
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError
    )
    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError)
      const result = (error as ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-result-envelope-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealDeliveryEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe response-delivery drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/result-envelope-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackUiIpcResultEnvelopeSource({
      enabled: true,
      readUiIpcResultEnvelopeContract: async() => createContract('success', {
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        electronHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        envelope: {
          ...createContract().envelope,
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...createEffects(),
          uiIpcResponseDelivered: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError)
      const result = (error as ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-result-envelope-source.unsafe-source'
        }),
        expect.objectContaining({
          stage: 'third-party.ui-ipc-result-envelope-source.envelope-blocked'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('result-envelope-source-selected-package-ids')
      expect('electronHost' in result).toBe(false)
      expect('envelope' in result).toBe(false)
      expectNoRealDeliveryEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
