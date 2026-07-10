<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">{{ modal.mode === 'withdraw' ? '取出' : '存入' }}</p>
        <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="$emit('close')" />
      </div>
      <p class="text-xs mb-2" :class="qualityClass(modal.quality)">
        {{ getItemName(modal.itemId) }}
        <span v-if="modal.quality !== 'normal'" class="text-[10px]">({{ qualityLabels[modal.quality] }})</span>
      </p>
      <div class="border border-accent/10 rounded-xs p-2 mb-2">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-muted">数量</span>
          <div class="flex items-center space-x-1">
            <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="quantity <= 1" @click="$emit('change-quantity', quantity - 1)">
              -
            </Button>
            <input
              type="number"
              :value="quantity"
              min="1"
              :max="modal.max"
              class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none"
              @input="onQuantityInput"
            />
            <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="quantity >= modal.max" @click="$emit('change-quantity', quantity + 1)">
              +
            </Button>
          </div>
        </div>
        <div class="flex space-x-1">
          <Button class="flex-1 justify-center" :disabled="quantity <= 1" @click="$emit('change-quantity', 1)">最少</Button>
          <Button class="flex-1 justify-center" :disabled="quantity >= modal.max" @click="$emit('change-quantity', modal.max)">最大</Button>
        </div>
      </div>
      <Button class="w-full justify-center !bg-accent !text-bg" @click="$emit('confirm')">
        {{ modal.mode === 'withdraw' ? '取出' : '存入' }} &times;{{ quantity }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { Quality } from '@/types'

  interface VoidChestQuantityModal {
    mode: 'withdraw' | 'deposit'
    chestId: string
    itemId: string
    quality: Quality
    max: number
  }

  defineProps<{
    modal: VoidChestQuantityModal
    quantity: number
    qualityLabels: Record<Quality, string>
    qualityClass: (quality: Quality) => string
    getItemName: (itemId: string) => string
  }>()

  const emit = defineEmits<{
    close: []
    'change-quantity': [quantity: number]
    confirm: []
  }>()

  const onQuantityInput = (event: Event) => {
    const value = Number((event.target as HTMLInputElement).value)
    if (!Number.isNaN(value)) emit('change-quantity', value)
  }
</script>
