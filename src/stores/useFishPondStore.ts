import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PondLevel, FishPondState, PondFish, FishGenetics, PondDailyResult, BreedingPair } from '@/types/fishPond'
import type { Quality } from '@/types'
import {
  POND_BUILD_COST,
  POND_UPGRADE_COSTS,
  POND_CAPACITY,
  WATER_QUALITY_DECAY_BASE,
  WATER_QUALITY_DECAY_HALF,
  WATER_QUALITY_DECAY_CROWDED,
  WATER_QUALITY_DECAY_HUNGRY,
  DISEASE_THRESHOLD,
  DISEASE_CHANCE_BASE,
  SICK_DEATH_DAYS,
  FEED_WATER_RESTORE,
  PURIFIER_WATER_RESTORE,
  FISH_BREEDING_DAYS,
  GENETICS_FLUCTUATION_BASE,
  POND_MUTATION_JUMP_MIN,
  POND_MUTATION_JUMP_MAX,
  getPondableFish,
  isPondableFish
} from '@/data/fishPond'
import { getGen1BreedsForFish, findBreedByParents, getBreedById, getBreedsByGeneration } from '@/data/pondBreeds'
import { usePlayerStore } from './usePlayerStore'
import { useInventoryStore } from './useInventoryStore'
import { getCombinedItemCount, removeCombinedItem } from '@/composables/useCombinedInventory'
import { useSkillStore } from './useSkillStore'

let _idCounter = 0
const generateFishId = (): string => {
  _idCounter++
  return `pf_${Date.now()}_${_idCounter}`
}

const generateBreedingId = (): string => {
  _idCounter++
  return `pb_${Date.now()}_${_idCounter}`
}

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v))

