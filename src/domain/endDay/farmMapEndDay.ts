import type { FarmMapType, Quality } from '@/types'

export interface FarmMapPlotLike {
  id: number
  state: string
  cropId: string | null
}

export interface ForageItemLike {
  itemId: string
  chance: number
  expReward: number
}

export interface FishLike {
  id: string
}

export interface SurfaceOrePatch {
  oreId: string
  quantity: number
}

export interface CreekCatch {
  fishId: string
  quality: Quality
}

export interface FarmMapEndDayInput {
  farmMapType: FarmMapType
  year: number
  isRainy: boolean
  getCombatLevel: () => number
  addSkillExp: (skill: 'combat' | 'foraging', amount: number) => void
  rollForageQuality: () => Quality
  addItem: (itemId: string, quantity?: number, quality?: Quality) => unknown
  takeDamage: (amount: number) => void
  getPlots: () => readonly FarmMapPlotLike[]
  removeCrop: (plotId: number) => unknown
  getCropName: (cropId: string) => string | undefined
  getItemName: (itemId: string) => string | undefined
  getForageItems: () => readonly ForageItemLike[]
  getSeasonFish: () => readonly FishLike[]
  hasSurfaceOrePatch: () => boolean
  setSurfaceOrePatch: (patch: SurfaceOrePatch) => void
  getCreekCatch: () => readonly CreekCatch[]
  setCreekCatch: (catches: CreekCatch[]) => void
  addLog: (message: string) => void
  random?: () => number
}

export interface FarmMapEndDayResult {
  wildernessEncounter: 'none' | 'win' | 'loss'
  forestGatheredCount: number
  hilltopOreGenerated: boolean
  riverCatchGenerated: number
}

const WILDERNESS_ORES = ['copper_ore', 'iron_ore', 'gold_ore'] as const
const WILDERNESS_LOOT = ['copper_ore', 'iron_ore', 'quartz', 'jade', 'gold_ore'] as const
const MAX_CREEK_CATCH = 10

export function processFarmMapEndDay({
  farmMapType,
  year,
  isRainy,
  getCombatLevel,
  addSkillExp,
  rollForageQuality,
  addItem,
  takeDamage,
  getPlots,
  removeCrop,
  getCropName,
  getItemName,
  getForageItems,
  getSeasonFish,
  hasSurfaceOrePatch,
  setSurfaceOrePatch,
  getCreekCatch,
  setCreekCatch,
  addLog,
  random = Math.random
}: FarmMapEndDayInput): FarmMapEndDayResult {
  let wildernessEncounter: FarmMapEndDayResult['wildernessEncounter'] = 'none'
  let forestGatheredCount = 0
  let hilltopOreGenerated = false
  let riverCatchGenerated = 0

  if (farmMapType === 'wilderness') {
    const randomOre = WILDERNESS_ORES[Math.floor(random() * WILDERNESS_ORES.length)]!
    const quantity = 2 + Math.floor(random() * 2)
    addItem(randomOre, quantity)
    addLog(`荒野中发现了${quantity}个${getItemName(randomOre) ?? randomOre}。`)

    if (random() < 0.25) {
      const winRate = Math.min(0.95, 0.5 + getCombatLevel() * 0.05)
      if (random() < winRate) {
        const loot = WILDERNESS_LOOT[Math.floor(random() * WILDERNESS_LOOT.length)]!
        const lootQuantity = 1 + Math.floor(random() * 2)
        addItem(loot, lootQuantity)
        addSkillExp('combat', 15)
        addLog(
          `夜间有野兽入侵！你奋力击退了它，缴获了${lootQuantity}个${getItemName(loot) ?? loot}。`
        )
        wildernessEncounter = 'win'
      } else {
        const damage = 5 + Math.floor(random() * 11)
        takeDamage(damage)
        const crops = getPlots().filter(
          plot => plot.state === 'growing' || plot.state === 'harvestable'
        )
        if (crops.length > 0) {
          const target = crops[Math.floor(random() * crops.length)]!
          const cropName = getCropName(target.cropId ?? '') ?? '作物'
          removeCrop(target.id)
          addLog(
            `夜间有野兽入侵！你没能挡住它，受了${damage}点伤，一株${cropName}被破坏了。`
          )
        } else {
          addLog(`夜间有野兽入侵！你没能挡住它，受了${damage}点伤。`)
        }
        wildernessEncounter = 'loss'
      }
    }
  }

  if (farmMapType === 'forest') {
    const commonForage = getForageItems().filter(item => item.chance >= 0.1)
    if (commonForage.length > 0) {
      forestGatheredCount = 1 + (random() < 0.4 ? 1 : 0)
      const gathered: string[] = []
      for (let index = 0; index < forestGatheredCount; index++) {
        const item = commonForage[Math.floor(random() * commonForage.length)]!
        const quality = rollForageQuality()
        addItem(item.itemId, 1, quality)
        addSkillExp('foraging', item.expReward)
        gathered.push(getItemName(item.itemId) ?? item.itemId)
      }
      addLog(`竹林间发现了${gathered.join('和')}。`)
    }
  }

  if (farmMapType === 'hilltop' && !hasSurfaceOrePatch() && random() < 0.35) {
    const orePool =
      year >= 2
        ? (['copper_ore', 'iron_ore', 'gold_ore'] as const)
        : (['copper_ore', 'iron_ore'] as const)
    const oreId = orePool[Math.floor(random() * orePool.length)]!
    const quantity = 3 + Math.floor(random() * 3)
    setSurfaceOrePatch({ oreId, quantity })
    addLog(`山丘上发现了一处${getItemName(oreId) ?? '矿石'}脉！`)
    hilltopOreGenerated = true
  }

  if (farmMapType === 'riverland') {
    const seasonFish = getSeasonFish()
    if (seasonFish.length > 0) {
      riverCatchGenerated = isRainy
        ? 2 + Math.floor(random() * 2)
        : 1 + Math.floor(random() * 2)
      const catches: CreekCatch[] = []
      for (let index = 0; index < riverCatchGenerated; index++) {
        const fish = seasonFish[Math.floor(random() * seasonFish.length)]!
        const quality: Quality = random() < 0.15 ? 'fine' : 'normal'
        catches.push({ fishId: fish.id, quality })
      }
      setCreekCatch([...getCreekCatch(), ...catches].slice(0, MAX_CREEK_CATCH))
      addLog('溪流中有鱼儿在跳跃，去农场面板收取鱼获吧。')
    }
  }

  return {
    wildernessEncounter,
    forestGatheredCount,
    hilltopOreGenerated,
    riverCatchGenerated
  }
}
