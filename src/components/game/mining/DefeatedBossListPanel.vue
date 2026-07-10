<template>
  <div v-if="defeatedZones.length > 0" class="border border-accent/20 rounded-xs p-3">
    <p class="text-sm text-accent mb-2">
      <Skull :size="14" class="inline" />
      已击败BOSS
    </p>
    <div class="flex flex-col space-y-1">
      <div
        v-for="zone in defeatedZones"
        :key="zone.id"
        class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5"
      >
        <span class="text-xs text-success">{{ zone.bossName }}</span>
        <span class="text-xs text-muted">{{ zone.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Skull } from 'lucide-vue-next'

  defineProps<{
    defeatedZones: Array<{
      id: string
      name: string
      bossName: string
    }>
  }>()
</script>
