import type { ModDiagnostic, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import type {
  ThirdPartyDataPackLockfileDraft
} from './thirdPartyDataPackLockfileDraft'
import {
  runThirdPartyDataPackPackageFilePersistentWriteProbe,
  type ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile,
  type ThirdPartyDataPackPackageFilePersistentWriteProbeResult,
  type ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter,
  type ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile
} from './thirdPartyDataPackPackageFilePersistentWriteProbe'
import {
  createThirdPartyDataPackPackageFileStagingSource,
  ThirdPartyDataPackPackageFileStagingBlockedError,
  type ThirdPartyDataPackPackageFileStagingHostEffectSummary,
  type ThirdPartyDataPackPackageFileStagingHostEnvelope,
  type ThirdPartyDataPackPackageFileStagingHostResult,
  type ThirdPartyDataPackPackageFileStagingSourceResult
} from './thirdPartyDataPackPackageFileStagingSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_KIND =
  'third-party-package-file-persistent-staging-pipeline'
export const THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_MODE =
  'default-disabled-package-file-persistent-staging-pipeline'

export type ThirdPartyDataPackPackageFilePersistentStagingPipelineStatus =
  | 'skipped'
  | 'deferred'
  | 'written'
  | 'blocked'
  | 'failed'

export interface ThirdPartyDataPackPackageFilePersistentStagingPipelineEffectSummary {
  readonly packageFilePersistentStagingPipelineCalled: boolean
  readonly packageFileStagingSourceCalled: boolean
  readonly atomicCommitPreflightSourceCalled: boolean
  readonly packageFilePersistentWriteProbeCalled: boolean
  readonly injectedPackageFileStagingHostCalled: boolean
  readonly packageFileStagingHostAccepted: boolean
  readonly commandContinuationAllowed: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
  readonly packageFilesRestored: false
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackPackageFilePersistentStagingPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_MODE
  readonly status: ThirdPartyDataPackPackageFilePersistentStagingPipelineStatus
  readonly reason: string
  readonly enabled: boolean
  readonly packageFileStagingSourceStatus?: ThirdPartyDataPackPackageFileStagingSourceResult['status']
  readonly packageFilePersistentWriteProbeStatus?: ThirdPartyDataPackPackageFilePersistentWriteProbeResult['status']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly packageFileWriteProbe: 'deferred' | 'written'
  readonly writeProbeAllowed: boolean
  readonly persistentWriteExecuted: boolean
  readonly writtenFileCount: number
  readonly backedUpFileCount: number
  readonly writtenFiles: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackPackageFilePersistentStagingPipelineEffectSummary
}

export interface CreateThirdPartyDataPackPackageFilePersistentStagingPipelineOptions {
  readonly enabled?: boolean
  readonly allowPersistentWriteProbe?: boolean
  readonly readAtomicCommitPreflight?: () =>
    Awaitable<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult>
  readonly readLockfileDraft?: (
    envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope
  ) => Awaitable<ThirdPartyDataPackLockfileDraft>
  readonly readPackageFilePayload?: (
    envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope
  ) => Awaitable<readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[]>
  readonly storage?: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter
}

const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnostic['recovery']>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    if (!Object.isFrozen(value)) Object.freeze(value)
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value as object)
    } catch {
      return value
    }
    for (const key of keys) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value as object, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        deepFreezeObjectGraph(descriptor.value)
      }
    }
  }
  return value
}

const readOwnDataField = (
  value: object | undefined,
  fieldName: string
): unknown => {
  if (value === undefined) return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readArrayLength = (value: readonly unknown[]): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const cloneStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const result: string[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value)
    }
  }
  return result
}

const clonePackageIds = (value: unknown): PackageId[] =>
  cloneStringList(value) as PackageId[]

const cloneDiagnostic = (diagnostic: unknown): ModDiagnostic | undefined => {
  if (diagnostic === null || typeof diagnostic !== 'object') return undefined
  const code = readOwnDataField(diagnostic, 'code')
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  const stage = readOwnDataField(diagnostic, 'stage')
  return {
    code: typeof code === 'string' ? code : 'LIFECYCLE-TRANSACTION-001',
    ruleId: typeof readOwnDataField(diagnostic, 'ruleId') === 'string'
      ? readOwnDataField(diagnostic, 'ruleId') as string
      : typeof code === 'string' ? code : 'LIFECYCLE-TRANSACTION-001',
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: typeof stage === 'string'
      ? stage
      : 'third-party.package-file-persistent-staging-pipeline.diagnostic-copy',
    messageKey: typeof readOwnDataField(diagnostic, 'messageKey') === 'string'
      ? readOwnDataField(diagnostic, 'messageKey') as string
      : 'mods.error.lifecycle.transaction.001',
    packageId: readOwnDataField(diagnostic, 'packageId') as PackageId | undefined,
    fieldPath: typeof readOwnDataField(diagnostic, 'fieldPath') === 'string'
      ? readOwnDataField(diagnostic, 'fieldPath') as string
      : undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnostic['recovery'])
      ? recovery as ModDiagnostic['recovery']
      : 'none'
  }
}

