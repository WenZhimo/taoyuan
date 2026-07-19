import { createApp, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import {
  bootstrapApplication,
  mountAfterRouterReady,
  reportApplicationStartupFailure
} from '@/bootstrap'

describe('bootstrapApplication', () => {
  it('does not create application state until official content is ready', async () => {
    const events: string[] = []
    let resolveOfficialContent!: () => void
    const app = { id: 'app' }
    const pinia = { id: 'pinia' }
    const router = { id: 'router' }
    const bootstrapping = bootstrapApplication({
      bootstrapOfficialContent: vi.fn(() => {
        events.push('official-content')
        return new Promise<void>(resolve => {
          resolveOfficialContent = resolve
        })
      }),
      createApp: vi.fn(() => {
        events.push('create-app')
        return app
      }),
      createPinia: vi.fn(() => {
        events.push('create-pinia')
        return pinia
      }),
      configurePinia: vi.fn(() => events.push('configure-pinia')),
      installPinia: vi.fn(() => events.push('install-pinia')),
      getRouter: vi.fn(() => {
        events.push('get-router')
        return router
      }),
      installRouter: vi.fn(() => events.push('install-router')),
      mount: vi.fn(async () => {
        events.push('read-save')
        events.push('mount')
      })
    })

    await Promise.resolve()
    expect(events).toEqual(['official-content'])

    resolveOfficialContent()
    await expect(bootstrapping).resolves.toEqual({ app, pinia, router })
    expect(events).toEqual([
      'official-content',
      'create-app',
      'create-pinia',
      'configure-pinia',
      'install-pinia',
      'get-router',
      'install-router',
      'read-save',
      'mount'
    ])
  })

  it.each(['build', 'structure', 'semantics', 'freeze'])(
    'does not create Pinia, read saves, or mount when official %s fails',
    async stage => {
      const events: string[] = []
      const error = Object.assign(new Error(`${stage} failed`), { stage })

      await expect(bootstrapApplication({
        bootstrapOfficialContent: vi.fn().mockRejectedValue(error),
        createApp: vi.fn(() => {
          events.push('create-app')
          return {}
        }),
        createPinia: vi.fn(() => {
          events.push('create-pinia')
          return {}
        }),
        configurePinia: vi.fn(() => events.push('configure-pinia')),
        installPinia: vi.fn(() => events.push('install-pinia')),
        getRouter: vi.fn(() => ({})),
        installRouter: vi.fn(() => events.push('install-router')),
        mount: vi.fn(async () => {
          events.push('read-save')
          events.push('mount')
        })
      })).rejects.toBe(error)

      expect(events).toEqual([])
    }
  )
})

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

describe('reportApplicationStartupFailure', () => {
  it('logs the complete error and replaces the application root with a minimal failure state', () => {
    document.body.innerHTML = '<div id="app"><span>loading</span></div>'
    const error = new Error('registry validation failed')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const reportStartupFailure = vi.fn()
    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      value: { reportStartupFailure }
    })

    reportApplicationStartupFailure(error)

    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('[taoyuan-core]'))
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('registry validation failed'))
    expect(reportStartupFailure).toHaveBeenCalledWith(expect.stringContaining('registry validation failed'))
    expect(document.querySelector('#app')?.textContent).toContain('游戏启动失败')
    expect(document.querySelector('#app')?.textContent).toContain('官方内容校验未通过')
    Reflect.deleteProperty(window, 'electronAPI')
    consoleError.mockRestore()
  })
})
