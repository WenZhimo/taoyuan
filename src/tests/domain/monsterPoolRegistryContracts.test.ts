import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import {
  getOfficialMonsterPoolDef,
  getOfficialMonsterPoolDefs
} from '@/domain/mods/contentAccess'
import { requireContentId, requirePackageId, toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import {
  REQUIRED_OFFICIAL_MONSTER_POOL_IDS,
  SKULL_CAVERN_BOSS_POOL_ID
} from '@/domain/mods/monsterPoolIds'
import { RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { MonsterPoolDefSchema, type MonsterPoolDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import validMonsterPools from '../fixtures/mods/minimal-valid-package/data/monster-pools.json'

describe('monster pool registry contracts', () => {
  it('validates external monster pool JSON before registration', () => {
    const externalPools: unknown = validMonsterPools
    const result = validateUnknown(Type.Array(MonsterPoolDefSchema), externalPools, {
      stage: 'test.monster-pools'
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const registrySet = new RegistrySet()
    const registry = registrySet.defineRegistry<MonsterPoolDef>({
      registryId: toOfficialRegistryTypeId('monster_pool'),
      description: 'test monster pools',
      schemaName: 'monster-pool.schema.json'
    })
    registrySet.freezeDefinitions()
    registry.register(requirePackageId('example_mod'), result.data[0]!)

    expect(registry.require(requireContentId(result.data[0]!.id))).toEqual(result.data[0])
  })

  it('rejects empty pools and non-positive or fractional weights', () => {
    const invalidPools: unknown = [
      { id: 'example_mod:empty', entries: [] },
      { id: 'example_mod:zero_weight', entries: [{ monsterId: 'example_mod:test_monster', weight: 0 }] },
      { id: 'example_mod:negative_weight', entries: [{ monsterId: 'example_mod:test_monster', weight: -1 }] },
      { id: 'example_mod:fractional_weight', entries: [{ monsterId: 'example_mod:test_monster', weight: 1.5 }] }
    ]
    const result = validateUnknown(Type.Array(MonsterPoolDefSchema), invalidPools, {
      stage: 'test.monster-pools.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/entries', '/1/entries/0/weight', '/2/entries/0/weight', '/3/entries/0/weight'])
      )
    }
  })

  it('reports unknown monster references without changing entry order', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const pool: MonsterPoolDef = {
      id: toOfficialContentId('pool/test/missing-monster'),
      entries: [
        { monsterId: toOfficialContentId('mud_worm') },
        { monsterId: toOfficialContentId('missing_monster'), weight: 2 }
      ]
    }
    registrySet
      .get<MonsterPoolDef>(toOfficialRegistryTypeId('monster_pool'))
      .register(requirePackageId('example_mod'), pool)

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === pool.entries[1]!.monsterId
    )
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('monster'),
        contentId: toOfficialContentId('missing_monster'),
        fieldPath: '/entries/1/monsterId'
      })
    ])
    expect(registrySet.get<MonsterPoolDef>(toOfficialRegistryTypeId('monster_pool')).require(requireContentId(pool.id)).entries)
      .toEqual(pool.entries)
  })

  it('reports every missing required official pool deterministically', () => {
    const registrySet = new RegistrySet()
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.code === 'REG-REQUIRED-001'
    )
    expect(diagnostics.map(diagnostic => diagnostic.contentId)).toEqual(REQUIRED_OFFICIAL_MONSTER_POOL_IDS)
    expect(diagnostics.every(diagnostic => diagnostic.severity === 'fatal')).toBe(true)
  })

  it('supports local and namespaced pool IDs and freezes ordered registry data', () => {
    const local = getOfficialMonsterPoolDef('pool/skull-cavern/boss')
    const namespaced = getOfficialMonsterPoolDef(SKULL_CAVERN_BOSS_POOL_ID)

    expect(local).toBe(namespaced)
    expect(getOfficialMonsterPoolDefs()).toHaveLength(REQUIRED_OFFICIAL_MONSTER_POOL_IDS.length)
    expect(Object.isFrozen(namespaced)).toBe(true)
    expect(Object.isFrozen(namespaced?.entries)).toBe(true)
    expect(() => (namespaced?.entries as Array<{ monsterId: string }>).push({ monsterId: 'taoyuan:other' }))
      .toThrow()
    expect(getOfficialMonsterPoolDef('missing_pool')).toBeUndefined()
  })
})
