import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import {
  getOfficialMainMineBoss,
  getOfficialMainMineZoneMonsters,
  getOfficialMonsterPoolDef,
  getOfficialMonsterPoolDefs,
  getOfficialSkullCavernBaseMonsters,
  getOfficialSkullCavernBosses,
  getOfficialSkullCavernDepthMonsters,
  resolveOfficialMonsterPool
} from '@/domain/mods/contentAccess'
import { requireContentId, requirePackageId, toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import {
  REQUIRED_OFFICIAL_MONSTER_POOL_IDS,
  MAIN_MINE_BOSS_FLOORS,
  MAIN_MINE_ZONES,
  SKULL_CAVERN_BASE_POOL_ID,
  SKULL_CAVERN_BOSS_POOL_ID,
  SKULL_CAVERN_DEPTH_11_POOL_ID,
  getMainMineBossPoolId,
  getMainMineZonePoolId
} from '@/domain/mods/monsterPoolIds'
import { RegistrySet } from '@/domain/mods/registry'
import { resolveMonsterPoolEntries } from '@/domain/mods/monsterPoolResolution'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { MonsterPoolDefSchema, type MonsterDef, type MonsterPoolDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import validMonsterPools from '../fixtures/mods/minimal-valid-package/data/monster-pools.json'
import { BOSS_MONSTERS, MONSTERS, SKULL_CAVERN_MONSTERS, ZONE_MONSTERS } from '@/data/monsters'

const poolMonsterIds = (poolId: string): string[] =>
  getOfficialMonsterPoolDef(poolId)!.entries.map(entry => entry.monsterId)

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

  it('expands positive weights in entry order and defaults missing weights to one', () => {
    const monsters = {
      first: { ...MONSTERS.mud_worm! },
      second: { ...MONSTERS.stone_crab! }
    }
    const pool: MonsterPoolDef = {
      id: toOfficialContentId('pool/test/weighted'),
      entries: [
        { monsterId: toOfficialContentId('first'), weight: 2 },
        { monsterId: toOfficialContentId('second') }
      ]
    }

    expect(resolveMonsterPoolEntries(pool, id => monsters[id.slice(id.indexOf(':') + 1) as keyof typeof monsters]))
      .toEqual([monsters.first, monsters.first, monsters.second])
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

  it('reports a main mine boss pool that does not contain exactly one equal-weight entry', () => {
    const registrySet = new RegistrySet()
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()

    const owner = requirePackageId('taoyuan-core')
    const monsterId = toOfficialContentId('test_boss')
    registrySet.get<MonsterDef>(toOfficialRegistryTypeId('monster')).register(owner, {
      id: monsterId,
      name: { key: 'test.boss.name', fallback: 'Test Boss' },
      hp: 1,
      attack: 0,
      defense: 0,
      expReward: 0,
      description: { key: 'test.boss.description', fallback: 'Test boss' }
    })

    const invalidPoolId = getMainMineBossPoolId(20)
    const poolRegistry = registrySet.get<MonsterPoolDef>(toOfficialRegistryTypeId('monster_pool'))
    for (const poolId of REQUIRED_OFFICIAL_MONSTER_POOL_IDS) {
      poolRegistry.register(owner, {
        id: poolId,
        entries: poolId === invalidPoolId
          ? [{ monsterId }, { monsterId }]
          : [{ monsterId }]
      })
    }

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === invalidPoolId
    )
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        registryId: toOfficialRegistryTypeId('monster_pool'),
        contentId: invalidPoolId,
        fieldPath: '/entries'
      })
    ])
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
    expect(() => resolveOfficialMonsterPool('missing_pool')).toThrow('Missing required official monster pool')
  })

  it('keeps all main mine zone and boss pool IDs in legacy order', () => {
    for (const zone of MAIN_MINE_ZONES) {
      const expectedIds = ZONE_MONSTERS[zone].map(monster => toOfficialContentId(monster.id))
      expect(poolMonsterIds(getMainMineZonePoolId(zone)), zone).toEqual(expectedIds)
      expect(getOfficialMainMineZoneMonsters(zone).map(monster => monster.id), zone)
        .toEqual(ZONE_MONSTERS[zone].map(monster => monster.id))
    }

    for (const floor of MAIN_MINE_BOSS_FLOORS) {
      const boss = BOSS_MONSTERS[floor]!
      expect(poolMonsterIds(getMainMineBossPoolId(floor)), String(floor)).toEqual([toOfficialContentId(boss.id)])
      expect(getOfficialMainMineBoss(floor), String(floor)).toEqual(boss)
    }
    expect(getOfficialMainMineBoss(19)).toBeUndefined()
  })

  it('keeps all skull cavern pools in legacy order with implicit weight one', () => {
    const base = Object.values(SKULL_CAVERN_MONSTERS)
    const depth = [MONSTERS.shadow_lurker!, MONSTERS.bone_dragon!]
    const bosses = MAIN_MINE_BOSS_FLOORS.map(floor => BOSS_MONSTERS[floor]!)

    expect(poolMonsterIds(SKULL_CAVERN_BASE_POOL_ID)).toEqual(base.map(monster => toOfficialContentId(monster.id)))
    expect(poolMonsterIds(SKULL_CAVERN_DEPTH_11_POOL_ID)).toEqual(depth.map(monster => toOfficialContentId(monster.id)))
    expect(poolMonsterIds(SKULL_CAVERN_BOSS_POOL_ID)).toEqual(bosses.map(monster => toOfficialContentId(monster.id)))
    expect(getOfficialSkullCavernBaseMonsters()).toEqual(base)
    expect(getOfficialSkullCavernDepthMonsters()).toEqual(depth)
    expect(getOfficialSkullCavernBosses()).toEqual(bosses)
    expect(getOfficialMonsterPoolDefs().flatMap(pool => pool.entries).every(entry => entry.weight === undefined))
      .toBe(true)
  })
})
