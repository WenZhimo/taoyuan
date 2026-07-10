<template>
  <Transition name="panel-fade">
    <div v-if="show && preset" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[33] p-4" @click.self="$emit('close')">
      <div class="game-panel max-w-xs w-full relative">
        <button class="absolute top-2 right-2 text-muted hover:text-text" data-testid="close-preset-detail" @click="$emit('close')">
          <X :size="14" />
        </button>
        <p class="text-sm text-accent mb-2">{{ preset.name }}</p>
        <div class="flex flex-col space-y-1">
          <div
            v-for="row in rows"
            :key="row.label"
            class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5"
            :class="row.defId ? 'cursor-pointer hover:bg-accent/5' : ''"
            :data-testid="`preset-equipment-${row.label}`"
            @click="row.defId && $emit('view-equipment', row.type, row.defId)"
          >
            <span class="text-xs text-muted">{{ row.label }}</span>
            <span class="text-xs" :class="row.defId ? 'text-accent' : 'text-muted/40'">{{ row.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { X } from 'lucide-vue-next'
  import { getHatById, getRingById, getShoeById } from '@/data'
  import { getWeaponById } from '@/data/weapons'
  import type { EquipmentPreset } from '@/stores/useInventoryStore'

  type EquipmentDetailType = 'weapon' | 'ring' | 'hat' | 'shoe'

  const props = defineProps<{
    show: boolean
    preset: EquipmentPreset | null
  }>()

  defineEmits<{
    close: []
    'view-equipment': [type: EquipmentDetailType, defId: string]
  }>()

  const getEquipmentName = (type: EquipmentDetailType, defId: string | null): string => {
    if (!defId) return '无'
    if (type === 'weapon') return getWeaponById(defId)?.name ?? '未知'
    if (type === 'ring') return getRingById(defId)?.name ?? '未知'
    if (type === 'hat') return getHatById(defId)?.name ?? '未知'
    return getShoeById(defId)?.name ?? '未知'
  }

  const rows = computed(() => {
    if (!props.preset) return []
    return [
      { label: '武器', type: 'weapon' as const, defId: props.preset.weaponDefId, name: getEquipmentName('weapon', props.preset.weaponDefId) },
      { label: '戒指1', type: 'ring' as const, defId: props.preset.ringSlot1DefId, name: getEquipmentName('ring', props.preset.ringSlot1DefId) },
      { label: '戒指2', type: 'ring' as const, defId: props.preset.ringSlot2DefId, name: getEquipmentName('ring', props.preset.ringSlot2DefId) },
      { label: '帽子', type: 'hat' as const, defId: props.preset.hatDefId, name: getEquipmentName('hat', props.preset.hatDefId) },
      { label: '鞋子', type: 'shoe' as const, defId: props.preset.shoeDefId, name: getEquipmentName('shoe', props.preset.shoeDefId) }
    ]
  })
</script>
