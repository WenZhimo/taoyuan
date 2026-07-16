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

export const MarketSeasonCoefficientsSchema = Type.Tuple([
  Type.Number({ minimum: 0 }),
  Type.Number({ minimum: 0 }),
  Type.Number({ minimum: 0 }),
  Type.Number({ minimum: 0 })
])

export const MarketSupplyThresholdsSchema = Type.Object(
  {
    low: Type.Integer({ minimum: 0 }),
    mid: Type.Integer({ minimum: 0 }),
    high: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const MarketCategoryDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    seasonCoefficients: MarketSeasonCoefficientsSchema,
    supplyThresholds: MarketSupplyThresholdsSchema
  },
  { $id: 'taoyuan.registry.MarketCategoryDef', additionalProperties: false }
)

export const SkillTypeSchema = Type.Union([
  Type.Literal('farming'),
  Type.Literal('foraging'),
  Type.Literal('fishing'),
  Type.Literal('mining'),
  Type.Literal('combat')
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

export const MuseumCategoryKeySchema = Type.Union([
  Type.Literal('ore'),
  Type.Literal('gem'),
  Type.Literal('bar'),
  Type.Literal('fossil'),
  Type.Literal('artifact'),
  Type.Literal('spirit')
])

export const MuseumCategoryDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    key: MuseumCategoryKeySchema,
    label: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.MuseumCategoryDef', additionalProperties: false }
)

export const MuseumItemDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    itemId: ContentIdSchema,
    name: LocalizedTextRefSchema,
    category: MuseumCategoryKeySchema,
    sourceHint: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.MuseumItemDef', additionalProperties: false }
)

export const MuseumMilestoneRewardItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const MuseumMilestoneRewardSchema = Type.Object(
  {
    money: Type.Optional(Type.Integer({ minimum: 0 })),
    items: Type.Optional(Type.Array(MuseumMilestoneRewardItemSchema, { minItems: 1 }))
  },
  { additionalProperties: false }
)

export const MuseumMilestoneDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    count: Type.Integer({ minimum: 1 }),
    name: LocalizedTextRefSchema,
    reward: MuseumMilestoneRewardSchema
  },
  { $id: 'taoyuan.registry.MuseumMilestoneDef', additionalProperties: false }
)

export const GuildGoalZoneSchema = Type.Union([
  Type.Literal('shallow'),
  Type.Literal('frost'),
  Type.Literal('lava'),
  Type.Literal('crystal'),
  Type.Literal('shadow'),
  Type.Literal('abyss'),
  Type.Literal('boss'),
  Type.Literal('skull')
])

export const GuildGoalRewardItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const GuildGoalRewardSchema = Type.Object(
  {
    money: Type.Optional(Type.Integer({ minimum: 0 })),
    items: Type.Optional(Type.Array(GuildGoalRewardItemSchema, { minItems: 1 }))
  },
  { additionalProperties: false }
)

export const GuildGoalDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    monsterId: ContentIdSchema,
    monsterName: LocalizedTextRefSchema,
    zone: GuildGoalZoneSchema,
    killTarget: Type.Integer({ minimum: 1 }),
    reward: GuildGoalRewardSchema,
    description: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.GuildGoalDef', additionalProperties: false }
)

export const GuildDonationDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    itemId: ContentIdSchema,
    points: Type.Integer({ minimum: 1 })
  },
  { $id: 'taoyuan.registry.GuildDonationDef', additionalProperties: false }
)

export const GuildLevelDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    level: Type.Integer({ minimum: 1 }),
    expRequired: Type.Integer({ minimum: 0 })
  },
  { $id: 'taoyuan.registry.GuildLevelDef', additionalProperties: false }
)

export const GenderSchema = Type.Union([
  Type.Literal('male'),
  Type.Literal('female')
])

export const NpcFriendshipLevelSchema = Type.Union([
  Type.Literal('stranger'),
  Type.Literal('acquaintance'),
  Type.Literal('friendly'),
  Type.Literal('bestFriend')
])

export const NpcDialoguesSchema = Type.Object(
  {
    stranger: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    acquaintance: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    friendly: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    bestFriend: Type.Array(LocalizedTextRefSchema, { minItems: 1 })
  },
  { additionalProperties: false }
)

export const NpcBirthdaySchema = Type.Object(
  {
    season: SeasonSchema,
    day: Type.Integer({ minimum: 1, maximum: 28 })
  },
  { additionalProperties: false }
)

export const NpcDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    gender: GenderSchema,
    role: LocalizedTextRefSchema,
    personality: LocalizedTextRefSchema,
    lovedItems: Type.Array(ContentIdSchema),
    likedItems: Type.Array(ContentIdSchema),
    hatedItems: Type.Array(ContentIdSchema),
    dialogues: NpcDialoguesSchema,
    marriageable: Type.Optional(Type.Boolean()),
    heartEventIds: Type.Optional(Type.Array(ContentIdSchema, { minItems: 1 })),
    datingDialogues: Type.Optional(Type.Array(LocalizedTextRefSchema, { minItems: 1 })),
    zhijiDialogues: Type.Optional(Type.Array(LocalizedTextRefSchema, { minItems: 1 })),
    zhijiHeartEventIds: Type.Optional(Type.Array(ContentIdSchema, { minItems: 1 })),
    birthday: Type.Optional(NpcBirthdaySchema)
  },
  { $id: 'taoyuan.registry.NpcDef', additionalProperties: false }
)

