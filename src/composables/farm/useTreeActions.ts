import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import { FRUIT_TREE_DEFS, MAX_FRUIT_TREES } from '@/data/fruitTrees'
import { WILD_TREE_DEFS, MAX_WILD_TREES, getWildTreeDef } from '@/data/wildTrees'
import { ACTION_TIME_COSTS } from '@/data/timeConstants'
import { SEASON_NAMES } from '@/stores/useGameStore'
import { addLog } from '@/composables/useGameLog'
import type { FruitTreeChopConfirmTarget } from '@/components/game/farm/FruitTreeChopConfirmDialog.vue'
import type { WildTreeChopConfirmTarget } from '@/components/game/farm/WildTreeChopConfirmDialog.vue'
import type { FruitTreeType, PlantedWildTree, SkillType, ToolType, WildTreeType } from '@/types'

export interface UseTreeActionsOptions {
  chopFruitTreeTarget: Ref<FruitTreeChopConfirmTarget | null>
  chopWildTreeTarget: Ref<WildTreeChopConfirmTarget | null>
  wildTrees: () => readonly PlantedWildTree[]
  hasItem: (itemId: string) => boolean
  getItemCount: (itemId: string) => number
  addItem: (itemId: string, quantity?: number) => boolean
  removeItem: (itemId: string, quantity?: number) => boolean
  isToolAvailable: (toolId: ToolType) => boolean
  getToolStaminaMultiplier: (toolId: ToolType) => number
  isPastBedtime: () => boolean
  advanceTime: (minutes: number) => { message?: string }
  consumeStamina: (amount: number) => boolean
  getStaminaReduction: (skillId: SkillType) => number
  hasLumberjackBonus: () => boolean
  plantFruitTree: (treeType: FruitTreeType) => boolean
  removeFruitTree: (treeId: number) => number
  plantWildTree: (treeType: WildTreeType) => boolean
  attachTapper: (treeId: number) => boolean
  collectTapProduct: (treeId: number) => string | null
  chopWildTree: (treeId: number) => { removed: boolean }
}

