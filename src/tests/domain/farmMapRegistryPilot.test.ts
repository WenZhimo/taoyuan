import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  FARM_MAP_DEFS as LEGACY_FARM_MAP_DEFS,
  getFarmMapByType,
  getFarmMapDefs
} from '@/data/farmMaps'
import {
  getOfficialFarmMapByType,
  getOfficialFarmMapDef,
  getOfficialFarmMapDefs,
  getOfficialFarmMapsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { FarmMapDefSchema, type FarmMapDef as FarmMapContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useFarmStore } from '@/stores/useFarmStore'
import { useGameStore } from '@/stores/useGameStore'
import type { FarmMapDef as LegacyFarmMapDef } from '@/data/farmMapDefinitions'
import validFarmMaps from '../fixtures/mods/minimal-valid-package/data/farm-maps.json'

const expectedFarmMapContentDef = (map: LegacyFarmMapDef): FarmMapContentDef => ({
  id: toOfficialContentId(map.type),
  type: map.type,
  name: { key: `taoyuan.farm_map.${map.type}.name`, fallback: map.name },
  description: { key: `taoyuan.farm_map.${map.type}.description`, fallback: map.description },
  bonus: { key: `taoyuan.farm_map.${map.type}.bonus`, fallback: map.bonus }
})

describe('farm map registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external farm map JSON before registration', () => {
    const externalFarmMaps: unknown = validFarmMaps
    const result = validateUnknown(Type.Array(FarmMapDefSchema), externalFarmMaps, {
      stage: 'test.farm-maps'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid farm map shapes and display fields', () => {
    const base = validFarmMaps[0]!
    const invalidFarmMaps: unknown = [
      { ...base, type: 'unknown_map' },
      { ...base, description: { key: '', fallback: 'Broken' } },
      { ...base, bonus: { ...base.bonus, fallback: '' } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(FarmMapDefSchema), invalidFarmMaps, {
      stage: 'test.farm-maps.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/type',
        '/1/description/key',
        '/2/bonus/fallback',
        '/3/extra'
      ]))
    }
  })

  it('registers all farm maps in legacy order with equivalent fields', () => {
    expect(getOfficialFarmMapDefs()).toHaveLength(LEGACY_FARM_MAP_DEFS.length)
    expect(getOfficialFarmMapDefs().map(map => map.id)).toEqual(
      LEGACY_FARM_MAP_DEFS.map(map => toOfficialContentId(map.type))
    )
    expect(getOfficialFarmMapsAsLegacy()).toEqual(LEGACY_FARM_MAP_DEFS)
    expect(getFarmMapDefs()).toEqual(LEGACY_FARM_MAP_DEFS)

    for (const map of LEGACY_FARM_MAP_DEFS) {
      expect(getOfficialFarmMapDef(map.type)).toEqual(expectedFarmMapContentDef(map))
      expect(getOfficialFarmMapDef(toOfficialContentId(map.type))).toBe(getOfficialFarmMapDef(map.type))
      expect(getOfficialFarmMapByType(map.type)).toEqual(map)
      expect(getFarmMapByType(map.type)).toEqual(map)
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const standard = getOfficialFarmMapDef('standard')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<FarmMapContentDef>(toOfficialRegistryTypeId('farm_map'))

    expect(getOfficialFarmMapDef('missing_farm_map')).toBeUndefined()
    expect(getOfficialFarmMapByType('missing_farm_map')).toBeUndefined()
    expect(getFarmMapByType('missing_farm_map')).toBeUndefined()
    expect(Object.isFrozen(standard)).toBe(true)
    expect(Object.isFrozen(standard?.name)).toBe(true)
    expect(Object.isFrozen(standard?.bonus)).toBe(true)
    expect(() => registry.register(OFFICIAL_PACKAGE_ID, expectedFarmMapContentDef(LEGACY_FARM_MAP_DEFS[0]!))).toThrow(
      RegistryError
    )
  })

  it('has no semantic references beyond validated farm map shape', () => {
    const diagnostics = validateRegistrySemantics(buildOfficialRegistrySetFromStaticData()).filter(
      diagnostic => diagnostic.registryId === toOfficialRegistryTypeId('farm_map')
    )

    expect(diagnostics).toEqual([])
  })

  it('keeps new game farm map selection and old save restore registry-backed', () => {
    const gameStore = useGameStore()
    const farmStore = useFarmStore()

    const standard = getFarmMapByType('standard')!
    gameStore.startNewGame(standard.type)
    farmStore.resetFarm(standard.type === 'standard' ? 6 : 4)
    expect(gameStore.farmMapType).toBe('standard')
    expect(farmStore.farmSize).toBe(6)
    expect(farmStore.plots).toHaveLength(36)

    const riverland = getFarmMapByType('riverland')!
    gameStore.startNewGame(riverland.type)
    farmStore.resetFarm(riverland.type === 'standard' ? 6 : 4)
    expect(gameStore.farmMapType).toBe('riverland')
    expect(farmStore.farmSize).toBe(4)
    expect(farmStore.plots).toHaveLength(16)

    gameStore.deserialize({ farmMapType: 'forest' })
    expect(gameStore.farmMapType).toBe('forest')
    gameStore.deserialize({})
    expect(gameStore.farmMapType).toBe('standard')
  })
})
