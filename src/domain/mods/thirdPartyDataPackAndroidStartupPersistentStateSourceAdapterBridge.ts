import {
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
  type ThirdPartyDataPackAndroidStartupPersistentStateSourceHost
} from './thirdPartyDataPackAndroidStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  ThirdPartyDataPackStartupGatePersistentStateSourceHost,
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND =
  'android-startup-persistent-state-source-adapter-bridge'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE =
  'android-app-data-source-host-to-injected-test-only-adapter'

export interface ThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE
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

const androidHostRead = (
  host: unknown
): ThirdPartyDataPackAndroidStartupPersistentStateSourceHost['read'] | undefined => {
  if (host === null || typeof host !== 'object') return undefined
  if (
    readOwnStringField(host, 'kind') !== THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND
    || readOwnStringField(host, 'mode') !== THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
  ) {
    return undefined
  }

  const read = readOwnDataField(host, 'read')
  return typeof read === 'function'
    ? read as ThirdPartyDataPackAndroidStartupPersistentStateSourceHost['read']
    : undefined
}

export const createThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge = (
  androidHost: ThirdPartyDataPackAndroidStartupPersistentStateSourceHost
): ThirdPartyDataPackAndroidStartupPersistentStateSourceAdapterBridge => {
  const host: ThirdPartyDataPackStartupGatePersistentStateSourceHost = Object.freeze({
    kind: 'injected-startup-persistent-state-source-adapter',
    mode: 'injected-test-only',
    read: async(
      request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
    ): Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource> => {
      const read = androidHostRead(androidHost)
      if (read === undefined) {
        throw new Error('android startup persistent state source host is not bridge-compatible')
      }
      return read.call(androidHost, request)
    }
  })

  return Object.freeze({
    kind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_ADAPTER_BRIDGE_MODE,
    host
  })
}
