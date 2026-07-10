<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-md w-full max-h-[80vh] flex flex-col relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm text-accent">
          <History :size="14" class="inline" />
          日志
        </p>
        <Button v-if="groups.length > 0" class="py-0 px-1.5 text-[10px] mr-5" :icon="Trash2" :icon-size="10" @click="$emit('request-clear', null)">
          清空全部
        </Button>
      </div>
      <div class="flex-1 overflow-y-auto min-h-0">
        <div v-if="groups.length === 0" class="flex flex-col items-center justify-center py-8 text-muted">
          <History :size="32" class="mb-2" />
          <p class="text-xs">暂无日志记录</p>
        </div>
        <div v-for="(group, groupIndex) in groups" :key="`${group.label}-${groupIndex}`" class="mb-3">
          <div class="flex items-center justify-between">
            <Divider :label="group.label" class="flex-1" />
            <button class="text-muted hover:text-danger ml-1.5 flex-shrink-0" title="清空该日日志" @click="$emit('request-clear', group.label)">
              <X :size="12" />
            </button>
          </div>
          <div class="flex flex-col space-y-0.5">
            <p v-for="(message, messageIndex) in group.messages" :key="messageIndex" class="text-xs text-muted px-1">{{ message }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="clearTarget !== undefined" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div class="game-panel max-w-xs w-full text-center">
        <p class="text-xs leading-relaxed mb-4">
          {{ clearTarget === null ? '确认清空全部日志？' : `确认清空「${clearTarget}」的日志？` }}
        </p>
        <div class="flex space-x-3 justify-center">
          <Button @click="$emit('cancel-clear')">取消</Button>
          <Button class="btn-danger" :icon="Trash2" :icon-size="12" @click="$emit('confirm-clear')">确认</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { History, Trash2, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'

  interface GameLogGroup {
    label: string
    messages: string[]
  }

  defineProps<{
    groups: GameLogGroup[]
    clearTarget: string | null | undefined
  }>()

  defineEmits<{
    close: []
    'request-clear': [dayLabel: string | null]
    'cancel-clear': []
    'confirm-clear': []
  }>()
</script>
