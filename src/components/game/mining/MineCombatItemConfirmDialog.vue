<template>
  <Transition name="panel-fade">
    <div v-if="item" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[32] p-4" @click.self="$emit('cancel')">
      <div class="game-panel max-w-xs w-full relative">
        <button class="absolute top-2 right-2 text-muted hover:text-text" data-testid="cancel-combat-item-x" @click="$emit('cancel')">
          <X :size="14" />
        </button>
        <p class="text-sm text-accent mb-2">使用道具</p>
        <div class="border border-accent/10 rounded-xs p-2 mb-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">道具</span>
            <span class="text-xs">{{ item.name }}</span>
          </div>
          <div class="flex items-center justify-between mt-0.5">
            <span class="text-xs text-muted">效果</span>
            <span class="text-xs text-success">{{ item.desc }}</span>
          </div>
          <div class="flex items-center justify-between mt-0.5">
            <span class="text-xs text-muted">剩余</span>
            <span class="text-xs">×{{ item.count }}</span>
          </div>
        </div>
        <div v-if="canBatch && item.count > 1" class="border border-accent/10 rounded-xs p-2 mb-2">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs text-muted">使用数量</span>
            <div class="flex items-center space-x-1">
              <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="quantity <= 1" data-testid="decrease-combat-item-qty" @click="$emit('decrease-quantity')">
                -
              </Button>
              <input
                type="number"
                :value="quantity"
                min="1"
                :max="item.count"
                class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none focus:border-accent transition-colors"
                data-testid="combat-item-qty-input"
                @input="$emit('input-quantity', $event)"
              />
              <Button
                class="h-6 px-1.5 py-0.5 text-xs justify-center"
                :disabled="quantity >= item.count"
                data-testid="increase-combat-item-qty"
                @click="$emit('increase-quantity')"
              >
                +
              </Button>
            </div>
          </div>
          <div class="flex space-x-1">
            <Button class="flex-1 justify-center" :disabled="quantity <= 1" data-testid="min-combat-item-qty" @click="$emit('set-quantity', 1)">最少</Button>
            <Button class="flex-1 justify-center" :disabled="quantity >= item.count" data-testid="max-combat-item-qty" @click="$emit('set-quantity', item.count)">
              最多
            </Button>
          </div>
        </div>
        <div class="flex space-x-1.5">
          <Button class="flex-1 justify-center" data-testid="cancel-combat-item" @click="$emit('cancel')">取消</Button>
          <Button class="flex-1 justify-center !bg-accent !text-bg" data-testid="confirm-combat-item" @click="$emit('confirm')">
            确认使用{{ canBatch && quantity > 1 ? ` ×${quantity}` : '' }}
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { MineCombatItemOption } from './MineCombatItemListDialog.vue'

  defineProps<{
    item: MineCombatItemOption | null
    canBatch: boolean
    quantity: number
  }>()

  defineEmits<{
    cancel: []
    'decrease-quantity': []
    'increase-quantity': []
    'set-quantity': [quantity: number]
    'input-quantity': [event: Event]
    confirm: []
  }>()
</script>
