<template>
  <div class="border border-accent/20 rounded-xs p-3">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-1.5 text-sm text-accent">
        <TreeDeciduous :size="14" />
        <span>果树</span>
      </div>
      <span class="text-xs text-muted">共 {{ trees.length }} 棵</span>
    </div>
    <div v-if="trees.length > 0" class="flex flex-col space-y-1.5 mb-2">
      <div v-for="tree in pagedTrees" :key="tree.id" class="border border-accent/10 rounded-xs px-3 py-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold" :class="tree.mature ? 'text-accent' : 'text-muted'">
            {{ getTreeName(tree.type) }}
          </span>
          <span v-if="tree.mature" class="text-[10px] text-muted">{{ tree.yearAge }}年</span>
        </div>
        <template v-if="!tree.mature">
          <div class="flex items-center space-x-2 mb-1.5">
            <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
              <div class="h-full rounded-xs bg-success transition-all" :style="{ width: fruitTreeGrowthWidth(tree.growthDays) }" />
            </div>
            <span class="text-[10px] text-muted whitespace-nowrap">{{ tree.growthDays }}/28天</span>
          </div>
          <div class="flex justify-end">
            <Button :icon-size="12" :icon="Axe" @click.stop="$emit('chop', { id: tree.id, type: tree.type })">砍伐</Button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between">
            <span v-if="tree.todayFruit" class="text-[10px] text-accent">今日已结果</span>
            <span v-else class="text-[10px] text-success">{{ getFruitSeason(tree.type) }}产果</span>
            <Button :icon-size="12" :icon="Axe" @click.stop="$emit('chop', { id: tree.id, type: tree.type })">砍伐</Button>
          </div>
        </template>
      </div>
      <PaginationControls
        :page="treePagination.safePage.value"
        :total="trees.length"
        :page-size="TREE_PAGE_SIZE"
        @update:page="treePagination.setPage"
      />
    </div>
    <div v-else class="flex flex-col items-center justify-center py-4 text-muted mb-2">
      <TreeDeciduous :size="32" class="text-muted/30" />
      <p class="text-xs mt-2">暂无果树</p>
      <p class="text-[10px] text-muted/60 mt-0.5">可在商店购买树苗种植</p>
    </div>
    <div v-if="plantableSaplings.length > 0" class="flex space-x-1.5 flex-wrap">
      <Button v-for="s in plantableSaplings" :key="s.saplingId" :icon-size="12" :icon="TreePine" @click="$emit('plant', s.type)">
        种{{ s.name }} (×{{ s.count }})
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Axe, TreeDeciduous, TreePine } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import PaginationControls from '@/components/game/PaginationControls.vue'
  import { DEFAULT_PAGE_SIZE, usePagination } from '@/composables/game/usePagination'
  import type { FruitTreeType, PlantedFruitTree } from '@/types'

  export interface FruitTreePlantOption {
    type: FruitTreeType
    saplingId: string
    name: string
    count: number
  }

  export interface FruitTreeChopTarget {
    id: number
    type: FruitTreeType
  }

  const props = defineProps<{
    trees: PlantedFruitTree[]
    plantableSaplings: FruitTreePlantOption[]
    getTreeName: (type: FruitTreeType) => string
    getFruitSeason: (type: FruitTreeType) => string
  }>()

  const TREE_PAGE_SIZE = DEFAULT_PAGE_SIZE
  const treePagination = usePagination(computed(() => props.trees), TREE_PAGE_SIZE)
  const pagedTrees = treePagination.pagedItems

  defineEmits<{
    plant: [treeType: FruitTreeType]
    chop: [target: FruitTreeChopTarget]
  }>()

  const fruitTreeGrowthWidth = (growthDays: number): string => `${Math.min(100, Math.floor((growthDays / 28) * 100))}%`
</script>
