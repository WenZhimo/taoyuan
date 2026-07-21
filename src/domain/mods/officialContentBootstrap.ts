import { Type, type TSchema } from '@sinclair/typebox'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { requireRegistryTypeId } from './ids'
import {
  OfficialPrecompiledArtifactError
} from './officialPrecompiled'
import { OfficialRegistryCacheError } from './officialRegistryCache'
import {
  loadBundledOfficialPrecompiledArtifact,
  restoreBundledOfficialPrecompiledArtifact
} from './officialPrecompiledRuntime'
import {
  isOfficialRegistryDiskCacheAvailable,
  loadOfficialRegistryDiskCache,
  restoreOfficialRegistryDiskCache
} from './officialRegistryCacheRuntime'
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
  diskCache?: {
    isAvailable: () => boolean
    load: () => Promise<unknown | null>
    restore: (value: unknown) => RegistrySet
  }
}

export type OfficialPrecompiledBootstrapStatus =
  | 'not-configured'
  | 'not-attempted'
  | 'official-precompiled-hit'
  | 'cache-miss-not-found'
  | 'cache-miss-environment-changed'
  | 'cache-miss-format-changed'
  | 'cache-invalid-json'
  | 'cache-invalid-structure'
  | 'cache-invalid-hash'
  | 'cache-restore-failed'

export type OfficialRegistryDiskCacheStatus =
  | 'cache-hit'
  | 'cache-miss-not-found'
  | 'cache-miss-environment-changed'
  | 'cache-miss-format-changed'
  | 'cache-invalid-json'
  | 'cache-invalid-structure'
  | 'cache-invalid-hash'
  | 'cache-read-failed'
  | 'cache-restore-failed'

export interface OfficialContentBootstrapReport {
  source: 'disk-cache' | 'precompiled' | 'static'
  precompiledStatus: OfficialPrecompiledBootstrapStatus
  diagnostics: readonly ModDiagnostic[]
  diskCacheStatus?: OfficialRegistryDiskCacheStatus
  timings?: {
    diskCacheMs?: number
    precompiledMs?: number
    staticBuildMs?: number
  }
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

  const classifyPrecompiledFailure = (error: unknown): {
    status: OfficialPrecompiledBootstrapStatus
    diagnostics: readonly ModDiagnostic[]
  } => {
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
      return { status, diagnostics: error.diagnostics }
    }

    const message = error instanceof Error ? error.message : String(error)
    return {
      status: 'cache-restore-failed',
      diagnostics: [createDiagnostic('CACHE-RESTORE-001', {
        stage: 'official-content.precompiled',
        details: { message },
        recovery: 'retry'
      })]
    }
  }

  const classifyDiskCacheFailure = (error: unknown): {
    status: OfficialRegistryDiskCacheStatus
    diagnostics: readonly ModDiagnostic[]
  } => {
    if (error instanceof OfficialRegistryCacheError) {
      const stage = error.diagnostics[0]?.stage ?? ''
      const status: OfficialRegistryDiskCacheStatus = error.kind === 'invalid-json'
        ? 'cache-invalid-json'
        : error.kind === 'format-version'
          ? 'cache-miss-format-changed'
          : error.kind === 'structure'
            ? 'cache-invalid-structure'
            : error.kind === 'identity-mismatch'
              ? stage.endsWith('.environmentHash')
                ? 'cache-miss-environment-changed'
                : 'cache-invalid-hash'
              : 'cache-restore-failed'
      return { status, diagnostics: error.diagnostics }
    }

    return {
      status: 'cache-read-failed',
      diagnostics: [createDiagnostic('CACHE-RESTORE-001', {
        stage: 'official-content.disk-cache',
        details: { message: error instanceof Error ? error.message : String(error) },
        recovery: 'retry'
      })]
    }
  }

  const now = (): number => globalThis.performance?.now() ?? Date.now()

  const bootstrap = (): Promise<RegistrySet> => {
    if (publishedRegistrySet) return Promise.resolve(publishedRegistrySet)
    if (pendingBootstrap) return pendingBootstrap

    const attempt = Promise.resolve().then(async () => {
      let candidate: RegistrySet | null = null
      const diagnostics: ModDiagnostic[] = []
      const timings: NonNullable<OfficialContentBootstrapReport['timings']> = {}
      let source: OfficialContentBootstrapReport['source'] = 'static'
      let precompiledStatus: OfficialPrecompiledBootstrapStatus = dependencies.precompiled
        ? 'cache-miss-not-found'
        : 'not-configured'
      let diskCacheStatus: OfficialRegistryDiskCacheStatus | undefined
      const diskCacheAvailable = dependencies.diskCache?.isAvailable() ?? false
      const updateLastReport = (): void => {
        lastReport = {
          source,
          precompiledStatus,
          diagnostics,
          ...(diskCacheStatus ? { diskCacheStatus } : {}),
          ...(diskCacheAvailable && Object.keys(timings).length > 0 ? { timings } : {})
        }
      }

      if (diskCacheAvailable && dependencies.diskCache) {
        const startedAt = now()
        try {
          const value = await dependencies.diskCache.load()
          if (value === null) {
            diskCacheStatus = 'cache-miss-not-found'
            diagnostics.push(createDiagnostic('CACHE-NOT-FOUND-001', {
              stage: 'official-content.disk-cache',
              recovery: 'retry'
            }))
          } else {
            candidate = prepareCandidate(dependencies.diskCache.restore(value))
            source = 'disk-cache'
            diskCacheStatus = 'cache-hit'
            precompiledStatus = 'not-attempted'
          }
        } catch (error) {
          const failure = classifyDiskCacheFailure(error)
          diskCacheStatus = failure.status
          diagnostics.push(...failure.diagnostics)
        } finally {
          timings.diskCacheMs = now() - startedAt
        }
      }

      if (!candidate && dependencies.precompiled) {
        const startedAt = now()
        try {
          const value = await dependencies.precompiled.load()
          if (value === null) {
            precompiledStatus = 'cache-miss-not-found'
            diagnostics.push(createDiagnostic('CACHE-NOT-FOUND-001', {
              stage: 'official-content.precompiled',
              recovery: 'retry'
            }))
          } else {
            candidate = prepareCandidate(dependencies.precompiled.restore(value))
            source = 'precompiled'
            precompiledStatus = 'official-precompiled-hit'
          }
        } catch (error) {
          const failure = classifyPrecompiledFailure(error)
          precompiledStatus = failure.status
          diagnostics.push(...failure.diagnostics)
        } finally {
          timings.precompiledMs = now() - startedAt
        }
      }

      if (!candidate) {
        const startedAt = now()
        source = 'static'
        try {
          candidate = prepareCandidate(runStage('build', dependencies.buildRegistrySet))
        } finally {
          timings.staticBuildMs = now() - startedAt
          updateLastReport()
        }
      }
      if (!candidate) throw new OfficialContentBootstrapError('build')
      updateLastReport()
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
  },
  diskCache: {
    isAvailable: isOfficialRegistryDiskCacheAvailable,
    load: loadOfficialRegistryDiskCache,
    restore: restoreOfficialRegistryDiskCache
  }
})

export const bootstrapOfficialContent = officialContentBootstrap.bootstrap
export const getOfficialRegistrySet = officialContentBootstrap.getRegistrySet
export const getOfficialContentBootstrapReport = officialContentBootstrap.getLastReport
