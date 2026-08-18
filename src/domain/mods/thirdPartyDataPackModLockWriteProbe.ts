import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackModLockStorageAdapter,
  ThirdPartyDataPackModLockStorageReport
} from './thirdPartyDataPackModLockStorage'
import type {
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
} from './thirdPartyDataPackRecoveryLogReplayRestoreAdapter'

export type ThirdPartyDataPackModLockWriteProbeStatus =
  | 'deferred'
  | 'written'
  | 'skipped'
  | 'blocked'
  | 'failed'
export type ThirdPartyDataPackModLockWriteProbeCheckId =
  | 'replay-restore-adapter-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'draft-package-summary-consistent'
  | 'no-upstream-effects-intact'
  | 'explicit-write-probe-authorized'
  | 'storage-write-contained'

export interface ThirdPartyDataPackModLockWriteProbeCheck {
  readonly id: ThirdPartyDataPackModLockWriteProbeCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackModLockWriteProbeEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: boolean
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

export interface ThirdPartyDataPackModLockWriteProbeResult {
  readonly status: ThirdPartyDataPackModLockWriteProbeStatus
  readonly recoveryLogReplayRestoreStatus: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['status']
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly modLockWriteProbe: 'deferred' | 'written'
  readonly writeProbeAllowed: boolean
  readonly persistentWriteExecuted: boolean
  readonly storageKind?: ThirdPartyDataPackModLockStorageReport['storageKind']
  readonly storageStatus?: ThirdPartyDataPackModLockStorageReport['status']
  readonly storageOperation?: ThirdPartyDataPackModLockStorageReport['operation']
  readonly storageReason?: string
  readonly writeChecks: readonly ThirdPartyDataPackModLockWriteProbeCheck[]
  readonly effects: ThirdPartyDataPackModLockWriteProbeEffectSummary
}

export interface RunThirdPartyDataPackModLockWriteProbeOptions {
  readonly recoveryLogReplayRestoreAdapter: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
  readonly storage: ThirdPartyDataPackModLockStorageAdapter
  readonly draft: ThirdPartyDataPackLockfileDraft
  readonly allowPersistentWriteProbe?: boolean
}

const createEffectSummary = (
  options: { readonly lockfileWritten?: boolean } = {}
): ThirdPartyDataPackModLockWriteProbeEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: options.lockfileWritten ?? false,
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
  return Object.freeze(result) as string[]
}

const clonePackageIds = (value: unknown): PackageId[] =>
  cloneStringList(value) as PackageId[]

const readDiagnosticDataField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(diagnostic, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readDiagnosticStringField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): string | undefined => {
  const value = readDiagnosticDataField(diagnostic, fieldName)
  return typeof value === 'string' ? value : undefined
}

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.mod-lock-write-probe.diagnostic-copy'
const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnostic['recovery']>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const fallbackMessageKey = (code: string): string =>
  `mods.error.${code.toLowerCase().replace(/-/g, '.')}`

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    const length = readArrayLength(value)
    if (length === undefined) return []

    const result: JsonValue[] = []
    for (let index = 0; index < length; index += 1) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
      } catch {
        result.push(null)
        continue
      }
      result.push(descriptor?.enumerable === true && 'value' in descriptor
        ? cloneJsonValue(descriptor.value as JsonValue)
        : null)
    }
    return result
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value)
    } catch {
      return result
    }
    for (const key of keys) {
      if (typeof key !== 'string') continue
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        result[key] = cloneJsonValue(descriptor.value as JsonValue)
      }
    }
    return result
  }
  return value
}

const cloneDiagnosticPackageIds = (value: unknown): PackageId[] | undefined => {
  const result = clonePackageIds(value)
  return result.length > 0 ? Object.freeze(result) as PackageId[] : undefined
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined
  const result: Record<string, JsonValue> = {}
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(details)
  } catch {
    return result
  }
  for (const key of keys) {
    if (typeof key !== 'string') continue
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(details, key)
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result[key] = cloneJsonValue(descriptor.value as JsonValue)
    }
  }
  return result
}

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => {
  const code = readDiagnosticStringField(diagnostic, 'code') ?? diagnosticCopyFallbackCode
  const severity = readDiagnosticDataField(diagnostic, 'severity')
  const recovery = readDiagnosticDataField(diagnostic, 'recovery')
  return {
    code,
    ruleId: readDiagnosticStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readDiagnosticStringField(diagnostic, 'stage') ?? diagnosticCopyFallbackStage,
    messageKey: readDiagnosticStringField(diagnostic, 'messageKey') ?? fallbackMessageKey(code),
    packageId: readDiagnosticStringField(diagnostic, 'packageId') as PackageId | undefined,
    file: readDiagnosticStringField(diagnostic, 'file'),
    fieldPath: readDiagnosticStringField(diagnostic, 'fieldPath'),
    registryId: readDiagnosticStringField(diagnostic, 'registryId') as ModDiagnostic['registryId'],
    contentId: readDiagnosticStringField(diagnostic, 'contentId') as ModDiagnostic['contentId'],
    relatedPackageIds: cloneDiagnosticPackageIds(readDiagnosticDataField(diagnostic, 'relatedPackageIds')),
    details: cloneDiagnosticDetails(readDiagnosticDataField(diagnostic, 'details') as ModDiagnostic['details']),
    recovery: diagnosticRecoveries.has(recovery as ModDiagnostic['recovery'])
      ? recovery as ModDiagnostic['recovery']
      : 'none'
  }
}

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] => {
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
      result.push(cloneDiagnostic(descriptor.value as ModDiagnostic))
    }
  }
  return result
}

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
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

