import type { FruitTreeDef } from '@/types'
import { getOfficialFruitTreeById } from '@/domain/mods/contentAccess'

export { FRUIT_TREE_DEFINITIONS as FRUIT_TREE_DEFS } from './treeDefinitions'

export const getFruitTreeDef = (type: string): FruitTreeDef | undefined =>
  getOfficialFruitTreeById(type)