export const HeartEventSceneChoiceSchema = Type.Object(
  {
    text: LocalizedTextRefSchema,
    friendshipChange: Type.Integer(),
    response: LocalizedTextRefSchema
  },
  { additionalProperties: false }
)

export const HeartEventSceneSchema = Type.Object(
  {
    text: LocalizedTextRefSchema,
    choices: Type.Optional(Type.Array(HeartEventSceneChoiceSchema, { minItems: 1 }))
  },
  { additionalProperties: false }
)

export const HeartEventDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    npcId: ContentIdSchema,
    requiredFriendship: Type.Integer({ minimum: 0 }),
    requiresZhiji: Type.Optional(Type.Boolean()),
    title: LocalizedTextRefSchema,
    scenes: Type.Array(HeartEventSceneSchema, { minItems: 1 })
  },
  { $id: 'taoyuan.registry.HeartEventDef', additionalProperties: false }
)

export const HiddenNpcDiscoveryPhaseSchema = Type.Union([
  Type.Literal('unknown'),
  Type.Literal('rumor'),
  Type.Literal('glimpse'),
  Type.Literal('encounter'),
  Type.Literal('revealed')
])

export const HiddenNpcAffinityLevelSchema = Type.Union([
  Type.Literal('wary'),
  Type.Literal('curious'),
  Type.Literal('trusting'),
  Type.Literal('devoted'),
  Type.Literal('eternal')
])

export const HiddenNpcSceneChoiceSchema = Type.Object(
  {
    text: LocalizedTextRefSchema,
    friendshipChange: Type.Integer(),
    response: LocalizedTextRefSchema
  },
  { additionalProperties: false }
)

export const HiddenNpcSceneSchema = Type.Object(
  {
    text: LocalizedTextRefSchema,
    choices: Type.Optional(Type.Array(HiddenNpcSceneChoiceSchema, { minItems: 1 }))
  },
  { additionalProperties: false }
)

export const HiddenNpcDiscoveryConditionSchema = Type.Union([
  Type.Object({ type: Type.Literal('season'), season: SeasonSchema }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('weather'), weather: WeatherSchema }, { additionalProperties: false }),
  Type.Object(
    {
      type: Type.Literal('timeRange'),
      minHour: Type.Integer({ minimum: 0, maximum: 24 }),
      maxHour: Type.Integer({ minimum: 0, maximum: 24 })
    },
    { additionalProperties: false }
  ),
  Type.Object({ type: Type.Literal('location'), panel: Type.String({ minLength: 1 }) }, { additionalProperties: false }),
  Type.Object(
    {
      type: Type.Literal('item'),
      itemId: ContentIdSchema,
      quantity: Type.Optional(Type.Integer({ minimum: 1 }))
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('skill'),
      skillType: SkillTypeSchema,
      minLevel: Type.Integer({ minimum: 0 })
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('npcFriendship'),
      npcId: ContentIdSchema,
      minFriendship: Type.Integer({ minimum: 0 })
    },
    { additionalProperties: false }
  ),
  Type.Object({ type: Type.Literal('questComplete'), questId: ContentIdSchema }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('mineFloor'), minFloor: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('fishCaught'), fishId: ContentIdSchema }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('money'), minAmount: Type.Integer({ minimum: 0 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('yearMin'), year: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('day'), day: Type.Integer({ minimum: 1, maximum: 28 }) }, { additionalProperties: false })
])

export const HiddenNpcDiscoveryStepSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    phase: HiddenNpcDiscoveryPhaseSchema,
    conditions: Type.Array(HiddenNpcDiscoveryConditionSchema, { minItems: 1 }),
    scenes: Type.Array(HiddenNpcSceneSchema, { minItems: 1 }),
    logMessage: Type.Optional(LocalizedTextRefSchema)
  },
  { additionalProperties: false }
)

export const HiddenNpcDialoguesSchema = Type.Object(
  {
    wary: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    curious: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    trusting: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    devoted: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    eternal: Type.Array(LocalizedTextRefSchema, { minItems: 1 })
  },
  { additionalProperties: false }
)

export const HiddenNpcInteractionTypeSchema = Type.Union([
  Type.Literal('meditation'),
  Type.Literal('music'),
  Type.Literal('ritual'),
  Type.Literal('dreamwalk'),
  Type.Literal('cultivation')
])

export const HiddenNpcPassiveSchema = Type.Object(
  {
    type: Type.Union([
      Type.Literal('quality_boost'),
      Type.Literal('stamina_save'),
      Type.Literal('exp_boost'),
      Type.Literal('sell_bonus'),
      Type.Literal('luck'),
      Type.Literal('max_stamina'),
      Type.Literal('max_hp')
    ]),
    value: Type.Number()
  },
  { additionalProperties: false }
)

export const HiddenNpcAbilitySchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    affinityRequired: Type.Integer({ minimum: 0 }),
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    passive: Type.Optional(HiddenNpcPassiveSchema)
  },
  { additionalProperties: false }
)

export const HiddenNpcCraftCostSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const HiddenNpcBondBonusSchema = Type.Union([
  Type.Object({ type: Type.Literal('weather_control'), chance: Type.Number({ minimum: 0 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('crop_blessing'), chance: Type.Number({ minimum: 0 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('animal_blessing'), chance: Type.Number({ minimum: 0 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('stamina_restore'), amount: Type.Integer({ minimum: 0 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('fish_attraction'), chance: Type.Number({ minimum: 0 }) }, { additionalProperties: false }),
  Type.Object(
    {
      type: Type.Literal('spirit_shield'),
      staminaSave: Type.Integer({ minimum: 0 }),
      hpBonus: Type.Integer({ minimum: 0 })
    },
    { additionalProperties: false }
  ),
  Type.Object({ type: Type.Literal('sell_bonus'), percent: Type.Number() }, { additionalProperties: false })
])

export const HiddenNpcDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    trueName: LocalizedTextRefSchema,
    gender: GenderSchema,
    title: LocalizedTextRefSchema,
    origin: LocalizedTextRefSchema,
    personality: LocalizedTextRefSchema,
    discoverySteps: Type.Array(HiddenNpcDiscoveryStepSchema, { minItems: 1 }),
    resonantOfferings: Type.Array(ContentIdSchema, { minItems: 1 }),
    pleasedOfferings: Type.Array(ContentIdSchema, { minItems: 1 }),
    repelledOfferings: Type.Array(ContentIdSchema, { minItems: 1 }),
    dialogues: HiddenNpcDialoguesSchema,
    interactionType: HiddenNpcInteractionTypeSchema,
    bondable: Type.Boolean(),
    courtshipItemId: ContentIdSchema,
    bondItemId: ContentIdSchema,
    courtshipThreshold: Type.Integer({ minimum: 0 }),
    bondThreshold: Type.Integer({ minimum: 0 }),
    heartEventIds: Type.Array(ContentIdSchema),
    courtshipDialogues: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    bondBonuses: Type.Array(HiddenNpcBondBonusSchema, { minItems: 1 }),
    abilities: Type.Array(HiddenNpcAbilitySchema, { minItems: 1 }),
    courtshipCraftCost: Type.Array(HiddenNpcCraftCostSchema, { minItems: 1 }),
    bondCraftCost: Type.Array(HiddenNpcCraftCostSchema, { minItems: 1 }),
    manifestationDay: NpcBirthdaySchema
  },
  { $id: 'taoyuan.registry.HiddenNpcDef', additionalProperties: false }
)

export const SecretNoteTypeSchema = Type.Union([
  Type.Literal('tip'),
  Type.Literal('treasure'),
  Type.Literal('npc'),
  Type.Literal('story')
])

export const SecretNoteRewardItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const SecretNoteRewardSchema = Type.Object(
  {
    money: Type.Optional(Type.Integer({ minimum: 0 })),
    items: Type.Optional(Type.Array(SecretNoteRewardItemSchema, { minItems: 1 }))
  },
  { additionalProperties: false }
)

export const SecretNoteDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    noteId: Type.Integer({ minimum: 1 }),
    type: SecretNoteTypeSchema,
    title: LocalizedTextRefSchema,
    content: LocalizedTextRefSchema,
    usable: Type.Boolean(),
    reward: Type.Optional(SecretNoteRewardSchema)
  },
  { $id: 'taoyuan.registry.SecretNoteDef', additionalProperties: false }
)

export const TutorialConditionKeySchema = Type.Union([
  Type.Literal('earlyFirstDay'),
  Type.Literal('allWasteland'),
  Type.Literal('tilledNoPlanted'),
  Type.Literal('plantedUnwatered'),
  Type.Literal('hasHarvestable'),
  Type.Literal('harvestedNeverSold'),
  Type.Literal('earlyGame'),
  Type.Literal('staminaWasLow'),
  Type.Literal('neverVisitedShop'),
  Type.Literal('neverFished'),
  Type.Literal('neverMined'),
  Type.Literal('neverTalkedNpc'),
  Type.Literal('neverCheckedQuests'),
  Type.Literal('neverCooked'),
  Type.Literal('firstRainyDay'),
  Type.Literal('justChangedSeason'),
  Type.Literal('hasCropNoSprinkler'),
  Type.Literal('neverHadAnimal')
])

export const TutorialDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    tipId: Type.String({ minLength: 1, pattern: '^[a-z0-9_./-]+$' }),
    priority: Type.Integer({ minimum: 1 }),
    conditionKey: TutorialConditionKeySchema,
    message: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.TutorialDef', additionalProperties: false }
)

export const MorningEventEffectSchema = Type.Union([
  Type.Object(
    {
      type: Type.Literal('loseCrop')
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('gainItem'),
      itemId: ContentIdSchema,
      qty: Type.Integer({ minimum: 1 })
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('gainMoney'),
      amount: Type.Integer({ minimum: 0 })
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('gainFriendship'),
      amount: Type.Integer({ minimum: 0 })
    },
    { additionalProperties: false }
  )
])

export const MorningEventChoiceSchema = Type.Object(
  {
    label: LocalizedTextRefSchema,
    result: LocalizedTextRefSchema,
    effect: Type.Optional(MorningEventEffectSchema)
  },
  { additionalProperties: false }
)

export const MorningNarrationEventDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    eventId: Type.String({ minLength: 1, pattern: '^[a-z0-9_./-]+$' }),
    kind: Type.Literal('narration'),
    message: LocalizedTextRefSchema,
    effect: Type.Optional(MorningEventEffectSchema)
  },
  { additionalProperties: false }
)

export const MorningChoiceEventDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    eventId: Type.String({ minLength: 1, pattern: '^[a-z0-9_./-]+$' }),
    kind: Type.Literal('choice'),
    message: LocalizedTextRefSchema,
    choices: Type.Array(MorningEventChoiceSchema, { minItems: 1 })
  },
  { additionalProperties: false }
)

