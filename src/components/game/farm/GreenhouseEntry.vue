<template>
  <div
    class="mt-3 flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
    @click="$emit('open')"
  >
    <div class="flex items-center space-x-1.5">
      <Warehouse :size="14" class="text-accent" />
      <span class="text-sm text-accent">温室</span>
      <span v-if="harvestableCount > 0" class="text-xs text-accent">{{ harvestableCount }}块可收获</span>
    </div>
    <span class="text-xs text-muted">{{ plotCount }}块地</span>
  </div>
</template>

<script setup lang="ts">
  import { Warehouse } from 'lucide-vue-next'

  defineProps<{
    harvestableCount: number
    plotCount: number
  }>()

  defineEmits<{
    open: []
  }>()
</script>
