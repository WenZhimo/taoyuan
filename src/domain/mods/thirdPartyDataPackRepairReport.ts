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

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(item => cloneJsonValue(item))

  const result: Record<string, JsonValue> = {}
  for (const [key, entry] of Object.entries(value)) result[key] = cloneJsonValue(entry)
  return result
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined

  const result: Record<string, JsonValue> = {}
  for (const [key, value] of Object.entries(details)) result[key] = cloneJsonValue(value)
  return result
}

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => ({
  code: diagnostic.code,
  ruleId: diagnostic.ruleId,
  severity: diagnostic.severity,
  stage: diagnostic.stage,
  messageKey: diagnostic.messageKey,
  packageId: diagnostic.packageId,
  file: diagnostic.file,
  fieldPath: diagnostic.fieldPath,
  registryId: diagnostic.registryId,
  contentId: diagnostic.contentId,
  relatedPackageIds: diagnostic.relatedPackageIds ? [...diagnostic.relatedPackageIds] : undefined,
  details: cloneDiagnosticDetails(diagnostic.details),
  recovery: diagnostic.recovery
})

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] =>
  diagnostics.map(diagnostic => cloneDiagnostic(diagnostic))

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

  return {
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
  }
}
