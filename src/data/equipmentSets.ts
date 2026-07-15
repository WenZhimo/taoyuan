import {
  EQUIPMENT_SET_DEFINITIONS,
  type EquipmentSetDef,
  type SetBonusLevel
} from './equipmentSetDefinitions'
import {
  getOfficialEquipmentSetByPieceId,
  getOfficialEquipmentSetsAsLegacy
} from '@/domain/mods/contentAccess'

export type { EquipmentSetDef, SetBonusLevel }

export const EQUIPMENT_SETS: EquipmentSetDef[] = EQUIPMENT_SET_DEFINITIONS

/** 读取当前官方装备套装列表；注册表不可用时保留旧静态回滚路径 */
export const getEquipmentSets = (): readonly EquipmentSetDef[] => {
  const sets = getOfficialEquipmentSetsAsLegacy()
  return sets.length > 0 ? sets : EQUIPMENT_SETS
}

/** 根据装备ID查找所属套装 */
export const getSetByPieceId = (defId: string): EquipmentSetDef | undefined => {
  return getOfficialEquipmentSetByPieceId(defId) ??
    EQUIPMENT_SETS.find(s =>
      s.pieces.weapon === defId ||
      s.pieces.ring === defId ||
      s.pieces.hat === defId ||
      s.pieces.shoe === defId
    )
}
