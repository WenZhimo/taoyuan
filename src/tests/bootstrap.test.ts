import { createApp, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mountAfterRouterReady } from '@/bootstrap'

describe('mountAfterRouterReady', () => {
  it('waits for the initial route before mounting the app', async () => {
    document.body.innerHTML = '<div id="app"></div>'

    let resolveReady!: () => void
    const router = {
      isReady: vi.fn(
        () =>
          new Promise<void>(resolve => {
            resolveReady = resolve
          })
      )
    }
    const app = createApp({
      render: () => h('div', { 'data-testid': 'ready' }, 'ready')
    })
    const mountSpy = vi.spyOn(app, 'mount')

    const mounting = mountAfterRouterReady(app, router)
    await Promise.resolve()

    expect(router.isReady).toHaveBeenCalledOnce()
    expect(mountSpy).not.toHaveBeenCalled()
    expect(document.querySelector('[data-testid="ready"]')).toBeNull()

    resolveReady()
    await mounting

    expect(mountSpy).toHaveBeenCalledWith('#app')
    expect(document.querySelector('[data-testid="ready"]')?.textContent).toBe('ready')

    app.unmount()
  })

  it('does not mount when initial navigation fails', async () => {
    const app = createApp({
      render: () => h('div', 'ready')
    })
    const mountSpy = vi.spyOn(app, 'mount')
    const error = new Error('navigation failed')

    await expect(
      mountAfterRouterReady(app, {
        isReady: vi.fn().mockRejectedValue(error)
      })
    ).rejects.toBe(error)

    expect(mountSpy).not.toHaveBeenCalled()
  })
})