export const MorningEasterEggEventDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    eventId: Type.String({ minLength: 1, pattern: '^[a-z0-9_./-]+$' }),
    kind: Type.Literal('easter_egg'),
    message: LocalizedTextRefSchema,
    effect: Type.Optional(MorningEventEffectSchema)
  },
  { additionalProperties: false }
)

export const MorningEventDefSchema = Type.Union(
  [MorningNarrationEventDefSchema, MorningChoiceEventDefSchema, MorningEasterEggEventDefSchema],
  { $id: 'taoyuan.registry.MorningEventDef' }
)

export const SeasonEventFestivalTypeSchema = Type.Union([
  Type.Literal('fishing_contest'),
  Type.Literal('harvest_fair'),
  Type.Literal('dragon_boat'),
  Type.Literal('lantern_riddle'),
  Type.Literal('pot_throwing'),
  Type.Literal('dumpling_making'),
  Type.Literal('firework_show'),
  Type.Literal('tea_contest'),
  Type.Literal('kite_flying')
])

export const SeasonEventRewardItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const SeasonEventEffectsSchema = Type.Object(
  {
    friendshipBonus: Type.Optional(Type.Integer()),
    moneyReward: Type.Optional(Type.Integer({ minimum: 0 })),
    itemReward: Type.Optional(Type.Array(SeasonEventRewardItemSchema, { minItems: 1 })),
    staminaBonus: Type.Optional(Type.Integer({ minimum: 0 }))
  },
  { additionalProperties: false }
)

export const SeasonEventDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    eventId: Type.String({ minLength: 1, pattern: '^[a-z0-9_./-]+$' }),
    name: LocalizedTextRefSchema,
    season: SeasonSchema,
    day: Type.Integer({ minimum: 1, maximum: 28 }),
    description: LocalizedTextRefSchema,
    effects: SeasonEventEffectsSchema,
    narrative: Type.Array(LocalizedTextRefSchema, { minItems: 1 }),
    interactive: Type.Optional(Type.Boolean()),
    festivalType: Type.Optional(SeasonEventFestivalTypeSchema)
  },
  { $id: 'taoyuan.registry.SeasonEventDef', additionalProperties: false }
)

export const QuestTemplateTypeSchema = Type.Union([
  Type.Literal('delivery'),
  Type.Literal('fishing'),
  Type.Literal('mining'),
  Type.Literal('gathering')
])

export const QuestTemplateTargetSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    name: LocalizedTextRefSchema,
    minQty: Type.Integer({ minimum: 1 }),
    maxQty: Type.Integer({ minimum: 1 }),
    seasons: Type.Array(SeasonSchema, { uniqueItems: true }),
    unitPrice: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const QuestTemplateRewardItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const BoardQuestTemplateDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    templateId: Type.String({ minLength: 1, pattern: '^[a-z0-9_./-]+$' }),
    kind: Type.Literal('board'),
    type: QuestTemplateTypeSchema,
    targets: Type.Array(QuestTemplateTargetSchema, { minItems: 1 }),
    npcPool: Type.Array(ContentIdSchema, { minItems: 1 }),
    rewardMultiplier: Type.Number({ minimum: 0 }),
    friendshipReward: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const SpecialOrderTemplateDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    templateId: Type.String({ minLength: 1, pattern: '^[a-z0-9_./-]+$' }),
    kind: Type.Literal('special_order'),
    name: LocalizedTextRefSchema,
    targetItemId: ContentIdSchema,
    targetItemName: LocalizedTextRefSchema,
    quantity: Type.Integer({ minimum: 1 }),
    days: Type.Integer({ minimum: 1 }),
    moneyReward: Type.Integer({ minimum: 0 }),
    itemReward: Type.Array(QuestTemplateRewardItemSchema, { minItems: 1 }),
    seasons: Type.Array(SeasonSchema, { uniqueItems: true }),
    npcId: ContentIdSchema,
    tier: Type.Integer({ minimum: 1, maximum: 4 })
  },
  { additionalProperties: false }
)

