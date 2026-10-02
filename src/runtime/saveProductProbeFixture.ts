import type { SaveContentEnvironment } from '@/domain/save/saveContentEnvironment'

export const createSaveProductProbeData = (
  environment: SaveContentEnvironment,
  playerName: string
): Record<string, unknown> => ({
  saveFormatVersion: 3,
  contentEnvironment: environment,
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
    playerName,
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
