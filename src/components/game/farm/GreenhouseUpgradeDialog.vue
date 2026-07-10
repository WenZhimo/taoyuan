<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="game-panel max-w-xs w-full relative">
      <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
        <X :size="14" />
      </button>
      <p class="text-accent text-sm mb-2">{{ upgrade.name }}</p>
      <p class="text-xs text-muted mb-3">{{ upgrade.description }}</p>

      <div class="border border-accent/10 rounded-xs p-2 mb-3">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-muted">费用</span>
          <span :class="canAffordMoney ? 'text-success' : 'text-danger'">{{ upgrade.cost }}文</span>
        </div>
        <div v-for="mat in materialRows" :key="mat.itemId" class="flex items-center justify-between text-xs">
          <span class="text-muted">{{ mat.name }}</span>
          <span :class="mat.current >= mat.required ? 'text-success' : 'text-danger'">{{ mat.current }}/{{ mat.required }}</span>
        </div>
      </div>

      <div class="flex space-x-2">
        <Button class="flex-1" @click="$emit('close')">取消</Button>
        <Button class="flex-1 !bg-accent !text-bg" :icon-size="12" :icon="ArrowUp" @click="$emit('confirm')">确认升级</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ArrowUp, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { GreenhouseUpgradeDef } from '@/data/buildings'

  export interface GreenhouseUpgradeMaterialRow {
    itemId: string
    name: string
    current: number
    required: number
  }

  defineProps<{
    canAffordMoney: boolean
    materialRows: GreenhouseUpgradeMaterialRow[]
    upgrade: GreenhouseUpgradeDef
  }>()

  defineEmits<{
    close: []
    confirm: []
  }>()
</script>
