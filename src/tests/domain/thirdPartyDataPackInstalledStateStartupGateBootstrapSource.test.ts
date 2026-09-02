import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDiscoveryFileSystemFromContentPackageSource
} from '@/domain/mods/contentPackageSource'
import {
  hashCanonicalJson,
  type Sha256Hash
} from '@/domain/mods/hash'
import {
  toOfficialContentId,
  type PackageId
} from '@/domain/mods/ids'
import {
  getOfficialItemDef,
  getOfficialRecipeDef,
  getOfficialShopOfferDefs
} from '@/domain/mods/contentAccess'
import {
  getOfficialBaselineContentRegistrySet,
  publishOfficialContentRegistrySet,
  resetLiveContentRegistryForTests
} from '@/domain/mods/liveContentRegistry'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import {
  createSerializableRegistrySnapshot,
  restoreRegistrySetFromSnapshot
} from '@/domain/mods/registry'
import {
  discoverThirdPartyDataPacks
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID,
  createThirdPartyDataPackInstalledStateStartupGateBootstrapSource
} from '@/domain/mods/thirdPartyDataPackInstalledStateStartupGateBootstrapSource'
import {
  buildThirdPartyDataPackMountInput,
  type ThirdPartyDataPackMountInputResult
} from '@/domain/mods/thirdPartyDataPackMountInput'
import {
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackWebStartupPersistentStateSourceHost'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createDefaultWebIndexedDbImportRecord,
  createInMemoryWebIndexedDbImportPersistenceStore,
  restoreWebIndexedDbImportSource,
  type WebIndexedDbImportPersistenceStore
} from '@/domain/mods/webIndexedDbImportPersistence'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createManifest = (packageId: PackageId): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: `${packageId} startup pack` },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Startup Installed State Test', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: {
    'taoyuan:item': ['data/items.json'],
    'taoyuan:recipe': ['data/recipes.json'],
    'taoyuan:shop_offer': ['data/shop-offers.json']
  }
})

const createItem = (packageId: PackageId): JsonObject => ({
  id: `${packageId}:linen_ribbon`,
  name: {
    key: `${packageId}.item.linen_ribbon.name`,
    fallback: `${packageId} Startup Linen Ribbon`
  },
  category: 'gift',
  description: {
    key: `${packageId}.item.linen_ribbon.description`,
    fallback: 'Installed-state startup item.'
  },
  sellPrice: 8,
  edible: false
})

const createRecipe = (packageId: PackageId): JsonObject => ({
  id: `${packageId}:linen_ribbon_snack`,
  name: {
    key: `${packageId}.recipe.linen_ribbon_snack.name`,
    fallback: `${packageId} Startup Linen Ribbon Snack`
  },
  ingredients: [
    {
      type: 'item',
      itemId: `${packageId}:linen_ribbon`,
      quantity: 1
    }
  ],
  outputItemId: `${packageId}:linen_ribbon`,
  outputQuantity: 1,
  effect: {
    staminaRestore: 2
  },
  unlockSource: 'Installed-state startup test',
  description: {
    key: `${packageId}.recipe.linen_ribbon_snack.description`,
    fallback: 'Installed-state startup recipe.'
  }
})

const createShopOffer = (packageId: PackageId): JsonObject => ({
  id: `${packageId}:shop/wanwupu/linen_ribbon/0`,
  shopId: 'taoyuan:wanwupu',
  itemId: `${packageId}:linen_ribbon`,
  name: {
    key: `${packageId}.shop_offer.linen_ribbon.name`,
    fallback: `${packageId} Startup Linen Ribbon Stand`
  },
  description: {
    key: `${packageId}.shop_offer.linen_ribbon.description`,
    fallback: 'Installed-state startup shop offer.'
  },
  groupId: 'startup-test',
  groupName: {
    key: `${packageId}.shop_offer.group.startup_test`,
    fallback: 'Startup Test'
  },
  purchaseKind: 'item',
  price: 12,
  quantity: 1,
  sortOrder: 9999
})

const getStartupShopOfferNameFallback = (packageId: PackageId): string | undefined => {
  const shopOffers = getOfficialShopOfferDefs()
  const shopOffer = shopOffers.find(offer =>
    offer.id === `${packageId}:shop/wanwupu/linen_ribbon/0`
  )
  return shopOffer?.name?.fallback
}

