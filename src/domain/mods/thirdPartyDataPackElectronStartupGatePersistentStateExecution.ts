import {
  executeThirdPartyDataPackElectronStartupPersistentStateSourceAdapter,
  type ThirdPartyDataPackElectronStartupPersistentStateSourceAdapterExecutionResult
} from './thirdPartyDataPackElectronStartupPersistentStateSourceAdapterExecution'
import type {
  ThirdPartyDataPackElectronStartupPersistentStateSourceHost
} from './thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from './thirdPartyDataPackStartupGateHandoffPreflight'
import {
  buildThirdPartyDataPackStartupGatePersistentStatePreflight,
  type ThirdPartyDataPackStartupGatePersistentStatePreflightResult
} from './thirdPartyDataPackStartupGatePersistentStatePreflight'

export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND =
  'electron-startup-gate-persistent-state-execution'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE =
  'startup-handoff-to-electron-program-directory-persistent-state-source'

export interface ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE
  readonly platform: 'electron'
  readonly startupGateHandoffStatus: ThirdPartyDataPackStartupGateHandoffPreflightResult['status']
  readonly persistentStatePreflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult
  readonly sourceAdapterExecution: ThirdPartyDataPackElectronStartupPersistentStateSourceAdapterExecutionResult
}

export interface ExecuteThirdPartyDataPackElectronStartupGatePersistentStateExecutionOptions {
  readonly startupGateHandoffPreflight: ThirdPartyDataPackStartupGateHandoffPreflightResult
  readonly electronHost: ThirdPartyDataPackElectronStartupPersistentStateSourceHost
}

export const executeThirdPartyDataPackElectronStartupGatePersistentStateExecution = async(
  options: ExecuteThirdPartyDataPackElectronStartupGatePersistentStateExecutionOptions
): Promise<ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult> => {
  const persistentStatePreflight = buildThirdPartyDataPackStartupGatePersistentStatePreflight({
    startupGateHandoffPreflight: options.startupGateHandoffPreflight
  })
  const sourceAdapterExecution = await executeThirdPartyDataPackElectronStartupPersistentStateSourceAdapter({
    preflight: persistentStatePreflight,
    electronHost: options.electronHost
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
    mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
    platform: 'electron',
    startupGateHandoffStatus: options.startupGateHandoffPreflight.status,
    persistentStatePreflight,
    sourceAdapterExecution
  })
}
