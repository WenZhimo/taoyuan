<template>
  <div class="mb-3 space-y-1">
    <div class="grid grid-cols-3 gap-1">
      <button
        class="flex flex-col items-center border border-accent/20 rounded-xs py-1.5"
        :class="combatAnimLock ? 'opacity-50' : 'cursor-pointer hover:bg-accent/5'"
        type="button"
        :disabled="combatAnimLock"
        data-testid="combat-attack"
        @click="$emit('combat-action', 'attack')"
      >
        <span class="text-xs">
          <Swords :size="12" class="inline" />
          攻击
        </span>
        <span class="text-[10px] text-muted">{{ weaponAttack }}攻击力</span>
      </button>
      <button
        class="flex flex-col items-center border border-accent/20 rounded-xs py-1.5"
        :class="combatAnimLock ? 'opacity-50' : 'cursor-pointer hover:bg-accent/5'"
        type="button"
        :disabled="combatAnimLock"
        data-testid="combat-defend"
        @click="$emit('combat-action', 'defend')"
      >
        <span class="text-xs">
          <Shield :size="12" class="inline" />
          防御
        </span>
        <span class="text-[10px] text-muted">减免伤害</span>
      </button>
      <button
        class="flex flex-col items-center border rounded-xs py-1.5"
        :class="combatIsBoss || combatAnimLock ? 'border-accent/10 opacity-50' : 'border-danger/20 cursor-pointer hover:bg-danger/5'"
        type="button"
        :disabled="combatIsBoss || combatAnimLock"
        data-testid="combat-flee"
        @click="$emit('combat-action', 'flee')"
      >
        <span class="text-xs" :class="combatIsBoss ? 'text-muted' : 'text-danger'">
          <MoveRight :size="12" class="inline" />
          {{ combatIsBoss ? '无法' : '逃跑' }}
        </span>
        <span v-if="combatIsBoss" class="text-[10px] text-muted/40">BOSS战</span>
      </button>
    </div>

    <div class="grid grid-cols-4 gap-1">
      <button
        class="border rounded-xs py-1 text-[10px]"
        :class="autoCombatMode === 'smart' ? 'border-accent text-accent bg-accent/10' : 'border-accent/20 text-muted'"
        type="button"
        data-testid="auto-combat-smart"
        @click="$emit('set-auto-combat-mode', autoCombatMode === 'smart' ? 'off' : 'smart')"
      >
        智能
      </button>
      <button
        class="border rounded-xs py-1 text-[10px]"
        :class="autoCombatMode === 'attack' ? 'border-danger text-danger bg-danger/10' : 'border-accent/20 text-muted'"
        type="button"
        data-testid="auto-combat-attack"
        @click="$emit('set-auto-combat-mode', autoCombatMode === 'attack' ? 'off' : 'attack')"
      >
        攻击
      </button>
      <button
        class="border rounded-xs py-1 text-[10px]"
        :class="autoCombatMode === 'defend' ? 'border-success text-success bg-success/10' : 'border-accent/20 text-muted'"
        type="button"
        data-testid="auto-combat-defend"
        @click="$emit('set-auto-combat-mode', autoCombatMode === 'defend' ? 'off' : 'defend')"
      >
        防御
      </button>
      <button
        class="border rounded-xs py-1 text-[10px]"
        :class="autoCombatMode === 'off' ? 'border-accent/20 text-muted' : 'border-accent text-accent'"
        type="button"
        data-testid="auto-combat-off"
        @click="$emit('set-auto-combat-mode', 'off')"
      >
        关闭
      </button>
    </div>

    <button
      v-if="combatItemCount > 0"
      class="flex w-full items-center justify-between border border-success/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-success/5"
      type="button"
      data-testid="open-combat-items"
      @click="$emit('open-combat-items')"
    >
      <span class="text-xs text-success">
        <Backpack :size="12" class="inline" />
        使用道具
      </span>
      <span class="text-xs text-muted">{{ combatItemCount }}种</span>
    </button>

    <button
      v-if="presetCount > 0"
      class="flex w-full items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
      type="button"
      data-testid="open-preset-list"
      @click="$emit('open-preset-list')"
    >
      <span class="text-xs text-accent">
        <BookMarked :size="12" class="inline" />
        切换装备方案
      </span>
      <span v-if="activePresetName" class="text-[10px] text-muted">
        {{ activePresetName }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { Backpack, BookMarked, MoveRight, Shield, Swords } from 'lucide-vue-next'
  import type { CombatAction } from '@/types'

  type AutoCombatMode = 'off' | 'smart' | 'attack' | 'defend'

  defineProps<{
    combatAnimLock: boolean
    combatIsBoss: boolean
    weaponAttack: number
    autoCombatMode: AutoCombatMode
    combatItemCount: number
    presetCount: number
    activePresetName: string
  }>()

  defineEmits<{
    'combat-action': [action: CombatAction]
    'set-auto-combat-mode': [mode: AutoCombatMode]
    'open-combat-items': []
    'open-preset-list': []
  }>()
</script>
