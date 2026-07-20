import { describe, expect, it, vi } from 'vitest'
import { createEnvironmentHash } from '@/domain/mods/environmentHash'
import {
  createOfficialContentBootstrap,
  validateOfficialRegistryStructure,
  type OfficialContentBootstrapError,
  type OfficialPrecompiledBootstrapStatus
} from '@/domain/mods/officialContentBootstrap'
import {
  createExpectedOfficialEnvironmentHash,
  restoreOfficialPrecompiledRegistryArtifact,
  restoreOfficialPrecompiledRegistryArtifactText
} from '@/domain/mods/officialPrecompiled'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import type { OfficialPrecompiledRegistryArtifact } from '@/domain/mods/precompiledRegistrySchema'
import committedArtifact from '@/generated/mods/official-precompiled-registry.json'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const expectedEnvironmentHash = createExpectedOfficialEnvironmentHash(committedMetadata as unknown)

const cloneArtifact = (): OfficialPrecompiledRegistryArtifact =>
  JSON.parse(JSON.stringify(committedArtifact)) as OfficialPrecompiledRegistryArtifact

const restoreArtifact = (value: unknown) => typeof value === 'string'
  ? restoreOfficialPrecompiledRegistryArtifactText(
      OFFICIAL_REGISTRY_DEFINITIONS,
      value,
      expectedEnvironmentHash
    )
  : restoreOfficialPrecompiledRegistryArtifact(
      OFFICIAL_REGISTRY_DEFINITIONS,
      value,
      expectedEnvironmentHash
    )

const createBootstrap = (
  load: () => Promise<unknown | null>,
  buildRegistrySet = vi.fn(buildOfficialRegistrySetFromStaticData)
) => ({
  buildRegistrySet,
  bootstrap: createOfficialContentBootstrap({
    buildRegistrySet,
    validateStructure: validateOfficialRegistryStructure,
    validateSemantics: validateRegistrySemantics,
    freezeRegistrySet: registrySet => registrySet.freezeEntries(),
    precompiled: { load, restore: restoreArtifact }
  })
})

const createFallbackCases = (): Array<{
  name: string
  value: unknown | null
  status: OfficialPrecompiledBootstrapStatus
}> => {
  const schemaInvalid = cloneArtifact()
  Reflect.deleteProperty(schemaInvalid.environment, 'gameVersion')

  const contentHashInvalid = cloneArtifact()
  contentHashInvalid.snapshot.registries[0]!.entries[0]!.entry.id = 'taoyuan:changed'

  const snapshotHashInvalid = cloneArtifact()
  snapshotHashInvalid.snapshot.snapshotHash = `sha256:${'0'.repeat(64)}`

  const unsupported = cloneArtifact()
  Reflect.set(unsupported, 'artifactFormatVersion', 2)

  const v1 = cloneArtifact()
  Reflect.set(v1.snapshot, 'formatVersion', 1)

  const environmentChanged = cloneArtifact()
  environmentChanged.environment.gameVersion = '2.4.1'
  environmentChanged.environmentHash = createEnvironmentHash(environmentChanged.environment)

  const nonJson = cloneArtifact() as OfficialPrecompiledRegistryArtifact & { runtime?: unknown }
  nonJson.runtime = () => true

  return [
    { name: 'missing', value: null, status: 'cache-miss-not-found' },
    { name: 'truncated JSON', value: JSON.stringify(committedArtifact).slice(0, 100), status: 'cache-invalid-json' },
    { name: 'illegal JSON', value: 'not-json', status: 'cache-invalid-json' },
    { name: 'Schema error', value: schemaInvalid, status: 'cache-invalid-structure' },
    { name: 'content hash error', value: contentHashInvalid, status: 'cache-invalid-hash' },
    { name: 'snapshot hash error', value: snapshotHashInvalid, status: 'cache-invalid-hash' },
    { name: 'unsupported artifact version', value: unsupported, status: 'cache-miss-format-changed' },
    { name: 'v1 snapshot', value: v1, status: 'cache-miss-format-changed' },
    { name: 'environment mismatch', value: environmentChanged, status: 'cache-miss-environment-changed' },
    { name: 'non-JSON object graph', value: nonJson, status: 'cache-invalid-structure' }
  ]
}

describe('official precompiled bootstrap fallback', () => {
  it.each(createFallbackCases())('falls back atomically for $name', async ({ value, status }) => {
    const harness = createBootstrap(async () => value)
    const restored = await harness.bootstrap.bootstrap()
    const built = buildOfficialRegistrySetFromStaticData()
    built.freezeEntries()

    expect(harness.buildRegistrySet).toHaveBeenCalledOnce()
    expect(createSerializableRegistrySnapshot(restored)).toEqual(createSerializableRegistrySnapshot(built))
    expect(harness.bootstrap.getLastReport()).toMatchObject({
      source: 'static',
      precompiledStatus: status
    })
    expect(harness.bootstrap.getLastReport()?.diagnostics.length).toBeGreaterThan(0)
  })

  it('uses a valid artifact without invoking the static fallback', async () => {
    const harness = createBootstrap(async () => JSON.stringify(committedArtifact))

    const restored = await harness.bootstrap.bootstrap()

    expect(harness.buildRegistrySet).not.toHaveBeenCalled()
    expect(createSerializableRegistrySnapshot(restored)).toEqual(committedArtifact.snapshot)
    expect(harness.bootstrap.getLastReport()).toEqual({
      source: 'precompiled',
      precompiledStatus: 'official-precompiled-hit',
      diagnostics: []
    })
  })

  it('does not publish partial state or retry the static build when fallback fails', async () => {
    const buildRegistrySet = vi.fn(() => {
      throw new Error('static build failed')
    })
    const harness = createBootstrap(async () => null, buildRegistrySet)

    await expect(harness.bootstrap.bootstrap()).rejects.toMatchObject({
      stage: 'build'
    } satisfies Partial<OfficialContentBootstrapError>)
    expect(buildRegistrySet).toHaveBeenCalledOnce()
    expect(() => harness.bootstrap.getRegistrySet()).toThrowError(
      expect.objectContaining({ stage: 'access' })
    )
    expect(harness.bootstrap.getLastReport()).toMatchObject({
      source: 'static',
      precompiledStatus: 'cache-miss-not-found'
    })
  })
})
