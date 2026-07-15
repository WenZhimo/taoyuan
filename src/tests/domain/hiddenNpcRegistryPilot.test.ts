import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { HIDDEN_NPCS as LEGACY_HIDDEN_NPCS } from '@/data/hiddenNpcDefinitions'
import { getHiddenNpcById, getHiddenNpcs } from '@/data/hiddenNpcs'
import {
  getOfficialHiddenNpcById,
  getOfficialHiddenNpcDef,
  getOfficialHiddenNpcsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { HiddenNpcDefSchema, type HiddenNpcDef as HiddenNpcContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  adaptLegacyHiddenNpc,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useHiddenNpcStore } from '@/stores/useHiddenNpcStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { HiddenNpcDef as LegacyHiddenNpcDef } from '@/types/hiddenNpc'
import validHiddenNpcs from '../fixtures/mods/minimal-valid-package/data/hidden-npcs.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const text = (key: string, fallback: string) => ({ key, fallback })

const expectedHiddenNpcContentDef = (npc: LegacyHiddenNpcDef): HiddenNpcContentDef =>
  adaptLegacyHiddenNpc(npc)

describe('hidden NPC registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external hidden NPC JSON before registration', () => {
    const externalHiddenNpcs: unknown = validHiddenNpcs

    expect(validateUnknown(Type.Array(HiddenNpcDefSchema), externalHiddenNpcs, { stage: 'test.hiddenNpcs' }).ok).toBe(true)
  })

  it('rejects invalid hidden NPC shapes and extra properties', () => {
    const invalidHiddenNpcs: unknown = [
      { ...validHiddenNpcs[0], id: 'bad id' },
      { ...validHiddenNpcs[0], discoverySteps: [] },
      {
        ...validHiddenNpcs[0],
        discoverySteps: [
          {
            ...validHiddenNpcs[0]!.discoverySteps[0],
            conditions: [
              {
                type: 'item',
                itemId: 'bad id',
                quantity: 1
              }
            ]
          }
        ]
      },
      { ...validHiddenNpcs[0], courtshipThreshold: -1, extra: true }
    ]

    const result = validateUnknown(Type.Array(HiddenNpcDefSchema), invalidHiddenNpcs, { stage: 'test.hiddenNpcs.invalid' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/discoverySteps',
        '/2/discoverySteps/0/conditions/0/itemId',
        '/3/courtshipThreshold',
        '/3/extra'
      ]))
    }
  })

  it('registers hidden NPCs with equivalent legacy fields and compatible query IDs', () => {
    expect(getOfficialHiddenNpcsAsLegacy().map(clone)).toEqual(LEGACY_HIDDEN_NPCS.map(clone))
    expect(getHiddenNpcs().map(clone)).toEqual(LEGACY_HIDDEN_NPCS.map(clone))

    for (const npc of LEGACY_HIDDEN_NPCS) {
      expect(getOfficialHiddenNpcDef(npc.id)).toEqual(expectedHiddenNpcContentDef(npc))
      expect(getOfficialHiddenNpcDef(`hidden_npc/${npc.id}`)).toBe(getOfficialHiddenNpcDef(npc.id))
      expect(getOfficialHiddenNpcDef(toOfficialContentId(`hidden_npc/${npc.id}`))).toBe(getOfficialHiddenNpcDef(npc.id))
      expect(getOfficialHiddenNpcById(npc.id)).toEqual(clone(npc))
      expect(getHiddenNpcById(npc.id)).toEqual(clone(npc))
    }

    expect(getOfficialHiddenNpcDef('missing_hidden_npc')).toBeUndefined()
    expect(getOfficialHiddenNpcById('missing_hidden_npc')).toBeUndefined()
    expect(getHiddenNpcById('missing_hidden_npc')).toBeUndefined()
  })

  it('supports duplicate ID rejection and read-only registry entries', () => {
    const firstNpc = getOfficialHiddenNpcDef(LEGACY_HIDDEN_NPCS[0]!.id)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const hiddenNpcRegistry = registrySet.get<HiddenNpcContentDef>(toOfficialRegistryTypeId('hidden_npc'))

    expect(Object.isFrozen(firstNpc)).toBe(true)
    expect(Object.isFrozen(firstNpc?.discoverySteps)).toBe(true)
    expect(Object.isFrozen(firstNpc?.discoverySteps[0]?.scenes)).toBe(true)
    expect(Object.isFrozen(firstNpc?.dialogues.wary)).toBe(true)
    expect(() => hiddenNpcRegistry.register(OFFICIAL_PACKAGE_ID, expectedHiddenNpcContentDef(LEGACY_HIDDEN_NPCS[0]!))).toThrow(RegistryError)
  })

  it('reports missing hidden NPC item, NPC, quest and fish references during semantic validation', () => {
    const registrySet = new RegistrySet()
    const owner = OFFICIAL_PACKAGE_ID
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()
    const brokenNpc: HiddenNpcContentDef = {
      ...expectedHiddenNpcContentDef(LEGACY_HIDDEN_NPCS[0]!),
      id: toOfficialContentId('hidden_npc/broken'),
      resonantOfferings: [toOfficialContentId('missing_resonant_item')],
      courtshipItemId: toOfficialContentId('missing_courtship_item'),
      courtshipCraftCost: [{ itemId: toOfficialContentId('missing_craft_item'), quantity: 1 }],
      discoverySteps: [
        {
          id: 'broken_step',
          phase: 'rumor',
          conditions: [
            { type: 'item', itemId: toOfficialContentId('missing_condition_item'), quantity: 1 },
            { type: 'npcFriendship', npcId: toOfficialContentId('npc/missing_npc'), minFriendship: 1 },
            { type: 'questComplete', questId: toOfficialContentId('story_quest/missing_story'), },
            { type: 'fishCaught', fishId: toOfficialContentId('missing_fish') }
          ],
          scenes: [
            {
              text: text('taoyuan.hidden_npc.broken.discovery.0.text', 'Broken')
            }
          ]
        }
      ]
    }

    registrySet.get<HiddenNpcContentDef>(toOfficialRegistryTypeId('hidden_npc')).register(owner, brokenNpc)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/resonantOfferings/0' ||
      diagnostic.fieldPath === '/courtshipItemId' ||
      diagnostic.fieldPath === '/courtshipCraftCost/0/itemId' ||
      diagnostic.fieldPath === '/discoverySteps/0/conditions/0/itemId' ||
      diagnostic.fieldPath === '/discoverySteps/0/conditions/1/npcId' ||
      diagnostic.fieldPath === '/discoverySteps/0/conditions/2/questId' ||
      diagnostic.fieldPath === '/discoverySteps/0/conditions/3/fishId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_resonant_item'),
        fieldPath: '/resonantOfferings/0'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_courtship_item'),
        fieldPath: '/courtshipItemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_craft_item'),
        fieldPath: '/courtshipCraftCost/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_condition_item'),
        fieldPath: '/discoverySteps/0/conditions/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('npc'),
        contentId: toOfficialContentId('npc/missing_npc'),
        fieldPath: '/discoverySteps/0/conditions/1/npcId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('story_quest'),
        contentId: toOfficialContentId('story_quest/missing_story'),
        fieldPath: '/discoverySteps/0/conditions/2/questId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('fish'),
        contentId: toOfficialContentId('missing_fish'),
        fieldPath: '/discoverySteps/0/conditions/3/fishId'
      })
    ]))
  })

  it('keeps hidden NPC discovery, offerings, ability unlocks and old save migration registry-backed', () => {
    const hiddenNpcStore = useHiddenNpcStore()
    const achievementStore = useAchievementStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    expect(hiddenNpcStore.hiddenNpcStates.map(state => state.npcId)).toEqual(LEGACY_HIDDEN_NPCS.map(npc => npc.id))

    achievementStore.discoveredItems.push('jade_dragon')
    expect(hiddenNpcStore.checkDiscoveryConditions()).toEqual([
      expect.objectContaining({
        npcId: 'long_ling',
        step: expect.objectContaining({ id: 'long_ling_rumor', phase: 'rumor' })
      })
    ])
    expect(hiddenNpcStore.getHiddenNpcState('long_ling')?.discoveryPhase).toBe('rumor')

    const longLingState = hiddenNpcStore.getHiddenNpcState('long_ling')!
    longLingState.discoveryPhase = 'revealed'
    expect(inventoryStore.addItem('dragon_jade', 1, 'supreme')).toBe(true)
    expect(hiddenNpcStore.performOffering('long_ling', 'dragon_jade', 'supreme')).toEqual({
      success: true,
      message: '龙灵感到灵犀相通。',
      affinityChange: 200
    })
    expect(longLingState.affinity).toBe(200)

    longLingState.affinity = 800
    expect(hiddenNpcStore.checkAbilityUnlocks()).toEqual([
      {
        id: 'long_ling_1',
        npcId: 'long_ling',
        name: '龙泽',
        description: '瀑布钓鱼品质提升一级'
      }
    ])
    expect(hiddenNpcStore.isAbilityActive('long_ling_1')).toBe(true)

    const yueTuState = hiddenNpcStore.getHiddenNpcState('yue_tu')!
    yueTuState.discoveryPhase = 'revealed'
    yueTuState.bonded = true
    playerStore.stamina = 50
    expect(hiddenNpcStore.dailyBondBonus()).toEqual({ messages: ['月兔为你恢复了15点体力。'] })
    expect(playerStore.stamina).toBe(65)

    hiddenNpcStore.deserialize({
      hiddenNpcStates: [
        {
          npcId: 'long_ling',
          discoveryPhase: 'revealed',
          completedSteps: ['long_ling_rumor'],
          affinity: 123,
          interactedToday: false,
          offeredToday: false,
          offersThisWeek: 0,
          specialInteractionCooldown: 0,
          courting: false,
          bonded: false,
          triggeredHeartEvents: [],
          unlockedAbilities: []
        }
      ]
    })
    expect(hiddenNpcStore.getHiddenNpcState('long_ling')?.affinity).toBe(123)
    expect(hiddenNpcStore.hiddenNpcStates.map(state => state.npcId)).toEqual(LEGACY_HIDDEN_NPCS.map(npc => npc.id))
  })
})
