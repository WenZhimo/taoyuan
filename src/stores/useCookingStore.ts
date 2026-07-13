import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RecipeDef, Quality } from '@/types'
import { getRecipeById } from '@/data'
import { useInventoryStore } from './useInventoryStore'
import { usePlayerStore } from './usePlayerStore'
import { useSkillStore } from './useSkillStore'
import { useAchievementStore } from './useAchievementStore'
import { useWalletStore } from './useWalletStore'
import { useHomeStore } from './useHomeStore'
import { useHiddenNpcStore } from './useHiddenNpcStore'
import { useWarehouseStore } from './useWarehouseStore'
import { getLowestCombinedQuality, removeCombinedItem } from '@/composables/useCombinedInventory'
import { getOfficialItemDefs, getOfficialRecipeDef } from '@/domain/mods/contentAccess'
import {
  createIngredientAllocationPlan,
  getIngredientCandidates,
  getMaxIngredientCraftQuantity,
  type CookingIngredient,
  type IngredientAllocationResult,
  type IngredientCandidate,
  type IngredientInventoryStack,
  type IngredientSelectionMap
} from '@/domain/cooking/ingredientPlanner'

const QUALITY_ORDER: Quality[] = ['normal', 'fine', 'excellent', 'supreme']
const QUALITY_MULTIPLIER: Record<Quality, number> = { normal: 1, fine: 1.25, excellent: 1.5, supreme: 2 }
const QUALITY_LABEL: Record<Quality, string> = { normal: '', fine: '优良', excellent: '精品', supreme: '极品' }

export type CookingIngredientSelections = IngredientSelectionMap

