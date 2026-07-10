<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4">
    <div class="game-panel max-w-sm w-full text-center">
      <LoaderCircle :size="24" class="mx-auto mb-3 text-accent animate-spin" />
      <p class="text-sm text-accent mb-1">{{ label }}</p>
      <p class="text-xs text-muted mb-3">
        正在处理 {{ processed.toLocaleString() }} / {{ total.toLocaleString() }}
      </p>

      <div class="h-2 overflow-hidden rounded-xs bg-black/40 mb-2">
        <div class="h-full bg-accent transition-[width] duration-150" :style="{ width: `${percent}%` }" />
      </div>

      <p class="text-xs text-muted mb-4">{{ percent }}%</p>
      <Button class="w-full justify-center" :disabled="cancelRequested" @click="$emit('cancel')">
        {{ cancelRequested ? '正在停止…' : '取消操作' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { LoaderCircle } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  const props = defineProps<{
    label: string
    total: number
    processed: number
    cancelRequested: boolean
  }>()

  defineEmits<{
    cancel: []
  }>()

  const percent = computed(() => {
    if (props.total <= 0) return 100
    return Math.min(100, Math.floor((props.processed / props.total) * 100))
  })
</script>
