import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTreeActions } from '@/composables/farm/useTreeActions'
import type { UseTreeActionsOptions } from '@/composables/farm/useTreeActions'
import { ACTION_TIME_COSTS } from '@/data/timeConstants'
import { FRUIT_TREE_DEFS } from '@/data/fruitTrees'
import { WILD_TREE_DEFS } from '@/data/wildTrees'
import { addLog } from '@/composables/useGameLog'
import type { PlantedWildTree } from '@/types'

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn()
}))

const makeWildTree = (overrides: Partial<PlantedWildTree> = {}): PlantedWildTree => ({
  id: 1,
  type: 'pine',
  growthDays: 21,
  mature: true,
  hasTapper: false,
  tapDaysElapsed: 0,
  tapReady: false,
  chopCount: 0,
  ...overrides
})

const createTreeActions = (overrides: Partial<UseTreeActionsOptions> = {}) => {
  const chopFruitTreeTarget = ref(overrides.chopFruitTreeTarget?.value ?? null)
  const chopWildTreeTarget = ref(overrides.chopWildTreeTarget?.value ?? null)
  const wildTrees = ref<PlantedWildTree[]>([makeWildTree()])

  const options: UseTreeActionsOptions = {
    chopFruitTreeTarget,
    chopWildTreeTarget,
    wildTrees: () => wildTrees.value,
    hasItem: vi.fn(itemId => itemId === 'sapling_peach' || itemId === 'pine_cone' || itemId === 'tapper'),
    getItemCount: vi.fn(itemId => (itemId === 'tapper' ? 1 : 3)),
    addItem: vi.fn(() => true),
    removeItem: vi.fn(() => true),
    isToolAvailable: vi.fn(() => true),
    getToolStaminaMultiplier: vi.fn(() => 1),
    isPastBedtime: vi.fn(() => false),
    advanceTime: vi.fn(() => ({ message: '过了10分钟' })),
    consumeStamina: vi.fn(() => true),
    getStaminaReduction: vi.fn(() => 0),
    hasLumberjackBonus: vi.fn(() => false),
    plantFruitTree: vi.fn(() => true),
    removeFruitTree: vi.fn(() => 5),
    plantWildTree: vi.fn(() => true),
    attachTapper: vi.fn(() => true),
    collectTapProduct: vi.fn(() => 'pine_resin'),
    chopWildTree: vi.fn(() => ({ removed: false })),
    ...overrides
  }

  return {
    actions: useTreeActions(options),
    chopFruitTreeTarget,
    chopWildTreeTarget,
    options,
    wildTrees
  }
}

describe('useTreeActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0.75)
  })

  it('plants fruit trees, removes a sapling, and advances time', () => {
    const { actions, options } = createTreeActions()

    actions.handlePlantTree('peach_tree')

    expect(options.removeItem).toHaveBeenCalledWith('sapling_peach')
    expect(options.plantFruitTree).toHaveBeenCalledWith('peach_tree')
    expect(options.advanceTime).toHaveBeenCalledWith(ACTION_TIME_COSTS.plantTree)
    expect(addLog).toHaveBeenCalledWith('种下了桃树苗，需28天成熟。')
  })

  it('restores the sapling when fruit tree planting fails', () => {
    const { actions, options } = createTreeActions({
      plantFruitTree: vi.fn(() => false)
    })

    actions.handlePlantTree('peach_tree')

    expect(options.addItem).toHaveBeenCalledWith('sapling_peach')
    expect(options.advanceTime).not.toHaveBeenCalled()
    expect(addLog).toHaveBeenCalledWith('种植果树失败，树苗已退回。')
  })

  it('chops a confirmed fruit tree with stamina and axe checks', () => {
    const { actions, chopFruitTreeTarget, options } = createTreeActions()
    chopFruitTreeTarget.value = { id: 4, type: 'peach_tree' }

    actions.confirmChopFruitTree()

    expect(chopFruitTreeTarget.value).toBeNull()
    expect(options.consumeStamina).toHaveBeenCalledWith(5)
    expect(options.removeFruitTree).toHaveBeenCalledWith(4)
    expect(options.addItem).toHaveBeenCalledWith('wood', 5)
    expect(options.advanceTime).toHaveBeenCalledWith(ACTION_TIME_COSTS.chopTree)
  })

  it('plants wild trees and restores seeds when planting fails', () => {
    const { actions, options } = createTreeActions({
      plantWildTree: vi.fn(() => false)
    })

    actions.handlePlantWildTree('pine')

    expect(options.removeItem).toHaveBeenCalledWith('pine_cone')
    expect(options.addItem).toHaveBeenCalledWith('pine_cone')
    expect(addLog).toHaveBeenCalledWith('种植野树失败，种子已退回。')
  })

  it('handles tapper attach, tap product collection, and wild tree chop target selection', () => {
    const { actions, chopWildTreeTarget, options } = createTreeActions()

    actions.handleAttachTapper(1)
    actions.handleCollectTapProduct(1)
    actions.handleChopTree(1)

    expect(options.removeItem).toHaveBeenCalledWith('tapper')
    expect(options.attachTapper).toHaveBeenCalledWith(1)
    expect(options.collectTapProduct).toHaveBeenCalledWith(1)
    expect(options.addItem).toHaveBeenCalledWith('pine_resin')
    expect(addLog).toHaveBeenCalledWith('收取了松脂！')
    expect(chopWildTreeTarget.value).toEqual({ id: 1, type: 'pine', chopCount: 0 })
  })

  it('lists every owned fruit and wild tree from the registry facade', () => {
    const { actions } = createTreeActions({
      hasItem: vi.fn(() => true),
      getItemCount: vi.fn(() => 2)
    })

    expect(actions.plantableSaplings.value).toEqual(FRUIT_TREE_DEFS.map(tree => ({
      type: tree.type,
      saplingId: tree.saplingId,
      name: tree.name,
      count: 2
    })))
    expect(actions.plantableWildSeeds.value).toEqual(WILD_TREE_DEFS.map(tree => ({
      type: tree.type,
      seedItemId: tree.seedItemId,
      name: tree.name,
      count: 2
    })))
    expect(actions.getTreeFruitSeason('peach_tree')).toBe('春')
    expect(actions.getWildTreeGrowthDays('camphor')).toBe(28)
    expect(actions.getWildTreeTapCycleDays('mulberry')).toBe(4)
  })

  it('chops wild trees with lumberjack bonus and advances time', () => {
    const { actions, chopWildTreeTarget, options } = createTreeActions({
      hasLumberjackBonus: vi.fn(() => true),
      chopWildTree: vi.fn(() => ({ removed: true }))
    })
    chopWildTreeTarget.value = { id: 1, type: 'pine', chopCount: 2 }

    actions.confirmChopWildTree()

    expect(options.consumeStamina).toHaveBeenCalledWith(5)
    expect(options.addItem).toHaveBeenCalledWith('wood', 4)
    expect(options.chopWildTree).toHaveBeenCalledWith(1)
    expect(options.advanceTime).toHaveBeenCalledWith(ACTION_TIME_COSTS.chopTree)
    expect(addLog).toHaveBeenCalledWith('伐木获得了4个木材，松树已被砍倒消失了。（体力-5）')
  })
})
