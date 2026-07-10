<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">一键种植</p>
      <p class="text-xs text-muted mb-2">空耕地 {{ tilledEmptyCount }} 块，选择要种植的种子：</p>
      <div class="flex flex-col space-y-1 max-h-40 overflow-y-auto">
        <div
          v-for="seed in groupedSeeds"
          :key="seed.itemId"
          class="btn text-xs justify-between mr-1 shrink-0"
        >
          <span>
            {{ seed.option.name }}
            <span v-if="seed.option.regrowth" class="text-success ml-1">[多茬]</span>
          </span>
          <QualityQuantityBreakdown
            :entries="seed.qualities"
            :interactive="true"
            :aria-label="`${seed.option.name}种子的各品质数量`"
            @select-quality="quality => $emit('plant', seed.itemId, quality)"
          />
        </div>
      </div>
      <template v-if="breedingSeedGroups.length > 0">
        <Divider label="育种种子" class="!my-2" />
        <div class="flex flex-col space-y-1 max-h-40 overflow-y-auto">
          <button
            v-for="group in breedingSeedGroups"
            :key="group.cropId"
            class="btn text-xs justify-between mr-1 shrink-0"
            @click="$emit('plant-breeding', group.cropId)"
          >
            <span>
              {{ group.name }}
              <span class="text-muted">G{{ group.minGen }}{{ group.minGen !== group.maxGen ? `~${group.maxGen}` : '' }}</span>
            </span>
            <span class="text-muted">×{{ group.count }}</span>
          </button>
        </div>
      </template>
      <div v-if="seeds.length === 0 && breedingSeedGroups.length === 0" class="flex flex-col items-center py-4">
        <Sprout :size="32" class="text-muted/30" />
        <p class="text-xs text-muted mt-2">没有当季可种植的种子</p>
        <Button v-if="isShopOpen" class="mt-2" :icon-size="12" :icon="Store" @click="$emit('go-to-shop')">前往商店购买</Button>
        <p v-else class="text-[10px] text-muted/60 mt-1">{{ shopClosedReason }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Sprout, Store, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import QualityQuantityBreakdown from '@/components/game/inventory/QualityQuantityBreakdown.vue'
  import { groupInventoryItemsByQuality } from '@/domain/inventory/qualityGroups'
  import type { InventoryItem, Quality } from '@/types'

  export interface FarmBatchPlantSeedOption {
    colorClass: string
    count: number
    cropId: string
    name: string
    quality: Quality
    regrowth: boolean
  }

  export interface FarmBatchBreedingSeedGroup {
    count: number
    cropId: string
    maxGen: number
    minGen: number
    name: string
  }

  interface GroupableSeed extends InventoryItem {
    option: FarmBatchPlantSeedOption
  }

  const props = defineProps<{
    breedingSeedGroups: FarmBatchBreedingSeedGroup[]
    isShopOpen: boolean
    seeds: FarmBatchPlantSeedOption[]
    shopClosedReason: string
    tilledEmptyCount: number
  }>()

  defineEmits<{
    close: []
    plant: [cropId: string, quality: Quality]
    'plant-breeding': [cropId: string]
    'go-to-shop': []
  }>()

  const groupedSeeds = computed(() =>
    groupInventoryItemsByQuality<GroupableSeed>(
      props.seeds.map(seed => ({
        itemId: seed.cropId,
        quality: seed.quality,
        quantity: seed.count,
        option: seed
      }))
    ).map(group => ({
      ...group,
      option: group.qualities[0]!.items[0]!.option
    }))
  )
</script>
