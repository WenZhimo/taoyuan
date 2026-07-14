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
  AnimalDef,
  CropDef,
  DropTableDef,
  FishDef,
  ForageDef,
  MonsterDef,
  MonsterPoolDef,
  PackageManifest,
  RecipeDef,
  ShopOfferDef,
  TagDef,
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

export const validateRegistrySemantics = (registrySet: RegistrySet): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  const tagRegistry = registrySet.get<TagDef>(REGISTRY_IDS.tag)
  const itemRegistry = registrySet.get(REGISTRY_IDS.item)
  const cropRegistry = registrySet.get<CropDef>(REGISTRY_IDS.crop)
  const treeRegistry = registrySet.get<TreeDef>(REGISTRY_IDS.tree)
  const fishRegistry = registrySet.get<FishDef>(REGISTRY_IDS.fish)
  const forageRegistry = registrySet.get<ForageDef>(REGISTRY_IDS.forage)
  const animalRegistry = registrySet.get<AnimalDef>(REGISTRY_IDS.animal)
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
    if (record.entry.productItemId && !itemRegistry.has(contentId(record.entry.productItemId))) {
      pushMissingReference(diagnostics, {
        packageId: record.owner,
        registryId: REGISTRY_IDS.item,
        contentId: contentId(record.entry.productItemId),
        fieldPath: '/productItemId'
      })
    }
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
