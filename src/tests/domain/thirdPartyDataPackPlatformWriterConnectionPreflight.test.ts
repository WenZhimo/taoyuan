import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackSettingsLockfilePersistentWriterSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfilePersistentWriterSource'
import {
  createThirdPartyDataPackPlatformWriterConnectionPreflight,
  THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_MODE,
  ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError,
  type ThirdPartyDataPackPlatformWriterConnectionPreflightResult
} from '@/domain/mods/thirdPartyDataPackPlatformWriterConnectionPreflight'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const writerEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceEffectSummary => ({
  settingsLockfilePersistentWriterSourceCalled: true,
  settingsLockfileCommitSourceCalled: true,
  injectedSettingsLockfilePersistentWriterHostCalled: false,
  settingsLockfilePersistentWriterHostCalled: false,
  settingsLockfilePersistentWriterHostWritten: false,
  realSettingsLockfilePersistentWriterHostCalled: false,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const createPersistentWriterSource = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult => ({
  kind: 'third-party-settings-lockfile-persistent-writer-source',
  mode: 'default-disabled-settings-lockfile-persistent-writer-source',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  settingsLockfileCommitSourceStatus: 'skipped',
  packageFileStagingHostStatus: undefined,
  settingsLockfileCommitHostStatus: undefined,
  settingsLockfilePersistentWriterHostStatus: undefined,
  requestedCommandId: undefined,
  targetPackageId: undefined,
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'skipped',
    transactionLogWriteProbeStatus: 'skipped',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  diagnostics: [],
  effects: writerEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult)

const createWrittenPersistentWriterSource = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult => createPersistentWriterSource({
  status: 'written',
  reason: 'settings-lockfile persistent writer accepted an injected contained writer result',
  readOnly: false,
  settingsLockfileCommitSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
  settingsLockfilePersistentWriterHostStatus: 'written',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  effects: writerEffects({
    injectedSettingsLockfilePersistentWriterHostCalled: true,
    settingsLockfilePersistentWriterHostCalled: true,
    settingsLockfilePersistentWriterHostWritten: true,
    settingsWritten: true,
    lockfileWritten: true
  }),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealPlatformConnection = (
  result: ThirdPartyDataPackPlatformWriterConnectionPreflightResult,
  writesAcknowledged: boolean,
  continuationAllowed = true
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.realPlatformWriterHostCalled).toBe(false)
  expect(result.effects.electronPlatformWriterConnected).toBe(false)
  expect(result.effects.webPlatformWriterConnected).toBe(false)
  expect(result.effects.androidPlatformWriterConnected).toBe(false)
  expect(result.effects.settingsWritten).toBe(writesAcknowledged)
  expect(result.effects.lockfileWritten).toBe(writesAcknowledged)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party platform writer connection preflight', () => {
  it('is disabled by default and does not call the persistent writer source', async() => {
    const readSettingsLockfilePersistentWriterSource = vi.fn()
    const preflight = createThirdPartyDataPackPlatformWriterConnectionPreflight({
      readSettingsLockfilePersistentWriterSource
    })

    const result = await preflight()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readSettingsLockfilePersistentWriterSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.requirements.every(requirement => requirement.status === 'skipped')).toBe(true)
    expectNoRealPlatformConnection(result, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled persistent writer source reports skipped', async() => {
    const readSettingsLockfilePersistentWriterSource = vi.fn(async() => createPersistentWriterSource({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const preflight = createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: true,
      readSettingsLockfilePersistentWriterSource
    })

    const result = await preflight()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.requirements.every(requirement => requirement.status === 'skipped')).toBe(true)
    expect('settingsLockfilePersistentWriterSource' in result).toBe(false)
    expect('platformWriterHost' in result).toBe(false)
    expectNoRealPlatformConnection(result, false)
    expectJsonGraphFrozen(result)
  })

  it('defers real platform writer wiring after a safe persistent writer acknowledgement', async() => {
    const preflight = createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: true,
      readSettingsLockfilePersistentWriterSource: async() => createWrittenPersistentWriterSource()
    })

    const result = await preflight()

    expect(result.status).toBe('deferred')
    expect(result.readOnly).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.writeProbeEvidence).toEqual({
      modLockWriteProbeStatus: 'written',
      transactionLogWriteProbeStatus: 'written',
      modLockPersistentWriteExecuted: true,
      transactionLogPersistentWriteExecuted: true
    })
    expect(result.requirements).toEqual([
      expect.objectContaining({ platform: 'electron', status: 'required' }),
      expect.objectContaining({ platform: 'web', status: 'required' }),
      expect.objectContaining({
        platform: 'android',
        status: 'skipped',
        reason: expect.stringContaining('Android is vanilla-only')
      })
    ])
    expect(result.effects.upstreamSettingsLockfilePersistentWritesAcknowledged).toBe(true)
    expect(result.effects.platformWriterConnectionDeferred).toBe(true)
    expect('settingsLockfilePersistentWriterSource' in result).toBe(false)
    expect('electronPlatformWriter' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expectNoRealPlatformConnection(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe written sources without exposing path-bearing fields', async() => {
    const preflight = createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: true,
      readSettingsLockfilePersistentWriterSource: async() => createWrittenPersistentWriterSource({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.platform-writer-connection-preflight.upstream-path',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/mod-lock.json',
            recovery: 'retry'
          }
        ] as never,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: {
          ...writerEffects({
            injectedSettingsLockfilePersistentWriterHostCalled: true,
            settingsLockfilePersistentWriterHostCalled: true,
            settingsLockfilePersistentWriterHostWritten: true,
            settingsWritten: true,
            lockfileWritten: true
          }),
          cacheWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult>)
    })

    await expect(preflight()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError
    )

    try {
      await preflight()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError)
      const result = (error as ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('written')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.platform-writer-connection-preflight.upstream-path',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.platform-writer-connection-preflight.unsafe-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.platform-writer-connection-preflight.connection-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('mod-lock.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expectNoRealPlatformConnection(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing and throwing sources without leaking thrown details', async() => {
    const missingSource = createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: true,
      readSettingsLockfilePersistentWriterSource: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/platform-writer-source')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError)
      const result = (error as ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.platform-writer-connection-preflight.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealPlatformConnection(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package arrays from unsafe sources without reading hostile lengths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/platform-writer-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const preflight = createThirdPartyDataPackPlatformWriterConnectionPreflight({
      enabled: true,
      readSettingsLockfilePersistentWriterSource: async() => createPersistentWriterSource({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        electronPlatformWriter: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...writerEffects(),
          cacheWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult>)
    })

    try {
      await preflight()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError)
      const result = (error as ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.platform-writer-connection-preflight.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('platform-writer-selected-package-ids')
      expect('electronPlatformWriter' in result).toBe(false)
      expectNoRealPlatformConnection(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
