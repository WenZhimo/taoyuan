<template>
  <div class="text-xs space-y-0.5 max-h-28 overflow-y-auto">
    <p
      v-for="(message, index) in logs"
      :key="index"
      :class="index < logs.length - 1 ? 'text-muted' : 'text-text'"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    logs: string[]
  }>()
</script>
