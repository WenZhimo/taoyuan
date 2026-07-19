import type { App } from 'vue'
import type { Router } from 'vue-router'

type Awaitable<T> = T | Promise<T>

export interface ApplicationBootstrapDependencies<AppInstance, PiniaInstance, RouterInstance> {
  bootstrapOfficialContent: () => Promise<unknown>
  createApp: () => Awaitable<AppInstance>
  createPinia: () => Awaitable<PiniaInstance>
  configurePinia: (pinia: PiniaInstance) => void
  installPinia: (app: AppInstance, pinia: PiniaInstance) => void
  getRouter: () => Awaitable<RouterInstance>
  installRouter: (app: AppInstance, router: RouterInstance) => void
  mount: (app: AppInstance, router: RouterInstance) => Promise<void>
}

export interface ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance> {
  app: AppInstance
  pinia: PiniaInstance
  router: RouterInstance
}

export const bootstrapApplication = async <AppInstance, PiniaInstance, RouterInstance>(
  dependencies: ApplicationBootstrapDependencies<AppInstance, PiniaInstance, RouterInstance>
): Promise<ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance>> => {
  await dependencies.bootstrapOfficialContent()

  const app = await dependencies.createApp()
  const pinia = await dependencies.createPinia()
  dependencies.configurePinia(pinia)
  dependencies.installPinia(app, pinia)

  const router = await dependencies.getRouter()
  dependencies.installRouter(app, router)
  await dependencies.mount(app, router)

  return { app, pinia, router }
}

export const mountAfterRouterReady = async (
  app: Pick<App, 'mount'>,
  router: Pick<Router, 'isReady'>,
  target: string | Element = '#app'
): Promise<void> => {
  await router.isReady()
  app.mount(target)
}

const formatStartupError = (error: unknown): string => {
  if (!(error instanceof Error)) return String(error)
  return error.stack ?? `${error.name}: ${error.message}`
}

interface ElectronStartupReporter {
  reportStartupFailure?: (message: string) => void
}

export const reportApplicationStartupFailure = (
  error: unknown,
  target: string | Element = '#app'
): void => {
  const detail = formatStartupError(error)
  console.error(`[taoyuan-core] Official content startup failed\n${detail}`)

  if (typeof window !== 'undefined') {
    const electronApi = (window as Window & { electronAPI?: ElectronStartupReporter }).electronAPI
    electronApi?.reportStartupFailure?.(detail)
  }

  if (typeof document === 'undefined') return
  const root = typeof target === 'string' ? document.querySelector(target) : target
  if (!root) return

  const container = document.createElement('main')
  const title = document.createElement('h1')
  const message = document.createElement('p')
  container.className = 'startup-failure'
  title.textContent = '游戏启动失败'
  message.textContent = '官方内容校验未通过，请查看启动日志后重试。'
  container.append(title, message)
  root.replaceChildren(container)
}
