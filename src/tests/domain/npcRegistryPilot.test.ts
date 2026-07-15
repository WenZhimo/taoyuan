import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { NPCS as LEGACY_NPCS } from '@/data/npcDefinitions'
import { getNpcById, getNpcs } from '@/data/npcs'
import {
  getOfficialNpcById,
  getOfficialNpcDef,
  getOfficialNpcsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { NpcDefSchema, type NpcDef as NpcContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useNpcStore } from '@/stores/useNpcStore'
import type { NpcDef as LegacyNpcDef } from '@/types'
import validNpcs from '../fixtures/mods/minimal-valid-package/data/npcs.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const text = (key: string, fallback: string) => ({ key, fallback })

const expectedDialogues = (npc: LegacyNpcDef): NpcContentDef['dialogues'] => ({
  stranger: npc.dialogues.stranger.map((line, index) => text(`taoyuan.npc.${npc.id}.dialogues.stranger.${index}`, line)),
  acquaintance: npc.dialogues.acquaintance.map((line, index) => text(`taoyuan.npc.${npc.id}.dialogues.acquaintance.${index}`, line)),
  friendly: npc.dialogues.friendly.map((line, index) => text(`taoyuan.npc.${npc.id}.dialogues.friendly.${index}`, line)),
  bestFriend: npc.dialogues.bestFriend.map((line, index) => text(`taoyuan.npc.${npc.id}.dialogues.bestFriend.${index}`, line))
})

const expectedDialogueList = (
  npc: LegacyNpcDef,
  key: 'datingDialogues' | 'zhijiDialogues',
  dialogues: readonly string[] | undefined
) => dialogues?.map((line, index) => text(`taoyuan.npc.${npc.id}.${key}.${index}`, line))

const expectedNpcContentDef = (npc: LegacyNpcDef): NpcContentDef => ({
  id: toOfficialContentId(`npc/${npc.id}`),
  name: text(`taoyuan.npc.${npc.id}.name`, npc.name),
  gender: npc.gender,
  role: text(`taoyuan.npc.${npc.id}.role`, npc.role),
  personality: text(`taoyuan.npc.${npc.id}.personality`, npc.personality),
  lovedItems: npc.lovedItems.map(toOfficialContentId),
  likedItems: npc.likedItems.map(toOfficialContentId),
  hatedItems: npc.hatedItems.map(toOfficialContentId),
  dialogues: expectedDialogues(npc),
  ...(npc.marriageable !== undefined ? { marriageable: npc.marriageable } : {}),
  ...(npc.heartEventIds ? { heartEventIds: [...npc.heartEventIds] } : {}),
  ...(npc.datingDialogues ? { datingDialogues: expectedDialogueList(npc, 'datingDialogues', npc.datingDialogues) } : {}),
  ...(npc.zhijiDialogues ? { zhijiDialogues: expectedDialogueList(npc, 'zhijiDialogues', npc.zhijiDialogues) } : {}),
  ...(npc.zhijiHeartEventIds ? { zhijiHeartEventIds: [...npc.zhijiHeartEventIds] } : {}),
  ...(npc.birthday ? { birthday: { ...npc.birthday } } : {})
})

describe('npc registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external NPC JSON before registration', () => {
    const externalNpcs: unknown = validNpcs

    expect(validateUnknown(Type.Array(NpcDefSchema), externalNpcs, { stage: 'test.npcs' }).ok).toBe(true)
  })

  it('rejects invalid NPC shapes and extra properties', () => {
    const invalidNpcs: unknown = [
      { ...validNpcs[0], gender: 'unknown' },
      { ...validNpcs[0], lovedItems: ['bad id'] },
      { ...validNpcs[0], dialogues: { ...validNpcs[0]!.dialogues, bestFriend: [] } },
      { ...validNpcs[0], birthday: { season: 'spring', day: 29 }, extra: true }
    ]

    const result = validateUnknown(Type.Array(NpcDefSchema), invalidNpcs, { stage: 'test.npcs.invalid' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/gender',
        '/1/lovedItems/0',
        '/2/dialogues/bestFriend',
        '/3/birthday/day',
        '/3/extra'
      ]))
    }
  })

  it('registers NPCs with equivalent legacy fields and compatible query IDs', () => {
    expect(getOfficialNpcsAsLegacy().map(clone)).toEqual(LEGACY_NPCS.map(clone))
    expect(getNpcs().map(clone)).toEqual(LEGACY_NPCS.map(clone))

    for (const npc of LEGACY_NPCS) {
      expect(getOfficialNpcDef(npc.id)).toEqual(expectedNpcContentDef(npc))
      expect(getOfficialNpcDef(`npc/${npc.id}`)).toBe(getOfficialNpcDef(npc.id))
      expect(getOfficialNpcDef(toOfficialContentId(`npc/${npc.id}`))).toBe(getOfficialNpcDef(npc.id))
      expect(getOfficialNpcById(npc.id)).toEqual(clone(npc))
      expect(getNpcById(npc.id)).toEqual(clone(npc))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstNpc = getOfficialNpcDef(LEGACY_NPCS[0]!.id)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const npcRegistry = registrySet.get<NpcContentDef>(toOfficialRegistryTypeId('npc'))

    expect(getOfficialNpcDef('missing_npc')).toBeUndefined()
    expect(getOfficialNpcById('missing_npc')).toBeUndefined()
    expect(getNpcById('missing_npc')).toBeUndefined()
    expect(Object.isFrozen(firstNpc)).toBe(true)
    expect(Object.isFrozen(firstNpc?.dialogues)).toBe(true)
    expect(Object.isFrozen(firstNpc?.lovedItems)).toBe(true)
    expect(() => npcRegistry.register(OFFICIAL_PACKAGE_ID, expectedNpcContentDef(LEGACY_NPCS[0]!))).toThrow(RegistryError)
  })

  it('reports missing NPC gift item references during semantic validation', () => {
    const registrySet = new RegistrySet()
    const owner = OFFICIAL_PACKAGE_ID
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()
    const brokenNpc: NpcContentDef = {
      id: toOfficialContentId('npc/broken'),
      name: text('taoyuan.npc.broken.name', 'Broken'),
      gender: 'female',
      role: text('taoyuan.npc.broken.role', 'Broken'),
      personality: text('taoyuan.npc.broken.personality', 'Broken'),
      lovedItems: [toOfficialContentId('missing_loved')],
      likedItems: [toOfficialContentId('missing_liked')],
      hatedItems: [toOfficialContentId('missing_hated')],
      dialogues: {
        stranger: [text('taoyuan.npc.broken.dialogues.stranger.0', 'Hi')],
        acquaintance: [text('taoyuan.npc.broken.dialogues.acquaintance.0', 'Hi')],
        friendly: [text('taoyuan.npc.broken.dialogues.friendly.0', 'Hi')],
        bestFriend: [text('taoyuan.npc.broken.dialogues.bestFriend.0', 'Hi')]
      }
    }

    registrySet.get<NpcContentDef>(toOfficialRegistryTypeId('npc')).register(owner, brokenNpc)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/lovedItems/0' ||
      diagnostic.fieldPath === '/likedItems/0' ||
      diagnostic.fieldPath === '/hatedItems/0'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_loved'),
        fieldPath: '/lovedItems/0'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_liked'),
        fieldPath: '/likedItems/0'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_hated'),
        fieldPath: '/hatedItems/0'
      })
    ]))
  })

  it('keeps NPC store initialization, gifting and old save migration registry-backed', () => {
    const npcStore = useNpcStore()
    const inventoryStore = useInventoryStore()

    expect(npcStore.npcStates.map(state => state.npcId)).toEqual(LEGACY_NPCS.map(npc => npc.id))
    expect(npcStore.talkTo('chen_bo')?.friendshipGain).toBe(60)

    inventoryStore.addItem('tea', 1, 'normal')
    const giftResult = npcStore.giveGift('chen_bo', 'tea', 1, 'normal')
    expect(giftResult).toEqual({ gain: 240, reaction: '非常喜欢' })

    npcStore.deserialize({
      npcStates: [
        {
          npcId: 'chen_bo',
          friendship: 10,
          talkedToday: false,
          giftedToday: false
        }
      ]
    } as unknown as ReturnType<typeof npcStore.serialize>)

    expect(npcStore.getNpcState('chen_bo')?.friendship).toBe(80)
    expect(npcStore.getNpcState('chen_bo')?.giftsThisWeek).toBe(0)
    expect(npcStore.getNpcState('chen_bo')?.triggeredHeartEvents).toEqual([])
    expect(npcStore.npcStates).toHaveLength(LEGACY_NPCS.length)
  })
})