const expectStartupPackContentVisible = (packageId: PackageId) => {
  expect(getOfficialItemDef(`${packageId}:linen_ribbon`)?.name.fallback)
    .toBe(`${packageId} Startup Linen Ribbon`)
  expect(getOfficialRecipeDef(`${packageId}:linen_ribbon_snack`)?.name.fallback)
    .toBe(`${packageId} Startup Linen Ribbon Snack`)
  expect(getStartupShopOfferNameFallback(packageId))
    .toBe(`${packageId} Startup Linen Ribbon Stand`)
}

const packageFiles = (packageId: PackageId) => [
  {
    path: 'installed-pack/manifest.json',
    text: toJson(createManifest(packageId)),
    sizeBytes: toJson(createManifest(packageId)).length
  },
  {
    path: 'installed-pack/data/items.json',
    text: toJson([createItem(packageId)]),
    sizeBytes: toJson([createItem(packageId)]).length
  },
  {
    path: 'installed-pack/data/recipes.json',
    text: toJson([createRecipe(packageId)]),
    sizeBytes: toJson([createRecipe(packageId)]).length
  },
  {
    path: 'installed-pack/data/shop-offers.json',
    text: toJson([createShopOffer(packageId)]),
    sizeBytes: toJson([createShopOffer(packageId)]).length
  },
  {
    path: 'installed-pack/locales/zh-CN.json',
    text: '{}\n',
    sizeBytes: 3
  }
]

const createOfficialBaselineWithStartupProbeItem = () => {
  const baselineSnapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
  const registries = baselineSnapshot.registries.map(registry =>
    registry.registryId === 'taoyuan:item'
      ? {
          ...registry,
          entries: [
            ...registry.entries,
            {
              owner: OFFICIAL_PACKAGE_ID,
              source: {
                packageId: OFFICIAL_PACKAGE_ID,
                file: 'src/tests/domain/thirdPartyDataPackInstalledStateStartupGateBootstrapSource.test.ts',
                localId: 'startup_baseline_probe'
              },
              entry: {
                id: toOfficialContentId('startup_baseline_probe'),
                name: {
                  key: 'taoyuan.item.startup_baseline_probe.name',
                  fallback: 'Startup baseline probe'
                },
                category: 'misc',
                description: {
                  key: 'taoyuan.item.startup_baseline_probe.description',
                  fallback: 'Published official baseline probe.'
                },
                sellPrice: 1,
                edible: false
              }
            }
          ]
        }
      : registry
  )
  const snapshotBody = {
    formatVersion: 2 as const,
    registries
  }
  return restoreRegistrySetFromSnapshot(OFFICIAL_REGISTRY_DEFINITIONS, {
    ...snapshotBody,
    snapshotHash: hashCanonicalJson(snapshotBody)
  })
}

const startupSnapshotText = (
  packageId: PackageId,
  mountInput: ThirdPartyDataPackMountInputResult
): string => `${JSON.stringify({
  formatVersion: 1,
  kind: 'web-startup-persistent-state-snapshot',
  packageId,
  candidateIdentity: mountInput.candidateIdentity,
  lockfileHash: mountInput.lockfileHash,
  transactionLog: { committed: true },
  packageState: { matched: true },
  settingsState: { matched: true },
  modLockState: { matched: true },
  liveRegistry: { matched: true },
  saveCache: { isolated: true }
}, null, 2)}\n`

const buildWebMountInput = async(
  store: WebIndexedDbImportPersistenceStore,
  officialRegistrySet = buildOfficialRegistrySetFromStaticData()
): Promise<ThirdPartyDataPackMountInputResult> => {
  const source = await restoreWebIndexedDbImportSource(
    store,
    THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
  )
  expect(source).not.toBeNull()
  const discoveryReport = await discoverThirdPartyDataPacks(
    source!.identity.rootPath,
    createDiscoveryFileSystemFromContentPackageSource(source!)
  )
  return buildThirdPartyDataPackMountInput({
    officialRegistrySet,
    discoveryReport
  })
}

