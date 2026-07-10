import { describe, expect, it } from 'vitest'
import { getMineTileClass, getMineTileIcon, isMineTileClickable } from '@/domain/mining/tileDisplay'
import type { MineTile, MineTileData } from '@/types'

const tile = (overrides: Partial<MineTile>): MineTile => ({
  index: 0,
  type: 'empty',
  state: 'hidden',
  ...overrides
})

describe('mining tile display rules', () => {
  it('formats hidden tile classes from bomb mode and reveal availability', () => {
    const hiddenTile = tile({ state: 'hidden' })

    expect(getMineTileClass({ tile: hiddenTile, bombModeActive: true, canReveal: true })).toBe(
      'bg-panel/50 border-accent/10 cursor-not-allowed opacity-40'
    )
    expect(getMineTileClass({ tile: hiddenTile, bombModeActive: false, canReveal: true })).toBe(
      'bg-panel border-accent/30 hover:border-accent cursor-pointer'
    )
    expect(getMineTileClass({ tile: hiddenTile, bombModeActive: false, canReveal: false })).toBe(
      'bg-panel/50 border-accent/10 cursor-not-allowed opacity-40'
    )
  })

  it('formats revealed tile classes for collectible and combat states', () => {
    expect(getMineTileClass({ tile: tile({ type: 'ore', state: 'revealed' }), bombModeActive: false, canReveal: false })).toBe(
      'bg-accent/20 border-accent/40'
    )
    expect(getMineTileClass({ tile: tile({ type: 'ore', state: 'collected' }), bombModeActive: false, canReveal: false })).toBe(
      'bg-bg border-accent/10'
    )
    expect(getMineTileClass({ tile: tile({ type: 'monster', state: 'revealed' }), bombModeActive: false, canReveal: false })).toBe(
      'bg-danger/20 border-danger/40 cursor-pointer'
    )
    expect(getMineTileClass({ tile: tile({ type: 'boss', state: 'defeated' }), bombModeActive: false, canReveal: false })).toBe(
      'bg-bg border-accent/10'
    )
  })

  it('formats tile icons from type and state', () => {
    expect(getMineTileIcon(tile({ type: 'ore', state: 'hidden' }))).toBe('?')
    expect(getMineTileIcon(tile({ type: 'ore', state: 'revealed' }))).toBe('◆')
    expect(getMineTileIcon(tile({ type: 'monster', state: 'defeated' }))).toBe('×')
    expect(getMineTileIcon(tile({ type: 'boss', state: 'revealed' }))).toBe('☠')
    expect(getMineTileIcon(tile({ type: 'treasure', state: 'revealed' }))).toBe('★')
    expect(getMineTileIcon(tile({ type: 'mushroom', state: 'collected' }))).toBe('·')
  })

  it('resolves clickable states for bomb mode, revealed monsters, and hidden revealable tiles', () => {
    expect(isMineTileClickable({ tile: tile({ state: 'hidden' }), bombModeActive: true, canReveal: true })).toBe(false)
    expect(isMineTileClickable({ tile: tile({ state: 'revealed' }), bombModeActive: true, canReveal: false })).toBe(true)
    expect(
      isMineTileClickable({
        tile: tile({ type: 'monster', state: 'revealed', data: { monster: { id: 'bat' } } as MineTileData }),
        bombModeActive: false,
        canReveal: false
      })
    ).toBe(true)
    expect(isMineTileClickable({ tile: tile({ state: 'hidden' }), bombModeActive: false, canReveal: true })).toBe(true)
    expect(isMineTileClickable({ tile: tile({ state: 'hidden' }), bombModeActive: false, canReveal: false })).toBe(false)
  })
})
