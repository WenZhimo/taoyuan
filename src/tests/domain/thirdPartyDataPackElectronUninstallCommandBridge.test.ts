import { describe, expect, it, vi } from 'vitest'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  buildThirdPartyDataPackUninstallState,
  createThirdPartyDataPackUninstallPersistentRecord,
  createThirdPartyDataPackUninstallStartupPersistentStateSnapshot
} from '@/domain/mods/thirdPartyDataPackUninstallTransaction'
import {
  createThirdPartyDataPackElectronUninstallCommandMainHandler,
  createThirdPartyDataPackElectronUninstallCommandRendererHost,
  thirdPartyDataPackElectronUninstallCommandIpcChannel,
  type ThirdPartyDataPackElectronUninstallCommandEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronUninstallCommandBridge'
import { createThirdPartyDataPackModLockText } from '@/domain/mods/thirdPartyDataPackModLockFile'
import { createOfficialContentHash } from '@/domain/mods/officialPrecompiled'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackElectronInstalledStateReadResult
} from '@/domain/mods/thirdPartyDataPackElectronInstalledStateBridge'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'electron_uninstall_bridge_test_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createOfficialIdentity = () => {
  const officialSnapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
  return {
    artifactHash: committedMetadata.artifactHash as Sha256Hash,
    contentHash: createOfficialContentHash(officialSnapshot),
    schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
    environmentHash: committedMetadata.environmentHash as Sha256Hash,
    snapshotHash: officialSnapshot.snapshotHash as Sha256Hash,
    registryCount: officialSnapshot.registries.length,
    entryCount: officialSnapshot.registries.reduce((count, registry) => count + registry.entries.length, 0)
  }
}

const createPackageRecord = () => ({
  packageId,
  version: '1.0.0',
  loadIndex: 0,
  source: {
    candidatePath: 'electron-uninstall-bridge-test-pack',
    manifestPath: 'electron-uninstall-bridge-test-pack/manifest.json',
    contentFiles: ['electron-uninstall-bridge-test-pack/data/items.json']
  },
  manifestHash: hash('d'),
  contentHash: hash('e'),
  configurationHash: hash('f'),
  resolvedDependencies: [],
  contentFiles: []
})

