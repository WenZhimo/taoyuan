import { describe, expect, it, vi } from 'vitest'
import {
  createThirdPartyDataPackElectronCandidateRegistryCacheReadMainHandler,
  createThirdPartyDataPackElectronCandidateRegistryCacheRendererStore,
  createThirdPartyDataPackElectronCandidateRegistryCacheWriteMainHandler,
  thirdPartyDataPackCandidateRegistryCacheReadIpcChannel,
  thirdPartyDataPackCandidateRegistryCacheWriteIpcChannel
} from '@/domain/mods/thirdPartyDataPackElectronCandidateRegistryCacheBridge'
import type { Sha256Hash } from '@/domain/mods/hash'

const environmentHash = `sha256:${'a'.repeat(64)}` as Sha256Hash

describe('third-party Electron candidate registry cache bridge', () => {
  it('routes renderer cache reads and writes through the fixed IPC channels', async() => {
    const invoke = vi.fn(async(channel: string) => channel === thirdPartyDataPackCandidateRegistryCacheReadIpcChannel
      ? 'cached-envelope'
      : { status: 'written' })
    const store = createThirdPartyDataPackElectronCandidateRegistryCacheRendererStore({ invoke })

    expect(await store.read(environmentHash)).toBe('cached-envelope')
    await store.write(environmentHash, 'new-envelope')

    expect(invoke).toHaveBeenNthCalledWith(
      1,
      thirdPartyDataPackCandidateRegistryCacheReadIpcChannel,
      environmentHash
    )
    expect(invoke).toHaveBeenNthCalledWith(
      2,
      thirdPartyDataPackCandidateRegistryCacheWriteIpcChannel,
      environmentHash,
      'new-envelope'
    )
  })

  it('validates cache identities at the main-process IPC boundary', async() => {
    const read = vi.fn(async() => 'cached-envelope')
    const write = vi.fn(async() => undefined)
    const readHandler = createThirdPartyDataPackElectronCandidateRegistryCacheReadMainHandler({ read })
    const writeHandler = createThirdPartyDataPackElectronCandidateRegistryCacheWriteMainHandler({ write })

    expect(await readHandler({}, environmentHash)).toBe('cached-envelope')
    expect(await writeHandler({}, environmentHash, 'new-envelope')).toEqual({ status: 'written' })
    expect(read).toHaveBeenCalledWith(environmentHash)
    expect(write).toHaveBeenCalledWith(environmentHash, 'new-envelope')

    await expect(readHandler({}, 'not-a-hash')).rejects.toThrow('environment hash')
    await expect(writeHandler({}, 'not-a-hash', 'new-envelope')).rejects.toThrow('environment hash')
    await expect(writeHandler({}, environmentHash, 1)).rejects.toThrow('JSON text')
  })
})
