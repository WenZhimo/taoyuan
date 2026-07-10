import { rollChanceQuantity, type RandomSource } from '@/domain/drops/rollChanceQuantity'

export interface MonsterDropBonusInput {
  luckyEnchantCount: number
  ringDropBonus: number
  ringLuckBonus: number
  slayerCharmActive: boolean
  guildBonusDropRate: number
}

export interface MonsterDropDef {
  itemId: string
  chance: number
}

export interface RolledMonsterDrop {
  itemId: string
  quantity: number
}

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
  const rolled: RolledMonsterDrop[] = []
  for (const drop of drops) {
    const quantity = rollChanceQuantity(drop.chance + bonusChance, random)
    if (quantity > 0) {
      rolled.push({ itemId: drop.itemId, quantity })
    }
  }
  return rolled
}
