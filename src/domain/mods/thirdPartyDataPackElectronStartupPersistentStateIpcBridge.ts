import type { Sha256Hash } from './hash'
import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackElectronStartupPersistentStateSourceHost,
  ThirdPartyDataPackElectronStartupPersistentStateSourceHostReport
} from './thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type { ThirdPartyDataPackRuntimeCommandId } from './thirdPartyDataPackRuntimeCommandState'

type Awaitable<T> = T | Promise<T>

const thirdPartyDataPackElectronStartupPersistentStateSourceHostKind =
  'electron-program-directory-startup-persistent-state-source-host'
const thirdPartyDataPackElectronStartupPersistentStateSourceHostMode =
  'electron-program-directory-readonly-isolated-test'

export const thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel =
  'third-party-data-pack-startup-persistent-state-read'

export interface ThirdPartyDataPackElectronStartupPersistentStateReadBridge {
  readonly invoke: (
    channel: typeof thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel,
    request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  ) => Awaitable<unknown>
}

const sha256HashPattern = /^sha256:[0-9a-f]{64}$/

const isSha256Hash = (value: unknown): value is Sha256Hash =>
  typeof value === 'string' && sha256HashPattern.test(value)

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
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0
    ? field
    : undefined
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

const cloneStringArray = (value: unknown): readonly string[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const length = readArrayLength(value)
  if (length === undefined) return undefined
  const result: string[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      return undefined
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor) || typeof descriptor.value !== 'string') {
      return undefined
    }
    result.push(descriptor.value)
  }
  return Object.freeze(result)
}

const clonePackageIds = (value: unknown): readonly PackageId[] | undefined => {
  const strings = cloneStringArray(value)
  if (strings === undefined || strings.some(packageId => !isPackageId(packageId))) return undefined
  return Object.freeze([...strings]) as readonly PackageId[]
}

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const candidate = value as object
  const formatVersion = readOwnNumberField(candidate, 'formatVersion')
  const contentHash = readOwnStringField(candidate, 'contentHash')
  const snapshotHash = readOwnStringField(candidate, 'snapshotHash')
  const candidateHash = readOwnStringField(candidate, 'candidateHash')
  if (
    formatVersion !== 1
    || !isSha256Hash(contentHash)
    || !isSha256Hash(snapshotHash)
    || !isSha256Hash(candidateHash)
  ) {
    return undefined
  }
  return Object.freeze({
    formatVersion: 1,
    contentHash,
    snapshotHash,
    candidateHash
  })
}

const cloneStartupStateRequest = (
  value: unknown
): ThirdPartyDataPackStartupGatePersistentStateSourceRequest | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const request = value as object
  const formatVersion = readOwnNumberField(request, 'formatVersion')
  const commandId = readOwnStringField(request, 'commandId')
  const packageId = readOwnStringField(request, 'packageId')
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(request, 'candidateIdentity'))
  const lockfileHash = readOwnStringField(request, 'lockfileHash')
  const selectedPackageIds = clonePackageIds(readOwnDataField(request, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(request, 'blockedPackageIds'))
  const blockedCandidateCount = readOwnNumberField(request, 'blockedCandidateCount')
  const loadOrder = clonePackageIds(readOwnDataField(request, 'loadOrder'))
  const registryCount = readOwnNumberField(request, 'registryCount')
  const entryCount = readOwnNumberField(request, 'entryCount')
  const packageCount = readOwnNumberField(request, 'packageCount')
  const requiredSourceIds = cloneStringArray(readOwnDataField(request, 'requiredSourceIds'))
  const deferredStageIds = cloneStringArray(readOwnDataField(request, 'deferredStageIds'))

  if (
    formatVersion !== 1
    || (commandId !== 'install' && commandId !== 'disable' && commandId !== 'uninstall')
    || !isPackageId(packageId)
    || candidateIdentity === undefined
    || !isSha256Hash(lockfileHash)
    || selectedPackageIds === undefined
    || blockedPackageIds === undefined
    || blockedCandidateCount === undefined
    || loadOrder === undefined
    || registryCount === undefined
    || entryCount === undefined
    || packageCount === undefined
    || requiredSourceIds === undefined
    || deferredStageIds === undefined
  ) {
    return undefined
  }

  return Object.freeze({
    formatVersion: 1,
    commandId: commandId as ThirdPartyDataPackRuntimeCommandId,
    packageId,
    candidateIdentity,
    lockfileHash,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount,
    loadOrder,
    registryCount,
    entryCount,
    packageCount,
    requiredSourceIds: requiredSourceIds as ThirdPartyDataPackStartupGatePersistentStateSourceRequest['requiredSourceIds'],
    deferredStageIds: deferredStageIds as ThirdPartyDataPackStartupGatePersistentStateSourceRequest['deferredStageIds']
  })
}

const blockedSnapshot = (
  messageKey = 'mods.startup.persistent.state.electron.blocked'
): ThirdPartyDataPackStartupGatePersistentStateSnapshotSource => Object.freeze({
  kind: 'startup-persistent-state-snapshot',
  settled: false,
  messageKey,
  recovery: 'retry',
  retryable: true,
  rollbackRequired: false,
  diagnostics: Object.freeze([])
})

