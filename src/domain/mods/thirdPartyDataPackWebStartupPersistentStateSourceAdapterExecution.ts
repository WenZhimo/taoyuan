import {
  createThirdPartyDataPackWebStartupPersistentStateSourceAdapterBridge,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
} from './thirdPartyDataPackWebStartupPersistentStateSourceAdapterBridge'
import type {
  ThirdPartyDataPackWebStartupPersistentStateSourceHost
} from './thirdPartyDataPackWebStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from './thirdPartyDataPackStartupGatePersistentStatePreflight'
import {
  executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter,
  type ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND =
  'web-startup-persistent-state-source-adapter-execution'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE =
  'web-indexeddb-readonly-source-host-execution'

export interface ThirdPartyDataPackWebStartupPersistentStateSourceAdapterExecutionResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE
  readonly platform: 'web'
  readonly bridgeKind: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND
  readonly bridgeMode: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
  readonly adapterResult: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
}

export interface ExecuteThirdPartyDataPackWebStartupPersistentStateSourceAdapterOptions {
  readonly preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult
  readonly webHost: ThirdPartyDataPackWebStartupPersistentStateSourceHost
}

export const executeThirdPartyDataPackWebStartupPersistentStateSourceAdapter = async(
  options: ExecuteThirdPartyDataPackWebStartupPersistentStateSourceAdapterOptions
): Promise<ThirdPartyDataPackWebStartupPersistentStateSourceAdapterExecutionResult> => {
  const bridge = createThirdPartyDataPackWebStartupPersistentStateSourceAdapterBridge(
    options.webHost
  )
  const adapterResult = await executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter({
    preflight: options.preflight,
    host: bridge.host
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_KIND,
    mode: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_EXECUTION_MODE,
    platform: 'web',
    bridgeKind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
    bridgeMode: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE,
    adapterResult
  })
}
