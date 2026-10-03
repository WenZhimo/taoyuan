import { hashPayloadJson } from '@/domain/mods/hash'
import { type PackageId } from '@/domain/mods/ids'
import {
  createSaveContentEnvironment,
  type SaveContentEnvironment
} from '@/domain/save/saveContentEnvironment'
import { getCurrentSaveContentEnvironment } from '@/domain/save/saveContentEnvironmentRuntime'
import { useSaveStore } from '@/stores/useSaveStore'
import { encodeSaveData, parseSaveData } from '@/utils/saveCodec'
import { createSaveProductProbeData } from './saveProductProbeFixture'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const SAVE_META_KEY_PREFIX = 'taoyuanxiang_save_meta_'
const PROBE_SLOT = 0
const PROBE_PACKAGE_ID = 'save_migration_probe_pack' as PackageId

export type SaveMigrationProductProbeOperation =
  | 'official-forward'
  | 'third-party-failure'

export interface SaveMigrationProductProbeResult {
  readonly schemaVersion: 1
  readonly status: 'ready'
  readonly operation: SaveMigrationProductProbeOperation
  readonly sourceSlot: typeof PROBE_SLOT
  readonly loadSucceeded: boolean
  readonly loadRejected: boolean
  readonly sourceRewrittenWithCurrentEnvironment: boolean
  readonly sourceUnchanged: boolean
  readonly environmentMismatchPresented: boolean
  readonly targetRoute: string
  readonly currentEnvironmentHash: string
  readonly failureReason?: string
}

interface SaveMigrationProbeWindow extends Window {
  __TAOYUAN_SAVE_MIGRATION_PRODUCT_PROBE__?: SaveMigrationProductProbeResult
}

const cloneOfficialIdentity = (environment: SaveContentEnvironment) => ({
  gameVersion: environment.gameVersion,
  engineApiVersion: environment.engineApiVersion,
  contentSchemaVersion: environment.contentSchemaVersion,
  loaderVersion: environment.loaderVersion,
  contentCompilerVersion: environment.contentCompilerVersion,
  schemaSetHash: environment.schemaSetHash,
  cacheFormatVersion: environment.cacheFormatVersion,
  trustPolicyVersion: environment.trustPolicyVersion,
  packages: environment.packages.map(pkg => ({
    ...pkg,
    resolvedDependencies: [...pkg.resolvedDependencies]
  }))
})

const previousGameVersion = (version: string): string => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`unsupported probe game version: ${version}`)
  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3])
  if (patch > 0) return `${major}.${minor}.${patch - 1}`
  if (minor > 0) return `${major}.${minor - 1}.0`
  if (major > 0) return `${major - 1}.0.0`
  throw new Error(`cannot derive previous probe game version: ${version}`)
}

const createOfficialVersionEnvironment = (
  current: SaveContentEnvironment,
  gameVersion: string
): SaveContentEnvironment => createSaveContentEnvironment({
  ...cloneOfficialIdentity(current),
  gameVersion,
  packages: current.packages.map(pkg => ({ ...pkg, version: gameVersion }))
})

const createThirdPartyVersionEnvironment = (
  current: SaveContentEnvironment,
  packageVersion: string,
  contentMarker: string
): SaveContentEnvironment => createSaveContentEnvironment({
  ...cloneOfficialIdentity(current),
  packages: [
    current.packages[0]!,
    {
      id: PROBE_PACKAGE_ID,
      version: packageVersion,
      contentHash: hashPayloadJson(`${contentMarker}-content`),
      configurationHash: hashPayloadJson(`${contentMarker}-configuration`),
      loadIndex: 1,
      resolvedDependencies: []
    }
  ]
})

const readSource = async(): Promise<{
  readonly encoded: string | null
  readonly data: Record<string, any> | null
}> => {
  const encoded = localStorage.getItem(`${SAVE_KEY_PREFIX}${PROBE_SLOT}`)
  return {
    encoded,
    data: encoded === null ? null : await parseSaveData(encoded)
  }
}

export const prepareSaveMigrationProductProbe = async (
  operation: SaveMigrationProductProbeOperation
): Promise<void> => {
  if (typeof localStorage === 'undefined') {
    throw new Error('save migration probe requires localStorage')
  }
  const current = getCurrentSaveContentEnvironment()
  const environment = operation === 'official-forward'
    ? createOfficialVersionEnvironment(current, previousGameVersion(current.gameVersion))
    : createThirdPartyVersionEnvironment(current, '1.0.0', 'old')
  const encoded = await encodeSaveData(createSaveProductProbeData(environment, '迁移探针'))
  localStorage.setItem(`${SAVE_KEY_PREFIX}${PROBE_SLOT}`, encoded)
  localStorage.removeItem(`${SAVE_META_KEY_PREFIX}${PROBE_SLOT}`)
}

const delay = async(ms: number): Promise<void> => {
  await new Promise(resolve => window.setTimeout(resolve, ms))
}

