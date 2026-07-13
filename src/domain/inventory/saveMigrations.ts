import type { InventoryItem, OwnedHat, OwnedRing, OwnedShoe, OwnedWeapon, Tool, ToolType } from '@/types'
import type { EquipmentPresetState } from '@/domain/inventory/equipmentPresets'
import type { PendingToolUpgrade } from '@/domain/inventory/toolUpgrades'
import { normalizeCompositionTags } from './itemStacks'

export type EnchantmentNormalizer = (input: string | string[] | null | undefined) => string[]

export interface SerializedEnchantableEquipment {
  defId?: string
  enchantmentId?: string | null
  enchantmentIds?: string[]
}

export interface SerializedInventoryMigrationState {
  items?: readonly InventoryItem[]
  capacity?: number
  tempItems?: readonly InventoryItem[]
  tools?: readonly Tool[]
  ownedWeapons?: readonly SerializedEnchantableEquipment[]
  equippedWeaponIndex?: number
  weapon?: { tier?: string }
  pendingUpgrade?: Partial<PendingToolUpgrade> | null
  pendingUpgrades?: readonly Partial<PendingToolUpgrade>[]
  ownedRings?: readonly SerializedEnchantableEquipment[]
  equippedRingSlot1?: number
  equippedRingSlot2?: number
  ownedHats?: readonly SerializedEnchantableEquipment[]
  equippedHatIndex?: number
  ownedShoes?: readonly SerializedEnchantableEquipment[]
  equippedShoeIndex?: number
  equipmentPresets?: readonly EquipmentPresetState[]
  activePresetId?: string | null
}

export const DEFAULT_TOOLS: Tool[] = [
  { type: 'wateringCan', tier: 'basic' },
  { type: 'hoe', tier: 'basic' },
  { type: 'pickaxe', tier: 'basic' },
  { type: 'fishingRod', tier: 'basic' },
  { type: 'scythe', tier: 'basic' },
  { type: 'axe', tier: 'basic' },
  { type: 'pan', tier: 'basic' }
]

export const REQUIRED_TOOL_TYPES: ToolType[] = ['wateringCan', 'hoe', 'pickaxe', 'fishingRod', 'scythe', 'axe', 'pan']

const LEGACY_WEAPON_TIER_DEF_IDS: Record<string, string> = {
  wood: 'wooden_stick',
  copper: 'copper_sword',
  iron: 'iron_blade',
  gold: 'gold_halberd'
}

export const migrateSavedTools = (savedTools?: readonly Tool[]): Tool[] => {
  const migratedTools = (savedTools ?? DEFAULT_TOOLS).map(tool => ({ ...tool }))

  for (const toolType of REQUIRED_TOOL_TYPES) {
    if (!migratedTools.find(tool => tool.type === toolType)) {
      migratedTools.push({ type: toolType, tier: 'basic' })
    }
  }

  return migratedTools
}

const QUALITY_VALUES = new Set(['normal', 'fine', 'excellent', 'supreme'])

export const migrateSavedInventoryItems = (
  savedItems: readonly InventoryItem[] | undefined,
  _isKnownItem: (itemId: string) => boolean
): InventoryItem[] => {
  return (savedItems ?? [])
    .filter(item =>
      typeof item.itemId === 'string' &&
      Number.isFinite(item.quantity) &&
      item.quantity > 0 &&
      QUALITY_VALUES.has(item.quality)
    )
    .map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      quality: item.quality,
      ...(item.locked !== undefined ? { locked: item.locked } : {}),
      compositionTags: normalizeCompositionTags(item.compositionTags)
    }))
}

export const migrateSavedCapacity = (savedCapacity: number | undefined, fallbackCapacity: number): number => {
  return savedCapacity ?? fallbackCapacity
}

export const migrateSavedEquipmentPresets = (
  savedPresets: readonly EquipmentPresetState[] | undefined
): EquipmentPresetState[] => {
  return (savedPresets ?? []).map(preset => ({ ...preset }))
}

export const migrateSavedActivePresetId = (savedActivePresetId: string | null | undefined): string | null => {
  return savedActivePresetId ?? null
}

export const normalizeSavedEquipmentList = <T extends SerializedEnchantableEquipment>(
  equipment: readonly SerializedEnchantableEquipment[] | undefined,
  normalizeEnchantmentIds: EnchantmentNormalizer,
  fallbackDefId?: string
): T[] => {
  return (equipment ?? []).map(item => {
    const sourceIds = item.enchantmentIds && item.enchantmentIds.length > 0 ? item.enchantmentIds : item.enchantmentId
    const enchantmentIds = normalizeEnchantmentIds(sourceIds)
    return {
      defId: item.defId ?? fallbackDefId,
      enchantmentId: enchantmentIds[0] ?? null,
      enchantmentIds
    } as T
  })
}

export const migrateSavedWeapons = (
  data: SerializedInventoryMigrationState,
  normalizeEnchantmentIds: EnchantmentNormalizer
): { ownedWeapons: OwnedWeapon[]; equippedWeaponIndex: number } => {
  if (data.ownedWeapons) {
    return {
      ownedWeapons: normalizeSavedEquipmentList<OwnedWeapon>(data.ownedWeapons, normalizeEnchantmentIds, 'wooden_stick'),
      equippedWeaponIndex: data.equippedWeaponIndex ?? 0
    }
  }

  const legacyTier = data.weapon?.tier
  const defId = legacyTier ? LEGACY_WEAPON_TIER_DEF_IDS[legacyTier] ?? 'wooden_stick' : 'wooden_stick'
  return {
    ownedWeapons: [{ defId, enchantmentId: null, enchantmentIds: [] }],
    equippedWeaponIndex: 0
  }
}

export const migratePendingToolUpgrades = (data: SerializedInventoryMigrationState): PendingToolUpgrade[] => {
  const sourceUpgrades = data.pendingUpgrades ?? (data.pendingUpgrade ? [data.pendingUpgrade] : [])
  return sourceUpgrades
    .filter(
      (upgrade): upgrade is PendingToolUpgrade =>
        Boolean(upgrade?.toolType && upgrade?.targetTier && upgrade.daysRemaining && upgrade.daysRemaining > 0)
    )
    .map(upgrade => ({ ...upgrade }))
}

export const clampLoadedEquippedIndex = (index: number, equipmentLength: number): number => {
  return index >= equipmentLength ? -1 : index
}

export const migrateSavedRings = (
  rings: readonly SerializedEnchantableEquipment[] | undefined,
  normalizeEnchantmentIds: EnchantmentNormalizer
): OwnedRing[] => normalizeSavedEquipmentList<OwnedRing>(rings, normalizeEnchantmentIds)

export const migrateSavedHats = (
  hats: readonly SerializedEnchantableEquipment[] | undefined,
  normalizeEnchantmentIds: EnchantmentNormalizer
): OwnedHat[] => normalizeSavedEquipmentList<OwnedHat>(hats, normalizeEnchantmentIds)

export const migrateSavedShoes = (
  shoes: readonly SerializedEnchantableEquipment[] | undefined,
  normalizeEnchantmentIds: EnchantmentNormalizer
): OwnedShoe[] => normalizeSavedEquipmentList<OwnedShoe>(shoes, normalizeEnchantmentIds)
