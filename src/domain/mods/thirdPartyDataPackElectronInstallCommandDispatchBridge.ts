import type { Sha256Hash } from './hash'
import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary,
  ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope,
  ThirdPartyDataPackTransactionCommandDispatcherHostResult
} from './thirdPartyDataPackTransactionCommandDispatcherSource'

type Awaitable<T> = T | Promise<T>

export const thirdPartyDataPackElectronInstallCommandDispatchIpcChannel =
  'third-party-data-pack-install-command-dispatch'

export interface ThirdPartyDataPackElectronInstallCommandDispatchBridge {
  readonly invoke: (
    channel: typeof thirdPartyDataPackElectronInstallCommandDispatchIpcChannel,
    envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
  ) => Awaitable<unknown>
}

export interface ThirdPartyDataPackElectronInstallCommandDispatchIpcProof
  extends ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope {
  readonly status: 'dispatched'
}

export interface CreateThirdPartyDataPackElectronInstallCommandDispatchMainHandlerOptions {
  readonly onDispatched?: (
    proof: ThirdPartyDataPackElectronInstallCommandDispatchIpcProof
  ) => void
}

const sha256HashPattern = /^sha256:[0-9a-f]{64}$/

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

const clonePackageIds = (value: unknown): readonly PackageId[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const length = readArrayLength(value)
  if (length === undefined) return undefined

  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      return undefined
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor) || !isPackageId(descriptor.value)) {
      return undefined
    }
    result.push(descriptor.value)
  }
  return Object.freeze(result)
}

const isSha256Hash = (value: unknown): value is Sha256Hash =>
  typeof value === 'string' && sha256HashPattern.test(value)

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

const dispatchEffects = (
  commandDispatched: boolean
): ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary => Object.freeze({
  commandDispatcherCalled: true,
  commandDispatched,
  transactionCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const dispatchEffectsContained = (
  effects: object,
  commandDispatched: boolean
): boolean => {
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(effects)
  } catch {
    return false
  }
  return keys.every(key => {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(effects, key)
    } catch {
      return false
    }
    if (descriptor?.enumerable !== true) return true
    if (!('value' in descriptor)) return false
    if (key === 'commandDispatcherCalled') return descriptor.value === true
    if (key === 'commandDispatched') return descriptor.value === commandDispatched
    return descriptor.value === false
  })
}

const invalidCommandDiagnostic = (packageId?: PackageId) => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error' as const,
  stage: 'third-party.electron-install-command-dispatch.invalid-envelope',
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry' as const
})

const blockedResult = (
  packageId?: PackageId
): ThirdPartyDataPackTransactionCommandDispatcherHostResult => Object.freeze({
  status: 'blocked',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: Object.freeze([invalidCommandDiagnostic(packageId)]),
  effects: dispatchEffects(false)
})

const dispatchedResult = (
  packageId: PackageId
): ThirdPartyDataPackTransactionCommandDispatcherHostResult => Object.freeze({
  status: 'dispatched',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: Object.freeze([]),
  effects: dispatchEffects(true)
})

const isValidDispatchEnvelope = (
  value: unknown
): value is ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope => {
  if (value === null || typeof value !== 'object') return false
  const envelope = value as object
  const requestedCommandId = readOwnStringField(envelope, 'requestedCommandId')
  const targetPackageId = readOwnStringField(envelope, 'targetPackageId')
  const selectedPackageIds = clonePackageIds(readOwnDataField(envelope, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(envelope, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(envelope, 'loadOrder'))
  const registryCount = readOwnNumberField(envelope, 'registryCount')
  const entryCount = readOwnNumberField(envelope, 'entryCount')
  const packageCount = readOwnNumberField(envelope, 'packageCount')
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(envelope, 'candidateIdentity'))
  const lockfileHash = readOwnStringField(envelope, 'lockfileHash')

  return requestedCommandId === 'install'
    && isPackageId(targetPackageId)
    && selectedPackageIds !== undefined
    && blockedPackageIds !== undefined
    && loadOrder !== undefined
    && registryCount !== undefined
    && entryCount !== undefined
    && packageCount !== undefined
    && candidateIdentity !== undefined
    && isSha256Hash(lockfileHash)
}

const cloneValidDispatchProof = (
  envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
): ThirdPartyDataPackElectronInstallCommandDispatchIpcProof => Object.freeze({
  status: 'dispatched',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(envelope, 'selectedPackageIds')) ?? Object.freeze([]),
  blockedPackageIds: clonePackageIds(readOwnDataField(envelope, 'blockedPackageIds')) ?? Object.freeze([]),
  loadOrder: clonePackageIds(readOwnDataField(envelope, 'loadOrder')) ?? Object.freeze([]),
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateIdentity: Object.freeze({
    formatVersion: 1,
    contentHash: envelope.candidateIdentity.contentHash,
    snapshotHash: envelope.candidateIdentity.snapshotHash,
    candidateHash: envelope.candidateIdentity.candidateHash
  }),
  lockfileHash: envelope.lockfileHash
})

const resultFromRawMainProcessValue = (
  value: unknown,
  expectedPackageId: PackageId
): ThirdPartyDataPackTransactionCommandDispatcherHostResult => {
  if (value === null || typeof value !== 'object') return blockedResult(expectedPackageId)
  const result = value as object
  const status = readOwnStringField(result, 'status')
  const requestedCommandId = readOwnStringField(result, 'requestedCommandId')
  const targetPackageId = readOwnStringField(result, 'targetPackageId')
  const effects = readOwnDataField(result, 'effects')
  if (
    status !== 'dispatched'
    || requestedCommandId !== 'install'
    || targetPackageId !== expectedPackageId
    || effects === null
    || typeof effects !== 'object'
    || !dispatchEffectsContained(effects, true)
  ) {
    return blockedResult(expectedPackageId)
  }
  return dispatchedResult(expectedPackageId)
}

export const acknowledgeThirdPartyDataPackElectronInstallCommandDispatchIpcEnvelope = (
  envelope: unknown
): ThirdPartyDataPackTransactionCommandDispatcherHostResult => {
  if (!isValidDispatchEnvelope(envelope)) {
    const packageId = envelope !== null && typeof envelope === 'object'
      ? readOwnStringField(envelope, 'targetPackageId')
      : undefined
    return blockedResult(isPackageId(packageId) ? packageId : undefined)
  }
  return dispatchedResult(envelope.targetPackageId)
}

export const createThirdPartyDataPackElectronInstallCommandDispatchHost = (
  bridge: ThirdPartyDataPackElectronInstallCommandDispatchBridge
) => Object.freeze({
  dispatch: async(
    envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
  ): Promise<ThirdPartyDataPackTransactionCommandDispatcherHostResult> => {
    const rawResult = await bridge.invoke(
      thirdPartyDataPackElectronInstallCommandDispatchIpcChannel,
      envelope
    )
    return resultFromRawMainProcessValue(rawResult, envelope.targetPackageId)
  }
})

export const createThirdPartyDataPackElectronInstallCommandDispatchMainHandler = (
  options: CreateThirdPartyDataPackElectronInstallCommandDispatchMainHandlerOptions = {}
) => (envelope: unknown): ThirdPartyDataPackTransactionCommandDispatcherHostResult => {
  const result = acknowledgeThirdPartyDataPackElectronInstallCommandDispatchIpcEnvelope(envelope)
  if (result.status === 'dispatched' && isValidDispatchEnvelope(envelope)) {
    options.onDispatched?.(cloneValidDispatchProof(envelope))
  }
  return result
}
