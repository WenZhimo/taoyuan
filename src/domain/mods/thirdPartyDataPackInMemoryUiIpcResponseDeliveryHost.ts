import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement,
  ThirdPartyDataPackAndroidResponseDeliverySinkHost
} from './thirdPartyDataPackAndroidResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackElectronResponseDeliveryAcknowledgement,
  ThirdPartyDataPackElectronResponseDeliverySinkHost
} from './thirdPartyDataPackElectronResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformId,
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackWebResponseDeliveryAcknowledgement,
  ThirdPartyDataPackWebResponseDeliverySinkHost
} from './thirdPartyDataPackWebResponseDeliverySinkAdapter'

export const THIRD_PARTY_DATA_PACK_IN_MEMORY_UI_IPC_RESPONSE_DELIVERY_HOST_KIND =
  'third-party-in-memory-ui-ipc-response-delivery-host'

export type ThirdPartyDataPackInMemoryUiIpcResponseDeliveryAcknowledgement =
  | ThirdPartyDataPackElectronResponseDeliveryAcknowledgement
  | ThirdPartyDataPackWebResponseDeliveryAcknowledgement
  | ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement

export interface ThirdPartyDataPackInMemoryUiIpcResponseDeliveryRecord {
  readonly sequence: number
  readonly platform: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
  readonly channel: ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport
  readonly packageId: PackageId
  readonly envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey: string
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly diagnosticCount: number
}

export interface ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostOptions {
  readonly platform: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
  readonly expectedPackageId?: PackageId
  readonly expectedEnvelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly expectedMessageKey?: string
}

export type ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostExpectationOptions =
  Omit<ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostOptions, 'platform'>

export interface ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostControls {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_IN_MEMORY_UI_IPC_RESPONSE_DELIVERY_HOST_KIND
  readonly getDeliveryRecords: () => readonly ThirdPartyDataPackInMemoryUiIpcResponseDeliveryRecord[]
  readonly getLastDeliveryRecord: () => ThirdPartyDataPackInMemoryUiIpcResponseDeliveryRecord | undefined
  readonly clearDeliveryRecords: () => void
}

export type ThirdPartyDataPackInMemoryElectronResponseDeliveryHost =
  ThirdPartyDataPackElectronResponseDeliverySinkHost
  & ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostControls
  & { readonly platform: 'electron' }

export type ThirdPartyDataPackInMemoryWebResponseDeliveryHost =
  ThirdPartyDataPackWebResponseDeliverySinkHost
  & ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostControls
  & { readonly platform: 'web' }

export type ThirdPartyDataPackInMemoryAndroidResponseDeliveryHost =
  ThirdPartyDataPackAndroidResponseDeliverySinkHost
  & ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostControls
  & { readonly platform: 'android' }

export type ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHost =
  | ThirdPartyDataPackInMemoryElectronResponseDeliveryHost
  | ThirdPartyDataPackInMemoryWebResponseDeliveryHost
  | ThirdPartyDataPackInMemoryAndroidResponseDeliveryHost

const platformChannels = Object.freeze({
  electron: 'electron-preload-response-channel',
  web: 'web-ui-response-event-sink',
  android: 'android-native-response-event-sink'
} satisfies Record<
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformId,
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport
>)

const outcomeKinds = new Set<ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind>([
  'success',
  'failure',
  'retry',
  'rollback'
])

const forbiddenEnvelopeFields = [
  'electronHost',
  'electronIpcHost',
  'ipcRenderer',
  'webHost',
  'webUiBridge',
  'eventTarget',
  'window',
  'document',
  'androidHost',
  'androidNativeBridge',
  'capacitorBridge',
  'programDirectoryPath',
  'packageWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenDiagnosticFields = [
  'file',
  'fieldPath',
  'details',
  'hostPath',
  'absolutePath',
  'programDirectoryPath'
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

const containsUnsafeString = (value: string): boolean =>
  value.includes('C:/Users')
  || value.includes('LENOVO')
  || value.includes('\\Users\\')
  || value.includes('/Users/')

const diagnosticsArePathFree = (diagnostics: unknown): boolean => {
  if (!Array.isArray(diagnostics)) return diagnostics === undefined
  const length = readArrayLength(diagnostics)
  if (length === undefined) return false

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      return false
    }
    const diagnostic = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (diagnostic === undefined || diagnostic === null || typeof diagnostic !== 'object') continue
    if (forbiddenDiagnosticFields.some(fieldName => hasOwnEnumerableField(diagnostic, fieldName))) {
      return false
    }
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(diagnostic)
    } catch {
      return false
    }
    for (const key of keys) {
      let diagnosticField: PropertyDescriptor | undefined
      try {
        diagnosticField = Reflect.getOwnPropertyDescriptor(diagnostic, key)
      } catch {
        return false
      }
      if (
        diagnosticField?.enumerable === true
        && 'value' in diagnosticField
        && typeof diagnosticField.value === 'string'
        && containsUnsafeString(diagnosticField.value)
      ) {
        return false
      }
    }
  }
  return true
}

const safeDiagnosticCount = (diagnostics: unknown): number => {
  if (!Array.isArray(diagnostics)) return 0
  const length = readArrayLength(diagnostics)
  if (length === undefined) return 0

  let count = 0
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      count += 1
    }
  }
  return count
}

