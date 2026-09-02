import {
  createThirdPartyDataPackStartupGateBootstrapSource,
  type CreateThirdPartyDataPackStartupGateBootstrapSourceOptions
} from './thirdPartyDataPackStartupGateBootstrapSource'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline,
  type CreateThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineOptions,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform
} from './thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'

export interface CreateThirdPartyDataPackSharedRendererStartupGateBootstrapSourceOptions
  extends CreateThirdPartyDataPackStartupGateBootstrapSourceOptions,
    Omit<
      CreateThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineOptions,
      'enabled'
    > {
  readonly runtimeHost?: unknown
  readonly resolveRuntimeHost?: () => unknown
}

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor ? descriptor.value : undefined
}

const resolveRuntimeHost = (
  options: CreateThirdPartyDataPackSharedRendererStartupGateBootstrapSourceOptions
): unknown => {
  if ('runtimeHost' in options) return options.runtimeHost
  if (options.resolveRuntimeHost !== undefined) {
    try {
      return options.resolveRuntimeHost()
    } catch {
      return undefined
    }
  }
  return typeof window === 'undefined' ? undefined : window
}

const inferSharedRendererPlatform = (
  options: CreateThirdPartyDataPackSharedRendererStartupGateBootstrapSourceOptions
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform | undefined => {
  if (options.platform !== undefined) return options.platform

  const runtimeHost = resolveRuntimeHost(options)
  return inferSharedRendererHostPlatform(runtimeHost)
}

const inferSharedRendererHostPlatform = (
  runtimeHost: unknown
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform | undefined => {
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  if (electronApi !== undefined) return 'electron'
  if (webEventTargetFromRuntimeHost(runtimeHost) !== undefined) return 'web'
  return undefined
}

const webEventTargetFromRuntimeHost = (
  runtimeHost: unknown
): EventTarget | undefined => {
  if (typeof EventTarget !== 'undefined' && runtimeHost instanceof EventTarget) return runtimeHost
  if (runtimeHost === null || typeof runtimeHost !== 'object') return undefined

  try {
    const candidate = runtimeHost as Partial<EventTarget>
    return typeof candidate.addEventListener === 'function'
      && typeof candidate.removeEventListener === 'function'
      && typeof candidate.dispatchEvent === 'function'
      ? candidate as EventTarget
      : undefined
  } catch {
    return undefined
  }
}

const createSharedRendererAppStartupHostAcknowledgement = (
  options: CreateThirdPartyDataPackSharedRendererStartupGateBootstrapSourceOptions,
  platform: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform | undefined
): ((
  envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope
) => Promise<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult>) | undefined => {
  if (options.enabled !== true || platform === undefined) return undefined

  const runtimeHostPlatform = inferSharedRendererHostPlatform(resolveRuntimeHost(options))
  if (runtimeHostPlatform !== platform) return undefined

  return async envelope => Object.freeze({
    status: 'accepted',
    platform: envelope.platform,
    targetPackageId: envelope.targetPackageId,
    selectedPackageIds: envelope.selectedPackageIds,
    blockedPackageIds: envelope.blockedPackageIds,
    loadOrder: envelope.loadOrder,
    registryCount: envelope.registryCount,
    entryCount: envelope.entryCount,
    packageCount: envelope.packageCount,
    candidateIdentity: envelope.candidateIdentity,
    candidateHash: envelope.candidateHash,
    lockfileHash: envelope.lockfileHash,
    appStartupReadinessAccepted: true,
    diagnostics: Object.freeze([]),
    effects: Object.freeze({
      appStartupHostCalled: true,
      appStartupHostAccepted: true,
      realAppStartupHostCalled: false,
      launcherAppFactoryCalled: false,
      gameAppFactoryCalled: false,
      launcherAppCreated: false,
      gameAppCreated: false,
      piniaCreated: false,
      routerMounted: false,
      saveRead: false,
      uiIpcResponseDelivered: false,
      commandDispatched: false,
      transactionCommitted: false,
      runtimePublicationCommitted: false,
      packageFilesWritten: false,
      lockfileWritten: false,
      settingsWritten: false,
      savesWritten: false,
      cacheWritten: false,
      transactionLogWritten: false,
      rollbackExecuted: false,
      diagnosticsWritten: false
    })
  })
}

export const createThirdPartyDataPackSharedRendererStartupGateBootstrapSource = (
  options: CreateThirdPartyDataPackSharedRendererStartupGateBootstrapSourceOptions = {}
) => {
  const {
    readRuntimePublicationCommitAppStartupHostConnection,
    acknowledgeAppStartupHostWiring,
    runtimeHost: _runtimeHost,
    resolveRuntimeHost: _resolveRuntimeHost,
    ...appStartupHostConnectionOptions
  } = options
  const platform = inferSharedRendererPlatform(options)
  const resolvedAppStartupHostAcknowledgement = acknowledgeAppStartupHostWiring
    ?? createSharedRendererAppStartupHostAcknowledgement(options, platform)

  return createThirdPartyDataPackStartupGateBootstrapSource({
    ...options,
    readRuntimePublicationCommitAppStartupHostConnection:
      readRuntimePublicationCommitAppStartupHostConnection
      ?? createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
        ...appStartupHostConnectionOptions,
        platform,
        acknowledgeAppStartupHostWiring: resolvedAppStartupHostAcknowledgement,
        enabled: options.enabled
      })
  })
}

export const bootstrapSharedRendererThirdPartyDataPackStartupGate =
  createThirdPartyDataPackSharedRendererStartupGateBootstrapSource()
