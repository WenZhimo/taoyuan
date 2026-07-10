<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" @click.self="$emit('cancel')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('cancel')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">批量操作确认</p>
      <p class="text-xs text-muted leading-relaxed mb-3">
        {{ label }}目标共有 {{ total.toLocaleString() }} 项。系统会自动按每批 {{ limit.toLocaleString() }}
        项处理全部目标，并显示实时进度。
      </p>
      <div class="flex space-x-2">
        <Button class="flex-1 justify-center" @click="$emit('cancel')">取消</Button>
        <Button class="flex-1 justify-center !bg-accent !text-bg" @click="$emit('confirm')">继续处理</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  defineProps<{
    label: string
    total: number
    limit: number
  }>()

  defineEmits<{
    cancel: []
    confirm: []
  }>()
</script>
