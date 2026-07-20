import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import {
  createExpectedOfficialEnvironmentHash,
  restoreOfficialPrecompiledRegistryArtifactText
} from './officialPrecompiled'
import { OFFICIAL_REGISTRY_DEFINITIONS } from './staticAdapters'

export const loadBundledOfficialPrecompiledArtifact = async (): Promise<string | null> => {
  try {
    return (await import('@/generated/mods/official-precompiled-registry.json?raw')).default
  } catch {
    return null
  }
}

export const restoreBundledOfficialPrecompiledArtifact = (value: unknown) => {
  if (typeof value !== 'string') {
    throw new TypeError('Bundled official precompiled artifact must be loaded as raw JSON text')
  }
  const expectedEnvironmentHash = createExpectedOfficialEnvironmentHash(metadataJson as unknown)
  return restoreOfficialPrecompiledRegistryArtifactText(
    OFFICIAL_REGISTRY_DEFINITIONS,
    value,
    expectedEnvironmentHash
  )
}
