import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import {
  getOfficialContentBootstrapReport,
  getOfficialRegistrySet
} from './officialContentBootstrap'
import { createOfficialPrecompiledRegistryArtifact } from './officialPrecompiled'
import { createOfficialRegistryCacheText } from './officialRegistryCache'
import {
  isOfficialRegistryDiskCacheAvailable,
  writeOfficialRegistryDiskCache
} from './officialRegistryCacheRuntime'

export type OfficialRegistryCacheWriteStatus =
  | 'not-configured'
  | 'not-needed'
  | 'pending'
  | 'written'
  | 'failed'

export interface OfficialRegistryCacheWriteReport {
  status: OfficialRegistryCacheWriteStatus
  durationMs?: number
  diagnostics: readonly ModDiagnostic[]
}

let lastWriteReport: OfficialRegistryCacheWriteReport = {
  status: 'not-configured',
  diagnostics: []
}

const now = (): number => globalThis.performance?.now() ?? Date.now()

const waitForIdleTurn = (): Promise<void> => new Promise(resolve => {
  setTimeout(resolve, 0)
})

export const refreshOfficialRegistryDiskCache = async (): Promise<OfficialRegistryCacheWriteReport> => {
  if (!isOfficialRegistryDiskCacheAvailable()) {
    lastWriteReport = { status: 'not-configured', diagnostics: [] }
    return lastWriteReport
  }

  const bootstrapReport = getOfficialContentBootstrapReport()
  if (bootstrapReport?.source === 'disk-cache') {
    lastWriteReport = { status: 'not-needed', diagnostics: [] }
    return lastWriteReport
  }

  lastWriteReport = { status: 'pending', diagnostics: [] }
  await waitForIdleTurn()
  const startedAt = now()
  try {
    const artifact = createOfficialPrecompiledRegistryArtifact(getOfficialRegistrySet())
    const contents = createOfficialRegistryCacheText(artifact, metadataJson as unknown)
    await writeOfficialRegistryDiskCache(contents)
    lastWriteReport = {
      status: 'written',
      durationMs: now() - startedAt,
      diagnostics: []
    }
  } catch (error) {
    lastWriteReport = {
      status: 'failed',
      durationMs: now() - startedAt,
      diagnostics: [createDiagnostic('CACHE-WRITE-001', {
        stage: 'official-content.disk-cache.write',
        details: { message: error instanceof Error ? error.message : String(error) },
        recovery: 'retry'
      })]
    }
  }
  return lastWriteReport
}

export const getOfficialRegistryCacheWriteReport = (): OfficialRegistryCacheWriteReport =>
  lastWriteReport