const createInstalledDraft = (): ThirdPartyDataPackLockfileDraft => {
  const officialIdentity = createOfficialIdentity()
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity,
    candidateIdentity: {
      formatVersion: 1,
      contentHash: hash('7'),
      snapshotHash: hash('8'),
      candidateHash: hash('9')
    },
    registryCount: officialIdentity.registryCount + 1,
    entryCount: officialIdentity.entryCount + 1,
    selectedPackageIds: [packageId],
    loadOrder: [packageId],
    packages: [createPackageRecord()]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const createDisabledDraft = (): ThirdPartyDataPackLockfileDraft => {
  const officialIdentity = createOfficialIdentity()
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity,
    candidateIdentity: {
      formatVersion: 1,
      contentHash: hash('a'),
      snapshotHash: hash('b'),
      candidateHash: hash('c')
    },
    registryCount: officialIdentity.registryCount,
    entryCount: officialIdentity.entryCount,
    selectedPackageIds: [],
    loadOrder: [],
    packages: [createPackageRecord()]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const createEnvelope = (
  installedDraft = createDisabledDraft()
): ThirdPartyDataPackElectronUninstallCommandEnvelope => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const state = buildThirdPartyDataPackUninstallState({
    officialRegistrySet,
    installedDraft,
    targetPackageId: packageId
  })
  return {
    requestedCommandId: 'uninstall',
    targetPackageId: packageId,
    selectedPackageIds: [],
    blockedPackageIds: [],
    loadOrder: [],
    packageFilesRemoved: true,
    record: createThirdPartyDataPackUninstallPersistentRecord('active', state),
    startupSnapshot: createThirdPartyDataPackUninstallStartupPersistentStateSnapshot(
      state,
      'electron-startup-persistent-state-snapshot'
    )
  }
}

const createCurrentDisabledState = (
  draft: ThirdPartyDataPackLockfileDraft
): ThirdPartyDataPackElectronInstalledStateReadResult => ({
  status: 'ready',
  record: {
    recordId: 'active',
    requestedCommandId: 'disable',
    targetPackageId: packageId,
    selectedPackageIds: [],
    blockedPackageIds: [packageId],
    loadOrder: [],
    candidateHash: draft.candidateIdentity.candidateHash,
    lockfileHash: draft.lockfileHash,
    lockfileDraft: draft
  },
  packageFilesPreserved: true
})

const createCurrentEnabledState = (
  draft: ThirdPartyDataPackLockfileDraft
): ThirdPartyDataPackElectronInstalledStateReadResult => ({
  status: 'ready',
  record: {
    recordId: 'active',
    requestedCommandId: 'install',
    targetPackageId: packageId,
    selectedPackageIds: [packageId],
    blockedPackageIds: [],
    loadOrder: [packageId],
    candidateHash: draft.candidateIdentity.candidateHash,
    lockfileHash: draft.lockfileHash,
    lockfileDraft: draft
  },
  packageFilesPreserved: true
})

describe('third-party data-pack Electron uninstall command bridge', () => {
  it('accepts the ordinary renderer uninstall envelope at the main handler boundary', async() => {
    const envelope = createEnvelope()
    const writeUninstalledState = vi.fn(async() => ({
      settingsWritten: true as const,
      lockfileWritten: true as const,
      startupStateWritten: true as const,
      packageFilesRemoved: true as const
    }))
    const mainHandler = createThirdPartyDataPackElectronUninstallCommandMainHandler({
      writeUninstalledState
    })

    const result = await mainHandler(envelope)

    expect(result.status, JSON.stringify(result)).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([])
    expect(result.settingsWritten).toBe(true)
    expect(result.lockfileWritten).toBe(true)
    expect(result.startupStateWritten).toBe(true)
    expect(result.packageFilesRemoved).toBe(true)
    expect(writeUninstalledState).toHaveBeenCalledOnce()
    expect(writeUninstalledState).toHaveBeenCalledWith(envelope)
  })

  it('accepts uninstall only after matching the current disabled installed state', async() => {
    const disabledDraft = createDisabledDraft()
    const envelope = createEnvelope(disabledDraft)
    const readCurrentInstalledState = vi.fn(async() =>
      createCurrentDisabledState(disabledDraft))
    const writeUninstalledState = vi.fn(async() => ({
      settingsWritten: true as const,
      lockfileWritten: true as const,
      startupStateWritten: true as const,
      packageFilesRemoved: true as const
    }))
    const mainHandler = createThirdPartyDataPackElectronUninstallCommandMainHandler({
      readCurrentInstalledState,
      writeUninstalledState
    })

    const result = await mainHandler(envelope)

    expect(result.status, JSON.stringify(result)).toBe('written')
    expect(readCurrentInstalledState).toHaveBeenCalledOnce()
    expect(writeUninstalledState).toHaveBeenCalledOnce()
    expect(writeUninstalledState).toHaveBeenCalledWith(envelope)
  })

  it('accepts uninstall after matching the current enabled installed state', async() => {
    const installedDraft = createInstalledDraft()
    const envelope = createEnvelope(installedDraft)
    const writeUninstalledState = vi.fn(async() => ({
      settingsWritten: true as const,
      lockfileWritten: true as const,
      startupStateWritten: true as const,
      packageFilesRemoved: true as const
    }))
    const mainHandler = createThirdPartyDataPackElectronUninstallCommandMainHandler({
      readCurrentInstalledState: vi.fn(async() =>
        createCurrentEnabledState(installedDraft)),
      writeUninstalledState
    })

    const result = await mainHandler(envelope)

    expect(result.status, JSON.stringify(result)).toBe('written')
    expect(writeUninstalledState).toHaveBeenCalledOnce()
  })

  it('blocks missing current packages before writing uninstalled state', async() => {
    const envelope = createEnvelope()
    const writeUninstalledState = vi.fn()
    const missingState: ThirdPartyDataPackElectronInstalledStateReadResult = {
      status: 'missing',
      record: null,
      packageFilesPreserved: false
    }
    const mainHandler = createThirdPartyDataPackElectronUninstallCommandMainHandler({
      readCurrentInstalledState: vi.fn(async() => missingState),
      writeUninstalledState
    })

    const result = await mainHandler(envelope)

    expect(result.status).toBe('blocked')
    expect(result.diagnostics[0]?.stage).toBe(
      'third-party.electron-uninstall-command.current-state-mismatch'
    )
    expect(writeUninstalledState).not.toHaveBeenCalled()
  })

  it('builds an uninstall lockfile draft that passes mod-lock self-hash validation', () => {
    const envelope = createEnvelope()
    const text = createThirdPartyDataPackModLockText(envelope.record.lockfileDraft)
    const parsed = JSON.parse(text) as ThirdPartyDataPackLockfileDraft

    expect(parsed.selectedPackageIds).toEqual([])
    expect(parsed.loadOrder).toEqual([])
    expect(parsed.packages).toEqual([])
    expect(parsed.lockfileHash).toBe(envelope.record.lockfileHash)
  })

  it('round-trips a written main result through the renderer host', async() => {
    const envelope = createEnvelope()
    const mainHandler = createThirdPartyDataPackElectronUninstallCommandMainHandler({
      writeUninstalledState: vi.fn(async() => ({
        settingsWritten: true as const,
        lockfileWritten: true as const,
        startupStateWritten: true as const,
        packageFilesRemoved: true as const
      }))
    })
    const rendererHost = createThirdPartyDataPackElectronUninstallCommandRendererHost({
      invoke: vi.fn(async(channel, payload) => {
        expect(channel).toBe(thirdPartyDataPackElectronUninstallCommandIpcChannel)
        return await mainHandler(payload)
      })
    })

    const result = await rendererHost.uninstall(envelope)

    expect(result.status).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.packageFilesRemoved).toBe(true)
    expect(result.diagnostics).toEqual([])
  })

  it('blocks malformed renderer envelopes before writing uninstalled state', async() => {
    const writeUninstalledState = vi.fn()
    const mainHandler = createThirdPartyDataPackElectronUninstallCommandMainHandler({
      writeUninstalledState
    })

    const result = await mainHandler({
      ...createEnvelope(),
      packageFilesRemoved: false
    })

    expect(result.status).toBe('blocked')
    expect(result.diagnostics[0]?.stage).toBe('third-party.electron-uninstall-command.invalid-envelope')
    expect(writeUninstalledState).not.toHaveBeenCalled()
  })
})
