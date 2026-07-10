<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">砍伐果树</p>
      <p class="text-xs text-text mb-3">
        确定要砍掉
        <span class="text-accent">{{ getTreeName(target.type) }}</span>
        吗？砍伐后不可恢复。
      </p>
      <div class="flex space-x-2">
        <Button class="flex-1" @click="$emit('close')">取消</Button>
        <Button class="flex-1 !bg-danger !text-text" :icon-size="12" :icon="Axe" @click="$emit('confirm')">确认砍伐</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Axe, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { FruitTreeType } from '@/types'

  export interface FruitTreeChopConfirmTarget {
    id: number
    type: FruitTreeType
  }

  defineProps<{
    target: FruitTreeChopConfirmTarget
    getTreeName: (type: FruitTreeType) => string
  }>()

  defineEmits<{
    close: []
    confirm: []
  }>()
</script>
