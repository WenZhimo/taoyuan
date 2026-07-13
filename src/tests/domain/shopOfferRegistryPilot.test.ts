import { describe, expect, it } from 'vitest'
import { CROPS } from '@/data/crops'
import { FRUIT_TREE_DEFS } from '@/data/fruitTrees'
import { HAY_PRICE } from '@/data/animals'
import { SHOP_WEAPONS } from '@/data/weapons'
import { BAITS, FERTILIZERS, TACKLES } from '@/data/processing'
import { SHOP_HATS } from '@/data/hats'
import { SHOP_SHOES } from '@/data/shoes'
import { getOfficialShopOfferGroupsForShop, getOfficialShopOffersForShop } from '@/domain/mods/contentAccess'
import type { Season, ShopOfferDef } from '@/domain/mods/schemas'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

interface ExpectedOffer {
  itemId: string
  name?: string
  description?: string
  price: number
  groupId: string
  groupName: string
  purchaseKind?: ShopOfferDef['purchaseKind']
}

const normalizeOffer = (offer: Readonly<ShopOfferDef>) => ({
  itemId: localId(offer.itemId),
  name: offer.name?.fallback,
  description: offer.description?.fallback,
  price: offer.price,
  groupId: offer.groupId,
  groupName: offer.groupName?.fallback,
  purchaseKind: offer.purchaseKind
})

const expectShopOffers = (shopId: string, expected: ExpectedOffer[], season?: Season) => {
  expect(getOfficialShopOffersForShop({ shopId, season }).map(normalizeOffer)).toEqual(expected)
}

const fruitTreeOffers = (): ExpectedOffer[] => FRUIT_TREE_DEFS.map(tree => ({
  itemId: tree.saplingId,
  name: `${tree.name}苗`,
  description: `28天成熟 · ${tree.fruitName}`,
  price: tree.saplingPrice,
  groupId: 'goods',
  groupName: '杂货'
}))

const wanwupuGoods = (): ExpectedOffer[] => [
  ...fruitTreeOffers(),
  { itemId: 'hay', name: '干草', description: '喂养牲畜用', price: HAY_PRICE, groupId: 'goods', groupName: '杂货' },
  { itemId: 'wood', name: '木材', description: '建筑和加工的基础材料', price: 50, groupId: 'goods', groupName: '杂货' },
  { itemId: 'sleeping_bag', name: '睡袋', description: '资源地点可原地过夜', price: 1200, groupId: 'goods', groupName: '杂货' },
  { itemId: 'rain_totem', name: '雨图腾', description: '使用后可以让明天下雨', price: 300, groupId: 'goods', groupName: '杂货' }
]

const seedOffersForSeason = (season: Season): ExpectedOffer[] => CROPS
  .filter(crop => crop.seedPrice > 0 && crop.season.includes(season))
  .map(crop => ({
    itemId: crop.seedId,
    name: `${crop.name}种子`,
    description: `${crop.growthDays}天成熟 → 售${crop.sellPrice}文`,
    price: crop.seedPrice,
    groupId: 'seasonal_seeds',
    groupName: '当季种子',
    purchaseKind: 'seed' as const
  }))

const blacksmithOffers: ExpectedOffer[] = [
  { itemId: 'copper_ore', name: '铜矿', price: 100, description: '矿洞中常见的铜矿', groupId: 'materials', groupName: '材料' },
  { itemId: 'iron_ore', name: '铁矿', price: 200, description: '中层矿洞出产的铁矿', groupId: 'materials', groupName: '材料' },
  { itemId: 'gold_ore', name: '金矿', price: 400, description: '深层矿洞出产的金矿', groupId: 'materials', groupName: '材料' },
  { itemId: 'copper_bar', name: '铜锭', price: 300, description: '冶炼好的铜锭', groupId: 'materials', groupName: '材料' },
  { itemId: 'iron_bar', name: '铁锭', price: 600, description: '冶炼好的铁锭', groupId: 'materials', groupName: '材料' },
  { itemId: 'gold_bar', name: '金锭', price: 1200, description: '冶炼好的金锭', groupId: 'materials', groupName: '材料' },
  { itemId: 'charcoal', name: '木炭', price: 100, description: '烧制的木炭', groupId: 'materials', groupName: '材料' }
]

const apothecaryItems: ExpectedOffer[] = [
  { itemId: 'herb', name: '草药', price: 50, description: '山间野生的草药', groupId: 'medicine', groupName: '药材' },
  { itemId: 'ginseng', name: '人参', price: 600, description: '极其珍贵的野生人参', groupId: 'medicine', groupName: '药材' },
  { itemId: 'animal_medicine', name: '兽药', price: 150, description: '治疗生病的牲畜', groupId: 'medicine', groupName: '药材' },
  { itemId: 'premium_feed', name: '精饲料', price: 200, description: '提升动物心情和好感', groupId: 'medicine', groupName: '药材' },
  { itemId: 'nourishing_feed', name: '滋补饲料', price: 250, description: '加速动物产出', groupId: 'medicine', groupName: '药材' },
  { itemId: 'vitality_feed', name: '活力饲料', price: 300, description: '喂食必定治愈疾病', groupId: 'medicine', groupName: '药材' },
  { itemId: 'fish_feed', name: '鱼饲料', price: 30, description: '鱼塘专用饲料', groupId: 'medicine', groupName: '药材' },
  { itemId: 'water_purifier', name: '水质改良剂', price: 100, description: '改善鱼塘水质', groupId: 'medicine', groupName: '药材' }
]

