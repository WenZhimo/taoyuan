import CryptoJS from 'crypto-js'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { encodeSaveData, normalizeSaveData, parseSaveData } from '@/utils/saveCodec'
import { SAVE_FORMAT_PREFIX } from '@/utils/saveCodecCore'
import { useSaveStore } from '@/stores/useSaveStore'

const LEGACY_ENCRYPTION_KEY = 'taoyuanxiang_2024_secret'

const createSampleSave = () => ({
  game: { year: 3, season: 'autumn', day: 13 },
  player: { money: 123456, playerName: '测试' },
  farm: {
    greenhousePlots: Array.from({ length: 200 }, (_, id) => ({
      id,
      cropId: 'cabbage',
      state: 'planted',
      watered: true
    }))
  },
  savedAt: '2026-07-10T12:00:00.000Z'
})

describe('save codec', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('round-trips the compressed TYX2 format', async () => {
    const data = createSampleSave()
    const encoded = await encodeSaveData(data)

    expect(encoded.startsWith(SAVE_FORMAT_PREFIX)).toBe(true)
    expect(encoded.length).toBeLessThan(JSON.stringify(data).length)
    expect(await parseSaveData(encoded)).toEqual(data)
  })

  it('loads legacy saves and converts them to the compressed format', async () => {
    const data = createSampleSave()
    const legacy = CryptoJS.AES.encrypt(JSON.stringify(data), LEGACY_ENCRYPTION_KEY).toString()
    const normalized = await normalizeSaveData(legacy)

    expect(normalized?.data).toEqual(data)
    expect(normalized?.encoded.startsWith(SAVE_FORMAT_PREFIX)).toBe(true)
    expect(await parseSaveData(normalized!.encoded)).toEqual(data)
  })

  it('caches slot metadata during import without decrypting it again for listing', async () => {
    const data = createSampleSave()
    const legacy = CryptoJS.AES.encrypt(JSON.stringify(data), LEGACY_ENCRYPTION_KEY).toString()
    const saveStore = useSaveStore()

    expect(await saveStore.importSave(0, legacy)).toBe(true)
    expect(localStorage.getItem('taoyuanxiang_save_0')?.startsWith(SAVE_FORMAT_PREFIX)).toBe(true)
    expect(saveStore.getSlots()[0]).toMatchObject({
      slot: 0,
      exists: true,
      year: 3,
      season: 'autumn',
      day: 13,
      money: 123456,
      playerName: '测试'
    })

    expect(saveStore.deleteSlot(0)).toBe(true)
    expect(localStorage.getItem('taoyuanxiang_save_meta_0')).toBeNull()
  })
})
