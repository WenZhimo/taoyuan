import { describe, expect, it } from 'vitest'
import {
  BOSS_MONSTERS,
  BOSS_ORE_REWARDS,
  CROPS,
  FISH,
  HIDDEN_NPCS,
  HOSTILE_ANIMALS,
  ITEMS,
  MOMO_FUMO_EXCHANGE,
  MOMO_FUMO_ITEM_ID,
  MONSTERS,
  NPCS,
  PROCESSING_MACHINES,
  PROCESSING_RECIPES,
  RECIPES,
  SKULL_CAVERN_MONSTERS,
  isMomoFumo
} from '@/data'

interface ItemReference {
  source: string
  itemId: string
}

interface NumericRule {
  source: string
  value: number
  minimum: number
}

const findDuplicates = (ids: readonly string[]): string[] => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return [...duplicates].sort()
}

const findMissingItems = (
  references: readonly ItemReference[],
  itemIds: ReadonlySet<string>
): string[] =>
  references
    .filter(reference => !itemIds.has(reference.itemId))
    .map(reference => `${reference.source}: ${reference.itemId}`)
    .sort()

const findInvalidNumbers = (rules: readonly NumericRule[]): string[] =>
  rules
    .filter(rule => !Number.isFinite(rule.value) || rule.value < rule.minimum)
    .map(rule => `${rule.source}: ${rule.value} < ${rule.minimum}`)
    .sort()

const getMonsterDefinitions = () => [
  ...Object.values(MONSTERS),
  ...Object.values(SKULL_CAVERN_MONSTERS),
  ...Object.values(BOSS_MONSTERS),
  ...HOSTILE_ANIMALS
]

