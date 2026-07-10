import { describe, expect, it } from 'vitest'
import { CROPS, getCropById, getCropBySeedId } from '@/data/crops'

describe('crop lookup indexes', () => {
  it('preserves first-match lookup semantics for crop and seed ids', () => {
    const crop = CROPS.find(candidate => candidate.id === 'cabbage')!
    const seedCrop = CROPS.find(candidate => candidate.seedId === crop.seedId)!

    expect(getCropById('cabbage')).toBe(crop)
    expect(getCropBySeedId(crop.seedId)).toBe(seedCrop)
    expect(getCropById('missing_crop')).toBeUndefined()
    expect(getCropBySeedId('missing_seed')).toBeUndefined()
  })

  it('keeps repeated crop lookups cheap for large end-day batches', () => {
    const start = performance.now()
    let found = 0

    for (let index = 0; index < 100_000; index++) {
      if (getCropById('cabbage')) found++
    }
    const elapsed = performance.now() - start

    expect(found).toBe(100_000)
    expect(elapsed).toBeLessThan(120)
  })
})
