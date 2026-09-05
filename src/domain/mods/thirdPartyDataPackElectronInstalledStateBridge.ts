import { isPackageId, type PackageId } from './ids'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
import type { ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord } from './thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'

export const thirdPartyDataPackElectronInstalledStateReadIpcChannel =
  'third-party-data-pack-installed-state-read'

export interface ThirdPartyDataPackElectronInstalledStateReadResult {
  readonly status: 'ready' | 'missing' | 'blocked'
  readonly record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null
  readonly packageFilesPreserved: boolean
  readonly reason?: string
}

export interface ThirdPartyDataPackElectronInstalledStateReadBridge {
  readonly invoke: (
    channel: typeof thirdPartyDataPackElectronInstalledStateReadIpcChannel
  ) => Promise<unknown> | unknown
}

export interface CreateThirdPartyDataPackElectronInstalledStateReadMainHandlerOptions {
  readonly readInstalledState: () => Promise<unknown> | unknown
}

const readOwnDataField = (value: unknown, fieldName: string): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  try {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
    return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

const readOwnStringField = (value: unknown, fieldName: string): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const isHash = (value: unknown): value is `sha256:${string}` =>
  typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value)

const clonePackageIds = (value: unknown): readonly PackageId[] | undefined => {
  if (!Array.isArray(value) || value.some(packageId => !isPackageId(packageId))) return undefined
  return Object.freeze([...value]) as readonly PackageId[]
}

const isRelativePackagePath = (value: unknown): value is string =>
  typeof value === 'string'
  && value.length > 0
  && !value.includes('\\')
  && !value.startsWith('/')
  && !/^[A-Za-z]:/.test(value)
  && !value.split('/').includes('..')

const isLockfileDraft = (value: unknown): value is ThirdPartyDataPackLockfileDraft => {
  if (value === null || typeof value !== 'object') return false
  const draft = value as object
  const packages = readOwnDataField(draft, 'packages')
  const candidateIdentity = readOwnDataField(draft, 'candidateIdentity')
  if (
    readOwnDataField(draft, 'formatVersion') !== 1
    || readOwnStringField(draft, 'kind') !== 'third-party-data-pack-lockfile-draft'
    || !isHash(readOwnStringField(draft, 'lockfileHash'))
    || !Array.isArray(packages)
    || candidateIdentity === null
    || typeof candidateIdentity !== 'object'
    || !isHash(readOwnStringField(candidateIdentity, 'candidateHash'))
    || clonePackageIds(readOwnDataField(draft, 'selectedPackageIds')) === undefined
    || clonePackageIds(readOwnDataField(draft, 'loadOrder')) === undefined
  ) return false

  return packages.every(currentPackage => {
    if (currentPackage === null || typeof currentPackage !== 'object') return false
    const source = readOwnDataField(currentPackage, 'source')
    return isPackageId(readOwnStringField(currentPackage, 'packageId'))
      && typeof readOwnStringField(currentPackage, 'version') === 'string'
      && source !== null
      && typeof source === 'object'
      && isRelativePackagePath(readOwnStringField(source, 'candidatePath'))
      && isRelativePackagePath(readOwnStringField(source, 'manifestPath'))
      && Array.isArray(readOwnDataField(source, 'contentFiles'))
      && (readOwnDataField(source, 'contentFiles') as unknown[]).every(isRelativePackagePath)
  })
}

const cloneDraft = (value: ThirdPartyDataPackLockfileDraft): ThirdPartyDataPackLockfileDraft =>
  JSON.parse(JSON.stringify(value)) as ThirdPartyDataPackLockfileDraft

const normalizeRecord = (
  value: unknown
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null => {
  if (value === null || typeof value !== 'object') return null
  const record = value as object
  const requestedCommandId = readOwnStringField(record, 'requestedCommandId')
  const targetPackageId = readOwnStringField(record, 'targetPackageId')
  const selectedPackageIds = clonePackageIds(readOwnDataField(record, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(record, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(record, 'loadOrder'))
  const lockfileDraft = readOwnDataField(record, 'lockfileDraft')
  const candidateHash = readOwnStringField(record, 'candidateHash')
  const lockfileHash = readOwnStringField(record, 'lockfileHash')
  if (
    readOwnStringField(record, 'recordId') !== 'active'
    || (
      requestedCommandId !== 'install'
      && requestedCommandId !== 'enable'
      && requestedCommandId !== 'disable'
      && requestedCommandId !== 'uninstall'
    )
    || !isPackageId(targetPackageId)
    || selectedPackageIds === undefined
    || blockedPackageIds === undefined
    || loadOrder === undefined
    || !isHash(candidateHash)
    || !isHash(lockfileHash)
    || !isLockfileDraft(lockfileDraft)
  ) return null

  return Object.freeze({
    recordId: 'active',
    requestedCommandId,
    targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    candidateHash,
    lockfileHash,
    lockfileDraft: cloneDraft(lockfileDraft)
  }) as ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord
}

const normalizeResult = (value: unknown): ThirdPartyDataPackElectronInstalledStateReadResult => {
  const status = readOwnStringField(value, 'status')
  const record = normalizeRecord(readOwnDataField(value, 'record'))
  const packageFilesPreserved = readOwnDataField(value, 'packageFilesPreserved') === true
  const reason = readOwnStringField(value, 'reason')
  if (status === 'missing') {
    return Object.freeze({
      status: 'missing',
      record: null,
      packageFilesPreserved: false,
      ...(reason === undefined ? {} : { reason })
    })
  }
  if (
    status === 'ready'
    && record !== null
    && (packageFilesPreserved || record.requestedCommandId === 'uninstall')
  ) {
    return Object.freeze({
      status: 'ready',
      record,
      packageFilesPreserved
    })
  }
  return Object.freeze({
    status: 'blocked',
    record: null,
    packageFilesPreserved: false,
    reason: reason ?? 'Electron installed data-pack state was not a valid managed record'
  })
}

export const createThirdPartyDataPackElectronInstalledStateRendererHost = (
  bridge: ThirdPartyDataPackElectronInstalledStateReadBridge
) => Object.freeze({
  read: async(): Promise<ThirdPartyDataPackElectronInstalledStateReadResult> =>
    normalizeResult(await bridge.invoke(thirdPartyDataPackElectronInstalledStateReadIpcChannel))
})

export const createThirdPartyDataPackElectronInstalledStateReadMainHandler = (
  options: CreateThirdPartyDataPackElectronInstalledStateReadMainHandlerOptions
) => async(): Promise<ThirdPartyDataPackElectronInstalledStateReadResult> => {
  try {
    return normalizeResult(await options.readInstalledState())
  } catch {
    return Object.freeze({
      status: 'blocked',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack state could not be read'
    })
  }
}
