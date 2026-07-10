export interface EquipmentPresetState {
  id: string
  name: string
  weaponDefId: string | null
  ringSlot1DefId: string | null
  ringSlot2DefId: string | null
  hatDefId: string | null
  shoeDefId: string | null
}

export interface CurrentEquipmentSelection {
  weaponDefId: string | null
  ringSlot1DefId: string | null
  ringSlot2DefId: string | null
  hatDefId: string | null
  shoeDefId: string | null
}

export interface EquipmentDefRef {
  defId: string
}

export interface OwnedEquipmentForPreset {
  weapons: readonly EquipmentDefRef[]
  rings: readonly EquipmentDefRef[]
  hats: readonly EquipmentDefRef[]
  shoes: readonly EquipmentDefRef[]
}

export type EquipmentPresetSlotPlan = number | null | undefined

export interface EquipmentPresetApplicationPlan {
  weaponIndex: EquipmentPresetSlotPlan
  ringSlot1Index: EquipmentPresetSlotPlan
  ringSlot2Index: EquipmentPresetSlotPlan
  hatIndex: EquipmentPresetSlotPlan
  shoeIndex: EquipmentPresetSlotPlan
  missingLabels: string[]
}

const EMPTY_EQUIPMENT_SELECTION: CurrentEquipmentSelection = {
  weaponDefId: null,
  ringSlot1DefId: null,
  ringSlot2DefId: null,
  hatDefId: null,
  shoeDefId: null
}

const clonePreset = (preset: EquipmentPresetState): EquipmentPresetState => ({ ...preset })

export const createEquipmentPresetState = (
  presets: readonly EquipmentPresetState[],
  name: string,
  id: string,
  maxPresets = 5
): { success: boolean; presets: EquipmentPresetState[] } => {
  const updatedPresets = presets.map(clonePreset)
  if (updatedPresets.length >= maxPresets) {
    return { success: false, presets: updatedPresets }
  }

  updatedPresets.push({ id, name, ...EMPTY_EQUIPMENT_SELECTION })
  return { success: true, presets: updatedPresets }
}

export const deleteEquipmentPresetState = (
  presets: readonly EquipmentPresetState[],
  activePresetId: string | null,
  id: string
): { presets: EquipmentPresetState[]; activePresetId: string | null } => {
  const updatedPresets = presets.filter(preset => preset.id !== id).map(clonePreset)
  return {
    presets: updatedPresets,
    activePresetId: activePresetId === id ? null : activePresetId
  }
}

export const renameEquipmentPresetState = (
  presets: readonly EquipmentPresetState[],
  id: string,
  name: string
): EquipmentPresetState[] => {
  return presets.map(preset => {
    if (preset.id !== id) return clonePreset(preset)
    const trimmedName = name.trim()
    return { ...preset, name: trimmedName || preset.name }
  })
}

export const saveCurrentEquipmentToPresetState = (
  presets: readonly EquipmentPresetState[],
  id: string,
  selection: CurrentEquipmentSelection
): EquipmentPresetState[] => {
  return presets.map(preset => (preset.id === id ? { ...preset, ...selection } : clonePreset(preset)))
}

const findEquipmentIndex = (equipment: readonly EquipmentDefRef[], defId: string): number | undefined => {
  const index = equipment.findIndex(item => item.defId === defId)
  return index >= 0 ? index : undefined
}

const planOptionalEquipmentSlot = (
  defId: string | null,
  equipment: readonly EquipmentDefRef[],
  missingLabel: string
): { index: EquipmentPresetSlotPlan; missingLabel?: string } => {
  if (!defId) return { index: null }

  const index = findEquipmentIndex(equipment, defId)
  if (index === undefined) return { index: undefined, missingLabel }
  return { index }
}

export const planEquipmentPresetApplication = (
  preset: EquipmentPresetState,
  owned: OwnedEquipmentForPreset
): EquipmentPresetApplicationPlan => {
  const missingLabels: string[] = []

  const weaponIndex = preset.weaponDefId ? findEquipmentIndex(owned.weapons, preset.weaponDefId) : undefined
  if (preset.weaponDefId && weaponIndex === undefined) {
    missingLabels.push('武器')
  }

  const ringSlot1 = planOptionalEquipmentSlot(preset.ringSlot1DefId, owned.rings, '戒指1')
  if (ringSlot1.missingLabel) missingLabels.push(ringSlot1.missingLabel)

  let ringSlot2Index: EquipmentPresetSlotPlan
  if (preset.ringSlot2DefId && preset.ringSlot2DefId === preset.ringSlot1DefId) {
    ringSlot2Index = null
    missingLabels.push('戒指2（不可与槽1相同）')
  } else {
    const ringSlot2 = planOptionalEquipmentSlot(preset.ringSlot2DefId, owned.rings, '戒指2')
    ringSlot2Index = ringSlot2.index
    if (ringSlot2.missingLabel) missingLabels.push(ringSlot2.missingLabel)
  }

  const hatSlot = planOptionalEquipmentSlot(preset.hatDefId, owned.hats, '帽子')
  if (hatSlot.missingLabel) missingLabels.push(hatSlot.missingLabel)

  const shoeSlot = planOptionalEquipmentSlot(preset.shoeDefId, owned.shoes, '鞋子')
  if (shoeSlot.missingLabel) missingLabels.push(shoeSlot.missingLabel)

  return {
    weaponIndex,
    ringSlot1Index: ringSlot1.index,
    ringSlot2Index,
    hatIndex: hatSlot.index,
    shoeIndex: shoeSlot.index,
    missingLabels
  }
}

export const createEquipmentPresetApplicationMessage = (presetName: string, missingLabels: readonly string[]): string => {
  if (missingLabels.length > 0) {
    return `已应用方案「${presetName}」，但${missingLabels.join('、')}已不在背包中。`
  }
  return `已应用方案「${presetName}」。`
}
