import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitOutcomeContract'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import {
  executeThirdPartyDataPackPostCommitVerificationExecutorAdapter,
  type ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  type ThirdPartyDataPackPostCommitVerificationExecutorHost,
  type ThirdPartyDataPackPostCommitVerificationOutcomeKind
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorPreflight'
import {
  buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff,
  type ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff,
  type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff'
import {
  buildThirdPartyDataPackUiIpcResultNormalizationPreflight,
  type ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  type ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'

const packageId = 'sample_pack' as PackageId
const alternatePackageId = 'alternate_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const atomicEffects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary = {
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
  diagnosticsWritten: false
}

const verificationPreflightEffects: ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary = {
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
  transactionCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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

const createAtomicPreflight = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'atomic transaction commit executor preflight is inspect-only until real transaction-log, package, settings, lockfile, runtime publication and rollback adapters exist',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  atomicTransactionCommitExecutorPreflight: 'deferred',
  readOnly: true,
  atomicCommitExecutionAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimePublicationCommitAllowed: false,
  runtimeEnablementAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
  rollbackRecoveryAllowed: false,
  executorChecks: [],
  executorStages: [
    {
      id: 'atomic-commit-executor-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'Atomic commit executor preflight is inspect-only.'
    },
    {
      id: 'post-commit-verification-handoff',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification handoff remains deferred.'
    },
    {
      id: 'ui-ipc-result-normalization',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'UI/IPC result normalization remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI or IPC results must expose only redacted outcome summaries.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'deferred',
    transactionLogWriteProbeStatus: 'deferred',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  effects: atomicEffects,
  ...overrides
})

const createVerificationPreflight = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  reason: 'post-commit verification executor preflight is inspect-only until real committed state, live registry identity and UI/IPC result delivery exist',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  postCommitVerificationExecutorPreflight: 'deferred',
  readOnly: true,
  verificationExecutionAllowed: false,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  rollbackTriggerAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  executorChecks: [],
  executorStages: [
    {
      id: 'post-commit-executor-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['committed-transaction-log-source'],
      reason: 'Post-commit executor preflight is inspect-only.'
    },
    {
      id: 'ui-ipc-result-normalization',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'UI/IPC result normalization remains deferred.'
    },
    {
      id: 'rollback-recovery-trigger',
      status: 'deferred',
      requirementIds: ['rollback-recovery-trigger'],
      reason: 'Rollback trigger remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI or IPC results must expose only redacted outcome summaries.'
    }
  ],
  effects: verificationPreflightEffects,
  ...overrides
})

const createVerificationHost = (
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): ThirdPartyDataPackPostCommitVerificationExecutorHost => ({
  kind: 'injected-post-commit-verification-executor',
  mode: 'injected-test-only',
  execute: request => ({
    kind,
    settled: true,
    packageId: request.packageId,
    candidateIdentity: request.candidateIdentity,
    lockfileHash: request.lockfileHash,
    transactionLogMatched: kind === 'verified',
    packageStateMatched: kind === 'verified',
    settingsLockfileMatched: kind === 'verified',
    liveRegistryMatched: kind === 'verified',
    saveCacheIsolated: kind === 'verified',
    recovery: kind === 'rollback' ? 'restore-backup' : kind === 'retry' ? 'retry' : 'none',
    retryable: kind === 'retry',
    rollbackRequired: kind === 'rollback'
  })
})

const createNormalizationPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult> = {}
): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
  ...buildThirdPartyDataPackUiIpcResultNormalizationPreflight({
    atomicTransactionCommitExecutorPreflight: createAtomicPreflight(),
    postCommitVerificationExecutorPreflight: createVerificationPreflight()
  }),
  effects: normalizationEffects,
  ...overrides
})

const createAtomicOutcomeContract = (
  kind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind = 'committed',
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult => ({
  ...buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
    preflight: createAtomicPreflight(),
    outcome: {
      kind,
      settled: true,
      packageId,
      candidateIdentity,
      lockfileHash,
      recovery: kind === 'rollback' ? 'restore-backup' : kind === 'retry' ? 'retry' : 'none',
      retryable: kind === 'retry',
      rollbackRequired: kind === 'rollback'
    }
  }),
  ...overrides
})

const createVerificationAdapterResult = async (
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind = 'verified',
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> = {}
): Promise<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> => ({
  ...await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
    preflight: createVerificationPreflight(),
    host: createVerificationHost(kind)
  }),
  ...overrides
})

