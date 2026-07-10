<template>
  <Transition name="panel-fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[30] p-4" @click.self="$emit('close')">
      <div class="game-panel max-w-xs w-full relative">
        <button class="absolute top-2 right-2 text-muted hover:text-text" data-testid="close-elevator" @click="$emit('close')">
          <X :size="14" />
        </button>

        <p class="text-sm text-accent mb-1">
          <Pickaxe :size="14" class="inline" />
          探索
        </p>
        <p class="text-xs text-muted mb-2">安全点：{{ safePointFloor > 0 ? `第${safePointFloor}层` : '入口' }}</p>

        <button
          class="border rounded-xs px-3 py-1.5 mb-2 w-full text-xs"
          :class="autoExplore ? 'border-accent text-accent bg-accent/10' : 'border-accent/20 text-muted'"
          type="button"
          data-testid="toggle-auto-explore"
          @click="toggleAutoExplore"
        >
          自动探索：{{ autoExplore ? '开启，选择起点后开始' : '关闭' }}
        </button>

        <div
          class="flex items-center justify-between border border-accent/30 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5 mb-2"
          data-testid="enter-mine-front"
          @click="enterMine(undefined)"
        >
          <span class="text-xs text-accent">进入矿洞</span>
          <span class="text-xs text-muted">第{{ safePointFloor + 1 }}层</span>
        </div>

        <div v-if="elevatorZones.length > 0" class="max-h-48 overflow-y-auto mb-2">
          <div v-for="zone in elevatorZones" :key="zone.name" class="mb-2 last:mb-0">
            <p class="text-[10px] text-muted mb-1">{{ zone.name }}</p>
            <div class="flex flex-wrap space-x-1">
              <Button v-for="sp in zone.floors" :key="sp" class="py-0.5 px-0 min-w-9 justify-center" :data-testid="`enter-mine-floor-${sp}`" @click="enterMine(sp)">
                {{ sp + 1 }}
              </Button>
            </div>
          </div>
        </div>

        <div v-if="isSkullCavernUnlocked">
          <div
            class="flex items-center justify-between border border-danger/30 rounded-xs px-3 py-1.5 mb-2 cursor-pointer hover:bg-danger/5"
            data-testid="enter-skull-front"
            @click="enterSkullCavern(undefined)"
          >
            <span class="text-xs text-danger">
              <Skull :size="12" class="inline" />
              进入骷髅矿穴
            </span>
            <span class="text-xs text-muted">第{{ skullSafePointFloor + 1 }}层</span>
          </div>
          <div v-if="skullElevatorFloors.length > 0" class="max-h-48 overflow-y-auto grid-cols-5 grid m">
            <Button
              v-for="sp in skullElevatorFloors"
              :key="sp"
              class="py-0.5 px-0 min-w-9 justify-center !border-danger/30 !text-danger mb-1 mr-1"
              :data-testid="`enter-skull-floor-${sp}`"
              @click="enterSkullCavern(sp)"
            >
              {{ sp + 1 }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { Pickaxe, Skull, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'

  export interface MineElevatorZone {
    name: string
    floors: number[]
  }

  const props = defineProps<{
    show: boolean
    autoExplore: boolean
    safePointFloor: number
    elevatorZones: MineElevatorZone[]
    isSkullCavernUnlocked: boolean
    skullSafePointFloor: number
    skullElevatorFloors: number[]
  }>()

  const emit = defineEmits<{
    close: []
    'update:autoExplore': [value: boolean]
    'enter-mine': [startFrom: number | undefined, autoExplore: boolean]
    'enter-skull-cavern': [startFrom: number | undefined, autoExplore: boolean]
  }>()

  const toggleAutoExplore = () => {
    emit('update:autoExplore', !props.autoExplore)
  }

  const enterMine = (startFrom?: number) => {
    emit('enter-mine', startFrom, props.autoExplore)
  }

  const enterSkullCavern = (startFrom?: number) => {
    emit('enter-skull-cavern', startFrom, props.autoExplore)
  }
</script>
