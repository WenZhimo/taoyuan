import { afterEach, describe, expect, it, vi } from 'vitest'
import { ENCHANTMENTS, WEAPONS } from '@/data/weapons'
import {
  getOfficialEnchantmentById,
  getOfficialEnchantmentsAsLegacy,
  getOfficialWeaponById
} from '@/domain/mods/contentAccess'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

describe('equipment display registry consumers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('projects every enchantment in the exact legacy display order and shape', () => {
    expect(getOfficialEnchantmentsAsLegacy().map(clone)).toEqual(Object.values(ENCHANTMENTS).map(clone))
  })

  it('keeps weapon and fixed-enchantment display lookups equivalent for every official weapon', () => {
    for (const weapon of Object.values(WEAPONS)) {
      expect(getOfficialWeaponById(weapon.id)).toEqual(weapon)
      if (weapon.fixedEnchantment) {
        expect(getOfficialEnchantmentById(weapon.fixedEnchantment)).toEqual(ENCHANTMENTS[weapon.fixedEnchantment])
      }
    }

    expect(getOfficialWeaponById('missing_weapon')).toBeUndefined()
    expect(getOfficialEnchantmentById('missing_enchantment')).toBeUndefined()
  })

  it('fails explicitly when the published registry is unavailable', () => {
    const unavailable = new Error('official registry unavailable')
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => getOfficialEnchantmentsAsLegacy()).toThrow(unavailable)
    expect(() => getOfficialWeaponById('rusty_sword')).toThrow(unavailable)
    expect(() => getOfficialEnchantmentById('sharp')).toThrow(unavailable)
  })
})
