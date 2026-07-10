<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="game-panel max-w-xs w-full text-center">
      <Divider title>{{ label }}</Divider>
      <p class="text-xs leading-relaxed mb-1">{{ summary }}</p>
      <p v-for="(warning, index) in warningLines" :key="index" class="text-danger text-xs mb-1">{{ warning }}</p>
      <div class="flex space-x-3 justify-center mt-4">
        <Button :icon="X" :icon-size="12" @click="$emit('cancel')">再等等</Button>
        <Button class="btn-danger" :icon="Moon" :icon-size="12" @click="$emit('confirm')">{{ label }}</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Moon, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'

  const props = defineProps<{
    label: string
    summary: string
    warning: string
  }>()

  defineEmits<{
    cancel: []
    confirm: []
  }>()

  const warningLines = computed(() => props.warning.split('\n').filter(Boolean))
</script>
