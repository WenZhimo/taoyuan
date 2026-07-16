import { Type } from '@sinclair/typebox'
import { describe, expect, it, vi } from 'vitest'
import {
  MORNING_CHOICE_EVENTS as LEGACY_MORNING_CHOICE_EVENTS,
  MORNING_EASTER_EGGS as LEGACY_MORNING_EASTER_EGGS,
  MORNING_NARRATIONS as LEGACY_MORNING_NARRATIONS
} from '@/data/farmEventDefinitions'
import {
  MORNING_CHOICE_EVENTS,
  MORNING_EASTER_EGGS,
  MORNING_NARRATIONS,
  NARRATIONS_NO_LOSS,
  getMorningChoiceEvents,
  getMorningEasterEggs,
  getMorningNarrations,
  getNoLossMorningNarrations
} from '@/data/farmEvents'
import { processMorningRandomEventEndDay } from '@/domain/endDay/morningEventEndDay'
import {
  getOfficialMorningChoiceEventDefs,
  getOfficialMorningChoiceEventsAsLegacy,
  getOfficialMorningEasterEggEventDefs,
  getOfficialMorningEasterEggsAsLegacy,
  getOfficialMorningEventDef,
  getOfficialMorningEventDefs,
  getOfficialMorningNarrationEventDefs,
  getOfficialMorningNarrationsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { MorningEventDefSchema, type MorningEventDef as MorningEventContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  adaptLegacyMorningChoiceEvent,
  adaptLegacyMorningEasterEgg,
  adaptLegacyMorningNarration,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import validMorningEvents from '../fixtures/mods/minimal-valid-package/data/morning-events.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const text = (key: string, fallback: string) => ({ key, fallback })

describe('morning event registry pilot', () => {
  it('validates external morning event JSON before registration', () => {
    const externalMorningEvents: unknown = validMorningEvents

    expect(validateUnknown(Type.Array(MorningEventDefSchema), externalMorningEvents, {
      stage: 'test.morningEvents'
    }).ok).toBe(true)
  })

  it('rejects invalid morning event shapes and extra properties', () => {
    const narration = validMorningEvents[0]!
    const choice = validMorningEvents[1]!
    const easterEgg = validMorningEvents[2]!

    const invalidMorningEvents: unknown = [
      { ...narration, id: 'bad id' },
      { ...narration, eventId: '' },
      { ...narration, effect: { type: 'gainItem', itemId: 'bad id', qty: 1 } },
      { ...choice, choices: [] },
      { ...choice, choices: [{ label: choice.message, result: choice.message, effect: { type: 'gainMoney' } }] },
      { ...easterEgg, kind: 'unsupported' },
      { ...narration, extra: true }
    ]

    const result = validateUnknown(Type.Array(MorningEventDefSchema), invalidMorningEvents, {
      stage: 'test.morningEvents.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.length).toBeGreaterThan(0)
    }
  })

  it('registers morning events in legacy order with equivalent fields and compatible query IDs', () => {
    expect(getOfficialMorningNarrationEventDefs()).toHaveLength(LEGACY_MORNING_NARRATIONS.length)
    expect(getOfficialMorningChoiceEventDefs()).toHaveLength(LEGACY_MORNING_CHOICE_EVENTS.length)
    expect(getOfficialMorningEasterEggEventDefs()).toHaveLength(LEGACY_MORNING_EASTER_EGGS.length)
    expect(getOfficialMorningEventDefs()).toHaveLength(
      LEGACY_MORNING_NARRATIONS.length +
      LEGACY_MORNING_CHOICE_EVENTS.length +
      LEGACY_MORNING_EASTER_EGGS.length
    )

    expect(getOfficialMorningNarrationsAsLegacy().map(clone)).toEqual(LEGACY_MORNING_NARRATIONS.map(clone))
    expect(getOfficialMorningChoiceEventsAsLegacy().map(clone)).toEqual(LEGACY_MORNING_CHOICE_EVENTS.map(clone))
    expect(getOfficialMorningEasterEggsAsLegacy().map(clone)).toEqual(LEGACY_MORNING_EASTER_EGGS.map(clone))
    expect(MORNING_NARRATIONS.map(clone)).toEqual(LEGACY_MORNING_NARRATIONS.map(clone))
    expect(NARRATIONS_NO_LOSS.map(clone)).toEqual(
      LEGACY_MORNING_NARRATIONS.filter(event => !event.effect || event.effect.type !== 'loseCrop').map(clone)
    )
    expect(MORNING_CHOICE_EVENTS.map(clone)).toEqual(LEGACY_MORNING_CHOICE_EVENTS.map(clone))
    expect(MORNING_EASTER_EGGS.map(clone)).toEqual(LEGACY_MORNING_EASTER_EGGS.map(clone))
    expect(getMorningNarrations().map(clone)).toEqual(LEGACY_MORNING_NARRATIONS.map(clone))
    expect(getNoLossMorningNarrations().map(clone)).toEqual(NARRATIONS_NO_LOSS.map(clone))
    expect(getMorningChoiceEvents().map(clone)).toEqual(LEGACY_MORNING_CHOICE_EVENTS.map(clone))
    expect(getMorningEasterEggs().map(clone)).toEqual(LEGACY_MORNING_EASTER_EGGS.map(clone))

    expect(getOfficialMorningEventDef('narration/0')).toEqual(
      adaptLegacyMorningNarration(LEGACY_MORNING_NARRATIONS[0]!, 0)
    )
    expect(getOfficialMorningEventDef('morning_event/narration/0')).toBe(
      getOfficialMorningEventDef('narration/0')
    )
    expect(getOfficialMorningEventDef(toOfficialContentId('morning_event/narration/0'))).toBe(
      getOfficialMorningEventDef('narration/0')
    )
    expect(getOfficialMorningEventDef('choice/injured_bird')).toEqual(
      adaptLegacyMorningChoiceEvent(LEGACY_MORNING_CHOICE_EVENTS[0]!)
    )
    expect(getOfficialMorningEventDef('easter_egg/0')).toEqual(
      adaptLegacyMorningEasterEgg(LEGACY_MORNING_EASTER_EGGS[0]!, 0)
    )
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstNarration = getOfficialMorningEventDef('narration/0')
    const firstChoice = getOfficialMorningEventDef('choice/injured_bird')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<MorningEventContentDef>(toOfficialRegistryTypeId('morning_event'))

    expect(getOfficialMorningEventDef('missing_morning_event')).toBeUndefined()
    expect(Object.isFrozen(firstNarration)).toBe(true)
    expect(Object.isFrozen(firstNarration?.message)).toBe(true)
    expect(Object.isFrozen(firstChoice)).toBe(true)
    expect(Object.isFrozen(firstChoice && firstChoice.kind === 'choice' ? firstChoice.choices : undefined)).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      adaptLegacyMorningNarration(LEGACY_MORNING_NARRATIONS[0]!, 0)
    )).toThrow(RegistryError)
  })

  it('reports missing morning event item references during semantic validation', () => {
    const registrySet = new RegistrySet()
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()

    const brokenNarration: MorningEventContentDef = {
      id: toOfficialContentId('morning_event/narration/broken'),
      eventId: 'narration/broken',
      kind: 'narration',
      message: text('taoyuan.morning_event.narration.broken.message', 'Broken'),
      effect: { type: 'gainItem', itemId: toOfficialContentId('missing_item'), qty: 1 }
    }
    const brokenChoice: MorningEventContentDef = {
      id: toOfficialContentId('morning_event/choice/broken'),
      eventId: 'choice/broken',
      kind: 'choice',
      message: text('taoyuan.morning_event.choice.broken.message', 'Broken choice'),
      choices: [
        {
          label: text('taoyuan.morning_event.choice.broken.choices.0.label', 'Take'),
          result: text('taoyuan.morning_event.choice.broken.choices.0.result', 'Broken reward'),
          effect: { type: 'gainItem', itemId: toOfficialContentId('missing_choice_item'), qty: 1 }
        }
      ]
    }

    const registry = registrySet.get<MorningEventContentDef>(toOfficialRegistryTypeId('morning_event'))
    registry.register(OFFICIAL_PACKAGE_ID, brokenNarration)
    registry.register(OFFICIAL_PACKAGE_ID, brokenChoice)

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.fieldPath === '/effect/itemId' ||
        diagnostic.fieldPath === '/choices/0/effect/itemId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_item'),
        fieldPath: '/effect/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_choice_item'),
        fieldPath: '/choices/0/effect/itemId'
      })
    ]))
  })

  it('keeps morning random event processing registry-backed without changing runtime behavior', () => {
    const shownChoiceEvents: string[] = []
    const choiceRandom = vi.fn().mockReturnValueOnce(0.005).mockReturnValueOnce(0)

    const choiceResult = processMorningRandomEventEndDay({
      narrations: getMorningNarrations(),
      noLossNarrations: getNoLossMorningNarrations(),
      choiceEvents: getMorningChoiceEvents(),
      easterEggs: getMorningEasterEggs(),
      getPlots: () => [],
      getNpcStates: () => [],
      getCropName: cropId => cropId,
      addItem: () => {},
      earnMoney: () => {},
      showChoiceEvent: event => shownChoiceEvents.push(event.id),
      addLog: () => {},
      random: choiceRandom
    })

    expect(choiceResult).toEqual({ eventType: 'choice', effectApplied: false })
    expect(choiceRandom).toHaveBeenCalledTimes(2)
    expect(shownChoiceEvents).toEqual(['injured_bird'])

    const logs: string[] = []
    const addedItems: string[] = []
    const easterRandom = vi.fn().mockReturnValueOnce(0.001).mockReturnValueOnce(0)

    const easterResult = processMorningRandomEventEndDay({
      narrations: getMorningNarrations(),
      noLossNarrations: getNoLossMorningNarrations(),
      choiceEvents: getMorningChoiceEvents(),
      easterEggs: getMorningEasterEggs(),
      getPlots: () => [],
      getNpcStates: () => [],
      getCropName: cropId => cropId,
      addItem: (itemId, quantity) => addedItems.push(`${itemId}:${quantity}`),
      earnMoney: () => {},
      showChoiceEvent: () => {},
      addLog: message => logs.push(message),
      random: easterRandom
    })

    expect(easterResult).toEqual({ eventType: 'easter', effectApplied: true })
    expect(easterRandom).toHaveBeenCalledTimes(2)
    expect(logs).toEqual([LEGACY_MORNING_EASTER_EGGS[0]!.message])
    expect(addedItems).toEqual(['ancient_coin:1'])
  })
})
