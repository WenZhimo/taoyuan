import type {
  ThirdPartyDataPackElectronStartupPersistentStateSourceHost
} from './thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  ThirdPartyDataPackStartupGatePersistentStateSourceHost,
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND =
  'electron-startup-persistent-state-source-adapter-bridge'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE =
  'electron-program-directory-source-host-to-startup-persistent-state-adapter'

const thirdPartyDataPackElectronStartupPersistentStateSourceHostKind =
  'electron-program-directory-startup-persistent-state-source-host'
const thirdPartyDataPackElectronStartupPersistentStateSourceHostMode =
  'electron-program-directory-readonly-isolated-test'

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
  readonly host: ThirdPartyDataPackStartupGatePersistentStateSourceHost
}

const readOwnDataField = (
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const electronHostRead = (
  host: unknown
): ThirdPartyDataPackElectronStartupPersistentStateSourceHost['read'] | undefined => {
  if (host === null || typeof host !== 'object') return undefined
  if (
    readOwnStringField(host, 'kind') !== thirdPartyDataPackElectronStartupPersistentStateSourceHostKind
    || readOwnStringField(host, 'mode') !== thirdPartyDataPackElectronStartupPersistentStateSourceHostMode
  ) {
    return undefined
  }

  const read = readOwnDataField(host, 'read')
  return typeof read === 'function'
    ? read as ThirdPartyDataPackElectronStartupPersistentStateSourceHost['read']
    : undefined
}

export const createThirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge = (
  electronHost: ThirdPartyDataPackElectronStartupPersistentStateSourceHost
): ThirdPartyDataPackElectronStartupPersistentStateSourceAdapterBridge => {
  const host: ThirdPartyDataPackStartupGatePersistentStateSourceHost = Object.freeze({
    kind: 'electron-program-directory-startup-persistent-state-source-adapter',
    mode: 'electron-program-directory-startup-persistent-state',
    read: async(
      request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
    ): Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource> => {
      const read = electronHostRead(electronHost)
      if (read === undefined) {
        throw new Error('electron startup persistent state source host is not bridge-compatible')
      }
      return read.call(electronHost, request)
    }
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE,
    host
  })
}
