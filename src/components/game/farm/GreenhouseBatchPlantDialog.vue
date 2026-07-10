<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">温室一键种植</p>
      <p class="text-xs text-muted mb-2">空耕地 {{ tilledEmptyCount }} 块，选择要种植的种子：</p>
      <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
        <button v-for="seed in seeds" :key="seed.cropId" class="btn text-xs justify-between mr-1 shrink-0" @click="$emit('plant', seed.cropId)">
          <span>
            {{ seed.name }}
            <span v-if="seed.regrowth" class="text-success ml-1">[多茬]</span>
          </span>
          <span class="text-muted">×{{ seed.count }}</span>
        </button>
      </div>
      <div v-if="seeds.length === 0" class="flex flex-col items-center py-4">
        <Sprout :size="32" class="text-muted/30" />
        <p class="text-xs text-muted mt-2">没有可种植的种子</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Sprout, X } from 'lucide-vue-next'

  export interface GreenhouseBatchSeedOption {
    cropId: string
    name: string
    count: number
    regrowth: boolean
  }

  defineProps<{
    seeds: GreenhouseBatchSeedOption[]
    tilledEmptyCount: number
  }>()

  defineEmits<{
    close: []
    plant: [cropId: string]
  }>()
</script>
