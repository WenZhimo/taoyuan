import { Type } from '@sinclair/typebox'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MineExplorationActionsPanel from '@/components/game/mining/MineExplorationActionsPanel.vue'
import { BOMBS as LEAF_BOMBS } from '@/data/processingCraftDefinitions'
import { BOMBS as REEXPORTED_BOMBS, getBombById } from '@/data/processing'
import { getItemById } from '@/data/items'
import {
  getOfficialBombById,
  getOfficialBombDef,
  getOfficialBombDefs,
  getOfficialBombsAsLegacy
} from '@/domain/mods/contentAccess'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { BombDefSchema, type BombDef as BombContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useMiningStore } from '@/stores/useMiningStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useProcessingStore } from '@/stores/useProcessingStore'
import type { BombDef as LegacyBombDef } from '@/types'

const normalizeBomb = (bomb: LegacyBombDef): LegacyBombDef => ({
  ...bomb,
  craftCost: bomb.craftCost.map(material => ({ ...material }))
})

const expectedBombContentDef = (bomb: LegacyBombDef): BombContentDef => ({
  id: toOfficialContentId(bomb.id),
  name: { key: `taoyuan.bomb.${bomb.id}.name`, fallback: bomb.name },
  description: { key: `taoyuan.bomb.${bomb.id}.description`, fallback: bomb.description },
  oreMultiplier: bomb.oreMultiplier,
  clearsMonster: bomb.clearsMonster,
  craftCost: bomb.craftCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  craftMoney: bomb.craftMoney,
  shopPrice: bomb.shopPrice
})

const validExternalBombs: unknown = [
  {
    id: 'example_mod:test_bomb',
    name: { key: 'example_mod.bomb.test.name', fallback: 'Test Bomb' },
    description: { key: 'example_mod.bomb.test.description', fallback: 'A test explosive.' },
    oreMultiplier: 2,
    clearsMonster: false,
    craftCost: [{ itemId: 'example_mod:test_item', quantity: 1 }],
    craftMoney: 0,
    shopPrice: null
  }
]

