import {
  executeThirdPartyDataPackWebStartupPersistentStateSourceAdapter,
  type ThirdPartyDataPackWebStartupPersistentStateSourceAdapterExecutionResult
} from './thirdPartyDataPackWebStartupPersistentStateSourceAdapterExecution'
import type {
  ThirdPartyDataPackWebStartupPersistentStateSourceHost
} from './thirdPartyDataPackWebStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from './thirdPartyDataPackStartupGateHandoffPreflight'
import {
  buildThirdPartyDataPackStartupGatePersistentStatePreflight,
  type ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from './thirdPartyDataPackStartupGatePersistentStatePreflight'

export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND =
  'web-startup-gate-persistent-state-execution'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE =
  'startup-handoff-to-web-indexeddb-persistent-state-source'

export interface ThirdPartyDataPackWebStartupGatePersistentStateExecutionResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE
  readonly platform: 'web'
  readonly startupGateHandoffStatus: ThirdPartyDataPackStartupGateHandoffPreflightResult['status']
  readonly persistentStatePreflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult
  readonly sourceAdapterExecution: ThirdPartyDataPackWebStartupPersistentStateSourceAdapterExecutionResult
}

export interface ExecuteThirdPartyDataPackWebStartupGatePersistentStateExecutionOptions {
  readonly startupGateHandoffPreflight: ThirdPartyDataPackStartupGateHandoffPreflightResult
  readonly webHost: ThirdPartyDataPackWebStartupPersistentStateSourceHost
}

export const executeThirdPartyDataPackWebStartupGatePersistentStateExecution = async(
  options: ExecuteThirdPartyDataPackWebStartupGatePersistentStateExecutionOptions
): Promise<ThirdPartyDataPackWebStartupGatePersistentStateExecutionResult> => {
  const persistentStatePreflight = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
    startupGateHandoffPreflight: options.startupGateHandoffPreflight
  })
  const sourceAdapterExecution = await executeThirdPartyDataPackWebStartupPersistentStateSourceAdapter({
    preflight: persistentStatePreflight,
    webHost: options.webHost
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
    mode: THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
    platform: 'web',
    startupGateHandoffStatus: options.startupGateHandoffPreflight.status,
    persistentStatePreflight,
    sourceAdapterExecution
  })
}
