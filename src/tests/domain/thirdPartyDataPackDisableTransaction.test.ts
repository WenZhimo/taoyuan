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
const dependencyPackageId = 'disable_transaction_dependency_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash
const mountedAppStartupEvidence = () => Object.freeze({
  realAppStartupHostCalled: true,
  gameAppCreated: true,
  piniaCreated: true,
  routerMounted: true
})

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

const createInstalledDependencyDraft = (): ThirdPartyDataPackLockfileDraft => {
  const installedDraft = createInstalledDraft()
  const targetPackage = installedDraft.packages[0]!
  return {
    ...installedDraft,
    registryCount: 56,
    entryCount: 4244,
    selectedPackageIds: [dependencyPackageId, packageId],
    loadOrder: [dependencyPackageId, packageId],
    packages: [
      {
        ...targetPackage,
        packageId: dependencyPackageId,
        loadIndex: 0,
        source: {
          candidatePath: 'disable-transaction-dependency-pack',
          manifestPath: 'disable-transaction-dependency-pack/manifest.json',
          contentFiles: ['disable-transaction-dependency-pack/data/items.json']
        },
        manifestHash: hash('g'),
        contentHash: hash('h'),
        configurationHash: hash('i'),
        resolvedDependencies: []
      },
      {
        ...targetPackage,
        loadIndex: 1,
        resolvedDependencies: [dependencyPackageId]
      }
    ]
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
    const acknowledgeAppStartupHandoff = vi.fn(async() => mountedAppStartupEvidence())

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
    expect(result.terminal.realAppStartupHostCalled).toBe(true)
    expect(result.terminal.gameAppCreated).toBe(true)
    expect(result.terminal.piniaCreated).toBe(true)
    expect(result.terminal.routerMounted).toBe(true)
    expect(result.runtimePublicationCommit?.status).toBe('accepted')
    expect(result.liveRegistrySwap?.status).toBe('swapped')
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
    expect(writePersistentState).toHaveBeenCalledOnce()
    expect(acknowledgeAppStartupHandoff).toHaveBeenCalledOnce()
  })

  it('disables an installed dependency stack before publishing official-only runtime', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackDisableState({
      officialRegistrySet,
      installedDraft: createInstalledDependencyDraft(),
      targetPackageId: packageId
    })
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )

    const result = await executeThirdPartyDataPackDisableTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState: async() => ({
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: true,
        packageFilesPreserved: true
      }),
      acknowledgeAppStartupHandoff: async() => mountedAppStartupEvidence()
    })

    expect(result.terminal.status, JSON.stringify(result)).toBe('ready')
    expect(result.terminal.selectedPackageIds).toEqual([])
    expect(result.terminal.blockedPackageIds).toEqual([packageId])
    expect(result.terminal.loadOrder).toEqual([])
    expect(result.terminal.packageCount).toBe(2)
    expect(result.terminal.runtimePublicationExcluded).toBe(true)
    expect(result.terminal.liveRegistrySwapped).toBe(true)
    expect(result.terminal.appStartupHandoffAccepted).toBe(true)
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
    expect(state.lockfileDraft.packages.map(currentPackage => currentPackage.packageId))
      .toEqual([dependencyPackageId, packageId])
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
