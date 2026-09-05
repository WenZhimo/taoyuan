import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { getOfficialItemDef } from '@/domain/mods/contentAccess'
import {
  createMemoryContentPackageSource
} from '@/domain/mods/contentPackageSource'
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
import { buildWebFilePickerSourceMountInput } from '@/composables/useWebFilePickerImportEntry'
import type { ThirdPartyDataPackMountInputResult } from '@/domain/mods/thirdPartyDataPackMountInput'
import type {
  ThirdPartyDataPackElectronDisableCommandEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronDisableCommandBridge'
import type {
  ThirdPartyDataPackElectronInstalledStateReadResult
} from '@/domain/mods/thirdPartyDataPackElectronInstalledStateBridge'

const packageId = 'web_disable_management_test_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash
const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = () => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Web Management Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = () => ({
  id: `${packageId}:linen_ribbon`,
  name: {
    key: `${packageId}.linen_ribbon.name`,
    fallback: 'Web Management Linen Ribbon'
  },
  category: 'gift',
  description: {
    key: `${packageId}.linen_ribbon.description`,
    fallback: 'Synthetic item for installed package management tests.'
  },
  sellPrice: 8,
  edible: false
})

const createInstalledPackageFiles = () => {
  const manifestText = toJson(createManifest())
  const localeText = '{}\n'
  const itemText = toJson([createItem()])
  return [
    {
      path: 'web-disable-management-test-pack/manifest.json',
      text: manifestText,
      sizeBytes: manifestText.length
    },
    {
      path: 'web-disable-management-test-pack/locales/zh-CN.json',
      text: localeText,
      sizeBytes: localeText.length
    },
    {
      path: 'web-disable-management-test-pack/data/items.json',
      text: itemText,
      sizeBytes: itemText.length
    }
  ]
}

const createEnabledMountInput = async(
  officialRegistrySet: ReturnType<typeof buildOfficialRegistrySetFromStaticData>
): Promise<ThirdPartyDataPackMountInputResult> =>
  await buildWebFilePickerSourceMountInput({
    officialRegistrySet,
    source: createMemoryContentPackageSource({
      sourceId: 'memory/web-management-enable-test',
      rootPath: 'packs',
      files: createInstalledPackageFiles().map(file => ({
        path: file.path,
        text: file.text
      }))
    })
  })

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

  it('uninstalls an enabled package directly with official-only persisted state', async() => {
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
    expect(uninstalledRecord).toMatchObject({
      requestedCommandId: 'uninstall',
      targetPackageId: packageId,
      selectedPackageIds: [],
      blockedPackageIds: [],
      loadOrder: []
    })
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

  it('re-enables a disabled installed package through the enable transaction terminal', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    publishOfficialContentRegistrySet(officialRegistrySet)
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const installedPackageStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const startupPersistentStateStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const enabledMountInput = await createEnabledMountInput(officialRegistrySet)
    expect(enabledMountInput.status).toBe('ready')
    const installedDraft = enabledMountInput.lockfileDraft!
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
    await installedPackageStore.put(createDefaultWebIndexedDbImportRecord(
      createInstalledPackageFiles(),
      THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
    ))

    const management = useWebInstalledDataPackManagement({
      officialRegistrySet,
      settingsLockfileStore,
      installedPackageStore,
      startupPersistentStateStore,
      mountedAppStartupEvidence: () => true,
      readEnableMountInput: async(targetPackageId) =>
        targetPackageId === packageId ? enabledMountInput : null
    })
    await management.refresh()

    const disableResult = await management.disable(packageId)
    await nextTick()

    expect(disableResult?.terminal.status).toBe('ready')
    expect(management.rows.value).toEqual([{
      packageId,
      version: '1.0.0',
      status: 'disabled'
    }])
    expect(getOfficialItemDef(`${packageId}:linen_ribbon`)).toBeUndefined()

    const enableResult = await management.enable(packageId)
    await nextTick()

    expect(enableResult?.terminal.status).toBe('ready')
    expect(enableResult?.terminal.requestedCommandId).toBe('enable')
    expect(enableResult?.terminal.selectedPackageIds).toEqual([packageId])
    expect(enableResult?.terminal.blockedPackageIds).toEqual([])
    expect(enableResult?.terminal.loadOrder).toEqual([packageId])
    expect(enableResult?.terminal.settingsWritten).toBe(true)
    expect(enableResult?.terminal.lockfileWritten).toBe(true)
    expect(enableResult?.terminal.startupStateWritten).toBe(true)
    expect(enableResult?.terminal.packageFilesPreserved).toBe(true)
    expect(enableResult?.terminal.runtimePublicationIncluded).toBe(true)
    expect(enableResult?.terminal.liveRegistrySwapped).toBe(true)
    expect(enableResult?.terminal.appStartupHandoffAccepted).toBe(true)
    expect(management.status.value).toBe('ready')
    expect(management.rows.value).toEqual([{
      packageId,
      version: '1.0.0',
      status: 'enabled'
    }])
    expect(management.lastEnableResult.value?.terminal.status).toBe('ready')
    expect(getOfficialItemDef(`${packageId}:linen_ribbon`)?.name.fallback)
      .toBe('Web Management Linen Ribbon')
    const enabledRecord = (await settingsLockfileStore.read()).record
    expect(enabledRecord).toMatchObject({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      requestedCommandId: 'enable',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId]
    })
    expect(enabledRecord?.candidateHash).toBe(installedDraft.candidateIdentity.candidateHash)
    expect(enabledRecord?.lockfileHash).toBe(installedDraft.lockfileHash)
    expect((await installedPackageStore.get(THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID))?.files)
      .toHaveLength(3)
    const startupRecord = await startupPersistentStateStore.get(
      THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID
    )
    expect(startupRecord?.files).toHaveLength(1)
    const startupSnapshot = JSON.parse(startupRecord!.files[0]!.text) as {
      packageState?: { matched?: boolean }
      settingsState?: { matched?: boolean }
      modLockState?: { matched?: boolean }
      liveRegistry?: { matched?: boolean }
      saveCache?: { isolated?: boolean }
    }
    expect(startupSnapshot.packageState?.matched).toBe(true)
    expect(startupSnapshot.settingsState?.matched).toBe(true)
    expect(startupSnapshot.modLockState?.matched).toBe(true)
    expect(startupSnapshot.liveRegistry?.matched).toBe(true)
    expect(startupSnapshot.saveCache?.isolated).toBe(true)
  })

  it('routes visible disable persistence through the Electron renderer command host', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    publishOfficialContentRegistrySet(officialRegistrySet)
    const installedDraft = createInstalledDraft()
    const readElectronInstalledState = vi.fn(async(): Promise<ThirdPartyDataPackElectronInstalledStateReadResult> => ({
      status: 'ready' as const,
      record: {
        recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        candidateHash: installedDraft.candidateIdentity.candidateHash,
        lockfileHash: installedDraft.lockfileHash,
        lockfileDraft: installedDraft
      },
      packageFilesPreserved: true
    }))
    const electronDisableCommand = vi.fn(async(
      envelope: ThirdPartyDataPackElectronDisableCommandEnvelope
    ) => ({
      status: 'written' as const,
      requestedCommandId: 'disable' as const,
      targetPackageId: envelope.targetPackageId,
      selectedPackageIds: [],
      blockedPackageIds: [envelope.targetPackageId],
      loadOrder: [],
      packageFilesPreserved: true,
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true,
      diagnostics: []
    }))

    const management = useWebInstalledDataPackManagement({
      officialRegistrySet,
      settingsLockfileStore: null,
      installedPackageStore: null,
      startupPersistentStateStore: null,
      mountedAppStartupEvidence: () => true,
      readElectronInstalledState,
      electronDisableCommand
    })
    await management.refresh()

    const result = await management.disable(packageId)
    await nextTick()

    expect(readElectronInstalledState).toHaveBeenCalledTimes(2)
    expect(electronDisableCommand).toHaveBeenCalledOnce()
    expect(electronDisableCommand.mock.calls[0]?.[0]).toMatchObject({
      requestedCommandId: 'disable',
      targetPackageId: packageId,
      selectedPackageIds: [],
      blockedPackageIds: [packageId],
      loadOrder: [],
      packageFilesPreserved: true,
      record: {
        requestedCommandId: 'disable',
        targetPackageId: packageId,
        selectedPackageIds: [],
        blockedPackageIds: [packageId],
        loadOrder: []
      },
      startupSnapshot: {
        kind: 'electron-startup-persistent-state-snapshot',
        packageId
      }
    })
    expect(result).toMatchObject({
      managementCommandHostKind: 'electron-renderer',
      managementCommandDispatched: true,
      managementUiIpcResponseDelivered: true,
      terminal: {
        status: 'ready',
        requestedCommandId: 'disable',
        targetPackageId: packageId,
        selectedPackageIds: [],
        blockedPackageIds: [packageId],
        loadOrder: [],
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: true,
        packageFilesPreserved: true,
        runtimePublicationExcluded: true,
        liveRegistrySwapped: true,
        appStartupHandoffAccepted: true
      }
    })
    expect(management.lastResult.value).toBe(result)
    expect(management.rows.value).toEqual([{
      packageId,
      version: '1.0.0',
      status: 'disabled'
    }])
    expect(JSON.stringify(electronDisableCommand.mock.calls[0]?.[0])).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
  })
})
