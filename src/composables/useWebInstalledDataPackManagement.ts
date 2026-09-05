import { computed, ref } from 'vue'
import type { RegistrySet } from '@/domain/mods/registry'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackDisableState,
  createThirdPartyDataPackDisablePersistentRecord,
  createThirdPartyDataPackDisableStartupPersistentStateSnapshot,
  executeThirdPartyDataPackDisableTransaction,
  type ThirdPartyDataPackDisablePersistentRecord,
  type ThirdPartyDataPackDisableState,
  type ThirdPartyDataPackDisableTransactionResult
} from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import {
  buildThirdPartyDataPackUninstallState,
  createThirdPartyDataPackUninstallPersistentRecord,
  createThirdPartyDataPackUninstallStartupPersistentStateSnapshot,
  executeThirdPartyDataPackUninstallTransaction,
  type ThirdPartyDataPackUninstallPersistentRecord,
  type ThirdPartyDataPackUninstallState,
  type ThirdPartyDataPackUninstallTransactionResult
} from '@/domain/mods/thirdPartyDataPackUninstallTransaction'
import {
  buildThirdPartyDataPackEnableState,
  createThirdPartyDataPackEnablePersistentRecord,
  createThirdPartyDataPackEnableStartupPersistentStateSnapshot,
  executeThirdPartyDataPackEnableTransaction,
  type ThirdPartyDataPackEnablePersistentRecord,
  type ThirdPartyDataPackEnableState,
  type ThirdPartyDataPackEnableTransactionResult
} from '@/domain/mods/thirdPartyDataPackEnableTransaction'
import {
  THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackInstalledStateStartupGateBootstrapSource'
import {
  getLiveContentRegistryReference
} from '@/domain/mods/liveContentRegistry'
import {
  type ThirdPartyDataPackElectronDisableCommandEnvelope,
  type ThirdPartyDataPackElectronDisableCommandResult
} from '@/domain/mods/thirdPartyDataPackElectronDisableCommandBridge'
import {
  type ThirdPartyDataPackElectronUninstallCommandEnvelope,
  type ThirdPartyDataPackElectronUninstallCommandResult
} from '@/domain/mods/thirdPartyDataPackElectronUninstallCommandBridge'
import {
  type ThirdPartyDataPackElectronEnableCommandEnvelope,
  type ThirdPartyDataPackElectronEnableCommandResult
} from '@/domain/mods/thirdPartyDataPackElectronEnableCommandBridge'
import type {
  ThirdPartyDataPackElectronInstalledStateReadResult
} from '@/domain/mods/thirdPartyDataPackElectronInstalledStateBridge'
import type {
  ThirdPartyDataPackMountInputResult
} from '@/domain/mods/thirdPartyDataPackMountInput'
import type {
  ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord,
  ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createDefaultWebIndexedDbImportRecord,
  type WebIndexedDbImportPersistenceStore,
  type WebIndexedDbImportRecord
} from '@/domain/mods/webIndexedDbImportPersistence'
import {
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackWebStartupPersistentStateSourceHost'
import { utf8ByteLength } from '@/domain/mods/hash'

export interface WebInstalledDataPackManagementRow {
  readonly packageId: PackageId
  readonly version: string
  readonly status: 'enabled' | 'disabled'
}

export type WebInstalledDataPackManagementStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'blocked'
  | 'failed'

export interface UseWebInstalledDataPackManagementOptions {
  readonly officialRegistrySet: RegistrySet
  readonly settingsLockfileStore: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null
  readonly installedPackageStore: WebIndexedDbImportPersistenceStore | null
  readonly startupPersistentStateStore: WebIndexedDbImportPersistenceStore | null
  readonly mountedAppStartupEvidence?: () => boolean
  readonly electronDisableCommand?: (
    envelope: ThirdPartyDataPackElectronDisableCommandEnvelope
  ) => Promise<ThirdPartyDataPackElectronDisableCommandResult>
  readonly electronUninstallCommand?: (
    envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
  ) => Promise<ThirdPartyDataPackElectronUninstallCommandResult>
  readonly electronEnableCommand?: (
    envelope: ThirdPartyDataPackElectronEnableCommandEnvelope
  ) => Promise<ThirdPartyDataPackElectronEnableCommandResult>
  readonly readEnableMountInput?: (
    packageId: PackageId
  ) => Promise<ThirdPartyDataPackMountInputResult | null>
  readonly readElectronInstalledState?: () => Promise<ThirdPartyDataPackElectronInstalledStateReadResult>
  readonly installedImportId?: string
  readonly startupImportId?: string
}

const defaultInstalledImportId = THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
const defaultStartupImportId = THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID

type ActiveDisablePersistentRecord =
  Omit<ThirdPartyDataPackDisablePersistentRecord, 'recordId'>
  & Pick<ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord, 'recordId'>

type ActiveUninstallPersistentRecord =
  Omit<ThirdPartyDataPackUninstallPersistentRecord, 'recordId'>
  & Pick<ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord, 'recordId'>

type ActiveEnablePersistentRecord =
  Omit<ThirdPartyDataPackEnablePersistentRecord, 'recordId'>
  & Pick<ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord, 'recordId'>

const createDisableStartupSnapshotRecord = (
  state: ThirdPartyDataPackDisableState,
  importId: string
): WebIndexedDbImportRecord => {
  const snapshot = createThirdPartyDataPackDisableStartupPersistentStateSnapshot(state, 'web-startup-persistent-state-snapshot')
  const text = `${JSON.stringify(snapshot, null, 2)}\n`
  return createDefaultWebIndexedDbImportRecord([
    {
      path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
      text,
      sizeBytes: utf8ByteLength(text)
    }
  ], importId)
}

const createUninstallStartupSnapshotRecord = (
  state: ThirdPartyDataPackUninstallState,
  importId: string
): WebIndexedDbImportRecord => {
  const snapshot = createThirdPartyDataPackUninstallStartupPersistentStateSnapshot(state, 'web-startup-persistent-state-snapshot')
  const text = `${JSON.stringify(snapshot, null, 2)}\n`
  return createDefaultWebIndexedDbImportRecord([
    {
      path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
      text,
      sizeBytes: utf8ByteLength(text)
    }
  ], importId)
}

const createEnableStartupSnapshotRecord = (
  state: ThirdPartyDataPackEnableState,
  importId: string
): WebIndexedDbImportRecord => {
  const snapshot = createThirdPartyDataPackEnableStartupPersistentStateSnapshot(state, 'web-startup-persistent-state-snapshot')
  const text = `${JSON.stringify(snapshot, null, 2)}\n`
  return createDefaultWebIndexedDbImportRecord([
    {
      path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
      text,
      sizeBytes: utf8ByteLength(text)
    }
  ], importId)
}

const createElectronDisableStartupSnapshot = (
  state: ThirdPartyDataPackDisableState
) => createThirdPartyDataPackDisableStartupPersistentStateSnapshot(
  state,
  'electron-startup-persistent-state-snapshot'
)

const createElectronUninstallStartupSnapshot = (
  state: ThirdPartyDataPackUninstallState
) => createThirdPartyDataPackUninstallStartupPersistentStateSnapshot(
  state,
  'electron-startup-persistent-state-snapshot'
)

const createElectronEnableStartupSnapshot = (
  state: ThirdPartyDataPackEnableState
) => createThirdPartyDataPackEnableStartupPersistentStateSnapshot(
  state,
  'electron-startup-persistent-state-snapshot'
)

const toDisableRecord = (
  state: ThirdPartyDataPackDisableState
): ActiveDisablePersistentRecord =>
  ({
    ...createThirdPartyDataPackDisablePersistentRecord('active', state),
    recordId: 'active'
  }) as ActiveDisablePersistentRecord

const toUninstallRecord = (
  state: ThirdPartyDataPackUninstallState
): ActiveUninstallPersistentRecord =>
  ({
    ...createThirdPartyDataPackUninstallPersistentRecord('active', state),
    recordId: 'active'
  }) as ActiveUninstallPersistentRecord

const toEnableRecord = (
  state: ThirdPartyDataPackEnableState
): ActiveEnablePersistentRecord =>
  ({
    ...createThirdPartyDataPackEnablePersistentRecord('active', state),
    recordId: 'active'
  }) as ActiveEnablePersistentRecord

const readPackageRows = (
  record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null
): readonly WebInstalledDataPackManagementRow[] => {
  if (record === null) return Object.freeze([])
  const selected = new Set(record.selectedPackageIds)
  return Object.freeze(record.lockfileDraft.packages.map(pkg => Object.freeze({
    packageId: pkg.packageId,
    version: pkg.version,
    status: selected.has(pkg.packageId) ? 'enabled' as const : 'disabled' as const
  })))
}

const readPackageFilesPreserved = async(
  store: WebIndexedDbImportPersistenceStore | null,
  importId: string
): Promise<boolean> => {
  if (store === null) return false
  const record = await store.get(importId)
  return record !== null && record.files.length > 0
}

const isCurrentEnabledRecord = (
  record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null,
  packageId: PackageId
): boolean => (record?.requestedCommandId === 'install' || record?.requestedCommandId === 'enable')
  && record.selectedPackageIds.includes(packageId)
  && record.loadOrder.includes(packageId)
  && !record.blockedPackageIds.includes(packageId)

const isCurrentDisabledRecord = (
  record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null,
  packageId: PackageId
): boolean => record?.requestedCommandId === 'disable'
  && record.targetPackageId === packageId
  && record.selectedPackageIds.length === 0
  && record.loadOrder.length === 0
  && record.blockedPackageIds.length === 1
  && record.blockedPackageIds[0] === packageId
  && record.lockfileDraft.packages.some(currentPackage => currentPackage.packageId === packageId)

const isCurrentUninstallableRecord = (
  record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null,
  packageId: PackageId
): boolean => isCurrentEnabledRecord(record, packageId)
  || isCurrentDisabledRecord(record, packageId)

const matchesRecord = (
  left: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null,
  right: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null
): boolean => JSON.stringify(left) === JSON.stringify(right)

export const useWebInstalledDataPackManagement = (
  options: UseWebInstalledDataPackManagementOptions
) => {
  const status = ref<WebInstalledDataPackManagementStatus>('idle')
  const rows = ref<readonly WebInstalledDataPackManagementRow[]>(Object.freeze([]))
  const lastResult = ref<ThirdPartyDataPackDisableTransactionResult | null>(null)
  const lastUninstallResult = ref<ThirdPartyDataPackUninstallTransactionResult | null>(null)
  const lastEnableResult = ref<ThirdPartyDataPackEnableTransactionResult | null>(null)
  const reason = ref('')
  const currentRecord = ref<ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null>(null)
  const installedImportId = options.installedImportId ?? defaultInstalledImportId
  const startupImportId = options.startupImportId ?? defaultStartupImportId

  const refresh = async(): Promise<void> => {
    status.value = 'loading'
    reason.value = ''
    try {
      if (options.readElectronInstalledState !== undefined) {
        const result = await options.readElectronInstalledState()
        if (result.status === 'blocked') throw new Error(result.reason ?? 'Electron installed package state was blocked')
        currentRecord.value = result.record
        rows.value = readPackageRows(result.record)
        status.value = 'ready'
        return
      }
      if (options.settingsLockfileStore === null) {
        currentRecord.value = null
        rows.value = Object.freeze([])
        status.value = 'ready'
        return
      }
      const result = await options.settingsLockfileStore.read()
      if (result.report.status === 'failed') {
        throw new Error('Web settings-lockfile state could not be read')
      }
      currentRecord.value = result.record
      rows.value = readPackageRows(result.record)
      status.value = 'ready'
    } catch (error) {
      currentRecord.value = null
      rows.value = Object.freeze([])
      status.value = 'failed'
      reason.value = error instanceof Error ? error.message : 'Web installed package state could not be read'
    }
  }

  const disable = async(
    packageId: PackageId
  ): Promise<ThirdPartyDataPackDisableTransactionResult | null> => {
    if (status.value === 'loading') return null
    status.value = 'loading'
    reason.value = ''
    lastResult.value = null
    lastUninstallResult.value = null
    lastEnableResult.value = null

    let installedRecord: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null = null
    let previousStartupRecord: WebIndexedDbImportRecord | null = null
    try {
      if (
        options.readElectronInstalledState === undefined
        && (options.settingsLockfileStore === null || options.installedPackageStore === null)
      ) {
        throw new Error('Web installed package disable requires persistent settings and package storage')
      }
      let packageFilesPreserved = false
      if (options.readElectronInstalledState !== undefined) {
        const electronResult = await options.readElectronInstalledState()
        if (electronResult.status === 'blocked') {
          throw new Error(electronResult.reason ?? 'Electron installed package state was blocked')
        }
        installedRecord = electronResult.record
        packageFilesPreserved = electronResult.packageFilesPreserved
      } else {
        const readResult = await options.settingsLockfileStore!.read()
        installedRecord = readResult.record
        packageFilesPreserved = await readPackageFilesPreserved(
          options.installedPackageStore,
          installedImportId
        )
      }
      if (installedRecord === null || !isCurrentEnabledRecord(installedRecord, packageId)) {
        throw new Error('Only an enabled installed package can be disabled')
      }
      const verifiedInstalledRecord = installedRecord

      if (!packageFilesPreserved) {
        throw new Error('Installed package files are unavailable for disable preservation')
      }

      if (options.startupPersistentStateStore !== null) {
        previousStartupRecord = await options.startupPersistentStateStore.get(startupImportId)
      }
      const startupStore = options.startupPersistentStateStore

      const state = buildThirdPartyDataPackDisableState({
        officialRegistrySet: options.officialRegistrySet,
        installedDraft: verifiedInstalledRecord.lockfileDraft,
        targetPackageId: packageId
      })
      const startupSnapshotRecord = createDisableStartupSnapshotRecord(state, startupImportId)
      const disableRecord = toDisableRecord(state)
      const transaction = await executeThirdPartyDataPackDisableTransaction({
        state,
        candidateRegistrySet: options.officialRegistrySet,
        liveRegistryReference: getLiveContentRegistryReference(),
        writePersistentState: async() => {
          if (options.startupPersistentStateStore === null && options.electronDisableCommand === undefined) {
            throw new Error('Web disable requires startup persistent state storage')
          }
          if (options.electronDisableCommand !== undefined) {
            const electronResult = await options.electronDisableCommand({
              requestedCommandId: 'disable',
              targetPackageId: state.targetPackageId,
              selectedPackageIds: [],
              blockedPackageIds: [state.targetPackageId],
              loadOrder: [],
              packageFilesPreserved: true,
              record: disableRecord,
              startupSnapshot: createElectronDisableStartupSnapshot(state)
            })
            if (electronResult.status !== 'written') {
              throw new Error('Electron disable persistent state write was blocked')
            }
            return {
              settingsWritten: electronResult.settingsWritten,
              lockfileWritten: electronResult.lockfileWritten,
              startupStateWritten: electronResult.startupStateWritten,
              packageFilesPreserved: electronResult.packageFilesPreserved
            }
          }
          if (startupStore === null) {
            throw new Error('Web disable requires startup persistent state storage')
          }
          try {
            const writeResult = await options.settingsLockfileStore!.write(disableRecord)
            if (writeResult.status !== 'written') throw new Error('Web disable settings-lockfile write was blocked')
            await startupStore.put(startupSnapshotRecord)
            const writtenSettings = await options.settingsLockfileStore!.read()
            const writtenStartup = await startupStore.get(startupImportId)
            if (!matchesRecord(writtenSettings.record, disableRecord)
              || JSON.stringify(writtenStartup) !== JSON.stringify(startupSnapshotRecord)) {
              throw new Error('Web disable persistent state verification did not match')
            }
            return {
              settingsWritten: true,
              lockfileWritten: true,
              startupStateWritten: true,
              packageFilesPreserved: true
            }
          } catch (error) {
            try {
              await options.settingsLockfileStore!.write(verifiedInstalledRecord)
              if (previousStartupRecord === null) {
                await startupStore.delete(startupImportId)
              } else {
                await startupStore.put(previousStartupRecord)
              }
            } catch {
              // The transaction remains blocked; the next refresh will expose the persisted state.
            }
            throw error
          }
        },
        acknowledgeAppStartupHandoff: async() => options.mountedAppStartupEvidence?.() === true
      })
      lastResult.value = transaction
      reason.value = transaction.terminal.reason
      if (transaction.terminal.status === 'ready') {
        currentRecord.value = disableRecord
        rows.value = readPackageRows(disableRecord)
        status.value = 'ready'
      } else {
        await refresh()
        status.value = 'blocked'
      }
      return transaction
    } catch (error) {
      status.value = 'failed'
      reason.value = error instanceof Error ? error.message : 'Web installed package disable failed'
      return null
    }
  }

  const uninstall = async(
    packageId: PackageId
  ): Promise<ThirdPartyDataPackUninstallTransactionResult | null> => {
    if (status.value === 'loading') return null
    status.value = 'loading'
    reason.value = ''
    lastResult.value = null
    lastUninstallResult.value = null
    lastEnableResult.value = null

    let installedRecord: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null = null
    let previousStartupRecord: WebIndexedDbImportRecord | null = null
    let previousInstalledPackageRecord: WebIndexedDbImportRecord | null = null
    try {
      if (
        options.readElectronInstalledState === undefined
        && (options.settingsLockfileStore === null || options.installedPackageStore === null)
      ) {
        throw new Error('Web installed package uninstall requires persistent settings and package storage')
      }
      let packageFilesPreserved = false
      if (options.readElectronInstalledState !== undefined) {
        const electronResult = await options.readElectronInstalledState()
        if (electronResult.status === 'blocked') {
          throw new Error(electronResult.reason ?? 'Electron installed package state was blocked')
        }
        installedRecord = electronResult.record
        packageFilesPreserved = electronResult.packageFilesPreserved
      } else {
        const readResult = await options.settingsLockfileStore!.read()
        installedRecord = readResult.record
        previousInstalledPackageRecord = await options.installedPackageStore!.get(installedImportId)
        packageFilesPreserved = previousInstalledPackageRecord !== null
          && previousInstalledPackageRecord.files.length > 0
      }
      if (installedRecord === null || !isCurrentUninstallableRecord(installedRecord, packageId)) {
        throw new Error('Only an installed package can be uninstalled')
      }
      const verifiedInstalledRecord = installedRecord

      if (!packageFilesPreserved) {
        throw new Error('Installed package files are unavailable for uninstall removal')
      }

      if (options.startupPersistentStateStore !== null) {
        previousStartupRecord = await options.startupPersistentStateStore.get(startupImportId)
      }
      const startupStore = options.startupPersistentStateStore

      const state = buildThirdPartyDataPackUninstallState({
        officialRegistrySet: options.officialRegistrySet,
        installedDraft: verifiedInstalledRecord.lockfileDraft,
        targetPackageId: packageId
      })
      const startupSnapshotRecord = createUninstallStartupSnapshotRecord(state, startupImportId)
      const uninstallRecord = toUninstallRecord(state)
      const transaction = await executeThirdPartyDataPackUninstallTransaction({
        state,
        candidateRegistrySet: options.officialRegistrySet,
        liveRegistryReference: getLiveContentRegistryReference(),
        writePersistentState: async() => {
          if (options.startupPersistentStateStore === null && options.electronUninstallCommand === undefined) {
            throw new Error('Web uninstall requires startup persistent state storage')
          }
          if (options.electronUninstallCommand !== undefined) {
            const electronResult = await options.electronUninstallCommand({
              requestedCommandId: 'uninstall',
              targetPackageId: state.targetPackageId,
              selectedPackageIds: [],
              blockedPackageIds: [],
              loadOrder: [],
              packageFilesRemoved: true,
              record: uninstallRecord,
              startupSnapshot: createElectronUninstallStartupSnapshot(state)
            })
            if (electronResult.status !== 'written') {
              throw new Error('Electron uninstall persistent state write was blocked')
            }
            return {
              settingsWritten: electronResult.settingsWritten,
              lockfileWritten: electronResult.lockfileWritten,
              startupStateWritten: electronResult.startupStateWritten,
              packageFilesRemoved: electronResult.packageFilesRemoved
            }
          }
          if (startupStore === null) {
            throw new Error('Web uninstall requires startup persistent state storage')
          }
          try {
            const writeResult = await options.settingsLockfileStore!.write(uninstallRecord)
            if (writeResult.status !== 'written') throw new Error('Web uninstall settings-lockfile write was blocked')
            await options.installedPackageStore!.delete(installedImportId)
            await startupStore.put(startupSnapshotRecord)
            const writtenSettings = await options.settingsLockfileStore!.read()
            const writtenStartup = await startupStore.get(startupImportId)
            const removedPackageSource = await options.installedPackageStore!.get(installedImportId)
            if (!matchesRecord(writtenSettings.record, uninstallRecord)
              || removedPackageSource !== null
              || JSON.stringify(writtenStartup) !== JSON.stringify(startupSnapshotRecord)) {
              throw new Error('Web uninstall persistent state verification did not match')
            }
            return {
              settingsWritten: true,
              lockfileWritten: true,
              startupStateWritten: true,
              packageFilesRemoved: true
            }
          } catch (error) {
            try {
              await options.settingsLockfileStore!.write(verifiedInstalledRecord)
              if (previousInstalledPackageRecord !== null) {
                await options.installedPackageStore!.put(previousInstalledPackageRecord)
              }
              if (previousStartupRecord === null) {
                await startupStore.delete(startupImportId)
              } else {
                await startupStore.put(previousStartupRecord)
              }
            } catch {
              // The transaction remains blocked; the next refresh will expose the persisted state.
            }
            throw error
          }
        },
        acknowledgeAppStartupHandoff: async() => options.mountedAppStartupEvidence?.() === true
      })
      lastUninstallResult.value = transaction
      reason.value = transaction.terminal.reason
      if (transaction.terminal.status === 'ready') {
        currentRecord.value = uninstallRecord
        rows.value = readPackageRows(uninstallRecord)
        status.value = 'ready'
      } else {
        await refresh()
        status.value = 'blocked'
      }
      return transaction
    } catch (error) {
      status.value = 'failed'
      reason.value = error instanceof Error ? error.message : 'Web installed package uninstall failed'
      return null
    }
  }

  const enable = async(
    packageId: PackageId
  ): Promise<ThirdPartyDataPackEnableTransactionResult | null> => {
    if (status.value === 'loading') return null
    status.value = 'loading'
    reason.value = ''
    lastResult.value = null
    lastUninstallResult.value = null
    lastEnableResult.value = null

    let installedRecord: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null = null
    let previousStartupRecord: WebIndexedDbImportRecord | null = null
    try {
      if (
        options.readElectronInstalledState === undefined
        && (
          options.settingsLockfileStore === null
          || options.installedPackageStore === null
          || options.startupPersistentStateStore === null
        )
      ) {
        throw new Error('Web installed package enable requires persistent settings, package and startup storage')
      }
      if (options.readEnableMountInput === undefined) {
        throw new Error('Installed package enable requires restored package runtime input')
      }

      let packageFilesPreserved = false
      if (options.readElectronInstalledState !== undefined) {
        const electronResult = await options.readElectronInstalledState()
        if (electronResult.status === 'blocked') {
          throw new Error(electronResult.reason ?? 'Electron installed package state was blocked')
        }
        installedRecord = electronResult.record
        packageFilesPreserved = electronResult.packageFilesPreserved
      } else {
        const readResult = await options.settingsLockfileStore!.read()
        installedRecord = readResult.record
        packageFilesPreserved = await readPackageFilesPreserved(
          options.installedPackageStore,
          installedImportId
        )
      }
      if (installedRecord === null || !isCurrentDisabledRecord(installedRecord, packageId)) {
        throw new Error('Only a disabled installed package can be enabled')
      }
      const verifiedDisabledRecord = installedRecord

      if (!packageFilesPreserved) {
        throw new Error('Installed package files are unavailable for enable preservation')
      }

      const enabledMountInput = await options.readEnableMountInput(packageId)
      if (
        enabledMountInput === null
        || enabledMountInput.status !== 'ready'
        || enabledMountInput.candidateRegistrySet === undefined
      ) {
        throw new Error('Installed package files are unavailable for enable runtime publication')
      }

      if (options.startupPersistentStateStore !== null) {
        previousStartupRecord = await options.startupPersistentStateStore.get(startupImportId)
      }
      const startupStore = options.startupPersistentStateStore

      const state = buildThirdPartyDataPackEnableState({
        disabledDraft: verifiedDisabledRecord.lockfileDraft,
        enabledMountInput,
        targetPackageId: packageId
      })
      const startupSnapshotRecord = createEnableStartupSnapshotRecord(state, startupImportId)
      const enableRecord = toEnableRecord(state)
      const transaction = await executeThirdPartyDataPackEnableTransaction({
        state,
        candidateRegistrySet: enabledMountInput.candidateRegistrySet,
        liveRegistryReference: getLiveContentRegistryReference(),
        writePersistentState: async() => {
          if (options.startupPersistentStateStore === null && options.electronEnableCommand === undefined) {
            throw new Error('Web enable requires startup persistent state storage')
          }
          if (options.electronEnableCommand !== undefined) {
            const electronResult = await options.electronEnableCommand({
              requestedCommandId: 'enable',
              targetPackageId: state.targetPackageId,
              selectedPackageIds: [state.targetPackageId],
              blockedPackageIds: [],
              loadOrder: [state.targetPackageId],
              packageFilesPreserved: true,
              record: enableRecord,
              startupSnapshot: createElectronEnableStartupSnapshot(state)
            })
            if (electronResult.status !== 'written') {
              throw new Error('Electron enable persistent state write was blocked')
            }
            return {
              settingsWritten: electronResult.settingsWritten,
              lockfileWritten: electronResult.lockfileWritten,
              startupStateWritten: electronResult.startupStateWritten,
              packageFilesPreserved: electronResult.packageFilesPreserved
            }
          }
          if (startupStore === null) {
            throw new Error('Web enable requires startup persistent state storage')
          }
          try {
            const writeResult = await options.settingsLockfileStore!.write(enableRecord)
            if (writeResult.status !== 'written') throw new Error('Web enable settings-lockfile write was blocked')
            await startupStore.put(startupSnapshotRecord)
            const writtenSettings = await options.settingsLockfileStore!.read()
            const writtenStartup = await startupStore.get(startupImportId)
            const preservedPackageSource = await options.installedPackageStore!.get(installedImportId)
            if (!matchesRecord(writtenSettings.record, enableRecord)
              || JSON.stringify(writtenStartup) !== JSON.stringify(startupSnapshotRecord)
              || preservedPackageSource === null
              || preservedPackageSource.files.length === 0) {
              throw new Error('Web enable persistent state verification did not match')
            }
            return {
              settingsWritten: true,
              lockfileWritten: true,
              startupStateWritten: true,
              packageFilesPreserved: true
            }
          } catch (error) {
            try {
              await options.settingsLockfileStore!.write(verifiedDisabledRecord)
              if (previousStartupRecord === null) {
                await startupStore.delete(startupImportId)
              } else {
                await startupStore.put(previousStartupRecord)
              }
            } catch {
              // The transaction remains blocked; the next refresh will expose the persisted state.
            }
            throw error
          }
        },
        acknowledgeAppStartupHandoff: async() => options.mountedAppStartupEvidence?.() === true
      })
      lastEnableResult.value = transaction
      reason.value = transaction.terminal.reason
      if (transaction.terminal.status === 'ready') {
        currentRecord.value = enableRecord
        rows.value = readPackageRows(enableRecord)
        status.value = 'ready'
      } else {
        await refresh()
        status.value = 'blocked'
      }
      return transaction
    } catch (error) {
      status.value = 'failed'
      reason.value = error instanceof Error ? error.message : 'Web installed package enable failed'
      return null
    }
  }

  return {
    status,
    rows: computed(() => rows.value),
    currentRecord: computed(() => currentRecord.value),
    lastResult,
    lastUninstallResult,
    lastEnableResult,
    reason,
    refresh,
    disable,
    uninstall,
    enable
  }
}
