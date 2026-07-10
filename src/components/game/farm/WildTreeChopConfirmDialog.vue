<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">伐木</p>
      <p class="text-xs text-text mb-2">
        确定要对
        <span class="text-accent">{{ getTreeName(target.type) }}</span>
        伐木吗？
      </p>
      <p class="text-xs text-danger mb-3">已伐木 {{ target.chopCount }}/3 次，再伐 {{ remainingChops }} 次后树将消失。</p>
      <div class="flex space-x-2">
        <Button class="flex-1" @click="$emit('close')">取消</Button>
        <Button
          class="flex-1"
          :class="isFinalChop ? '!bg-danger !text-text' : '!bg-accent !text-bg'"
          :icon-size="12"
          :icon="Axe"
          @click="$emit('confirm')"
        >
          {{ isFinalChop ? '确认' : '确认伐木' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Axe, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { WildTreeType } from '@/types'

  export interface WildTreeChopConfirmTarget {
    id: number
    type: WildTreeType
    chopCount: number
  }

  const props = defineProps<{
    target: WildTreeChopConfirmTarget
    getTreeName: (type: WildTreeType) => string
  }>()

  defineEmits<{
    close: []
    confirm: []
  }>()

  const isFinalChop = computed(() => props.target.chopCount >= 2)
  const remainingChops = computed(() => Math.max(0, 3 - props.target.chopCount))
</script>
