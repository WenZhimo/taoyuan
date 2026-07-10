<template>
  <div>
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center space-x-1.5 text-sm text-accent">
        <Sprout :size="14" />
        <span>田庄 ({{ farmSize }}×{{ farmSize }})</span>
      </div>
      <div class="text-xs text-muted flex space-x-3">
        <span v-if="scarecrows > 0" class="inline-flex items-center space-x-0.5">
          <Bird :size="12" />
          <span>稻草人 {{ scarecrows }}</span>
        </span>
        <span v-else class="text-danger/80 inline-flex items-center space-x-0.5">
          <Bird :size="12" />
          <span>无稻草人</span>
        </span>
        <span v-if="lightningRods > 0" class="inline-flex items-center space-x-0.5">
          <Zap :size="12" />
          <span>避雷针 {{ lightningRods }}</span>
        </span>
      </div>
    </div>

    <p v-if="tutorialHint" class="text-[10px] text-muted/50 mb-2">{{ tutorialHint }}</p>

    <div class="mb-3">
      <Button class="w-full md:w-auto" :icon-size="12" :icon="Wrench" @click="$emit('open-batch-actions')">一键操作</Button>
    </div>

    <div v-if="farmMapType === 'riverland' && creekCatchCount > 0" class="mb-3">
      <div
        class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
        @click="$emit('collect-creek-catch')"
      >
        <div>
          <p class="text-xs text-accent">溪流鱼获</p>
          <p class="text-[10px] text-muted">溪流中捕获了{{ creekCatchCount }}条鱼</p>
        </div>
        <span class="text-xs text-success">收取</span>
      </div>
    </div>

    <div v-if="farmMapType === 'hilltop' && surfaceOreQuantity > 0" class="mb-3">
      <div
        class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
        @click="$emit('mine-surface-ore')"
      >
        <div>
          <p class="text-xs text-accent">地表矿脉</p>
          <p class="text-[10px] text-muted">发现{{ surfaceOreName }}&times;{{ surfaceOreQuantity }}</p>
        </div>
        <span class="text-xs text-success">开采（-5体力）</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Bird, Sprout, Wrench, Zap } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  defineProps<{
    farmSize: number
    scarecrows: number
    lightningRods: number
    tutorialHint: string | null
    farmMapType: string
    creekCatchCount: number
    surfaceOreName: string
    surfaceOreQuantity: number
  }>()

  defineEmits<{
    'open-batch-actions': []
    'collect-creek-catch': []
    'mine-surface-ore': []
  }>()
</script>
