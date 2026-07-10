import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { getCustomEnchantmentCost } from '@/data/weapons'
import { MAX_STACK, useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

describe('inventory store item stacks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('stacks same item and quality far beyond the old 999 limit', () => {
    const inventoryStore = useInventoryStore()

    expect(inventoryStore.addItem('wood', 1_000, 'normal')).toBe(true)
    expect(inventoryStore.addItem('wood', 250_000, 'normal')).toBe(true)

    expect(inventoryStore.getItemCount('wood')).toBe(251_000)
    expect(inventoryStore.items).toHaveLength(1)
    expect(inventoryStore.items[0]).toMatchObject({
      itemId: 'wood',
      quality: 'normal',
      quantity: 251_000
    })
  })

  it('splits only when a stack reaches the intentionally huge cap', () => {
    const inventoryStore = useInventoryStore()

    expect(inventoryStore.addItem('wood', MAX_STACK + 1, 'normal')).toBe(true)

    expect(inventoryStore.getItemCount('wood')).toBe(MAX_STACK + 1)
    expect(inventoryStore.items).toHaveLength(2)
    expect(inventoryStore.items[0]?.quantity).toBe(MAX_STACK)
    expect(inventoryStore.items[1]?.quantity).toBe(1)
  })

  it('keeps large same-stack additions cheap', () => {
    const inventoryStore = useInventoryStore()
    const start = performance.now()

    for (let i = 0; i < 10_000; i++) {
      inventoryStore.addItem('wood', 100, 'normal')
    }

    expect(inventoryStore.getItemCount('wood')).toBe(1_000_000)
    expect(inventoryStore.items).toHaveLength(1)
    const averageAddMs = (performance.now() - start) / 10_000
    expect(averageAddMs).toBeLessThan(0.1)
  })

  it('moves a temporary item into matching main stacks and removes it when fully moved', () => {
    const inventoryStore = useInventoryStore()

    inventoryStore.capacity = 1
    inventoryStore.items = [{ itemId: 'wood', quantity: MAX_STACK - 10, quality: 'normal' }]
    inventoryStore.tempItems = [{ itemId: 'wood', quantity: 5, quality: 'normal' }]
    expect(inventoryStore.items).toEqual([{ itemId: 'wood', quantity: MAX_STACK - 10, quality: 'normal' }])
    expect(inventoryStore.tempItems).toEqual([{ itemId: 'wood', quantity: 5, quality: 'normal' }])

    expect(inventoryStore.moveFromTemp(0)).toBe(true)

    expect(inventoryStore.items).toEqual([{ itemId: 'wood', quantity: MAX_STACK - 5, quality: 'normal' }])
    expect(inventoryStore.tempItems).toHaveLength(0)
  })

  it('leaves the remaining temporary quantity when only part can move', () => {
    const inventoryStore = useInventoryStore()

    inventoryStore.capacity = 1
    inventoryStore.items = [{ itemId: 'wood', quantity: MAX_STACK - 5, quality: 'normal' }]
    inventoryStore.tempItems = [{ itemId: 'wood', quantity: 20, quality: 'normal' }]

    expect(inventoryStore.moveFromTemp(0)).toBe(false)

    expect(inventoryStore.items).toEqual([{ itemId: 'wood', quantity: MAX_STACK, quality: 'normal' }])
    expect(inventoryStore.tempItems).toEqual([{ itemId: 'wood', quantity: 15, quality: 'normal' }])
  })

  it('moves all eligible temporary stacks in reverse order', () => {
    const inventoryStore = useInventoryStore()

    inventoryStore.capacity = 2
    inventoryStore.items = [
      { itemId: 'wood', quantity: MAX_STACK - 1, quality: 'normal' },
      { itemId: 'stone', quantity: MAX_STACK - 1, quality: 'normal' }
    ]
    inventoryStore.tempItems = [
      { itemId: 'wood', quantity: 1, quality: 'normal' },
      { itemId: 'stone', quantity: 1, quality: 'normal' }
    ]

    expect(inventoryStore.moveAllFromTemp()).toBe(2)

    expect(inventoryStore.items).toEqual([
      { itemId: 'wood', quantity: MAX_STACK, quality: 'normal' },
      { itemId: 'stone', quantity: MAX_STACK, quality: 'normal' }
    ])
    expect(inventoryStore.tempItems).toHaveLength(0)
  })

  it('tracks pending tool upgrades and completes them after two daily updates', () => {
    const inventoryStore = useInventoryStore()

    expect(inventoryStore.startUpgrade('hoe', 'iron')).toBe(true)
    expect(inventoryStore.startUpgrade('hoe', 'steel')).toBe(false)
    expect(inventoryStore.isToolAvailable('hoe')).toBe(false)

    expect(inventoryStore.dailyUpgradeUpdate()).toEqual([])
    expect(inventoryStore.getTool('hoe')?.tier).toBe('basic')
    expect(inventoryStore.pendingUpgrades).toEqual([{ toolType: 'hoe', targetTier: 'iron', daysRemaining: 1 }])

    expect(inventoryStore.dailyUpgradeUpdate()).toEqual([{ completed: true, toolType: 'hoe', targetTier: 'iron' }])
    expect(inventoryStore.getTool('hoe')?.tier).toBe('iron')
    expect(inventoryStore.pendingUpgrades).toHaveLength(0)
    expect(inventoryStore.isToolAvailable('hoe')).toBe(true)
  })

  it('creates, renames, saves, and deletes equipment presets', () => {
    const inventoryStore = useInventoryStore()

    expect(inventoryStore.createEquipmentPreset('combat preset')).toBe(true)
    const presetId = inventoryStore.equipmentPresets[0]?.id
    expect(presetId).toBeTruthy()
    expect(inventoryStore.equipmentPresets[0]).toMatchObject({
      name: 'combat preset',
      weaponDefId: null,
      ringSlot1DefId: null,
      ringSlot2DefId: null,
      hatDefId: null,
      shoeDefId: null
    })

    inventoryStore.renameEquipmentPreset(presetId!, '  mining preset  ')
    expect(inventoryStore.equipmentPresets[0]?.name).toBe('mining preset')
    inventoryStore.renameEquipmentPreset(presetId!, '   ')
    expect(inventoryStore.equipmentPresets[0]?.name).toBe('mining preset')

    inventoryStore.addWeapon('rusty_sword')
    expect(inventoryStore.equipWeapon(1)).toBe(true)
    inventoryStore.saveCurrentToPreset(presetId!)
    expect(inventoryStore.equipmentPresets[0]).toMatchObject({
      weaponDefId: 'rusty_sword',
      ringSlot1DefId: null,
      ringSlot2DefId: null,
      hatDefId: null,
      shoeDefId: null
    })

    inventoryStore.activePresetId = presetId!
    inventoryStore.deleteEquipmentPreset(presetId!)
    expect(inventoryStore.equipmentPresets).toHaveLength(0)
    expect(inventoryStore.activePresetId).toBeNull()
  })

  it('applies equipment presets while reporting missing equipment', () => {
    const inventoryStore = useInventoryStore()

    inventoryStore.addWeapon('rusty_sword')
    inventoryStore.addRing('ruby_ring')
    inventoryStore.addRing('emerald_ring')
    inventoryStore.addHat('straw_hat')
    inventoryStore.addShoe('leather_boots')
    inventoryStore.equipmentPresets = [
      {
        id: 'legacy',
        name: 'legacy preset',
        weaponDefId: 'rusty_sword',
        ringSlot1DefId: 'ruby_ring',
        ringSlot2DefId: 'ruby_ring',
        hatDefId: null,
        shoeDefId: 'missing_shoes'
      }
    ]
    expect(inventoryStore.equipRing(1, 1)).toBe(true)
    expect(inventoryStore.equipHat(0)).toBe(true)
    expect(inventoryStore.equipShoe(0)).toBe(true)

    expect(inventoryStore.applyEquipmentPreset('legacy')).toEqual({
      success: true,
      message: '已应用方案「legacy preset」，但戒指2（不可与槽1相同）、鞋子已不在背包中。'
    })

    expect(inventoryStore.equippedWeaponIndex).toBe(1)
    expect(inventoryStore.equippedRingSlot1).toBe(0)
    expect(inventoryStore.equippedRingSlot2).toBe(-1)
    expect(inventoryStore.equippedHatIndex).toBe(-1)
    expect(inventoryStore.equippedShoeIndex).toBe(0)
    expect(inventoryStore.activePresetId).toBe('legacy')
  })

  it('customizes and removes weapon enchantments while charging money', () => {
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const enchantmentIds = ['sharp', 'lucky']
    const customizeCost = getCustomEnchantmentCost(enchantmentIds)

    playerStore.money = customizeCost - 1
    expect(inventoryStore.customizeWeaponEnchantments(0, enchantmentIds)).toEqual({
      success: false,
      message: `铜钱不足（需要${customizeCost}文）。`,
      cost: customizeCost
    })
    expect(inventoryStore.ownedWeapons[0]?.enchantmentIds).toEqual([])

    playerStore.money = customizeCost
    expect(inventoryStore.customizeWeaponEnchantments(0, enchantmentIds)).toEqual({
      success: true,
      message: '定制附魔完成，共2条附魔。',
      enchantmentIds,
      cost: customizeCost
    })
    expect(playerStore.money).toBe(0)
    expect(inventoryStore.ownedWeapons[0]).toMatchObject({
      enchantmentId: 'sharp',
      enchantmentIds
    })

    playerStore.money = 0
    const failedDisenchant = inventoryStore.disenchantWeapon(0)
    expect(failedDisenchant.success).toBe(false)
    expect(failedDisenchant.message).toMatch(/^铜钱不足/)
    expect(inventoryStore.ownedWeapons[0]?.enchantmentIds).toEqual(enchantmentIds)

    playerStore.money = failedDisenchant.cost ?? 0
    expect(inventoryStore.disenchantWeapon(0)).toEqual({
      success: true,
      message: '附魔已祛除。',
      enchantmentIds: [],
      cost: failedDisenchant.cost
    })
    expect(playerStore.money).toBe(0)
    expect(inventoryStore.ownedWeapons[0]).toMatchObject({
      enchantmentId: null,
      enchantmentIds: []
    })
  })

  it('sells equipment while correcting equipped indices and granting money', () => {
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    playerStore.money = 0

    inventoryStore.addWeapon('copper_sword')
    inventoryStore.addWeapon('iron_blade')
    expect(inventoryStore.equipWeapon(2)).toBe(true)

    const weaponSale = inventoryStore.sellWeapon(1)
    expect(weaponSale.success).toBe(true)
    expect(weaponSale.message).toMatch(/^卖出了/)
    expect(inventoryStore.ownedWeapons.map(weapon => weapon.defId)).toEqual(['wooden_stick', 'iron_blade'])
    expect(inventoryStore.equippedWeaponIndex).toBe(1)
    expect(playerStore.money).toBeGreaterThan(0)

    inventoryStore.addRing('ruby_ring')
    inventoryStore.addRing('emerald_ring')
    inventoryStore.addRing('lucky_ring')
    expect(inventoryStore.equipRing(0, 0)).toBe(true)
    expect(inventoryStore.equipRing(2, 1)).toBe(true)

    const moneyAfterWeaponSale = playerStore.money
    expect(inventoryStore.sellRing(1).success).toBe(true)
    expect(inventoryStore.ownedRings.map(ring => ring.defId)).toEqual(['ruby_ring', 'lucky_ring'])
    expect(inventoryStore.equippedRingSlot1).toBe(0)
    expect(inventoryStore.equippedRingSlot2).toBe(1)
    expect(playerStore.money).toBeGreaterThanOrEqual(moneyAfterWeaponSale)

    inventoryStore.addHat('straw_hat')
    inventoryStore.addHat('miner_hat')
    expect(inventoryStore.equipHat(1)).toBe(true)
    expect(inventoryStore.sellHat(0).success).toBe(true)
    expect(inventoryStore.ownedHats.map(hat => hat.defId)).toEqual(['miner_hat'])
    expect(inventoryStore.equippedHatIndex).toBe(0)

    inventoryStore.addShoe('leather_boots')
    inventoryStore.addShoe('travel_boots')
    expect(inventoryStore.equipShoe(0)).toBe(true)
    expect(inventoryStore.sellShoe(0).success).toBe(true)
    expect(inventoryStore.ownedShoes.map(shoe => shoe.defId)).toEqual(['travel_boots'])
    expect(inventoryStore.equippedShoeIndex).toBe(-1)
  })

  it('sorts equipment while preserving equipped instances', () => {
    const inventoryStore = useInventoryStore()

    inventoryStore.addWeapon('copper_sword')
    inventoryStore.addWeapon('iron_blade')
    inventoryStore.addWeapon('gold_halberd')
    expect(inventoryStore.equipWeapon(1)).toBe(true)

    inventoryStore.addRing('shallow_guard')
    inventoryStore.addRing('prismatic_ring')
    inventoryStore.addRing('dragon_ring')
    expect(inventoryStore.equipRing(0, 0)).toBe(true)
    expect(inventoryStore.equipRing(2, 1)).toBe(true)

    inventoryStore.addHat('straw_hat')
    inventoryStore.addHat('dragon_helm')
    inventoryStore.addHat('merchant_hat')
    expect(inventoryStore.equipHat(2)).toBe(true)

    inventoryStore.addShoe('leather_boots')
    inventoryStore.addShoe('abyss_dragon_treads')
    inventoryStore.addShoe('merchant_boots')
    expect(inventoryStore.equipShoe(0)).toBe(true)

    inventoryStore.sortEquipment()

    expect(inventoryStore.ownedWeapons.map(weapon => weapon.defId)).toEqual(['gold_halberd', 'iron_blade', 'copper_sword', 'wooden_stick'])
    expect(inventoryStore.equippedWeaponIndex).toBe(2)
    expect(inventoryStore.ownedWeapons[inventoryStore.equippedWeaponIndex]?.defId).toBe('copper_sword')

    expect(inventoryStore.ownedRings.map(ring => ring.defId)).toEqual(['prismatic_ring', 'dragon_ring', 'shallow_guard'])
    expect(inventoryStore.equippedRingSlot1).toBe(2)
    expect(inventoryStore.equippedRingSlot2).toBe(1)

    expect(inventoryStore.ownedHats.map(hat => hat.defId)).toEqual(['dragon_helm', 'merchant_hat', 'straw_hat'])
    expect(inventoryStore.equippedHatIndex).toBe(1)

    expect(inventoryStore.ownedShoes.map(shoe => shoe.defId)).toEqual(['abyss_dragon_treads', 'merchant_boots', 'leather_boots'])
    expect(inventoryStore.equippedShoeIndex).toBe(2)
  })
})
