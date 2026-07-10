<template>
  <Transition name="panel-fade">
    <div v-if="show && info" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[34] p-4" @click.self="$emit('close')">
      <div class="game-panel max-w-xs w-full relative">
        <button class="absolute top-2 right-2 text-muted hover:text-text" data-testid="close-equipment-property" @click="$emit('close')">
          <X :size="14" />
        </button>
        <p class="text-[10px] text-muted mb-0.5">{{ info.category }}</p>
        <p class="text-sm text-accent mb-1">{{ info.name }}</p>
        <p class="text-xs text-muted mb-2">{{ info.description }}</p>
        <div v-if="info.effects.length > 0" class="flex flex-col space-y-1">
          <div v-for="(effect, index) in info.effects" :key="index" class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1">
            <span class="text-xs text-muted">{{ effect.label }}</span>
            <span class="text-xs text-accent">{{ effect.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { X } from 'lucide-vue-next'

  export interface MineEquipmentPropertyInfo {
    category: string
    name: string
    description: string
    effects: { label: string; value: string }[]
  }

  defineProps<{
    show: boolean
    info: MineEquipmentPropertyInfo | null
  }>()

  defineEmits<{
    close: []
  }>()
</script>