const seedWebInstalledState = async(
  store: WebIndexedDbImportPersistenceStore,
  packageId: PackageId,
  officialRegistrySet = buildOfficialRegistrySetFromStaticData(),
  settingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
): Promise<ThirdPartyDataPackMountInputResult> => {
  await store.put(createDefaultWebIndexedDbImportRecord(
    packageFiles(packageId),
    THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
  ))
  const mountInput = await buildWebMountInput(store, officialRegistrySet)
  expect(mountInput.status, JSON.stringify(mountInput.diagnostics, null, 2))
    .toBe('ready')
  const snapshotText = startupSnapshotText(packageId, mountInput)
  await store.put(createDefaultWebIndexedDbImportRecord([
    {
      path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
      text: snapshotText,
      sizeBytes: snapshotText.length
    }
  ], THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID))
  if (
    settingsLockfileStore !== undefined
    && mountInput.candidateIdentity !== undefined
    && mountInput.lockfileHash !== undefined
    && mountInput.lockfileDraft !== undefined
  ) {
    await settingsLockfileStore.write({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: mountInput.selectedPackageIds,
      blockedPackageIds: mountInput.blockedPackageIds,
      loadOrder: mountInput.loadOrder,
      candidateHash: mountInput.candidateIdentity.candidateHash,
      lockfileHash: mountInput.lockfileHash,
      lockfileDraft: mountInput.lockfileDraft
    })
  }
  return mountInput
}

interface ElectronStartupPersistentStateRequest {
  readonly commandId: 'install' | 'disable'
  readonly packageId: PackageId
  readonly candidateIdentity: {
    readonly formatVersion: 1
    readonly contentHash: Sha256Hash
    readonly snapshotHash: Sha256Hash
    readonly candidateHash: Sha256Hash
  }
  readonly lockfileHash: Sha256Hash
}

const createElectronRuntimeHost = (
  packageId: PackageId,
  options: {
    readonly rootExists?: boolean
    readonly manifestText?: string
    readonly includeContentFiles?: boolean
    readonly readStartupPersistentState?: (
      request: ElectronStartupPersistentStateRequest
    ) => unknown | Promise<unknown>
  } = {}
) => {
  const includeContentFiles = options.includeContentFiles !== false
  const fileTexts = new Map<string, string>([
    ['installed-pack/manifest.json', options.manifestText ?? toJson(createManifest(packageId))]
  ])
  if (includeContentFiles) {
    fileTexts.set('installed-pack/data/items.json', toJson([createItem(packageId)]))
    fileTexts.set('installed-pack/data/recipes.json', toJson([createRecipe(packageId)]))
    fileTexts.set('installed-pack/data/shop-offers.json', toJson([createShopOffer(packageId)]))
    fileTexts.set('installed-pack/locales/zh-CN.json', '{}\n')
  }
  const directories = new Set(options.rootExists === false
    ? []
    : [
        '',
        'installed-pack',
        ...(includeContentFiles
          ? [
            'installed-pack/data',
            'installed-pack/locales'
          ]
          : [])
      ])
  const entryName = (sourcePath: string): string => {
    if (sourcePath === '') return 'mods'
    const parts = sourcePath.split('/')
    return parts[parts.length - 1] ?? sourcePath
  }
  const entryForPath = (sourcePath: string) => {
    if (directories.has(sourcePath)) {
      return { name: entryName(sourcePath), kind: 'directory', isSymbolicLink: false }
    }
    if (fileTexts.has(sourcePath)) {
      return { name: entryName(sourcePath), kind: 'file', isSymbolicLink: false }
    }
    return null
  }
  const listDirectory = (sourcePath: string) => {
    const prefix = sourcePath === '' ? '' : `${sourcePath}/`
    const entries = new Map<string, ReturnType<typeof entryForPath>>()
    for (const directory of directories) {
      if (directory === sourcePath || !directory.startsWith(prefix)) continue
      const remainder = directory.slice(prefix.length)
      if (remainder === '' || remainder.includes('/')) continue
      entries.set(remainder, entryForPath(directory))
    }
    for (const filePath of fileTexts.keys()) {
      if (!filePath.startsWith(prefix)) continue
      const remainder = filePath.slice(prefix.length)
      if (remainder === '' || remainder.includes('/')) continue
      entries.set(remainder, entryForPath(filePath))
    }
    return [...entries.values()].filter(entry => entry !== null)
  }
  const runtimeHost = new EventTarget()
  Object.defineProperty(runtimeHost, 'electronAPI', {
    enumerable: true,
    value: {
      electronReadonlyDirectorySource: {
        getEntry: vi.fn(async(sourcePath: string) => ({
          ok: true,
          value: entryForPath(sourcePath)
        })),
        readDirectory: vi.fn(async(sourcePath: string) => ({
          ok: true,
          value: listDirectory(sourcePath)
        })),
        readTextFile: vi.fn(async(sourcePath: string) => ({
          ok: true,
          value: fileTexts.get(sourcePath) ?? ''
        }))
      },
      readThirdPartyDataPackStartupPersistentState: vi.fn(async(request: ElectronStartupPersistentStateRequest) =>
        options.readStartupPersistentState === undefined
          ? request.commandId === 'install'
            ? {
                kind: 'startup-persistent-state-snapshot',
                settled: true,
                packageId: request.packageId,
                candidateIdentity: request.candidateIdentity,
                lockfileHash: request.lockfileHash,
                transactionLogCommitted: true,
                packageStateMatched: true,
                settingsStateMatched: true,
                modLockStateMatched: true,
                liveRegistryMatched: true,
                saveCacheIsolated: true
              }
            : {
                kind: 'startup-persistent-state-snapshot',
                settled: false,
                packageId: request.packageId
              }
          : await options.readStartupPersistentState(request))
    }
  })
  return runtimeHost
}

