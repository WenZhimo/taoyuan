import { Type, type TSchema } from '@sinclair/typebox'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { requireRegistryTypeId } from './ids'
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
}

export interface OfficialContentBootstrap {
  bootstrap: () => Promise<RegistrySet>
  getRegistrySet: () => RegistrySet
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

  const bootstrap = (): Promise<RegistrySet> => {
    if (publishedRegistrySet) return Promise.resolve(publishedRegistrySet)
    if (pendingBootstrap) return pendingBootstrap

    const attempt = Promise.resolve().then(() => {
      const candidate = runStage('build', dependencies.buildRegistrySet)
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

  return { bootstrap, getRegistrySet }
}

const officialContentBootstrap = createOfficialContentBootstrap({
  buildRegistrySet: buildOfficialRegistrySetFromStaticData,
  validateStructure: validateOfficialRegistryStructure,
  validateSemantics: validateRegistrySemantics,
  freezeRegistrySet: registrySet => registrySet.freezeEntries()
})

export const bootstrapOfficialContent = officialContentBootstrap.bootstrap
export const getOfficialRegistrySet = officialContentBootstrap.getRegistrySet
