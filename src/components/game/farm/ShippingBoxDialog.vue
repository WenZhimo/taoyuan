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

      <div v-if="groupedBoxEntries.length > 0" class="border border-accent/10 rounded-xs p-2 mb-2">
        <p class="text-xs text-muted mb-1">已放入</p>
        <div class="flex flex-col space-y-1 max-h-36 overflow-y-auto">
          <div
            v-for="entry in groupedBoxEntries"
            :key="entry.itemId"
            class="flex items-center justify-between border border-accent/20 rounded-xs px-2 py-1 hover:bg-accent/5"
          >
            <div class="min-w-0">
              <span class="text-xs text-accent">
                {{ getItemName(entry.itemId) }}
              </span>
              <QualityQuantityBreakdown
                class="mt-0.5"
                :entries="entry.qualities"
                :interactive="true"
                :aria-label="`${getItemName(entry.itemId)}已放入的各品质数量，点击取回`"
                @select-quality="quality => removeBoxEntry(entry.itemId, quality)"
              />
            </div>
            <span class="text-xs text-accent whitespace-nowrap ml-2">≈{{ groupedSellPrice(entry) }}文</span>
          </div>
        </div>
        <p class="text-xs text-accent mt-1.5">预计收入：{{ total }}文</p>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-4 text-muted mb-2">
        <Package :size="32" class="text-muted/30" />
        <p class="text-xs mt-2">出货箱是空的</p>
      </div>

      <div v-if="groupedItems.length > 0" class="border border-accent/10 rounded-xs p-2">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted">背包物品</p>
          <span class="text-[10px] text-muted">{{ groupedFilteredItems.length }}/{{ groupedItems.length }}</span>
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
            v-for="item in groupedFilteredItems"
            :key="item.itemId"
            class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1 mr-1"
          >
            <div class="min-w-0">
              <span class="text-xs text-accent">
                {{ item.def?.name }}
              </span>
              <span v-if="shippedItems.includes(item.itemId)" class="text-[10px] text-success/60">[已出货]</span>
              <QualityQuantityBreakdown
                class="mt-0.5"
                :entries="item.qualities"
                :interactive="true"
                :selected-quality="selectedShippableEntry(item)?.quality"
                :aria-label="`${item.def?.name ?? item.itemId}的可出货品质数量`"
                @select-quality="quality => selectShippableQuality(item.itemId, quality)"
              />
            </div>
            <div class="flex space-x-1">
              <Button
                v-if="selectedShippableEntry(item)"
                @click="$emit('add-item', item.itemId, 1, selectedShippableEntry(item)!.quality)"
              >
                放入1
              </Button>
              <Button
                v-if="(selectedShippableEntry(item)?.quantity ?? 0) > 1"
                @click="
                  $emit(
                    'add-item',
                    item.itemId,
                    selectedShippableEntry(item)!.quantity,
                    selectedShippableEntry(item)!.quality
                  )
                "
              >
                全部
              </Button>
            </div>
          </div>
        </div>
        <div v-if="groupedFilteredItems.length === 0" class="flex flex-col items-center py-3 text-muted">
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
  import { computed, ref } from 'vue'
  import { Package, Wheat, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import QualityQuantityBreakdown from '@/components/game/inventory/QualityQuantityBreakdown.vue'
  import { findQualityQuantity, groupInventoryItemsByQuality } from '@/domain/inventory/qualityGroups'
  import type { InventoryQualityGroup } from '@/domain/inventory/qualityGroups'
  import type { InventoryItem, ItemCategory, ItemDef, Quality } from '@/types'

  export type ShippingFilter = 'all' | ItemCategory

  export interface ShippingFilterOption {
    key: ShippingFilter
    label: string
  }

  export interface ShippingBoxShippableItem extends InventoryItem {
    def?: ItemDef
  }

  const props = defineProps<{
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

  const emit = defineEmits<{
    close: []
    filter: [filter: ShippingFilter]
    'add-item': [itemId: string, quantity: number, quality: Quality]
    'remove-item': [itemId: string, quantity: number, quality: Quality]
  }>()

  const selectedQualities = ref<Record<string, Quality>>({})

  const groupedBoxEntries = computed(() => groupInventoryItemsByQuality(props.boxEntries))
  const groupedItems = computed(() =>
    groupInventoryItemsByQuality(props.items).map(group => ({
      ...group,
      def: group.qualities[0]?.items[0]?.def
    }))
  )
  const groupedFilteredItems = computed(() =>
    groupInventoryItemsByQuality(props.filteredItems).map(group => ({
      ...group,
      def: group.qualities[0]?.items[0]?.def
    }))
  )

  const selectShippableQuality = (itemId: string, quality: Quality) => {
    selectedQualities.value[itemId] = quality
  }

  const selectedShippableEntry = (group: InventoryQualityGroup<ShippingBoxShippableItem>) => {
    const selected = selectedQualities.value[group.itemId]
    return (selected ? findQualityQuantity(group, selected) : undefined) ?? group.qualities[0]
  }

  const removeBoxEntry = (itemId: string, quality: Quality) => {
    const group = groupedBoxEntries.value.find(entry => entry.itemId === itemId)
    const entry = findQualityQuantity(group, quality)
    if (entry) emit('remove-item', itemId, entry.quantity, quality)
  }

  const groupedSellPrice = (group: InventoryQualityGroup): number => {
    return group.qualities.reduce(
      (total, entry) => total + props.calculateSellPrice(group.itemId, entry.quantity, entry.quality),
      0
    )
  }
</script>
