import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QualityQuantityBreakdown from '@/components/game/inventory/QualityQuantityBreakdown.vue'
import type { QualityQuantityEntry } from '@/domain/inventory/qualityGroups'

const entries: QualityQuantityEntry[] = [
  { quality: 'normal', quantity: 4, locked: false, items: [] },
  { quality: 'fine', quantity: 20, locked: false, items: [] },
  { quality: 'excellent', quantity: 3, locked: false, items: [] },
  { quality: 'supreme', quantity: 4, locked: true, items: [] }
]

describe('QualityQuantityBreakdown', () => {
  it('renders every available quality quantity with matching colors', () => {
    const wrapper = mount(QualityQuantityBreakdown, { props: { entries } })
    const quantities = wrapper.findAll('[role="listitem"]')

    expect(wrapper.text()).toContain('×4')
    expect(wrapper.text()).toContain('×20')
    expect(quantities[0]?.classes()).toContain('text-text')
    expect(quantities[1]?.classes()).toContain('text-quality-fine')
    expect(quantities[2]?.classes()).toContain('text-quality-excellent')
    expect(quantities[3]?.classes()).toContain('text-quality-supreme')
    expect(quantities[3]?.attributes('aria-label')).toContain('已锁定')
  })

  it('emits the selected quality in interactive mode', async () => {
    const wrapper = mount(QualityQuantityBreakdown, {
      props: {
        entries,
        interactive: true,
        selectedQuality: 'fine'
      }
    })

    await wrapper.findAll('button')[2]?.trigger('click')

    expect(wrapper.emitted('select-quality')).toEqual([['excellent']])
    expect(wrapper.findAll('button')[1]?.classes()).toContain('border-accent/50')
  })
})
