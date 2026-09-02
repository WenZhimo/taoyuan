import { createApp, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bootstrapApplication,
  mountAfterRouterReady,
  reportApplicationStartupFailure
} from '@/bootstrap'
import {
  getThirdPartyDataPackMountedAppStartupHostEvidence,
  publishThirdPartyDataPackMountedAppStartupHostEvidence,
  resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests
} from '@/domain/mods/thirdPartyDataPackMountedAppStartupHostConnection'

describe('bootstrapApplication', () => {
  afterEach(() => {
    resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests()
  })

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

  it('runs the third-party startup gate before creating application state', async () => {
    const events: string[] = []
    const app = { id: 'app' }
    const pinia = { id: 'pinia' }
    const router = { id: 'router' }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => {
        events.push('official-content')
      }),
      bootstrapThirdPartyStartupGate: vi.fn(async () => {
        events.push('third-party-startup-gate')
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
    })).resolves.toEqual({ app, pinia, router })

    expect(events).toEqual([
      'official-content',
      'third-party-startup-gate',
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

  it('publishes the official registry baseline before the third-party startup gate', async () => {
    const events: string[] = []
    const registrySet = { id: 'official-registry-set' }
    const app = { id: 'app' }
    const pinia = { id: 'pinia' }
    const router = { id: 'router' }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => {
        events.push('official-content')
        return registrySet
      }),
      publishRuntimeContentRegistry: vi.fn(async registry => {
        events.push('publish-runtime-registry')
        expect(registry).toBe(registrySet)
      }),
      bootstrapThirdPartyStartupGate: vi.fn(async () => {
        events.push('third-party-startup-gate')
        expect(events).toEqual([
          'official-content',
          'publish-runtime-registry',
          'third-party-startup-gate'
        ])
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
    })).resolves.toEqual({ app, pinia, router })

    expect(events).toEqual([
      'official-content',
      'publish-runtime-registry',
      'third-party-startup-gate',
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

  it('runs the after-mount hook only after the application has mounted', async () => {
    const events: string[] = []
    const app = { id: 'app' }
    const pinia = { id: 'pinia' }
    const router = { id: 'router' }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => {
        events.push('official-content')
      }),
      bootstrapThirdPartyStartupGate: vi.fn(async () => {
        events.push('third-party-startup-gate')
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
      }),
      afterMount: vi.fn(async result => {
        events.push('after-mount')
        expect(result).toEqual({ app, pinia, router })
      })
    })).resolves.toEqual({ app, pinia, router })

    expect(events).toEqual([
      'official-content',
      'third-party-startup-gate',
      'create-app',
      'create-pinia',
      'configure-pinia',
      'install-pinia',
      'get-router',
      'install-router',
      'read-save',
      'mount',
      'after-mount'
    ])
  })

  it('passes the accepted third-party startup gate result to the post-mount hook', async () => {
    const events: string[] = []
    const app = { id: 'app' }
    const pinia = { id: 'pinia' }
    const router = { id: 'router' }
    const startupGateResult = {
      status: 'ready',
      appBootstrapContinuationAllowed: true,
      targetPackageId: 'sample_pack',
      reason: 'path-free startup gate accepted app bootstrap'
    }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => {
        events.push('official-content')
      }),
      bootstrapThirdPartyStartupGate: vi.fn(async () => {
        events.push('third-party-startup-gate')
        return startupGateResult
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
      }),
      afterMount: vi.fn(async result => {
        events.push('after-mount')
        expect(result.thirdPartyStartupGateResult).toBe(startupGateResult)
      })
    })).resolves.toEqual({ app, pinia, router, thirdPartyStartupGateResult: startupGateResult })

    expect(events).toEqual([
      'official-content',
      'third-party-startup-gate',
      'create-app',
      'create-pinia',
      'configure-pinia',
      'install-pinia',
      'get-router',
      'install-router',
      'read-save',
      'mount',
      'after-mount'
    ])
  })

  it('acknowledges third-party app startup only after the app has mounted', async () => {
    const events: string[] = []
    const app = { id: 'app' }
    const pinia = { id: 'pinia' }
    const router = { id: 'router' }
    const startupGateResult = {
      status: 'ready',
      appBootstrapContinuationAllowed: true,
      targetPackageId: 'sample_pack',
      reason: 'path-free startup gate accepted app bootstrap'
    }
    const appStartupHostResult = {
      status: 'accepted',
      targetPackageId: 'sample_pack'
    }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => {
        events.push('official-content')
        return { id: 'registry-set' }
      }),
      publishRuntimeContentRegistry: vi.fn(async () => {
        events.push('publish-runtime-registry')
      }),
      bootstrapThirdPartyStartupGate: vi.fn(async () => {
        events.push('third-party-startup-gate')
        return startupGateResult
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
      }),
      acknowledgeThirdPartyAppStartupHost: vi.fn(async options => {
        events.push('app-startup-host')
        expect(options.thirdPartyStartupGateResult).toBe(startupGateResult)
        expect(Object.isFrozen(options.evidence)).toBe(true)
        expect(options.evidence).toEqual({
          officialContentBootstrapped: true,
          runtimeContentRegistryPublished: true,
          thirdPartyStartupGateCompleted: true,
          thirdPartyStartupGateAllowed: true,
          gameAppCreated: true,
          piniaCreated: true,
          routerInstalled: true,
          routerMounted: true
        })
        expect(JSON.stringify(options)).not.toContain('"app"')
        expect(JSON.stringify(options)).not.toContain('"pinia"')
        expect(JSON.stringify(options)).not.toContain('"router"')
        publishThirdPartyDataPackMountedAppStartupHostEvidence(options.evidence)
        return appStartupHostResult
      }),
      afterMount: vi.fn(async result => {
        events.push('after-mount')
        expect(result.thirdPartyAppStartupHostResult).toBe(appStartupHostResult)
        expect(getThirdPartyDataPackMountedAppStartupHostEvidence()).toEqual({
          officialContentBootstrapped: true,
          runtimeContentRegistryPublished: true,
          thirdPartyStartupGateCompleted: true,
          thirdPartyStartupGateAllowed: true,
          gameAppCreated: true,
          piniaCreated: true,
          routerInstalled: true,
          routerMounted: true
        })
      })
    })).resolves.toEqual({
      app,
      pinia,
      router,
      thirdPartyStartupGateResult: startupGateResult,
      thirdPartyAppStartupHostResult: appStartupHostResult
    })

    expect(events).toEqual([
      'official-content',
      'publish-runtime-registry',
      'third-party-startup-gate',
      'create-app',
      'create-pinia',
      'configure-pinia',
      'install-pinia',
      'get-router',
      'install-router',
      'read-save',
      'mount',
      'app-startup-host',
      'after-mount'
    ])
  })

  it('does not run the after-mount hook when the startup gate blocks app bootstrap', async () => {
    const afterMount = vi.fn(async () => undefined)
    const result = {
      status: 'blocked',
      appBootstrapContinuationAllowed: false,
      reason: 'path-free blocked startup gate'
    }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => undefined),
      bootstrapThirdPartyStartupGate: vi.fn(async () => result),
      createApp: vi.fn(() => ({})),
      createPinia: vi.fn(() => ({})),
      configurePinia: vi.fn(),
      installPinia: vi.fn(),
      getRouter: vi.fn(() => ({})),
      installRouter: vi.fn(),
      mount: vi.fn(async () => undefined),
      afterMount
    })).rejects.toThrow('third-party startup gate blocked application bootstrap')

    expect(afterMount).not.toHaveBeenCalled()
  })

  it('continues when the third-party startup gate explicitly allows app bootstrap', async () => {
    const app = { id: 'app' }
    const pinia = { id: 'pinia' }
    const router = { id: 'router' }
    const startupGateResult = {
      status: 'ready',
      appBootstrapContinuationAllowed: true,
      reason: 'path-free startup gate accepted app bootstrap'
    }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => undefined),
      bootstrapThirdPartyStartupGate: vi.fn(async () => startupGateResult),
      createApp: vi.fn(() => app),
      createPinia: vi.fn(() => pinia),
      configurePinia: vi.fn(),
      installPinia: vi.fn(),
      getRouter: vi.fn(() => router),
      installRouter: vi.fn(),
      mount: vi.fn(async () => undefined)
    })).resolves.toEqual({ app, pinia, router, thirdPartyStartupGateResult: startupGateResult })
  })

  it('does not create app state when a returned startup gate result blocks app bootstrap', async () => {
    const events: string[] = []
    const result = {
      status: 'blocked',
      appBootstrapContinuationAllowed: false,
      reason: 'C:/Users/LENOVO/mods/sample_pack blocked before bootstrap'
    }

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => {
        events.push('official-content')
      }),
      bootstrapThirdPartyStartupGate: vi.fn(async () => {
        events.push('third-party-startup-gate')
        return result
      }),
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
      getRouter: vi.fn(() => {
        events.push('get-router')
        return {}
      }),
      installRouter: vi.fn(() => events.push('install-router')),
      mount: vi.fn(async () => {
        events.push('read-save')
        events.push('mount')
      })
    })).rejects.toThrow('third-party startup gate blocked application bootstrap')

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => undefined),
      bootstrapThirdPartyStartupGate: vi.fn(async () => result),
      createApp: vi.fn(() => ({})),
      createPinia: vi.fn(() => ({})),
      configurePinia: vi.fn(),
      installPinia: vi.fn(),
      getRouter: vi.fn(() => ({})),
      installRouter: vi.fn(),
      mount: vi.fn(async () => undefined)
    })).rejects.not.toThrow('C:/Users')
    expect(events).toEqual(['official-content', 'third-party-startup-gate'])
  })

  it('does not create Pinia, read saves, or mount when the third-party startup gate fails', async () => {
    const events: string[] = []
    const error = new Error('third-party startup gate failed')

    await expect(bootstrapApplication({
      bootstrapOfficialContent: vi.fn(async () => {
        events.push('official-content')
      }),
      bootstrapThirdPartyStartupGate: vi.fn().mockRejectedValue(error),
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

    expect(events).toEqual(['official-content'])
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

  it('exposes startup failure detail only for runtime probe diagnostics', () => {
    document.body.innerHTML = '<div id="app"><span>loading</span></div>'
    window.history.pushState(null, '', '/?taoyuanContentProbe=1')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    reportApplicationStartupFailure(new Error('registry validation failed'))

    expect(document.querySelector('.startup-failure')
      ?.getAttribute('data-runtime-probe-startup-error'))
      .toContain('registry validation failed')
    window.history.pushState(null, '', '/')
    consoleError.mockRestore()
  })
})
