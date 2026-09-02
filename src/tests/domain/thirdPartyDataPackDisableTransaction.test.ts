import { describe, expect, it, vi } from 'vitest'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { createOfficialContentHash } from '@/domain/mods/officialPrecompiled'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { createThirdPartyDataPackInMemoryLiveRegistryReference } from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import {
  buildThirdPartyDataPackDisableState,
  executeThirdPartyDataPackDisableTransaction
} from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type { PackageId } from '@/domain/mods/ids'
import type { Sha256Hash } from '@/domain/mods/hash'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'disable_transaction_test_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createInstalledDraft = (): ThirdPartyDataPackLockfileDraft => {
  const officialSnapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
  return {
  formatVersion: 1,
  kind: 'third-party-data-pack-lockfile-draft',
  officialIdentity: {
    artifactHash: committedMetadata.artifactHash as Sha256Hash,
    contentHash: createOfficialContentHash(officialSnapshot),
    schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
    environmentHash: committedMetadata.environmentHash as Sha256Hash,
    snapshotHash: officialSnapshot.snapshotHash as Sha256Hash,
    registryCount: officialSnapshot.registries.length,
    entryCount: officialSnapshot.registries.reduce((count, registry) => count + registry.entries.length, 0)
  },
  candidateIdentity: {
    formatVersion: 1,
    contentHash: hash('a'),
    snapshotHash: hash('b'),
    candidateHash: hash('c')
  },
  registryCount: 55,
  entryCount: 4243,
  selectedPackageIds: [packageId],
  loadOrder: [packageId],
  packages: [{
    packageId,
    version: '1.0.0',
    loadIndex: 0,
    source: {
      candidatePath: 'disable-transaction-test-pack',
      manifestPath: 'disable-transaction-test-pack/manifest.json',
      contentFiles: ['disable-transaction-test-pack/data/items.json']
    },
    manifestHash: hash('d'),
    contentHash: hash('e'),
    configurationHash: hash('f'),
    resolvedDependencies: [],
    contentFiles: []
  }],
  lockfileHash: hash('1')
  }
}

describe('third-party data-pack disable transaction', () => {
  it('settles persistent disable state before publishing official-only runtime', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackDisableState({
      officialRegistrySet,
      installedDraft: createInstalledDraft(),
      targetPackageId: packageId
    })
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )
    const writePersistentState = vi.fn(async() => ({
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true,
      packageFilesPreserved: true
    }))
    const acknowledgeAppStartupHandoff = vi.fn(async() => true)

    const result = await executeThirdPartyDataPackDisableTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState,
      acknowledgeAppStartupHandoff
    })

    expect(result.terminal.status, JSON.stringify(result)).toBe('ready')
    expect(result.terminal.selectedPackageIds).toEqual([])
    expect(result.terminal.blockedPackageIds).toEqual([packageId])
    expect(result.terminal.settingsWritten).toBe(true)
    expect(result.terminal.lockfileWritten).toBe(true)
    expect(result.terminal.startupStateWritten).toBe(true)
    expect(result.terminal.packageFilesPreserved).toBe(true)
    expect(result.terminal.runtimePublicationExcluded).toBe(true)
    expect(result.terminal.liveRegistrySwapped).toBe(true)
    expect(result.terminal.appStartupHandoffAccepted).toBe(true)
    expect(result.runtimePublicationCommit?.status).toBe('accepted')
    expect(result.liveRegistrySwap?.status).toBe('swapped')
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
    expect(writePersistentState).toHaveBeenCalledOnce()
    expect(acknowledgeAppStartupHandoff).toHaveBeenCalledOnce()
  })

  it('blocks before runtime publication when persistent disable state is incomplete', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackDisableState({
      officialRegistrySet,
      installedDraft: createInstalledDraft(),
      targetPackageId: packageId
    })
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )
    const acknowledgeAppStartupHandoff = vi.fn(async() => true)

    const result = await executeThirdPartyDataPackDisableTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState: async() => ({
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: false,
        packageFilesPreserved: true
      }),
      acknowledgeAppStartupHandoff
    })

    expect(result.terminal.status).toBe('blocked')
    expect(result.terminal.startupStateWritten).toBe(false)
    expect(result.runtimePublicationCommit).toBeUndefined()
    expect(result.liveRegistrySwap).toBeUndefined()
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
    expect(acknowledgeAppStartupHandoff).not.toHaveBeenCalled()
  })
})