export const useFishPondStore = defineStore('fishPond', () => {
  // === 状态 ===

  const pond = ref<FishPondState>({
    built: false,
    level: 1 as PondLevel,
    fish: [],
    waterQuality: 100,
    fedToday: false,
    breeding: null,
    nurseryBreeding: [],
    reproductionProgress: {},
    collectedToday: false
  })

  /** 已发现的品种ID集合（图鉴） */
  const discoveredBreeds = ref<Set<string>>(new Set())

  // === 计算属性 ===

  const capacity = computed(() => {
    if (!pond.value.built) return 0
    if (pond.value.level >= 3) return Number.POSITIVE_INFINITY
    return POND_CAPACITY[pond.value.level]
  })
  const fishCount = computed(() => pond.value.fish.length)
  const isFull = computed(() => fishCount.value >= capacity.value)
  const sickFish = computed(() => pond.value.fish.filter(f => f.sick))
  const matureFish = computed(() => pond.value.fish.filter(f => f.mature))
  const fishGroups = computed(() => {
    const map = new Map<string, PondFish[]>()
    for (const fish of pond.value.fish) {
      const list = map.get(fish.fishId) ?? []
      list.push(fish)
      map.set(fish.fishId, list)
    }
    return [...map.entries()]
      .map(([fishId, fish]) => {
        const count = fish.length
        const totalStars = fish.reduce((sum, f) => sum + getGeneticStarRating(f.genetics), 0)
        const totalDays = fish.reduce((sum, f) => sum + f.daysInPond, 0)
        return {
          fishId,
          name: getPondableFish(fishId)?.name ?? fish[0]?.name ?? fishId,
          fish,
          count,
          matureCount: fish.filter(f => f.mature).length,
          sickCount: fish.filter(f => f.sick).length,
          juvenileCount: fish.filter(f => !f.mature).length,
          averageStars: count > 0 ? Math.round(totalStars / count) : 0,
          averageDays: count > 0 ? Math.floor(totalDays / count) : 0
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  /** 密度百分比 */
  const density = computed(() => {
    if (capacity.value === 0) return 0
    return fishCount.value / capacity.value
  })

  // === 建造/升级 ===

  const buildPond = (): boolean => {
    if (pond.value.built) return false
    const playerStore = usePlayerStore()

    for (const mat of POND_BUILD_COST.materials) {
      if (getCombinedItemCount(mat.itemId) < mat.quantity) return false
    }
    if (!playerStore.spendMoney(POND_BUILD_COST.money)) return false
    for (const mat of POND_BUILD_COST.materials) {
      removeCombinedItem(mat.itemId, mat.quantity)
    }

    pond.value.built = true
    pond.value.level = 1
    pond.value.waterQuality = 100
    return true
  }

  const upgradePond = (): boolean => {
    if (!pond.value.built) return false
    if (pond.value.level >= 3) return false
    const nextLevel = (pond.value.level + 1) as 2 | 3
    const cost = POND_UPGRADE_COSTS[nextLevel]

    const playerStore = usePlayerStore()

    for (const mat of cost.materials) {
      if (getCombinedItemCount(mat.itemId) < mat.quantity) return false
    }
    if (!playerStore.spendMoney(cost.money)) return false
    for (const mat of cost.materials) {
      removeCombinedItem(mat.itemId, mat.quantity)
    }

    pond.value.level = nextLevel
    return true
  }

  // === 鱼操作 ===

  /** 从背包放鱼入塘（自动分配随机 Gen1 品种） */
  const addFish = (fishId: string, quantity: number = 1): number => {
    if (!pond.value.built) return 0
    if (!isPondableFish(fishId)) return 0
    const inventoryStore = useInventoryStore()
    const def = getPondableFish(fishId)!
    const g1Breeds = getGen1BreedsForFish(fishId)
    let added = 0
    for (let i = 0; i < quantity; i++) {
      if (fishCount.value >= capacity.value) break
      if (!inventoryStore.removeItem(fishId, 1)) break
      const breed = g1Breeds.length > 0 ? g1Breeds[Math.floor(Math.random() * g1Breeds.length)] : null
      const fish: PondFish = {
        id: generateFishId(),
        fishId,
        name: breed ? breed.name : def.name,
        genetics: { ...def.defaultGenetics },
        daysInPond: 0,
        mature: false,
        sick: false,
        sickDays: 0,
        breedId: breed ? breed.breedId : null
      }
      pond.value.fish.push(fish)
      if (breed) discoveredBreeds.value.add(breed.breedId)
      added++
    }
    return added
  }

  /** 从塘中取鱼回背包 */
  const removeFish = (pondFishId: string): boolean => {
    const idx = pond.value.fish.findIndex(f => f.id === pondFishId)
    if (idx === -1) return false
    const fish = pond.value.fish[idx]!
    const inventoryStore = useInventoryStore()
    if (inventoryStore.isAllFull && !inventoryStore.items.some(s => s.itemId === fish.fishId && s.quantity < 999)) return false
    inventoryStore.addItem(fish.fishId, 1)
    pond.value.fish.splice(idx, 1)
    // 如果正在繁殖的鱼被取出，取消繁殖
    pond.value.nurseryBreeding = pond.value.nurseryBreeding.filter(pair => pair.parentA !== pondFishId && pair.parentB !== pondFishId)
    return true
  }

  // === 喂食/清理/治疗 ===

  const feedFish = (): boolean => {
    if (!pond.value.built || pond.value.fedToday) return false
    if (pond.value.fish.length === 0) return false
    const inventoryStore = useInventoryStore()
    if (!inventoryStore.removeItem('fish_feed', 1)) return false
    pond.value.fedToday = true
    pond.value.waterQuality = clamp(pond.value.waterQuality + FEED_WATER_RESTORE, 0, 100)
    return true
  }

  const cleanPond = (): boolean => {
    if (!pond.value.built) return false
    const inventoryStore = useInventoryStore()
    if (!inventoryStore.removeItem('water_purifier', 1)) return false
    pond.value.waterQuality = clamp(pond.value.waterQuality + PURIFIER_WATER_RESTORE, 0, 100)
    return true
  }

  const treatSickFish = (): number => {
    if (!pond.value.built) return 0
    const inventoryStore = useInventoryStore()
    const sick = pond.value.fish.filter(f => f.sick)
    if (sick.length === 0) return 0
    if (!inventoryStore.removeItem('animal_medicine', 1)) return 0
    for (const f of sick) {
      f.sick = false
      f.sickDays = 0
    }
    return sick.length
  }

  // === 繁殖 ===

  const activeNurseryParentIds = computed(() => {
    const ids = new Set<string>()
    for (const pair of pond.value.nurseryBreeding) {
      ids.add(pair.parentA)
      ids.add(pair.parentB)
    }
    return ids
  })

  const startBreeding = (fishIdA: string, fishIdB: string): boolean => {
    if (!pond.value.built) return false

    const fishA = pond.value.fish.find(f => f.id === fishIdA)
    const fishB = pond.value.fish.find(f => f.id === fishIdB)
    if (!fishA || !fishB) return false
    if (fishA.id === fishB.id) return false
    if (fishA.fishId !== fishB.fishId) return false
    if (!fishA.mature || !fishB.mature) return false
    if (fishA.sick || fishB.sick) return false
    if (activeNurseryParentIds.value.has(fishA.id) || activeNurseryParentIds.value.has(fishB.id)) return false

    pond.value.nurseryBreeding.push({
      id: generateBreedingId(),
      parentA: fishIdA,
      parentB: fishIdB,
      daysLeft: FISH_BREEDING_DAYS,
      fishId: fishA.fishId
    })
    return true
  }

  const startBreedingForSpecies = (fishId: string): number => {
    if (!pond.value.built) return 0
    const available = pond.value.fish
      .filter(f => f.fishId === fishId && f.mature && !f.sick && !activeNurseryParentIds.value.has(f.id))
      .sort((a, b) => getGeneticStarRating(b.genetics) - getGeneticStarRating(a.genetics))
    let started = 0
    for (let i = 0; i + 1 < available.length; i += 2) {
      if (startBreeding(available[i]!.id, available[i + 1]!.id)) started++
    }
    return started
  }

  /** 遗传算法：生成后代基因 */
  const _breedGenetics = (a: FishGenetics, b: FishGenetics): FishGenetics => {
    const avgStability = (a.diseaseRes + b.diseaseRes) / 2
    const fluctuationRange = GENETICS_FLUCTUATION_BASE * (1 - avgStability / 200)
    const avgMutRate = (a.mutationRate + b.mutationRate) / 2

    const inherit = (va: number, vb: number, min: number, max: number): number => {
      const avg = (va + vb) / 2
      const fluctuation = (Math.random() - 0.5) * 2 * fluctuationRange
      let val = avg + fluctuation

      // 变异
      if (Math.random() < avgMutRate / 100) {
        const jump = POND_MUTATION_JUMP_MIN + Math.random() * (POND_MUTATION_JUMP_MAX - POND_MUTATION_JUMP_MIN)
        val += Math.random() < 0.5 ? jump : -jump
      }

      return clamp(Math.round(val), min, max)
    }

    return {
      weight: inherit(a.weight, b.weight, 0, 100),
      growthRate: inherit(a.growthRate, b.growthRate, 0, 100),
      diseaseRes: inherit(a.diseaseRes, b.diseaseRes, 0, 100),
      qualityGene: inherit(a.qualityGene, b.qualityGene, 0, 100),
      mutationRate: inherit(a.mutationRate, b.mutationRate, 1, 50)
    }
  }

  const createChildFish = (parentA: PondFish, parentB: PondFish, fishId: string): PondFish | null => {
    const def = getPondableFish(fishId)
    if (!def) return null
    const childGenetics = _breedGenetics(parentA.genetics, parentB.genetics)

    let childBreedId: string | null = null
    let childName = def.name
    if (parentA.breedId && parentB.breedId) {
      const recipe = findBreedByParents(parentA.breedId, parentB.breedId)
      if (recipe) {
        childBreedId = recipe.breedId
        childName = recipe.name
        discoveredBreeds.value.add(recipe.breedId)
      }
    }
    if (!childBreedId) {
      const parentABreed = parentA.breedId ? getBreedById(parentA.breedId) : null
      const parentBBreed = parentB.breedId ? getBreedById(parentB.breedId) : null
      const parentGen = Math.min(parentABreed?.generation ?? 1, parentBBreed?.generation ?? 1) as 1 | 2 | 3 | 4 | 5
      const sameGenBreeds = getBreedsByGeneration(parentGen).filter(b => b.baseFishId === def.fishId)
      if (sameGenBreeds.length > 0) {
        const rnd = sameGenBreeds[Math.floor(Math.random() * sameGenBreeds.length)]!
        childBreedId = rnd.breedId
        childName = rnd.name
        discoveredBreeds.value.add(rnd.breedId)
      }
    }

    return {
      id: generateFishId(),
      fishId,
      name: childName,
      genetics: childGenetics,
      daysInPond: 0,
      mature: false,
      sick: false,
      sickDays: 0,
      breedId: childBreedId
    }
  }

  // === 产出品质 ===

  const _getProductQuality = (qualityGene: number): Quality => {
    const roll = Math.random() * 100
    if (qualityGene >= 75 && roll < qualityGene - 50) return 'supreme'
    if (qualityGene >= 50 && roll < qualityGene - 25) return 'excellent'
    if (qualityGene >= 25 && roll < qualityGene) return 'fine'
    return 'normal'
  }

  // === 收获 ===

  /** 当日待收集产出（由 dailyUpdate 填充） */
  const pendingProducts = ref<{ itemId: string; quality: Quality }[]>([])

  const collectProducts = (): { itemId: string; quality: Quality }[] => {
    if (!pond.value.built || pond.value.collectedToday) return []
    const collected = [...pendingProducts.value]
    pendingProducts.value = []
    pond.value.collectedToday = true
    return collected
  }

  // === 每日更新 ===

  const dailyUpdate = (): PondDailyResult => {
    const result: PondDailyResult = {
      products: [],
      died: [],
      gotSick: [],
      healed: [],
      bred: [],
      reproduced: [],
      breedingFailed: []
    }

    if (!pond.value.built || pond.value.fish.length === 0) {
      pond.value.fedToday = false
      pond.value.collectedToday = false
      return result
    }

    const skillStore = useSkillStore()
    const fishingLevel = skillStore.getSkill('fishing').level

    // 1. 水质衰减
    let decay = WATER_QUALITY_DECAY_BASE
    if (density.value > 0.8) decay += WATER_QUALITY_DECAY_CROWDED
    else if (density.value > 0.5) decay += WATER_QUALITY_DECAY_HALF

    // 2. 未喂食额外衰减
    if (!pond.value.fedToday) {
      decay += WATER_QUALITY_DECAY_HUNGRY
    }

    pond.value.waterQuality = clamp(pond.value.waterQuality - decay, 0, 100)

    // 3. 疾病判定 + 4. 死亡判定 + 5. 自然恢复
    const toRemove: number[] = []
    for (let i = 0; i < pond.value.fish.length; i++) {
      const fish = pond.value.fish[i]!

      // 生病鱼死亡判定
      if (fish.sick) {
        fish.sickDays++
        if (fish.sickDays >= SICK_DEATH_DAYS) {
          result.died.push(fish.name)
          toRemove.push(i)
          continue
        }
      }

      // 疾病判定
      if (!fish.sick && pond.value.waterQuality < DISEASE_THRESHOLD) {
        const resist = fish.genetics.diseaseRes / 100
        // 钓鱼等级降低生病率
        const chance = (DISEASE_CHANCE_BASE * (1 - resist)) / (1 + fishingLevel * 0.05)
        if (Math.random() < chance) {
          fish.sick = true
          fish.sickDays = 0
          result.gotSick.push(fish.name)
        }
      }

      // 自然恢复：已喂食 + 水质OK → 清除生病
      if (fish.sick && pond.value.fedToday && pond.value.waterQuality >= DISEASE_THRESHOLD) {
        fish.sick = false
        fish.sickDays = 0
        result.healed.push(fish.name)
      }

      // 6. 成熟判定
      fish.daysInPond++
      if (!fish.mature) {
        const def = getPondableFish(fish.fishId)
        if (def) {
          const growthBonus = fish.genetics.growthRate / 100
          const effectiveDays = def.maturityDays * (1 - growthBonus * 0.3)
          if (fish.daysInPond >= effectiveDays) {
            fish.mature = true
          }
        }
      }
    }

    // 移除死亡鱼（倒序）
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const idx = toRemove[i]!
      const deadFish = pond.value.fish[idx]!
      pond.value.nurseryBreeding = pond.value.nurseryBreeding.filter(pair => pair.parentA !== deadFish.id && pair.parentB !== deadFish.id)
      pond.value.fish.splice(idx, 1)
    }

    // 7. 产出生成（成熟 + 已喂食 + 未生病）
    if (pond.value.fedToday) {
      for (const fish of pond.value.fish) {
        if (!fish.mature || fish.sick) continue
        const def = getPondableFish(fish.fishId)
        if (!def) continue
        // 产出概率受体重基因影响
        const weightBonus = fish.genetics.weight / 200
        const rate = def.baseProductionRate + weightBonus
        if (Math.random() < rate) {
          const quality = _getProductQuality(fish.genetics.qualityGene)
          result.products.push({ itemId: def.productItemId, quality })
        }
      }
    }

    // 8. 育苗塘：人工配对任务
    const remainingPairs: BreedingPair[] = []
    for (const pair of pond.value.nurseryBreeding) {
      pair.daysLeft--
      if (pair.daysLeft > 0) {
        remainingPairs.push(pair)
        continue
      }
      const parentA = pond.value.fish.find(f => f.id === pair.parentA)
      const parentB = pond.value.fish.find(f => f.id === pair.parentB)
      if (!parentA || !parentB) {
        result.breedingFailed.push('亲鱼死亡，育苗失败')
        continue
      }
      if (fishCount.value >= capacity.value) {
        result.breedingFailed.push('鱼塘已满，育苗失败')
        continue
      }
      const child = createChildFish(parentA, parentB, pair.fishId)
      if (child) {
        pond.value.fish.push(child)
        result.bred.push(child.name)
      }
    }
    pond.value.nurseryBreeding = remainingPairs

    // 9. 繁衍塘：同种成熟鱼越多，新鱼出现越快，数量也越多
    const reproductionSummary = new Map<string, { fishId: string; name: string; quantity: number }>()
    for (const group of fishGroups.value) {
      const breeders = group.fish.filter(f => f.mature && !f.sick)
      const pairPower = Math.floor(breeders.length / 2)
      if (pairPower <= 0) continue
      pond.value.reproductionProgress[group.fishId] = (pond.value.reproductionProgress[group.fishId] ?? 0) + pairPower
      while (pond.value.reproductionProgress[group.fishId]! >= FISH_BREEDING_DAYS && fishCount.value < capacity.value) {
        pond.value.reproductionProgress[group.fishId]! -= FISH_BREEDING_DAYS
        const parentA = breeders[Math.floor(Math.random() * breeders.length)]!
        let parentB = breeders[Math.floor(Math.random() * breeders.length)]!
        if (breeders.length > 1) {
          while (parentB.id === parentA.id) {
            parentB = breeders[Math.floor(Math.random() * breeders.length)]!
          }
        }
        const child = createChildFish(parentA, parentB, group.fishId)
        if (!child) break
        pond.value.fish.push(child)
        const current = reproductionSummary.get(group.fishId) ?? { fishId: group.fishId, name: getPondableFish(group.fishId)?.name ?? child.name, quantity: 0 }
        current.quantity++
        reproductionSummary.set(group.fishId, current)
      }
    }
    result.reproduced = [...reproductionSummary.values()]

    // 将产出存入待收集
    pendingProducts.value = [...result.products]

    // 10. 重置
    pond.value.fedToday = false
    pond.value.collectedToday = false

    return result
  }

  // === 基因星级 ===

  const getGeneticStarRating = (genetics: FishGenetics): number => {
    const total = genetics.weight + genetics.growthRate + genetics.diseaseRes + genetics.qualityGene
    if (total >= 320) return 5
    if (total >= 260) return 4
    if (total >= 200) return 3
    if (total >= 140) return 2
    return 1
  }

  // === 序列化 ===

  const serialize = () => ({
    pond: pond.value,
    pendingProducts: pendingProducts.value,
    discoveredBreeds: [...discoveredBreeds.value]
  })

  const deserialize = (data: any) => {
    if (data?.pond) {
      pond.value = {
        built: data.pond.built ?? false,
        level: data.pond.level ?? 1,
        fish: (data.pond.fish ?? []).map((f: any) => ({
          id: f.id ?? generateFishId(),
          fishId: f.fishId ?? '',
          name: f.name ?? '',
          genetics: {
            weight: f.genetics?.weight ?? 50,
            growthRate: f.genetics?.growthRate ?? 50,
            diseaseRes: f.genetics?.diseaseRes ?? 50,
            qualityGene: f.genetics?.qualityGene ?? 30,
            mutationRate: f.genetics?.mutationRate ?? 10
          },
          daysInPond: f.daysInPond ?? 0,
          mature: f.mature ?? false,
          sick: f.sick ?? false,
          sickDays: f.sickDays ?? 0,
          breedId: f.breedId ?? null
        })),
        waterQuality: data.pond.waterQuality ?? 100,
        fedToday: data.pond.fedToday ?? false,
        breeding: null,
        nurseryBreeding: [
          ...(((data.pond.nurseryBreeding ?? []) as any[]).map(pair => ({
            id: pair.id ?? generateBreedingId(),
            parentA: pair.parentA ?? '',
            parentB: pair.parentB ?? '',
            daysLeft: pair.daysLeft ?? FISH_BREEDING_DAYS,
            fishId: pair.fishId ?? ''
          }))),
          ...(data.pond.breeding
            ? [
                {
                  id: data.pond.breeding.id ?? generateBreedingId(),
                  parentA: data.pond.breeding.parentA ?? '',
                  parentB: data.pond.breeding.parentB ?? '',
                  daysLeft: data.pond.breeding.daysLeft ?? FISH_BREEDING_DAYS,
                  fishId: data.pond.breeding.fishId ?? ''
                }
              ]
            : [])
        ],
        reproductionProgress: data.pond.reproductionProgress ?? {},
        collectedToday: data.pond.collectedToday ?? false
      }
    }
    pendingProducts.value = data?.pendingProducts ?? []
    discoveredBreeds.value = new Set(data?.discoveredBreeds ?? [])
  }

  return {
    pond,
    capacity,
    fishCount,
    isFull,
    sickFish,
    matureFish,
    fishGroups,
    activeNurseryParentIds,
    density,
    pendingProducts,
    discoveredBreeds,
    buildPond,
    upgradePond,
    addFish,
    removeFish,
    feedFish,
    cleanPond,
    treatSickFish,
    startBreeding,
    startBreedingForSpecies,
    collectProducts,
    dailyUpdate,
    getGeneticStarRating,
    serialize,
    deserialize
  }
})
