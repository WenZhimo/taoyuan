<template>
  <div class="grid grid-cols-[1fr_auto_1fr] gap-1.5 mb-3 items-center">
    <div class="border border-accent/10 rounded-xs p-2 relative" :class="playerAnim">
      <p class="text-xs text-center mb-1.5 truncate">你</p>
      <div class="bg-bg rounded-xs h-1.5 mb-1">
        <div
          class="h-1.5 rounded-xs transition-all"
          :class="playerIsLowHp ? 'bg-danger' : 'bg-success'"
          :style="{ width: `${clampPercent(playerHpPercent)}%` }"
        />
      </div>
      <p class="text-[10px]" :class="playerIsLowHp ? 'text-danger' : 'text-muted'">
        {{ playerHp }}/{{ playerMaxHp }}
      </p>
      <div v-if="playerStatuses.length > 0" class="flex flex-wrap gap-0.5 mt-1">
        <span
          v-for="status in playerStatuses"
          :key="status.type"
          class="text-[9px] border border-accent/20 rounded-xs px-1 text-accent"
          :title="getStatusDetail(status)"
        >
          {{ status.name }}{{ status.remainingTurns === null ? '' : status.remainingTurns }}
        </span>
      </div>
      <span
        v-if="playerFloat"
        :key="playerFloat.key"
        class="absolute -top-1 right-0 text-danger text-[11px] font-bold anim-float-up pointer-events-none"
      >
        {{ playerFloat.text }}
      </span>
    </div>

    <span class="text-[10px] text-muted/40">VS</span>

    <div class="border border-danger/20 rounded-xs p-2 relative" :class="monsterAnim">
      <p class="text-xs text-center text-danger mb-1.5 truncate">
        {{ monsterName }}
        <span v-if="combatIsBoss" class="text-[10px]">[BOSS]</span>
      </p>
      <div class="bg-bg rounded-xs h-1.5 mb-1">
        <div
          class="h-1.5 bg-danger rounded-xs transition-all"
          :style="{ width: `${monsterHpPercent}%` }"
        />
      </div>
      <p class="text-[10px] text-muted">{{ monsterHp }}/{{ monsterMaxHp }}</p>
      <div v-if="monsterStatuses.length > 0" class="flex flex-wrap gap-0.5 mt-1">
        <span
          v-for="status in monsterStatuses"
          :key="status.type"
          class="text-[9px] border border-danger/20 rounded-xs px-1 text-danger"
          :title="getStatusDetail(status)"
        >
          {{ status.name }}{{ status.remainingTurns === null ? '' : status.remainingTurns }}
        </span>
      </div>
      <span
        v-if="monsterFloat"
        :key="monsterFloat.key"
        class="absolute -top-1 right-0 text-accent text-[11px] font-bold anim-float-up pointer-events-none"
      >
        {{ monsterFloat.text }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CombatStatusEffect } from '@/types'

  interface CombatFloat {
    text: string
    key: number
  }

  const props = defineProps<{
    playerHp: number
    playerMaxHp: number
    playerHpPercent: number
    playerIsLowHp: boolean
    playerStatuses: CombatStatusEffect[]
    playerAnim: string
    playerFloat: CombatFloat | null
    monsterName?: string
    monsterHp: number
    monsterMaxHp?: number
    monsterStatuses: CombatStatusEffect[]
    monsterAnim: string
    monsterFloat: CombatFloat | null
    combatIsBoss: boolean
    getStatusDetail: (status: CombatStatusEffect) => string
  }>()

  const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

  const monsterHpPercent = computed(() => {
    if (!props.monsterMaxHp) return 0
    return clampPercent((props.monsterHp / props.monsterMaxHp) * 100)
  })
</script>
