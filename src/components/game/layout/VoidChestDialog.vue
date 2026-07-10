<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-sm w-full">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">
          <Archive :size="14" class="inline" />
          虚空箱
        </p>
        <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="$emit('close')" />
      </div>

      <div class="flex flex-col space-y-1.5">
        <div
          v-for="chest in chests"
          :key="chest.id"
          class="border border-accent/10 rounded-xs p-2 cursor-pointer"
          @click="$emit('toggle-chest', chest.id)"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center space-x-1.5">
              <span class="text-xs text-quality-supreme">{{ chest.label }}</span>
              <span v-if="chest.voidRole === 'input'" class="text-[10px] px-1 border border-accent/30 rounded-xs text-accent">原料箱</span>
              <span v-if="chest.voidRole === 'output'" class="text-[10px] px-1 border border-accent/30 rounded-xs text-accent">成品箱</span>
            </div>
            <span class="text-[10px] text-muted">{{ chest.items.length }}/{{ capacity }}</span>
          </div>

          <template v-if="expandedChestId === chest.id">
            <div v-if="chest.items.length > 0" class="flex flex-col space-y-0.5 mb-1.5 max-h-36 overflow-y-auto">
              <div
                v-for="(item, itemIndex) in chest.items"
                :key="`${item.itemId}-${item.quality}-${itemIndex}`"
                class="flex items-center justify-between px-2 py-0.5 border border-accent/5 rounded-xs mr-1"
                @click.stop="$emit('show-item-detail', { itemId: item.itemId, quality: item.quality, quantity: item.quantity })"
              >
                <span class="text-[10px] truncate mr-2 cursor-pointer hover:underline" :class="qualityClass(item.quality)">
                  {{ getItemName(item.itemId) }}
                  <span class="text-[10px] text-muted">&times;{{ item.quantity }}</span>
                </span>
                <div class="flex items-center space-x-1">
                  <Button class="py-0 px-1 text-[10px]" @click.stop="$emit('withdraw', chest.id, item.itemId, item.quality, item.quantity)">
                    取出
                  </Button>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-4">
              <Archive :size="28" class="text-accent/20 mb-1.5" />
              <p class="text-[10px] text-muted">箱子是空的</p>
              <p class="text-[10px] text-muted/50 mt-0.5">点击下方「存入」添加</p>
            </div>
            <Button
              v-if="duplicateDepositCount > 0"
              class="w-full text-[10px] mb-1"
              :icon="ArrowDownToLine"
              :icon-size="10"
              @click.stop="$emit('deposit-duplicates')"
            >
              一键存入重复物品
            </Button>
            <Button v-if="depositableCount > 0" class="w-full text-[10px]" :icon="ArrowDown" :icon-size="10" @click.stop="$emit('open-deposit', chest.id)">
              存入
            </Button>
          </template>
        </div>
      </div>
      <div v-if="chests.length === 0" class="flex flex-col items-center justify-center py-8">
        <Archive :size="40" class="text-accent/20 mb-2" />
        <p class="text-xs text-muted">还没有虚空箱</p>
        <p class="text-[10px] text-muted/50 mt-0.5">在仓库中制作虚空箱后即可远程存取</p>
      </div>
    </div>

    <div v-if="itemDetail && itemDef" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close-item-detail')">
      <div class="game-panel max-w-xs w-full relative">
        <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close-item-detail')">
          <X :size="14" />
        </button>
        <p class="text-sm mb-2" :class="qualityClass(itemDetail.quality) || 'text-accent'">
          {{ itemDef.name }}
        </p>
        <div class="border border-accent/10 rounded-xs p-2 mb-2">
          <p class="text-xs text-muted">{{ itemDef.description }}</p>
        </div>
        <div class="border border-accent/10 rounded-xs p-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">数量</span>
            <span class="text-xs">×{{ itemDetail.quantity }}</span>
          </div>
          <div v-if="itemDetail.quality !== 'normal'" class="flex items-center justify-between mt-0.5">
            <span class="text-xs text-muted">品质</span>
            <span class="text-xs" :class="qualityClass(itemDetail.quality)">
              {{ qualityLabels[itemDetail.quality] }}
            </span>
          </div>
          <div v-if="itemDef.sellPrice" class="flex items-center justify-between mt-0.5">
            <span class="text-xs text-muted">售价</span>
            <span class="text-xs text-accent">{{ itemDef.sellPrice }}文</span>
          </div>
          <div v-if="itemDef.staminaRestore" class="flex items-center justify-between mt-0.5">
            <span class="text-xs text-muted">恢复</span>
            <span class="text-xs text-success">
              +{{ itemDef.staminaRestore }}体力
              <template v-if="itemDef.healthRestore">/ +{{ itemDef.healthRestore }}HP</template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Archive, ArrowDown, ArrowDownToLine, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { Chest, ItemDef, Quality } from '@/types'

  interface VoidChestItemDetail {
    itemId: string
    quality: Quality
    quantity: number
  }

  defineProps<{
    chests: Chest[]
    expandedChestId: string | null
    capacity: number
    duplicateDepositCount: number
    depositableCount: number
    itemDetail: VoidChestItemDetail | null
    itemDef: ItemDef | null
    qualityLabels: Record<Quality, string>
    qualityClass: (quality: Quality) => string
    getItemName: (itemId: string) => string
  }>()

  defineEmits<{
    close: []
    'toggle-chest': [chestId: string]
    'show-item-detail': [detail: VoidChestItemDetail]
    withdraw: [chestId: string, itemId: string, quality: Quality, quantity: number]
    'deposit-duplicates': []
    'open-deposit': [chestId: string]
    'close-item-detail': []
  }>()
</script>