describe('game data validation', () => {
  const itemIds = new Set(ITEMS.map(item => item.id))
  const machineIds = new Set(PROCESSING_MACHINES.map(machine => machine.id))

  it('keeps core catalog IDs unique', () => {
    const duplicateGroups = {
      items: findDuplicates(ITEMS.map(item => item.id)),
      crops: findDuplicates(CROPS.map(crop => crop.id)),
      seeds: findDuplicates(CROPS.map(crop => crop.seedId)),
      fish: findDuplicates(FISH.map(fish => fish.id)),
      recipes: findDuplicates(RECIPES.map(recipe => recipe.id)),
      processingMachines: findDuplicates(PROCESSING_MACHINES.map(machine => machine.id)),
      processingRecipes: findDuplicates(PROCESSING_RECIPES.map(recipe => recipe.id)),
      npcs: findDuplicates(NPCS.map(npc => npc.id)),
      hiddenNpcs: findDuplicates(HIDDEN_NPCS.map(npc => npc.id))
    }

    expect(duplicateGroups).toEqual({
      items: [],
      crops: [],
      seeds: [],
      fish: [],
      recipes: [],
      processingMachines: [],
      processingRecipes: [],
      npcs: [],
      hiddenNpcs: []
    })
  })

  it('keeps recipe, preference, offering, and drop item references valid', () => {
    const references: ItemReference[] = [
      ...CROPS.flatMap(crop => [
        { source: `crop ${crop.id}`, itemId: crop.id },
        { source: `crop seed ${crop.id}`, itemId: crop.seedId }
      ]),
      ...FISH.map(fish => ({ source: `fish ${fish.id}`, itemId: fish.id })),
      ...RECIPES.flatMap(recipe => [
        { source: `recipe output ${recipe.id}`, itemId: `food_${recipe.id}` },
        ...recipe.ingredients.map(ingredient => ({
          source: `recipe ingredient ${recipe.id}`,
          itemId: ingredient.itemId
        }))
      ]),
      ...PROCESSING_MACHINES.flatMap(machine =>
        machine.craftCost.map(cost => ({
          source: `machine cost ${machine.id}`,
          itemId: cost.itemId
        }))
      ),
      ...PROCESSING_RECIPES.flatMap(recipe => [
        ...(recipe.inputItemId
          ? [{ source: `processing input ${recipe.id}`, itemId: recipe.inputItemId }]
          : []),
        { source: `processing output ${recipe.id}`, itemId: recipe.outputItemId }
      ]),
      ...NPCS.flatMap(npc =>
        [
          ...npc.lovedItems.map(itemId => ({ source: `npc loved ${npc.id}`, itemId })),
          ...npc.likedItems.map(itemId => ({ source: `npc liked ${npc.id}`, itemId })),
          ...npc.hatedItems.map(itemId => ({ source: `npc hated ${npc.id}`, itemId }))
        ]
      ),
      ...HIDDEN_NPCS.flatMap(npc => [
        ...npc.resonantOfferings.map(itemId => ({
          source: `hidden npc resonant ${npc.id}`,
          itemId
        })),
        ...npc.pleasedOfferings.map(itemId => ({
          source: `hidden npc pleased ${npc.id}`,
          itemId
        })),
        ...npc.repelledOfferings.map(itemId => ({
          source: `hidden npc repelled ${npc.id}`,
          itemId
        })),
        { source: `hidden npc courtship ${npc.id}`, itemId: npc.courtshipItemId },
        { source: `hidden npc bond ${npc.id}`, itemId: npc.bondItemId }
      ]),
      ...getMonsterDefinitions().flatMap(monster =>
        monster.drops.map(drop => ({
          source: `monster drop ${monster.id}`,
          itemId: drop.itemId
        }))
      ),
      ...Object.entries(BOSS_ORE_REWARDS).flatMap(([floor, rewards]) =>
        rewards.map(reward => ({
          source: `boss ore reward ${floor}`,
          itemId: reward.itemId
        }))
      )
    ]

    expect(findMissingItems(references, itemIds)).toEqual([])
  })

  it('keeps processing recipes linked to existing machines', () => {
    const missingMachines = PROCESSING_RECIPES.filter(
      recipe => !machineIds.has(recipe.machineType)
    )
      .map(recipe => `${recipe.id}: ${recipe.machineType}`)
      .sort()

    expect(missingMachines).toEqual([])
  })

  it('keeps prices, durations, quantities, and drop chances non-negative', () => {
    const rules: NumericRule[] = [
      ...ITEMS.map(item => ({
        source: `item sell price ${item.id}`,
        value: item.sellPrice,
        minimum: 0
      })),
      ...CROPS.flatMap(crop => [
        { source: `crop growth days ${crop.id}`, value: crop.growthDays, minimum: 1 },
        { source: `crop sell price ${crop.id}`, value: crop.sellPrice, minimum: 0 },
        { source: `crop seed price ${crop.id}`, value: crop.seedPrice, minimum: 0 },
        ...(crop.regrowthDays === undefined
          ? []
          : [{ source: `crop regrowth days ${crop.id}`, value: crop.regrowthDays, minimum: 1 }]),
        ...(crop.maxHarvests === undefined
          ? []
          : [{ source: `crop max harvests ${crop.id}`, value: crop.maxHarvests, minimum: 1 }])
      ]),
      ...FISH.map(fish => ({
        source: `fish sell price ${fish.id}`,
        value: fish.sellPrice,
        minimum: 0
      })),
      ...RECIPES.flatMap(recipe => [
        ...recipe.ingredients.map(ingredient => ({
          source: `recipe ingredient quantity ${recipe.id}:${ingredient.itemId}`,
          value: ingredient.quantity,
          minimum: 1
        })),
        {
          source: `recipe stamina restore ${recipe.id}`,
          value: recipe.effect.staminaRestore,
          minimum: 0
        },
        ...(recipe.effect.healthRestore === undefined
          ? []
          : [{
              source: `recipe health restore ${recipe.id}`,
              value: recipe.effect.healthRestore,
              minimum: 0
            }])
      ]),
      ...PROCESSING_MACHINES.flatMap(machine => [
        { source: `machine craft money ${machine.id}`, value: machine.craftMoney, minimum: 0 },
        ...machine.craftCost.map(cost => ({
          source: `machine craft quantity ${machine.id}:${cost.itemId}`,
          value: cost.quantity,
          minimum: 1
        }))
      ]),
      ...PROCESSING_RECIPES.flatMap(recipe => [
        {
          source: `processing input quantity ${recipe.id}`,
          value: recipe.inputQuantity,
          minimum: recipe.inputItemId ? 1 : 0
        },
        {
          source: `processing output quantity ${recipe.id}`,
          value: recipe.outputQuantity,
          minimum: 1
        },
        {
          source: `processing days ${recipe.id}`,
          value: recipe.processingDays,
          minimum: 1
        }
      ]),
      ...getMonsterDefinitions().flatMap(monster =>
        monster.drops.map(drop => ({
          source: `monster drop chance ${monster.id}:${drop.itemId}`,
          value: drop.chance,
          minimum: 0
        }))
      ),
      ...Object.entries(BOSS_ORE_REWARDS).flatMap(([floor, rewards]) =>
        rewards.map(reward => ({
          source: `boss ore reward quantity ${floor}:${reward.itemId}`,
          value: reward.quantity,
          minimum: 1
        }))
      )
    ]

    expect(findInvalidNumbers(rules)).toEqual([])
  })

  it('keeps the momo fumo exchange contract consistent', () => {
    expect(MOMO_FUMO_EXCHANGE).toEqual({
      sourceItemId: 'cabbage',
      sourceQuantity: 2000,
      outputItemId: 'momo_fumo',
      outputQuantity: 2000,
      outputQuality: 'supreme'
    })
    expect(itemIds.has(MOMO_FUMO_EXCHANGE.sourceItemId)).toBe(true)
    expect(itemIds.has(MOMO_FUMO_EXCHANGE.outputItemId)).toBe(true)
    expect(MOMO_FUMO_EXCHANGE.outputItemId).toBe(MOMO_FUMO_ITEM_ID)
    expect(isMomoFumo(MOMO_FUMO_ITEM_ID)).toBe(true)
    expect(ITEMS.find(item => item.id === MOMO_FUMO_ITEM_ID)).toMatchObject({
      name: '墨墨的fumo',
      category: 'gift'
    })
  })

  it('validates the full catalog within the performance boundary', () => {
    const references = [
      ...RECIPES.flatMap(recipe => recipe.ingredients.map(ingredient => ingredient.itemId)),
      ...PROCESSING_RECIPES.flatMap(recipe => [
        ...(recipe.inputItemId ? [recipe.inputItemId] : []),
        recipe.outputItemId
      ]),
      ...NPCS.flatMap(npc => [...npc.lovedItems, ...npc.likedItems, ...npc.hatedItems]),
      ...getMonsterDefinitions().flatMap(monster => monster.drops.map(drop => drop.itemId))
    ]
    const start = performance.now()
    let missingCount = 0

    for (let iteration = 0; iteration < 100; iteration++) {
      for (const itemId of references) {
        if (!itemIds.has(itemId)) missingCount++
      }
    }
    const elapsed = performance.now() - start

    expect(missingCount).toBe(0)
    expect(elapsed).toBeLessThan(1000)
  })
})
