import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { FarmPlot, FarmSize, Season, Quality, GreenhousePlotTimer } from '@/types'
import type { SprinklerType, FertilizerType, RetainingSoilType, PlantedFruitTree, FruitTreeType, WildTreeType, PlantedWildTree } from '@/types'
import type { SeedGenetics } from '@/types/breeding'
import { getCropById } from '@/data'
import { getFertilizerById, getSprinklerById } from '@/data/processing'
import {
  getOfficialFruitTreeById,
  getOfficialWildTreeById
} from '@/domain/mods/contentAccess'
import { GREENHOUSE_PLOT_COUNT } from '@/data/buildings'
import { useWalletStore } from './useWalletStore'
import { useGameStore } from './useGameStore'
import { useHiddenNpcStore } from './useHiddenNpcStore'
import { forEachEndDayChunk } from '@/domain/endDay/types'
import type { EndDayChunkOptions } from '@/domain/endDay/types'
import { isRetainingSoilType } from '@/domain/farm/soil'
import {
  createGreenhousePlotFromTimer,
  createGreenhousePlotTimer,
  greenhousePlotState,
  mergeGreenhousePlotTimers
} from '@/domain/farm/greenhouseTimers'

/** 已放置洒水器 */
export interface PlacedSprinkler {
  id: string
  type: SprinklerType
  plotId: number
}

/** 创建初始地块 */
const createPlots = (size: FarmSize): FarmPlot[] => {
  const total = size * size
  return Array.from({ length: total }, (_, i) => ({
    id: i,
    state: 'wasteland' as const,
    cropId: null,
    growthDays: 0,
    watered: false,
    unwateredDays: 0,
    fertilizer: null,
    retainingSoil: null,
    harvestCount: 0,
    giantCropGroup: null,
    seedGenetics: null,
    infested: false,
    infestedDays: 0,
    weedy: false,
    weedyDays: 0
  }))
}

const createGreenhousePlot = (id: number): FarmPlot => ({
  id,
  state: 'tilled',
  cropId: null,
  growthDays: 0,
  watered: false,
  unwateredDays: 0,
  fertilizer: null,
  retainingSoil: null,
  harvestCount: 0,
  giantCropGroup: null,
  seedGenetics: null,
  infested: false,
  infestedDays: 0,
  weedy: false,
  weedyDays: 0
})

const normalizeGreenhousePlot = (plot: any): FarmPlot => ({
  ...createGreenhousePlot(plot.id ?? 0),
  ...plot,
  fertilizer: plot.fertilizer ?? null,
  retainingSoil: plot.retainingSoil ?? null,
  harvestCount: plot.harvestCount ?? 0,
  giantCropGroup: plot.giantCropGroup ?? null,
  seedGenetics: plot.seedGenetics ?? null,
  infested: plot.infested ?? false,
  infestedDays: plot.infestedDays ?? 0,
  weedy: plot.weedy ?? false,
  weedyDays: plot.weedyDays ?? 0
})

