import type {
  ThirdPartyDataPackDisablePersistentRecord,
  ThirdPartyDataPackDisableStartupPersistentStateSnapshot
} from './thirdPartyDataPackDisableTransaction'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
import type { PackageId } from './ids'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ELECTRON_MANAGEMENT_SETTINGS_LOCKFILE_PERSISTENT_WRITER_HOST_MODE =
  'real-electron-program-directory-settings-lockfile-writer-host' as const

export type ThirdPartyDataPackElectronManagementPersistentWriterHostMode =
  typeof THIRD_PARTY_DATA_PACK_ELECTRON_MANAGEMENT_SETTINGS_LOCKFILE_PERSISTENT_WRITER_HOST_MODE

export interface ThirdPartyDataPackElectronManagementPersistentWriterHostEnvelope {
  readonly requestedCommandId: 'disable'
  readonly targetPackageId: PackageId
  readonly record: ThirdPartyDataPackDisablePersistentRecord
  readonly startupSnapshot: ThirdPartyDataPackDisableStartupPersistentStateSnapshot
}

export interface ThirdPartyDataPackElectronManagementPersistentWriterHostResult {
  readonly status: 'written' | 'blocked'
  readonly settingsLockfilePersistentWriterHostMode:
    ThirdPartyDataPackElectronManagementPersistentWriterHostMode
  readonly settingsWritten: boolean
  readonly lockfileWritten: boolean
  readonly startupStateWritten: boolean
  readonly diagnostics: readonly string[]
}

export interface CreateThirdPartyDataPackElectronManagementPersistentWriterHostOptions {
  readonly writeModLock: (
    draft: ThirdPartyDataPackLockfileDraft
  ) => Awaitable<{ readonly status: 'written' | 'blocked' }>
  readonly writeSettings: (
    record: ThirdPartyDataPackDisablePersistentRecord
  ) => Awaitable<{ readonly status: 'written' | 'blocked' }>
  readonly writeStartupState: (
    snapshot: ThirdPartyDataPackDisableStartupPersistentStateSnapshot
  ) => Awaitable<{ readonly status: 'written' | 'blocked' }>
}

const createResult = (
  status: 'written' | 'blocked',
  settingsWritten: boolean,
  lockfileWritten: boolean,
  startupStateWritten: boolean,
  diagnostics: readonly string[]
): ThirdPartyDataPackElectronManagementPersistentWriterHostResult => Object.freeze({
  status,
  settingsLockfilePersistentWriterHostMode:
    THIRD_PARTY_DATA_PACK_ELECTRON_MANAGEMENT_SETTINGS_LOCKFILE_PERSISTENT_WRITER_HOST_MODE,
  settingsWritten,
  lockfileWritten,
  startupStateWritten,
  diagnostics: Object.freeze([...diagnostics])
})

export const createThirdPartyDataPackElectronManagementPersistentWriterHost = (
  options: CreateThirdPartyDataPackElectronManagementPersistentWriterHostOptions
) => async(
  envelope: ThirdPartyDataPackElectronManagementPersistentWriterHostEnvelope
): Promise<ThirdPartyDataPackElectronManagementPersistentWriterHostResult> => {
  const lockfileResult = await options.writeModLock(envelope.record.lockfileDraft)
  if (lockfileResult.status !== 'written') {
    return createResult('blocked', false, false, false, ['mod-lock-write-blocked'])
  }

  const settingsResult = await options.writeSettings(envelope.record)
  if (settingsResult.status !== 'written') {
    return createResult('blocked', false, true, false, ['settings-write-blocked'])
  }

  const startupStateResult = await options.writeStartupState(envelope.startupSnapshot)
  if (startupStateResult.status !== 'written') {
    return createResult('blocked', true, true, false, ['startup-state-write-blocked'])
  }

  return createResult('written', true, true, true, [])
}