const createReadyContext = async (
  overrides: {
    readonly preflight?: Partial<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult>
    readonly handoff?: Partial<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>
    readonly atomicKind?: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
    readonly verificationKind?: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  } = {}
) => {
  const preflight = createNormalizationPreflight(overrides.preflight)
  const handoff = {
    ...buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff({
      resultNormalizationPreflight: preflight,
      atomicCommitOutcomeContract: createAtomicOutcomeContract(overrides.atomicKind),
      postCommitVerificationExecutorAdapter: await createVerificationAdapterResult(overrides.verificationKind)
    }),
    ...overrides.handoff
  } as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
  return { preflight, handoff }
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealEffects = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult,
  prepared: boolean
): void => {
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
  expect(result.effects.uiIpcOutcomeConsumed).toBe(prepared)
  expect(result.effects.resultEnvelopeNormalized).toBe(prepared)
  expect(result.effects.responseDeliveryPreflightPrepared).toBe(prepared)
  expect(result.effects.platformSplitPrepared).toBe(prepared)
  const {
    uiIpcOutcomeConsumed: _uiIpcOutcomeConsumed,
    resultEnvelopeNormalized: _resultEnvelopeNormalized,
    responseDeliveryPreflightPrepared: _responseDeliveryPreflightPrepared,
    platformSplitPrepared: _platformSplitPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party UI/IPC response delivery orchestration handoff', () => {
  it('orchestrates a verified outcome into envelope, delivery preflight and platform split without real delivery effects', async () => {
    const { preflight, handoff } = await createReadyContext()
    const result = buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff({
      resultNormalizationPreflight: preflight,
      postCommitVerificationUiIpcOutcomeHandoff: handoff
    })

    expect(result.status).toBe('deferred')
    expect(result.uiIpcResponseDeliveryOrchestrationHandoff).toBe('deferred')
    expect(result.resultNormalizationPreflightStatus).toBe('deferred')
    expect(result.postCommitVerificationUiIpcOutcomeHandoffStatus).toBe('ready')
    expect(result.resultEnvelopeContractStatus).toBe('ready')
    expect(result.responseDeliveryPreflightStatus).toBe('deferred')
    expect(result.platformSplitContractStatus).toBe('deferred')
    expect(result.orchestrationPrepared).toBe(true)
    expect(result.envelopeNormalized).toBe(true)
    expect(result.deliveryEnvelopePrepared).toBe(true)
    expect(result.platformSplitPrepared).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.deliveryEnvelope).toEqual({
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
    expect(result.platformAdapters.map(adapter => [
      adapter.platform,
      adapter.status,
      adapter.transport
    ])).toEqual([
      ['electron', 'deferred', 'electron-preload-response-channel'],
      ['web', 'deferred', 'web-ui-response-event-sink'],
      ['android', 'deferred', 'android-native-response-event-sink']
    ])
    expect(result.orchestrationStages.map(stage => [stage.id, stage.status])).toEqual([
      ['response-delivery-orchestration-inspection', 'satisfied'],
      ['result-envelope-normalization', 'satisfied'],
      ['response-delivery-adapter-preflight', 'satisfied'],
      ['platform-response-delivery-split', 'satisfied'],
      ['real-platform-response-delivery', 'deferred'],
      ['startup-gate-handoff', 'deferred']
    ])
    expect(result.orchestrationRequirements.map(requirement => requirement.id)).toEqual([
      'path-free-outcome-source',
      'result-envelope-contract',
      'response-delivery-adapter-preflight',
      'platform-response-delivery-split',
      'real-platform-response-sink',
      'startup-gate-result-handoff',
      'no-delivery-side-effect-guard'
    ])
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expectNoRealEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('carries retry outcome semantics through the envelope while keeping sinks deferred', async () => {
    const { preflight, handoff } = await createReadyContext({
      atomicKind: 'retry',
      verificationKind: 'retry'
    })
    const result = buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff({
      resultNormalizationPreflight: preflight,
      postCommitVerificationUiIpcOutcomeHandoff: handoff
    })

    expect(result.status).toBe('deferred')
    expect(result.envelopeKind).toBe('retry')
    expect(result.deliveryEnvelope?.kind).toBe('retry')
    expect(result.deliveryEnvelope?.messageKey).toBe('mods.ui.ipc.result.install.retry')
    expect(result.deliveryEnvelope?.retryable).toBe(true)
    expect(result.deliveryEnvelope?.rollbackRequired).toBe(false)
    expect(result.platformAdapters.every(adapter => adapter.status === 'deferred')).toBe(true)
    expectNoRealEffects(result, true)
  })

  it('blocks orchestration when the source preflight drifts from the handoff outcome target', async () => {
    const { preflight, handoff } = await createReadyContext()
    const result = buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff({
      resultNormalizationPreflight: {
        ...preflight,
        targetPackageId: alternatePackageId,
        selectedPackageIds: [alternatePackageId],
        loadOrder: [alternatePackageId]
      },
      postCommitVerificationUiIpcOutcomeHandoff: handoff
    })

    expect(result.status).toBe('blocked')
    expect(result.orchestrationPrepared).toBe(false)
    expect(result.resultEnvelopeContractStatus).toBe('blocked')
    expect(result.responseDeliveryPreflightStatus).toBe('blocked')
    expect(result.platformSplitContractStatus).toBe('blocked')
    expect(result.checks.find(check => check.id === 'target-package-consistent')?.status).toBe('blocked')
    expect(result.diagnostics.some(diagnostic => diagnostic.stage.endsWith('target-package-consistent'))).toBe(true)
    expect(result.deliveryEnvelope).toBeUndefined()
    expectNoRealEffects(result, false)
  })

  it('does not read unsafe diagnostic getters while forwarding sanitized diagnostics into the envelope chain', async () => {
    const { preflight, handoff } = await createReadyContext()
    const unsafeDiagnostic = {}
    Object.defineProperties(unsafeDiagnostic, {
      code: {
        enumerable: true,
        get: () => {
          throw new Error('C:/Users/LENOVO/secret-mods/path')
        }
      },
      messageKey: {
        enumerable: true,
        get: () => {
          throw new Error('hostile-fragment')
        }
      }
    })
    const handoffWithUnsafeDiagnostics = {
      ...handoff,
      diagnostics: [unsafeDiagnostic],
      outcome: {
        ...handoff.outcome,
        diagnostics: [unsafeDiagnostic]
      }
    } as unknown as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult

    const result = buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff({
      resultNormalizationPreflight: preflight,
      postCommitVerificationUiIpcOutcomeHandoff: handoffWithUnsafeDiagnostics
    })

    expect(result.status).toBe('deferred')
    expect(result.diagnostics.length).toBeGreaterThan(0)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('hostile-fragment')
    expect(result.diagnostics.every(diagnostic => diagnostic.code === 'LIFECYCLE-TRANSACTION-001')).toBe(true)
    expectNoRealEffects(result, true)
  })
})
