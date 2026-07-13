import { describe, expect, it } from 'vitest'
import {
  ENCHANTMENTS,
  ENCHANTMENT_EFFECTS,
  ENCHANTMENT_RARITY,
  RANDOM_ENCHANT_IDS,
  getEnchantmentById
} from '@/data/weapons'
import { BOSS_MONSTERS, MONSTERS, SKULL_CAVERN_MONSTERS } from '@/data/mine'
import { rollMonsterItemDrops } from '@/domain/mining/drops'
import {
  getOfficialDropTableDefs,
  getOfficialEnchantmentById,
  getOfficialEnchantmentDef,
  getOfficialEnchantmentDefs,
  getOfficialMonsterDropTableDef
} from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
import type { DropTableDef, EnchantmentDef } from '@/domain/mods/schemas'
import type { MonsterDef } from '@/types'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

const normalizeEnchantment = (enchantment: Readonly<EnchantmentDef>) => ({
  id: localId(enchantment.id),
  name: enchantment.name.fallback,
  description: enchantment.description.fallback,
  rarity: enchantment.rarity,
  randomWeight: enchantment.randomWeight,
  attackBonus: enchantment.attackBonus,
  critBonus: enchantment.critBonus,
  special: enchantment.special,
  effects: enchantment.effects.map(effect => ({ ...effect }))
})

const expectedEnchantment = (id: string) => {
  const enchantment = ENCHANTMENTS[id]!
  const rarity = ENCHANTMENT_RARITY[id] ?? 1
  return {
    ...enchantment,
    rarity,
    randomWeight: RANDOM_ENCHANT_IDS.includes(id) ? 1 / (rarity * rarity) : 0,
    effects: (ENCHANTMENT_EFFECTS[id] ?? []).map(effect => ({ ...effect }))
  }
}

const uniqueLegacyMonsters = (): MonsterDef[] => {
  const byId = new Map<string, MonsterDef>()
  for (const monster of [
    ...Object.values(MONSTERS),
    ...Object.values(BOSS_MONSTERS),
    ...Object.values(SKULL_CAVERN_MONSTERS)
  ]) {
    if (!byId.has(monster.id)) byId.set(monster.id, monster)
  }
  return Array.from(byId.values())
}

const normalizeDropTable = (table: Readonly<DropTableDef>) => ({
  id: localId(table.id),
  entries: table.entries.map(entry => ({
    itemId: localId(entry.itemId),
    chance: entry.chance,
    minQuantity: entry.minQuantity,
    maxQuantity: entry.maxQuantity
  }))
})

describe('official enchantment and drop table registry pilot', () => {
  it('keeps official enchantment registry fields equivalent to legacy enchantment sources', () => {
    const official = getOfficialEnchantmentDefs()
      .map(normalizeEnchantment)
      .sort((a, b) => a.id.localeCompare(b.id))
    const expected = Object.keys(ENCHANTMENTS)
      .map(expectedEnchantment)
      .sort((a, b) => a.id.localeCompare(b.id))

    expect(official).toEqual(expected)
  })

  it('keeps legacy enchantment query shape available through the official facade', () => {
    for (const id of Object.keys(ENCHANTMENTS)) {
      expect(getOfficialEnchantmentById(id), id).toEqual(getEnchantmentById(id))
      expect(getOfficialEnchantmentById(toOfficialContentId(id)), id).toEqual(getEnchantmentById(id))
    }

    expect(getOfficialEnchantmentById('missing_enchantment')).toBeUndefined()
    expect(getOfficialEnchantmentDef('not a valid id')).toBeUndefined()
  })

  it('keeps monster drop table projections equivalent to legacy monster drops', () => {
    const official = getOfficialDropTableDefs()
      .map(normalizeDropTable)
      .sort((a, b) => a.id.localeCompare(b.id))
    const expected = uniqueLegacyMonsters()
      .filter(monster => monster.drops.length > 0)
      .map(monster => ({
        id: `drop/monster/${monster.id}`,
        entries: monster.drops.map(drop => ({
          itemId: drop.itemId,
          chance: drop.chance,
          minQuantity: 1,
          maxQuantity: 1
        }))
      }))
      .sort((a, b) => a.id.localeCompare(b.id))

    expect(official).toEqual(expected)
  })

  it('keeps fixed-random monster drop results unchanged when read from the registry table', () => {
    const monster = MONSTERS.stone_crab!
    const table = getOfficialMonsterDropTableDef(monster.id)!
    const registryDrops = table.entries.map(entry => ({
      itemId: localId(entry.itemId),
      chance: entry.chance
    }))

    expect(rollMonsterItemDrops(registryDrops, 0.8, () => 0.1))
      .toEqual(rollMonsterItemDrops(monster.drops, 0.8, () => 0.1))
    expect(getOfficialMonsterDropTableDef('missing_monster')).toBeUndefined()
  })
})
