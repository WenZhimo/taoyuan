import { isPackageId, type PackageId } from './ids'

export const THIRD_PARTY_DATA_PACK_MOUNTED_APP_STARTUP_HOST_CONNECTION_KIND =
  'third-party-mounted-app-startup-host-connection'

export type ThirdPartyDataPackMountedAppStartupHostConnectionStatus =
  | 'accepted'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackMountedAppStartupHostConnectionEvidence {
  readonly officialContentBootstrapped: true
  readonly runtimeContentRegistryPublished: boolean
  readonly thirdPartyStartupGateCompleted: boolean
  readonly thirdPartyStartupGateAllowed: boolean
  readonly gameAppCreated: true
  readonly piniaCreated: true
  readonly routerInstalled: true
  readonly routerMounted: true
}

export interface ThirdPartyDataPackMountedAppStartupHostConnectionOptions {
  readonly thirdPartyStartupGateResult?: unknown
  readonly evidence: ThirdPartyDataPackMountedAppStartupHostConnectionEvidence
}

export interface ThirdPartyDataPackMountedAppStartupHostConnectionEffectSummary {
  readonly realAppStartupHostCalled: boolean
  readonly appStartupHostConnectionAccepted: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly officialContentBootstrapped: boolean
  readonly runtimeContentRegistryPublished: boolean
  readonly thirdPartyStartupGateCompleted: boolean
  readonly thirdPartyStartupGateAllowed: boolean
  readonly gameAppCreated: boolean
  readonly piniaCreated: boolean
  readonly routerInstalled: boolean
  readonly routerMounted: boolean
  readonly saveRead: false
  readonly uiIpcResponseDelivered: false
  readonly commandDispatched: false
  readonly thirdPartyRegistryPublished: boolean
  readonly liveRegistrySwapped: boolean
  readonly runtimeEnablementAllowed: boolean
  readonly realRuntimePublicationCommitCalled: boolean
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: boolean
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackMountedAppStartupHostConnectionResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_MOUNTED_APP_STARTUP_HOST_CONNECTION_KIND
  readonly status: ThirdPartyDataPackMountedAppStartupHostConnectionStatus
  readonly reason: string
  readonly readOnly: true
  readonly runtimeOnly: true
  readonly persistentWrite: false
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly targetPackageId?: PackageId
  readonly appStartupHostConnectionSourceStatus?: string
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly lockfileHashPresent: boolean
  readonly effects: ThirdPartyDataPackMountedAppStartupHostConnectionEffectSummary
}

let currentMountedAppStartupHostEvidence:
  ThirdPartyDataPackMountedAppStartupHostConnectionEvidence | null = null

const cloneMountedAppStartupHostEvidence = (
  evidence: ThirdPartyDataPackMountedAppStartupHostConnectionEvidence
): ThirdPartyDataPackMountedAppStartupHostConnectionEvidence => Object.freeze({
  officialContentBootstrapped: evidence.officialContentBootstrapped,
  runtimeContentRegistryPublished: evidence.runtimeContentRegistryPublished,
  thirdPartyStartupGateCompleted: evidence.thirdPartyStartupGateCompleted,
  thirdPartyStartupGateAllowed: evidence.thirdPartyStartupGateAllowed,
  gameAppCreated: evidence.gameAppCreated,
  piniaCreated: evidence.piniaCreated,
  routerInstalled: evidence.routerInstalled,
  routerMounted: evidence.routerMounted
})

export const publishThirdPartyDataPackMountedAppStartupHostEvidence = (
  evidence: ThirdPartyDataPackMountedAppStartupHostConnectionEvidence
): ThirdPartyDataPackMountedAppStartupHostConnectionEvidence => {
  currentMountedAppStartupHostEvidence = cloneMountedAppStartupHostEvidence(evidence)
  return currentMountedAppStartupHostEvidence
}

export const getThirdPartyDataPackMountedAppStartupHostEvidence =
  (): ThirdPartyDataPackMountedAppStartupHostConnectionEvidence | null =>
    currentMountedAppStartupHostEvidence

export const resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests = (): void => {
  currentMountedAppStartupHostEvidence = null
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
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnBooleanField = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnStringField = (
  value: unknown,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0
    ? field
    : undefined
}

const readOwnArrayLength = (
  value: unknown
): number | undefined => {
  if (!Array.isArray(value)) return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const clonePackageIds = (
  value: unknown
): readonly PackageId[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const length = readOwnArrayLength(value)
  if (length === undefined) return Object.freeze([])

  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && typeof descriptor.value === 'string'
      && isPackageId(descriptor.value)
    ) {
      result.push(descriptor.value)
    }
  }
  return Object.freeze(result)
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value as object)
    } catch {
      return value
    }
    for (const key of keys) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value as object, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        deepFreezeObjectGraph(descriptor.value)
      }
    }
  }
  return value
}

