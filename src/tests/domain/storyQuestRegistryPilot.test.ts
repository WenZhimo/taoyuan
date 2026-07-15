import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { STORY_QUESTS as LEGACY_STORY_QUESTS } from '@/data/storyQuestDefinitions'
import {
  getChapterQuests,
  getFirstStoryQuest,
  getNextStoryQuest,
  getStoryQuestById,
  getStoryQuestByOrder,
  getStoryQuestCount,
  getStoryQuests
} from '@/data/storyQuests'
import {
  getOfficialFirstStoryQuest,
  getOfficialStoryQuestById,
  getOfficialStoryQuestDef,
  getOfficialStoryQuestsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { StoryQuestDefSchema, type StoryQuestDef as StoryQuestContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  adaptLegacyStoryQuest,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useNpcStore } from '@/stores/useNpcStore'
import { useQuestStore } from '@/stores/useQuestStore'
import type { MainQuestDef as LegacyMainQuestDef } from '@/types'
import validStoryQuests from '../fixtures/mods/minimal-valid-package/data/story-quests.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const text = (key: string, fallback: string) => ({ key, fallback })

const expectedStoryQuestContentDef = (quest: LegacyMainQuestDef): StoryQuestContentDef =>
  adaptLegacyStoryQuest(quest)

describe('story quest registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external story quest JSON before registration', () => {
    const externalStoryQuests: unknown = validStoryQuests

    expect(validateUnknown(Type.Array(StoryQuestDefSchema), externalStoryQuests, { stage: 'test.storyQuests' }).ok).toBe(true)
  })

  it('rejects invalid story quest shapes and extra properties', () => {
    const invalidStoryQuests: unknown = [
      { ...validStoryQuests[0], id: 'bad id' },
      { ...validStoryQuests[0], objectives: [] },
      {
        ...validStoryQuests[0],
        objectives: [
          {
            type: 'deliverItem',
            label: text('example_mod.story_quest.invalid.objectives.0.label', '交付'),
            itemId: 'bad id',
            itemQuantity: 1
          }
        ]
      },
      { ...validStoryQuests[0], chapter: 0, extra: true }
    ]

    const result = validateUnknown(Type.Array(StoryQuestDefSchema), invalidStoryQuests, { stage: 'test.storyQuests.invalid' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/objectives',
        '/2/objectives/0/itemId',
        '/3/chapter',
        '/3/extra'
      ]))
    }
  })

  it('registers story quests with equivalent legacy fields and compatible query IDs', () => {
    expect(getOfficialStoryQuestsAsLegacy().map(clone)).toEqual(LEGACY_STORY_QUESTS.map(clone))
    expect(getStoryQuests().map(clone)).toEqual(LEGACY_STORY_QUESTS.map(clone))
    expect(getStoryQuestCount()).toBe(LEGACY_STORY_QUESTS.length)

    for (const quest of LEGACY_STORY_QUESTS) {
      expect(getOfficialStoryQuestDef(quest.id)).toEqual(expectedStoryQuestContentDef(quest))
      expect(getOfficialStoryQuestDef(`story_quest/${quest.id}`)).toBe(getOfficialStoryQuestDef(quest.id))
      expect(getOfficialStoryQuestDef(toOfficialContentId(`story_quest/${quest.id}`))).toBe(getOfficialStoryQuestDef(quest.id))
      expect(getOfficialStoryQuestById(quest.id)).toEqual(clone(quest))
      expect(getStoryQuestById(quest.id)).toEqual(clone(quest))
    }

    expect(getStoryQuestByOrder(1, 1)).toEqual(clone(LEGACY_STORY_QUESTS[0]!))
    expect(getChapterQuests(2).map(quest => quest.id)).toEqual(LEGACY_STORY_QUESTS.filter(quest => quest.chapter === 2).map(quest => quest.id))
    expect(getFirstStoryQuest()).toEqual(clone(LEGACY_STORY_QUESTS[0]!))
    expect(getNextStoryQuest('main_1_1')).toEqual(clone(LEGACY_STORY_QUESTS[1]!))
    expect(getOfficialFirstStoryQuest()).toEqual(clone(LEGACY_STORY_QUESTS[0]!))
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstQuest = getOfficialStoryQuestDef(LEGACY_STORY_QUESTS[0]!.id)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const storyQuestRegistry = registrySet.get<StoryQuestContentDef>(toOfficialRegistryTypeId('story_quest'))

    expect(getOfficialStoryQuestDef('missing_story_quest')).toBeUndefined()
    expect(getOfficialStoryQuestById('missing_story_quest')).toBeUndefined()
    expect(getStoryQuestById('missing_story_quest')).toBeUndefined()
    expect(Object.isFrozen(firstQuest)).toBe(true)
    expect(Object.isFrozen(firstQuest?.objectives)).toBe(true)
    expect(Object.isFrozen(firstQuest?.title)).toBe(true)
    expect(() => storyQuestRegistry.register(OFFICIAL_PACKAGE_ID, expectedStoryQuestContentDef(LEGACY_STORY_QUESTS[0]!))).toThrow(RegistryError)
  })

  it('reports missing story quest NPC and item references during semantic validation', () => {
    const registrySet = new RegistrySet()
    const owner = OFFICIAL_PACKAGE_ID
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()
    const brokenQuest: StoryQuestContentDef = {
      id: toOfficialContentId('story_quest/broken'),
      chapter: 1,
      order: 1,
      title: text('taoyuan.story_quest.broken.title', 'Broken'),
      description: text('taoyuan.story_quest.broken.description', 'Broken'),
      npcId: toOfficialContentId('npc/missing_owner'),
      objectives: [
        {
          type: 'deliverItem',
          label: text('taoyuan.story_quest.broken.objectives.0.label', 'Deliver missing item'),
          itemId: toOfficialContentId('missing_item'),
          itemQuantity: 1
        },
        {
          type: 'npcFriendship',
          label: text('taoyuan.story_quest.broken.objectives.1.label', 'Befriend missing NPC'),
          npcId: toOfficialContentId('npc/missing_friend'),
          friendshipLevel: 'friendly'
        }
      ],
      moneyReward: 0,
      friendshipReward: [{ npcId: toOfficialContentId('npc/missing_reward_npc'), amount: 1 }],
      itemReward: [{ itemId: toOfficialContentId('missing_reward_item'), quantity: 1 }]
    }

    registrySet.get<StoryQuestContentDef>(toOfficialRegistryTypeId('story_quest')).register(owner, brokenQuest)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/npcId' ||
      diagnostic.fieldPath === '/objectives/0/itemId' ||
      diagnostic.fieldPath === '/objectives/1/npcId' ||
      diagnostic.fieldPath === '/friendshipReward/0/npcId' ||
      diagnostic.fieldPath === '/itemReward/0/itemId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('npc'),
        contentId: toOfficialContentId('npc/missing_owner'),
        fieldPath: '/npcId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_item'),
        fieldPath: '/objectives/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('npc'),
        contentId: toOfficialContentId('npc/missing_friend'),
        fieldPath: '/objectives/1/npcId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('npc'),
        contentId: toOfficialContentId('npc/missing_reward_npc'),
        fieldPath: '/friendshipReward/0/npcId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_reward_item'),
        fieldPath: '/itemReward/0/itemId'
      })
    ]))
  })

  it('keeps quest store main quest initialization, completion and old save migration registry-backed', () => {
    const questStore = useQuestStore()
    const achievementStore = useAchievementStore()
    const npcStore = useNpcStore()

    questStore.initMainQuest()
    expect(questStore.mainQuest?.questId).toBe('main_1_1')

    achievementStore.stats.totalCropsHarvested = 5
    expect(questStore.acceptMainQuest()).toEqual({ success: true, message: '接取了主线任务：新的开始（柳村长）' })
    expect(questStore.mainQuest?.objectiveProgress).toEqual([true])

    const liuStateBefore = npcStore.getNpcState('liu_cunzhang')?.friendship ?? 0
    expect(questStore.submitMainQuest()).toEqual({
      success: true,
      message: '【主线完成】新的开始！柳村长：获得300文。'
    })
    expect(questStore.completedMainQuests).toEqual(['main_1_1'])
    expect(questStore.mainQuest?.questId).toBe('main_1_2')
    expect(npcStore.getNpcState('liu_cunzhang')?.friendship).toBe(liuStateBefore + 20)

    const freshQuestStore = useQuestStore()
    freshQuestStore.deserialize({
      boardQuests: [],
      activeQuests: [],
      completedQuestCount: 0
    } as unknown as ReturnType<typeof freshQuestStore.serialize>)
    expect(freshQuestStore.mainQuest?.questId).toBe('main_1_1')
  })
})