const safeSnapshotFromRawMainProcessValue = (
  value: unknown
): ThirdPartyDataPackStartupGatePersistentStateSnapshotSource => {
  if (value === null || typeof value !== 'object') return blockedSnapshot()
  const snapshot = value as object
  const kind = readOwnStringField(snapshot, 'kind')
  const settled = readOwnBooleanField(snapshot, 'settled')
  const packageId = readOwnStringField(snapshot, 'packageId')
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(snapshot, 'candidateIdentity'))
  const lockfileHash = readOwnStringField(snapshot, 'lockfileHash')
  const messageKey = readOwnStringField(snapshot, 'messageKey')
  const recovery = readOwnStringField(snapshot, 'recovery')
  const retryable = readOwnBooleanField(snapshot, 'retryable')
  const rollbackRequired = readOwnBooleanField(snapshot, 'rollbackRequired')

  if (kind !== 'startup-persistent-state-snapshot' || settled === undefined) {
    return blockedSnapshot()
  }

  if (settled !== true) {
    return blockedSnapshot(messageKey)
  }

  const transactionLogCommitted = readOwnBooleanField(snapshot, 'transactionLogCommitted')
  const packageStateMatched = readOwnBooleanField(snapshot, 'packageStateMatched')
  const packageStateRemoved = readOwnBooleanField(snapshot, 'packageStateRemoved')
  const settingsStateMatched = readOwnBooleanField(snapshot, 'settingsStateMatched')
  const modLockStateMatched = readOwnBooleanField(snapshot, 'modLockStateMatched')
  const liveRegistryMatched = readOwnBooleanField(snapshot, 'liveRegistryMatched')
  const saveCacheIsolated = readOwnBooleanField(snapshot, 'saveCacheIsolated')

  if (
    !isPackageId(packageId)
    || candidateIdentity === undefined
    || !isSha256Hash(lockfileHash)
    || transactionLogCommitted !== true
    || packageStateMatched !== true
    || settingsStateMatched !== true
    || modLockStateMatched !== true
    || liveRegistryMatched !== true
    || saveCacheIsolated !== true
  ) {
    return blockedSnapshot()
  }

  return Object.freeze({
    kind: 'startup-persistent-state-snapshot',
    settled: true,
    packageId,
    candidateIdentity,
    lockfileHash,
    transactionLogCommitted: true,
    packageStateMatched: true,
    ...(packageStateRemoved === undefined ? {} : { packageStateRemoved }),
    settingsStateMatched: true,
    modLockStateMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true,
    ...(messageKey === undefined ? {} : { messageKey }),
    ...(recovery === undefined ? {} : { recovery: recovery as ThirdPartyDataPackStartupGatePersistentStateSnapshotSource['recovery'] }),
    ...(retryable === undefined ? {} : { retryable }),
    ...(rollbackRequired === undefined ? {} : { rollbackRequired }),
    diagnostics: Object.freeze([])
  })
}

const candidateIdentityMatchesRequest = (
  request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource
): boolean => snapshot.candidateIdentity?.formatVersion === request.candidateIdentity.formatVersion
  && snapshot.candidateIdentity.contentHash === request.candidateIdentity.contentHash
  && snapshot.candidateIdentity.snapshotHash === request.candidateIdentity.snapshotHash
  && snapshot.candidateIdentity.candidateHash === request.candidateIdentity.candidateHash

const snapshotMatchesRequest = (
  request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource
): boolean => snapshot.settled !== true
  || (
    snapshot.packageId === request.packageId
    && candidateIdentityMatchesRequest(request, snapshot)
    && snapshot.lockfileHash === request.lockfileHash
  )

export const createThirdPartyDataPackElectronStartupPersistentStateReadHost = (
  bridge: ThirdPartyDataPackElectronStartupPersistentStateReadBridge
): ThirdPartyDataPackElectronStartupPersistentStateSourceHost => Object.freeze({
  kind: thirdPartyDataPackElectronStartupPersistentStateSourceHostKind,
  mode: thirdPartyDataPackElectronStartupPersistentStateSourceHostMode,
  inspect: async(): Promise<ThirdPartyDataPackElectronStartupPersistentStateSourceHostReport> => {
    throw new Error('electron startup persistent state IPC host inspect is not exposed to the renderer')
  },
  read: async(request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest) => {
    const rawResult = await bridge.invoke(
      thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel,
      request
    )
    const snapshot = safeSnapshotFromRawMainProcessValue(rawResult)
    return snapshotMatchesRequest(request, snapshot)
      ? snapshot
      : blockedSnapshot('mods.startup.persistent.state.electron.identityMismatch')
  }
})

export const createThirdPartyDataPackElectronStartupPersistentStateReadMainHandler = (
  host: ThirdPartyDataPackElectronStartupPersistentStateSourceHost
) => async(
  request: unknown
): Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource> => {
  const safeRequest = cloneStartupStateRequest(request)
  if (safeRequest === undefined) {
    return blockedSnapshot('mods.startup.persistent.state.electron.invalidRequest')
  }

  try {
    return safeSnapshotFromRawMainProcessValue(await host.read(safeRequest))
  } catch {
    return blockedSnapshot()
  }
}
