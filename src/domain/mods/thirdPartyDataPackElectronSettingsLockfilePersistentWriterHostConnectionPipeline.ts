import {
  createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost,
  type CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions
} from './thirdPartyDataPackElectronSettingsLockfilePersistentWriterHost'
import {
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline,
  type CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineOptions,
  type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'
import {
  createThirdPartyDataPackModLockStorageAdapter,
  type ThirdPartyDataPackModLockStorageAdapter
} from './thirdPartyDataPackModLockStorage'
import {
  createThirdPartyDataPackSettingsLockfilePersistentWriterSource,
  type CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'

export interface CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly programDirectoryPath?: string
  readonly modLockStorage?: ThirdPartyDataPackModLockStorageAdapter
  readonly readInstallPersistentStagingLifecyclePipeline?:
    CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineOptions[
      'readInstallPersistentStagingLifecyclePipeline'
    ]
  readonly readSettingsLockfileCommitSource?:
    CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['readSettingsLockfileCommitSource']
  readonly readLockfileDraft?:
    CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions['readLockfileDraft']
  readonly writeSettings?:
    CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions['writeSettings']
}

const createElectronSettingsLockfileWriter = (
  options: CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipelineOptions
) => {
  if (options.readLockfileDraft === undefined || options.writeSettings === undefined) {
    throw new Error('third-party Electron settings-lockfile writer host connection missing writer sources')
  }

  const modLockStorage = options.modLockStorage ?? (
    options.programDirectoryPath === undefined
      ? undefined
      : createThirdPartyDataPackModLockStorageAdapter({
          programDirectoryPath: options.programDirectoryPath
        })
  )

  if (modLockStorage === undefined) {
    throw new Error('third-party Electron settings-lockfile writer host connection missing mod-lock storage')
  }

  return createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost({
    modLockStorage,
    readLockfileDraft: options.readLockfileDraft,
    writeSettings: options.writeSettings
  })
}

export const createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline = (
  options: CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult>) => {
  const readSettingsLockfilePersistentWriterSource = async() => {
    const readSource = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: options.enabled,
      readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
      writeSettingsLockfile: options.enabled === true
        ? createElectronSettingsLockfileWriter(options)
        : undefined
    })
    return readSource()
  }

  return createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline({
    enabled: options.enabled,
    readInstallPersistentStagingLifecyclePipeline: options.readInstallPersistentStagingLifecyclePipeline,
    readSettingsLockfilePersistentWriterSource
  })
}

export const thirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline =
  createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline()
