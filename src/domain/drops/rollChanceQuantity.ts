export type RandomSource = () => number

export const rollChanceQuantity = (chance: number, random: RandomSource = Math.random): number => {
  const safeChance = Math.max(0, chance)
  const guaranteed = Math.floor(safeChance)
  const fractional = safeChance - guaranteed
  return guaranteed + (random() < fractional ? 1 : 0)
}
