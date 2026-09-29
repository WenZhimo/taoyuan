import { hashPayloadJson } from '@/domain/mods/hash'
import { isPackageId, type PackageId } from '@/domain/mods/ids'
import {
  createSaveContentEnvironment,
  type SaveContentEnvironment
} from '@/domain/save/saveContentEnvironment'
import { getCurrentSaveContentEnvironment } from '@/domain/save/saveContentEnvironmentRuntime'
import { useSaveStore } from '@/stores/useSaveStore'
import { encodeSaveData } from '@/utils/saveCodec'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const SAVE_META_KEY_PREFIX = 'taoyuanxiang_save_meta_'
const PROBE_PACKAGE_ID = 'save_safe_mode_probe_pack' as PackageId
const PROBE_SLOT = 0

export interface SaveSafeModeProductProbeResult {
  readonly schemaVersion: 1
  readonly status: 'ready'
  readonly ordinaryLoadRejected: true
  readonly safeModeDialogVisible: true
  readonly safeModeLoadSucceeded: true
  readonly safeModeReadOnly: true
  readonly sourceUnchanged: true
  readonly saveRejected: true
  readonly saveFailureReason: 'safe-mode-read-only'
  readonly settingsReadOnlyBannerVisible: true
  readonly routeAfterLoad: '/game'
  readonly savedPackageId: PackageId
}
interface SaveSafeModeProbeWindow extends Window {
  __TAOYUAN_SAVE_SAFE_MODE_PRODUCT_PROBE__?: SaveSafeModeProductProbeResult
}

const cloneOfficialIdentity = (environment: SaveContentEnvironment) => ({
  gameVersion: environment.gameVersion,
  engineApiVersion: environment.engineApiVersion,
  contentSchemaVersion: environment.contentSchemaVersion,
  loaderVersion: environment.loaderVersion,
  contentCompilerVersion: environment.contentCompilerVersion,
  schemaSetHash: environment.schemaSetHash,
  cacheFormatVersion: environment.cacheFormatVersion,
  trustPolicyVersion: environment.trustPolicyVersion,
  packages: environment.packages.map(pkg => ({
    ...pkg,
    resolvedDependencies: [...pkg.resolvedDependencies]
  }))
})

const createProbeEnvironment = (): SaveContentEnvironment => {
  const official = getCurrentSaveContentEnvironment()
  if (!isPackageId(PROBE_PACKAGE_ID)) throw new Error('save safe mode probe package id is invalid')
  return createSaveContentEnvironment({
    ...cloneOfficialIdentity(official),
    packages: [
      official.packages[0]!,
      {
        id: PROBE_PACKAGE_ID,
        version: '1.0.0',
        contentHash: hashPayloadJson('save-safe-mode-product-probe-content'),
        configurationHash: hashPayloadJson('save-safe-mode-product-probe-configuration'),
        loadIndex: 1,
        resolvedDependencies: []
      }
    ]
  })
}

const createProbeSaveData = (): Record<string, unknown> => ({
  saveFormatVersion: 3,
  contentEnvironment: createProbeEnvironment(),
  pluginData: {},
  packageSettings: {},
  game: {
    year: 1,
    season: 'spring',
    day: 1,
    hour: 6,
    weather: 'sunny',
    tomorrowWeather: 'sunny',
    currentLocation: 'farm',
    currentLocationGroup: 'farm',
    farmMapType: 'standard',
    dailyLuck: 0
  },
  player: {
    playerName: '安全模式探针',
    gender: 'male',
    money: 100,
    stamina: 100,
    maxStamina: 100,
    staminaCapLevel: 0,
    hp: 100,
    baseMaxHp: 100
  },
  inventory: {
    items: [],
    tempItems: [],
    capacity: 12,
    tools: [],
    ownedWeapons: [],
    equippedWeaponIndex: -1,
    ownedRings: [],
    equippedRingSlot1: -1,
    equippedRingSlot2: -1,
    ownedHats: [],
    equippedHatIndex: -1,
    ownedShoes: [],
    equippedShoeIndex: -1
  },
  farm: {
    farmSize: 4,
    plots: [],
    sprinklers: [],
    fruitTrees: [],
    greenhousePlots: [],
    greenhouseLevel: 0,
    wildTrees: [],
    nextFruitTreeId: 0,
    nextWildTreeId: 0,
    lightningRods: 0,
    scarecrows: 0
  },
  savedAt: '2026-01-01T00:00:00.000Z'
})

