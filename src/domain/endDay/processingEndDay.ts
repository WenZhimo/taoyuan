import type { CompletedToolUpgrade } from '@/domain/inventory/toolUpgrades'

export interface CellarUpgrade {
  itemId: string
  addedValue: number
  upgradeCount: number
}

export interface CellarEndDayInput {
  farmhouseLevel: number
  cellarValuePerCycle: number
  dailyCellarUpdate: () => { upgraded: CellarUpgrade[] }
  getItemName: (itemId: string) => string
}

export interface CellarEndDayResult {
  logs: string[]
  upgradedCount: number
}

export interface WorkshopDailyUpdateResult {
  collected: string[]
  readyNames: string[]
}

export interface WorkshopEndDayInput {
  dailyWorkshopUpdate: () => WorkshopDailyUpdateResult
}

export interface WorkshopEndDayResult {
  logs: string[]
  autoCollectedCount: number
  readyCount: number
}

export interface BreedingDailyUpdateResult {
  logs: string[]
  completedCount: number
}

export interface BreedingEndDayInput {
  dailyBreedingUpdate: () => BreedingDailyUpdateResult
}

export interface ToolUpgradeEndDayInput {
  dailyUpgradeUpdate: () => CompletedToolUpgrade[]
  getToolName: (toolType: CompletedToolUpgrade['toolType']) => string
  getTierName: (tier: CompletedToolUpgrade['targetTier']) => string
}

export interface ToolUpgradeEndDayResult {
  logs: string[]
  completedCount: number
}

function summarizeNames(names: string[]): string {
  const counts = new Map<string, number>()
  for (const name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([name, count]) => (count > 1 ? `${name}x${count}` : name))
    .join('、')
}

export function processWorkshopEndDay({
  dailyWorkshopUpdate
}: WorkshopEndDayInput): WorkshopEndDayResult {
  const { collected, readyNames } = dailyWorkshopUpdate()
  const logs: string[] = []

  if (collected.length > 0) {
    logs.push(`工坊自动收取了：${summarizeNames(collected)}。`)
  }
  if (readyNames.length > 0) {
    logs.push(`加工完成：${summarizeNames(readyNames)}，去工坊收取吧。`)
  }

  return {
    logs,
    autoCollectedCount: collected.length,
    readyCount: readyNames.length
  }
}

export function processBreedingEndDay({
  dailyBreedingUpdate
}: BreedingEndDayInput): BreedingDailyUpdateResult {
  const result = dailyBreedingUpdate()
  return {
    logs: [...result.logs],
    completedCount: result.completedCount
  }
}

export function processToolUpgradeEndDay({
  dailyUpgradeUpdate,
  getToolName,
  getTierName
}: ToolUpgradeEndDayInput): ToolUpgradeEndDayResult {
  const completed = dailyUpgradeUpdate()
  return {
    logs: completed.map(
      upgrade => `小满完成了${getToolName(upgrade.toolType)}的升级！现在是${getTierName(upgrade.targetTier)}级。`
    ),
    completedCount: completed.length
  }
}

export function processCellarEndDay({
  farmhouseLevel,
  cellarValuePerCycle,
  dailyCellarUpdate,
  getItemName
}: CellarEndDayInput): CellarEndDayResult {
  if (farmhouseLevel < 3) {
    return { logs: [], upgradedCount: 0 }
  }

  const cellarResult = dailyCellarUpdate()
  const logs: string[] = []

  for (const upgrade of cellarResult.upgraded) {
    const name = getItemName(upgrade.itemId)
    logs.push(`酒窖中的${name}价值提升了+${cellarValuePerCycle}文（共+${upgrade.addedValue}文）`)
    if (upgrade.upgradeCount >= 16 && upgrade.upgradeCount % 16 === 0) {
      logs.push(`${name}已成为陈酿${upgrade.upgradeCount / 16}年！`)
    }
  }

  return {
    logs,
    upgradedCount: cellarResult.upgraded.length
  }
}
