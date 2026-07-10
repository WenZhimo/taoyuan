<template>
  <Transition name="panel-fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[30] p-4" @click.self="$emit('close')">
      <div class="game-panel max-w-xs w-full">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-accent">
            <Map :size="14" class="inline" />
            矿洞地图
          </p>
          <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="$emit('close')" />
        </div>
        <p class="text-xs text-muted mb-2">安全点：{{ safePointFloor > 0 ? `第${safePointFloor}层` : '入口' }}</p>
        <div class="flex flex-col space-y-1.5">
          <div
            v-for="zone in zones"
            :key="zone.id"
            class="border rounded-xs p-2"
            :class="zone.isCurrentZone ? 'border-accent/40' : 'border-accent/10'"
          >
            <div class="flex justify-between items-center text-xs mb-1">
              <span :class="zone.isCurrentZone ? 'text-accent' : zone.reached ? 'text-text' : 'text-muted/40'">
                {{ zone.name }}
                <span class="text-muted ml-1">{{ zone.start }}-{{ zone.end }}层</span>
              </span>
              <span v-if="zone.bossDefeated" class="text-success flex items-center">
                <Check :size="12" class="mr-0.5" />
                {{ zone.bossName }}
              </span>
              <span v-else-if="zone.reached" class="text-danger/70">{{ zone.bossName }}</span>
              <span v-else class="text-muted/30">
                <Lock :size="12" class="inline" />
              </span>
            </div>
            <div class="bg-bg rounded-xs h-1.5">
              <div class="h-1.5 rounded-xs transition-all" :class="zone.barColor" :style="{ width: zone.progress + '%' }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { Check, Lock, Map, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  export interface MineMapZone {
    id: string
    name: string
    start: number
    end: number
    reached: boolean
    bossName: string
    bossDefeated: boolean
    progress: number
    isCurrentZone: boolean
    barColor: string
  }

  defineProps<{
    show: boolean
    safePointFloor: number
    zones: MineMapZone[]
  }>()

  defineEmits<{
    close: []
  }>()
</script>
