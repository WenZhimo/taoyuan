import {
  createThirdPartyDataPackAndroidPlatformWriterAdapterPreflight
} from './thirdPartyDataPackAndroidPlatformWriterAdapterPreflight'
import {
  createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource,
  type CreateThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceOptions,
  type ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult
} from './thirdPartyDataPackAndroidPlatformWriterHostConnectionSource'
import {
  type CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'

export interface CreateThirdPartyDataPackAndroidPlatformWriterHostConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly readSettingsLockfileCommitSource?:
    CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['readSettingsLockfileCommitSource']
  readonly writeSettingsLockfile?:
    CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions['writeSettingsLockfile']
  readonly connectAndroidPlatformWriterHost?:
    CreateThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceOptions['connectAndroidPlatformWriterHost']
}

export const createThirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline = (
  options: CreateThirdPartyDataPackAndroidPlatformWriterHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult>) => {
  // Android is vanilla-only in the current plan, so the historical third-party writer
  // pipeline stays inert even when explicitly enabled by old tests or cached state.
  const readAndroidPlatformWriterAdapterPreflight =
    createThirdPartyDataPackAndroidPlatformWriterAdapterPreflight()

  return createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource({
    enabled: options.enabled,
    readAndroidPlatformWriterAdapterPreflight,
    connectAndroidPlatformWriterHost: options.connectAndroidPlatformWriterHost
  })
}

export const thirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline =
  createThirdPartyDataPackAndroidPlatformWriterHostConnectionPipeline()
