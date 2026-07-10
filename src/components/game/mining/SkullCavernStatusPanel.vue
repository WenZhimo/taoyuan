<template>
  <div class="border border-accent/20 rounded-xs p-3 mb-4">
    <div class="flex items-center justify-between mb-1">
      <p class="text-sm text-danger">
        <Skull :size="14" class="inline" />
        骷髅矿穴
      </p>
      <span v-if="bestFloor > 0" class="text-xs text-muted">最深 第{{ bestFloor }}层</span>
      <span v-else class="text-xs text-muted/40">未探索</span>
    </div>
    <p class="text-xs text-muted">无限层 · 每10层安全点 · 铱矿来源 · 怪物随深度增强</p>
    <p v-if="safePointFloor > 0" class="text-xs text-muted mt-0.5">安全点：第{{ safePointFloor }}层</p>
  </div>
</template>

<script setup lang="ts">
  import { Skull } from 'lucide-vue-next'

  defineProps<{
    bestFloor: number
    safePointFloor: number
  }>()
</script>
