<template>
  <Transition name="panel-fade">
    <div v-if="saveStore.isBusy" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
      <div class="game-panel flex w-full max-w-xs items-center justify-center space-x-2 py-4 text-sm text-accent">
        <LoaderCircle :size="18" class="animate-spin" />
        <span>{{ saveStore.operationLabel }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { LoaderCircle } from 'lucide-vue-next'
  import { useSaveStore } from '@/stores/useSaveStore'

  const saveStore = useSaveStore()
</script>
