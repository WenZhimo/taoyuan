<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">地块 #{{ plot.id + 1 }}</p>
      <p class="text-xs text-muted mb-2">
        {{ stateLabel }}
        <template v-if="plot.giantCropGroup !== null">（巨型）</template>
        <template v-if="plot.cropId">
          · {{ plot.giantCropGroup !== null ? '巨型' : '' }}{{ cropName }}
          <span v-if="cropRegrowth" class="text-success">[多茬 {{ plot.harvestCount }}/{{ cropMaxHarvests }}]</span>
        </template>
        <template v-if="plot.cropId && plot.giantCropGroup === null">
          ·
          <span :class="plot.watered ? 'text-water' : 'text-danger'">{{ plot.watered ? '已浇水' : '未浇水' }}</span>
        </template>
        <template v-if="plot.fertilizer">
          ·
          <span class="text-success">{{ fertilizerName }}</span>
        </template>
        <template v-if="hasSprinkler">
          ·
          <span class="text-water">洒水器</span>
        </template>
        <template v-if="plot.infested">
          ·
          <span class="text-danger">虫害({{ plot.infestedDays }}天)</span>
        </template>
        <template v-if="plot.weedy">
          ·
          <span class="text-success">杂草({{ plot.weedyDays }}天)</span>
        </template>
      </p>

      <div v-if="plot.cropId && plot.state !== 'harvestable'" class="flex items-center space-x-2 mb-2">
        <span class="text-xs text-muted shrink-0">生长</span>
        <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
          <div class="h-full rounded-xs bg-success transition-all" :style="{ width: growthProgressPercent + '%' }" />
        </div>
        <span class="text-xs text-muted whitespace-nowrap">{{ Number(plot.growthDays.toFixed(2)) }}/{{ cropGrowthDays }}天</span>
      </div>
      <p v-if="plot.giantCropGroup !== null" class="text-xs text-accent mb-2">收获可获得大量作物！</p>

      <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
        <Button v-if="plot.state === 'wasteland'" class="w-full justify-center shrink-0" :icon-size="12" :icon="Shovel" @click="$emit('till')">
          开垦
        </Button>
        <Button v-if="canWater" class="w-full justify-center shrink-0" :icon-size="12" :icon="Droplets" @click="$emit('water')">
          浇水
        </Button>
        <Button
          v-if="plot.infested"
          class="w-full justify-center shrink-0 !bg-danger !text-text"
          :icon-size="12"
          :icon="Bug"
          @click="$emit('cure-pest')"
        >
          除虫
        </Button>
        <Button
          v-if="plot.weedy"
          class="w-full justify-center shrink-0 !bg-success !text-bg"
          :icon-size="12"
          :icon="Leaf"
          @click="$emit('clear-weed')"
        >
          除草
        </Button>
        <Button
          v-if="plot.state === 'harvestable'"
          class="w-full justify-center shrink-0 !bg-accent !text-bg"
          :icon-size="12"
          :icon="Wheat"
          @click="$emit('harvest')"
        >
          收获
        </Button>
        <Button v-if="hasCrop" class="w-full justify-center shrink-0" :icon-size="12" :icon="Trash2" @click="$emit('remove-crop')">
          铲除
        </Button>

        <template v-if="plot.state === 'tilled' && groupedSeeds.length > 0">
          <Divider label="种植" />
          <div
            v-for="seed in groupedSeeds"
            :key="seed.itemId"
            class="btn text-xs justify-between mr-1 shrink-0"
          >
            <span>
              {{ seed.option.name }}
              <span v-if="seed.option.regrowth" class="text-success ml-1">[多茬]</span>
            </span>
            <QualityQuantityBreakdown
              :entries="seed.qualities"
              :interactive="true"
              :aria-label="`${seed.option.name}种子的各品质数量`"
              @select-quality="quality => $emit('plant', seed.itemId, quality)"
            />
          </div>
        </template>

        <template v-if="plot.state === 'tilled' && breedingSeeds.length > 0">
          <Divider label="育种种子" class="!my-2" />
          <button
            v-for="seed in breedingSeeds"
            :key="seed.genetics.id"
            class="btn text-xs justify-between mr-1 shrink-0"
            @click="$emit('plant-breeding-seed', seed.genetics.id)"
          >
            <span>{{ getCropName(seed.genetics.cropId) }} G{{ seed.genetics.generation }}</span>
            <span class="text-muted flex items-center space-x-px">
              <Star v-for="n in getBreedingStarRating(seed.genetics)" :key="n" :size="10" />
            </span>
          </button>
        </template>

        <div v-if="plot.state === 'tilled' && seeds.length === 0 && breedingSeeds.length === 0" class="flex flex-col items-center py-4">
          <Sprout :size="32" class="text-muted/30" />
          <p class="text-xs text-muted mt-2">背包中没有当季可种植的种子</p>
          <Button v-if="isShopOpen" class="mt-2" :icon-size="12" :icon="Store" @click="$emit('go-to-shop')">前往商店购买</Button>
          <p v-else class="text-[10px] text-muted/60 mt-1">{{ shopClosedReason }}</p>
        </div>

        <template v-if="canFertilize && fertilizers.length > 0">
          <Divider label="施肥" />
          <button
            v-for="fertilizer in fertilizers"
            :key="fertilizer.itemId"
            class="btn text-xs justify-between mr-1 shrink-0"
            @click="$emit('fertilize', fertilizer.type)"
          >
            <span :class="fertilizer.colorClass">{{ fertilizer.name }}</span>
            <span class="text-muted">×{{ fertilizer.count }}</span>
          </button>
        </template>

        <template v-if="!hasSprinkler && sprinklers.length > 0">
          <Divider label="洒水器" />
          <button
            v-for="sprinkler in sprinklers"
            :key="sprinkler.itemId"
            class="btn text-xs justify-between mr-1 shrink-0"
            @click="$emit('place-sprinkler', sprinkler.type)"
          >
            <span :class="sprinkler.colorClass">{{ sprinkler.name }}</span>
            <span class="text-muted">×{{ sprinkler.count }}</span>
          </button>
        </template>
        <Button v-if="hasSprinkler" class="mr-1 justify-center shrink-0" @click="$emit('remove-sprinkler')">拆除洒水器</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Bug, Droplets, Leaf, Shovel, Sprout, Star, Store, Trash2, Wheat, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import QualityQuantityBreakdown from '@/components/game/inventory/QualityQuantityBreakdown.vue'
  import type { FarmBatchFertilizerOption } from '@/components/game/farm/FarmBatchFertilizeDialog.vue'
  import type { FarmBatchPlantSeedOption } from '@/components/game/farm/FarmBatchPlantDialog.vue'
  import { groupInventoryItemsByQuality } from '@/domain/inventory/qualityGroups'
  import type { BreedingSeed, SeedGenetics } from '@/types/breeding'
  import type { FarmPlot, FertilizerType, InventoryItem, Quality, SprinklerType } from '@/types'

  export interface FarmPlotSprinklerOption {
    type: SprinklerType
    itemId: string
    name: string
    colorClass: string
    count: number
  }

  interface GroupableSeed extends InventoryItem {
    option: FarmBatchPlantSeedOption
  }

  const props = defineProps<{
    breedingSeeds: BreedingSeed[]
    canFertilize: boolean
    canWater: boolean
    cropGrowthDays: number | string
    cropMaxHarvests: number
    cropName: string
    cropRegrowth: boolean
    fertilizerName: string
    fertilizers: FarmBatchFertilizerOption[]
    getBreedingStarRating: (genetics: SeedGenetics) => number
    getCropName: (cropId: string) => string
    hasSprinkler: boolean
    isShopOpen: boolean
    plot: FarmPlot
    qualityNames: Record<Quality, string>
    seeds: FarmBatchPlantSeedOption[]
    shopClosedReason: string
    sprinklers: FarmPlotSprinklerOption[]
    stateLabel: string
  }>()

  defineEmits<{
    close: []
    till: []
    water: []
    'cure-pest': []
    'clear-weed': []
    harvest: []
    'remove-crop': []
    plant: [cropId: string, quality: Quality]
    'plant-breeding-seed': [seedId: string]
    'go-to-shop': []
    fertilize: [fertilizerType: FertilizerType]
    'place-sprinkler': [sprinklerType: SprinklerType]
    'remove-sprinkler': []
  }>()

  const growthProgressPercent = computed(() => Math.min(100, Math.floor((props.plot.growthDays / (Number(props.cropGrowthDays) || 1)) * 100)))
  const hasCrop = computed(() => props.plot.state === 'planted' || props.plot.state === 'growing' || props.plot.state === 'harvestable')
  const groupedSeeds = computed(() =>
    groupInventoryItemsByQuality<GroupableSeed>(
      props.seeds.map(seed => ({
        itemId: seed.cropId,
        quality: seed.quality,
        quantity: seed.count,
        option: seed
      }))
    ).map(group => ({
      ...group,
      option: group.qualities[0]!.items[0]!.option
    }))
  )
</script>
