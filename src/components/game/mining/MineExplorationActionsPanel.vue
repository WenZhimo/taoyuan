<template>
  <div class="flex flex-col space-y-1 mb-3">
    <div
      v-if="sweepPreview.targetFloor"
      class="flex items-center justify-between border rounded-xs px-3 py-1.5"
      :class="canSweepToSafePoint ? 'border-accent/30 cursor-pointer hover:bg-accent/5' : 'border-danger/20 opacity-60'"
      data-testid="sweep-to-safe-point"
      @click="canSweepToSafePoint && $emit('sweep-to-safe-point')"
    >
      <span class="text-xs" :class="canSweepToSafePoint ? 'text-accent' : 'text-danger'">
        <ChevronDown :size="12" class="inline" />
        扫荡至安全点
      </span>
      <span class="text-xs text-muted">HP-{{ sweepPreview.estimatedDamage }} · 第{{ sweepPreview.targetFloor }}层</span>
    </div>
    <div
      v-if="remainingCombatTiles > 0"
      class="flex items-center justify-between border border-danger/30 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-danger/5"
      data-testid="start-chain-battle"
      @click="$emit('start-chain-battle')"
    >
      <span class="text-xs text-danger">
        <Swords :size="12" class="inline" />
        连战本层
      </span>
      <span class="text-xs text-muted">{{ remainingCombatTiles }}个敌人</span>
    </div>
    <div
      class="flex items-center justify-between border rounded-xs px-3 py-1.5 cursor-pointer"
      :class="autoExploreActive ? 'border-danger/30 hover:bg-danger/5' : 'border-accent/20 hover:bg-accent/5'"
      data-testid="toggle-auto-explore"
      @click="$emit('toggle-auto-explore')"
    >
      <span class="text-xs" :class="autoExploreActive ? 'text-danger' : 'text-accent'">
        <Swords :size="12" class="inline" />
        {{ autoExploreActive ? '停止自动探索' : '自动探索' }}
      </span>
      <span class="text-xs text-muted">直到倒下或手动停止</span>
    </div>
    <div v-for="bombItem in bombs" :key="bombItem.id">
      <div
        class="flex items-center justify-between border rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
        :class="activeBombId === bombItem.id ? 'border-accent text-accent' : 'border-accent/20'"
        :data-testid="`toggle-bomb-${bombItem.id}`"
        @click="$emit('toggle-bomb-mode', bombItem.id)"
      >
        <span class="text-xs">
          <Zap :size="12" class="inline" />
          {{ bombItem.name }}
        </span>
        <span class="text-xs text-muted">&times;{{ bombItem.count }}</span>
      </div>
    </div>
    <div
      v-if="hasMonsterLure"
      class="flex items-center justify-between border border-danger/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-danger/5"
      data-testid="use-monster-lure"
      @click="$emit('use-monster-lure')"
    >
      <span class="text-xs text-danger">
        <Skull :size="12" class="inline" />
        怪物诱饵
      </span>
      <span class="text-xs text-muted">&times;{{ monsterLureCount }}</span>
    </div>
    <div
      v-if="combatItemCount > 0"
      class="flex items-center justify-between border border-success/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-success/5"
      data-testid="open-combat-items"
      @click="$emit('open-combat-items')"
    >
      <span class="text-xs text-success">
        <Backpack :size="12" class="inline" />
        使用道具
      </span>
      <span class="text-xs text-muted">{{ combatItemCount }}种</span>
    </div>
    <div
      v-if="stairsFound"
      class="flex items-center justify-between border border-success/30 rounded-xs px-3 py-1.5"
      :class="stairsUsable ? 'cursor-pointer hover:bg-success/5' : 'opacity-50'"
      data-testid="next-floor"
      @click="stairsUsable && $emit('next-floor')"
    >
      <span class="text-xs text-success">
        <ChevronDown :size="12" class="inline" />
        下一层
      </span>
      <span v-if="!stairsUsable" class="text-xs text-muted">楼梯不可用</span>
    </div>
    <div
      class="flex items-center justify-between border border-danger/30 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-danger/5"
      data-testid="request-leave"
      @click="$emit('request-leave')"
    >
      <span class="text-xs text-danger">
        <LogOut :size="12" class="inline" />
        {{ isInSkullCavern ? '离开骷髅矿穴' : '离开矿洞' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Backpack, ChevronDown, LogOut, Skull, Swords, Zap } from 'lucide-vue-next'

  export interface MineExplorationBombOption {
    id: string
    name: string
    count: number
  }

  export interface MineSweepPreviewSummary {
    targetFloor: number | null
    estimatedDamage: number
  }

  defineProps<{
    sweepPreview: MineSweepPreviewSummary
    canSweepToSafePoint: boolean
    remainingCombatTiles: number
    autoExploreActive: boolean
    bombs: MineExplorationBombOption[]
    activeBombId: string | null
    hasMonsterLure: boolean
    monsterLureCount: number
    combatItemCount: number
    stairsFound: boolean
    stairsUsable: boolean
    isInSkullCavern: boolean
  }>()

  defineEmits<{
    'sweep-to-safe-point': []
    'start-chain-battle': []
    'toggle-auto-explore': []
    'toggle-bomb-mode': [bombId: string]
    'use-monster-lure': []
    'open-combat-items': []
    'next-floor': []
    'request-leave': []
  }>()
</script>
