import { Type, type Static, type TSchema } from '@sinclair/typebox'
import { NAMESPACED_ID_PATTERN, PACKAGE_ID_PATTERN } from './ids'
import { MONSTER_POOL_RESOURCE_LIMITS } from './resourceLimits'

export const ContentIdSchema = Type.String({
  $id: 'taoyuan.schema.ContentId',
  pattern: NAMESPACED_ID_PATTERN
})

export const RegistryTypeIdSchema = Type.String({
  $id: 'taoyuan.schema.RegistryTypeId',
  pattern: NAMESPACED_ID_PATTERN
})

export const PackageIdSchema = Type.String({
  $id: 'taoyuan.schema.PackageId',
  pattern: PACKAGE_ID_PATTERN
})

export const SemVerSchema = Type.String({
  pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?$'
})

export const LocalizedTextRefSchema = Type.Object(
  {
    key: Type.String({ minLength: 1 }),
    fallback: Type.String({ minLength: 1 })
  },
  { $id: 'taoyuan.schema.LocalizedTextRef', additionalProperties: false }
)

export const AuthorMetadataSchema = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
    role: Type.Optional(Type.String({ minLength: 1 })),
    url: Type.Optional(Type.String({ minLength: 1 }))
  },
  { $id: 'taoyuan.schema.AuthorMetadata', additionalProperties: false }
)

export const PackageDependencySchema = Type.Object(
  {
    id: PackageIdSchema,
    version: Type.String({ minLength: 1 })
  },
  { additionalProperties: false }
)

export const PackageManifestSchema = Type.Object(
  {
    id: PackageIdSchema,
    name: LocalizedTextRefSchema,
    version: SemVerSchema,
    gameVersion: SemVerSchema,
    engineApiVersion: Type.String({ minLength: 1 }),
    contentSchemaVersion: Type.String({ minLength: 1 }),
    defaultLocale: Type.String({ pattern: '^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$' }),
    locales: Type.Record(Type.String({ minLength: 1 }), Type.String({ minLength: 1 })),
    authors: Type.Array(AuthorMetadataSchema, { minItems: 1 }),
    contributors: Type.Optional(Type.Array(AuthorMetadataSchema)),
    license: Type.String({ minLength: 1 }),
    homepage: Type.Optional(Type.String({ minLength: 1 })),
    source: Type.Optional(Type.String({ minLength: 1 })),
    issues: Type.Optional(Type.String({ minLength: 1 })),
    dependencies: Type.Optional(Type.Array(PackageDependencySchema)),
    entrypoints: Type.Record(RegistryTypeIdSchema, Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
    settings: Type.Optional(Type.String({ minLength: 1 })),
    attributions: Type.Optional(Type.String({ minLength: 1 })),
    assets: Type.Optional(Type.String({ minLength: 1 }))
  },
  { $id: 'taoyuan.schema.PackageManifest', additionalProperties: false }
)

export const PackageSettingDefinitionSchema = Type.Object(
  {
    id: ContentIdSchema,
    scope: Type.Union([Type.Literal('installation'), Type.Literal('save')]),
    default: Type.Unknown(),
    schema: Type.Unknown()
  },
  { $id: 'taoyuan.schema.PackageSettingDefinition', additionalProperties: false }
)

export const ResourceAttributionSchema = Type.Object(
  {
    path: Type.String({ minLength: 1 }),
    author: Type.String({ minLength: 1 }),
    source: Type.Optional(Type.String({ minLength: 1 })),
    license: Type.String({ minLength: 1 }),
    modified: Type.Boolean()
  },
  { $id: 'taoyuan.schema.ResourceAttribution', additionalProperties: false }
)

export const TagDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: Type.Optional(LocalizedTextRefSchema),
    propagateToCraftedOutput: Type.Optional(Type.Boolean()),
    stackPolicy: Type.Optional(Type.Union([Type.Literal('merge'), Type.Literal('separate')])),
    behaviorSensitive: Type.Optional(Type.Boolean())
  },
  { $id: 'taoyuan.registry.TagDef', additionalProperties: false }
)

export const ItemCategorySchema = Type.Union([
  Type.Literal('seed'),
  Type.Literal('crop'),
  Type.Literal('fish'),
  Type.Literal('ore'),
  Type.Literal('gem'),
  Type.Literal('gift'),
  Type.Literal('food'),
  Type.Literal('material'),
  Type.Literal('misc'),
  Type.Literal('processed'),
  Type.Literal('machine'),
  Type.Literal('sprinkler'),
  Type.Literal('fertilizer'),
  Type.Literal('animal_product'),
  Type.Literal('sapling'),
  Type.Literal('fruit'),
  Type.Literal('bait'),
  Type.Literal('tackle'),
  Type.Literal('bomb'),
  Type.Literal('fossil'),
  Type.Literal('artifact'),
  Type.Literal('weapon'),
  Type.Literal('ring'),
  Type.Literal('hat'),
  Type.Literal('shoe')
])

