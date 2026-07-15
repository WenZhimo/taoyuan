import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  HEART_EVENTS as LEGACY_HEART_EVENTS,
  WEDDING_EVENT
} from '@/data/heartEventDefinitions'
import {
  getHeartEventById,
  getHeartEventsForNpc
} from '@/data/heartEvents'
import { HIDDEN_NPC_HEART_EVENTS as LEGACY_HIDDEN_NPC_HEART_EVENTS } from '@/data/hiddenNpcHeartEventDefinitions'
import {
  getHiddenNpcHeartEventById,
  getHiddenNpcHeartEvents
} from '@/data/hiddenNpcHeartEvents'
import { NPCS as LEGACY_NPCS } from '@/data/npcDefinitions'
import { HIDDEN_NPCS as LEGACY_HIDDEN_NPCS } from '@/data/hiddenNpcDefinitions'
import {
  getOfficialHeartEventById,
  getOfficialHeartEventDef,
  getOfficialHeartEventDefs,
  getOfficialHeartEventsForNpc,
  getOfficialHiddenNpcHeartEventById,
  getOfficialHiddenNpcHeartEvents
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  HeartEventDefSchema,
  type HeartEventDef as HeartEventContentDef,
  type HiddenNpcDef as HiddenNpcContentDef,
  type NpcDef as NpcContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  adaptLegacyHeartEvent,
  adaptLegacyHiddenNpc,
  adaptLegacyNpc,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useHiddenNpcStore } from '@/stores/useHiddenNpcStore'
import { useNpcStore } from '@/stores/useNpcStore'
import type { HeartEventDef as LegacyHeartEventDef } from '@/types'
import validHeartEvents from '../fixtures/mods/minimal-valid-package/data/heart-events.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const text = (key: string, fallback: string) => ({ key, fallback })

const expectedHeartEventContentDef = (
  event: LegacyHeartEventDef,
  ownerType: 'npc' | 'hidden_npc'
): HeartEventContentDef => adaptLegacyHeartEvent(event, ownerType)

