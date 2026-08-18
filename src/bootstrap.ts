import type { App } from 'vue'
import type { Router } from 'vue-router'

type Awaitable<T> = T | Promise<T>

export interface ApplicationBootstrapDependencies<AppInstance, PiniaInstance, RouterInstance> {
  bootstrapOfficialContent: () => Promise<unknown>
  bootstrapThirdPartyStartupGate?: () => Promise<unknown>
  createApp: () => Awaitable<AppInstance>
  createPinia: () => Awaitable<PiniaInstance>
  configurePinia: (pinia: PiniaInstance) => void
  installPinia: (app: AppInstance, pinia: PiniaInstance) => void
  getRouter: () => Awaitable<RouterInstance>
  installRouter: (app: AppInstance, router: RouterInstance) => void
  mount: (app: AppInstance, router: RouterInstance) => Promise<void>
  afterMount?: (
    result: ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance>
  ) => Awaitable<unknown>
}

export interface ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance> {
  app: AppInstance
  pinia: PiniaInstance
  router: RouterInstance
}

const THIRD_PARTY_STARTUP_GATE_BLOCKED_MESSAGE =
  'third-party startup gate blocked application bootstrap'

const readOwnStartupGateResultField = (
  value: object,
  fieldName: string
): { readonly unsafe: boolean; readonly value?: unknown } => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return { unsafe: true }
  }

  if (descriptor === undefined || descriptor.enumerable !== true) return { unsafe: false }
  if (!('value' in descriptor)) return { unsafe: true }
  return { unsafe: false, value: descriptor.value }
}

const thirdPartyStartupGateBlocksApplicationBootstrap = (
  result: unknown
): boolean => {
  if (result === null || typeof result !== 'object') return false

  const continuationAllowed = readOwnStartupGateResultField(
    result,
    'appBootstrapContinuationAllowed'
  )
  if (continuationAllowed.unsafe || continuationAllowed.value === false) return true

  const status = readOwnStartupGateResultField(result, 'status')
  if (status.unsafe || status.value === 'blocked') return true

  return false
}

const assertThirdPartyStartupGateAllowsApplicationBootstrap = (
  result: unknown
): void => {
  if (!thirdPartyStartupGateBlocksApplicationBootstrap(result)) return
  throw new Error(THIRD_PARTY_STARTUP_GATE_BLOCKED_MESSAGE)
}

export const bootstrapApplication = async <AppInstance, PiniaInstance, RouterInstance>(
  dependencies: ApplicationBootstrapDependencies<AppInstance, PiniaInstance, RouterInstance>
): Promise<ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance>> => {
  await dependencies.bootstrapOfficialContent()
  const thirdPartyStartupGateResult = await dependencies.bootstrapThirdPartyStartupGate?.()
  assertThirdPartyStartupGateAllowsApplicationBootstrap(thirdPartyStartupGateResult)

  const app = await dependencies.createApp()
  const pinia = await dependencies.createPinia()
  dependencies.configurePinia(pinia)
  dependencies.installPinia(app, pinia)

  const router = await dependencies.getRouter()
  dependencies.installRouter(app, router)
  await dependencies.mount(app, router)

  const result = { app, pinia, router }
  await dependencies.afterMount?.(result)

  return result
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
