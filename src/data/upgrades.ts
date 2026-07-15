import type { ToolType, ToolTier } from '@/types'
import { getOfficialToolUpgradeCost } from '@/domain/mods/contentAccess'
import type { ToolUpgradeCost } from './toolUpgradeDefinitions'
import { TOOL_UPGRADE_COSTS as LEGACY_TOOL_UPGRADE_COSTS } from './toolUpgradeDefinitions'

export type { ToolUpgradeCost } from './toolUpgradeDefinitions'
export {
  TOOL_NAMES,
  TIER_NAMES,
  TOOL_UPGRADE_COSTS
} from './toolUpgradeDefinitions'

export const getUpgradeCost = (type: ToolType, currentTier: ToolTier): ToolUpgradeCost | undefined => {
  return getOfficialToolUpgradeCost(type, currentTier)
    ?? LEGACY_TOOL_UPGRADE_COSTS[type].find(cost => cost.fromTier === currentTier)
}
