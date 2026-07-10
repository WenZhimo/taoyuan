import { describe, expect, it } from 'vitest'
import { calculateMonsterDropBonus, rollMonsterItemDrops } from '@/domain/mining/drops'

describe('mining monster drops', () => {
  it('combines all monster drop bonus sources with existing values', () => {
    expect(
      calculateMonsterDropBonus({
        luckyEnchantCount: 2,
        ringDropBonus: 0.3,
        ringLuckBonus: 0.4,
        slayerCharmActive: true,
        guildBonusDropRate: 0.15
      })
    ).toBeCloseTo(1.25)
  })

  it('rolls monster item drops as guaranteed quantities plus fractional chance', () => {
    const drops = rollMonsterItemDrops(
      [
        { itemId: 'bat_wing', chance: 0.5 },
        { itemId: 'slime', chance: 1.2 }
      ],
      0.8,
      () => 0.1
    )

    expect(drops).toEqual([
      { itemId: 'bat_wing', quantity: 2 },
      { itemId: 'slime', quantity: 2 }
    ])
  })

  it('keeps overflow drop rates proportional for very high bonuses', () => {
    const drops = rollMonsterItemDrops([{ itemId: 'void_ore', chance: 0.25 }], 1.75, () => 0.99)

    expect(drops).toEqual([{ itemId: 'void_ore', quantity: 2 }])
  })

  it('keeps repeated monster drop calculations cheap', () => {
    const iterations = 200_000
    const start = performance.now()
    let total = 0

    for (let i = 0; i < iterations; i++) {
      total += rollMonsterItemDrops(
        [
          { itemId: 'stone', chance: 0.35 },
          { itemId: 'coal', chance: 0.2 }
        ],
        1.15,
        () => (i % 2 === 0 ? 0.1 : 0.9)
      ).reduce((sum, drop) => sum + drop.quantity, 0)
    }

    expect(total).toBeGreaterThan(iterations)
    expect(performance.now() - start).toBeLessThan(500)
  })
})
