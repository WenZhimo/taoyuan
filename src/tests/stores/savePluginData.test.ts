import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createOfficialSaveContentEnvironment } from '@/domain/save/saveContentEnvironment'
import { hashPayloadJson } from '@/domain/mods/hash'
import { useGameStore } from '@/stores/useGameStore'
import { useSaveStore } from '@/stores/useSaveStore'
import { encodeSaveData, parseSaveData } from '@/utils/saveCodec'
import legacySaveFixture from '../fixtures/saves/legacy-v1-baseline.json'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const SAVE_META_KEY_PREFIX = 'taoyuanxiang_save_meta_'
const packageId = 'example_pack'
const payloadJson = '{"message":"原样保留","order":[2,1],"emoji":"😀"}'
const pluginData = {
  [packageId]: {
    schemaVersion: '3',
    encoding: 'json' as const,
    payloadJson,
    payloadHash: hashPayloadJson(payloadJson)
  }
}

const createCurrentSave = (overrides: Record<string, unknown> = {}) => ({
  ...legacySaveFixture,
  saveFormatVersion: 2,
  contentEnvironment: createOfficialSaveContentEnvironment(),
  ...overrides
})

describe('save store plugin data persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('loads plugin data and writes each envelope back without rewriting its payload', async() => {
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, await encodeSaveData(createCurrentSave({ pluginData })))

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(true)
    expect(saveStore.pluginData).toEqual(pluginData)
    expect(await saveStore.saveToSlot(0)).toBe(true)

    const saved = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}0`) ?? '')
    expect(saved?.pluginData).toEqual(pluginData)
    expect((saved?.pluginData as typeof pluginData)[packageId]?.payloadJson).toBe(payloadJson)
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
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}1`)).toBe(originalSlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}1`)).toBe(originalMetadata)
  })

  it('rejects an invalid in-memory envelope before replacing a saved slot', async() => {
    const originalSlot = await encodeSaveData(createCurrentSave())
    const originalMetadata = JSON.stringify({ slot: 0, exists: true, playerName: '不可覆盖' })
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, originalSlot)
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}0`, originalMetadata)

    const saveStore = useSaveStore()
    Object.assign(saveStore, {
      pluginData: {
        [packageId]: {
          ...pluginData[packageId],
          payloadHash: hashPayloadJson('{}')
        }
      }
    })

    expect(await saveStore.saveToSlot(0)).toBe(false)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(originalSlot)
    expect(localStorage.getItem(`${SAVE_META_KEY_PREFIX}0`)).toBe(originalMetadata)
  })

  it('clears plugin data when assigning a new empty slot', async() => {
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, await encodeSaveData(createCurrentSave({ pluginData })))

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(true)
    expect(saveStore.assignNewSlot()).toBe(1)
    expect(saveStore.pluginData).toEqual({})
  })
})
