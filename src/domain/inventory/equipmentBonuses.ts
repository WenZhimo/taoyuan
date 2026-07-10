import type { EquipmentEffect, RingEffectType } from '@/types'

export interface EquipmentBonusSource {
  baseEffects?: readonly EquipmentEffect[]
  enchantmentEffects?: readonly EquipmentEffect[]
}

export interface EquipmentBonusInput {
  rings?: readonly (EquipmentBonusSource | null | undefined)[]
  hat?: EquipmentBonusSource | null
  shoe?: EquipmentBonusSource | null
  weaponEnchantmentEffects?: readonly EquipmentEffect[]
  setBonuses?: readonly EquipmentEffect[]
}

export interface EquipmentSetRef {
  id: string
  name: string
  description: string
  pieces: {
    weapon?: string
    ring: string
    hat: string
    shoe: string
  }
  bonuses: readonly {
    count: number
    effects: readonly EquipmentEffect[]
    description: string
  }[]
}

export interface EquippedSetPieces {
  weaponDefId?: string | null
  ringDefIds?: readonly (string | null | undefined)[]
  hatDefId?: string | null
  shoeDefId?: string | null
}

export interface ActiveEquipmentSetSummary {
  id: string
  name: string
  description: string
  equippedCount: number
  bonuses: {
    count: number
    description: string
    active: boolean
  }[]
}

const sumMatchingEffects = (effects: readonly EquipmentEffect[] | undefined, effectType: RingEffectType): number => {
  return (effects ?? []).reduce((sum, effect) => (effect.type === effectType ? sum + effect.value : sum), 0)
}

const sumBonusSource = (source: EquipmentBonusSource | null | undefined, effectType: RingEffectType): number => {
  return sumMatchingEffects(source?.baseEffects, effectType) + sumMatchingEffects(source?.enchantmentEffects, effectType)
}

export const sumEquipmentBonus = (effectType: RingEffectType, input: EquipmentBonusInput): number => {
  const ringBonus = (input.rings ?? []).reduce((sum, ring) => sum + sumBonusSource(ring, effectType), 0)
  return (
    ringBonus +
    sumBonusSource(input.hat, effectType) +
    sumBonusSource(input.shoe, effectType) +
    sumMatchingEffects(input.weaponEnchantmentEffects, effectType) +
    sumMatchingEffects(input.setBonuses, effectType)
  )
}

export const countActiveEquipmentSetPieces = (set: EquipmentSetRef, equipped: EquippedSetPieces): number => {
  let count = 0

  if (set.pieces.weapon && equipped.weaponDefId === set.pieces.weapon) count++
  if ((equipped.ringDefIds ?? []).some(defId => defId === set.pieces.ring)) count++
  if (equipped.hatDefId === set.pieces.hat) count++
  if (equipped.shoeDefId === set.pieces.shoe) count++

  return count
}

export const getActiveEquipmentSetBonuses = (
  sets: readonly EquipmentSetRef[],
  equipped: EquippedSetPieces
): EquipmentEffect[] => {
  const bonuses: EquipmentEffect[] = []

  for (const set of sets) {
    const equippedCount = countActiveEquipmentSetPieces(set, equipped)
    for (const bonus of set.bonuses) {
      if (equippedCount >= bonus.count) bonuses.push(...bonus.effects)
    }
  }

  return bonuses
}

export const createActiveEquipmentSetSummaries = (
  sets: readonly EquipmentSetRef[],
  equipped: EquippedSetPieces
): ActiveEquipmentSetSummary[] => {
  return sets
    .map(set => {
      const equippedCount = countActiveEquipmentSetPieces(set, equipped)
      return {
        id: set.id,
        name: set.name,
        description: set.description,
        equippedCount,
        bonuses: set.bonuses.map(bonus => ({
          count: bonus.count,
          description: bonus.description,
          active: equippedCount >= bonus.count
        }))
      }
    })
    .filter(set => set.equippedCount > 0)
}
