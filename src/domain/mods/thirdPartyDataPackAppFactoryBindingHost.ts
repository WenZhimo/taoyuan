import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackAppFactoryBindingHostEffectSummary,
  ThirdPartyDataPackAppFactoryBindingHostEnvelope,
  ThirdPartyDataPackAppFactoryBindingHostResult
} from './thirdPartyDataPackAppFactoryBindingSource'
import type { ThirdPartyDataPackLauncherBoundaryPlatform } from './thirdPartyDataPackLauncherBoundaryPreflight'
import type {
  ThirdPartyDataPackNormalStartupGateDecision,
  ThirdPartyDataPackNormalStartupGatePersistentStateProofs
} from './thirdPartyDataPackNormalStartupGatePreflight'

export const THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_HOST_KIND =
  'third-party-app-factory-binding-host'

export interface ThirdPartyDataPackAppFactoryBindingHostRecord {
  readonly sequence: number
  readonly platform: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly startupGateDecision: ThirdPartyDataPackNormalStartupGateDecision
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly persistentStateProofsAccepted: true
  readonly launcherAppFactoryBindingReportPrepared: true
  readonly gameAppFactoryBindingReportPrepared: true
}

export interface CreateThirdPartyDataPackAppFactoryBindingHostOptions {
  readonly expectedPlatform?: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly expectedPackageId?: PackageId
  readonly expectedStartupGateDecision?: ThirdPartyDataPackNormalStartupGateDecision
}

export interface ThirdPartyDataPackAppFactoryBindingHost {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_HOST_KIND
  readonly acknowledgeAppFactoryBinding: (
    envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
  ) => Promise<ThirdPartyDataPackAppFactoryBindingHostResult>
  readonly getBindingRecords: () => readonly ThirdPartyDataPackAppFactoryBindingHostRecord[]
  readonly getLastBindingRecord: () => ThirdPartyDataPackAppFactoryBindingHostRecord | undefined
  readonly clearBindingRecords: () => void
}

const validPlatforms = new Set<ThirdPartyDataPackLauncherBoundaryPlatform>([
  'electron',
  'web',
  'android'
])

const forbiddenEnvelopeFields = [
  'appFactoryBindingPreflight',
  'appFactoryBindingRequest',
  'appFactoryBindingHost',
  'launcherAppFactory',
  'gameAppFactory',
  'launcherApp',
  'gameApp',
  'pinia',
  'piniaStore',
  'router',
  'routerInstance',
  'gameRouter',
  'app',
  'mount',
  'saveStore',
  'saveOpenGate',
  'uiIpcHost',
  'electronHost',
  'programDirectoryPath',
  'webSourceHost',
  'indexedDb',
  'androidHost',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'modLockStorage',
  'settingsStorage',
  'transactionLogStorage',
  'recoveryLogStorage'
] as const

const readOwnDataField = (
  value: object | undefined,
  fieldName: string
): unknown => {
  if (value === undefined) return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object | undefined,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (
  value: object | undefined,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const readOwnBooleanField = (
  value: object | undefined,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readArrayLength = (value: readonly unknown[]): number | undefined => {
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

const cloneStringList = (value: unknown): readonly string[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const length = readArrayLength(value)
  if (length === undefined) return Object.freeze([])

  const result: string[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value)
    }
  }
  return Object.freeze(result)
}

const clonePackageIds = (value: unknown): readonly PackageId[] =>
  cloneStringList(value) as readonly PackageId[]

const hasOwnEnumerableField = (
  value: object,
  fieldName: string
): boolean => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return true
  }
  return descriptor?.enumerable === true
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const isSha256Hash = (value: string | undefined): value is Sha256Hash =>
  /^sha256:[a-f0-9]{64}$/u.test(value ?? '')

const persistentStateProofsAccepted = (
  value: unknown
): boolean => value !== undefined
  && value !== null
  && typeof value === 'object'
  && readOwnBooleanField(value, 'transactionLogCommitted') === true
  && readOwnBooleanField(value, 'packageStateMatched') === true
  && readOwnBooleanField(value, 'settingsStateMatched') === true
  && readOwnBooleanField(value, 'modLockStateMatched') === true
  && readOwnBooleanField(value, 'liveRegistryMatched') === true
  && readOwnBooleanField(value, 'saveCacheIsolated') === true

const clonePersistentStateProofs = (
  value: unknown
): ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined => {
  if (!persistentStateProofsAccepted(value)) return undefined
  return Object.freeze({
    transactionLogCommitted: true,
    packageStateMatched: true,
    settingsStateMatched: true,
    modLockStateMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true
  })
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

const hostDiagnostic = (
  stage: string,
  packageId: PackageId | undefined,
  accepted: boolean
) => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: accepted ? 'info' : 'error',
  stage,
  messageKey: accepted
    ? 'mods.info.lifecycle.transaction.appFactoryBindingHostAccepted'
    : 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: accepted ? 'none' : 'retry'
})

