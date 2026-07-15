import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  PROCESSING_RECIPES as LEGACY_PROCESSING_RECIPES,
  getProcessingRecipeById,
  getRecipesForMachine
} from '@/data/processing'
import {
  getOfficialProcessingRecipeById,
  getOfficialProcessingRecipeDef,
  getOfficialProcessingRecipeDefs,
  getOfficialProcessingRecipesAsLegacy,
  getOfficialProcessingRecipesForMachine
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  ProcessingRecipeDefSchema,
  type ProcessingRecipeDef as ProcessingRecipeContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useProcessingStore } from '@/stores/useProcessingStore'
import type { ProcessingRecipeDef as LegacyProcessingRecipeDef } from '@/types'
import validProcessingRecipes from '../fixtures/mods/minimal-valid-package/data/processing-recipes.json'

const normalizeRecipe = (recipe: LegacyProcessingRecipeDef): LegacyProcessingRecipeDef => ({ ...recipe })

const expectedRecipeContentDef = (recipe: LegacyProcessingRecipeDef): ProcessingRecipeContentDef => {
  const base = {
    id: toOfficialContentId(recipe.id),
    machineId: toOfficialContentId(recipe.machineType),
    name: { key: `taoyuan.processing_recipe.${recipe.id}.name`, fallback: recipe.name },
    outputItemId: toOfficialContentId(recipe.outputItemId),
    outputQuantity: recipe.outputQuantity,
    processingDays: recipe.processingDays,
    description: { key: `taoyuan.processing_recipe.${recipe.id}.description`, fallback: recipe.description }
  }
  return recipe.inputItemId === null
    ? {
        ...base,
        inputItemId: null,
        inputQuantity: 0
      }
    : {
        ...base,
        inputItemId: toOfficialContentId(recipe.inputItemId),
        inputQuantity: recipe.inputQuantity
      }
}

