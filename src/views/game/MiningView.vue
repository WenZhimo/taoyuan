<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-accent text-sm">
        <Mountain :size="14" class="inline" />
        {{ miningStore.isInSkullCavern ? '骷髅矿穴' : '云隐矿洞' }}
      </h3>
      <Button class="py-0 px-1" :icon="Map" @click="showMapModal = true" />
    </div>
    <p v-if="tutorialHint" class="text-[10px] text-muted/50 mb-2">{{ tutorialHint }}</p>

    <SkullCavernStatusPanel
      v-if="miningStore.isSkullCavernUnlocked()"
      :best-floor="miningStore.skullCavernBestFloor"
      :safe-point-floor="miningStore.skullSafePointFloor"
    />

    <MiningEquipmentStatusPanel
      :weapon-display-name="weaponDisplayName"
      :weapon-attack="weaponAttack"
      :weapon-type-name="weaponTypeName"
      :crit-rate-display="critRateDisplay"
      :weapon-enchant-name="weaponEnchantName"
      :hp="playerStore.hp"
      :max-hp="playerStore.getMaxHp()"
      :hp-percent="playerStore.getHpPercent()"
      :is-low-hp="playerStore.getIsLowHp()"
      :stamina="playerStore.stamina"
      :max-stamina="playerStore.maxStamina"
      @view-enchantment-detail="viewWeaponEnchantmentDetail"
    />

    <!-- 进入矿洞 -->
    <div
      class="border border-accent/20 rounded-xs px-3 py-2 mb-4 flex items-center justify-between cursor-pointer hover:bg-accent/5"
      @click="hasElevator ? (showElevatorModal = true) : handleEnterMine(undefined)"
    >
      <div class="flex items-center space-x-1.5">
        <Pickaxe :size="14" class="text-accent" />
        <span class="text-sm text-accent">探索</span>
      </div>
      <span class="text-xs text-muted">第{{ miningStore.safePointFloor + 1 }}层</span>
    </div>

    <DefeatedBossListPanel :defeated-zones="defeatedBossZones" />

    <MineMapDialog :show="showMapModal" :safe-point-floor="miningStore.safePointFloor" :zones="mineZones" @close="showMapModal = false" />

    <MineElevatorDialog
      v-model:auto-explore="autoExploreOnEntry"
      :show="showElevatorModal"
      :safe-point-floor="miningStore.safePointFloor"
      :elevator-zones="elevatorZones"
      :is-skull-cavern-unlocked="miningStore.isSkullCavernUnlocked()"
      :skull-safe-point-floor="miningStore.skullSafePointFloor"
      :skull-elevator-floors="skullElevatorFloors"
      @close="showElevatorModal = false"
      @enter-mine="handleEnterMine"
      @enter-skull-cavern="handleEnterSkullCavern"
    />

    <!-- 矿洞探索弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="miningStore.isExploring && !miningStore.inCombat"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-[30] p-4"
      >
        <div class="game-panel max-w-sm w-full">
          <MineExplorationHeaderPanel
            :active-floor-num="activeFloorNum"
            :is-in-skull-cavern="miningStore.isInSkullCavern"
            :zone-name="zoneName"
            :current-floor-special="currentFloorSpecial"
            :remaining-monsters="remainingMonsters"
            :auto-explore-active="autoExploreActive"
            :bomb-mode-active="Boolean(bombModeId)"
            :weapon-display-name="weaponDisplayName"
            :weapon-type-name="weaponTypeName"
            :weapon-attack="weaponAttack"
            :crit-rate-display="critRateDisplay"
            :weapon-enchant-name="weaponEnchantName"
            @request-leave="showLeaveConfirm = true"
            @view-enchantment-detail="viewWeaponEnchantmentDetail"
            @cancel-bomb-mode="bombModeId = null"
          />

          <MineGridPanel
            :tiles="miningStore.floorGrid"
            :get-tile-class="getTileClass"
            :get-tile-icon="getTileIcon"
            :is-tile-clickable="isTileClickable"
            @select-tile="handleTileClick"
          />

          <MineExplorationActionsPanel
            :sweep-preview="sweepPreview"
            :can-sweep-to-safe-point="canSweepToSafePoint"
            :remaining-combat-tiles="remainingCombatTiles"
            :auto-explore-active="autoExploreActive"
            :bombs="availableBombs"
            :active-bomb-id="bombModeId"
            :has-monster-lure="hasMonsterLure"
            :monster-lure-count="inventoryStore.getItemCount('monster_lure')"
            :combat-item-count="availableCombatItems.length"
            :stairs-found="miningStore.stairsFound"
            :stairs-usable="miningStore.stairsUsable"
            :is-in-skull-cavern="miningStore.isInSkullCavern"
            @sweep-to-safe-point="handleSweepToSafePoint"
            @start-chain-battle="handleStartChainBattle"
            @toggle-auto-explore="autoExploreActive ? stopAutoExplore('自动探索已停止。') : startAutoExplore()"
            @toggle-bomb-mode="toggleBombMode"
            @use-monster-lure="handleUseMonsterLure"
            @open-combat-items="showCombatItems = true"
            @next-floor="handleNextFloor"
            @request-leave="showLeaveConfirm = true"
          />

          <MineExplorationLogPanel :logs="recentLog" />
        </div>
      </div>
    </Transition>

    <MineCombatDialog
      :show="miningStore.inCombat"
      :combat-is-boss="miningStore.combatIsBoss"
      :player-hp="playerStore.hp"
      :player-max-hp="playerStore.getMaxHp()"
      :player-hp-percent="playerStore.getHpPercent()"
      :player-is-low-hp="playerStore.getIsLowHp()"
      :player-statuses="miningStore.combatPlayerStatuses"
      :player-anim="playerAnim"
      :player-float="playerFloat"
      :monster-name="miningStore.combatMonster?.name"
      :monster-hp="miningStore.combatMonsterHp"
      :monster-max-hp="miningStore.combatMonster?.hp"
      :monster-statuses="miningStore.combatMonsterStatuses"
      :monster-anim="monsterAnim"
      :monster-float="monsterFloat"
      :combat-anim-lock="combatAnimLock"
      :weapon-attack="weaponAttack"
      :auto-combat-mode="autoCombatMode"
      :combat-item-count="availableCombatItems.length"
      :preset-count="inventoryStore.equipmentPresets.length"
      :active-preset-name="activePresetName"
      :combat-log="miningStore.combatLog"
      :get-status-detail="getStatusDetail"
      @combat-action="handleCombat"
      @set-auto-combat-mode="setAutoCombatMode"
      @open-combat-items="showCombatItems = true"
      @open-preset-list="showPresetListModal = true"
    />

    <MineCombatItemListDialog
      :show="showCombatItems"
      :items="availableCombatItems"
      @close="showCombatItems = false"
      @select-item="handlePendingItem"
    />

    <MineCombatItemConfirmDialog
      :item="pendingItem"
      :can-batch="pendingCanBatch"
      :quantity="pendingUseQty"
      @cancel="pendingItemId = null"
      @decrease-quantity="addUseQty(-1)"
      @increase-quantity="addUseQty(1)"
      @set-quantity="setUseQty"
      @input-quantity="onUseQtyInput"
      @confirm="handleConfirmUseItem"
    />

    <MineLeaveConfirmDialog
      :show="showLeaveConfirm"
      :is-skull-cavern="miningStore.isInSkullCavern"
      :leave-hint="leaveHint"
      @cancel="showLeaveConfirm = false"
      @confirm="confirmLeave"
    />

    <MineEquipmentPresetListDialog
      :show="showPresetListModal"
      :presets="inventoryStore.equipmentPresets"
      :active-preset-id="inventoryStore.activePresetId"
      @close="showPresetListModal = false"
      @apply-preset="quickApplyPreset"
      @view-preset="viewPresetDetail"
    />

    <MineEquipmentPresetDetailDialog
      :show="showPresetDetailModal"
      :preset="detailPreset"
      @close="showPresetDetailModal = false"
      @view-equipment="viewEquipProperty"
    />

    <MineEquipmentPropertyDialog :show="showEquipPropertyModal" :info="equipPropertyInfo" @close="showEquipPropertyModal = false" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onUnmounted, ref, watch } from 'vue'
  import {
    Mountain,
    Pickaxe,
    Map,
  } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import { useAchievementStore } from '@/stores/useAchievementStore'
  import { useGameStore } from '@/stores/useGameStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useMiningStore } from '@/stores/useMiningStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useSkillStore } from '@/stores/useSkillStore'
  import { useTutorialStore } from '@/stores/useTutorialStore'
  import { ZONE_NAMES, getFloor, BOSS_MONSTERS } from '@/data'
  import { getWeaponById, getOwnedWeaponEnchantments, getWeaponDisplayName, WEAPON_TYPE_NAMES, formatEnchantmentSummary } from '@/data/weapons'
  import { getRingById, getHatById, getShoeById } from '@/data'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import { BOMBS } from '@/data/processing'
  import { getItemById } from '@/data/items'
  import type { CombatAction, CombatStatusEffect, MineTile } from '@/types'
  import {
    AUTO_EXPLORE_BEDTIME_STOP_MESSAGE,
    AUTO_EXPLORE_NO_ACTION_STOP_MESSAGE,
    chooseAutoExploreStep
  } from '@/domain/mining/autoExplore'
  import { chooseAutoCombatAction as chooseAutoCombatActionRule } from '@/domain/mining/combat'
  import { buildMineElevatorZones, buildMineMapZones, buildSkullElevatorFloors, createMineLeaveHint } from '@/domain/mining/navigationDisplay'
  import { getMineTileClass, getMineTileIcon, isMineTileClickable } from '@/domain/mining/tileDisplay'
  import { createHatDetailInfo, createRingDetailInfo, createShoeDetailInfo, createWeaponDetailInfo } from '@/domain/enchantments/equipmentEffects'
  import { createWeaponEnchantmentDetailInfo } from '@/domain/enchantments/summarizeEnchantments'
  import { sfxMine, sfxAttack, sfxHurt, sfxClick, sfxEncounter, sfxDefend, sfxFlee, sfxVictory } from '@/composables/useAudio'
  import { useAudio } from '@/composables/useAudio'
  import { addLog } from '@/composables/useGameLog'
  import { handleAdvanceTimeResult, handleSleepOrPassOut } from '@/composables/useEndDay'
  import { useQuantityPicker } from '@/composables/game/useQuantityPicker'
  import MineCombatDialog from '@/components/game/mining/MineCombatDialog.vue'
  import DefeatedBossListPanel from '@/components/game/mining/DefeatedBossListPanel.vue'
  import MineCombatItemConfirmDialog from '@/components/game/mining/MineCombatItemConfirmDialog.vue'
  import MineCombatItemListDialog from '@/components/game/mining/MineCombatItemListDialog.vue'
  import MineElevatorDialog from '@/components/game/mining/MineElevatorDialog.vue'
  import MineEquipmentPropertyDialog from '@/components/game/mining/MineEquipmentPropertyDialog.vue'
  import MineEquipmentPresetDetailDialog from '@/components/game/mining/MineEquipmentPresetDetailDialog.vue'
  import MineEquipmentPresetListDialog from '@/components/game/mining/MineEquipmentPresetListDialog.vue'
  import MineExplorationActionsPanel from '@/components/game/mining/MineExplorationActionsPanel.vue'
  import MineExplorationHeaderPanel from '@/components/game/mining/MineExplorationHeaderPanel.vue'
  import MineExplorationLogPanel from '@/components/game/mining/MineExplorationLogPanel.vue'
  import MineGridPanel from '@/components/game/mining/MineGridPanel.vue'
  import MineLeaveConfirmDialog from '@/components/game/mining/MineLeaveConfirmDialog.vue'
  import MineMapDialog from '@/components/game/mining/MineMapDialog.vue'
  import MiningEquipmentStatusPanel from '@/components/game/mining/MiningEquipmentStatusPanel.vue'
  import SkullCavernStatusPanel from '@/components/game/mining/SkullCavernStatusPanel.vue'

  const miningStore = useMiningStore()
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const achievementStore = useAchievementStore()
  const tutorialStore = useTutorialStore()
  const { startBattleBgm, resumeNormalBgm } = useAudio()

  const tutorialHint = computed(() => {
    if (!tutorialStore.enabled || gameStore.year > 1) return null
    if (achievementStore.stats.highestMineFloor === 0)
      return '矿洞是6x6的网格，点击格子探索。遇到矿石可以开采，遇到怪物需要战斗。找到楼梯可下一层。'
    return null
  })

  const exploreLog = ref<string[]>([])

  const showMapModal = ref(false)
  const showElevatorModal = ref(false)

  /** 炸弹模式 */
  const bombModeId = ref<string | null>(null)

  /** 战斗道具面板 */
  const showCombatItems = ref(false)
  type AutoCombatMode = 'off' | 'smart' | 'attack' | 'defend'
  const autoCombatMode = ref<AutoCombatMode>('off')
  let autoCombatTimer: ReturnType<typeof setTimeout> | null = null
  const autoExploreOnEntry = ref(false)
  const autoExploreActive = ref(false)
  let autoExploreTimer: ReturnType<typeof setTimeout> | null = null

  /** 道具使用确认 */
  const BATCH_USABLE_ITEMS = new Set(['guild_badge', 'life_talisman', 'lucky_coin', 'defense_charm'])
  const COMBAT_ITEM_DESCRIPTIONS: Record<string, string> = {
    bomb: '战斗中造成50点无视防御伤害',
    mega_bomb: '战斗中造成大量无视防御伤害并燃烧',
    poison_arrow: '造成伤害并附加中毒',
    ice_bomb: '造成无视防御伤害并冻结',
    nuclear_bomb: '大量百分比伤害并永久辐射',
    attack_potion: '本次探索攻击力+500',
    guardian_potion: '本次探索受到伤害-35%'
  }
  const pendingItemId = ref<string | null>(null)
  const pendingItem = computed(() => {
    if (!pendingItemId.value) return null
    return availableCombatItems.value.find(i => i.itemId === pendingItemId.value) ?? null
  })
  const pendingCanBatch = computed(() => pendingItemId.value !== null && BATCH_USABLE_ITEMS.has(pendingItemId.value))
  const pendingUseQuantityPicker = useQuantityPicker({
    maxQuantity: () => pendingItem.value?.count ?? 1
  })
  const pendingUseQty = pendingUseQuantityPicker.quantity
  const setUseQty = pendingUseQuantityPicker.setQuantity
  const addUseQty = pendingUseQuantityPicker.addQuantity
  const onUseQtyInput = (e: Event) => pendingUseQuantityPicker.setQuantityFromInput((e.target as HTMLInputElement).value)

  /** 离开矿洞确认 */
  const showLeaveConfirm = ref(false)

  // 战斗动画状态
  const combatAnimLock = ref(false)
  const playerAnim = ref('')
  const monsterAnim = ref('')
  const playerFloat = ref<{ text: string; key: number } | null>(null)
  const monsterFloat = ref<{ text: string; key: number } | null>(null)
  let floatCounter = 0

  const triggerAnim = (target: 'player' | 'monster', cls: string, duration: number = 400) => {
    if (target === 'player') {
      playerAnim.value = cls
      setTimeout(() => {
        playerAnim.value = ''
      }, duration)
    } else {
      monsterAnim.value = cls
      setTimeout(() => {
        monsterAnim.value = ''
      }, duration)
    }
  }

  const showDamageFloat = (target: 'player' | 'monster', text: string) => {
    const obj = { text, key: ++floatCounter }
    if (target === 'player') {
      playerFloat.value = obj
      setTimeout(() => {
        playerFloat.value = null
      }, 800)
    } else {
      monsterFloat.value = obj
      setTimeout(() => {
        monsterFloat.value = null
      }, 800)
    }
  }

  const parseDamage = (msg: string): { dealt: number; taken: number; isCrit: boolean } => {
    const dealt = msg.match(/造成(\d+)点伤害/)
    const taken = msg.match(/受到(\d+)点伤害/)
    return {
      dealt: dealt ? parseInt(dealt[1]!) : 0,
      taken: taken ? parseInt(taken[1]!) : 0,
      isCrit: msg.includes('暴击')
    }
  }

  const recentLog = computed(() => exploreLog.value.slice(-8))

  const activeFloorNum = computed(() => {
    return miningStore.isInSkullCavern ? miningStore.skullCavernFloor : miningStore.currentFloor
  })

  const availableBombs = computed(() => {
    return BOMBS.map(b => ({ id: b.id, name: b.name, count: inventoryStore.getItemCount(b.id) })).filter(b => b.count > 0)
  })

  /** 战斗中可用道具列表 */
  const availableCombatItems = computed(() => {
    const items: { itemId: string; name: string; desc: string; count: number }[] = []

    // 公会徽章
    const badgeCount = inventoryStore.getItemCount('guild_badge')
    if (badgeCount > 0) {
      items.push({ itemId: 'guild_badge', name: '公会徽章', desc: '攻击力永久+3', count: badgeCount })
    }

    // 生命护符
    const talismanCount = inventoryStore.getItemCount('life_talisman')
    if (talismanCount > 0) {
      items.push({ itemId: 'life_talisman', name: '生命护符', desc: '最大生命值永久+15', count: talismanCount })
    }

    // 幸运铜钱
    const coinCount = inventoryStore.getItemCount('lucky_coin')
    if (coinCount > 0) {
      items.push({ itemId: 'lucky_coin', name: '幸运铜钱', desc: '掉落率永久+5%', count: coinCount })
    }

    // 守护符
    const defenseCharmCount = inventoryStore.getItemCount('defense_charm')
    if (defenseCharmCount > 0) {
      items.push({ itemId: 'defense_charm', name: '守护符', desc: '防御永久+3%', count: defenseCharmCount })
    }

    // 猎魔符
    if (!miningStore.slayerCharmActive) {
      const charmCount = inventoryStore.getItemCount('slayer_charm')
      if (charmCount > 0) {
        items.push({ itemId: 'slayer_charm', name: '猎魔符', desc: '掉落率+20%（本次探索）', count: charmCount })
      }
    }

    for (const [itemId, desc] of Object.entries(COMBAT_ITEM_DESCRIPTIONS)) {
      const count = inventoryStore.getItemCount(itemId)
      if (count <= 0) continue
      const def = getItemById(itemId)
      items.push({ itemId, name: def?.name ?? itemId, desc, count })
    }

    // 所有可食用的恢复类道具
    const seen = new Set<string>([
      'guild_badge',
      'slayer_charm',
      'monster_lure',
      'life_talisman',
      'lucky_coin',
      'defense_charm',
      ...Object.keys(COMBAT_ITEM_DESCRIPTIONS)
    ])
    for (const invItem of inventoryStore.items) {
      if (invItem.quantity <= 0 || seen.has(invItem.itemId)) continue
      const def = getItemById(invItem.itemId)
      if (!def?.edible) continue
      if (!def.healthRestore && !def.staminaRestore) continue
      seen.add(invItem.itemId)

      const parts: string[] = []
      if (def.healthRestore) parts.push(def.healthRestore >= 999 ? 'HP全满' : `HP+${def.healthRestore}`)
      if (def.staminaRestore) parts.push(`体力+${def.staminaRestore}`)

      items.push({
        itemId: invItem.itemId,
        name: def.name,
        desc: parts.join('，'),
        count: inventoryStore.getItemCount(invItem.itemId)
      })
    }

    return items
  })

  /** 是否有怪物诱饵 */
  const hasMonsterLure = computed(() => inventoryStore.getItemCount('monster_lure') > 0)
  const sweepPreview = computed(() => miningStore.getSweepPreview())
  const canSweepToSafePoint = computed(() => sweepPreview.value.canSweep && sweepPreview.value.targetFloor !== null)
  const remainingCombatTiles = computed(() => miningStore.getRemainingCombatTileCount())

  const getStatusDetail = (status: CombatStatusEffect): string => {
    const turns = status.remainingTurns === null ? '持续到本次探索结束' : `剩余${status.remainingTurns}回合`
    const percent = `${Math.round(status.power * 100)}%`
    const sourceName = status.source === 'player' ? '武器' : status.source === 'monster' ? '怪物' : '道具'
    const effectText: Record<CombatStatusEffect['type'], string> = {
      poison: `每回合损失最大生命值的${percent}`,
      burn: `每回合损失最大生命值的${percent}`,
      radiation: `每回合损失最大生命值的${percent}`,
      freeze: '暂时无法反击',
      battle_rage: `攻击力+${status.power}`,
      iron_skin: `受到伤害降低${percent}`
    }
    return `${status.name}：${effectText[status.type]}。${turns}。来源：${sourceName}。`
  }

  const zoneName = computed(() => {
    const floor = getFloor(miningStore.currentFloor)
    return floor ? ZONE_NAMES[floor.zone] : ''
  })

  /** 矿洞地图区域数据 */
  const mineZones = computed(() => {
    return buildMineMapZones({
      safePointFloor: miningStore.safePointFloor,
      defeatedBossIds: miningStore.defeatedBosses,
      bossesByFloor: BOSS_MONSTERS
    })
  })

  const defeatedBossZones = computed(() => mineZones.value.filter(zone => zone.bossDefeated))

  /** 当前层是否为特殊楼层 */
  const currentFloorSpecial = computed(() => {
    const floor = miningStore.getActiveFloorData()
    return floor?.specialType ?? null
  })

  /** 感染层剩余怪物 */
  const remainingMonsters = computed(() => {
    return miningStore.totalMonstersOnFloor - miningStore.monstersDefeatedCount
  })

  /** 是否显示电梯（有可返回楼层或骷髅矿穴已解锁） */
  const hasElevator = computed(() => elevatorZones.value.length > 0 || miningStore.isSkullCavernUnlocked())

  /** 武器信息 */
  const weaponDisplayName = computed(() => {
    const owned = inventoryStore.getEquippedWeapon()
    return getWeaponDisplayName(owned.defId, owned.enchantmentIds ?? owned.enchantmentId)
  })
  const weaponTypeName = computed(() => {
    const owned = inventoryStore.getEquippedWeapon()
    const def = getWeaponById(owned.defId)
    return def ? WEAPON_TYPE_NAMES[def.type] : '未知'
  })
  const weaponAttack = computed(
    () =>
      inventoryStore.getWeaponAttack() +
      skillStore.combatLevel * 2 +
      inventoryStore.getRingEffectValue('attack_bonus') +
      miningStore.guildBadgeBonusAttack
  )
  const critRateDisplay = computed(
    () => `${Math.round((inventoryStore.getWeaponCritRate() + inventoryStore.getRingEffectValue('crit_rate_bonus')) * 100)}%`
  )
  const weaponEnchantName = computed(() => {
    const owned = inventoryStore.getEquippedWeapon()
    return formatEnchantmentSummary(getOwnedWeaponEnchantments(owned))
  })
  const activePresetName = computed(() => {
    return inventoryStore.equipmentPresets.find(p => p.id === inventoryStore.activePresetId)?.name ?? ''
  })

  /** 电梯楼层按区域分组 */
  const elevatorZones = computed(() => {
    return buildMineElevatorZones(miningStore.getUnlockedSafePoints(), miningStore.safePointFloor)
  })

  /** 离开矿洞提示文案 */
  const leaveHint = computed(() => {
    return createMineLeaveHint({
      isInSkullCavern: miningStore.isInSkullCavern,
      activeFloorIsSafePoint: Boolean(miningStore.getActiveFloorData()?.isSafePoint),
      skullCavernFloor: miningStore.skullCavernFloor,
      skullSafePointFloor: miningStore.skullSafePointFloor
    })
  })

  /** 骷髅矿穴可选安全点楼层（排除最高安全点，因为主按钮已默认从那里开始） */
  const skullElevatorFloors = computed(() => {
    return buildSkullElevatorFloors(miningStore.getUnlockedSkullSafePoints(), miningStore.skullSafePointFloor)
  })

  // ==================== 格子 UI 辅助 ====================

  /** 格子样式 */
  const getTileClass = (tile: MineTile): string => {
    return getMineTileClass({
      tile,
      bombModeActive: Boolean(bombModeId.value),
      canReveal: miningStore.canRevealTile(tile.index)
    })
  }

  /** 格子图标 */
  const getTileIcon = (tile: MineTile): string => {
    return getMineTileIcon(tile)
  }

  /** 格子是否可点击 */
  const isTileClickable = (tile: MineTile): boolean => {
    return isMineTileClickable({
      tile,
      bombModeActive: Boolean(bombModeId.value),
      canReveal: miningStore.canRevealTile(tile.index)
    })
  }

  /** 格子点击处理 */
  const handleTileClick = (tile: MineTile) => {
    if (gameStore.isPastBedtime) {
      addLog('太晚了，没法继续探索了。')
      handleSleepOrPassOut()
      return
    }

    if (bombModeId.value) {
      const result = miningStore.useBombOnGrid(bombModeId.value, tile.index)
      if (result.success) {
        sfxMine()
        exploreLog.value.push(result.message)
        addLog(result.message)
        const tr = gameStore.advanceTime(ACTION_TIME_COSTS.mineOre)
        handleAdvanceTimeResult(tr)
      } else {
        exploreLog.value.push(result.message)
      }
      bombModeId.value = null
      return
    }

    // 已揭示的怪物/BOSS格：重新交战
    if (tile.state === 'revealed' && (tile.type === 'monster' || tile.type === 'boss') && tile.data?.monster) {
      const result = miningStore.engageRevealedMonster(tile.index)
      if (result.success) {
        exploreLog.value.push(result.message)
        addLog(result.message)
        if (result.startsCombat) {
          startBattleBgm()
          sfxEncounter()
        }
      } else {
        exploreLog.value.push(result.message)
        addLog(result.message)
      }
      return
    }

    const result = miningStore.revealTile(tile.index)
    if (result.success) {
      exploreLog.value.push(result.message)
      addLog(result.message)

      if (result.startsCombat) {
        startBattleBgm()
        sfxEncounter()
        const tr = gameStore.advanceTime(ACTION_TIME_COSTS.combat)
        handleAdvanceTimeResult(tr)
      } else {
        sfxClick()
        const tr = gameStore.advanceTime(ACTION_TIME_COSTS.revealTile)
        handleAdvanceTimeResult(tr)
      }
    } else {
      exploreLog.value.push(result.message)
      addLog(result.message)
    }
  }

  /** 切换炸弹模式 */
  const toggleBombMode = (bombId: string) => {
    bombModeId.value = bombModeId.value === bombId ? null : bombId
  }

  // ==================== 事件处理 ====================

  const handleEnterMine = (startFrom?: number, autoExplore = false) => {
    showElevatorModal.value = false
    showCombatItems.value = false
    const msg = miningStore.enterMine(startFrom)
    exploreLog.value = [msg]
    sfxClick()
    addLog(msg)
    if (autoExplore) startAutoExplore()
  }

  const handleEnterSkullCavern = (startFrom?: number, autoExplore = false) => {
    showElevatorModal.value = false
    showCombatItems.value = false
    const msg = miningStore.enterSkullCavern(startFrom)
    exploreLog.value = [msg]
    sfxClick()
    addLog(msg)
    if (autoExplore) startAutoExplore()
  }

  const handleCombat = (action: CombatAction) => {
    if (combatAnimLock.value) return
    combatAnimLock.value = true

    const result = miningStore.combatAction(action)
    const { dealt, taken, isCrit } = parseDamage(result.message)

    if (action === 'attack') sfxAttack()
    if (action === 'defend') sfxDefend()
    if (action === 'flee') sfxFlee()
    if (result.message.includes('受到')) sfxHurt()

    if (action === 'attack' && dealt > 0) {
      triggerAnim('monster', isCrit ? 'anim-shake-heavy' : 'anim-shake', isCrit ? 400 : 300)
      showDamageFloat('monster', isCrit ? `暴击 -${dealt}` : `-${dealt}`)
    }
    if (action === 'defend') {
      triggerAnim('player', 'anim-flash-defend', 400)
    }
    if (taken > 0) {
      triggerAnim('player', isCrit ? 'anim-shake-heavy anim-flash-red' : 'anim-flash-red', 400)
      showDamageFloat('player', `-${taken}`)
    }

    addLog(result.message)

    if (result.combatOver) {
      if (result.won) {
        sfxVictory()
        triggerAnim('monster', 'anim-victory', 1500)
      } else {
        stopAutoExplore('自动探索已停止。')
      }
      resumeNormalBgm()
      showCombatItems.value = false
      if (result.won || !miningStore.isExploring) {
        exploreLog.value.push(result.message)
      }
    }

    setTimeout(() => {
      combatAnimLock.value = false
      scheduleAutoCombat()
    }, 400)
  }

  const handleConfirmUseItem = () => {
    if (!pendingItemId.value) return
    const result = miningStore.useCombatItem(pendingItemId.value, pendingCanBatch.value ? pendingUseQty.value : 1)
    sfxClick()
    addLog(result.message)
    if (result.success) {
      exploreLog.value.push(result.message)
    }
    pendingItemId.value = null
  }

  const handlePendingItem = (itemId: string) => {
    pendingItemId.value = itemId
    pendingUseQuantityPicker.resetQuantity(1)
    showCombatItems.value = false
  }

  /** 使用怪物诱饵 */
  const handleUseMonsterLure = () => {
    const result = miningStore.useMonsterLure()
    sfxClick()
    addLog(result.message)
    if (result.success) {
      exploreLog.value.push(result.message)
    }
  }

  const handleSweepToSafePoint = () => {
    if (gameStore.isPastBedtime) {
      addLog('太晚了，没法继续探索了。')
      handleSleepOrPassOut()
      return
    }

    showCombatItems.value = false
    const result = miningStore.sweepToNextSafePoint()
    sfxClick()
    addLog(result.message)
    if (result.success) {
      exploreLog.value = [result.message]
      bombModeId.value = null
    } else {
      exploreLog.value.push(result.message)
    }
  }

  const handleStartChainBattle = () => {
    if (gameStore.isPastBedtime) {
      addLog('太晚了，没法继续战斗了。')
      handleSleepOrPassOut()
      return
    }

    showCombatItems.value = false
    const result = miningStore.startChainBattle()
    sfxClick()
    addLog(result.message)
    exploreLog.value.push(result.message)
    if (result.startsCombat) {
      startBattleBgm()
      sfxEncounter()
    }
  }

  const clearAutoCombatTimer = () => {
    if (autoCombatTimer) {
      clearTimeout(autoCombatTimer)
      autoCombatTimer = null
    }
  }

  const clearAutoExploreTimer = () => {
    if (autoExploreTimer) {
      clearTimeout(autoExploreTimer)
      autoExploreTimer = null
    }
  }

  const stopAutoExplore = (message?: string) => {
    clearAutoExploreTimer()
    autoExploreActive.value = false
    if (message) addLog(message)
  }

  const scheduleAutoExplore = (delay = 500) => {
    clearAutoExploreTimer()
    if (!autoExploreActive.value) return
    autoExploreTimer = setTimeout(() => {
      runAutoExplore()
    }, delay)
  }

  const startAutoExplore = () => {
    if (!miningStore.isExploring) return
    autoExploreOnEntry.value = false
    autoExploreActive.value = true
    if (autoCombatMode.value === 'off') {
      autoCombatMode.value = 'smart'
    }
    addLog('自动探索开始。')
    scheduleAutoExplore(100)
    scheduleAutoCombat()
  }

  const runAutoExplore = () => {
    const step = chooseAutoExploreStep({
      autoExploreActive: autoExploreActive.value,
      isExploring: miningStore.isExploring,
      playerHp: playerStore.hp,
      isPastBedtime: gameStore.isPastBedtime,
      inCombat: miningStore.inCombat,
      remainingCombatTiles: remainingCombatTiles.value,
      stairsUsable: miningStore.stairsUsable
    })

    switch (step) {
      case 'idle':
        return
      case 'stop':
        stopAutoExplore()
        return
      case 'sleepOrPassOut':
        stopAutoExplore(AUTO_EXPLORE_BEDTIME_STOP_MESSAGE)
        handleSleepOrPassOut()
        return
      case 'continueCombat':
        if (autoCombatMode.value === 'off') autoCombatMode.value = 'smart'
        scheduleAutoCombat()
        return
      case 'startChainBattle': {
        showCombatItems.value = false
        const result = miningStore.startChainBattle()
        sfxClick()
        addLog(result.message)
        exploreLog.value.push(result.message)
        if (result.startsCombat) {
          startBattleBgm()
          sfxEncounter()
          scheduleAutoCombat()
        } else {
          scheduleAutoExplore()
        }
        return
      }
      case 'goNextFloor':
        showCombatItems.value = false
        handleNextFloor()
        scheduleAutoExplore(700)
        return
      case 'stopNoAction':
        showCombatItems.value = false
        stopAutoExplore(AUTO_EXPLORE_NO_ACTION_STOP_MESSAGE)
        return
    }
  }

  const chooseAutoCombatAction = (): CombatAction => {
    return chooseAutoCombatActionRule({
      mode: autoCombatMode.value,
      monsterAttack: miningStore.combatMonster?.attack ?? 0,
      playerHp: playerStore.hp,
      playerMaxHp: playerStore.getMaxHp(),
      monsterHp: miningStore.combatMonsterHp,
      playerAttack: weaponAttack.value
    })
  }

  const scheduleAutoCombat = () => {
    clearAutoCombatTimer()
    if (autoCombatMode.value === 'off' || !miningStore.inCombat || combatAnimLock.value) return
    autoCombatTimer = setTimeout(() => {
      if (autoCombatMode.value === 'off' || !miningStore.inCombat || combatAnimLock.value) return
      handleCombat(chooseAutoCombatAction())
    }, 450)
  }

  const setAutoCombatMode = (mode: AutoCombatMode) => {
    autoCombatMode.value = mode
    scheduleAutoCombat()
  }

  const handleNextFloor = () => {
    if (gameStore.isPastBedtime) {
      addLog('太晚了，该回去了。')
      handleSleepOrPassOut()
      return
    }
    showCombatItems.value = false
    const result = miningStore.goNextFloor()
    if (result.success) {
      exploreLog.value = [result.message]
      bombModeId.value = null
    } else {
      exploreLog.value.push(result.message)
    }
    addLog(result.message)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.nextFloor)
    handleAdvanceTimeResult(tr)
  }

  const handleLeave = () => {
    if (miningStore.inCombat) resumeNormalBgm()
    stopAutoExplore()
    showCombatItems.value = false
    showLeaveConfirm.value = false
    const msg = miningStore.leaveMine()
    exploreLog.value = []
    bombModeId.value = null
    addLog(msg)
  }

  const confirmLeave = () => {
    handleLeave()
  }

  // ==================== 快速切装 ====================

  const showPresetListModal = ref(false)
  const showPresetDetailModal = ref(false)
  const detailPresetId = ref<string | null>(null)
  const showEquipPropertyModal = ref(false)

  interface EquipPropertyInfo {
    category: string
    name: string
    description: string
    effects: { label: string; value: string }[]
  }

  const equipPropertyInfo = ref<EquipPropertyInfo | null>(null)

  const detailPreset = computed(() => {
    if (!detailPresetId.value) return null
    return inventoryStore.equipmentPresets.find(p => p.id === detailPresetId.value) ?? null
  })

  const quickApplyPreset = (id: string) => {
    const result = inventoryStore.applyEquipmentPreset(id)
    addLog(result.message)
    showPresetListModal.value = false
  }

  const viewPresetDetail = (id: string) => {
    detailPresetId.value = id
    showPresetDetailModal.value = true
  }

  const viewWeaponEnchantmentDetail = () => {
    const info = createWeaponEnchantmentDetailInfo(weaponDisplayName.value, getOwnedWeaponEnchantments(inventoryStore.getEquippedWeapon()))
    if (!info) return
    equipPropertyInfo.value = info
    showEquipPropertyModal.value = true
  }

  const viewEquipProperty = (type: 'weapon' | 'ring' | 'hat' | 'shoe', defId: string) => {
    if (type === 'weapon') {
      const def = getWeaponById(defId)
      if (!def) return
      equipPropertyInfo.value = createWeaponDetailInfo(def, WEAPON_TYPE_NAMES[def.type])
    } else if (type === 'ring') {
      const def = getRingById(defId)
      if (!def) return
      equipPropertyInfo.value = createRingDetailInfo(def)
    } else if (type === 'hat') {
      const def = getHatById(defId)
      if (!def) return
      equipPropertyInfo.value = createHatDetailInfo(def)
    } else {
      const def = getShoeById(defId)
      if (!def) return
      equipPropertyInfo.value = createShoeDetailInfo(def)
    }
    showEquipPropertyModal.value = true
  }

  watch(
    () => miningStore.inCombat,
    inCombat => {
      if (inCombat) {
        scheduleAutoCombat()
      } else {
        clearAutoCombatTimer()
        showCombatItems.value = false
        scheduleAutoExplore()
      }
    }
  )

  onUnmounted(() => {
    clearAutoCombatTimer()
    clearAutoExploreTimer()
  })
