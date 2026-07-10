<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">一键施肥</p>
      <p class="text-xs text-muted mb-2">可施肥地块 {{ fertilizableCount }} 块，选择肥料：</p>
      <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
        <button
          v-for="fertilizer in fertilizers"
          :key="fertilizer.itemId"
          class="btn text-xs justify-between mr-1 shrink-0"
          @click="$emit('fertilize', fertilizer.type)"
        >
          <span :class="fertilizer.colorClass">{{ fertilizer.name }}</span>
          <span class="text-muted">×{{ fertilizer.count }}</span>
        </button>
      </div>
      <div v-if="fertilizers.length === 0" class="flex flex-col items-center py-4">
        <CirclePlus :size="32" class="text-muted/30" />
        <p class="text-xs text-muted mt-2">没有可用的肥料</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CirclePlus, X } from 'lucide-vue-next'
  import type { FertilizerType } from '@/types'

  export interface FarmBatchFertilizerOption {
    colorClass: string
    count: number
    itemId: string
    name: string
    type: FertilizerType
  }

  defineProps<{
    fertilizableCount: number
    fertilizers: FarmBatchFertilizerOption[]
  }>()

  defineEmits<{
    close: []
    fertilize: [type: FertilizerType]
  }>()
</script>
