import type { ModDiagnostic, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import type {
  ThirdPartyDataPackLockfileDraft,
  ThirdPartyDataPackLockfileDraftPackage
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

const packageEnvelopeFor = (
  envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope,
  packageId: PackageId
): ThirdPartyDataPackPackageFileStagingHostEnvelope =>
  packageId === envelope.targetPackageId
    ? envelope
    : deepFreezeObjectGraph({
        ...envelope,
        targetPackageId: packageId
      })

const packagePayloadScopeMatches = (
  file: ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile,
  packageDraft: ThirdPartyDataPackLockfileDraftPackage
): boolean => {
  const hasPackageScope = file.packageId !== undefined || file.packagePath !== undefined
  if (!hasPackageScope) return true
  return file.packageId === packageDraft.packageId
    || file.packagePath === packageDraft.source.candidatePath
}

const packagePayloadFor = (
  files: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[],
  packageDraft: ThirdPartyDataPackLockfileDraftPackage
): readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[] =>
  Object.freeze(files
    .filter(file => packagePayloadScopeMatches(file, packageDraft))
    .map(file => Object.freeze({
      path: file.path,
      contents: file.contents,
      sha256: file.sha256
    })))

const selectedPackageDrafts = (
  draft: ThirdPartyDataPackLockfileDraft,
  envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope
): readonly ThirdPartyDataPackLockfileDraftPackage[] => {
  const selectedPackageIds = new Set(envelope.selectedPackageIds)
  const packages = draft.packages.filter(pkg => selectedPackageIds.has(pkg.packageId))
  return Object.freeze(packages.length > 0
    ? packages
    : draft.packages.filter(pkg => pkg.packageId === envelope.targetPackageId))
}

const aggregateProbeStatus = (
  probeResults: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeResult[]
): ThirdPartyDataPackPackageFilePersistentWriteProbeResult['status'] | undefined => {
  if (probeResults.length === 0) return undefined
  if (probeResults.some(result => result.status === 'failed')) return 'failed'
  if (probeResults.some(result => result.status === 'blocked')) return 'blocked'
  if (probeResults.some(result => result.status === 'deferred')) return 'deferred'
  if (probeResults.some(result => result.status === 'skipped')) return 'skipped'
  return 'written'
}

const aggregatePackageFileWriteProbe = (
  probeResults: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeResult[]
): ThirdPartyDataPackPackageFilePersistentWriteProbeResult['packageFileWriteProbe'] =>
  probeResults.length > 0 && probeResults.every(result => result.packageFileWriteProbe === 'written')
    ? 'written'
    : 'deferred'

const effectSummary = (
  options: {
    readonly stagingResult?: ThirdPartyDataPackPackageFileStagingSourceResult
    readonly probeResults?: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeResult[]
    readonly continuationAllowed: boolean
  }
): ThirdPartyDataPackPackageFilePersistentStagingPipelineEffectSummary => ({
  packageFilePersistentStagingPipelineCalled: true,
  packageFileStagingSourceCalled: options.stagingResult?.effects.packageFileStagingSourceCalled ?? false,
  atomicCommitPreflightSourceCalled: options.stagingResult?.effects.atomicCommitPreflightSourceCalled ?? false,
  packageFilePersistentWriteProbeCalled: (options.probeResults?.length ?? 0) > 0,
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
  packageFilesWritten: options.probeResults?.some(result => result.effects.packageFilesWritten) ?? false,
  packageBackupsWritten: options.probeResults?.some(result => result.effects.packageBackupsWritten) ?? false,
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
    readonly probeResults?: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeResult[]
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackPackageFilePersistentStagingPipelineResult => {
  const stagingResult = options.stagingResult
  const probeResults = Object.freeze([...(options.probeResults ?? [])])
  const firstProbeResult = probeResults[0]
  const writtenFiles = Object.freeze(probeResults.flatMap(result => [...result.writtenFiles]))
  const continuationAllowed = options.status === 'written'
    || (options.status === 'skipped' && options.enabled === false)
  const probeStatus = aggregateProbeStatus(probeResults)
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_STAGING_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    enabled: options.enabled,
    packageFileStagingSourceStatus: stagingResult?.status,
    packageFilePersistentWriteProbeStatus: probeStatus,
    requestedCommandId: stagingResult?.requestedCommandId === 'install' ? 'install' : undefined,
    targetPackageId: stagingResult?.targetPackageId ?? firstProbeResult?.targetPackageId,
    selectedPackageIds: clonePackageIds(stagingResult?.selectedPackageIds ?? firstProbeResult?.selectedPackageIds),
    blockedPackageIds: clonePackageIds(stagingResult?.blockedPackageIds ?? firstProbeResult?.blockedPackageIds),
    loadOrder: clonePackageIds(stagingResult?.loadOrder ?? firstProbeResult?.loadOrder),
    registryCount: stagingResult?.registryCount ?? firstProbeResult?.registryCount ?? 54,
    entryCount: stagingResult?.entryCount ?? firstProbeResult?.entryCount ?? 4242,
    packageCount: stagingResult?.packageCount ?? firstProbeResult?.packageCount ?? 0,
    candidateHash: stagingResult?.candidateIdentity?.candidateHash ?? firstProbeResult?.candidateIdentity?.candidateHash,
    lockfileHash: stagingResult?.lockfileHash ?? firstProbeResult?.lockfileHash,
    packageFileWriteProbe: aggregatePackageFileWriteProbe(probeResults),
    writeProbeAllowed: probeResults.some(result => result.writeProbeAllowed),
    persistentWriteExecuted: probeResults.length > 0 && probeResults.every(result => result.persistentWriteExecuted),
    writtenFileCount: writtenFiles.length,
    backedUpFileCount: writtenFiles.filter(file => file.backedUp).length,
    writtenFiles,
    diagnostics: cloneDiagnostics([
      ...(options.diagnostics ?? []),
      ...(stagingResult?.diagnostics ?? []),
      ...probeResults.flatMap(result => [...result.diagnostics])
    ]),
    effects: effectSummary({
      stagingResult,
      probeResults,
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

  let probeResults: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeResult[] | undefined
  const readPackageFileStagingSource = createThirdPartyDataPackPackageFileStagingSource({
    enabled: true,
    readAtomicCommitPreflight: options.readAtomicCommitPreflight,
    stagePackageFiles: async envelope => {
      try {
        const draft = await options.readLockfileDraft!(envelope)
        const currentProbeResults: ThirdPartyDataPackPackageFilePersistentWriteProbeResult[] = []
        for (const packageDraft of selectedPackageDrafts(draft, envelope)) {
          const packageEnvelope = packageEnvelopeFor(envelope, packageDraft.packageId)
          const files = packagePayloadFor(
            await options.readPackageFilePayload!(packageEnvelope),
            packageDraft
          )
          currentProbeResults.push(await runThirdPartyDataPackPackageFilePersistentWriteProbe({
            envelope: packageEnvelope,
            draft,
            files,
            storage: options.storage!,
            allowPersistentWriteProbe: options.allowPersistentWriteProbe === true
          }))
        }
        probeResults = Object.freeze(currentProbeResults)
      } catch {
        return blockedHostResult(envelope, [
          commandDiagnostic(
            'third-party.package-file-persistent-staging-pipeline.probe-input-source-failed',
            envelope.targetPackageId
          )
        ])
      }

      if (probeResults.length > 0 && probeResults.every(result => result.status === 'written')) {
        return acceptedHostResult(envelope)
      }

      const status = aggregateProbeStatus(probeResults) ?? 'blocked'
      return blockedHostResult(envelope, [
        commandDiagnostic(
          `third-party.package-file-persistent-staging-pipeline.probe-${status}`,
          envelope.targetPackageId
        )
      ])
    }
  })

  try {
    const stagingResult = await readPackageFileStagingSource()
    if (stagingResult.status === 'accepted' && probeResults?.every(result => result.status === 'written')) {
      return baseResult({
        status: 'written',
        reason: 'package file staging source accepted persistent package-file write probe acknowledgements for selected packages',
        enabled: true,
        stagingResult,
        probeResults
      })
    }

    return baseResult({
      status: stagingResult.status === 'skipped' ? 'skipped' : 'blocked',
      reason: 'package file persistent staging pipeline did not reach an accepted persistent write acknowledgement',
      enabled: true,
      stagingResult,
      probeResults
    })
  } catch (error) {
    const stagingResult = error instanceof ThirdPartyDataPackPackageFileStagingBlockedError
      ? error.result
      : undefined
    const status = aggregateProbeStatus(probeResults ?? [])
    return baseResult({
      status: status === 'failed' ? 'failed' : status === 'deferred' ? 'deferred' : 'blocked',
      reason: 'package file persistent staging pipeline was blocked before command continuation',
      enabled: true,
      stagingResult,
      probeResults,
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
