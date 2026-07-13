import { Type, type Static, type TSchema } from '@sinclair/typebox'
import { NAMESPACED_ID_PATTERN, PACKAGE_ID_PATTERN } from './ids'

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

export const EnchantmentDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    description: LocalizedTextRefSchema,
    attackBonus: Type.Number(),
    critBonus: Type.Number(),
    special: EnchantmentSpecialSchema
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

export const RecipeDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    name: LocalizedTextRefSchema,
    ingredients: Type.Array(RecipeIngredientSchema),
    outputItemId: ContentIdSchema,
    outputQuantity: Type.Integer({ minimum: 1 }),
    description: LocalizedTextRefSchema
  },
  { $id: 'taoyuan.registry.RecipeDef', additionalProperties: false }
)

export const ShopOfferDefSchema = Type.Object(
  {
    id: ContentIdSchema,
    shopId: ContentIdSchema,
    itemId: ContentIdSchema,
    name: Type.Optional(LocalizedTextRefSchema),
    price: Type.Integer({ minimum: 0 }),
    quantity: Type.Optional(Type.Integer({ minimum: 1 })),
    weeklyLimit: Type.Optional(Type.Integer({ minimum: 0 })),
    totalLimit: Type.Optional(Type.Integer({ minimum: 0 }))
  },
  { $id: 'taoyuan.registry.ShopOfferDef', additionalProperties: false }
)

export const OFFICIAL_REGISTRY_SCHEMAS = {
  'taoyuan:tag': TagDefSchema,
  'taoyuan:item': ItemDefSchema,
  'taoyuan:crop': CropDefSchema,
  'taoyuan:monster': MonsterDefSchema,
  'taoyuan:enchantment': EnchantmentDefSchema,
  'taoyuan:drop_table': DropTableDefSchema,
  'taoyuan:recipe': RecipeDefSchema,
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
  'monster.schema.json': MonsterDefSchema,
  'enchantment.schema.json': EnchantmentDefSchema,
  'drop-table.schema.json': DropTableDefSchema,
  'recipe.schema.json': RecipeDefSchema,
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
export type CropDef = Static<typeof CropDefSchema>
export type DropTableDef = Static<typeof DropTableDefSchema>
export type MonsterDef = Static<typeof MonsterDefSchema>
export type EnchantmentDef = Static<typeof EnchantmentDefSchema>
export type RecipeIngredient = Static<typeof RecipeIngredientSchema>
export type RecipeDef = Static<typeof RecipeDefSchema>
export type ShopOfferDef = Static<typeof ShopOfferDefSchema>

export type OfficialRegistryId = keyof typeof OFFICIAL_REGISTRY_SCHEMAS