export const useTreeActions = ({
  chopFruitTreeTarget,
  chopWildTreeTarget,
  wildTrees,
  hasItem,
  getItemCount,
  addItem,
  removeItem,
  isToolAvailable,
  getToolStaminaMultiplier,
  isPastBedtime,
  advanceTime,
  consumeStamina,
  getStaminaReduction,
  hasLumberjackBonus,
  plantFruitTree,
  removeFruitTree,
  plantWildTree,
  attachTapper,
  collectTapProduct,
  chopWildTree
}: UseTreeActionsOptions) => {
  const getTreeName = (type: string): string => {
    return FRUIT_TREE_DEFS.find(d => d.type === type)?.name ?? type
  }

  const getTreeFruitSeason = (type: string): string => {
    const def = FRUIT_TREE_DEFS.find(d => d.type === type)
    if (!def) return '?'
    return SEASON_NAMES[def.fruitSeason as keyof typeof SEASON_NAMES]
  }

  const plantableSaplings = computed(() => {
    return FRUIT_TREE_DEFS.filter(d => hasItem(d.saplingId)).map(d => ({
      type: d.type as FruitTreeType,
      saplingId: d.saplingId,
      name: d.name,
      count: getItemCount(d.saplingId)
    }))
  })

  const getWildTreeName = (type: string): string => {
    return getWildTreeDef(type)?.name ?? type
  }

  const getWildTreeGrowthDays = (type: WildTreeType): number | undefined => {
    return getWildTreeDef(type)?.growthDays
  }

  const getWildTreeTapCycleDays = (type: WildTreeType): number | undefined => {
    return getWildTreeDef(type)?.tapCycleDays
  }

  const plantableWildSeeds = computed(() => {
    return WILD_TREE_DEFS.filter(d => hasItem(d.seedItemId)).map(d => ({
      type: d.type as WildTreeType,
      seedItemId: d.seedItemId,
      name: d.name,
      count: getItemCount(d.seedItemId)
    }))
  })

  const hasTapper = computed(() => getItemCount('tapper') > 0)

  const handlePlantTree = (treeType: FruitTreeType) => {
    const def = FRUIT_TREE_DEFS.find(d => d.type === treeType)
    if (!def) return
    if (!removeItem(def.saplingId)) {
      addLog('背包中没有该树苗。')
      return
    }
    if (plantFruitTree(treeType)) {
      addLog(`种下了${def.name}苗，需28天成熟。`)
      const tr = advanceTime(ACTION_TIME_COSTS.plantTree)
      if (tr.message) addLog(tr.message)
    } else {
      addItem(def.saplingId)
      addLog(`果树位已满（最多${MAX_FRUIT_TREES}棵）。`)
    }
  }

  const getAxeStaminaCost = () =>
    Math.max(1, Math.floor(5 * getToolStaminaMultiplier('axe') * (1 - getStaminaReduction('foraging'))))

  const confirmChopFruitTree = () => {
    const target = chopFruitTreeTarget.value
    if (!target) return
    chopFruitTreeTarget.value = null
    if (isPastBedtime()) {
      addLog('太晚了，没法砍伐了。')
      return
    }
    if (!isToolAvailable('axe')) {
      addLog('斧头正在升级中，无法砍伐。')
      return
    }
    const cost = getAxeStaminaCost()
    if (!consumeStamina(cost)) {
      addLog('体力不足，无法砍伐。')
      return
    }
    const treeName = getTreeName(target.type)
    const woodQty = removeFruitTree(target.id)
    if (woodQty > 0) {
      addItem('wood', woodQty)
      addLog(`砍掉了${treeName}，获得${woodQty}个木材。（体力-${cost}）`)
      const tr = advanceTime(ACTION_TIME_COSTS.chopTree)
      if (tr.message) addLog(tr.message)
    }
  }

  const handlePlantWildTree = (treeType: WildTreeType) => {
    const def = WILD_TREE_DEFS.find(d => d.type === treeType)
    if (!def) return
    if (!removeItem(def.seedItemId)) {
      addLog('背包中没有该种子。')
      return
    }
    if (plantWildTree(treeType)) {
      addLog(`种下了${def.name}，需${def.growthDays}天成熟。`)
      const tr = advanceTime(ACTION_TIME_COSTS.plantTree)
      if (tr.message) addLog(tr.message)
    } else {
      addItem(def.seedItemId)
      addLog(`野树位已满（最多${MAX_WILD_TREES}棵）。`)
    }
  }

  const handleAttachTapper = (treeId: number) => {
    if (!removeItem('tapper')) {
      addLog('背包中没有采脂器。')
      return
    }
    if (attachTapper(treeId)) {
      addLog('安装了采脂器，将定期产出树脂。')
    } else {
      addItem('tapper')
      addLog('无法安装采脂器（需要已成熟且未装采脂器的野树）。')
    }
  }

  const handleCollectTapProduct = (treeId: number) => {
    const productId = collectTapProduct(treeId)
    if (productId) {
      addItem(productId)
      const def = WILD_TREE_DEFS.find(d => d.tapProduct === productId)
      addLog(`收取了${def?.tapProductName ?? productId}！`)
    }
  }

  const handleChopTree = (treeId: number) => {
    const tree = wildTrees().find(t => t.id === treeId)
    if (!tree) return
    chopWildTreeTarget.value = { id: tree.id, type: tree.type, chopCount: tree.chopCount }
  }

  const confirmChopWildTree = () => {
    const target = chopWildTreeTarget.value
    if (!target) return
    chopWildTreeTarget.value = null
    if (isPastBedtime()) {
      addLog('太晚了，没法伐木了。')
      return
    }
    if (!isToolAvailable('axe')) {
      addLog('斧头正在升级中，无法伐木。')
      return
    }
    const cost = getAxeStaminaCost()
    if (!consumeStamina(cost)) {
      addLog('体力不足，无法伐木。')
      return
    }
    const baseQty = 2
    const qty = baseQty + (hasLumberjackBonus() ? 2 : Math.random() < 0.5 ? 1 : 0)
    addItem('wood', qty)
    const { removed } = chopWildTree(target.id)
    const treeName = getWildTreeName(target.type)
    if (removed) {
      addLog(`伐木获得了${qty}个木材，${treeName}已被砍倒消失了。（体力-${cost}）`)
    } else {
      addLog(`伐木获得了${qty}个木材。（体力-${cost}）`)
    }
    const tr = advanceTime(ACTION_TIME_COSTS.chopTree)
    if (tr.message) addLog(tr.message)
  }

  return {
    confirmChopFruitTree,
    confirmChopWildTree,
    getTreeFruitSeason,
    getTreeName,
    getWildTreeGrowthDays,
    getWildTreeName,
    getWildTreeTapCycleDays,
    handleAttachTapper,
    handleChopTree,
    handleCollectTapProduct,
    handlePlantTree,
    handlePlantWildTree,
    hasTapper: hasTapper as ComputedRef<boolean>,
    plantableSaplings,
    plantableWildSeeds
  }
}