describe('heart event registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external heart event JSON before registration', () => {
    const externalHeartEvents: unknown = validHeartEvents

    expect(validateUnknown(Type.Array(HeartEventDefSchema), externalHeartEvents, { stage: 'test.heartEvents' }).ok)
      .toBe(true)
  })

  it('rejects invalid heart event shapes and extra properties', () => {
    const invalidHeartEvents: unknown = [
      { ...validHeartEvents[0], id: 'bad id' },
      { ...validHeartEvents[0], npcId: 'bad id' },
      { ...validHeartEvents[0], scenes: [] },
      {
        ...validHeartEvents[0],
        scenes: [
          {
            text: text('example_mod.heart_event.invalid.scenes.0.text', 'Invalid'),
            choices: []
          }
        ],
        extra: true
      }
    ]

    const result = validateUnknown(Type.Array(HeartEventDefSchema), invalidHeartEvents, {
      stage: 'test.heartEvents.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/npcId',
        '/2/scenes',
        '/3/scenes/0/choices',
        '/3/extra'
      ]))
    }
  })

  it('registers ordinary heart events with equivalent legacy fields and compatible query IDs', () => {
    const ordinaryEvents = getOfficialHeartEventDefs().filter(event => event.npcId.startsWith('taoyuan:npc/'))

    expect(ordinaryEvents).toHaveLength(LEGACY_HEART_EVENTS.length)
    expect(getOfficialHeartEventDef(WEDDING_EVENT.id)).toBeUndefined()
    expect(getHeartEventById(WEDDING_EVENT.id)).toEqual(clone(WEDDING_EVENT))

    for (const event of LEGACY_HEART_EVENTS) {
      const expected = expectedHeartEventContentDef(event, 'npc')
      expect(getOfficialHeartEventDef(event.id)).toEqual(expected)
      expect(getOfficialHeartEventDef(`heart_event/${event.id}`)).toBe(getOfficialHeartEventDef(event.id))
      expect(getOfficialHeartEventDef(toOfficialContentId(`heart_event/${event.id}`))).toBe(getOfficialHeartEventDef(event.id))
      expect(getOfficialHeartEventById(event.id)).toEqual(clone(event))
      expect(getHeartEventById(event.id)).toEqual(clone(event))
    }

    const npcId = LEGACY_HEART_EVENTS[0]!.npcId
    const expectedNpcEvents = LEGACY_HEART_EVENTS.filter(event => event.npcId === npcId).map(clone)
    expect(getOfficialHeartEventsForNpc(npcId).map(clone)).toEqual(expectedNpcEvents)
    expect(getOfficialHeartEventsForNpc(`npc/${npcId}`).map(clone)).toEqual(expectedNpcEvents)
    expect(getOfficialHeartEventsForNpc(toOfficialContentId(`npc/${npcId}`)).map(clone)).toEqual(expectedNpcEvents)
    expect(getHeartEventsForNpc(npcId).map(clone)).toEqual(expectedNpcEvents)
  })

  it('registers hidden NPC heart events with equivalent legacy fields and compatible query IDs', () => {
    const hiddenEvents = getOfficialHeartEventDefs().filter(event => event.npcId.startsWith('taoyuan:hidden_npc/'))

    expect(hiddenEvents).toHaveLength(LEGACY_HIDDEN_NPC_HEART_EVENTS.length)

    for (const event of LEGACY_HIDDEN_NPC_HEART_EVENTS) {
      const expected = expectedHeartEventContentDef(event, 'hidden_npc')
      expect(getOfficialHeartEventDef(event.id)).toEqual(expected)
      expect(getOfficialHiddenNpcHeartEventById(event.id)).toEqual(clone(event))
      expect(getHiddenNpcHeartEventById(event.id)).toEqual(clone(event))
      expect(getOfficialHeartEventById(event.id)).toBeUndefined()
    }

    const npcId = LEGACY_HIDDEN_NPC_HEART_EVENTS[0]!.npcId
    const expectedNpcEvents = LEGACY_HIDDEN_NPC_HEART_EVENTS.filter(event => event.npcId === npcId).map(clone)
    expect(getOfficialHiddenNpcHeartEvents(npcId).map(clone)).toEqual(expectedNpcEvents)
    expect(getOfficialHiddenNpcHeartEvents(`hidden_npc/${npcId}`).map(clone)).toEqual(expectedNpcEvents)
    expect(getOfficialHiddenNpcHeartEvents(toOfficialContentId(`hidden_npc/${npcId}`)).map(clone)).toEqual(expectedNpcEvents)
    expect(getHiddenNpcHeartEvents(npcId).map(clone)).toEqual(expectedNpcEvents)
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstEvent = getOfficialHeartEventDef(LEGACY_HEART_EVENTS[0]!.id)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const heartEventRegistry = registrySet.get<HeartEventContentDef>(toOfficialRegistryTypeId('heart_event'))

    expect(getOfficialHeartEventDef('missing_heart_event')).toBeUndefined()
    expect(getOfficialHeartEventById('missing_heart_event')).toBeUndefined()
    expect(getOfficialHiddenNpcHeartEventById('missing_heart_event')).toBeUndefined()
    expect(Object.isFrozen(firstEvent)).toBe(true)
    expect(Object.isFrozen(firstEvent?.title)).toBe(true)
    expect(Object.isFrozen(firstEvent?.scenes)).toBe(true)
    expect(Object.isFrozen(firstEvent?.scenes[0])).toBe(true)
    expect(() => heartEventRegistry.register(
      OFFICIAL_PACKAGE_ID,
      expectedHeartEventContentDef(LEGACY_HEART_EVENTS[0]!, 'npc')
    )).toThrow(RegistryError)
  })

  it('reports missing heart event owner and NPC declaration references during semantic validation', () => {
    const registrySet = new RegistrySet()
    const owner = OFFICIAL_PACKAGE_ID
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()

    const brokenNpc: NpcContentDef = {
      ...adaptLegacyNpc(LEGACY_NPCS[0]!),
      id: toOfficialContentId('npc/broken_heart_refs'),
      heartEventIds: [toOfficialContentId('heart_event/missing_heart')],
      zhijiHeartEventIds: [toOfficialContentId('heart_event/missing_zhiji_heart')]
    }
    const brokenHiddenNpc: HiddenNpcContentDef = {
      ...adaptLegacyHiddenNpc(LEGACY_HIDDEN_NPCS[0]!),
      id: toOfficialContentId('hidden_npc/broken_hidden_heart_refs'),
      heartEventIds: [toOfficialContentId('heart_event/missing_hidden_heart')]
    }
    const brokenNpcEvent: HeartEventContentDef = {
      ...expectedHeartEventContentDef(LEGACY_HEART_EVENTS[0]!, 'npc'),
      id: toOfficialContentId('heart_event/broken_npc_owner'),
      npcId: toOfficialContentId('npc/missing_owner')
    }
    const brokenHiddenNpcEvent: HeartEventContentDef = {
      ...expectedHeartEventContentDef(LEGACY_HIDDEN_NPC_HEART_EVENTS[0]!, 'hidden_npc'),
      id: toOfficialContentId('heart_event/broken_hidden_owner'),
      npcId: toOfficialContentId('hidden_npc/missing_hidden_owner')
    }

    registrySet.get<NpcContentDef>(toOfficialRegistryTypeId('npc')).register(owner, brokenNpc)
    registrySet.get<HiddenNpcContentDef>(toOfficialRegistryTypeId('hidden_npc')).register(owner, brokenHiddenNpc)
    registrySet.get<HeartEventContentDef>(toOfficialRegistryTypeId('heart_event')).register(owner, brokenNpcEvent)
    registrySet.get<HeartEventContentDef>(toOfficialRegistryTypeId('heart_event')).register(owner, brokenHiddenNpcEvent)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/heartEventIds/0' ||
      diagnostic.fieldPath === '/zhijiHeartEventIds/0' ||
      diagnostic.fieldPath === '/npcId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('heart_event'),
        contentId: toOfficialContentId('heart_event/missing_heart'),
        fieldPath: '/heartEventIds/0'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('heart_event'),
        contentId: toOfficialContentId('heart_event/missing_zhiji_heart'),
        fieldPath: '/zhijiHeartEventIds/0'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('heart_event'),
        contentId: toOfficialContentId('heart_event/missing_hidden_heart'),
        fieldPath: '/heartEventIds/0'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('npc'),
        contentId: toOfficialContentId('npc/missing_owner'),
        fieldPath: '/npcId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('hidden_npc'),
        contentId: toOfficialContentId('hidden_npc/missing_hidden_owner'),
        fieldPath: '/npcId'
      })
    ]))
  })

  it('keeps ordinary and hidden heart event store triggers on legacy local IDs', () => {
    const npcStore = useNpcStore()
    const hiddenNpcStore = useHiddenNpcStore()
    const firstNpcEvent = LEGACY_HEART_EVENTS[0]!
    const firstHiddenEvent = LEGACY_HIDDEN_NPC_HEART_EVENTS[0]!

    const npcState = npcStore.getNpcState(firstNpcEvent.npcId)!
    npcState.friendship = firstNpcEvent.requiredFriendship
    expect(npcStore.checkHeartEvent(firstNpcEvent.npcId)).toEqual(clone(firstNpcEvent))
    npcStore.markHeartEventTriggered(firstNpcEvent.npcId, firstNpcEvent.id)
    expect(npcState.triggeredHeartEvents).toEqual([firstNpcEvent.id])

    const hiddenState = hiddenNpcStore.getHiddenNpcState(firstHiddenEvent.npcId)!
    hiddenState.discoveryPhase = 'revealed'
    hiddenState.affinity = firstHiddenEvent.requiredFriendship
    expect(hiddenNpcStore.checkHeartEvent(firstHiddenEvent.npcId)).toEqual(clone(firstHiddenEvent))
    hiddenNpcStore.markHeartEventTriggered(firstHiddenEvent.npcId, firstHiddenEvent.id)
    expect(hiddenState.triggeredHeartEvents).toEqual([firstHiddenEvent.id])
  })
})
