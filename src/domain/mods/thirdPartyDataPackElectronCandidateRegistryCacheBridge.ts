import type { Sha256Hash } from './hash'
import type { ThirdPartyDataPackCandidateRegistryCacheStore } from './thirdPartyDataPackCandidateRegistryCache'

export const thirdPartyDataPackCandidateRegistryCacheReadIpcChannel =
  'third-party-data-pack-candidate-registry-cache-read'
export const thirdPartyDataPackCandidateRegistryCacheWriteIpcChannel =
  'third-party-data-pack-candidate-registry-cache-write'

export interface ThirdPartyDataPackElectronCandidateRegistryCacheBridge {
  readonly invoke: (channel: string, ...args: readonly unknown[]) => Promise<unknown> | unknown
}

const isHash = (value: unknown): value is Sha256Hash =>
  typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value)

export const createThirdPartyDataPackElectronCandidateRegistryCacheRendererStore = (
  bridge: ThirdPartyDataPackElectronCandidateRegistryCacheBridge
): ThirdPartyDataPackCandidateRegistryCacheStore => ({
  async read(environmentHash) {
    if (!isHash(environmentHash)) throw new Error('Invalid candidate registry cache environment hash')
    const result = await bridge.invoke(
      thirdPartyDataPackCandidateRegistryCacheReadIpcChannel,
      environmentHash
    )
    if (result === null) return null
    if (typeof result !== 'string') throw new Error('Invalid candidate registry cache read response')
    return result
  },
  async write(environmentHash, contents) {
    if (!isHash(environmentHash)) throw new Error('Invalid candidate registry cache environment hash')
    await bridge.invoke(
      thirdPartyDataPackCandidateRegistryCacheWriteIpcChannel,
      environmentHash,
      contents
    )
  }
})

export interface CreateThirdPartyDataPackElectronCandidateRegistryCacheMainHandlerOptions {
  readonly read: (environmentHash: Sha256Hash) => Promise<string | null> | string | null
  readonly write: (environmentHash: Sha256Hash, contents: string) => Promise<void> | void
}

export const createThirdPartyDataPackElectronCandidateRegistryCacheReadMainHandler = (
  options: Pick<CreateThirdPartyDataPackElectronCandidateRegistryCacheMainHandlerOptions, 'read'>
) => async(_event: unknown, environmentHash: unknown): Promise<string | null> => {
  if (!isHash(environmentHash)) throw new TypeError('Invalid candidate registry cache environment hash')
  return await options.read(environmentHash)
}

export const createThirdPartyDataPackElectronCandidateRegistryCacheWriteMainHandler = (
  options: Pick<CreateThirdPartyDataPackElectronCandidateRegistryCacheMainHandlerOptions, 'write'>
) => async(_event: unknown, environmentHash: unknown, contents: unknown): Promise<{ status: 'written' }> => {
  if (!isHash(environmentHash)) throw new TypeError('Invalid candidate registry cache environment hash')
  if (typeof contents !== 'string') throw new TypeError('Candidate registry cache contents must be JSON text')
  await options.write(environmentHash, contents)
  return { status: 'written' }
}
