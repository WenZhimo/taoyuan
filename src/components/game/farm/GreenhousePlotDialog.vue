<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">温室地块 #{{ plot.id + 1 }}</p>

      <div class="border border-accent/10 rounded-xs p-2 mb-2">
        <div class="flex flex-col space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">状态</span>
            <span class="text-xs">{{ stateLabel }}</span>
          </div>
          <div v-if="plot.cropId" class="flex items-center justify-between">
            <span class="text-xs text-muted">作物</span>
            <span class="text-xs">
              {{ cropName }}
              <span v-if="cropRegrowth" class="text-success ml-1">[多茬 {{ plot.harvestCount }}/{{ cropMaxHarvests }}]</span>
            </span>
          </div>
          <div v-if="plot.cropId && plot.state !== 'harvestable'" class="flex items-center space-x-2">
            <span class="text-xs text-muted shrink-0">生长</span>
            <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
              <div class="h-full rounded-xs bg-success transition-all" :style="{ width: growthProgressPercent + '%' }" />
            </div>
            <span class="text-xs text-muted whitespace-nowrap">{{ plot.growthDays }}/{{ cropGrowthDays }}天</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">特性</span>
            <span class="text-xs text-water">自动浇水 · 无季节限制</span>
          </div>
          <div v-if="plot.seedGenetics" class="flex items-center justify-between">
            <span class="text-xs text-muted">育种</span>
            <span class="text-xs text-accent">
              G{{ plot.seedGenetics.generation }} 甜{{ plot.seedGenetics.sweetness }} 产{{ plot.seedGenetics.yield }} 抗{{ plot.seedGenetics.resistance }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col space-y-1.5">
        <div v-if="plot.state === 'tilled' && seeds.length > 0" class="border border-accent/10 rounded-xs p-2">
          <p class="text-xs text-muted mb-1">种植</p>
          <div class="flex flex-wrap space-x-1">
            <Button v-for="seed in seeds" :key="seed.cropId" @click="$emit('plant', seed.cropId)">
              {{ seed.name }}
              <span v-if="seed.regrowth" class="text-success ml-1">[多茬]</span>
              (×{{ seed.count }})
            </Button>
          </div>
        </div>

        <template v-if="plot.state === 'tilled' && breedingSeeds.length > 0">
          <Divider label="育种种子" class="!my-2" />
          <button
            v-for="seed in breedingSeeds"
            :key="seed.id"
            class="btn text-xs justify-between mr-1 shrink-0"
            @click="$emit('plant-breeding-seed', seed.id)"
          >
            <span>{{ seed.cropName }} G{{ seed.generation }}</span>
            <span class="text-muted flex items-center space-x-px">
              <Star v-for="n in seed.starRating" :key="n" data-testid="breeding-star" :size="10" />
            </span>
          </button>
        </template>

        <div v-else-if="plot.state === 'tilled' && seeds.length === 0" class="flex flex-col items-center py-4">
          <Sprout :size="32" class="text-muted/30" />
          <p class="text-xs text-muted mt-2">背包中没有种子</p>
          <Button v-if="isShopOpen" class="mt-2" :icon-size="12" :icon="Store" @click="$emit('go-to-shop')">前往商店购买</Button>
          <p v-else class="text-[10px] text-muted/60 mt-1">{{ shopClosedReason }}</p>
        </div>

        <Button v-if="plot.state === 'harvestable'" class="w-full justify-center !bg-accent !text-bg" :icon-size="12" :icon="Wheat" @click="$emit('harvest')">
          收获
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Sprout, Star, Store, Wheat, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import type { FarmPlot } from '@/types/farm'

  export interface GreenhousePlotSeedOption {
    cropId: string
    name: string
    count: number
    regrowth: boolean
  }

  export interface GreenhouseBreedingSeedOption {
    id: string
    cropName: string
    generation: number
    starRating: number
  }

  const props = defineProps<{
    breedingSeeds: GreenhouseBreedingSeedOption[]
    cropGrowthDays: number
    cropMaxHarvests: number
    cropName: string
    cropRegrowth: boolean
    isShopOpen: boolean
    plot: FarmPlot
    seeds: GreenhousePlotSeedOption[]
    shopClosedReason: string
    stateLabel: string
  }>()

  defineEmits<{
    close: []
    plant: [cropId: string]
    'plant-breeding-seed': [seedId: string]
    'go-to-shop': []
    harvest: []
  }>()

  const growthProgressPercent = computed(() => Math.min(100, Math.floor((props.plot.growthDays / (Number(props.cropGrowthDays) || 1)) * 100)))
</script>