export const QuestTemplateDefSchema = Type.Union(
  [BoardQuestTemplateDefSchema, SpecialOrderTemplateDefSchema],
  { $id: 'taoyuan.registry.QuestTemplateDef' }
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

export const BreedingHybridBaseGeneticsSchema = Type.Object(
  {
    sweetness: Type.Integer({ minimum: 0, maximum: 100 }),
    yield: Type.Integer({ minimum: 0, maximum: 100 }),
    resistance: Type.Integer({ minimum: 0, maximum: 100 })
  },
  { additionalProperties: false }
)

export const BreedingHybridDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    parentCropA: ContentIdSchema,
    parentCropB: ContentIdSchema,
    minSweetness: Type.Integer({ minimum: 0, maximum: 100 }),
    minYield: Type.Integer({ minimum: 0, maximum: 100 }),
    resultCropId: ContentIdSchema,
    baseGenetics: BreedingHybridBaseGeneticsSchema,
    discoveryText: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.BreedingHybridDef', additionalProperties: false }
)

export const ProcessingMachineMaterialSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const ProcessingMachineDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    craftCost: Type.Array(ProcessingMachineMaterialSchema),
    craftMoney: Type.Integer({ minimum: 0 }),
    autoCollect: Type.Optional(Type.Boolean())
  },
  { $id: 'taoyuan.registry.ProcessingMachineDef', additionalProperties: false }
)

const ProcessingRecipeCommonFields = {
  id: ContentIdSchema,
  machineId: ContentIdSchema,
  name: LocalizedTextRefSchema,
  outputItemId: ContentIdSchema,
  outputQuantity: Type.Integer({ minimum: 1 }),
  processingDays: Type.Integer({ minimum: 1 }),
  description: LocalizedTextRefSchema
}