export const prepareSaveSafeModeProductProbe = async(): Promise<void> => {
  if (typeof localStorage === 'undefined') throw new Error('save safe mode probe requires localStorage')
  const encoded = await encodeSaveData(createProbeSaveData())
  localStorage.setItem(`${SAVE_KEY_PREFIX}${PROBE_SLOT}`, encoded)
  localStorage.removeItem(`${SAVE_META_KEY_PREFIX}${PROBE_SLOT}`)
}

const delay = async(ms: number): Promise<void> => {
  await new Promise(resolve => window.setTimeout(resolve, ms))
}

const waitForCondition = async<T>(
  read: () => T | null | undefined | false,
  reason: string,
  timeoutMs = 15_000
): Promise<T> => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const value = read()
    if (value !== null && value !== undefined && value !== false) return value
    await delay(25)
  }
  throw new Error(reason)
}

const getSaveSource = (): string | null =>
  typeof localStorage === 'undefined'
    ? null
    : localStorage.getItem(`${SAVE_KEY_PREFIX}${PROBE_SLOT}`)

export const runSaveSafeModeProductProbe = async(): Promise<SaveSafeModeProductProbeResult> => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('save safe mode probe requires a browser window')
  }

  const sourceBefore = getSaveSource()
  if (sourceBefore === null) throw new Error('save safe mode probe source slot is missing')

  const loadButton = await waitForCondition(
    () => document.querySelector<HTMLButtonElement>('[data-testid="save-slot-0"]'),
    'save safe mode probe could not find the source slot button'
  )
  loadButton.click()

  const dialog = await waitForCondition(
    () => document.querySelector<HTMLElement>('[data-testid="save-safe-mode-dialog"]'),
    'save safe mode probe did not show the safe mode dialog'
  )
  const ordinaryLoadRejected = dialog.textContent?.includes('原存档不会被覆盖') === true
  if (!ordinaryLoadRejected) throw new Error('save safe mode dialog omitted the source protection message')

  const confirmButton = await waitForCondition(
    () => document.querySelector<HTMLButtonElement>('[data-testid="save-safe-mode-confirm"]'),
    'save safe mode probe could not find the confirmation button'
  )
  confirmButton.click()

  const settingsButton = await waitForCondition(
    () => document.querySelector<HTMLButtonElement>('[data-testid="game-settings-button"]'),
    'save safe mode probe did not enter the game route'
  )
  const saveStore = useSaveStore()
  const safeModeLoadSucceeded = saveStore.activeSlot === PROBE_SLOT
    && saveStore.isReadOnlySafeMode === true
  if (!safeModeLoadSucceeded) throw new Error('save safe mode probe did not enter read-only mode')

  const sourceAfterLoad = getSaveSource()
  const saveRejected = await saveStore.saveToSlot(PROBE_SLOT) === false
  const saveFailureReason = saveStore.lastOperationFailure?.reason
  if (!saveRejected || saveFailureReason !== 'safe-mode-read-only') {
    throw new Error('save safe mode probe did not reject the write')
  }

  settingsButton.click()
  const readOnlyBanner = await waitForCondition(
    () => document.querySelector<HTMLElement>('[data-testid="save-safe-mode-read-only"]'),
    'save safe mode probe did not show the settings read-only banner'
  )
  const settingsReadOnlyBannerVisible = readOnlyBanner.textContent?.includes('当前存档只读') === true
  if (!settingsReadOnlyBannerVisible) throw new Error('save safe mode settings banner omitted read-only state')

  const result: SaveSafeModeProductProbeResult = Object.freeze({
    schemaVersion: 1,
    status: 'ready',
    ordinaryLoadRejected: true,
    safeModeDialogVisible: true,
    safeModeLoadSucceeded: true,
    safeModeReadOnly: true,
    sourceUnchanged: true,
    saveRejected: true,
    saveFailureReason: 'safe-mode-read-only',
    settingsReadOnlyBannerVisible: true,
    routeAfterLoad: '/game',
    savedPackageId: PROBE_PACKAGE_ID
  })
  if (sourceBefore !== sourceAfterLoad) throw new Error('save safe mode probe changed the source slot')
  Object.defineProperty(window as SaveSafeModeProbeWindow, '__TAOYUAN_SAVE_SAFE_MODE_PRODUCT_PROBE__', {
    value: result,
    configurable: true
  })
  return result
}
