<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-sm w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <div class="flex items-center space-x-1.5 text-sm text-accent mb-1">
        <Warehouse :size="14" />
        <span>温室</span>
      </div>
      <p class="text-xs text-muted mb-3">无季节限制 · 自动浇水 · {{ plotCount }}块地</p>

      <div class="flex space-x-2 mb-3">
        <Button
          class="flex-1 justify-center"
          :class="{ '!bg-accent !text-bg': harvestableCount > 0 }"
          :disabled="harvestableCount === 0"
          :icon-size="12"
          :icon="Wheat"
          @click="$emit('batch-harvest')"
        >
          一键收获{{ harvestableCount > 0 ? ` (${harvestableCount}块)` : '' }}
        </Button>
        <Button
          class="flex-1 justify-center"
          :disabled="tilledEmptyCount === 0 || seedCount === 0"
          :icon-size="12"
          :icon="Sprout"
          @click="$emit('open-batch-plant')"
        >
          一键种植{{ tilledEmptyCount > 0 ? ` (${tilledEmptyCount}块)` : '' }}
        </Button>
        <Button v-if="canUpgrade" class="flex-1 justify-center" :icon-size="12" :icon="ArrowUp" @click="$emit('open-upgrade')">升级温室</Button>
      </div>

      <div class="grid grid-cols-2 gap-1.5 mb-3">
        <button
          v-for="stat in stateStats"
          :key="stat.key"
          class="border border-accent/10 rounded-xs px-3 py-2 text-left"
          :class="stat.firstPlotId !== null ? 'cursor-pointer hover:bg-accent/5' : 'opacity-70'"
          @click="stat.firstPlotId !== null && $emit('select-plot', stat.firstPlotId)"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">{{ stat.label }}</span>
            <span class="text-xs text-accent">{{ stat.count }}</span>
          </div>
        </button>
      </div>

      <div class="border border-accent/10 rounded-xs p-2">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-muted">植物统计</span>
          <span class="text-xs text-accent">{{ plantedCount }}株</span>
        </div>
        <div v-if="cropStats.length > 0" class="flex flex-col space-y-1 max-h-72 overflow-y-auto">
          <button
            v-for="item in cropStats"
            :key="item.key"
            class="border border-accent/10 rounded-xs px-3 py-1.5 text-left cursor-pointer hover:bg-accent/5 mr-1"
            @click="$emit('select-plot', item.firstPlotId)"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs">
                {{ item.name }}
                <span v-if="item.generation !== null" class="text-accent ml-1">G{{ item.generation }}</span>
              </span>
              <span class="text-xs text-muted">×{{ item.count }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-[10px] text-muted">可收获 {{ item.harvestable }} · 生长中 {{ item.growing }}</span>
              <span v-if="item.avgProgress !== null" class="text-[10px] text-success">{{ item.avgProgress }}%</span>
            </div>
          </button>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-5">
          <Sprout :size="28" class="text-muted/30" />
          <p class="text-xs text-muted mt-2">温室里还没有作物</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ArrowUp, Sprout, Warehouse, Wheat, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  export interface GreenhouseStateStat {
    key: string
    label: string
    count: number
    firstPlotId: number | null
  }

  export interface GreenhouseCropStat {
    key: string
    name: string
    generation: number | null
    count: number
    harvestable: number
    growing: number
    firstPlotId: number
    avgProgress: number | null
  }

  defineProps<{
    canUpgrade: boolean
    cropStats: GreenhouseCropStat[]
    harvestableCount: number
    plantedCount: number
    plotCount: number
    seedCount: number
    stateStats: GreenhouseStateStat[]
    tilledEmptyCount: number
  }>()

  defineEmits<{
    close: []
    'batch-harvest': []
    'open-batch-plant': []
    'open-upgrade': []
    'select-plot': [plotId: number]
  }>()
</script>