export const ProcessingRecipeWithInputDefSchema = Type.Object(
  {
    ...ProcessingRecipeCommonFields,
    inputItemId: ContentIdSchema,
    inputQuantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const ProcessingRecipeWithoutInputDefSchema = Type.Object(
  {
    ...ProcessingRecipeCommonFields,
    inputItemId: Type.Null(),
    inputQuantity: Type.Literal(0)
  },
  { additionalProperties: false }
)

export const ProcessingRecipeDefSchema = Type.Union(
  [
    ProcessingRecipeWithInputDefSchema,
    ProcessingRecipeWithoutInputDefSchema
  ],
  { $id: 'taoyuan.registry.ProcessingRecipeDef' }
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

export const EquipmentWeaponTypeSchema = Type.Union([
  Type.Literal('sword'),
  Type.Literal('dagger'),
  Type.Literal('club')
])

export const WearableEquipmentDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    kind: Type.Union([
      Type.Literal('ring'),
      Type.Literal('hat'),
      Type.Literal('shoe')
    ]),
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    effects: Type.Array(EquipmentEffectSchema),
    shopPrice: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
    recipe: Type.Union([Type.Array(EquipmentRecipeIngredientSchema), Type.Null()]),
    recipeMoney: Type.Integer({ minimum: 0 }),
    obtainSource: LocalizedTextRefSchema,
    sellPrice: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const WeaponEquipmentDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    kind: Type.Literal('weapon'),
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    weaponType: EquipmentWeaponTypeSchema,
    attack: Type.Integer({ minimum: 0 }),
    critRate: Type.Number({ minimum: 0 }),
    shopPrice: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    shopMaterials: Type.Array(EquipmentRecipeIngredientSchema),
    fixedEnchantment: Type.Union([ContentIdSchema, Type.Null()]),
    sellPrice: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const EquipmentDefSchema = Type.Union(
  [
    WearableEquipmentDefSchema,
    WeaponEquipmentDefSchema
  ],
  { $id: 'taoyuan.registry.EquipmentDef' }
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

const StoryQuestTargetObjectiveSchema = <T extends string>(type: T) => Type.Object(
  {
    type: Type.Literal(type),
    label: LocalizedTextRefSchema,
    target: Type.Integer({ minimum: 0 })
  },
  { additionalProperties: false }
)

export const StoryQuestObjectiveSchema = Type.Union([
  StoryQuestTargetObjectiveSchema('earnMoney'),
  StoryQuestTargetObjectiveSchema('reachMineFloor'),
  StoryQuestTargetObjectiveSchema('reachSkullFloor'),
  StoryQuestTargetObjectiveSchema('allSkillsLevel'),
  StoryQuestTargetObjectiveSchema('harvestCrops'),
  StoryQuestTargetObjectiveSchema('catchFish'),
  StoryQuestTargetObjectiveSchema('cookRecipes'),
  StoryQuestTargetObjectiveSchema('killMonsters'),
  StoryQuestTargetObjectiveSchema('discoverItems'),
  StoryQuestTargetObjectiveSchema('completeBundles'),
  StoryQuestTargetObjectiveSchema('completeQuests'),
  StoryQuestTargetObjectiveSchema('shipItems'),
  StoryQuestTargetObjectiveSchema('ownAnimals'),
  Type.Object(
    {
      type: Type.Literal('skillLevel'),
      label: LocalizedTextRefSchema,
      skillType: Type.Optional(SkillTypeSchema),
      target: Type.Integer({ minimum: 0 })
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('npcFriendship'),
      label: LocalizedTextRefSchema,
      npcId: Type.Union([ContentIdSchema, Type.Literal('_any')]),
      friendshipLevel: NpcFriendshipLevelSchema
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('npcAllFriendly'),
      label: LocalizedTextRefSchema,
      friendshipLevel: NpcFriendshipLevelSchema
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('deliverItem'),
      label: LocalizedTextRefSchema,
      itemId: ContentIdSchema,
      itemQuantity: Type.Integer({ minimum: 1 })
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('married'),
      label: LocalizedTextRefSchema
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal('hasChild'),
      label: LocalizedTextRefSchema
    },
    { additionalProperties: false }
  )
])

export const StoryQuestRewardItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const StoryQuestFriendshipRewardSchema = Type.Object(
  {
    npcId: ContentIdSchema,
    amount: Type.Integer()
  },
  { additionalProperties: false }
)

export const StoryQuestDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    chapter: Type.Integer({ minimum: 1 }),
    order: Type.Integer({ minimum: 1 }),
    title: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    npcId: ContentIdSchema,
    objectives: Type.Array(StoryQuestObjectiveSchema, { minItems: 1 }),
    moneyReward: Type.Integer({ minimum: 0 }),
    friendshipReward: Type.Optional(Type.Array(StoryQuestFriendshipRewardSchema, { minItems: 1 })),
    itemReward: Type.Optional(Type.Array(StoryQuestRewardItemSchema, { minItems: 1 }))
  },
  { $id: 'taoyuan.registry.StoryQuestDef', additionalProperties: false }
)

export const AchievementRewardItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const AchievementRewardSchema = Type.Object(
  {
    money: Type.Optional(Type.Integer({ minimum: 0 })),
    items: Type.Optional(Type.Array(AchievementRewardItemSchema, { minItems: 1 }))
  },
  { additionalProperties: false }
)

export const AchievementConditionSchema = Type.Union([
  Type.Object({ type: Type.Literal('itemCount'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('cropHarvest'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('fishCaught'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('moneyEarned'), amount: Type.Integer({ minimum: 0 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('mineFloor'), floor: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('skullCavernFloor'), floor: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('recipesCooked'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('npcFriendship'), level: Type.String({ minLength: 1 }) }, { additionalProperties: false }),
  Type.Object({
    type: Type.Literal('skillLevel'),
    skillType: SkillTypeSchema,
    level: Type.Integer({ minimum: 0 })
  }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('questsCompleted'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('npcBestFriend'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('npcAllFriendly') }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('married') }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('hasChild') }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('monstersKilled'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('shippedCount'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('fullShipment') }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('animalCount'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('allSkillsMax') }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('allBundlesComplete') }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('hybridsDiscovered'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('breedingsDone'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('hybridTier'), tier: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('hybridsShipped'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('museumDonations'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('guildGoalsCompleted'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('hiddenNpcRevealed'), count: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('hiddenNpcBonded') }, { additionalProperties: false }),
  Type.Object({ type: Type.Literal('itemDiscovered'), itemId: ContentIdSchema }, { additionalProperties: false })
])

export const AchievementDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    condition: AchievementConditionSchema,
    reward: AchievementRewardSchema
  },
  { $id: 'taoyuan.registry.AchievementDef', additionalProperties: false }
)

export const CommunityBundleRequiredItemSchema = Type.Object(
  {
    itemId: ContentIdSchema,
    quantity: Type.Integer({ minimum: 1 })
  },
  { additionalProperties: false }
)

export const CommunityBundleRewardSchema = Type.Object(
  {
    money: Type.Optional(Type.Integer({ minimum: 0 })),
    items: Type.Optional(Type.Array(AchievementRewardItemSchema, { minItems: 1 })),
    description: LocalizedTextRefSchema
  },
  { additionalProperties: false }
)

export const CommunityBundleDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    requiredItems: Type.Array(CommunityBundleRequiredItemSchema, { minItems: 1 }),
    reward: CommunityBundleRewardSchema
  },
  { $id: 'taoyuan.registry.CommunityBundleDef', additionalProperties: false }
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
  'taoyuan:museum_category': MuseumCategoryDefSchema,
  'taoyuan:museum_item': MuseumItemDefSchema,
  'taoyuan:museum_milestone': MuseumMilestoneDefSchema,
  'taoyuan:guild_goal': GuildGoalDefSchema,
  'taoyuan:guild_donation': GuildDonationDefSchema,
  'taoyuan:guild_level': GuildLevelDefSchema,
  'taoyuan:npc': NpcDefSchema,
  'taoyuan:heart_event': HeartEventDefSchema,
  'taoyuan:hidden_npc': HiddenNpcDefSchema,
  'taoyuan:story_quest': StoryQuestDefSchema,
  'taoyuan:secret_note': SecretNoteDefSchema,
  'taoyuan:tutorial': TutorialDefSchema,
  'taoyuan:morning_event': MorningEventDefSchema,
  'taoyuan:season_event': SeasonEventDefSchema,
  'taoyuan:quest_template': QuestTemplateDefSchema,
  'taoyuan:farm_map': FarmMapDefSchema,
  'taoyuan:animal_building': AnimalBuildingDefSchema,
  'taoyuan:animal_incubation': AnimalIncubationDefSchema,
  'taoyuan:breeding_hybrid': BreedingHybridDefSchema,
  'taoyuan:processing_machine': ProcessingMachineDefSchema,
  'taoyuan:processing_recipe': ProcessingRecipeDefSchema,
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
  'taoyuan:achievement': AchievementDefSchema,
  'taoyuan:community_bundle': CommunityBundleDefSchema,
  'taoyuan:shop': ShopDefSchema,
  'taoyuan:shop_offer': ShopOfferDefSchema,
  'taoyuan:market_category': MarketCategoryDefSchema
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
  'museum-category.schema.json': MuseumCategoryDefSchema,
  'museum-item.schema.json': MuseumItemDefSchema,
  'museum-milestone.schema.json': MuseumMilestoneDefSchema,
  'guild-goal.schema.json': GuildGoalDefSchema,
  'guild-donation.schema.json': GuildDonationDefSchema,
  'guild-level.schema.json': GuildLevelDefSchema,
  'npc.schema.json': NpcDefSchema,
  'heart-event.schema.json': HeartEventDefSchema,
  'hidden-npc.schema.json': HiddenNpcDefSchema,
  'story-quest.schema.json': StoryQuestDefSchema,
  'secret-note.schema.json': SecretNoteDefSchema,
  'tutorial.schema.json': TutorialDefSchema,
  'morning-event.schema.json': MorningEventDefSchema,
  'season-event.schema.json': SeasonEventDefSchema,
  'quest-template.schema.json': QuestTemplateDefSchema,
  'farm-map.schema.json': FarmMapDefSchema,
  'animal-building.schema.json': AnimalBuildingDefSchema,
  'animal-incubation.schema.json': AnimalIncubationDefSchema,
  'breeding-hybrid.schema.json': BreedingHybridDefSchema,
  'processing-machine.schema.json': ProcessingMachineDefSchema,
  'processing-recipe.schema.json': ProcessingRecipeDefSchema,
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
  'achievement.schema.json': AchievementDefSchema,
  'community-bundle.schema.json': CommunityBundleDefSchema,
  'shop.schema.json': ShopDefSchema,
  'shop-offer.schema.json': ShopOfferDefSchema,
  'market-category.schema.json': MarketCategoryDefSchema
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
export type MarketSeasonCoefficients = Static<typeof MarketSeasonCoefficientsSchema>
export type MarketSupplyThresholds = Static<typeof MarketSupplyThresholdsSchema>
export type MarketCategoryDef = Static<typeof MarketCategoryDefSchema>
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
export type MuseumCategoryKey = Static<typeof MuseumCategoryKeySchema>
export type MuseumCategoryDef = Static<typeof MuseumCategoryDefSchema>
export type MuseumItemDef = Static<typeof MuseumItemDefSchema>
export type MuseumMilestoneRewardItem = Static<typeof MuseumMilestoneRewardItemSchema>
export type MuseumMilestoneReward = Static<typeof MuseumMilestoneRewardSchema>
export type MuseumMilestoneDef = Static<typeof MuseumMilestoneDefSchema>
export type GuildGoalZone = Static<typeof GuildGoalZoneSchema>
export type GuildGoalRewardItem = Static<typeof GuildGoalRewardItemSchema>
export type GuildGoalReward = Static<typeof GuildGoalRewardSchema>
export type GuildGoalDef = Static<typeof GuildGoalDefSchema>
export type GuildDonationDef = Static<typeof GuildDonationDefSchema>
export type GuildLevelDef = Static<typeof GuildLevelDefSchema>
export type GenderDef = Static<typeof GenderSchema>
export type NpcFriendshipLevel = Static<typeof NpcFriendshipLevelSchema>
export type NpcDialogues = Static<typeof NpcDialoguesSchema>
export type NpcBirthday = Static<typeof NpcBirthdaySchema>
export type NpcDef = Static<typeof NpcDefSchema>
export type HeartEventSceneChoice = Static<typeof HeartEventSceneChoiceSchema>
export type HeartEventScene = Static<typeof HeartEventSceneSchema>
export type HeartEventDef = Static<typeof HeartEventDefSchema>
export type HiddenNpcDiscoveryPhase = Static<typeof HiddenNpcDiscoveryPhaseSchema>
export type HiddenNpcAffinityLevel = Static<typeof HiddenNpcAffinityLevelSchema>
export type HiddenNpcSceneChoice = Static<typeof HiddenNpcSceneChoiceSchema>
export type HiddenNpcScene = Static<typeof HiddenNpcSceneSchema>
export type HiddenNpcDiscoveryCondition = Static<typeof HiddenNpcDiscoveryConditionSchema>
export type HiddenNpcDiscoveryStep = Static<typeof HiddenNpcDiscoveryStepSchema>
export type HiddenNpcDialogues = Static<typeof HiddenNpcDialoguesSchema>
export type HiddenNpcInteractionType = Static<typeof HiddenNpcInteractionTypeSchema>
export type HiddenNpcPassive = Static<typeof HiddenNpcPassiveSchema>
export type HiddenNpcAbility = Static<typeof HiddenNpcAbilitySchema>
export type HiddenNpcCraftCost = Static<typeof HiddenNpcCraftCostSchema>
export type HiddenNpcBondBonus = Static<typeof HiddenNpcBondBonusSchema>
export type HiddenNpcDef = Static<typeof HiddenNpcDefSchema>
export type StoryQuestObjective = Static<typeof StoryQuestObjectiveSchema>
export type StoryQuestRewardItem = Static<typeof StoryQuestRewardItemSchema>
export type StoryQuestFriendshipReward = Static<typeof StoryQuestFriendshipRewardSchema>
export type StoryQuestDef = Static<typeof StoryQuestDefSchema>
export type SecretNoteType = Static<typeof SecretNoteTypeSchema>
export type SecretNoteRewardItem = Static<typeof SecretNoteRewardItemSchema>
export type SecretNoteReward = Static<typeof SecretNoteRewardSchema>
export type SecretNoteDef = Static<typeof SecretNoteDefSchema>
export type TutorialConditionKey = Static<typeof TutorialConditionKeySchema>
export type TutorialDef = Static<typeof TutorialDefSchema>
export type MorningEventEffect = Static<typeof MorningEventEffectSchema>
export type MorningEventChoice = Static<typeof MorningEventChoiceSchema>
export type MorningNarrationEventDef = Static<typeof MorningNarrationEventDefSchema>
export type MorningChoiceEventDef = Static<typeof MorningChoiceEventDefSchema>
export type MorningEasterEggEventDef = Static<typeof MorningEasterEggEventDefSchema>
export type MorningEventDef = Static<typeof MorningEventDefSchema>
export type SeasonEventFestivalType = Static<typeof SeasonEventFestivalTypeSchema>
export type SeasonEventRewardItem = Static<typeof SeasonEventRewardItemSchema>
export type SeasonEventEffects = Static<typeof SeasonEventEffectsSchema>
export type SeasonEventDef = Static<typeof SeasonEventDefSchema>
export type QuestTemplateType = Static<typeof QuestTemplateTypeSchema>
export type QuestTemplateTarget = Static<typeof QuestTemplateTargetSchema>
export type QuestTemplateRewardItem = Static<typeof QuestTemplateRewardItemSchema>
export type BoardQuestTemplateDef = Static<typeof BoardQuestTemplateDefSchema>
export type SpecialOrderTemplateDef = Static<typeof SpecialOrderTemplateDefSchema>
export type QuestTemplateDef = Static<typeof QuestTemplateDefSchema>
export type FarmMapType = Static<typeof FarmMapTypeSchema>
export type FarmMapDef = Static<typeof FarmMapDefSchema>
export type AnimalBuildingDef = Static<typeof AnimalBuildingDefSchema>
export type AnimalBuildingMaterial = Static<typeof AnimalBuildingMaterialSchema>
export type AnimalBuildingUpgrade = Static<typeof AnimalBuildingUpgradeSchema>
export type AnimalIncubationDef = Static<typeof AnimalIncubationDefSchema>
export type BreedingHybridBaseGenetics = Static<typeof BreedingHybridBaseGeneticsSchema>
export type BreedingHybridDef = Static<typeof BreedingHybridDefSchema>
export type ProcessingMachineMaterial = Static<typeof ProcessingMachineMaterialSchema>
export type ProcessingMachineDef = Static<typeof ProcessingMachineDefSchema>
export type ProcessingRecipeDef = Static<typeof ProcessingRecipeDefSchema>
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
export type EquipmentWeaponType = Static<typeof EquipmentWeaponTypeSchema>
export type EquipmentDef = Static<typeof EquipmentDefSchema>
export type WearableEquipmentDef = Extract<EquipmentDef, { kind: 'ring' | 'hat' | 'shoe' }>
export type WeaponEquipmentDef = Extract<EquipmentDef, { kind: 'weapon' }>
export type EquipmentSetPieces = Static<typeof EquipmentSetPiecesSchema>
export type EquipmentSetBonus = Static<typeof EquipmentSetBonusSchema>
export type EquipmentSetDef = Static<typeof EquipmentSetDefSchema>
export type EnchantmentDef = Static<typeof EnchantmentDefSchema>
export type RecipeIngredient = Static<typeof RecipeIngredientSchema>
export type RecipeDef = Static<typeof RecipeDefSchema>
export type AchievementRewardItem = Static<typeof AchievementRewardItemSchema>
export type AchievementReward = Static<typeof AchievementRewardSchema>
export type AchievementCondition = Static<typeof AchievementConditionSchema>
export type AchievementDef = Static<typeof AchievementDefSchema>
export type CommunityBundleRequiredItem = Static<typeof CommunityBundleRequiredItemSchema>
export type CommunityBundleReward = Static<typeof CommunityBundleRewardSchema>
export type CommunityBundleDef = Static<typeof CommunityBundleDefSchema>
export type ShopDef = Static<typeof ShopDefSchema>
export type ShopOfferPurchaseKind = Static<typeof ShopOfferPurchaseKindSchema>
export type ShopOfferDef = Static<typeof ShopOfferDefSchema>

export type OfficialRegistryId = keyof typeof OFFICIAL_REGISTRY_SCHEMAS
