import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import { createEnvironmentHash } from './environmentHash'
import { sha256Utf8, type Sha256Hash } from './hash'
import {
  createExpectedOfficialEnvironmentHash,
  restoreOfficialPrecompiledRegistryArtifactText
} from './officialPrecompiled'
import { OFFICIAL_REGISTRY_DEFINITIONS } from './staticAdapters'

export type OfficialPrecompiledProbeFault = 'missing' | 'corrupt' | 'environment-mismatch'

let lastBundledArtifactHash: Sha256Hash | null = null

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export const getOfficialPrecompiledProbeFault = (
  search: string = typeof location === 'undefined' ? '' : location.search
): OfficialPrecompiledProbeFault | null => {
  const params = new URLSearchParams(search)
  if (params.get('taoyuanContentProbe') !== '1') return null
  const fault = params.get('taoyuanPrecompiledFault')
  return fault === 'missing' || fault === 'corrupt' || fault === 'environment-mismatch'
    ? fault
    : null
}

export const applyOfficialPrecompiledProbeFault = (
  text: string,
  fault: OfficialPrecompiledProbeFault | null
): string | null => {
  if (fault === 'missing') return null
  if (fault === 'corrupt') return text.slice(0, 128)
  if (fault !== 'environment-mismatch') return text

  const value: unknown = JSON.parse(text)
  if (!isRecord(value) || !isRecord(value.environment)) {
    throw new TypeError('Official precompiled probe could not alter the environment identity')
  }
  value.environment.gameVersion = 'probe-environment-mismatch'
  value.environmentHash = createEnvironmentHash(value.environment)
  return JSON.stringify(value)
}

export const loadBundledOfficialPrecompiledArtifact = async (): Promise<string | null> => {
  try {
    const text = (await import('@/generated/mods/official-precompiled-registry.json?raw')).default
    lastBundledArtifactHash = sha256Utf8(text)
    return applyOfficialPrecompiledProbeFault(text, getOfficialPrecompiledProbeFault())
  } catch {
    return null
  }
}

export const getLastBundledOfficialPrecompiledArtifactHash = (): Sha256Hash | null =>
  lastBundledArtifactHash

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
