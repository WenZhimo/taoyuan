import type { Tool, ToolTier, ToolType } from '@/types'

export interface PendingToolUpgrade {
  toolType: ToolType
  targetTier: ToolTier
  daysRemaining: number
}

export interface CompletedToolUpgrade {
  completed: true
  toolType: ToolType
  targetTier: ToolTier
}

const TOOL_TIERS: ToolTier[] = ['basic', 'iron', 'steel', 'iridium']

export const upgradeToolTier = (tools: readonly Tool[], toolType: ToolType): { success: boolean; tools: Tool[] } => {
  const updatedTools = tools.map(tool => ({ ...tool }))
  const tool = updatedTools.find(current => current.type === toolType)
  if (!tool) return { success: false, tools: updatedTools }

  const currentIndex = TOOL_TIERS.indexOf(tool.tier)
  if (currentIndex < 0 || currentIndex >= TOOL_TIERS.length - 1) {
    return { success: false, tools: updatedTools }
  }

  tool.tier = TOOL_TIERS[currentIndex + 1]!
  return { success: true, tools: updatedTools }
}

export const startToolUpgrade = (
  pendingUpgrades: readonly PendingToolUpgrade[],
  toolType: ToolType,
  targetTier: ToolTier,
  daysRemaining = 2
): { success: boolean; pendingUpgrades: PendingToolUpgrade[] } => {
  const updatedPending = pendingUpgrades.map(upgrade => ({ ...upgrade }))
  if (updatedPending.some(upgrade => upgrade.toolType === toolType)) {
    return { success: false, pendingUpgrades: updatedPending }
  }

  updatedPending.push({ toolType, targetTier, daysRemaining })
  return { success: true, pendingUpgrades: updatedPending }
}

export const advanceToolUpgradesOneDay = (
  pendingUpgrades: readonly PendingToolUpgrade[]
): { pendingUpgrades: PendingToolUpgrade[]; completed: CompletedToolUpgrade[] } => {
  const completed: CompletedToolUpgrade[] = []
  const remaining: PendingToolUpgrade[] = []

  for (const upgrade of pendingUpgrades) {
    const nextDaysRemaining = upgrade.daysRemaining - 1
    if (nextDaysRemaining <= 0) {
      completed.push({ completed: true, toolType: upgrade.toolType, targetTier: upgrade.targetTier })
    } else {
      remaining.push({ ...upgrade, daysRemaining: nextDaysRemaining })
    }
  }

  return { pendingUpgrades: remaining, completed }
}