export const ItemDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    category: ItemCategorySchema,
    description: LocalizedTextRefSchema,
    sellPrice: Type.Integer({ minimum: 0 }),
    edible: Type.Boolean(),
    staminaRestore: Type.Optional(Type.Integer({ minimum: 0 })),
    healthRestore: Type.Optional(Type.Integer({ minimum: 0 })),
    tags: Type.Optional(Type.Array(ContentIdSchema))
  },
  { $id: 'taoyuan.registry.ItemDef', additionalProperties: false }
)

export const SeasonSchema = Type.Union([
  Type.Literal('spring'),
  Type.Literal('summer'),
  Type.Literal('autumn'),
  Type.Literal('winter')
])

export const WeatherSchema = Type.Union([
  Type.Literal('sunny'),
  Type.Literal('rainy'),
  Type.Literal('stormy'),
  Type.Literal('snowy'),
  Type.Literal('windy'),
  Type.Literal('green_rain')
])

export const FishWeatherSchema = Type.Union([
  Type.Literal('sunny'),
  Type.Literal('rainy'),
  Type.Literal('stormy'),
  Type.Literal('snowy'),
  Type.Literal('windy'),
  Type.Literal('any')
])

export const FishingLocationSchema = Type.Union([
  Type.Literal('creek'),
  Type.Literal('pond'),
  Type.Literal('river'),
  Type.Literal('mine'),
  Type.Literal('waterfall'),
  Type.Literal('swamp')
])

export const FishDifficultySchema = Type.Union([
  Type.Literal('easy'),
  Type.Literal('normal'),
  Type.Literal('hard'),
  Type.Literal('legendary')
])

export const WeekdaySchema = Type.Union([
  Type.Literal('mon'),
  Type.Literal('tue'),
  Type.Literal('wed'),
  Type.Literal('thu'),
  Type.Literal('fri'),
  Type.Literal('sat'),
  Type.Literal('sun')
])

export const AnimalBuildingTypeSchema = Type.Union([
  Type.Literal('coop'),
  Type.Literal('barn'),
  Type.Literal('stable')
])

export const AnimalFriendshipRangeSchema = Type.Object(
  {
    min: Type.Integer({ minimum: 0 }),
    max: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const AnimalDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    building: AnimalBuildingTypeSchema,
    cost: Type.Integer({ minimum: 0 }),
    productItemId: Type.Optional(ContentIdSchema),
    productName: Type.Optional(LocalizedTextRefSchema),
    produceDays: Type.Integer({ minimum: 0 }),
    friendship: AnimalFriendshipRangeSchema
  },
  { $id: 'taoyuan.registry.AnimalDef', additionalProperties: false }
)

export const AnimalFeedDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    price: Type.Integer({ minimum: 0 })
  },
  { $id: 'taoyuan.registry.AnimalFeedDef', additionalProperties: false }
)

export const WalletItemEffectTypeSchema = Type.Union([
  Type.Literal('shopDiscount'),
  Type.Literal('forageQuality'),
  Type.Literal('miningStamina'),
  Type.Literal('fishingCalm'),
  Type.Literal('cookingRestore'),
  Type.Literal('cropGrowth'),
  Type.Literal('tradeBonus')
])

export const WalletItemEffectSchema = Type.Object(
  {
    type: WalletItemEffectTypeSchema,
    value: Type.Number()
  },
  { additionalProperties: false }
)

export const WalletItemDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    effect: WalletItemEffectSchema,
    unlockCondition: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.WalletItemDef', additionalProperties: false }
)

export const FarmMapTypeSchema = Type.Union([
  Type.Literal('standard'),
  Type.Literal('riverland'),
  Type.Literal('forest'),
  Type.Literal('hilltop'),
  Type.Literal('wilderness'),
  Type.Literal('meadowlands')
])

export const FarmMapDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    type: FarmMapTypeSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    bonus: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.FarmMapDef', additionalProperties: false }
)

export const AnimalBuildingMaterialSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const AnimalBuildingUpgradeSchema = Type.Object(
  {
    level: Type.Integer({ minimum: 2 }),
    name: LocalizedTextRefSchema,
    capacity: Type.Integer({ minimum: 1 }),
    cost: Type.Integer({ minimum: 0 }),
    materialCost: Type.Array(AnimalBuildingMaterialSchema)
  },
  { additionalProperties: false }
)

