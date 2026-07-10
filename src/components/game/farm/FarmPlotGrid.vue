<template>
  <div class="border border-accent/20 rounded-xs p-2">
    <div class="grid gap-0.5 max-w-full md:max-w-md" :style="{ gridTemplateColumns: `repeat(${farmSize}, minmax(0, 1fr))` }">
      <button
        v-for="plot in plots"
        :key="plot.id"
        class="farm-plot rounded-xs cursor-pointer transition-colors relative leading-tight"
        :class="[
          getPlotDisplay(plot).color,
          getPlotDisplay(plot).bg,
          needsWater(plot)
            ? 'border-2 border-danger/50'
            : isSprinklerCovered(plot.id)
              ? 'border border-water/40'
              : 'border border-accent/15',
          plot.state === 'harvestable' ? 'hover:border-accent/60' : 'hover:border-accent/40'
        ]"
        :title="getPlotTooltip(plot)"
        @click="$emit('select-plot', plot.id)"
      >
        <div class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <component :is="getPlotDisplay(plot).icon" :size="14" />
          <span v-if="plot.cropId" class="text-[10px] opacity-60 truncate max-w-full px-0.5 mt-1">{{ getCropName(plot.cropId) }}</span>
          <Droplets
            v-if="(plot.state === 'planted' || plot.state === 'growing') && !plot.watered"
            :size="8"
            class="absolute bottom-0 right-0 text-danger drop-shadow-sm"
          />
          <Droplet v-if="hasSprinkler(plot.id)" :size="8" class="absolute top-0 right-0 text-water drop-shadow-sm" />
          <CirclePlus v-if="plot.fertilizer" :size="8" class="absolute bottom-0 left-0 text-success drop-shadow-sm" />
          <Bug v-if="plot.infested" :size="8" class="absolute top-0 left-0 text-danger drop-shadow-sm" />
          <Leaf
            v-if="plot.weedy"
            :size="8"
            class="absolute top-0 left-0 text-success drop-shadow-sm"
            :class="{ 'left-2': plot.infested }"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'
  import { Bug, CirclePlus, Droplet, Droplets, Leaf } from 'lucide-vue-next'
  import type { FarmPlot } from '@/types/farm'

  export interface FarmPlotDisplay {
    bg: string
    color: string
    icon: Component
  }

  defineProps<{
    farmSize: number
    getCropName: (cropId: string) => string
    getPlotDisplay: (plot: FarmPlot) => FarmPlotDisplay
    getPlotTooltip: (plot: FarmPlot) => string
    hasSprinkler: (plotId: number) => boolean
    isSprinklerCovered: (plotId: number) => boolean
    needsWater: (plot: FarmPlot) => boolean
    plots: FarmPlot[]
  }>()

  defineEmits<{
    'select-plot': [plotId: number]
  }>()
</script>
