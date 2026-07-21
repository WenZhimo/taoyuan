import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import {
  getOfficialCropById,
  getOfficialItemDef,
  getOfficialRecipeDef
} from './contentAccess'
import { createEnvironmentHash } from './environmentHash'
import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import { getLastDiskCacheArtifactHash } from './officialRegistryCacheRuntime'
import {
  getOfficialRegistryCacheWriteReport,
  type OfficialRegistryCacheWriteStatus
} from './officialRegistryCacheRefresh'
import {
  getOfficialContentBootstrapReport,
  getOfficialRegistrySet,
  type OfficialContentBootstrapLoadPath,
  type OfficialPrecompiledBootstrapStatus
} from './officialContentBootstrap'
import {
  createOfficialCacheEnvironmentIdentityFromContentHash,
  createOfficialContentHash,
  createOfficialSchemaSetHash,
  parseOfficialPrecompiledRegistryMetadata
} from './officialPrecompiled'
import { getLastBundledOfficialPrecompiledArtifactHash } from './officialPrecompiledRuntime'
import { createSerializableRegistrySnapshot } from './registry'

export interface SanitizedOfficialContentDiagnostic {
  code: string
  stage: string
  severity: ModDiagnosticSeverity
  recovery: ModDiagnosticRecovery
}

export interface OfficialContentRuntimeReport {
  schemaVersion: 1
  runtimeSource: 'disk-cache' | 'precompiled' | 'static-fallback'
  loadPath: OfficialContentBootstrapLoadPath
  precompiledStatus: OfficialPrecompiledBootstrapStatus
  diagnostics: readonly SanitizedOfficialContentDiagnostic[]
  registryPhase: 'frozen'
  snapshotFormatVersion: 2
  registryCount: number
  entryCount: number
  registryIds: readonly string[]
  hashes: {
    artifactHash: Sha256Hash
    artifactHashSource: 'disk-cache' | 'loaded-product' | 'committed-metadata'
    contentHash: Sha256Hash
    schemaSetHash: Sha256Hash
    environmentHash: Sha256Hash
    snapshotHash: Sha256Hash
  }
  queryChecks: {
    itemName: string | null
    recipeName: string | null
    cropName: string | null
  }
  diskCache?: {
    status: string
    writeStatus: OfficialRegistryCacheWriteStatus
    diagnostics?: readonly SanitizedOfficialContentDiagnostic[]
    readDurationMs?: number
    writeDurationMs?: number
  }
}

export const createOfficialContentRuntimeReport = (): OfficialContentRuntimeReport => {
  const bootstrapReport = getOfficialContentBootstrapReport()
  if (!bootstrapReport) throw new Error('Official content bootstrap report is unavailable')

  const registrySet = getOfficialRegistrySet()
  if (registrySet.currentPhase !== 'frozen') {
    throw new Error('Official registry set is not frozen')
  }

  const snapshot = createSerializableRegistrySnapshot(registrySet)
  const contentHash = createOfficialContentHash(snapshot)
  const schemaSetHash = createOfficialSchemaSetHash()
  const environmentHash = createEnvironmentHash(
    createOfficialCacheEnvironmentIdentityFromContentHash(contentHash)
  )
  const metadata = parseOfficialPrecompiledRegistryMetadata(metadataJson as unknown)
  const diskCacheArtifactHash = getLastDiskCacheArtifactHash()
  const loadedArtifactHash = getLastBundledOfficialPrecompiledArtifactHash()
  const cacheWriteReport = getOfficialRegistryCacheWriteReport()
  const sanitizedCacheWriteDiagnostics = cacheWriteReport.diagnostics.map(diagnostic => ({
    code: diagnostic.code,
    stage: diagnostic.stage,
    severity: diagnostic.severity,
    recovery: diagnostic.recovery
  }))
  const runtimeSource = bootstrapReport.source === 'disk-cache'
    ? 'disk-cache'
    : bootstrapReport.source === 'precompiled'
      ? 'precompiled'
      : 'static-fallback'

  return {
    schemaVersion: 1,
    runtimeSource,
    loadPath: bootstrapReport.loadPath,
    precompiledStatus: bootstrapReport.precompiledStatus,
    diagnostics: bootstrapReport.diagnostics.map(diagnostic => ({
      code: diagnostic.code,
      stage: diagnostic.stage,
      severity: diagnostic.severity,
      recovery: diagnostic.recovery
    })),
    registryPhase: 'frozen',
    snapshotFormatVersion: snapshot.formatVersion,
    registryCount: snapshot.registries.length,
    entryCount: snapshot.registries.reduce(
      (total, registry) => total + registry.entries.length,
      0
    ),
    registryIds: snapshot.registries.map(registry => registry.registryId),
    hashes: {
      artifactHash: diskCacheArtifactHash ?? loadedArtifactHash ?? metadata.artifactHash as Sha256Hash,
      artifactHashSource: diskCacheArtifactHash
        ? 'disk-cache'
        : loadedArtifactHash
          ? 'loaded-product'
          : 'committed-metadata',
      contentHash,
      schemaSetHash,
      environmentHash,
      snapshotHash: snapshot.snapshotHash as Sha256Hash
    },
    queryChecks: {
      itemName: getOfficialItemDef('cabbage')?.name.fallback ?? null,
      recipeName: getOfficialRecipeDef('stir_fried_cabbage')?.name.fallback ?? null,
      cropName: getOfficialCropById('cabbage')?.name ?? null
    },
    ...(bootstrapReport.diskCacheStatus || cacheWriteReport.status !== 'not-configured'
      ? {
          diskCache: {
            status: bootstrapReport.diskCacheStatus ?? 'not-configured',
            writeStatus: cacheWriteReport.status,
            ...(sanitizedCacheWriteDiagnostics.length === 0
              ? {}
              : { diagnostics: sanitizedCacheWriteDiagnostics }),
            ...(bootstrapReport.timings?.diskCacheMs === undefined
              ? {}
              : { readDurationMs: bootstrapReport.timings.diskCacheMs }),
            ...(cacheWriteReport.durationMs === undefined
              ? {}
              : { writeDurationMs: cacheWriteReport.durationMs })
          }
        }
      : {})
  }
}
