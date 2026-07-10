import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineElevatorDialog, { type MineElevatorZone } from '@/components/game/mining/MineElevatorDialog.vue'

const elevatorZones: MineElevatorZone[] = [
  { name: '浅矿', floors: [0, 10] },
  { name: '冰窟', floors: [20] }
]

const mountDialog = (props: Partial<InstanceType<typeof MineElevatorDialog>['$props']> = {}) =>
  mount(MineElevatorDialog, {
    props: {
      show: true,
      autoExplore: false,
      safePointFloor: 30,
      elevatorZones,
      isSkullCavernUnlocked: true,
      skullSafePointFloor: 50,
      skullElevatorFloors: [40],
      ...props
    }
  })

describe('MineElevatorDialog', () => {
  it('renders mine entrance, safe point, elevator zones, and skull cavern entrance', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('探索')
    expect(wrapper.text()).toContain('安全点：第30层')
    expect(wrapper.text()).toContain('进入矿洞')
    expect(wrapper.text()).toContain('第31层')
    expect(wrapper.text()).toContain('浅矿')
    expect(wrapper.text()).toContain('冰窟')
    expect(wrapper.text()).toContain('进入骷髅矿穴')
    expect(wrapper.text()).toContain('第51层')
  })

  it('renders entrance safe point text', () => {
    const wrapper = mountDialog({ safePointFloor: 0 })

    expect(wrapper.text()).toContain('安全点：入口')
    expect(wrapper.text()).toContain('第1层')
  })

  it('emits auto explore model updates', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="toggle-auto-explore"]').trigger('click')

    expect(wrapper.emitted('update:autoExplore')?.[0]).toEqual([true])
  })

  it('emits mine entrance with the current auto explore value', async () => {
    const wrapper = mountDialog({ autoExplore: true })

    await wrapper.get('[data-testid="enter-mine-front"]').trigger('click')
    await wrapper.get('[data-testid="enter-mine-floor-10"]').trigger('click')

    expect(wrapper.emitted('enter-mine')?.[0]).toEqual([undefined, true])
    expect(wrapper.emitted('enter-mine')?.[1]).toEqual([10, true])
  })

  it('emits skull cavern entrance and hides it when locked', async () => {
    const wrapper = mountDialog({ autoExplore: true })

    await wrapper.get('[data-testid="enter-skull-front"]').trigger('click')
    await wrapper.get('[data-testid="enter-skull-floor-40"]').trigger('click')

    expect(wrapper.emitted('enter-skull-cavern')?.[0]).toEqual([undefined, true])
    expect(wrapper.emitted('enter-skull-cavern')?.[1]).toEqual([40, true])
    expect(mountDialog({ isSkullCavernUnlocked: false }).text()).not.toContain('进入骷髅矿穴')
  })

  it('emits close from close button', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="close-elevator"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated elevator previews', () => {
    const iterations = 120
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ safePointFloor: i % 120, autoExplore: i % 2 === 0 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(30)
  })
})
