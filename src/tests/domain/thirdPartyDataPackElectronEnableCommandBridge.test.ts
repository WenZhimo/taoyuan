import { describe, expect, it, vi } from 'vitest'
import {
  createDiscoveryFileSystemFromContentPackageSource,
  createMemoryContentPackageSource
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildThirdPartyDataPackMountInput } from '@/domain/mods/thirdPartyDataPackMountInput'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { buildThirdPartyDataPackDisableState } from '@/domain/mods/thirdPartyDataPackDisableTransaction'
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

type JsonObject = Record<string, unknown>

const packageId = 'electron_enable_bridge_test_pack' as PackageId
const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Electron Enable Bridge Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
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

const createMountInput = async(): Promise<ThirdPartyDataPackMountInputResult> => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const source = createMemoryContentPackageSource({
    sourceId: 'memory/electron-enable-bridge-test',
    rootPath: 'packs',
    files: [
      { path: 'electron-enable-bridge-test-pack/manifest.json', text: toJson(createManifest()) },
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

const createEnvelope = async(): Promise<ThirdPartyDataPackElectronEnableCommandEnvelope> => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const enabledMountInput = await createMountInput()
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
    selectedPackageIds: [packageId],
    blockedPackageIds: [],
    loadOrder: [packageId],
    packageFilesPreserved: true,
    record: createThirdPartyDataPackEnablePersistentRecord('active', state),
    startupSnapshot: createThirdPartyDataPackEnableStartupPersistentStateSnapshot(
      state,
      'electron-startup-persistent-state-snapshot'
    )
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
