import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import { MORNING_TIPS as LEGACY_MORNING_TIPS } from '@/data/tutorials'
import { processMorningTutorialEndDay } from '@/domain/endDay/eventsEndDay'
import {
  getOfficialMorningTipsAsLegacy,
  getOfficialTutorialById,
  getOfficialTutorialDef,
  getOfficialTutorialDefs
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { TutorialDefSchema, type TutorialDef as TutorialContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { MorningTipDef as LegacyMorningTipDef } from '@/data/tutorials'
import validTutorials from '../fixtures/mods/minimal-valid-package/data/tutorials.json'

const expectedTutorialContentDef = (tip: LegacyMorningTipDef): TutorialContentDef => ({
  id: toOfficialContentId(`tutorial/${tip.id}`),
  tipId: tip.id,
  priority: tip.priority,
  conditionKey: tip.conditionKey as TutorialContentDef['conditionKey'],
  message: { key: `taoyuan.tutorial.${tip.id}.message`, fallback: tip.message }
})

describe('tutorial registry pilot', () => {
  it('validates external tutorial JSON before registration', () => {
    const externalTutorials: unknown = validTutorials
    const result = validateUnknown(Type.Array(TutorialDefSchema), externalTutorials, {
      stage: 'test.tutorials'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid tutorial shapes, condition keys and extra properties', () => {
    const base = validTutorials[0]!
    const invalidTutorials: unknown = [
      { ...base, tipId: '' },
      { ...base, priority: 0 },
      { ...base, conditionKey: 'customScript' },
      { ...base, message: { ...base.message, key: '' } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(TutorialDefSchema), invalidTutorials, {
      stage: 'test.tutorials.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/tipId',
        '/1/priority',
        '/2/conditionKey',
        '/3/message/key',
        '/4/extra'
      ]))
    }
  })

  it('registers all morning tips in legacy order with equivalent fields and IDs', () => {
    expect(getOfficialTutorialDefs()).toHaveLength(LEGACY_MORNING_TIPS.length)
    expect(getOfficialTutorialDefs().map(tip => tip.id)).toEqual(
      LEGACY_MORNING_TIPS.map(tip => toOfficialContentId(`tutorial/${tip.id}`))
    )
    expect(getOfficialMorningTipsAsLegacy()).toEqual(LEGACY_MORNING_TIPS)

    for (const tip of LEGACY_MORNING_TIPS) {
      expect(getOfficialTutorialDef(tip.id)).toEqual(expectedTutorialContentDef(tip))
      expect(getOfficialTutorialDef(`tutorial/${tip.id}`)).toBe(getOfficialTutorialDef(tip.id))
      expect(getOfficialTutorialDef(toOfficialContentId(`tutorial/${tip.id}`))).toBe(getOfficialTutorialDef(tip.id))
      expect(getOfficialTutorialById(tip.id)).toEqual(tip)
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstTip = getOfficialTutorialDef('tip_welcome')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<TutorialContentDef>(toOfficialRegistryTypeId('tutorial'))

    expect(getOfficialTutorialDef('missing_tutorial')).toBeUndefined()
    expect(getOfficialTutorialById('missing_tutorial')).toBeUndefined()
    expect(Object.isFrozen(firstTip)).toBe(true)
    expect(Object.isFrozen(firstTip?.message)).toBe(true)
    expect(() => registry.register(OFFICIAL_PACKAGE_ID, expectedTutorialContentDef(LEGACY_MORNING_TIPS[0]!))).toThrow(
      RegistryError
    )
  })

  it('has no semantic references beyond validated tutorial condition keys', () => {
    const diagnostics = validateRegistrySemantics(buildOfficialRegistrySetFromStaticData()).filter(
      diagnostic => diagnostic.registryId === toOfficialRegistryTypeId('tutorial')
    )

    expect(diagnostics).toEqual([])
  })

  it('keeps morning tutorial selection and temporary flags registry-backed', () => {
    const order: string[] = []
    const flags: Record<string, boolean> = {
      seenRain: false,
      justChangedSeason: true,
      staminaWasLow: true
    }

    const result = processMorningTutorialEndDay({
      enabled: true,
      year: 1,
      day: 20,
      season: 'summer',
      isRainy: true,
      tips: getOfficialMorningTipsAsLegacy(),
      getPlots: () => [],
      getSprinklerCount: () => 0,
      getAnimalCount: () => 0,
      totalCropsHarvested: 0,
      totalMoneyEarned: 0,
      totalFishCaught: 1,
      highestMineFloor: 1,
      totalRecipesCooked: 1,
      areAllNpcFriendshipsZero: () => false,
      isTipShown: tipId => {
        order.push(`shown:${tipId}`)
        return tipId !== 'tip_rain'
      },
      markTipShown: tipId => order.push(`mark:${tipId}`),
      hasPanelVisited: () => true,
      getFlag: key => {
        order.push(`get:${key}`)
        return flags[key] ?? false
      },
      setFlag: (key, value = true) => {
        order.push(`set:${key}:${value}`)
        flags[key] = value
      },
      addLog: message => order.push(`log:${message}`)
    })

    expect(result).toEqual({ shownTipId: 'tip_rain', temporaryFlagsCleared: true })
    expect(order).toEqual(expect.arrayContaining([
      `log:${LEGACY_MORNING_TIPS.find(tip => tip.id === 'tip_rain')!.message}`,
      'mark:tip_rain',
      'set:seenRain:true',
      'set:justChangedSeason:false',
      'set:staminaWasLow:false'
    ]))
  })
})
