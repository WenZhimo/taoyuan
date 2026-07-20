import { assertPureJsonValue, compareCodePoints } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import {
  CacheEnvironmentIdentitySchema,
  type CacheEnvironmentIdentity
} from './precompiledRegistrySchema'
import { validateUnknown } from './schemaValidation'

export type CacheEnvironmentErrorKind = 'structure' | 'package-set'

export class CacheEnvironmentError extends Error {
  readonly kind: CacheEnvironmentErrorKind
  readonly diagnostics: readonly ModDiagnostic[]

  constructor(kind: CacheEnvironmentErrorKind, message: string, diagnostics: readonly ModDiagnostic[]) {
    super(message)
    this.name = 'CacheEnvironmentError'
    this.kind = kind
    this.diagnostics = diagnostics
  }
}

const createEnvironmentDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('CACHE-INVALID-001', { stage, details })

export const normalizeCacheEnvironmentIdentity = (value: unknown): CacheEnvironmentIdentity => {
  try {
    assertPureJsonValue(value)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new CacheEnvironmentError(
      'structure',
      message,
      [createDiagnostic('SCHEMA-VALIDATE-001', {
        stage: 'cache.environment.structure',
        details: { message }
      })]
    )
  }

  const result = validateUnknown(CacheEnvironmentIdentitySchema, value, {
    stage: 'cache.environment.structure'
  })
  if (!result.ok) {
    throw new CacheEnvironmentError(
      'structure',
      `Cache environment structure invalid at ${result.diagnostics[0]?.fieldPath ?? '/'}`,
      result.diagnostics
    )
  }

  const packageIds = result.data.packages.map(pkg => pkg.id)
  const duplicatePackageIds = packageIds.filter((id, index) => packageIds.indexOf(id) !== index)
  const loadIndexes = result.data.packages.map(pkg => pkg.loadIndex)
  const duplicateLoadIndexes = loadIndexes.filter((index, position) => loadIndexes.indexOf(index) !== position)
  if (duplicatePackageIds.length > 0 || duplicateLoadIndexes.length > 0) {
    throw new CacheEnvironmentError(
      'package-set',
      'Cache environment package identities are not unique',
      [createEnvironmentDiagnostic('cache.environment.packages', {
        duplicatePackageIds: duplicatePackageIds.join(','),
        duplicateLoadIndexes: duplicateLoadIndexes.join(',')
      })]
    )
  }

  return {
    ...result.data,
    packages: result.data.packages
      .map(pkg => ({
        ...pkg,
        resolvedDependencies: [...pkg.resolvedDependencies].sort(compareCodePoints)
      }))
      .sort((a, b) => a.loadIndex - b.loadIndex)
  }
}

export const createEnvironmentHash = (value: unknown): Sha256Hash =>
  hashCanonicalJson(normalizeCacheEnvironmentIdentity(value))