export const AnimalBuildingDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    building: AnimalBuildingTypeSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    capacity: Type.Integer({ minimum: 1 }),
    cost: Type.Integer({ minimum: 0 }),
    materialCost: Type.Array(AnimalBuildingMaterialSchema),
    upgrades: Type.Array(AnimalBuildingUpgradeSchema)
  },
  { $id: 'taoyuan.registry.AnimalBuildingDef', additionalProperties: false }
)

export const AnimalIncubationDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    itemId: ContentIdSchema,
    animalId: ContentIdSchema,
    building: AnimalBuildingTypeSchema,
    days: Type.Integer({ minimum: 1 })
  },
  { $id: 'taoyuan.registry.AnimalIncubationDef', additionalProperties: false }
)

export const ToolTypeSchema = Type.Union([
  Type.Literal('wateringCan'),
  Type.Literal('hoe'),
  Type.Literal('pickaxe'),
  Type.Literal('fishingRod'),
  Type.Literal('scythe'),
  Type.Literal('axe'),
  Type.Literal('pan')
])

export const ToolTierSchema = Type.Union([
  Type.Literal('basic'),
  Type.Literal('iron'),
  Type.Literal('steel'),
  Type.Literal('iridium')
])

export const ToolUpgradeMaterialSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const ToolUpgradeDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    toolType: ToolTypeSchema,
    fromTier: ToolTierSchema,
    toTier: ToolTierSchema,
    money: Type.Integer({ minimum: 0 }),
    materials: Type.Array(ToolUpgradeMaterialSchema)
  },
  { $id: 'taoyuan.registry.ToolUpgradeDef', additionalProperties: false }
)

export const PondFishGeneticsSchema = Type.Object(
  {
    weight: Type.Integer({ minimum: 0, maximum: 100 }),
    growthRate: Type.Integer({ minimum: 0, maximum: 100 }),
    diseaseRes: Type.Integer({ minimum: 0, maximum: 100 }),
    qualityGene: Type.Integer({ minimum: 0, maximum: 100 }),
    mutationRate: Type.Integer({ minimum: 1, maximum: 50 })
  },
  { additionalProperties: false }
)

export const PondableFishDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    fishItemId: ContentIdSchema,
    name: LocalizedTextRefSchema,
    maturityDays: Type.Integer({ minimum: 1 }),
    baseProductionRate: Type.Number({ minimum: 0, maximum: 1 }),
    productItemId: ContentIdSchema,
    defaultGenetics: PondFishGeneticsSchema
  },
  { $id: 'taoyuan.registry.PondableFishDef', additionalProperties: false }
)

export const PondBreedDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    generation: Type.Union([
      Type.Literal(1),
      Type.Literal(2),
      Type.Literal(3),
      Type.Literal(4),
      Type.Literal(5)
    ]),
    baseFishId: ContentIdSchema,
    parentBreedA: Type.Union([ContentIdSchema, Type.Null()]),
    parentBreedB: Type.Union([ContentIdSchema, Type.Null()])
  },
  { $id: 'taoyuan.registry.PondBreedDef', additionalProperties: false }
)

export const PondLevelSchema = Type.Union([
  Type.Literal(1),
  Type.Literal(2),
  Type.Literal(3)
])

export const FishPondFacilityMaterialSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const FishPondFacilityCostSchema = Type.Object(
  {
    money: Type.Integer({ minimum: 0 }),
    materials: Type.Array(FishPondFacilityMaterialSchema)
  },
  { additionalProperties: false }
)

export const FishPondFacilityCapacitySchema = Type.Object(
  {
    level: PondLevelSchema,
    capacity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const FishPondFacilityUpgradeSchema = Type.Object(
  {
    level: Type.Union([Type.Literal(2), Type.Literal(3)]),
    capacity: Type.Integer({ minimum: 1 }),
    cost: FishPondFacilityCostSchema
  },
  { additionalProperties: false }
)

export const FishPondFacilityDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    buildCost: FishPondFacilityCostSchema,
    capacities: Type.Array(FishPondFacilityCapacitySchema, { minItems: 1 }),
    upgrades: Type.Array(FishPondFacilityUpgradeSchema),
    unlimitedAtLevel: Type.Union([PondLevelSchema, Type.Null()])
  },
  { $id: 'taoyuan.registry.FishPondFacilityDef', additionalProperties: false }
)

export const BuildingUpgradeMaterialSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const FarmhouseUpgradeLevelSchema = Type.Union([
  Type.Literal(1),
  Type.Literal(2),
  Type.Literal(3)
])

