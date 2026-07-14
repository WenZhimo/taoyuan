import { describe, expect, it } from 'vitest'
import { BOSS_MONSTERS, MONSTERS, SKULL_CAVERN_MONSTERS } from '@/data/mine'
import {
  getOfficialMonsterById,
  getOfficialMonsterDef,
  getOfficialMonsterDefs
} from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
import type { MonsterDef as RegistryMonsterDef } from '@/domain/mods/schemas'
import type { MonsterDef as LegacyMonsterDef } from '@/types'

const legacyMonsterGroups = [
  Object.values(MONSTERS),
  Object.values(BOSS_MONSTERS),
  Object.values(SKULL_CAVERN_MONSTERS)
]

const uniqueLegacyMonsters = (): LegacyMonsterDef[] => {
  const byId = new Map<string, LegacyMonsterDef>()
  for (const group of legacyMonsterGroups) {
    for (const monster of group) {
      if (!byId.has(monster.id)) byId.set(monster.id, monster)
    }
  }
  return Array.from(byId.values())
}

const expectedRegistryMonster = (monster: LegacyMonsterDef): RegistryMonsterDef => ({
  id: toOfficialContentId(monster.id),
  name: {
    key: `taoyuan.monster.${monster.id}.name`,
    fallback: monster.name
  },
  hp: monster.hp,
  attack: monster.attack,
  defense: monster.defense,
  expReward: monster.expReward,
  dropTableId: toOfficialContentId(`drop/monster/${monster.id}`),
  description: {
    key: `taoyuan.monster.${monster.id}.description`,
    fallback: monster.description
  }
})

describe('official monster registry pilot', () => {
  it('keeps every unique official monster definition and registration order equivalent', () => {
    const legacyMonsters = uniqueLegacyMonsters()
    const registryMonsters = getOfficialMonsterDefs()

    expect(registryMonsters).toEqual(legacyMonsters.map(expectedRegistryMonster))
    expect(registryMonsters.map(monster => monster.id)).toEqual(
      legacyMonsters.map(monster => toOfficialContentId(monster.id))
    )
    expect(new Set(registryMonsters.map(monster => monster.id)).size).toBe(legacyMonsters.length)
  })

  it.each([
    ['ordinary monsters', Object.values(MONSTERS)],
    ['boss monsters', Object.values(BOSS_MONSTERS)],
    ['skull cavern monsters', Object.values(SKULL_CAVERN_MONSTERS)]
  ])('preserves the %s collection order and complete legacy shape', (_label, monsters) => {
    expect(monsters.map(monster => getOfficialMonsterById(monster.id))).toEqual(monsters)
  })

  it('queries by local and namespaced IDs and resolves legacy drops through dropTableId', () => {
    for (const monster of uniqueLegacyMonsters()) {
      const contentId = toOfficialContentId(monster.id)

      expect(getOfficialMonsterDef(monster.id)?.id).toBe(contentId)
      expect(getOfficialMonsterDef(contentId)?.id).toBe(contentId)
      expect(getOfficialMonsterById(monster.id)).toEqual(monster)
      expect(getOfficialMonsterById(contentId)).toEqual(monster)
    }

    expect(getOfficialMonsterById('missing_monster')).toBeUndefined()
    expect(getOfficialMonsterDef('not a valid id')).toBeUndefined()
  })
})