const hostEffects = (
  accepted: boolean
): ThirdPartyDataPackAppFactoryBindingHostEffectSummary => Object.freeze({
  appFactoryBindingHostCalled: true,
  appFactoryBindingHostAccepted: accepted,
  launcherAppFactoryCalled: false,
  gameAppFactoryCalled: false,
  launcherAppCreated: false,
  launcherAppMounted: false,
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

const envelopeAccepted = (
  envelope: object | undefined,
  options: CreateThirdPartyDataPackAppFactoryBindingHostOptions
): envelope is ThirdPartyDataPackAppFactoryBindingHostEnvelope => {
  const platform = readOwnStringField(envelope, 'platform') as
    | ThirdPartyDataPackLauncherBoundaryPlatform
    | undefined
  const startupGateDecision = readOwnStringField(envelope, 'startupGateDecision') as
    | ThirdPartyDataPackNormalStartupGateDecision
    | undefined
  const targetPackageId = readOwnStringField(envelope, 'targetPackageId') as PackageId | undefined
  const selectedPackageIds = clonePackageIds(readOwnDataField(envelope, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(envelope, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(envelope, 'loadOrder'))
  const registryCount = readOwnNumberField(envelope, 'registryCount')
  const entryCount = readOwnNumberField(envelope, 'entryCount')
  const packageCount = readOwnNumberField(envelope, 'packageCount')
  const candidateHash = readOwnStringField(envelope, 'candidateHash')
  const lockfileHash = readOwnStringField(envelope, 'lockfileHash')
  return envelope !== undefined
    && Object.isFrozen(envelope)
    && !forbiddenEnvelopeFields.some(fieldName => hasOwnEnumerableField(envelope, fieldName))
    && platform !== undefined
    && validPlatforms.has(platform)
    && startupGateDecision === 'ready-for-launcher-boundary'
    && targetPackageId !== undefined
    && selectedPackageIds.includes(targetPackageId)
    && arraysEqual(loadOrder, selectedPackageIds)
    && blockedPackageIds.every(packageId => !selectedPackageIds.includes(packageId))
    && registryCount !== undefined
    && entryCount !== undefined
    && packageCount !== undefined
    && registryCount >= 54
    && entryCount >= 4242
    && packageCount === selectedPackageIds.length
    && isSha256Hash(candidateHash)
    && isSha256Hash(lockfileHash)
    && persistentStateProofsAccepted(readOwnDataField(envelope, 'persistentStateProofs'))
    && (options.expectedPlatform === undefined || platform === options.expectedPlatform)
    && (options.expectedPackageId === undefined || targetPackageId === options.expectedPackageId)
    && (
      options.expectedStartupGateDecision === undefined
      || startupGateDecision === options.expectedStartupGateDecision
    )
}

const buildHostResult = (
  envelope: object | undefined,
  accepted: boolean,
  stage: string
): ThirdPartyDataPackAppFactoryBindingHostResult => {
  const diagnostics = Object.freeze([
    hostDiagnostic(stage, readOwnStringField(envelope, 'targetPackageId') as PackageId | undefined, accepted)
  ])
  const persistentStateProofs = clonePersistentStateProofs(
    readOwnDataField(envelope, 'persistentStateProofs')
  )
  return deepFreezeObjectGraph({
    status: accepted ? 'accepted' : 'blocked',
    platform: readOwnStringField(envelope, 'platform') as ThirdPartyDataPackLauncherBoundaryPlatform | undefined,
    startupGateDecision: readOwnStringField(envelope, 'startupGateDecision') as
      | ThirdPartyDataPackNormalStartupGateDecision
      | undefined,
    targetPackageId: readOwnStringField(envelope, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds: clonePackageIds(readOwnDataField(envelope, 'selectedPackageIds')),
    blockedPackageIds: clonePackageIds(readOwnDataField(envelope, 'blockedPackageIds')),
    loadOrder: clonePackageIds(readOwnDataField(envelope, 'loadOrder')),
    registryCount: readOwnNumberField(envelope, 'registryCount'),
    entryCount: readOwnNumberField(envelope, 'entryCount'),
    packageCount: readOwnNumberField(envelope, 'packageCount'),
    candidateHash: readOwnStringField(envelope, 'candidateHash') as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(envelope, 'lockfileHash') as Sha256Hash | undefined,
    ...(persistentStateProofs === undefined ? {} : { persistentStateProofsAccepted: true }),
    diagnostics,
    effects: hostEffects(accepted)
  })
}

const createRecord = (
  sequence: number,
  envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
): ThirdPartyDataPackAppFactoryBindingHostRecord => deepFreezeObjectGraph({
  sequence,
  platform: envelope.platform,
  startupGateDecision: envelope.startupGateDecision,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: clonePackageIds(envelope.selectedPackageIds),
  blockedPackageIds: clonePackageIds(envelope.blockedPackageIds),
  loadOrder: clonePackageIds(envelope.loadOrder),
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  launcherAppFactoryBindingReportPrepared: true,
  gameAppFactoryBindingReportPrepared: true
})

export const createThirdPartyDataPackAppFactoryBindingHost = (
  options: CreateThirdPartyDataPackAppFactoryBindingHostOptions = {}
): ThirdPartyDataPackAppFactoryBindingHost => {
  const records: ThirdPartyDataPackAppFactoryBindingHostRecord[] = []

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_HOST_KIND,
    async acknowledgeAppFactoryBinding(envelope) {
      if (!envelopeAccepted(envelope, options)) {
        return buildHostResult(envelope, false, 'third-party.app-factory-binding-host.blocked')
      }

      const record = createRecord(records.length + 1, envelope)
      records.push(record)
      return buildHostResult(envelope, true, 'third-party.app-factory-binding-host.accepted')
    },
    getBindingRecords() {
      return Object.freeze([...records])
    },
    getLastBindingRecord() {
      return records[records.length - 1]
    },
    clearBindingRecords() {
      records.splice(0, records.length)
    }
  } satisfies ThirdPartyDataPackAppFactoryBindingHost)
}
