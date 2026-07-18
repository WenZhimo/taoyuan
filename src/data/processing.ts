import type { ProcessingMachineDef, ProcessingRecipeDef, SprinklerDef, FertilizerDef, BaitDef, TackleDef, BombDef } from '@/types'
import {
  getOfficialProcessingMachineById,
  getOfficialProcessingMachinesAsLegacy,
  getOfficialProcessingRecipeById,
  getOfficialProcessingRecipesForMachine,
  getOfficialBombById,
  getOfficialSprinklerById,
  getOfficialSprinklersAsLegacy
} from '@/domain/mods/contentAccess'
import { BAITS, BOMBS, FERTILIZERS, SPRINKLERS, TACKLES } from './processingCraftDefinitions'
import { PROCESSING_MACHINES } from './processingMachineDefinitions'
import { PROCESSING_RECIPES } from './processingRecipeDefinitions'
export { BAITS, BOMBS, FERTILIZERS, SPRINKLERS, TACKLES } from './processingCraftDefinitions'
export { PROCESSING_MACHINES } from './processingMachineDefinitions'

export { PROCESSING_RECIPES } from './processingRecipeDefinitions'

export const getMachineById = (id: string): ProcessingMachineDef | undefined => {
  return getOfficialProcessingMachineById(id) ?? PROCESSING_MACHINES.find(m => m.id === id)
}

export const getProcessingMachines = (): readonly ProcessingMachineDef[] =>
  getOfficialProcessingMachinesAsLegacy()

export const getProcessingRecipeById = (id: string): ProcessingRecipeDef | undefined => {
  return getOfficialProcessingRecipeById(id) ?? PROCESSING_RECIPES.find(r => r.id === id)
}

export const getRecipesForMachine = (machineType: string): ProcessingRecipeDef[] => {
  const recipes = getOfficialProcessingRecipesForMachine(machineType)
  return recipes.length > 0
    ? recipes.map(recipe => ({ ...recipe }))
    : PROCESSING_RECIPES.filter(r => r.machineType === machineType)
}

export const getSprinklerById = (id: string): SprinklerDef | undefined => {
  return getOfficialSprinklerById(id) ?? SPRINKLERS.find(s => s.id === id)
}

export const getSprinklers = (): readonly SprinklerDef[] =>
  getOfficialSprinklersAsLegacy()

export const getFertilizerById = (id: string): FertilizerDef | undefined => {
  return FERTILIZERS.find(f => f.id === id)
}

export const getBaitById = (id: string): BaitDef | undefined => {
  return BAITS.find(b => b.id === id)
}

export const getTackleById = (id: string): TackleDef | undefined => {
  return TACKLES.find(t => t.id === id)
}

/** 采脂器制造定义 */
export const TAPPER = {
  id: 'tapper',
  name: '采脂器',
  description: '安装到成熟野树上，定期产出树脂。',
  craftCost: [
    { itemId: 'copper_ore', quantity: 5 },
    { itemId: 'wood', quantity: 10 }
  ],
  craftMoney: 200
}

/** 蟹笼制造定义 */
export const CRAB_POT_CRAFT = {
  id: 'crab_pot',
  name: '蟹笼',
  description: '放置在钓鱼地点，每日自动捕获水产（需鱼饵）。',
  craftCost: [
    { itemId: 'wood', quantity: 15 },
    { itemId: 'iron_bar', quantity: 2 }
  ],
  craftMoney: 500
}

/** 避雷针制造定义 */
export const LIGHTNING_ROD = {
  id: 'lightning_rod',
  name: '避雷针',
  description: '放置在农场，雷暴时吸收闪电保护作物，产出电池组。',
  craftCost: [
    { itemId: 'iron_ore', quantity: 5 },
    { itemId: 'copper_ore', quantity: 3 },
    { itemId: 'quartz', quantity: 1 }
  ],
  craftMoney: 300
}

/** 稻草人制造定义 */
export const SCARECROW = {
  id: 'scarecrow',
  name: '稻草人',
  description: '放置在农场，驱赶偷吃作物的乌鸦。',
  craftCost: [
    { itemId: 'wood', quantity: 20 },
    { itemId: 'bamboo', quantity: 5 },
    { itemId: 'firewood', quantity: 5 }
  ],
  craftMoney: 150
}

export const AUTO_PETTER = {
  id: 'auto_petter',
  name: '自动抚摸机',
  description: '安装到畜舍后，每天自动抚摸所有动物。需要大型畜舍（2级）。',
  craftCost: [
    { itemId: 'gold_bar', quantity: 10 },
    { itemId: 'iron_bar', quantity: 20 },
    { itemId: 'copper_bar', quantity: 20 }
  ],
  craftMoney: 5000
}

export const getBombById = (id: string): BombDef | undefined => {
  return getOfficialBombById(id) ?? BOMBS.find(b => b.id === id)
}