const cloneSummary = (
  summary: unknown,
  diagnosticCount: number
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  const value = summary !== null && typeof summary === 'object' ? summary : undefined
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? 0,
    blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? 0,
    blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? 0,
    loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? 0,
    registryCount: readOwnNumberField(value, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(value, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(value, 'packageCount') ?? 0,
    diagnosticCount
  })
}

const createRejectedAcknowledgement = (
  channel: ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport,
  envelope: object | undefined
): ThirdPartyDataPackInMemoryUiIpcResponseDeliveryAcknowledgement => Object.freeze({
  status: 'rejected',
  channel,
  packageId: (readOwnStringField(envelope, 'packageId') ?? 'unknown_package') as PackageId,
  envelopeKind: (
    outcomeKinds.has(readOwnStringField(envelope, 'kind') as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)
      ? readOwnStringField(envelope, 'kind')
      : 'failure'
  ) as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  messageKey: 'mods.ui.ipc.response.delivery.rejected'
} as ThirdPartyDataPackInMemoryUiIpcResponseDeliveryAcknowledgement)

const createAcknowledgement = (
  channel: ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackInMemoryUiIpcResponseDeliveryAcknowledgement => Object.freeze({
  status: 'acknowledged',
  channel,
  packageId: envelope.packageId,
  envelopeKind: envelope.kind,
  messageKey: envelope.messageKey
} as ThirdPartyDataPackInMemoryUiIpcResponseDeliveryAcknowledgement)

const envelopeAccepted = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope,
  options: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostOptions
): boolean => envelope !== null
  && typeof envelope === 'object'
  && Object.isFrozen(envelope)
  && !forbiddenEnvelopeFields.some(fieldName => hasOwnEnumerableField(envelope, fieldName))
  && readOwnNumberField(envelope, 'formatVersion') === 1
  && readOwnStringField(envelope, 'commandId') === 'install'
  && readOwnStringField(envelope, 'packageId') !== undefined
  && outcomeKinds.has(readOwnStringField(envelope, 'kind') as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)
  && readOwnStringField(envelope, 'messageKey') !== undefined
  && diagnosticsArePathFree(readOwnDataField(envelope, 'diagnostics'))
  && (options.expectedPackageId === undefined || envelope.packageId === options.expectedPackageId)
  && (options.expectedEnvelopeKind === undefined || envelope.kind === options.expectedEnvelopeKind)
  && (options.expectedMessageKey === undefined || envelope.messageKey === options.expectedMessageKey)

const createRecord = (
  sequence: number,
  platform: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId,
  channel: ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackInMemoryUiIpcResponseDeliveryRecord => {
  const diagnosticCount = safeDiagnosticCount(readOwnDataField(envelope, 'diagnostics'))
  return Object.freeze({
    sequence,
    platform,
    channel,
    packageId: envelope.packageId,
    envelopeKind: envelope.kind,
    messageKey: envelope.messageKey,
    candidateHash: envelope.candidateHash,
    lockfileHash: envelope.lockfileHash,
    retryable: envelope.retryable,
    rollbackRequired: envelope.rollbackRequired,
    summary: cloneSummary(readOwnDataField(envelope, 'summary'), diagnosticCount),
    diagnosticCount
  })
}

const createInMemoryUiIpcResponseDeliveryHost = (
  options: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostOptions
): ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHost => {
  const channel = platformChannels[options.platform]
  const records: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryRecord[] = []

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_IN_MEMORY_UI_IPC_RESPONSE_DELIVERY_HOST_KIND,
    platform: options.platform,
    channel,
    deliver(envelope: ThirdPartyDataPackUiIpcResultEnvelope) {
      if (!envelopeAccepted(envelope, options)) {
        return createRejectedAcknowledgement(channel, envelope)
      }

      const record = createRecord(records.length + 1, options.platform, channel, envelope)
      records.push(record)
      return createAcknowledgement(channel, envelope)
    },
    getDeliveryRecords() {
      return Object.freeze([...records])
    },
    getLastDeliveryRecord() {
      return records[records.length - 1]
    },
    clearDeliveryRecords() {
      records.splice(0, records.length)
    }
  } as ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHost)
}

export const createThirdPartyDataPackInMemoryUiIpcResponseDeliveryHost = (
  options: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostOptions
): ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHost =>
  createInMemoryUiIpcResponseDeliveryHost(options)

export const createThirdPartyDataPackInMemoryElectronResponseDeliveryHost = (
  options: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostExpectationOptions = {}
): ThirdPartyDataPackInMemoryElectronResponseDeliveryHost =>
  createInMemoryUiIpcResponseDeliveryHost({
    ...options,
    platform: 'electron'
  }) as ThirdPartyDataPackInMemoryElectronResponseDeliveryHost

export const createThirdPartyDataPackInMemoryWebResponseDeliveryHost = (
  options: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostExpectationOptions = {}
): ThirdPartyDataPackInMemoryWebResponseDeliveryHost =>
  createInMemoryUiIpcResponseDeliveryHost({
    ...options,
    platform: 'web'
  }) as ThirdPartyDataPackInMemoryWebResponseDeliveryHost

export const createThirdPartyDataPackInMemoryAndroidResponseDeliveryHost = (
  options: ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostExpectationOptions = {}
): ThirdPartyDataPackInMemoryAndroidResponseDeliveryHost =>
  createInMemoryUiIpcResponseDeliveryHost({
    ...options,
    platform: 'android'
  }) as ThirdPartyDataPackInMemoryAndroidResponseDeliveryHost
