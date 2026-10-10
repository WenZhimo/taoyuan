import type { PackageId } from './ids'
import type { PackageManifest } from './schemas'

export interface ActiveGameplayStartingItem {
  readonly itemId: string
  readonly quantity: number
}

export interface ActiveGameplayStartingEquipment {
  readonly weaponId: string
  readonly enchantmentIds: readonly string[]
}

export interface ActiveThirdPartyGameplayModifiers {
  readonly unlimitedMoney: boolean
  readonly startingMoney?: number
  readonly startingItems: readonly ActiveGameplayStartingItem[]
  readonly randomStartingItems?: {
    readonly options: readonly ActiveGameplayStartingItem[]
    readonly picks: number
  }
  readonly unlockedRecipeIds: readonly string[]
  readonly startingEquipment: readonly ActiveGameplayStartingEquipment[]
  readonly monsterHealthBarColor?: string
}

const emptyModifiers: ActiveThirdPartyGameplayModifiers = Object.freeze({
  unlimitedMoney: false,
  startingItems: Object.freeze([]),
  unlockedRecipeIds: Object.freeze([]),
  startingEquipment: Object.freeze([])
})

let activeModifiers: ActiveThirdPartyGameplayModifiers = emptyModifiers
let activePackageIds: readonly PackageId[] = Object.freeze([])

const toLegacyId = (id: string): string => {
  const separator = id.indexOf(':')
  return separator < 0 ? id : id.slice(separator + 1)
}

const freezeStartingItems = (
  items: readonly ActiveGameplayStartingItem[]
): readonly ActiveGameplayStartingItem[] => Object.freeze(
  items.map(item => Object.freeze({ itemId: toLegacyId(item.itemId), quantity: item.quantity }))
)

const freezeStartingEquipment = (
  equipment: readonly ActiveGameplayStartingEquipment[]
): readonly ActiveGameplayStartingEquipment[] => Object.freeze(
  equipment.map(item => Object.freeze({
    weaponId: toLegacyId(item.weaponId),
    enchantmentIds: Object.freeze(item.enchantmentIds.map(toLegacyId))
  }))
)

export const mergeThirdPartyGameplayModifiers = (
  manifests: readonly PackageManifest[]
): ActiveThirdPartyGameplayModifiers => {
  let unlimitedMoney = false
  let startingMoney: number | undefined
  let monsterHealthBarColor: string | undefined
  const startingItems: ActiveGameplayStartingItem[] = []
  const randomOptions: ActiveGameplayStartingItem[] = []
  const unlockedRecipeIds: string[] = []
  const startingEquipment: ActiveGameplayStartingEquipment[] = []
  let randomPicks = 0

  for (const manifest of manifests) {
    const modifiers = manifest.gameplayModifiers
    if (modifiers === undefined) continue

    unlimitedMoney ||= modifiers.unlimitedMoney === true
    if (modifiers.startingMoney !== undefined) startingMoney = modifiers.startingMoney
    if (modifiers.monsterHealthBarColor !== undefined) {
      monsterHealthBarColor = modifiers.monsterHealthBarColor
    }
    if (modifiers.startingItems !== undefined) startingItems.push(...modifiers.startingItems)
    if (modifiers.randomStartingItems !== undefined) {
      randomOptions.push(...modifiers.randomStartingItems.options)
      randomPicks = Math.max(randomPicks, modifiers.randomStartingItems.picks)
    }
    if (modifiers.unlockedRecipeIds !== undefined) unlockedRecipeIds.push(...modifiers.unlockedRecipeIds)
    if (modifiers.startingEquipment !== undefined) startingEquipment.push(...modifiers.startingEquipment)
  }

  const uniqueRecipeIds = [...new Set(unlockedRecipeIds.map(toLegacyId))]
  const randomStartingItems = randomOptions.length > 0
    ? Object.freeze({
        options: freezeStartingItems(randomOptions),
        picks: Math.min(randomPicks, randomOptions.length)
      })
    : undefined

  return Object.freeze({
    unlimitedMoney,
    ...(startingMoney === undefined ? {} : { startingMoney }),
    startingItems: freezeStartingItems(startingItems),
    ...(randomStartingItems === undefined ? {} : { randomStartingItems }),
    unlockedRecipeIds: Object.freeze(uniqueRecipeIds),
    startingEquipment: freezeStartingEquipment(startingEquipment),
    ...(monsterHealthBarColor === undefined ? {} : { monsterHealthBarColor })
  })
}

export const publishThirdPartyGameplayModifiersSnapshot = (
  modifiers: ActiveThirdPartyGameplayModifiers | undefined,
  packageIds: readonly PackageId[] = []
): void => {
  activeModifiers = modifiers ?? emptyModifiers
  activePackageIds = Object.freeze([...packageIds]) as readonly PackageId[]
}

export const publishThirdPartyGameplayModifiers = (
  manifests: readonly PackageManifest[],
  packageIds: readonly PackageId[] = manifests.map(manifest => manifest.id) as PackageId[]
): ActiveThirdPartyGameplayModifiers => {
  const modifiers = mergeThirdPartyGameplayModifiers(manifests)
  publishThirdPartyGameplayModifiersSnapshot(modifiers, packageIds)
  return modifiers
}

export const resetThirdPartyGameplayModifiersForTests = (): void => {
  publishThirdPartyGameplayModifiersSnapshot(undefined)
}

export const getActiveThirdPartyGameplayModifiers = (): ActiveThirdPartyGameplayModifiers => activeModifiers

export const getActiveThirdPartyGameplayModifierPackageIds = (): readonly PackageId[] => activePackageIds

export const isUnlimitedMoneyActive = (): boolean => activeModifiers.unlimitedMoney

export const getConfiguredStartingMoney = (): number | undefined =>
  activeModifiers.startingMoney
  ?? (activeModifiers.unlimitedMoney ? Number.MAX_SAFE_INTEGER : undefined)

export const getStartingItems = (
  random: () => number = Math.random
): readonly ActiveGameplayStartingItem[] => {
  const result = [...activeModifiers.startingItems]
  const randomGroup = activeModifiers.randomStartingItems
  if (randomGroup === undefined || randomGroup.picks <= 0) return result

  const candidates = [...randomGroup.options]
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))))
    const current = candidates[index]
    candidates[index] = candidates[randomIndex]!
    candidates[randomIndex] = current!
  }
  result.push(...candidates.slice(0, randomGroup.picks))
  return result
}

export const getStartingEquipment = (): readonly ActiveGameplayStartingEquipment[] =>
  activeModifiers.startingEquipment

export const getUnlockedRecipeIds = (): readonly string[] => activeModifiers.unlockedRecipeIds

export const getMonsterHealthBarColor = (): string | undefined => activeModifiers.monsterHealthBarColor
