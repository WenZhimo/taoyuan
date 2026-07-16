import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import {
  SEASON_EVENTS as LEGACY_SEASON_EVENTS,
  type SeasonEventDef as LegacySeasonEventDef
} from '@/data/seasonEventDefinitions'
import { SEASON_EVENTS, getTodayEvent } from '@/data/events'
import {
  processSeasonEventEffectsEndDay,
  processSeasonEventEndDay
} from '@/domain/endDay/eventsEndDay'
import {
  getOfficialSeasonEventById,
  getOfficialSeasonEventDef,
  getOfficialSeasonEventDefs,
  getOfficialSeasonEventsAsLegacy,
  getOfficialTodaySeasonEvent
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { SeasonEventDefSchema, type SeasonEventDef as SeasonEventContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  adaptLegacySeasonEvent,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import validSeasonEvents from '../fixtures/mods/minimal-valid-package/data/season-events.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const text = (key: string, fallback: string) => ({ key, fallback })

const expectedSeasonEventContentDef = (event: LegacySeasonEventDef): SeasonEventContentDef =>
  adaptLegacySeasonEvent(event)

describe('season event registry pilot', () => {
  it('validates external season event JSON before registration', () => {
    const externalSeasonEvents: unknown = validSeasonEvents

    expect(validateUnknown(Type.Array(SeasonEventDefSchema), externalSeasonEvents, {
      stage: 'test.seasonEvents'
    }).ok).toBe(true)
  })

  it('rejects invalid season event shapes and extra properties', () => {
    const base = validSeasonEvents[0]!
    const invalidSeasonEvents: unknown = [
      { ...base, id: 'bad id' },
      { ...base, eventId: '' },
      { ...base, season: 'monsoon' },
      { ...base, day: 29 },
      { ...base, effects: { itemReward: [{ itemId: 'bad id', quantity: 1 }] } },
      { ...base, narrative: [] },
      { ...base, festivalType: 'unsupported_festival' },
      { ...base, extra: true }
    ]

    const result = validateUnknown(Type.Array(SeasonEventDefSchema), invalidSeasonEvents, {
      stage: 'test.seasonEvents.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/eventId',
        '/2/season',
        '/3/day',
        '/4/effects/itemReward/0/itemId',
        '/5/narrative',
        '/6/festivalType',
        '/7/extra'
      ]))
    }
  })

  it('registers season events in legacy order with equivalent fields and compatible query IDs', () => {
    expect(getOfficialSeasonEventDefs()).toHaveLength(LEGACY_SEASON_EVENTS.length)
    expect(getOfficialSeasonEventDefs().map(event => event.id)).toEqual(
      LEGACY_SEASON_EVENTS.map(event => toOfficialContentId(`season_event/${event.id}`))
    )
    expect(getOfficialSeasonEventsAsLegacy().map(clone)).toEqual(LEGACY_SEASON_EVENTS.map(clone))
    expect(SEASON_EVENTS.map(clone)).toEqual(LEGACY_SEASON_EVENTS.map(clone))

    for (const event of LEGACY_SEASON_EVENTS) {
      expect(getOfficialSeasonEventDef(event.id)).toEqual(expectedSeasonEventContentDef(event))
      expect(getOfficialSeasonEventDef(`season_event/${event.id}`)).toBe(getOfficialSeasonEventDef(event.id))
      expect(getOfficialSeasonEventDef(toOfficialContentId(`season_event/${event.id}`))).toBe(
        getOfficialSeasonEventDef(event.id)
      )
      expect(getOfficialSeasonEventById(event.id)).toEqual(clone(event))
    }

    expect(getOfficialTodaySeasonEvent('summer', 15)).toEqual(
      clone(LEGACY_SEASON_EVENTS.find(event => event.id === 'summer_lantern')!)
    )
    expect(getTodayEvent('summer', 15)).toEqual(
      clone(LEGACY_SEASON_EVENTS.find(event => event.id === 'summer_lantern')!)
    )
    expect(getTodayEvent('spring', 2)).toBeUndefined()
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstEvent = getOfficialSeasonEventDef(LEGACY_SEASON_EVENTS[0]!.id)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<SeasonEventContentDef>(toOfficialRegistryTypeId('season_event'))

    expect(getOfficialSeasonEventDef('missing_season_event')).toBeUndefined()
    expect(getOfficialSeasonEventById('missing_season_event')).toBeUndefined()
    expect(Object.isFrozen(firstEvent)).toBe(true)
    expect(Object.isFrozen(firstEvent?.name)).toBe(true)
    expect(Object.isFrozen(firstEvent?.effects)).toBe(true)
    expect(Object.isFrozen(firstEvent?.narrative)).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      expectedSeasonEventContentDef(LEGACY_SEASON_EVENTS[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing season event reward item references during semantic validation', () => {
    const registrySet = new RegistrySet()
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()

    const brokenEvent: SeasonEventContentDef = {
      id: toOfficialContentId('season_event/broken_reward'),
      eventId: 'broken_reward',
      name: text('taoyuan.season_event.broken_reward.name', 'Broken Reward'),
      season: 'spring',
      day: 1,
      description: text('taoyuan.season_event.broken_reward.description', 'Broken Reward'),
      effects: {
        itemReward: [{ itemId: toOfficialContentId('missing_item'), quantity: 1 }]
      },
      narrative: [text('taoyuan.season_event.broken_reward.narrative.0', 'Broken Reward')]
    }

    registrySet
      .get<SeasonEventContentDef>(toOfficialRegistryTypeId('season_event'))
      .register(OFFICIAL_PACKAGE_ID, brokenEvent)

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.fieldPath === '/effects/itemReward/0/itemId'
    )

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_item'),
        fieldPath: '/effects/itemReward/0/itemId'
      })
    ])
  })

  it('keeps end-day season event effects and festival display registry-backed', () => {
    const logs: string[] = []
    const floats: string[] = []
    const addedItems: string[] = []
    const festivalCalls: string[] = []
    const bgmCalls: string[] = []
    const shownEvents: { id: string; narrative: string[] }[] = []
    const npcStates = [{ friendship: 0 }, { friendship: 2 }]
    const event = getTodayEvent('summer', 15)!

    const processed = processSeasonEventEndDay({
      event,
      year: 2,
      season: 'summer',
      applyEventEffects: seasonEvent =>
        processSeasonEventEffectsEndDay({
          event: seasonEvent,
          getNpcStates: () => npcStates,
          earnMoney: amount => floats.push(`money:${amount}`),
          restoreStamina: amount => floats.push(`stamina:${amount}`),
          addItem: (itemId, quantity) => addedItems.push(`${itemId}:${quantity}`),
          unlockRecipe: recipeId => {
            logs.push(`recipe:${recipeId}`)
            return true
          },
          addLog: message => logs.push(message),
          showFloat: (message, type) => floats.push(`${type}:${message}`)
        }),
      showFestival: festivalType => festivalCalls.push(festivalType),
      startFestivalBgm: season => bgmCalls.push(season),
      showEvent: (seasonEvent, narrative) => shownEvents.push({ id: seasonEvent.id, narrative })
    })

    expect(processed).toBe(true)
    expect(npcStates.map(state => state.friendship)).toEqual([5, 7])
    expect(logs).toEqual(expect.arrayContaining([
      '【荷灯节·钓鱼大赛】河边放灯祈福，还有激动人心的钓鱼大赛！',
      'recipe:lotus_lantern_cake',
      '节日活动解锁了新食谱！'
    ]))
    expect(addedItems).toEqual([])
    expect(festivalCalls).toEqual(['fishing_contest'])
    expect(bgmCalls).toEqual([])
    expect(shownEvents).toEqual([
      {
        id: 'summer_lantern',
        narrative: event.narrative
      }
    ])
  })
})