export const CaveUpgradeLevelSchema = Type.Union([
  Type.Literal(1),
  Type.Literal(2),
  Type.Literal(3)
])

export const CellarUpgradeLevelSchema = Type.Union([
  Type.Literal(1),
  Type.Literal(2),
  Type.Literal(3),
  Type.Literal(4),
  Type.Literal(5)
])

export const FarmhouseUpgradeDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    kind: Type.Literal('farmhouse'),
    level: FarmhouseUpgradeLevelSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    cost: Type.Integer({ minimum: 0 }),
    materialCost: Type.Array(BuildingUpgradeMaterialSchema),
    benefit: Type.String({ minLength: 1 })
  },
  { additionalProperties: false }
)

export const CaveMushroomPoolEntrySchema = Type.Object(
  {
    itemId: ContentIdSchema,
    weight: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const CaveUpgradeDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    kind: Type.Literal('cave'),
    level: CaveUpgradeLevelSchema,
    name: LocalizedTextRefSchema,
    mushroomChance: Type.Number({ minimum: 0, maximum: 1 }),
    fruitBatChance: Type.Number({ minimum: 0, maximum: 1 }),
    doubleChance: Type.Number({ minimum: 0, maximum: 1 }),
    cost: Type.Integer({ minimum: 0 }),
    materialCost: Type.Array(BuildingUpgradeMaterialSchema),
    mushroomPool: Type.Array(CaveMushroomPoolEntrySchema, { minItems: 1 }),
    fruitPool: Type.Array(ContentIdSchema, { minItems: 1 })
  },
  { additionalProperties: false }
)

export const CellarUpgradeDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    kind: Type.Literal('cellar'),
    level: CellarUpgradeLevelSchema,
    name: LocalizedTextRefSchema,
    valuePerCycle: Type.Integer({ minimum: 0 }),
    maxSlots: Type.Integer({ minimum: 1 }),
    cost: Type.Integer({ minimum: 0 }),
    materialCost: Type.Array(BuildingUpgradeMaterialSchema)
  },
  { additionalProperties: false }
)

export const BuildingUpgradeDefSchema = Type.Union(
  [
    FarmhouseUpgradeDefSchema,
    CaveUpgradeDefSchema,
    CellarUpgradeDefSchema
  ],
  { $id: 'taoyuan.registry.BuildingUpgradeDef' }
)

export const CropDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    seedId: ContentIdSchema,
    season: Type.Array(SeasonSchema, { minItems: 1, uniqueItems: true }),
    growthDays: Type.Integer({ minimum: 1 }),
    sellPrice: Type.Integer({ minimum: 0 }),
    seedPrice: Type.Integer({ minimum: 0 }),
    deepWatering: Type.Boolean(),
    description: LocalizedTextRefSchema,
    regrowth: Type.Optional(Type.Boolean()),
    regrowthDays: Type.Optional(Type.Integer({ minimum: 1 })),
    maxHarvests: Type.Optional(Type.Integer({ minimum: 1 })),
    giantCropEligible: Type.Optional(Type.Boolean())
  },
  { $id: 'taoyuan.registry.CropDef', additionalProperties: false }
)

const TreeCommonFields = {
  id: ContentIdSchema,
  name: LocalizedTextRefSchema,
  seedItemId: ContentIdSchema,
  growthDays: Type.Integer({ minimum: 1 })
}

export const FruitTreeDefSchema = Type.Object(
  {
    ...TreeCommonFields,
    kind: Type.Literal('fruit'),
    saplingPrice: Type.Integer({ minimum: 0 }),
    fruitItemId: ContentIdSchema,
    fruitName: LocalizedTextRefSchema,
    fruitSeason: SeasonSchema,
    fruitSellPrice: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const WildTreeDefSchema = Type.Object(
  {
    ...TreeCommonFields,
    kind: Type.Literal('wild'),
    tapProductItemId: ContentIdSchema,
    tapProductName: LocalizedTextRefSchema,
    tapCycleDays: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const TreeDefSchema = Type.Union(
  [FruitTreeDefSchema, WildTreeDefSchema],
  { $id: 'taoyuan.registry.TreeDef' }
)

export const FishDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    season: Type.Array(SeasonSchema, { minItems: 1, uniqueItems: true }),
    weather: Type.Array(FishWeatherSchema, { minItems: 1, uniqueItems: true }),
    difficulty: FishDifficultySchema,
    sellPrice: Type.Integer({ minimum: 0 }),
    description: LocalizedTextRefSchema,
    location: Type.Optional(FishingLocationSchema),
    miniGameSpeed: Type.Optional(Type.Number({ minimum: 0 })),
    miniGameDirChange: Type.Optional(Type.Number({ minimum: 0 }))
  },
  { $id: 'taoyuan.registry.FishDef', additionalProperties: false }
)

export const ForageDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    itemId: ContentIdSchema,
    name: LocalizedTextRefSchema,
    season: Type.Array(SeasonSchema, { minItems: 1, uniqueItems: true }),
    chance: Type.Number({ minimum: 0, maximum: 1 }),
    expReward: Type.Integer({ minimum: 0 })
  },
  { $id: 'taoyuan.registry.ForageDef', additionalProperties: false }
)

