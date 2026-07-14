import { describe, expect, it } from 'vitest'
import { RegistryError } from '@/domain/mods/registry'
import { resolveMonsterPoolEntries } from '@/domain/mods/monsterPoolResolution'
import { validateMonsterPoolsUnknown } from '@/domain/mods/monsterPoolResourceValidation'
import { MONSTER_POOL_RESOURCE_LIMITS } from '@/domain/mods/resourceLimits'
import { MonsterPoolDefSchema, type MonsterPoolDef } from '@/domain/mods/schemas'
import { toOfficialContentId } from '@/domain/mods/ids'
import { MONSTERS } from '@/data/monsters'

const poolId = 'example_mod:bounded_pool'
const monsterId = 'taoyuan:mud_worm'

describe('monster pool resource limits', () => {
  it('publishes the shared 250,000 entry and weight limits in the TypeBox contract', () => {
    const entriesSchema = MonsterPoolDefSchema.properties.entries
    const weightSchema = entriesSchema.items.properties.weight

    expect(MONSTER_POOL_RESOURCE_LIMITS).toEqual({
      maxEntries: 250_000,
      maxEntryWeight: 250_000,
      maxEffectiveWeight: 250_000
    })
    expect(entriesSchema.maxItems).toBe(MONSTER_POOL_RESOURCE_LIMITS.maxEntries)
    expect(weightSchema.maximum).toBe(MONSTER_POOL_RESOURCE_LIMITS.maxEntryWeight)
  })

  it('accepts and expands exactly the maximum effective weight within the performance boundary', () => {
    const externalPools: unknown = [{
      id: poolId,
      entries: [{ monsterId, weight: MONSTER_POOL_RESOURCE_LIMITS.maxEffectiveWeight }]
    }]
    const validated = validateMonsterPoolsUnknown(externalPools, { stage: 'test.monster-pool.limit' })

    expect(validated.ok).toBe(true)
    if (!validated.ok) return

    const start = performance.now()
    const resolved = resolveMonsterPoolEntries(validated.data[0]!, id =>
      id === monsterId ? MONSTERS.mud_worm : undefined
    )
    const elapsed = performance.now() - start

    expect(resolved).toHaveLength(MONSTER_POOL_RESOURCE_LIMITS.maxEffectiveWeight)
    expect(resolved[0]).toBe(MONSTERS.mud_worm)
    expect(resolved[resolved.length - 1]).toBe(MONSTERS.mud_worm)
    expect(elapsed).toBeLessThan(5_000)
  })

  it('rejects a raw entry count above the limit without scanning or truncating entries', () => {
    const entry = { monsterId }
    const externalPools: unknown = [{
      id: poolId,
      entries: Array(MONSTER_POOL_RESOURCE_LIMITS.maxEntries + 1).fill(entry)
    }]
    const result = validateMonsterPoolsUnknown(externalPools, { stage: 'test.monster-pool.limit' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'PKG-LIMIT-001',
        contentId: poolId,
        fieldPath: '/0/entries',
        details: {
          poolId,
          actual: MONSTER_POOL_RESOURCE_LIMITS.maxEntries + 1,
          limit: MONSTER_POOL_RESOURCE_LIMITS.maxEntries
        }
      })
    ])
  })

  it('rejects one weight above the limit with a field-specific diagnostic', () => {
    const externalPools: unknown = [{
      id: poolId,
      entries: [{ monsterId, weight: MONSTER_POOL_RESOURCE_LIMITS.maxEntryWeight + 1 }]
    }]
    const result = validateMonsterPoolsUnknown(externalPools, { stage: 'test.monster-pool.limit' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'PKG-LIMIT-001',
        fieldPath: '/0/entries/0/weight',
        details: {
          poolId,
          actual: MONSTER_POOL_RESOURCE_LIMITS.maxEntryWeight + 1,
          limit: MONSTER_POOL_RESOURCE_LIMITS.maxEntryWeight
        }
      })
    ])
  })

  it('rejects a combined effective weight above the limit and guards direct resolution', () => {
    const entries = [
      { monsterId, weight: 125_001 },
      { monsterId, weight: 125_000 }
    ]
    const externalPools: unknown = [{ id: poolId, entries }]
    const result = validateMonsterPoolsUnknown(externalPools, { stage: 'test.monster-pool.limit' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'PKG-LIMIT-001',
        fieldPath: '/0/entries',
        details: {
          poolId,
          actual: 250_001,
          limit: MONSTER_POOL_RESOURCE_LIMITS.maxEffectiveWeight
        }
      })
    ])

    const directPool = {
      id: toOfficialContentId('pool/test/oversized'),
      entries
    } as MonsterPoolDef
    expect(() => resolveMonsterPoolEntries(directPool, () => MONSTERS.mud_worm)).toThrow(RegistryError)
    try {
      resolveMonsterPoolEntries(directPool, () => MONSTERS.mud_worm)
    } catch (error) {
      expect((error as RegistryError).diagnostic).toEqual(expect.objectContaining({
        code: 'PKG-LIMIT-001',
        fieldPath: '/entries'
      }))
    }
  })
})
