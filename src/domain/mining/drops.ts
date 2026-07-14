import { rollDropTableEntries, type DropTableEntryDef, type RolledDropTableEntry } from '@/domain/drops/rollDropTable'
import type { RandomSource } from '@/domain/drops/rollChanceQuantity'
import type { DropTableDef } from '@/domain/mods/schemas'

export interface MonsterDropBonusInput {
  luckyEnchantCount: number
  ringDropBonus: number
  ringLuckBonus: number
  slayerCharmActive: boolean
  guildBonusDropRate: number
}

export interface MonsterDropDef extends DropTableEntryDef {}

export interface RolledMonsterDrop extends RolledDropTableEntry {}

export const calculateMonsterDropBonus = ({
  luckyEnchantCount,
  ringDropBonus,
  ringLuckBonus,
  slayerCharmActive,
  guildBonusDropRate
}: MonsterDropBonusInput): number => {
  return luckyEnchantCount * 0.2 + ringDropBonus + ringLuckBonus * 0.5 + (slayerCharmActive ? 0.2 : 0) + guildBonusDropRate
}

export const rollMonsterItemDrops = (
  drops: readonly MonsterDropDef[],
  bonusChance: number,
  random: RandomSource = Math.random
): RolledMonsterDrop[] => {
  return rollDropTableEntries(drops, { bonusChance, random })
}

const toLocalContentId = (id: string): string => id.slice(id.indexOf(':') + 1)

export const getMonsterDropDefsFromTable = (table: Readonly<DropTableDef>): MonsterDropDef[] =>
  table.entries.map(entry => ({
    itemId: toLocalContentId(entry.itemId),
    chance: entry.chance,
    ...(entry.minQuantity !== undefined ? { minQuantity: entry.minQuantity } : {}),
    ...(entry.maxQuantity !== undefined ? { maxQuantity: entry.maxQuantity } : {})
  }))

export const rollMonsterDropTable = (
  table: Readonly<DropTableDef>,
  bonusChance: number,
  random: RandomSource = Math.random
): RolledMonsterDrop[] => rollMonsterItemDrops(getMonsterDropDefsFromTable(table), bonusChance, random)
