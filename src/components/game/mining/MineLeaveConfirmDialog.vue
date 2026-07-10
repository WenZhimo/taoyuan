<template>
  <Transition name="panel-fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[32] p-4" @click.self="$emit('cancel')">
      <div class="game-panel max-w-xs w-full">
        <p class="text-sm text-accent mb-2">确认离开</p>
        <p class="text-xs text-muted mb-3">确定要离开{{ locationName }}吗？{{ leaveHint }}</p>
        <div class="flex space-x-1.5">
          <Button class="flex-1 justify-center" @click="$emit('cancel')">继续探索</Button>
          <Button class="flex-1 justify-center btn-danger" :icon="LogOut" @click="$emit('confirm')">确认离开</Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { LogOut } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  const props = defineProps<{
    show: boolean
    isSkullCavern: boolean
    leaveHint: string
  }>()

  defineEmits<{
    cancel: []
    confirm: []
  }>()

  const locationName = computed(() => (props.isSkullCavern ? '骷髅矿穴' : '矿洞'))
</script>
