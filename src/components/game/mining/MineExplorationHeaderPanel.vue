<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <p class="text-sm text-accent">
        第{{ activeFloorNum }}层
        <span v-if="!isInSkullCavern" class="text-muted">{{ zoneName }}</span>
        <span v-if="currentFloorSpecial === 'mushroom'" class="text-success ml-1">蘑菇洞穴</span>
        <span v-if="currentFloorSpecial === 'treasure'" class="text-accent ml-1">宝箱层</span>
        <span v-if="currentFloorSpecial === 'infested'" class="text-danger ml-1">感染层</span>
        <span v-if="currentFloorSpecial === 'dark'" class="text-muted ml-1">暗河层</span>
        <span v-if="currentFloorSpecial === 'boss'" class="text-danger ml-1">BOSS层</span>
      </p>
      <Button class="py-0 px-1" :icon="X" :icon-size="12" data-testid="request-leave" @click="$emit('request-leave')" />
    </div>

    <div class="text-xs text-muted mb-2 border-b border-accent/20 pb-2 space-y-0.5">
      <p>
        <Swords :size="12" class="inline" />
        {{ weaponDisplayName }}（{{ weaponTypeName }} · 攻击 {{ weaponAttack }} · 暴击 {{ critRateDisplay }}）
      </p>
      <div v-if="weaponEnchantName" class="flex items-center gap-1 text-success">
        <span class="truncate">附魔：{{ weaponEnchantName }}</span>
        <Button class="py-0 px-1 shrink-0" data-testid="view-enchantment-detail" @click="$emit('view-enchantment-detail')">详情</Button>
      </div>
    </div>

    <p v-if="currentFloorSpecial === 'infested' && remainingMonsters > 0" class="text-xs text-danger mb-2">
      感染层：还需击败 {{ remainingMonsters }} 只怪物
    </p>
    <p v-if="autoExploreActive" class="text-xs text-accent mb-2 border border-accent/30 rounded-xs px-2 py-1">
      自动探索中：将自动连战并前往下一层
    </p>

    <div v-if="bombModeActive" class="text-xs text-accent mb-2 border border-accent/30 rounded-xs px-2 py-1">
      <Zap :size="12" class="inline" />
      炸弹模式：点击已探索格子作为爆炸中心
      <button class="text-muted ml-2 underline" data-testid="cancel-bomb-mode" @click="$emit('cancel-bomb-mode')">取消</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Swords, X, Zap } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  defineProps<{
    activeFloorNum: number
    isInSkullCavern: boolean
    zoneName: string
    currentFloorSpecial: string | null
    remainingMonsters: number
    autoExploreActive: boolean
    bombModeActive: boolean
    weaponDisplayName: string
    weaponTypeName: string
    weaponAttack: number
    critRateDisplay: string
    weaponEnchantName: string
  }>()

  defineEmits<{
    'request-leave': []
    'view-enchantment-detail': []
    'cancel-bomb-mode': []
  }>()
</script>
