<template>
  <div class="flex justify-center mb-3">
    <div class="grid grid-cols-6 gap-1" style="max-width: 264px">
      <button
        v-for="tile in tiles"
        :key="tile.index"
        class="w-10 h-10 rounded-xs flex items-center justify-center text-xs border transition-colors"
        :class="getTileClass(tile)"
        :disabled="!isTileClickable(tile)"
        :data-testid="`mine-tile-${tile.index}`"
        @click="$emit('select-tile', tile)"
      >
        {{ getTileIcon(tile) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { MineTile } from '@/types'

  defineProps<{
    tiles: MineTile[]
    getTileClass: (tile: MineTile) => string
    getTileIcon: (tile: MineTile) => string
    isTileClickable: (tile: MineTile) => boolean
  }>()

  defineEmits<{
    'select-tile': [tile: MineTile]
  }>()
</script>
