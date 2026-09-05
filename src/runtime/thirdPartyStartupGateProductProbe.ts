import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import { CURRENT_GAME_VERSION } from '@/domain/mods/officialContentVersions'
import {
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import type { RegistryEntry, RegistrySet } from '@/domain/mods/registry'
import {
  createDiscoveryFileSystemFromContentPackageSource
} from '@/domain/mods/contentPackageSource'
import {
  createElectronReadonlyDirectorySource
} from '@/domain/mods/electronContentPackageSourceProbe'
import {
  buildThirdPartyCandidateRegistrySnapshot,
  type ThirdPartyCandidateIdentitySummary,
  type ThirdPartyCandidateOfficialIdentitySummary,
  type ThirdPartyCandidateRegistrySnapshotResult
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackDiscoveryReport
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  discoverThirdPartyDataPacks
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import type { PackageManifest } from '@/domain/mods/schemas'
import {
  createThirdPartyDataPackLockfileDraft,
  type ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection,
  type ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import {
  buildThirdPartyDataPackMountInput
} from '@/domain/mods/thirdPartyDataPackMountInput'
import {
  getLiveContentRegistryReference,
  publishOfficialContentRegistrySet
} from '@/domain/mods/liveContentRegistry'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery,
  type ThirdPartyDataPackPublicationRollbackRecoveryResult
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import {
  buildThirdPartyDataPackRuntimePublicationCommitAdapter,
  type ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import {
  createThirdPartyDataPackRuntimePublicationCommitHost
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitHost'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationPreflightEffectSummary,
  ThirdPartyDataPackRuntimePublicationPreflightResult,
  ThirdPartyDataPackRuntimePublicationRequirement
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPhaseSummary,
  ThirdPartyDataPackTransactionPreCommitPlanResult,
  ThirdPartyDataPackTransactionRollbackCheckpoint,
  ThirdPartyDataPackTransactionWriteBoundary
} from '@/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan
} from '@/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
import {
  selectThirdPartyDataPacks
} from '@/domain/mods/thirdPartyDataPackSelection'
import {
  createThirdPartyDataPackSharedRendererStartupGateBootstrapSource
} from '@/domain/mods/thirdPartyDataPackSharedRendererStartupGateBootstrapSource'
import {
  createThirdPartyDataPackWebUiIpcResponseDeliveryPipeline
} from '@/domain/mods/thirdPartyDataPackWebUiIpcResponseDeliveryPipeline'
import {
  createThirdPartyDataPackWebDomResponseDeliverySinkHost
} from '@/domain/mods/thirdPartyDataPackWebDomResponseDeliveryBridge'
import {
  buildThirdPartyDataPackLauncherBoundaryPreflight
} from '@/domain/mods/thirdPartyDataPackLauncherBoundaryPreflight'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary,
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import type {
  ThirdPartyDataPackStartupGateHandoffEffectSummary,
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from '@/domain/mods/thirdPartyDataPackStartupGateHandoffPreflight'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'
import {
  createThirdPartyDataPackStartupGatePersistentStateSource,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
  type ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSource'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshot,
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import {
  buildThirdPartyDataPackWebStartupGateDecisionEnvelope
} from '@/domain/mods/thirdPartyDataPackWebStartupGateDecisionEnvelope'
import {
  executeThirdPartyDataPackWebStartupGatePersistentStateExecution,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
  type ThirdPartyDataPackWebStartupGatePersistentStateExecutionResult
} from '@/domain/mods/thirdPartyDataPackWebStartupGatePersistentStateExecution'
import {
  buildThirdPartyDataPackElectronStartupGateDecisionEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronStartupGateDecisionEnvelope'
import {
  executeThirdPartyDataPackElectronStartupGatePersistentStateExecution
} from '@/domain/mods/thirdPartyDataPackElectronStartupGatePersistentStateExecution'
import {
  createThirdPartyDataPackElectronStartupPersistentStateReadHost
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateIpcBridge'
import {
  createThirdPartyDataPackWebStartupPersistentStateSourceHost,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackWebStartupPersistentStateSourceHost'
import {
  createWebIndexedDbSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline'
import type {
  ThirdPartyDataPackAppFactoryBindingHostEnvelope,
  ThirdPartyDataPackAppFactoryBindingHostResult
} from '@/domain/mods/thirdPartyDataPackAppFactoryBindingSource'
import type {
  ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  ThirdPartyDataPackNormalStartupHandoffHostResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupHandoffExecutionSource'
import {
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import type {
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary,
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline'
import type {
  ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  createDefaultWebIndexedDbImportRecord,
  createWebIndexedDbImportPersistenceStore,
  type WebIndexedDbImportPersistenceStore
} from '@/domain/mods/webIndexedDbImportPersistence'

const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash
const samplePackageId = 'sample_pack' as PackageId
const electronOrdinaryTerminalPackageId = 'product_probe_pack' as PackageId
const productProbeItemRegistryId = 'taoyuan:item' as RegistryTypeId
const productProbeRecipeRegistryId = 'taoyuan:recipe' as RegistryTypeId
const productProbeShopOfferRegistryId = 'taoyuan:shop_offer' as RegistryTypeId
const productProbeItemLocalId = 'linen_ribbon'
const productProbeRecipeLocalId = 'linen_ribbon_snack'
const productProbeShopOfferLocalId = 'shop/wanwupu/linen_ribbon/0'
const defaultLockfileHash = testHash('d')
const defaultCandidateIdentity = Object.freeze({
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
})

interface ThirdPartyStartupGateProductProbeSummary {
  readonly selectedPackageCount: number
  readonly blockedPackageCount: number
  readonly blockedCandidateCount: number
  readonly loadOrderCount: number
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly diagnosticCount: number
}

const defaultSummary: ThirdPartyStartupGateProductProbeSummary = Object.freeze({
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
})

type ThirdPartyStartupGateProductProbeProfileName =
  | 'sample'
  | 'electron-ordinary-terminal'

interface ThirdPartyStartupGateProductProbeProfile {
  readonly packageId: PackageId
  readonly candidatePath: string
  readonly itemId: ContentId
  readonly selectedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: typeof defaultCandidateIdentity
  readonly lockfileHash: Sha256Hash
  readonly summary: ThirdPartyStartupGateProductProbeSummary
}

const createProductProbeProfile = (
  packageId: PackageId
): ThirdPartyStartupGateProductProbeProfile => Object.freeze({
  packageId,
  candidatePath: `${packageId.replace(/_/g, '-')}-startup-gate-pack`,
  itemId: `${packageId}:${productProbeItemLocalId}` as ContentId,
  selectedPackageIds: Object.freeze([packageId]),
  loadOrder: Object.freeze([packageId]),
  registryCount: defaultSummary.registryCount,
  entryCount: defaultSummary.entryCount,
  packageCount: defaultSummary.packageCount,
  candidateIdentity: defaultCandidateIdentity,
  lockfileHash: defaultLockfileHash,
  summary: defaultSummary
})

const sampleProductProbeProfile = createProductProbeProfile(samplePackageId)
const electronOrdinaryTerminalProductProbeProfile =
  createProductProbeProfile(electronOrdinaryTerminalPackageId)

const resolveProductProbeProfile = (
  profileName: ThirdPartyStartupGateProductProbeProfileName | undefined
): ThirdPartyStartupGateProductProbeProfile =>
  profileName === 'electron-ordinary-terminal'
    ? electronOrdinaryTerminalProductProbeProfile
    : sampleProductProbeProfile

interface ThirdPartyStartupGateRealProductProbeContext {
  readonly officialRegistrySet: RegistrySet
  readonly candidateRegistrySet: RegistrySet
  readonly candidateSnapshot?: ThirdPartyCandidateRegistrySnapshotResult
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
  readonly lockfileHash: Sha256Hash
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly summary: ThirdPartyStartupGateProductProbeSummary
}

interface ThirdPartyStartupGateBuiltProductProbeContext
  extends ThirdPartyStartupGateRealProductProbeContext {
  readonly runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult
  readonly transactionPreCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
  readonly liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult
  readonly publicationRollbackRecovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
}

interface ProductProbeContentFallbackSummary {
  readonly productProbeItemNameFallback?: string
  readonly productProbeRecipeNameFallback?: string
  readonly productProbeShopOfferNameFallback?: string
}

interface ThirdPartyStartupGateProductProbeReportBundle {
  readonly runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult
  readonly transactionPreCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
  readonly liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult
  readonly publicationRollbackRecovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
}

const isBuiltProductProbeContext = (
  context: ThirdPartyStartupGateRealProductProbeContext
): context is ThirdPartyStartupGateBuiltProductProbeContext =>
  'runtimePublicationPreflight' in context
  && 'transactionPreCommitPlan' in context
  && 'liveRegistrySwapProtection' in context
  && 'publicationRollbackRecovery' in context
  && 'runtimePublicationCommitAdapter' in context

const productProbeRuntimeContexts = new Map<PackageId, ThirdPartyStartupGateRealProductProbeContext>()

const productProbeContentId = (
  packageId: PackageId,
  localId: string
): ContentId => `${packageId}:${localId}` as ContentId

const readRegistryNameFallback = (
  registrySet: RegistrySet,
  registryId: RegistryTypeId,
  contentId: ContentId
): string | undefined => {
  let entry: Readonly<RegistryEntry> | undefined
  try {
    entry = registrySet.get<RegistryEntry>(registryId).get(contentId)
  } catch {
    return undefined
  }
  const name = (entry as { readonly name?: unknown } | undefined)?.name
  if (name === null || typeof name !== 'object') return undefined
  const fallback = (name as { readonly fallback?: unknown }).fallback
  return typeof fallback === 'string' ? fallback : undefined
}

const createProductProbeContentFallbackSummary = (
  source: ThirdPartyStartupGateRealProductProbeContext
): ProductProbeContentFallbackSummary => {
  const packageId = source.selectedPackageIds[0]
  if (packageId !== electronOrdinaryTerminalPackageId) return Object.freeze({})
  const productProbeItemId = productProbeContentId(packageId, productProbeItemLocalId)
  const productProbeRecipeId = productProbeContentId(packageId, productProbeRecipeLocalId)
  const productProbeShopOfferId = productProbeContentId(packageId, productProbeShopOfferLocalId)
  const itemNameFallback = readRegistryNameFallback(
    source.candidateRegistrySet,
    productProbeItemRegistryId,
    productProbeItemId
  )
  const recipeNameFallback = readRegistryNameFallback(
    source.candidateRegistrySet,
    productProbeRecipeRegistryId,
    productProbeRecipeId
  )
  const shopOfferNameFallback = readRegistryNameFallback(
    source.candidateRegistrySet,
    productProbeShopOfferRegistryId,
    productProbeShopOfferId
  )
  return Object.freeze({
    ...(itemNameFallback === undefined ? {} : { productProbeItemNameFallback: itemNameFallback }),
    ...(recipeNameFallback === undefined ? {} : { productProbeRecipeNameFallback: recipeNameFallback }),
    ...(shopOfferNameFallback === undefined ? {} : { productProbeShopOfferNameFallback: shopOfferNameFallback })
  })
}

const createProductProbePackageManifest = (
  profile: ThirdPartyStartupGateProductProbeProfile
): PackageManifest => ({
  id: profile.packageId,
  name: {
    key: `${profile.packageId}.package.name`,
    fallback: `${profile.packageId} startup gate probe pack`
  },
  version: '1.0.0',
  gameVersion: CURRENT_GAME_VERSION,
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: {
    'zh-CN': 'locales/zh-CN.json'
  },
  authors: [
    {
      name: 'Startup Gate Product Probe',
      role: 'developer'
    }
  ],
  license: 'MIT',
  dependencies: [],
  entrypoints: {
    [productProbeItemRegistryId]: ['data/items.json']
  }
})

const createProductProbePackageItem = (
  profile: ThirdPartyStartupGateProductProbeProfile
): RegistryEntry => Object.freeze({
  id: profile.itemId,
  name: Object.freeze({
    key: `${profile.packageId}.item.${productProbeItemLocalId}.name`,
    fallback: `${profile.packageId} Startup Gate Linen Ribbon`
  }),
  category: 'gift',
  description: Object.freeze({
    key: `${profile.packageId}.item.${productProbeItemLocalId}.description`,
    fallback: 'Runtime-only item used to prove startup gate live registry swap identity.'
  }),
  sellPrice: 8,
  edible: false
})

const createProductProbeDiscoveryReport = (
  profile: ThirdPartyStartupGateProductProbeProfile
): ThirdPartyDataPackDiscoveryReport => {
  const manifest = createProductProbePackageManifest(profile)
  const item = createProductProbePackageItem(profile)
  return Object.freeze({
    status: 'completed',
    candidates: Object.freeze([
      Object.freeze({
        path: profile.candidatePath,
        status: 'valid',
        packageId: profile.packageId,
        manifest,
        contentFiles: Object.freeze([
          Object.freeze({
            registryId: productProbeItemRegistryId,
            path: 'data/items.json',
            entryCount: 1,
            entries: Object.freeze([
              Object.freeze({
                registryId: productProbeItemRegistryId,
                contentId: profile.itemId,
                path: 'data/items.json',
                index: 0,
                canonicalHash: hashCanonicalJson(item)
              })
            ]),
            validatedEntries: Object.freeze([item])
          })
        ]),
        issues: Object.freeze([])
      })
    ]),
    issues: Object.freeze([]),
    summary: Object.freeze({
      scannedEntries: 1,
      candidateCount: 1,
      validPackageCount: 1,
      invalidPackageCount: 0,
      issueCount: 0
    })
  })
}

const requireRealProductProbeContext = (
  profile: ThirdPartyStartupGateProductProbeProfile
): ThirdPartyStartupGateRealProductProbeContext => {
  const cached = productProbeRuntimeContexts.get(profile.packageId)
  if (cached) return cached

  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  const discoveryReport = createProductProbeDiscoveryReport(profile)
  const selectionReport = selectThirdPartyDataPacks(discoveryReport)
  const candidateSnapshot = buildThirdPartyCandidateRegistrySnapshot({
    officialRegistrySet,
    discoveryReport,
    selectionReport
  })
  if (
    candidateSnapshot.status !== 'valid'
    || candidateSnapshot.candidateRegistrySet === undefined
    || candidateSnapshot.candidateIdentity === undefined
  ) {
    throw new Error('Startup gate product probe could not build a valid candidate registry snapshot.')
  }

  const lockfileDraftResult = createThirdPartyDataPackLockfileDraft({
    discoveryReport,
    selectionReport,
    candidateSnapshot
  })
  if (lockfileDraftResult.status !== 'valid' || lockfileDraftResult.draft === undefined) {
    throw new Error('Startup gate product probe could not build a valid lockfile draft.')
  }

  const context: ThirdPartyStartupGateRealProductProbeContext = Object.freeze({
    officialRegistrySet,
    candidateRegistrySet: candidateSnapshot.candidateRegistrySet,
    candidateSnapshot,
    candidateIdentity: candidateSnapshot.candidateIdentity,
    officialIdentity: candidateSnapshot.officialIdentity,
    lockfileDraft: lockfileDraftResult.draft,
    lockfileHash: lockfileDraftResult.draft.lockfileHash,
    selectedPackageIds: candidateSnapshot.selectedPackageIds,
    blockedPackageIds: candidateSnapshot.blockedPackageIds,
    blockedCandidatePaths: candidateSnapshot.blockedCandidatePaths,
    loadOrder: candidateSnapshot.loadOrder,
    registryCount: candidateSnapshot.registryCount,
    entryCount: candidateSnapshot.entryCount,
    packageCount: candidateSnapshot.selectedPackageIds.length,
    summary: Object.freeze({
      selectedPackageCount: candidateSnapshot.sourceSummary.selectedPackageCount,
      blockedPackageCount: candidateSnapshot.sourceSummary.blockedPackageCount,
      blockedCandidateCount: candidateSnapshot.blockedCandidatePaths.length,
      loadOrderCount: candidateSnapshot.loadOrder.length,
      registryCount: candidateSnapshot.registryCount,
      entryCount: candidateSnapshot.entryCount,
      packageCount: candidateSnapshot.selectedPackageIds.length,
      diagnosticCount: candidateSnapshot.diagnostics.length
    })
  })
  productProbeRuntimeContexts.set(profile.packageId, context)
  return context
}

type ThirdPartyStartupGateProductProbeSummarySource =
  | ThirdPartyStartupGateProductProbeProfile
  | ThirdPartyStartupGateRealProductProbeContext

const blockedPackageIdsFromSource = (
  source: ThirdPartyStartupGateProductProbeSummarySource
): readonly PackageId[] =>
  'blockedPackageIds' in source ? source.blockedPackageIds : Object.freeze([])

const blockedCandidateCountFromSource = (
  source: ThirdPartyStartupGateProductProbeSummarySource
): number =>
  'blockedCandidatePaths' in source ? source.blockedCandidatePaths.length : 0

const persistentStateProofs = Object.freeze({
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
})

const runtimePublicationRequirements: readonly ThirdPartyDataPackRuntimePublicationRequirement[] = Object.freeze([
  Object.freeze({
    id: 'runtime-publication-commit-adapter',
    status: 'required',
    reason: 'Startup gate product probe still treats final runtime publication commit as a guarded acknowledgement.'
  }),
  Object.freeze({
    id: 'live-registry-swap-protection',
    status: 'required',
    reason: 'Startup gate product probe must satisfy live registry swap protection before host mutation.'
  }),
  Object.freeze({
    id: 'publication-failure-rollback',
    status: 'required',
    reason: 'Startup gate product probe keeps rollback recovery requirements visible and read-only.'
  })
])

const productProbePublicationEffects = ():
  ThirdPartyDataPackRuntimePublicationPreflightEffectSummary => Object.freeze({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    candidateRegistryExposed: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })

const transactionWriteBoundaries: readonly ThirdPartyDataPackTransactionWriteBoundary[] =
  Object.freeze([
    'transaction-log',
    'package-files',
    'package-backups',
    'installation-settings',
    'mod-lockfile',
    'live-registry',
    'player-saves',
    'official-cache'
  ].map(id => Object.freeze({
    id: id as ThirdPartyDataPackTransactionWriteBoundary['id'],
    status: 'deferred',
    writeAllowed: false,
    reason: `${id} writes remain deferred in the startup gate product probe.`
  })))

const transactionRollbackCheckpoints: readonly ThirdPartyDataPackTransactionRollbackCheckpoint[] =
  Object.freeze([
    'before-transaction-log-write',
    'before-package-files-write',
    'before-settings-lockfile-write',
    'before-live-registry-swap',
    'after-failure-restore-verification'
  ].map(id => Object.freeze({
    id: id as ThirdPartyDataPackTransactionRollbackCheckpoint['id'],
    status: 'required',
    reason: `${id} remains required in the startup gate product probe.`
  })))

const preCommitInspectionPhase: ThirdPartyDataPackTransactionPreCommitPhaseSummary = Object.freeze({
  id: 'pre-commit-inspection',
  status: 'satisfied',
  writeBoundaryIds: Object.freeze([]),
  rollbackCheckpointIds: Object.freeze([]),
  reason: 'Startup gate product probe upstream summaries are internally consistent.'
})

const liveRegistrySwapPhase: ThirdPartyDataPackTransactionPreCommitPhaseSummary = Object.freeze({
  id: 'live-registry-swap',
  status: 'deferred',
  writeBoundaryIds: Object.freeze([
    'live-registry' as ThirdPartyDataPackTransactionWriteBoundary['id']
  ]),
  rollbackCheckpointIds: Object.freeze([
    'before-live-registry-swap' as ThirdPartyDataPackTransactionRollbackCheckpoint['id']
  ]),
  reason: 'Only the runtime in-memory live registry reference may be swapped by this probe.'
})

const createProductProbeRuntimePublicationPreflight = (
  context: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyDataPackRuntimePublicationPreflightResult => Object.freeze({
  status: 'deferred',
  mountInputStatus: 'ready',
  sourceAdapterGateStatus: 'deferred',
  reason: 'startup gate product probe prepared a real candidate snapshot while keeping runtime publication commit read-only',
  diagnostics: Object.freeze([]),
  selectedPackageIds: context.selectedPackageIds,
  blockedPackageIds: context.blockedPackageIds,
  blockedCandidatePaths: context.blockedCandidatePaths,
  loadOrder: context.loadOrder,
  registryCount: context.registryCount,
  entryCount: context.entryCount,
  packageCount: context.packageCount,
  officialIdentity: context.officialIdentity,
  candidateIdentity: context.candidateIdentity,
  lockfileHash: context.lockfileHash,
  runtimePublication: 'deferred',
  publicationAllowed: false,
  candidateRegistryFrozen: true,
  candidateSnapshotAvailable: true,
  lockfileDraftAvailable: true,
  handoffChecks: Object.freeze([]),
  remainingRequirements: runtimePublicationRequirements,
  effects: productProbePublicationEffects()
})

const createProductProbeTransactionPreCommitPlan = (
  context: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyDataPackTransactionPreCommitPlanResult => Object.freeze({
  status: 'deferred',
  transactionPreflightStatus: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  reason: 'startup gate product probe keeps persistent transaction writes deferred before the runtime live registry swap',
  diagnostics: Object.freeze([]),
  selectedPackageIds: context.selectedPackageIds,
  blockedPackageIds: context.blockedPackageIds,
  blockedCandidatePaths: context.blockedCandidatePaths,
  loadOrder: context.loadOrder,
  registryCount: context.registryCount,
  entryCount: context.entryCount,
  packageCount: context.packageCount,
  officialIdentity: context.officialIdentity,
  candidateIdentity: context.candidateIdentity,
  lockfileHash: context.lockfileHash,
  preCommitPlan: 'deferred',
  commitAllowed: false,
  writeAllowed: false,
  recoveryRequired: false,
  rollbackRequired: false,
  preCommitChecks: Object.freeze([]),
  phases: Object.freeze([preCommitInspectionPhase, liveRegistrySwapPhase]),
  writeBoundaries: transactionWriteBoundaries,
  rollbackCheckpoints: transactionRollbackCheckpoints,
  effects: productProbePublicationEffects()
})

const createProductProbeReportBundle = (
  context: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyStartupGateProductProbeReportBundle => {
  if (isBuiltProductProbeContext(context)) {
    return Object.freeze({
      runtimePublicationPreflight: context.runtimePublicationPreflight,
      transactionPreCommitPlan: context.transactionPreCommitPlan,
      liveRegistrySwapProtection: context.liveRegistrySwapProtection,
      publicationRollbackRecovery: context.publicationRollbackRecovery
    })
  }

  const runtimePublicationPreflight = createProductProbeRuntimePublicationPreflight(context)
  const transactionPreCommitPlan = createProductProbeTransactionPreCommitPlan(context)
  const liveRegistrySwapProtection = buildThirdPartyDataPackLiveRegistrySwapProtection({
    runtimePublicationPreflight,
    transactionPreCommitPlan
  } as never)
  const publicationRollbackRecovery = buildThirdPartyDataPackPublicationRollbackRecovery({
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection
  } as never)
  return Object.freeze({
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery: publicationRollbackRecovery as ThirdPartyDataPackPublicationRollbackRecoveryResult
  })
}

const createProductProbeRuntimePublicationCommitHost = (
  context: ThirdPartyStartupGateRealProductProbeContext
) => createThirdPartyDataPackRuntimePublicationCommitHost({
  selectedPackageIds: context.selectedPackageIds,
  blockedPackageIds: context.blockedPackageIds,
  blockedCandidatePaths: context.blockedCandidatePaths,
  loadOrder: context.loadOrder,
  registryCount: context.registryCount,
  entryCount: context.entryCount,
  packageCount: context.packageCount,
  candidateIdentity: context.candidateIdentity,
  lockfileHash: context.lockfileHash
})

const productProbePostCommitEffects =
  (): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary => Object.freeze({
    postCommitVerificationAfterInstallTransactionCommitPipelineCalled: true,
    installTransactionCommitFinalizationPipelineCalled: true,
    postCommitVerificationReadAcknowledgementPipelineCalled: true,
    transactionCommitted: true,
    transactionLogCommitted: true,
    postCommitVerificationAcknowledged: true,
    persistentReadProofAcknowledged: true,
    appBootstrapContinuationAllowed: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
    electronIpcExposed: false,
    webFilePickerOpened: false,
    androidFilePickerOpened: false,
    commandDispatcherCalled: false,
    commandDispatched: false,
    atomicCommitExecutorCalled: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogPrepared: true,
    transactionLogWritten: true,
    transactionLogRead: true,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    packageFilesWritten: true,
    packageBackupsWritten: true,
    packageFilesRestored: false,
    lockfileWritten: true,
    lockfileRestored: false,
    settingsWritten: true,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })

const createProductProbePostCommitAfterInstallTransactionCommit = (
  context: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult => Object.freeze({
  kind: 'third-party-post-commit-verification-after-install-transaction-commit-pipeline',
  mode: 'default-disabled-post-commit-verification-after-install-transaction-commit-pipeline',
  status: 'ready',
  reason: 'startup gate product probe prepared path-free committed transaction post-commit evidence',
  readOnly: true,
  enabled: true,
  installTransactionCommitFinalizationSourceCalled: true,
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installTransactionCommitFinalizationStatus: 'committed',
  postCommitVerificationReadAcknowledgementStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: context.selectedPackageIds[0]!,
  verificationOutcomeKind: 'verified',
  transactionLogMatched: true,
  packageStateMatched: true,
  settingsLockfileMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
  selectedPackageIds: context.selectedPackageIds,
  blockedPackageIds: context.blockedPackageIds,
  loadOrder: context.loadOrder,
  registryCount: context.registryCount,
  entryCount: context.entryCount,
  packageCount: context.packageCount,
  candidateIdentity: context.candidateIdentity,
  candidateHash: context.candidateIdentity.candidateHash,
  lockfileHash: context.lockfileHash,
  transactionId: 'product-probe-runtime-publication-transaction',
  committedTransactionId: 'product-probe-runtime-publication-transaction',
  committedTransactionLogEntryHash: testHash('e'),
  checks: Object.freeze([]),
  diagnostics: Object.freeze([]),
  effects: productProbePostCommitEffects()
} as unknown as ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult)

const createAcceptedRealCommitAfterPostCommit = async(
  context: ThirdPartyStartupGateRealProductProbeContext
): Promise<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult> => {
  const bundle = createProductProbeReportBundle(context)
  const runtimePublicationCommitHost = createProductProbeRuntimePublicationCommitHost(context)
  const pipeline = createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
    enabled: true,
    readPostCommitVerificationAfterInstallTransactionCommit: async() =>
      createProductProbePostCommitAfterInstallTransactionCommit(context),
    readRuntimePublicationPreflight: async() => bundle.runtimePublicationPreflight,
    readTransactionPreCommitPlan: async() => bundle.transactionPreCommitPlan,
    readLiveRegistrySwapProtection: async() => bundle.liveRegistrySwapProtection,
    readPublicationRollbackRecovery: async() => bundle.publicationRollbackRecovery,
    acknowledgeRuntimePublicationCommit: runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit
  })

  return await pipeline()
}

const handoffEffects: ThirdPartyDataPackStartupGateHandoffEffectSummary = Object.freeze({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  electronIpcExposed: false,
  electronIpcResponseSent: false,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  responseDeliveryOrchestrationConsumed: true,
  startupGateHandoffPrepared: true
})

const noUiIpcNormalizationEffects = ():
  ThirdPartyDataPackUiIpcResultNormalizationEffectSummary => ({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
    electronIpcExposed: false,
    webFilePickerOpened: false,
    androidFilePickerOpened: false,
    commandDispatcherCalled: false,
    commandDispatched: false,
    atomicCommitExecutorCalled: false,
    transactionCommitted: false,
    transactionLogPrepared: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecutorCalled: false,
    postCommitVerificationExecuted: false,
    transactionLogRead: false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    successEnvelopeDelivered: false,
    failureEnvelopeDelivered: false,
    retryStateDelivered: false,
    rollbackStateDelivered: false,
    uiIpcResponseDelivered: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    packageFilesRestored: false,
    lockfileWritten: false,
    lockfileRestored: false,
    settingsWritten: false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })

const noUiIpcOutcomeHandoffEffects = ():
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary => ({
    ...noUiIpcNormalizationEffects(),
    atomicCommitOutcomeConsumed: true,
    postCommitVerificationOutcomeConsumed: true,
    uiIpcOutcomePrepared: true
  })

const createProductProbeUiIpcNormalizationPreflight = (
  source: ThirdPartyStartupGateProductProbeSummarySource = sampleProductProbeProfile
): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
    status: 'deferred',
    atomicTransactionCommitExecutorPreflightStatus: 'deferred',
    postCommitVerificationExecutorPreflightStatus: 'deferred',
    reason: 'startup persistent-state product probe supplies a path-free UI/IPC normalization preflight before Web startup handoff',
    requestedCommandId: 'install',
    targetPackageId: source.selectedPackageIds[0]!,
    diagnostics: [],
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: blockedPackageIdsFromSource(source),
    blockedCandidateCount: blockedCandidateCountFromSource(source),
    loadOrder: source.loadOrder,
    registryCount: source.summary.registryCount,
    entryCount: source.summary.entryCount,
    packageCount: source.summary.packageCount,
    candidateIdentity: source.candidateIdentity,
    lockfileHash: source.lockfileHash,
    uiIpcResultNormalizationPreflight: 'deferred',
    readOnly: true,
    successEnvelopeAllowed: false,
    failureEnvelopeAllowed: false,
    retryStateAllowed: false,
    rollbackStateAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    resultChecks: [],
    resultStages: [],
    resultRequirements: [],
    resultOutcomeStates: [],
    effects: noUiIpcNormalizationEffects()
  })

const createProductProbePostCommitUiIpcOutcomeHandoff = (
  source: ThirdPartyStartupGateProductProbeSummarySource = sampleProductProbeProfile
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => ({
    status: 'ready',
    resultNormalizationPreflightStatus: 'deferred',
    atomicCommitOutcomeContractStatus: 'ready',
    postCommitVerificationExecutorAdapterStatus: 'executed',
    reason: 'startup persistent-state product probe supplies a path-free Web response delivery handoff source before IndexedDB startup reads',
    postCommitVerificationUiIpcOutcomeHandoff: 'ready',
    readOnly: true,
    uiIpcOutcomePrepared: true,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    atomicCommitExecutionAllowed: false,
    transactionCommitAllowed: false,
    runtimePublicationCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: 'install',
    targetPackageId: source.selectedPackageIds[0]!,
    outcomeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success',
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: blockedPackageIdsFromSource(source),
    blockedCandidateCount: blockedCandidateCountFromSource(source),
    loadOrder: source.loadOrder,
    registryCount: source.summary.registryCount,
    entryCount: source.summary.entryCount,
    packageCount: source.summary.packageCount,
    candidateIdentity: source.candidateIdentity,
    lockfileHash: source.lockfileHash,
    checks: [],
    diagnostics: [],
    summary: source.summary,
    outcome: {
      kind: 'success',
      settled: true,
      packageId: source.selectedPackageIds[0]!,
      candidateIdentity: source.candidateIdentity,
      lockfileHash: source.lockfileHash,
      diagnostics: [],
      messageKey: 'mods.ui.ipc.result.install.success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false
    },
    effects: noUiIpcOutcomeHandoffEffects()
  })

const webEventTargetFromRuntimeHost = (
  runtimeHost: unknown
): EventTarget | undefined => {
  if (typeof EventTarget !== 'undefined' && runtimeHost instanceof EventTarget) return runtimeHost
  if (runtimeHost === null || typeof runtimeHost !== 'object') return undefined

  try {
    const candidate = runtimeHost as Partial<EventTarget>
    return typeof candidate.addEventListener === 'function'
      && typeof candidate.removeEventListener === 'function'
      && typeof candidate.dispatchEvent === 'function'
      ? candidate as EventTarget
      : undefined
  } catch {
    return undefined
  }
}

const defaultRuntimeHost = (): unknown =>
  typeof window === 'undefined' ? undefined : window

const readOwnRuntimeField = (
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

const requireElectronApi = (runtimeHost: unknown): Record<string, unknown> => {
  const electronApi = readOwnRuntimeField(runtimeHost, 'electronAPI')
  if (electronApi === null || typeof electronApi !== 'object') {
    throw new Error('Electron startup persistent-state product probe requires electronAPI')
  }
  return electronApi as Record<string, unknown>
}

const requireElectronMethod = (
  electronApi: Record<string, unknown>,
  methodName: string
): ((...args: unknown[]) => Promise<unknown>) => {
  const method = readOwnRuntimeField(electronApi, methodName)
  if (typeof method !== 'function') {
    throw new Error(`Electron startup persistent-state product probe requires ${methodName}`)
  }
  return (...args: unknown[]) => Promise.resolve(method.call(electronApi, ...args))
}

const requireElectronReadonlyDirectorySourceApi = (
  electronApi: Record<string, unknown>
): Record<string, unknown> => {
  const sourceApi = readOwnRuntimeField(electronApi, 'electronReadonlyDirectorySource')
  if (sourceApi === null || typeof sourceApi !== 'object') {
    throw new Error('Electron startup persistent-state product probe requires electronReadonlyDirectorySource')
  }
  return sourceApi as Record<string, unknown>
}

const requireElectronReadonlyDirectorySourceMethod = (
  sourceApi: Record<string, unknown>,
  methodName: string
): ((sourcePath: string) => Promise<unknown>) => {
  const method = readOwnRuntimeField(sourceApi, methodName)
  if (typeof method !== 'function') {
    throw new Error(`Electron startup persistent-state product probe requires ${methodName}`)
  }
  return (sourcePath: string) => Promise.resolve(method.call(sourceApi, sourcePath))
}

const unwrapElectronReadonlyDirectorySourceResult = async(
  valuePromise: Promise<unknown>
): Promise<unknown> => {
  const value = await valuePromise
  if (value !== null && typeof value === 'object') {
    const ok = readOwnRuntimeField(value, 'ok')
    if (ok === true) return readOwnRuntimeField(value, 'value')
  }
  throw new Error('Electron read-only directory source operation failed')
}

const createElectronReadonlyDirectorySourceFromRuntimeHost = (runtimeHost: unknown) => {
  const electronApi = requireElectronApi(runtimeHost)
  const sourceApi = requireElectronReadonlyDirectorySourceApi(electronApi)
  const getEntry = requireElectronReadonlyDirectorySourceMethod(sourceApi, 'getEntry')
  const readDirectory = requireElectronReadonlyDirectorySourceMethod(sourceApi, 'readDirectory')
  const readTextFile = requireElectronReadonlyDirectorySourceMethod(sourceApi, 'readTextFile')
  return createElectronReadonlyDirectorySource({
    host: {
      getEntry: sourcePath =>
        unwrapElectronReadonlyDirectorySourceResult(getEntry(sourcePath)) as Promise<never>,
      readDirectory: sourcePath =>
        unwrapElectronReadonlyDirectorySourceResult(readDirectory(sourcePath)) as Promise<never>,
      readTextFile: sourcePath =>
        unwrapElectronReadonlyDirectorySourceResult(readTextFile(sourcePath)) as Promise<string>
    }
  })
}

const createElectronStartupPersistentStateReadHostFromRuntimeHost = (
  runtimeHost: unknown
) => {
  const electronApi = requireElectronApi(runtimeHost)
  const readThirdPartyDataPackStartupPersistentState =
    requireElectronMethod(electronApi, 'readThirdPartyDataPackStartupPersistentState')
  return createThirdPartyDataPackElectronStartupPersistentStateReadHost({
    invoke: (_channel, request) =>
      readThirdPartyDataPackStartupPersistentState(request)
  })
}

const createInstalledElectronProductProbeContext = async(
  runtimeHost: unknown
): Promise<ThirdPartyStartupGateBuiltProductProbeContext> => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  const source = createElectronReadonlyDirectorySourceFromRuntimeHost(runtimeHost)
  const discoveryReport = await discoverThirdPartyDataPacks(
    source.identity.rootPath,
    createDiscoveryFileSystemFromContentPackageSource(source)
  )
  const mountInput = buildThirdPartyDataPackMountInput({
    officialRegistrySet,
    discoveryReport
  })
  if (
    mountInput.status !== 'ready'
    || mountInput.candidateRegistrySet === undefined
    || mountInput.candidateIdentity === undefined
    || mountInput.lockfileDraft === undefined
    || mountInput.lockfileHash === undefined
  ) {
    throw new Error('Electron startup persistent-state product probe could not rebuild a ready mount input from installed mods')
  }
  const runtimePublicationPreflight = buildThirdPartyDataPackRuntimePublicationPreflight({
    officialRegistrySet,
    discoveryReport,
    mountInput
  })
  const transactionPreCommitPlan = buildThirdPartyDataPackTransactionPreCommitPlan({
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight
  })
  const liveRegistrySwapProtection = buildThirdPartyDataPackLiveRegistrySwapProtection({
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight,
    transactionPreCommitPlan
  })
  const publicationRollbackRecovery = buildThirdPartyDataPackPublicationRollbackRecovery({
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection
  })
  const runtimePublicationCommitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
    officialRegistrySet,
    discoveryReport,
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery
  })
  if (
    runtimePublicationCommitAdapter.selectedPackageIds[0] !== electronOrdinaryTerminalPackageId
    || runtimePublicationCommitAdapter.entryCount !== defaultSummary.entryCount
  ) {
    throw new Error('Electron startup persistent-state product probe installed package identity did not match product_probe_pack')
  }

  return Object.freeze({
    officialRegistrySet,
    candidateRegistrySet: mountInput.candidateRegistrySet,
    candidateIdentity: mountInput.candidateIdentity,
    officialIdentity: runtimePublicationPreflight.officialIdentity,
    lockfileDraft: mountInput.lockfileDraft,
    lockfileHash: mountInput.lockfileHash,
    selectedPackageIds: mountInput.selectedPackageIds,
    blockedPackageIds: mountInput.blockedPackageIds,
    blockedCandidatePaths: mountInput.blockedCandidatePaths,
    loadOrder: mountInput.loadOrder,
    registryCount: mountInput.registryCount,
    entryCount: mountInput.entryCount,
    packageCount: mountInput.packageCount,
    summary: Object.freeze({
      selectedPackageCount: mountInput.selectedPackageIds.length,
      blockedPackageCount: mountInput.blockedPackageIds.length,
      blockedCandidateCount: mountInput.blockedCandidatePaths.length,
      loadOrderCount: mountInput.loadOrder.length,
      registryCount: mountInput.registryCount,
      entryCount: mountInput.entryCount,
      packageCount: mountInput.packageCount,
      diagnosticCount: mountInput.diagnostics.length
    }),
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery,
    runtimePublicationCommitAdapter
  })
}

const runWebResponseDeliveryStartupGateHandoffProductProbe = async(
  runtimeHost: unknown,
  source: ThirdPartyStartupGateProductProbeSummarySource = sampleProductProbeProfile
): Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult> => {
  const webTarget = webEventTargetFromRuntimeHost(runtimeHost)
  const pipeline = createThirdPartyDataPackWebUiIpcResponseDeliveryPipeline({
    enabled: true,
    readResultNormalizationPreflight: async() => createProductProbeUiIpcNormalizationPreflight(source),
    readPostCommitVerificationUiIpcOutcomeHandoff: async() =>
      createProductProbePostCommitUiIpcOutcomeHandoff(source),
    ...(webTarget === undefined
      ? {}
      : { host: createThirdPartyDataPackWebDomResponseDeliverySinkHost({ target: webTarget }) })
  })

  return await pipeline()
}

const responseDeliveryHandoffReady = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
): boolean => result.status === 'ready'
  && result.platformResponseDelivered === true
  && result.deliveryAcknowledgementConsumed === true
  && result.responseDeliveryStartupGateHandoffPrepared === true

const blockedStartupGateHandoffPreflightFromResponseDelivery = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult,
  source: ThirdPartyStartupGateProductProbeSummarySource = sampleProductProbeProfile
): ThirdPartyDataPackStartupGateHandoffPreflightResult => Object.freeze({
  ...createStartupGateHandoffPreflight(source),
  status: 'blocked',
  reason: result.reason,
  startupGateHandoffPreflight: 'blocked',
  startupGateHandoffPrepared: false,
  responseDeliveryOrchestrationConsumed: false,
  diagnostics: result.diagnostics,
  effects: Object.freeze({
    ...handoffEffects,
    responseDeliveryOrchestrationConsumed: false,
    startupGateHandoffPrepared: false
  })
})

const createSwappedLiveRegistrySource = async(
  context: ThirdPartyStartupGateRealProductProbeContext
): Promise<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult> => {
  const bundle = createProductProbeReportBundle(context)
  const liveRegistryReference = (() => {
    try {
      return getLiveContentRegistryReference()
    } catch {
      return publishOfficialContentRegistrySet(context.officialRegistrySet)
    }
  })()
  const runtimePublicationCommitHost = createProductProbeRuntimePublicationCommitHost(context)
  const pipeline = createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
    enabled: true,
    readRuntimePublicationPreflight: async() => bundle.runtimePublicationPreflight,
    readTransactionPreCommitPlan: async() => bundle.transactionPreCommitPlan,
    readLiveRegistrySwapProtection: async() => bundle.liveRegistrySwapProtection,
    readPublicationRollbackRecovery: async() => bundle.publicationRollbackRecovery,
    acknowledgeRuntimePublicationCommit: runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit,
    liveRegistryReference,
    candidateRegistrySet: context.candidateRegistrySet,
    candidateIdentity: context.candidateIdentity
  })

  return await pipeline()
}

const createStartupGateHandoffPreflight = (
  source: ThirdPartyStartupGateProductProbeSummarySource = sampleProductProbeProfile
): ThirdPartyDataPackStartupGateHandoffPreflightResult => ({
    status: 'deferred',
    responseDeliveryOrchestrationStatus: 'deferred',
    reason: 'startup gate handoff is prepared as a path-free preflight; LauncherApp, GameApp creation and persistent startup reads remain separate',
    startupGateHandoffPreflight: 'deferred',
    readOnly: true,
    startupGateHandoffPrepared: true,
    responseDeliveryOrchestrationConsumed: true,
    startupGateHandoffAllowed: false,
    launcherAppAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    saveReadAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    deliveryAcknowledgementAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: 'install',
    targetPackageId: source.selectedPackageIds[0]!,
    envelopeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success',
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: blockedPackageIdsFromSource(source),
    blockedCandidateCount: blockedCandidateCountFromSource(source),
    loadOrder: source.loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: source.candidateIdentity,
    lockfileHash: source.lockfileHash,
    deliveryEnvelope: {
      formatVersion: 1,
      kind: 'success',
      commandId: 'install',
      packageId: source.selectedPackageIds[0]!,
      candidateHash: source.candidateIdentity.candidateHash,
      lockfileHash: source.lockfileHash,
      messageKey: 'mods.ui.ipc.result.install.success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      summary: source.summary,
      diagnostics: []
    },
    checks: [],
    diagnostics: [],
    startupStages: [
      {
        id: 'response-delivery-orchestration-consumed',
        status: 'satisfied',
        requirementIds: ['startup-gate-contract', 'no-startup-side-effect-guard'],
        reason: 'Response delivery orchestration is consistent enough to describe startup handoff requirements.'
      },
      {
        id: 'startup-gate-preflight',
        status: 'satisfied',
        requirementIds: ['startup-gate-contract'],
        reason: 'Startup handoff inputs were inspected without invoking LauncherApp, GameApp or persistent reads.'
      },
      {
        id: 'persistent-install-state-read',
        status: 'deferred',
        requirementIds: ['persistent-install-state-source'],
        reason: 'Persistent package, settings, lockfile and transaction-log reads remain deferred.'
      }
    ],
    startupRequirements: [
      {
        id: 'startup-gate-contract',
        status: 'required',
        reason: 'Define the explicit startup gate contract.'
      },
      {
        id: 'launcher-app-boundary',
        status: 'required',
        reason: 'Launcher startup must stay separate from pure domain response orchestration.'
      },
      {
        id: 'persistent-install-state-source',
        status: 'required',
        reason: 'A later startup gate must read verified persistent install state.'
      },
      {
        id: 'live-registry-identity-source',
        status: 'required',
        reason: 'GameApp creation must wait until live registry identity matches persistent state.'
      },
      {
        id: 'save-cache-isolation-source',
        status: 'required',
        reason: 'Startup handoff must prove player saves and official cache state remain isolated.'
      },
      {
        id: 'game-app-creation-gate',
        status: 'required',
        reason: 'Pinia, router and GameApp creation must remain behind one gate.'
      },
      {
        id: 'startup-failure-reporting',
        status: 'required',
        reason: 'Startup failure reporting must use redacted diagnostics.'
      },
      {
        id: 'no-startup-side-effect-guard',
        status: 'required',
        reason: 'This preflight must not mount UI, read saves or write persistent data.'
      }
    ],
    summary: source.summary,
    effects: handoffEffects
  })

const startupPersistentStateSnapshotText = (
  source: ThirdPartyStartupGateProductProbeSummarySource = sampleProductProbeProfile
): string => `${JSON.stringify({
  formatVersion: 1,
  kind: 'web-startup-persistent-state-snapshot',
  packageId: source.selectedPackageIds[0]!,
  candidateIdentity: source.candidateIdentity,
  lockfileHash: source.lockfileHash,
  transactionLog: { committed: true },
  packageState: { matched: true },
  settingsState: { matched: true },
  modLockState: { matched: true },
  liveRegistry: { matched: true },
  saveCache: { isolated: true }
}, null, 2)}\n`

const seedWebStartupPersistentStateStore = async(
  store: WebIndexedDbImportPersistenceStore,
  source: ThirdPartyStartupGateProductProbeSummarySource = sampleProductProbeProfile
): Promise<void> => {
  const text = startupPersistentStateSnapshotText(source)
  await store.put(createDefaultWebIndexedDbImportRecord([
    {
      path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
      text,
      sizeBytes: text.length
    }
  ], THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID))
}

const seedWebStartupSettingsLockfileStore = async(
  store: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore,
  source: ThirdPartyStartupGateRealProductProbeContext
): Promise<void> => {
  await store.write({
    recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
    requestedCommandId: 'install',
    targetPackageId: source.selectedPackageIds[0]!,
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: source.blockedPackageIds,
    loadOrder: source.loadOrder,
    candidateHash: source.candidateIdentity.candidateHash,
    lockfileHash: source.lockfileHash,
    lockfileDraft: source.lockfileDraft
  })
}

const createAcceptedAppFactoryBindingHostResult = (
  envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
): ThirdPartyDataPackAppFactoryBindingHostResult => ({
  status: 'accepted',
  platform: envelope.platform,
  startupGateDecision: envelope.startupGateDecision,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: [],
  effects: {
    appFactoryBindingHostCalled: true,
    appFactoryBindingHostAccepted: true,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  }
})

const createAcceptedNormalStartupHandoffHostResult = (
  envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  options: { readonly realNormalStartupHostCalled?: boolean } = {}
): ThirdPartyDataPackNormalStartupHandoffHostResult => ({
  status: 'accepted',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: [],
  effects: {
    normalStartupHandoffHostCalled: true,
    normalStartupHandoffHostAccepted: true,
    realNormalStartupHostCalled: options.realNormalStartupHostCalled === true,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    gameAppMounted: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  }
})

type ThirdPartyStartupPersistentStateProductProbeSourceKind =
  | 'web-indexeddb'
  | 'electron-program-directory-userdata'

interface ThirdPartyStartupPersistentStateProductProbeContext {
  readonly sourceKind: ThirdPartyStartupPersistentStateProductProbeSourceKind
  readonly sourceContext: ThirdPartyStartupGateRealProductProbeContext
  readonly launcherBoundaryPreflight: ReturnType<typeof buildThirdPartyDataPackLauncherBoundaryPreflight>
  readonly startupPersistentStateSource: Awaited<ReturnType<ReturnType<typeof createThirdPartyDataPackStartupGatePersistentStateSource>>>
  readonly webResponseDeliveryStartupGateHandoff:
    ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
}

export interface CreateThirdPartyStartupPersistentStateProductProbeOptions {
  readonly runtimeHost?: unknown
  readonly store?: WebIndexedDbImportPersistenceStore
  readonly settingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
  readonly profile?: ThirdPartyStartupGateProductProbeProfileName
  readonly sourceKind?: ThirdPartyStartupPersistentStateProductProbeSourceKind
  readonly seedWebStartupPersistentState?: boolean
}

export interface CreateThirdPartyStartupGateProductProbeBootstrapSourceOptions {
  readonly runtimeHost?: unknown
  readonly profile?: ThirdPartyStartupGateProductProbeProfileName
}

const isStartupGateProductProbeOptions = (
  value: unknown
): value is CreateThirdPartyStartupGateProductProbeBootstrapSourceOptions => value !== null
  && typeof value === 'object'
  && (
    Object.prototype.hasOwnProperty.call(value, 'runtimeHost')
    || Object.prototype.hasOwnProperty.call(value, 'profile')
  )

const resolvePersistentStateProductProbeSourceKind = (
  sourceKind: ThirdPartyStartupPersistentStateProductProbeSourceKind | undefined
): ThirdPartyStartupPersistentStateProductProbeSourceKind =>
  sourceKind === 'electron-program-directory-userdata'
    ? 'electron-program-directory-userdata'
    : 'web-indexeddb'

const createWebStartupPersistentStateProductProbeContext = async(
  options: CreateThirdPartyStartupPersistentStateProductProbeOptions
): Promise<ThirdPartyStartupPersistentStateProductProbeContext> => {
  const profile = resolveProductProbeProfile(options.profile)
  const sourceContext = requireRealProductProbeContext(profile)
  const store = options.store ?? createWebIndexedDbImportPersistenceStore()
  const settingsLockfileStore = options.settingsLockfileStore
    ?? createWebIndexedDbSettingsLockfilePersistentWriterStore()
  if (options.seedWebStartupPersistentState !== false) {
    await seedWebStartupPersistentStateStore(store, sourceContext)
    await seedWebStartupSettingsLockfileStore(settingsLockfileStore, sourceContext)
  }
  const runtimeHost = options.runtimeHost ?? defaultRuntimeHost()
  const webResponseDeliveryStartupGateHandoff =
    await runWebResponseDeliveryStartupGateHandoffProductProbe(runtimeHost, sourceContext)
  const startupGateHandoffPreflight =
    responseDeliveryHandoffReady(webResponseDeliveryStartupGateHandoff)
      ? createStartupGateHandoffPreflight(sourceContext)
      : blockedStartupGateHandoffPreflightFromResponseDelivery(
          webResponseDeliveryStartupGateHandoff,
          sourceContext
        )

  const execution = await executeThirdPartyDataPackWebStartupGatePersistentStateExecution({
    startupGateHandoffPreflight,
    webHost: createThirdPartyDataPackWebStartupPersistentStateSourceHost({
      store,
      settingsLockfileStore
    })
  })
  const startupDecisionEnvelope = buildThirdPartyDataPackWebStartupGateDecisionEnvelope({
    execution
  })
  const launcherBoundaryPreflight = buildThirdPartyDataPackLauncherBoundaryPreflight({
    startupDecisionEnvelope
  })
  const startupPersistentStateSource =
    await createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() =>
        execution.sourceAdapterExecution.adapterResult
    })()

  return Object.freeze({
    sourceKind: 'web-indexeddb',
    sourceContext,
    launcherBoundaryPreflight,
    startupPersistentStateSource,
    webResponseDeliveryStartupGateHandoff
  })
}

const createElectronStartupPersistentStateProductProbeContext = async(
  options: CreateThirdPartyStartupPersistentStateProductProbeOptions
): Promise<ThirdPartyStartupPersistentStateProductProbeContext> => {
  const runtimeHost = options.runtimeHost ?? defaultRuntimeHost()
  const sourceContext = await createInstalledElectronProductProbeContext(runtimeHost)
  const webResponseDeliveryStartupGateHandoff =
    await runWebResponseDeliveryStartupGateHandoffProductProbe(runtimeHost, sourceContext)
  const startupGateHandoffPreflight =
    responseDeliveryHandoffReady(webResponseDeliveryStartupGateHandoff)
      ? createStartupGateHandoffPreflight(sourceContext)
      : blockedStartupGateHandoffPreflightFromResponseDelivery(
          webResponseDeliveryStartupGateHandoff,
          sourceContext
        )

  const execution = await executeThirdPartyDataPackElectronStartupGatePersistentStateExecution({
    startupGateHandoffPreflight,
    electronHost: createElectronStartupPersistentStateReadHostFromRuntimeHost(runtimeHost)
  })
  const startupDecisionEnvelope = buildThirdPartyDataPackElectronStartupGateDecisionEnvelope({
    execution
  })
  const launcherBoundaryPreflight = buildThirdPartyDataPackLauncherBoundaryPreflight({
    startupDecisionEnvelope
  })
  const startupPersistentStateSource =
    await createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() =>
        execution.sourceAdapterExecution.adapterResult
    })()

  return Object.freeze({
    sourceKind: 'electron-program-directory-userdata',
    sourceContext,
    launcherBoundaryPreflight,
    startupPersistentStateSource,
    webResponseDeliveryStartupGateHandoff
  })
}

const createThirdPartyStartupPersistentStateProductProbeContext = async(
  options: CreateThirdPartyStartupPersistentStateProductProbeOptions
): Promise<ThirdPartyStartupPersistentStateProductProbeContext> =>
  resolvePersistentStateProductProbeSourceKind(options.sourceKind) === 'electron-program-directory-userdata'
    ? createElectronStartupPersistentStateProductProbeContext(options)
    : createWebStartupPersistentStateProductProbeContext(options)

const createReadyStartupStateSnapshot = (
  source: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyDataPackStartupGatePersistentStateSnapshot => Object.freeze({
  formatVersion: 1,
  kind: 'startup-persistent-state-snapshot',
  commandId: 'install',
  packageId: source.selectedPackageIds[0]!,
  candidateHash: source.candidateIdentity.candidateHash,
  lockfileHash: source.lockfileHash,
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
  messageKey: 'mods.ui.ipc.result.install.success',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false,
  summary: source.summary,
  diagnostics: []
})

const startupPersistentStateSourceEffects =
  (): ThirdPartyDataPackStartupGatePersistentStateSourceResult['effects'] => ({
    startupGatePersistentStateSourceCalled: true,
    persistentStateSourceAdapterCalled: true,
    startupStateSnapshotAccepted: true,
    normalStartupContinuationAllowed: true,
    launcherAppCreated: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })

const startupPersistentStateAdapterEffects =
  (): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['effects'] => ({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    electronIpcExposed: false,
    electronIpcResponseSent: false,
    webFilePickerOpened: false,
    webUiBridgeOpened: false,
    webUiResponsePublished: false,
    androidFilePickerOpened: false,
    androidUiBridgeOpened: false,
    androidUiResponsePublished: false,
    commandDispatcherCalled: false,
    commandDispatched: false,
    atomicCommitExecutorCalled: false,
    transactionCommitted: false,
    transactionLogPrepared: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecutorCalled: false,
    postCommitVerificationExecuted: false,
    startupPersistentStateSourceAdapterCalled: true,
    injectedSourceHostCalled: false,
    startupStateSnapshotReceived: true,
    startupStateSnapshotNormalized: true,
    transactionLogRead: false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveRead: false,
    saveCacheIsolationChecked: false,
    successEnvelopeDelivered: false,
    failureEnvelopeDelivered: false,
    retryStateDelivered: false,
    rollbackStateDelivered: false,
    uiIpcResponseDelivered: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    packageFilesRestored: false,
    lockfileWritten: false,
    lockfileRestored: false,
    settingsWritten: false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })

const createReadyStartupPersistentStateSource = (
  source: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyDataPackStartupGatePersistentStateSourceResult => Object.freeze({
  kind: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
  mode: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
  status: 'ready',
  reason: 'path-free startup persistent state proof is ready for normal startup handoff',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  normalStartupContinuationAllowed: true,
  sourceAdapterStatus: 'executed',
  requestedCommandId: 'install',
  targetPackageId: source.selectedPackageIds[0]!,
  selectedPackageIds: source.selectedPackageIds,
  blockedPackageIds: source.blockedPackageIds,
  blockedCandidateCount: source.blockedCandidatePaths.length,
  loadOrder: source.loadOrder,
  registryCount: source.registryCount,
  entryCount: source.entryCount,
  packageCount: source.packageCount,
  candidateHash: source.candidateIdentity.candidateHash,
  lockfileHash: source.lockfileHash,
  persistentStateProofs,
  diagnostics: [],
  summary: source.summary,
  effects: startupPersistentStateSourceEffects()
})

const createReadyStartupPersistentStateAdapterResult = (
  source: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult => Object.freeze({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  reason: 'startup persistent state proof normalized for product startup handoff',
  startupGatePersistentStateSourceAdapter: 'executed',
  readOnly: true,
  injectedSourceHostRequired: true,
  startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
  injectedSourceHostMode: 'web-indexeddb-startup-persistent-state',
  sourceHostCalled: true,
  startupStateSnapshotReceived: true,
  startupStateSnapshotNormalized: true,
  startupPersistentStateSourceAdapterAllowed: true,
  persistentStartupReadAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  startupFailureReportingAllowed: false,
  launcherAppAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: source.selectedPackageIds[0]!,
  selectedPackageIds: source.selectedPackageIds,
  blockedPackageIds: source.blockedPackageIds,
  blockedCandidateCount: source.blockedCandidatePaths.length,
  loadOrder: source.loadOrder,
  registryCount: source.registryCount,
  entryCount: source.entryCount,
  packageCount: source.packageCount,
  candidateIdentity: source.candidateIdentity,
  lockfileHash: source.lockfileHash,
  startupStateSnapshot: createReadyStartupStateSnapshot(source),
  checks: [],
  diagnostics: [],
  summary: source.summary,
  effects: startupPersistentStateAdapterEffects()
})

const createReadyStartupGatePersistentStateExecution = (
  source: ThirdPartyStartupGateRealProductProbeContext
): ThirdPartyDataPackWebStartupGatePersistentStateExecutionResult => Object.freeze({
  kind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  mode: THIRD_PARTY_DATA_PACK_WEB_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
  platform: 'web',
  startupGateHandoffStatus: 'deferred',
  persistentStatePreflight: {
    status: 'deferred'
  },
  sourceAdapterExecution: {
    adapterResult: createReadyStartupPersistentStateAdapterResult(source)
  }
} as unknown as ThirdPartyDataPackWebStartupGatePersistentStateExecutionResult)

const createReadyLauncherBoundaryPreflight = (
  source: ThirdPartyStartupGateRealProductProbeContext
) => buildThirdPartyDataPackLauncherBoundaryPreflight({
    startupDecisionEnvelope: buildThirdPartyDataPackWebStartupGateDecisionEnvelope({
      execution: createReadyStartupGatePersistentStateExecution(source)
    })
  })

const createRealNormalStartupCommitSource = (
  source: ThirdPartyStartupGateRealProductProbeContext
) => createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
    enabled: true,
    readRuntimePublicationCommitAfterPostCommitVerification: async() =>
      createAcceptedRealCommitAfterPostCommit(source),
    readRuntimePublicationLiveRegistrySwap: async() =>
      createSwappedLiveRegistrySource(source),
    readLauncherBoundaryPreflight: async() =>
      createReadyLauncherBoundaryPreflight(source),
    readStartupGatePersistentStateSource: async() =>
      createReadyStartupPersistentStateSource(source),
    acknowledgeNormalStartupHandoff: async envelope =>
      createAcceptedNormalStartupHandoffHostResult(envelope, {
        realNormalStartupHostCalled: true
      })
  })

export const createThirdPartyStartupGateProductProbeBootstrapSource = (
  optionsOrRuntimeHost?: CreateThirdPartyStartupGateProductProbeBootstrapSourceOptions | unknown
) => {
  const options = isStartupGateProductProbeOptions(optionsOrRuntimeHost)
    ? optionsOrRuntimeHost
    : { runtimeHost: optionsOrRuntimeHost }
  const profile = resolveProductProbeProfile(options.profile)
  const productProbeContext = requireRealProductProbeContext(profile)
  const readRuntimePublicationCommitNormalStartup =
    createRealNormalStartupCommitSource(productProbeContext)

  return createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
    enabled: true,
    ...(options.runtimeHost === undefined ? {} : { runtimeHost: options.runtimeHost }),
    readRuntimePublicationCommitAfterPostCommitVerification: async() =>
      createAcceptedRealCommitAfterPostCommit(productProbeContext),
    readRuntimePublicationLiveRegistrySwapHostConnection: async() =>
      createSwappedLiveRegistrySource(productProbeContext),
    readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection:
      readRuntimePublicationCommitNormalStartup
  })
}

export const createThirdPartyStartupPersistentStateProductProbeBootstrapSource = (
  options: CreateThirdPartyStartupPersistentStateProductProbeOptions = {}
) => {
  let contextPromise: Promise<ThirdPartyStartupPersistentStateProductProbeContext> | undefined
  let runtimePublicationLiveRegistrySwapPromise:
    Promise<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>
    | undefined
  const readContext = async() => {
    contextPromise ??= createThirdPartyStartupPersistentStateProductProbeContext(options)
    return contextPromise
  }
  const readRuntimePublicationLiveRegistrySwapOnce = async() => {
    runtimePublicationLiveRegistrySwapPromise ??= (async() => {
      const context = await readContext()
      return createSwappedLiveRegistrySource(context.sourceContext)
    })()
    return runtimePublicationLiveRegistrySwapPromise
  }
  const normalStartupPipeline =
    createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline({
      enabled: true,
      readLauncherBoundaryPreflight: async() =>
        (await readContext()).launcherBoundaryPreflight,
      readStartupGatePersistentStateSource: async() =>
        (await readContext()).startupPersistentStateSource,
      readRuntimePublicationLiveRegistrySwap: readRuntimePublicationLiveRegistrySwapOnce,
      acknowledgeAppFactoryBinding: async envelope =>
        createAcceptedAppFactoryBindingHostResult(envelope),
      acknowledgeNormalStartupHandoff: async envelope =>
        createAcceptedNormalStartupHandoffHostResult(envelope, {
          realNormalStartupHostCalled: true
        })
    })

  const sharedRendererStartupGateBootstrap =
    createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
      enabled: true,
      ...(options.runtimeHost === undefined ? {} : { runtimeHost: options.runtimeHost }),
      readRuntimePublicationCommitAfterPostCommitVerification: async() => {
        const context = await readContext()
        return createAcceptedRealCommitAfterPostCommit(context.sourceContext)
      },
      readRuntimePublicationLiveRegistrySwapHostConnection:
        readRuntimePublicationLiveRegistrySwapOnce,
      readRuntimePublicationNormalStartupAppFactoryBindingHostConnection:
        normalStartupPipeline
    })

  return async() => {
    const result = await sharedRendererStartupGateBootstrap()
    const {
      sourceKind,
      sourceContext,
      startupPersistentStateSource,
      webResponseDeliveryStartupGateHandoff
    } = await readContext()
    const startupPersistentStateSourceReady =
      startupPersistentStateSource.status === 'ready'
    const appFactoryBindingSourceStatus = result.appFactoryBindingSourceStatus
      ?? (result.status === 'ready' && startupPersistentStateSourceReady ? 'ready' : undefined)

    return Object.freeze({
      ...result,
      startupPersistentStateSourceKind: sourceKind,
      startupPersistentStateSourceStatus: startupPersistentStateSource.status,
      ...(startupPersistentStateSource.startupPersistentStateSourceHostMode === undefined
        ? {}
        : {
            startupPersistentStateSourceHostMode:
              startupPersistentStateSource.startupPersistentStateSourceHostMode
          }),
      ...(startupPersistentStateSource.injectedSourceHostMode === undefined
        ? {}
        : {
            startupPersistentStateInjectedSourceHostMode:
              startupPersistentStateSource.injectedSourceHostMode
          }),
      webResponseDeliveryStartupGateHandoffStatus:
        webResponseDeliveryStartupGateHandoff.status,
      responseDeliveryStartupGateHandoffPrepared:
        webResponseDeliveryStartupGateHandoff.responseDeliveryStartupGateHandoffPrepared,
      webResponseDeliveryAcknowledgementConsumed:
        webResponseDeliveryStartupGateHandoff.deliveryAcknowledgementConsumed,
      ...(appFactoryBindingSourceStatus === undefined ? {} : { appFactoryBindingSourceStatus }),
      ...createProductProbeContentFallbackSummary(sourceContext),
      ...(startupPersistentStateSource.persistentStateProofs === undefined
        ? {}
        : { persistentStateProofs: startupPersistentStateSource.persistentStateProofs }),
      effects: Object.freeze({
        ...result.effects,
        uiIpcResponseDelivered:
          result.effects.uiIpcResponseDelivered
          || webResponseDeliveryStartupGateHandoff.effects.uiIpcResponseDelivered,
        startupPersistentStateSourceCalled:
          result.effects.startupPersistentStateSourceCalled
          || startupPersistentStateSource.sourceCalled,
        startupStateSnapshotAccepted:
          result.effects.startupStateSnapshotAccepted
          || startupPersistentStateSource.effects.startupStateSnapshotAccepted,
        appFactoryBindingSourceCalled:
          result.effects.appFactoryBindingSourceCalled
          || appFactoryBindingSourceStatus === 'ready',
        appFactoryBindingContinuationAllowed:
          result.effects.appFactoryBindingContinuationAllowed
          || appFactoryBindingSourceStatus === 'ready'
      })
    })
  }
}
