import { ref, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { groupLogEntriesByDay, useGameLogs } from '@/composables/layout/useGameLogs'
import { addLog, logHistory } from '@/composables/useGameLog'

vi.mock('qmsg', () => ({
  default: {
    config: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    closeAll: vi.fn()
  }
}))

describe('useGameLogs', () => {
  beforeEach(() => {
    logHistory.value = []
  })

  it('groups logs by day with newest days and newest messages first', () => {
    const groups = groupLogEntriesByDay([
      { dayLabel: '第1年 春 第1天', msg: '播种青菜' },
      { dayLabel: '第1年 春 第1天', msg: '浇水' },
      { dayLabel: '第1年 春 第2天', msg: '收获青菜' }
    ])

    expect(groups).toEqual([
      { label: '第1年 春 第2天', messages: ['收获青菜'] },
      { label: '第1年 春 第1天', messages: ['浇水', '播种青菜'] }
    ])
  })

  it('registers day labels and clears all logs through the dialog state', () => {
    const showLogModal = ref(true)
    const logs = useGameLogs({
      showLogModal,
      getDayLabel: () => '第1年 春 第3天'
    })

    addLog('发现宝箱')
    logs.requestClearLogs(null)
    logs.executeClearLogs()

    expect(logHistory.value).toEqual([])
    expect(logs.clearLogTarget.value).toBeUndefined()
  })

  it('clears a selected day and resets pending confirmation when the dialog closes', async () => {
    logHistory.value = [
      { dayLabel: '第1年 春 第1天', msg: '播种青菜' },
      { dayLabel: '第1年 春 第2天', msg: '收获青菜' }
    ]

    const showLogModal = ref(true)
    const logs = useGameLogs({
      showLogModal,
      getDayLabel: () => '第1年 春 第3天'
    })

    logs.requestClearLogs('第1年 春 第1天')
    logs.executeClearLogs()
    expect(logHistory.value).toEqual([{ dayLabel: '第1年 春 第2天', msg: '收获青菜' }])

    logs.requestClearLogs('第1年 春 第2天')
    showLogModal.value = false
    await nextTick()

    expect(logs.clearLogTarget.value).toBeUndefined()
  })
})
