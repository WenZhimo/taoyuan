import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  createOfficialSaveContentEnvironment,
  createSaveContentEnvironment,
  type SavePackageMigrationStep
} from '@/domain/save/saveContentEnvironment'
import { hashPayloadJson } from '@/domain/mods/hash'
import {
  MAX_PLUGIN_DATA_GROWTH_BYTES,
  type PluginSaveDataOwner
} from '@/domain/save/savePluginData'
import type { PackageId } from '@/domain/mods/ids'
import { useGameStore } from '@/stores/useGameStore'
import { useSaveStore } from '@/stores/useSaveStore'
import { encodeSaveData, parseSaveData } from '@/utils/saveCodec'
import { resetCurrentSaveContentEnvironmentForTests } from '@/domain/save/saveContentEnvironmentRuntime'
import legacySaveFixture from '../fixtures/saves/legacy-v1-baseline.json'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const SAVE_META_KEY_PREFIX = 'taoyuanxiang_save_meta_'
const packageId = 'example_pack'
const ownerPackageId = packageId as PackageId
const payloadJson = '{"message":"原样保留","order":[2,1],"emoji":"😀"}'
const pluginData = {
  [packageId]: {
    schemaVersion: '3',
    encoding: 'json' as const,
    payloadJson,
    payloadHash: hashPayloadJson(payloadJson)
  }
}
const packageSettings = {
  [packageId]: {
    schemaVersion: '1',
    values: { [`${packageId}:feature_enabled`]: false }
  }
}

const createCurrentSave = (overrides: Record<string, unknown> = {}) => ({
  ...legacySaveFixture,
  saveFormatVersion: 2,
  contentEnvironment: createOfficialSaveContentEnvironment(),
  ...overrides
})

const createThirdPartyEnvironment = (
  version: string,
  contentHash: string,
  configurationHash: string
) => {
  const official = createOfficialSaveContentEnvironment()
  return createSaveContentEnvironment({
    gameVersion: official.gameVersion,
    engineApiVersion: official.engineApiVersion,
    contentSchemaVersion: official.contentSchemaVersion,
    loaderVersion: official.loaderVersion,
    contentCompilerVersion: official.contentCompilerVersion,
    schemaSetHash: official.schemaSetHash,
    cacheFormatVersion: official.cacheFormatVersion,
    trustPolicyVersion: official.trustPolicyVersion,
    packages: [
      official.packages[0]!,
      {
        id: ownerPackageId,
        version,
        contentHash: hashPayloadJson(contentHash),
        configurationHash: hashPayloadJson(configurationHash),
        loadIndex: 1,
        resolvedDependencies: []
      }
    ]
  })
}