const cloneDiagnostics = (diagnostics: readonly unknown[] | undefined): ModDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return []
  const length = readArrayLength(diagnostics)
  if (length === undefined) return []

  const result: ModDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      const diagnostic = cloneDiagnostic(descriptor.value)
      if (diagnostic) result.push(diagnostic)
    }
  }
  return result
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ModDiagnostic => ({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const stagingHostEffects = (
  accepted: boolean
): ThirdPartyDataPackPackageFileStagingHostEffectSummary => ({
  packageFileStagingHostCalled: true,
  packageFileStagingHostAccepted: accepted,
  transactionCommitted: false,
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
})

const acceptedHostResult = (
  envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope
): ThirdPartyDataPackPackageFileStagingHostResult => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: [...envelope.selectedPackageIds],
  blockedPackageIds: [...envelope.blockedPackageIds],
  loadOrder: [...envelope.loadOrder],
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  diagnostics: [],
  effects: stagingHostEffects(true)
})

const blockedHostResult = (
  envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope,
  diagnostics: readonly ModDiagnostic[]
): ThirdPartyDataPackPackageFileStagingHostResult => ({
  status: 'blocked',
  targetPackageId: envelope.targetPackageId,
  diagnostics,
  effects: stagingHostEffects(false)
})

const effectSummary = (
  options: {
    readonly stagingResult?: ThirdPartyDataPackPackageFileStagingSourceResult
    readonly probeResult?: ThirdPartyDataPackPackageFilePersistentWriteProbeResult
    readonly continuationAllowed: boolean
  }
): ThirdPartyDataPackPackageFilePersistentStagingPipelineEffectSummary => ({
  packageFilePersistentStagingPipelineCalled: true,
  packageFileStagingSourceCalled: options.stagingResult?.effects.packageFileStagingSourceCalled ?? false,
  atomicCommitPreflightSourceCalled: options.stagingResult?.effects.atomicCommitPreflightSourceCalled ?? false,
  packageFilePersistentWriteProbeCalled: options.probeResult !== undefined,
  injectedPackageFileStagingHostCalled: options.stagingResult?.effects.injectedPackageFileStagingHostCalled ?? false,
  packageFileStagingHostAccepted: options.stagingResult?.effects.packageFileStagingHostAccepted ?? false,
  commandContinuationAllowed: options.continuationAllowed,
  appBootstrapContinuationAllowed: options.continuationAllowed,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: options.probeResult?.effects.packageFilesWritten ?? false,
  packageBackupsWritten: options.probeResult?.effects.packageBackupsWritten ?? false,
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

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackPackageFilePersistentStagingPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly stagingResult?: ThirdPartyDataPackPackageFileStagingSourceResult
    readonly probeResult?: ThirdPartyDataPackPackageFilePersistentWriteProbeResult
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackPackageFilePersistentStagingPipelineResult => {
  const stagingResult = options.stagingResult
  const probeResult = options.probeResult
  const continuationAllowed = options.status === 'written'
    || (options.status === 'skipped' && options.enabled === false)
  const writtenFiles = Object.freeze([...(probeResult?.writtenFiles ?? [])])
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    enabled: options.enabled,
    packageFileStagingSourceStatus: stagingResult?.status,
    packageFilePersistentWriteProbeStatus: probeResult?.status,
    requestedCommandId: stagingResult?.requestedCommandId === 'install' ? 'install' : undefined,
    targetPackageId: stagingResult?.targetPackageId ?? probeResult?.targetPackageId,
    selectedPackageIds: clonePackageIds(stagingResult?.selectedPackageIds ?? probeResult?.selectedPackageIds),
    blockedPackageIds: clonePackageIds(stagingResult?.blockedPackageIds ?? probeResult?.blockedPackageIds),
    loadOrder: clonePackageIds(stagingResult?.loadOrder ?? probeResult?.loadOrder),
    registryCount: stagingResult?.registryCount ?? probeResult?.registryCount ?? 54,
    entryCount: stagingResult?.entryCount ?? probeResult?.entryCount ?? 4242,
    packageCount: stagingResult?.packageCount ?? probeResult?.packageCount ?? 0,
    candidateHash: stagingResult?.candidateIdentity?.candidateHash ?? probeResult?.candidateIdentity?.candidateHash,
    lockfileHash: stagingResult?.lockfileHash ?? probeResult?.lockfileHash,
    packageFileWriteProbe: probeResult?.packageFileWriteProbe ?? 'deferred',
    writeProbeAllowed: probeResult?.writeProbeAllowed ?? false,
    persistentWriteExecuted: probeResult?.persistentWriteExecuted ?? false,
    writtenFileCount: probeResult?.writtenFileCount ?? 0,
    backedUpFileCount: probeResult?.backedUpFileCount ?? 0,
    writtenFiles,
    diagnostics: cloneDiagnostics([
      ...(options.diagnostics ?? []),
      ...(stagingResult?.diagnostics ?? []),
      ...(probeResult?.diagnostics ?? [])
    ]),
    effects: effectSummary({
      stagingResult,
      probeResult,
      continuationAllowed
    })
  })
}