export const DropTableEntrySchema = Type.Object(
  {
    itemId: ContentIdSchema,
    chance: Type.Number({ minimum: 0 }),
    minQuantity: Type.Optional(Type.Integer({ minimum: 1 })),
    maxQuantity: Type.Optional(Type.Integer({ minimum: 1 }))
  },
  { additionalProperties: false }
)

export const DropTableDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    entries: Type.Array(DropTableEntrySchema)
  },
  { $id: 'taoyuan.registry.DropTableDef', additionalProperties: false }
)

export const MonsterDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    hp: Type.Integer({ minimum: 1 }),
    attack: Type.Integer({ minimum: 0 }),
    defense: Type.Integer({ minimum: 0 }),
    expReward: Type.Integer({ minimum: 0 }),
    dropTableId: Type.Optional(ContentIdSchema),
    description: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.MonsterDef', additionalProperties: false }
)

export const MonsterPoolEntrySchema = Type.Object(
  {
    monsterId: ContentIdSchema,
    weight: Type.Optional(Type.Integer({
      minimum: 1,
      maximum: MONSTER_POOL_RESOURCE_LIMITS.maxEntryWeight
    }))
  },
  { additionalProperties: false }
)

export const MonsterPoolDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    entries: Type.Array(MonsterPoolEntrySchema, {
      minItems: 1,
      maxItems: MONSTER_POOL_RESOURCE_LIMITS.maxEntries
    })
  },
  { $id: 'taoyuan.registry.MonsterPoolDef', additionalProperties: false }
)

export const EnchantmentSpecialSchema = Type.Union([
  Type.Literal('vampiric'),
  Type.Literal('sturdy'),
  Type.Literal('lucky'),
  Type.Literal('poison'),
  Type.Literal('burn'),
  Type.Literal('freeze'),
  Type.Literal('radiation'),
  Type.Null()
])

export const EquipmentEffectTypeSchema = Type.Union([
  Type.Literal('attack_bonus'),
  Type.Literal('crit_rate_bonus'),
  Type.Literal('defense_bonus'),
  Type.Literal('vampiric'),
  Type.Literal('max_hp_bonus'),
  Type.Literal('stamina_reduction'),
  Type.Literal('mining_stamina'),
  Type.Literal('farming_stamina'),
  Type.Literal('fishing_stamina'),
  Type.Literal('crop_quality_bonus'),
  Type.Literal('crop_growth_bonus'),
  Type.Literal('fish_quality_bonus'),
  Type.Literal('fishing_calm'),
  Type.Literal('sell_price_bonus'),
  Type.Literal('shop_discount'),
  Type.Literal('gift_friendship'),
  Type.Literal('monster_drop_bonus'),
  Type.Literal('exp_bonus'),
  Type.Literal('treasure_find'),
  Type.Literal('ore_bonus'),
  Type.Literal('luck'),
  Type.Literal('travel_speed'),
  Type.Literal('combat_regen')
])

export const EquipmentEffectSchema = Type.Object(
  {
    type: EquipmentEffectTypeSchema,
    value: Type.Number()
  },
  { additionalProperties: false }
)

export const EquipmentRecipeIngredientSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const EquipmentDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    kind: Type.Literal('ring'),
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    effects: Type.Array(EquipmentEffectSchema),
    recipe: Type.Union([Type.Array(EquipmentRecipeIngredientSchema), Type.Null()]),
    recipeMoney: Type.Integer({ minimum: 0 }),
    obtainSource: LocalizedTextRefSchema,
    sellPrice: Type.Integer({ minimum: 0 })
  },
  { $id: 'taoyuan.registry.EquipmentDef', additionalProperties: false }
)

export const EquipmentSetPiecesSchema = Type.Object(
  {
    weapon: Type.Optional(ContentIdSchema),
    ring: ContentIdSchema,
    hat: ContentIdSchema,
    shoe: ContentIdSchema
  },
  { additionalProperties: false }
)

