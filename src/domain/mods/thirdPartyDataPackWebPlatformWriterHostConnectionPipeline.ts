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
  type ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult
} from './thirdPartyDataPackWebPlatformWriterHostConnectionSource'
import {
  createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost,
  type CreateThirdPartyDataPackWebSettingsLockfilePersistentWriterHostOptions
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
    connectWebPlatformWriterHost: options.connectWebPlatformWriterHost
  })
}

export const thirdPartyDataPackWebPlatformWriterHostConnectionPipeline =
  createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline()
