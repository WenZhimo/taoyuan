import { describe, expect, it, vi } from 'vitest'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { createOfficialContentHash } from '@/domain/mods/officialPrecompiled'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { createThirdPartyDataPackInMemoryLiveRegistryReference } from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import { createThirdPartyDataPackModLockText } from '@/domain/mods/thirdPartyDataPackModLockFile'
import {
  buildThirdPartyDataPackUninstallState,
  executeThirdPartyDataPackUninstallTransaction
} from '@/domain/mods/thirdPartyDataPackUninstallTransaction'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'uninstall_transaction_test_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

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
    const acknowledgeAppStartupHandoff = vi.fn(async() => true)

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
      acknowledgeAppStartupHandoff: async() => true
    })

    expect(result.terminal.status, JSON.stringify(result)).toBe('ready')
    expect(result.terminal.selectedPackageIds).toEqual([])
    expect(result.terminal.blockedPackageIds).toEqual([])
    expect(result.terminal.loadOrder).toEqual([])
    expect(result.terminal.packageCount).toBe(0)
    expect(result.terminal.runtimePublicationExcluded).toBe(true)
    expect(result.terminal.liveRegistrySwapped).toBe(true)
    expect(result.terminal.appStartupHandoffAccepted).toBe(true)
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
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
