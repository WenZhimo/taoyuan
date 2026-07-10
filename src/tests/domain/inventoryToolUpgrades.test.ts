import { describe, expect, it } from 'vitest'
import {
  advanceToolUpgradesOneDay,
  startToolUpgrade,
  upgradeToolTier,
  type PendingToolUpgrade
} from '@/domain/inventory/toolUpgrades'
import type { Tool } from '@/types'

describe('inventory tool upgrade rules', () => {
  it('upgrades a tool by one tier without mutating the original tools', () => {
    const tools: Tool[] = [
      { type: 'hoe', tier: 'basic' },
      { type: 'axe', tier: 'steel' }
    ]

    const result = upgradeToolTier(tools, 'hoe')

    expect(result).toEqual({
      success: true,
      tools: [
        { type: 'hoe', tier: 'iron' },
        { type: 'axe', tier: 'steel' }
      ]
    })
    expect(tools[0]?.tier).toBe('basic')
  })

  it('does not upgrade missing or already max-tier tools', () => {
    expect(upgradeToolTier([{ type: 'hoe', tier: 'iridium' }], 'hoe')).toEqual({
      success: false,
      tools: [{ type: 'hoe', tier: 'iridium' }]
    })
    expect(upgradeToolTier([{ type: 'hoe', tier: 'basic' }], 'axe')).toEqual({
      success: false,
      tools: [{ type: 'hoe', tier: 'basic' }]
    })
  })

  it('starts one pending upgrade per tool', () => {
    const pending: PendingToolUpgrade[] = [{ toolType: 'hoe', targetTier: 'iron', daysRemaining: 2 }]

    expect(startToolUpgrade(pending, 'axe', 'iron')).toEqual({
      success: true,
      pendingUpgrades: [
        { toolType: 'hoe', targetTier: 'iron', daysRemaining: 2 },
        { toolType: 'axe', targetTier: 'iron', daysRemaining: 2 }
      ]
    })
    expect(startToolUpgrade(pending, 'hoe', 'steel')).toEqual({
      success: false,
      pendingUpgrades: [{ toolType: 'hoe', targetTier: 'iron', daysRemaining: 2 }]
    })
  })

  it('advances pending upgrades and returns completed upgrades', () => {
    const result = advanceToolUpgradesOneDay([
      { toolType: 'hoe', targetTier: 'iron', daysRemaining: 2 },
      { toolType: 'axe', targetTier: 'steel', daysRemaining: 1 }
    ])

    expect(result).toEqual({
      pendingUpgrades: [{ toolType: 'hoe', targetTier: 'iron', daysRemaining: 1 }],
      completed: [{ completed: true, toolType: 'axe', targetTier: 'steel' }]
    })
  })
})
