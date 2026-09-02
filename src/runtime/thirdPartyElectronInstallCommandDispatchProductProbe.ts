import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import { CURRENT_GAME_VERSION } from '@/domain/mods/officialContentVersions'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackElectronInstallCommandDispatchHost
} from '@/domain/mods/thirdPartyDataPackElectronInstallCommandDispatchBridge'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope,
  ThirdPartyDataPackTransactionCommandDispatcherHostResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'

const packageId = 'product_probe_pack' as PackageId
const packageRoot = 'product-probe-pack'
const registryId = 'taoyuan:item'
const itemId = `${packageId}:linen_ribbon`
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = Object.freeze({
  formatVersion: 1,
  contentHash: hash('a'),
  snapshotHash: hash('b'),
  candidateHash: hash('c')
})

const createSyntheticPackageManifest = () => ({
  id: packageId,
  name: {
    key: 'product_probe_pack.package.name',
    fallback: 'Product Probe Pack'
  },
  version: '1.0.0',
  gameVersion: CURRENT_GAME_VERSION,
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: {},
  authors: [
    {
      name: 'Product Probe',
      role: 'developer'
    }
  ],
  license: 'MIT',
  dependencies: [],
  entrypoints: {
    [registryId]: ['data/items.json']
  }
})

const createSyntheticPackageItem = () => ({
  id: itemId,
  name: {
    key: 'product_probe_pack.item.linen_ribbon.name',
    fallback: 'Product Probe Linen Ribbon'
  },
  category: 'gift',
  description: {
    key: 'product_probe_pack.item.linen_ribbon.description',
    fallback: 'Synthetic item used by the packaged runtime probe.'
  },
  sellPrice: 8,
  edible: false,
  tags: ['product_probe_pack:soft_gift']
})

const createSyntheticLockfileHash = (): Sha256Hash => {
  const manifest = createSyntheticPackageManifest()
  const item = createSyntheticPackageItem()
  const manifestHash = hashCanonicalJson(manifest)
  const contentFiles = [
    {
      registryId,
      path: 'data/items.json',
      entryCount: 1,
      entries: [
        {
          registryId,
          contentId: itemId,
          index: 0,
          canonicalHash: hashCanonicalJson(item)
        }
      ]
    }
  ]
  const body = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: committedMetadata.artifactHash,
      contentHash: committedMetadata.contentHash,
      schemaSetHash: committedMetadata.schemaSetHash,
      environmentHash: committedMetadata.environmentHash,
      snapshotHash: committedMetadata.snapshotHash,
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity,
    registryCount: 55,
    entryCount: 4243,
    selectedPackageIds: [packageId],
    loadOrder: [packageId],
    packages: [
      {
        packageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: packageRoot,
          manifestPath: `${packageRoot}/manifest.json`,
          contentFiles: [`${packageRoot}/data/items.json`]
        },
        manifestHash,
        contentHash: hashCanonicalJson({
          manifestHash,
          contentFiles
        }),
        configurationHash: hash('f'),
        resolvedDependencies: [],
        contentFiles
      }
    ]
  }
  return hashCanonicalJson(body)
}

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const createProbeEnvelope = (): ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope =>
  Object.freeze({
    requestedCommandId: 'install',
    targetPackageId: packageId,
    selectedPackageIds: Object.freeze([packageId]),
    blockedPackageIds: Object.freeze([]),
    loadOrder: Object.freeze([packageId]),
    registryCount: 55,
    entryCount: 4243,
    packageCount: 1,
    candidateIdentity,
    lockfileHash: createSyntheticLockfileHash()
  })

export const runThirdPartyElectronInstallCommandDispatchProductProbe = async(
  runtimeHost: unknown = typeof window === 'undefined' ? undefined : window
): Promise<ThirdPartyDataPackTransactionCommandDispatcherHostResult | undefined> => {
  const electronAPI = readOwnDataField(runtimeHost, 'electronAPI')
  const dispatchInstallCommand = readOwnDataField(
    electronAPI,
    'dispatchThirdPartyDataPackInstallCommand'
  )
  if (typeof dispatchInstallCommand !== 'function') return undefined

  const host = createThirdPartyDataPackElectronInstallCommandDispatchHost({
    invoke: async(_channel, envelope) => await dispatchInstallCommand(envelope)
  })
  return await host.dispatch(createProbeEnvelope())
}
