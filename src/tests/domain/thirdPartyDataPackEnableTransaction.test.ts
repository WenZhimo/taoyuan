import { describe, expect, it, vi } from 'vitest'
import {
  createDiscoveryFileSystemFromContentPackageSource,
  createMemoryContentPackageSource
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildThirdPartyDataPackMountInput } from '@/domain/mods/thirdPartyDataPackMountInput'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { createThirdPartyDataPackInMemoryLiveRegistryReference } from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import { buildThirdPartyDataPackDisableState } from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import {
  buildThirdPartyDataPackEnableState,
  executeThirdPartyDataPackEnableTransaction
} from '@/domain/mods/thirdPartyDataPackEnableTransaction'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackMountInputResult } from '@/domain/mods/thirdPartyDataPackMountInput'

type JsonObject = Record<string, unknown>

const packageId = 'enable_transaction_test_pack' as PackageId
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
  authors: [{ name: 'Enable Transaction Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (): JsonObject => ({
  id: `${packageId}:linen_ribbon`,
  name: { key: `${packageId}.linen_ribbon.name`, fallback: 'Enable Transaction Linen Ribbon' },
  category: 'gift',
  description: {
    key: `${packageId}.linen_ribbon.description`,
    fallback: 'Synthetic item for enable transaction tests.'
  },
  sellPrice: 8,
  edible: false
})

const createMountInput = async(): Promise<ThirdPartyDataPackMountInputResult> => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  officialRegistrySet.freezeEntries()
  const source = createMemoryContentPackageSource({
    sourceId: 'memory/enable-transaction-test',
    rootPath: 'packs',
    files: [
      { path: 'enable-transaction-test-pack/manifest.json', text: toJson(createManifest()) },
      { path: 'enable-transaction-test-pack/locales/zh-CN.json', text: '{}\n' },
      { path: 'enable-transaction-test-pack/data/items.json', text: toJson([createItem()]) }
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

describe('third-party data-pack enable transaction', () => {
  it('publishes a disabled installed package back into the runtime registry', async() => {
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    const enabledMountInput = await createMountInput()
    expect(enabledMountInput.status).toBe('ready')
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
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )
    const writePersistentState = vi.fn(async() => ({
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true,
      packageFilesPreserved: true
    }))
    const acknowledgeAppStartupHandoff = vi.fn(async() => true)

    const result = await executeThirdPartyDataPackEnableTransaction({
      state,
      candidateRegistrySet: enabledMountInput.candidateRegistrySet!,
      liveRegistryReference,
      writePersistentState,
      acknowledgeAppStartupHandoff
    })

    expect(result.terminal.status, JSON.stringify(result)).toBe('ready')
    expect(result.terminal.requestedCommandId).toBe('enable')
    expect(result.terminal.selectedPackageIds).toEqual([packageId])
    expect(result.terminal.blockedPackageIds).toEqual([])
    expect(result.terminal.loadOrder).toEqual([packageId])
    expect(result.terminal.settingsWritten).toBe(true)
    expect(result.terminal.lockfileWritten).toBe(true)
    expect(result.terminal.startupStateWritten).toBe(true)
    expect(result.terminal.packageFilesPreserved).toBe(true)
    expect(result.terminal.runtimePublicationIncluded).toBe(true)
    expect(result.terminal.liveRegistrySwapped).toBe(true)
    expect(result.terminal.appStartupHandoffAccepted).toBe(true)
    expect(result.runtimePublicationCommit?.status).toBe('accepted')
    expect(result.liveRegistrySwap?.status).toBe('swapped')
    expect(liveRegistryReference.current).toBe(enabledMountInput.candidateRegistrySet)
    expect(writePersistentState).toHaveBeenCalledOnce()
    expect(acknowledgeAppStartupHandoff).toHaveBeenCalledOnce()
  })

  it('blocks before runtime publication when enable persistence is incomplete', async() => {
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
    const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
      officialRegistrySet
    )
    const acknowledgeAppStartupHandoff = vi.fn(async() => true)

    const result = await executeThirdPartyDataPackEnableTransaction({
      state,
      candidateRegistrySet: enabledMountInput.candidateRegistrySet!,
      liveRegistryReference,
      writePersistentState: async() => ({
        settingsWritten: true,
        lockfileWritten: true,
        startupStateWritten: true,
        packageFilesPreserved: false
      }),
      acknowledgeAppStartupHandoff
    })

    expect(result.terminal.status).toBe('blocked')
    expect(result.terminal.packageFilesPreserved).toBe(false)
    expect(result.runtimePublicationCommit).toBeUndefined()
    expect(result.liveRegistrySwap).toBeUndefined()
    expect(liveRegistryReference.current).toBe(officialRegistrySet)
    expect(acknowledgeAppStartupHandoff).not.toHaveBeenCalled()
  })

  it('rejects enabling an already enabled package in this disabled-only transaction', async() => {
    const enabledMountInput = await createMountInput()

    expect(() => buildThirdPartyDataPackEnableState({
      disabledDraft: enabledMountInput.lockfileDraft!,
      enabledMountInput,
      targetPackageId: packageId
    })).toThrow('Only a disabled installed package can be enabled')
  })
})
