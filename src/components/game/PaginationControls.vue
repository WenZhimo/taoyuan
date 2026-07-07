<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between gap-2 pt-1 text-[10px] text-muted">
    <Button class="py-0 px-1.5" :disabled="safePage <= 1" @click="emitPage(safePage - 1)">上一页</Button>
    <span class="shrink-0">第 {{ safePage }}/{{ totalPages }} 页 · {{ total }} 项</span>
    <Button class="py-0 px-1.5" :disabled="safePage >= totalPages" @click="emitPage(safePage + 1)">下一页</Button>
  </div>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue'
  import Button from '@/components/game/Button.vue'

  const props = defineProps<{
    page: number
    total: number
    pageSize?: number
  }>()

  const emit = defineEmits<{
    'update:page': [page: number]
  }>()

  const size = computed(() => Math.max(1, props.pageSize ?? 50))
  const totalPages = computed(() => Math.max(1, Math.ceil(props.total / size.value)))
  const safePage = computed(() => Math.min(Math.max(1, props.page), totalPages.value))

  const emitPage = (page: number) => {
    emit('update:page', Math.min(Math.max(1, page), totalPages.value))
  }

  watch(safePage, page => {
    if (page !== props.page) emit('update:page', page)
  })
</script>