describe('third-party installed-state startup gate bootstrap source', () => {
  afterEach(() => {
    resetLiveContentRegistryForTests()
    vi.restoreAllMocks()
  })

  it('skips app-startup handoff when Web IndexedDB has no persisted installed source', async() => {
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost: new EventTarget(),
      webStore: createInMemoryWebIndexedDbImportPersistenceStore()
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.appStartupHostConnectionAccepted).toBe(false)
    expect(result.effects.liveRegistrySwapped).toBe(false)
  })

  it('skips app-startup handoff when Electron mods root does not exist', async() => {
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost: createElectronRuntimeHost('electron_missing_root' as PackageId, {
        rootExists: false
      })
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.reason)
      .toBe('third-party installed-state startup gate found no installed package source')
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.startupPersistentStateSourceCalled).toBe(false)
    expect(result.effects.liveRegistrySwapped).toBe(false)
  })

  it('skips app-startup handoff when Electron mods root has no ready package', async() => {
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost: createElectronRuntimeHost('electron_incomplete_root' as PackageId, {
        manifestText: '{"id":"previous_product_probe_pack","version":"0.9.0"}\n',
        includeContentFiles: false
      })
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.reason)
      .toBe('third-party installed-state startup gate found no selected package')
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.startupPersistentStateSourceCalled).toBe(false)
    expect(result.effects.liveRegistrySwapped).toBe(false)
  })

  it('restores a Web installed package through ordinary app-startup handoff', async() => {
    const packageId = 'web_startup_pack' as PackageId
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const mountInput = await seedWebInstalledState(
      store,
      packageId,
      buildOfficialRegistrySetFromStaticData(),
      settingsLockfileStore
    )
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost: new EventTarget(),
      webStore: store,
      webSettingsLockfileStore: settingsLockfileStore
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.lockfileHash).toBe(mountInput.lockfileHash)
    expect(result.startupPersistentStateSourceStatus).toBe('ready')
    expect(result.startupPersistentStateSourceHostMode)
      .toBe('web-indexeddb-startup-persistent-state')
    expect(result.startupPersistentStateInjectedSourceHostMode)
      .toBe('web-indexeddb-startup-persistent-state')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.effects.startupStateSnapshotAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expectStartupPackContentVisible(packageId)
    expect(JSON.stringify(result)).not.toContain('indexedDb')
    expect(JSON.stringify(result)).not.toContain('window')
    expect(JSON.stringify(result)).not.toContain('startup-persistent-state-snapshot.json')
  })

  it('builds installed-state startup candidates from the published official baseline', async() => {
    const officialRegistrySet = createOfficialBaselineWithStartupProbeItem()
    publishOfficialContentRegistrySet(officialRegistrySet)
    const packageId = 'web_startup_pack' as PackageId
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const mountInput = await seedWebInstalledState(
      store,
      packageId,
      officialRegistrySet,
      settingsLockfileStore
    )
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost: new EventTarget(),
      webStore: store,
      webSettingsLockfileStore: settingsLockfileStore
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.entryCount).toBe(mountInput.entryCount)
    expect(result.lockfileHash).toBe(mountInput.lockfileHash)
    expect(getOfficialBaselineContentRegistrySet()).toBe(officialRegistrySet)
    expect(getOfficialItemDef('startup_baseline_probe')?.name.fallback)
      .toBe('Startup baseline probe')
    expectStartupPackContentVisible(packageId)
  })

  it('restores an Electron installed package through ordinary app-startup handoff', async() => {
    const packageId = 'electron_startup_pack' as PackageId
    const runtimeHost = createElectronRuntimeHost(packageId)
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.startupPersistentStateSourceStatus).toBe('ready')
    expect(result.startupPersistentStateSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(result.startupPersistentStateInjectedSourceHostMode)
      .toBe('electron-program-directory-startup-persistent-state')
    expect(result.appStartupHostConnectionSourceStatus).toBe('accepted')
    expect(result.effects.startupStateSnapshotAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expectStartupPackContentVisible(packageId)
    expect(JSON.stringify(result)).not.toContain('electronAPI')
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('startup-persistent-state-snapshot.json')
  })

  it('blocks Electron app-startup handoff when IPC persistent state identity drifts', async() => {
    const packageId = 'electron_startup_drift' as PackageId
    const runtimeHost = createElectronRuntimeHost(packageId, {
      readStartupPersistentState: async request => ({
        kind: 'startup-persistent-state-snapshot',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: {
          ...request.candidateIdentity,
          candidateHash: testHash('e')
        },
        lockfileHash: testHash('f'),
        transactionLogCommitted: true,
        packageStateMatched: true,
        settingsStateMatched: true,
        modLockStateMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      })
    })
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost
    })

    await expect(source()).rejects.toThrow('startup persistent state source blocked')
    expect(getOfficialItemDef(`${packageId}:linen_ribbon`)).toBeUndefined()
  })

  it('blocks when a persisted Web installed source has no matching startup snapshot', async() => {
    const packageId = 'web_startup_blocked' as PackageId
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    await store.put(createDefaultWebIndexedDbImportRecord(
      packageFiles(packageId),
      THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
    ))
    const wrongSnapshotText = `${JSON.stringify({
      formatVersion: 1,
      kind: 'web-startup-persistent-state-snapshot',
      packageId,
      candidateIdentity: {
        formatVersion: 1,
        contentHash: testHash('a'),
        snapshotHash: testHash('b'),
        candidateHash: testHash('c')
      },
      lockfileHash: testHash('d'),
      transactionLog: { committed: true },
      packageState: { matched: true },
      settingsState: { matched: true },
      modLockState: { matched: true },
      liveRegistry: { matched: true },
      saveCache: { isolated: true }
    }, null, 2)}\n`
    await store.put(createDefaultWebIndexedDbImportRecord([
      {
        path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
        text: wrongSnapshotText,
        sizeBytes: wrongSnapshotText.length
      }
    ], THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID))
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost: new EventTarget(),
      webStore: store,
      webSettingsLockfileStore: settingsLockfileStore
    })

    await expect(source()).rejects.toThrow('startup persistent state source blocked')
  })

  it('blocks Web app-startup handoff when the installed source has no matching settings-lockfile record', async() => {
    const packageId = 'web_startup_missing_settings_lockfile' as PackageId
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const settingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    await seedWebInstalledState(store, packageId)
    const source = createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
      runtimeHost: new EventTarget(),
      webStore: store,
      webSettingsLockfileStore: settingsLockfileStore
    })

    await expect(source()).rejects.toThrow('startup persistent state source blocked')
    expect(getOfficialItemDef(`${packageId}:linen_ribbon`)).toBeUndefined()
  })
})
