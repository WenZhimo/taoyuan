<template>
  <div class="border border-accent/20 rounded-xs p-3 mb-4">
    <div class="flex items-center justify-between mb-2">
      <p class="text-sm text-accent">
        <Swords :size="14" class="inline" />
        装备与状态
      </p>
    </div>
    <div class="flex flex-col space-y-1">
      <div class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5">
        <span class="text-xs">武器</span>
        <span class="text-xs text-accent">{{ weaponDisplayName }}</span>
      </div>
      <div class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5">
        <span class="text-xs">攻击力</span>
        <span class="text-xs text-accent">{{ weaponAttack }}</span>
      </div>
      <div class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5">
        <span class="text-xs">类型 · 暴击</span>
        <span class="text-xs text-muted">{{ weaponTypeName }} · {{ critRateDisplay }}</span>
      </div>
      <div v-if="weaponEnchantName" class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5 gap-2">
        <span class="text-xs">附魔</span>
        <div class="flex items-center justify-end gap-1 min-w-0">
          <span class="text-xs text-success truncate">{{ weaponEnchantName }}</span>
          <Button class="py-0 px-1 shrink-0" @click="$emit('view-enchantment-detail')">详情</Button>
        </div>
      </div>
      <div class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5">
        <span class="text-xs">HP</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 h-1.5 bg-bg rounded-xs border border-accent/10">
            <div class="h-full rounded-xs transition-all" :class="isLowHp ? 'bg-danger' : 'bg-success'" :style="{ width: hpPercent + '%' }" />
          </div>
          <span class="text-xs" :class="isLowHp ? 'text-danger' : 'text-muted'">
            {{ hp }}/{{ maxHp }}
          </span>
        </div>
      </div>
      <div class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5">
        <span class="text-xs">体力</span>
        <span class="text-xs text-muted">{{ stamina }}/{{ maxStamina }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Swords } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  defineProps<{
    weaponDisplayName: string
    weaponAttack: number
    weaponTypeName: string
    critRateDisplay: string
    weaponEnchantName: string
    hp: number
    maxHp: number
    hpPercent: number
    isLowHp: boolean
    stamina: number
    maxStamina: number
  }>()

  defineEmits<{
    'view-enchantment-detail': []
  }>()
</script>
