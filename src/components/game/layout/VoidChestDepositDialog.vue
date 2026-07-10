<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-sm w-full">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">存入物品</p>
        <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="$emit('close')" />
      </div>
      <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
        <div
          v-for="item in items"
          :key="item.itemId + item.quality"
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
          @click="$emit('select-item', item.itemId, item.quality, item.quantity)"
        >
          <span class="text-xs truncate mr-2" :class="qualityClass(item.quality)">
            {{ getItemName(item.itemId) }}
            <span v-if="item.quality !== 'normal'" class="text-[10px]">({{ qualityLabels[item.quality] }})</span>
          </span>
          <span class="text-xs text-muted">&times;{{ item.quantity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { InventoryItem, Quality } from '@/types'

  defineProps<{
    items: InventoryItem[]
    qualityLabels: Record<Quality, string>
    qualityClass: (quality: Quality) => string
    getItemName: (itemId: string) => string
  }>()

  defineEmits<{
    close: []
    'select-item': [itemId: string, quality: Quality, quantity: number]
  }>()
</script>
