import { describe, expect, it, vi } from 'vitest'
import {
  createDiscoveryFileSystemFromContentPackageSource,
  createMemoryContentPackageSource
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildThirdPartyDataPackMountInput } from '@/domain/mods/thirdPartyDataPackMountInput'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  buildThirdPartyDataPackDisableState,
  createThirdPartyDataPackDisablePersistentRecord
} from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import {
  buildThirdPartyDataPackEnableState,
  createThirdPartyDataPackEnablePersistentRecord,
  createThirdPartyDataPackEnableStartupPersistentStateSnapshot
} from '@/domain/mods/thirdPartyDataPackEnableTransaction'
import {
  createThirdPartyDataPackElectronEnableCommandMainHandler,
  createThirdPartyDataPackElectronEnableCommandRendererHost,
  thirdPartyDataPackElectronEnableCommandIpcChannel,
  type ThirdPartyDataPackElectronEnableCommandEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronEnableCommandBridge'
import { createThirdPartyDataPackModLockText } from '@/domain/mods/thirdPartyDataPackModLockFile'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackMountInputResult } from '@/domain/mods/thirdPartyDataPackMountInput'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackElectronInstalledStateReadResult
} from '@/domain/mods/thirdPartyDataPackElectronInstalledStateBridge'

type JsonObject = Record<string, unknown>

const packageId = 'electron_enable_bridge_test_pack' as PackageId
const dependencyPackageId = 'a_electron_enable_bridge_library' as PackageId
const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (
  id: PackageId = packageId,
  dependencies: readonly JsonObject[] = []
): JsonObject => ({
  id,
  name: { key: `${id}.package.name`, fallback: id },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Electron Enable Bridge Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [...dependencies],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (): JsonObject => ({
  id: `${packageId}:linen_ribbon`,
  name: { key: `${packageId}.linen_ribbon.name`, fallback: 'Electron Enable Bridge Linen Ribbon' },
  category: 'gift',
  description: {
    key: `${packageId}.linen_ribbon.description`,
    fallback: 'Synthetic item for Electron enable bridge tests.'
  },
  sellPrice: 8,
  edible: false
})

const createDependencyItem = (): JsonObject => ({
  id: `${dependencyPackageId}:library_token`,
  name: {
    key: `${dependencyPackageId}.library_token.name`,
    fallback: 'Electron Enable Bridge Library Token'
  },
  category: 'gift',
  description: {
    key: `${dependencyPackageId}.library_token.description`,
    fallback: 'Synthetic dependency item for Electron enable bridge tests.'
  },
  sellPrice: 6,
  edible: false
})

const createMountInput = async(
  includeDependency = false
): Promise<ThirdPartyDataPackMountInputResult> => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const source = createMemoryContentPackageSource({
    sourceId: 'memory/electron-enable-bridge-test',
    rootPath: 'packs',
    files: [
      ...(includeDependency
        ? [
            {
              path: 'a-electron-enable-bridge-library/manifest.json',
              text: toJson(createManifest(dependencyPackageId))
            },
            { path: 'a-electron-enable-bridge-library/locales/zh-CN.json', text: '{}\n' },
            {
              path: 'a-electron-enable-bridge-library/data/items.json',
              text: toJson([createDependencyItem()])
            }
          ]
        : []),
      {
        path: 'electron-enable-bridge-test-pack/manifest.json',
        text: toJson(createManifest(
          packageId,
          includeDependency ? [{ id: dependencyPackageId, version: '1.0.0' }] : []
        ))
      },
      { path: 'electron-enable-bridge-test-pack/locales/zh-CN.json', text: '{}\n' },
      { path: 'electron-enable-bridge-test-pack/data/items.json', text: toJson([createItem()]) }
    ]
  })
  const discoveryReport = await discoverThirdPartyDataPacks(
    source.identity.rootPath,
    createDiscoveryFileSystemFromContentPackageSource(source)
  )
  return buildThirdPartyDataPackMountInput({
    officialRegistrySet,
    discoveryReport
  })
}

const createEnvelope = async(
  includeDependency = false
): Promise<ThirdPartyDataPackElectronEnableCommandEnvelope> => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const enabledMountInput = await createMountInput(includeDependency)
  const disabledState = buildThirdPartyDataPackDisableState({
    officialRegistrySet,
    installedDraft: enabledMountInput.lockfileDraft!,
    targetPackageId: packageId
  })
  const state = buildThirdPartyDataPackEnableState({
    disabledDraft: disabledState.lockfileDraft,
    enabledMountInput,
    targetPackageId: packageId
  })
  return {
    requestedCommandId: 'enable',
    targetPackageId: packageId,
    selectedPackageIds: [...state.selectedPackageIds],
    blockedPackageIds: [],
    loadOrder: [...state.loadOrder],
    packageFilesPreserved: true,
    record: createThirdPartyDataPackEnablePersistentRecord('active', state),
    startupSnapshot: createThirdPartyDataPackEnableStartupPersistentStateSnapshot(
      state,
      'electron-startup-persistent-state-snapshot'
    )
  }
}

const createCurrentDisabledState = (
  envelope: ThirdPartyDataPackElectronEnableCommandEnvelope
): ThirdPartyDataPackElectronInstalledStateReadResult => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const disabledState = buildThirdPartyDataPackDisableState({
    officialRegistrySet,
    installedDraft: envelope.record.lockfileDraft,
    targetPackageId: packageId
  })
  return {
    status: 'ready',
    record: {
      ...createThirdPartyDataPackDisablePersistentRecord('active', disabledState),
      recordId: 'active' as const
    },
    packageFilesPreserved: true
  }
}

