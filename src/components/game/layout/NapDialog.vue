<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="game-panel max-w-xs w-full text-center">
      <Divider title>小憩</Divider>
      <p class="text-xs leading-relaxed mb-3">在原地闭目养神，跳过一段时间并按实际过去时间恢复体力。</p>

      <div class="grid grid-cols-4 gap-2 mb-3">
        <Button v-for="quickMinute in quickMinutes" :key="quickMinute" class="justify-center py-1" @click="emitMinutes(quickMinute)">
          {{ formatDuration(quickMinute) }}
        </Button>
      </div>

      <label class="block text-left text-xs text-muted mb-3">
        <span class="block mb-1">小憩时长（分钟）</span>
        <input
          class="w-full bg-bg border border-accent/30 rounded-xs px-2 py-1 text-center text-text"
          type="number"
          min="1"
          step="1"
          :value="minutes"
          @input="onMinutesInput"
        />
      </label>

      <div class="text-xs leading-relaxed mb-3 text-left">
        <p>当前时间：{{ currentTime }}</p>
        <p>预计醒来：{{ wakeTime }}</p>
        <p>预计恢复：{{ recoveryPreview }}体力</p>
        <p v-if="interrupted" class="text-danger">时间过长，会在凌晨2点前被打断。</p>
        <p v-if="!canNap" class="text-danger">现在已经太晚了，不能再小憩。</p>
      </div>

      <div class="flex space-x-3 justify-center">
        <Button :icon="X" :icon-size="12" @click="$emit('cancel')">取消</Button>
        <Button class="btn-danger" :icon="Coffee" :icon-size="12" :disabled="!canNap" @click="$emit('confirm')">开始小憩</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Coffee, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'

  withDefaults(
    defineProps<{
      minutes: number
      quickMinutes?: readonly number[]
      currentTime: string
      wakeTime: string
      recoveryPreview: number
      canNap: boolean
      interrupted: boolean
      formatDuration: (minutes: number) => string
    }>(),
    {
      quickMinutes: () => [30, 60, 120, 240] as const
    }
  )

  const emit = defineEmits<{
    'update:minutes': [minutes: number]
    cancel: []
    confirm: []
  }>()

  const emitMinutes = (minutes: number) => {
    emit('update:minutes', minutes)
  }

  const onMinutesInput = (event: Event) => {
    const value = Number((event.target as HTMLInputElement).value)
    emitMinutes(Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1)
  }
</script>
