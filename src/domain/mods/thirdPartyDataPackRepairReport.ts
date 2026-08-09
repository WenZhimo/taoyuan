import type { JsonValue } from './canonicalJson'
import type { ModDiagnostic, ModDiagnosticSeverity } from './diagnostics'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackDiscoveryIssue,
  ThirdPartyDataPackDiscoveryReport
} from './thirdPartyDataPackDiscovery'

export type ThirdPartyDataPackRepairReportStatus = 'clean' | 'repairable' | 'blocked'

export type ThirdPartyDataPackRepairRuleId =
  | 'PKG-REPAIR-MANIFEST-DEPENDENCIES-DEFAULT'
  | 'PKG-REPAIR-NOT-WHITELISTED'

export type ThirdPartyDataPackRepairActionDecision = 'whitelisted' | 'blocked'

export interface ThirdPartyDataPackRepairEffectSummary {
  readonly stagedNormalizedResultMutated: false
  readonly packageFilesWritten: false
  readonly registryPublished: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
}

export interface ThirdPartyDataPackRepairAction {
  readonly ruleId: ThirdPartyDataPackRepairRuleId
  readonly decision: ThirdPartyDataPackRepairActionDecision
  readonly packagePath?: string
  readonly packageId?: PackageId
  readonly file: string
  readonly fieldPath: string
  readonly beforeSummary: string
  readonly afterSummary: string
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
}

export interface ThirdPartyDataPackRepairReport {
  readonly status: ThirdPartyDataPackRepairReportStatus
  readonly actions: readonly ThirdPartyDataPackRepairAction[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackRepairEffectSummary
  readonly summary: {
    readonly candidateCount: number
    readonly whitelistedActionCount: number
    readonly blockedActionCount: number
    readonly diagnosticCount: number
  }
}

const blockingSeverities = new Set<ModDiagnosticSeverity>(['error', 'fatal'])
const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.repair-report.diagnostic-copy'
const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnostic['recovery']>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const createEffectSummary = (): ThirdPartyDataPackRepairEffectSummary => ({
  stagedNormalizedResultMutated: false,
  packageFilesWritten: false,
  registryPublished: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false
})

const isBlockingIssue = (issue: ThirdPartyDataPackDiscoveryIssue): boolean =>
  blockingSeverities.has(issue.severity)

const readJsonArrayLength = (value: readonly JsonValue[]): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }

  return descriptor
    && 'value' in descriptor
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    const length = readJsonArrayLength(value)
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

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value)
    } catch {
      return value
    }
    for (const key of keys) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, key)
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

const readDiagnosticArrayLength = (value: readonly unknown[]): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor
    && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const cloneDiagnosticPackageIds = (value: unknown): PackageId[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const length = readDiagnosticArrayLength(value)
  if (length === undefined) return undefined

  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value as PackageId)
    }
  }
  return result
}

const fallbackMessageKey = (code: string): string =>
  `mods.error.${code.toLowerCase().replace(/-/g, '.')}`

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

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] =>
  diagnostics.map(diagnostic => cloneDiagnostic(diagnostic))

const freezeRepairReport = (
  report: ThirdPartyDataPackRepairReport
): ThirdPartyDataPackRepairReport => deepFreezeObjectGraph(report)

const issueToBlockedAction = (issue: ThirdPartyDataPackDiscoveryIssue): ThirdPartyDataPackRepairAction => ({
  ruleId: 'PKG-REPAIR-NOT-WHITELISTED',
  decision: 'blocked',
  packagePath: issue.candidatePath,
  packageId: issue.packageId,
  file: issue.path,
  fieldPath: issue.fieldPath ?? '/',
  beforeSummary: issue.kind,
  afterSummary: 'unchanged',
  reason: 'No whitelisted read-only repair rule may change this diagnostic.',
  diagnostics: cloneDiagnostics(issue.diagnostics)
})

export const buildThirdPartyDataPackRepairReport = (
  discoveryReport: ThirdPartyDataPackDiscoveryReport
): ThirdPartyDataPackRepairReport => {
  const actions: ThirdPartyDataPackRepairAction[] = []

  if (discoveryReport.status === 'directory-not-found') {
    actions.push(...discoveryReport.issues.map(issueToBlockedAction))
  }

  for (const candidate of discoveryReport.candidates) {
    if (candidate.manifest && candidate.packageId && candidate.manifest.dependencies === undefined) {
      actions.push({
        ruleId: 'PKG-REPAIR-MANIFEST-DEPENDENCIES-DEFAULT',
        decision: 'whitelisted',
        packagePath: candidate.path,
        packageId: candidate.packageId,
        file: `${candidate.path}/manifest.json`,
        fieldPath: '/dependencies',
        beforeSummary: 'missing',
        afterSummary: '[]',
        reason: 'Legacy manifests may omit dependencies; the staged normalized result can treat it as an empty array.',
        diagnostics: []
      })
    }

    actions.push(...candidate.issues.filter(isBlockingIssue).map(issueToBlockedAction))
  }

  const whitelistedActionCount = actions.filter(action => action.decision === 'whitelisted').length
  const blockedActionCount = actions.filter(action => action.decision === 'blocked').length
  const diagnostics = actions.flatMap(action => cloneDiagnostics(action.diagnostics))

  return freezeRepairReport({
    status: blockedActionCount > 0
      ? 'blocked'
      : whitelistedActionCount > 0
        ? 'repairable'
        : 'clean',
    actions,
    diagnostics,
    effects: createEffectSummary(),
    summary: {
      candidateCount: discoveryReport.summary.candidateCount,
      whitelistedActionCount,
      blockedActionCount,
      diagnosticCount: diagnostics.length
    }
  })
}
