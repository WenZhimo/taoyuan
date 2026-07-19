import { describe, expect, it, vi } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import { requirePackageId, toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import {
  createOfficialContentBootstrap,
  OfficialContentBootstrapError,
  validateOfficialRegistryStructure
} from '@/domain/mods/officialContentBootstrap'
import { RegistryError, RegistrySet, type RegistryEntry } from '@/domain/mods/registry'
import { OFFICIAL_REGISTRY_SCHEMAS } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'

const owner = requirePackageId('taoyuan-core')

const createCandidate = (): RegistrySet => {
  const registrySet = new RegistrySet()
  const registry = registrySet.defineRegistry<RegistryEntry>({
    registryId: toOfficialRegistryTypeId('test'),
    description: 'Test registry',
    schemaName: 'test.schema.json'
  })
  registrySet.freezeDefinitions()
  registry.register(owner, { id: toOfficialContentId('test/entry') })
  return registrySet
}

const createHarness = (overrides: Partial<{
  buildRegistrySet: () => RegistrySet
  validateStructure: (registrySet: RegistrySet) => ReturnType<typeof validateRegistrySemantics>
  validateSemantics: (registrySet: RegistrySet) => ReturnType<typeof validateRegistrySemantics>
  freezeRegistrySet: (registrySet: RegistrySet) => void
}> = {}) => {
  const events: string[] = []
  const candidate = createCandidate()
  const dependencies = {
    buildRegistrySet: vi.fn(() => {
      events.push('build')
      return candidate
    }),
    validateStructure: vi.fn(() => {
      events.push('structure')
      return []
    }),
    validateSemantics: vi.fn(() => {
      events.push('semantics')
      return []
    }),
    freezeRegistrySet: vi.fn((registrySet: RegistrySet) => {
      events.push('freeze')
      registrySet.freezeEntries()
    }),
    ...overrides
  }
  return {
    events,
    candidate,
    dependencies,
    bootstrap: createOfficialContentBootstrap(dependencies)
  }
}

describe('official content bootstrap', () => {
  it('builds, structurally validates, semantically validates, freezes, then publishes', async () => {
    const harness = createHarness()

    expect(() => harness.bootstrap.getRegistrySet()).toThrowError(OfficialContentBootstrapError)
    const result = await harness.bootstrap.bootstrap()

    expect(result).toBe(harness.candidate)
    expect(harness.bootstrap.getRegistrySet()).toBe(result)
    expect(result.currentPhase).toBe('frozen')
    expect(harness.events).toEqual(['build', 'structure', 'semantics', 'freeze'])
  })

  it('shares concurrent initialization and keeps the successful reference stable', async () => {
    const harness = createHarness()

    const first = harness.bootstrap.bootstrap()
    const second = harness.bootstrap.bootstrap()
    const third = harness.bootstrap.bootstrap()

    expect(second).toBe(first)
    expect(third).toBe(first)
    await expect(Promise.all([first, second, third])).resolves.toEqual([
      harness.candidate,
      harness.candidate,
      harness.candidate
    ])
    await expect(harness.bootstrap.bootstrap()).resolves.toBe(harness.candidate)
    expect(harness.dependencies.buildRegistrySet).toHaveBeenCalledOnce()
  })

  it.each([
    ['build', {
      buildRegistrySet: () => {
        throw new Error('build failed')
      }
    }],
    ['structure', {
      validateStructure: () => [createDiagnostic('SCHEMA-VALIDATE-001', { stage: 'test.structure' })]
    }],
    ['semantics', {
      validateSemantics: () => [createDiagnostic('REG-REFERENCE-001', { stage: 'test.semantics' })]
    }],
    ['freeze', {
      freezeRegistrySet: () => {
        throw new Error('freeze failed')
      }
    }]
  ] as const)('does not publish a candidate when %s fails', async (stage, overrides) => {
    const harness = createHarness(overrides)

    await expect(harness.bootstrap.bootstrap()).rejects.toMatchObject({ stage })
    expect(() => harness.bootstrap.getRegistrySet()).toThrowError(
      expect.objectContaining({ stage: 'access' })
    )
  })

  it('clears a failed attempt so a later retry can build a fresh candidate', async () => {
    const firstCandidate = createCandidate()
    const secondCandidate = createCandidate()
    const buildRegistrySet = vi.fn()
      .mockImplementationOnce(() => firstCandidate)
      .mockImplementationOnce(() => secondCandidate)
    const validateStructure = vi.fn()
      .mockReturnValueOnce([createDiagnostic('SCHEMA-VALIDATE-001', { stage: 'test.structure' })])
      .mockReturnValueOnce([])
    const bootstrap = createOfficialContentBootstrap({
      buildRegistrySet,
      validateStructure,
      validateSemantics: () => [],
      freezeRegistrySet: registrySet => registrySet.freezeEntries()
    })

    await expect(bootstrap.bootstrap()).rejects.toMatchObject({ stage: 'structure' })
    await expect(bootstrap.bootstrap()).resolves.toBe(secondCandidate)
    expect(buildRegistrySet).toHaveBeenCalledTimes(2)
  })

  it('validates every official registry against its TypeBox schema before freezing', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()

    expect(registrySet.registryIds()).toHaveLength(Object.keys(OFFICIAL_REGISTRY_SCHEMAS).length)
    expect(validateOfficialRegistryStructure(registrySet)).toEqual([])
    expect(validateRegistrySemantics(registrySet)).toEqual([])
    expect(registrySet.currentPhase).toBe('registering-entries')
  })

  it('prevents entry and record replacement after publication', async () => {
    const harness = createHarness()
    const registrySet = await harness.bootstrap.bootstrap()
    const registry = registrySet.get<RegistryEntry>(toOfficialRegistryTypeId('test'))
    const record = registry.entries()[0]!

    expect(Object.isFrozen(record)).toBe(true)
    expect(Object.isFrozen(record.entry)).toBe(true)
    expect(() => registry.register(owner, { id: toOfficialContentId('test/another') }))
      .toThrowError(RegistryError)
    expect(() => {
      Object.assign(record.entry, { id: toOfficialContentId('test/replaced') })
    }).toThrowError(TypeError)
    expect(registry.values().map(entry => entry.id)).toEqual(['taoyuan:test/entry'])
  })
})
