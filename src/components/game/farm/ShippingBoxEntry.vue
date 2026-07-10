<template>
  <div
    class="mt-3 flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
    @click="$emit('open')"
  >
    <div class="flex items-center space-x-1.5">
      <Package :size="14" class="text-accent" />
      <span class="text-sm text-accent">出货箱</span>
      <span v-if="boxItemKinds > 0" class="text-xs text-muted">{{ boxItemKinds }}种</span>
    </div>
    <span v-if="total > 0" class="text-xs text-accent">≈{{ total }}文</span>
    <span v-else class="text-xs text-muted">空</span>
  </div>
</template>

<script setup lang="ts">
  import { Package } from 'lucide-vue-next'

  defineProps<{
    boxItemKinds: number
    total: number
  }>()

  defineEmits<{
    open: []
  }>()
</script>