const validMountedEvidence = (
  evidence: ThirdPartyDataPackMountedAppStartupHostConnectionEvidence
): boolean => evidence.officialContentBootstrapped === true
  && evidence.runtimeContentRegistryPublished === true
  && evidence.thirdPartyStartupGateCompleted === true
  && evidence.thirdPartyStartupGateAllowed === true
  && evidence.gameAppCreated === true
  && evidence.piniaCreated === true
  && evidence.routerInstalled === true
  && evidence.routerMounted === true

const effectSummary = (
  options: {
    readonly accepted: boolean
    readonly evidence: ThirdPartyDataPackMountedAppStartupHostConnectionEvidence
    readonly startupGateEffects?: unknown
  }
): ThirdPartyDataPackMountedAppStartupHostConnectionEffectSummary => {
  const accepted = options.accepted
  return Object.freeze({
    realAppStartupHostCalled: accepted,
    appStartupHostConnectionAccepted: accepted,
    appBootstrapContinuationAllowed: accepted,
    officialContentBootstrapped: options.evidence.officialContentBootstrapped === true,
    runtimeContentRegistryPublished: options.evidence.runtimeContentRegistryPublished === true,
    thirdPartyStartupGateCompleted: options.evidence.thirdPartyStartupGateCompleted === true,
    thirdPartyStartupGateAllowed: options.evidence.thirdPartyStartupGateAllowed === true,
    gameAppCreated: accepted && options.evidence.gameAppCreated === true,
    piniaCreated: accepted && options.evidence.piniaCreated === true,
    routerInstalled: accepted && options.evidence.routerInstalled === true,
    routerMounted: accepted && options.evidence.routerMounted === true,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    thirdPartyRegistryPublished:
      accepted && readOwnBooleanField(options.startupGateEffects, 'thirdPartyRegistryPublished') === true,
    liveRegistrySwapped:
      accepted && readOwnBooleanField(options.startupGateEffects, 'liveRegistrySwapped') === true,
    runtimeEnablementAllowed:
      accepted && readOwnBooleanField(options.startupGateEffects, 'runtimeEnablementAllowed') === true,
    realRuntimePublicationCommitCalled:
      accepted && readOwnBooleanField(options.startupGateEffects, 'realRuntimePublicationCommitCalled') === true,
    transactionCommitted: false,
    runtimePublicationCommitted:
      accepted && readOwnBooleanField(options.startupGateEffects, 'runtimePublicationCommitted') === true,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
}

export const acknowledgeThirdPartyDataPackMountedAppStartupHostConnection = (
  options: ThirdPartyDataPackMountedAppStartupHostConnectionOptions
): ThirdPartyDataPackMountedAppStartupHostConnectionResult => {
  const startupGateResult = options.thirdPartyStartupGateResult
  const startupGateEffects = readOwnDataField(startupGateResult, 'effects')
  const startupGateStatus = readOwnStringField(startupGateResult, 'status')
  const startupGateReady = startupGateStatus === 'ready'
  const startupGateAllowed =
    readOwnBooleanField(startupGateResult, 'appBootstrapContinuationAllowed') === true
  const targetPackageId = readOwnStringField(startupGateResult, 'targetPackageId')
  const selectedPackageIds = clonePackageIds(readOwnDataField(startupGateResult, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(startupGateResult, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(startupGateResult, 'loadOrder'))
  const enabled = readOwnBooleanField(startupGateResult, 'enabled') === true
  const accepted = startupGateReady
    && startupGateAllowed
    && targetPackageId !== undefined
    && isPackageId(targetPackageId)
    && selectedPackageIds.includes(targetPackageId)
    && readOwnStringField(startupGateResult, 'appStartupHostConnectionSourceStatus') === 'accepted'
    && validMountedEvidence(options.evidence)

  const status: ThirdPartyDataPackMountedAppStartupHostConnectionStatus = accepted
    ? 'accepted'
    : startupGateStatus === 'ready'
      ? 'blocked'
      : 'skipped'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_MOUNTED_APP_STARTUP_HOST_CONNECTION_KIND,
    status,
    reason: accepted
      ? 'mounted application startup host accepted path-free post-mount bootstrap evidence'
      : status === 'skipped'
        ? 'mounted application startup host evidence is skipped because no ready third-party startup gate is active'
        : 'mounted application startup host evidence did not match a ready third-party startup gate',
    readOnly: true,
    runtimeOnly: true,
    persistentWrite: false,
    enabled,
    sourceCalled: startupGateResult !== undefined,
    ...(targetPackageId !== undefined && isPackageId(targetPackageId) ? { targetPackageId } : {}),
    appStartupHostConnectionSourceStatus:
      readOwnStringField(startupGateResult, 'appStartupHostConnectionSourceStatus'),
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: readOwnNumberField(startupGateResult, 'registryCount'),
    entryCount: readOwnNumberField(startupGateResult, 'entryCount'),
    packageCount: readOwnNumberField(startupGateResult, 'packageCount'),
    lockfileHashPresent: readOwnStringField(startupGateResult, 'lockfileHash') !== undefined,
    effects: effectSummary({
      accepted,
      evidence: options.evidence,
      startupGateEffects
    })
  })
}
