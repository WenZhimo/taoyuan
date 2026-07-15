import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import type { ContentId, PackageId } from './ids'
import { requireContentId, toOfficialRegistryTypeId } from './ids'
import {
  MAIN_MINE_BOSS_FLOORS,
  REQUIRED_OFFICIAL_MONSTER_POOL_IDS,
  getMainMineBossPoolId
} from './monsterPoolIds'
import { getMonsterPoolDefResourceLimitDiagnostics } from './monsterPoolResourceValidation'
import type {
  AchievementDef,
  AnimalBuildingDef,
  AnimalDef,
  AnimalFeedDef,
  AnimalIncubationDef,
  BuildingUpgradeDef,
  CommunityBundleDef,
  CropDef,
  DropTableDef,
  EnchantmentDef,
  EquipmentDef,
  EquipmentSetDef,
  FishDef,
  FishPondFacilityDef,
  ForageDef,
  MuseumCategoryDef,
  MuseumItemDef,
  MuseumMilestoneDef,
  GuildDonationDef,
  GuildGoalDef,
  GuildLevelDef,
  MonsterDef,
  MonsterPoolDef,
  PackageManifest,
  PondBreedDef,
  PondableFishDef,
  ProcessingMachineDef,
  ProcessingRecipeDef,
  RecipeDef,
  SecretNoteDef,
  ShopOfferDef,
  TagDef,
  ToolUpgradeDef,
  TreeDef
} from './schemas'
import type { RegistrySet } from './registry'

const REGISTRY_IDS = {
  tag: toOfficialRegistryTypeId('tag'),
  item: toOfficialRegistryTypeId('item'),
  crop: toOfficialRegistryTypeId('crop'),
  tree: toOfficialRegistryTypeId('tree'),
  fish: toOfficialRegistryTypeId('fish'),
  forage: toOfficialRegistryTypeId('forage'),
  animal: toOfficialRegistryTypeId('animal'),
  animalFeed: toOfficialRegistryTypeId('animal_feed'),
  animalBuilding: toOfficialRegistryTypeId('animal_building'),
  animalIncubation: toOfficialRegistryTypeId('animal_incubation'),
  museumCategory: toOfficialRegistryTypeId('museum_category'),
  museumItem: toOfficialRegistryTypeId('museum_item'),
  museumMilestone: toOfficialRegistryTypeId('museum_milestone'),
  guildGoal: toOfficialRegistryTypeId('guild_goal'),
  guildDonation: toOfficialRegistryTypeId('guild_donation'),
  guildLevel: toOfficialRegistryTypeId('guild_level'),
  achievement: toOfficialRegistryTypeId('achievement'),
  communityBundle: toOfficialRegistryTypeId('community_bundle'),
  secretNote: toOfficialRegistryTypeId('secret_note'),
  processingMachine: toOfficialRegistryTypeId('processing_machine'),
  processingRecipe: toOfficialRegistryTypeId('processing_recipe'),
  toolUpgrade: toOfficialRegistryTypeId('tool_upgrade'),
  enchantment: toOfficialRegistryTypeId('enchantment'),
  equipment: toOfficialRegistryTypeId('equipment'),
  equipmentSet: toOfficialRegistryTypeId('equipment_set'),
  pondableFish: toOfficialRegistryTypeId('pondable_fish'),
  pondBreed: toOfficialRegistryTypeId('pond_breed'),
  fishPondFacility: toOfficialRegistryTypeId('fish_pond_facility'),
  buildingUpgrade: toOfficialRegistryTypeId('building_upgrade'),
  monster: toOfficialRegistryTypeId('monster'),
  monsterPool: toOfficialRegistryTypeId('monster_pool'),
  dropTable: toOfficialRegistryTypeId('drop_table'),
  recipe: toOfficialRegistryTypeId('recipe'),
  shopOffer: toOfficialRegistryTypeId('shop_offer')
}

const pushMissingReference = (
  diagnostics: ModDiagnostic[],
  options: {
    packageId?: PackageId
    registryId: ReturnType<typeof toOfficialRegistryTypeId>
    contentId: ContentId
    fieldPath: string
  }
) => {
  diagnostics.push(
    createDiagnostic('REG-REFERENCE-001', {
      stage: 'registry.semantic',
      packageId: options.packageId,
      registryId: options.registryId,
      contentId: options.contentId,
      fieldPath: options.fieldPath
    })
  )
}

