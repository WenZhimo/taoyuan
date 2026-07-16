import type { QuestInstance, QuestTemplateDef, QuestType } from '@/types/quest'
import type { Season } from '@/types/game'
import {
  QUEST_TEMPLATES as LEGACY_QUEST_TEMPLATES,
  QUEST_TYPE_LABELS,
  SPECIAL_ORDER_TEMPLATES as LEGACY_SPECIAL_ORDER_TEMPLATES,
  TIER_FRIENDSHIP,
  TIER_LABELS,
  type SpecialOrderTemplate
} from './questDefinitions'
import {
  getOfficialQuestTemplatesAsLegacy,
  getOfficialSpecialOrderTemplatesAsLegacy
} from '@/domain/mods/contentAccess'
import { getNpcById } from './npcs'

export { QUEST_TYPE_LABELS }
export type { SpecialOrderTemplate }

export const QUEST_TEMPLATES: QuestTemplateDef[] = [...getOfficialQuestTemplatesAsLegacy()]

const QUEST_TYPE_VERBS: Record<QuestType, string> = {
  delivery: '送给',
  fishing: '钓到',
  mining: '采集',
  gathering: '收集',
  special_order: '收集'
}

let questCounter = 0

/** 根据当前季节和梯度生成特殊订单 (tier: 1-4 对应 第7/14/21/28天) */
export const generateSpecialOrder = (season: Season, tier: number): QuestInstance | null => {
  const clampedTier = Math.max(1, Math.min(4, tier))
  const specialOrderTemplates = getOfficialSpecialOrderTemplatesAsLegacy()
  const valid = specialOrderTemplates.filter(t => t.tier === clampedTier && (t.seasons.length === 0 || t.seasons.includes(season)))
  if (valid.length === 0) return null

  const template = valid[Math.floor(Math.random() * valid.length)]!
  const npcDef = getNpcById(template.npcId)
  const npcName = npcDef?.name ?? template.npcId
  const tierLabel = TIER_LABELS[clampedTier - 1]

  questCounter++
  return {
    id: `special_${Date.now()}_${questCounter}`,
    type: 'special_order',
    npcId: template.npcId,
    npcName,
    tierLabel,
    description: `${npcName}急需${template.quantity}个${template.targetItemName}。`,
    targetItemId: template.targetItemId,
    targetItemName: template.targetItemName,
    targetQuantity: template.quantity,
    collectedQuantity: 0,
    moneyReward: template.moneyReward,
    friendshipReward: TIER_FRIENDSHIP[clampedTier - 1]!,
    daysRemaining: template.days,
    accepted: false,
    itemReward: template.itemReward
  }
}

/** 根据当前季节生成随机委托 */
export const generateQuest = (season: Season, _day: number): QuestInstance | null => {
  // 随机选择委托类型
  const questTemplates = getOfficialQuestTemplatesAsLegacy()
  const typeIndex = Math.floor(Math.random() * questTemplates.length)
  const template = questTemplates[typeIndex] ?? LEGACY_QUEST_TEMPLATES[typeIndex]
  if (!template) return null

  // 按季节过滤目标
  const validTargets = template.targets.filter(t => t.seasons.length === 0 || t.seasons.includes(season))
  if (validTargets.length === 0) return null

  // 随机选择目标
  const target = validTargets[Math.floor(Math.random() * validTargets.length)]!

  // 从候选池随机选择 NPC
  const npcId = template.npcPool[Math.floor(Math.random() * template.npcPool.length)]!
  const npcDef = getNpcById(npcId)
  const npcName = npcDef?.name ?? npcId

  // 随机数量（范围内）
  const quantity = target.minQty + Math.floor(Math.random() * (target.maxQty - target.minQty + 1))

  // 奖励计算
  const moneyReward = Math.floor(target.unitPrice * quantity * template.rewardMultiplier)

  questCounter++
  const verb = QUEST_TYPE_VERBS[template.type]
  const description =
    template.type === 'delivery'
      ? `${npcName}需要${quantity}个${target.name}，请${verb}${npcName}。`
      : `${npcName}委托：${verb}${quantity}个${target.name}。`

  return {
    id: `quest_${Date.now()}_${questCounter}`,
    type: template.type,
    npcId,
    npcName,
    description,
    targetItemId: target.itemId,
    targetItemName: target.name,
    targetQuantity: quantity,
    collectedQuantity: 0,
    moneyReward,
    friendshipReward: template.friendshipReward,
    daysRemaining: 2,
    accepted: false
  }
}

export const getQuestTemplates = (): readonly QuestTemplateDef[] =>
  getOfficialQuestTemplatesAsLegacy() ?? LEGACY_QUEST_TEMPLATES

export const getSpecialOrderTemplates = (): readonly SpecialOrderTemplate[] =>
  getOfficialSpecialOrderTemplatesAsLegacy() ?? LEGACY_SPECIAL_ORDER_TEMPLATES
