import {
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
  type ThirdPartyDataPackWebStartupPersistentStateSourceHost
} from './thirdPartyDataPackWebStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  ThirdPartyDataPackStartupGatePersistentStateSourceHost,
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND =
  'web-startup-persistent-state-source-adapter-bridge'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE =
  'web-indexeddb-source-host-to-startup-persistent-state-adapter'

export interface ThirdPartyDataPackWebStartupPersistentStateSourceAdapterBridge {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
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

const webHostRead = (
  host: unknown
): ThirdPartyDataPackWebStartupPersistentStateSourceHost['read'] | undefined => {
  if (host === null || typeof host !== 'object') return undefined
  if (
    readOwnStringField(host, 'kind') !== THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND
    || readOwnStringField(host, 'mode') !== THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
  ) {
    return undefined
  }

  const read = readOwnDataField(host, 'read')
  return typeof read === 'function'
    ? read as ThirdPartyDataPackWebStartupPersistentStateSourceHost['read']
    : undefined
}

export const createThirdPartyDataPackWebStartupPersistentStateSourceAdapterBridge = (
  webHost: ThirdPartyDataPackWebStartupPersistentStateSourceHost
): ThirdPartyDataPackWebStartupPersistentStateSourceAdapterBridge => {
  const host: ThirdPartyDataPackStartupGatePersistentStateSourceHost = Object.freeze({
    kind: 'web-indexeddb-startup-persistent-state-source-adapter',
    mode: 'web-indexeddb-startup-persistent-state',
    read: async(
      request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
    ): Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource> => {
      const read = webHostRead(webHost)
      if (read === undefined) {
        throw new Error('web startup persistent state source host is not bridge-compatible')
      }
      return read.call(webHost, request)
    }
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
    mode: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE,
    host
  })
}