const contentId = (value: string): ContentId => requireContentId(value)

// Legacy achievement displays this stale reward, but inventory addItem() never granted it.
const legacyOfficialMissingItemReferences = new Set([
  'taoyuan-core|taoyuan:achievement/farmer_200|/reward/items/0/itemId|taoyuan:compost'
])

const allowsLegacyMissingItemReference = (
  owner: PackageId,
  entryId: string,
  fieldPath: string,
  referencedItemId: string
) =>
  legacyOfficialMissingItemReferences.has(`${owner}|${entryId}|${fieldPath}|${referencedItemId}`)

export const validateRegistrySemantics = (registrySet: RegistrySet): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  const tagRegistry = registrySet.get<TagDef>(REGISTRY_IDS.tag)
  const itemRegistry = registrySet.get(REGISTRY_IDS.item)
  const cropRegistry = registrySet.get<CropDef>(REGISTRY_IDS.crop)
  const treeRegistry = registrySet.get<TreeDef>(REGISTRY_IDS.tree)
  const fishRegistry = registrySet.get<FishDef>(REGISTRY_IDS.fish)
  const forageRegistry = registrySet.get<ForageDef>(REGISTRY_IDS.forage)
  const animalRegistry = registrySet.get<AnimalDef>(REGISTRY_IDS.animal)
  const animalFeedRegistry = registrySet.get<AnimalFeedDef>(REGISTRY_IDS.animalFeed)
  const animalBuildingRegistry = registrySet.get<AnimalBuildingDef>(REGISTRY_IDS.animalBuilding)
  const animalIncubationRegistry = registrySet.get<AnimalIncubationDef>(REGISTRY_IDS.animalIncubation)
  const museumCategoryRegistry = registrySet.get<MuseumCategoryDef>(REGISTRY_IDS.museumCategory)
  const museumItemRegistry = registrySet.get<MuseumItemDef>(REGISTRY_IDS.museumItem)
  const museumMilestoneRegistry = registrySet.get<MuseumMilestoneDef>(REGISTRY_IDS.museumMilestone)
  const guildGoalRegistry = registrySet.get<GuildGoalDef>(REGISTRY_IDS.guildGoal)
  const guildDonationRegistry = registrySet.get<GuildDonationDef>(REGISTRY_IDS.guildDonation)
  const guildLevelRegistry = registrySet.get<GuildLevelDef>(REGISTRY_IDS.guildLevel)
  const achievementRegistry = registrySet.get<AchievementDef>(REGISTRY_IDS.achievement)
  const communityBundleRegistry = registrySet.get<CommunityBundleDef>(REGISTRY_IDS.communityBundle)
  const secretNoteRegistry = registrySet.get<SecretNoteDef>(REGISTRY_IDS.secretNote)
  const processingMachineRegistry = registrySet.get<ProcessingMachineDef>(REGISTRY_IDS.processingMachine)
  const processingRecipeRegistry = registrySet.get<ProcessingRecipeDef>(REGISTRY_IDS.processingRecipe)
  const toolUpgradeRegistry = registrySet.get<ToolUpgradeDef>(REGISTRY_IDS.toolUpgrade)
  const enchantmentRegistry = registrySet.get<EnchantmentDef>(REGISTRY_IDS.enchantment)
  const equipmentRegistry = registrySet.get<EquipmentDef>(REGISTRY_IDS.equipment)
  const equipmentSetRegistry = registrySet.get<EquipmentSetDef>(REGISTRY_IDS.equipmentSet)
  const pondableFishRegistry = registrySet.get<PondableFishDef>(REGISTRY_IDS.pondableFish)
  const pondBreedRegistry = registrySet.get<PondBreedDef>(REGISTRY_IDS.pondBreed)
  const fishPondFacilityRegistry = registrySet.get<FishPondFacilityDef>(REGISTRY_IDS.fishPondFacility)
  const buildingUpgradeRegistry = registrySet.get<BuildingUpgradeDef>(REGISTRY_IDS.buildingUpgrade)
  const dropTableRegistry = registrySet.get<DropTableDef>(REGISTRY_IDS.dropTable)
  const monsterRegistry = registrySet.get<MonsterDef>(REGISTRY_IDS.monster)
  const monsterPoolRegistry = registrySet.get<MonsterPoolDef>(REGISTRY_IDS.monsterPool)
  const recipeRegistry = registrySet.get<RecipeDef>(REGISTRY_IDS.recipe)
  const shopOfferRegistry = registrySet.get<ShopOfferDef>(REGISTRY_IDS.shopOffer)

  for (const record of recipeRegistry.entries()) {
    record.entry.ingredients.forEach((ingredient, index) => {
      if (ingredient.type === 'item' && !itemRegistry.has(contentId(ingredient.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(ingredient.itemId),
          fieldPath: `/ingredients/${index}/itemId`
        })
      }
      if (ingredient.type === 'tag' && !tagRegistry.has(contentId(ingredient.tagId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.tag,
          contentId: contentId(ingredient.tagId),
          fieldPath: `/ingredients/${index}/tagId`
        })
      }
      if (ingredient.type === 'anyOfTags') {
        ingredient.tagIds.forEach((tagId, tagIndex) => {
          if (!tagRegistry.has(contentId(tagId))) {
            pushMissingReference(diagnostics, {
              packageId: record.owner,
              registryId: REGISTRY_IDS.tag,
              contentId: contentId(tagId),
              fieldPath: `/ingredients/${index}/tagIds/${tagIndex}`
            })
          }
        })
      }
    })
    if (!itemRegistry.has(contentId(record.entry.outputItemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.outputItemId),
        fieldPath: '/outputItemId'
      })
    }
  }

  for (const record of dropTableRegistry.entries()) {
    record.entry.entries.forEach((entry, index) => {
      if (!itemRegistry.has(contentId(entry.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(entry.itemId),
          fieldPath: `/entries/${index}/itemId`
        })
      }
      if (entry.minQuantity !== undefined && entry.maxQuantity !== undefined && entry.minQuantity > entry.maxQuantity) {
        diagnostics.push(
          createDiagnostic('SCHEMA-VALIDATE-001', {
            stage: 'registry.semantic',
            packageId: record.owner,
            registryId: REGISTRY_IDS.dropTable,
            contentId: contentId(record.entry.id),
            fieldPath: `/entries/${index}/maxQuantity`
          })
        )
      }
    })
  }

  for (const record of cropRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.id))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.id),
        fieldPath: '/id'
      })
    }
    if (!itemRegistry.has(contentId(record.entry.seedId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.seedId),
        fieldPath: '/seedId'
      })
    }
  }

  for (const record of monsterRegistry.entries()) {
    if (record.entry.dropTableId && !dropTableRegistry.has(contentId(record.entry.dropTableId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.dropTable,
        contentId: contentId(record.entry.dropTableId),
        fieldPath: '/dropTableId'
      })
    }
  }

  for (const record of treeRegistry.entries()) {
    const references = record.entry.kind === 'fruit'
      ? [
          { itemId: record.entry.seedItemId, fieldPath: '/seedItemId' },
          { itemId: record.entry.fruitItemId, fieldPath: '/fruitItemId' }
        ]
      : [
          { itemId: record.entry.seedItemId, fieldPath: '/seedItemId' },
          { itemId: record.entry.tapProductItemId, fieldPath: '/tapProductItemId' }
        ]
    for (const reference of references) {
      if (!itemRegistry.has(contentId(reference.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(reference.itemId),
          fieldPath: reference.fieldPath
        })
      }
    }
  }

  for (const record of fishRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.id))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.id),
        fieldPath: '/id'
      })
    }
  }

  for (const record of forageRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.itemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.itemId),
        fieldPath: '/itemId'
      })
    }
  }

  for (const record of animalRegistry.entries()) {
    const hasBuilding = animalBuildingRegistry.values().some(building => building.building === record.entry.building)
    if (!hasBuilding) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.animalBuilding,
        contentId: contentId(`taoyuan:animal_building/${record.entry.building}`),
        fieldPath: '/building'
      })
    }
    if (record.entry.productItemId && !itemRegistry.has(contentId(record.entry.productItemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.productItemId),
        fieldPath: '/productItemId'
      })
    }
  }

  for (const record of animalFeedRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.id))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.id),
        fieldPath: '/id'
      })
    }
  }

  for (const record of animalBuildingRegistry.entries()) {
    record.entry.materialCost.forEach((material, index) => {
      if (!itemRegistry.has(contentId(material.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(material.itemId),
          fieldPath: `/materialCost/${index}/itemId`
        })
      }
    })
    record.entry.upgrades.forEach((upgrade, upgradeIndex) => {
      upgrade.materialCost.forEach((material, materialIndex) => {
        if (!itemRegistry.has(contentId(material.itemId))) {
          pushMissingReference(diagnostics, {
            packageId: record.owner,
            registryId: REGISTRY_IDS.item,
            contentId: contentId(material.itemId),
            fieldPath: `/upgrades/${upgradeIndex}/materialCost/${materialIndex}/itemId`
          })
        }
      })
    })
  }

  for (const record of animalIncubationRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.itemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.itemId),
        fieldPath: '/itemId'
      })
    }
    if (!animalRegistry.has(contentId(record.entry.animalId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.animal,
        contentId: contentId(record.entry.animalId),
        fieldPath: '/animalId'
      })
    }
    const hasBuilding = animalBuildingRegistry.values().some(building => building.building === record.entry.building)
    if (!hasBuilding) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.animalBuilding,
        contentId: contentId(`taoyuan:animal_building/${record.entry.building}`),
        fieldPath: '/building'
      })
    }
  }

  for (const record of museumItemRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.itemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.itemId),
        fieldPath: '/itemId'
      })
    }
    const categoryId = contentId(`taoyuan:museum_category/${record.entry.category}`)
    if (!museumCategoryRegistry.has(categoryId)) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.museumCategory,
        contentId: categoryId,
        fieldPath: '/category'
      })
    }
  }

  for (const record of museumMilestoneRegistry.entries()) {
    record.entry.reward.items?.forEach((item, index) => {
      if (!itemRegistry.has(contentId(item.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(item.itemId),
          fieldPath: `/reward/items/${index}/itemId`
        })
      }
    })
  }

  for (const record of guildGoalRegistry.entries()) {
    if (!monsterRegistry.has(contentId(record.entry.monsterId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.monster,
        contentId: contentId(record.entry.monsterId),
        fieldPath: '/monsterId'
      })
    }
    record.entry.reward.items?.forEach((item, index) => {
      const fieldPath = `/reward/items/${index}/itemId`
      if (
        !itemRegistry.has(contentId(item.itemId)) &&
        !allowsLegacyMissingItemReference(record.owner, record.entry.id, fieldPath, item.itemId)
      ) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(item.itemId),
          fieldPath
        })
      }
    })
  }

  for (const record of guildDonationRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.itemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.itemId),
        fieldPath: '/itemId'
      })
    }
  }

  for (const record of guildLevelRegistry.entries()) {
    if (record.entry.expRequired < 0) {
      diagnostics.push(
        createDiagnostic('SCHEMA-VALIDATE-001', {
          stage: 'registry.semantic',
          packageId: record.owner,
          registryId: REGISTRY_IDS.guildLevel,
          contentId: contentId(record.entry.id),
          fieldPath: '/expRequired'
        })
      )
    }
  }

  for (const record of achievementRegistry.entries()) {
    if (record.entry.condition.type === 'itemDiscovered' && !itemRegistry.has(contentId(record.entry.condition.itemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.condition.itemId),
        fieldPath: '/condition/itemId'
      })
    }
    record.entry.reward.items?.forEach((item, index) => {
      const fieldPath = `/reward/items/${index}/itemId`
      if (
        !itemRegistry.has(contentId(item.itemId)) &&
        !allowsLegacyMissingItemReference(record.owner, record.entry.id, fieldPath, item.itemId)
      ) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(item.itemId),
          fieldPath
        })
      }
    })
  }

  for (const record of communityBundleRegistry.entries()) {
    record.entry.requiredItems.forEach((item, index) => {
      if (!itemRegistry.has(contentId(item.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(item.itemId),
          fieldPath: `/requiredItems/${index}/itemId`
        })
      }
    })
    record.entry.reward.items?.forEach((item, index) => {
      if (!itemRegistry.has(contentId(item.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(item.itemId),
          fieldPath: `/reward/items/${index}/itemId`
        })
      }
    })
  }

  for (const record of secretNoteRegistry.entries()) {
    record.entry.reward?.items?.forEach((item, index) => {
      if (!itemRegistry.has(contentId(item.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(item.itemId),
          fieldPath: `/reward/items/${index}/itemId`
        })
      }
    })
  }

  for (const record of processingMachineRegistry.entries()) {
    record.entry.craftCost.forEach((material, index) => {
      if (!itemRegistry.has(contentId(material.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(material.itemId),
          fieldPath: `/craftCost/${index}/itemId`
        })
      }
    })
  }

  for (const record of processingRecipeRegistry.entries()) {
    if (!processingMachineRegistry.has(contentId(record.entry.machineId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.processingMachine,
        contentId: contentId(record.entry.machineId),
        fieldPath: '/machineId'
      })
    }
    if (record.entry.inputItemId !== null && !itemRegistry.has(contentId(record.entry.inputItemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.inputItemId),
        fieldPath: '/inputItemId'
      })
    }
    if (!itemRegistry.has(contentId(record.entry.outputItemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.outputItemId),
        fieldPath: '/outputItemId'
      })
    }
  }

  for (const record of toolUpgradeRegistry.entries()) {
    record.entry.materials.forEach((material, index) => {
      if (!itemRegistry.has(contentId(material.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(material.itemId),
          fieldPath: `/materials/${index}/itemId`
        })
      }
    })
  }

  for (const record of equipmentRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.id))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.id),
        fieldPath: '/id'
      })
    }
    if (record.entry.kind === 'weapon') {
      record.entry.shopMaterials.forEach((material, index) => {
        if (!itemRegistry.has(contentId(material.itemId))) {
          pushMissingReference(diagnostics, {
            packageId: record.owner,
            registryId: REGISTRY_IDS.item,
            contentId: contentId(material.itemId),
            fieldPath: `/shopMaterials/${index}/itemId`
          })
        }
      })
      if (record.entry.fixedEnchantment && !enchantmentRegistry.has(contentId(record.entry.fixedEnchantment))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.enchantment,
          contentId: contentId(record.entry.fixedEnchantment),
          fieldPath: '/fixedEnchantment'
        })
      }
    } else {
      record.entry.recipe?.forEach((material, index) => {
        if (!itemRegistry.has(contentId(material.itemId))) {
          pushMissingReference(diagnostics, {
            packageId: record.owner,
            registryId: REGISTRY_IDS.item,
            contentId: contentId(material.itemId),
            fieldPath: `/recipe/${index}/itemId`
          })
        }
      })
    }
  }

  for (const record of equipmentSetRegistry.entries()) {
    const references = [
      ...(record.entry.pieces.weapon
        ? [{ itemId: record.entry.pieces.weapon, fieldPath: '/pieces/weapon' }]
        : []),
      { itemId: record.entry.pieces.ring, fieldPath: '/pieces/ring' },
      { itemId: record.entry.pieces.hat, fieldPath: '/pieces/hat' },
      { itemId: record.entry.pieces.shoe, fieldPath: '/pieces/shoe' }
    ]
    for (const reference of references) {
      if (!itemRegistry.has(contentId(reference.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(reference.itemId),
          fieldPath: reference.fieldPath
        })
      }
    }
  }

  for (const record of pondableFishRegistry.entries()) {
    if (!fishRegistry.has(contentId(record.entry.fishItemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.fish,
        contentId: contentId(record.entry.fishItemId),
        fieldPath: '/fishItemId'
      })
    }
    if (!itemRegistry.has(contentId(record.entry.productItemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.productItemId),
        fieldPath: '/productItemId'
      })
    }
  }

  for (const record of pondBreedRegistry.entries()) {
    if (!pondableFishRegistry.has(contentId(record.entry.baseFishId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.pondableFish,
        contentId: contentId(record.entry.baseFishId),
        fieldPath: '/baseFishId'
      })
    }
    if (record.entry.parentBreedA && !pondBreedRegistry.has(contentId(record.entry.parentBreedA))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.pondBreed,
        contentId: contentId(record.entry.parentBreedA),
        fieldPath: '/parentBreedA'
      })
    }
    if (record.entry.parentBreedB && !pondBreedRegistry.has(contentId(record.entry.parentBreedB))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.pondBreed,
        contentId: contentId(record.entry.parentBreedB),
        fieldPath: '/parentBreedB'
      })
    }
  }

  for (const record of buildingUpgradeRegistry.entries()) {
    record.entry.materialCost.forEach((material, index) => {
      if (!itemRegistry.has(contentId(material.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(material.itemId),
          fieldPath: `/materialCost/${index}/itemId`
        })
      }
    })
    if (record.entry.kind === 'cave') {
      record.entry.mushroomPool.forEach((entry, index) => {
        if (!itemRegistry.has(contentId(entry.itemId))) {
          pushMissingReference(diagnostics, {
            packageId: record.owner,
            registryId: REGISTRY_IDS.item,
            contentId: contentId(entry.itemId),
            fieldPath: `/mushroomPool/${index}/itemId`
          })
        }
      })
      record.entry.fruitPool.forEach((itemId, index) => {
        if (!itemRegistry.has(contentId(itemId))) {
          pushMissingReference(diagnostics, {
            packageId: record.owner,
            registryId: REGISTRY_IDS.item,
            contentId: contentId(itemId),
            fieldPath: `/fruitPool/${index}`
          })
        }
      })
    }
  }

  for (const record of fishPondFacilityRegistry.entries()) {
    record.entry.buildCost.materials.forEach((material, index) => {
      if (!itemRegistry.has(contentId(material.itemId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.item,
          contentId: contentId(material.itemId),
          fieldPath: `/buildCost/materials/${index}/itemId`
        })
      }
    })
    record.entry.upgrades.forEach((upgrade, upgradeIndex) => {
      upgrade.cost.materials.forEach((material, materialIndex) => {
        if (!itemRegistry.has(contentId(material.itemId))) {
          pushMissingReference(diagnostics, {
            packageId: record.owner,
            registryId: REGISTRY_IDS.item,
            contentId: contentId(material.itemId),
            fieldPath: `/upgrades/${upgradeIndex}/cost/materials/${materialIndex}/itemId`
          })
        }
      })
    })
  }

  for (const poolId of REQUIRED_OFFICIAL_MONSTER_POOL_IDS) {
    if (!monsterPoolRegistry.has(poolId)) {
      diagnostics.push(
        createDiagnostic('REG-REQUIRED-001', {
          stage: 'registry.semantic',
          registryId: REGISTRY_IDS.monsterPool,
          contentId: poolId
        })
      )
    }
  }

  for (const floor of MAIN_MINE_BOSS_FLOORS) {
    const poolId = getMainMineBossPoolId(floor)
    const pool = monsterPoolRegistry.get(poolId)
    if (pool && (pool.entries.length !== 1 || (pool.entries[0]?.weight ?? 1) !== 1)) {
      diagnostics.push(
        createDiagnostic('SCHEMA-VALIDATE-001', {
          stage: 'registry.semantic',
          registryId: REGISTRY_IDS.monsterPool,
          contentId: poolId,
          fieldPath: '/entries'
        })
      )
    }
  }

  for (const record of monsterPoolRegistry.entries()) {
    diagnostics.push(...getMonsterPoolDefResourceLimitDiagnostics(record.entry, {
      stage: 'registry.semantic',
      packageId: record.owner,
      file: record.source?.file
    }))
    record.entry.entries.forEach((entry, index) => {
      if (!monsterRegistry.has(contentId(entry.monsterId))) {
        pushMissingReference(diagnostics, {
          packageId: record.owner,
          registryId: REGISTRY_IDS.monster,
          contentId: contentId(entry.monsterId),
          fieldPath: `/entries/${index}/monsterId`
        })
      }
    })
  }

  for (const record of shopOfferRegistry.entries()) {
    if (!itemRegistry.has(contentId(record.entry.itemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.itemId),
        fieldPath: '/itemId'
      })
    }
  }

  for (const record of tagRegistry.entries()) {
    if (record.entry.behaviorSensitive && record.entry.stackPolicy !== 'separate') {
      diagnostics.push(
        createDiagnostic('SCHEMA-VALIDATE-001', {
          stage: 'registry.semantic',
          packageId: record.owner,
          registryId: REGISTRY_IDS.tag,
          contentId: contentId(record.entry.id),
          fieldPath: '/stackPolicy'
        })
      )
    }
  }

  return diagnostics
}

export const validateManifestDependencies = (
  manifest: PackageManifest,
  availablePackages: ReadonlySet<PackageId>
): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  for (const dependency of manifest.dependencies ?? []) {
    if (!availablePackages.has(dependency.id as PackageId)) {
      diagnostics.push(
        createDiagnostic('PKG-DEPENDENCY-001', {
          stage: 'package.dependencies',
          packageId: manifest.id as PackageId,
          relatedPackageIds: [dependency.id as PackageId]
        })
      )
    }
  }
  return diagnostics
}
