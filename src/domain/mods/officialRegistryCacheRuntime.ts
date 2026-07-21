import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import type { Sha256Hash } from './hash'
import {
  getOfficialRegistryCacheArtifact,
  parseOfficialRegistryCacheText
} from './officialRegistryCache'
import { restoreParsedOfficialPrecompiledRegistryArtifact } from './officialPrecompiled'
import { OFFICIAL_REGISTRY_DEFINITIONS } from './staticAdapters'
import type { RegistrySet } from './registry'

interface OfficialRegistryCacheElectronBridge {
  readOfficialRegistryCache?: () => Promise<unknown>
  writeOfficialRegistryCache?: (contents: string) => Promise<unknown>
}

type CacheWindow = Window & { electronAPI?: OfficialRegistryCacheElectronBridge }

let lastDiskCacheArtifactHash: Sha256Hash | null = null

export interface OfficialRegistryDiskCacheRestoreResult {
  registrySet: RegistrySet
  verification: 'fast'
}

const getBridge = (): OfficialRegistryCacheElectronBridge | null => {
  if (typeof window === 'undefined') return null
  return (window as CacheWindow).electronAPI ?? null
}

export const isOfficialRegistryDiskCacheAvailable = (): boolean => {
  const bridge = getBridge()
  return typeof bridge?.readOfficialRegistryCache === 'function'
    && typeof bridge.writeOfficialRegistryCache === 'function'
}

export const loadOfficialRegistryDiskCache = async (): Promise<unknown | null> => {
  const bridge = getBridge()
  if (typeof bridge?.readOfficialRegistryCache !== 'function') return null
  return await bridge.readOfficialRegistryCache()
}

export const restoreOfficialRegistryDiskCache = (value: unknown) => {
  if (typeof value !== 'string') {
    throw new TypeError('Official registry disk cache must be loaded as JSON text')
  }
  const parsed = parseOfficialRegistryCacheText(value, metadataJson as unknown)
  lastDiskCacheArtifactHash = parsed.artifactHash
  return {
    registrySet: restoreParsedOfficialPrecompiledRegistryArtifact(
      OFFICIAL_REGISTRY_DEFINITIONS,
      parsed.artifact
    ),
    verification: 'fast'
  } satisfies OfficialRegistryDiskCacheRestoreResult
}

export const writeOfficialRegistryDiskCache = async (contents: string): Promise<void> => {
  const bridge = getBridge()
  if (typeof bridge?.writeOfficialRegistryCache !== 'function') {
    throw new Error('Official registry disk cache bridge is unavailable')
  }
  parseOfficialRegistryCacheText(contents, metadataJson as unknown, { validationMode: 'full' })
  await bridge.writeOfficialRegistryCache(contents)
}

export const getLastDiskCacheArtifactHash = (): Sha256Hash | null => lastDiskCacheArtifactHash

export const getCachedOfficialArtifact = (contents: string) =>
  getOfficialRegistryCacheArtifact(contents, metadataJson as unknown)
