import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineEquipmentPropertyDialog, { type MineEquipmentPropertyInfo } from '@/components/game/mining/MineEquipmentPropertyDialog.vue'

const info: MineEquipmentPropertyInfo = {
  category: '戒指',
  name: '矿工戒指',
  description: '适合矿洞探索的戒指。',
  effects: [
    { label: '掉落率', value: '+20%' },
    { label: '攻击力', value: '+5' }
  ]
}

const mountDialog = (props: Partial<InstanceType<typeof MineEquipmentPropertyDialog>['$props']> = {}) =>
  mount(MineEquipmentPropertyDialog, {
    props: {
      show: true,
      info,
      ...props
    }
  })

describe('MineEquipmentPropertyDialog', () => {
  it('renders equipment property summary and effects', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('戒指')
    expect(wrapper.text()).toContain('矿工戒指')
    expect(wrapper.text()).toContain('适合矿洞探索的戒指。')
    expect(wrapper.text()).toContain('掉落率')
    expect(wrapper.text()).toContain('+20%')
    expect(wrapper.text()).toContain('攻击力')
    expect(wrapper.text()).toContain('+5')
  })

  it('renders without effects', () => {
    const wrapper = mountDialog({ info: { ...info, effects: [] } })

    expect(wrapper.text()).toContain('矿工戒指')
    expect(wrapper.text()).not.toContain('掉落率')
  })

  it('does not render without property info', () => {
    const wrapper = mountDialog({ info: null })

    expect(wrapper.text()).toBe('')
  })

  it('emits close from close button', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="close-equipment-property"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated property previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ info: i % 2 === 0 ? info : { ...info, effects: [] } }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