</script>

<style scoped>
  /* === 战斗动画 === */

  @keyframes combat-shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-3px);
    }
    40% {
      transform: translateX(3px);
    }
    60% {
      transform: translateX(-2px);
    }
    80% {
      transform: translateX(2px);
    }
  }

  @keyframes combat-shake-heavy {
    0%,
    100% {
      transform: translateX(0);
    }
    10% {
      transform: translate(-4px, 2px);
    }
    30% {
      transform: translate(4px, -2px);
    }
    50% {
      transform: translate(-3px, 1px);
    }
    70% {
      transform: translate(3px, -1px);
    }
    90% {
      transform: translate(-2px, 1px);
    }
  }

  @keyframes combat-flash-red {
    0%,
    100% {
      background-color: transparent;
    }
    50% {
      background-color: rgba(195, 64, 67, 0.3);
    }
  }

  @keyframes combat-flash-defend {
    0%,
    100% {
      background-color: transparent;
    }
    50% {
      background-color: rgba(76, 110, 138, 0.3);
    }
  }

  @keyframes combat-float-up {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-24px);
    }
  }

  @keyframes combat-victory-flash {
    0%,
    100% {
      border-color: rgba(200, 164, 92, 0.3);
    }
    50% {
      border-color: rgba(200, 164, 92, 0.8);
    }
  }

  .anim-shake {
    animation: combat-shake 0.3s ease-in-out;
  }
  .anim-shake-heavy {
    animation: combat-shake-heavy 0.4s ease-in-out;
  }
  .anim-flash-red {
    animation: combat-flash-red 0.3s ease-in-out;
  }
  .anim-flash-defend {
    animation: combat-flash-defend 0.4s ease-in-out;
  }
  .anim-victory {
    animation: combat-victory-flash 0.5s ease-in-out 3;
  }
  .anim-float-up {
    animation: combat-float-up 0.8s ease-out forwards;
  }
</style>
