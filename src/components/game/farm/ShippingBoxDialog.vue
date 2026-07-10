<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <div class="flex items-center space-x-1.5 text-sm text-accent mb-1">
        <Package :size="14" />
        <span>出货箱</span>
      </div>
      <p class="text-xs text-muted mb-2">放入的物品将在次日结算。</p>
      <p v-if="sellBonusPercent > 0" class="text-success text-xs mb-2">戒指加成中：售价 +{{ sellBonusPercent }}%</p>

      <div v-if="boxEntries.length > 0" class="border border-accent/10 rounded-xs p-2 mb-2">
        <p class="text-xs text-muted mb-1">已放入</p>
        <div class="flex flex-col space-y-1 max-h-36 overflow-y-auto">
          <div
            v-for="(entry, idx) in boxEntries"
            :key="`${entry.itemId}:${entry.quality}:${idx}`"
            class="flex items-center justify-between border border-accent/20 rounded-xs px-2 py-1 cursor-pointer hover:bg-accent/5"
            @click="$emit('remove-item', entry.itemId, entry.quantity, entry.quality)"
          >
            <div class="min-w-0">
              <span class="text-xs" :class="qualityClass(entry.quality)">
                {{ getItemName(entry.itemId) }}
              </span>
              <span class="text-muted text-xs ml-1">×{{ entry.quantity }}</span>
            </div>
            <span class="text-xs text-accent whitespace-nowrap ml-2">≈{{ calculateSellPrice(entry.itemId, entry.quantity, entry.quality) }}文</span>
          </div>
        </div>
        <p class="text-xs text-accent mt-1.5">预计收入：{{ total }}文</p>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-4 text-muted mb-2">
        <Package :size="32" class="text-muted/30" />
        <p class="text-xs mt-2">出货箱是空的</p>
      </div>

      <div v-if="items.length > 0" class="border border-accent/10 rounded-xs p-2">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted">背包物品</p>
          <span class="text-[10px] text-muted">{{ filteredItems.length }}/{{ items.length }}</span>
        </div>
        <div class="flex flex-wrap gap-1 mb-2">
          <Button
            v-for="filter in filters"
            :key="filter.key"
            class="py-0 px-1.5 !text-[10px]"
            :class="activeFilter === filter.key ? '!bg-accent/20 !text-accent !border-accent' : ''"
            @click="$emit('filter', filter.key)"
          >
            {{ filter.label }}
          </Button>
        </div>
        <div class="flex flex-col space-y-1 overflow-auto max-h-48">
          <div
            v-for="item in filteredItems"
            :key="item.itemId + item.quality"
            class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1 mr-1"
          >
            <div class="min-w-0 flex items-center space-x-1">
              <span class="text-xs" :class="qualityClass(item.quality)">
                {{ item.def?.name }}
              </span>
              <span class="text-muted text-xs">×{{ item.quantity }}</span>
              <span v-if="shippedItems.includes(item.itemId)" class="text-[10px] text-success/60">[已出货]</span>
            </div>
            <div class="flex space-x-1">
              <Button @click="$emit('add-item', item.itemId, 1, item.quality)">放入1</Button>
              <Button v-if="item.quantity > 1" @click="$emit('add-item', item.itemId, item.quantity, item.quality)">全部</Button>
            </div>
          </div>
        </div>
        <div v-if="filteredItems.length === 0" class="flex flex-col items-center py-3 text-muted">
          <Wheat :size="24" class="text-muted/30" />
          <p class="text-xs mt-2">该分类没有可出货物品</p>
        </div>
      </div>
      <div v-else class="flex flex-col items-center py-3 text-muted">
        <Wheat :size="32" class="text-muted/30" />
        <p class="text-xs mt-2">背包中没有可出货的物品</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Package, Wheat, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { InventoryItem, ItemCategory, ItemDef, Quality } from '@/types'

  export type ShippingFilter = 'all' | ItemCategory

  export interface ShippingFilterOption {
    key: ShippingFilter
    label: string
  }

  export interface ShippingBoxShippableItem extends InventoryItem {
    def?: ItemDef
  }

  defineProps<{
    activeFilter: ShippingFilter
    boxEntries: InventoryItem[]
    calculateSellPrice: (itemId: string, quantity: number, quality: Quality) => number
    filteredItems: ShippingBoxShippableItem[]
    filters: ShippingFilterOption[]
    getItemName: (itemId: string) => string
    items: ShippingBoxShippableItem[]
    sellBonusPercent: number
    shippedItems: string[]
    total: number
  }>()

  defineEmits<{
    close: []
    filter: [filter: ShippingFilter]
    'add-item': [itemId: string, quantity: number, quality: Quality]
    'remove-item': [itemId: string, quantity: number, quality: Quality]
  }>()

  const qualityClass = (quality: Quality): string => {
    if (quality === 'fine') return 'text-quality-fine'
    if (quality === 'excellent') return 'text-quality-excellent'
    if (quality === 'supreme') return 'text-quality-supreme'
    return ''
  }
</script>
