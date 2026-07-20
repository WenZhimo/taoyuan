import { describe, expect, it } from 'vitest'
import { RECIPES } from '@/data/recipes'
import {
  processAchievementRecipeUnlocks,
  processDailyRecipeUnlocks
} from '@/domain/endDay/recipeEndDay'
import { getOfficialRecipesAsLegacy } from '@/domain/mods/contentAccess'
import type { RecipeDef } from '@/types'

describe('daily recipe unlock processor', () => {
  it('keeps overnight unlock attempts, duplicate handling, and logs equal for the registry projection', () => {
    const runUnlocks = (recipes: readonly RecipeDef[]) => {
      const attempts: string[] = []
      const logs: string[] = []
      const unlocked = new Set<string>()
      const result = processDailyRecipeUnlocks({
        getFriendshipLevel: () => 'bestFriend',
        getSpouse: () => ({ npcId: 'qiu_yue' }),
        recipes,
        getSkillLevel: () => 10,
        hasItem: () => true,
        unlockRecipe: recipeId => {
          attempts.push(recipeId)
          if (unlocked.has(recipeId)) return false
          unlocked.add(recipeId)
          return true
        },
        addLog: message => logs.push(message)
      })
      return { attempts, logs, result, unlocked: [...unlocked] }
    }

    expect(runUnlocks(getOfficialRecipesAsLegacy())).toEqual(runUnlocks(RECIPES))
  })

  it('preserves NPC, marriage, skill, and item recipe order and messages', () => {
    const order: string[] = []
    const unlockable = new Set([
      'radish_soup',
      'moonlight_sashimi',
      'peacock_feast',
      'skill_recipe',
      'spiced_lamb'
    ])

    const result = processDailyRecipeUnlocks({
      getFriendshipLevel: npcId => {
        order.push(`level:${npcId}`)
        return npcId === 'chen_bo' ? 'acquaintance' : 'stranger'
      },
      getSpouse: () => {
        order.push('spouse')
        return { npcId: 'qiu_yue' }
      },
      recipes: [
        {
          id: 'skill_recipe',
          name: '技能料理',
          requiredSkill: { type: 'farming', level: 3 }
        }
      ],
      getSkillLevel: skillType => {
        order.push(`skill:${skillType}`)
        return 3
      },
      hasItem: itemId => {
        order.push(`item:${itemId}`)
        return itemId === 'hanhai_spice'
      },
      unlockRecipe: recipeId => {
        order.push(`unlock:${recipeId}`)
        return unlockable.delete(recipeId)
      },
      addLog: message => order.push(`log:${message}`)
    })

    expect(order).toContain('log:陈伯（相识）寄来了新食谱！')
    expect(order.indexOf('spouse')).toBeGreaterThan(order.indexOf('unlock:camel_milk_tea'))
    expect(order).toContain('log:秋月教你了新的料理秘方！')
    expect(order).toContain('log:婚后生活解锁了新食谱：孔雀宴！')
    expect(order).toContain('log:技能提升解锁了新食谱：技能料理！')
    expect(order).toContain('log:获得了新食谱：香料烤羊！')
    expect(result).toEqual({
      npcRecipes: 1,
      marriageRecipes: 2,
      skillRecipes: 1,
      itemRecipes: 1
    })
  })

  it('handles 5,000 skill recipes within the performance boundary', () => {
    const recipes = Array.from({ length: 5_000 }, (_, index) => ({
      id: `recipe-${index}`,
      name: `食谱${index}`,
      requiredSkill: { type: 'farming', level: 1 }
    }))
    const start = performance.now()

    const result = processDailyRecipeUnlocks({
      getFriendshipLevel: () => 'stranger',
      getSpouse: () => null,
      recipes,
      getSkillLevel: () => 10,
      hasItem: () => false,
      unlockRecipe: recipeId => recipeId.startsWith('recipe-'),
      addLog: () => {}
    })
    const elapsed = performance.now() - start

    expect(result.skillRecipes).toBe(5_000)
    expect(elapsed).toBeLessThan(500)
  })
})

describe('achievement recipe unlock processor', () => {
  it('evaluates social and legendary conditions before unlocking recipes', () => {
    const order: string[] = []

    const unlocked = processAchievementRecipeUnlocks({
      stats: {
        totalFishCaught: 20,
        totalCropsHarvested: 100,
        highestMineFloor: 50,
        totalRecipesCooked: 20
      },
      discoveredCount: 50,
      getFriendshipLevel: npcId => {
        order.push(`level:${npcId}`)
        return ['chen_bo', 'liu_niang', 'a_shi'].includes(npcId) ? 'friendly' : 'stranger'
      },
      isDiscovered: itemId => {
        order.push(`discovered:${itemId}`)
        return itemId === 'river_dragon'
      },
      unlockRecipe: recipeId => {
        order.push(`unlock:${recipeId}`)
        return true
      },
      addLog: message => order.push(`log:${message}`)
    })

    expect(order.slice(0, 9)).toEqual([
      'level:chen_bo',
      'level:liu_niang',
      'level:a_shi',
      'level:qiu_yue',
      'level:lin_lao',
      'level:xiao_man',
      'discovered:dragonfish',
      'discovered:golden_turtle',
      'discovered:river_dragon'
    ])
    expect(unlocked).toBe(9)
    expect(order).toContain('log:【成就食谱】传说猎人解锁了新食谱！')
  })
})