export const useCookingStore = defineStore('cooking', () => {
  const inventoryStore = useInventoryStore()
  const warehouseStore = useWarehouseStore()
  const playerStore = usePlayerStore()
  const skillStore = useSkillStore()

  /** 已解锁的食谱ID列表 */
  const unlockedRecipes = ref<string[]>([
    'stir_fried_cabbage',
    'honey_tea',
    'ginger_soup',
    'bamboo_shoot_stir_fry',
    'dried_persimmon',
    'sesame_paste',
    'corn_pancake',
    'scrambled_egg_rice',
    'stir_fried_potato',
    'boiled_egg',
    'congee',
    'roasted_sweet_potato',
    'vegetable_soup',
    'chive_egg_stir_fry',
    'peanut_candy',
    'silkie_egg_soup'
  ])

  /** 当天生效的食物增益 */
  const activeBuff = ref<RecipeDef['effect']['buff'] | null>(null)

  /** 已解锁的食谱定义 */
  const recipes = computed(() => unlockedRecipes.value.map(id => getRecipeById(id)).filter((r): r is RecipeDef => r !== undefined))

  const hasSkillForRecipe = (recipe: RecipeDef): boolean => {
    if (!recipe.requiredSkill) return true
    const skill = skillStore.getSkill(recipe.requiredSkill.type)
    return skill.level >= recipe.requiredSkill.level
  }

  const getCookingIngredients = (recipe: RecipeDef): readonly CookingIngredient[] =>
    getOfficialRecipeDef(recipe.id)?.ingredients ?? recipe.ingredients

  const getRecipeCookingIngredients = (recipeId: string): readonly CookingIngredient[] => {
    const recipe = getRecipeById(recipeId)
    return recipe ? getCookingIngredients(recipe) : []
  }

  const getCookingInventoryStacks = (): IngredientInventoryStack[] => {
    const stacks: IngredientInventoryStack[] = inventoryStore.items.map(item => ({
      itemId: item.itemId,
      quality: item.quality,
      quantity: item.quantity
    }))
    if (warehouseStore.unlocked) {
      for (const chest of warehouseStore.chests) {
        for (const item of chest.items) {
          stacks.push({ itemId: item.itemId, quality: item.quality, quantity: item.quantity })
        }
      }
    }
    return stacks
  }

  const createCookingPlan = (
    recipe: RecipeDef,
    quantity: number,
    selectedItemIds?: CookingIngredientSelections
  ): IngredientAllocationResult =>
    createIngredientAllocationPlan({
      ingredients: getCookingIngredients(recipe),
      quantity,
      inventory: getCookingInventoryStacks(),
      items: getOfficialItemDefs(),
      selectedItemIds
    })

  const getRecipeIngredientPlan = (
    recipeId: string,
    quantity: number = 1,
    selectedItemIds?: CookingIngredientSelections
  ): IngredientAllocationResult | null => {
    const recipe = getRecipeById(recipeId)
    return recipe ? createCookingPlan(recipe, quantity, selectedItemIds) : null
  }

  const getRecipeIngredientCandidates = (
    recipeId: string,
    ingredientIndex: number,
    selectedItemIds?: CookingIngredientSelections
  ): IngredientCandidate[] => {
    const recipe = getRecipeById(recipeId)
    if (!recipe) return []
    const ingredient = getCookingIngredients(recipe)[ingredientIndex]
    if (!ingredient) return []
    return getIngredientCandidates({
      ingredient,
      inventory: getCookingInventoryStacks(),
      items: getOfficialItemDefs(),
      selectedItemId: selectedItemIds?.[ingredientIndex]
    })
  }

  /** 检查是否有足够材料 */
  const canCook = (recipeId: string, selectedItemIds?: CookingIngredientSelections): boolean => {
    const recipe = getRecipeById(recipeId)
    if (!recipe) return false
    if (!unlockedRecipes.value.includes(recipeId)) return false
    // 检查技能等级门槛
    if (!hasSkillForRecipe(recipe)) return false
    return createCookingPlan(recipe, 1, selectedItemIds).success
  }

  /** 计算最多能烹饪几份 */
  const maxCookable = (recipeId: string, selectedItemIds?: CookingIngredientSelections): number => {
    const recipe = getRecipeById(recipeId)
    if (!recipe) return 0
    if (!unlockedRecipes.value.includes(recipeId)) return 0
    if (!hasSkillForRecipe(recipe)) return 0
    return getMaxIngredientCraftQuantity({
      ingredients: getCookingIngredients(recipe),
      inventory: getCookingInventoryStacks(),
      items: getOfficialItemDefs(),
      selectedItemIds
    })
  }

  /** 预览烹饪品质（取所有材料最低品质） */
  const previewCookQuality = (recipeId: string, selectedItemIds?: CookingIngredientSelections): Quality => {
    const recipe = getRecipeById(recipeId)
    if (!recipe) return 'normal'
    const plan = createCookingPlan(recipe, 1, selectedItemIds)
    if (plan.success) return plan.resultQuality

    let minIdx = QUALITY_ORDER.length - 1
    for (const ing of recipe.ingredients) {
      const idx = QUALITY_ORDER.indexOf(getLowestCombinedQuality(ing.itemId))
      if (idx < minIdx) minIdx = idx
    }
    return QUALITY_ORDER[minIdx] ?? 'normal'
  }

  /** 烹饪 */
  const cook = (
    recipeId: string,
    quantity: number = 1,
    selectedItemIds?: CookingIngredientSelections
  ): { success: boolean; message: string } => {
    const recipe = getRecipeById(recipeId)
    if (!recipe) return { success: false, message: '食谱不存在。' }
    if (!unlockedRecipes.value.includes(recipeId)) return { success: false, message: '尚未解锁此食谱。' }

    // 计算最多能做几份
    const maxPossible = getMaxIngredientCraftQuantity({
      ingredients: getCookingIngredients(recipe),
      inventory: getCookingInventoryStacks(),
      items: getOfficialItemDefs(),
      selectedItemIds,
      upperLimit: quantity
    })
    if (maxPossible <= 0) return { success: false, message: '材料不足。' }

    const plan = createCookingPlan(recipe, maxPossible, selectedItemIds)
    if (!plan.success) return { success: false, message: '材料不足。' }
    const resultQuality = plan.resultQuality

    // 批量消耗材料
    for (const removal of plan.removals) {
      removeCombinedItem(removal.itemId, removal.quantity, removal.quality)
    }

    // 添加食物到背包
    inventoryStore.addItem(`food_${recipe.id}`, maxPossible, resultQuality)
    for (let i = 0; i < maxPossible; i++) {
      useAchievementStore().recordRecipeCooked()
    }
    const qualityTag = QUALITY_LABEL[resultQuality] ? `【${QUALITY_LABEL[resultQuality]}】` : ''
    const qtyTag = maxPossible > 1 ? `${maxPossible}份` : ''
    return { success: true, message: `烹饪了${qtyTag}${qualityTag}${recipe.name}！` }
  }

  /** 食用烹饪品 */
  const eat = (recipeId: string, quality: Quality = 'normal'): { success: boolean; message: string } => {
    const foodItemId = `food_${recipeId}`
    if (!inventoryStore.removeItem(foodItemId, 1, quality)) {
      return { success: false, message: '背包中没有这个食物。' }
    }

    const recipe = getRecipeById(recipeId)
    if (!recipe) return { success: false, message: '食谱数据丢失。' }

    // 品质加成
    const qualityBonus = QUALITY_MULTIPLIER[quality]
    // 炼金师专精：食物恢复+50%
    const walletStore = useWalletStore()
    const homeStore = useHomeStore()
    const chefBonus = 1 + walletStore.getCookingRestoreBonus()
    const alchemistBonus = skillStore.getSkill('foraging').perk10 === 'alchemist' ? 1.5 : 1.0
    const kitchenBonus = homeStore.getKitchenBonus()
    // 仙缘能力：月膳（yue_tu_2）食物恢复+50%
    const moonRabbitBonus = useHiddenNpcStore().isAbilityActive('yue_tu_2') ? 1.5 : 1.0
    const staminaRestore = Math.floor(
      recipe.effect.staminaRestore * qualityBonus * alchemistBonus * chefBonus * kitchenBonus * moonRabbitBonus
    )
    playerStore.restoreStamina(staminaRestore)
    const qualityTag = QUALITY_LABEL[quality] ? `【${QUALITY_LABEL[quality]}】` : ''
    let msg = `食用了${qualityTag}${recipe.name}，恢复${staminaRestore}体力`

    if (recipe.effect.healthRestore) {
      const healthRestore = Math.floor(
        recipe.effect.healthRestore * qualityBonus * alchemistBonus * chefBonus * kitchenBonus * moonRabbitBonus
      )
      playerStore.restoreHealth(healthRestore)
      msg += `、${healthRestore}生命值`
    }
    msg += '。'

    if (recipe.effect.buff) {
      activeBuff.value = { ...recipe.effect.buff }
      msg += ` ${recipe.effect.buff.description}`
      // 「体力全恢复」类buff：立即将体力回满
      if (recipe.effect.buff.type === 'stamina') {
        playerStore.restoreStamina(playerStore.maxStamina)
      }
    }

    return { success: true, message: msg }
  }

  /** 解锁食谱 */
  const unlockRecipe = (recipeId: string): boolean => {
    if (unlockedRecipes.value.includes(recipeId)) return false
    const recipe = getRecipeById(recipeId)
    if (!recipe) return false
    unlockedRecipes.value.push(recipeId)
    return true
  }

  /** 每日重置增益 */
  const dailyReset = () => {
    activeBuff.value = null
  }

  const serialize = () => {
    return { unlockedRecipes: unlockedRecipes.value, activeBuff: activeBuff.value }
  }

  const deserialize = (data: ReturnType<typeof serialize>) => {
    unlockedRecipes.value = data.unlockedRecipes
    activeBuff.value = data.activeBuff
  }

  return {
    unlockedRecipes,
    activeBuff,
    recipes,
    getRecipeCookingIngredients,
    getRecipeIngredientPlan,
    getRecipeIngredientCandidates,
    canCook,
    maxCookable,
    previewCookQuality,
    cook,
    eat,
    unlockRecipe,
    dailyReset,
    serialize,
    deserialize
  }
})
