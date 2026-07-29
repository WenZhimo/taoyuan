<template>
  <div
    class="flex flex-wrap items-center"
    :class="variant === 'square' ? 'gap-x-1.5 gap-y-1' : 'gap-x-1 gap-y-0.5'"
    role="list"
    :aria-label="ariaLabel"
  >
    <template v-for="entry in entries" :key="entry.quality">
      <button
        v-if="interactive"
        type="button"
        role="listitem"
        class="transition-colors"
        :class="[
          interactiveClass(entry.quality),
          selectedQuality === entry.quality ? 'border-accent/50 bg-accent/10' : '',
          disabled ? 'cursor-not-allowed opacity-40' : ''
        ]"
        :disabled="disabled"
        :title="entryTitle(entry)"
        :aria-label="entryTitle(entry)"
        @click.stop="$emit('select-quality', entry.quality)"
      >
        <template v-if="variant === 'square'">
          <span class="inline-flex h-4 w-4 items-center justify-center rounded-[2px] border border-current text-[10px] font-semibold leading-none">
            {{ QUALITY_SHORT_LABELS[entry.quality] }}
          </span>
          <span>&times;{{ entry.quantity }}</span>
        </template>
        <template v-else>
          &times;{{ entry.quantity }}
        </template>
      </button>
      <span
        v-else
        role="listitem"
        :class="readonlyClass(entry.quality)"
        :title="entryTitle(entry)"
        :aria-label="entryTitle(entry)"
      >
        <template v-if="variant === 'square'">
          <span class="inline-flex h-4 w-4 items-center justify-center rounded-[2px] border border-current text-[10px] font-semibold leading-none">
            {{ QUALITY_SHORT_LABELS[entry.quality] }}
          </span>
          <span>&times;{{ entry.quantity }}</span>
        </template>
        <template v-else>
          &times;{{ entry.quantity }}
        </template>
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { Quality } from '@/types'
  import type { QualityQuantityEntry } from '@/domain/inventory/qualityGroups'

  const props = withDefaults(
    defineProps<{
      entries: QualityQuantityEntry[]
      interactive?: boolean
      selectedQuality?: Quality | null
      ariaLabel?: string
      disabled?: boolean
      variant?: 'text' | 'square'
    }>(),
    {
      interactive: false,
      selectedQuality: null,
      ariaLabel: '各品质物品数量',
      disabled: false,
      variant: 'text'
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

  const QUALITY_SHORT_LABELS: Record<Quality, string> = {
    normal: '普',
    fine: '良',
    excellent: '精',
    supreme: '极'
  }

  const qualityTextClass = (quality: Quality): string => {
    if (quality === 'fine') return 'text-quality-fine'
    if (quality === 'excellent') return 'text-quality-excellent'
    if (quality === 'supreme') return 'text-quality-supreme'
    return 'text-text'
  }

  const interactiveClass = (quality: Quality): string => {
    const color = qualityTextClass(quality)
    if (props.variant === 'square') {
      return `inline-flex items-center gap-1 rounded-xs border border-accent/15 bg-bg/30 px-1 py-0.5 text-[10px] leading-tight hover:border-accent/60 hover:bg-accent/10 ${color}`
    }
    return `rounded-xs border border-transparent px-0.5 text-xs leading-tight hover:border-accent/30 hover:bg-accent/5 ${color}`
  }

  const readonlyClass = (quality: Quality): string => {
    const color = qualityTextClass(quality)
    if (props.variant === 'square') {
      return `inline-flex items-center gap-1 text-[10px] leading-tight ${color}`
    }
    return `text-xs leading-tight ${color}`
  }

  const entryTitle = (entry: QualityQuantityEntry): string => {
    const lockedLabel = entry.locked ? '，已锁定' : ''
    return `${QUALITY_LABELS[entry.quality]}品质 ${entry.quantity} 个${lockedLabel}`
  }
</script>
