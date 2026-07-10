<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">一键操作</p>
      <div class="flex flex-col space-y-1.5">
        <button class="btn text-xs w-full justify-between" :disabled="unwateredCount === 0" @click="$emit('action', 'water')">
          <span class="flex items-center space-x-1">
            <Droplets :size="12" />
            <span>一键浇水</span>
          </span>
          <span class="text-muted">{{ unwateredCount }} 块</span>
        </button>
        <button class="btn text-xs w-full justify-between" :disabled="wastelandCount === 0" @click="$emit('action', 'till')">
          <span class="flex items-center space-x-1">
            <Shovel :size="12" />
            <span>一键开垦</span>
          </span>
          <span class="text-muted">{{ wastelandCount }} 块</span>
        </button>
        <button class="btn text-xs w-full justify-between" :disabled="harvestableCount === 0" @click="$emit('action', 'harvest')">
          <span class="flex items-center space-x-1">
            <Wheat :size="12" />
            <span>一键收获</span>
          </span>
          <span class="text-muted">{{ harvestableCount }} 块</span>
        </button>
        <button class="btn text-xs w-full justify-between" :disabled="!canPlant" @click="$emit('action', 'plant')">
          <span class="flex items-center space-x-1">
            <Sprout :size="12" />
            <span>一键种植</span>
          </span>
          <span class="text-muted">{{ tilledEmptyCount }} 块</span>
        </button>
        <button class="btn text-xs w-full justify-between" :disabled="!canFertilize" @click="$emit('action', 'fertilize')">
          <span class="flex items-center space-x-1">
            <CirclePlus :size="12" />
            <span>一键施肥</span>
          </span>
          <span class="text-muted">{{ fertilizableCount }} 块</span>
        </button>
        <button class="btn text-xs w-full justify-between" :disabled="infestedCount === 0" @click="$emit('action', 'curePest')">
          <span class="flex items-center space-x-1">
            <Bug :size="12" />
            <span>一键除虫</span>
          </span>
          <span class="text-muted">{{ infestedCount }} 块</span>
        </button>
        <button class="btn text-xs w-full justify-between" :disabled="weedyCount === 0" @click="$emit('action', 'clearWeed')">
          <span class="flex items-center space-x-1">
            <Leaf :size="12" />
            <span>一键除草</span>
          </span>
          <span class="text-muted">{{ weedyCount }} 块</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Bug, CirclePlus, Droplets, Leaf, Shovel, Sprout, Wheat, X } from 'lucide-vue-next'

  export type FarmBatchAction = 'water' | 'till' | 'harvest' | 'plant' | 'fertilize' | 'curePest' | 'clearWeed'

  defineProps<{
    canFertilize: boolean
    canPlant: boolean
    fertilizableCount: number
    harvestableCount: number
    infestedCount: number
    tilledEmptyCount: number
    unwateredCount: number
    wastelandCount: number
    weedyCount: number
  }>()

  defineEmits<{
    close: []
    action: [action: FarmBatchAction]
  }>()
</script>
