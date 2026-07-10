<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4">
    <div class="game-panel max-w-xs w-full text-center">
      <Divider title>隔夜结算中</Divider>
      <p class="text-xs text-muted leading-relaxed">正在处理作物生长、工坊产出和其他每日事件。存档规模很大时会稍等片刻。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Divider from '@/components/game/Divider.vue'
</script>