export const createThirdPartyDataPackPackageFilePersistentStagingPipeline = (
  options: CreateThirdPartyDataPackPackageFilePersistentStagingPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackPackageFilePersistentStagingPipelineResult>) => async() => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party package file persistent staging pipeline is disabled by default',
      enabled: false
    })
  }

  if (
    options.readAtomicCommitPreflight === undefined
    || options.readLockfileDraft === undefined
    || options.readPackageFilePayload === undefined
    || options.storage === undefined
  ) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party package file persistent staging pipeline is enabled without all required injected sources',
      enabled: true,
      diagnostics: [
        commandDiagnostic('third-party.package-file-persistent-staging-pipeline.missing-source')
      ]
    })
  }

  let probeResult: ThirdPartyDataPackPackageFilePersistentWriteProbeResult | undefined
  const readPackageFileStagingSource = createThirdPartyDataPackPackageFileStagingSource({
    enabled: true,
    readAtomicCommitPreflight: options.readAtomicCommitPreflight,
    stagePackageFiles: async envelope => {
      try {
        const draft = await options.readLockfileDraft!(envelope)
        const files = await options.readPackageFilePayload!(envelope)
        probeResult = await runThirdPartyDataPackPackageFilePersistentWriteProbe({
          envelope,
          draft,
          files,
          storage: options.storage!,
          allowPersistentWriteProbe: options.allowPersistentWriteProbe === true
        })
      } catch {
        return blockedHostResult(envelope, [
          commandDiagnostic(
            'third-party.package-file-persistent-staging-pipeline.probe-input-source-failed',
            envelope.targetPackageId
          )
        ])
      }

      if (probeResult.status === 'written') {
        return acceptedHostResult(envelope)
      }

      return blockedHostResult(envelope, [
        commandDiagnostic(
          `third-party.package-file-persistent-staging-pipeline.probe-${probeResult.status}`,
          envelope.targetPackageId
        )
      ])
    }
  })

  try {
    const stagingResult = await readPackageFileStagingSource()
    if (stagingResult.status === 'accepted' && probeResult?.status === 'written') {
      return baseResult({
        status: 'written',
        reason: 'package file staging source accepted a persistent package-file write probe acknowledgement',
        enabled: true,
        stagingResult,
        probeResult
      })
    }

    return baseResult({
      status: stagingResult.status === 'skipped' ? 'skipped' : 'blocked',
      reason: 'package file persistent staging pipeline did not reach an accepted persistent write acknowledgement',
      enabled: true,
      stagingResult,
      probeResult
    })
  } catch (error) {
    const stagingResult = error instanceof ThirdPartyDataPackPackageFileStagingBlockedError
      ? error.result
      : undefined
    return baseResult({
      status: probeResult?.status === 'failed' ? 'failed' : probeResult?.status === 'deferred' ? 'deferred' : 'blocked',
      reason: 'package file persistent staging pipeline was blocked before command continuation',
      enabled: true,
      stagingResult,
      probeResult,
      diagnostics: [
        ...(!(error instanceof ThirdPartyDataPackPackageFileStagingBlockedError)
          ? [commandDiagnostic('third-party.package-file-persistent-staging-pipeline.source-failed')]
          : [])
      ]
    })
  }
}

export const thirdPartyDataPackPackageFilePersistentStagingPipeline =
  createThirdPartyDataPackPackageFilePersistentStagingPipeline()
