import {
  executeThirdPartyDataPackAndroidStartupPersistentStateSourceAdapter,
  type ThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterExecutionResult
} from './thirdPartyDataPackAndroidStartupPersistentStateSourceAdapterExecution'
import type {
  ThirdPartyDataPackAndroidStartupPersistentStateSourceHost
} from './thirdPartyDataPackAndroidStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from './thirdPartyDataPackStartupGateHandoffPreflight'
import {
  buildThirdPartyDataPackStartupGatePersistentStatePreflight,
  type ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from './thirdPartyDataPackStartupGatePersistentStatePreflight'

export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND =
  'android-startup-gate-persistent-state-execution'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE =
  'startup-handoff-to-android-app-data-persistent-state-source'

export interface ThirdPartyDataPackAndroidStartupGatePersistentStateExecutionResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE
  readonly platform: 'android'
  readonly startupGateHandoffStatus: ThirdPartyDataPackStartupGateHandoffPreflightResult['status']
  readonly persistentStatePreflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult
  readonly sourceAdapterExecution: ThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterExecutionResult
}

export interface ExecuteThirdPartyDataPackAndroidStartupGatePersistentStateExecutionOptions {
  readonly startupGateHandoffPreflight: ThirdPartyDataPackStartupGateHandoffPreflightResult
  readonly androidHost: ThirdPartyDataPackAndroidStartupPersistentStateSourceHost
}

export const executeThirdPartyDataPackAndroidStartupGatePersistentStateExecution = async(
  options: ExecuteThirdPartyDataPackAndroidStartupGatePersistentStateExecutionOptions
): Promise<ThirdPartyDataPackAndroidStartupGatePersistentStateExecutionResult> => {
  const persistentStatePreflight = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
    startupGateHandoffPreflight: options.startupGateHandoffPreflight
  })
  const sourceAdapterExecution = await executeThirdPartyDataPackAndroidStartupPersistentStateSourceAdapter({
    preflight: persistentStatePreflight,
    androidHost: options.androidHost
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
    mode: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
    platform: 'android',
    startupGateHandoffStatus: options.startupGateHandoffPreflight.status,
    persistentStatePreflight,
    sourceAdapterExecution
  })
}
