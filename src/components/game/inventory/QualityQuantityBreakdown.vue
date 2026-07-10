<template>
  <div class="flex flex-wrap items-center gap-x-1 gap-y-0.5" role="list" :aria-label="ariaLabel">
    <template v-for="entry in entries" :key="entry.quality">
      <button
        v-if="interactive"
        type="button"
        role="listitem"
        class="rounded-xs border border-transparent px-0.5 text-xs leading-tight transition-colors hover:border-accent/30 hover:bg-accent/5"
        :class="[
          qualityTextClass(entry.quality),
          selectedQuality === entry.quality ? 'border-accent/50 bg-accent/10' : '',
          disabled ? 'cursor-not-allowed opacity-40' : ''
        ]"
        :disabled="disabled"
        :title="entryTitle(entry)"
        :aria-label="entryTitle(entry)"
        @click.stop="$emit('select-quality', entry.quality)"
      >
        &times;{{ entry.quantity }}
      </button>
      <span
        v-else
        role="listitem"
        class="text-xs leading-tight"
        :class="qualityTextClass(entry.quality)"
        :title="entryTitle(entry)"
        :aria-label="entryTitle(entry)"
      >
        &times;{{ entry.quantity }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { Quality } from '@/types'
  import type { QualityQuantityEntry } from '@/domain/inventory/qualityGroups'

  withDefaults(
    defineProps<{
      entries: QualityQuantityEntry[]
      interactive?: boolean
      selectedQuality?: Quality | null
      ariaLabel?: string
      disabled?: boolean
    }>(),
    {
      interactive: false,
      selectedQuality: null,
      ariaLabel: '各品质物品数量',
      disabled: false
    }
  )

  defineEmits<{
    'select-quality': [quality: Quality]
  }>()

  const QUALITY_LABELS: Record<Quality, string> = {
    normal: '普通',
    fine: '优良',
    excellent: '精品',
    supreme: '极品'
  }

  const qualityTextClass = (quality: Quality): string => {
    if (quality === 'fine') return 'text-quality-fine'
    if (quality === 'excellent') return 'text-quality-excellent'
    if (quality === 'supreme') return 'text-quality-supreme'
    return 'text-text'
  }

  const entryTitle = (entry: QualityQuantityEntry): string => {
    const lockedLabel = entry.locked ? '，已锁定' : ''
    return `${QUALITY_LABELS[entry.quality]}品质 ${entry.quantity} 个${lockedLabel}`
  }
</script>
