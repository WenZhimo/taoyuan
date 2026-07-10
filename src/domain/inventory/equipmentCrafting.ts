export interface EquipmentRecipeMaterial {
  itemId: string
  quantity: number
}

export interface CraftableEquipmentDef {
  id: string
  name: string
  recipe: readonly EquipmentRecipeMaterial[] | null
  recipeMoney: number
}

export interface EquipmentCraftingPlan {
  success: boolean
  message: string
  materials: EquipmentRecipeMaterial[]
  moneyCost: number
}

export const createEquipmentCraftingPlan = (
  def: CraftableEquipmentDef | undefined,
  equipmentTypeName: string,
  money: number,
  getItemCount: (itemId: string) => number,
  getItemName: (itemId: string) => string | undefined
): EquipmentCraftingPlan => {
  if (!def?.recipe) {
    return {
      success: false,
      message: `该${equipmentTypeName}无法合成。`,
      materials: [],
      moneyCost: 0
    }
  }

  for (const material of def.recipe) {
    if (getItemCount(material.itemId) < material.quantity) {
      return {
        success: false,
        message: `材料不足：${getItemName(material.itemId) ?? material.itemId}。`,
        materials: [],
        moneyCost: 0
      }
    }
  }

  if (money < def.recipeMoney) {
    return {
      success: false,
      message: `铜钱不足（需要${def.recipeMoney}文）。`,
      materials: [],
      moneyCost: def.recipeMoney
    }
  }

  return {
    success: true,
    message: `合成了${def.name}！`,
    materials: def.recipe.map(material => ({ ...material })),
    moneyCost: def.recipeMoney
  }
}
