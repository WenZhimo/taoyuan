import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineGridPanel from '@/components/game/mining/MineGridPanel.vue'
import type { MineTile } from '@/types'

const tiles: MineTile[] = [
  { index: 0, type: 'empty', state: 'revealed' },
  { index: 1, type: 'ore', state: 'revealed' },
  { index: 2, type: 'monster', state: 'hidden' }
]

const mountPanel = (props: Partial<InstanceType<typeof MineGridPanel>['$props']> = {}) =>
  mount(MineGridPanel, {
    props: {
      tiles,
      getTileClass: (tile: MineTile) => (tile.state === 'hidden' ? 'hidden-tile' : 'visible-tile'),
      getTileIcon: (tile: MineTile) => (tile.type === 'ore' ? '⛏' : tile.type === 'monster' ? '?' : '·'),
      isTileClickable: (tile: MineTile) => tile.state !== 'hidden',
      ...props
    }
  })

describe('MineGridPanel', () => {
  it('renders tile icons, classes, and disabled states', () => {
    const wrapper = mountPanel()
    const firstTile = wrapper.get('[data-testid="mine-tile-0"]')
    const oreTile = wrapper.get('[data-testid="mine-tile-1"]')
    const hiddenTile = wrapper.get('[data-testid="mine-tile-2"]')

    expect(firstTile.text()).toBe('·')
    expect(oreTile.text()).toBe('⛏')
    expect(hiddenTile.text()).toBe('?')
    expect(firstTile.classes()).toContain('visible-tile')
    expect(hiddenTile.classes()).toContain('hidden-tile')
    expect(hiddenTile.attributes('disabled')).toBeDefined()
  })

  it('emits selected tile for clickable tiles only', async () => {
    const wrapper = mountPanel()

    await wrapper.get('[data-testid="mine-tile-1"]').trigger('click')
    await wrapper.get('[data-testid="mine-tile-2"]').trigger('click')

    expect(wrapper.emitted('select-tile')).toHaveLength(1)
    expect(wrapper.emitted('select-tile')?.[0]?.[0]).toMatchObject({ index: 1, type: 'ore' })
  })

  it('mounts cheaply enough for repeated mine grid previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({
        tiles: Array.from({ length: 36 }, (_, index) => ({
          index,
          type: index % 5 === 0 ? 'monster' : 'empty',
          state: index % 3 === 0 ? 'hidden' : 'revealed'
        })) as MineTile[]
      }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(30)
  })
})
