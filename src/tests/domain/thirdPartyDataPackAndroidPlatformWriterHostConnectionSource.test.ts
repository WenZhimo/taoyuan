import { describe, expect, it, vi } from 'vitest'
import {
  createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource,
  THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE,
  type ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackAndroidPlatformWriterHostConnectionSource'

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectAndroidHostConnectionInert = (
  result: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult,
  enabled: boolean
): void => {
  expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND)
  expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE)
  expect(result.status).toBe('skipped')
  expect(result.enabled).toBe(enabled)
  expect(result.sourceCalled).toBe(false)
  expect(result.androidPlatformWriterAdapterPreflightStatus).toBeUndefined()
  expect(result.androidPlatformWriterHostStatus).toBeUndefined()
  expect(result.targetPackageId).toBeUndefined()
  expect(result.selectedPackageIds).toEqual([])
  expect(result.candidateIdentity).toBeUndefined()
  expect(result.lockfileHash).toBeUndefined()
  expect(result.androidRequirementIds).toEqual([])
  expect(result.effects.androidPlatformWriterAdapterPreflightCalled).toBe(false)
  expect(result.effects.injectedAndroidPlatformWriterHostCalled).toBe(false)
  expect(result.effects.androidPlatformWriterHostCalled).toBe(false)
  expect(result.effects.androidPlatformWriterHostAccepted).toBe(false)
  expect(result.effects.realAndroidPlatformWriterHostCalled).toBe(false)
  expect(result.effects.androidPlatformWriterConnected).toBe(false)
  expect(result.effects.androidAppDataStorageResolved).toBe(false)
  expect(result.effects.androidNativeBridgeEnvelopeExposed).toBe(false)
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

describe('third-party Android platform writer host connection source', () => {
  it('is disabled by default and does not call adapter preflight or host', async() => {
    const readAndroidPlatformWriterAdapterPreflight = vi.fn()
    const connectAndroidPlatformWriterHost = vi.fn()
    const source = createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource({
      readAndroidPlatformWriterAdapterPreflight,
      connectAndroidPlatformWriterHost
    })

    const result = await source()

    expectAndroidHostConnectionInert(result, false)
    expect(result.reason).toBe('third-party Android platform writer host connection source is disabled by default')
    expect(readAndroidPlatformWriterAdapterPreflight).not.toHaveBeenCalled()
    expect(connectAndroidPlatformWriterHost).not.toHaveBeenCalled()
  })

  it('stays inert when explicitly enabled because Android is vanilla-only', async() => {
    const readAndroidPlatformWriterAdapterPreflight = vi.fn(async() => {
      throw new Error('Android platform writer adapter preflight should stay inert')
    })
    const connectAndroidPlatformWriterHost = vi.fn()
    const source = createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource({
      enabled: true,
      readAndroidPlatformWriterAdapterPreflight,
      connectAndroidPlatformWriterHost
    })

    const result = await source()

    expectAndroidHostConnectionInert(result, true)
    expect(result.reason).toBe(
      'third-party Android platform writer host connection is skipped because Android is vanilla-only'
    )
    expect(readAndroidPlatformWriterAdapterPreflight).not.toHaveBeenCalled()
    expect(connectAndroidPlatformWriterHost).not.toHaveBeenCalled()
  })

  it('does not enter unsafe or throwing sources and hosts under the vanilla-only scope', async() => {
    const readAndroidPlatformWriterAdapterPreflight = vi.fn(async() => {
      throw new Error('EACCES: content://com.android.externalstorage.documents/tree/LENOVO')
    })
    const connectAndroidPlatformWriterHost = vi.fn(async() => {
      throw new Error('EACCES: /data/user/0/com.games.wenzi.taoyuan/files/userdata/mod-lock.json')
    })
    const source = createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource({
      enabled: true,
      readAndroidPlatformWriterAdapterPreflight,
      connectAndroidPlatformWriterHost
    })

    const result = await source()

    expectAndroidHostConnectionInert(result, true)
    expect(readAndroidPlatformWriterAdapterPreflight).not.toHaveBeenCalled()
    expect(connectAndroidPlatformWriterHost).not.toHaveBeenCalled()
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('content://')
    expect(serialized).not.toContain('/data/user/0')
    expect(serialized).not.toContain('mod-lock.json')
  })
})
