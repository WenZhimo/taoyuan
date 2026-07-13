<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-accent text-sm">灶台</h3>
      <button
        class="text-[10px] px-2 py-0.5 border rounded-xs"
        :class="showOnlyMakeable ? 'border-accent text-accent' : 'border-accent/20 text-muted'"
        @click="showOnlyMakeable = !showOnlyMakeable"
      >
        {{ showOnlyMakeable ? '可制作' : '全部' }}
      </button>
    </div>
    <p v-if="tutorialHint" class="text-[10px] text-muted/50 mb-2">{{ tutorialHint }}</p>

    <!-- 特殊兑换 -->
    <div class="border border-accent/20 rounded-xs px-3 py-2 mb-3">
      <div class="flex items-center justify-between gap-2">
        <div>
          <p class="text-xs text-accent">墨墨的fumo</p>
          <p class="text-[10px] text-muted">
            提交青菜×{{ FUMO_EXCHANGE_QUANTITY }}，转化为极品墨墨的fumo×{{ FUMO_OUTPUT_QUANTITY }}
          </p>
          <p class="text-[10px]" :class="canExchangeFumo ? 'text-success' : 'text-danger'">当前青菜：{{ cabbageCount }}/{{ FUMO_EXCHANGE_QUANTITY }}</p>
        </div>
        <Button
          class="shrink-0"
          :class="{ '!bg-accent !text-bg': canExchangeFumo }"
          :icon="Sparkles"
          :icon-size="12"
          :disabled="!canExchangeFumo"
          @click="handleExchangeFumo"
        >
          转化
        </Button>
      </div>
    </div>

    <!-- 当前增益 -->
    <div v-if="cookingStore.activeBuff" class="border border-water/20 rounded-xs px-3 py-1.5 mb-3">
      <p class="text-[10px] text-water">
        <Zap :size="12" class="inline mr-0.5" />
        当前增益：{{ cookingStore.activeBuff.description }}
      </p>
    </div>

    <!-- 食谱列表 -->
    <div v-if="displayedRecipeInfos.length > 0" class="border border-accent/20 rounded-xs divide-y divide-accent/10 mb-4">
      <div
        v-for="info in displayedRecipeInfos"
        :key="info.recipe.id"
        class="px-3 py-1.5 cursor-pointer hover:bg-accent/5"
        @click="openModal(info.recipe.id)"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs" :class="info.canCook ? 'text-text' : 'text-muted'">
            {{ info.recipe.name }}
            <span v-if="info.canCook && info.quality !== 'normal'" class="text-[10px] ml-0.5" :class="qualityTextClass(info.quality)">
              [{{ QUALITY_NAMES[info.quality] }}]
            </span>
          </span>
          <span class="text-[10px] whitespace-nowrap ml-2" :class="info.canCook ? 'text-success' : 'text-muted/50'">
            +{{ info.recipe.effect.staminaRestore }}体力
            <span v-if="info.recipe.effect.healthRestore">+{{ info.recipe.effect.healthRestore }}生命</span>
          </span>
        </div>
        <p v-if="info.recipe.effect.buff" class="text-[10px] text-water mt-0.5">{{ info.recipe.effect.buff.description }}</p>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center py-8 mb-4">
      <UtensilsCrossed :size="36" class="text-accent/20 mb-2" />
      <p v-if="showOnlyMakeable" class="text-xs text-muted">没有可制作的食谱</p>
      <p v-else-if="cookingStore.recipes.length === 0" class="text-xs text-muted">还没有食谱</p>
      <p v-if="showOnlyMakeable" class="text-[10px] text-muted/50 mt-0.5">取消筛选或收集更多食材</p>
      <p v-else-if="cookingStore.recipes.length === 0" class="text-[10px] text-muted/50 mt-0.5">与村民交好或观看电视可学习食谱</p>
    </div>

    <!-- 烹饪弹窗 -->
    <Transition name="panel-fade">
      <div v-if="modalInfo" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="closeModal">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">
            {{ modalInfo.recipe.name }}
            <span
              v-if="modalInfo.canCook && modalInfo.quality !== 'normal'"
              class="text-[10px] ml-0.5"
              :class="qualityTextClass(modalInfo.quality)"
            >
              [{{ QUALITY_NAMES[modalInfo.quality] }}]
            </span>
          </p>

          <!-- 功效 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-success">
              恢复 {{ modalInfo.recipe.effect.staminaRestore }} 体力
              <span v-if="modalInfo.recipe.effect.healthRestore" class="text-danger ml-1">
                {{ modalInfo.recipe.effect.healthRestore }} 生命值
              </span>
            </p>
            <p v-if="modalInfo.recipe.effect.buff" class="text-xs text-water mt-0.5">
              {{ modalInfo.recipe.effect.buff.description }}
            </p>
          </div>

          <!-- 材料 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted mb-1">所需材料</p>
            <div v-for="ing in modalInfo.ingredients" :key="ing.key" class="py-1 border-b border-accent/5 last:border-b-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-muted">{{ ing.name }}</span>
                <span class="text-xs shrink-0" :class="ing.enough ? '' : 'text-danger'">{{ ing.available }}/{{ ing.required }}</span>
              </div>
              <p v-if="ing.allocationText" class="text-[10px] text-muted/70 mt-0.5">将消耗：{{ ing.allocationText }}</p>
              <select
                v-if="ing.selectable"
                class="mt-1 w-full h-7 bg-bg border border-accent/20 rounded-xs px-2 text-[10px] text-text outline-none focus:border-accent"
                :value="ing.selectedItemId"
                @change="onIngredientSelectionChange(ing.index, $event)"
              >
                <option value="">自动选择</option>
                <option v-for="candidate in ing.candidates" :key="candidate.itemId" :value="candidate.itemId">
                  {{ candidate.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- 数量选择 -->
          <div v-if="modalInfo.maxQty > 1" class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-muted">数量</span>
              <div class="flex items-center space-x-1">
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="modalQty <= 1" @click="addModalQty(-1)">
                  <Minus :size="12" />
                </Button>
                <input
                  type="number"
                  :value="modalQty"
                  min="1"
                  :max="modalInfo.maxQty"
                  class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none focus:border-accent transition-colors"
                  @input="onModalQtyInput"
                />
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="modalQty >= modalInfo.maxQty" @click="addModalQty(1)">
                  <Plus :size="12" />
                </Button>
              </div>
            </div>
            <div class="flex space-x-1">
              <Button class="flex-1 justify-center" :disabled="modalQty <= 1" @click="setModalQty(1)">最少</Button>
              <Button class="flex-1 justify-center" :disabled="modalQty >= modalInfo.maxQty" @click="setModalQty(modalInfo.maxQty)">
                最多
              </Button>
            </div>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-xs text-muted">可制作</span>
              <span class="text-xs text-accent">{{ modalInfo.maxQty }} 份</span>
            </div>
          </div>

          <!-- 烹饪按钮 -->
          <Button
            class="w-full justify-center"
            :class="{ '!bg-accent !text-bg': modalInfo.canCook }"
            :icon="UtensilsCrossed"
            :icon-size="12"
            :disabled="!modalInfo.canCook"
            @click="handleCookFromModal"
          >
            烹饪{{ modalQty > 1 ? ` ×${modalQty}` : '' }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { UtensilsCrossed, Zap, X, Minus, Plus, Sparkles } from 'lucide-vue-next'
  import { useAchievementStore } from '@/stores/useAchievementStore'
  import { useCookingStore, type CookingIngredientSelections } from '@/stores/useCookingStore'
  import { useGameStore } from '@/stores/useGameStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useTutorialStore } from '@/stores/useTutorialStore'
  import { getCombinedItemCount, removeCombinedItem } from '@/composables/useCombinedInventory'
  import { getItemById } from '@/data'
  import { MOMO_FUMO_EXCHANGE } from '@/data/specialItems'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import { sfxClick } from '@/composables/useAudio'
  import { addLog } from '@/composables/useGameLog'
  import { handleEndDay } from '@/composables/useEndDay'
  import { useQuantityPicker } from '@/composables/game/useQuantityPicker'
  import { QUALITY_NAMES } from '@/composables/useFarmActions'
  import { getOfficialItemDef, getOfficialTagDef } from '@/domain/mods/contentAccess'
  import type { CookingIngredient, IngredientAllocation, IngredientAllocationPlan, IngredientCandidate } from '@/domain/cooking/ingredientPlanner'
  import type { RecipeIngredient } from '@/domain/mods/schemas'
  import type { Quality, RecipeDef } from '@/types'
  import Button from '@/components/game/Button.vue'

  const cookingStore = useCookingStore()
  const gameStore = useGameStore()
  const inventoryStore = useInventoryStore()
  const achievementStore = useAchievementStore()
  const tutorialStore = useTutorialStore()

  const {
    sourceItemId: FUMO_SOURCE_ITEM_ID,
    sourceQuantity: FUMO_EXCHANGE_QUANTITY,
    outputItemId: FUMO_ITEM_ID,
    outputQuantity: FUMO_OUTPUT_QUANTITY,
    outputQuality: FUMO_OUTPUT_QUALITY
  } = MOMO_FUMO_EXCHANGE

  const showOnlyMakeable = ref(false)
  const modalRecipeId = ref<string | null>(null)
  const manualIngredientSelections = ref<Record<number, string>>({})
  const cabbageCount = computed(() => getCombinedItemCount(FUMO_SOURCE_ITEM_ID))
  const canExchangeFumo = computed(() => cabbageCount.value >= FUMO_EXCHANGE_QUANTITY)

  const toLocalItemId = (id: string): string => id.slice(id.indexOf(':') + 1)
  const toMaybeLocalItemId = (id: string): string => id.includes(':') ? toLocalItemId(id) : id
  const isRegistryIngredient = (ingredient: CookingIngredient): ingredient is RecipeIngredient => 'type' in ingredient

  const getIngredientQuantity = (ingredient: CookingIngredient): number => ingredient.quantity

  const getFixedIngredientItemId = (ingredient: CookingIngredient): string | null => {
    if (!isRegistryIngredient(ingredient)) return toMaybeLocalItemId(ingredient.itemId)
    return ingredient.type === 'item' ? toMaybeLocalItemId(ingredient.itemId) : null
  }

  const getItemName = (itemId: string): string => {
    const localId = toMaybeLocalItemId(itemId)
    return getItemById(localId)?.name ?? getOfficialItemDef(localId)?.name.fallback ?? localId
  }

  const getTagName = (tagId: string): string =>
    getOfficialTagDef(tagId)?.name.fallback ?? toMaybeLocalItemId(tagId)

  const getIngredientName = (ingredient: CookingIngredient): string => {
    if (!isRegistryIngredient(ingredient)) return getItemName(ingredient.itemId)
    if (ingredient.type === 'item') return getItemName(ingredient.itemId)
    if (ingredient.type === 'tag') return `${getTagName(ingredient.tagId)}材料`
    return `${ingredient.tagIds.map(getTagName).join('或')}材料`
  }

  const formatAllocationText = (allocations: readonly IngredientAllocation[]): string =>
    allocations.map(allocation => {
      const qualityLabel = allocation.quality === 'normal' ? '' : `（${QUALITY_NAMES[allocation.quality]}）`
      return `${getItemName(allocation.itemId)}${qualityLabel}×${allocation.quantity}`
    }).join('、')

  const formatCandidateLabel = (candidate: IngredientCandidate): string => {
    const qualityText = candidate.qualities.map(entry => `${QUALITY_NAMES[entry.quality]}×${entry.quantity}`).join(' ')
    return `${getItemName(candidate.itemId)} · ${candidate.available}${qualityText ? ` · ${qualityText}` : ''}`
  }

  /** 预计算食谱信息（不含数量，避免改数量触发全量重算） */
  const recipeInfos = computed(() => {
    return cookingStore.recipes.map(recipe => {
      const canCook = cookingStore.canCook(recipe.id)
      const maxQty = cookingStore.maxCookable(recipe.id)
      const quality = cookingStore.previewCookQuality(recipe.id)
      return { recipe, canCook, maxQty, quality }
    })
  })

  const displayedRecipeInfos = computed(() => {
    if (!showOnlyMakeable.value) return recipeInfos.value
    return recipeInfos.value.filter(info => info.canCook)
  })

  const modalRecipe = computed<RecipeDef | null>(() => {
    if (!modalRecipeId.value) return null
    return recipeInfos.value.find(i => i.recipe.id === modalRecipeId.value)?.recipe ?? null
  })

  const modalSelections = computed<CookingIngredientSelections>(() => ({ ...manualIngredientSelections.value }))
  const modalMaxQty = computed(() => modalRecipe.value ? cookingStore.maxCookable(modalRecipe.value.id, modalSelections.value) : 1)

  const modalQuantityPicker = useQuantityPicker({
    maxQuantity: modalMaxQty
  })
  const modalQty = modalQuantityPicker.quantity
  const setModalQty = modalQuantityPicker.setQuantity
  const addModalQty = modalQuantityPicker.addQuantity
  const modalPlan = computed(() =>
    modalRecipe.value
      ? cookingStore.getRecipeIngredientPlan(modalRecipe.value.id, modalQty.value, modalSelections.value)
      : null
  )

  const createModalIngredientInfos = (
    recipe: RecipeDef,
    quantity: number,
    plan: IngredientAllocationPlan | null
  ) => cookingStore.getRecipeCookingIngredients(recipe.id).map((ingredient, index) => {
    const required = getIngredientQuantity(ingredient) * quantity
    const fixedItemId = getFixedIngredientItemId(ingredient)
    const candidates = fixedItemId ? [] : cookingStore.getRecipeIngredientCandidates(recipe.id, index)
    const selectedItemId = manualIngredientSelections.value[index] ?? ''
    const selectedCandidate = selectedItemId ? candidates.find(candidate => candidate.itemId === selectedItemId) : null
    const available = fixedItemId
      ? getCombinedItemCount(fixedItemId)
      : selectedCandidate
        ? selectedCandidate.available
        : candidates.reduce((sum, candidate) => sum + candidate.available, 0)
    const allocations = plan?.slots[index]?.allocations ?? []
    return {
      key: `${index}:${fixedItemId ?? getIngredientName(ingredient)}`,
      index,
      name: getIngredientName(ingredient),
      required,
      available,
      enough: available >= required,
      selectable: !fixedItemId,
      selectedItemId,
      candidates: candidates.map(candidate => ({
        itemId: candidate.itemId,
        label: formatCandidateLabel(candidate)
      })),
      allocationText: allocations.length > 0 ? formatAllocationText(allocations) : ''
    }
  })

  /** 当前弹窗对应的食谱信息（响应式，材料、数量和手动选择变化时自动更新） */
  const modalInfo = computed(() => {
    const recipe = modalRecipe.value
    if (!recipe) return null
    const plan = modalPlan.value
    const successfulPlan = plan?.success ? plan : null
    return {
      recipe,
      canCook: Boolean(successfulPlan),
      maxQty: modalMaxQty.value,
      quality: successfulPlan?.resultQuality ?? cookingStore.previewCookQuality(recipe.id, modalSelections.value),
      ingredients: createModalIngredientInfos(recipe, modalQty.value, successfulPlan)
    }
  })

  const openModal = (recipeId: string) => {
    modalRecipeId.value = recipeId
    manualIngredientSelections.value = {}
    modalQuantityPicker.resetQuantity(1)
  }

  const closeModal = () => {
    modalRecipeId.value = null
    manualIngredientSelections.value = {}
  }

  const onModalQtyInput = (event: Event) => {
    modalQuantityPicker.setQuantityFromInput((event.target as HTMLInputElement).value)
  }

  const onIngredientSelectionChange = (index: number, event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    const next = { ...manualIngredientSelections.value }
    if (value) next[index] = value
    else delete next[index]
    manualIngredientSelections.value = next
    setModalQty(modalQty.value)
  }

  watch(modalMaxQty, () => {
    setModalQty(modalQty.value)
  })

  const qualityTextClass = (quality: Quality): string => {
    if (quality === 'fine') return 'text-quality-fine'
    if (quality === 'excellent') return 'text-quality-excellent'
    if (quality === 'supreme') return 'text-quality-supreme'
    return ''
  }

  const tutorialHint = computed(() => {
    if (!tutorialStore.enabled || gameStore.year > 1) return null
    if (achievementStore.stats.totalRecipesCooked === 0)
      return '点击食谱查看详情和烹饪。料理可以恢复体力和生命值，高品质材料可做出更好的食物。'
    return null
  })

  const handleCookFromModal = () => {
    if (!modalInfo.value || !modalInfo.value.canCook) return
    if (gameStore.isPastBedtime) {
      addLog('太晚了，没力气做饭了。')
      handleEndDay()
      closeModal()
      return
    }
    const qty = Math.min(modalQty.value, modalInfo.value.maxQty)
    const result = cookingStore.cook(modalInfo.value.recipe.id, qty, modalSelections.value)
    sfxClick()
    addLog(result.message)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.cook * qty)
    if (tr.message) addLog(tr.message)
    closeModal()
    if (tr.passedOut) handleEndDay()
  }

  const handleExchangeFumo = () => {
    if (!canExchangeFumo.value) return
    if (!removeCombinedItem(FUMO_SOURCE_ITEM_ID, FUMO_EXCHANGE_QUANTITY)) {
      addLog('青菜不足，无法转化墨墨的fumo。')
      return
    }
    inventoryStore.addItem(FUMO_ITEM_ID, FUMO_OUTPUT_QUANTITY, FUMO_OUTPUT_QUALITY)
    achievementStore.discoverItem(FUMO_ITEM_ID)
    sfxClick()
    addLog(`提交了${FUMO_EXCHANGE_QUANTITY}个青菜，转化为极品墨墨的fumo×${FUMO_OUTPUT_QUANTITY}。`)
  }
</script>
