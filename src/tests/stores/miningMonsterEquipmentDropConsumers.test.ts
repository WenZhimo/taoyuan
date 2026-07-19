import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { MONSTER_DROP_HATS, getHatById } from '@/data/hats'
import { MONSTER_DROP_RINGS, getRingById } from '@/data/rings'
import { MONSTER_DROP_SHOES, getShoeById } from '@/data/shoes'
import { MONSTER_DROP_WEAPONS, getWeaponSellPrice } from '@/data/weapons'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useMiningStore } from '@/stores/useMiningStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

const ZONE_FLOORS = {
  shallow: 1,
  frost: 21,
  lava: 41,
  crystal: 61,
  shadow: 81,
  abyss: 101
} as const

type MineZone = keyof typeof ZONE_FLOORS

const getLegacyZoneDrops = (zone: MineZone) => [
  ...(MONSTER_DROP_WEAPONS[zone] ?? []).map(drop => ({ kind: 'weapon' as const, gearId: drop.weaponId, chance: drop.chance })),
  ...(MONSTER_DROP_RINGS[zone] ?? []).map(drop => ({ kind: 'ring' as const, gearId: drop.ringId, chance: drop.chance })),
  ...(MONSTER_DROP_HATS[zone] ?? []).map(drop => ({ kind: 'hat' as const, gearId: drop.hatId, chance: drop.chance })),
  ...(MONSTER_DROP_SHOES[zone] ?? []).map(drop => ({ kind: 'shoe' as const, gearId: drop.shoeId, chance: drop.chance }))
]

const prepareZoneBattle = (zone: MineZone) => {
  const miningStore = useMiningStore()
  const inventoryStore = useInventoryStore()
  const playerStore = usePlayerStore()

  inventoryStore.addWeapon('copper_sword', null)
  inventoryStore.equipWeapon(inventoryStore.ownedWeapons.length - 1)
  miningStore.isExploring = true
  miningStore.currentFloor = ZONE_FLOORS[zone]
  miningStore.totalMonstersOnFloor = 1
  miningStore.floorGrid = [{
    index: 0,
    type: 'monster',
    state: 'revealed',
    data: {
      monster: {
        id: `test_${zone}_monster`,
        name: `${zone} test monster`,
        hp: 1,
        attack: 0,
        defense: 0,
        drops: [],
        expReward: 1,
        description: 'monster equipment drop consumer test'
      }
    }
  }]

  expect(miningStore.engageRevealedMonster(0).success).toBe(true)
  return { miningStore, inventoryStore, playerStore }
}

describe('mining monster equipment drop consumers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('keeps every zone pool in legacy order and fails rolls exactly at each probability boundary', () => {
    for (const zone of Object.keys(ZONE_FLOORS) as MineZone[]) {
      setActivePinia(createPinia())
      const expectedDrops = getLegacyZoneDrops(zone)
      const randomValues = [1, ...expectedDrops.map(drop => drop.chance)]
      let randomIndex = 0
      const random = vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++] ?? 1)
      const { miningStore, inventoryStore, playerStore } = prepareZoneBattle(zone)

      const result = miningStore.combatAction('attack')

      expect(result.won, zone).toBe(true)
      expect(random, zone).toHaveBeenCalledTimes(randomValues.length)
      expect(randomIndex, zone).toBe(randomValues.length)
      expect(inventoryStore.ownedWeapons.map(weapon => weapon.defId), zone).toEqual(['wooden_stick', 'copper_sword'])
      expect(inventoryStore.ownedRings, zone).toEqual([])
      expect(inventoryStore.ownedHats, zone).toEqual([])
      expect(inventoryStore.ownedShoes, zone).toEqual([])
      expect(playerStore.money, zone).toBe(500)
      random.mockRestore()
    }
  })

  it('keeps successful rolls, equipment order, and random enchantment generation for every zone', () => {
    for (const zone of Object.keys(ZONE_FLOORS) as MineZone[]) {
      setActivePinia(createPinia())
      const random = vi.spyOn(Math, 'random').mockReturnValue(0)
      const { miningStore, inventoryStore } = prepareZoneBattle(zone)

      const result = miningStore.combatAction('attack')
      const expectedWeapons = MONSTER_DROP_WEAPONS[zone] ?? []
      const expectedRings = MONSTER_DROP_RINGS[zone] ?? []
      const expectedHats = MONSTER_DROP_HATS[zone] ?? []
      const expectedShoes = MONSTER_DROP_SHOES[zone] ?? []
      const expectedRandomCalls = 1 + expectedWeapons.length * 3
        + expectedRings.length + expectedHats.length + expectedShoes.length

      expect(result.won, zone).toBe(true)
      expect(random, zone).toHaveBeenCalledTimes(expectedRandomCalls)
      expect(inventoryStore.ownedWeapons
        .filter(weapon => expectedWeapons.some(drop => drop.weaponId === weapon.defId))
        .map(weapon => ({ defId: weapon.defId, enchantmentIds: weapon.enchantmentIds })), zone)
        .toEqual(expectedWeapons.map(drop => ({ defId: drop.weaponId, enchantmentIds: ['sharp'] })))
      expect(inventoryStore.ownedRings.map(ring => ring.defId), zone).toEqual(expectedRings.map(drop => drop.ringId))
      expect(inventoryStore.ownedHats.map(hat => hat.defId), zone).toEqual(expectedHats.map(drop => drop.hatId))
      expect(inventoryStore.ownedShoes.map(shoe => shoe.defId), zone).toEqual(expectedShoes.map(drop => drop.shoeId))
      random.mockRestore()
    }
  })

  it('keeps duplicate weapon, ring, hat, and shoe auto-sale behavior', () => {
    const zone: MineZone = 'frost'
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const weaponId = MONSTER_DROP_WEAPONS[zone]![0]!.weaponId
    const ringId = MONSTER_DROP_RINGS[zone]![0]!.ringId
    const hatId = MONSTER_DROP_HATS[zone]![0]!.hatId
    const shoeId = MONSTER_DROP_SHOES[zone]![0]!.shoeId
    inventoryStore.addWeapon(weaponId, 'sharp')
    inventoryStore.addRing(ringId)
    inventoryStore.addHat(hatId)
    inventoryStore.addShoe(shoeId)
    const expectedAutoSale = getWeaponSellPrice(weaponId, 'sharp')
      + (getRingById(ringId)?.sellPrice ?? 0)
      + (getHatById(hatId)?.sellPrice ?? 0)
      + (getShoeById(shoeId)?.sellPrice ?? 0)
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    const { miningStore } = prepareZoneBattle(zone)

    const result = miningStore.combatAction('attack')

    expect(result.won).toBe(true)
    expect(result.message).toContain(`重复装备自动售出+${expectedAutoSale}文`)
    expect(inventoryStore.ownedWeapons.filter(weapon => weapon.defId === weaponId)).toHaveLength(1)
    expect(inventoryStore.ownedRings.filter(ring => ring.defId === ringId)).toHaveLength(1)
    expect(inventoryStore.ownedHats.filter(hat => hat.defId === hatId)).toHaveLength(1)
    expect(inventoryStore.ownedShoes.filter(shoe => shoe.defId === shoeId)).toHaveLength(1)
    expect(playerStore.money).toBe(500 + expectedAutoSale)
    expect(random).toHaveBeenCalledTimes(7)
  })
})
