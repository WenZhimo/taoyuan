import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FarmTabSwitcher from '@/components/game/farm/FarmTabSwitcher.vue'
import type { FarmTab } from '@/components/game/farm/FarmTabSwitcher.vue'

const mountSwitcher = (modelValue: FarmTab = 'field') =>
  mount(FarmTabSwitcher, {
    props: {
      modelValue
    }
  })

describe('FarmTabSwitcher', () => {
  it('renders both farm tabs and highlights field tab', () => {
    const wrapper = mountSwitcher('field')
    const buttons = wrapper.findAll('button')
    const fieldButton = buttons[0]!
    const treeButton = buttons[1]!

    expect(wrapper.text()).toContain('田庄')
    expect(wrapper.text()).toContain('林木')
    expect(fieldButton.classes()).toContain('!bg-accent')
    expect(treeButton.classes()).not.toContain('!bg-accent')
  })

  it('highlights tree tab', () => {
    const wrapper = mountSwitcher('tree')
    const buttons = wrapper.findAll('button')
    const fieldButton = buttons[0]!
    const treeButton = buttons[1]!

    expect(fieldButton.classes()).not.toContain('!bg-accent')
    expect(treeButton.classes()).toContain('!bg-accent')
  })

  it('emits model updates when tabs are clicked', async () => {
    const wrapper = mountSwitcher('field')
    const buttons = wrapper.findAll('button')
    const fieldButton = buttons[0]!
    const treeButton = buttons[1]!

    await treeButton.trigger('click')
    await fieldButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['tree'], ['field']])
  })

  it('mounts cheaply enough for repeated tab previews', () => {
    const iterations = 250
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountSwitcher(i % 2 === 0 ? 'field' : 'tree').unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