describe('processing recipe registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external processing recipe JSON before registration', () => {
    const externalRecipes: unknown = validProcessingRecipes
    const result = validateUnknown(Type.Array(ProcessingRecipeDefSchema), externalRecipes, {
      stage: 'test.processing-recipes'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid processing recipe shapes and numeric bounds', () => {
    const base = validProcessingRecipes[0]!
    const invalidRecipes: unknown = [
      { ...base, id: 'not namespaced' },
      { ...base, machineId: 'not namespaced' },
      { ...base, inputItemId: 'not namespaced' },
      { ...base, inputQuantity: 0 },
      { ...base, outputItemId: 'not namespaced' },
      { ...base, outputQuantity: 0 },
      { ...base, processingDays: 0 },
      { ...base, extra: true },
      { ...base, inputItemId: null, inputQuantity: 1 }
    ]
    const result = validateUnknown(Type.Array(ProcessingRecipeDefSchema), invalidRecipes, {
      stage: 'test.processing-recipes.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      const fieldPaths = result.diagnostics.map(diagnostic => diagnostic.fieldPath)
      expect(fieldPaths).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/machineId',
        '/2/inputItemId',
        '/3/inputQuantity',
        '/4/outputItemId',
        '/5/outputQuantity',
        '/6/processingDays',
        '/7/extra'
      ]))
    }
  })

  it('registers all processing recipes in legacy order with equivalent fields', () => {
    expect(getOfficialProcessingRecipeDefs()).toHaveLength(LEGACY_PROCESSING_RECIPES.length)
    expect(getOfficialProcessingRecipeDefs().map(recipe => recipe.id)).toEqual(
      LEGACY_PROCESSING_RECIPES.map(recipe => toOfficialContentId(recipe.id))
    )
    expect(getOfficialProcessingRecipeDefs()).toEqual(
      LEGACY_PROCESSING_RECIPES.map(expectedRecipeContentDef)
    )
    expect(getOfficialProcessingRecipesAsLegacy().map(normalizeRecipe)).toEqual(
      LEGACY_PROCESSING_RECIPES.map(normalizeRecipe)
    )

    for (const recipe of LEGACY_PROCESSING_RECIPES) {
      expect(getOfficialProcessingRecipeDef(recipe.id)).toEqual(expectedRecipeContentDef(recipe))
      expect(getOfficialProcessingRecipeDef(toOfficialContentId(recipe.id))).toBe(getOfficialProcessingRecipeDef(recipe.id))
      expect(getOfficialProcessingRecipeById(recipe.id)).toEqual(normalizeRecipe(recipe))
      expect(getProcessingRecipeById(recipe.id)).toEqual(normalizeRecipe(recipe))
    }
  })

  it('keeps machine recipe queries equivalent and registry-backed', () => {
    const machines = [...new Set(LEGACY_PROCESSING_RECIPES.map(recipe => recipe.machineType))]
    for (const machine of machines) {
      const legacyRecipes = LEGACY_PROCESSING_RECIPES
        .filter(recipe => recipe.machineType === machine)
        .map(normalizeRecipe)
      expect(getOfficialProcessingRecipesForMachine(machine).map(normalizeRecipe)).toEqual(legacyRecipes)
      expect(getRecipesForMachine(machine).map(normalizeRecipe)).toEqual(legacyRecipes)
      expect(getOfficialProcessingRecipesForMachine(toOfficialContentId(machine)).map(normalizeRecipe)).toEqual(legacyRecipes)
    }

    expect(getRecipesForMachine('missing_machine')).toEqual([])
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const honey = getOfficialProcessingRecipeDef('honey')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ProcessingRecipeContentDef>(toOfficialRegistryTypeId('processing_recipe'))

    expect(getOfficialProcessingRecipeDef('missing_processing_recipe')).toBeUndefined()
    expect(getOfficialProcessingRecipeById('missing_processing_recipe')).toBeUndefined()
    expect(getProcessingRecipeById('missing_processing_recipe')).toBeUndefined()
    expect(Object.isFrozen(honey)).toBe(true)
    expect(Object.isFrozen(honey?.name)).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      expectedRecipeContentDef(LEGACY_PROCESSING_RECIPES[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing machine and item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ProcessingRecipeContentDef>(toOfficialRegistryTypeId('processing_recipe'))
    const missingMachine = toOfficialContentId('missing_processing_machine')
    const missingInput = toOfficialContentId('missing_processing_input')
    const missingOutput = toOfficialContentId('missing_processing_output')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('processing_recipe/missing_refs'),
      machineId: missingMachine,
      name: { key: 'test.processing-recipe.missing.name', fallback: 'Missing refs' },
      inputItemId: missingInput,
      inputQuantity: 1,
      outputItemId: missingOutput,
      outputQuantity: 1,
      processingDays: 1,
      description: { key: 'test.processing-recipe.missing.description', fallback: 'Missing refs' }
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('processing_machine'),
        contentId: missingMachine,
        fieldPath: '/machineId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingInput,
        fieldPath: '/inputItemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingOutput,
        fieldPath: '/outputItemId'
      })
    ]))
  })

  it('keeps input consumption, auto-collect and no-input restart behavior unchanged', () => {
    const processingStore = useProcessingStore()
    const inventoryStore = useInventoryStore()

    expect(inventoryStore.addItem('copper_ore', 5)).toBe(true)
    processingStore.machines.push({
      machineType: 'furnace',
      recipeId: null,
      inputItemId: null,
      daysProcessed: 0,
      totalDays: 0,
      ready: false
    })
    expect(processingStore.startProcessing(0, 'smelt_copper')).toBe(true)
    expect(inventoryStore.getItemCount('copper_ore')).toBe(0)
    expect(processingStore.dailyUpdate()).toEqual({
      collected: ['铜锭'],
      readyNames: []
    })
    expect(inventoryStore.getItemCount('copper_bar')).toBe(1)
    expect(processingStore.machines[0]).toMatchObject({
      machineType: 'furnace',
      recipeId: null,
      inputItemId: null,
      daysProcessed: 0,
      totalDays: 0,
      ready: false
    })

    processingStore.machines.push({
      machineType: 'bee_house',
      recipeId: 'honey',
      inputItemId: null,
      daysProcessed: 3,
      totalDays: 4,
      ready: false
    })
    expect(processingStore.dailyUpdate()).toEqual({
      collected: ['蜂蜜'],
      readyNames: []
    })
    expect(inventoryStore.getItemCount('honey')).toBe(1)
    expect(processingStore.machines[1]).toMatchObject({
      machineType: 'bee_house',
      recipeId: 'honey',
      inputItemId: null,
      daysProcessed: 0,
      totalDays: 4,
      ready: false
    })
  })
})
