<template>
  <Transition name="panel-fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[31] p-4">
      <div class="game-panel max-w-xs w-full">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm" :class="combatIsBoss ? 'text-danger' : 'text-accent'">
            {{ combatIsBoss ? 'BOSS 战' : '遭遇怪物' }}
          </p>
        </div>

        <MineCombatStatusPanel
          :player-hp="playerHp"
          :player-max-hp="playerMaxHp"
          :player-hp-percent="playerHpPercent"
          :player-is-low-hp="playerIsLowHp"
          :player-statuses="playerStatuses"
          :player-anim="playerAnim"
          :player-float="playerFloat"
          :monster-name="monsterName"
          :monster-hp="monsterHp"
          :monster-max-hp="monsterMaxHp"
          :monster-statuses="monsterStatuses"
          :monster-anim="monsterAnim"
          :monster-float="monsterFloat"
          :combat-is-boss="combatIsBoss"
          :get-status-detail="getStatusDetail"
        />

        <MineCombatActionsPanel
          :combat-anim-lock="combatAnimLock"
          :combat-is-boss="combatIsBoss"
          :weapon-attack="weaponAttack"
          :auto-combat-mode="autoCombatMode"
          :combat-item-count="combatItemCount"
          :preset-count="presetCount"
          :active-preset-name="activePresetName"
          @combat-action="$emit('combat-action', $event)"
          @set-auto-combat-mode="$emit('set-auto-combat-mode', $event)"
          @open-combat-items="$emit('open-combat-items')"
          @open-preset-list="$emit('open-preset-list')"
        />

        <MineCombatLogPanel :logs="combatLog" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import type { CombatAction, CombatStatusEffect } from '@/types'
  import MineCombatActionsPanel from './MineCombatActionsPanel.vue'
  import MineCombatLogPanel from './MineCombatLogPanel.vue'
  import MineCombatStatusPanel from './MineCombatStatusPanel.vue'

  interface CombatFloat {
    text: string
    key: number
  }

  type AutoCombatMode = 'off' | 'smart' | 'attack' | 'defend'

  defineProps<{
    show: boolean
    combatIsBoss: boolean
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
    combatAnimLock: boolean
    weaponAttack: number
    autoCombatMode: AutoCombatMode
    combatItemCount: number
    presetCount: number
    activePresetName: string
    combatLog: string[]
    getStatusDetail: (status: CombatStatusEffect) => string
  }>()

  defineEmits<{
    'combat-action': [action: CombatAction]
    'set-auto-combat-mode': [mode: AutoCombatMode]
    'open-combat-items': []
    'open-preset-list': []
  }>()
</script>
