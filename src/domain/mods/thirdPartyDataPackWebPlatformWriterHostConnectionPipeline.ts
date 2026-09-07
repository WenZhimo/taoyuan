import {
  createThirdPartyDataPackPlatformWriterConnectionPreflight
} from './thirdPartyDataPackPlatformWriterConnectionPreflight'
import {
  createThirdPartyDataPackSettingsLockfilePersistentWriterSource,
  type CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'
import {
  createThirdPartyDataPackWebPlatformWriterAdapterPreflight
} from './thirdPartyDataPackWebPlatformWriterAdapterPreflight'
import {
  createThirdPartyDataPackWebPlatformWriterHostConnectionSource,
  type CreateThirdPartyDataPackWebPlatformWriterHostConnectionSourceOptions,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionResult,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult
} from './thirdPartyDataPackWebPlatformWriterHostConnectionSource'
import {
  createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost,
  type CreateThirdPartyDataPackWebSettingsLockfilePersistentWriterHostOptions,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from './thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'

export interface CreateThirdPartyDataPackWebPlatformWriterHostConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly readSettingsLockfileCommitSource?:
    CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['readSettingsLockfileCommitSource']
  readonly writeSettingsLockfile?:
    CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['writeSettingsLockfile']
  readonly webSettingsLockfileStore?:
    CreateThirdPartyDataPackWebSettingsLockfilePersistentWriterHostOptions['store']
  readonly readLockfileDraft?:
    CreateThirdPartyDataPackWebSettingsLockfilePersistentWriterHostOptions['readLockfileDraft']
  readonly connectWebPlatformWriterHost?:
    CreateThirdPartyDataPackWebPlatformWriterHostConnectionSourceOptions['connectWebPlatformWriterHost']
}

const createWebSettingsLockfileWriter = (
  options: CreateThirdPartyDataPackWebPlatformWriterHostConnectionPipelineOptions
): NonNullable<CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['writeSettingsLockfile']> => {
  if (options.writeSettingsLockfile !== undefined) return options.writeSettingsLockfile

  if (options.webSettingsLockfileStore === undefined || options.readLockfileDraft === undefined) {
    throw new Error('third-party Web platform writer host connection missing Web settings-lockfile writer sources')
  }

  return createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost({
    store: options.webSettingsLockfileStore,
    readLockfileDraft: options.readLockfileDraft
  })
}

const packageIdListsEqual = (
  left: readonly string[] | undefined,
  right: readonly string[]
): boolean => left !== undefined
  && left.length === right.length
  && left.every((value, index) => value === right[index])

const createWebPlatformWriterHostConnectionResult = (
  envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope,
  status: ThirdPartyDataPackWebPlatformWriterHostConnectionResult['status']
): ThirdPartyDataPackWebPlatformWriterHostConnectionResult => {
  const accepted = status === 'accepted'
  return Object.freeze({
    status,
    requestedCommandId: envelope.requestedCommandId,
    targetPackageId: envelope.targetPackageId,
    selectedPackageIds: envelope.selectedPackageIds,
    blockedPackageIds: envelope.blockedPackageIds,
    loadOrder: envelope.loadOrder,
    registryCount: envelope.registryCount,
    entryCount: envelope.entryCount,
    packageCount: envelope.packageCount,
    candidateHash: envelope.candidateIdentity.candidateHash,
    lockfileHash: envelope.lockfileHash,
    modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
    transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
    modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
    transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
    webRequirementIds: envelope.webRequirementIds,
    diagnostics: Object.freeze([]),
    effects: Object.freeze({
      webPlatformWriterHostCalled: true,
      webPlatformWriterHostAccepted: accepted,
      realWebPlatformWriterHostCalled: true,
      webPlatformWriterConnected: accepted,
      webIndexedDbStorageResolved: accepted,
      webStorageEnvelopeExposed: false,
      transactionCommitted: false,
      runtimePublicationCommitted: false,
      postCommitVerificationExecuted: false,
      uiIpcResponseDelivered: false,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      packageFilesRestored: false,
      lockfileWritten: accepted,
      lockfileRestored: false,
      settingsWritten: accepted,
      settingsRestored: false,
      savesWritten: false,
      cacheWritten: false,
      transactionLogWritten: false,
      recoveryLogRead: false,
      recoveryLogReplayed: false,
      rollbackExecuted: false,
      diagnosticsWritten: false
    })
  })
}

const createWebPlatformWriterHostConnectionFromStore = (
  store: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
): NonNullable<CreateThirdPartyDataPackWebPlatformWriterHostConnectionSourceOptions['connectWebPlatformWriterHost']> =>
  async envelope => {
    try {
      const readBack = await store.read()
      const record = readBack.record
      const matchesEnvelope = readBack.report.status === 'ready'
        && record?.requestedCommandId === envelope.requestedCommandId
        && record?.targetPackageId === envelope.targetPackageId
        && packageIdListsEqual(record?.selectedPackageIds, envelope.selectedPackageIds)
        && packageIdListsEqual(record?.blockedPackageIds, envelope.blockedPackageIds)
        && packageIdListsEqual(record?.loadOrder, envelope.loadOrder)
        && record?.candidateHash === envelope.candidateIdentity.candidateHash
        && record?.lockfileHash === envelope.lockfileHash
      return createWebPlatformWriterHostConnectionResult(
        envelope,
        matchesEnvelope ? 'accepted' : 'blocked'
      )
    } catch {
      return createWebPlatformWriterHostConnectionResult(envelope, 'blocked')
    }
  }

const createWebPlatformWriterHostConnection = (
  options: CreateThirdPartyDataPackWebPlatformWriterHostConnectionPipelineOptions
): CreateThirdPartyDataPackWebPlatformWriterHostConnectionSourceOptions['connectWebPlatformWriterHost'] => {
  if (options.connectWebPlatformWriterHost !== undefined) return options.connectWebPlatformWriterHost
  if (options.webSettingsLockfileStore === undefined) return undefined
  return createWebPlatformWriterHostConnectionFromStore(options.webSettingsLockfileStore)
}

export const createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline = (
  options: CreateThirdPartyDataPackWebPlatformWriterHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult>) => {
  const readSettingsLockfilePersistentWriterSource = async() => {
    const source = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: options.enabled,
      readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
      writeSettingsLockfile: options.enabled === true
        ? createWebSettingsLockfileWriter(options)
        : options.writeSettingsLockfile
    })
    return source()
  }
  const readPlatformWriterConnectionPreflight =
    createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: options.enabled,
      readSettingsLockfilePersistentWriterSource
    })
  const readWebPlatformWriterAdapterPreflight =
    createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      enabled: options.enabled,
      readPlatformWriterConnectionPreflight
    })

  return createThirdPartyDataPackWebPlatformWriterHostConnectionSource({
    enabled: options.enabled,
    readWebPlatformWriterAdapterPreflight,
    connectWebPlatformWriterHost: createWebPlatformWriterHostConnection(options)
  })
}

export const thirdPartyDataPackWebPlatformWriterHostConnectionPipeline =
  createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline()
