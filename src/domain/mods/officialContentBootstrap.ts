import { Type, type TSchema } from '@sinclair/typebox'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { requireRegistryTypeId } from './ids'
import {
  OfficialPrecompiledArtifactError
} from './officialPrecompiled'
import {
  loadBundledOfficialPrecompiledArtifact,
  restoreBundledOfficialPrecompiledArtifact
} from './officialPrecompiledRuntime'
import type { RegistryEntry, RegistrySet } from './registry'
import { validateUnknown } from './schemaValidation'
import { OFFICIAL_REGISTRY_SCHEMAS, type OfficialRegistryId } from './schemas'
import { validateRegistrySemantics } from './semanticValidation'
import {
  buildOfficialRegistrySetFromStaticData,
  OFFICIAL_PACKAGE_ID
} from './staticAdapters'

export type OfficialContentBootstrapStage =
  | 'access'
  | 'build'
  | 'structure'
  | 'semantics'
  | 'freeze'

export class OfficialContentBootstrapError extends Error {
  readonly stage: OfficialContentBootstrapStage
  readonly diagnostics: readonly ModDiagnostic[]
  readonly cause?: unknown

  constructor(
    stage: OfficialContentBootstrapStage,
    options?: {
      diagnostics?: readonly ModDiagnostic[]
      cause?: unknown
    }
  ) {
    const diagnostics = options?.diagnostics ?? []
    const causeMessage = options?.cause instanceof Error
      ? options.cause.message
      : options?.cause === undefined
        ? ''
        : String(options.cause)
    const detail = diagnostics.length > 0
      ? `${diagnostics.length} diagnostic(s): ${diagnostics.map(item => item.code).join(', ')}`
      : causeMessage
    super(`Official content bootstrap failed during ${stage}${detail ? `: ${detail}` : ''}`)
    this.name = 'OfficialContentBootstrapError'
    this.stage = stage
    this.diagnostics = diagnostics
    this.cause = options?.cause
  }
}

export interface OfficialContentBootstrapDependencies {
  buildRegistrySet: () => RegistrySet
  validateStructure: (registrySet: RegistrySet) => readonly ModDiagnostic[]
  validateSemantics: (registrySet: RegistrySet) => readonly ModDiagnostic[]
  freezeRegistrySet: (registrySet: RegistrySet) => void
  precompiled?: {
    load: () => Promise<unknown | null>
    restore: (value: unknown) => RegistrySet
  }
}

export type OfficialPrecompiledBootstrapStatus =
  | 'not-configured'
  | 'official-precompiled-hit'
  | 'cache-miss-not-found'
  | 'cache-miss-environment-changed'
  | 'cache-miss-format-changed'
  | 'cache-invalid-json'
  | 'cache-invalid-structure'
  | 'cache-invalid-hash'
  | 'cache-restore-failed'

export interface OfficialContentBootstrapReport {
  source: 'precompiled' | 'static'
  precompiledStatus: OfficialPrecompiledBootstrapStatus
  diagnostics: readonly ModDiagnostic[]
}

export interface OfficialContentBootstrap {
  bootstrap: () => Promise<RegistrySet>
  getRegistrySet: () => RegistrySet
  getLastReport: () => OfficialContentBootstrapReport | null
}

const schemaEntries = Object.entries(OFFICIAL_REGISTRY_SCHEMAS) as Array<
  [OfficialRegistryId, TSchema]
>

export const validateOfficialRegistryStructure = (registrySet: RegistrySet): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  const knownSchemaIds = new Set<string>(schemaEntries.map(([registryId]) => registryId))

  for (const registryId of registrySet.registryIds()) {
    if (knownSchemaIds.has(registryId)) continue
    diagnostics.push(createDiagnostic('REG-REQUIRED-001', {
      stage: 'official-content.structure',
      packageId: OFFICIAL_PACKAGE_ID,
      registryId,
      details: { message: 'Official registry has no TypeBox schema.' }
    }))
  }

  for (const [registryId, schema] of schemaEntries) {
    const typedRegistryId = requireRegistryTypeId(registryId)
    if (!registrySet.hasRegistry(typedRegistryId)) {
      diagnostics.push(createDiagnostic('REG-REQUIRED-001', {
        stage: 'official-content.structure',
        packageId: OFFICIAL_PACKAGE_ID,
        registryId: typedRegistryId,
        details: { message: 'Required official registry is missing.' }
      }))
      continue
    }

    const entries: unknown = registrySet.get<RegistryEntry>(typedRegistryId).values()
    const result = validateUnknown(Type.Array(schema), entries, {
      stage: 'official-content.structure',
      packageId: OFFICIAL_PACKAGE_ID,
      file: registrySet.get(typedRegistryId).definition.schemaName
    })
    if (!result.ok) diagnostics.push(...result.diagnostics)
  }

  return diagnostics
}

const runStage = <T>(stage: OfficialContentBootstrapStage, action: () => T): T => {
  try {
    return action()
  } catch (error) {
    if (error instanceof OfficialContentBootstrapError) throw error
    throw new OfficialContentBootstrapError(stage, { cause: error })
  }
}

const requireNoDiagnostics = (
  stage: OfficialContentBootstrapStage,
  diagnostics: readonly ModDiagnostic[]
): void => {
  if (diagnostics.length > 0) {
    throw new OfficialContentBootstrapError(stage, { diagnostics })
  }
}