const getCurrentRoute = (): string => {
  const hashRoute = window.location.hash.replace(/^#/, '')
  if (hashRoute === '') return '/'
  const queryStart = hashRoute.indexOf('?')
  return queryStart < 0 ? hashRoute : hashRoute.slice(0, queryStart)
}

const waitForCondition = async<T>(
  read: () => T | null | undefined | false,
  reason: string,
  timeoutMs = 15_000
): Promise<T> => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const value = read()
    if (value !== null && value !== undefined && value !== false) return value
    await delay(25)
  }
  throw new Error(reason)
}

export const runSaveMigrationProductProbe = async (
  operation: SaveMigrationProductProbeOperation
): Promise<SaveMigrationProductProbeResult> => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('save migration probe requires a browser window')
  }

  const before = await readSource()
  if (before.encoded === null || before.data === null) {
    throw new Error('save migration probe source slot is missing')
  }

  const loadButton = await waitForCondition(
    () => document.querySelector<HTMLButtonElement>('[data-testid="save-slot-0"]'),
    'save migration probe could not find the source slot button'
  )
  const currentStore = useSaveStore()

  if (operation === 'third-party-failure') {
    const current = getCurrentSaveContentEnvironment()
    const currentEnvironment = createThirdPartyVersionEnvironment(current, '1.1.0', 'new')
    if (!currentStore.setContentEnvironment(currentEnvironment)) {
      throw new Error('save migration probe could not install the current third-party environment')
    }
  }

  loadButton.click()

  let environmentMismatchPresented = false
  if (operation === 'third-party-failure') {
    await waitForCondition(
      () => document.querySelector<HTMLElement>('[data-testid="save-environment-mismatch-dialog"]'),
      'third-party migration probe did not present the environment mismatch guard'
    )
    environmentMismatchPresented = true
    const closeButton = await waitForCondition(
      () => document.querySelector<HTMLButtonElement>('[data-testid="save-environment-mismatch-close"]'),
      'third-party migration probe could not close the environment mismatch guard'
    )
    closeButton.click()

    // The visible load path deliberately stops before the incompatible in-place transaction.
    // Exercise that transaction only after proving the player-facing guard, so the probe also
    // verifies the package-migration rejection and source-slot protection beneath the UI.
    await currentStore.loadFromSlot(PROBE_SLOT)
  }

  if (operation === 'official-forward') {
    await waitForCondition(
      () => document.querySelector<HTMLButtonElement>('[data-testid="game-settings-button"]'),
      'save migration probe did not enter the game route after official migration'
    )
    const after = await readSource()
    const current = getCurrentSaveContentEnvironment()
    const sourceRewrittenWithCurrentEnvironment =
      after.data?.contentEnvironment?.environmentHash === current.environmentHash
      && after.data?.saveFormatVersion === 3
    if (!sourceRewrittenWithCurrentEnvironment) {
      throw new Error('official migration did not persist the current environment')
    }

    const result: SaveMigrationProductProbeResult = Object.freeze({
      schemaVersion: 1,
      status: 'ready',
      operation,
      sourceSlot: PROBE_SLOT,
      loadSucceeded: true,
      loadRejected: false,
      sourceRewrittenWithCurrentEnvironment: true,
      sourceUnchanged: false,
      environmentMismatchPresented,
      targetRoute: getCurrentRoute(),
      currentEnvironmentHash: current.environmentHash
    })
    Object.defineProperty(window as SaveMigrationProbeWindow, '__TAOYUAN_SAVE_MIGRATION_PRODUCT_PROBE__', {
      value: result,
      configurable: true
    })
    return result
  }

  const saveStore = useSaveStore()
  await waitForCondition(
    () => saveStore.lastOperationFailure !== null,
    'third-party migration probe load operation did not settle'
  )
  const after = await readSource()
  const failureReason = saveStore.lastOperationFailure?.reason
  const loadRejected = saveStore.lastOperationFailure?.operation === 'loading'
    && failureReason === 'package-migration'
  if (!loadRejected) throw new Error('third-party migration failure was not surfaced as package-migration')
  if (after.encoded !== before.encoded) throw new Error('third-party migration failure modified the source slot')

  const result: SaveMigrationProductProbeResult = Object.freeze({
    schemaVersion: 1,
    status: 'ready',
    operation,
    sourceSlot: PROBE_SLOT,
    loadSucceeded: false,
    loadRejected: true,
    sourceRewrittenWithCurrentEnvironment: false,
    sourceUnchanged: true,
    environmentMismatchPresented,
    targetRoute: getCurrentRoute(),
    currentEnvironmentHash: currentStore.contentEnvironment.environmentHash,
    failureReason
  })
  Object.defineProperty(window as SaveMigrationProbeWindow, '__TAOYUAN_SAVE_MIGRATION_PRODUCT_PROBE__', {
    value: result,
    configurable: true
  })
  return result
}