export const useFarmStore = defineStore('farm', () => {
  const farmSize = ref<FarmSize>(4)
  const plots = ref<FarmPlot[]>(createPlots(4))
  const sprinklers = ref<PlacedSprinkler[]>([])
  const fruitTrees = ref<PlantedFruitTree[]>([])
  const greenhouseTimers = ref<GreenhousePlotTimer[]>([])
  const greenhousePlotCount = ref(0)
  const greenhouseLevel = ref(0)
  const wildTrees = ref<PlantedWildTree[]>([])
  const nextFruitTreeId = ref(0)
  const nextWildTreeId = ref(0)
  const lightningRods = ref(0)
  const scarecrows = ref(0)
  const giantCropCounter = ref(0)
  const tilledPlots = computed(() => plots.value.filter(p => p.state !== 'wasteland'))
  const harvestableCount = computed(() => plots.value.filter(p => p.state === 'harvestable').length)

  /** 重置农场为指定大小（用于新游戏初始化） */
  const resetFarm = (size: FarmSize) => {
    farmSize.value = size
    plots.value = createPlots(size)
    sprinklers.value = []
    fruitTrees.value = []
    greenhouseTimers.value = []
    greenhousePlotCount.value = 0
    wildTrees.value = []
    nextFruitTreeId.value = 0
    nextWildTreeId.value = 0
  }

  /** 开垦地块 */
  const tillPlot = (plotId: number): boolean => {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== 'wasteland') return false
    plot.state = 'tilled'
    return true
  }

  /** 播种 */
  const plantCrop = (plotId: number, cropId: string): boolean => {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== 'tilled') return false
    const crop = getCropById(cropId)
    if (!crop) return false
    plot.state = 'planted'
    plot.cropId = cropId
    plot.growthDays = 0
    plot.watered = getAllWateredBySprinklers().has(plotId) || useGameStore().isRainy
    plot.unwateredDays = 0
    plot.giantCropGroup = null
    plot.seedGenetics = null
    plot.infested = false
    plot.infestedDays = 0
    plot.weedy = false
    plot.weedyDays = 0
    return true
  }

  /** 种下育种种子 */
  const plantGeneticSeed = (plotId: number, genetics: SeedGenetics): boolean => {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== 'tilled') return false
    const crop = getCropById(genetics.cropId)
    if (!crop) return false
    plot.state = 'planted'
    plot.cropId = genetics.cropId
    plot.growthDays = 0
    plot.watered = getAllWateredBySprinklers().has(plotId) || useGameStore().isRainy
    plot.unwateredDays = 0
    plot.giantCropGroup = null
    plot.seedGenetics = genetics
    plot.infested = false
    plot.infestedDays = 0
    plot.weedy = false
    plot.weedyDays = 0
    return true
  }

  /** 浇水 */
  const waterPlot = (plotId: number): boolean => {
    const plot = plots.value[plotId]
    if (!plot || (plot.state !== 'planted' && plot.state !== 'growing')) return false
    if (plot.watered) return false
    plot.watered = true
    plot.unwateredDays = 0
    return true
  }

  /** 收获，返回作物ID（支持多茬作物） */
  const harvestPlot = (plotId: number): { cropId: string | null; genetics: SeedGenetics | null } => {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== 'harvestable') return { cropId: null, genetics: null }
    const cropId = plot.cropId
    const crop = cropId ? getCropById(cropId) : null
    const genetics = plot.seedGenetics

    // 如果属于巨型作物组，清除同组所有地块的 giantCropGroup（防止残留）
    if (plot.giantCropGroup !== null) {
      const groupId = plot.giantCropGroup
      for (const p of plots.value) {
        if (p.giantCropGroup === groupId) p.giantCropGroup = null
      }
    }

    // 多茬作物：收获后回到生长状态（有次数上限）
    if (crop && crop.regrowth && crop.regrowthDays) {
      plot.harvestCount++
      if (crop.maxHarvests && plot.harvestCount >= crop.maxHarvests) {
        // 达到最大收获次数，清除作物
        plot.state = 'tilled'
        plot.cropId = null
        plot.growthDays = 0
        plot.watered = false
        plot.unwateredDays = 0
        plot.harvestCount = 0
        plot.fertilizer = null
        plot.giantCropGroup = null
        plot.seedGenetics = null
        plot.infested = false
        plot.infestedDays = 0
        plot.weedy = false
        plot.weedyDays = 0
      } else {
        plot.state = 'growing'
        plot.growthDays = crop.growthDays - crop.regrowthDays
        plot.watered = getAllWateredBySprinklers().has(plotId) || useGameStore().isRainy
        plot.unwateredDays = 0
        plot.giantCropGroup = null
        // seedGenetics 保留（多茬作物继续使用同一基因）
      }
    } else {
      plot.state = 'tilled'
      plot.cropId = null
      plot.growthDays = 0
      plot.watered = false
      plot.unwateredDays = 0
      plot.fertilizer = null
      plot.harvestCount = 0
      plot.giantCropGroup = null
      plot.seedGenetics = null
      plot.infested = false
      plot.infestedDays = 0
      plot.weedy = false
      plot.weedyDays = 0
    }

    return { cropId, genetics }
  }

  /** 铲除作物：将有作物的地块恢复为已耕状态（保留肥料） */
  const removeCrop = (plotId: number): { cropId: string | null } => {
    const plot = plots.value[plotId]
    if (!plot) return { cropId: null }
    if (plot.state !== 'planted' && plot.state !== 'growing' && plot.state !== 'harvestable') {
      return { cropId: null }
    }
    const cropId = plot.cropId
    // 如果属于巨型作物组，清除同组所有地块的 giantCropGroup
    if (plot.giantCropGroup !== null) {
      const groupId = plot.giantCropGroup
      for (const p of plots.value) {
        if (p.giantCropGroup === groupId) p.giantCropGroup = null
      }
    }
    plot.state = 'tilled'
    plot.cropId = null
    plot.growthDays = 0
    plot.watered = false
    plot.unwateredDays = 0
    plot.harvestCount = 0
    plot.giantCropGroup = null
    plot.seedGenetics = null
    plot.infested = false
    plot.infestedDays = 0
    plot.weedy = false
    plot.weedyDays = 0
    return { cropId }
  }

  /** 除虫：清除地块虫害 */
  const curePest = (plotId: number): boolean => {
    const plot = plots.value[plotId]
    if (!plot || !plot.infested) return false
    plot.infested = false
    plot.infestedDays = 0
    return true
  }

  /** 除草：清除地块杂草 */
  const clearWeed = (plotId: number): boolean => {
    const plot = plots.value[plotId]
    if (!plot || !plot.weedy) return false
    plot.weedy = false
    plot.weedyDays = 0
    return true
  }

  // === 洒水器 ===

  /** 获取洒水器覆盖的地块ID列表 */
  const getSprinklerCoverage = (plotId: number, range: number): number[] => {
    const size = farmSize.value
    const row = Math.floor(plotId / size)
    const col = plotId % size
    const covered: number[] = []

    if (range === 4) {
      // 上下左右4块
      const offsets = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ]
      for (const [dr, dc] of offsets) {
        const nr = row + dr!,
          nc = col + dc!
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          covered.push(nr * size + nc)
        }
      }
    } else if (range === 8) {
      // 周围8块
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = row + dr,
            nc = col + dc
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            covered.push(nr * size + nc)
          }
        }
      }
    } else if (range === 24) {
      // 5×5 区域（2格半径）
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = row + dr,
            nc = col + dc
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            covered.push(nr * size + nc)
          }
        }
      }
    }
    return covered
  }

  /** 放置洒水器 */
  const placeSprinkler = (plotId: number, sprinklerType: SprinklerType): boolean => {
    if (sprinklers.value.some(s => s.plotId === plotId)) return false
    const plot = plots.value[plotId]
    if (!plot) return false
    sprinklers.value.push({
      id: `${sprinklerType}_${plotId}`,
      type: sprinklerType,
      plotId
    })
    return true
  }

  /** 移除洒水器 */
  const removeSprinkler = (plotId: number): SprinklerType | null => {
    const idx = sprinklers.value.findIndex(s => s.plotId === plotId)
    if (idx === -1) return null
    const type = sprinklers.value[idx]!.type
    sprinklers.value.splice(idx, 1)
    return type
  }

  /** 获取被所有洒水器覆盖的地块集合（含洒水器自身所在地块） */
  const getAllWateredBySprinklers = (): Set<number> => {
    const watered = new Set<number>()
    for (const s of sprinklers.value) {
      const def = getSprinklerById(s.type)
      if (!def) continue
      watered.add(s.plotId)
      for (const pid of getSprinklerCoverage(s.plotId, def.range)) {
        watered.add(pid)
      }
    }
    return watered
  }

  // === 肥料 ===

  /** 给地块施肥 */
  const applyFertilizer = (plotId: number, fertilizerType: FertilizerType): boolean => {
    const plot = plots.value[plotId]
    if (!plot) return false
    if (plot.state === 'wasteland') return false
    if (isRetainingSoilType(fertilizerType)) {
      if (plot.retainingSoil === 'quality_retaining_soil') return false
      if (plot.retainingSoil === fertilizerType) return false
      plot.retainingSoil = fertilizerType
      return true
    }
    if (plot.fertilizer) return false
    plot.fertilizer = fertilizerType
    return true
  }

  /** 从紧凑定时器中拆出单个地块，保留该地块已有的土壤和肥料状态。 */
  const detachGreenhousePlot = (plotId: number): GreenhousePlotTimer | null => {
    const timerIndex = greenhouseTimers.value.findIndex(candidate => candidate.plotIds.includes(plotId))
    if (timerIndex === -1) return null
    const timer = greenhouseTimers.value[timerIndex]!
    timer.plotIds = timer.plotIds.filter(id => id !== plotId)
    if (timer.plotIds.length === 0) greenhouseTimers.value.splice(timerIndex, 1)
    return {
      plotIds: [plotId],
      cropId: timer.cropId,
      growthDays: timer.growthDays,
      fertilizer: timer.fertilizer,
      retainingSoil: timer.retainingSoil ?? null,
      harvestCount: timer.harvestCount,
      seedGenetics: timer.seedGenetics
    }
  }

  /** 给温室地块施肥；空地也会以紧凑定时器保存改造状态。 */
  const applyGreenhouseFertilizer = (plotId: number, fertilizerType: FertilizerType): boolean => {
    if (plotId < 0 || plotId >= greenhousePlotCount.value) return false
    const existing = greenhousePlotTimerFor(plotId)
    if (isRetainingSoilType(fertilizerType)) {
      if (existing?.retainingSoil === 'quality_retaining_soil' || existing?.retainingSoil === fertilizerType) return false
      const detached = detachGreenhousePlot(plotId)
      greenhouseTimers.value.push(createGreenhousePlotTimer(plotId, detached?.cropId ?? null, {
        growthDays: detached?.growthDays,
        fertilizer: detached?.fertilizer,
        retainingSoil: fertilizerType,
        harvestCount: detached?.harvestCount,
        seedGenetics: detached?.seedGenetics
      }))
      greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
      return true
    }

    if (existing?.fertilizer) return false
    const detached = detachGreenhousePlot(plotId)
    greenhouseTimers.value.push(createGreenhousePlotTimer(plotId, detached?.cropId ?? null, {
      growthDays: detached?.growthDays,
      fertilizer: fertilizerType,
      retainingSoil: detached?.retainingSoil,
      harvestCount: detached?.harvestCount,
      seedGenetics: detached?.seedGenetics
    }))
    greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
    return true
  }

  /** 桃源田庄：季初给所有已耕但无肥料的地块施加肥料（按种植等级升级） */
  const applyFertileSoil = (farmingLevel: number): { count: number; fertilizerName: string } => {
    const fertilizerId = farmingLevel >= 8 ? 'deluxe_speed_gro' : farmingLevel >= 5 ? 'quality_fertilizer' : 'basic_fertilizer'
    const fertilizerName = farmingLevel >= 8 ? '高级生长激素' : farmingLevel >= 5 ? '优质肥料' : '基础肥料'
    let count = 0
    for (const plot of plots.value) {
      if (plot.state !== 'wasteland' && !plot.fertilizer) {
        plot.fertilizer = fertilizerId
        count++
      }
    }
    for (const timer of greenhouseTimers.value) {
      if (!timer.fertilizer) {
        timer.fertilizer = fertilizerId
        count += timer.plotIds.length
      }
    }
    greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
    return { count, fertilizerName }
  }

  /** 每日更新所有地块 */
  const dailyUpdate = (
    isRainy: boolean,
    chunkOptions: EndDayChunkOptions = {}
  ): { newInfestations: number; pestDeaths: number; newWeeds: number; weedDeaths: number } => {
    const sprinklerWatered = getAllWateredBySprinklers()
    const walletGrowth = useWalletStore().getCropGrowthBonus()
    const gameStore = useGameStore()
    // 仙缘能力：春息（tao_yao_2）春季作物生长加速
    const spiritGrowth = gameStore.season === 'spring' ? useHiddenNpcStore().getAbilityValue('tao_yao_2') / 100 : 0
    let newInfestations = 0
    let pestDeaths = 0
    let newWeeds = 0
    let weedDeaths = 0

    forEachEndDayChunk(plots.value, plot => {
      if (plot.state !== 'planted' && plot.state !== 'growing') return

      // 虫害处理：感染中的地块不生长、不枯萎
      if (plot.infested) {
        plot.infestedDays++
        if (plot.infestedDays >= 3) {
          plot.state = 'tilled'
          plot.cropId = null
          plot.growthDays = 0
          plot.watered = false
          plot.unwateredDays = 0
          plot.fertilizer = null
          plot.harvestCount = 0
          plot.giantCropGroup = null
          plot.seedGenetics = null
          plot.infested = false
          plot.infestedDays = 0
          plot.weedy = false
          plot.weedyDays = 0
          pestDeaths++
        }
        return
      }

      // 杂草处理：长草中的地块生长减速
      if (plot.weedy) {
        plot.weedyDays++
        if (plot.weedyDays >= 4) {
          plot.state = 'tilled'
          plot.cropId = null
          plot.growthDays = 0
          plot.watered = false
          plot.unwateredDays = 0
          plot.fertilizer = null
          plot.harvestCount = 0
          plot.giantCropGroup = null
          plot.seedGenetics = null
          plot.infested = false
          plot.infestedDays = 0
          plot.weedy = false
          plot.weedyDays = 0
          weedDeaths++
          return
        }
      }

      // 雨天或洒水器范围内自动浇水
      if (isRainy || sprinklerWatered.has(plot.id)) {
        plot.watered = true
        plot.unwateredDays = 0
      }

      // 处理浇水状态
      if (plot.watered) {
        // 肥料加速：减少作物所需生长天数
        const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
        const speedup = (fertDef?.growthSpeedup ?? 0) + walletGrowth + spiritGrowth
        plot.growthDays += 1
        const crop = getCropById(plot.cropId!)
        if (crop) {
          const effectiveDays = Math.max(1, Math.floor(crop.growthDays * (1 - speedup)))
          if (plot.growthDays >= effectiveDays) {
            plot.state = 'harvestable'
          } else if (plot.state === 'planted') {
            plot.state = 'growing'
          }
        }
      } else {
        // 抗性减缓枯萎：高抗性时 unwateredDays 增长更慢
        const resistanceFactor = plot.seedGenetics ? 1 - plot.seedGenetics.resistance / 100 : 1
        plot.unwateredDays += resistanceFactor
        if (plot.unwateredDays >= 2) {
          plot.state = 'tilled'
          plot.cropId = null
          plot.growthDays = 0
          plot.unwateredDays = 0
          plot.fertilizer = null
          plot.harvestCount = 0
          plot.giantCropGroup = null
          plot.seedGenetics = null
          plot.infested = false
          plot.infestedDays = 0
          plot.weedy = false
          plot.weedyDays = 0
        }
      }

      // 重置每日浇水状态（洒水器覆盖或保湿土可能保留）
      if (sprinklerWatered.has(plot.id)) {
        // 洒水器覆盖，保持浇水状态
      } else {
        const retainFert = plot.retainingSoil ? getFertilizerById(plot.retainingSoil) : null
        if (retainFert?.retainChance && Math.random() < retainFert.retainChance) {
          // 永久保湿土保持浇水，普通肥料不参与隔夜保水
        } else {
          plot.watered = false
        }
      }
      // 虫害感染检查（未感染的 planted/growing 地块，跳过巨型作物）
      if (!plot.infested && plot.giantCropGroup === null && (plot.state === 'planted' || plot.state === 'growing')) {
        const baseChance = 0.08
        const pestChance = scarecrows.value > 0 ? baseChance * 0.5 : baseChance
        if (Math.random() < pestChance) {
          plot.infested = true
          plot.infestedDays = 0
          newInfestations++
        }
      }
      // 杂草滋生检查（未长草的 planted/growing 地块，跳过巨型作物）
      if (!plot.weedy && plot.giantCropGroup === null && (plot.state === 'planted' || plot.state === 'growing')) {
        const baseWeedChance = 0.06
        const weedChance = scarecrows.value > 0 ? baseWeedChance * 0.6 : baseWeedChance
        if (Math.random() < weedChance) {
          plot.weedy = true
          plot.weedyDays = 0
          newWeeds++
        }
      }
    }, chunkOptions)

    return { newInfestations, pestDeaths, newWeeds, weedDeaths }
  }
  const onSeasonChange = (newSeason: Season): { witheredCount: number; reclaimedCount: number } => {
    let witheredCount = 0
    let reclaimedCount = 0

    // 先记录换季前就已经空置的耕地
    const preExistingTilled = new Set(plots.value.filter(p => p.state === 'tilled' && !p.cropId).map(p => p.id))

    // 作物枯萎检查（肥料保留在土壤中）
    for (const plot of plots.value) {
      if ((plot.state === 'planted' || plot.state === 'growing' || plot.state === 'harvestable') && plot.cropId) {
        const crop = getCropById(plot.cropId)
        if (crop && !crop.season.includes(newSeason)) {
          plot.state = 'tilled'
          plot.cropId = null
          plot.growthDays = 0
          plot.watered = false
          plot.unwateredDays = 0
          plot.harvestCount = 0
          plot.giantCropGroup = null
          plot.seedGenetics = null
          plot.infested = false
          plot.infestedDays = 0
          plot.weedy = false
          plot.weedyDays = 0
          witheredCount++
        }
      }
    }

    // 只有换季前就空置的耕地才可能退化（冬→春更严重）
    for (const plot of plots.value) {
      if (plot.state === 'tilled' && preExistingTilled.has(plot.id)) {
        const revertChance = newSeason === 'spring' ? 0.3 : 0.15
        if (Math.random() < revertChance) {
          plot.state = 'wasteland'
          plot.fertilizer = null
          reclaimedCount++
        }
      }
    }

    return { witheredCount, reclaimedCount }
  }

  /** 雷暴闪电：25%概率触发，避雷针可吸收 */
  const lightningStrike = (): { hit: boolean; absorbed: boolean; cropName?: string } => {
    if (Math.random() > 0.25) return { hit: false, absorbed: false }

    // 避雷针吸收
    if (lightningRods.value > 0) {
      return { hit: false, absorbed: true }
    }

    const croppedPlots = plots.value.filter(p => (p.state === 'planted' || p.state === 'growing' || p.state === 'harvestable') && p.cropId)
    if (croppedPlots.length === 0) return { hit: false, absorbed: false }

    const target = croppedPlots[Math.floor(Math.random() * croppedPlots.length)]!
    const crop = getCropById(target.cropId!)
    const cropName = crop?.name ?? '作物'

    target.state = 'tilled'
    target.cropId = null
    target.growthDays = 0
    target.watered = false
    target.unwateredDays = 0
    target.harvestCount = 0
    target.giantCropGroup = null
    target.seedGenetics = null
    target.infested = false
    target.infestedDays = 0
    target.weedy = false
    target.weedyDays = 0

    return { hit: true, absorbed: false, cropName }
  }

  /** 乌鸦袭击：无稻草人时 15% 概率毁一株作物 */
  const crowAttack = (): { attacked: boolean; cropName?: string } => {
    if (scarecrows.value > 0) return { attacked: false }
    if (Math.random() > 0.15) return { attacked: false }
    const croppedPlots = plots.value.filter(p => (p.state === 'planted' || p.state === 'growing' || p.state === 'harvestable') && p.cropId)
    if (croppedPlots.length === 0) return { attacked: false }
    const target = croppedPlots[Math.floor(Math.random() * croppedPlots.length)]!
    const crop = getCropById(target.cropId!)
    const cropName = crop?.name ?? '作物'
    target.state = 'tilled'
    target.cropId = null
    target.growthDays = 0
    target.watered = false
    target.unwateredDays = 0
    target.harvestCount = 0
    target.giantCropGroup = null
    target.seedGenetics = null
    target.infested = false
    target.infestedDays = 0
    target.weedy = false
    target.weedyDays = 0
    return { attacked: true, cropName }
  }

  /** 检测并形成巨型作物：3×3 同种 harvestable 且 giantCropEligible，1% 概率 */
  const checkGiantCrops = (): { cropId: string; cropName: string }[] => {
    const size = farmSize.value
    if (size < 4) return []
    const formed: { cropId: string; cropName: string }[] = []
    const maxR = size - 3
    const maxC = size - 3
    for (let r = 0; r <= maxR; r++) {
      for (let c = 0; c <= maxC; c++) {
        const topLeft = plots.value[r * size + c]!
        if (topLeft.state !== 'harvestable' || !topLeft.cropId || topLeft.giantCropGroup !== null) continue
        const crop = getCropById(topLeft.cropId)
        if (!crop || !crop.giantCropEligible) continue
        let allMatch = true
        for (let dr = 0; dr < 3 && allMatch; dr++) {
          for (let dc = 0; dc < 3 && allMatch; dc++) {
            if (dr === 0 && dc === 0) continue
            const p = plots.value[(r + dr) * size + (c + dc)]!
            if (p.state !== 'harvestable' || p.cropId !== topLeft.cropId || p.giantCropGroup !== null) {
              allMatch = false
            }
          }
        }
        if (allMatch && Math.random() < 0.01) {
          giantCropCounter.value++
          const groupId = giantCropCounter.value
          for (let dr = 0; dr < 3; dr++) {
            for (let dc = 0; dc < 3; dc++) {
              plots.value[(r + dr) * size + (c + dc)]!.giantCropGroup = groupId
            }
          }
          formed.push({ cropId: topLeft.cropId, cropName: crop.name })
        }
      }
    }
    return formed
  }

  /** 收获巨型作物：清除同组 9 块，返回作物ID和总产出数量 */
  const harvestGiantCrop = (plotId: number): { cropId: string; quantity: number } | null => {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== 'harvestable' || plot.giantCropGroup === null) return null
    const groupId = plot.giantCropGroup
    const cropId = plot.cropId
    if (!cropId) return null
    const groupPlots = plots.value.filter(p => p.giantCropGroup === groupId)
    for (const gp of groupPlots) {
      gp.state = 'tilled'
      gp.cropId = null
      gp.growthDays = 0
      gp.watered = false
      gp.unwateredDays = 0
      gp.fertilizer = null
      gp.harvestCount = 0
      gp.giantCropGroup = null
      gp.seedGenetics = null
      gp.infested = false
      gp.infestedDays = 0
      gp.weedy = false
      gp.weedyDays = 0
    }
    return { cropId, quantity: groupPlots.length * 2 }
  }

  /** 扩建农场 */
  const expandFarm = (): FarmSize | null => {
    const sizes: FarmSize[] = [4, 6, 8, 10]
    const currentIndex = sizes.indexOf(farmSize.value)
    if (currentIndex >= sizes.length - 1) return null
    const newSize = sizes[currentIndex + 1]!
    const oldPlots = [...plots.value]
    const newPlots = createPlots(newSize)
    for (let row = 0; row < farmSize.value; row++) {
      for (let col = 0; col < farmSize.value; col++) {
        const oldIndex = row * farmSize.value + col
        const newIndex = row * newSize + col
        const oldPlot = oldPlots[oldIndex]
        if (oldPlot) {
          newPlots[newIndex] = { ...oldPlot, id: newIndex }
        }
      }
    }
    // 重映射洒水器坐标
    const oldSize = farmSize.value
    for (const s of sprinklers.value) {
      const oldRow = Math.floor(s.plotId / oldSize)
      const oldCol = s.plotId % oldSize
      s.plotId = oldRow * newSize + oldCol
      s.id = `${s.type}_${s.plotId}`
    }
    farmSize.value = newSize
    plots.value = newPlots
    return newSize
  }

  // === 果树 ===

  /** 种植果树 */
  const plantFruitTree = (treeType: FruitTreeType): boolean => {
    fruitTrees.value.push({
      id: nextFruitTreeId.value++,
      type: treeType,
      growthDays: 0,
      mature: false,
      yearAge: 0,
      todayFruit: false
    })
    return true
  }

  /** 果树每日更新 */
  const dailyFruitTreeUpdate = (currentSeason: Season): { fruits: { fruitId: string; quality: Quality }[] } => {
    const results: { fruitId: string; quality: Quality }[] = []
    // 仙缘能力
    const hiddenNpcStore2 = useHiddenNpcStore()
    const extraFruit = hiddenNpcStore2.isAbilityActive('tao_yao_1') // 花泽：果树+1产量
    const spiritPeachActive = hiddenNpcStore2.isAbilityActive('tao_yao_3') // 灵桃：桃树概率产灵桃
    for (const tree of fruitTrees.value) {
      tree.growthDays++
      tree.todayFruit = false
      const def = getOfficialFruitTreeById(tree.type)
      if (!tree.mature && tree.growthDays >= (def?.growthDays ?? 28)) {
        tree.mature = true
      }
      if (tree.mature && def?.fruitSeason === currentSeason) {
        const quality = getFruitQuality(tree.yearAge)
        // 仙缘能力：灵桃（tao_yao_3）桃树10%概率产灵桃
        const fruitId = tree.type === 'peach_tree' && spiritPeachActive && Math.random() < 0.1 ? 'spirit_peach' : def.fruitId
        results.push({ fruitId, quality })
        if (extraFruit) results.push({ fruitId, quality })
        tree.todayFruit = true
      }
    }
    return { fruits: results }
  }

  /** 果树品质：随年龄提升 0年normal, 1年fine, 2年excellent, 3+年supreme */
  const getFruitQuality = (yearAge: number): Quality => {
    if (yearAge >= 3) return 'supreme'
    if (yearAge >= 2) return 'excellent'
    if (yearAge >= 1) return 'fine'
    return 'normal'
  }

  /** 移除果树（砍伐），返回木材数量 */
  const removeFruitTree = (treeId: number): number => {
    const idx = fruitTrees.value.findIndex(t => t.id === treeId)
    if (idx === -1) return 0
    const tree = fruitTrees.value[idx]!
    fruitTrees.value.splice(idx, 1)
    // 成熟树砍伐获得更多木材
    return tree.mature ? 5 : 2
  }

  /** 果树换季更新（仅新年时增加年龄） */
  const fruitTreeSeasonUpdate = (isNewYear: boolean): void => {
    for (const tree of fruitTrees.value) {
      if (tree.mature && isNewYear) tree.yearAge++
      tree.todayFruit = false
    }
  }

  // === 野树 ===

  /** 种植野树 */
  const plantWildTree = (treeType: WildTreeType): boolean => {
    wildTrees.value.push({
      id: nextWildTreeId.value++,
      type: treeType,
      growthDays: 0,
      mature: false,
      hasTapper: false,
      tapDaysElapsed: 0,
      tapReady: false,
      chopCount: 0
    })
    return true
  }

  /** 安装采脂器 */
  const attachTapper = (treeId: number): boolean => {
    const tree = wildTrees.value.find(t => t.id === treeId)
    if (!tree || !tree.mature || tree.hasTapper) return false
    tree.hasTapper = true
    tree.tapDaysElapsed = 0
    tree.tapReady = false
    return true
  }

  /** 收取采脂产物 */
  const collectTapProduct = (treeId: number): string | null => {
    const tree = wildTrees.value.find(t => t.id === treeId)
    if (!tree || !tree.tapReady) return null
    const def = getOfficialWildTreeById(tree.type)
    if (!def) return null
    tree.tapReady = false
    tree.tapDaysElapsed = 0
    return def.tapProduct
  }

  /** 伐木（增加chopCount，>=3则移除） */
  const chopWildTree = (treeId: number): { removed: boolean } => {
    const tree = wildTrees.value.find(t => t.id === treeId)
    if (!tree) return { removed: false }
    tree.chopCount++
    if (tree.chopCount >= 3) {
      wildTrees.value = wildTrees.value.filter(t => t.id !== treeId)
      return { removed: true }
    }
    return { removed: false }
  }

  /** 野树每日更新 */
  const dailyWildTreeUpdate = (): { products: { treeId: number; productId: string; productName: string }[] } => {
    const readyProducts: { treeId: number; productId: string; productName: string }[] = []
    for (const tree of wildTrees.value) {
      const def = getOfficialWildTreeById(tree.type)
      if (!tree.mature) {
        tree.growthDays++
        if (def && tree.growthDays >= def.growthDays) {
          tree.mature = true
        }
      }
      if (tree.hasTapper && tree.mature && !tree.tapReady) {
        tree.tapDaysElapsed++
        if (def && tree.tapDaysElapsed >= def.tapCycleDays) {
          tree.tapReady = true
          readyProducts.push({ treeId: tree.id, productId: def.tapProduct, productName: def.tapProductName })
        }
      }
    }
    return { products: readyProducts }
  }

  // === 温室 ===

  /** 初始化温室地块 */
  const initGreenhouse = (): void => {
    if (greenhousePlotCount.value > 0) return
    greenhousePlotCount.value = GREENHOUSE_PLOT_COUNT
    greenhouseTimers.value = []
  }

  const greenhousePlotTimerFor = (plotId: number): GreenhousePlotTimer | undefined =>
    greenhouseTimers.value.find(timer => timer.plotIds.includes(plotId))

  const getGreenhousePlot = (plotId: number): FarmPlot | null => {
    if (plotId < 0 || plotId >= greenhousePlotCount.value) return null
    const timer = greenhousePlotTimerFor(plotId)
    if (!timer) return createGreenhousePlot(plotId)
    const walletGrowth = useWalletStore().getCropGrowthBonus()
    return createGreenhousePlotFromTimer(plotId, timer, getCropById, getFertilizerById, walletGrowth)
  }

  const getGreenhouseEmptyPlotIds = (limit = Number.POSITIVE_INFINITY): number[] => {
    if (limit <= 0 || greenhousePlotCount.value === 0) return []
    const occupied = new Set<number>()
    for (const timer of greenhouseTimers.value) {
      if (!timer.cropId) continue
      for (const plotId of timer.plotIds) occupied.add(plotId)
    }
    const result: number[] = []
    for (let plotId = 0; plotId < greenhousePlotCount.value && result.length < limit; plotId++) {
      if (!occupied.has(plotId)) result.push(plotId)
    }
    return result
  }

  const getGreenhousePlotIdsByState = (state: Exclude<FarmPlot['state'], 'wasteland'>): number[] => {
    if (state === 'tilled') return getGreenhouseEmptyPlotIds()
    const walletGrowth = useWalletStore().getCropGrowthBonus()
    const result: number[] = []
    for (const timer of greenhouseTimers.value) {
      if (!timer.cropId) continue
      if (greenhousePlotState(timer, getCropById, getFertilizerById, walletGrowth) === state) {
        result.push(...timer.plotIds)
      }
    }
    return result
  }

  const getGreenhouseFertilizablePlotIds = (fertilizerType?: FertilizerType): number[] => {
    if (fertilizerType && isRetainingSoilType(fertilizerType)) {
      const soilByPlot = new Map<number, RetainingSoilType>()
      for (const timer of greenhouseTimers.value) {
        if (!timer.retainingSoil) continue
        for (const plotId of timer.plotIds) soilByPlot.set(plotId, timer.retainingSoil)
      }
      const result: number[] = []
      for (let plotId = 0; plotId < greenhousePlotCount.value; plotId++) {
        const soil = soilByPlot.get(plotId)
        if (!soil || (soil === 'retaining_soil' && fertilizerType === 'quality_retaining_soil')) result.push(plotId)
      }
      return result
    }

    const fertilizerApplied = new Set<number>()
    for (const timer of greenhouseTimers.value) {
      if (timer.fertilizer) {
        for (const plotId of timer.plotIds) fertilizerApplied.add(plotId)
      }
    }
    const result: number[] = []
    for (let plotId = 0; plotId < greenhousePlotCount.value; plotId++) {
      if (!fertilizerApplied.has(plotId)) result.push(plotId)
    }
    return result
  }

  /** 温室播种 */
  const greenhousePlantCrop = (plotId: number, cropId: string): boolean => {
    if (getGreenhousePlot(plotId)?.state !== 'tilled') return false
    const crop = getCropById(cropId)
    if (!crop) return false
    const existing = detachGreenhousePlot(plotId)
    greenhouseTimers.value.push(createGreenhousePlotTimer(plotId, cropId, {
      fertilizer: existing?.fertilizer,
      retainingSoil: existing?.retainingSoil
    }))
    greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
    return true
  }

  /** 温室播种育种种子 */
  const greenhousePlantGeneticSeed = (plotId: number, genetics: SeedGenetics): boolean => {
    if (getGreenhousePlot(plotId)?.state !== 'tilled') return false
    const crop = getCropById(genetics.cropId)
    if (!crop) return false
    const existing = detachGreenhousePlot(plotId)
    greenhouseTimers.value.push(createGreenhousePlotTimer(plotId, genetics.cropId, {
      fertilizer: existing?.fertilizer,
      retainingSoil: existing?.retainingSoil,
      seedGenetics: genetics
    }))
    greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
    return true
  }

  /** 温室收获 */
  const greenhouseHarvestPlot = (plotId: number): { cropId: string | null; genetics: SeedGenetics | null } => {
    const timerIndex = greenhouseTimers.value.findIndex(candidate => candidate.plotIds.includes(plotId))
    if (timerIndex === -1) return { cropId: null, genetics: null }
    const timer = greenhouseTimers.value[timerIndex]!
    if (getGreenhousePlot(plotId)?.state !== 'harvestable') return { cropId: null, genetics: null }
    const cropId = timer.cropId
    const genetics = timer.seedGenetics ?? null
    const crop = cropId ? getCropById(cropId) : null

    if (crop && crop.regrowth && crop.regrowthDays) {
      const harvestCount = timer.harvestCount + 1
      timer.plotIds = timer.plotIds.filter(id => id !== plotId)
      if (!(crop.maxHarvests && harvestCount >= crop.maxHarvests)) {
        greenhouseTimers.value.push(createGreenhousePlotTimer(plotId, cropId, {
          growthDays: crop.growthDays - crop.regrowthDays,
          fertilizer: timer.fertilizer,
          retainingSoil: timer.retainingSoil,
          harvestCount,
          seedGenetics: timer.seedGenetics
        }))
      } else if (timer.retainingSoil) {
        greenhouseTimers.value.push(createGreenhousePlotTimer(plotId, null, {
          retainingSoil: timer.retainingSoil
        }))
      }
      if (timer.plotIds.length === 0) {
        greenhouseTimers.value.splice(timerIndex, 1)
      }
    } else {
      timer.plotIds = timer.plotIds.filter(id => id !== plotId)
      if (timer.retainingSoil) {
        greenhouseTimers.value.push(createGreenhousePlotTimer(plotId, null, {
          retainingSoil: timer.retainingSoil
        }))
      }
      if (timer.plotIds.length === 0) {
        greenhouseTimers.value.splice(timerIndex, 1)
      }
    }
    greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
    return { cropId, genetics }
  }

  /** 温室每日更新：按定时器批量推进，不为每块空地创建响应式对象。 */
  const greenhouseDailyUpdate = (chunkOptions: EndDayChunkOptions = {}): void => {
    const walletGrowth = useWalletStore().getCropGrowthBonus()
    const total = greenhouseTimers.value.reduce((count, timer) => count + (timer.cropId ? timer.plotIds.length : 0), 0)
    const requestedChunkSize = chunkOptions.chunkSize
    const chunkSize = requestedChunkSize === undefined || !Number.isFinite(requestedChunkSize)
      ? Math.max(1, total)
      : Math.max(1, Math.floor(requestedChunkSize))
    let processed = 0
    let nextReport = chunkSize
    for (const timer of greenhouseTimers.value) {
      if (!timer.cropId) continue
      const crop = getCropById(timer.cropId)
      const state = greenhousePlotState(timer, getCropById, getFertilizerById, walletGrowth)
      if (state === 'planted' || state === 'growing') {
        timer.growthDays += 1
        if (crop) {
          const fertilizer = timer.fertilizer ? getFertilizerById(timer.fertilizer) : undefined
          const speedup = (fertilizer?.growthSpeedup ?? 0) + walletGrowth
          const effectiveDays = Math.max(1, Math.floor(crop.growthDays * (1 - speedup)))
          if (timer.growthDays > effectiveDays) timer.growthDays = effectiveDays
        }
      }
      processed += timer.plotIds.length
      if (processed >= nextReport || processed === total) {
        chunkOptions.onChunkComplete?.({ processed, total })
        while (nextReport <= processed) nextReport += chunkSize
      }
    }
    greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
  }

  /** 温室升级：只增加可用地块计数。 */
  const upgradeGreenhouse = (newPlotCount: number): boolean => {
    const current = greenhousePlotCount.value
    if (newPlotCount <= current) return false
    greenhousePlotCount.value = newPlotCount
    greenhouseLevel.value++
    return true
  }

  /** 温室一键收获：返回收获结果列表 */
  const greenhouseBatchHarvest = (): { cropId: string; genetics: SeedGenetics | null }[] => {
    const results: { cropId: string; genetics: SeedGenetics | null }[] = []
    for (const plotId of getGreenhousePlotIdsByState('harvestable')) {
      const result = greenhouseHarvestPlot(plotId)
      if (result.cropId) results.push({ cropId: result.cropId, genetics: result.genetics })
    }
    return results
  }

  const serialize = () => {
    return {
      farmSize: farmSize.value,
      plots: plots.value,
      sprinklers: sprinklers.value,
      fruitTrees: fruitTrees.value,
      greenhousePlots: [],
      greenhouseTimers: greenhouseTimers.value.map(timer => ({
        ...timer,
        plotIds: [...timer.plotIds]
      })),
      greenhousePlotCount: greenhousePlotCount.value,
      greenhouseLevel: greenhouseLevel.value,
      wildTrees: wildTrees.value,
      nextFruitTreeId: nextFruitTreeId.value,
      nextWildTreeId: nextWildTreeId.value,
      lightningRods: lightningRods.value,
      scarecrows: scarecrows.value,
      giantCropCounter: giantCropCounter.value
    }
  }

  /** 存档迁移：旧肥料名称映射 */
  const migrateFertilizer = (f: string | null): FertilizerType | null => {
    if (!f) return null
    if (f === 'compost') return 'basic_fertilizer'
    if (f === 'bone_meal') return 'deluxe_speed_gro'
    return f as FertilizerType
  }

  const migrateRetainingSoil = (soil: unknown): RetainingSoilType | null =>
    soil === 'retaining_soil' || soil === 'quality_retaining_soil' ? soil : null

  const deserialize = (data: ReturnType<typeof serialize>) => {
    farmSize.value = data.farmSize as FarmSize
    plots.value = data.plots.map(p => {
      const fertilizer = migrateFertilizer(p.fertilizer)
      const retainingSoil = migrateRetainingSoil((p as any).retainingSoil)
        ?? (isRetainingSoilType(fertilizer) ? fertilizer : null)
      return {
        ...p,
        fertilizer: isRetainingSoilType(fertilizer) ? null : fertilizer,
        retainingSoil,
        harvestCount: (p as any).harvestCount ?? 0,
        giantCropGroup: (p as any).giantCropGroup ?? null,
        seedGenetics: (p as any).seedGenetics ?? null,
        infested: (p as any).infested ?? false,
        infestedDays: (p as any).infestedDays ?? 0,
        weedy: (p as any).weedy ?? false,
        weedyDays: (p as any).weedyDays ?? 0
      }
    })
    sprinklers.value = (data as any).sprinklers ?? []
    fruitTrees.value = ((data as any).fruitTrees ?? []).map((t: any) => ({
      ...t,
      yearAge: t.yearAge ?? t.seasonAge ?? 0
    }))
    nextFruitTreeId.value =
      (data as any).nextFruitTreeId ?? (fruitTrees.value.length > 0 ? Math.max(...fruitTrees.value.map(t => t.id)) + 1 : 0)
    wildTrees.value = ((data as any).wildTrees ?? []).map((t: any) => ({
      ...t,
      chopCount: t.chopCount ?? 0
    }))
    nextWildTreeId.value =
      (data as any).nextWildTreeId ?? (wildTrees.value.length > 0 ? Math.max(...wildTrees.value.map(t => t.id)) + 1 : 0)
    greenhousePlotCount.value = (data as any).greenhousePlotCount ?? GREENHOUSE_PLOT_COUNT
    const savedGreenhouseTimers = ((data as any).greenhouseTimers ?? []).map((timer: any) => {
      const fertilizer = migrateFertilizer(timer.fertilizer)
      return {
        plotIds: Array.isArray(timer.plotIds) ? timer.plotIds.filter((id: any) => Number.isInteger(id)) : [],
        cropId: timer.cropId ?? null,
        growthDays: timer.growthDays ?? 0,
        fertilizer: isRetainingSoilType(fertilizer) ? null : fertilizer,
        retainingSoil: migrateRetainingSoil(timer.retainingSoil)
          ?? (isRetainingSoilType(fertilizer) ? fertilizer : null),
        harvestCount: timer.harvestCount ?? 0,
        seedGenetics: timer.seedGenetics ?? null
      }
    })
    const savedGreenhousePlots = ((data as any).greenhousePlots ?? []).map((p: any, index: number) => {
      const fertilizer = migrateFertilizer(p.fertilizer)
      return normalizeGreenhousePlot({
        ...p,
        id: p.id ?? index,
        fertilizer: isRetainingSoilType(fertilizer) ? null : fertilizer,
        retainingSoil: migrateRetainingSoil(p.retainingSoil)
          ?? (isRetainingSoilType(fertilizer) ? fertilizer : null)
      })
    })
    const legacyTimers: GreenhousePlotTimer[] = []
    for (const plot of savedGreenhousePlots as FarmPlot[]) {
      if (!plot.cropId) continue
      legacyTimers.push({
        plotIds: [plot.id],
        cropId: plot.cropId,
        growthDays: plot.growthDays,
        fertilizer: plot.fertilizer,
        retainingSoil: plot.retainingSoil ?? null,
        harvestCount: plot.harvestCount,
        seedGenetics: plot.seedGenetics
      })
    }
    greenhouseTimers.value = mergeGreenhousePlotTimers([
      ...savedGreenhouseTimers,
      ...legacyTimers
    ])
    for (const timer of greenhouseTimers.value) {
      timer.plotIds = timer.plotIds.filter(plotId => plotId >= 0 && plotId < greenhousePlotCount.value)
    }
    greenhouseTimers.value = mergeGreenhousePlotTimers(greenhouseTimers.value)
    if (greenhousePlotCount.value === 0 && greenhouseTimers.value.length > 0) {
      greenhousePlotCount.value = GREENHOUSE_PLOT_COUNT
    }
    if (!Number.isFinite(greenhousePlotCount.value) || greenhousePlotCount.value < 0) {
      greenhousePlotCount.value = GREENHOUSE_PLOT_COUNT
    }
    for (const timer of greenhouseTimers.value) {
      if (timer.plotIds.some(plotId => plotId >= greenhousePlotCount.value)) {
        timer.plotIds = timer.plotIds.filter(plotId => plotId < greenhousePlotCount.value)
      }
    }
    greenhouseLevel.value = (data as any).greenhouseLevel ?? 0
    lightningRods.value = (data as any).lightningRods ?? 0
    scarecrows.value = (data as any).scarecrows ?? 0
    giantCropCounter.value = (data as any).giantCropCounter ?? 0
  }

  return {
    farmSize,
    plots,
    sprinklers,
    fruitTrees,
    greenhouseTimers,
    greenhousePlotCount,
    tilledPlots,
    harvestableCount,
    resetFarm,
    tillPlot,
    plantCrop,
    plantGeneticSeed,
    waterPlot,
    harvestPlot,
    removeCrop,
    curePest,
    clearWeed,
    getSprinklerCoverage,
    placeSprinkler,
    removeSprinkler,
    getAllWateredBySprinklers,
    applyFertilizer,
    applyGreenhouseFertilizer,
    applyFertileSoil,
    dailyUpdate,
    onSeasonChange,
    lightningStrike,
    lightningRods,
    scarecrows,
    crowAttack,
    checkGiantCrops,
    harvestGiantCrop,
    expandFarm,
    plantFruitTree,
    removeFruitTree,
    dailyFruitTreeUpdate,
    fruitTreeSeasonUpdate,
    wildTrees,
    plantWildTree,
    attachTapper,
    collectTapProduct,
    chopWildTree,
    dailyWildTreeUpdate,
    initGreenhouse,
    greenhouseLevel,
    getGreenhousePlot,
    getGreenhousePlotIdsByState,
    getGreenhouseEmptyPlotIds,
    getGreenhouseFertilizablePlotIds,
    greenhousePlantCrop,
    greenhousePlantGeneticSeed,
    greenhouseHarvestPlot,
    greenhouseDailyUpdate,
    upgradeGreenhouse,
    greenhouseBatchHarvest,
    serialize,
    deserialize
  }
})
