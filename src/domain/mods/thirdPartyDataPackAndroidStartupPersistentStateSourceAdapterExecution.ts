import {
  createThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
} from './thirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge'
import type {
  ThirdPartyDataPackAndroidStartupPersistentStateSourceHost
} from './thirdPartyDataPackAndroidStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from './thirdPartyDataPackStartupGatePersistentStatePreflight'
import {
  executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter,
  type ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND =
  'android-startup-persistent-state-source-adapter-execution'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE =
  'android-app-data-readonly-source-host-execution'

export interface ThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterExecutionResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE
  readonly platform: 'android'
  readonly bridgeKind: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND
  readonly bridgeMode: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
  readonly adapterResult: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
}

export interface ExecuteThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterOptions {
  readonly preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult
  readonly androidHost: ThirdPartyDataPackAndroidStartupPersistentStateSourceHost
}

export const executeThirdPartyDataPackAndroidStartupPersistentStateSourceAdapter = async(
  options: ExecuteThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterOptions
): Promise<ThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterExecutionResult> => {
  const bridge = createThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge(
    options.androidHost
  )
  const adapterResult = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
    preflight: options.preflight,
    host: bridge.host
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND,
    mode: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE,
    platform: 'android',
    bridgeKind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
    bridgeMode: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE,
    adapterResult
  })
}
