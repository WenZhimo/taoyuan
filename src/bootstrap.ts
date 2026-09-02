import type { App } from 'vue'
import type { Router } from 'vue-router'

type Awaitable<T> = T | Promise<T>

export interface ApplicationBootstrapDependencies<
  AppInstance,
  PiniaInstance,
  RouterInstance,
  RegistrySetInstance = unknown
> {
  bootstrapOfficialContent: () => Promise<RegistrySetInstance>
  publishRuntimeContentRegistry?: (registrySet: RegistrySetInstance) => Awaitable<unknown>
  bootstrapThirdPartyStartupGate?: () => Promise<unknown>
  acknowledgeThirdPartyAppStartupHost?: (
    options: ApplicationBootstrapThirdPartyAppStartupHostOptions
  ) => Awaitable<unknown>
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
  thirdPartyStartupGateResult?: unknown
  thirdPartyAppStartupHostResult?: unknown
}

const THIRD_PARTY_STARTUP_GATE_BLOCKED_MESSAGE =
  'third-party startup gate blocked application bootstrap'

export interface ApplicationBootstrapThirdPartyAppStartupHostEvidence {
  readonly officialContentBootstrapped: true
  readonly runtimeContentRegistryPublished: boolean
  readonly thirdPartyStartupGateCompleted: boolean
  readonly thirdPartyStartupGateAllowed: boolean
  readonly gameAppCreated: true
  readonly piniaCreated: true
  readonly routerInstalled: true
  readonly routerMounted: true
}

export interface ApplicationBootstrapThirdPartyAppStartupHostOptions {
  readonly thirdPartyStartupGateResult?: unknown
  readonly evidence: ApplicationBootstrapThirdPartyAppStartupHostEvidence
}

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

export const bootstrapApplication = async <
  AppInstance,
  PiniaInstance,
  RouterInstance,
  RegistrySetInstance = unknown
>(
  dependencies: ApplicationBootstrapDependencies<
    AppInstance,
    PiniaInstance,
    RouterInstance,
    RegistrySetInstance
  >
): Promise<ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance>> => {
  const officialRegistrySet = await dependencies.bootstrapOfficialContent()
  let runtimeContentRegistryPublished = false
  if (dependencies.publishRuntimeContentRegistry !== undefined) {
    await dependencies.publishRuntimeContentRegistry(officialRegistrySet)
    runtimeContentRegistryPublished = true
  }
  const thirdPartyStartupGateResult = await dependencies.bootstrapThirdPartyStartupGate?.()
  assertThirdPartyStartupGateAllowsApplicationBootstrap(thirdPartyStartupGateResult)

  const app = await dependencies.createApp()
  const pinia = await dependencies.createPinia()
  dependencies.configurePinia(pinia)
  dependencies.installPinia(app, pinia)

  const router = await dependencies.getRouter()
  dependencies.installRouter(app, router)
  await dependencies.mount(app, router)

  const baseResult: ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance> =
    thirdPartyStartupGateResult === undefined
      ? { app, pinia, router }
      : { app, pinia, router, thirdPartyStartupGateResult }
  const thirdPartyAppStartupHostResult = await dependencies.acknowledgeThirdPartyAppStartupHost?.({
    thirdPartyStartupGateResult,
    evidence: Object.freeze({
      officialContentBootstrapped: true,
      runtimeContentRegistryPublished,
      thirdPartyStartupGateCompleted: thirdPartyStartupGateResult !== undefined,
      thirdPartyStartupGateAllowed: true,
      gameAppCreated: true,
      piniaCreated: true,
      routerInstalled: true,
      routerMounted: true
    })
  })
  const result: ApplicationBootstrapResult<AppInstance, PiniaInstance, RouterInstance> =
    thirdPartyAppStartupHostResult === undefined
      ? baseResult
      : { ...baseResult, thirdPartyAppStartupHostResult }
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

const formatRuntimeProbeStartupError = (error: unknown, detail: string): string => {
  if (error === null || typeof error !== 'object') return detail
  let result: unknown
  try {
    const descriptor = Reflect.getOwnPropertyDescriptor(error, 'result')
    result = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
  } catch {
    return detail
  }
  if (result === undefined) return detail
  try {
    return `${detail}\nresult=${JSON.stringify(result)}`
  } catch {
    return detail
  }
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
  if (
    typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('taoyuanContentProbe') === '1'
  ) {
    container.setAttribute(
      'data-runtime-probe-startup-error',
      formatRuntimeProbeStartupError(error, detail).slice(0, 4000)
    )
  }
  title.textContent = '游戏启动失败'
  message.textContent = '官方内容校验未通过，请查看启动日志后重试。'
  container.append(title, message)
  root.replaceChildren(container)
}
