import { describe, expect, it } from 'vitest'
import { createEnvironmentHash } from '@/domain/mods/environmentHash'
import { hashCanonicalJson } from '@/domain/mods/hash'
import { requireContentId } from '@/domain/mods/ids'
import {
  OfficialPrecompiledArtifactError,
  createExpectedOfficialEnvironmentHash,
  createOfficialContentHash,
  createOfficialPrecompiledRegistryArtifact,
  parseOfficialPrecompiledRegistryArtifact,
  parseOfficialPrecompiledRegistryArtifactText,
  restoreOfficialPrecompiledRegistryArtifact
} from '@/domain/mods/officialPrecompiled'
import {
  createSerializableRegistrySnapshot,
  type RegistryEntry
} from '@/domain/mods/registry'
import {
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import type { OfficialPrecompiledRegistryArtifact } from '@/domain/mods/precompiledRegistrySchema'
import committedArtifact from '@/generated/mods/official-precompiled-registry.json'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const cloneArtifact = (): OfficialPrecompiledRegistryArtifact =>
  JSON.parse(JSON.stringify(committedArtifact)) as OfficialPrecompiledRegistryArtifact

const rehashArtifact = (artifact: OfficialPrecompiledRegistryArtifact): void => {
  artifact.snapshot.snapshotHash = hashCanonicalJson({
    formatVersion: artifact.snapshot.formatVersion,
    registries: artifact.snapshot.registries
  })
  const officialPackage = artifact.environment.packages[0]
  if (!officialPackage) throw new Error('Missing official package identity')
  officialPackage.contentHash = createOfficialContentHash(artifact.snapshot)
  artifact.environmentHash = createEnvironmentHash(artifact.environment)
}

const expectArtifactError = (
  action: () => unknown,
  kind: OfficialPrecompiledArtifactError['kind']
): OfficialPrecompiledArtifactError => {
  try {
    action()
  } catch (error) {
    expect(error).toBeInstanceOf(OfficialPrecompiledArtifactError)
    expect((error as OfficialPrecompiledArtifactError).kind).toBe(kind)
    return error as OfficialPrecompiledArtifactError
  }
  throw new Error(`Expected official precompiled artifact error: ${kind}`)
}

describe('official precompiled registry artifact', () => {
  it('repeats deterministically and matches the committed generated artifact', () => {
    const firstSet = buildOfficialRegistrySetFromStaticData()
    firstSet.freezeEntries()
    const secondSet = buildOfficialRegistrySetFromStaticData()
    secondSet.freezeEntries()

    const first = createOfficialPrecompiledRegistryArtifact(firstSet)
    const second = createOfficialPrecompiledRegistryArtifact(secondSet)

    expect(first).toEqual(second)
    expect(first).toEqual(committedArtifact)
    expect(first.artifactFormatVersion).toBe(1)
    expect(first.snapshot.formatVersion).toBe(2)
    expect(first.snapshot.snapshotHash).toBe('sha256:4e87e4bc1d6310d4467335da77603006bf769fdb5c4da45ad927f7ed85a5c4b3')
    expect(first.snapshot.registries).toHaveLength(54)
    expect(first.snapshot.registries.reduce((total, registry) => total + registry.entries.length, 0)).toBe(4242)
  })

  it('restores all official registries, order, records, values, and public ID lookups', () => {
    const expectedEnvironmentHash = createExpectedOfficialEnvironmentHash(committedMetadata as unknown)
    const restored = restoreOfficialPrecompiledRegistryArtifact(
      OFFICIAL_REGISTRY_DEFINITIONS,
      committedArtifact as unknown,
      expectedEnvironmentHash
    )
    const built = buildOfficialRegistrySetFromStaticData()
    built.freezeEntries()

    expect(createSerializableRegistrySnapshot(restored)).toEqual(createSerializableRegistrySnapshot(built))
    expect(restored.registryIds()).toEqual(built.registryIds())
    for (const registryId of built.registryIds()) {
      const builtRegistry = built.get<RegistryEntry>(registryId)
      const restoredRegistry = restored.get<RegistryEntry>(registryId)
      expect(restoredRegistry.entries()).toEqual(builtRegistry.entries())
      expect(restoredRegistry.values()).toEqual(builtRegistry.values())
      for (const entry of builtRegistry.values()) {
        expect(restoredRegistry.require(requireContentId(entry.id))).toEqual(entry)
      }
    }
  })

  it('rejects an environmentHash mismatch even when the artifact is internally valid', () => {
    const differentEnvironmentHash = createEnvironmentHash({
      ...committedArtifact.environment,
      gameVersion: '2.4.1'
    })
    expectArtifactError(
      () => parseOfficialPrecompiledRegistryArtifact(committedArtifact as unknown, differentEnvironmentHash),
      'environment-mismatch'
    )
  })

  it('rejects invalid JSON, unsupported versions, Schema drift, and non-JSON graphs', () => {
    expectArtifactError(
      () => parseOfficialPrecompiledRegistryArtifactText('{"artifactFormatVersion":'),
      'invalid-json'
    )

    const unsupportedArtifact = cloneArtifact()
    Reflect.set(unsupportedArtifact, 'artifactFormatVersion', 2)
    expectArtifactError(() => parseOfficialPrecompiledRegistryArtifact(unsupportedArtifact), 'format-version')

    const v1Snapshot = cloneArtifact()
    Reflect.set(v1Snapshot.snapshot, 'formatVersion', 1)
    expectArtifactError(() => parseOfficialPrecompiledRegistryArtifact(v1Snapshot), 'format-version')

    const schemaInvalid = cloneArtifact()
    Reflect.deleteProperty(schemaInvalid.environment, 'gameVersion')
    expectArtifactError(() => parseOfficialPrecompiledRegistryArtifact(schemaInvalid), 'structure')

    let accessorRead = false
    const accessorArtifact = cloneArtifact()
    Object.defineProperty(accessorArtifact, 'artifactFormatVersion', {
      enumerable: true,
      get: () => {
        accessorRead = true
        return 1
      }
    })
    expectArtifactError(() => parseOfficialPrecompiledRegistryArtifact(accessorArtifact), 'structure')
    expect(accessorRead).toBe(false)
  })

  it('rejects environment, content, snapshot, and registry-set hash tampering', () => {
    const environmentTampered = cloneArtifact()
    environmentTampered.environmentHash = `sha256:${'0'.repeat(64)}`
    expectArtifactError(() => parseOfficialPrecompiledRegistryArtifact(environmentTampered), 'environment-hash')

    const contentTampered = cloneArtifact()
    contentTampered.snapshot.registries[0]!.entries[0]!.entry.id = 'taoyuan:changed'
    expectArtifactError(() => parseOfficialPrecompiledRegistryArtifact(contentTampered), 'environment-hash')

    const snapshotHashTampered = cloneArtifact()
    snapshotHashTampered.snapshot.snapshotHash = `sha256:${'0'.repeat(64)}`
    expectArtifactError(
      () => restoreOfficialPrecompiledRegistryArtifact(OFFICIAL_REGISTRY_DEFINITIONS, snapshotHashTampered),
      'snapshot'
    )

    const registrySetTampered = cloneArtifact()
    registrySetTampered.snapshot.registries.pop()
    rehashArtifact(registrySetTampered)
    expectArtifactError(
      () => restoreOfficialPrecompiledRegistryArtifact(OFFICIAL_REGISTRY_DEFINITIONS, registrySetTampered),
      'snapshot'
    )
  })
})
