import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  createInMemoryWebIndexedDbImportPersistenceStore,
  createDefaultWebIndexedDbImportRecord
} from '@/domain/mods/webIndexedDbImportPersistence'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  publishOfficialContentRegistrySet,
  resetLiveContentRegistryForTests
} from '@/domain/mods/liveContentRegistry'
import { useWebInstalledDataPackManagement } from '@/composables/useWebInstalledDataPackManagement'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type { PackageId } from '@/domain/mods/ids'
import type { Sha256Hash } from '@/domain/mods/hash'
import {
  THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackInstalledStateStartupGateBootstrapSource'
import {
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackWebStartupPersistentStateSourceHost'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'web_disable_management_test_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createInstalledDraft = (): ThirdPartyDataPackLockfileDraft => ({
  formatVersion: 1,
  kind: 'third-party-data-pack-lockfile-draft',
  officialIdentity: {
    artifactHash: committedMetadata.artifactHash as Sha256Hash,
    contentHash: committedMetadata.contentHash as Sha256Hash,
    schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
    environmentHash: committedMetadata.environmentHash as Sha256Hash,
    snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
    registryCount: 54,
    entryCount: 4242
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
      candidatePath: 'web-disable-management-test-pack',
      manifestPath: 'web-disable-management-test-pack/manifest.json',
      contentFiles: ['web-disable-management-test-pack/data/items.json']
    },
    manifestHash: hash('d'),
    contentHash: hash('e'),
    configurationHash: hash('f'),
    resolvedDependencies: [],
    contentFiles: []
  }],
  lockfileHash: hash('1')
})

afterEach(() => {
  resetLiveContentRegistryForTests()
})