describe('third-party data-pack Electron enable command bridge', () => {
  it('accepts the ordinary renderer enable envelope at the main handler boundary', async() => {
    const envelope = await createEnvelope()
    const writeEnabledState = vi.fn(async() => ({
      settingsWritten: true as const,
      lockfileWritten: true as const,
      startupStateWritten: true as const
    }))
    const mainHandler = createThirdPartyDataPackElectronEnableCommandMainHandler({
      writeEnabledState
    })

    const result = await mainHandler(envelope)

    expect(result.status, JSON.stringify(result)).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.settingsWritten).toBe(true)
    expect(result.lockfileWritten).toBe(true)
    expect(result.startupStateWritten).toBe(true)
    expect(result.packageFilesPreserved).toBe(true)
    expect(writeEnabledState).toHaveBeenCalledOnce()
    expect(writeEnabledState).toHaveBeenCalledWith(envelope)
  })

  it('accepts enable only after matching the current disabled installed state', async() => {
    const envelope = await createEnvelope(true)
    const readCurrentInstalledState = vi.fn(async() =>
      createCurrentDisabledState(envelope))
    const writeEnabledState = vi.fn(async() => ({
      settingsWritten: true as const,
      lockfileWritten: true as const,
      startupStateWritten: true as const
    }))
    const mainHandler = createThirdPartyDataPackElectronEnableCommandMainHandler({
      readCurrentInstalledState,
      writeEnabledState
    })

    const result = await mainHandler(envelope)

    expect(result.status, JSON.stringify(result)).toBe('written')
    expect(readCurrentInstalledState).toHaveBeenCalledOnce()
    expect(writeEnabledState).toHaveBeenCalledOnce()
    expect(writeEnabledState).toHaveBeenCalledWith(envelope)
  })

  it('blocks stale renderer enable envelopes before writing enabled state', async() => {
    const envelope = await createEnvelope()
    const writeEnabledState = vi.fn()
    const alreadyEnabledState: ThirdPartyDataPackElectronInstalledStateReadResult = {
      status: 'ready',
      record: {
        ...envelope.record,
        recordId: 'active'
      },
      packageFilesPreserved: true
    }
    const mainHandler = createThirdPartyDataPackElectronEnableCommandMainHandler({
      readCurrentInstalledState: vi.fn(async() => alreadyEnabledState),
      writeEnabledState
    })

    const result = await mainHandler(envelope)

    expect(result.status).toBe('blocked')
    expect(result.diagnostics[0]?.stage).toBe(
      'third-party.electron-enable-command.current-state-mismatch'
    )
    expect(writeEnabledState).not.toHaveBeenCalled()
  })

  it('preserves dependency-first enable envelopes at the main handler boundary', async() => {
    const envelope = await createEnvelope(true)
    const writeEnabledState = vi.fn(async() => ({
      settingsWritten: true as const,
      lockfileWritten: true as const,
      startupStateWritten: true as const
    }))
    const mainHandler = createThirdPartyDataPackElectronEnableCommandMainHandler({
      writeEnabledState
    })

    const result = await mainHandler(envelope)

    expect(result.status, JSON.stringify(result)).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([dependencyPackageId, packageId])
    expect(result.loadOrder).toEqual([dependencyPackageId, packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(envelope.record.lockfileDraft.packages.map(pkg => pkg.packageId))
      .toEqual([dependencyPackageId, packageId])
    expect(envelope.record.lockfileDraft.packages[1]?.resolvedDependencies)
      .toEqual([dependencyPackageId])
    expect(writeEnabledState).toHaveBeenCalledWith(envelope)
  })

  it('builds an enable lockfile draft that passes mod-lock self-hash validation', async() => {
    const envelope = await createEnvelope()
    const text = createThirdPartyDataPackModLockText(envelope.record.lockfileDraft)
    const parsed = JSON.parse(text) as ThirdPartyDataPackLockfileDraft

    expect(parsed.selectedPackageIds).toEqual([packageId])
    expect(parsed.loadOrder).toEqual([packageId])
    expect(parsed.packages.map(pkg => pkg.packageId)).toEqual([packageId])
    expect(parsed.lockfileHash).toBe(envelope.record.lockfileHash)
  })

  it('round-trips a written main result through the renderer host', async() => {
    const envelope = await createEnvelope()
    const mainHandler = createThirdPartyDataPackElectronEnableCommandMainHandler({
      writeEnabledState: vi.fn(async() => ({
        settingsWritten: true as const,
        lockfileWritten: true as const,
        startupStateWritten: true as const
      }))
    })
    const rendererHost = createThirdPartyDataPackElectronEnableCommandRendererHost({
      invoke: vi.fn(async(channel, payload) => {
        expect(channel).toBe(thirdPartyDataPackElectronEnableCommandIpcChannel)
        return await mainHandler(payload)
      })
    })

    const result = await rendererHost.enable(envelope)

    expect(result.status).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.packageFilesPreserved).toBe(true)
    expect(result.diagnostics).toEqual([])
  })

  it('blocks malformed renderer envelopes before writing enabled state', async() => {
    const writeEnabledState = vi.fn()
    const mainHandler = createThirdPartyDataPackElectronEnableCommandMainHandler({
      writeEnabledState
    })

    const result = await mainHandler({
      ...await createEnvelope(),
      selectedPackageIds: []
    })

    expect(result.status).toBe('blocked')
    expect(result.diagnostics[0]?.stage).toBe('third-party.electron-enable-command.invalid-envelope')
    expect(writeEnabledState).not.toHaveBeenCalled()
  })
})