export const EquipmentSetBonusSchema = Type.Object(
  {
    count: Type.Union([Type.Literal(2), Type.Literal(3), Type.Literal(4)]),
    effects: Type.Array(EquipmentEffectSchema, { minItems: 1 }),
    description: LocalizedTextRefSchema
  },
  { additionalProperties: false }
)

export const EquipmentSetDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    pieces: EquipmentSetPiecesSchema,
    bonuses: Type.Array(EquipmentSetBonusSchema, { minItems: 1 })
  },
  { $id: 'taoyuan.registry.EquipmentSetDef', additionalProperties: false }
)

export const EnchantmentDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    rarity: Type.Integer({ minimum: 1 }),
    randomWeight: Type.Number({ minimum: 0 }),
    attackBonus: Type.Number(),
    critBonus: Type.Number(),
    special: EnchantmentSpecialSchema,
    effects: Type.Array(EquipmentEffectSchema)
  },
  { $id: 'taoyuan.registry.EnchantmentDef', additionalProperties: false }
)

export const RecipeIngredientItemSchema = Type.Object(
  {
    type: Type.Literal('item'),
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const RecipeIngredientTagSchema = Type.Object(
  {
    type: Type.Literal('tag'),
    tagId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const RecipeIngredientAnyOfTagsSchema = Type.Object(
  {
    type: Type.Literal('anyOfTags'),
    tagIds: Type.Array(ContentIdSchema, { minItems: 1, uniqueItems: true }),
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const RecipeIngredientSchema = Type.Union([
  RecipeIngredientItemSchema,
  RecipeIngredientTagSchema,
  RecipeIngredientAnyOfTagsSchema
])

export const RecipeEffectBuffSchema = Type.Object(
  {
    type: Type.Union([
      Type.Literal('fishing'),
      Type.Literal('mining'),
      Type.Literal('giftBonus'),
      Type.Literal('speed'),
      Type.Literal('defense'),
      Type.Literal('luck'),
      Type.Literal('farming'),
      Type.Literal('stamina'),
      Type.Literal('all_skills')
    ]),
    value: Type.Number(),
    description: Type.String({ minLength: 1 })
  },
  { additionalProperties: false }
)

export const RecipeEffectSchema = Type.Object(
  {
    staminaRestore: Type.Integer({ minimum: 0 }),
    healthRestore: Type.Optional(Type.Integer({ minimum: 0 })),
    buff: Type.Optional(RecipeEffectBuffSchema)
  },
  { additionalProperties: false }
)

export const SkillTypeSchema = Type.Union([
  Type.Literal('farming'),
  Type.Literal('foraging'),
  Type.Literal('fishing'),
  Type.Literal('mining'),
  Type.Literal('combat')
])

export const RecipeRequiredSkillSchema = Type.Object(
  {
    type: SkillTypeSchema,
    level: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const RecipeDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    ingredients: Type.Array(RecipeIngredientSchema),
    outputItemId: ContentIdSchema,
    outputQuantity: Type.Integer({ minimum: 1 }),
    effect: RecipeEffectSchema,
    unlockSource: Type.String({ minLength: 1 }),
    description: LocalizedTextRefSchema,
    requiredSkill: Type.Optional(RecipeRequiredSkillSchema)
  },
  { $id: 'taoyuan.registry.RecipeDef', additionalProperties: false }
)

export const ShopDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    npcName: LocalizedTextRefSchema,
    closedDays: Type.Array(WeekdaySchema, { uniqueItems: true }),
    openHour: Type.Integer({ minimum: 0, maximum: 26 }),
    closeHour: Type.Integer({ minimum: 0, maximum: 26 }),
    closedWeathers: Type.Array(WeatherSchema, { uniqueItems: true }),
    closedSeasons: Type.Array(SeasonSchema, { uniqueItems: true })
  },
  { $id: 'taoyuan.registry.ShopDef', additionalProperties: false }
)

export const ShopOfferPurchaseKindSchema = Type.Union([
  Type.Literal('item'),
  Type.Literal('seed'),
  Type.Literal('weapon'),
  Type.Literal('hat'),
  Type.Literal('shoe')
])

export const ShopOfferDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    shopId: ContentIdSchema,
    itemId: ContentIdSchema,
    name: Type.Optional(LocalizedTextRefSchema),
    description: Type.Optional(LocalizedTextRefSchema),
    groupId: Type.Optional(Type.String({ minLength: 1 })),
    groupName: Type.Optional(LocalizedTextRefSchema),
    purchaseKind: Type.Optional(ShopOfferPurchaseKindSchema),
    price: Type.Integer({ minimum: 0 }),
    quantity: Type.Optional(Type.Integer({ minimum: 1 })),
    weeklyLimit: Type.Optional(Type.Integer({ minimum: 0 })),
    totalLimit: Type.Optional(Type.Integer({ minimum: 0 })),
    sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
    availableSeasons: Type.Optional(Type.Array(SeasonSchema, { minItems: 1, uniqueItems: true }))
  },
  { $id: 'taoyuan.registry.ShopOfferDef', additionalProperties: false }
)

export const OFFICIAL_REGISTRY_SCHEMAS = {
  'taoyuan:tag': TagDefSchema,
  'taoyuan:item': ItemDefSchema,
  'taoyuan:crop': CropDefSchema,
  'taoyuan:tree': TreeDefSchema,
  'taoyuan:fish': FishDefSchema,
  'taoyuan:forage': ForageDefSchema,
  'taoyuan:animal': AnimalDefSchema,
  'taoyuan:animal_feed': AnimalFeedDefSchema,
  'taoyuan:wallet_item': WalletItemDefSchema,
  'taoyuan:farm_map': FarmMapDefSchema,
  'taoyuan:animal_building': AnimalBuildingDefSchema,
  'taoyuan:animal_incubation': AnimalIncubationDefSchema,
  'taoyuan:tool_upgrade': ToolUpgradeDefSchema,
  'taoyuan:pondable_fish': PondableFishDefSchema,
  'taoyuan:pond_breed': PondBreedDefSchema,
  'taoyuan:fish_pond_facility': FishPondFacilityDefSchema,
  'taoyuan:building_upgrade': BuildingUpgradeDefSchema,
  'taoyuan:monster': MonsterDefSchema,
  'taoyuan:monster_pool': MonsterPoolDefSchema,
  'taoyuan:enchantment': EnchantmentDefSchema,
  'taoyuan:equipment': EquipmentDefSchema,
  'taoyuan:equipment_set': EquipmentSetDefSchema,
  'taoyuan:drop_table': DropTableDefSchema,
  'taoyuan:recipe': RecipeDefSchema,
  'taoyuan:shop': ShopDefSchema,
  'taoyuan:shop_offer': ShopOfferDefSchema
} as const satisfies Record<string, TSchema>

export const PUBLIC_JSON_SCHEMAS = {
  'localized-text-ref.schema.json': LocalizedTextRefSchema,
  'package-manifest.schema.json': PackageManifestSchema,
  'package-setting-definition.schema.json': PackageSettingDefinitionSchema,
  'resource-attribution.schema.json': ResourceAttributionSchema,
  'tag.schema.json': TagDefSchema,
  'item.schema.json': ItemDefSchema,
  'crop.schema.json': CropDefSchema,
  'tree.schema.json': TreeDefSchema,
  'fish.schema.json': FishDefSchema,
  'forage.schema.json': ForageDefSchema,
  'animal.schema.json': AnimalDefSchema,
  'animal-feed.schema.json': AnimalFeedDefSchema,
  'wallet-item.schema.json': WalletItemDefSchema,
  'farm-map.schema.json': FarmMapDefSchema,
  'animal-building.schema.json': AnimalBuildingDefSchema,
  'animal-incubation.schema.json': AnimalIncubationDefSchema,
  'tool-upgrade.schema.json': ToolUpgradeDefSchema,
  'pondable-fish.schema.json': PondableFishDefSchema,
  'pond-breed.schema.json': PondBreedDefSchema,
  'fish-pond-facility.schema.json': FishPondFacilityDefSchema,
  'building-upgrade.schema.json': BuildingUpgradeDefSchema,
  'monster.schema.json': MonsterDefSchema,
  'monster-pool.schema.json': MonsterPoolDefSchema,
  'enchantment.schema.json': EnchantmentDefSchema,
  'equipment.schema.json': EquipmentDefSchema,
  'equipment-set.schema.json': EquipmentSetDefSchema,
  'drop-table.schema.json': DropTableDefSchema,
  'recipe.schema.json': RecipeDefSchema,
  'shop.schema.json': ShopDefSchema,
  'shop-offer.schema.json': ShopOfferDefSchema
} as const satisfies Record<string, TSchema>

export type LocalizedTextRef = Static<typeof LocalizedTextRefSchema>
export type AuthorMetadata = Static<typeof AuthorMetadataSchema>
export type PackageManifest = Static<typeof PackageManifestSchema>
export type PackageSettingDefinition = Static<typeof PackageSettingDefinitionSchema>
export type ResourceAttribution = Static<typeof ResourceAttributionSchema>
export type TagDef = Static<typeof TagDefSchema>
export type ItemDef = Static<typeof ItemDefSchema>
export type Season = Static<typeof SeasonSchema>
export type Weather = Static<typeof WeatherSchema>
export type FishWeather = Static<typeof FishWeatherSchema>
export type FishingLocation = Static<typeof FishingLocationSchema>
export type FishDifficulty = Static<typeof FishDifficultySchema>
export type Weekday = Static<typeof WeekdaySchema>
export type AnimalBuildingType = Static<typeof AnimalBuildingTypeSchema>
export type AnimalDef = Static<typeof AnimalDefSchema>
export type AnimalFeedDef = Static<typeof AnimalFeedDefSchema>
export type WalletItemEffectType = Static<typeof WalletItemEffectTypeSchema>
export type WalletItemEffect = Static<typeof WalletItemEffectSchema>
export type WalletItemDef = Static<typeof WalletItemDefSchema>
export type FarmMapType = Static<typeof FarmMapTypeSchema>
export type FarmMapDef = Static<typeof FarmMapDefSchema>
export type AnimalBuildingDef = Static<typeof AnimalBuildingDefSchema>
export type AnimalBuildingMaterial = Static<typeof AnimalBuildingMaterialSchema>
export type AnimalBuildingUpgrade = Static<typeof AnimalBuildingUpgradeSchema>
export type AnimalIncubationDef = Static<typeof AnimalIncubationDefSchema>
export type ToolTypeDef = Static<typeof ToolTypeSchema>
export type ToolTierDef = Static<typeof ToolTierSchema>
export type ToolUpgradeMaterial = Static<typeof ToolUpgradeMaterialSchema>
export type ToolUpgradeDef = Static<typeof ToolUpgradeDefSchema>
export type PondFishGenetics = Static<typeof PondFishGeneticsSchema>
export type PondableFishDef = Static<typeof PondableFishDefSchema>
export type PondBreedDef = Static<typeof PondBreedDefSchema>
export type PondLevelDef = Static<typeof PondLevelSchema>
export type FishPondFacilityMaterial = Static<typeof FishPondFacilityMaterialSchema>
export type FishPondFacilityCost = Static<typeof FishPondFacilityCostSchema>
export type FishPondFacilityCapacity = Static<typeof FishPondFacilityCapacitySchema>
export type FishPondFacilityUpgrade = Static<typeof FishPondFacilityUpgradeSchema>
export type FishPondFacilityDef = Static<typeof FishPondFacilityDefSchema>
export type BuildingUpgradeMaterial = Static<typeof BuildingUpgradeMaterialSchema>
export type BuildingUpgradeDef = Static<typeof BuildingUpgradeDefSchema>
export type FarmhouseUpgradeContentDef = Extract<BuildingUpgradeDef, { kind: 'farmhouse' }>
export type CaveUpgradeContentDef = Extract<BuildingUpgradeDef, { kind: 'cave' }>
export type CellarUpgradeContentDef = Extract<BuildingUpgradeDef, { kind: 'cellar' }>
export type CropDef = Static<typeof CropDefSchema>
export type TreeDef = Static<typeof TreeDefSchema>
export type FruitTreeContentDef = Extract<TreeDef, { kind: 'fruit' }>
export type WildTreeContentDef = Extract<TreeDef, { kind: 'wild' }>
export type FishDef = Static<typeof FishDefSchema>
export type ForageDef = Static<typeof ForageDefSchema>
export type DropTableDef = Static<typeof DropTableDefSchema>
export type MonsterDef = Static<typeof MonsterDefSchema>
export type MonsterPoolEntry = Static<typeof MonsterPoolEntrySchema>
export type MonsterPoolDef = Static<typeof MonsterPoolDefSchema>
export type EquipmentEffect = Static<typeof EquipmentEffectSchema>
export type EquipmentRecipeIngredient = Static<typeof EquipmentRecipeIngredientSchema>
export type EquipmentDef = Static<typeof EquipmentDefSchema>
export type EquipmentSetPieces = Static<typeof EquipmentSetPiecesSchema>
export type EquipmentSetBonus = Static<typeof EquipmentSetBonusSchema>
export type EquipmentSetDef = Static<typeof EquipmentSetDefSchema>
export type EnchantmentDef = Static<typeof EnchantmentDefSchema>
export type RecipeIngredient = Static<typeof RecipeIngredientSchema>
export type RecipeDef = Static<typeof RecipeDefSchema>
export type ShopDef = Static<typeof ShopDefSchema>
export type ShopOfferPurchaseKind = Static<typeof ShopOfferPurchaseKindSchema>
export type ShopOfferDef = Static<typeof ShopOfferDefSchema>

export type OfficialRegistryId = keyof typeof OFFICIAL_REGISTRY_SCHEMAS
