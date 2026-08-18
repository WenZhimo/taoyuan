import {
  createThirdPartyDataPackElectronPlatformWriterAdapterPreflight
} from './thirdPartyDataPackElectronPlatformWriterAdapterPreflight'
import {
  createThirdPartyDataPackElectronPlatformWriterHostConnectionSource,
  type CreateThirdPartyDataPackElectronPlatformWriterHostConnectionSourceOptions,
  type ThirdPartyDataPackElectronPlatformWriterHostConnectionSourceResult
} from './thirdPartyDataPackElectronPlatformWriterHostConnectionSource'
import {
  createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost,
  type CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions
} from './thirdPartyDataPackElectronSettingsLockfilePersistentWriterHost'
import {
  createThirdPartyDataPackModLockStorageAdapter,
  type ThirdPartyDataPackModLockStorageAdapter
} from './thirdPartyDataPackModLockStorage'
import {
  createThirdPartyDataPackPlatformWriterConnectionPreflight
} from './thirdPartyDataPackPlatformWriterConnectionPreflight'
import {
  createThirdPartyDataPackSettingsLockfilePersistentWriterSource,
  type CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'

export interface CreateThirdPartyDataPackElectronPlatformWriterHostConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly readSettingsLockfileCommitSource?:
    CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['readSettingsLockfileCommitSource']
  readonly writeSettingsLockfile?:
    CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['writeSettingsLockfile']
  readonly programDirectoryPath?: string
  readonly modLockStorage?: ThirdPartyDataPackModLockStorageAdapter
  readonly readLockfileDraft?:
    CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions['readLockfileDraft']
  readonly writeSettings?:
    CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions['writeSettings']
  readonly connectElectronPlatformWriterHost?:
    CreateThirdPartyDataPackElectronPlatformWriterHostConnectionSourceOptions['connectElectronPlatformWriterHost']
}

const createElectronSettingsLockfileWriter = (
  options: CreateThirdPartyDataPackElectronPlatformWriterHostConnectionPipelineOptions
): NonNullable<CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['writeSettingsLockfile']> => {
  if (options.writeSettingsLockfile !== undefined) return options.writeSettingsLockfile

  if (options.readLockfileDraft === undefined || options.writeSettings === undefined) {
    throw new Error('third-party Electron platform writer host connection missing Electron settings-lockfile writer sources')
  }

  const modLockStorage = options.modLockStorage ?? (
    options.programDirectoryPath === undefined
      ? undefined
      : createThirdPartyDataPackModLockStorageAdapter({
          programDirectoryPath: options.programDirectoryPath
        })
  )

  if (modLockStorage === undefined) {
    throw new Error('third-party Electron platform writer host connection missing mod-lock storage')
  }

  return createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost({
    modLockStorage,
    readLockfileDraft: options.readLockfileDraft,
    writeSettings: options.writeSettings
  })
}

export const createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline = (
  options: CreateThirdPartyDataPackElectronPlatformWriterHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackElectronPlatformWriterHostConnectionSourceResult>) => {
  const readSettingsLockfilePersistentWriterSource = async() => {
    const source = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: options.enabled,
      readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
      writeSettingsLockfile: options.enabled === true
        ? createElectronSettingsLockfileWriter(options)
        : options.writeSettingsLockfile
    })
    return source()
  }
  const readPlatformWriterConnectionPreflight =
    createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: options.enabled,
      readSettingsLockfilePersistentWriterSource
    })
  const readElectronPlatformWriterAdapterPreflight =
    createThirdPartyDataPackElectronPlatformWriterAdapterPreflight({
      enabled: options.enabled,
      readPlatformWriterConnectionPreflight
    })

  return createThirdPartyDataPackElectronPlatformWriterHostConnectionSource({
    enabled: options.enabled,
    readElectronPlatformWriterAdapterPreflight,
    connectElectronPlatformWriterHost: options.connectElectronPlatformWriterHost
  })
}

export const thirdPartyDataPackElectronPlatformWriterHostConnectionPipeline =
  createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline()
