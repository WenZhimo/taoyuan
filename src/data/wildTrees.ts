import type { WildTreeDef } from '@/types'
import { getOfficialWildTreeById } from '@/domain/mods/contentAccess'

export { WILD_TREE_DEFINITIONS as WILD_TREE_DEFS } from './treeDefinitions'

export const getWildTreeDef = (type: string): WildTreeDef | undefined =>
  getOfficialWildTreeById(type)
