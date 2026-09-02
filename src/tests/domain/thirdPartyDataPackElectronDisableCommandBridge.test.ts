import { describe, expect, it, vi } from 'vitest'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  buildThirdPartyDataPackDisableState,
  createThirdPartyDataPackDisablePersistentRecord,
  createThirdPartyDataPackDisableStartupPersistentStateSnapshot
} from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import {
  createThirdPartyDataPackElectronDisableCommandMainHandler,
  createThirdPartyDataPackElectronDisableCommandRendererHost,
  thirdPartyDataPackElectronDisableCommandIpcChannel,
  type ThirdPartyDataPackElectronDisableCommandEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronDisableCommandBridge'
import { createThirdPartyDataPackModLockText } from '@/domain/mods/thirdPartyDataPackModLockFile'
import { createOfficialContentHash } from '@/domain/mods/officialPrecompiled'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'electron_disable_bridge_test_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createInstalledDraft = (): ThirdPartyDataPackLockfileDraft => {
  const officialSnapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: committedMetadata.artifactHash as Sha256Hash,
      contentHash: createOfficialContentHash(officialSnapshot),
      schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
      environmentHash: committedMetadata.environmentHash as Sha256Hash,
      snapshotHash: officialSnapshot.snapshotHash as Sha256Hash,
      registryCount: officialSnapshot.registries.length,
      entryCount: officialSnapshot.registries.reduce((count, registry) => count + registry.entries.length, 0)
    },
    candidateIdentity: {
      formatVersion: 1,
      contentHash: hash('a'),
      snapshotHash: hash('b'),
      candidateHash: hash('c')
    },
    registryCount: officialSnapshot.registries.length + 1,
    entryCount: officialSnapshot.registries.reduce((count, registry) => count + registry.entries.length, 0) + 1,
    selectedPackageIds: [packageId],
    loadOrder: [packageId],
    packages: [{
      packageId,
      version: '1.0.0',
      loadIndex: 0,
      source: {
        candidatePath: 'electron-disable-bridge-test-pack',
        manifestPath: 'electron-disable-bridge-test-pack/manifest.json',
        contentFiles: ['electron-disable-bridge-test-pack/data/items.json']
      },
      manifestHash: hash('d'),
      contentHash: hash('e'),
      configurationHash: hash('f'),
      resolvedDependencies: [],
      contentFiles: []
    }]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const createEnvelope = (): ThirdPartyDataPackElectronDisableCommandEnvelope => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const state = buildThirdPartyDataPackDisableState({
    officialRegistrySet,
    installedDraft: createInstalledDraft(),
    targetPackageId: packageId
  })
  return {
    requestedCommandId: 'disable',
    targetPackageId: packageId,
    selectedPackageIds: [],
    blockedPackageIds: [packageId],
    loadOrder: [],
    packageFilesPreserved: true,
    record: createThirdPartyDataPackDisablePersistentRecord('active', state),
    startupSnapshot: createThirdPartyDataPackDisableStartupPersistentStateSnapshot(
      state,
      'electron-startup-persistent-state-snapshot'
    )
  }
}

describe('third-party data-pack Electron disable command bridge', () => {
  it('accepts the ordinary renderer disable envelope at the main handler boundary', async() => {
    const envelope = createEnvelope()
    const writeDisabledState = vi.fn(async() => ({
      settingsWritten: true as const,
      lockfileWritten: true as const,
      startupStateWritten: true as const
    }))
    const mainHandler = createThirdPartyDataPackElectronDisableCommandMainHandler({
      writeDisabledState
    })

    const result = await mainHandler(envelope)

    expect(result.status, JSON.stringify(result)).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([])
    expect(result.blockedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([])
    expect(result.settingsWritten).toBe(true)
    expect(result.lockfileWritten).toBe(true)
    expect(result.startupStateWritten).toBe(true)
    expect(writeDisabledState).toHaveBeenCalledOnce()
    expect(writeDisabledState).toHaveBeenCalledWith(envelope)
  })

  it('builds a disable lockfile draft that passes mod-lock self-hash validation', () => {
    const envelope = createEnvelope()
    const text = createThirdPartyDataPackModLockText(envelope.record.lockfileDraft)
    const parsed = JSON.parse(text) as ThirdPartyDataPackLockfileDraft

    expect(parsed.selectedPackageIds).toEqual([])
    expect(parsed.loadOrder).toEqual([])
    expect(parsed.packages.map(pkg => pkg.packageId)).toEqual([packageId])
    expect(parsed.lockfileHash).toBe(envelope.record.lockfileHash)
  })

  it('round-trips a written main result through the renderer host', async() => {
    const envelope = createEnvelope()
    const mainHandler = createThirdPartyDataPackElectronDisableCommandMainHandler({
      writeDisabledState: vi.fn(async() => ({
        settingsWritten: true as const,
        lockfileWritten: true as const,
        startupStateWritten: true as const
      }))
    })
    const rendererHost = createThirdPartyDataPackElectronDisableCommandRendererHost({
      invoke: vi.fn(async(channel, payload) => {
        expect(channel).toBe(thirdPartyDataPackElectronDisableCommandIpcChannel)
        return await mainHandler(payload)
      })
    })

    const result = await rendererHost.disable(envelope)

    expect(result.status).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.packageFilesPreserved).toBe(true)
    expect(result.diagnostics).toEqual([])
  })

  it('blocks malformed renderer envelopes before writing disabled state', async() => {
    const writeDisabledState = vi.fn()
    const mainHandler = createThirdPartyDataPackElectronDisableCommandMainHandler({
      writeDisabledState
    })

    const result = await mainHandler({
      ...createEnvelope(),
      blockedPackageIds: []
    })

    expect(result.status).toBe('blocked')
    expect(result.diagnostics[0]?.stage).toBe('third-party.electron-disable-command.invalid-envelope')
    expect(writeDisabledState).not.toHaveBeenCalled()
  })
})
