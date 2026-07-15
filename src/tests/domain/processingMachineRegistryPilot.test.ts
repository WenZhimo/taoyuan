import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  PROCESSING_MACHINES as LEGACY_PROCESSING_MACHINES,
  getMachineById,
  getProcessingMachines
} from '@/data/processing'
import {
  getOfficialProcessingMachineById,
  getOfficialProcessingMachineDef,
  getOfficialProcessingMachineDefs,
  getOfficialProcessingMachinesAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  ProcessingMachineDefSchema,
  type ProcessingMachineDef as ProcessingMachineContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useProcessingStore } from '@/stores/useProcessingStore'
import type { ProcessingMachineDef as LegacyProcessingMachineDef } from '@/types'
import validProcessingMachines from '../fixtures/mods/minimal-valid-package/data/processing-machines.json'

const normalizeMachine = (machine: LegacyProcessingMachineDef): LegacyProcessingMachineDef => ({
  ...machine,
  craftCost: machine.craftCost.map(material => ({ ...material }))
})

const expectedMachineContentDef = (machine: LegacyProcessingMachineDef): ProcessingMachineContentDef => ({
  id: toOfficialContentId(machine.id),
  name: { key: `taoyuan.processing_machine.${machine.id}.name`, fallback: machine.name },
  description: { key: `taoyuan.processing_machine.${machine.id}.description`, fallback: machine.description },
  craftCost: machine.craftCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  craftMoney: machine.craftMoney,
  ...(machine.autoCollect === undefined ? {} : { autoCollect: machine.autoCollect })
})

describe('processing machine registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external processing machine JSON before registration', () => {
    const externalMachines: unknown = validProcessingMachines
    const result = validateUnknown(Type.Array(ProcessingMachineDefSchema), externalMachines, {
      stage: 'test.processing-machines'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid processing machine shapes and numeric bounds', () => {
    const base = validProcessingMachines[0]!
    const invalidMachines: unknown = [
      { ...base, id: 'not namespaced' },
      { ...base, name: { key: '', fallback: 'No key' } },
      { ...base, craftCost: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, craftCost: [{ itemId: 'not namespaced', quantity: 1 }] },
      { ...base, craftMoney: -1 },
      { ...base, autoCollect: 'yes' },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(ProcessingMachineDefSchema), invalidMachines, {
      stage: 'test.processing-machines.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/name/key',
        '/2/craftCost/0/quantity',
        '/3/craftCost/0/itemId',
        '/4/craftMoney',
        '/5/autoCollect',
        '/6/extra'
      ]))
    }
  })

  it('registers all processing machines in legacy order with equivalent fields', () => {
    expect(getOfficialProcessingMachineDefs()).toHaveLength(LEGACY_PROCESSING_MACHINES.length)
    expect(getOfficialProcessingMachineDefs().map(machine => machine.id)).toEqual(
      LEGACY_PROCESSING_MACHINES.map(machine => toOfficialContentId(machine.id))
    )
    expect(getOfficialProcessingMachineDefs()).toEqual(
      LEGACY_PROCESSING_MACHINES.map(expectedMachineContentDef)
    )
    expect(getOfficialProcessingMachinesAsLegacy().map(normalizeMachine)).toEqual(
      LEGACY_PROCESSING_MACHINES.map(normalizeMachine)
    )
    expect(getProcessingMachines().map(normalizeMachine)).toEqual(
      LEGACY_PROCESSING_MACHINES.map(normalizeMachine)
    )

    for (const machine of LEGACY_PROCESSING_MACHINES) {
      expect(getOfficialProcessingMachineDef(machine.id)).toEqual(expectedMachineContentDef(machine))
      expect(getOfficialProcessingMachineDef(toOfficialContentId(machine.id))).toBe(getOfficialProcessingMachineDef(machine.id))
      expect(getOfficialProcessingMachineById(machine.id)).toEqual(normalizeMachine(machine))
      expect(getMachineById(machine.id)).toEqual(normalizeMachine(machine))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const furnace = getOfficialProcessingMachineDef('furnace')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ProcessingMachineContentDef>(toOfficialRegistryTypeId('processing_machine'))

    expect(getOfficialProcessingMachineDef('missing_machine')).toBeUndefined()
    expect(getOfficialProcessingMachineById('missing_machine')).toBeUndefined()
    expect(getMachineById('missing_machine')).toBeUndefined()
    expect(Object.isFrozen(furnace)).toBe(true)
    expect(Object.isFrozen(furnace?.name)).toBe(true)
    expect(Object.isFrozen(furnace?.craftCost)).toBe(true)
    expect(Object.isFrozen(furnace?.craftCost[0])).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      expectedMachineContentDef(LEGACY_PROCESSING_MACHINES[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing craft material item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ProcessingMachineContentDef>(toOfficialRegistryTypeId('processing_machine'))
    const missingMaterial = toOfficialContentId('missing_machine_material')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('processing_machine/missing_material'),
      name: { key: 'test.processing-machine.missing.name', fallback: 'Missing Material Machine' },
      description: { key: 'test.processing-machine.missing.description', fallback: 'Missing material' },
      craftCost: [{ itemId: missingMaterial, quantity: 1 }],
      craftMoney: 1
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

  it('keeps craft, refund and auto-collect behavior registry-backed', () => {
    const processingStore = useProcessingStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    playerStore.money = 1_000
    expect(inventoryStore.addItem('copper_ore', 20)).toBe(true)
    expect(inventoryStore.addItem('iron_ore', 10)).toBe(true)
    expect(inventoryStore.addItem('quartz', 2)).toBe(true)

    expect(processingStore.craftMachine('furnace')).toBe(true)
    expect(playerStore.money).toBe(500)
    expect(inventoryStore.getItemCount('copper_ore')).toBe(10)
    expect(inventoryStore.getItemCount('iron_ore')).toBe(5)
    expect(inventoryStore.getItemCount('quartz')).toBe(0)
    expect(processingStore.machines[0]).toMatchObject({
      machineType: 'furnace',
      recipeId: null,
      ready: false
    })

    inventoryStore.addItem('copper_ore', 5)
    expect(processingStore.startProcessing(0, 'smelt_copper')).toBe(true)
    const result = processingStore.dailyUpdate()

    expect(result).toEqual({
      collected: ['铜锭'],
      readyNames: []
    })
    expect(inventoryStore.getItemCount('copper_bar')).toBe(1)
    expect(processingStore.machines[0]).toMatchObject({
      machineType: 'furnace',
      recipeId: null,
      inputItemId: null,
      ready: false
    })

    expect(processingStore.removeMachine(0)).toBe(true)
    expect(playerStore.money).toBe(1_000)
    expect(inventoryStore.getItemCount('copper_ore')).toBe(20)
    expect(inventoryStore.getItemCount('iron_ore')).toBe(10)
    expect(inventoryStore.getItemCount('quartz')).toBe(2)
  })
})