describe('bomb registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('validates external bomb JSON before registration', () => {
    const result = validateUnknown(Type.Array(BombDefSchema), validExternalBombs, {
      stage: 'test.bombs'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid bomb shapes and numeric bounds', () => {
    const base = (validExternalBombs as readonly [BombContentDef])[0]
    const invalidBombs: unknown = [
      { ...base, id: 'not namespaced' },
      { ...base, name: { key: '', fallback: 'No key' } },
      { ...base, oreMultiplier: 0 },
      { ...base, clearsMonster: 'yes' },
      { ...base, craftCost: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, craftCost: [{ itemId: 'not namespaced', quantity: 1 }] },
      { ...base, craftMoney: -1 },
      { ...base, shopPrice: -1 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(BombDefSchema), invalidBombs, {
      stage: 'test.bombs.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/name/key',
        '/2/oreMultiplier',
        '/3/clearsMonster',
        '/4/craftCost/0/quantity',
        '/5/craftCost/0/itemId',
        '/6/craftMoney',
        '/7/shopPrice',
        '/8/extra'
      ]))
    }
  })

  it('keeps leaf data, legacy re-export, registry order and query results equivalent', () => {
    expect(REEXPORTED_BOMBS).toBe(LEAF_BOMBS)
    expect(getOfficialBombDefs()).toHaveLength(LEAF_BOMBS.length)
    expect(getOfficialBombDefs().map(bomb => bomb.id)).toEqual(
      LEAF_BOMBS.map(bomb => toOfficialContentId(bomb.id))
    )
    expect(getOfficialBombDefs()).toEqual(LEAF_BOMBS.map(expectedBombContentDef))
    expect(getOfficialBombsAsLegacy().map(normalizeBomb)).toEqual(LEAF_BOMBS.map(normalizeBomb))

    for (const bomb of LEAF_BOMBS) {
      expect(getOfficialBombDef(bomb.id)).toEqual(expectedBombContentDef(bomb))
      expect(getOfficialBombDef(toOfficialContentId(bomb.id))).toBe(getOfficialBombDef(bomb.id))
      expect(getOfficialBombById(bomb.id)).toEqual(normalizeBomb(bomb))
      expect(getBombById(bomb.id)).toEqual(normalizeBomb(bomb))
    }
  })

  it('preserves unknown ID behavior, duplicate rejection and read-only entries', () => {
    const cherryBomb = getOfficialBombDef('cherry_bomb')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<BombContentDef>(toOfficialRegistryTypeId('bomb'))

    expect(getOfficialBombDef('missing_bomb')).toBeUndefined()
    expect(getOfficialBombById('missing_bomb')).toBeUndefined()
    expect(getBombById('missing_bomb')).toBeUndefined()
    expect(getBombById('not namespaced')).toBeUndefined()
    expect(Object.isFrozen(cherryBomb)).toBe(true)
    expect(Object.isFrozen(cherryBomb?.name)).toBe(true)
    expect(Object.isFrozen(cherryBomb?.craftCost)).toBe(true)
    expect(Object.isFrozen(cherryBomb?.craftCost[0])).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      expectedBombContentDef(LEAF_BOMBS[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing craft material item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<BombContentDef>(toOfficialRegistryTypeId('bomb'))
    const missingMaterial = toOfficialContentId('missing_bomb_material')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('bomb/missing_material'),
      name: { key: 'test.bomb.missing.name', fallback: 'Missing Material Bomb' },
      description: { key: 'test.bomb.missing.description', fallback: 'Missing material' },
      oreMultiplier: 1,
      clearsMonster: false,
      craftCost: [{ itemId: missingMaterial, quantity: 1 }],
      craftMoney: 1,
      shopPrice: null
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingMaterial,
        fieldPath: '/craftCost/0/itemId'
      })
    ]))
  })

  it('keeps item derivation, crafting and local inventory IDs unchanged', () => {
    for (const bomb of LEAF_BOMBS) {
      expect(getItemById(bomb.id)).toEqual(expect.objectContaining({
        id: bomb.id,
        name: bomb.name,
        category: 'bomb',
        description: bomb.description,
        sellPrice: 25,
        edible: false
      }))
    }

    const processingStore = useProcessingStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    playerStore.money = 100
    expect(inventoryStore.addItem('copper_ore', 12)).toBe(true)
    expect(inventoryStore.addItem('firewood', 15)).toBe(true)

    expect(processingStore.craftBomb('cherry_bomb')).toBe(true)
    expect(playerStore.money).toBe(0)
    expect(inventoryStore.getItemCount('copper_ore')).toBe(0)
    expect(inventoryStore.getItemCount('firewood')).toBe(0)
    expect(inventoryStore.getItemCount('cherry_bomb')).toBe(1)
    expect(inventoryStore.getItemCount('taoyuan:cherry_bomb')).toBe(0)
  })

  it('fails explicitly instead of falling back when the official registry is unavailable', () => {
    const unavailable = new Error('official registry unavailable')
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => getOfficialBombsAsLegacy()).toThrow(unavailable)
    expect(() => useProcessingStore().craftBomb('cherry_bomb')).toThrow(unavailable)
  })

  it('keeps mine use and mine action list behavior unchanged', () => {
    const inventoryStore = useInventoryStore()
    const miningStore = useMiningStore()
    miningStore.isExploring = true
    miningStore.floorGrid = Array.from({ length: 36 }, (_, index) => ({
      index,
      type: 'empty' as const,
      state: 'hidden' as const
    }))
    expect(inventoryStore.addItem('cherry_bomb')).toBe(true)

    const result = miningStore.useBombOnGrid('cherry_bomb', 14)

    expect(result).toEqual({ success: true, message: '爆竹爆炸了！翻开了一些区域！' })
    expect(inventoryStore.getItemCount('cherry_bomb')).toBe(0)

    const bombs = getOfficialBombsAsLegacy().map((bomb, index) => ({
      id: bomb.id,
      name: bomb.name,
      count: index + 1
    }))
    const wrapper = mount(MineExplorationActionsPanel, {
      props: {
        sweepPreview: { targetFloor: null, estimatedDamage: 0 },
        canSweepToSafePoint: false,
        remainingCombatTiles: 0,
        autoExploreActive: false,
        bombs,
        activeBombId: null,
        hasMonsterLure: false,
        monsterLureCount: 0,
        combatItemCount: 0,
        stairsFound: false,
        stairsUsable: false,
        isInSkullCavern: false
      }
    })

    expect(wrapper.findAll('[data-testid^="toggle-bomb-"]').map(node => node.text())).toEqual(
      bombs.map(bomb => `${bomb.name}×${bomb.count}`)
    )
  })
})
