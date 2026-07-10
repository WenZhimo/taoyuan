import type { MineTile } from '@/types'

export interface MineTileDisplayInput {
  tile: MineTile
  bombModeActive: boolean
  canReveal: boolean
}

export const getMineTileClass = ({ tile, bombModeActive, canReveal }: MineTileDisplayInput): string => {
  if (tile.state === 'hidden') {
    if (bombModeActive) return 'bg-panel/50 border-accent/10 cursor-not-allowed opacity-40'
    if (canReveal) return 'bg-panel border-accent/30 hover:border-accent cursor-pointer'
    return 'bg-panel/50 border-accent/10 cursor-not-allowed opacity-40'
  }

  switch (tile.type) {
    case 'empty':
      return 'bg-bg border-accent/10'
    case 'ore':
      return tile.state === 'collected' ? 'bg-bg border-accent/10' : 'bg-accent/20 border-accent/40'
    case 'monster':
      return tile.state === 'defeated' ? 'bg-bg border-accent/10' : 'bg-danger/20 border-danger/40 cursor-pointer'
    case 'boss':
      return tile.state === 'defeated' ? 'bg-bg border-accent/10' : 'bg-danger/30 border-danger/50 cursor-pointer'
    case 'stairs':
      return 'bg-success/20 border-success/40'
    case 'trap':
      return 'bg-danger/10 border-danger/20'
    case 'treasure':
      return tile.state === 'collected' ? 'bg-bg border-accent/10' : 'bg-accent/30 border-accent/50'
    case 'mushroom':
      return tile.state === 'collected' ? 'bg-bg border-accent/10' : 'bg-success/20 border-success/30'
    default:
      return 'bg-bg border-accent/10'
  }
}

export const getMineTileIcon = (tile: MineTile): string => {
  if (tile.state === 'hidden') return '?'

  switch (tile.type) {
    case 'empty':
      return '·'
    case 'ore':
      return tile.state === 'collected' ? '·' : '◆'
    case 'monster':
      return tile.state === 'defeated' ? '×' : '!'
    case 'boss':
      return tile.state === 'defeated' ? '×' : '☠'
    case 'stairs':
      return '▼'
    case 'trap':
      return '△'
    case 'treasure':
      return tile.state === 'collected' ? '·' : '★'
    case 'mushroom':
      return tile.state === 'collected' ? '·' : '✿'
    default:
      return '·'
  }
}

export const isMineTileClickable = ({ tile, bombModeActive, canReveal }: MineTileDisplayInput): boolean => {
  if (bombModeActive) return tile.state !== 'hidden'

  if (tile.state === 'revealed' && (tile.type === 'monster' || tile.type === 'boss') && tile.data?.monster) {
    return true
  }

  return tile.state === 'hidden' && canReveal
}
