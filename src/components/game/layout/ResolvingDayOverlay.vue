<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4">
    <div class="game-panel max-w-xs w-full text-center">
      <Divider title>隔夜结算中</Divider>
      <p class="text-xs text-accent mb-2">阶段 {{ stageIndex }} / {{ stageCount }}：{{ stage }}</p>
      <p class="text-xs text-muted leading-relaxed">当前处理 {{ processedLabel }} / {{ totalLabel }}</p>
      <div class="h-1.5 bg-bg border border-accent/10 rounded-xs mt-3 overflow-hidden">
        <div class="h-full bg-accent transition-all" :style="{ width: `${progressPercent}%` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Divider from '@/components/game/Divider.vue'

  const props = withDefaults(defineProps<{
    stage?: string
    stageIndex?: number
    stageCount?: number
    processed?: number
    total?: number
  }>(), {
    stage: '准备结算',
    stageIndex: 1,
    stageCount: 1,
    processed: 0,
    total: 1
  })

  const processedLabel = computed(() => props.processed.toLocaleString())
  const totalLabel = computed(() => props.total.toLocaleString())
  const progressPercent = computed(() => {
    const stageProgress = props.total > 0 ? Math.min(1, Math.max(0, props.processed / props.total)) : 1
    const overall = ((Math.max(1, props.stageIndex) - 1) + stageProgress) / Math.max(1, props.stageCount)
    return Math.round(Math.min(100, Math.max(0, overall * 100)))
  })
</script>
