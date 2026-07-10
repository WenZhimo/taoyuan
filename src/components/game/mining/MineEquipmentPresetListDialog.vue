<template>
  <Transition name="panel-fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[32] p-4" @click.self="$emit('close')">
      <div class="game-panel max-w-xs w-full relative">
        <button class="absolute top-2 right-2 text-muted hover:text-text" data-testid="close-preset-list" @click="$emit('close')">
          <X :size="14" />
        </button>
        <p class="text-sm text-accent mb-2">
          <BookMarked :size="14" class="inline" />
          装备方案
        </p>
        <div v-if="presets.length > 0" class="flex flex-col space-y-1.5 max-h-60 overflow-y-auto">
          <div
            v-for="preset in presets"
            :key="preset.id"
            class="border rounded-xs p-2"
            :class="activePresetId === preset.id ? 'border-accent/40' : 'border-accent/10'"
          >
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs text-accent truncate">{{ preset.name }}</p>
              <span v-if="activePresetId === preset.id" class="text-[10px] text-success shrink-0 ml-1">使用中</span>
            </div>
            <div class="grid grid-cols-2 gap-1">
              <Button
                class="py-0 px-1.5 text-[10px]"
                :disabled="activePresetId === preset.id"
                :data-testid="`apply-preset-${preset.id}`"
                @click="$emit('apply-preset', preset.id)"
              >
                使用
              </Button>
              <Button class="py-0 px-1.5 text-[10px]" :data-testid="`view-preset-${preset.id}`" @click="$emit('view-preset', preset.id)">
                查看
              </Button>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-6">
          <BookMarked :size="24" class="text-muted/30" />
          <p class="text-xs text-muted mt-1">暂无方案</p>
          <p class="text-[10px] text-muted/60 mt-0.5">前往背包装备页创建方案</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { BookMarked, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { EquipmentPreset } from '@/stores/useInventoryStore'

  defineProps<{
    show: boolean
    presets: EquipmentPreset[]
    activePresetId: string | null
  }>()

  defineEmits<{
    close: []
    'apply-preset': [id: string]
    'view-preset': [id: string]
  }>()
</script>
