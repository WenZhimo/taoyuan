import { describe, expect, it } from 'vitest'
import {
  createSerializableRegistrySnapshot,
  restoreRegistrySetFromSnapshot,
  type RegistryEntry,
  type SerializableRegistrySnapshot
} from '@/domain/mods/registry'
import { requireContentId } from '@/domain/mods/ids'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_REGISTRY_DEFINITIONS, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import officialContentSnapshot from '../fixtures/mods/official-content-snapshot.json'

describe('phase 6 official registry snapshot acceptance evidence', () => {
  it('keeps hashes and ID lookups equal while recording the restore-order gap', () => {
    const built = buildOfficialRegistrySetFromStaticData()
    built.freezeEntries()

    expect(validateRegistrySemantics(built)).toEqual([])

    const builtSnapshot = createSerializableRegistrySnapshot(built)
    expect(builtSnapshot).toEqual(officialContentSnapshot)

    const restored = restoreRegistrySetFromSnapshot(
      OFFICIAL_REGISTRY_DEFINITIONS,
      officialContentSnapshot as unknown as SerializableRegistrySnapshot
    )
    const restoredSnapshot = createSerializableRegistrySnapshot(restored)

    expect(restored.currentPhase).toBe('frozen')
    expect(validateRegistrySemantics(restored)).toEqual([])
    expect(restoredSnapshot).toEqual(builtSnapshot)

    const registrationOrderMismatches: string[] = []
    for (const registryId of built.registryIds()) {
      const builtRecords = built.get<RegistryEntry>(registryId).entries()
      const restoredRegistry = restored.get<RegistryEntry>(registryId)
      const restoredRecords = restoredRegistry.entries()

      if (restoredRecords.some((record, index) => record.entry.id !== builtRecords[index]?.entry.id)) {
        registrationOrderMismatches.push(registryId)
      }
      for (const record of builtRecords) {
        expect(restoredRegistry.require(requireContentId(record.entry.id))).toEqual(record.entry)
      }
    }

    expect(registrationOrderMismatches).toEqual([
      'taoyuan:achievement',
      'taoyuan:animal',
      'taoyuan:animal_building',
      'taoyuan:animal_feed',
      'taoyuan:animal_incubation',
      'taoyuan:bomb',
      'taoyuan:breeding_hybrid',
      'taoyuan:building_upgrade',
      'taoyuan:community_bundle',
      'taoyuan:crop',
      'taoyuan:drop_table',
      'taoyuan:enchantment',
      'taoyuan:equipment',
      'taoyuan:equipment_set',
      'taoyuan:farm_map',
      'taoyuan:fish',
      'taoyuan:forage',
      'taoyuan:guild_donation',
      'taoyuan:guild_goal',
      'taoyuan:guild_level',
      'taoyuan:hanhai_casino_wager',
      'taoyuan:hanhai_trade_exchange',
      'taoyuan:hanhai_treasure_reward',
      'taoyuan:heart_event',
      'taoyuan:hidden_npc',
      'taoyuan:item',
      'taoyuan:market_category',
      'taoyuan:monster',
      'taoyuan:monster_pool',
      'taoyuan:morning_event',
      'taoyuan:museum_category',
      'taoyuan:museum_item',
      'taoyuan:museum_milestone',
      'taoyuan:npc',
      'taoyuan:pond_breed',
      'taoyuan:pondable_fish',
      'taoyuan:processing_machine',
      'taoyuan:processing_recipe',
      'taoyuan:quest_template',
      'taoyuan:recipe',
      'taoyuan:season_event',
      'taoyuan:secret_note',
      'taoyuan:shop',
      'taoyuan:shop_offer',
      'taoyuan:story_quest',
      'taoyuan:tag',
      'taoyuan:tool_upgrade',
      'taoyuan:tree',
      'taoyuan:tutorial',
      'taoyuan:wallet_item'
    ])
  })
})