const check = (
  id: ThirdPartyDataPackModLockWriteProbeCheckId,
  status: ThirdPartyDataPackModLockWriteProbeCheck['status'],
  reason: string
): ThirdPartyDataPackModLockWriteProbeCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackModLockWriteProbeCheck[] => Object.freeze([
  'replay-restore-adapter-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'draft-package-summary-consistent',
  'no-upstream-effects-intact',
  'explicit-write-probe-authorized',
  'storage-write-contained'
].map(id => check(id as ThirdPartyDataPackModLockWriteProbeCheckId, 'skipped', reason)))

const everyEffectFalse = (effects: object): boolean =>
  Object.values(effects).every(value => value === false)

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const storageEffectsContained = (report: ThirdPartyDataPackModLockStorageReport): boolean =>
  report.operation === 'write'
  && report.status === 'written'
  && report.effects.lockfileWritten === true
  && report.effects.officialRegistryPublished === false
  && report.effects.thirdPartyRegistryPublished === false
  && report.effects.runtimeEnablementAllowed === false
  && report.effects.electronIpcExposed === false
  && report.effects.packageFilesWritten === false
  && report.effects.packageBackupsWritten === false
  && report.effects.settingsWritten === false
  && report.effects.savesWritten === false
  && report.effects.cacheWritten === false
  && report.effects.transactionLogWritten === false

const upstreamEffectsIntact = (
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): boolean =>
  replayRestore.recoveryLogReplayAllowed === false
  && replayRestore.persistentRestoreAllowed === false
  && replayRestore.writeAllowed === false
  && replayRestore.liveRegistryMutable === false
  && replayRestore.rollbackExecutionAllowed === false
  && everyEffectFalse(replayRestore.effects)

