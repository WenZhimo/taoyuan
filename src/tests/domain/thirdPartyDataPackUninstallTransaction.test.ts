import { describe, expect, it, vi } from 'vitest'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { createOfficialContentHash } from '@/domain/mods/officialPrecompiled'
import {
  createSerializableRegistrySnapshot,
  RegistrySet,
  type RegistryEntry
} from '@/domain/mods/registry'
import { createThirdPartyDataPackInMemoryLiveRegistryReference } from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import { createThirdPartyDataPackModLockText } from '@/domain/mods/thirdPartyDataPackModLockFile'
import {
  buildThirdPartyDataPackUninstallState,
  executeThirdPartyDataPackUninstallTransaction
} from '@/domain/mods/thirdPartyDataPackUninstallTransaction'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import {
  toOfficialContentId,
  toOfficialRegistryTypeId,
  type PackageId
} from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'uninstall_transaction_test_pack' as PackageId
const dependencyPackageId = 'uninstall_transaction_dependency_pack' as PackageId
const unrelatedPackageId = 'uninstall_transaction_unrelated_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash
const mountedAppStartupEvidence = () => Object.freeze({
  realAppStartupHostCalled: true,
  gameAppCreated: true,
  piniaCreated: true,
  routerMounted: true
})

const createDisabledDraft = (): ThirdPartyDataPackLockfileDraft => {
  const officialSnapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
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
    selectedPackageIds: [],
    loadOrder: [],
    packages: [{
      packageId,
      version: '1.0.0',
      loadIndex: 0,
      source: {
        candidatePath: 'uninstall-transaction-test-pack',
        manifestPath: 'uninstall-transaction-test-pack/manifest.json',
        contentFiles: ['uninstall-transaction-test-pack/data/items.json']
      },
      manifestHash: hash('d'),
      contentHash: hash('e'),
      configurationHash: hash('f'),
      resolvedDependencies: [],
      contentFiles: []
    }]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const createEnabledDraft = (): ThirdPartyDataPackLockfileDraft => {
  const disabledDraft = createDisabledDraft()
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    ...disabledDraft,
    selectedPackageIds: [packageId],
    loadOrder: [packageId]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const createEnabledDependencyDraft = (): ThirdPartyDataPackLockfileDraft => {
  const disabledDraft = createDisabledDraft()
  const targetPackage = disabledDraft.packages[0]!
  const dependencyPackage = {
    ...targetPackage,
    packageId: dependencyPackageId,
    loadIndex: 0,
    source: {
      candidatePath: 'uninstall-transaction-dependency-pack',
      manifestPath: 'uninstall-transaction-dependency-pack/manifest.json',
      contentFiles: ['uninstall-transaction-dependency-pack/data/items.json']
    },
    resolvedDependencies: []
  }
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: disabledDraft.formatVersion,
    kind: disabledDraft.kind,
    officialIdentity: disabledDraft.officialIdentity,
    candidateIdentity: disabledDraft.candidateIdentity,
    registryCount: disabledDraft.registryCount,
    entryCount: disabledDraft.entryCount,
    selectedPackageIds: [dependencyPackageId, packageId],
    loadOrder: [dependencyPackageId, packageId],
    packages: [
      dependencyPackage,
      {
        ...targetPackage,
        loadIndex: 1,
        resolvedDependencies: [dependencyPackageId]
      }
    ]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const cloneOfficialRegistrySetWithRuntimePackages = (
  officialRegistrySet: RegistrySet,
  options: { readonly includeUnrelated?: boolean } = {}
): RegistrySet => {
  const registrySet = new RegistrySet()
  for (const registryId of officialRegistrySet.registryIds()) {
    registrySet.defineRegistry(officialRegistrySet.get<RegistryEntry>(registryId).definition)
  }
  registrySet.freezeDefinitions()
  for (const registryId of officialRegistrySet.registryIds()) {
    const sourceRegistry = officialRegistrySet.get<RegistryEntry>(registryId)
    const targetRegistry = registrySet.get<RegistryEntry>(registryId)
    for (const record of sourceRegistry.entries()) {
      targetRegistry.register(record.owner, record.entry, record.source
        ? { file: record.source.file, localId: record.source.localId }
        : undefined)
    }
  }
  const itemRegistry = registrySet.get<RegistryEntry & { readonly name: string }>(
    toOfficialRegistryTypeId('item')
  )
  itemRegistry.register(dependencyPackageId, {
    id: toOfficialContentId(`${dependencyPackageId}:library_token`),
    name: 'Uninstall Transaction Library Token'
  }, {
    file: 'uninstall-transaction-dependency-pack/data/items.json',
    localId: 'library_token'
  })
  itemRegistry.register(packageId, {
    id: toOfficialContentId(`${packageId}:linen_ribbon`),
    name: 'Uninstall Transaction Linen Ribbon'
  }, {
    file: 'uninstall-transaction-test-pack/data/items.json',
    localId: 'linen_ribbon'
  })
  if (options.includeUnrelated === true) {
    itemRegistry.register(unrelatedPackageId, {
      id: toOfficialContentId(`${unrelatedPackageId}:pine_button`),
      name: 'Uninstall Transaction Pine Button'
    }, {
      file: 'uninstall-transaction-unrelated-pack/data/items.json',
      localId: 'pine_button'
    })
  }
  registrySet.freezeEntries()
  return registrySet
}

describe('third-party data-pack uninstall transaction', () => {
  it('removes a disabled package before publishing official-only runtime', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackUninstallState({
      officialRegistrySet,
      installedDraft: createDisabledDraft(),
      targetPackageId: packageId
    })
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )
    const writePersistentState = vi.fn(async() => ({
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true,
      packageFilesRemoved: true
    }))
    const acknowledgeAppStartupHandoff = vi.fn(async() => mountedAppStartupEvidence())

    const result = await executeThirdPartyDataPackUninstallTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState,
      acknowledgeAppStartupHandoff
    })

    expect(result.terminal.status, JSON.stringify(result)).toBe('ready')
    expect(result.terminal.selectedPackageIds).toEqual([])
    expect(result.terminal.blockedPackageIds).toEqual([])
    expect(result.terminal.loadOrder).toEqual([])
    expect(result.terminal.packageCount).toBe(0)
    expect(result.terminal.settingsWritten).toBe(true)
    expect(result.terminal.lockfileWritten).toBe(true)
    expect(result.terminal.startupStateWritten).toBe(true)
    expect(result.terminal.packageFilesRemoved).toBe(true)
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

    const parsedLockfile = JSON.parse(
      createThirdPartyDataPackModLockText(state.lockfileDraft)
    ) as ThirdPartyDataPackLockfileDraft
    expect(parsedLockfile.packages).toEqual([])
    expect(parsedLockfile.selectedPackageIds).toEqual([])
    expect(parsedLockfile.loadOrder).toEqual([])
    expect(parsedLockfile.lockfileHash).toBe(state.lockfileHash)
  })

  it('blocks before runtime publication when package file removal is incomplete', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackUninstallState({
      officialRegistrySet,
      installedDraft: createDisabledDraft(),
      targetPackageId: packageId
    })
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )
    const acknowledgeAppStartupHandoff = vi.fn(async() => true)

    const result = await executeThirdPartyDataPackUninstallTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState: async() => ({
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: true,
        packageFilesRemoved: false
      }),
      acknowledgeAppStartupHandoff
    })

    expect(result.terminal.status).toBe('blocked')
    expect(result.terminal.packageFilesRemoved).toBe(false)
    expect(result.runtimePublicationCommit).toBeUndefined()
    expect(result.liveRegistrySwap).toBeUndefined()
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
    expect(acknowledgeAppStartupHandoff).not.toHaveBeenCalled()
  })

  it('removes an enabled package directly before publishing official-only runtime', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackUninstallState({
      officialRegistrySet,
      installedDraft: createEnabledDraft(),
      targetPackageId: packageId
    })
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )

    const result = await executeThirdPartyDataPackUninstallTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState: async() => ({
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: true,
        packageFilesRemoved: true
      }),
      acknowledgeAppStartupHandoff: async() => mountedAppStartupEvidence()
    })

    expect(result.terminal.status, JSON.stringify(result)).toBe('ready')
    expect(result.terminal.selectedPackageIds).toEqual([])
    expect(result.terminal.blockedPackageIds).toEqual([])
    expect(result.terminal.loadOrder).toEqual([])
    expect(result.terminal.packageCount).toBe(0)
    expect(result.terminal.runtimePublicationExcluded).toBe(true)
    expect(result.terminal.liveRegistrySwapped).toBe(true)
    expect(result.terminal.appStartupHandoffAccepted).toBe(true)
    expect(result.terminal.realAppStartupHostCalled).toBe(true)
    expect(result.terminal.gameAppCreated).toBe(true)
    expect(result.terminal.piniaCreated).toBe(true)
    expect(result.terminal.routerMounted).toBe(true)
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
  })

  it('removes an enabled target package with active dependencies and keeps dependencies installed disabled', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackUninstallState({
      officialRegistrySet,
      installedDraft: createEnabledDependencyDraft(),
      targetPackageId: packageId
    })
    const activeRegistrySet = cloneOfficialRegistrySetWithRuntimePackages(officialRegistrySet)
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(activeRegistrySet)

    const result = await executeThirdPartyDataPackUninstallTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState: async() => ({
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: true,
        packageFilesRemoved: true
      }),
      acknowledgeAppStartupHandoff: async() => mountedAppStartupEvidence()
    })

    expect(result.terminal.status, JSON.stringify(result)).toBe('ready')
    expect(result.terminal.selectedPackageIds).toEqual([])
    expect(result.terminal.blockedPackageIds).toEqual([])
    expect(result.terminal.loadOrder).toEqual([])
    expect(result.terminal.packageCount).toBe(1)
    expect(result.terminal.runtimePublicationExcluded).toBe(true)
    expect(result.terminal.liveRegistrySwapped).toBe(true)
    expect(result.terminal.appStartupHandoffAccepted).toBe(true)
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
    expect(result.liveRegistrySwap?.status).toBe('swapped')
    expect(result.liveRegistrySwap?.effects.liveRegistrySwapped).toBe(true)

    const parsedLockfile = JSON.parse(
      createThirdPartyDataPackModLockText(state.lockfileDraft)
    ) as ThirdPartyDataPackLockfileDraft
    expect(parsedLockfile.packages.map(pkg => pkg.packageId))
      .toEqual([dependencyPackageId])
    expect(parsedLockfile.selectedPackageIds).toEqual([])
    expect(parsedLockfile.loadOrder).toEqual([])
    expect(parsedLockfile.lockfileHash).toBe(state.lockfileHash)
  })

  it('blocks active dependency uninstall when an unrelated runtime package would be dropped', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const state = buildThirdPartyDataPackUninstallState({
      officialRegistrySet,
      installedDraft: createEnabledDependencyDraft(),
      targetPackageId: packageId
    })
    const activeRegistrySet = cloneOfficialRegistrySetWithRuntimePackages(officialRegistrySet, {
      includeUnrelated: true
    })
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(activeRegistrySet)
    const acknowledgeAppStartupHandoff = vi.fn(async() => mountedAppStartupEvidence())

    const result = await executeThirdPartyDataPackUninstallTransaction({
      state,
      candidateRegistrySet: officialRegistrySet,
      liveRegistryReference,
      writePersistentState: async() => ({
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: true,
        packageFilesRemoved: true
      }),
      acknowledgeAppStartupHandoff
    })

    expect(result.terminal.status).toBe('blocked')
    expect(result.terminal.reason).toBe('uninstall transaction live registry swap was blocked')
    expect(result.terminal.liveRegistrySwapped).toBe(false)
    expect(result.liveRegistrySwap?.status).toBe('blocked')
    expect(liveRegistryReference.current).toBe(activeRegistrySet)
    expect(acknowledgeAppStartupHandoff).not.toHaveBeenCalled()
  })

  it('rejects uninstalling while another package is still active', () => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const otherPackageId = 'other_active_package' as PackageId
    const activeOtherDraft = {
      ...createDisabledDraft(),
      selectedPackageIds: [otherPackageId],
      loadOrder: [otherPackageId]
    }

    expect(() => buildThirdPartyDataPackUninstallState({
      officialRegistrySet,
      installedDraft: activeOtherDraft,
      targetPackageId: packageId
    })).toThrow('Only the target installed package can be active when uninstalling')
  })
})