const textileItems: ExpectedOffer[] = [
  { itemId: 'cloth', name: '布匹', price: 1200, description: '用羊毛纺织的布匹', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'silk_cloth', name: '丝绸', price: 500, description: '华美的丝绸', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'alpaca_cloth', name: '羊驼绒', price: 900, description: '极其柔软的羊驼绒布', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'felt', name: '毛毡', price: 600, description: '用兔毛压制的毛毡', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'silk_ribbon', name: '丝帕', price: 500, description: '精心绣制的丝帕', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'jade_ring', name: '翡翠戒指', price: 1500, description: '可以用来求婚', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'zhiji_jade', name: '知己玉佩', price: 1500, description: '赠予同性挚友可结为知己', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'pine_incense', name: '松香', price: 250, description: '清新的松香', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'camphor_incense', name: '樟脑香', price: 400, description: '提神醒脑', groupId: 'textiles', groupName: '布匹' },
  { itemId: 'osmanthus_incense', name: '桂花香', price: 800, description: '馥郁的桂花香', groupId: 'textiles', groupName: '布匹' }
]

describe('official shop offer registry pilot', () => {
  it('keeps seasonal seed visibility equivalent to the legacy crop lookup', () => {
    for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
      expectShopOffers('wanwupu', [...seedOffersForSeason(season), ...wanwupuGoods()], season)
    }
  })

  it('keeps the five non-seed shop product pools equivalent to legacy sources', () => {
    expectShopOffers('tiejiangpu', blacksmithOffers)
    expectShopOffers('biaoju', SHOP_WEAPONS.map(weapon => ({
      itemId: weapon.id,
      name: weapon.name,
      description: weapon.description,
      price: weapon.shopPrice!,
      groupId: 'weapons',
      groupName: '武器',
      purchaseKind: 'weapon' as const
    })))
    expectShopOffers('yugupu', [
      ...BAITS.filter(bait => bait.shopPrice !== null).map(bait => ({
        itemId: bait.id,
        name: bait.name,
        description: bait.description,
        price: bait.shopPrice!,
        groupId: 'baits',
        groupName: '鱼饵'
      })),
      ...TACKLES.filter(tackle => tackle.shopPrice !== null).map(tackle => ({
        itemId: tackle.id,
        name: tackle.name,
        description: tackle.description,
        price: tackle.shopPrice!,
        groupId: 'tackles',
        groupName: '浮漂'
      })),
      {
        itemId: 'crab_pot',
        name: '蟹笼',
        description: '放置在钓鱼地点，每日自动捕获水产（需鱼饵）',
        price: 1500,
        groupId: 'tools',
        groupName: '其他商品'
      }
    ])
    expectShopOffers('yaopu', [
      ...FERTILIZERS.filter(fertilizer => fertilizer.shopPrice !== null).map(fertilizer => ({
        itemId: fertilizer.id,
        name: fertilizer.name,
        description: fertilizer.description,
        price: fertilizer.shopPrice!,
        groupId: 'fertilizers',
        groupName: '肥料'
      })),
      ...apothecaryItems
    ])
    expectShopOffers('chouduanzhuang', [
      ...textileItems,
      ...SHOP_HATS.map(hat => ({
        itemId: hat.id,
        name: hat.name,
        description: hat.description,
        price: hat.shopPrice!,
        groupId: 'hats',
        groupName: '帽子',
        purchaseKind: 'hat' as const
      })),
      ...SHOP_SHOES.map(shoe => ({
        itemId: shoe.id,
        name: shoe.name,
        description: shoe.description,
        price: shoe.shopPrice!,
        groupId: 'shoes',
        groupName: '鞋子',
        purchaseKind: 'shoe' as const
      }))
    ])
  })

  it('returns stable display groups for the future ShopView renderer', () => {
    expect(getOfficialShopOfferGroupsForShop({ shopId: 'yugupu' }).map(group => ({
      groupId: group.groupId,
      groupName: group.groupName,
      count: group.offers.length
    }))).toEqual([
      { groupId: 'baits', groupName: '鱼饵', count: BAITS.filter(bait => bait.shopPrice !== null).length },
      { groupId: 'tackles', groupName: '浮漂', count: TACKLES.filter(tackle => tackle.shopPrice !== null).length },
      { groupId: 'tools', groupName: '其他商品', count: 1 }
    ])

    expect(getOfficialShopOfferGroupsForShop({ shopId: 'missing_shop' })).toEqual([])
  })
})
