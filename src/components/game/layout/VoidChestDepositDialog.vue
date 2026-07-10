<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-sm w-full">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">存入物品</p>
        <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="$emit('close')" />
      </div>
      <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
        <div
          v-for="item in groupedItems"
          :key="item.itemId"
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 hover:bg-accent/5"
        >
          <span class="text-xs truncate mr-2 text-accent">
            {{ getItemName(item.itemId) }}
          </span>
          <QualityQuantityBreakdown
            :entries="item.qualities"
            :interactive="true"
            :aria-label="`${getItemName(item.itemId)}的可存入品质数量`"
            @select-quality="quality => selectQuality(item.itemId, quality)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import QualityQuantityBreakdown from '@/components/game/inventory/QualityQuantityBreakdown.vue'
  import { findQualityQuantity, groupInventoryItemsByQuality } from '@/domain/inventory/qualityGroups'
  import type { InventoryItem, Quality } from '@/types'

  const props = defineProps<{
    items: InventoryItem[]
    qualityLabels: Record<Quality, string>
    qualityClass: (quality: Quality) => string
    getItemName: (itemId: string) => string
  }>()

  const emit = defineEmits<{
    close: []
    'select-item': [itemId: string, quality: Quality, quantity: number]
  }>()

  const groupedItems = computed(() => groupInventoryItemsByQuality(props.items))

  const selectQuality = (itemId: string, quality: Quality) => {
    const group = groupedItems.value.find(item => item.itemId === itemId)
    const entry = findQualityQuantity(group, quality)
    if (entry) emit('select-item', itemId, quality, entry.quantity)
  }
</script>
