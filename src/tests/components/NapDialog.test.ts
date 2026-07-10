import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NapDialog from '@/components/game/layout/NapDialog.vue'

const mountDialog = (props: Partial<InstanceType<typeof NapDialog>['$props']> = {}) =>
  mount(NapDialog, {
    props: {
      minutes: 60,
      quickMinutes: [30, 60, 120, 240],
      currentTime: '20:00',
      wakeTime: '21:00',
      recoveryPreview: 12,
      canNap: true,
      interrupted: false,
      formatDuration: (minutes: number) => `${minutes}分`,
      ...props
    }
  })

describe('NapDialog', () => {
  it('renders nap preview information and interruption warnings', () => {
    const wrapper = mountDialog({ interrupted: true, recoveryPreview: 18, wakeTime: '01:59' })

    expect(wrapper.text()).toContain('小憩')
    expect(wrapper.text()).toContain('当前时间：20:00')
    expect(wrapper.text()).toContain('预计醒来：01:59')
    expect(wrapper.text()).toContain('预计恢复：18体力')
    expect(wrapper.text()).toContain('时间过长，会在凌晨2点前被打断。')
  })

  it('disables confirm when napping is no longer allowed', () => {
    const wrapper = mountDialog({ canNap: false })
    const confirmButton = wrapper.findAll('button').find(button => button.text().includes('开始小憩'))

    expect(wrapper.text()).toContain('现在已经太晚了，不能再小憩。')
    expect(confirmButton?.attributes('disabled')).toBeDefined()
  })

  it('emits duration changes from quick buttons and number input', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button').find(button => button.text().includes('120分'))?.trigger('click')
    await wrapper.find('input').setValue('90.8')

    expect(wrapper.emitted('update:minutes')).toEqual([[120], [90]])
  })

  it('emits cancel and confirm actions', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')

    await buttons.find(button => button.text().includes('取消'))?.trigger('click')
    await buttons.find(button => button.text().includes('开始小憩'))?.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated modal previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ minutes: (i % 240) + 1 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(30)
  })
})
