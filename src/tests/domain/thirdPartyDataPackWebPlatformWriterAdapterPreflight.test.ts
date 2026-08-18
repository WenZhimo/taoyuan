import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPlatformWriterConnectionPreflightEffectSummary,
  ThirdPartyDataPackPlatformWriterConnectionPreflightResult,
  ThirdPartyDataPackPlatformWriterConnectionRequirement
} from '@/domain/mods/thirdPartyDataPackPlatformWriterConnectionPreflight'
import {
  createThirdPartyDataPackWebPlatformWriterAdapterPreflight,
  THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_ADAPTER_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_ADAPTER_PREFLIGHT_MODE,
  ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError,
  type ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackWebPlatformWriterAdapterPreflight'

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

const platformRequirements = (
  status: ThirdPartyDataPackPlatformWriterConnectionRequirement['status']
): ThirdPartyDataPackPlatformWriterConnectionRequirement[] => [
  {
    id: 'electron-settings-lockfile-platform-writer-connection',
    platform: 'electron',
    status,
    reason: 'electron writer connection test requirement'
  },
  {
    id: 'web-settings-lockfile-platform-writer-connection',
    platform: 'web',
    status,
    reason: 'web writer connection test requirement'
  },
  {
    id: 'android-settings-lockfile-platform-writer-connection',
    platform: 'android',
    status,
    reason: 'android writer connection test requirement'
  }
]

const connectionEffects = (
  overrides: Partial<ThirdPartyDataPackPlatformWriterConnectionPreflightEffectSummary> = {}
): ThirdPartyDataPackPlatformWriterConnectionPreflightEffectSummary => ({
  platformWriterConnectionPreflightCalled: true,
  settingsLockfilePersistentWriterSourceCalled: true,
  upstreamSettingsLockfilePersistentWritesAcknowledged: false,
  platformWriterConnectionDeferred: false,
  realPlatformWriterHostCalled: false,
  electronPlatformWriterConnected: false,
  webPlatformWriterConnected: false,
  androidPlatformWriterConnected: false,
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

const createConnectionResult = (
  overrides: Partial<ThirdPartyDataPackPlatformWriterConnectionPreflightResult> = {}
): ThirdPartyDataPackPlatformWriterConnectionPreflightResult => ({
  kind: 'third-party-platform-writer-connection-preflight',
  mode: 'default-disabled-platform-writer-connection-preflight',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  settingsLockfilePersistentWriterSourceStatus: 'skipped',
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
  checks: [],
  requirements: platformRequirements('skipped'),
  diagnostics: [],
  effects: connectionEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPlatformWriterConnectionPreflightResult)

const createDeferredConnectionResult = (
  overrides: Partial<ThirdPartyDataPackPlatformWriterConnectionPreflightResult> = {}
): ThirdPartyDataPackPlatformWriterConnectionPreflightResult => createConnectionResult({
  status: 'deferred',
  reason: 'platform writer connection requirements are ready and deferred',
  settingsLockfilePersistentWriterSourceStatus: 'written',
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
  requirements: platformRequirements('required'),
  effects: connectionEffects({
    upstreamSettingsLockfilePersistentWritesAcknowledged: true,
    platformWriterConnectionDeferred: true,
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

const expectNoRealWebWriter = (
  result: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult,
  writesAcknowledged: boolean,
  continuationAllowed = true
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.realWebPlatformWriterHostCalled).toBe(false)
  expect(result.effects.webPlatformWriterConnected).toBe(false)
  expect(result.effects.webIndexedDbStorageResolved).toBe(false)
  expect(result.effects.webStorageEnvelopeExposed).toBe(false)
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

describe('third-party Web platform writer adapter preflight', () => {
  it('is disabled by default and does not call the platform writer connection preflight', async() => {
    const readPlatformWriterConnectionPreflight = vi.fn()
    const preflight = createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      readPlatformWriterConnectionPreflight
    })

    const result = await preflight()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_ADAPTER_PREFLIGHT_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_ADAPTER_PREFLIGHT_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPlatformWriterConnectionPreflight).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.webRequirements.every(requirement => requirement.status === 'skipped')).toBe(true)
    expectNoRealWebWriter(result, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled platform writer connection preflight reports skipped', async() => {
    const readPlatformWriterConnectionPreflight = vi.fn(async() => createConnectionResult({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const preflight = createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      enabled: true,
      readPlatformWriterConnectionPreflight
    })

    const result = await preflight()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(result.platformWriterConnectionPreflightStatus).toBe('skipped')
    expect(result.webConnectionRequirementStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.webRequirements.every(requirement => requirement.status === 'skipped')).toBe(true)
    expect(readPlatformWriterConnectionPreflight).toHaveBeenCalledOnce()
    expect('platformWriterConnectionPreflight' in result).toBe(false)
    expect('webPlatformWriterHost' in result).toBe(false)
    expectNoRealWebWriter(result, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts deferred Web writer requirements while keeping real Web wiring disabled', async() => {
    const preflight = createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      enabled: true,
      readPlatformWriterConnectionPreflight: async() => createDeferredConnectionResult()
    })

    const result = await preflight()

    expect(result.status).toBe('ready')
    expect(result.readOnly).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.platformWriterConnectionPreflightStatus).toBe('deferred')
    expect(result.webConnectionRequirementStatus).toBe('required')
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
    expect(result.upstreamRequirements).toEqual([
      expect.objectContaining({ platform: 'electron', status: 'required' }),
      expect.objectContaining({ platform: 'web', status: 'required' }),
      expect.objectContaining({ platform: 'android', status: 'required' })
    ])
    expect(result.webRequirements.map(requirement => ({
      id: requirement.id,
      status: requirement.status
    }))).toEqual([
      { id: 'web-indexeddb-userdata-root', status: 'required' },
      { id: 'web-mod-lock-indexeddb-atomic-writer', status: 'required' },
      { id: 'web-settings-indexeddb-atomic-writer', status: 'required' },
      { id: 'web-path-free-storage-command-envelope', status: 'required' }
    ])
    expect(result.effects.upstreamPlatformWriterConnectionReady).toBe(true)
    expect(result.effects.webPlatformWriterAdapterReady).toBe(true)
    expect('platformWriterConnectionPreflight' in result).toBe(false)
    expect('webPlatformWriterHost' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expect('indexedDB' in result).toBe(false)
    expectNoRealWebWriter(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing and throwing sources without leaking thrown details', async() => {
    const missingSource = createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      enabled: true,
      readPlatformWriterConnectionPreflight: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/taoyuan/userdata/web-writer')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError)
      const result = (error as ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-adapter-preflight.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealWebWriter(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe path-bearing upstream connection preflights without exposing paths', async() => {
    const preflight = createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      enabled: true,
      readPlatformWriterConnectionPreflight: async() => createDeferredConnectionResult({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.web-platform-writer-adapter-preflight.upstream-path',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/mod-lock.json',
            recovery: 'retry'
          }
        ] as never,
        indexedDB: {
          name: 'taoyuan-mod-storage'
        },
        effects: {
          ...connectionEffects({
            upstreamSettingsLockfilePersistentWritesAcknowledged: true,
            platformWriterConnectionDeferred: true,
            settingsWritten: true,
            lockfileWritten: true
          }),
          cacheWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackPlatformWriterConnectionPreflightResult>)
    })

    await expect(preflight()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError
    )

    try {
      await preflight()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError)
      const result = (error as ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.platformWriterConnectionPreflightStatus).toBe('deferred')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-adapter-preflight.upstream-path',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-adapter-preflight.unsafe-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-adapter-preflight.connection-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('mod-lock.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(serialized).not.toContain('indexedDB')
      expect(serialized).not.toContain('taoyuan-mod-storage')
      expectNoRealWebWriter(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe sources and copies package arrays without reading hostile lengths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/web-writer-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const preflight = createThirdPartyDataPackWebPlatformWriterAdapterPreflight({
      enabled: true,
      readPlatformWriterConnectionPreflight: async() => createConnectionResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        browserStorage: {
          localStorage: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...connectionEffects(),
          cacheWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackPlatformWriterConnectionPreflightResult>)
    })

    try {
      await preflight()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError)
      const result = (error as ThirdPartyDataPackWebPlatformWriterAdapterPreflightBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-platform-writer-adapter-preflight.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('web-writer-selected-package-ids')
      expect('browserStorage' in result).toBe(false)
      expectNoRealWebWriter(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
