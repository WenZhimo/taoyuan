import { compareCodePoints, type JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { PackageDependency, PackageManifest } from './schemas'
import {
  satisfiesPackageVersionRange,
  type ThirdPartyDataPackCandidate,
  type ThirdPartyDataPackDiscoveryIssue,
  type ThirdPartyDataPackDiscoveryReport
} from './thirdPartyDataPackDiscovery'
import type { PackageId } from './ids'

export type ThirdPartyDataPackSelectionIssueKind =
  | 'duplicate-package-id'
  | 'required-dependency-blocked'
  | 'dependency-cycle'

export type ThirdPartyDataPackBlockedReason =
  | 'discovery-blocked'
  | 'duplicate-package-id'
  | 'required-dependency-blocked'
  | 'dependency-cycle'

export type ThirdPartyDataPackSelectionStatus = 'completed' | 'blocked'

export interface ThirdPartyDataPackSelectionIssue {
  readonly kind: ThirdPartyDataPackSelectionIssueKind
  readonly severity: ModDiagnosticSeverity
  readonly path: string
  readonly candidatePath: string
  readonly packageId: PackageId
  readonly relatedPackageIds?: readonly PackageId[]
  readonly fieldPath?: string
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
}

export interface ThirdPartyDataPackSelectedPackage {
  readonly path: string
  readonly packageId: PackageId
  readonly version: string
}

export interface ThirdPartyDataPackBlockedPackage {
  readonly path: string
  readonly packageId?: PackageId
  readonly version?: string
  readonly reasons: readonly ThirdPartyDataPackBlockedReason[]
  readonly discoveryIssues: readonly ThirdPartyDataPackDiscoveryIssue[]
  readonly selectionIssues: readonly ThirdPartyDataPackSelectionIssue[]
}

export interface ThirdPartyDataPackSelectionReport {
  readonly status: ThirdPartyDataPackSelectionStatus
  readonly selectedPackages: readonly ThirdPartyDataPackSelectedPackage[]
  readonly blockedPackages: readonly ThirdPartyDataPackBlockedPackage[]
  readonly loadOrder: readonly PackageId[]
  readonly issues: readonly ThirdPartyDataPackSelectionIssue[]
  readonly summary: {
    readonly candidateCount: number
    readonly selectedPackageCount: number
    readonly blockedPackageCount: number
    readonly issueCount: number
  }
}

interface SelectableCandidate {
  readonly path: string
  readonly packageId: PackageId
  readonly manifest: PackageManifest
  readonly candidate: ThirdPartyDataPackCandidate
}

const blockingSeverities = new Set<ModDiagnosticSeverity>(['error', 'fatal'])

const hasBlockingDiscoveryIssue = (candidate: ThirdPartyDataPackCandidate): boolean =>
  candidate.status === 'invalid' || candidate.issues.some(issue => blockingSeverities.has(issue.severity))

const sortPackageIds = (values: Iterable<PackageId>): PackageId[] =>
  [...values].sort(compareCodePoints)

const sortSelectableCandidates = (values: Iterable<SelectableCandidate>): SelectableCandidate[] =>
  [...values].sort((a, b) => compareCodePoints(a.packageId, b.packageId) || compareCodePoints(a.path, b.path))

const createSelectionIssue = (
  kind: ThirdPartyDataPackSelectionIssueKind,
  options: {
    path: string
    candidatePath: string
    packageId: PackageId
    relatedPackageIds?: readonly PackageId[]
    fieldPath?: string
    reason: string
    details?: Record<string, JsonValue>
  }
): ThirdPartyDataPackSelectionIssue => {
  const code = kind === 'duplicate-package-id'
    ? 'PKG-VERSION-002'
    : kind === 'dependency-cycle'
      ? 'PKG-DEPENDENCY-003'
      : 'PKG-DEPENDENCY-001'
  const severity: ModDiagnosticSeverity = 'error'
  return {
    kind,
    severity,
    path: options.path,
    candidatePath: options.candidatePath,
    packageId: options.packageId,
    relatedPackageIds: options.relatedPackageIds,
    fieldPath: options.fieldPath,
    reason: options.reason,
    diagnostics: [
      createDiagnostic(code, {
        stage: `third-party.selection.${kind}`,
        severity,
        packageId: options.packageId,
        file: options.path,
        fieldPath: options.fieldPath,
        relatedPackageIds: options.relatedPackageIds ? [...options.relatedPackageIds] : undefined,
        details: {
          reason: options.reason,
          ...(options.details ?? {})
        }
      })
    ]
  }
}

const selectableCandidateFrom = (candidate: ThirdPartyDataPackCandidate): SelectableCandidate | null => {
  if (candidate.packageId === undefined || candidate.manifest === undefined) return null
  return {
    path: candidate.path,
    packageId: candidate.packageId,
    manifest: candidate.manifest,
    candidate
  }
}

const addIssue = (
  issuesByPath: Map<string, ThirdPartyDataPackSelectionIssue[]>,
  candidatePath: string,
  issue: ThirdPartyDataPackSelectionIssue
): void => {
  const issues = issuesByPath.get(candidatePath) ?? []
  issues.push(issue)
  issuesByPath.set(candidatePath, issues)
}

const addReason = (
  reasonsByPath: Map<string, Set<ThirdPartyDataPackBlockedReason>>,
  candidatePath: string,
  reason: ThirdPartyDataPackBlockedReason
): void => {
  const reasons = reasonsByPath.get(candidatePath) ?? new Set<ThirdPartyDataPackBlockedReason>()
  reasons.add(reason)
  reasonsByPath.set(candidatePath, reasons)
}

const dependencyTarget = (
  dependency: PackageDependency,
  candidatesByPackageId: ReadonlyMap<PackageId, SelectableCandidate>
): SelectableCandidate | undefined =>
  candidatesByPackageId.get(dependency.id as PackageId)

const groupCandidatesByPackageId = (
  candidates: readonly SelectableCandidate[]
): Map<PackageId, SelectableCandidate[]> => {
  const groupsByPackageId = new Map<PackageId, SelectableCandidate[]>()
  for (const candidate of candidates) {
    const group = groupsByPackageId.get(candidate.packageId) ?? []
    group.push(candidate)
    groupsByPackageId.set(candidate.packageId, group)
  }
  return groupsByPackageId
}

const detectInitialBlocks = (
  candidates: readonly SelectableCandidate[],
  issuesByPath: Map<string, ThirdPartyDataPackSelectionIssue[]>,
  reasonsByPath: Map<string, Set<ThirdPartyDataPackBlockedReason>>
): Map<PackageId, SelectableCandidate> => {
  const groupsByPackageId = groupCandidatesByPackageId(candidates)
  for (const candidate of candidates) {
    if (hasBlockingDiscoveryIssue(candidate.candidate)) {
      addReason(reasonsByPath, candidate.path, 'discovery-blocked')
    }
  }

  for (const [packageId, group] of groupsByPackageId) {
    if (group.length <= 1) continue
    const relatedPackageIds = [packageId]
    const candidatePaths = group.map(candidate => candidate.path).sort(compareCodePoints)
    for (const candidate of group) {
      addReason(reasonsByPath, candidate.path, 'duplicate-package-id')
      addIssue(issuesByPath, candidate.path, createSelectionIssue('duplicate-package-id', {
        path: `${candidate.path}/manifest.json`,
        candidatePath: candidate.path,
        packageId: candidate.packageId,
        relatedPackageIds,
        fieldPath: '/id',
        reason: 'Multiple discovered candidates declare the same package id, so no version is selected automatically',
        details: {
          packageId,
          candidatePaths
        }
      }))
    }
  }

  const candidatesByPackageId = new Map<PackageId, SelectableCandidate>()
  for (const [packageId, group] of groupsByPackageId) {
    if (group.length === 1) candidatesByPackageId.set(packageId, group[0]!)
  }
  return candidatesByPackageId
}

const propagateRequiredDependencyBlocks = (
  candidates: readonly SelectableCandidate[],
  candidatesByPackageId: ReadonlyMap<PackageId, SelectableCandidate>,
  issuesByPath: Map<string, ThirdPartyDataPackSelectionIssue[]>,
  reasonsByPath: Map<string, Set<ThirdPartyDataPackBlockedReason>>
): void => {
  const allCandidatesByPackageId = groupCandidatesByPackageId(candidates)
  let changed = true
  while (changed) {
    changed = false
    for (const candidate of sortSelectableCandidates(candidates)) {
      if (reasonsByPath.has(candidate.path)) continue

      candidate.manifest.dependencies?.forEach((dependency, index) => {
        if (reasonsByPath.has(candidate.path)) return
        const target = dependencyTarget(dependency, candidatesByPackageId)
        const dependencyId = dependency.id as PackageId
        const blockedTargets = (allCandidatesByPackageId.get(dependencyId) ?? [])
          .filter(dependencyCandidate => reasonsByPath.has(dependencyCandidate.path))
          .sort((a, b) => compareCodePoints(a.path, b.path))
        if (!target && blockedTargets.length === 0) return
        if (target && !reasonsByPath.has(target.path)) return

        addReason(reasonsByPath, candidate.path, 'required-dependency-blocked')
        addIssue(issuesByPath, candidate.path, createSelectionIssue('required-dependency-blocked', {
          path: `${candidate.path}/manifest.json`,
          candidatePath: candidate.path,
          packageId: candidate.packageId,
          relatedPackageIds: [dependencyId],
          fieldPath: `/dependencies/${index}`,
          reason: 'Required dependency is not selectable in the candidate environment',
          details: {
            dependencyId: dependency.id,
            range: dependency.version,
            dependencyPaths: target ? [target.path] : blockedTargets.map(blockedTarget => blockedTarget.path),
            dependencyReasons: target
              ? [...(reasonsByPath.get(target.path) ?? [])].sort(compareCodePoints)
              : [...new Set(blockedTargets.flatMap(blockedTarget => [...(reasonsByPath.get(blockedTarget.path) ?? [])]))]
                .sort(compareCodePoints)
          }
        }))
        changed = true
      })
    }
  }
}

const addEdge = (
  outgoingEdges: Map<PackageId, Set<PackageId>>,
  incomingCounts: Map<PackageId, number>,
  from: PackageId,
  to: PackageId
): void => {
  if (from === to) return
  const outgoing = outgoingEdges.get(from) ?? new Set<PackageId>()
  if (outgoing.has(to)) return
  outgoing.add(to)
  outgoingEdges.set(from, outgoing)
  incomingCounts.set(to, (incomingCounts.get(to) ?? 0) + 1)
}

const buildDependencyGraph = (
  candidates: readonly SelectableCandidate[]
): {
  readonly outgoingEdges: Map<PackageId, Set<PackageId>>
  readonly incomingCounts: Map<PackageId, number>
  readonly candidatesByPackageId: Map<PackageId, SelectableCandidate>
} => {
  const candidatesByPackageId = new Map<PackageId, SelectableCandidate>()
  const outgoingEdges = new Map<PackageId, Set<PackageId>>()
  const incomingCounts = new Map<PackageId, number>()
  for (const candidate of candidates) {
    candidatesByPackageId.set(candidate.packageId, candidate)
    incomingCounts.set(candidate.packageId, 0)
  }

  for (const candidate of candidates) {
    candidate.manifest.dependencies?.forEach(dependency => {
      const target = dependencyTarget(dependency, candidatesByPackageId)
      if (target) addEdge(outgoingEdges, incomingCounts, target.packageId, candidate.packageId)
    })

    candidate.manifest.optionalDependencies?.forEach(dependency => {
      const target = dependencyTarget(dependency, candidatesByPackageId)
      if (!target) return
      const versionMatch = satisfiesPackageVersionRange(target.manifest.version, dependency.version)
      if (versionMatch.ok) addEdge(outgoingEdges, incomingCounts, target.packageId, candidate.packageId)
    })
  }

  return { outgoingEdges, incomingCounts, candidatesByPackageId }
}

const stableTopologicalSort = (
  candidates: readonly SelectableCandidate[]
): {
  readonly orderedPackageIds: readonly PackageId[]
  readonly cyclePackageIds: readonly PackageId[]
} => {
  const { outgoingEdges, incomingCounts } = buildDependencyGraph(candidates)
  const ready = sortPackageIds(
    [...incomingCounts.entries()]
      .filter(([, count]) => count === 0)
      .map(([packageId]) => packageId)
  )
  const orderedPackageIds: PackageId[] = []

  while (ready.length > 0) {
    const packageId = ready.shift()!
    orderedPackageIds.push(packageId)
    for (const dependentId of sortPackageIds(outgoingEdges.get(packageId) ?? [])) {
      const nextCount = (incomingCounts.get(dependentId) ?? 0) - 1
      incomingCounts.set(dependentId, nextCount)
      if (nextCount === 0) {
        ready.push(dependentId)
        ready.sort(compareCodePoints)
      }
    }
  }

  const orderedSet = new Set(orderedPackageIds)
  const cyclePackageIds = sortPackageIds(
    candidates
      .map(candidate => candidate.packageId)
      .filter(packageId => !orderedSet.has(packageId))
  )
  return { orderedPackageIds, cyclePackageIds }
}

const finalizeBlockedPackages = (
  report: ThirdPartyDataPackDiscoveryReport,
  issuesByPath: ReadonlyMap<string, readonly ThirdPartyDataPackSelectionIssue[]>,
  reasonsByPath: ReadonlyMap<string, ReadonlySet<ThirdPartyDataPackBlockedReason>>
): ThirdPartyDataPackBlockedPackage[] =>
  report.candidates
    .filter(candidate => reasonsByPath.has(candidate.path))
    .map(candidate => ({
      path: candidate.path,
      packageId: candidate.packageId,
      version: candidate.manifest?.version,
      reasons: [...(reasonsByPath.get(candidate.path) ?? [])].sort(compareCodePoints),
      discoveryIssues: candidate.issues.filter(issue => blockingSeverities.has(issue.severity)),
      selectionIssues: issuesByPath.get(candidate.path) ?? []
    }))
    .sort((a, b) => compareCodePoints(a.packageId ?? a.path, b.packageId ?? b.path) || compareCodePoints(a.path, b.path))

export const selectThirdPartyDataPacks = (
  report: ThirdPartyDataPackDiscoveryReport
): ThirdPartyDataPackSelectionReport => {
  const selectableCandidates = report.candidates
    .map(selectableCandidateFrom)
    .filter((candidate): candidate is SelectableCandidate => candidate !== null)
  const issuesByPath = new Map<string, ThirdPartyDataPackSelectionIssue[]>()
  const reasonsByPath = new Map<string, Set<ThirdPartyDataPackBlockedReason>>()
  for (const candidate of report.candidates) {
    if (hasBlockingDiscoveryIssue(candidate)) {
      addReason(reasonsByPath, candidate.path, 'discovery-blocked')
    }
  }
  const candidatesByPackageId = detectInitialBlocks(selectableCandidates, issuesByPath, reasonsByPath)

  propagateRequiredDependencyBlocks(selectableCandidates, candidatesByPackageId, issuesByPath, reasonsByPath)

  const graphCandidates = selectableCandidates.filter(candidate => !reasonsByPath.has(candidate.path))
  const { orderedPackageIds, cyclePackageIds } = stableTopologicalSort(graphCandidates)

  if (cyclePackageIds.length > 0) {
    const cycleIdSet = new Set(cyclePackageIds)
    for (const candidate of graphCandidates) {
      if (!cycleIdSet.has(candidate.packageId)) continue
      addReason(reasonsByPath, candidate.path, 'dependency-cycle')
      addIssue(issuesByPath, candidate.path, createSelectionIssue('dependency-cycle', {
        path: `${candidate.path}/manifest.json`,
        candidatePath: candidate.path,
        packageId: candidate.packageId,
        relatedPackageIds: cyclePackageIds.filter(packageId => packageId !== candidate.packageId),
        reason: 'Dependency graph contains a cycle and cannot produce a complete stable load order',
        details: {
          cyclePackageIds: [...cyclePackageIds]
        }
      }))
    }
  }

  const selectedByPackageId = new Map(graphCandidates.map(candidate => [candidate.packageId, candidate] as const))
  const selectedPackageIds = orderedPackageIds.filter(packageId => !cyclePackageIds.includes(packageId))
  const selectedPackages = selectedPackageIds.map(packageId => {
    const candidate = selectedByPackageId.get(packageId)!
    return {
      path: candidate.path,
      packageId: candidate.packageId,
      version: candidate.manifest.version
    }
  })
  const blockedPackages = finalizeBlockedPackages(report, issuesByPath, reasonsByPath)
  const issues = [...issuesByPath.values()].flat()

  return {
    status: blockedPackages.length > 0 ? 'blocked' : 'completed',
    selectedPackages,
    blockedPackages,
    loadOrder: selectedPackageIds,
    issues,
    summary: {
      candidateCount: report.summary.candidateCount,
      selectedPackageCount: selectedPackages.length,
      blockedPackageCount: blockedPackages.length,
      issueCount: issues.length
    }
  }
}
