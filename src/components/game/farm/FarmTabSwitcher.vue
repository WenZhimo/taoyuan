<template>
  <div class="flex space-x-1.5 mb-3">
    <Button
      class="flex-1 justify-center"
      :class="{ '!bg-accent !text-bg': modelValue === 'field' }"
      :icon="Sprout"
      @click="$emit('update:modelValue', 'field')"
    >
      田庄
    </Button>
    <Button
      class="flex-1 justify-center"
      :class="{ '!bg-accent !text-bg': modelValue === 'tree' }"
      :icon="TreeDeciduous"
      @click="$emit('update:modelValue', 'tree')"
    >
      林木
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Sprout, TreeDeciduous } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  export type FarmTab = 'field' | 'tree'

  defineProps<{
    modelValue: FarmTab
  }>()

  defineEmits<{
    'update:modelValue': [value: FarmTab]
  }>()
</script>
