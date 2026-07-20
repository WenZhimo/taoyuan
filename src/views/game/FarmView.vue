<template>
  <div>
    <!-- 标签切换 -->
    <FarmTabSwitcher v-model="farmTab" />

    <!-- 田庄标签 -->
    <div v-if="farmTab === 'field'">
      <FarmFieldHeader
        :farm-size="farmStore.farmSize"
        :scarecrows="farmStore.scarecrows"
        :lightning-rods="farmStore.lightningRods"
        :tutorial-hint="tutorialHint"
        :farm-map-type="gameStore.farmMapType"
        :creek-catch-count="gameStore.creekCatch.length"
        :surface-ore-name="surfaceOreName"
        :surface-ore-quantity="gameStore.surfaceOrePatch?.quantity ?? 0"
        @open-batch-actions="showBatchActions = true"
        @collect-creek-catch="handleCollectCreekCatch"
        @mine-surface-ore="handleMineSurfaceOre"
      />

      <!-- 批量操作弹窗 -->
      <Transition name="panel-fade">
        <FarmBatchActionsDialog
          v-if="showBatchActions"
          :can-fertilize="fertilizableCount > 0 && fertilizerItems.length > 0"
          :can-plant="tilledEmptyCount > 0 && (plantableSeeds.length > 0 || plantableBreedingSeeds.length > 0)"
          :fertilizable-count="fertilizableCount"
          :harvestable-count="harvestableCount"
          :infested-count="infestedCount"
          :tilled-empty-count="tilledEmptyCount"
          :unwatered-count="unwateredCount"
          :wasteland-count="wastelandCount"
          :weedy-count="weedyCount"
          @close="showBatchActions = false"
          @action="doBatchAction"
        />
      </Transition>

      <!-- 大批量操作确认弹窗 -->
      <Transition name="panel-fade">
        <LargeBatchConfirmDialog
          v-if="pendingLargeBatch"
          :label="pendingLargeBatch.label"
          :total="pendingLargeBatch.total"
          :limit="pendingLargeBatch.limit"
          @cancel="cancelLargeBatch"
          @confirm="confirmLargeBatch"
        />
      </Transition>

      <Transition name="panel-fade">
        <BatchProgressOverlay
          v-if="activeBatchProgress"
          :label="activeBatchProgress.label"
          :total="activeBatchProgress.total"
          :processed="activeBatchProgress.processed"
          :cancel-requested="activeBatchProgress.cancelRequested"
          @cancel="cancelActiveBatch"
        />
      </Transition>

      <!-- 农场网格 -->
      <FarmPlotGrid
        :farm-size="farmStore.farmSize"
        :plots="farmStore.plots"
        :get-crop-name="getCropName"
        :get-plot-display="getPlotDisplay"
        :get-plot-tooltip="getPlotTooltip"
        :has-sprinkler="hasSprinkler"
        :is-sprinkler-covered="isSprinklerCovered"
        :needs-water="needsWater"
        @select-plot="activePlotId = $event"
      />

      <!-- 地块操作弹窗 -->
      <Transition name="panel-fade">
        <FarmPlotDetailDialog
          v-if="activePlot"
          :plot="activePlot"
          :state-label="plotStateLabel"
          :crop-name="activePlot.cropId ? getCropName(activePlot.cropId) : ''"
          :crop-growth-days="plotCropGrowthDays"
          :crop-regrowth="plotCropRegrowth"
          :crop-max-harvests="plotCropMaxHarvests"
          :fertilizer-name="plotFertName"
          :has-sprinkler="hasSprinkler(activePlot.id)"
          :can-water="canWater"
          :can-fertilize="canFertilize"
          :seeds="plantableSeeds"
          :breeding-seeds="plantableBreedingSeeds"
          :fertilizers="fertilizerItems"
          :sprinklers="sprinklerItems"
          :is-shop-open="isWanwupuOpen"
          :shop-closed-reason="wanwupuClosedReason"
          :quality-names="QUALITY_NAMES"
          :get-crop-name="getCropName"
          :get-breeding-star-rating="getStarRating"
          @close="activePlotId = null"
          @till="doTill"
          @water="doWater"
          @cure-pest="doCurePest"
          @clear-weed="doClearWeed"
          @harvest="doHarvest"
          @remove-crop="doRemoveCrop"
          @plant="doPlant"
          @plant-breeding-seed="doPlantGeneticSeed"
          @go-to-shop="goToShop"
          @fertilize="doFertilize"
          @place-sprinkler="doPlaceSprinkler"
          @remove-sprinkler="doRemoveSprinkler"
        />
      </Transition>

      <!-- 一键种植弹窗 -->
      <Transition name="panel-fade">
        <FarmBatchPlantDialog
          v-if="showBatchPlant"
          :tilled-empty-count="tilledEmptyCount"
          :seeds="plantableSeeds"
          :breeding-seed-groups="batchBreedingSeedGroups"
          :is-shop-open="isWanwupuOpen"
          :shop-closed-reason="wanwupuClosedReason"
          @close="showBatchPlant = false"
          @plant="doBatchPlant"
          @plant-breeding="doBatchPlantBreeding"
          @go-to-shop="goToShop"
        />
      </Transition>

      <!-- 一键施肥弹窗 -->
      <Transition name="panel-fade">
        <FarmBatchFertilizeDialog
          v-if="showBatchFertilize"
          :fertilizable-count="fertilizableCount"
          :fertilizers="fertilizerItems"
          @close="showBatchFertilize = false"
          @fertilize="doBatchFertilize"
        />
      </Transition>

      <!-- 图例与提示 -->
      <FarmPlotLegendPanel :legends="PLOT_LEGENDS" :warnings="plotWarnings" />

      <!-- 出货箱入口 -->
      <ShippingBoxEntry :box-item-kinds="shopStore.shippingBox.length" :total="shippingBoxTotal" @open="showShippingBox = true" />

      <!-- 出货箱弹窗 -->
      <Transition name="panel-fade">
        <ShippingBoxDialog
          v-if="showShippingBox"
          :active-filter="shippingFilter"
          :box-entries="shopStore.shippingBox"
          :calculate-sell-price="shopStore.calculateSellPrice"
          :filtered-items="filteredShippableItems"
          :filters="shippingFilters"
          :get-item-name="getItemName"
          :items="shippableItems"
          :sell-bonus-percent="shippingSellBonusPercent"
          :shipped-items="shopStore.shippedItems"
          :total="shippingBoxTotal"
          @close="showShippingBox = false"
          @filter="shippingFilter = $event"
          @add-item="handleAddToBox"
          @remove-item="handleRemoveFromBox"
        />
      </Transition>

      <!-- 温室入口 -->
      <GreenhouseEntry
        v-if="showGreenhouse"
        :harvestable-count="ghHarvestableCount"
        :plot-count="farmStore.greenhousePlots.length"
        @open="showGreenhouseModal = true"
      />
    </div>

    <!-- 林木标签 -->
    <div v-if="farmTab === 'tree'">
      <!-- 果树区 -->
      <FruitTreeSection
        :trees="farmStore.fruitTrees"
        :plantable-saplings="plantableSaplings"
        :get-tree-name="getTreeName"
        :get-fruit-season="getTreeFruitSeason"
        @plant="handlePlantTree"
        @chop="chopFruitTreeTarget = $event"
      />

      <!-- 砍伐果树确认弹窗 -->
      <Transition name="panel-fade">
        <FruitTreeChopConfirmDialog
          v-if="chopFruitTreeTarget"
          :target="chopFruitTreeTarget"
          :get-tree-name="getTreeName"
          @close="chopFruitTreeTarget = null"
          @confirm="confirmChopFruitTree"
        />
      </Transition>

      <!-- 野树伐木确认弹窗 -->
      <Transition name="panel-fade">
        <WildTreeChopConfirmDialog
          v-if="chopWildTreeTarget"
          :target="chopWildTreeTarget"
          :get-tree-name="getWildTreeName"
          @close="chopWildTreeTarget = null"
          @confirm="confirmChopWildTree"
        />
      </Transition>

      <!-- 野树区 -->
      <WildTreeSection
        :trees="farmStore.wildTrees"
        :plantable-wild-seeds="plantableWildSeeds"
        :has-tapper="hasTapper"
        :get-tree-name="getWildTreeName"
        :get-growth-days="getWildTreeGrowthDays"
        :get-tap-cycle-days="getWildTreeTapCycleDays"
        @plant="handlePlantWildTree"
        @collect="handleCollectTapProduct"
        @attach-tapper="handleAttachTapper"
        @chop="handleChopTree"
      />
    </div>

    <!-- 温室弹窗 -->
    <Transition name="panel-fade">
      <GreenhouseOverviewDialog
        v-if="showGreenhouseModal"
        :can-upgrade="!!nextGhUpgrade"
        :crop-stats="ghCropStats"
        :fertilizable-count="ghFertilizableCount"
        :harvestable-count="ghHarvestableCount"
        :has-fertilizer="fertilizerItems.length > 0"
        :planted-count="ghPlantedCount"
        :plot-count="farmStore.greenhousePlots.length"
        :seed-count="allSeeds.length"
        :state-stats="ghStateStats"
        :tilled-empty-count="ghTilledEmptyCount"
        @close="showGreenhouseModal = false"
        @batch-harvest="doGhBatchHarvest()"
        @open-batch-fertilize="showGhBatchFertilize = true"
        @open-batch-plant="showGhBatchPlant = true"
        @open-upgrade="showGhUpgradeModal = true"
        @select-plot="activeGhPlotId = $event"
      />
    </Transition>

    <!-- 温室升级确认弹窗 -->
    <Transition name="panel-fade">
      <GreenhouseUpgradeDialog
        v-if="showGhUpgradeModal && nextGhUpgrade"
        :upgrade="nextGhUpgrade"
        :can-afford-money="playerStore.money >= nextGhUpgrade.cost"
        :material-rows="ghUpgradeMaterialRows"
        @close="showGhUpgradeModal = false"
        @confirm="handleGhUpgrade"
      />
    </Transition>

    <!-- 温室一键种植弹窗 -->
    <Transition name="panel-fade">
      <GreenhouseBatchPlantDialog
        v-if="showGhBatchPlant"
        :seeds="allSeeds"
        :tilled-empty-count="ghTilledEmptyCount"
        @close="showGhBatchPlant = false"
        @plant="doGhBatchPlant"
      />
    </Transition>

    <Transition name="panel-fade">
      <FarmBatchFertilizeDialog
        v-if="showGhBatchFertilize"
        :fertilizable-count="ghFertilizableCount"
        :fertilizers="fertilizerItems"
        @close="showGhBatchFertilize = false"
        @fertilize="doGhBatchFertilize"
      />
    </Transition>

    <!-- 温室地块操作弹窗 -->
    <Transition name="panel-fade">
      <GreenhousePlotDialog
        v-if="activeGhPlot"
        :plot="activeGhPlot"
        :state-label="ghPlotStateLabel"
        :crop-name="activeGhPlot.cropId ? getCropName(activeGhPlot.cropId) : ''"
        :crop-growth-days="ghPlotCropGrowthDays"
        :crop-regrowth="ghPlotCropRegrowth"
        :crop-max-harvests="ghPlotCropMaxHarvests"
        :can-fertilize="canFertilizeGreenhouse"
        :fertilizer-name="ghPlotFertName"
        :fertilizers="fertilizerItems"
        :seeds="ghSeedOptions"
        :breeding-seeds="ghBreedingSeedOptions"
        :is-shop-open="isWanwupuOpen"
        :shop-closed-reason="wanwupuClosedReason"
        @close="activeGhPlotId = null"
        @plant="doGhPlant"
        @plant-breeding-seed="doGhPlantGeneticSeed"
        @go-to-shop="goToShop"
        @fertilize="doGhFertilize"
        @harvest="doGhHarvest"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import {
    Droplets,
    Droplet,
    CirclePlus,
    Shovel,
    Wheat,
    Sprout,
    Bug,
    Leaf,
    Star,
    Square,
    Flower2
  } from 'lucide-vue-next'
  import FarmBatchActionsDialog, { type FarmBatchAction } from '@/components/game/farm/FarmBatchActionsDialog.vue'
  import FarmBatchFertilizeDialog, { type FarmBatchFertilizerOption } from '@/components/game/farm/FarmBatchFertilizeDialog.vue'
  import FarmBatchPlantDialog, {
    type FarmBatchBreedingSeedGroup,
    type FarmBatchPlantSeedOption
  } from '@/components/game/farm/FarmBatchPlantDialog.vue'
  import FarmFieldHeader from '@/components/game/farm/FarmFieldHeader.vue'
  import FarmPlotDetailDialog from '@/components/game/farm/FarmPlotDetailDialog.vue'
  import FarmPlotGrid, { type FarmPlotDisplay } from '@/components/game/farm/FarmPlotGrid.vue'
  import FarmPlotLegendPanel, {
    type FarmPlotLegendItem,
    type FarmPlotWarningItem
  } from '@/components/game/farm/FarmPlotLegendPanel.vue'
  import FarmTabSwitcher, { type FarmTab } from '@/components/game/farm/FarmTabSwitcher.vue'
  import BatchProgressOverlay from '@/components/game/farm/BatchProgressOverlay.vue'
  import FruitTreeChopConfirmDialog, {
    type FruitTreeChopConfirmTarget
  } from '@/components/game/farm/FruitTreeChopConfirmDialog.vue'
  import FruitTreeSection from '@/components/game/farm/FruitTreeSection.vue'
  import GreenhouseBatchPlantDialog from '@/components/game/farm/GreenhouseBatchPlantDialog.vue'
  import GreenhouseEntry from '@/components/game/farm/GreenhouseEntry.vue'
  import GreenhouseOverviewDialog from '@/components/game/farm/GreenhouseOverviewDialog.vue'
  import GreenhousePlotDialog from '@/components/game/farm/GreenhousePlotDialog.vue'
  import GreenhouseUpgradeDialog from '@/components/game/farm/GreenhouseUpgradeDialog.vue'
  import LargeBatchConfirmDialog from '@/components/game/farm/LargeBatchConfirmDialog.vue'
  import ShippingBoxEntry from '@/components/game/farm/ShippingBoxEntry.vue'
  import ShippingBoxDialog from '@/components/game/farm/ShippingBoxDialog.vue'
  import WildTreeChopConfirmDialog, {
    type WildTreeChopConfirmTarget
  } from '@/components/game/farm/WildTreeChopConfirmDialog.vue'
  import WildTreeSection from '@/components/game/farm/WildTreeSection.vue'
  import { useBreedingStore } from '@/stores/useBreedingStore'
  import { useCookingStore } from '@/stores/useCookingStore'
  import { useFarmStore } from '@/stores/useFarmStore'
  import { useGameStore } from '@/stores/useGameStore'
  import { useHomeStore } from '@/stores/useHomeStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useShopStore } from '@/stores/useShopStore'
  import { useSkillStore } from '@/stores/useSkillStore'
  import { useTutorialStore } from '@/stores/useTutorialStore'
  import { useWalletStore } from '@/stores/useWalletStore'
  import { getCropById, getCropsBySeason, getItemById } from '@/data'
  import { getStarRating } from '@/data/breeding'
  import { GREENHOUSE_UPGRADES } from '@/data/buildings'
  import { FERTILIZERS, getFertilizerById } from '@/data/processing'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import { FARM_BATCH_LIMIT } from '@/domain/farm/batchLimits'
  import { getOfficialCropDefs } from '@/domain/mods/contentAccess'
  import { addLog, showFloat } from '@/composables/useGameLog'
  import { navigateToPanel } from '@/composables/useNavigation'
  import { handleEndDay } from '@/composables/useEndDay'
  import { useFarmSelection } from '@/composables/farm/useFarmSelection'
  import { useFarmBatchUi } from '@/composables/farm/useFarmBatchUi'
  import { useFarmPlotActions } from '@/composables/farm/useFarmPlotActions'
  import { useGreenhouseActions } from '@/composables/farm/useGreenhouseActions'
  import { useTreeActions } from '@/composables/farm/useTreeActions'
  import { useShippingBoxUi } from '@/composables/farm/useShippingBoxUi'
  import { useGreenhouseUi } from '@/composables/farm/useGreenhouseUi'
  import { getShopById, isShopAvailable, getShopClosedReason } from '@/data/shops'
  import {
    useFarmActions,
    handleBatchWater,
    handleBatchTill,
    handleBatchHarvest,
    handleBatchPlant,
    handleBatchFertilize,
    handleBatchCurePest,
    handleBatchClearWeed,
    QUALITY_NAMES,
    applyCropBlessing
  } from '@/composables/useFarmActions'
  import type { SprinklerType, FertilizerType, Quality } from '@/types'

  const { selectedSeed } = useFarmActions()

  const farmTab = ref<FarmTab>('field')

  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const gameStore = useGameStore()
  const homeStore = useHomeStore()
  const playerStore = usePlayerStore()
  const shopStore = useShopStore()
  const breedingStore = useBreedingStore()

  // === 田庄特殊功能 ===

  const tutorialStore = useTutorialStore()
  const tutorialHint = computed(() => {
    if (!tutorialStore.enabled || gameStore.year > 1) return null
    if (farmStore.plots.every(p => p.state === 'wasteland')) return '点击下方「一键操作」→「一键开垦」来开垦荒地，或直接点击地块逐一操作。'
    const hasPlanted = farmStore.plots.some(p => p.state === 'planted' || p.state === 'growing' || p.state === 'harvestable')
    if (!hasPlanted && farmStore.plots.some(p => p.state === 'tilled'))
      return '已开垦的地块可以种植作物。使用「一键种植」可批量播种背包中的种子。'
    if (farmStore.plots.some(p => (p.state === 'planted' || p.state === 'growing') && !p.watered) && !gameStore.isRainy)
      return '作物需要每天浇水才会生长。「一键浇水」可一次浇完所有作物。'
    if (farmStore.plots.some(p => p.state === 'harvestable')) return '金色高亮的地块表示作物已成熟，点击「一键收获」即可批量收获。'
    return null
  })

  const surfaceOreName = computed(() => {
    const patch = gameStore.surfaceOrePatch
    if (!patch) return ''
    return getItemById(patch.oreId)?.name ?? '矿石'
  })

  const handleCollectCreekCatch = () => {
    const catches = gameStore.creekCatch
    if (catches.length === 0) return
    const names: string[] = []
    const failed: typeof catches = []
    for (const c of catches) {
      const added = inventoryStore.addItem(c.fishId, 1, c.quality)
      if (added) {
        const fishDef = getItemById(c.fishId)
        if (fishDef) names.push(fishDef.name)
      } else {
        failed.push(c)
      }
    }
    gameStore.creekCatch = failed
    if (names.length > 0) {
      addLog(`收取了溪流鱼获：${names.join('、')}。`)
    }
    if (failed.length > 0) {
      addLog('背包已满，部分鱼获未能收取。')
    }
  }

  const handleMineSurfaceOre = () => {
    const patch = gameStore.surfaceOrePatch
    if (!patch) return
    if (!playerStore.consumeStamina(5)) {
      addLog('体力不足，无法开采。')
      return
    }
    const added = inventoryStore.addItem(patch.oreId, patch.quantity)
    if (!added) {
      playerStore.restoreStamina(5)
      addLog('背包已满，无法开采。')
      return
    }
    const oreName = getItemById(patch.oreId)?.name ?? '矿石'
    const skillStore = useSkillStore()
    skillStore.addExp('mining', 8)
    gameStore.surfaceOrePatch = null
    addLog(`开采了地表矿脉，获得了${patch.quantity}个${oreName}。(+8挖矿经验)`)
    const tr = gameStore.advanceTime(1)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  }

  // === 出货箱 ===

  const {
    filteredShippableItems,
    shippingFilter,
    shippingFilters,
    shippableItems,
    showShippingBox
  } = useShippingBoxUi({
    inventoryItems: () => inventoryStore.items,
    getItemById
  })
  const chopFruitTreeTarget = ref<FruitTreeChopConfirmTarget | null>(null)
  const chopWildTreeTarget = ref<WildTreeChopConfirmTarget | null>(null)
  const {
    activeBatchProgress,
    cancelActiveBatch,
    cancelLargeBatch,
    closeBatchActionsIfDone,
    closeBatchDialogs,
    confirmLargeBatch,
    pendingLargeBatch,
    returnToBatchActionsIfAvailable,
    runChunkedBatch,
    runWithLargeBatchConfirm,
    showBatchActions,
    showBatchFertilize,
    showBatchPlant
  } = useFarmBatchUi()

  const goToShop = () => {
    if (!isWanwupuOpen.value) {
      showFloat(wanwupuClosedReason.value, 'danger')
      return
    }
    activePlotId.value = null
    activeGhPlotId.value = null
    closeBatchDialogs()
    closeGreenhouseDialogs()
    navigateToPanel('shop')
  }

  const wanwupu = getShopById('wanwupu')!

  const isWanwupuOpen = computed(() => {
    return isShopAvailable(wanwupu, gameStore.day, gameStore.hour, gameStore.weather, gameStore.season)
  })

  const wanwupuClosedReason = computed(() => {
    return '万物铺' + getShopClosedReason(wanwupu, gameStore.day, gameStore.hour, gameStore.weather, gameStore.season)
  })

  const getItemName = (itemId: string): string => getItemById(itemId)?.name ?? itemId

  const shippingBoxTotal = computed(() => {
    return shopStore.shippingBox.reduce((sum, entry) => sum + shopStore.calculateSellPrice(entry.itemId, entry.quantity, entry.quality), 0)
  })

  const shippingSellBonusPercent = computed(() => Math.round(inventoryStore.getRingEffectValue('sell_price_bonus') * 100))

  const handleAddToBox = (itemId: string, quantity: number, quality: Quality) => {
    if (shopStore.addToShippingBox(itemId, quantity, quality)) {
      const name = getItemName(itemId)
      addLog(`将${name}×${quantity}放入了出货箱。`)
    }
  }

  const handleRemoveFromBox = (itemId: string, quantity: number, quality: Quality) => {
    if (shopStore.removeFromShippingBox(itemId, quantity, quality)) {
      const name = getItemName(itemId)
      addLog(`从出货箱取出了${name}×${quantity}。`)
    }
  }

  // === 地块弹窗状态 ===

  const {
    activeGhPlot,
    activeGhPlotId,
    activePlot,
    activePlotId,
    canFertilize,
    canFertilizeGreenhouse,
    canWater,
    ghPlotCropGrowthDays,
    ghPlotCropMaxHarvests,
    ghPlotCropRegrowth,
    ghPlotFertName,
    ghPlotStateLabel,
    plotCropGrowthDays,
    plotCropMaxHarvests,
    plotCropRegrowth,
    plotFertName,
    plotStateLabel
  } = useFarmSelection({
    plots: () => farmStore.plots,
    greenhousePlots: () => farmStore.greenhousePlots,
    getCropById,
    getFertilizerById,
    cropGrowthBonus: () => useWalletStore().getCropGrowthBonus()
  })

  // === 背包物品列表 ===

  const sprinklerItems = computed(() => {
    const types: { type: SprinklerType; itemId: string; name: string; colorClass: string }[] = [
      { type: 'bamboo_sprinkler', itemId: 'bamboo_sprinkler', name: '竹筒洒水器', colorClass: '' },
      { type: 'copper_sprinkler', itemId: 'copper_sprinkler', name: '铜管洒水器', colorClass: 'text-quality-fine' },
      { type: 'gold_sprinkler', itemId: 'gold_sprinkler', name: '金管洒水器', colorClass: 'text-quality-supreme' }
    ]
    return types.map(s => ({ ...s, count: inventoryStore.getItemCount(s.itemId) })).filter(s => s.count > 0)
  })

  const fertilizerItems = computed<FarmBatchFertilizerOption[]>(() => {
    return FERTILIZERS.map(f => ({
      type: f.id as FertilizerType,
      itemId: f.id,
      name: f.name,
      count: inventoryStore.getItemCount(f.id),
      colorClass: itemValueColor(f.shopPrice ?? 0)
    })).filter(f => f.count > 0)
  })

  const QUALITY_ORDER: Quality[] = ['normal', 'fine', 'excellent', 'supreme']

  const plantableSeeds = computed<FarmBatchPlantSeedOption[]>(() => {
    const result: FarmBatchPlantSeedOption[] = []
    for (const crop of getCropsBySeason(gameStore.season)) {
      for (const q of QUALITY_ORDER) {
        const count = inventoryStore.getItemCount(crop.seedId, q)
        if (count > 0) {
          result.push({
            cropId: crop.id,
            name: crop.name,
            quality: q,
            count,
            colorClass: cropValueColor(crop.sellPrice),
            regrowth: crop.regrowth ?? false
          })
        }
      }
    }
    return result
  })

  /** 当季可种的育种种子 */
  const plantableBreedingSeeds = computed(() => {
    const season = gameStore.season
    return breedingStore.breedingBox.filter(seed => {
      const crop = getCropById(seed.genetics.cropId)
      if (!crop) return false
      return crop.season.includes(season)
    })
  })

  /** 根据作物售价返回品质颜色 */
  const cropValueColor = (sellPrice: number): string => {
    if (sellPrice >= 180) return 'text-quality-supreme'
    if (sellPrice >= 100) return 'text-quality-excellent'
    if (sellPrice >= 60) return 'text-quality-fine'
    return ''
  }

  /** 根据道具价格返回品质颜色 */
  const itemValueColor = (price: number): string => {
    if (price >= 100) return 'text-quality-supreme'
    if (price >= 75) return 'text-quality-excellent'
    if (price >= 40) return 'text-quality-fine'
    return ''
  }

  // === 地块显示 ===

  const getCropName = (cropId: string): string => {
    const crop = getCropById(cropId)
    return crop?.name ?? cropId
  }

  const {
    doClearWeed,
    doCurePest,
    doFertilize,
    doHarvest,
    doPlaceSprinkler,
    doPlant,
    doPlantGeneticSeed,
    doRemoveCrop,
    doRemoveSprinkler,
    doTill,
    doWater
  } = useFarmPlotActions({
    activePlotId,
    selectedSeed,
    plots: () => farmStore.plots,
    breedingSeeds: () => breedingStore.breedingBox,
    getCropName,
    plantGeneticSeed: farmStore.plantGeneticSeed,
    removeBreedingSeed: breedingStore.removeFromBox,
    advanceTime: gameStore.advanceTime,
    addItem: inventoryStore.addItem,
    removeItem: inventoryStore.removeItem,
    applyFertilizer: farmStore.applyFertilizer,
    placeSprinkler: farmStore.placeSprinkler,
    removeSprinkler: farmStore.removeSprinkler,
    harvestGiantCrop: farmStore.harvestGiantCrop
  })

  const hasSprinkler = (plotId: number): boolean => {
    return farmStore.sprinklers.some(s => s.plotId === plotId)
  }

  /** 洒水器覆盖范围（含放置洒水器的地块自身） */
  const sprinklerCoverage = computed(() => farmStore.getAllWateredBySprinklers())

  const isSprinklerCovered = (plotId: number): boolean => sprinklerCoverage.value.has(plotId)

  const needsWater = (plot: (typeof farmStore.plots)[number]): boolean => {
    return (plot.state === 'planted' || plot.state === 'growing') && !plot.watered && !sprinklerCoverage.value.has(plot.id)
  }

  const unwateredCount = computed(() => farmStore.plots.filter(needsWater).length)
  const wastelandCount = computed(() => farmStore.plots.filter(p => p.state === 'wasteland').length)
  const harvestableCount = computed(() => farmStore.plots.filter(p => p.state === 'harvestable').length)
  const tilledEmptyCount = computed(() => farmStore.plots.filter(p => p.state === 'tilled').length)
  const fertilizableCount = computed(() => farmStore.plots.filter(p => p.state !== 'wasteland' && !p.fertilizer).length)
  const infestedCount = computed(() => farmStore.plots.filter(p => p.infested).length)
  const weedyCount = computed(() => farmStore.plots.filter(p => p.weedy).length)

  const PLOT_LEGENDS: FarmPlotLegendItem[] = [
    { icon: Shovel, color: 'text-muted', label: '荒地' },
    { icon: Square, color: 'text-earth', label: '已耕' },
    { icon: Sprout, color: 'text-success/60', label: '已种' },
    { icon: Flower2, color: 'text-success', label: '生长中' },
    { icon: Droplets, color: 'text-water', label: '已浇水' },
    { icon: Wheat, color: 'text-accent', label: '可收获' },
    { icon: Star, color: 'text-accent', label: '巨型' },
    { icon: Droplet, color: 'text-water', label: '洒水器' },
    { icon: CirclePlus, color: 'text-success', label: '肥料' },
    { icon: Droplets, color: 'text-danger', label: '需浇水' },
    { icon: Bug, color: 'text-danger', label: '虫害' },
    { icon: Leaf, color: 'text-success', label: '杂草' }
  ]

  const plotWarnings = computed(() => {
    const list: FarmPlotWarningItem[] = []
    if (unwateredCount.value > 0) list.push({ color: 'text-danger', text: `还有${unwateredCount.value}块需浇水` })
    if (infestedCount.value > 0) list.push({ color: 'text-danger', text: `有${infestedCount.value}块虫害` })
    if (weedyCount.value > 0) list.push({ color: 'text-success', text: `有${weedyCount.value}块杂草` })
    return list
  })

  const hasAvailableBatchAction = computed(() => {
    return (
      unwateredCount.value > 0 ||
      wastelandCount.value > 0 ||
      harvestableCount.value > 0 ||
      (tilledEmptyCount.value > 0 && (plantableSeeds.value.length > 0 || plantableBreedingSeeds.value.length > 0)) ||
      (fertilizableCount.value > 0 && fertilizerItems.value.length > 0) ||
      infestedCount.value > 0 ||
      weedyCount.value > 0
    )
  })

  const doBatchAction = (action: FarmBatchAction) => {
    const runAndRefresh = async (run: () => Promise<void>) => {
      await run()
      await closeBatchActionsIfDone(() => hasAvailableBatchAction.value)
    }

    if (action === 'water') {
      runWithLargeBatchConfirm('一键浇水', unwateredCount.value, () =>
        runAndRefresh(() => handleBatchWater(runChunkedBatch))
      )
      return
    }
    else if (action === 'till') {
      runWithLargeBatchConfirm('一键开垦', wastelandCount.value, () =>
        runAndRefresh(() => handleBatchTill(runChunkedBatch))
      )
      return
    }
    else if (action === 'harvest') {
      runWithLargeBatchConfirm('一键收获', harvestableCount.value, () =>
        runAndRefresh(() => handleBatchHarvest(runChunkedBatch))
      )
      return
    }
    else if (action === 'plant') {
      showBatchActions.value = false
      showBatchPlant.value = true
      return
    }
    else if (action === 'fertilize') {
      showBatchActions.value = false
      showBatchFertilize.value = true
      return
    }
    else if (action === 'curePest') {
      runWithLargeBatchConfirm('一键除虫', infestedCount.value, () =>
        runAndRefresh(() => handleBatchCurePest(runChunkedBatch))
      )
      return
    }
    else if (action === 'clearWeed') {
      runWithLargeBatchConfirm('一键除草', weedyCount.value, () =>
        runAndRefresh(() => handleBatchClearWeed(runChunkedBatch))
      )
      return
    }
  }

  /** 按cropId分组的当季育种种子（用于一键种植弹窗） */
  const batchBreedingSeedGroups = computed<FarmBatchBreedingSeedGroup[]>(() => {
    const groups: Record<string, FarmBatchBreedingSeedGroup> = {}
    for (const seed of plantableBreedingSeeds.value) {
      const cid = seed.genetics.cropId
      if (!groups[cid]) {
        groups[cid] = { cropId: cid, name: getCropName(cid), count: 0, minGen: seed.genetics.generation, maxGen: seed.genetics.generation }
      }
      groups[cid]!.count++
      if (seed.genetics.generation < groups[cid]!.minGen) groups[cid]!.minGen = seed.genetics.generation
      if (seed.genetics.generation > groups[cid]!.maxGen) groups[cid]!.maxGen = seed.genetics.generation
    }
    return Object.values(groups)
  })

  const doBatchPlant = (cropId: string, quality: Quality) => {
    const crop = getCropById(cropId)
    const seedCount = crop ? inventoryStore.getItemCount(crop.seedId, quality) : 0
    const total = Math.min(tilledEmptyCount.value, seedCount)
    runWithLargeBatchConfirm('一键种植', total, async () => {
      await handleBatchPlant(cropId, runChunkedBatch, quality)
      await returnToBatchActionsIfAvailable(() => hasAvailableBatchAction.value)
    })
  }

  const doBatchPlantBreeding = async (cropId: string, confirmed = false) => {
    const skillStore = useSkillStore()
    const cookingStore = useCookingStore()
    const targets = farmStore.plots.filter(p => p.state === 'tilled')
    const seeds = plantableBreedingSeeds.value.filter(s => s.genetics.cropId === cropId)
    const plantRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
    const plantRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
    const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
    const cost = Math.max(
      1,
      Math.floor(
        3 *
          inventoryStore.getToolStaminaMultiplier('hoe') *
          (1 - skillStore.getStaminaReduction('farming')) *
          (1 - farmingBuff) *
          (1 - plantRingFarmReduction) *
          (1 - plantRingGlobalReduction)
      )
    )
    const targetCount = Math.min(targets.length, seeds.length, Math.floor(playerStore.stamina / cost))
    if (!confirmed) {
      runWithLargeBatchConfirm('一键种植育种种子', targetCount, () => doBatchPlantBreeding(cropId, true))
      return
    }
    if (targetCount <= 0) {
      addLog(targets.length === 0 ? '没有可种植的空耕地。' : '体力不足，无法种植。')
      await returnToBatchActionsIfAvailable(() => hasAvailableBatchAction.value)
      return
    }

    let planted = 0
    const batchResult = await runChunkedBatch({
      label: `一键种植育种种子：${getCropName(cropId)}`,
      total: targetCount,
      chunkSize: FARM_BATCH_LIMIT,
      processChunk: (start, end) => {
        let completed = 0
        for (let index = start; index < end; index++) {
          const seed = seeds[index]!
          if (!playerStore.consumeStamina(cost)) break
          if (!farmStore.plantGeneticSeed(targets[index]!.id, seed.genetics)) {
            playerStore.restoreStamina(cost)
            break
          }
          breedingStore.removeFromBox(seed.genetics.id)
          planted++
          completed++
        }
        return completed
      }
    })
    if (planted > 0) {
      let message = `一键种植了${planted}株育种种子（${getCropName(cropId)}）。(-${planted * cost}体力)`
      if (batchResult.cancelled && batchResult.total > batchResult.processed) {
        message += ` 操作已取消，剩余${batchResult.total - batchResult.processed}株未处理。`
      }
      addLog(message)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plant * planted)
      if (tr.message) addLog(tr.message)
    } else {
      addLog('体力不足，无法种植。')
    }
    await returnToBatchActionsIfAvailable(() => hasAvailableBatchAction.value)
  }
  const doBatchFertilize = (type: FertilizerType) => {
    const total = Math.min(fertilizableCount.value, inventoryStore.getItemCount(type))
    runWithLargeBatchConfirm('一键施肥', total, async () => {
      await handleBatchFertilize(type, runChunkedBatch)
      await returnToBatchActionsIfAvailable(() => hasAvailableBatchAction.value)
    })
  }

  const getPlotDisplay = (plot: (typeof farmStore.plots)[number]): FarmPlotDisplay => {
    // 巨型作物特殊显示（仅在已成熟时才显示巨型图标）
    if (plot.giantCropGroup !== null && plot.state === 'harvestable') {
      return { icon: Star, color: 'text-accent', bg: 'bg-accent/10' }
    }
    // 虫害显示
    if (plot.infested) {
      return { icon: Bug, color: 'text-danger', bg: 'bg-danger/10' }
    }
    // 杂草显示
    if (plot.weedy) {
      return { icon: Leaf, color: 'text-success/70', bg: 'bg-success/10' }
    }
    switch (plot.state) {
      case 'wasteland':
        return { icon: Shovel, color: 'text-muted', bg: 'bg-panel/40' }
      case 'tilled':
        return { icon: Square, color: 'text-earth', bg: 'bg-earth/8' }
      case 'planted':
        return {
          icon: plot.watered ? Droplets : Sprout,
          color: plot.watered ? 'text-water' : 'text-success/60',
          bg: plot.watered ? 'bg-water/8' : 'bg-success/5'
        }
      case 'growing': {
        const crop = getCropById(plot.cropId!)
        const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
        const speedup = (fertDef?.growthSpeedup ?? 0) + useWalletStore().getCropGrowthBonus()
        const effectiveDays = crop ? (speedup > 0 ? Math.max(1, Math.floor(crop.growthDays * (1 - speedup))) : crop.growthDays) : 1
        const progress = crop ? Math.floor((plot.growthDays / effectiveDays) * 100) : 0
        return {
          icon: plot.watered ? Droplets : Leaf,
          color: plot.watered ? 'text-water' : progress > 60 ? 'text-success' : 'text-success/80',
          bg: plot.watered ? 'bg-water/8' : 'bg-success/8'
        }
      }
      case 'harvestable':
        return { icon: Wheat, color: 'text-accent', bg: 'bg-accent/15' }
      default:
        return { icon: Square, color: 'text-muted', bg: 'bg-panel/40' }
    }
  }

  const getPlotTooltip = (plot: (typeof farmStore.plots)[number]): string => {
    let tip = ''
    if (plot.state === 'wasteland') tip = '荒地（点击开垦）'
    else if (plot.state === 'tilled') tip = '已耕地（点击播种）'
    else if (plot.state === 'harvestable') {
      const crop = getCropById(plot.cropId!)
      tip = `${crop?.name ?? ''}已成熟（点击收获）`
    } else if (plot.state === 'planted' || plot.state === 'growing') {
      const crop = getCropById(plot.cropId!)
      const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
      const speedup = (fertDef?.growthSpeedup ?? 0) + useWalletStore().getCropGrowthBonus()
      const effectiveDays = crop ? (speedup > 0 ? Math.max(1, Math.floor(crop.growthDays * (1 - speedup))) : crop.growthDays) : '?'
      tip = `${crop?.name ?? ''} ${plot.growthDays}/${effectiveDays}天 ${plot.watered ? '已浇水' : '需浇水'}`
    }
    if (hasSprinkler(plot.id)) tip += ' [洒水器]'
    if (plot.fertilizer) {
      const fertDef = getFertilizerById(plot.fertilizer)
      tip += ` [${fertDef?.name ?? plot.fertilizer}]`
    }
    if (plot.infested) tip += ` [虫害${plot.infestedDays}天]`
    if (plot.weedy) tip += ` [杂草${plot.weedyDays}天]`
    return tip
  }

  const {
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
    hasTapper,
    plantableSaplings,
    plantableWildSeeds
  } = useTreeActions({
    chopFruitTreeTarget,
    chopWildTreeTarget,
    wildTrees: () => farmStore.wildTrees,
    hasItem: inventoryStore.hasItem,
    getItemCount: itemId => inventoryStore.getItemCount(itemId),
    addItem: inventoryStore.addItem,
    removeItem: inventoryStore.removeItem,
    isToolAvailable: inventoryStore.isToolAvailable,
    getToolStaminaMultiplier: inventoryStore.getToolStaminaMultiplier,
    isPastBedtime: () => gameStore.isPastBedtime,
    advanceTime: gameStore.advanceTime,
    consumeStamina: playerStore.consumeStamina,
    getStaminaReduction: skillId => useSkillStore().getStaminaReduction(skillId),
    hasLumberjackBonus: () => {
      const skillStore = useSkillStore()
      return skillStore.getSkill('foraging').perk5 === 'lumberjack' || skillStore.getSkill('foraging').perk10 === 'forester'
    },
    plantFruitTree: farmStore.plantFruitTree,
    removeFruitTree: farmStore.removeFruitTree,
    plantWildTree: farmStore.plantWildTree,
    attachTapper: farmStore.attachTapper,
    collectTapProduct: farmStore.collectTapProduct,
    chopWildTree: farmStore.chopWildTree
  })

  // === 温室 ===

  const greenhouseCrops = getOfficialCropDefs()

  const {
    allSeeds,
    closeGreenhouseDialogs,
    ghBreedingSeedOptions,
    ghCropStats,
    ghFertilizableCount,
    ghHarvestableCount,
    ghPlantedCount,
    ghSeedOptions,
    ghStateStats,
    ghTilledEmptyCount,
    ghUpgradeMaterialRows,
    nextGhUpgrade,
    showGhBatchFertilize,
    showGhBatchPlant,
    showGhUpgradeModal,
    showGreenhouse,
    showGreenhouseModal
  } = useGreenhouseUi({
    breedingSeeds: () => breedingStore.breedingBox.map(seed => ({
      cropId: seed.genetics.cropId,
      genetics: seed.genetics
    })),
    crops: () => greenhouseCrops,
    cropGrowthBonus: () => useWalletStore().getCropGrowthBonus(),
    getCropById,
    getFertilizerById,
    getItemCount: itemId => inventoryStore.getItemCount(itemId),
    getItemName,
    getStarRating,
    greenhouseLevel: () => farmStore.greenhouseLevel,
    greenhousePlots: () => farmStore.greenhousePlots,
    greenhouseUnlocked: () => homeStore.greenhouseUnlocked,
    upgrades: GREENHOUSE_UPGRADES
  })

  const {
    doGhBatchFertilize,
    doGhBatchHarvest,
    doGhBatchPlant,
    doGhFertilize,
    doGhHarvest,
    doGhPlant,
    doGhPlantGeneticSeed,
    handleGhUpgrade
  } = useGreenhouseActions({
    activeGhPlotId,
    ghTilledEmptyCount: () => ghTilledEmptyCount.value,
    nextGhUpgrade: () => nextGhUpgrade.value,
    showGhBatchFertilize,
    showGhBatchPlant,
    showGhUpgradeModal,
    greenhousePlots: () => farmStore.greenhousePlots,
    breedingSeeds: () => breedingStore.breedingBox,
    getCropById,
    getCropName,
    getItemCount: itemId => inventoryStore.getItemCount(itemId),
    removeItem: inventoryStore.removeItem,
    addItem: inventoryStore.addItem,
    consumeStamina: playerStore.consumeStamina,
    stamina: () => playerStore.stamina,
    earnMoney: playerStore.earnMoney,
    spendMoney: playerStore.spendMoney,
    greenhousePlantCrop: farmStore.greenhousePlantCrop,
    greenhousePlantGeneticSeed: farmStore.greenhousePlantGeneticSeed,
    greenhouseHarvestPlot: farmStore.greenhouseHarvestPlot,
    applyGreenhouseFertilizer: farmStore.applyGreenhouseFertilizer,
    upgradeGreenhouse: farmStore.upgradeGreenhouse,
    removeBreedingSeed: breedingStore.removeFromBox,
    addBreedingSeed: breedingStore.addToBox,
    recordHybridGrown: breedingStore.recordHybridGrown,
    rollCropQuality: () => useSkillStore().rollCropQualityWithBonus(0),
    applyCropBlessing,
    runWithLargeBatchConfirm,
    runChunkedBatch
  })
</script>
