import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GreenhouseUpgradeDialog from '@/components/game/farm/GreenhouseUpgradeDialog.vue'
import type { GreenhouseUpgradeDef } from '@/data/buildings'

const upgrade: GreenhouseUpgradeDef = {
  level: 1,
  name: '扩建温室',
  plotCount: 200,
  gridCols: 20,
  cost: 12_000,
  materialCost: [
    { itemId: 'wood', quantity: 200 },
    { itemId: 'stone', quantity: 100 }
  ],
  description: '增加温室地块。'
}

const mountDialog = (props: Partial<InstanceType<typeof GreenhouseUpgradeDialog>['$props']> = {}) =>
  mount(GreenhouseUpgradeDialog, {
    props: {
      canAffordMoney: true,
      materialRows: [
        { itemId: 'wood', name: '木材', current: 250, required: 200 },
        { itemId: 'stone', name: '石头', current: 40, required: 100 }
      ],
      upgrade,
      ...props
    }
  })

describe('GreenhouseUpgradeDialog', () => {
  it('renders upgrade cost, description, and material requirements', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('扩建温室')
    expect(wrapper.text()).toContain('增加温室地块。')
    expect(wrapper.text()).toContain('12000文')
    expect(wrapper.text()).toContain('木材')
    expect(wrapper.text()).toContain('250/200')
    expect(wrapper.text()).toContain('石头')
    expect(wrapper.text()).toContain('40/100')
  })

  it('marks money and material rows by affordability', () => {
    const affordable = mountDialog()
    const poor = mountDialog({ canAffordMoney: false })

    expect(affordable.text()).toContain('12000文')
    expect(affordable.findAll('.text-success').length).toBeGreaterThan(0)
    expect(affordable.findAll('.text-danger').length).toBeGreaterThan(0)
    expect(poor.findAll('.text-danger').some(node => node.text() === '12000文')).toBe(true)
  })

  it('emits close and confirm events', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('取消'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('确认升级'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated upgrade previews', () => {
    const iterations = 160
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ canAffordMoney: i % 2 === 0 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
