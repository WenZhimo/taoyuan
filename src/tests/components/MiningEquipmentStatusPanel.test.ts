import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MiningEquipmentStatusPanel from '@/components/game/mining/MiningEquipmentStatusPanel.vue'

const mountPanel = (props: Partial<InstanceType<typeof MiningEquipmentStatusPanel>['$props']> = {}) =>
  mount(MiningEquipmentStatusPanel, {
    props: {
      weaponDisplayName: '寒铁剑',
      weaponAttack: 42,
      weaponTypeName: '长剑',
      critRateDisplay: '18%',
      weaponEnchantName: '锋利x2',
      hp: 35,
      maxHp: 100,
      hpPercent: 35,
      isLowHp: true,
      stamina: 80,
      maxStamina: 120,
      ...props
    }
  })

describe('MiningEquipmentStatusPanel', () => {
  it('renders weapon, combat stats, hp, stamina, and enchantment summary', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('装备与状态')
    expect(wrapper.text()).toContain('寒铁剑')
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('长剑 · 18%')
    expect(wrapper.text()).toContain('锋利x2')
    expect(wrapper.text()).toContain('35/100')
    expect(wrapper.text()).toContain('80/120')
  })

  it('hides enchantment row when there is no enchantment summary', () => {
    const wrapper = mountPanel({ weaponEnchantName: '' })

    expect(wrapper.text()).not.toContain('附魔')
    expect(wrapper.text()).not.toContain('详情')
  })

  it('emits detail event from enchantment button', async () => {
    const wrapper = mountPanel()

    await wrapper.findAll('button').find(button => button.text().includes('详情'))?.trigger('click')
    expect(wrapper.emitted('view-enchantment-detail')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated status panel previews', () => {
    const iterations = 150
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({ hp: 20 + (i % 70), hpPercent: 20 + (i % 70), isLowHp: i % 3 === 0 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
