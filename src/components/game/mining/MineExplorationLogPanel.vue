<template>
  <div class="text-xs text-muted space-y-0.5 max-h-24 overflow-y-auto">
    <p v-for="(message, index) in logs" :key="index" :class="{ 'text-text': index === logs.length - 1 }">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    logs: string[]
  }>()
</script>
