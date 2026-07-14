import { rollChanceQuantity, type RandomSource } from './rollChanceQuantity'

export interface DropTableEntryDef {
  itemId: string
  chance: number
  minQuantity?: number
  maxQuantity?: number
}

export interface RolledDropTableEntry {
  itemId: string
  quantity: number
}

export interface RollDropTableOptions {
  bonusChance?: number
  random?: RandomSource
}

const rollEntryQuantity = (entry: DropTableEntryDef, random: RandomSource): number => {
  const minQuantity = entry.minQuantity ?? 1
  const maxQuantity = entry.maxQuantity ?? minQuantity
  if (maxQuantity < minQuantity) {
    throw new RangeError(`Invalid drop quantity range for ${entry.itemId}`)
  }
  if (maxQuantity === minQuantity) return minQuantity
  return minQuantity + Math.floor(random() * (maxQuantity - minQuantity + 1))
}

export const rollDropTableEntries = (
  entries: readonly DropTableEntryDef[],
  options: RollDropTableOptions = {}
): RolledDropTableEntry[] => {
  const bonusChance = options.bonusChance ?? 0
  const random = options.random ?? Math.random
  const rolled: RolledDropTableEntry[] = []

  for (const entry of entries) {
    const attempts = rollChanceQuantity(entry.chance + bonusChance, random)
    if (attempts <= 0) continue

    let quantity = 0
    for (let i = 0; i < attempts; i++) {
      quantity += rollEntryQuantity(entry, random)
    }
    if (quantity > 0) rolled.push({ itemId: entry.itemId, quantity })
  }

  return rolled
}
