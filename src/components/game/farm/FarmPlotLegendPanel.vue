<template>
  <div class="mt-2 border border-accent/10 rounded-xs p-2">
    <div class="grid grid-cols-4 md:space-x-3 md:flex md:flex-wrap text-xs text-muted">
      <span v-for="(item, i) in legends" :key="i">
        <component :is="item.icon" :size="10" :class="[item.color, 'inline']" />
        {{ item.label }}
      </span>
    </div>
    <div v-if="warnings.length > 0" class="flex flex-wrap space-x-2 mt-1.5 border border-accent/20 rounded-xs p-2">
      <span v-for="(warning, i) in warnings" :key="i" class="inline-flex items-center space-x-0.5 text-xs" :class="warning.color">
        {{ warning.text }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'

  export interface FarmPlotLegendItem {
    color: string
    icon: Component
    label: string
  }

  export interface FarmPlotWarningItem {
    color: string
    text: string
  }

  defineProps<{
    legends: FarmPlotLegendItem[]
    warnings: FarmPlotWarningItem[]
  }>()
</script>
