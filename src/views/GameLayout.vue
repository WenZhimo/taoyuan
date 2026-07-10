<template>
  <div
    v-if="gameStore.isGameStarted"
    class="flex flex-col space-y-2 md:space-y-4 h-screen p-2 md:p-4"
    :class="{ 'py-10': Capacitor.isNativePlatform() }"
  >
    <!-- 状态栏 -->
    <StatusBar @request-sleep="openSleepDialog" @request-nap="openNapDialog" />

    <Button class="text-center justify-center !text-sm" :icon="Moon" :icon-size="12" @click.stop="openSleepDialog">
      {{ sleepLabel }}
    </Button>

    <ResolvingDayOverlay v-if="isResolvingDay" />

    <!-- 内容 -->
    <div class="game-panel flex-1 min-h-0 overflow-y-auto">
      <router-view v-slot="{ Component }">
        <Transition name="panel-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </router-view>
    </div>

    <!-- 移动端地图按钮 -->
    <button class="mobile-map-btn" @click="showMobileMap = true">
      <Map :size="20" />
    </button>
    <button class="mobile-setting-btn" @click="showSettings = true">
      <SettingsIcon :size="20" />
    </button>
    <!-- 虚空箱远程访问按钮 -->
    <button v-if="warehouseStore.hasVoidChest" class="mobile-void-btn" @click="showVoidModal = true">
      <Archive :size="20" />
    </button>
    <!-- 日志按钮 -->
    <button class="mobile-log-btn" :class="{ 'with-void': warehouseStore.hasVoidChest }" @click="showLogModal = true">
      <History :size="20" />
    </button>

    <SettingsDialog :open="showSettings" @close="showSettings = false" />

    <!-- 移动端地图菜单 -->
    <MobileMapMenu :open="showMobileMap" :current="currentPanel" @close="showMobileMap = false" />

    <!-- 季节事件弹窗 -->
    <Transition name="panel-fade">
      <EventDialog v-if="currentEvent" :event="currentEvent" @close="closeEvent" />
    </Transition>

    <!-- 心事件弹窗 -->
    <Transition name="panel-fade">
      <HeartEventDialog v-if="pendingHeartEvent" :event="pendingHeartEvent" @close="closeHeartEvent" />
    </Transition>

    <!-- 仙灵发现场景弹窗 -->
    <Transition name="panel-fade">
      <DiscoveryScene
        v-if="pendingDiscoveryScene"
        :npc-id="pendingDiscoveryScene.npcId"
        :step="pendingDiscoveryScene.step"
        @close="closeDiscoveryScene"
      />
    </Transition>

    <!-- 互动节日 -->
    <Transition name="panel-fade">
      <div v-if="currentFestival" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <FishingContestView v-if="currentFestival === 'fishing_contest'" @complete="closeFestival" />
        <HarvestFairView v-if="currentFestival === 'harvest_fair'" @complete="closeFestival" />
        <DragonBoatView v-if="currentFestival === 'dragon_boat'" @complete="closeFestival" />
        <LanternRiddleView v-if="currentFestival === 'lantern_riddle'" @complete="closeFestival" />
        <PotThrowingView v-if="currentFestival === 'pot_throwing'" @complete="closeFestival" />
        <DumplingMakingView v-if="currentFestival === 'dumpling_making'" @complete="closeFestival" />
        <FireworkShowView v-if="currentFestival === 'firework_show'" @complete="closeFestival" />
        <TeaContestView v-if="currentFestival === 'tea_contest'" @complete="closeFestival" />
        <KiteFlyingView v-if="currentFestival === 'kite_flying'" @complete="closeFestival" />
      </div>
    </Transition>

    <!-- 技能专精选择弹窗 -->
    <Transition name="panel-fade">
      <PerkSelectDialog v-if="pendingPerk" :skill-type="pendingPerk.skillType" :level="pendingPerk.level" @select="handlePerkSelect" />
    </Transition>

    <!-- 宠物领养弹窗 -->
    <Transition name="panel-fade">
      <div v-if="pendingPetAdoption" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title label="小动物来访" />
          <p class="text-xs leading-relaxed mb-3">一只小动物在你家门口徘徊，看起来很想有个家。你要收养它吗？</p>
          <div class="flex space-x-3 justify-center mb-3">
            <Button :class="petChoice === 'cat' ? '!bg-accent !text-bg' : ''" @click="petChoice = 'cat'">猫</Button>
            <Button :class="petChoice === 'dog' ? '!bg-accent !text-bg' : ''" @click="petChoice = 'dog'">狗</Button>
          </div>
          <div v-if="petChoice" class="mb-3">
            <p class="text-xs text-muted mb-1">给它取个名字：</p>
            <input
              v-model="petNameInput"
              class="w-full bg-bg border border-accent/30 rounded-xs px-2 py-1 text-xs text-text focus:border-accent accent outline-none placeholder:text-muted/40 transition-colors"
              :placeholder="petChoice === 'cat' ? '小花' : '旺财'"
              maxlength="8"
            />
          </div>
          <Button :disabled="!petChoice" @click="confirmPetAdoption">领养</Button>
        </div>
      </div>
    </Transition>

    <!-- 子女提议弹窗 -->
    <Transition name="panel-fade">
      <div v-if="childProposalVisible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title label="家庭提议" />
          <p class="text-xs leading-relaxed mb-4">{{ proposalSpouseName }}轻声说道：「最近我在想，我们是不是该要个孩子了？」</p>
          <div class="flex flex-col space-y-1.5">
            <Button class="w-full justify-center" @click="handleChildProposalResponse('accept')">「我也这么想。」</Button>
            <Button class="w-full justify-center" @click="handleChildProposalResponse('wait')">「再等等吧。」</Button>
            <Button class="w-full justify-center text-muted" @click="handleChildProposalResponse('decline')">「现在还不是时候。」</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 晨间选项事件弹窗 -->
    <Transition name="panel-fade">
      <div v-if="pendingFarmEvent" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <p class="text-xs leading-relaxed mb-4">{{ pendingFarmEvent.message }}</p>
          <div class="flex flex-col space-y-1.5">
            <Button v-for="(c, i) in pendingFarmEvent.choices" :key="i" class="w-full justify-center" @click="handleFarmEventChoice(c)">
              {{ c.label }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 虚空箱远程存取弹窗 -->
    <Transition name="panel-fade">
      <VoidChestDialog
        v-if="showVoidModal"
        :chests="voidChests"
        :expanded-chest-id="expandedVoidChestId"
        :capacity="voidChestCapacity"
        :duplicate-deposit-count="voidDuplicateDepositItems.length"
        :depositable-count="voidDepositableItems.length"
        :item-detail="voidItemDetail"
        :item-def="voidItemDef"
        :quality-labels="VOID_QUALITY_LABEL"
        :quality-class="voidQualityClass"
        :get-item-name="getItemName"
        @close="showVoidModal = false"
        @toggle-chest="toggleVoidChest"
        @show-item-detail="voidItemDetail = $event"
        @withdraw="openVoidWithdrawQty"
        @deposit-duplicates="handleVoidDepositDuplicates"
        @open-deposit="openVoidDeposit"
        @close-item-detail="voidItemDetail = null"
      />
    </Transition>

    <!-- 虚空箱存入弹窗 -->
    <Transition name="panel-fade">
      <VoidChestDepositDialog
        v-if="showVoidDepositModal && voidDepositChestId"
        :items="voidDepositableItems"
        :quality-labels="VOID_QUALITY_LABEL"
        :quality-class="voidQualityClass"
        :get-item-name="getItemName"
        @close="showVoidDepositModal = false"
        @select-item="openVoidDepositQty"
      />
    </Transition>

    <!-- 虚空箱数量选择弹窗 -->
    <Transition name="panel-fade">
      <VoidChestQuantityDialog
        v-if="voidQtyModal"
        :modal="voidQtyModal"
        :quantity="voidQty"
        :quality-labels="VOID_QUALITY_LABEL"
        :quality-class="voidQualityClass"
        :get-item-name="getItemName"
        @close="voidQtyModal = null"
        @change-quantity="setVoidQty"
        @confirm="confirmVoidQty"
      />
    </Transition>

    <!-- 日志弹窗 -->
    <Transition name="panel-fade">
      <GameLogDialog
        v-if="showLogModal"
        :groups="groupedLogs"
        :clear-target="clearLogTarget"
        @close="showLogModal = false"
        @request-clear="requestClearLogs"
        @cancel-clear="clearLogTarget = undefined"
        @confirm-clear="executeClearLogs"
      />
    </Transition>

    <!-- 休息确认 -->
    <Transition name="panel-fade">
      <SleepDialog
        v-if="showSleepConfirm"
        :label="sleepLabel"
        :summary="sleepSummary"
        :warning="sleepWarning"
        @cancel="showSleepConfirm = false"
        @confirm="confirmSleep"
      />
    </Transition>

    <!-- 小憩确认 -->
    <Transition name="panel-fade">
      <NapDialog
        v-if="showNapConfirm"
        :minutes="napMinutes"
        :quick-minutes="napQuickMinutes"
        :current-time="gameStore.timeDisplay"
        :wake-time="napWakeTime"
        :recovery-preview="napRecoveryPreview"
        :can-nap="canNap"
        :interrupted="napWillBeInterrupted"
        :format-duration="formatNapDuration"
        @update:minutes="setNapMinutes"
        @cancel="showNapConfirm = false"
        @confirm="confirmNap"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted, onUnmounted, toRef } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAnimalStore } from '@/stores/useAnimalStore'
  import { useGameStore, SEASON_NAMES } from '@/stores/useGameStore'
  import { useHomeStore } from '@/stores/useHomeStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useNpcStore } from '@/stores/useNpcStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useWarehouseStore } from '@/stores/useWarehouseStore'
  import { useFarmStore } from '@/stores/useFarmStore'
  import { useDialogs } from '@/composables/useDialogs'
  import type { MorningChoiceEvent } from '@/data/farmEvents'
  import { getResourceSleepOptions, handleEndDay, handleSleepOrPassOut } from '@/composables/useEndDay'
  import { addLog } from '@/composables/useGameLog'
  import { useGameLogs } from '@/composables/layout/useGameLogs'
  import { getNpcById, getItemById, getCropById } from '@/data'
  import { CHEST_DEFS } from '@/data/items'
  import { useGameClock } from '@/composables/useGameClock'
  import { useAudio } from '@/composables/useAudio'
  import { formatNapDuration, useSleepFlow } from '@/composables/layout/useSleepFlow'
  import { useRestActions } from '@/composables/layout/useRestActions'
  import { useVoidChestUi } from '@/composables/layout/useVoidChestUi'
  import { Moon, Map, Settings as SettingsIcon, Archive, History } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import MobileMapMenu from '@/components/game/MobileMapMenu.vue'
  import StatusBar from '@/components/game/StatusBar.vue'
  import EventDialog from '@/components/game/EventDialog.vue'
  import HeartEventDialog from '@/components/game/HeartEventDialog.vue'
  import PerkSelectDialog from '@/components/game/PerkSelectDialog.vue'
  import GameLogDialog from '@/components/game/layout/GameLogDialog.vue'
  import NapDialog from '@/components/game/layout/NapDialog.vue'
  import ResolvingDayOverlay from '@/components/game/layout/ResolvingDayOverlay.vue'
  import SleepDialog from '@/components/game/layout/SleepDialog.vue'
  import VoidChestDepositDialog from '@/components/game/layout/VoidChestDepositDialog.vue'
  import VoidChestDialog from '@/components/game/layout/VoidChestDialog.vue'
  import VoidChestQuantityDialog from '@/components/game/layout/VoidChestQuantityDialog.vue'
  import FishingContestView from '@/components/game/FishingContestView.vue'
  import HarvestFairView from '@/components/game/HarvestFairView.vue'
  import DragonBoatView from '@/components/game/DragonBoatView.vue'
  import LanternRiddleView from '@/components/game/LanternRiddleView.vue'
  import PotThrowingView from '@/components/game/PotThrowingView.vue'
  import DumplingMakingView from '@/components/game/DumplingMakingView.vue'
  import FireworkShowView from '@/components/game/FireworkShowView.vue'
  import TeaContestView from '@/components/game/TeaContestView.vue'
  import KiteFlyingView from '@/components/game/KiteFlyingView.vue'
  import SettingsDialog from '@/components/game/SettingsDialog.vue'
  import DiscoveryScene from '@/components/game/DiscoveryScene.vue'
  import { Capacitor } from '@capacitor/core'

  const router = useRouter()
  const route = useRoute()
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const { switchToSeasonalBgm } = useAudio()

  // 游戏未开始时重定向到主菜单
  if (!gameStore.isGameStarted) {
    void router.replace('/')
  }

  const {
    currentEvent,
    pendingHeartEvent,
    currentFestival,
    pendingPerk,
    pendingPetAdoption,
    childProposalVisible,
    pendingFarmEvent,
    pendingDiscoveryScene,
    closeEvent,
    closeHeartEvent,
    closeFestival,
    handlePerkSelect,
    closePetAdoption,
    closeChildProposal,
    closeFarmEvent,
    closeDiscoveryScene
  } = useDialogs()

  const npcStore = useNpcStore()
  const inventoryStore = useInventoryStore()
  const warehouseStore = useWarehouseStore()

  const { startClock, stopClock, pauseClock, resumeClock } = useGameClock()

  /** 移动端地图菜单 */
  const showMobileMap = ref(false)

  const isResolvingDay = ref(false)
  const napQuickMinutes = [30, 60, 120, 240] as const

  /** 设置弹窗 */
  const showSettings = ref(false)

  /** 日志弹窗 */
  const showLogModal = ref(false)
  const { clearLogTarget, groupedLogs, requestClearLogs, executeClearLogs } = useGameLogs({
    showLogModal,
    getDayLabel: () => `第${gameStore.year}年 ${SEASON_NAMES[gameStore.season]} 第${gameStore.day}天`
  })

  // 实时时钟生命周期
  onMounted(() => startClock())
  onUnmounted(() => stopClock())

  /** 从路由名称获取当前面板标识 */
  const currentPanel = computed(() => {
    return (route.name as string) ?? 'farm'
  })

  const resourceSleepOptions = computed(() => getResourceSleepOptions())
  const {
    actualNapMinutes,
    calcNapRecovery,
    canNap,
    napMinutes,
    napRecoveryPreview,
    napWakeTime,
    napWillBeInterrupted,
    openNapDialog,
    openSleepDialog,
    requestedNapMinutes,
    setNapMinutes,
    showNapConfirm,
    showSleepConfirm,
    sleepLabel,
    sleepSummary,
    sleepWarning
  } = useSleepFlow({
    hour: toRef(gameStore, 'hour'),
    timeDisplay: toRef(gameStore, 'timeDisplay'),
    currentLocationGroup: toRef(gameStore, 'currentLocationGroup'),
    season: toRef(gameStore, 'season'),
    day: toRef(gameStore, 'day'),
    stamina: toRef(playerStore, 'stamina'),
    maxStamina: toRef(playerStore, 'maxStamina'),
    resourceSleepOptions,
    staminaRecoveryBonus: () => useHomeStore().getStaminaRecoveryBonus(),
    farmPlots: toRef(farmStore, 'plots'),
    getCropById,
    seasonNames: SEASON_NAMES
  })

  // 弹窗打开时自动暂停时钟，全部关闭后恢复
  watch(
    () =>
      !!(
        currentEvent.value ||
        pendingHeartEvent.value ||
        currentFestival.value ||
        pendingPerk.value ||
        pendingPetAdoption.value ||
        childProposalVisible.value ||
        pendingFarmEvent.value ||
        pendingDiscoveryScene.value ||
        showSleepConfirm.value ||
        showNapConfirm.value
      ),
    hasModal => {
      if (hasModal) pauseClock()
      else resumeClock()
    }
  )

  /** 宠物领养 */
  const petChoice = ref<'cat' | 'dog' | null>(null)
  const petNameInput = ref('')

  const confirmPetAdoption = () => {
    if (!petChoice.value) return
    const animalStore = useAnimalStore()
    const defaultName = petChoice.value === 'cat' ? '小花' : '旺财'
    const name = petNameInput.value.trim() || defaultName
    animalStore.adoptPet(petChoice.value, name)
    closePetAdoption()
    petChoice.value = null
    petNameInput.value = ''
  }

  /** 子女提议回应 */
  const proposalSpouseName = computed(() => {
    const spouse = npcStore.getSpouse()
    if (!spouse) return '配偶'
    return getNpcById(spouse.npcId)?.name ?? '配偶'
  })

  const handleChildProposalResponse = (response: 'accept' | 'decline' | 'wait') => {
    const result = npcStore.respondToChildProposal(response)
    addLog(result.message)
    if (result.friendshipChange !== 0) {
      addLog(`(好感${result.friendshipChange > 0 ? '+' : ''}${result.friendshipChange})`)
    }
    closeChildProposal()
  }

  const handleFarmEventChoice = (choice: MorningChoiceEvent['choices'][number]) => {
    addLog(choice.result)
    if (choice.effect) {
      switch (choice.effect.type) {
        case 'gainItem':
          inventoryStore.addItem(choice.effect.itemId, choice.effect.qty)
          break
        case 'gainMoney':
          playerStore.earnMoney(choice.effect.amount)
          break
        case 'gainFriendship':
          for (const s of npcStore.npcStates) {
            s.friendship += choice.effect.amount
          }
          break
      }
    }
    closeFarmEvent()
  }

  const {
    VOID_QUALITY_LABEL,
    expandedVoidChestId,
    getItemName,
    handleVoidDepositDuplicates,
    openVoidDeposit,
    openVoidDepositQty,
    openVoidWithdrawQty,
    setVoidQty,
    showVoidDepositModal,
    showVoidModal,
    toggleVoidChest,
    voidChestCapacity,
    voidChests,
    voidDepositableItems,
    voidDepositChestId,
    voidDuplicateDepositItems,
    voidItemDef,
    voidItemDetail,
    voidQty,
    voidQtyModal,
    voidQualityClass,
    confirmVoidQty
  } = useVoidChestUi({
    inventoryItems: () => inventoryStore.items,
    getChest: warehouseStore.getChest,
    getVoidChests: warehouseStore.getVoidChests,
    depositToChest: warehouseStore.depositToChest,
    withdrawFromChest: warehouseStore.withdrawFromChest,
    isChestFull: warehouseStore.isChestFull,
    getItemById,
    addLog,
    voidChestCapacity: CHEST_DEFS.void.capacity
  })

  const { confirmSleep, confirmNap } = useRestActions({
    isResolvingDay,
    showSleepConfirm,
    showNapConfirm,
    canNap,
    requestedNapMinutes,
    actualNapMinutes,
    resourceSleepOptions,
    hour: () => gameStore.hour,
    stamina: () => playerStore.stamina,
    pauseClock,
    resumeClock,
    switchToSeasonalBgm,
    handleEndDay,
    handleSleepOrPassOut,
    getResourceSleepOptions,
    advanceTime: gameStore.advanceTime,
    calcNapRecovery,
    restoreStamina: playerStore.restoreStamina
  })
</script>

<style scoped>
  /* 移动端地图按钮 */
  .mobile-map-btn,
  .mobile-setting-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-setting-btn {
    bottom: calc(calc(0.35rem * 10) + 48px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 48px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-void-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + 96px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 96px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-log-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + 96px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 96px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-log-btn.with-void {
    bottom: calc(calc(0.35rem * 10) + 144px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 144px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-map-btn:hover,
  .mobile-map-btn:active,
  .mobile-void-btn:hover,
  .mobile-void-btn:active,
  .mobile-log-btn:hover,
  .mobile-log-btn:active {
    background: var(--color-accent);
    color: rgb(var(--color-bg));
  }
</style>
