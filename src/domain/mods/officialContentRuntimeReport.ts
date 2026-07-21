import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import {
  getOfficialCropById,
  getOfficialItemDef,
  getOfficialRecipeDef
} from './contentAccess'
import { createEnvironmentHash } from './environmentHash'
import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import {
  getOfficialContentBootstrapReport,
  getOfficialRegistrySet,
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
  runtimeSource: 'precompiled' | 'static-fallback'
  precompiledStatus: OfficialPrecompiledBootstrapStatus
  diagnostics: readonly SanitizedOfficialContentDiagnostic[]
  registryPhase: 'frozen'
  snapshotFormatVersion: 2
  registryCount: number
  entryCount: number
  registryIds: readonly string[]
  hashes: {
    artifactHash: Sha256Hash
    artifactHashSource: 'loaded-product' | 'committed-metadata'
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
  const loadedArtifactHash = getLastBundledOfficialPrecompiledArtifactHash()

  return {
    schemaVersion: 1,
    runtimeSource: bootstrapReport.source === 'precompiled' ? 'precompiled' : 'static-fallback',
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
      artifactHash: loadedArtifactHash ?? metadata.artifactHash as Sha256Hash,
      artifactHashSource: loadedArtifactHash ? 'loaded-product' : 'committed-metadata',
      contentHash,
      schemaSetHash,
      environmentHash,
      snapshotHash: snapshot.snapshotHash as Sha256Hash
    },
    queryChecks: {
      itemName: getOfficialItemDef('cabbage')?.name.fallback ?? null,
      recipeName: getOfficialRecipeDef('stir_fried_cabbage')?.name.fallback ?? null,
      cropName: getOfficialCropById('cabbage')?.name ?? null
    }
  }
}
