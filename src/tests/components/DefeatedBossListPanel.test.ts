import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DefeatedBossListPanel from '@/components/game/mining/DefeatedBossListPanel.vue'

const mountPanel = (defeatedZones: InstanceType<typeof DefeatedBossListPanel>['$props']['defeatedZones'] = []) =>
  mount(DefeatedBossListPanel, {
    props: { defeatedZones }
  })

describe('DefeatedBossListPanel', () => {
  it('renders nothing when no bosses are defeated', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toBe('')
  })

  it('renders defeated boss names with their zones', () => {
    const wrapper = mountPanel([
      { id: 'shallow', name: '浅矿·土石洞穴', bossName: '岩甲王' },
      { id: 'frost', name: '冰窟·冰霜暗河', bossName: '寒霜兽' }
    ])

    expect(wrapper.text()).toContain('已击败BOSS')
    expect(wrapper.text()).toContain('岩甲王')
    expect(wrapper.text()).toContain('浅矿·土石洞穴')
    expect(wrapper.text()).toContain('寒霜兽')
    expect(wrapper.text()).toContain('冰窟·冰霜暗河')
  })

  it('mounts cheaply enough for repeated boss list previews', () => {
    const iterations = 180
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel([{ id: `zone-${i}`, name: `区域${i}`, bossName: `Boss${i}` }]).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