const buildWriteChecks = (
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  draft: ThirdPartyDataPackLockfileDraft,
  allowPersistentWriteProbe: boolean,
  storageReport?: ThirdPartyDataPackModLockStorageReport
): readonly ThirdPartyDataPackModLockWriteProbeCheck[] => Object.freeze([
  check(
    'replay-restore-adapter-deferred',
    replayRestore.status === 'deferred' ? 'satisfied' : 'blocked',
    'Recovery replay and restore adapter must remain deferred before an isolated mod-lock write probe can run.'
  ),
  check(
    'candidate-identity-consistent',
    replayRestore.candidateIdentity?.candidateHash !== undefined
      && replayRestore.candidateIdentity.candidateHash === draft.candidateIdentity.candidateHash
      ? 'satisfied'
      : 'blocked',
    'The draft candidate hash must match the upstream replay/restore candidate identity.'
  ),
  check(
    'lockfile-hash-consistent',
    replayRestore.lockfileHash !== undefined && replayRestore.lockfileHash === draft.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'The draft self hash must match the upstream lockfile hash before any write probe can run.'
  ),
  check(
    'draft-package-summary-consistent',
    arraysEqual(clonePackageIds(replayRestore.selectedPackageIds), clonePackageIds(draft.selectedPackageIds))
      && arraysEqual(clonePackageIds(replayRestore.loadOrder), clonePackageIds(draft.loadOrder))
      && replayRestore.packageCount === draft.packages.length
      && replayRestore.registryCount === draft.registryCount
      && replayRestore.entryCount === draft.entryCount
      ? 'satisfied'
      : 'blocked',
    'The draft selected package ids, load order, package count and registry totals must match the upstream summary.'
  ),
  check(
    'no-upstream-effects-intact',
    upstreamEffectsIntact(replayRestore) ? 'satisfied' : 'blocked',
    'Upstream replay/restore planning must still expose only false publication, replay, restore and write effects.'
  ),
  check(
    'explicit-write-probe-authorized',
    allowPersistentWriteProbe ? 'satisfied' : 'skipped',
    allowPersistentWriteProbe
      ? 'This call explicitly authorized an isolated mod-lock write probe.'
      : 'Persistent mod-lock write probing was not explicitly authorized for this call.'
  ),
  check(
    'storage-write-contained',
    storageReport === undefined
      ? 'skipped'
      : storageEffectsContained(storageReport) ? 'satisfied' : 'blocked',
    'The storage write report must be a write operation that only marks lockfileWritten and leaves every other runtime/storage effect false.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackModLockWriteProbeCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.mod-lock-write-probe.checks',
    severity: 'error',
    fieldPath: `/writeChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const diagnosticsForUnexpectedError = (): readonly ModDiagnostic[] => [
  createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.mod-lock-write-probe.storage',
    severity: 'error',
    details: {
      reason: 'storage adapter threw before returning a write report'
    },
    recovery: 'retry'
  })
]

const freezeResult = (
  result: ThirdPartyDataPackModLockWriteProbeResult
): ThirdPartyDataPackModLockWriteProbeResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackModLockWriteProbeStatus,
  reason: string,
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  writeChecks: readonly ThirdPartyDataPackModLockWriteProbeCheck[],
  diagnostics: readonly ModDiagnostic[],
  options: {
    readonly storageReport?: ThirdPartyDataPackModLockStorageReport
    readonly lockfileWritten?: boolean
  } = {}
): ThirdPartyDataPackModLockWriteProbeResult => freezeResult({
  status,
  recoveryLogReplayRestoreStatus: replayRestore.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(replayRestore.selectedPackageIds),
  blockedPackageIds: clonePackageIds(replayRestore.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(replayRestore.blockedCandidatePaths),
  loadOrder: clonePackageIds(replayRestore.loadOrder),
  registryCount: replayRestore.registryCount,
  entryCount: replayRestore.entryCount,
  packageCount: replayRestore.packageCount,
  officialIdentity: cloneOfficialIdentity(replayRestore.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(replayRestore.candidateIdentity),
  lockfileHash: replayRestore.lockfileHash,
  modLockWriteProbe: options.lockfileWritten ? 'written' : 'deferred',
  writeProbeAllowed: writeChecks.some(currentCheck =>
    currentCheck.id === 'explicit-write-probe-authorized' && currentCheck.status === 'satisfied'
  ),
  persistentWriteExecuted: options.lockfileWritten ?? false,
  storageKind: options.storageReport?.storageKind,
  storageStatus: options.storageReport?.status,
  storageOperation: options.storageReport?.operation,
  storageReason: options.storageReport?.reason,
  writeChecks,
  effects: createEffectSummary({ lockfileWritten: options.lockfileWritten })
})

export const runThirdPartyDataPackModLockWriteProbe = async(
  options: RunThirdPartyDataPackModLockWriteProbeOptions
): Promise<ThirdPartyDataPackModLockWriteProbeResult> => {
  const replayRestore = options.recoveryLogReplayRestoreAdapter

  if (replayRestore.status === 'skipped') {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      replayRestore,
      skippedChecks(reason),
      []
    )
  }

  if (replayRestore.status === 'blocked') {
    return baseResult(
      'blocked',
      replayRestore.reason,
      replayRestore,
      skippedChecks(replayRestore.reason),
      cloneDiagnostics(replayRestore.diagnostics)
    )
  }

  const preWriteChecks = buildWriteChecks(
    replayRestore,
    options.draft,
    options.allowPersistentWriteProbe === true
  )
  const preWriteBlockedDiagnostics = diagnosticsForBlockedChecks(preWriteChecks)
  if (preWriteBlockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'mod-lock write probe inputs are inconsistent',
      replayRestore,
      preWriteChecks,
      [
        ...cloneDiagnostics(replayRestore.diagnostics),
        ...preWriteBlockedDiagnostics
      ]
    )
  }

  if (options.allowPersistentWriteProbe !== true) {
    return baseResult(
      'deferred',
      'mod-lock write probe is deferred until an isolated persistent write probe is explicitly authorized',
      replayRestore,
      preWriteChecks,
      cloneDiagnostics(replayRestore.diagnostics)
    )
  }

  let storageReport: ThirdPartyDataPackModLockStorageReport
  try {
    storageReport = (await options.storage.write(options.draft)).report
  } catch {
    return baseResult(
      'failed',
      'mod-lock storage adapter failed before returning a write report',
      replayRestore,
      buildWriteChecks(replayRestore, options.draft, true),
      [
        ...cloneDiagnostics(replayRestore.diagnostics),
        ...diagnosticsForUnexpectedError()
      ]
    )
  }

  const writeChecks = buildWriteChecks(replayRestore, options.draft, true, storageReport)
  const blockedDiagnostics = diagnosticsForBlockedChecks(writeChecks)
  if (storageReport.status !== 'written' || blockedDiagnostics.length > 0) {
    return baseResult(
      'failed',
      'mod-lock storage adapter did not complete a contained lockfile-only write',
      replayRestore,
      writeChecks,
      [
        ...cloneDiagnostics(replayRestore.diagnostics),
        ...cloneDiagnostics(storageReport.diagnostics),
        ...blockedDiagnostics
      ],
      { storageReport }
    )
  }

  return baseResult(
    'written',
    'mod-lock write probe completed an isolated lockfile-only persistent write',
    replayRestore,
    writeChecks,
    [
      ...cloneDiagnostics(replayRestore.diagnostics),
      ...cloneDiagnostics(storageReport.diagnostics)
    ],
    {
      storageReport,
      lockfileWritten: true
    }
  )
}
