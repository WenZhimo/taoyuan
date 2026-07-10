<template>
  <Transition name="panel-fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[32] p-4" @click.self="$emit('close')">
      <div class="game-panel max-w-xs w-full">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-accent">
            <Backpack :size="14" class="inline" />
            使用道具
          </p>
          <Button class="py-0 px-1" :icon="X" :icon-size="12" data-testid="close-combat-items" @click="$emit('close')" />
        </div>
        <div class="flex flex-col space-y-1 max-h-48 overflow-y-auto">
          <div
            v-for="item in items"
            :key="item.itemId"
            class="flex items-center justify-between border border-success/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-success/5"
            :data-testid="`combat-item-${item.itemId}`"
            @click="$emit('select-item', item.itemId)"
          >
            <div class="flex flex-col">
              <span class="text-xs">{{ item.name }}</span>
              <span class="text-[10px] text-muted">{{ item.desc }}</span>
            </div>
            <span class="text-xs text-muted">&times;{{ item.count }}</span>
          </div>
        </div>
        <p v-if="items.length === 0" class="text-xs text-muted text-center py-2">没有可用道具</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { Backpack, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  export interface MineCombatItemOption {
    itemId: string
    name: string
    desc: string
    count: number
  }

  defineProps<{
    show: boolean
    items: MineCombatItemOption[]
  }>()

  defineEmits<{
    close: []
    'select-item': [itemId: string]
  }>()
</script>
