import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MONSTER_DROP_HATS, getHatById } from '@/data/hats'
import { MONSTER_DROP_RINGS, getRingById } from '@/data/rings'
import { MONSTER_DROP_SHOES, getShoeById } from '@/data/shoes'
import { MONSTER_DROP_WEAPONS, getWeaponById } from '@/data/weapons'
import {
  getOfficialMainMineZoneMonsters,
  getOfficialSkullCavernBaseMonsters
} from '@/domain/mods/contentAccess'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'
import { MAIN_MINE_ZONES } from '@/domain/mods/monsterPoolIds'
import { useGuildStore } from '@/stores/useGuildStore'
import GuildView from '@/views/game/GuildView.vue'

type MineZone = (typeof MAIN_MINE_ZONES)[number]

const getLegacyDisplayDrops = (zone: MineZone) => [
  ...(MONSTER_DROP_WEAPONS[zone] ?? []).map(drop => ({
    name: getWeaponById(drop.weaponId)?.name ?? drop.weaponId,
    chance: drop.chance
  })),
  ...(MONSTER_DROP_RINGS[zone] ?? []).map(drop => ({
    name: getRingById(drop.ringId)?.name ?? drop.ringId,
    chance: drop.chance
  })),
  ...(MONSTER_DROP_HATS[zone] ?? []).map(drop => ({
    name: getHatById(drop.hatId)?.name ?? drop.hatId,
    chance: drop.chance
  })),
  ...(MONSTER_DROP_SHOES[zone] ?? []).map(drop => ({
    name: getShoeById(drop.shoeId)?.name ?? drop.shoeId,
    chance: drop.chance
  }))
]

const findButton = (wrapper: VueWrapper, label: string) => {
  const button = wrapper.findAll('button').find(candidate => candidate.text() === label)
  expect(button, `button ${label}`).toBeDefined()
  return button!
}

const openMonsterDetails = async (wrapper: VueWrapper, monsterName: string) => {
  const card = wrapper.findAll('div').find(candidate =>
    candidate.text() === monsterName && candidate.classes().includes('cursor-pointer')
  )
  expect(card, `monster card ${monsterName}`).toBeDefined()
  await card!.trigger('click')
  await nextTick()
}

const getRenderedEquipmentRows = (wrapper: VueWrapper): string[] => {
  const title = wrapper.findAll('p').find(candidate => candidate.text() === '装备掉落')
  if (!title) return []
  const section = title.element.parentElement
  expect(section).not.toBeNull()
  return Array.from(section!.children)
    .slice(1)
    .map(row => row.textContent?.replace(/\s+/g, '') ?? '')
}

describe('GuildView monster equipment display consumers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('renders every zone equipment drop in legacy kind order with unchanged names and chances', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const guildStore = useGuildStore()
    const monstersByZone = MAIN_MINE_ZONES.map(zone => ({
      zone,
      monster: getOfficialMainMineZoneMonsters(zone)[0]!
    }))
    guildStore.encounteredMonsters = monstersByZone.map(({ monster }) => monster.id)
    const wrapper = mount(GuildView, {
      global: {
        plugins: [pinia],
        stubs: { Transition: false }
      }
    })
    await findButton(wrapper, '图鉴').trigger('click')
    await nextTick()

    for (const { zone, monster } of monstersByZone) {
      await openMonsterDetails(wrapper, monster.name)
      expect(getRenderedEquipmentRows(wrapper), zone).toEqual(
        getLegacyDisplayDrops(zone).map(drop => `${drop.name}${Math.round(drop.chance * 100)}%`)
      )
      const closeButton = wrapper.findAll('button').find(button => button.classes().includes('absolute'))
      expect(closeButton, `close ${monster.name}`).toBeDefined()
      await closeButton!.trigger('click')
      await nextTick()
    }

    wrapper.unmount()
  })

  it('keeps the equipment section absent for a monster without a main-mine zone or boss association', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const guildStore = useGuildStore()
    const skullMonster = getOfficialSkullCavernBaseMonsters()[0]!
    guildStore.encounteredMonsters = [skullMonster.id]
    const wrapper = mount(GuildView, {
      global: {
        plugins: [pinia],
        stubs: { Transition: false }
      }
    })
    await findButton(wrapper, '图鉴').trigger('click')
    await openMonsterDetails(wrapper, skullMonster.name)

    expect(getRenderedEquipmentRows(wrapper)).toEqual([])
    expect(wrapper.text()).not.toContain('装备掉落')
    wrapper.unmount()
  })

  it('fails mounting without mutating guild state when the official registry is unavailable', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const guildStore = useGuildStore()
    const serializedBefore = guildStore.serialize()
    const unavailable = new Error('official registry unavailable')
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => mount(GuildView, { global: { plugins: [pinia] } })).toThrow(unavailable)
    expect(guildStore.serialize()).toEqual(serializedBefore)
  })
})
