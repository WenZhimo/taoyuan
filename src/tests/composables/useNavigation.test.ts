import { beforeEach, describe, expect, it, vi } from 'vitest'
import { navigateToPanel } from '@/composables/useNavigation'

const mocks = vi.hoisted(() => ({
  addLog: vi.fn(),
  handleSleepOrPassOut: vi.fn(),
  isShopOpen: vi.fn(),
  markPanelVisited: vi.fn(),
  pauseClock: vi.fn(),
  resumeClock: vi.fn(),
  routerPush: vi.fn(),
  sfxClick: vi.fn(),
  showFloat: vi.fn(),
  startBgm: vi.fn(),
  travelTo: vi.fn()
}))

vi.mock('@/router', () => ({
  default: {
    push: mocks.routerPush
  }
}))

vi.mock('@/stores/useGameStore', () => ({
  useGameStore: () => ({
    day: 1,
    hour: 8,
    isPastBedtime: false,
    travelTo: mocks.travelTo
  })
}))

vi.mock('@/data/timeConstants', () => ({
  isShopOpen: mocks.isShopOpen,
  TAB_TO_LOCATION_GROUP: {
    forage: 'nature'
  }
}))

vi.mock('@/composables/useGameLog', () => ({
  addLog: mocks.addLog,
  showFloat: mocks.showFloat
}))

vi.mock('@/composables/useEndDay', () => ({
  handleSleepOrPassOut: mocks.handleSleepOrPassOut
}))

vi.mock('@/composables/useAudio', () => ({
  sfxClick: mocks.sfxClick,
  useAudio: () => ({
    startBgm: mocks.startBgm
  })
}))

vi.mock('@/composables/useGameClock', () => ({
  useGameClock: () => ({
    pauseClock: mocks.pauseClock,
    resumeClock: mocks.resumeClock
  })
}))

vi.mock('@/stores/useTutorialStore', () => ({
  useTutorialStore: () => ({
    markPanelVisited: mocks.markPanelVisited
  })
}))

vi.mock('@/stores/useNpcStore', () => ({
  useNpcStore: () => ({
    getSpouse: () => null
  })
}))

describe('navigateToPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isShopOpen.mockReturnValue({ open: true })
    mocks.travelTo.mockReturnValue({
      ok: true,
      timeCost: 1 / 6,
      passedOut: false,
      message: '前往野外，路上花了10分钟，消耗1点体力。'
    })
  })

  it('shows and records travel cost feedback before opening the destination', () => {
    navigateToPanel('forage')

    expect(mocks.travelTo).toHaveBeenCalledWith('forage')
    expect(mocks.addLog).toHaveBeenCalledWith('前往野外，路上花了10分钟，消耗1点体力。')
    expect(mocks.routerPush).toHaveBeenCalledWith({ name: 'forage' })
    expect(mocks.markPanelVisited).toHaveBeenCalledWith('forage')
    expect(mocks.resumeClock).toHaveBeenCalled()
  })
})
