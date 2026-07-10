<template>
  <div class="mt-3 border border-accent/20 rounded-xs p-3">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-1.5 text-sm text-accent">
        <TreePine :size="14" />
        <span>野树</span>
      </div>
      <span class="text-xs text-muted">共 {{ trees.length }} 棵</span>
    </div>
    <div v-if="trees.length > 0" class="flex flex-col space-y-1.5 mb-2">
      <div v-for="tree in pagedTrees" :key="tree.id" class="border border-accent/10 rounded-xs px-3 py-2">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center space-x-1.5">
            <span class="text-xs font-bold" :class="tree.mature ? 'text-accent' : 'text-muted'">{{ getTreeName(tree.type) }}</span>
            <span v-if="tree.chopCount > 0" class="text-[10px] text-danger">伐{{ tree.chopCount }}/3</span>
          </div>
          <span v-if="!tree.mature" class="text-[10px] text-muted">生长中</span>
          <span v-else-if="tree.hasTapper && tree.tapReady" class="text-[10px] text-accent">可收取</span>
          <span v-else-if="tree.hasTapper" class="text-[10px] text-muted">采脂中</span>
          <span v-else class="text-[10px] text-success">已成熟</span>
        </div>
        <template v-if="!tree.mature">
          <div class="flex items-center space-x-2 mb-1.5">
            <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
              <div class="h-full rounded-xs bg-success transition-all" :style="{ width: wildTreeGrowthWidth(tree.type, tree.growthDays) }" />
            </div>
            <span class="text-[10px] text-muted whitespace-nowrap">
              {{ tree.growthDays }}/{{ getGrowthDays(tree.type) ?? '?' }}天
            </span>
          </div>
        </template>
        <template v-else-if="tree.hasTapper">
          <div class="flex items-center space-x-2 mb-1.5">
            <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
              <div
                class="h-full rounded-xs transition-all"
                :class="tree.tapReady ? 'bg-accent' : 'bg-success'"
                :style="{ width: tapProgressWidth(tree.type, tree.tapDaysElapsed, tree.tapReady) }"
              />
            </div>
            <span class="text-[10px] text-muted whitespace-nowrap">
              {{ tree.tapReady ? '已完成' : `${tree.tapDaysElapsed}/${getTapCycleDays(tree.type) ?? '?'}天` }}
            </span>
          </div>
        </template>
        <div class="flex items-center justify-end space-x-1.5">
          <Button
            v-if="tree.mature && tree.hasTapper && tree.tapReady"
            class="!bg-accent !text-bg"
            :icon-size="12"
            :icon="Gift"
            @click.stop="$emit('collect', tree.id)"
          >
            收取
          </Button>
          <Button
            v-if="tree.mature && !tree.hasTapper && hasTapper"
            :icon-size="12"
            :icon="Wrench"
            @click.stop="$emit('attach-tapper', tree.id)"
          >
            装采脂器
          </Button>
          <span v-if="tree.mature && !tree.hasTapper && !hasTapper" class="text-[10px] text-muted">需制造采脂器</span>
          <Button v-if="tree.mature" :icon-size="12" :icon="Axe" @click.stop="$emit('chop', tree.id)">伐木</Button>
        </div>
      </div>
      <PaginationControls
        :page="treePagination.safePage.value"
        :total="trees.length"
        :page-size="TREE_PAGE_SIZE"
        @update:page="treePagination.setPage"
      />
    </div>
    <div v-else class="flex flex-col items-center justify-center py-4 text-muted mb-2">
      <TreePine :size="32" class="text-muted/30" />
      <p class="text-xs mt-2">暂无野树</p>
      <p class="text-[10px] text-muted/60 mt-0.5">可使用野树种子种植</p>
    </div>
    <div v-if="plantableWildSeeds.length > 0" class="flex space-x-1.5 flex-wrap">
      <Button v-for="s in plantableWildSeeds" :key="s.type" :icon-size="12" :icon="TreePine" @click="$emit('plant', s.type)">
        种{{ s.name }} (×{{ s.count }})
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Axe, Gift, TreePine, Wrench } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import PaginationControls from '@/components/game/PaginationControls.vue'
  import { DEFAULT_PAGE_SIZE, usePagination } from '@/composables/game/usePagination'
  import type { PlantedWildTree, WildTreeType } from '@/types'

  export interface WildTreeSeedOption {
    type: WildTreeType
    seedItemId: string
    name: string
    count: number
  }

  const props = defineProps<{
    trees: PlantedWildTree[]
    plantableWildSeeds: WildTreeSeedOption[]
    hasTapper: boolean
    getTreeName: (type: WildTreeType) => string
    getGrowthDays: (type: WildTreeType) => number | undefined
    getTapCycleDays: (type: WildTreeType) => number | undefined
  }>()

  const TREE_PAGE_SIZE = DEFAULT_PAGE_SIZE
  const treePagination = usePagination(computed(() => props.trees), TREE_PAGE_SIZE)
  const pagedTrees = treePagination.pagedItems

  defineEmits<{
    plant: [treeType: WildTreeType]
    collect: [treeId: number]
    'attach-tapper': [treeId: number]
    chop: [treeId: number]
  }>()

  const wildTreeGrowthWidth = (type: WildTreeType, growthDays: number): string => {
    const totalDays = props.getGrowthDays(type) ?? 28
    return `${Math.min(100, Math.floor((growthDays / totalDays) * 100))}%`
  }

  const tapProgressWidth = (type: WildTreeType, tapDaysElapsed: number, tapReady: boolean): string => {
    if (tapReady) return '100%'
    const totalDays = props.getTapCycleDays(type) ?? 7
    return `${Math.floor((tapDaysElapsed / totalDays) * 100)}%`
  }
</script>