describe('useWebInstalledDataPackManagement', () => {
  it('disables an installed package, then uninstalls it with official-only persisted state', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    publishOfficialContentRegistrySet(officialRegistrySet)
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const installedPackageStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const startupPersistentStateStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const installedDraft = createInstalledDraft()
    await settingsLockfileStore.write({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      candidateHash: installedDraft.candidateIdentity.candidateHash,
      lockfileHash: installedDraft.lockfileHash,
      lockfileDraft: installedDraft
    })
    const manifestText = '{"id":"web_disable_management_test_pack"}\n'
    await installedPackageStore.put(createDefaultWebIndexedDbImportRecord([
      {
        path: 'web-disable-management-test-pack/manifest.json',
        text: manifestText,
        sizeBytes: manifestText.length
      }
    ], THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID))

    const management = useWebInstalledDataPackManagement({
      officialRegistrySet,
      settingsLockfileStore,
      installedPackageStore,
      startupPersistentStateStore,
      mountedAppStartupEvidence: () => true
    })
    await management.refresh()
    expect(management.rows.value).toEqual([{
      packageId,
      version: '1.0.0',
      status: 'enabled'
    }])

    const result = await management.disable(packageId)
    await nextTick()

    expect(result?.terminal.status).toBe('ready')
    expect(result?.terminal.settingsWritten).toBe(true)
    expect(result?.terminal.lockfileWritten).toBe(true)
    expect(result?.terminal.startupStateWritten).toBe(true)
    expect(result?.terminal.packageFilesPreserved).toBe(true)
    expect(result?.terminal.runtimePublicationExcluded).toBe(true)
    expect(result?.terminal.liveRegistrySwapped).toBe(true)
    expect(result?.terminal.appStartupHandoffAccepted).toBe(true)
    expect(management.status.value).toBe('ready')
    expect(management.rows.value).toEqual([{
      packageId,
      version: '1.0.0',
      status: 'disabled'
    }])
    expect((await settingsLockfileStore.read()).record?.selectedPackageIds).toEqual([])
    expect((await settingsLockfileStore.read()).record?.blockedPackageIds).toEqual([packageId])
    expect((await installedPackageStore.get(THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID))?.files)
      .toHaveLength(1)
    expect((await startupPersistentStateStore.get(THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID))?.files)
      .toHaveLength(1)

    const uninstallResult = await management.uninstall(packageId)
    await nextTick()

    expect(uninstallResult?.terminal.status).toBe('ready')
    expect(uninstallResult?.terminal.settingsWritten).toBe(true)
    expect(uninstallResult?.terminal.lockfileWritten).toBe(true)
    expect(uninstallResult?.terminal.startupStateWritten).toBe(true)
    expect(uninstallResult?.terminal.packageFilesRemoved).toBe(true)
    expect(uninstallResult?.terminal.runtimePublicationExcluded).toBe(true)
    expect(uninstallResult?.terminal.liveRegistrySwapped).toBe(true)
    expect(uninstallResult?.terminal.appStartupHandoffAccepted).toBe(true)
    expect(management.status.value).toBe('ready')
    expect(management.rows.value).toEqual([])
    const uninstalledRecord = (await settingsLockfileStore.read()).record
    expect(uninstalledRecord?.requestedCommandId).toBe('uninstall')
    expect(uninstalledRecord?.targetPackageId).toBe(packageId)
    expect(uninstalledRecord?.selectedPackageIds).toEqual([])
    expect(uninstalledRecord?.blockedPackageIds).toEqual([])
    expect(uninstalledRecord?.loadOrder).toEqual([])
    expect(uninstalledRecord?.lockfileDraft.packages).toEqual([])
    expect(await installedPackageStore.get(THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID))
      .toBeNull()
    const startupRecord = await startupPersistentStateStore.get(
      THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID
    )
    expect(startupRecord?.files).toHaveLength(1)
    const startupSnapshot = JSON.parse(startupRecord!.files[0]!.text) as {
      packageState?: { matched?: boolean, removed?: boolean }
      settingsState?: { matched?: boolean }
      modLockState?: { matched?: boolean }
      liveRegistry?: { matched?: boolean }
      saveCache?: { isolated?: boolean }
    }
    expect(startupSnapshot.packageState).toEqual({ matched: true, removed: true })
    expect(startupSnapshot.settingsState?.matched).toBe(true)
    expect(startupSnapshot.modLockState?.matched).toBe(true)
    expect(startupSnapshot.liveRegistry?.matched).toBe(true)
    expect(startupSnapshot.saveCache?.isolated).toBe(true)
  })

  it('does not uninstall an enabled package before the disabled state is persisted', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    publishOfficialContentRegistrySet(officialRegistrySet)
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const installedPackageStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const startupPersistentStateStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const installedDraft = createInstalledDraft()
    await settingsLockfileStore.write({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      candidateHash: installedDraft.candidateIdentity.candidateHash,
      lockfileHash: installedDraft.lockfileHash,
      lockfileDraft: installedDraft
    })
    const manifestText = '{"id":"web_disable_management_test_pack"}\n'
    await installedPackageStore.put(createDefaultWebIndexedDbImportRecord([
      {
        path: 'web-disable-management-test-pack/manifest.json',
        text: manifestText,
        sizeBytes: manifestText.length
      }
    ], THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID))

    const management = useWebInstalledDataPackManagement({
      officialRegistrySet,
      settingsLockfileStore,
      installedPackageStore,
      startupPersistentStateStore,
      mountedAppStartupEvidence: () => true
    })
    await management.refresh()

    const uninstallResult = await management.uninstall(packageId)
    await nextTick()

    expect(uninstallResult).toBeNull()
    expect(management.status.value).toBe('failed')
    expect(management.reason.value).toBe('Only a disabled installed package can be uninstalled')
    expect(management.rows.value).toEqual([{
      packageId,
      version: '1.0.0',
      status: 'enabled'
    }])
    expect((await settingsLockfileStore.read()).record?.requestedCommandId).toBe('install')
    expect((await installedPackageStore.get(THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID))?.files)
      .toHaveLength(1)
  })
})