export const createOfficialContentBootstrap = (
  dependencies: OfficialContentBootstrapDependencies
): OfficialContentBootstrap => {
  let publishedRegistrySet: RegistrySet | null = null
  let pendingBootstrap: Promise<RegistrySet> | null = null
  let lastReport: OfficialContentBootstrapReport | null = null

  const prepareCandidate = (candidate: RegistrySet): RegistrySet => {
    requireNoDiagnostics(
      'structure',
      runStage('structure', () => dependencies.validateStructure(candidate))
    )
    requireNoDiagnostics(
      'semantics',
      runStage('semantics', () => dependencies.validateSemantics(candidate))
    )
    runStage('freeze', () => dependencies.freezeRegistrySet(candidate))
    if (candidate.currentPhase !== 'frozen') {
      throw new OfficialContentBootstrapError('freeze', {
        cause: new Error('Registry set did not enter the frozen phase.')
      })
    }
    return candidate
  }

  const fallbackReport = (
    status: OfficialPrecompiledBootstrapStatus,
    diagnostics: readonly ModDiagnostic[]
  ): OfficialContentBootstrapReport => ({
    source: 'static',
    precompiledStatus: status,
    diagnostics
  })

  const classifyPrecompiledFailure = (error: unknown): OfficialContentBootstrapReport => {
    if (error instanceof OfficialPrecompiledArtifactError) {
      const snapshotKind = error.cause && typeof error.cause === 'object' && 'kind' in error.cause
        ? String((error.cause as { kind?: unknown }).kind)
        : null
      const status: OfficialPrecompiledBootstrapStatus = error.kind === 'invalid-json'
        ? 'cache-invalid-json'
        : error.kind === 'format-version' || snapshotKind === 'format-version'
          ? 'cache-miss-format-changed'
          : error.kind === 'environment-mismatch'
            ? 'cache-miss-environment-changed'
            : error.kind === 'environment-hash' || snapshotKind === 'hash'
              ? 'cache-invalid-hash'
              : error.kind === 'structure' || snapshotKind === 'structure'
                ? 'cache-invalid-structure'
                : 'cache-restore-failed'
      return fallbackReport(status, error.diagnostics)
    }

    const message = error instanceof Error ? error.message : String(error)
    return fallbackReport('cache-restore-failed', [createDiagnostic('CACHE-RESTORE-001', {
      stage: 'official-content.precompiled',
      details: { message },
      recovery: 'retry'
    })])
  }

  const bootstrap = (): Promise<RegistrySet> => {
    if (publishedRegistrySet) return Promise.resolve(publishedRegistrySet)
    if (pendingBootstrap) return pendingBootstrap

    const attempt = Promise.resolve().then(async () => {
      let candidate: RegistrySet | null = null
      if (dependencies.precompiled) {
        try {
          const value = await dependencies.precompiled.load()
          if (value === null) {
            lastReport = fallbackReport('cache-miss-not-found', [
              createDiagnostic('CACHE-NOT-FOUND-001', {
                stage: 'official-content.precompiled',
                recovery: 'retry'
              })
            ])
          } else {
            candidate = prepareCandidate(dependencies.precompiled.restore(value))
            lastReport = {
              source: 'precompiled',
              precompiledStatus: 'official-precompiled-hit',
              diagnostics: []
            }
          }
        } catch (error) {
          lastReport = classifyPrecompiledFailure(error)
        }
        if (!candidate) candidate = prepareCandidate(runStage('build', dependencies.buildRegistrySet))
      } else {
        candidate = prepareCandidate(runStage('build', dependencies.buildRegistrySet))
        lastReport = {
          source: 'static',
          precompiledStatus: 'not-configured',
          diagnostics: []
        }
      }
      if (!candidate) throw new OfficialContentBootstrapError('build')
      publishedRegistrySet = candidate
      return candidate
    })

    pendingBootstrap = attempt
    void attempt.then(
      () => {
        if (pendingBootstrap === attempt) pendingBootstrap = null
      },
      () => {
        if (pendingBootstrap === attempt) pendingBootstrap = null
      }
    )
    return attempt
  }

  const getRegistrySet = (): RegistrySet => {
    if (!publishedRegistrySet) throw new OfficialContentBootstrapError('access')
    return publishedRegistrySet
  }

  const getLastReport = (): OfficialContentBootstrapReport | null => lastReport

  return { bootstrap, getRegistrySet, getLastReport }
}

const officialContentBootstrap = createOfficialContentBootstrap({
  buildRegistrySet: buildOfficialRegistrySetFromStaticData,
  validateStructure: validateOfficialRegistryStructure,
  validateSemantics: validateRegistrySemantics,
  freezeRegistrySet: registrySet => registrySet.freezeEntries(),
  precompiled: {
    load: loadBundledOfficialPrecompiledArtifact,
    restore: restoreBundledOfficialPrecompiledArtifact
  }
})

export const bootstrapOfficialContent = officialContentBootstrap.bootstrap
export const getOfficialRegistrySet = officialContentBootstrap.getRegistrySet
export const getOfficialContentBootstrapReport = officialContentBootstrap.getLastReport
