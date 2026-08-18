import { describe, expect, it, vi } from 'vitest'
import {
  createThirdPartyDataPackAndroidPlatformWriterAdapterPreflight,
  THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_ADAPTER_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_ADAPTER_PREFLIGHT_MODE,
  type ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackAndroidPlatformWriterAdapterPreflight'

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectAndroidWriterInert = (
  result: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult,
  enabled: boolean
): void => {
  expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_ADAPTER_PREFLIGHT_KIND)
  expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_ADAPTER_PREFLIGHT_MODE)
  expect(result.status).toBe('skipped')
  expect(result.enabled).toBe(enabled)
  expect(result.sourceCalled).toBe(false)
  expect(result.platformWriterConnectionPreflightStatus).toBeUndefined()
  expect(result.androidConnectionRequirementStatus).toBeUndefined()
  expect(result.requestedCommandId).toBeUndefined()
  expect(result.targetPackageId).toBeUndefined()
  expect(result.selectedPackageIds).toEqual([])
  expect(result.androidRequirements.every(requirement => requirement.status === 'skipped')).toBe(true)
  expect(result.effects.platformWriterConnectionPreflightCalled).toBe(false)
  expect(result.effects.upstreamPlatformWriterConnectionReady).toBe(false)
  expect(result.effects.androidPlatformWriterAdapterReady).toBe(false)
  expect(result.effects.realAndroidPlatformWriterHostCalled).toBe(false)
  expect(result.effects.androidPlatformWriterConnected).toBe(false)
  expect(result.effects.androidAppDataStorageResolved).toBe(false)
  expect(result.effects.androidNativeBridgeEnvelopeExposed).toBe(false)
  expect(result.effects.androidFilePickerOpened).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expectJsonGraphFrozen(result)
}

describe('third-party Android platform writer adapter preflight', () => {
  it('is disabled by default and does not call the platform writer connection preflight', async() => {
    const readPlatformWriterConnectionPreflight = vi.fn()
    const preflight = createThirdPartyDataPackAndroidPlatformWriterAdapterPreflight({
      readPlatformWriterConnectionPreflight
    })

    const result = await preflight()

    expectAndroidWriterInert(result, false)
    expect(result.reason).toBe('third-party Android platform writer adapter preflight is disabled by default')
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(readPlatformWriterConnectionPreflight).not.toHaveBeenCalled()
  })

  it('stays inert when explicitly enabled because Android is vanilla-only', async() => {
    const readPlatformWriterConnectionPreflight = vi.fn(async() => {
      throw new Error('platform writer connection preflight should stay inert')
    })
    const preflight = createThirdPartyDataPackAndroidPlatformWriterAdapterPreflight({
      enabled: true,
      readPlatformWriterConnectionPreflight
    })

    const result = await preflight()

    expectAndroidWriterInert(result, true)
    expect(result.reason).toBe(
      'third-party Android platform writer adapter is skipped because Android is vanilla-only'
    )
    expect(readPlatformWriterConnectionPreflight).not.toHaveBeenCalled()
  })

  it('does not enter unsafe or throwing upstream sources under the vanilla-only scope', async() => {
    const readPlatformWriterConnectionPreflight = vi.fn(async() => {
      throw new Error('EACCES: content://com.android.externalstorage.documents/tree/LENOVO')
    })
    const preflight = createThirdPartyDataPackAndroidPlatformWriterAdapterPreflight({
      enabled: true,
      readPlatformWriterConnectionPreflight
    })

    const result = await preflight()

    expectAndroidWriterInert(result, true)
    expect(readPlatformWriterConnectionPreflight).not.toHaveBeenCalled()
    expect(JSON.stringify(result)).not.toContain('content://')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
  })
})
