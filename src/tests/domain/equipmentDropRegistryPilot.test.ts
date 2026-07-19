import { describe, expect, it } from 'vitest'
import { MONSTER_DROP_HATS, TREASURE_DROP_HATS } from '@/data/hats'
import { MONSTER_DROP_RINGS, TREASURE_DROP_RINGS } from '@/data/rings'
import { MONSTER_DROP_SHOES, TREASURE_DROP_SHOES } from '@/data/shoes'
import { MONSTER_DROP_WEAPONS, TREASURE_DROP_WEAPONS } from '@/data/weapons'
import {
  getOfficialDropTableDefs,
  getOfficialEquipmentDropTableDef,
  getOfficialEquipmentDropPoolsAsLegacy,
  type OfficialEquipmentDropTableQuery
} from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
import type { DropTableDef } from '@/domain/mods/schemas'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

const normalizeDropTableEntries = (table: Readonly<DropTableDef>) =>
  table.entries.map(entry => ({
    itemId: localId(entry.itemId),
    chance: entry.chance,
    minQuantity: entry.minQuantity,
    maxQuantity: entry.maxQuantity
  }))

type EquipmentDropRecord = { chance: number }

interface EquipmentDropCase {
  query: Omit<OfficialEquipmentDropTableQuery, 'zone'>
  pools: Record<string, readonly EquipmentDropRecord[]>
  getItemId: (drop: EquipmentDropRecord) => string
}

const dropCases: EquipmentDropCase[] = [
  { query: { source: 'monster', kind: 'weapon' }, pools: MONSTER_DROP_WEAPONS, getItemId: drop => (drop as unknown as { weaponId: string }).weaponId },
  { query: { source: 'monster', kind: 'ring' }, pools: MONSTER_DROP_RINGS, getItemId: drop => (drop as unknown as { ringId: string }).ringId },
  { query: { source: 'monster', kind: 'hat' }, pools: MONSTER_DROP_HATS, getItemId: drop => (drop as unknown as { hatId: string }).hatId },
  { query: { source: 'monster', kind: 'shoe' }, pools: MONSTER_DROP_SHOES, getItemId: drop => (drop as unknown as { shoeId: string }).shoeId },
  { query: { source: 'treasure', kind: 'weapon' }, pools: TREASURE_DROP_WEAPONS, getItemId: drop => (drop as unknown as { weaponId: string }).weaponId },
  { query: { source: 'treasure', kind: 'ring' }, pools: TREASURE_DROP_RINGS, getItemId: drop => (drop as unknown as { ringId: string }).ringId },
  { query: { source: 'treasure', kind: 'hat' }, pools: TREASURE_DROP_HATS, getItemId: drop => (drop as unknown as { hatId: string }).hatId },
  { query: { source: 'treasure', kind: 'shoe' }, pools: TREASURE_DROP_SHOES, getItemId: drop => (drop as unknown as { shoeId: string }).shoeId }
]

describe('official equipment drop table registry pilot', () => {
  it('keeps monster and treasure equipment drop tables equivalent to legacy pools', () => {
    for (const dropCase of dropCases) {
      for (const [zone, drops] of Object.entries(dropCase.pools)) {
        const table = getOfficialEquipmentDropTableDef({ ...dropCase.query, zone })
        expect(table?.id, `${dropCase.query.source}/${dropCase.query.kind}/${zone}`)
          .toBe(toOfficialContentId(`drop/equipment/${dropCase.query.source}/${dropCase.query.kind}/${zone}`))
        expect(normalizeDropTableEntries(table!)).toEqual(drops.map(drop => ({
          itemId: dropCase.getItemId(drop),
          chance: drop.chance,
          minQuantity: 1,
          maxQuantity: 1
        })))
      }
    }
  })

  it('registers empty zone equipment drop tables as stable named tables', () => {
    expect(normalizeDropTableEntries(getOfficialEquipmentDropTableDef({
      source: 'monster',
      kind: 'hat',
      zone: 'shallow'
    })!)).toEqual([])
    expect(normalizeDropTableEntries(getOfficialEquipmentDropTableDef({
      source: 'treasure',
      kind: 'shoe',
      zone: 'abyss'
    })!)).toEqual([])
  })

  it('projects every monster and treasure equipment pool with legacy local IDs and order', () => {
    for (const dropCase of dropCases) {
      const pools = getOfficialEquipmentDropPoolsAsLegacy(dropCase.query)
      expect(Object.keys(pools)).toEqual(Object.keys(dropCase.pools))
      for (const [zone, drops] of Object.entries(dropCase.pools)) {
        expect(pools[zone], `${dropCase.query.kind}/${zone}`).toEqual(drops.map(drop => ({
          gearId: dropCase.getItemId(drop),
          chance: drop.chance
        })))
      }
      expect(pools.missing_zone).toBeUndefined()
    }
  })

  it('includes all equipment drop tables in the official drop table registry', () => {
    const ids = new Set(getOfficialDropTableDefs().map(table => table.id))
    for (const dropCase of dropCases) {
      for (const zone of Object.keys(dropCase.pools)) {
        expect(ids.has(toOfficialContentId(`drop/equipment/${dropCase.query.source}/${dropCase.query.kind}/${zone}`)))
          .toBe(true)
      }
    }
    expect(getOfficialEquipmentDropTableDef({ source: 'monster', kind: 'weapon', zone: 'missing_zone' }))
      .toBeUndefined()
  })
})
