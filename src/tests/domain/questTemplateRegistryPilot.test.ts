import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  QUEST_TEMPLATES as LEGACY_QUEST_TEMPLATES,
  SPECIAL_ORDER_TEMPLATES as LEGACY_SPECIAL_ORDER_TEMPLATES,
  type SpecialOrderTemplate as LegacySpecialOrderTemplate
} from '@/data/questDefinitions'
import {
  QUEST_TEMPLATES,
  generateSpecialOrder,
  getQuestTemplates,
  getSpecialOrderTemplates
} from '@/data/quests'
import {
  getOfficialBoardQuestTemplateDefs,
  getOfficialQuestTemplateDef,
  getOfficialQuestTemplateDefs,
  getOfficialQuestTemplatesAsLegacy,
  getOfficialSpecialOrderTemplateDefs,
  getOfficialSpecialOrderTemplatesAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { QuestTemplateDefSchema, type QuestTemplateDef as QuestTemplateContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  adaptLegacyQuestTemplate,
  adaptLegacySpecialOrderTemplate,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useNpcStore } from '@/stores/useNpcStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useQuestStore } from '@/stores/useQuestStore'
import type { QuestTemplateDef as LegacyQuestTemplateDef } from '@/types'
import validQuestTemplates from '../fixtures/mods/minimal-valid-package/data/quest-templates.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const text = (key: string, fallback: string) => ({ key, fallback })

const expectedBoardTemplate = (template: LegacyQuestTemplateDef): QuestTemplateContentDef =>
  adaptLegacyQuestTemplate(template)

const expectedSpecialOrderTemplate = (template: LegacySpecialOrderTemplate): QuestTemplateContentDef =>
  adaptLegacySpecialOrderTemplate(template)

describe('quest template registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external quest template JSON before registration', () => {
    const externalQuestTemplates: unknown = validQuestTemplates

    expect(validateUnknown(Type.Array(QuestTemplateDefSchema), externalQuestTemplates, {
      stage: 'test.questTemplates'
    }).ok).toBe(true)
  })

  it('rejects invalid quest template shapes and extra properties', () => {
    const board = validQuestTemplates[0]! as Extract<QuestTemplateContentDef, { kind: 'board' }>
    const special = validQuestTemplates[1]! as Extract<QuestTemplateContentDef, { kind: 'special_order' }>
    expect(board.kind).toBe('board')
    expect(special.kind).toBe('special_order')

    const invalidQuestTemplates: unknown = [
      { ...board, id: 'bad id' },
      { ...board, targets: [] },
      { ...board, targets: [{ ...board.targets[0]!, itemId: 'bad id' }] },
      { ...board, npcPool: ['bad id'] },
      { ...special, tier: 5 },
      { ...special, itemReward: [{ itemId: 'bad id', quantity: 1 }] },
      { ...board, extra: true }
    ]

    const result = validateUnknown(Type.Array(QuestTemplateDefSchema), invalidQuestTemplates, {
      stage: 'test.questTemplates.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.length).toBeGreaterThan(0)
    }
  })

  it('registers board and special-order templates with equivalent legacy fields and compatible IDs', () => {
    expect(getOfficialBoardQuestTemplateDefs()).toHaveLength(LEGACY_QUEST_TEMPLATES.length)
    expect(getOfficialSpecialOrderTemplateDefs()).toHaveLength(LEGACY_SPECIAL_ORDER_TEMPLATES.length)
    expect(getOfficialQuestTemplateDefs()).toHaveLength(
      LEGACY_QUEST_TEMPLATES.length + LEGACY_SPECIAL_ORDER_TEMPLATES.length
    )
    expect(getOfficialQuestTemplatesAsLegacy().map(clone)).toEqual(LEGACY_QUEST_TEMPLATES.map(clone))
    expect(QUEST_TEMPLATES.map(clone)).toEqual(LEGACY_QUEST_TEMPLATES.map(clone))
    expect(getQuestTemplates().map(clone)).toEqual(LEGACY_QUEST_TEMPLATES.map(clone))
    expect(getOfficialSpecialOrderTemplatesAsLegacy().map(clone)).toEqual(LEGACY_SPECIAL_ORDER_TEMPLATES.map(clone))
    expect(getSpecialOrderTemplates().map(clone)).toEqual(LEGACY_SPECIAL_ORDER_TEMPLATES.map(clone))

    for (const template of LEGACY_QUEST_TEMPLATES) {
      expect(getOfficialQuestTemplateDef(`board/${template.type}`)).toEqual(expectedBoardTemplate(template))
      expect(getOfficialQuestTemplateDef(`quest_template/board/${template.type}`)).toBe(
        getOfficialQuestTemplateDef(`board/${template.type}`)
      )
      expect(getOfficialQuestTemplateDef(toOfficialContentId(`quest_template/board/${template.type}`))).toBe(
        getOfficialQuestTemplateDef(`board/${template.type}`)
      )
    }

    for (const template of LEGACY_SPECIAL_ORDER_TEMPLATES) {
      expect(getOfficialQuestTemplateDefs()).toContainEqual(expectedSpecialOrderTemplate(template))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstTemplate = getOfficialQuestTemplateDef('board/delivery')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<QuestTemplateContentDef>(toOfficialRegistryTypeId('quest_template'))

    expect(getOfficialQuestTemplateDef('missing_quest_template')).toBeUndefined()
    expect(Object.isFrozen(firstTemplate)).toBe(true)
    expect(Object.isFrozen(firstTemplate && firstTemplate.kind === 'board' ? firstTemplate.targets : undefined)).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      expectedBoardTemplate(LEGACY_QUEST_TEMPLATES[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing quest template item and NPC references during semantic validation', () => {
    const registrySet = new RegistrySet()
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()

    const brokenBoard: QuestTemplateContentDef = {
      id: toOfficialContentId('quest_template/board/broken'),
      templateId: 'board/broken',
      kind: 'board',
      type: 'delivery',
      targets: [
        {
          itemId: toOfficialContentId('missing_item'),
          name: text('taoyuan.quest_template.broken.targets.0.name', 'Missing'),
          minQty: 1,
          maxQty: 1,
          seasons: [],
          unitPrice: 1
        }
      ],
      npcPool: [toOfficialContentId('npc/missing_npc')],
      rewardMultiplier: 1,
      friendshipReward: 1
    }
    const brokenSpecial: QuestTemplateContentDef = {
      id: toOfficialContentId('quest_template/special_order/broken'),
      templateId: 'special_order/broken',
      kind: 'special_order',
      name: text('taoyuan.quest_template.special_order.broken.name', 'Broken'),
      targetItemId: toOfficialContentId('missing_target'),
      targetItemName: text('taoyuan.quest_template.special_order.broken.targetItemName', 'Missing'),
      quantity: 1,
      days: 1,
      moneyReward: 0,
      itemReward: [{ itemId: toOfficialContentId('missing_reward'), quantity: 1 }],
      seasons: [],
      npcId: toOfficialContentId('npc/missing_owner'),
      tier: 1
    }

    const registry = registrySet.get<QuestTemplateContentDef>(toOfficialRegistryTypeId('quest_template'))
    registry.register(OFFICIAL_PACKAGE_ID, brokenBoard)
    registry.register(OFFICIAL_PACKAGE_ID, brokenSpecial)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/targets/0/itemId' ||
      diagnostic.fieldPath === '/npcPool/0' ||
      diagnostic.fieldPath === '/targetItemId' ||
      diagnostic.fieldPath === '/itemReward/0/itemId' ||
      diagnostic.fieldPath === '/npcId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_item'),
        fieldPath: '/targets/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('npc'),
        contentId: toOfficialContentId('npc/missing_npc'),
        fieldPath: '/npcPool/0'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_target'),
        fieldPath: '/targetItemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_reward'),
        fieldPath: '/itemReward/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('npc'),
        contentId: toOfficialContentId('npc/missing_owner'),
        fieldPath: '/npcId'
      })
    ]))
  })

  it('keeps generated board quests and special orders registry-backed without changing runtime behavior', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.spyOn(Date, 'now').mockReturnValue(1234567890)

    const questStore = useQuestStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const npcStore = useNpcStore()
    const chenBefore = npcStore.getNpcState('chen_bo')?.friendship ?? 0

    questStore.generateDailyQuests('spring', 1)
    expect(Math.random).toHaveBeenCalledTimes(5)
    expect(questStore.boardQuests).toHaveLength(1)
    expect(questStore.boardQuests[0]).toEqual(expect.objectContaining({
      id: expect.stringMatching(/^quest_1234567890_/),
      type: 'delivery',
      npcId: 'chen_bo',
      npcName: '陈伯',
      description: '陈伯需要2个青菜，请送给陈伯。',
      targetItemId: 'cabbage',
      targetItemName: '青菜',
      targetQuantity: 2,
      moneyReward: 210,
      friendshipReward: 5,
      daysRemaining: 2,
      accepted: false
    }))

    const questId = questStore.boardQuests[0]!.id
    expect(questStore.acceptQuest(questId)).toEqual({
      success: true,
      message: '接取了任务：陈伯需要2个青菜，请送给陈伯。'
    })
    inventoryStore.addItem('cabbage', 2)
    expect(questStore.submitQuest(questId)).toEqual({
      success: true,
      message: '完成了陈伯的委托！获得210文，陈伯好感+5。'
    })
    expect(inventoryStore.getItemCount('cabbage')).toBe(0)
    expect(playerStore.money).toBe(710)
    expect(npcStore.getNpcState('chen_bo')?.friendship).toBe(chenBefore + 5)
    expect(questStore.completedQuestCount).toBe(1)

    vi.mocked(Math.random).mockClear()
    const specialOrder = generateSpecialOrder('spring', 1)
    expect(Math.random).toHaveBeenCalledTimes(1)
    expect(specialOrder).toEqual(expect.objectContaining({
      id: expect.stringMatching(/^special_1234567890_/),
      type: 'special_order',
      npcId: 'a_shi',
      npcName: '阿石',
      tierLabel: '简单',
      description: '阿石急需15个铜矿。',
      targetItemId: 'copper_ore',
      targetItemName: '铜矿',
      targetQuantity: 15,
      moneyReward: 600,
      friendshipReward: 5,
      daysRemaining: 7,
      accepted: false,
      itemReward: [{ itemId: 'iron_ore', quantity: 3 }]
    }))
  })
})