describe('save store plugin data persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    resetCurrentSaveContentEnvironmentForTests()
  })

  it('loads plugin data and writes each envelope back without rewriting its payload', async() => {
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, await encodeSaveData(createCurrentSave({ pluginData, packageSettings })))

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(true)
    expect(saveStore.packageSettings).toEqual(packageSettings)
    expect(await saveStore.saveToSlot(0)).toBe(true)

    const saved = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}0`) ?? '')
    expect(saved?.pluginData).toEqual(pluginData)
    expect(saved?.packageSettings).toEqual(packageSettings)
    expect((saved?.pluginData as typeof pluginData)[packageId]?.payloadJson).toBe(payloadJson)
  })

  it('migrates a registered plugin envelope before loading and writes the migrated root atomically', async() => {
    const legacyPayloadJson = '{"count":1}'
    const legacyPluginData = {
      [packageId]: {
        schemaVersion: '1',
        encoding: 'json' as const,
        payloadJson: legacyPayloadJson,
        payloadHash: hashPayloadJson(legacyPayloadJson)
      }
    }
    localStorage.setItem(
      `${SAVE_KEY_PREFIX}0`,
      await encodeSaveData(createCurrentSave({ pluginData: legacyPluginData }))
    )

    const owner: PluginSaveDataOwner = {
      packageId: ownerPackageId,
      schemaVersion: '2',
      validate: payload => {
        if (
          payload === null ||
          typeof payload !== 'object' ||
          (payload as { migrated?: unknown }).migrated !== true
        ) throw new Error('migration marker missing')
      },
      migrations: [{
        fromSchemaVersion: '1',
        toSchemaVersion: '2',
        migrate: payload => ({
          ...(payload as Record<string, unknown>),
          migrated: true
        })
      }]
    }
    const saveStore = useSaveStore()
    expect(saveStore.registerPluginSaveDataOwner(owner)).toBe(true)
    expect(await saveStore.loadFromSlot(0)).toBe(true)
    expect(saveStore.readPluginSaveData(owner)).toMatchObject({ schemaVersion: '2' })

    const saved = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}0`) ?? '')
    expect((saved?.pluginData as Record<string, { schemaVersion: string }>)[packageId]?.schemaVersion).toBe('2')
    expect(JSON.parse((saved?.pluginData as typeof legacyPluginData)[packageId]!.payloadJson)).toEqual({
      count: 1,
      migrated: true
    })
  })

  it('imports a declared third-party migration into a new slot without changing the source', async() => {
    const savedEnvironment = createThirdPartyEnvironment('1.0.0', 'old-content', 'old-config')
    const currentEnvironment = createThirdPartyEnvironment('1.1.0', 'new-content', 'new-config')
    const source = await encodeSaveData(createCurrentSave({
      contentEnvironment: savedEnvironment,
      pluginData
    }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, source)

    const saveStore = useSaveStore()
    expect(saveStore.setContentEnvironment(currentEnvironment)).toBe(true)
    const migration: SavePackageMigrationStep = {
      packageId: ownerPackageId,
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
      migrate: data => ({
        ...data,
        game: { ...data.game, year: 8 }
      })
    }
    expect(saveStore.registerSavePackageMigration(migration)).toBe(true)

    expect(await saveStore.importSave(1, source)).toBe(true)
    const imported = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}1`) ?? '')
    const original = await parseSaveData(source)
    expect(imported?.contentEnvironment).toEqual(currentEnvironment)
    expect(imported?.game).toMatchObject({ year: 8 })
    expect(imported?.pluginData).toEqual(pluginData)
    expect(original?.contentEnvironment).toEqual(savedEnvironment)
    expect(original?.game).toMatchObject({ year: 1 })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(source)
  })

  it('does not open a third-party migration in place', async() => {
    const savedEnvironment = createThirdPartyEnvironment('1.0.0', 'old-content', 'old-config')
    const currentEnvironment = createThirdPartyEnvironment('1.1.0', 'new-content', 'new-config')
    const source = await encodeSaveData(createCurrentSave({ contentEnvironment: savedEnvironment }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, source)

    const saveStore = useSaveStore()
    expect(saveStore.setContentEnvironment(currentEnvironment)).toBe(true)
    expect(saveStore.registerSavePackageMigration({
      packageId: ownerPackageId,
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
      migrate: data => data
    })).toBe(true)

    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'loading',
      reason: 'copy-migration-required',
      diagnostics: [expect.objectContaining({
        details: expect.objectContaining({ reason: 'third-party-copy-migration' })
      })]
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(source)
  })

  it('opens a missing third-party save in read-only safe mode without rewriting the source', async() => {
    const source = await encodeSaveData(createCurrentSave({
      contentEnvironment: createThirdPartyEnvironment('1.0.0', 'missing-content', 'missing-config'),
      pluginData
    }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, source)
    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, await encodeSaveData(createCurrentSave()))

    const saveStore = useSaveStore()
    expect(await saveStore.canLoadSlotInSafeMode(0)).toBe(true)
    expect(await saveStore.loadFromSlotInSafeMode(0)).toBe(true)
    expect(saveStore.isReadOnlySafeMode).toBe(true)
    expect(saveStore.activeSlot).toBe(0)
    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'saving',
      reason: 'safe-mode-read-only'
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(source)

    expect(await saveStore.loadFromSlot(1)).toBe(true)
    expect(saveStore.isReadOnlySafeMode).toBe(false)
  })

  it('previews a pure save as an environment mismatch while third-party content is active', async() => {
    const official = createOfficialSaveContentEnvironment()
    const activeEnvironment = createThirdPartyEnvironment('1.0.0', 'active-content', 'active-config')
    const source = await encodeSaveData(createCurrentSave({ contentEnvironment: official }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, source)

    const saveStore = useSaveStore()
    expect(saveStore.setContentEnvironment(activeEnvironment)).toBe(true)

    const preview = await saveStore.previewSlotLoad(0)
    expect(preview).toMatchObject({
      slot: 0,
      status: 'environment-mismatch',
      currentEnvironment: { environmentHash: activeEnvironment.environmentHash },
      savedEnvironment: { environmentHash: official.environmentHash }
    })
    expect(preview.currentEnvironment.packages).toContainEqual({ packageId, version: '1.0.0' })
    expect(preview.savedEnvironment?.packages).toEqual([
      { packageId: 'taoyuan-core', version: official.packages[0]!.version }
    ])
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(source)
  })

  it('reports saved slots that use a package and slots whose content cannot be verified', async() => {
    localStorage.setItem(
      `${SAVE_KEY_PREFIX}0`,
      await encodeSaveData(createCurrentSave({ contentEnvironment: createThirdPartyEnvironment('1.0.0', 'saved', 'saved') }))
    )
    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, 'not-a-save')
    localStorage.setItem(
      `${SAVE_KEY_PREFIX}2`,
      await encodeSaveData(createCurrentSave())
    )

    const saveStore = useSaveStore()
    await expect(saveStore.inspectPackageUsage(packageId)).resolves.toEqual({
      packageId,
      usedSlots: [0],
      unverifiableSlots: [1]
    })
  })

  it('rejects saving a loaded save after the runtime content environment changes', async() => {
    const savedEnvironment = createThirdPartyEnvironment('1.0.0', 'saved', 'saved')
    const source = await encodeSaveData(createCurrentSave({ contentEnvironment: savedEnvironment }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, source)

    const saveStore = useSaveStore()
    expect(saveStore.setContentEnvironment(savedEnvironment)).toBe(true)
    expect(await saveStore.loadFromSlot(0)).toBe(true)
    const loadedSource = localStorage.getItem(`${SAVE_KEY_PREFIX}0`)
    expect(saveStore.setContentEnvironment(createOfficialSaveContentEnvironment())).toBe(true)

    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'saving',
      reason: 'content-environment-drift'
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(loadedSource)
  })

  it('keeps both source and target unchanged when a third-party migration fails', async() => {
    const savedEnvironment = createThirdPartyEnvironment('1.0.0', 'old-content', 'old-config')
    const currentEnvironment = createThirdPartyEnvironment('1.1.0', 'new-content', 'new-config')
    const source = await encodeSaveData(createCurrentSave({ contentEnvironment: savedEnvironment }))
    const target = await encodeSaveData(createCurrentSave({
      contentEnvironment: currentEnvironment,
      game: { ...legacySaveFixture.game, year: 99 }
    }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, source)
    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, target)

    const saveStore = useSaveStore()
    expect(saveStore.setContentEnvironment(currentEnvironment)).toBe(true)
    expect(saveStore.registerSavePackageMigration({
      packageId: ownerPackageId,
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
      migrate: () => {
        throw new Error('migration rejected')
      }
    })).toBe(true)

    expect(await saveStore.importSave(1, source)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'importing',
      reason: 'package-migration'
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(source)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}1`)).toBe(target)
  })

  it('rejects a registered plugin without a migration path and preserves the old slot', async() => {
    const legacyPayloadJson = '{"count":1}'
    const legacySlot = await encodeSaveData(createCurrentSave({
      pluginData: {
        [packageId]: {
          schemaVersion: '1',
          encoding: 'json' as const,
          payloadJson: legacyPayloadJson,
          payloadHash: hashPayloadJson(legacyPayloadJson)
        }
      }
    }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, legacySlot)

    const owner: PluginSaveDataOwner = {
      packageId: ownerPackageId,
      schemaVersion: '2',
      validate: () => undefined
    }
    const saveStore = useSaveStore()
    expect(saveStore.registerPluginSaveDataOwner(owner)).toBe(true)
    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'loading',
      reason: 'plugin-data-migration',
      diagnostics: [expect.objectContaining({ code: 'SAVE-PLUGIN-DATA-003' })]
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(legacySlot)
  })

  it('preserves an existing package setting when the current store has not loaded that package', async() => {
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, await encodeSaveData(createCurrentSave({ packageSettings })))

    const saveStore = useSaveStore()
    expect(await saveStore.saveToSlot(0)).toBe(true)

    const saved = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}0`) ?? '')
    expect(saved?.packageSettings).toEqual(packageSettings)
  })

  it('rejects invalid plugin data before deserialization or slot writes', async() => {
    const invalidSave = createCurrentSave({
      pluginData: {
        [packageId]: {
          ...pluginData[packageId],
          payloadHash: hashPayloadJson('{}')
        }
      }
    })
    const encoded = await encodeSaveData(invalidSave)
    const metadata = JSON.stringify({ slot: 0, exists: true, playerName: '原有摘要' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, encoded)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, metadata)

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(encoded)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(metadata)
    expect(useGameStore().isGameStarted).toBe(false)
  })

  it('rejects invalid package settings before deserialization or slot writes', async() => {
    const invalidSave = createCurrentSave({
      packageSettings: {
        [packageId]: {
          schemaVersion: '1',
          values: { enabled: true }
        }
      }
    })
    const encoded = await encodeSaveData(invalidSave)
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, encoded)

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'loading',
      reason: 'package-settings-invalid',
      diagnostics: [expect.objectContaining({ code: 'SAVE-PACKAGE-SETTINGS-001' })]
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(encoded)
  })

  it('rejects a malformed versioned root before deserialization or slot writes', async() => {
    const { farm: _farm, ...missingFarm } = createCurrentSave()
    const encoded = await encodeSaveData(missingFarm)
    const metadata = JSON.stringify({ slot: 0, exists: true, playerName: '原有摘要' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, encoded)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, metadata)

    const gameStore = useGameStore()
    gameStore.deserialize({ year: 9, season: 'winter', day: 17, currentLocation: 'mine' })
    const before = {
      year: gameStore.year,
      season: gameStore.season,
      day: gameStore.day,
      currentLocation: gameStore.currentLocation,
      isGameStarted: gameStore.isGameStarted
    }

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'loading',
      reason: 'invalid',
      diagnostics: [expect.objectContaining({
        code: 'SAVE-ROOT-001',
        fieldPath: 'farm'
      })]
    })
    expect({
      year: gameStore.year,
      season: gameStore.season,
      day: gameStore.day,
      currentLocation: gameStore.currentLocation,
      isGameStarted: gameStore.isGameStarted
    }).toEqual(before)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(encoded)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(metadata)
  })

  it('rejects a malformed imported root without replacing the target slot', async() => {
    const { inventory: _inventory, ...missingInventory } = createCurrentSave()
    const source = await encodeSaveData(missingInventory)
    const target = await encodeSaveData(createCurrentSave({ game: { ...legacySaveFixture.game, year: 7 } }))
    const metadata = JSON.stringify({ slot: 1, exists: true, playerName: '不可覆盖' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, target)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}1`, metadata)

    const saveStore = useSaveStore()
    expect(await saveStore.importSave(1, source)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'importing',
      reason: 'invalid',
      diagnostics: [expect.objectContaining({
        code: 'SAVE-ROOT-001',
        fieldPath: 'inventory'
      })]
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}1`)).toBe(target)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}1`)).toBe(metadata)
  })

  it('keeps the source slot and current stores unchanged when deserialization throws', async() => {
    const malformedSave = createCurrentSave({
      home: {
        cellarSlots: [null]
      }
    })
    const source = await encodeSaveData(malformedSave)
    const metadata = JSON.stringify({ slot: 0, exists: true, playerName: '原有摘要' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, source)

    const gameStore = useGameStore()
    gameStore.deserialize({ year: 9, season: 'winter', day: 17, currentLocation: 'mine' })
    const before = {
      year: gameStore.year,
      season: gameStore.season,
      day: gameStore.day,
      currentLocation: gameStore.currentLocation,
      isGameStarted: gameStore.isGameStarted
    }
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, metadata)

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'loading',
      reason: 'invalid',
      diagnostics: [expect.objectContaining({
        code: 'SAVE-ROOT-001',
        stage: 'save.root.deserialize'
      })]
    })
    expect({
      year: gameStore.year,
      season: gameStore.season,
      day: gameStore.day,
      currentLocation: gameStore.currentLocation,
      isGameStarted: gameStore.isGameStarted
    }).toEqual(before)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(source)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(metadata)
  })

  it('rejects a malformed store collection before replacing an import target', async() => {
    const source = await encodeSaveData(createCurrentSave({
      farm: {
        ...(legacySaveFixture.farm as Record<string, unknown>),
        plots: {}
      }
    }))
    const target = await encodeSaveData(createCurrentSave({
      game: { ...legacySaveFixture.game, year: 7 }
    }))
    const metadata = JSON.stringify({ slot: 1, exists: true, playerName: '不可覆盖' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, target)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}1`, metadata)

    const saveStore = useSaveStore()
    expect(await saveStore.importSave(1, source)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'importing',
      reason: 'invalid',
      diagnostics: [expect.objectContaining({
        code: 'SAVE-ROOT-001',
        fieldPath: 'farm.plots'
      })]
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}1`)).toBe(target)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}1`)).toBe(metadata)
  })

  it('rejects invalid plugin data during import without writing the target slot', async() => {
    const invalidSave = createCurrentSave({
      pluginData: {
        [packageId]: {
          ...pluginData[packageId],
          payloadJson: '{broken json'
        }
      }
    })
    const encoded = await encodeSaveData(invalidSave)
    const saveStore = useSaveStore()
    const originalSlot = await encodeSaveData(createCurrentSave())
    const originalMetadata = JSON.stringify({ slot: 1, exists: true, playerName: '不可覆盖' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, originalSlot)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}1`, originalMetadata)

    expect(await saveStore.importSave(1, encoded)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'importing',
      reason: 'plugin-data-invalid',
      diagnostics: [expect.objectContaining({ code: 'SAVE-PLUGIN-DATA-001' })],
      message: expect.stringContaining('目标槽位未写入')
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}1`)).toBe(originalSlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}1`)).toBe(originalMetadata)
  })

  it('rejects an invalid owner write before replacing a saved slot', async() => {
    const originalSlot = await encodeSaveData(createCurrentSave())
    const originalMetadata = JSON.stringify({ slot: 0, exists: true, playerName: '不可覆盖' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, originalSlot)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, originalMetadata)

    const saveStore = useSaveStore()
    const owner: PluginSaveDataOwner = {
      packageId: ownerPackageId,
      schemaVersion: '3',
      validate: () => false
    }
    expect(saveStore.registerPluginSaveDataOwner(owner)).toBe(true)
    expect(saveStore.writePluginSaveData(owner, { rejected: true })).toBe(false)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(originalSlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(originalMetadata)
  })

  it('rejects a plugin data growth spike before replacing the saved slot', async() => {
    const originalSlot = await encodeSaveData(createCurrentSave())
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, originalSlot)

    const saveStore = useSaveStore()
    const owner: PluginSaveDataOwner = {
      packageId: ownerPackageId,
      schemaVersion: '3',
      validate: () => undefined
    }
    expect(saveStore.registerPluginSaveDataOwner(owner)).toBe(true)
    expect(saveStore.writePluginSaveData(owner, 'a'.repeat(MAX_PLUGIN_DATA_GROWTH_BYTES + 1))).toBe(true)

    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'saving',
      reason: 'plugin-data-quota',
      diagnostics: [expect.objectContaining({ code: 'SAVE-PLUGIN-DATA-002' })],
      message: expect.stringContaining('旧存档未覆盖')
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(originalSlot)
  })

  it('rolls back both slot keys when the save body write fails', async() => {
    const originalSlot = await encodeSaveData(createCurrentSave())
    const originalMetadata = JSON.stringify({ slot: 0, exists: true, playerName: '原有摘要' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, originalSlot)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, originalMetadata)

    let failed = false
    const originalSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key, value) {
      if (!failed && key === `${SAVE_KEY_PREFIX}0`) {
        failed = true
        throw new Error('simulated save body write failure')
      }
      originalSetItem.call(this, key, value)
    })

    const saveStore = useSaveStore()
    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({ operation: 'saving', reason: 'storage' })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(originalSlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(originalMetadata)
  })

  it('rolls back both slot keys when the save metadata write fails', async() => {
    const originalSlot = await encodeSaveData(createCurrentSave())
    const originalMetadata = JSON.stringify({ slot: 0, exists: true, playerName: '原有摘要' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, originalSlot)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, originalMetadata)

    let failed = false
    const originalSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key, value) {
      if (!failed && key === `${SAVE_META_KEY_PREFIX}0`) {
        failed = true
        throw new Error('simulated save metadata write failure')
      }
      originalSetItem.call(this, key, value)
    })

    const saveStore = useSaveStore()
    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({ operation: 'saving', reason: 'storage' })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(originalSlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(originalMetadata)
  })

  it('rolls back an imported slot and keeps an absent summary absent', async() => {
    const originalSlot = await encodeSaveData(createCurrentSave())
    const importedSlot = await encodeSaveData(createCurrentSave({
      game: { ...legacySaveFixture.game, year: 4 }
    }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, originalSlot)

    let failed = false
    const originalSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key, value) {
      if (!failed && key === `${SAVE_META_KEY_PREFIX}1`) {
        failed = true
        throw new Error('simulated import metadata write failure')
      }
      originalSetItem.call(this, key, value)
    })

    const saveStore = useSaveStore()
    expect(await saveStore.importSave(1, importedSlot)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({ operation: 'importing', reason: 'storage' })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}1`)).toBe(originalSlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}1`)).toBeNull()
  })

  it('does not deserialize a migrated save when slot persistence fails', async() => {
    const legacySlot = await encodeSaveData(legacySaveFixture)
    const originalMetadata = JSON.stringify({ slot: 0, exists: true, playerName: '原有摘要' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, legacySlot)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, originalMetadata)

    const gameStore = useGameStore()
    gameStore.deserialize({ year: 9, season: 'winter', day: 17, currentLocation: 'mine' })
    const before = {
      year: gameStore.year,
      season: gameStore.season,
      day: gameStore.day,
      currentLocation: gameStore.currentLocation,
      isGameStarted: gameStore.isGameStarted
    }

    let failed = false
    const originalSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key, value) {
      if (!failed && key === `${SAVE_META_KEY_PREFIX}0`) {
        failed = true
        throw new Error('simulated migration metadata write failure')
      }
      originalSetItem.call(this, key, value)
    })

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({ operation: 'loading', reason: 'storage' })
    expect({
      year: gameStore.year,
      season: gameStore.season,
      day: gameStore.day,
      currentLocation: gameStore.currentLocation,
      isGameStarted: gameStore.isGameStarted
    }).toEqual(before)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(legacySlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(originalMetadata)
  })

  it('allows saving a loaded plugin payload larger than one write growth quota to another slot', async() => {
    const largePayloadJson = JSON.stringify('a'.repeat(MAX_PLUGIN_DATA_GROWTH_BYTES + 1))
    const existing = await encodeSaveData(createCurrentSave({
      pluginData: {
        [packageId]: {
          schemaVersion: '3',
          encoding: 'json',
          payloadJson: largePayloadJson,
          payloadHash: hashPayloadJson(largePayloadJson)
        }
      }
    }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, existing)

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(true)
    expect(await saveStore.saveToSlot(1)).toBe(true)
    const copied = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}1`) ?? '')
    expect((copied?.pluginData as typeof pluginData)[packageId]?.payloadJson).toBe(largePayloadJson)
  }, 30_000)

  it('does not overwrite an unreadable existing slot during save', async() => {
    const unreadableSlot = 'not-a-save'
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, unreadableSlot)

    const saveStore = useSaveStore()
    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(saveStore.lastOperationFailure).toMatchObject({
      operation: 'saving',
      reason: 'slot-protected',
      message: expect.stringContaining('避免覆盖原档')
    })
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(unreadableSlot)
  })

  it('records content environment package summaries in slot metadata and inspection', async() => {
    const environment = createThirdPartyEnvironment('1.0.0', 'metadata-content', 'metadata-config')
    const saveStore = useSaveStore()

    expect(saveStore.setContentEnvironment(environment)).toBe(true)
    expect(await saveStore.saveToSlot(0)).toBe(true)

    expect(saveStore.getSlots()[0]?.contentEnvironment).toEqual({
      environmentHash: environment.environmentHash,
      packages: [
        { packageId: 'taoyuan-core', version: environment.packages[0]!.version },
        { packageId, version: '1.0.0' }
      ]
    })
    await expect(saveStore.inspectSlot(0)).resolves.toMatchObject({
      slot: 0,
      exists: true,
      contentEnvironment: {
        environmentHash: environment.environmentHash,
        packages: [
          { packageId: 'taoyuan-core', version: environment.packages[0]!.version },
          { packageId, version: '1.0.0' }
        ]
      }
    })
  })

  it('does not overwrite a slot from another content environment', async() => {
    const current = createOfficialSaveContentEnvironment()
    const incompatibleEnvironment = {
      ...current,
      environmentHash: hashPayloadJson('different environment')
    }
    const existing = await encodeSaveData(createCurrentSave({
      contentEnvironment: incompatibleEnvironment
    }))
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, existing)

    const saveStore = useSaveStore()
    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(existing)
  })

  it('clears plugin data when assigning a new empty slot', async() => {
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, await encodeSaveData(createCurrentSave({ pluginData })))

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(true)
    expect(saveStore.assignNewSlot()).toBe(1)
    expect(await saveStore.saveToSlot(1)).toBe(true)
    const saved = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}1`) ?? '')
    expect(saved?.pluginData).toEqual({})
  })
})
