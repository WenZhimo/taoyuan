import { spawn, spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { unzipSync } from 'fflate'

const root = process.cwd()
const require = createRequire(import.meta.url)
const targetArg = process.argv.find(argument => argument.startsWith('--target='))
const target = targetArg?.slice('--target='.length) ?? 'all'
if (!['web', 'electron', 'android', 'all'].includes(target)) {
  throw new Error('Expected --target=web, --target=electron, --target=android, or --target=all')
}

const webRoot = path.join(root, 'docs')
const packagedRoot = path.join(root, 'pkg', 'win-unpacked')
const packagedExecutable = path.join(packagedRoot, 'taoyuan.exe')
const cacheRoot = path.join(root, 'node_modules', '.cache', 'taoyuan-product-runtime-probe')
fs.mkdirSync(cacheRoot, { recursive: true })
const runRoot = fs.mkdtempSync(path.join(cacheRoot, 'run-'))
const metadata = JSON.parse(fs.readFileSync(
  path.join(root, 'src', 'generated', 'mods', 'official-precompiled-metadata.json'),
  'utf8'
))
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const artifact = JSON.parse(fs.readFileSync(
  path.join(root, 'src', 'generated', 'mods', 'official-precompiled-registry.json'),
  'utf8'
))
const expectedRegistryIds = artifact.snapshot.registries.map(registry => registry.registryId)
const expectedHashes = {
  artifactHash: metadata.artifactHash,
  contentHash: metadata.contentHash,
  schemaSetHash: metadata.schemaSetHash,
  environmentHash: metadata.environmentHash,
  snapshotHash: metadata.snapshotHash
}
const defaultStartupGateRegistryCount = 54
const defaultStartupGateEntryCount = 4243
const visibleProbePackageId = 'product_probe_pack'
const visibleProbeItemId = `${visibleProbePackageId}:linen_ribbon`
const visibleProbeRecipeId = `${visibleProbePackageId}:linen_ribbon_snack`
const visibleProbeShopOfferId = `${visibleProbePackageId}:shop/wanwupu/linen_ribbon/0`
const visibleProbePackageFixtures = {
  v1: {
    version: '1.0.0',
    itemNameFallback: 'Product Probe Linen Ribbon',
    recipeNameFallback: 'Product Probe Ribbon Snack',
    shopOfferNameFallback: 'Product Probe Ribbon Stand'
  },
  v2: {
    version: '1.1.0',
    itemNameFallback: 'Product Probe Linen Ribbon v2',
    recipeNameFallback: 'Product Probe Ribbon Snack v2',
    shopOfferNameFallback: 'Product Probe Ribbon Stand v2'
  }
}
const expectedVisibleProbeFixture = scenario =>
  visibleProbePackageFixtures[scenario.visibleProbeVariant ?? (scenario.visibleUpgrade ? 'v2' : 'v1')]
const webScenarios = [
  { name: 'precompiled', fault: null, source: 'precompiled', status: 'official-precompiled-hit' },
  {
    name: 'startup-gate-ready',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    startupGateReady: true
  },
  {
    name: 'startup-persistent-state-ready',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupGateRealRuntimePublicationCommit: false,
    startupGateRegistryCount: 54
  },
  {
    name: 'visible-import-web-ordinary',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    visibleImportWebOrdinary: true
  },
  {
    name: 'visible-import-web-installed-startup-persistent-state',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    visibleImportInstalledStartupPersistentState: true,
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupGateTargetPackageId: 'product_probe_pack'
  },
  {
    name: 'visible-import-web-replace-then-restart',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    visibleImportInstalledReplacementSequence: true,
    startupPersistentStateSourceKind: 'web-indexeddb',
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupGateTargetPackageId: 'product_probe_pack'
  },
  {
    name: 'visible-import-web-disable-then-restart',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    visibleImportInstalledDisableSequence: true,
    startupPersistentStateSourceKind: 'web-indexeddb',
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupGateTargetPackageId: 'product_probe_pack'
  },
  {
    name: 'visible-import-web-disable-uninstall-restart',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    visibleImportInstalledDisableUninstallSequence: true,
    startupPersistentStateSourceKind: 'web-indexeddb',
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupGateTargetPackageId: 'product_probe_pack'
  },
  {
    name: 'visible-import-web-uninstall-then-restart',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    visibleImportInstalledUninstallSequence: true,
    startupPersistentStateSourceKind: 'web-indexeddb',
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupGateTargetPackageId: 'product_probe_pack'
  },
  {
    name: 'visible-import-web-disable-enable-restart',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    visibleImportInstalledDisableEnableSequence: true,
    startupPersistentStateSourceKind: 'web-indexeddb',
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupGateTargetPackageId: 'product_probe_pack'
  },
  { name: 'missing', fault: 'missing', source: 'static-fallback', status: 'cache-miss-not-found' },
  { name: 'corrupt', fault: 'corrupt', source: 'static-fallback', status: 'cache-invalid-json' },
  {
    name: 'environment-mismatch',
    fault: 'environment-mismatch',
    source: 'static-fallback',
    status: 'cache-miss-environment-changed'
  }
]

const electronScenarios = [
  { name: 'packaged-baseline', fault: null, source: null, status: null, isolated: false },
  {
    name: 'cache-miss-write',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    cacheStatus: 'cache-miss-not-found',
    cacheWriteStatus: 'written',
    dataRoot: 'cache-sequence'
  },
  {
    name: 'disk-cache-fast-hit',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'cache-sequence'
  },
  {
    name: 'mod-lock-write-read',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'cache-sequence',
    modLockWriteRead: true
  },
  {
    name: 'settings-lockfile-writer-write-read',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'cache-sequence',
    settingsLockfileWriteRead: true
  },
  {
    name: 'package-file-write-read',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'cache-sequence',
    packageFileWriteRead: true
  },
  {
    name: 'package-file-restore',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'cache-sequence',
    packageFileRestore: true
  },
  {
    name: 'install-transaction-commit-finalization',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'install-transaction-commit-finalization',
    cacheSeed: 'valid',
    installTransactionCommitFinalization: true,
    rendererUiIpcInstallResult: true
  },
  {
    name: 'install-command-dispatch-ipc',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'install-command-dispatch-ipc',
    cacheSeed: 'valid',
    installCommandDispatchIpc: true
  },
  {
    name: 'install-command-lifecycle',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'install-command-lifecycle',
    cacheSeed: 'valid',
    installCommandDispatchIpc: true,
    installCommandLifecycle: true
  },
  {
    name: 'ordinary-install-terminal-connection',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'ordinary-install-terminal-connection',
    cacheSeed: 'valid',
    installCommandDispatchIpc: true,
    installCommandLifecycle: true,
    installTransactionCommitFinalization: true,
    ordinaryInstallTerminalConnection: true,
    rendererUiIpcInstallResult: true,
    startupGateReady: true,
    startupGateTargetPackageId: 'product_probe_pack'
  },
  {
    name: 'ordinary-install-terminal-rollback',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'ordinary-install-terminal-rollback',
    cacheSeed: 'valid',
    packageFileRestore: true,
    ordinaryInstallTerminalConnection: true,
    ordinaryInstallTerminalRollback: true,
    ordinaryInstallTerminalRegistryCount: defaultStartupGateRegistryCount
  },
  {
    name: 'visible-import-renderer-live-registry',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-live-registry',
    cacheSeed: 'valid',
    visibleImportRendererLiveRegistry: true
  },
  {
    name: 'visible-import-installed-startup-persistent-state',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-live-registry',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245
  },
  {
    name: 'visible-import-replacement-initial-import',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-replacement',
    cacheSeed: 'valid',
    visibleImportRendererLiveRegistry: true
  },
  {
    name: 'visible-import-replace-installed-package',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-replacement',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245,
    visibleImportRendererLiveRegistry: true,
    visibleUpgrade: true
  },
  {
    name: 'visible-import-replaced-installed-startup-persistent-state',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-replacement',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245,
    startupGateExpectedProductProbeVariant: 'v2'
  },
  {
    name: 'visible-import-installed-startup-persistent-state-cache-corrupt-fallback',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    artifactHashSource: 'loaded-product',
    cacheStatus: 'cache-invalid-json',
    cacheWriteStatus: 'written',
    dataRoot: 'visible-import-renderer-live-registry',
    cacheSeed: 'corrupt',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245
  },
  {
    name: 'visible-import-renderer-rollback',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-rollback',
    cacheSeed: 'valid',
    visibleImportRollback: true
  },
  {
    name: 'visible-import-renderer-rollback-restart',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-rollback',
    cacheSeed: 'valid'
  },
  {
    name: 'visible-import-renderer-failure',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-failure',
    cacheSeed: 'valid',
    visibleImportFailure: true
  },
  {
    name: 'visible-import-renderer-failure-restart',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-failure',
    cacheSeed: 'valid'
  },
  {
    name: 'visible-import-disable-installed-package',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-live-registry',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245,
    visibleDisable: true
  },
  {
    name: 'visible-import-disabled-installed-startup-persistent-state',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-live-registry',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupGateDisabled: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4242
  },
  {
    name: 'visible-import-disable-uninstall-initial-import',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-disable-uninstall',
    cacheSeed: 'valid',
    visibleImportRendererLiveRegistry: true
  },
  {
    name: 'visible-import-disable-uninstall-disable',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-disable-uninstall',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245,
    visibleDisable: true
  },
  {
    name: 'visible-import-uninstall-disabled-package',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-disable-uninstall',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupGateDisabled: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4242,
    visibleUninstall: true
  },
  {
    name: 'visible-import-uninstalled-startup-persistent-state',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-disable-uninstall',
    cacheSeed: 'valid',
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupGateUninstalled: true
  },
  {
    name: 'visible-import-uninstall-enabled-initial-import',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-direct-uninstall',
    cacheSeed: 'valid',
    visibleImportRendererLiveRegistry: true
  },
  {
    name: 'visible-import-uninstall-enabled-package',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-direct-uninstall',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245,
    visibleUninstall: true,
    visibleUninstallStartedEnabled: true
  },
  {
    name: 'visible-import-uninstalled-enabled-startup-persistent-state',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-direct-uninstall',
    cacheSeed: 'valid',
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupGateUninstalled: true
  },
  {
    name: 'visible-import-enable-disabled-installed-package',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-live-registry',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupGateDisabled: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4242,
    visibleEnable: true
  },
  {
    name: 'visible-import-reenabled-installed-startup-persistent-state',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'visible-import-renderer-live-registry',
    cacheSeed: 'valid',
    startupGateReady: true,
    startupPersistentStateReady: true,
    startupPersistentStateUseInstalledState: true,
    startupPersistentStateSourceKind: 'electron-program-directory-userdata',
    startupPersistentStateSourceHostMode: 'electron-program-directory-startup-persistent-state',
    startupPersistentStateExpectsResponseDeliveryHandoff: false,
    startupGateTargetPackageId: 'product_probe_pack',
    startupGateEntryCount: 4245
  },
  {
    name: 'startup-gate-ready',
    fault: null,
    source: 'disk-cache',
    status: 'not-attempted',
    artifactHashSource: 'disk-cache',
    cacheStatus: 'disk-cache-fast-hit',
    cacheWriteStatus: 'not-needed',
    dataRoot: 'cache-sequence',
    startupGateReady: true
  },
  {
    name: 'cache-corrupt-fallback',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    cacheSeed: 'corrupt',
    cacheStatus: 'cache-invalid-json',
    cacheWriteStatus: 'written'
  },
  {
    name: 'cache-environment-mismatch-fallback',
    fault: null,
    source: 'precompiled',
    status: 'official-precompiled-hit',
    cacheSeed: 'environment-mismatch',
    cacheStatus: 'cache-miss-environment-changed',
    cacheWriteStatus: 'written'
  },
  {
    name: 'cache-corrupt-static-fallback',
    fault: 'corrupt',
    source: 'static-fallback',
    status: 'cache-invalid-json',
    cacheSeed: 'corrupt',
    cacheStatus: 'cache-invalid-json',
    cacheWriteStatus: 'written'
  }
]

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const scenarioRunsVisibleDataPackOperation = scenario =>
  !!(
    scenario.visibleImportWebOrdinary
    || scenario.visibleImportRendererLiveRegistry
    || scenario.visibleEnable
    || scenario.visibleUpgrade
    || scenario.visibleImportRollback
    || scenario.visibleImportFailure
    || scenario.visibleDisable
    || scenario.visibleUninstall
  )

const scenarioExpectsRendererUiIpcProbe = scenario =>
  !scenarioRunsVisibleDataPackOperation(scenario) || !!scenario.rendererUiIpcInstallResult

const scenarioExpectsResponseDeliverySurface = scenario =>
  scenarioExpectsRendererUiIpcProbe(scenario)

const scenarioExpectsVisibleImportPanelSurface = scenario =>
  scenarioRunsVisibleDataPackOperation(scenario)

const assertInside = (parent, candidate, description) => {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate))
  assert(
    relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)),
    `${description} escaped the probe root`
  )
}

const readJson = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const cacheFilePath = userDataPath => path.join(
  userDataPath,
  'mod-cache',
  `sha256-${metadata.environmentHash.slice('sha256:'.length)}`,
  'official-registry-cache-v2.json'
)

const sha256Utf8 = text => `sha256:${crypto.createHash('sha256').update(text, 'utf8').digest('hex')}`

const createCacheText = identityOverrides => {
  const artifactText = JSON.stringify(artifact, null, 2) + '\n'
  return JSON.stringify({
    cacheFormatVersion: 2,
    identity: {
    artifactHash: metadata.artifactHash,
    contentHash: metadata.contentHash,
    schemaSetHash: metadata.schemaSetHash,
    environmentHash: metadata.environmentHash,
    snapshotHash: metadata.snapshotHash,
    ...identityOverrides
    },
    payloadHash: sha256Utf8(artifactText),
    artifact
  }, null, 2) + '\n'
}

const seedElectronCache = (userDataPath, seed) => {
  if (!seed) return
  const filePath = cacheFilePath(userDataPath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const contents = seed === 'valid'
    ? createCacheText()
    : seed === 'corrupt'
    ? createCacheText().slice(0, 128)
    : createCacheText({ environmentHash: `sha256:${'0'.repeat(64)}` })
  fs.writeFileSync(filePath, contents, 'utf8')
}

const assertOfficialCacheFile = (userDataPath, scenarioName) => {
  const filePath = cacheFilePath(userDataPath)
  assert(fs.existsSync(filePath), `${scenarioName}: official cache file is missing`)
  const envelope = readJson(filePath)
  assert(envelope.cacheFormatVersion === 2, `${scenarioName}: wrong cache format version`)
  assert(envelope.payloadHash === expectedHashes.artifactHash,
    `${scenarioName}: disk cache payload hash mismatch`)
  assert(
    JSON.stringify(envelope.identity) === JSON.stringify(expectedHashes),
    `${scenarioName}: disk cache identity mismatch`
  )
  assert(envelope.artifact?.snapshot?.registries?.length === 54,
    `${scenarioName}: disk cache registry count mismatch`)
  assert(envelope.artifact.snapshot.registries.reduce(
    (total, registry) => total + registry.entries.length,
    0
  ) === 4242, `${scenarioName}: disk cache entry count mismatch`)
}

const directoryFingerprint = directory => {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => {
      const relative = path.join(entry.parentPath.slice(directory.length), entry.name)
        .replace(/^[/\\]+/, '')
      const stat = fs.statSync(path.join(directory, relative))
      return [relative.replaceAll('\\', '/'), stat.size, Math.trunc(stat.mtimeMs)]
    })
    .sort((left, right) => left[0].localeCompare(right[0]))
}

const directoryContentFingerprint = directory => {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => {
      const relative = path.join(entry.parentPath.slice(directory.length), entry.name)
        .replace(/^[/\\]+/, '')
      const contents = fs.readFileSync(path.join(directory, relative))
      return [
        relative.replaceAll('\\', '/'),
        contents.length,
        crypto.createHash('sha256').update(contents).digest('hex')
      ]
    })
    .sort((left, right) => left[0].localeCompare(right[0]))
}

const activePackageContentFingerprint = directory =>
  directoryContentFingerprint(directory)
    .filter(([relative]) => !relative.startsWith('.taoyuan-package-file-backups/'))

const fileFingerprint = filePath => {
  if (!fs.existsSync(filePath)) return { exists: false }
  const fileStat = fs.statSync(filePath)
  return {
    exists: true,
    size: fileStat.size,
    mtimeMs: Math.trunc(fileStat.mtimeMs)
  }
}

const fileContentFingerprint = filePath => {
  if (!fs.existsSync(filePath)) return { exists: false }
  const contents = fs.readFileSync(filePath)
  return {
    exists: true,
    size: contents.length,
    sha256: crypto.createHash('sha256').update(contents).digest('hex')
  }
}

const modLockFilePath = userDataPath => path.join(userDataPath, 'mod-lock.json')

const installTransactionPreparedLogPath = userDataPath =>
  path.join(userDataPath, 'mod-transactions', 'install-transaction-prepared.json')

const modLockTemporaryNames = userDataPath => {
  if (!fs.existsSync(userDataPath)) return []
  return fs.readdirSync(userDataPath, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.startsWith('.mod-lock.json.tmp-'))
    .map(entry => entry.name)
    .sort()
}

const modLockProtectedPaths = (programDirectoryPath, userDataPath) => ({
  settings: path.join(userDataPath, 'settings.json'),
  save: path.join(userDataPath, 'saves', 'probe-save.tyx'),
  officialCache: cacheFilePath(userDataPath),
  packageFile: path.join(programDirectoryPath, 'probe-protected-files', 'probe-pack', 'manifest.json'),
  transactionLog: path.join(userDataPath, 'mod-transactions', 'pending.json')
})

const packageFileProbePaths = programDirectoryPath => {
  const packageRoot = path.join(programDirectoryPath, 'mods', 'product-probe-pack')
  return {
    packageRoot,
    manifest: path.join(packageRoot, 'manifest.json'),
    itemFile: path.join(packageRoot, 'data', 'items.json'),
    backupManifest: path.join(packageRoot, '.taoyuan-package-file-backups', 'manifest.json.backup'),
    backupRoot: path.join(packageRoot, '.taoyuan-package-file-backups')
  }
}

const packageFileTemporaryNames = programDirectoryPath => {
  const paths = packageFileProbePaths(programDirectoryPath)
  return [paths.packageRoot, path.dirname(paths.itemFile), paths.backupRoot]
    .flatMap(directory => {
      if (!fs.existsSync(directory)) return []
      return fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.startsWith('.taoyuan-package-file-write-probe.tmp-'))
        .map(entry => `${path.basename(directory)}/${entry.name}`)
    })
    .sort()
}

const writeModLockProtectionSentinels = (programDirectoryPath, userDataPath) => {
  const paths = modLockProtectedPaths(programDirectoryPath, userDataPath)
  assert(fs.existsSync(paths.officialCache), 'mod-lock write/read probe requires a pre-existing official cache')
  fs.mkdirSync(path.dirname(paths.settings), { recursive: true })
  fs.mkdirSync(path.dirname(paths.save), { recursive: true })
  fs.mkdirSync(path.dirname(paths.packageFile), { recursive: true })
  fs.mkdirSync(path.dirname(paths.transactionLog), { recursive: true })
  fs.writeFileSync(paths.settings, '{"closeToTray":false,"autoLaunch":false}\n', 'utf8')
  fs.writeFileSync(paths.save, 'player-save-sentinel', 'utf8')
  fs.writeFileSync(paths.packageFile, '{"id":"probe_pack","version":"1.0.0"}\n', 'utf8')
  fs.writeFileSync(paths.transactionLog, '{"status":"pending"}\n', 'utf8')
}

const writePackageFileProtectionSentinels = programDirectoryPath => {
  const paths = packageFileProbePaths(programDirectoryPath)
  const previousManifest = '{"id":"previous_product_probe_pack","version":"0.9.0"}\n'
  fs.rmSync(paths.packageRoot, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(paths.manifest), { recursive: true })
  fs.writeFileSync(paths.manifest, previousManifest, 'utf8')
  return {
    previousManifest,
    beforeManifest: fileContentFingerprint(paths.manifest),
    beforeItemFile: fileContentFingerprint(paths.itemFile),
    beforeBackupManifest: fileContentFingerprint(paths.backupManifest)
  }
}

const modLockProtectedFingerprints = (programDirectoryPath, userDataPath) =>
  Object.fromEntries(Object.entries(modLockProtectedPaths(programDirectoryPath, userDataPath))
    .map(([name, filePath]) => [name, fileContentFingerprint(filePath)]))

const omitFingerprints = (fingerprints, omittedNames) =>
  Object.fromEntries(Object.entries(fingerprints)
    .filter(([name]) => !omittedNames.includes(name)))

const runProcess = (command, args, env, timeoutMs = 180_000) => new Promise((resolve, reject) => {
  const childEnv = { ...process.env, ...env }
  delete childEnv.ELECTRON_RUN_AS_NODE
  const child = spawn(command, args, {
    cwd: root,
    env: childEnv,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', chunk => { stdout += chunk })
  child.stderr.on('data', chunk => { stderr += chunk })
  const timer = setTimeout(() => {
    child.kill()
    reject(new Error(`Runtime probe process timed out: ${path.basename(command)}`))
  }, timeoutMs)
  child.once('error', reject)
  child.once('close', code => {
    clearTimeout(timer)
    if (code === 0) {
      resolve({ stdout, stderr })
    } else {
      reject(new Error(
        `Runtime probe process exited with ${code}: ${stderr.slice(0, 2000)}`
      ))
    }
  })
})

const runProcessBuffer = (command, args, env, timeoutMs = 180_000) => new Promise((resolve, reject) => {
  const childEnv = { ...process.env, ...env }
  delete childEnv.ELECTRON_RUN_AS_NODE
  const child = spawn(command, args, {
    cwd: root,
    env: childEnv,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  const stdout = []
  const stderr = []
  child.stdout.on('data', chunk => { stdout.push(chunk) })
  child.stderr.on('data', chunk => { stderr.push(chunk) })
  const timer = setTimeout(() => {
    child.kill()
    reject(new Error(`Runtime probe process timed out: ${path.basename(command)}`))
  }, timeoutMs)
  child.once('error', reject)
  child.once('close', code => {
    clearTimeout(timer)
    if (code === 0) {
      resolve({
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr).toString('utf8')
      })
    } else {
      reject(new Error(
        `Runtime probe process exited with ${code}: ${
          Buffer.concat(stderr).toString('utf8').slice(0, 2000)
        }`
      ))
    }
  })
})

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const apkPath = path.join(
  root,
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  `taoyuan-${packageJson.version}.apk`
)
const androidPackageId = 'com.games.wenzi.taoyuan'
const androidActivity = `${androidPackageId}/.MainActivity`
const androidProbeRequiredLabels = ['新的旅程', '关于游戏']
const androidProbeOptionalLabels = ['导入存档']

const findAndroidAdb = () => {
  const executableName = process.platform === 'win32' ? 'adb.exe' : 'adb'
  const candidates = [
    process.env.ANDROID_ADB,
    process.env.ADB,
    process.env.ANDROID_HOME
      ? path.join(process.env.ANDROID_HOME, 'platform-tools', executableName)
      : null,
    process.env.ANDROID_SDK_ROOT
      ? path.join(process.env.ANDROID_SDK_ROOT, 'platform-tools', executableName)
      : null,
    executableName
  ].filter(Boolean)

  return candidates.find(candidate => {
    if (candidate !== executableName) return fs.existsSync(candidate)
    const probe = spawnSync(candidate, ['version'], { stdio: 'ignore' })
    return !probe.error || probe.error.code !== 'ENOENT'
  })
}

const parseAdbDevices = stdout => stdout
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('List of devices'))
  .map(line => {
    const [serial, state] = line.split(/\s+/)
    return { serial, state }
  })

const resolveAndroidDevice = async adbPath => {
  await runProcess(adbPath, ['start-server'], {}, 30_000)
  const devicesOutput = await runProcess(adbPath, ['devices'], {}, 30_000)
  const devices = parseAdbDevices(devicesOutput.stdout)
  const requestedSerial = process.env.ANDROID_SERIAL
  const onlineDevices = devices.filter(device => device.state === 'device')
  const selected = requestedSerial
    ? devices.find(device => device.serial === requestedSerial)
    : onlineDevices[0]

  assert(selected, requestedSerial
    ? `Android device ${requestedSerial} was not listed by adb`
    : 'No online Android device was listed by adb')
  assert(selected.state === 'device', `Android device ${selected.serial} is ${selected.state}`)

  return {
    serial: selected.serial,
    listedDevices: devices.map(device => ({
      serial: device.serial,
      state: device.state
    }))
  }
}

const runAdb = (adbPath, serial, args, timeoutMs = 60_000) =>
  runProcess(adbPath, ['-s', serial, ...args], {}, timeoutMs)

const readAndroidUiXml = async (adbPath, serial) => {
  await runAdb(adbPath, serial, [
    'shell',
    'uiautomator',
    'dump',
    '/sdcard/taoyuan-window.xml'
  ], 30_000)
  const { stdout } = await runAdb(adbPath, serial, [
    'exec-out',
    'cat',
    '/sdcard/taoyuan-window.xml'
  ], 30_000)
  return stdout
}

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const uiXmlIncludesLabel = (xml, label) =>
  xml.includes(`text="${label}"`)
  || xml.includes(`content-desc="${label}"`)
  || xml.includes(label)

const findUiNodeBounds = (xml, label) => {
  const node = xml.match(new RegExp(
    `<node\\b[^>]*(?:text|content-desc)="${escapeRegExp(label)}"[^>]*>`,
    'u'
  ))?.[0]
  const bounds = node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/)
  if (!bounds) return null
  return {
    x: Math.round((Number(bounds[1]) + Number(bounds[3])) / 2),
    y: Math.round((Number(bounds[2]) + Number(bounds[4])) / 2)
  }
}

const waitForAndroidMainMenu = async (adbPath, serial, timeoutMs = 120_000) => {
  const deadline = Date.now() + timeoutMs
  let lastXml = ''
  let tappedEnterButton = false

  while (Date.now() < deadline) {
    try {
      const xml = await readAndroidUiXml(adbPath, serial)
      lastXml = xml
      const requiredLabelsReady = androidProbeRequiredLabels
        .every(label => uiXmlIncludesLabel(xml, label))
      if (requiredLabelsReady) {
        return {
          mainMenuReady: true,
          labels: Object.fromEntries([
            ...androidProbeRequiredLabels,
            ...androidProbeOptionalLabels
          ].map(label => [label, uiXmlIncludesLabel(xml, label)])),
          tappedEnterButton
        }
      }

      if (!tappedEnterButton) {
        const enterBounds = findUiNodeBounds(xml, '进入游戏')
        if (enterBounds) {
          await runAdb(adbPath, serial, [
            'shell',
            'input',
            'tap',
            String(enterBounds.x),
            String(enterBounds.y)
          ], 30_000)
          tappedEnterButton = true
          await delay(1000)
        }
      }
    } catch {
      // The WebView may still be starting; keep polling until the deadline.
    }
    await delay(1000)
  }

  return {
    mainMenuReady: false,
    labels: Object.fromEntries([
      ...androidProbeRequiredLabels,
      ...androidProbeOptionalLabels
    ].map(label => [label, uiXmlIncludesLabel(lastXml, label)])),
    tappedEnterButton,
    lastUiXmlPrefix: lastXml.slice(0, 2000)
  }
}

const captureAndroidScreenshot = async (adbPath, serial, outputPath) => {
  const { stdout } = await runProcessBuffer(adbPath, ['-s', serial,
    'exec-out',
    'screencap',
    '-p'
  ], {}, 30_000)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, stdout)
}

const sha256File = filePath =>
  crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').toUpperCase()

const verifyAndroidApkHashes = () => {
  assert(fs.existsSync(apkPath), 'Android release APK is missing; run pnpm run build:android and assembleRelease')
  const apkEntries = unzipSync(new Uint8Array(fs.readFileSync(apkPath)))
  const jsAssets = Object.entries(apkEntries)
    .filter(([name]) => name.startsWith('assets/public/assets/') && name.endsWith('.js'))
    .map(([name, bytes]) => ({
      name,
      text: Buffer.from(bytes).toString('utf8')
    }))
  assert(jsAssets.length > 0, 'Android APK does not contain Vite JavaScript assets')

  const foundHashes = Object.fromEntries(Object.entries(expectedHashes).map(([name, hash]) => [
    name,
    jsAssets.some(asset => asset.text.includes(hash))
  ]))
  const missing = Object.entries(foundHashes)
    .filter(([, found]) => !found)
    .map(([name]) => name)
  assert(missing.length === 0, `Android APK is missing official hashes: ${missing.join(', ')}`)

  return {
    apkSha256: sha256File(apkPath),
    jsAssetCount: jsAssets.length,
    foundHashes
  }
}

const readAndroidProbeLogSummary = async (adbPath, serial) => {
  try {
    const { stdout } = await runAdb(adbPath, serial, [
      'logcat',
      '-d',
      '-t',
      '500'
    ], 30_000)
    const lines = stdout.split(/\r?\n/)
    return {
      saveMigratorTimeouts: lines.filter(line => line.includes('SaveMigrator') && line.includes('迁移超时')).length,
      skippedFrameLines: lines.filter(line => line.includes('Skipped') && line.includes('frames')).length
    }
  } catch {
    return {
      saveMigratorTimeouts: null,
      skippedFrameLines: null
    }
  }
}

const runAndroidProbe = async () => {
  const apk = verifyAndroidApkHashes()
  const adbPath = findAndroidAdb()
  assert(adbPath, 'adb was not found; set ANDROID_ADB, ANDROID_HOME, ANDROID_SDK_ROOT, or PATH')
  const device = await resolveAndroidDevice(adbPath)
  const scenarioRoot = path.join(runRoot, 'android-release')
  const screenshotPath = path.join(scenarioRoot, 'main-menu.png')

  await runAdb(adbPath, device.serial, ['install', '-r', '-d', apkPath], 180_000)
  await runAdb(adbPath, device.serial, ['shell', 'am', 'force-stop', androidPackageId], 30_000)
  await runAdb(adbPath, device.serial, ['logcat', '-c'], 30_000).catch(() => null)
  await runAdb(adbPath, device.serial, [
    'shell',
    'am',
    'start',
    '-W',
    '-n',
    androidActivity
  ], 30_000)

  const ui = await waitForAndroidMainMenu(adbPath, device.serial)
  await captureAndroidScreenshot(adbPath, device.serial, screenshotPath).catch(() => null)
  const logSummary = await readAndroidProbeLogSummary(adbPath, device.serial)

  assert(ui.mainMenuReady, 'Android main menu was not detected before timeout')

  return {
    apk,
    device,
    packageId: androidPackageId,
    activity: androidActivity,
    ui,
    logSummary,
    screenshot: path.relative(root, screenshotPath).replaceAll('\\', '/')
  }
}

const assertVisibleImportProductContent = (visibleImport, scenario) => {
  const fixture = expectedVisibleProbeFixture(scenario)
  assert(visibleImport.targetPackageId === visibleProbePackageId,
    `${scenario.name}: visible import reported the wrong package`)
  assert(visibleImport.itemId === visibleProbeItemId,
    `${scenario.name}: visible import reported the wrong item`)
  assert(visibleImport.itemNameFallback === fixture.itemNameFallback,
    `${scenario.name}: visible import item fallback did not match ${fixture.version}`)
  assert(visibleImport.recipeId === visibleProbeRecipeId,
    `${scenario.name}: visible import reported the wrong recipe`)
  assert(visibleImport.recipeNameFallback === fixture.recipeNameFallback,
    `${scenario.name}: visible import recipe fallback did not match ${fixture.version}`)
  assert(visibleImport.shopOfferId === visibleProbeShopOfferId,
    `${scenario.name}: visible import reported the wrong shop offer`)
  assert(visibleImport.shopOfferNameFallback === fixture.shopOfferNameFallback,
    `${scenario.name}: visible import shop offer fallback did not match ${fixture.version}`)
  assert(visibleImport.expectedPackageVersion === fixture.version,
    `${scenario.name}: visible import expected package version did not match`)
  if (scenario.visibleUpgrade) {
    assert(visibleImport.operation === 'upgrade',
      `${scenario.name}: visible replacement probe did not report upgrade scenario label`)
  }
}

const assertVisibleImportPanelLabels = (
  visibleImport,
  scenario,
  expectedHostAckStatus,
  expectedUiIpcDeliveryStatus
) => {
  const labels = visibleImport.panelStatusLabels
  assert(labels?.importStatus === '已暂存',
    `${scenario.name}: visible import panel did not show persisted import status`)
  assert(labels.targetPackage === 'product_probe_pack',
    `${scenario.name}: visible import panel did not show the target package`)
  assert(labels.preflightStatus === 'deferred',
    `${scenario.name}: visible import panel did not show deferred preflight status`)
  assert(labels.dispatchStatus === 'dispatched',
    `${scenario.name}: visible import panel did not show dispatched command status`)
  assert(labels.persistenceStatus === '已写入 IndexedDB',
    `${scenario.name}: visible import panel did not show IndexedDB persistence`)
  assert(labels.hostAckStatus === expectedHostAckStatus,
    `${scenario.name}: visible import panel did not show the expected host acknowledgement`)
  assert(labels.installOutcomeStatus === '提交后校验已确认',
    `${scenario.name}: visible import panel did not show post-commit verification success`)
  assert(labels.uiIpcDeliveryStatus === expectedUiIpcDeliveryStatus,
    `${scenario.name}: visible import panel did not show the expected UI/IPC delivery`)
  assert(labels.runtimePublicationStatus === '已确认',
    `${scenario.name}: visible import panel did not show runtime publication success`)
  assert(labels.liveRegistryStatus === '已切换',
    `${scenario.name}: visible import panel did not show live registry swap success`)
  assert(labels.appStartupStatus === '已接入已挂载应用',
    `${scenario.name}: visible import panel did not show mounted app-startup handoff`)
  assert(labels.startupPersistentStateStatus === '已写入',
    `${scenario.name}: visible import panel did not show startup persistent state write`)
}

const assertVisibleImportRollbackPanelLabels = (visibleImport, scenario) => {
  const labels = visibleImport.panelStatusLabels
  assert(labels?.importStatus === '已暂存',
    `${scenario.name}: visible rollback panel did not show persisted import status`)
  assert(labels.targetPackage === 'product_probe_pack',
    `${scenario.name}: visible rollback panel did not show the target package`)
  assert(labels.preflightStatus === 'deferred',
    `${scenario.name}: visible rollback panel did not show deferred preflight status`)
  assert(labels.dispatchStatus === 'dispatched',
    `${scenario.name}: visible rollback panel did not show dispatched command status`)
  assert(labels.persistenceStatus === '已写入 IndexedDB',
    `${scenario.name}: visible rollback panel did not show IndexedDB persistence`)
  assert(labels.hostAckStatus === '已确认（Electron）',
    `${scenario.name}: visible rollback panel did not show the Electron host acknowledgement`)
  assert(labels.installOutcomeStatus === '已回滚',
    `${scenario.name}: visible rollback panel did not show rollback install outcome`)
  assert(labels.uiIpcDeliveryStatus === '已送达（Electron）',
    `${scenario.name}: visible rollback panel did not show Electron UI/IPC delivery`)
  assert(labels.runtimePublicationStatus === '已阻断',
    `${scenario.name}: visible rollback panel did not show blocked runtime publication`)
  assert(labels.liveRegistryStatus === '已阻断',
    `${scenario.name}: visible rollback panel did not show blocked live registry`)
  assert(labels.appStartupStatus === '已阻断',
    `${scenario.name}: visible rollback panel did not show blocked app-startup handoff`)
  assert(labels.startupPersistentStateStatus === '已阻断',
    `${scenario.name}: visible rollback panel did not show blocked startup persistence`)
}

const assertVisibleImportRollbackProductProbe = (visibleImport, scenario, protocol) => {
  assert(protocol === 'file:',
    `${scenario.name}: visible rollback probe must run in Electron`)
  assert(visibleImport.observed === true,
    `${scenario.name}: visible rollback probe was not observed`)
  assert(visibleImport.status === 'ready',
    `${scenario.name}: visible rollback probe did not reach ready status`)
  assert(visibleImport.operation === 'rollback',
    `${scenario.name}: visible rollback probe reported the wrong operation`)
  assert(visibleImport.entrypoint === 'main-menu-panel',
    `${scenario.name}: visible rollback probe did not start from the MainMenu panel`)
  assert(visibleImport.mainMenuPanelOpened === true,
    `${scenario.name}: visible rollback probe did not open the MainMenu panel`)
  assert(visibleImport.panelImportButtonClicked === true,
    `${scenario.name}: visible rollback probe did not click the panel import button`)
  assert(visibleImport.defaultFileInputSelectorUsed === true,
    `${scenario.name}: visible rollback probe did not use the default file input selector`)
  assertVisibleImportRollbackPanelLabels(visibleImport, scenario)
  assert(visibleImport.targetPackageId === visibleProbePackageId,
    `${scenario.name}: visible rollback reported the wrong package`)
  assert(visibleImport.itemId === visibleProbeItemId,
    `${scenario.name}: visible rollback reported the wrong item`)
  assert(visibleImport.recipeId === visibleProbeRecipeId,
    `${scenario.name}: visible rollback reported the wrong recipe`)
  assert(visibleImport.shopOfferId === visibleProbeShopOfferId,
    `${scenario.name}: visible rollback reported the wrong shop offer`)
  assert(visibleImport.expectedPackageVersion === visibleProbePackageFixtures.v1.version,
    `${scenario.name}: visible rollback expected package version did not match`)
  assert(visibleImport.fileCount === 5,
    `${scenario.name}: visible rollback used the wrong file count`)
  assert(visibleImport.pickStatus === 'persisted',
    `${scenario.name}: visible rollback source was not persisted after panel selection`)
  assert(visibleImport.dispatchPreflightStatus === 'deferred',
    `${scenario.name}: visible rollback dispatch preflight was not deferred`)
  assert(visibleImport.discoveryStatus === 'completed',
    `${scenario.name}: visible rollback discovery was not completed`)
  assert(visibleImport.transactionCommandDispatcherHostKind === 'renderer',
    `${scenario.name}: visible rollback did not use the renderer dispatcher host`)
  assert(visibleImport.transactionCommandDispatcherSourceStatus === 'dispatched',
    `${scenario.name}: visible rollback command was not dispatched`)
  assert(visibleImport.installCommandPostCommitAcknowledgementStatus === 'ready',
    `${scenario.name}: visible rollback post-commit acknowledgement was not ready`)
  assert(visibleImport.postCommitVerificationExecutorHostMode === 'electron-main-visible-import',
    `${scenario.name}: visible rollback did not use the Electron visible-import post-commit host mode`)
  assert(visibleImport.postCommitUiIpcDeliveryContinuationStatus === 'ready',
    `${scenario.name}: visible rollback UI/IPC continuation was not ready`)
  assert(visibleImport.ordinaryInstallTransactionTerminalConnectionStatus === 'ready',
    `${scenario.name}: visible rollback ordinary terminal was not ready`)
  assert(visibleImport.ordinaryInstallTransactionOutcomeKind === 'rollback',
    `${scenario.name}: visible rollback ordinary terminal did not report rollback outcome`)
  assert(visibleImport.installTransactionLogPreparedStatus === undefined,
    `${scenario.name}: visible rollback prepared transaction log should be omitted`)
  assert(visibleImport.installTransactionLogPreparedPersistentReadVerificationStatus === undefined,
    `${scenario.name}: visible rollback transaction log read verification should be omitted`)
  assert(visibleImport.installTransactionCommitFinalizationStatus === undefined,
    `${scenario.name}: visible rollback finalization should be omitted`)
  assert(visibleImport.runtimePublicationCommitAfterPostCommitVerificationStatus === undefined,
    `${scenario.name}: visible rollback runtime publication should be omitted`)
  assert(visibleImport.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus === undefined,
    `${scenario.name}: visible rollback live registry swap should be omitted`)
  assert(visibleImport.runtimePublicationCommitAppStartupReadinessStatus === undefined,
    `${scenario.name}: visible rollback app-startup readiness should be omitted`)
  assert(visibleImport.runtimePublicationCommitAppStartupHostConnectionStatus === undefined,
    `${scenario.name}: visible rollback app-startup host handoff should be omitted`)
  assert(visibleImport.webStartupPersistentStateWriteStatus !== 'written',
    `${scenario.name}: Electron visible rollback should not write Web startup persistent state`)
  assert(visibleImport.electronStartupPersistentStateWriteStatus === 'blocked',
    `${scenario.name}: Electron visible rollback did not report blocked startup persistence`)
  assert(visibleImport.selectedPackageCount === 1,
    `${scenario.name}: visible rollback selected package count mismatch`)
  assert(visibleImport.blockedPackageCount === 0,
    `${scenario.name}: visible rollback blocked packages unexpectedly`)
  assert(visibleImport.loadOrderCount === 1,
    `${scenario.name}: visible rollback load order count mismatch`)
  assert(visibleImport.registryCount === 54,
    `${scenario.name}: visible rollback registry count mismatch`)
  assert(visibleImport.entryCount === 4245,
    `${scenario.name}: visible rollback entry count mismatch`)
  assert(visibleImport.packageCount === 1,
    `${scenario.name}: visible rollback package count mismatch`)
  assert(Number.isSafeInteger(visibleImport.diagnosticsCount) && visibleImport.diagnosticsCount >= 0,
    `${scenario.name}: visible rollback diagnostics count was invalid`)
  assert(visibleImport.contentAccessItemVisibleBefore === false,
    `${scenario.name}: visible rollback item was visible before import`)
  assert(visibleImport.contentAccessItemVisibleAfter === false,
    `${scenario.name}: visible rollback item became visible after rollback`)
  assert(visibleImport.contentAccessRecipeVisibleBefore === false,
    `${scenario.name}: visible rollback recipe was visible before import`)
  assert(visibleImport.contentAccessRecipeVisibleAfter === false,
    `${scenario.name}: visible rollback recipe became visible after rollback`)
  assert(visibleImport.contentAccessShopOfferVisibleBefore === false,
    `${scenario.name}: visible rollback shop offer was visible before import`)
  assert(visibleImport.contentAccessShopOfferVisibleAfter === false,
    `${scenario.name}: visible rollback shop offer became visible after rollback`)
  for (const effectName of [
    'commandDispatched',
    'uiIpcResponseDelivered',
    'rollbackExecuted'
  ]) {
    assert(visibleImport.effects?.[effectName] === true,
      `${scenario.name}: visible rollback effect ${effectName} was not true`)
  }
  for (const effectName of [
    'packageFilesWritten',
    'settingsWritten',
    'lockfileWritten',
    'rendererLiveRegistrySwapped',
    'runtimeEnablementAllowed',
    'transactionCommitted',
    'transactionLogPrepared',
    'transactionLogRead',
    'startupPersistentStateWritten',
    'realNormalStartupHostCalled',
    'realAppStartupHostCalled',
    'gameAppCreated',
    'piniaCreated',
    'routerMounted',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'diagnosticsWritten'
  ]) {
    assert(visibleImport.effects?.[effectName] === false,
      `${scenario.name}: visible rollback effect ${effectName} was not false`)
  }
}

const assertVisibleImportFailurePanelLabels = (visibleImport, scenario) => {
  const labels = visibleImport.panelStatusLabels
  assert(labels?.importStatus === '已暂存',
    `${scenario.name}: visible failure panel did not show persisted import status`)
  assert(labels.targetPackage === 'product_probe_pack',
    `${scenario.name}: visible failure panel did not show the target package`)
  assert(labels.preflightStatus === 'deferred',
    `${scenario.name}: visible failure panel did not show deferred preflight status`)
  assert(labels.dispatchStatus === 'dispatched',
    `${scenario.name}: visible failure panel did not show dispatched command status`)
  assert(labels.persistenceStatus === '已写入 IndexedDB',
    `${scenario.name}: visible failure panel did not show IndexedDB persistence`)
  assert(labels.hostAckStatus === '已确认（Electron）',
    `${scenario.name}: visible failure panel did not show the Electron host acknowledgement`)
  assert(labels.installOutcomeStatus === '安装失败，可重试',
    `${scenario.name}: visible failure panel did not show retryable failure outcome`)
  assert(labels.uiIpcDeliveryStatus === '已送达（Electron）',
    `${scenario.name}: visible failure panel did not show Electron UI/IPC delivery`)
  assert(labels.runtimePublicationStatus === '已阻断',
    `${scenario.name}: visible failure panel did not show blocked runtime publication`)
  assert(labels.liveRegistryStatus === '已阻断',
    `${scenario.name}: visible failure panel did not show blocked live registry`)
  assert(labels.appStartupStatus === '已阻断',
    `${scenario.name}: visible failure panel did not show blocked app-startup handoff`)
  assert(labels.startupPersistentStateStatus === '已阻断',
    `${scenario.name}: visible failure panel did not show blocked startup persistence`)
}

const assertVisibleImportFailureProductProbe = (visibleImport, scenario, protocol) => {
  assert(protocol === 'file:',
    `${scenario.name}: visible failure probe must run in Electron`)
  assert(visibleImport.observed === true,
    `${scenario.name}: visible failure probe was not observed`)
  assert(visibleImport.status === 'ready',
    `${scenario.name}: visible failure probe did not reach ready status`)
  assert(visibleImport.operation === 'failure',
    `${scenario.name}: visible failure probe reported the wrong operation`)
  assert(visibleImport.entrypoint === 'main-menu-panel',
    `${scenario.name}: visible failure probe did not start from the MainMenu panel`)
  assert(visibleImport.mainMenuPanelOpened === true,
    `${scenario.name}: visible failure probe did not open the MainMenu panel`)
  assert(visibleImport.panelImportButtonClicked === true,
    `${scenario.name}: visible failure probe did not click the panel import button`)
  assert(visibleImport.defaultFileInputSelectorUsed === true,
    `${scenario.name}: visible failure probe did not use the default file input selector`)
  assertVisibleImportFailurePanelLabels(visibleImport, scenario)
  assert(visibleImport.targetPackageId === visibleProbePackageId,
    `${scenario.name}: visible failure reported the wrong package`)
  assert(visibleImport.itemId === visibleProbeItemId,
    `${scenario.name}: visible failure reported the wrong item`)
  assert(visibleImport.recipeId === visibleProbeRecipeId,
    `${scenario.name}: visible failure reported the wrong recipe`)
  assert(visibleImport.shopOfferId === visibleProbeShopOfferId,
    `${scenario.name}: visible failure reported the wrong shop offer`)
  assert(visibleImport.expectedPackageVersion === visibleProbePackageFixtures.v1.version,
    `${scenario.name}: visible failure expected package version did not match`)
  assert(visibleImport.fileCount === 5,
    `${scenario.name}: visible failure used the wrong file count`)
  assert(visibleImport.pickStatus === 'persisted',
    `${scenario.name}: visible failure source was not persisted after panel selection`)
  assert(visibleImport.dispatchPreflightStatus === 'deferred',
    `${scenario.name}: visible failure dispatch preflight was not deferred`)
  assert(visibleImport.discoveryStatus === 'completed',
    `${scenario.name}: visible failure discovery was not completed`)
  assert(visibleImport.transactionCommandDispatcherHostKind === 'renderer',
    `${scenario.name}: visible failure did not use the renderer dispatcher host`)
  assert(visibleImport.transactionCommandDispatcherSourceStatus === 'dispatched',
    `${scenario.name}: visible failure command was not dispatched`)
  assert(visibleImport.installCommandPostCommitAcknowledgementStatus === 'blocked',
    `${scenario.name}: visible failure success lifecycle acknowledgement was not blocked`)
  assert(visibleImport.postCommitVerificationExecutorHostMode === undefined,
    `${scenario.name}: visible failure unexpectedly ran the Electron visible-import success post-commit host mode`)
  assert(visibleImport.postCommitUiIpcDeliveryContinuationStatus === 'ready',
    `${scenario.name}: visible failure UI/IPC continuation was not ready`)
  assert(visibleImport.ordinaryInstallTransactionTerminalConnectionStatus === 'ready',
    `${scenario.name}: visible failure ordinary terminal was not ready`)
  assert(visibleImport.ordinaryInstallTransactionOutcomeKind === 'failure',
    `${scenario.name}: visible failure ordinary terminal did not report failure outcome`)
  assert(visibleImport.installTransactionLogPreparedStatus === undefined,
    `${scenario.name}: visible failure prepared transaction log should be omitted`)
  assert(visibleImport.installTransactionLogPreparedPersistentReadVerificationStatus === undefined,
    `${scenario.name}: visible failure transaction log read verification should be omitted`)
  assert(visibleImport.installTransactionCommitFinalizationStatus === undefined,
    `${scenario.name}: visible failure finalization should be omitted`)
  assert(visibleImport.runtimePublicationCommitAfterPostCommitVerificationStatus === undefined,
    `${scenario.name}: visible failure runtime publication should be omitted`)
  assert(visibleImport.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus === undefined,
    `${scenario.name}: visible failure live registry swap should be omitted`)
  assert(visibleImport.runtimePublicationCommitAppStartupReadinessStatus === undefined,
    `${scenario.name}: visible failure app-startup readiness should be omitted`)
  assert(visibleImport.runtimePublicationCommitAppStartupHostConnectionStatus === undefined,
    `${scenario.name}: visible failure app-startup host handoff should be omitted`)
  assert(visibleImport.webStartupPersistentStateWriteStatus !== 'written',
    `${scenario.name}: Electron visible failure should not write Web startup persistent state`)
  assert(visibleImport.electronStartupPersistentStateWriteStatus === 'blocked',
    `${scenario.name}: Electron visible failure did not report blocked startup persistence`)
  assert(visibleImport.selectedPackageCount === 1,
    `${scenario.name}: visible failure selected package count mismatch`)
  assert(visibleImport.blockedPackageCount === 0,
    `${scenario.name}: visible failure blocked packages unexpectedly`)
  assert(visibleImport.loadOrderCount === 1,
    `${scenario.name}: visible failure load order count mismatch`)
  assert(visibleImport.registryCount === 54,
    `${scenario.name}: visible failure registry count mismatch`)
  assert(visibleImport.entryCount === 4245,
    `${scenario.name}: visible failure entry count mismatch`)
  assert(visibleImport.packageCount === 1,
    `${scenario.name}: visible failure package count mismatch`)
  assert(Number.isSafeInteger(visibleImport.diagnosticsCount) && visibleImport.diagnosticsCount >= 0,
    `${scenario.name}: visible failure diagnostics count was invalid`)
  assert(visibleImport.contentAccessItemVisibleBefore === false,
    `${scenario.name}: visible failure item was visible before import`)
  assert(visibleImport.contentAccessItemVisibleAfter === false,
    `${scenario.name}: visible failure item became visible after failure`)
  assert(visibleImport.contentAccessRecipeVisibleBefore === false,
    `${scenario.name}: visible failure recipe was visible before import`)
  assert(visibleImport.contentAccessRecipeVisibleAfter === false,
    `${scenario.name}: visible failure recipe became visible after failure`)
  assert(visibleImport.contentAccessShopOfferVisibleBefore === false,
    `${scenario.name}: visible failure shop offer was visible before import`)
  assert(visibleImport.contentAccessShopOfferVisibleAfter === false,
    `${scenario.name}: visible failure shop offer became visible after failure`)
  for (const effectName of [
    'commandDispatched',
    'uiIpcResponseDelivered'
  ]) {
    assert(visibleImport.effects?.[effectName] === true,
      `${scenario.name}: visible failure effect ${effectName} was not true`)
  }
  for (const effectName of [
    'packageFilesWritten',
    'settingsWritten',
    'lockfileWritten',
    'rendererLiveRegistrySwapped',
    'runtimeEnablementAllowed',
    'transactionCommitted',
    'transactionLogPrepared',
    'transactionLogRead',
    'startupPersistentStateWritten',
    'realNormalStartupHostCalled',
    'realAppStartupHostCalled',
    'gameAppCreated',
    'piniaCreated',
    'routerMounted',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(visibleImport.effects?.[effectName] === false,
      `${scenario.name}: visible failure effect ${effectName} was not false`)
  }
}

const assertVisibleEnablePanelLabels = (
  visibleImport,
  scenario,
  expectedPersistenceStatus
) => {
  const labels = visibleImport.panelStatusLabels
  assert(labels?.importStatus === '已恢复',
    `${scenario.name}: visible enable panel did not show restored import status`)
  assert(labels.targetPackage === 'product_probe_pack',
    `${scenario.name}: visible enable panel did not show the target package`)
  assert(labels.persistenceStatus === expectedPersistenceStatus,
    `${scenario.name}: visible enable panel did not show the expected restored source`)
  assert(labels.installedManagementStatus === '已就绪',
    `${scenario.name}: visible enable panel did not settle installed management`)
  const enableResult = labels.enableResult ?? ''
  for (const label of [
    '启用事务：已完成',
    'settings 已写入',
    'mod-lock 已写入',
    'startup 已写入',
    'package 已保留',
    'runtime 已包含',
    'live registry 已切换',
    'handoff 已接受'
  ]) {
    assert(enableResult.includes(label),
      `${scenario.name}: visible enable panel omitted ${label}`)
  }
}

const assertVisibleEnableProductProbe = (visibleImport, scenario, protocol) => {
  const electron = protocol === 'file:'
  assert(protocol === 'http:' || electron,
    `${scenario.name}: visible enable probe ran with an unsupported protocol`)
  assert(visibleImport.observed === true,
    `${scenario.name}: visible enable probe was not observed`)
  assert(visibleImport.status === 'ready',
    `${scenario.name}: visible enable did not reach ready status`)
  assert(visibleImport.operation === 'enable',
    `${scenario.name}: visible enable probe reported the wrong operation`)
  assert(visibleImport.entrypoint === 'main-menu-panel',
    `${scenario.name}: visible enable did not start from the MainMenu panel`)
  assert(visibleImport.mainMenuPanelOpened === true,
    `${scenario.name}: visible enable did not open the MainMenu panel`)
  assert(visibleImport.panelImportButtonClicked === false,
    `${scenario.name}: visible enable should not click the file-picker import button`)
  assert(visibleImport.enableButtonClicked === true,
    `${scenario.name}: visible enable did not click the package enable action`)
  assert(visibleImport.defaultFileInputSelectorUsed === false,
    `${scenario.name}: visible enable should not use the default file input selector`)
  assertVisibleEnablePanelLabels(
    visibleImport,
    scenario,
    electron ? '已从程序目录恢复' : '已从 IndexedDB 恢复'
  )
  assert(visibleImport.targetPackageId === 'product_probe_pack',
    `${scenario.name}: visible enable reported the wrong package`)
  assert(visibleImport.itemId === 'product_probe_pack:linen_ribbon',
    `${scenario.name}: visible enable reported the wrong item`)
  assert(visibleImport.itemNameFallback === 'Product Probe Linen Ribbon',
    `${scenario.name}: visible enable item was not readable from contentAccess`)
  assert(visibleImport.recipeId === 'product_probe_pack:linen_ribbon_snack',
    `${scenario.name}: visible enable reported the wrong recipe`)
  assert(visibleImport.recipeNameFallback === 'Product Probe Ribbon Snack',
    `${scenario.name}: visible enable recipe was not readable from contentAccess`)
  assert(visibleImport.shopOfferId === 'product_probe_pack:shop/wanwupu/linen_ribbon/0',
    `${scenario.name}: visible enable reported the wrong shop offer`)
  assert(visibleImport.shopOfferNameFallback === 'Product Probe Ribbon Stand',
    `${scenario.name}: visible enable shop offer was not readable from contentAccess`)
  assert(visibleImport.fileCount === (electron ? 1 : 5),
    `${scenario.name}: visible enable used the wrong restored source file count`)
  assert(visibleImport.pickStatus === 'restored',
    `${scenario.name}: visible enable source was not restored before dispatch`)
  assert(visibleImport.dispatchPreflightStatus === undefined,
    `${scenario.name}: visible enable should not reuse install dispatch preflight`)
  assert(visibleImport.transactionCommandDispatcherSourceStatus === undefined,
    `${scenario.name}: visible enable should not report install command dispatch`)
  assert(visibleImport.installCommandPostCommitAcknowledgementStatus === undefined,
    `${scenario.name}: visible enable should not require install post-commit acknowledgement`)
  assert(visibleImport.installTransactionLogPreparedStatus === undefined,
    `${scenario.name}: visible enable should not prepare an install transaction log`)
  assert(visibleImport.installTransactionCommitFinalizationStatus === undefined,
    `${scenario.name}: visible enable should not finalize an install transaction`)
  assert(visibleImport.ordinaryInstallTransactionTerminalConnectionStatus === undefined,
    `${scenario.name}: visible enable should not use the ordinary install terminal`)
  assert(visibleImport.enableTerminalStatus === 'ready',
    `${scenario.name}: visible enable terminal was not ready`)
  assert(visibleImport.enableTargetPackageId === 'product_probe_pack',
    `${scenario.name}: visible enable terminal target mismatch`)
  assert(visibleImport.enableSelectedPackageCount === 1,
    `${scenario.name}: visible enable terminal selected count mismatch`)
  assert(visibleImport.enableBlockedPackageCount === 0,
    `${scenario.name}: visible enable terminal blocked package mismatch`)
  assert(visibleImport.enableLoadOrderCount === 1,
    `${scenario.name}: visible enable terminal load order mismatch`)
  assert(visibleImport.enableRegistryCount === 54,
    `${scenario.name}: visible enable terminal registry count mismatch`)
  assert(visibleImport.enableEntryCount === 4245,
    `${scenario.name}: visible enable terminal entry count mismatch`)
  assert(visibleImport.enablePackageCount === 1,
    `${scenario.name}: visible enable terminal package count mismatch`)
  for (const fieldName of [
    'enableSettingsWritten',
    'enableLockfileWritten',
    'enableStartupStateWritten',
    'enablePackageFilesPreserved',
    'enableRuntimePublicationIncluded',
    'enableLiveRegistrySwapped',
    'enableAppStartupHandoffAccepted'
  ]) {
    assert(visibleImport[fieldName] === true,
      `${scenario.name}: visible enable terminal field ${fieldName} was not true`)
  }
  assert(visibleImport.selectedPackageCount === 1,
    `${scenario.name}: visible enable selected package count mismatch`)
  assert(visibleImport.blockedPackageCount === 0,
    `${scenario.name}: visible enable blocked packages unexpectedly`)
  assert(visibleImport.loadOrderCount === 1,
    `${scenario.name}: visible enable load order count mismatch`)
  assert(visibleImport.registryCount === 54,
    `${scenario.name}: visible enable registry count mismatch`)
  assert(visibleImport.entryCount === 4245,
    `${scenario.name}: visible enable entry count mismatch`)
  assert(visibleImport.packageCount === 1,
    `${scenario.name}: visible enable package count mismatch`)
  assert(Number.isSafeInteger(visibleImport.diagnosticsCount) && visibleImport.diagnosticsCount >= 0,
    `${scenario.name}: visible enable diagnostics count was invalid`)
  assert(visibleImport.contentAccessItemVisibleBefore === false,
    `${scenario.name}: visible enable item was visible before enable`)
  assert(visibleImport.contentAccessItemVisibleAfter === true,
    `${scenario.name}: visible enable item was not visible after live registry swap`)
  assert(visibleImport.contentAccessRecipeVisibleBefore === false,
    `${scenario.name}: visible enable recipe was visible before enable`)
  assert(visibleImport.contentAccessRecipeVisibleAfter === true,
    `${scenario.name}: visible enable recipe was not visible after live registry swap`)
  assert(visibleImport.contentAccessShopOfferVisibleBefore === false,
    `${scenario.name}: visible enable shop offer was visible before enable`)
  assert(visibleImport.contentAccessShopOfferVisibleAfter === true,
    `${scenario.name}: visible enable shop offer was not visible after live registry swap`)
  for (const effectName of [
    'settingsWritten',
    'lockfileWritten',
    'rendererLiveRegistrySwapped',
    'runtimeEnablementAllowed',
    'transactionCommitted',
    'startupPersistentStateWritten',
    'realAppStartupHostCalled',
    'gameAppCreated',
    'piniaCreated',
    'routerMounted'
  ]) {
    assert(visibleImport.effects?.[effectName] === true,
      `${scenario.name}: visible enable effect ${effectName} was not true`)
  }
  for (const effectName of [
    'commandDispatched',
    'packageFilesWritten',
    'uiIpcResponseDelivered',
    'transactionLogPrepared',
    'transactionLogRead',
    'realNormalStartupHostCalled',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(visibleImport.effects?.[effectName] === false,
      `${scenario.name}: visible enable effect ${effectName} was not false`)
  }
}

const assertVisibleDisableProductProbe = (visibleImport, scenario, protocol) => {
  assert(protocol === 'http:' || protocol === 'file:',
    `${scenario.name}: visible disable probe ran with an unsupported protocol`)
  assert(visibleImport.observed === true,
    `${scenario.name}: visible disable probe was not observed`)
  assert(visibleImport.status === 'ready',
    `${scenario.name}: visible disable probe did not reach ready status`)
  assert(visibleImport.operation === 'disable',
    `${scenario.name}: visible disable probe reported the wrong operation`)
  assert(visibleImport.entrypoint === 'main-menu-panel',
    `${scenario.name}: visible disable probe did not start from the MainMenu panel`)
  assert(visibleImport.mainMenuPanelOpened === true,
    `${scenario.name}: visible disable probe did not open the MainMenu panel`)
  assert(visibleImport.disableButtonClicked === true,
    `${scenario.name}: visible disable probe did not click the package disable action`)
  assert(visibleImport.targetPackageId === 'product_probe_pack',
    `${scenario.name}: visible disable probe reported the wrong package`)
  assert(visibleImport.disableTerminalStatus === 'ready',
    `${scenario.name}: visible disable probe terminal was not ready`)
  assert(visibleImport.disableTargetPackageId === 'product_probe_pack',
    `${scenario.name}: visible disable probe terminal target mismatch`)
  assert(visibleImport.disableSelectedPackageCount === 0,
    `${scenario.name}: visible disable probe left a selected package`)
  assert(visibleImport.disableBlockedPackageCount === 1,
    `${scenario.name}: visible disable probe did not block the disabled package`)
  assert(visibleImport.disableLoadOrderCount === 0,
    `${scenario.name}: visible disable probe left a load order`)
  assert(visibleImport.disableRegistryCount === 54,
    `${scenario.name}: visible disable probe changed the official registry count`)
  assert(visibleImport.disableEntryCount === 4242,
    `${scenario.name}: visible disable probe changed the official entry count`)
  assert(visibleImport.disablePackageCount === 1,
    `${scenario.name}: visible disable probe reported the wrong package count`)
  for (const fieldName of [
    'disableSettingsWritten',
    'disableLockfileWritten',
    'disableStartupStateWritten',
    'disablePackageFilesPreserved',
    'disableRuntimePublicationExcluded',
    'disableLiveRegistrySwapped',
    'disableAppStartupHandoffAccepted'
  ]) {
    assert(visibleImport[fieldName] === true,
      `${scenario.name}: visible disable probe field ${fieldName} was not true`)
  }
  assert(visibleImport.contentAccessItemVisibleBefore === true,
    `${scenario.name}: disabled package item was not visible before disable`)
  assert(visibleImport.contentAccessItemVisibleAfter === false,
    `${scenario.name}: disabled package item remained visible after disable`)
  assert(visibleImport.contentAccessRecipeVisibleBefore === true,
    `${scenario.name}: disabled package recipe was not visible before disable`)
  assert(visibleImport.contentAccessRecipeVisibleAfter === false,
    `${scenario.name}: disabled package recipe remained visible after disable`)
  assert(visibleImport.contentAccessShopOfferVisibleBefore === true,
    `${scenario.name}: disabled package shop offer was not visible before disable`)
  assert(visibleImport.contentAccessShopOfferVisibleAfter === false,
    `${scenario.name}: disabled package shop offer remained visible after disable`)
  assert(visibleImport.panelStatusLabels?.installedManagementStatus === '已就绪',
    `${scenario.name}: visible disable panel did not settle installed management`)
  const disableResult = visibleImport.panelStatusLabels?.disableResult ?? ''
  for (const label of [
    '禁用事务：已完成',
    'settings 已写入',
    'mod-lock 已写入',
    'startup 已写入',
    'runtime 已排除',
    'live registry 已切换',
    'handoff 已接受'
  ]) {
    assert(disableResult.includes(label),
      `${scenario.name}: visible disable panel omitted ${label}`)
  }
  for (const effectName of [
    'settingsWritten',
    'lockfileWritten',
    'rendererLiveRegistrySwapped',
    'transactionCommitted',
    'startupPersistentStateWritten',
    'realAppStartupHostCalled',
    'gameAppCreated',
    'piniaCreated',
    'routerMounted'
  ]) {
    assert(visibleImport.effects?.[effectName] === true,
      `${scenario.name}: visible disable effect ${effectName} was not true`)
  }
  for (const effectName of [
    'commandDispatched',
    'packageFilesWritten',
    'runtimeEnablementAllowed',
    'uiIpcResponseDelivered',
    'transactionLogPrepared',
    'transactionLogRead',
    'transactionLogWritten',
    'savesWritten',
    'cacheWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(visibleImport.effects?.[effectName] === false,
      `${scenario.name}: visible disable effect ${effectName} was not false`)
  }
}

const assertVisibleUninstallProductProbe = (visibleImport, scenario, protocol) => {
  assert(protocol === 'http:' || protocol === 'file:',
    `${scenario.name}: visible uninstall probe ran with an unsupported protocol`)
  assert(visibleImport.observed === true,
    `${scenario.name}: visible uninstall probe was not observed`)
  assert(visibleImport.status === 'ready',
    `${scenario.name}: visible uninstall probe did not reach ready status`)
  assert(visibleImport.operation === 'uninstall',
    `${scenario.name}: visible uninstall probe reported the wrong operation`)
  assert(visibleImport.entrypoint === 'main-menu-panel',
    `${scenario.name}: visible uninstall probe did not start from the MainMenu panel`)
  assert(visibleImport.mainMenuPanelOpened === true,
    `${scenario.name}: visible uninstall probe did not open the MainMenu panel`)
  assert(visibleImport.uninstallButtonClicked === true,
    `${scenario.name}: visible uninstall probe did not click the package uninstall action`)
  assert(visibleImport.targetPackageId === 'product_probe_pack',
    `${scenario.name}: visible uninstall probe reported the wrong package`)
  assert(visibleImport.uninstallTerminalStatus === 'ready',
    `${scenario.name}: visible uninstall probe terminal was not ready`)
  assert(visibleImport.uninstallTargetPackageId === 'product_probe_pack',
    `${scenario.name}: visible uninstall probe terminal target mismatch`)
  assert(visibleImport.uninstallSelectedPackageCount === 0,
    `${scenario.name}: visible uninstall probe left a selected package`)
  assert(visibleImport.uninstallBlockedPackageCount === 0,
    `${scenario.name}: visible uninstall probe left a blocked package`)
  assert(visibleImport.uninstallLoadOrderCount === 0,
    `${scenario.name}: visible uninstall probe left a load order`)
  assert(visibleImport.uninstallRegistryCount === 54,
    `${scenario.name}: visible uninstall probe changed the official registry count`)
  assert(visibleImport.uninstallEntryCount === 4242,
    `${scenario.name}: visible uninstall probe changed the official entry count`)
  assert(visibleImport.uninstallPackageCount === 0,
    `${scenario.name}: visible uninstall probe did not remove the package record`)
  for (const fieldName of [
    'uninstallSettingsWritten',
    'uninstallLockfileWritten',
    'uninstallStartupStateWritten',
    'uninstallPackageFilesRemoved',
    'uninstallRuntimePublicationExcluded',
    'uninstallLiveRegistrySwapped',
    'uninstallAppStartupHandoffAccepted'
  ]) {
    assert(visibleImport[fieldName] === true,
      `${scenario.name}: visible uninstall probe field ${fieldName} was not true`)
  }
  const expectedContentVisibleBeforeUninstall = scenario.visibleUninstallStartedEnabled === true
  assert(visibleImport.contentAccessItemVisibleBefore === expectedContentVisibleBeforeUninstall,
    `${scenario.name}: uninstalled package item visibility before uninstall did not match the starting state`)
  assert(visibleImport.contentAccessItemVisibleAfter === false,
    `${scenario.name}: uninstalled package item became visible after uninstall`)
  assert(visibleImport.contentAccessRecipeVisibleBefore === expectedContentVisibleBeforeUninstall,
    `${scenario.name}: uninstalled package recipe visibility before uninstall did not match the starting state`)
  assert(visibleImport.contentAccessRecipeVisibleAfter === false,
    `${scenario.name}: uninstalled package recipe became visible after uninstall`)
  assert(visibleImport.contentAccessShopOfferVisibleBefore === expectedContentVisibleBeforeUninstall,
    `${scenario.name}: uninstalled package shop offer visibility before uninstall did not match the starting state`)
  assert(visibleImport.contentAccessShopOfferVisibleAfter === false,
    `${scenario.name}: uninstalled package shop offer became visible after uninstall`)
  assert(visibleImport.panelStatusLabels?.installedManagementStatus === '已就绪',
    `${scenario.name}: visible uninstall panel did not settle installed management`)
  const uninstallResult = visibleImport.panelStatusLabels?.uninstallResult ?? ''
  for (const label of [
    '卸载事务：已完成',
    'settings 已写入',
    'mod-lock 已写入',
    'startup 已写入',
    'package 已删除',
    'runtime 已排除',
    'live registry 已切换',
    'handoff 已接受'
  ]) {
    assert(uninstallResult.includes(label),
      `${scenario.name}: visible uninstall panel omitted ${label}`)
  }
  for (const effectName of [
    'settingsWritten',
    'lockfileWritten',
    'rendererLiveRegistrySwapped',
    'transactionCommitted',
    'startupPersistentStateWritten',
    'realAppStartupHostCalled',
    'gameAppCreated',
    'piniaCreated',
    'routerMounted'
  ]) {
    assert(visibleImport.effects?.[effectName] === true,
      `${scenario.name}: visible uninstall effect ${effectName} was not true`)
  }
  for (const effectName of [
    'commandDispatched',
    'packageFilesWritten',
    'runtimeEnablementAllowed',
    'uiIpcResponseDelivered',
    'transactionLogPrepared',
    'transactionLogRead',
    'transactionLogWritten',
    'savesWritten',
    'cacheWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(visibleImport.effects?.[effectName] === false,
      `${scenario.name}: visible uninstall effect ${effectName} was not false`)
  }
}

const assertStartupProductProbeContent = (startupGate, scenario) => {
  const fixture = visibleProbePackageFixtures[scenario.startupGateExpectedProductProbeVariant]
  assert(fixture !== undefined,
    `${scenario.name}: startup product probe variant was not recognized`)
  assert(startupGate.productProbeItemNameFallback === fixture.itemNameFallback,
    `${scenario.name}: startup item fallback did not match ${fixture.version}`)
  assert(startupGate.productProbeRecipeNameFallback === fixture.recipeNameFallback,
    `${scenario.name}: startup recipe fallback did not match ${fixture.version}`)
  assert(startupGate.productProbeShopOfferNameFallback === fixture.shopOfferNameFallback,
    `${scenario.name}: startup shop offer fallback did not match ${fixture.version}`)
}

const assertDisabledInstalledStartupState = (startupGate, scenario) => {
  const expectedSourceKind = scenario.startupPersistentStateSourceKind ?? 'web-indexeddb'
  const expectedHostMode = scenario.startupPersistentStateSourceHostMode
    ?? 'web-indexeddb-startup-persistent-state'
  assert(startupGate.status === 'skipped',
    `${scenario.name}: disabled installed-state startup gate should skip runtime publication`)
  assert(startupGate.enabled === true,
    `${scenario.name}: disabled installed-state startup gate was not enabled`)
  assert(startupGate.appBootstrapContinuationAllowed === true,
    `${scenario.name}: disabled installed-state startup gate did not allow app bootstrap`)
  assert(startupGate.targetPackageId === 'product_probe_pack',
    `${scenario.name}: disabled installed-state startup gate reported the wrong target package`)
  assert(startupGate.selectedPackageCount === 0,
    `${scenario.name}: disabled installed-state startup gate selected a package`)
  assert(startupGate.blockedPackageCount === 1,
    `${scenario.name}: disabled installed-state startup gate did not block the package`)
  assert(startupGate.loadOrderCount === 0,
    `${scenario.name}: disabled installed-state startup gate reported a load order`)
  assert(startupGate.registryCount === 54,
    `${scenario.name}: disabled installed-state startup gate changed the official registry count`)
  assert(startupGate.entryCount === 4242,
    `${scenario.name}: disabled installed-state startup gate changed the official entry count`)
  assert(startupGate.packageCount === 1,
    `${scenario.name}: disabled installed-state startup gate reported the wrong package count`)
  assert(startupGate.lockfileHashPresent === false,
    `${scenario.name}: disabled installed-state startup gate exposed a runtime lockfile hash`)
  assert(startupGate.startupPersistentStateSourceStatus === 'ready',
    `${scenario.name}: disabled installed-state startup state was not read as ready`)
  assert(startupGate.startupPersistentStateSourceKind === expectedSourceKind,
    `${scenario.name}: disabled installed-state startup source kind mismatch`)
  assert(startupGate.startupPersistentStateSourceHostMode === expectedHostMode,
    `${scenario.name}: disabled installed-state startup source host mode mismatch`)
  assert(startupGate.startupPersistentStateInjectedSourceHostMode === expectedHostMode,
    `${scenario.name}: disabled installed-state startup legacy source host mode mismatch`)
  assert(startupGate.startupStateSnapshotAccepted === true,
    `${scenario.name}: disabled installed-state startup snapshot was not accepted`)
  assert(startupGate.persistentStateProofsAccepted === true,
    `${scenario.name}: disabled installed-state persistent proofs were not accepted`)
  assert(startupGate.startupPersistentStateReadFromIndexedDb === (expectedSourceKind === 'web-indexeddb'),
    `${scenario.name}: disabled installed-state IndexedDB read flag mismatch`)
  assert(startupGate.startupPersistentStateReadFromElectronUserdata === (
    expectedSourceKind === 'electron-program-directory-userdata'
  ), `${scenario.name}: disabled installed-state Electron userdata read flag mismatch`)
  for (const effectName of [
    'startupPersistentStateSourceCalled',
    'startupStateSnapshotAccepted'
  ]) {
    assert(startupGate.effects?.[effectName] === true,
      `${scenario.name}: disabled installed-state startup effect ${effectName} was not true`)
  }
  for (const effectName of [
    'appStartupHostConnectionSourceCalled',
    'appStartupHostConnectionAccepted',
    'thirdPartyRegistryPublished',
    'liveRegistrySwapped',
    'runtimeEnablementAllowed',
    'realRuntimePublicationCommitCalled',
    'runtimePublicationCommitted'
  ]) {
    assert(startupGate.effects?.[effectName] === false,
      `${scenario.name}: disabled installed-state startup effect ${effectName} was not false`)
  }
}

const assertUninstalledStartupState = (startupGate, scenario) => {
  const expectedSourceKind = scenario.startupPersistentStateSourceKind ?? 'web-indexeddb'
  const expectedHostMode = scenario.startupPersistentStateSourceHostMode
    ?? (expectedSourceKind === 'electron-program-directory-userdata'
      ? 'electron-program-directory-startup-persistent-state'
      : 'web-indexeddb-startup-persistent-state')
  assert(startupGate.status === 'skipped',
    `${scenario.name}: uninstalled startup gate should skip third-party publication`)
  assert(startupGate.enabled === false,
    `${scenario.name}: uninstalled startup gate should remain disabled`)
  assert(startupGate.sourceCalled === true,
    `${scenario.name}: uninstalled startup gate did not inspect installed state`)
  assert(startupGate.appBootstrapContinuationAllowed === true,
    `${scenario.name}: uninstalled startup gate did not allow official bootstrap`)
  assert(startupGate.targetPackageId === 'product_probe_pack',
    `${scenario.name}: uninstalled startup gate reported the wrong target package`)
  assert(startupGate.selectedPackageCount === 0,
    `${scenario.name}: uninstalled startup gate selected a package`)
  assert(startupGate.blockedPackageCount === 0,
    `${scenario.name}: uninstalled startup gate blocked a package`)
  assert(startupGate.loadOrderCount === 0,
    `${scenario.name}: uninstalled startup gate reported a load order`)
  assert(startupGate.registryCount === 54,
    `${scenario.name}: uninstalled startup gate changed the official registry count`)
  assert(startupGate.entryCount === 4242,
    `${scenario.name}: uninstalled startup gate changed the official entry count`)
  assert(startupGate.packageCount === 0,
    `${scenario.name}: uninstalled startup gate reported an installed package`)
  assert(startupGate.lockfileHashPresent === false,
    `${scenario.name}: uninstalled startup gate exposed a runtime lockfile hash`)
  assert(startupGate.startupPersistentStateSourceStatus === 'ready',
    `${scenario.name}: uninstalled startup state was not read as ready`)
  assert(startupGate.startupPersistentStateSourceKind === expectedSourceKind,
    `${scenario.name}: uninstalled startup source kind mismatch`)
  assert(startupGate.startupPersistentStateSourceHostMode === expectedHostMode,
    `${scenario.name}: uninstalled startup source host mode mismatch`)
  assert(startupGate.startupPersistentStateInjectedSourceHostMode === expectedHostMode,
    `${scenario.name}: uninstalled startup legacy source host mode mismatch`)
  assert(startupGate.startupStateSnapshotAccepted === true,
    `${scenario.name}: uninstalled startup snapshot was not accepted`)
  assert(startupGate.persistentStateProofsAccepted === true,
    `${scenario.name}: uninstalled persistent proofs were not accepted`)
  assert(startupGate.startupPersistentStateReadFromIndexedDb === (expectedSourceKind === 'web-indexeddb'),
    `${scenario.name}: uninstalled IndexedDB read flag mismatch`)
  assert(startupGate.startupPersistentStateReadFromElectronUserdata === (
    expectedSourceKind === 'electron-program-directory-userdata'
  ), `${scenario.name}: uninstalled Electron userdata read flag mismatch`)
  for (const effectName of [
    'startupPersistentStateSourceCalled',
    'startupStateSnapshotAccepted'
  ]) {
    assert(startupGate.effects?.[effectName] === true,
      `${scenario.name}: uninstalled startup effect ${effectName} was not true`)
  }
  for (const effectName of [
    'appStartupHostConnectionSourceCalled',
    'appStartupHostConnectionAccepted',
    'thirdPartyRegistryPublished',
    'liveRegistrySwapped',
    'runtimeEnablementAllowed',
    'realRuntimePublicationCommitCalled',
    'runtimePublicationCommitted'
  ]) {
    assert(startupGate.effects?.[effectName] === false,
      `${scenario.name}: uninstalled startup effect ${effectName} was not false`)
  }
}

const assertRuntimeEnvelope = (envelope, scenario, protocol) => {
  assert(envelope?.schemaVersion === 1, `${scenario.name}: invalid envelope version`)
  assert(envelope.ui?.locationProtocol === protocol, `${scenario.name}: wrong protocol`)
  assert(envelope.ui?.mainMenuReady === true, `${scenario.name}: main menu not ready`)
  assert(envelope.ui?.startupFailureVisible === false, `${scenario.name}: startup failure visible`)
  const thirdPartyStartupGate = envelope.thirdPartyStartupGate
  assert(thirdPartyStartupGate?.schemaVersion === 1,
    `${scenario.name}: missing third-party startup gate probe summary`)
  assert(thirdPartyStartupGate.observed === true,
    `${scenario.name}: third-party startup gate result was not handed to the runtime probe`)
  if (scenario.startupGateDisabled) {
    assertDisabledInstalledStartupState(thirdPartyStartupGate, scenario)
  } else if (scenario.startupGateUninstalled) {
    assertUninstalledStartupState(thirdPartyStartupGate, scenario)
  } else if (scenario.startupGateReady) {
    const expectedStartupGateRegistryCount =
      scenario.startupGateRegistryCount ?? defaultStartupGateRegistryCount
    const expectedStartupGateEntryCount =
      scenario.startupGateEntryCount ?? defaultStartupGateEntryCount
    assert(thirdPartyStartupGate.status === 'ready',
      `${scenario.name}: enabled shared renderer startup gate was not ready`)
    assert(thirdPartyStartupGate.enabled === true,
      `${scenario.name}: startup gate ready scenario did not enable the startup gate`)
    assert(thirdPartyStartupGate.appBootstrapContinuationAllowed === true,
      `${scenario.name}: ready startup gate did not allow app bootstrap`)
    assert(thirdPartyStartupGate.appStartupHostConnectionSourceStatus === 'accepted',
      `${scenario.name}: startup gate did not accept the app-startup host connection`)
    assert(thirdPartyStartupGate.targetPackageId === (scenario.startupGateTargetPackageId ?? 'sample_pack'),
      `${scenario.name}: startup gate reported the wrong target package`)
    assert(thirdPartyStartupGate.selectedPackageCount === 1,
      `${scenario.name}: startup gate selected package count mismatch`)
    assert(thirdPartyStartupGate.blockedPackageCount === 0,
      `${scenario.name}: startup gate blocked packages unexpectedly`)
    assert(thirdPartyStartupGate.loadOrderCount === 1,
      `${scenario.name}: startup gate load order count mismatch`)
    assert(thirdPartyStartupGate.registryCount === expectedStartupGateRegistryCount,
      `${scenario.name}: startup gate registry count mismatch`)
    assert(thirdPartyStartupGate.entryCount === expectedStartupGateEntryCount,
      `${scenario.name}: startup gate entry count mismatch`)
    assert(thirdPartyStartupGate.packageCount === 1,
      `${scenario.name}: startup gate package count mismatch`)
    assert(thirdPartyStartupGate.lockfileHashPresent === true,
      `${scenario.name}: startup gate did not report lockfile hash presence`)
    assert(thirdPartyStartupGate.effects?.appStartupHostConnectionSourceCalled === true,
      `${scenario.name}: startup gate app-startup host source was not called`)
    assert(thirdPartyStartupGate.effects?.appStartupHostConnectionAccepted === true,
      `${scenario.name}: startup gate app-startup host source was not accepted`)
    assert(thirdPartyStartupGate.effects?.thirdPartyRegistryPublished === true,
      `${scenario.name}: startup gate did not publish the third-party registry`)
    assert(thirdPartyStartupGate.effects?.liveRegistrySwapped === true,
      `${scenario.name}: startup gate did not swap the live registry`)
    assert(thirdPartyStartupGate.effects?.runtimeEnablementAllowed === true,
      `${scenario.name}: startup gate did not allow runtime enablement`)
    const expectsRealRuntimePublicationCommit =
      scenario.startupGateRealRuntimePublicationCommit !== false
    assert(
      thirdPartyStartupGate.effects?.realRuntimePublicationCommitCalled === expectsRealRuntimePublicationCommit,
      `${scenario.name}: startup gate real runtime publication commit host call mismatch`
    )
    const expectsRealNormalStartupHost =
      scenario.startupGateRealNormalStartupHost !== false
    assert(
      thirdPartyStartupGate.effects?.realNormalStartupHostCalled === expectsRealNormalStartupHost,
      `${scenario.name}: startup gate real normal startup host call mismatch`
    )
    assert(
      thirdPartyStartupGate.effects?.runtimePublicationCommitted === expectsRealRuntimePublicationCommit,
      `${scenario.name}: startup gate runtime publication commit effect mismatch`
    )
    if (scenario.startupGateExpectedProductProbeVariant !== undefined) {
      assertStartupProductProbeContent(thirdPartyStartupGate, scenario)
    }
    if (scenario.startupPersistentStateReady) {
      assert(thirdPartyStartupGate.startupPersistentStateSourceStatus === 'ready',
        `${scenario.name}: startup persistent-state source was not ready`)
      assert(thirdPartyStartupGate.startupStateSnapshotAccepted === true,
        `${scenario.name}: startup persistent-state snapshot was not accepted`)
      const expectedPersistentStateSourceKind =
        scenario.startupPersistentStateSourceKind ?? 'web-indexeddb'
      assert(thirdPartyStartupGate.startupPersistentStateSourceKind === expectedPersistentStateSourceKind,
        `${scenario.name}: startup persistent-state source kind mismatch`)
      if (scenario.startupPersistentStateSourceHostMode !== undefined) {
        assert(
          thirdPartyStartupGate.startupPersistentStateSourceHostMode
            === scenario.startupPersistentStateSourceHostMode,
          `${scenario.name}: startup persistent-state source host mode mismatch`
        )
        assert(
          thirdPartyStartupGate.startupPersistentStateInjectedSourceHostMode
            === scenario.startupPersistentStateSourceHostMode,
          `${scenario.name}: startup persistent-state legacy injected host mode mismatch`
        )
        assert(
          thirdPartyStartupGate.startupPersistentStateSourceHostMode !== 'injected-test-only',
          `${scenario.name}: startup persistent-state source host mode fell back to injected-test-only`
        )
      }
      assert(
        thirdPartyStartupGate.startupPersistentStateReadFromIndexedDb === (
          expectedPersistentStateSourceKind === 'web-indexeddb'
        ),
        `${scenario.name}: startup persistent state IndexedDB read flag mismatch`
      )
      assert(
        thirdPartyStartupGate.startupPersistentStateReadFromElectronUserdata === (
          expectedPersistentStateSourceKind === 'electron-program-directory-userdata'
        ),
        `${scenario.name}: startup persistent state Electron userdata read flag mismatch`
      )
      assert(thirdPartyStartupGate.persistentStateProofsAccepted === true,
        `${scenario.name}: startup persistent-state proofs were not accepted`)
      const expectsResponseDeliveryStartupGateHandoff =
        scenario.startupPersistentStateExpectsResponseDeliveryHandoff !== false
      if (expectsResponseDeliveryStartupGateHandoff) {
        assert(thirdPartyStartupGate.webResponseDeliveryStartupGateHandoffStatus === 'ready',
          `${scenario.name}: Web response delivery startup handoff was not ready`)
        assert(thirdPartyStartupGate.responseDeliveryStartupGateHandoffPrepared === true,
          `${scenario.name}: Web response delivery startup handoff was not prepared`)
        assert(thirdPartyStartupGate.webResponseDeliveryAcknowledgementConsumed === true,
          `${scenario.name}: Web response delivery acknowledgement was not consumed before startup persistent-state read`)
      } else {
        assert(thirdPartyStartupGate.webResponseDeliveryStartupGateHandoffStatus === undefined,
          `${scenario.name}: installed-state startup unexpectedly reported Web response delivery handoff status`)
        assert(thirdPartyStartupGate.responseDeliveryStartupGateHandoffPrepared === false,
          `${scenario.name}: installed-state startup unexpectedly prepared Web response delivery handoff`)
        assert(thirdPartyStartupGate.webResponseDeliveryAcknowledgementConsumed === false,
          `${scenario.name}: installed-state startup unexpectedly consumed Web response delivery acknowledgement`)
      }
    }
  } else {
    assert(thirdPartyStartupGate.status === 'skipped',
      `${scenario.name}: default shared renderer startup gate was not skipped`)
    assert(thirdPartyStartupGate.enabled === false,
      `${scenario.name}: default shared renderer startup gate should remain disabled`)
    assert(thirdPartyStartupGate.appBootstrapContinuationAllowed === true,
      `${scenario.name}: skipped startup gate should allow app bootstrap`)
    assert(thirdPartyStartupGate.selectedPackageCount === 0,
      `${scenario.name}: default startup gate selected packages unexpectedly`)
    assert(thirdPartyStartupGate.blockedPackageCount === 0,
      `${scenario.name}: default startup gate blocked packages unexpectedly`)
    assert(thirdPartyStartupGate.loadOrderCount === 0,
      `${scenario.name}: default startup gate reported load order unexpectedly`)
    assert(thirdPartyStartupGate.lockfileHashPresent === false,
      `${scenario.name}: default startup gate reported a lockfile hash unexpectedly`)
    for (const effectName of [
      'appStartupHostConnectionSourceCalled',
      'appStartupHostConnectionAccepted',
      'thirdPartyRegistryPublished',
      'liveRegistrySwapped',
      'runtimeEnablementAllowed',
      'realRuntimePublicationCommitCalled',
      'realNormalStartupHostCalled',
      'runtimePublicationCommitted'
    ]) {
      assert(thirdPartyStartupGate.effects?.[effectName] === false,
        `${scenario.name}: startup gate effect ${effectName} was not false`)
    }
  }
  for (const effectName of [
    'uiIpcResponseDelivered',
    'commandDispatched',
    'transactionCommitted',
    'packageFilesWritten',
    'lockfileWritten',
    'settingsWritten',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(thirdPartyStartupGate.effects?.[effectName] === false,
      `${scenario.name}: startup gate effect ${effectName} was not false`)
  }

  const thirdPartyAppStartupHost = envelope.thirdPartyAppStartupHost
  assert(thirdPartyAppStartupHost?.schemaVersion === 1,
    `${scenario.name}: missing third-party app-startup host probe summary`)
  assert(thirdPartyAppStartupHost.observed === true,
    `${scenario.name}: mounted app-startup host result was not handed to the runtime probe`)
  if (scenario.startupGateDisabled) {
    assert(thirdPartyAppStartupHost.status === 'skipped',
      `${scenario.name}: disabled installed-state mounted app-startup host should skip publication`)
    assert(thirdPartyAppStartupHost.enabled === true,
      `${scenario.name}: disabled installed-state mounted app-startup host was not enabled`)
    assert(thirdPartyAppStartupHost.sourceCalled === true,
      `${scenario.name}: disabled installed-state mounted app-startup host did not consume startup state`)
    assert(thirdPartyAppStartupHost.targetPackageId === 'product_probe_pack',
      `${scenario.name}: disabled installed-state mounted app-startup host reported the wrong package`)
    assert(thirdPartyAppStartupHost.selectedPackageCount === 0,
      `${scenario.name}: disabled installed-state mounted app-startup host selected a package`)
    assert(thirdPartyAppStartupHost.blockedPackageCount === 1,
      `${scenario.name}: disabled installed-state mounted app-startup host did not preserve the blocked package`)
    assert(thirdPartyAppStartupHost.loadOrderCount === 0,
      `${scenario.name}: disabled installed-state mounted app-startup host reported a load order`)
    assert(thirdPartyAppStartupHost.registryCount === 54,
      `${scenario.name}: disabled installed-state mounted app-startup host changed the registry count`)
    assert(thirdPartyAppStartupHost.entryCount === 4242,
      `${scenario.name}: disabled installed-state mounted app-startup host changed the entry count`)
    assert(thirdPartyAppStartupHost.packageCount === 1,
      `${scenario.name}: disabled installed-state mounted app-startup host reported the wrong package count`)
    assert(thirdPartyAppStartupHost.lockfileHashPresent === false,
      `${scenario.name}: disabled installed-state mounted app-startup host exposed a lockfile hash`)
    assert(thirdPartyAppStartupHost.effects?.realAppStartupHostCalled === false,
      `${scenario.name}: disabled installed-state mounted app-startup host claimed a runtime handoff`)
    assert(thirdPartyAppStartupHost.effects?.appStartupHostConnectionAccepted === false,
      `${scenario.name}: disabled installed-state mounted app-startup host claimed acceptance`)
    assert(thirdPartyAppStartupHost.effects?.officialContentBootstrapped === true,
      `${scenario.name}: disabled installed-state mounted app-startup host missed official content bootstrap`)
    assert(thirdPartyAppStartupHost.effects?.runtimeContentRegistryPublished === true,
      `${scenario.name}: disabled installed-state mounted app-startup host missed official registry publication`)
    assert(thirdPartyAppStartupHost.effects?.thirdPartyStartupGateCompleted === true,
      `${scenario.name}: disabled installed-state mounted app-startup host missed startup gate completion`)
    assert(thirdPartyAppStartupHost.effects?.thirdPartyStartupGateAllowed === true,
      `${scenario.name}: disabled installed-state mounted app-startup host missed startup gate allow state`)
    for (const effectName of [
      'gameAppCreated',
      'piniaCreated',
      'routerInstalled',
      'routerMounted',
      'thirdPartyRegistryPublished',
      'liveRegistrySwapped',
      'runtimeEnablementAllowed',
      'realRuntimePublicationCommitCalled',
      'runtimePublicationCommitted'
    ]) {
      assert(thirdPartyAppStartupHost.effects?.[effectName] === false,
        `${scenario.name}: disabled installed-state app-startup effect ${effectName} was not false`)
    }
  } else if (scenario.startupGateUninstalled) {
    assert(thirdPartyAppStartupHost.status === 'skipped',
      `${scenario.name}: uninstalled mounted app-startup host should skip publication`)
    assert(thirdPartyAppStartupHost.enabled === false,
      `${scenario.name}: uninstalled mounted app-startup host should remain disabled`)
    assert(thirdPartyAppStartupHost.sourceCalled === true,
      `${scenario.name}: uninstalled mounted app-startup host did not observe startup state`)
    assert(thirdPartyAppStartupHost.selectedPackageCount === 0,
      `${scenario.name}: uninstalled mounted app-startup host selected a package`)
    assert(thirdPartyAppStartupHost.blockedPackageCount === 0,
      `${scenario.name}: uninstalled mounted app-startup host blocked a package`)
    assert(thirdPartyAppStartupHost.loadOrderCount === 0,
      `${scenario.name}: uninstalled mounted app-startup host reported a load order`)
    assert(thirdPartyAppStartupHost.packageCount === 0,
      `${scenario.name}: uninstalled mounted app-startup host reported an installed package`)
    assert(thirdPartyAppStartupHost.effects?.realAppStartupHostCalled === false,
      `${scenario.name}: uninstalled mounted app-startup host claimed a runtime handoff`)
    assert(thirdPartyAppStartupHost.effects?.appStartupHostConnectionAccepted === false,
      `${scenario.name}: uninstalled mounted app-startup host claimed acceptance`)
  } else if (scenario.startupGateReady) {
    const expectsRealRuntimePublicationCommit =
      scenario.startupGateRealRuntimePublicationCommit !== false
    assert(thirdPartyAppStartupHost.status === 'accepted',
      `${scenario.name}: mounted app-startup host was not accepted`)
    assert(thirdPartyAppStartupHost.enabled === true,
      `${scenario.name}: mounted app-startup host did not preserve enabled startup gate state`)
    assert(thirdPartyAppStartupHost.sourceCalled === true,
      `${scenario.name}: mounted app-startup host did not consume the startup gate result`)
    assert(thirdPartyAppStartupHost.targetPackageId === (
      scenario.startupGateTargetPackageId ?? 'sample_pack'
    ), `${scenario.name}: mounted app-startup host reported the wrong target package`)
    assert(thirdPartyAppStartupHost.appStartupHostConnectionSourceStatus === 'accepted',
      `${scenario.name}: mounted app-startup host did not preserve app-startup connection status`)
    assert(thirdPartyAppStartupHost.selectedPackageCount === 1,
      `${scenario.name}: mounted app-startup host selected package count mismatch`)
    assert(thirdPartyAppStartupHost.blockedPackageCount === 0,
      `${scenario.name}: mounted app-startup host blocked packages unexpectedly`)
    assert(thirdPartyAppStartupHost.loadOrderCount === 1,
      `${scenario.name}: mounted app-startup host load order count mismatch`)
    assert(thirdPartyAppStartupHost.registryCount === (
      scenario.startupGateRegistryCount ?? defaultStartupGateRegistryCount
    ), `${scenario.name}: mounted app-startup host registry count mismatch`)
    assert(thirdPartyAppStartupHost.entryCount === (
      scenario.startupGateEntryCount ?? defaultStartupGateEntryCount
    ), `${scenario.name}: mounted app-startup host entry count mismatch`)
    assert(thirdPartyAppStartupHost.packageCount === 1,
      `${scenario.name}: mounted app-startup host package count mismatch`)
    assert(thirdPartyAppStartupHost.lockfileHashPresent === true,
      `${scenario.name}: mounted app-startup host did not preserve lockfile hash presence`)
    assert(thirdPartyAppStartupHost.effects?.realAppStartupHostCalled === true,
      `${scenario.name}: mounted app-startup host did not call the real app startup host`)
    assert(thirdPartyAppStartupHost.effects?.appStartupHostConnectionAccepted === true,
      `${scenario.name}: mounted app-startup host did not preserve accepted startup connection`)
    assert(thirdPartyAppStartupHost.effects?.officialContentBootstrapped === true,
      `${scenario.name}: mounted app-startup host did not observe official content bootstrap`)
    assert(thirdPartyAppStartupHost.effects?.runtimeContentRegistryPublished === true,
      `${scenario.name}: mounted app-startup host did not observe runtime registry publication`)
    assert(thirdPartyAppStartupHost.effects?.thirdPartyStartupGateCompleted === true,
      `${scenario.name}: mounted app-startup host did not observe startup gate completion`)
    assert(thirdPartyAppStartupHost.effects?.thirdPartyStartupGateAllowed === true,
      `${scenario.name}: mounted app-startup host did not observe startup gate allow state`)
    assert(thirdPartyAppStartupHost.effects?.gameAppCreated === true,
      `${scenario.name}: mounted app-startup host did not observe app creation`)
    assert(thirdPartyAppStartupHost.effects?.piniaCreated === true,
      `${scenario.name}: mounted app-startup host did not observe Pinia creation`)
    assert(thirdPartyAppStartupHost.effects?.routerInstalled === true,
      `${scenario.name}: mounted app-startup host did not observe router installation`)
    assert(thirdPartyAppStartupHost.effects?.routerMounted === true,
      `${scenario.name}: mounted app-startup host did not observe router mount`)
    assert(thirdPartyAppStartupHost.effects?.thirdPartyRegistryPublished === true,
      `${scenario.name}: mounted app-startup host did not preserve third-party registry publication`)
    assert(thirdPartyAppStartupHost.effects?.liveRegistrySwapped === true,
      `${scenario.name}: mounted app-startup host did not preserve live registry swap`)
    assert(thirdPartyAppStartupHost.effects?.runtimeEnablementAllowed === true,
      `${scenario.name}: mounted app-startup host did not preserve runtime enablement`)
    assert(
      thirdPartyAppStartupHost.effects?.realRuntimePublicationCommitCalled ===
        expectsRealRuntimePublicationCommit,
      `${scenario.name}: mounted app-startup host real runtime publication commit mismatch`
    )
    assert(
      thirdPartyAppStartupHost.effects?.runtimePublicationCommitted ===
        expectsRealRuntimePublicationCommit,
      `${scenario.name}: mounted app-startup host runtime publication commit mismatch`
    )
  } else {
    assert(thirdPartyAppStartupHost.status === 'skipped',
      `${scenario.name}: mounted app-startup host should skip without a ready startup gate`)
    assert(thirdPartyAppStartupHost.enabled === false,
      `${scenario.name}: skipped mounted app-startup host should remain disabled`)
    assert(thirdPartyAppStartupHost.effects?.realAppStartupHostCalled === false,
      `${scenario.name}: skipped mounted app-startup host claimed a real handoff`)
    assert(thirdPartyAppStartupHost.effects?.gameAppCreated === false,
      `${scenario.name}: skipped mounted app-startup host claimed app creation`)
    assert(thirdPartyAppStartupHost.effects?.piniaCreated === false,
      `${scenario.name}: skipped mounted app-startup host claimed Pinia creation`)
    assert(thirdPartyAppStartupHost.effects?.routerMounted === false,
      `${scenario.name}: skipped mounted app-startup host claimed router mount`)
  }
  for (const effectName of [
    'saveRead',
    'uiIpcResponseDelivered',
    'commandDispatched',
    'transactionCommitted',
    'packageFilesWritten',
    'lockfileWritten',
    'settingsWritten',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(thirdPartyAppStartupHost.effects?.[effectName] === false,
      `${scenario.name}: mounted app-startup host effect ${effectName} was not false`)
  }

  const thirdPartyRendererUiIpc = envelope.thirdPartyRendererUiIpc
  const expectedRendererPlatform = protocol === 'file:' ? 'electron' : 'web'
  const expectsElectronRendererDelivery = expectedRendererPlatform === 'electron'
  assert(thirdPartyRendererUiIpc?.schemaVersion === 1,
    `${scenario.name}: missing third-party renderer UI/IPC probe summary`)
  if (scenarioExpectsRendererUiIpcProbe(scenario)) {
    assert(thirdPartyRendererUiIpc.observed === true,
      `${scenario.name}: renderer UI/IPC delivery result was not handed to the runtime probe`)
    assert(thirdPartyRendererUiIpc.status === 'ready',
      `${scenario.name}: renderer UI/IPC delivery was not ready`)
    assert(thirdPartyRendererUiIpc.deliveryInputSource === (
      scenario.rendererUiIpcInstallResult
        ? 'install-transaction-commit-finalization'
        : 'synthetic-success-handoff'
    ), `${scenario.name}: renderer UI/IPC delivery used the wrong input source`)
    assert(thirdPartyRendererUiIpc.selectedPlatform === expectedRendererPlatform,
      `${scenario.name}: renderer UI/IPC delivery did not use the ${expectedRendererPlatform} bridge`)
    assert(thirdPartyRendererUiIpc.targetPackageId === 'product_probe_pack',
      `${scenario.name}: renderer UI/IPC delivery reported the wrong probe package`)
    assert(thirdPartyRendererUiIpc.envelopeKind === 'success',
      `${scenario.name}: renderer UI/IPC delivery reported the wrong envelope kind`)
    assert(thirdPartyRendererUiIpc.messageKey === 'mods.ui.ipc.result.install.success',
      `${scenario.name}: renderer UI/IPC delivery reported the wrong message key`)
    assert(thirdPartyRendererUiIpc.selectedPackageCount === 1,
      `${scenario.name}: renderer UI/IPC delivery selected package count mismatch`)
    assert(thirdPartyRendererUiIpc.blockedPackageCount === 0,
      `${scenario.name}: renderer UI/IPC delivery blocked packages unexpectedly`)
    assert(thirdPartyRendererUiIpc.loadOrderCount === 1,
      `${scenario.name}: renderer UI/IPC delivery load order count mismatch`)
    assert(thirdPartyRendererUiIpc.lockfileHashPresent === true,
      `${scenario.name}: renderer UI/IPC delivery did not report lockfile hash presence`)
    assert(thirdPartyRendererUiIpc.platformResponseDelivered === true,
      `${scenario.name}: renderer UI/IPC platform response was not delivered`)
    assert(thirdPartyRendererUiIpc.deliveryAcknowledgementConsumed === true,
      `${scenario.name}: renderer UI/IPC acknowledgement was not consumed`)
    assert(thirdPartyRendererUiIpc.webDomResponseEventObserved === true,
      `${scenario.name}: renderer UI/IPC DOM surface event was not observed`)
    assert(thirdPartyRendererUiIpc.effects?.uiIpcResponseDelivered === true,
      `${scenario.name}: renderer UI/IPC delivery effect was not true`)
    assert(thirdPartyRendererUiIpc.effects?.electronIpcResponseSent === expectsElectronRendererDelivery,
      `${scenario.name}: renderer UI/IPC Electron response effect mismatch`)
    assert(thirdPartyRendererUiIpc.effects?.webUiResponsePublished === !expectsElectronRendererDelivery,
      `${scenario.name}: renderer UI/IPC Web publish effect mismatch`)
    for (const effectName of [
      'androidUiResponsePublished',
      'commandDispatched',
      'transactionCommitted',
      'runtimePublicationCommitted',
      'packageFilesWritten',
      'lockfileWritten',
      'settingsWritten',
      'savesWritten',
      'cacheWritten',
      'transactionLogWritten',
      'rollbackExecuted',
      'diagnosticsWritten'
    ]) {
      assert(thirdPartyRendererUiIpc.effects?.[effectName] === false,
        `${scenario.name}: renderer UI/IPC effect ${effectName} was not false`)
    }
  } else {
    assert(thirdPartyRendererUiIpc.observed === false,
      `${scenario.name}: visible data pack operation should not run the generic renderer UI/IPC probe`)
    assert(thirdPartyRendererUiIpc.selectedPackageCount === 0,
      `${scenario.name}: inactive renderer UI/IPC summary selected packages`)
    assert(thirdPartyRendererUiIpc.blockedPackageCount === 0,
      `${scenario.name}: inactive renderer UI/IPC summary blocked packages`)
    assert(thirdPartyRendererUiIpc.loadOrderCount === 0,
      `${scenario.name}: inactive renderer UI/IPC summary reported load order`)
    assert(thirdPartyRendererUiIpc.lockfileHashPresent === false,
      `${scenario.name}: inactive renderer UI/IPC summary exposed a lockfile hash`)
    assert(thirdPartyRendererUiIpc.platformResponseDelivered === false,
      `${scenario.name}: inactive renderer UI/IPC summary delivered a platform response`)
    assert(thirdPartyRendererUiIpc.deliveryAcknowledgementConsumed === false,
      `${scenario.name}: inactive renderer UI/IPC summary consumed an acknowledgement`)
    assert(thirdPartyRendererUiIpc.webDomResponseEventObserved === false,
      `${scenario.name}: inactive renderer UI/IPC summary observed a DOM response event`)
    for (const effectName of [
      'uiIpcResponseDelivered',
      'electronIpcResponseSent',
      'webUiResponsePublished',
      'androidUiResponsePublished',
      'commandDispatched',
      'transactionCommitted',
      'runtimePublicationCommitted',
      'packageFilesWritten',
      'lockfileWritten',
      'settingsWritten',
      'savesWritten',
      'cacheWritten',
      'transactionLogWritten',
      'rollbackExecuted',
      'diagnosticsWritten'
    ]) {
      assert(thirdPartyRendererUiIpc.effects?.[effectName] === false,
        `${scenario.name}: inactive renderer UI/IPC effect ${effectName} was not false`)
    }
  }

  const electronInstallCommandDispatch = envelope.thirdPartyElectronInstallCommandDispatch
  assert(electronInstallCommandDispatch?.schemaVersion === 1,
    `${scenario.name}: missing Electron install command dispatch probe summary`)
  if (scenario.installCommandDispatchIpc) {
    assert(protocol === 'file:',
      `${scenario.name}: install command dispatch IPC probe must run in Electron`)
    assert(electronInstallCommandDispatch.observed === true,
      `${scenario.name}: Electron install command dispatch was not observed`)
    assert(electronInstallCommandDispatch.status === 'dispatched',
      `${scenario.name}: Electron install command dispatch did not dispatch`)
    assert(electronInstallCommandDispatch.requestedCommandId === 'install',
      `${scenario.name}: Electron install command dispatch used the wrong command`)
    assert(electronInstallCommandDispatch.targetPackageId === 'product_probe_pack',
      `${scenario.name}: Electron install command dispatch reported the wrong package`)
    assert(electronInstallCommandDispatch.diagnosticsCount === 0,
      `${scenario.name}: Electron install command dispatch reported diagnostics`)
    assert(electronInstallCommandDispatch.lockfileHashPresent === false,
      `${scenario.name}: Electron install command dispatch summary should not expose lockfile hash`)
    assert(electronInstallCommandDispatch.effects?.commandDispatcherCalled === true,
      `${scenario.name}: Electron install command dispatcher was not called`)
    assert(electronInstallCommandDispatch.effects?.commandDispatched === true,
      `${scenario.name}: Electron install command was not dispatched`)
  } else {
    assert(electronInstallCommandDispatch.observed === false,
      `${scenario.name}: Electron install command dispatch ran outside its scenario`)
    assert(electronInstallCommandDispatch.lockfileHashPresent === false,
      `${scenario.name}: inactive Electron install command dispatch reported a lockfile hash`)
    assert(electronInstallCommandDispatch.effects?.commandDispatcherCalled === false,
      `${scenario.name}: inactive Electron install command dispatcher was called`)
    assert(electronInstallCommandDispatch.effects?.commandDispatched === false,
      `${scenario.name}: inactive Electron install command was dispatched`)
  }
  for (const effectName of [
    'transactionCommitted',
    'postCommitVerificationExecuted',
    'uiIpcResponseDelivered',
    'packageFilesWritten',
    'packageBackupsWritten',
    'packageFilesRestored',
    'lockfileWritten',
    'lockfileRestored',
    'settingsWritten',
    'settingsRestored',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'recoveryLogRead',
    'recoveryLogReplayed',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(electronInstallCommandDispatch.effects?.[effectName] === false,
      `${scenario.name}: Electron install command dispatch effect ${effectName} was not false`)
  }

  const visibleImport = envelope.thirdPartyVisibleImport
  assert(visibleImport?.schemaVersion === 1,
    `${scenario.name}: missing third-party visible import probe summary`)
  if (scenario.visibleEnable) {
    assertVisibleEnableProductProbe(visibleImport, scenario, protocol)
  } else if (scenario.visibleDisable) {
    assertVisibleDisableProductProbe(visibleImport, scenario, protocol)
  } else if (scenario.visibleUninstall) {
    assertVisibleUninstallProductProbe(visibleImport, scenario, protocol)
  } else if (scenario.visibleImportFailure) {
    assertVisibleImportFailureProductProbe(visibleImport, scenario, protocol)
  } else if (scenario.visibleImportRollback) {
    assertVisibleImportRollbackProductProbe(visibleImport, scenario, protocol)
  } else if (scenario.visibleImportRendererLiveRegistry) {
    assert(protocol === 'file:',
      `${scenario.name}: visible import probe must run in Electron`)
    assert(visibleImport.observed === true,
      `${scenario.name}: visible import probe was not observed`)
    assert(visibleImport.status === 'ready',
      `${scenario.name}: visible import did not reach ready status`)
    assert(visibleImport.entrypoint === 'main-menu-panel',
      `${scenario.name}: visible import did not start from the MainMenu panel`)
    assert(visibleImport.mainMenuPanelOpened === true,
      `${scenario.name}: visible import did not open the MainMenu panel`)
    assert(visibleImport.panelImportButtonClicked === true,
      `${scenario.name}: visible import did not click the panel import button`)
    assert(visibleImport.defaultFileInputSelectorUsed === true,
      `${scenario.name}: visible import did not use the default file input selector`)
    assertVisibleImportPanelLabels(
      visibleImport,
      scenario,
      '已确认（Electron）',
      '已送达（Electron）'
    )
    assertVisibleImportProductContent(visibleImport, scenario)
    assert(visibleImport.fileCount === 5,
      `${scenario.name}: visible import used the wrong file count`)
    assert(visibleImport.pickStatus === 'persisted',
      `${scenario.name}: visible import source was not persisted after panel selection`)
    assert(visibleImport.dispatchPreflightStatus === 'deferred',
      `${scenario.name}: visible import dispatch preflight was not deferred`)
    assert(visibleImport.discoveryStatus === 'completed',
      `${scenario.name}: visible import discovery was not completed`)
    assert(visibleImport.transactionCommandDispatcherHostKind === 'renderer',
      `${scenario.name}: visible import did not use the renderer dispatcher host`)
    assert(visibleImport.transactionCommandDispatcherSourceStatus === 'dispatched',
      `${scenario.name}: visible import command was not dispatched`)
    assert(visibleImport.installCommandPostCommitAcknowledgementStatus === 'ready',
      `${scenario.name}: visible import post-commit acknowledgement was not ready`)
    assert(visibleImport.postCommitVerificationExecutorHostMode === 'electron-main-visible-import',
      `${scenario.name}: visible import did not use the Electron visible-import post-commit verification host mode`)
    assert(visibleImport.installTransactionLogPreparedStatus === 'prepared',
      `${scenario.name}: visible import transaction log was not prepared`)
    assert(
      visibleImport.installTransactionLogPreparedStorageKind
        === 'program-directory-userdata-install-transaction-log-prepared',
      `${scenario.name}: visible import transaction log did not use the program-directory userdata storage host`
    )
    assert(visibleImport.installTransactionLogPreparedPersistentReadVerificationStatus === 'verified',
      `${scenario.name}: visible import transaction log read verification was not verified`)
    assert(visibleImport.installTransactionCommitFinalizationStatus === 'committed',
      `${scenario.name}: visible import transaction finalization was not committed`)
    assert(visibleImport.postCommitUiIpcDeliveryContinuationStatus === 'ready',
      `${scenario.name}: visible import UI/IPC continuation was not ready`)
    assert(visibleImport.ordinaryInstallTransactionTerminalConnectionStatus === 'ready',
      `${scenario.name}: visible import ordinary terminal was not ready`)
    assert(visibleImport.ordinaryInstallTransactionOutcomeKind === 'success',
      `${scenario.name}: visible import ordinary terminal did not report success outcome`)
    assert(visibleImport.runtimePublicationCommitAfterPostCommitVerificationStatus === 'accepted',
      `${scenario.name}: visible import runtime publication verification was not accepted`)
    assert(visibleImport.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus === 'swapped',
      `${scenario.name}: visible import live registry swap was not acknowledged`)
    assert(visibleImport.runtimePublicationCommitAppStartupReadinessStatus === 'ready',
      `${scenario.name}: visible import app-startup readiness was not ready`)
    assert(visibleImport.runtimePublicationCommitAppStartupHostConnectionStatus === 'accepted',
      `${scenario.name}: visible import app-startup host handoff was not accepted`)
    assert(visibleImport.webStartupPersistentStateWriteStatus !== 'written',
      `${scenario.name}: Electron visible import should not write Web startup persistent state`)
    assert(visibleImport.electronStartupPersistentStateWriteStatus === 'written',
      `${scenario.name}: Electron visible import did not write Electron startup persistent state`)
    assert(visibleImport.selectedPackageCount === 1,
      `${scenario.name}: visible import selected package count mismatch`)
    assert(visibleImport.blockedPackageCount === 0,
      `${scenario.name}: visible import blocked packages unexpectedly`)
    assert(visibleImport.loadOrderCount === 1,
      `${scenario.name}: visible import load order count mismatch`)
    assert(visibleImport.registryCount === 54,
      `${scenario.name}: visible import registry count mismatch`)
    assert(visibleImport.entryCount === 4245,
      `${scenario.name}: visible import entry count mismatch`)
    assert(visibleImport.packageCount === 1,
      `${scenario.name}: visible import package count mismatch`)
    assert(Number.isSafeInteger(visibleImport.diagnosticsCount) && visibleImport.diagnosticsCount >= 0,
      `${scenario.name}: visible import diagnostics count was invalid`)
    assert(visibleImport.contentAccessItemVisibleBefore === !!scenario.visibleUpgrade,
      `${scenario.name}: visible import item visibility before import was unexpected`)
    assert(visibleImport.contentAccessItemVisibleAfter === true,
      `${scenario.name}: visible import item was not visible after renderer live registry swap`)
    assert(visibleImport.contentAccessRecipeVisibleBefore === !!scenario.visibleUpgrade,
      `${scenario.name}: visible import recipe visibility before import was unexpected`)
    assert(visibleImport.contentAccessRecipeVisibleAfter === true,
      `${scenario.name}: visible import recipe was not visible after renderer live registry swap`)
    assert(visibleImport.contentAccessShopOfferVisibleBefore === !!scenario.visibleUpgrade,
      `${scenario.name}: visible import shop offer visibility before import was unexpected`)
    assert(visibleImport.contentAccessShopOfferVisibleAfter === true,
      `${scenario.name}: visible import shop offer was not visible after renderer live registry swap`)
    for (const effectName of [
      'commandDispatched',
      'packageFilesWritten',
      'settingsWritten',
      'lockfileWritten',
      'rendererLiveRegistrySwapped',
      'runtimeEnablementAllowed',
      'uiIpcResponseDelivered',
      'transactionCommitted',
      'transactionLogPrepared',
      'transactionLogRead',
      'startupPersistentStateWritten',
      'realNormalStartupHostCalled',
      'realAppStartupHostCalled',
      'gameAppCreated',
      'piniaCreated',
      'routerMounted',
      'transactionLogWritten'
    ]) {
      assert(visibleImport.effects?.[effectName] === true,
        `${scenario.name}: visible import effect ${effectName} was not true`)
    }
    for (const effectName of [
      'savesWritten',
      'cacheWritten',
      'rollbackExecuted',
      'diagnosticsWritten'
    ]) {
      assert(visibleImport.effects?.[effectName] === false,
        `${scenario.name}: visible import effect ${effectName} was not false`)
    }
  } else if (scenario.visibleImportWebOrdinary) {
    assert(protocol === 'http:',
      `${scenario.name}: Web visible import probe must run in the Web product host`)
    assert(visibleImport.observed === true,
      `${scenario.name}: Web visible import probe was not observed`)
    assert(visibleImport.status === 'ready',
      `${scenario.name}: Web visible import did not reach ready status`)
    assert(visibleImport.entrypoint === 'main-menu-panel',
      `${scenario.name}: Web visible import did not start from the MainMenu panel`)
    assert(visibleImport.mainMenuPanelOpened === true,
      `${scenario.name}: Web visible import did not open the MainMenu panel`)
    assert(visibleImport.panelImportButtonClicked === true,
      `${scenario.name}: Web visible import did not click the panel import button`)
    assert(visibleImport.defaultFileInputSelectorUsed === true,
      `${scenario.name}: Web visible import did not use the default file input selector`)
    assertVisibleImportPanelLabels(
      visibleImport,
      scenario,
      '已确认（Web）',
      '已送达（Web）'
    )
    assertVisibleImportProductContent(visibleImport, scenario)
    assert(visibleImport.fileCount === 5,
      `${scenario.name}: Web visible import used the wrong file count`)
    assert(visibleImport.pickStatus === 'persisted',
      `${scenario.name}: Web visible import source was not persisted to IndexedDB`)
    assert(visibleImport.dispatchPreflightStatus === 'deferred',
      `${scenario.name}: Web visible import dispatch preflight was not deferred`)
    assert(visibleImport.discoveryStatus === 'completed',
      `${scenario.name}: Web visible import discovery was not completed`)
    assert(visibleImport.transactionCommandDispatcherHostKind === 'web',
      `${scenario.name}: Web visible import did not use the Web dispatcher host`)
    assert(visibleImport.transactionCommandDispatcherSourceStatus === 'dispatched',
      `${scenario.name}: Web visible import command was not dispatched`)
    assert(visibleImport.installCommandPostCommitAcknowledgementStatus === 'ready',
      `${scenario.name}: Web visible import post-commit acknowledgement was not ready`)
    assert(visibleImport.installTransactionLogPreparedStatus === 'prepared',
      `${scenario.name}: Web visible import transaction log was not prepared`)
    assert(visibleImport.installTransactionLogPreparedStorageKind === 'web-indexeddb-install-transaction-log-prepared',
      `${scenario.name}: Web visible import transaction log did not use the Web IndexedDB storage host`)
    assert(visibleImport.installTransactionLogPreparedPersistentReadVerificationStatus === 'verified',
      `${scenario.name}: Web visible import transaction log read verification was not verified`)
    assert(visibleImport.installTransactionCommitFinalizationStatus === 'committed',
      `${scenario.name}: Web visible import transaction finalization was not committed`)
    assert(visibleImport.postCommitUiIpcDeliveryContinuationStatus === 'ready',
      `${scenario.name}: Web visible import UI/IPC continuation was not ready`)
    assert(visibleImport.ordinaryInstallTransactionTerminalConnectionStatus === 'ready',
      `${scenario.name}: Web visible import ordinary terminal was not ready`)
    assert(visibleImport.ordinaryInstallTransactionOutcomeKind === 'success',
      `${scenario.name}: Web visible import ordinary terminal did not report success outcome`)
    assert(visibleImport.runtimePublicationCommitAfterPostCommitVerificationStatus === 'accepted',
      `${scenario.name}: Web visible import runtime publication verification was not accepted`)
    assert(visibleImport.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus === 'swapped',
      `${scenario.name}: Web visible import live registry swap was not acknowledged`)
    assert(visibleImport.runtimePublicationCommitAppStartupReadinessStatus === 'ready',
      `${scenario.name}: Web visible import app-startup readiness was not ready`)
    assert(visibleImport.runtimePublicationCommitAppStartupHostConnectionStatus === 'accepted',
      `${scenario.name}: Web visible import app-startup host handoff was not accepted`)
    assert(visibleImport.webStartupPersistentStateWriteStatus === 'written',
      `${scenario.name}: Web visible import did not write startup persistent state`)
    assert(visibleImport.electronStartupPersistentStateWriteStatus !== 'written',
      `${scenario.name}: Web visible import should not write Electron startup persistent state`)
    assert(visibleImport.selectedPackageCount === 1,
      `${scenario.name}: Web visible import selected package count mismatch`)
    assert(visibleImport.blockedPackageCount === 0,
      `${scenario.name}: Web visible import blocked packages unexpectedly`)
    assert(visibleImport.loadOrderCount === 1,
      `${scenario.name}: Web visible import load order count mismatch`)
    assert(visibleImport.registryCount === 54,
      `${scenario.name}: Web visible import registry count mismatch`)
    assert(visibleImport.entryCount === 4245,
      `${scenario.name}: Web visible import entry count mismatch`)
    assert(visibleImport.packageCount === 1,
      `${scenario.name}: Web visible import package count mismatch`)
    assert(Number.isSafeInteger(visibleImport.diagnosticsCount) && visibleImport.diagnosticsCount >= 0,
      `${scenario.name}: Web visible import diagnostics count was invalid`)
    assert(visibleImport.contentAccessItemVisibleBefore === !!scenario.visibleUpgrade,
      `${scenario.name}: Web visible import item visibility before import was unexpected`)
    for (const effectName of [
      'commandDispatched',
      'packageFilesWritten',
      'settingsWritten',
      'lockfileWritten',
      'rendererLiveRegistrySwapped',
      'runtimeEnablementAllowed',
      'uiIpcResponseDelivered',
      'transactionCommitted',
      'transactionLogPrepared',
      'transactionLogRead',
      'startupPersistentStateWritten',
      'realNormalStartupHostCalled',
      'realAppStartupHostCalled',
      'gameAppCreated',
      'piniaCreated',
      'routerMounted',
      'transactionLogWritten'
    ]) {
      assert(visibleImport.effects?.[effectName] === true,
        `${scenario.name}: Web visible import effect ${effectName} was not true`)
    }
    assert(visibleImport.contentAccessItemVisibleAfter === true,
      `${scenario.name}: Web visible import item was not visible after Web live registry swap`)
    assert(visibleImport.contentAccessRecipeVisibleBefore === !!scenario.visibleUpgrade,
      `${scenario.name}: Web visible import recipe visibility before import was unexpected`)
    assert(visibleImport.contentAccessRecipeVisibleAfter === true,
      `${scenario.name}: Web visible import recipe was not visible after Web live registry swap`)
    assert(visibleImport.contentAccessShopOfferVisibleBefore === !!scenario.visibleUpgrade,
      `${scenario.name}: Web visible import shop offer visibility before import was unexpected`)
    assert(visibleImport.contentAccessShopOfferVisibleAfter === true,
      `${scenario.name}: Web visible import shop offer was not visible after Web live registry swap`)
    for (const effectName of [
      'savesWritten',
      'cacheWritten',
      'rollbackExecuted',
      'diagnosticsWritten'
    ]) {
      assert(visibleImport.effects?.[effectName] === false,
        `${scenario.name}: Web visible import effect ${effectName} was not false`)
    }
  } else {
    assert(visibleImport.observed === false,
      `${scenario.name}: visible import probe ran outside its scenario`)
    assert(visibleImport.mainMenuPanelOpened === false,
      `${scenario.name}: inactive visible import reported an opened panel`)
    assert(visibleImport.panelImportButtonClicked === false,
      `${scenario.name}: inactive visible import reported a panel import click`)
    assert(visibleImport.defaultFileInputSelectorUsed === false,
      `${scenario.name}: inactive visible import reported a file input selection`)
    assert(visibleImport.contentAccessItemVisibleAfter === false,
      `${scenario.name}: inactive visible import reported content visibility`)
    assert(visibleImport.contentAccessRecipeVisibleAfter === false,
      `${scenario.name}: inactive visible import reported recipe visibility`)
    assert(visibleImport.contentAccessShopOfferVisibleAfter === false,
      `${scenario.name}: inactive visible import reported shop offer visibility`)
    for (const effectName of [
      'commandDispatched',
      'packageFilesWritten',
      'settingsWritten',
      'lockfileWritten',
      'rendererLiveRegistrySwapped',
      'runtimeEnablementAllowed',
      'uiIpcResponseDelivered',
      'transactionCommitted',
      'transactionLogPrepared',
      'transactionLogRead',
      'startupPersistentStateWritten',
      'realNormalStartupHostCalled',
      'realAppStartupHostCalled',
      'gameAppCreated',
      'piniaCreated',
      'routerMounted',
      'savesWritten',
      'cacheWritten',
      'transactionLogWritten',
      'rollbackExecuted',
      'diagnosticsWritten'
    ]) {
      assert(visibleImport.effects?.[effectName] === false,
        `${scenario.name}: inactive visible import effect ${effectName} was not false`)
    }
  }

  const report = envelope.runtime
  if (scenario.source !== null) {
    assert(report?.runtimeSource === scenario.source, `${scenario.name}: wrong runtime source`)
    assert(report?.precompiledStatus === scenario.status, `${scenario.name}: wrong fallback status`)
  } else {
    assert(
      ['disk-cache', 'precompiled', 'static-fallback'].includes(report?.runtimeSource),
      `${scenario.name}: invalid runtime source`
    )
  }
  assert(report?.registryPhase === 'frozen', `${scenario.name}: registry set not frozen`)
  assert(report?.snapshotFormatVersion === 2, `${scenario.name}: wrong snapshot format`)
  assert(report?.registryCount === 54, `${scenario.name}: wrong registry count`)
  assert(report?.entryCount === 4242, `${scenario.name}: wrong entry count`)
  assert(JSON.stringify(report.registryIds) === JSON.stringify(expectedRegistryIds),
    `${scenario.name}: registry order mismatch`)
  assert(JSON.stringify({
    artifactHash: report.hashes?.artifactHash,
    contentHash: report.hashes?.contentHash,
    schemaSetHash: report.hashes?.schemaSetHash,
    environmentHash: report.hashes?.environmentHash,
    snapshotHash: report.hashes?.snapshotHash
  }) === JSON.stringify(expectedHashes), `${scenario.name}: product hashes mismatch`)
  if (scenario.artifactHashSource) {
    assert(report.hashes?.artifactHashSource === scenario.artifactHashSource,
      `${scenario.name}: artifact hash came from the wrong source`)
  } else if (scenario.source !== null) {
    assert(report.hashes?.artifactHashSource === 'loaded-product',
      `${scenario.name}: artifact hash did not come from loaded product`)
  }
  assert(JSON.stringify(report.queryChecks) === JSON.stringify({
    itemName: '青菜',
    recipeName: '炒青菜',
    cropName: '青菜'
  }), `${scenario.name}: public query checks failed`)
  if (scenario.source !== null) {
    const shouldHaveDiagnostics = scenario.source === 'static-fallback'
      || (
        scenario.cacheStatus?.startsWith('cache-')
        && scenario.cacheStatus !== 'disk-cache-fast-hit'
      )
    assert(
      shouldHaveDiagnostics ? report.diagnostics.length > 0 : report.diagnostics.length === 0,
      `${scenario.name}: unexpected diagnostics`
    )
  }
  for (const diagnostic of report.diagnostics) {
    assert(
      JSON.stringify(Object.keys(diagnostic).sort())
        === JSON.stringify(['code', 'recovery', 'severity', 'stage']),
      `${scenario.name}: diagnostic leaked unsupported fields`
    )
  }
  if (scenario.cacheStatus) {
    assert(report.diskCache?.status === scenario.cacheStatus,
      `${scenario.name}: wrong disk cache status`)
  }
  if (scenario.cacheWriteStatus) {
    assert(report.diskCache?.writeStatus === scenario.cacheWriteStatus,
      `${scenario.name}: wrong disk cache write status`)
  }
  assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify(envelope)),
    `${scenario.name}: report leaked an absolute path`)
}

const assertWebProductSurface = (envelope, scenario) => {
  const surface = envelope.webProductSurface ?? envelope.electronProductSurface
  assert(surface?.schemaVersion === 1,
    `${scenario.name}: missing product surface summary`)
  const expectsResponseDelivery = scenarioExpectsResponseDeliverySurface(scenario)
  const expectsVisiblePanel =
    expectsResponseDelivery || scenarioExpectsVisibleImportPanelSurface(scenario)
  if (expectsVisiblePanel) {
    assert(surface.webDataPackImportPanelVisible === true,
      `${scenario.name}: Web data pack import panel was not opened`)
  }
  if (!expectsResponseDelivery) {
    const optionalSummaryText = surface.responseDeliverySummaryText ?? ''
    assert(!/[A-Za-z]:[\\/]/.test(optionalSummaryText),
      `${scenario.name}: optional Web response delivery summary leaked an absolute path`)
    assert(!optionalSummaryText.includes('C:/Users') && !optionalSummaryText.includes('LENOVO'),
      `${scenario.name}: optional Web response delivery summary leaked local user details`)
    return
  }
  assert(surface.responseDeliverySummaryVisible === true,
    `${scenario.name}: Web response delivery summary was not visible`)
  const summaryText = surface.responseDeliverySummaryText ?? ''
  assert(summaryText.includes('响应送达'),
    `${scenario.name}: Web response delivery summary omitted the section label`)
  assert(summaryText.includes('成功'),
    `${scenario.name}: Web response delivery summary omitted the success label`)
  assert(summaryText.includes('product_probe_pack'),
    `${scenario.name}: Web response delivery summary omitted the target package`)
  assert(summaryText.includes('mods.ui.ipc.result.install.success'),
    `${scenario.name}: Web response delivery summary omitted the install success message key`)
  assert(!/[A-Za-z]:[\\/]/.test(summaryText),
    `${scenario.name}: Web response delivery summary leaked an absolute path`)
  assert(!summaryText.includes('C:/Users') && !summaryText.includes('LENOVO'),
    `${scenario.name}: Web response delivery summary leaked local user details`)
}

const assertElectronModLockStorageProbe = (probe, scenario, isolated) => {
  assert(probe?.status === (
    scenario.modLockWriteRead ? 'loaded' : 'ready'
  ), `${scenario.name}: mod-lock probe had the wrong status`)
  assert(probe?.operation === (
    scenario.modLockWriteRead ? 'write-read' : 'inspect'
  ), `${scenario.name}: mod-lock probe used the wrong operation`)
  assert(probe?.storageKind === 'electron-program-directory-userdata',
    `${scenario.name}: mod-lock probe used the wrong storage kind`)
  assert(probe?.programDirectorySource === (
    isolated ? 'portable-executable-directory' : 'executable-path-directory'
  ), `${scenario.name}: mod-lock probe used the wrong program directory source`)
  assert(probe?.diagnosticsCount === 0, `${scenario.name}: mod-lock probe reported diagnostics`)
  assert(probe?.configuredUserDataObserved === true,
    `${scenario.name}: mod-lock probe did not observe configured userData`)
  assert(probe?.programDirectoryUserDataResolved === true,
    `${scenario.name}: mod-lock probe did not resolve program userdata`)
  assert(probe?.programDirectoryUserDataMatchesConfiguredUserData === true,
    `${scenario.name}: mod-lock probe userdata did not match the configured program directory`)
  assert(probe?.modLockInsideProgramUserData === true,
    `${scenario.name}: mod-lock path escaped program userdata`)
  assert(probe?.modLockInsideConfiguredUserData === true,
    `${scenario.name}: mod-lock path escaped configured userdata`)
  assert(probe?.effects?.electronMainProcessBoundaryInspected === true,
    `${scenario.name}: mod-lock probe did not inspect the main-process boundary`)
  for (const effectName of [
    'officialRegistryPublished',
    'thirdPartyRegistryPublished',
    'runtimeEnablementAllowed',
    'electronIpcExposed',
    'packageFilesWritten',
    'packageBackupsWritten',
    'settingsWritten',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'configuredUserDataPathUsed',
    'systemUserDataFallbackAllowed',
    'desktopStartupChanged'
  ]) {
    assert(probe.effects?.[effectName] === false,
      `${scenario.name}: mod-lock probe effect ${effectName} was not false`)
  }
  assert(probe.effects?.lockfileWritten === !!scenario.modLockWriteRead,
    `${scenario.name}: mod-lock probe reported the wrong lockfile write effect`)
  if (scenario.modLockWriteRead) {
    assert(isolated, `${scenario.name}: mod-lock write/read probe did not use an isolated directory`)
    assert(probe.writeStatus === 'written', `${scenario.name}: mod-lock write did not succeed`)
    assert(probe.readStatus === 'loaded', `${scenario.name}: mod-lock read did not succeed`)
    assert(probe.draftRoundTripMatched === true,
      `${scenario.name}: mod-lock draft did not round-trip`)
  }
}

const assertElectronSettingsLockfileWriterProbe = (probe, scenario, isolated) => {
  if (!scenario.settingsLockfileWriteRead) {
    assert(probe?.status === 'skipped',
      `${scenario.name}: settings-lockfile writer probe should be skipped`)
    assert(probe?.operation === 'inspect',
      `${scenario.name}: settings-lockfile writer probe used the wrong default operation`)
    assert(probe?.effects?.settingsWritten === false,
      `${scenario.name}: skipped settings-lockfile writer reported settings write`)
    assert(probe?.effects?.lockfileWritten === false,
      `${scenario.name}: skipped settings-lockfile writer reported lockfile write`)
    return
  }

  assert(isolated, `${scenario.name}: settings-lockfile writer probe did not use an isolated directory`)
  assert(probe?.status === 'ready',
    `${scenario.name}: settings-lockfile writer probe was not ready`)
  assert(probe?.operation === 'write-read',
    `${scenario.name}: settings-lockfile writer probe used the wrong operation`)
  assert(probe.installPersistentStagingLifecycleStatus === 'ready',
    `${scenario.name}: install persistent staging lifecycle was not ready`)
  assert(probe.settingsLockfilePersistentWriterSourceStatus === 'written',
    `${scenario.name}: settings-lockfile persistent writer source was not written`)
  assert(probe.targetPackageId === 'product_probe_pack',
    `${scenario.name}: settings-lockfile writer reported the wrong package`)
  assert(probe.selectedPackageCount === 1,
    `${scenario.name}: settings-lockfile writer selected package count mismatch`)
  assert(probe.blockedPackageCount === 0,
    `${scenario.name}: settings-lockfile writer blocked packages unexpectedly`)
  assert(probe.loadOrderCount === 1,
    `${scenario.name}: settings-lockfile writer load order count mismatch`)
  assert(probe.registryCount === 55,
    `${scenario.name}: settings-lockfile writer registry count mismatch`)
  assert(probe.entryCount === 4243,
    `${scenario.name}: settings-lockfile writer entry count mismatch`)
  assert(probe.packageCount === 1,
    `${scenario.name}: settings-lockfile writer package count mismatch`)
  assert(probe.candidateHashPresent === true,
    `${scenario.name}: settings-lockfile writer did not report candidate hash`)
  assert(probe.lockfileHashPresent === true,
    `${scenario.name}: settings-lockfile writer did not report lockfile hash`)
  assert(probe.commandContinuationAllowed === true,
    `${scenario.name}: settings-lockfile writer did not allow command continuation`)
  assert(probe.uiIpcResultContinuationAllowed === true,
    `${scenario.name}: settings-lockfile writer did not allow UI/IPC continuation`)
  assert(probe.persistentPackageWriteAcknowledged === true,
    `${scenario.name}: settings-lockfile writer did not preserve package write acknowledgement`)
  assert(probe.persistentSettingsLockfileWriteExecuted === true,
    `${scenario.name}: settings-lockfile writer did not execute settings+lockfile write`)
  assert(probe.diagnosticsCount === 0,
    `${scenario.name}: settings-lockfile writer reported diagnostics`)
  assert(probe.settingsThirdPartyDataPacksMatched === true,
    `${scenario.name}: settings thirdPartyDataPacks did not match lockfile identity`)
  assert(probe.modLockDraftRoundTripMatched === true,
    `${scenario.name}: settings-lockfile writer mod-lock did not round-trip`)
  assert(probe.effects?.settingsWritten === true,
    `${scenario.name}: settings-lockfile writer did not report settings write`)
  assert(probe.effects?.lockfileWritten === true,
    `${scenario.name}: settings-lockfile writer did not report lockfile write`)
  for (const effectName of [
    'packageFilesWritten',
    'packageBackupsWritten',
    'transactionCommitted',
    'runtimePublicationCommitted',
    'uiIpcResponseDelivered',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(probe.effects?.[effectName] === false,
      `${scenario.name}: settings-lockfile writer effect ${effectName} was not false`)
  }
}

const assertElectronPackageFilePersistentStagingProbe = (probe, scenario, isolated) => {
  if (!scenario.packageFileWriteRead) {
    assert(probe?.status === 'skipped',
      `${scenario.name}: package file persistent staging probe should be skipped`)
    assert(probe?.operation === 'inspect',
      `${scenario.name}: package file persistent staging probe used the wrong default operation`)
    assert(probe?.effects?.packageFilesWritten === false,
      `${scenario.name}: skipped package file probe reported package writes`)
    assert(probe?.effects?.packageBackupsWritten === false,
      `${scenario.name}: skipped package file probe reported package backups`)
    return
  }

  assert(isolated, `${scenario.name}: package file write/read probe did not use an isolated directory`)
  assert(probe?.status === 'written',
    `${scenario.name}: package file persistent staging probe was not written`)
  assert(probe?.operation === 'write-read',
    `${scenario.name}: package file persistent staging probe used the wrong operation`)
  assert(probe.packageFileStagingSourceStatus === 'accepted',
    `${scenario.name}: package file staging source was not accepted`)
  assert(probe.packageFilePersistentWriteProbeStatus === 'written',
    `${scenario.name}: package file persistent write probe was not written`)
  assert(probe.targetPackageId === 'product_probe_pack',
    `${scenario.name}: package file probe reported the wrong package`)
  assert(probe.selectedPackageCount === 1,
    `${scenario.name}: package file probe selected package count mismatch`)
  assert(probe.blockedPackageCount === 0,
    `${scenario.name}: package file probe blocked packages unexpectedly`)
  assert(probe.loadOrderCount === 1,
    `${scenario.name}: package file probe load order count mismatch`)
  assert(probe.registryCount === 55,
    `${scenario.name}: package file probe registry count mismatch`)
  assert(probe.entryCount === 4243,
    `${scenario.name}: package file probe entry count mismatch`)
  assert(probe.packageCount === 1,
    `${scenario.name}: package file probe package count mismatch`)
  assert(probe.candidateHashPresent === true,
    `${scenario.name}: package file probe did not report candidate hash`)
  assert(probe.lockfileHashPresent === true,
    `${scenario.name}: package file probe did not report lockfile hash`)
  assert(probe.commandContinuationAllowed === true,
    `${scenario.name}: package file probe did not allow command continuation`)
  assert(probe.appBootstrapContinuationAllowed === true,
    `${scenario.name}: package file probe did not allow app bootstrap continuation`)
  assert(probe.packageFileWriteProbe === 'written',
    `${scenario.name}: package file probe did not report written probe state`)
  assert(probe.writeProbeAllowed === true,
    `${scenario.name}: package file probe was not explicitly authorized`)
  assert(probe.persistentWriteExecuted === true,
    `${scenario.name}: package file probe did not execute persistent write`)
  assert(probe.writtenFileCount === 2,
    `${scenario.name}: package file probe wrote the wrong file count`)
  assert(probe.backedUpFileCount === 1,
    `${scenario.name}: package file probe reported the wrong backup count`)
  assert(JSON.stringify(probe.writtenFilePaths) === JSON.stringify(['manifest.json', 'data/items.json']),
    `${scenario.name}: package file probe wrote unexpected relative files`)
  assert(probe.diagnosticsCount === 0,
    `${scenario.name}: package file probe reported diagnostics`)
  assert(probe.effects?.packageFilesWritten === true,
    `${scenario.name}: package file probe did not report package writes`)
  assert(probe.effects?.packageBackupsWritten === true,
    `${scenario.name}: package file probe did not report package backups`)
  for (const effectName of [
    'settingsWritten',
    'lockfileWritten',
    'transactionCommitted',
    'runtimePublicationCommitted',
    'uiIpcResponseDelivered',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(probe.effects?.[effectName] === false,
      `${scenario.name}: package file probe effect ${effectName} was not false`)
  }
}

const assertElectronPackageFileRestoreProbe = (probe, scenario, isolated) => {
  if (!scenario.packageFileRestore) {
    assert(probe?.status === 'skipped',
      `${scenario.name}: package file restore probe should be skipped`)
    assert(probe?.operation === 'inspect',
      `${scenario.name}: package file restore probe used the wrong default operation`)
    assert(probe?.restoredFileCount === 0,
      `${scenario.name}: skipped package file restore reported restored files`)
    assert(probe?.backupRestoredFileCount === 0,
      `${scenario.name}: skipped package file restore reported backup restores`)
    assert(probe?.removedCreatedFileCount === 0,
      `${scenario.name}: skipped package file restore reported removed created files`)
    for (const effectName of [
      'packageFilesWritten',
      'packageBackupsWritten',
      'packageFilesRestored',
      'settingsWritten',
      'lockfileWritten',
      'transactionCommitted',
      'runtimePublicationCommitted',
      'uiIpcResponseDelivered',
      'savesWritten',
      'cacheWritten',
      'transactionLogWritten',
      'rollbackExecuted',
      'diagnosticsWritten'
    ]) {
      assert(probe?.effects?.[effectName] === false,
        `${scenario.name}: skipped package file restore effect ${effectName} was not false`)
    }
    return
  }

  assert(isolated, `${scenario.name}: package file restore probe did not use an isolated directory`)
  assert(probe?.status === 'restored',
    `${scenario.name}: package file restore probe was not restored`)
  assert(probe?.operation === 'write-restore',
    `${scenario.name}: package file restore probe used the wrong operation`)
  assert(probe.packageFilePersistentStagingStatus === 'written',
    `${scenario.name}: package file restore staging status was not written`)
  assert(probe.packageFilePersistentWriteProbeStatus === 'written',
    `${scenario.name}: package file restore write probe status was not written`)
  assert(probe.targetPackageId === 'product_probe_pack',
    `${scenario.name}: package file restore reported the wrong package`)
  assert(probe.selectedPackageCount === 1,
    `${scenario.name}: package file restore selected package count mismatch`)
  assert(probe.blockedPackageCount === 0,
    `${scenario.name}: package file restore blocked packages unexpectedly`)
  assert(probe.loadOrderCount === 1,
    `${scenario.name}: package file restore load order count mismatch`)
  assert(probe.registryCount === 55,
    `${scenario.name}: package file restore registry count mismatch`)
  assert(probe.entryCount === 4243,
    `${scenario.name}: package file restore entry count mismatch`)
  assert(probe.packageCount === 1,
    `${scenario.name}: package file restore package count mismatch`)
  assert(probe.candidateHashPresent === true,
    `${scenario.name}: package file restore did not report candidate hash`)
  assert(probe.lockfileHashPresent === true,
    `${scenario.name}: package file restore did not report lockfile hash`)
  assert(probe.packageFileRestoreProbe === 'restored',
    `${scenario.name}: package file restore probe did not report restored state`)
  assert(probe.restoreProbeAllowed === true,
    `${scenario.name}: package file restore was not explicitly authorized`)
  assert(probe.persistentRestoreExecuted === true,
    `${scenario.name}: package file restore did not execute persistent restore`)
  assert(probe.writtenFileCount === 2,
    `${scenario.name}: package file restore wrote the wrong file count before restore`)
  assert(probe.backedUpFileCount === 1,
    `${scenario.name}: package file restore reported the wrong backup count before restore`)
  assert(probe.restoredFileCount === 2,
    `${scenario.name}: package file restore restored the wrong file count`)
  assert(probe.backupRestoredFileCount === 1,
    `${scenario.name}: package file restore reported the wrong backup restore count`)
  assert(probe.removedCreatedFileCount === 1,
    `${scenario.name}: package file restore reported the wrong removed-created count`)
  assert(JSON.stringify(probe.restoredFilePaths) === JSON.stringify(['manifest.json', 'data/items.json']),
    `${scenario.name}: package file restore restored unexpected relative files`)
  assert(probe.diagnosticsCount === 0,
    `${scenario.name}: package file restore reported diagnostics`)
  assert(probe.effects?.packageFilesWritten === true,
    `${scenario.name}: package file restore did not report package writes before restore`)
  assert(probe.effects?.packageBackupsWritten === true,
    `${scenario.name}: package file restore did not report package backups before restore`)
  assert(probe.effects?.packageFilesRestored === true,
    `${scenario.name}: package file restore did not report package restore`)
  assert(probe.effects?.rollbackExecuted === true,
    `${scenario.name}: package file restore did not report rollback execution`)
  for (const effectName of [
    'settingsWritten',
    'lockfileWritten',
    'transactionCommitted',
    'runtimePublicationCommitted',
    'uiIpcResponseDelivered',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'diagnosticsWritten'
  ]) {
    assert(probe.effects?.[effectName] === false,
      `${scenario.name}: package file restore effect ${effectName} was not false`)
  }
}

const assertElectronInstallTransactionCommitFinalizationProbe = (probe, scenario, isolated) => {
  if (!scenario.installTransactionCommitFinalization) {
    assert(probe?.status === 'skipped',
      `${scenario.name}: install transaction commit finalization probe should be skipped`)
    assert(probe?.operation === 'inspect',
      `${scenario.name}: install transaction commit finalization probe used the wrong default operation`)
    for (const effectName of [
      'packageFilesWritten',
      'packageBackupsWritten',
      'settingsWritten',
      'lockfileWritten',
      'transactionLogPrepared',
      'transactionLogWritten',
      'transactionLogRead',
      'transactionCommitted',
      'transactionLogCommitted'
    ]) {
      assert(probe?.effects?.[effectName] === false,
        `${scenario.name}: skipped install transaction finalization effect ${effectName} was not false`)
    }
    return
  }

  assert(isolated,
    `${scenario.name}: install transaction commit finalization probe did not use an isolated directory`)
  assert(probe?.status === 'committed',
    `${scenario.name}: install transaction commit finalization was not committed`)
  assert(probe?.operation === 'write-read-finalize',
    `${scenario.name}: install transaction commit finalization used the wrong operation`)
  assert(probe.packageFilePersistentStagingStatus === 'written',
    `${scenario.name}: package file staging did not write before transaction finalization`)
  assert(probe.settingsLockfileLifecycleStatus === 'ready',
    `${scenario.name}: settings-lockfile lifecycle was not ready before transaction finalization`)
  assert(probe.transactionCommitConnectionStatus === 'accepted',
    `${scenario.name}: transaction commit connection was not accepted`)
  assert(probe.preparedTransactionLogStatus === 'prepared',
    `${scenario.name}: prepared transaction log was not written`)
  assert(probe.preparedReadVerificationStatus === 'verified',
    `${scenario.name}: prepared transaction log was not verified`)
  assert(probe.targetPackageId === 'product_probe_pack',
    `${scenario.name}: transaction finalization reported the wrong package`)
  assert(probe.selectedPackageCount === 1,
    `${scenario.name}: transaction finalization selected package count mismatch`)
  assert(probe.blockedPackageCount === 0,
    `${scenario.name}: transaction finalization blocked packages unexpectedly`)
  assert(probe.loadOrderCount === 1,
    `${scenario.name}: transaction finalization load order count mismatch`)
  assert(probe.registryCount === 55,
    `${scenario.name}: transaction finalization registry count mismatch`)
  assert(probe.entryCount === 4243,
    `${scenario.name}: transaction finalization entry count mismatch`)
  assert(probe.packageCount === 1,
    `${scenario.name}: transaction finalization package count mismatch`)
  assert(probe.candidateHashPresent === true,
    `${scenario.name}: transaction finalization did not report candidate hash`)
  assert(probe.lockfileHashPresent === true,
    `${scenario.name}: transaction finalization did not report lockfile hash`)
  assert(probe.transactionId === 'product-probe-install-transaction-commit',
    `${scenario.name}: transaction finalization used the wrong transaction id`)
  assert(probe.committedTransactionId === probe.transactionId,
    `${scenario.name}: committed transaction id did not match`)
  assert(probe.transactionLogEntryHashPresent === true,
    `${scenario.name}: transaction finalization did not report a transaction log hash`)
  assert(probe.readTransactionLogEntryHashMatched === true,
    `${scenario.name}: prepared transaction log readback hash did not match`)
  assert(probe.committedTransactionLogEntryHashMatched === true,
    `${scenario.name}: committed transaction log hash did not match readback`)
  assert(probe.transactionCommitConnectionAcknowledged === true,
    `${scenario.name}: transaction commit connection was not acknowledged`)
  assert(probe.persistentPackageWriteExecuted === true,
    `${scenario.name}: transaction finalization did not observe package writes`)
  assert(probe.persistentSettingsLockfileWriteExecuted === true,
    `${scenario.name}: transaction finalization did not observe settings-lockfile writes`)
  assert(probe.writtenFileCount === 2,
    `${scenario.name}: transaction finalization reported the wrong package file count`)
  assert(probe.backedUpFileCount === 1,
    `${scenario.name}: transaction finalization reported the wrong backup count`)
  assert(probe.finalizationAuthorized === true,
    `${scenario.name}: transaction finalization was not explicitly authorized`)
  assert(probe.checksSatisfied === true,
    `${scenario.name}: transaction finalization checks were not all satisfied`)
  assert(probe.diagnosticsCount === 0,
    `${scenario.name}: transaction finalization reported diagnostics`)
  for (const effectName of [
    'packageFilesWritten',
    'packageBackupsWritten',
    'settingsWritten',
    'lockfileWritten',
    'transactionLogPrepared',
    'transactionLogWritten',
    'transactionLogRead',
    'transactionCommitted',
    'transactionLogCommitted'
  ]) {
    assert(probe.effects?.[effectName] === true,
      `${scenario.name}: transaction finalization effect ${effectName} was not true`)
  }
  for (const effectName of [
    'runtimePublicationCommitted',
    'uiIpcResponseDelivered',
    'savesWritten',
    'cacheWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(probe.effects?.[effectName] === false,
      `${scenario.name}: transaction finalization effect ${effectName} was not false`)
  }
}

const assertElectronInstallCommandLifecycleProbe = (probe, scenario, isolated) => {
  if (!scenario.installCommandLifecycle) {
    assert(probe?.status === 'skipped',
      `${scenario.name}: install command lifecycle probe should be skipped`)
    assert(probe?.operation === 'inspect',
      `${scenario.name}: install command lifecycle probe used the wrong default operation`)
    for (const effectName of [
      'installCommandLifecycleReady',
      'commandDispatched',
      'atomicCommitExecutorAcknowledged',
      'injectedCommitHostCalled',
      'realAtomicCommitExecutorCalled',
      'postCommitVerificationAcknowledged',
      'persistentReadProofAcknowledged',
      'packageFilesWritten',
      'settingsWritten',
      'lockfileWritten',
      'transactionCommitted',
      'runtimePublicationCommitted',
      'uiIpcResponseDelivered'
    ]) {
      assert(probe?.effects?.[effectName] === false,
        `${scenario.name}: skipped install command lifecycle effect ${effectName} was not false`)
    }
    return
  }

  assert(isolated,
    `${scenario.name}: install command lifecycle probe did not use an isolated directory`)
  assert(probe?.status === 'ready',
    `${scenario.name}: install command lifecycle was not ready`)
  const expectsElectronIpcDispatchProof = scenario.installCommandDispatchIpc === true
  const expectedDispatchInputSource = expectsElectronIpcDispatchProof
    ? 'electron-ipc-dispatch-proof'
    : 'synthetic-command-dispatch-host'
  const expectedLifecycleOperation = expectsElectronIpcDispatchProof
    ? 'lifecycle-from-electron-ipc-dispatch-atomic-commit-post-commit-acknowledgement'
    : 'lifecycle-from-command-dispatch-atomic-commit-post-commit-acknowledgement'
  assert(probe.operation === expectedLifecycleOperation,
    `${scenario.name}: install command lifecycle used the wrong operation`)
  assert(probe.dispatchInputSource === expectedDispatchInputSource,
    `${scenario.name}: install command lifecycle used the wrong dispatch input source`)
  assert(probe.electronIpcDispatchProofObserved === expectsElectronIpcDispatchProof,
    `${scenario.name}: install command lifecycle IPC dispatch proof observation mismatch`)
  assert(probe.electronIpcDispatchProofAccepted === expectsElectronIpcDispatchProof,
    `${scenario.name}: install command lifecycle IPC dispatch proof acceptance mismatch`)
  assert(probe.transactionCommandDispatcherSourceStatus === 'dispatched',
    `${scenario.name}: install command lifecycle did not dispatch command`)
  assert(probe.atomicTransactionCommitExecutorSourceStatus === 'executed',
    `${scenario.name}: install command lifecycle did not execute atomic commit acknowledgement`)
  assert(probe.atomicTransactionCommitExecutorHostMode === 'electron-main-visible-import',
    `${scenario.name}: install command lifecycle did not use the Electron visible-import atomic host mode`)
  assert(probe.postCommitVerificationExecutorHostMode === 'electron-main-visible-import',
    `${scenario.name}: install command lifecycle did not use the Electron visible-import post-commit verification host mode`)
  assert(probe.postCommitVerificationReadAcknowledgementSourceStatus === 'ready',
    `${scenario.name}: install command lifecycle did not acknowledge post-commit verification`)
  assert(probe.verificationOutcomeKind === 'verified',
    `${scenario.name}: install command lifecycle did not report verified outcome`)
  assert(probe.targetPackageId === 'product_probe_pack',
    `${scenario.name}: install command lifecycle reported the wrong package`)
  assert(probe.selectedPackageCount === 1,
    `${scenario.name}: install command lifecycle selected package count mismatch`)
  assert(probe.blockedPackageCount === 0,
    `${scenario.name}: install command lifecycle blocked packages unexpectedly`)
  assert(probe.loadOrderCount === 1,
    `${scenario.name}: install command lifecycle load order count mismatch`)
  assert(probe.registryCount === 55,
    `${scenario.name}: install command lifecycle registry count mismatch`)
  assert(probe.entryCount === 4243,
    `${scenario.name}: install command lifecycle entry count mismatch`)
  assert(probe.packageCount === 1,
    `${scenario.name}: install command lifecycle package count mismatch`)
  assert(probe.candidateHashPresent === true,
    `${scenario.name}: install command lifecycle did not report candidate hash`)
  assert(probe.lockfileHashPresent === true,
    `${scenario.name}: install command lifecycle did not report lockfile hash`)
  assert(probe.commandContinuationAllowed === true,
    `${scenario.name}: install command lifecycle did not allow command continuation`)
  assert(probe.uiIpcResultContinuationAllowed === true,
    `${scenario.name}: install command lifecycle did not allow UI/IPC continuation`)
  assert(JSON.stringify(probe.lifecycleCallOrder) === JSON.stringify([
    expectsElectronIpcDispatchProof
      ? 'electron-ipc-command-dispatch-proof'
      : 'command-dispatch',
    'electron-main-visible-import-atomic-commit',
    'atomic-commit-host',
    'post-commit-verification-host',
    'persistent-read-host'
  ]), `${scenario.name}: install command lifecycle call order changed`)
  assert(probe.checksSatisfied === true,
    `${scenario.name}: install command lifecycle checks were not all satisfied`)
  assert(probe.diagnosticsCount === 0,
    `${scenario.name}: install command lifecycle reported diagnostics`)
  for (const effectName of [
    'installCommandLifecycleReady',
    'commandDispatched',
    'atomicCommitExecutorAcknowledged',
    'realAtomicCommitExecutorCalled',
    'postCommitVerificationAcknowledged',
    'persistentReadProofAcknowledged'
  ]) {
    assert(probe.effects?.[effectName] === true,
      `${scenario.name}: install command lifecycle effect ${effectName} was not true`)
  }
  for (const effectName of [
    'packageFilesWritten',
    'packageBackupsWritten',
    'packageFilesRestored',
    'settingsWritten',
    'lockfileWritten',
    'transactionCommitted',
    'transactionLogPrepared',
    'injectedCommitHostCalled',
    'runtimePublicationCommitted',
    'postCommitVerificationExecuted',
    'uiIpcResponseDelivered',
    'savesWritten',
    'cacheWritten',
    'transactionLogWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(probe.effects?.[effectName] === false,
      `${scenario.name}: install command lifecycle effect ${effectName} was not false`)
  }
}

const assertElectronOrdinaryInstallTerminalConnectionProbe = (
  probe,
  startupGate,
  scenario,
  isolated
) => {
  if (!scenario.ordinaryInstallTerminalConnection) {
    assert(probe?.status === 'skipped',
      `${scenario.name}: ordinary install terminal probe should be skipped`)
    assert(probe?.operation === 'inspect',
      `${scenario.name}: ordinary install terminal probe used the wrong default operation`)
    for (const effectName of [
      'ordinaryInstallTransactionReady',
      'successOutcomeAccepted',
      'rollbackOutcomeAccepted',
      'realRecoveryLogReplayRestoreCalled',
      'packageFilesWritten',
      'packageFilesRestored',
      'settingsWritten',
      'lockfileWritten',
      'uiIpcResponseDelivered',
      'transactionLogPrepared',
      'transactionLogRead',
      'transactionCommitted',
      'transactionLogCommitted',
      'runtimePublicationCommitted',
      'recoveryLogRead',
      'recoveryLogReplayed',
      'savesWritten',
      'cacheWritten',
      'transactionLogWritten',
      'rollbackExecuted',
      'diagnosticsWritten'
    ]) {
      assert(probe?.effects?.[effectName] === false,
        `${scenario.name}: skipped ordinary install terminal effect ${effectName} was not false`)
    }
    return
  }

  assert(isolated,
    `${scenario.name}: ordinary install terminal probe did not use an isolated directory`)
  assert(probe?.status === 'ready',
    `${scenario.name}: ordinary install terminal was not ready`)

  if (scenario.ordinaryInstallTerminalRollback) {
    assert(probe.operation === 'terminal-from-product-package-restore-rollback',
      `${scenario.name}: ordinary install terminal rollback used the wrong operation`)
    assert(probe.packageFilePersistentStagingStatus === 'written',
      `${scenario.name}: rollback terminal package staging was not written before restore`)
    assert(probe.packageFileRestoreStatus === 'restored',
      `${scenario.name}: rollback terminal package restore was not restored`)
    assert(probe.rollbackRecoveryExecutionStatus === 'executed',
      `${scenario.name}: rollback recovery execution was not acknowledged`)
    assert(probe.modLockTransactionSemanticsStatus === 'candidate-stable',
      `${scenario.name}: rollback terminal semantics did not reach candidate-stable`)
    assert(probe.outcomeKind === 'rollback',
      `${scenario.name}: ordinary install terminal rollback outcome was not rollback`)
    assert(probe.recovery === 'restore-backup',
      `${scenario.name}: ordinary install terminal rollback recovery was not restore-backup`)
    assert(probe.rollbackRequired === true,
      `${scenario.name}: ordinary install terminal rollback was not marked rollback-required`)
    assert(probe.targetPackageId === 'product_probe_pack',
      `${scenario.name}: ordinary install terminal rollback reported the wrong package`)
    assert(probe.selectedPackageCount === 1,
      `${scenario.name}: ordinary install terminal rollback selected package count mismatch`)
    assert(probe.blockedPackageCount === 0,
      `${scenario.name}: ordinary install terminal rollback blocked packages unexpectedly`)
    assert(probe.loadOrderCount === 1,
      `${scenario.name}: ordinary install terminal rollback load order count mismatch`)
    assert(probe.registryCount === (
      scenario.ordinaryInstallTerminalRegistryCount ?? 55
    ),
      `${scenario.name}: ordinary install terminal rollback registry count mismatch`)
    assert(probe.entryCount === 4243,
      `${scenario.name}: ordinary install terminal rollback entry count mismatch`)
    assert(probe.packageCount === 1,
      `${scenario.name}: ordinary install terminal rollback package count mismatch`)
    assert(probe.candidateHashPresent === true,
      `${scenario.name}: ordinary install terminal rollback did not report candidate hash`)
    assert(probe.lockfileHashPresent === true,
      `${scenario.name}: ordinary install terminal rollback did not report lockfile hash`)
    assert(probe.restoredFileCount === 2,
      `${scenario.name}: ordinary install terminal rollback restored the wrong file count`)
    assert(probe.backupRestoredFileCount === 1,
      `${scenario.name}: ordinary install terminal rollback backup restore count mismatch`)
    assert(probe.removedCreatedFileCount === 1,
      `${scenario.name}: ordinary install terminal rollback removed-created count mismatch`)
    assert(probe.persistentPackageWriteAcknowledged === false,
      `${scenario.name}: ordinary install terminal rollback should not acknowledge committed package writes`)
    assert(probe.persistentSettingsLockfileWriteAcknowledged === false,
      `${scenario.name}: ordinary install terminal rollback should not acknowledge settings-lockfile writes`)
    assert(probe.uiIpcDeliveryAcknowledged === false,
      `${scenario.name}: ordinary install terminal rollback should not acknowledge UI/IPC success delivery`)
    assert(probe.rollbackRecoverySettled === true,
      `${scenario.name}: ordinary install terminal rollback was not settled`)
    assert(probe.rollbackRecoveryExecutionAcknowledged === true,
      `${scenario.name}: ordinary install terminal rollback execution was not acknowledged`)
    assert(probe.ordinaryInstallTransactionReady === true,
      `${scenario.name}: ordinary install terminal rollback did not mark ordinary install ready`)
    assert(probe.commandContinuationAllowed === true,
      `${scenario.name}: ordinary install terminal rollback did not allow command continuation`)
    assert(probe.uiIpcResultContinuationAllowed === true,
      `${scenario.name}: ordinary install terminal rollback did not allow UI/IPC continuation`)
    assert(probe.startupGateContinuationAllowed === false,
      `${scenario.name}: ordinary install terminal rollback should not allow startup continuation`)
    assert(probe.checksSatisfied === true,
      `${scenario.name}: ordinary install terminal rollback checks were not all satisfied`)
    assert(probe.diagnosticsCount === 0,
      `${scenario.name}: ordinary install terminal rollback reported diagnostics`)
    for (const effectName of [
      'ordinaryInstallTransactionReady',
      'rollbackOutcomeAccepted',
      'realRecoveryLogReplayRestoreCalled',
      'recoveryLogRead',
      'recoveryLogReplayed',
      'packageFilesRestored',
      'rollbackExecuted'
    ]) {
      assert(probe.effects?.[effectName] === true,
        `${scenario.name}: ordinary install terminal rollback effect ${effectName} was not true`)
    }
    for (const effectName of [
      'successOutcomeAccepted',
      'packageFilesWritten',
      'settingsWritten',
      'lockfileWritten',
      'uiIpcResponseDelivered',
      'transactionLogPrepared',
      'transactionLogRead',
      'transactionCommitted',
      'transactionLogCommitted',
      'runtimePublicationCommitted',
      'savesWritten',
      'cacheWritten',
      'transactionLogWritten',
      'diagnosticsWritten'
    ]) {
      assert(probe.effects?.[effectName] === false,
        `${scenario.name}: ordinary install terminal rollback effect ${effectName} was not false`)
    }
    return
  }

  assert(probe.operation === 'terminal-from-product-lifecycle-commit-ui-ipc',
    `${scenario.name}: ordinary install terminal used the wrong operation`)
  assert(probe.installCommandLifecycleStatus === 'ready',
    `${scenario.name}: ordinary install terminal did not observe install command lifecycle readiness`)
  assert(probe.postCommitUiIpcDeliveryContinuationStatus === 'ready',
    `${scenario.name}: post-commit UI/IPC continuation was not ready`)
  assert(probe.installTransactionCommitFinalizationStatus === 'committed',
    `${scenario.name}: ordinary install terminal did not observe committed finalization`)
  assert(probe.rendererUiIpcStatus === 'ready',
    `${scenario.name}: ordinary install terminal did not observe renderer UI/IPC readiness`)
  assert(probe.rendererUiIpcDeliveryInputSource === 'install-transaction-commit-finalization',
    `${scenario.name}: ordinary install terminal used the wrong renderer UI/IPC input source`)
  assert(probe.modLockTransactionSemanticsStatus === 'candidate-stable',
    `${scenario.name}: mod-lock transaction semantics did not reach candidate-stable`)
  assert(probe.outcomeKind === 'success',
    `${scenario.name}: ordinary install terminal outcome was not success`)
  assert(probe.targetPackageId === 'product_probe_pack',
    `${scenario.name}: ordinary install terminal reported the wrong package`)
  assert(probe.selectedPackageCount === 1,
    `${scenario.name}: ordinary install terminal selected package count mismatch`)
  assert(probe.blockedPackageCount === 0,
    `${scenario.name}: ordinary install terminal blocked packages unexpectedly`)
  assert(probe.loadOrderCount === 1,
    `${scenario.name}: ordinary install terminal load order count mismatch`)
  assert(probe.registryCount === 55,
    `${scenario.name}: ordinary install terminal registry count mismatch`)
  assert(probe.entryCount === 4243,
    `${scenario.name}: ordinary install terminal entry count mismatch`)
  assert(probe.packageCount === 1,
    `${scenario.name}: ordinary install terminal package count mismatch`)
  assert(probe.candidateHashPresent === true,
    `${scenario.name}: ordinary install terminal did not report candidate hash`)
  assert(probe.lockfileHashPresent === true,
    `${scenario.name}: ordinary install terminal did not report lockfile hash`)
  assert(probe.persistentPackageWriteAcknowledged === true,
    `${scenario.name}: ordinary install terminal did not acknowledge package writes`)
  assert(probe.persistentSettingsLockfileWriteAcknowledged === true,
    `${scenario.name}: ordinary install terminal did not acknowledge settings-lockfile writes`)
  assert(probe.uiIpcDeliveryAcknowledged === true,
    `${scenario.name}: ordinary install terminal did not acknowledge UI/IPC delivery`)
  assert(probe.ordinaryInstallTransactionReady === true,
    `${scenario.name}: ordinary install terminal did not mark ordinary install ready`)
  assert(probe.commandContinuationAllowed === true,
    `${scenario.name}: ordinary install terminal did not allow command continuation`)
  assert(probe.uiIpcResultContinuationAllowed === true,
    `${scenario.name}: ordinary install terminal did not allow UI/IPC continuation`)
  assert(probe.startupGateContinuationAllowed === true,
    `${scenario.name}: ordinary install terminal did not allow startup continuation`)
  assert(startupGate?.status === 'ready',
    `${scenario.name}: startup gate was not ready after ordinary install terminal continuation`)
  assert(startupGate?.targetPackageId === probe.targetPackageId,
    `${scenario.name}: startup gate target did not match ordinary install terminal target`)
  assert(startupGate?.selectedPackageCount === probe.selectedPackageCount,
    `${scenario.name}: startup gate selected package count did not match ordinary install terminal`)
  assert(startupGate?.registryCount === (scenario.startupGateRegistryCount ?? defaultStartupGateRegistryCount),
    `${scenario.name}: startup gate registry count did not match expected candidate shape`)
  assert(startupGate?.entryCount === (scenario.startupGateEntryCount ?? defaultStartupGateEntryCount),
    `${scenario.name}: startup gate entry count did not match expected candidate shape`)
  assert(startupGate?.effects?.appStartupHostConnectionAccepted === true,
    `${scenario.name}: startup gate did not accept app-startup host after ordinary terminal continuation`)
  assert(startupGate?.effects?.liveRegistrySwapped === true,
    `${scenario.name}: startup gate did not swap live registry after ordinary terminal continuation`)
  assert(probe.checksSatisfied === true,
    `${scenario.name}: ordinary install terminal checks were not all satisfied`)
  assert(probe.diagnosticsCount === 0,
    `${scenario.name}: ordinary install terminal reported diagnostics`)
  for (const effectName of [
    'ordinaryInstallTransactionReady',
    'successOutcomeAccepted',
    'packageFilesWritten',
    'settingsWritten',
    'lockfileWritten',
    'uiIpcResponseDelivered',
    'transactionLogPrepared',
    'transactionLogRead',
    'transactionCommitted',
    'transactionLogCommitted',
    'transactionLogWritten'
  ]) {
    assert(probe.effects?.[effectName] === true,
      `${scenario.name}: ordinary install terminal effect ${effectName} was not true`)
  }
  for (const effectName of [
    'rollbackOutcomeAccepted',
    'realRecoveryLogReplayRestoreCalled',
    'recoveryLogRead',
    'recoveryLogReplayed',
    'packageFilesRestored',
    'runtimePublicationCommitted',
    'savesWritten',
    'cacheWritten',
    'rollbackExecuted',
    'diagnosticsWritten'
  ]) {
    assert(probe.effects?.[effectName] === false,
      `${scenario.name}: ordinary install terminal effect ${effectName} was not false`)
  }
}

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml']
])

const startWebServer = async () => {
  assert(fs.existsSync(path.join(webRoot, 'index.html')), 'Web product is missing; run pnpm build')
  const resolvedRoot = path.resolve(webRoot)
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname)
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
      const filePath = path.resolve(resolvedRoot, relative)
      assertInside(resolvedRoot, filePath, 'Web request')
      const stat = fs.statSync(filePath)
      assert(stat.isFile(), 'Web request did not resolve to a file')
      response.writeHead(200, {
        'content-type': mimeTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
        'cache-control': 'no-store'
      })
      fs.createReadStream(filePath).pipe(response)
    } catch {
      response.writeHead(404)
      response.end('Not found')
    }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  assert(address && typeof address === 'object', 'Web probe server has no address')
  return { server, baseUrl: `http://127.0.0.1:${address.port}/` }
}

const runWebProbe = async () => {
  const electronPath = require('electron')
  const hostPath = path.join(root, 'scripts', 'runtime-probe-web-host.cjs')
  const { server, baseUrl } = await startWebServer()
  const reports = []
  const buildWebScenarioUrl = scenario => {
    const url = new URL(baseUrl)
    url.searchParams.set('taoyuanContentProbe', '1')
    if (scenario.startupGateReady) url.searchParams.set('taoyuanThirdPartyStartupGateProbe', '1')
    if (scenario.startupPersistentStateReady) {
      url.searchParams.set('taoyuanThirdPartyStartupPersistentStateProbe', '1')
    }
    if (scenario.startupPersistentStateUseInstalledState) {
      url.searchParams.set('taoyuanThirdPartyStartupPersistentStateInstalledState', '1')
    }
    if (scenario.visibleImportWebOrdinary || scenario.visibleUpgrade) {
      url.searchParams.set('taoyuanThirdPartyVisibleImportProbe', '1')
      url.searchParams.set('taoyuanThirdPartyVisibleImportPersistSource', '1')
    }
    if (scenario.visibleUpgrade) {
      url.searchParams.set('taoyuanThirdPartyVisibleUpgradeProbe', '1')
    }
    if (scenario.visibleEnable) {
      url.searchParams.set('taoyuanThirdPartyVisibleImportProbe', '1')
      url.searchParams.set('taoyuanThirdPartyVisibleEnableProbe', '1')
    }
    if (scenario.visibleDisable) {
      url.searchParams.set('taoyuanThirdPartyVisibleDisableProbe', '1')
    }
    if (scenario.visibleUninstall) {
      url.searchParams.set('taoyuanThirdPartyVisibleUninstallProbe', '1')
    }
    if (scenario.fault) url.searchParams.set('taoyuanPrecompiledFault', scenario.fault)
    return url
  }
  try {
    for (const scenario of webScenarios) {
      const scenarioRoot = path.join(runRoot, `web-${scenario.name}`)
      const outputPath = path.join(scenarioRoot, 'report.json')
      fs.mkdirSync(scenarioRoot, { recursive: true })
      const userData = path.join(scenarioRoot, 'userdata')
      if (scenario.visibleImportInstalledReplacementSequence) {
        const installScenario = {
          ...scenario,
          name: `${scenario.name}:install-v1`,
          startupGateReady: false,
          startupPersistentStateReady: false,
          startupGateDisabled: false,
          visibleImportWebOrdinary: true,
          visibleUpgrade: false,
          visibleProbeVariant: 'v1'
        }
        const installOutputPath = path.join(scenarioRoot, 'install-v1-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: installOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(installScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const installEnvelope = readJson(installOutputPath)
        assertRuntimeEnvelope(installEnvelope, installScenario, 'http:')
        assertWebProductSurface(installEnvelope, installScenario)

        const upgradeScenario = {
          ...scenario,
          name: `${scenario.name}:replace-v1_1`,
          startupGateReady: true,
          startupPersistentStateReady: true,
          startupPersistentStateUseInstalledState: true,
          startupGateRealRuntimePublicationCommit: true,
          startupGateRegistryCount: 54,
          startupGateEntryCount: 4245,
          startupGateExpectedProductProbeVariant: 'v1',
          startupPersistentStateExpectsResponseDeliveryHandoff: false,
          visibleImportWebOrdinary: true,
          visibleUpgrade: true
        }
        const upgradeOutputPath = path.join(scenarioRoot, 'replace-v1_1-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: upgradeOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(upgradeScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const upgradeEnvelope = readJson(upgradeOutputPath)
        assertRuntimeEnvelope(upgradeEnvelope, upgradeScenario, 'http:')
        assertWebProductSurface(upgradeEnvelope, upgradeScenario)

        const restartScenario = {
          ...upgradeScenario,
          name: `${scenario.name}:restart-v1_1`,
          visibleImportWebOrdinary: false,
          visibleUpgrade: false,
          startupGateExpectedProductProbeVariant: 'v2'
        }
        const restartOutputPath = path.join(scenarioRoot, 'restart-v1_1-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: restartOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(restartScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const restartEnvelope = readJson(restartOutputPath)
        assertRuntimeEnvelope(restartEnvelope, restartScenario, 'http:')
        assertWebProductSurface(restartEnvelope, restartScenario)
        reports.push({
          scenario: scenario.name,
          installRuntime: installEnvelope.runtime,
          upgradeRuntime: upgradeEnvelope.runtime,
          restartRuntime: restartEnvelope.runtime
        })
        continue
      }
      if (
        scenario.visibleImportInstalledDisableSequence
        || scenario.visibleImportInstalledDisableEnableSequence
        || scenario.visibleImportInstalledDisableUninstallSequence
        || scenario.visibleImportInstalledUninstallSequence
      ) {
        const installScenario = {
          ...scenario,
          name: `${scenario.name}:install`,
          startupGateReady: false,
          startupPersistentStateReady: false,
          startupGateDisabled: false,
          visibleImportWebOrdinary: true,
          visibleEnable: false,
          visibleDisable: false,
          visibleUninstall: false
        }
        const installOutputPath = path.join(scenarioRoot, 'install-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: installOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(installScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const installEnvelope = readJson(installOutputPath)
        assertRuntimeEnvelope(installEnvelope, installScenario, 'http:')
        assertWebProductSurface(installEnvelope, installScenario)

        if (scenario.visibleImportInstalledUninstallSequence) {
          const uninstallScenario = {
            ...scenario,
            name: `${scenario.name}:uninstall`,
            startupGateReady: true,
            startupPersistentStateReady: true,
            startupPersistentStateUseInstalledState: true,
            startupGateRealRuntimePublicationCommit: true,
            startupGateRegistryCount: 54,
            startupGateEntryCount: 4245,
            startupPersistentStateExpectsResponseDeliveryHandoff: false,
            visibleImportWebOrdinary: false,
            visibleEnable: false,
            visibleDisable: false,
            visibleUninstall: true,
            visibleUninstallStartedEnabled: true
          }
          const uninstallOutputPath = path.join(scenarioRoot, 'uninstall-report.json')
          await runProcess(electronPath, [hostPath], {
            TAOYUAN_RUNTIME_PROBE_OUTPUT: uninstallOutputPath,
            TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(uninstallScenario).href,
            TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
          })
          const uninstallEnvelope = readJson(uninstallOutputPath)
          assertRuntimeEnvelope(uninstallEnvelope, uninstallScenario, 'http:')
          assertWebProductSurface(uninstallEnvelope, uninstallScenario)

          const restartScenario = {
            ...uninstallScenario,
            name: `${scenario.name}:restart`,
            startupGateReady: false,
            startupPersistentStateReady: false,
            startupPersistentStateUseInstalledState: false,
            visibleUninstall: false,
            startupGateUninstalled: true
          }
          const restartOutputPath = path.join(scenarioRoot, 'restart-report.json')
          await runProcess(electronPath, [hostPath], {
            TAOYUAN_RUNTIME_PROBE_OUTPUT: restartOutputPath,
            TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(restartScenario).href,
            TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
          })
          const restartEnvelope = readJson(restartOutputPath)
          assertRuntimeEnvelope(restartEnvelope, restartScenario, 'http:')
          assertWebProductSurface(restartEnvelope, restartScenario)
          reports.push({
            scenario: scenario.name,
            installRuntime: installEnvelope.runtime,
            uninstallRuntime: uninstallEnvelope.runtime,
            restartRuntime: restartEnvelope.runtime
          })
          continue
        }

        const disableScenario = {
          ...scenario,
          name: `${scenario.name}:disable`,
          startupGateReady: true,
          startupPersistentStateReady: true,
          startupPersistentStateUseInstalledState: true,
          startupGateDisabled: false,
          startupGateRealRuntimePublicationCommit: true,
          startupGateRegistryCount: 54,
          startupGateEntryCount: 4245,
          startupPersistentStateExpectsResponseDeliveryHandoff: false,
          visibleImportWebOrdinary: false,
          visibleEnable: false,
          visibleDisable: true
        }
        const disableOutputPath = path.join(scenarioRoot, 'disable-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: disableOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(disableScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const disableEnvelope = readJson(disableOutputPath)
        assertRuntimeEnvelope(disableEnvelope, disableScenario, 'http:')
        assertWebProductSurface(disableEnvelope, disableScenario)
        assertVisibleDisableProductProbe(
          disableEnvelope.thirdPartyVisibleImport,
          disableScenario,
          'http:'
        )

        if (scenario.visibleImportInstalledDisableEnableSequence) {
          const enableScenario = {
            ...disableScenario,
            name: `${scenario.name}:enable`,
            startupGateDisabled: true,
            visibleDisable: false,
            visibleEnable: true
          }
          const enableOutputPath = path.join(scenarioRoot, 'enable-report.json')
          await runProcess(electronPath, [hostPath], {
            TAOYUAN_RUNTIME_PROBE_OUTPUT: enableOutputPath,
            TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(enableScenario).href,
            TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
          })
          const enableEnvelope = readJson(enableOutputPath)
          assertRuntimeEnvelope(enableEnvelope, enableScenario, 'http:')
          assertWebProductSurface(enableEnvelope, enableScenario)

          const restartScenario = {
            ...enableScenario,
            name: `${scenario.name}:restart`,
            startupGateDisabled: false,
            visibleEnable: false
          }
          const restartOutputPath = path.join(scenarioRoot, 'restart-report.json')
          await runProcess(electronPath, [hostPath], {
            TAOYUAN_RUNTIME_PROBE_OUTPUT: restartOutputPath,
            TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(restartScenario).href,
            TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
          })
          const restartEnvelope = readJson(restartOutputPath)
          assertRuntimeEnvelope(restartEnvelope, restartScenario, 'http:')
          assertWebProductSurface(restartEnvelope, restartScenario)
          reports.push({
            scenario: scenario.name,
            installRuntime: installEnvelope.runtime,
            disableRuntime: disableEnvelope.runtime,
            enableRuntime: enableEnvelope.runtime,
            restartRuntime: restartEnvelope.runtime
          })
          continue
        }

        if (scenario.visibleImportInstalledDisableUninstallSequence) {
          const uninstallScenario = {
            ...disableScenario,
            name: `${scenario.name}:uninstall`,
            startupGateDisabled: true,
            startupGateEntryCount: 4242,
            visibleDisable: false,
            visibleUninstall: true
          }
          const uninstallOutputPath = path.join(scenarioRoot, 'uninstall-report.json')
          await runProcess(electronPath, [hostPath], {
            TAOYUAN_RUNTIME_PROBE_OUTPUT: uninstallOutputPath,
            TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(uninstallScenario).href,
            TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
          })
          const uninstallEnvelope = readJson(uninstallOutputPath)
          assertRuntimeEnvelope(uninstallEnvelope, uninstallScenario, 'http:')
          assertWebProductSurface(uninstallEnvelope, uninstallScenario)

          const restartScenario = {
            ...uninstallScenario,
            name: `${scenario.name}:restart`,
            startupGateReady: false,
            startupGateDisabled: false,
            startupPersistentStateReady: false,
            startupPersistentStateUseInstalledState: false,
            visibleUninstall: false,
            startupGateUninstalled: true
          }
          const restartOutputPath = path.join(scenarioRoot, 'restart-report.json')
          await runProcess(electronPath, [hostPath], {
            TAOYUAN_RUNTIME_PROBE_OUTPUT: restartOutputPath,
            TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(restartScenario).href,
            TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
          })
          const restartEnvelope = readJson(restartOutputPath)
          assertRuntimeEnvelope(restartEnvelope, restartScenario, 'http:')
          assertWebProductSurface(restartEnvelope, restartScenario)
          reports.push({
            scenario: scenario.name,
            installRuntime: installEnvelope.runtime,
            disableRuntime: disableEnvelope.runtime,
            uninstallRuntime: uninstallEnvelope.runtime,
            restartRuntime: restartEnvelope.runtime
          })
          continue
        }

        const restartScenario = {
          ...disableScenario,
          name: `${scenario.name}:restart`,
          startupGateDisabled: true,
          visibleDisable: false
        }
        const restartOutputPath = path.join(scenarioRoot, 'restart-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: restartOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(restartScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const restartEnvelope = readJson(restartOutputPath)
        assertRuntimeEnvelope(restartEnvelope, restartScenario, 'http:')
        assertWebProductSurface(restartEnvelope, restartScenario)
        reports.push({
          scenario: scenario.name,
          installRuntime: installEnvelope.runtime,
          disableRuntime: disableEnvelope.runtime,
          restartRuntime: restartEnvelope.runtime
        })
        continue
      }
      if (scenario.visibleImportInstalledStartupPersistentState) {
        const installScenario = {
          ...scenario,
          name: `${scenario.name}:install`,
          startupGateReady: false,
          startupPersistentStateReady: false,
          visibleImportWebOrdinary: true,
          visibleImportInstalledStartupPersistentState: false
        }
        const installOutputPath = path.join(scenarioRoot, 'install-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: installOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(installScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const installEnvelope = readJson(installOutputPath)
        assertRuntimeEnvelope(installEnvelope, installScenario, 'http:')
        assertWebProductSurface(installEnvelope, installScenario)

        const startupScenario = {
          ...scenario,
          name: `${scenario.name}:startup`,
          startupGateReady: true,
          startupPersistentStateReady: true,
          startupPersistentStateUseInstalledState: true,
          startupGateRealRuntimePublicationCommit: true,
          startupGateRegistryCount: 54,
          startupGateEntryCount: 4245,
          startupPersistentStateExpectsResponseDeliveryHandoff: false,
          visibleImportWebOrdinary: false,
          visibleImportInstalledStartupPersistentState: false
        }
        const startupOutputPath = path.join(scenarioRoot, 'startup-report.json')
        await runProcess(electronPath, [hostPath], {
          TAOYUAN_RUNTIME_PROBE_OUTPUT: startupOutputPath,
          TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(startupScenario).href,
          TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
        })
        const startupEnvelope = readJson(startupOutputPath)
        assertRuntimeEnvelope(startupEnvelope, startupScenario, 'http:')
        assertWebProductSurface(startupEnvelope, startupScenario)
        reports.push({
          scenario: scenario.name,
          installRuntime: installEnvelope.runtime,
          startupRuntime: startupEnvelope.runtime
        })
        continue
      }
      await runProcess(electronPath, [hostPath], {
        TAOYUAN_RUNTIME_PROBE_OUTPUT: outputPath,
        TAOYUAN_RUNTIME_PROBE_URL: buildWebScenarioUrl(scenario).href,
        TAOYUAN_RUNTIME_PROBE_USER_DATA: userData
      })
      const envelope = readJson(outputPath)
      assertRuntimeEnvelope(envelope, scenario, 'http:')
      assertWebProductSurface(envelope, scenario)
      reports.push({ scenario: scenario.name, runtime: envelope.runtime })
    }
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
  return reports
}

const runPackagedScenario = async (scenario, isolated) => {
  const scenarioRoot = path.join(runRoot, `electron-${scenario.dataRoot ?? scenario.name}`)
  const outputPath = path.join(runRoot, 'electron-reports', `${scenario.name}.json`)
  fs.mkdirSync(scenarioRoot, { recursive: true })
  const userDataPath = isolated ? path.join(scenarioRoot, 'userdata') : path.join(packagedRoot, 'userdata')
  const lockfilePath = modLockFilePath(userDataPath)
  const lockfileBefore = fileFingerprint(lockfilePath)
  const lockfileTempsBefore = modLockTemporaryNames(userDataPath)
  const exercisesInstallTransactionCommitFinalization =
    !!scenario.installTransactionCommitFinalization
  const exercisesVisibleUpgrade = !!scenario.visibleUpgrade
  const exercisesVisibleRollback = !!scenario.visibleImportRollback
  const exercisesVisibleFailure = !!scenario.visibleImportFailure
  const exercisesVisibleInitialImport =
    !!scenario.visibleImportRendererLiveRegistry && !exercisesVisibleUpgrade
  const exercisesVisibleImport =
    !!scenario.visibleImportRendererLiveRegistry || !!scenario.visibleEnable || exercisesVisibleUpgrade
  const exercisesPackageFileRestore =
    !!scenario.packageFileRestore || exercisesVisibleRollback
  const exercisesVisibleDisable = !!scenario.visibleDisable
  const exercisesVisibleUninstall = !!scenario.visibleUninstall
  const exercisesSettingsOrLockfileWrite =
    !!scenario.modLockWriteRead
    || !!scenario.settingsLockfileWriteRead
    || exercisesInstallTransactionCommitFinalization
    || exercisesVisibleImport
    || exercisesVisibleDisable
    || exercisesVisibleUninstall
  const exercisesPackageFileWrite =
    !!scenario.packageFileWriteRead
    || exercisesPackageFileRestore
    || exercisesInstallTransactionCommitFinalization
    || exercisesVisibleUpgrade
    || exercisesVisibleInitialImport
  const exercisesPersistentWrite = exercisesSettingsOrLockfileWrite || exercisesPackageFileWrite
  seedElectronCache(path.join(scenarioRoot, 'userdata'), scenario.cacheSeed)
  if (exercisesPersistentWrite) {
    assert(isolated, `${scenario.name}: persistent write/read scenario must be isolated`)
    if (
      !exercisesVisibleDisable
      && !exercisesVisibleUninstall
      && !scenario.visibleEnable
      && !exercisesVisibleUpgrade
      && !scenario.startupGateDisabled
    ) {
      writeModLockProtectionSentinels(scenarioRoot, userDataPath)
    }
  }
  const protectedBefore = exercisesPersistentWrite
    ? modLockProtectedFingerprints(scenarioRoot, userDataPath)
    : null
  const packageFileBefore = exercisesPackageFileWrite && !exercisesVisibleUpgrade
    ? writePackageFileProtectionSentinels(scenarioRoot)
    : null
  const packageFileTempsBefore = packageFileTemporaryNames(scenarioRoot)
  const preservedPackageRoot = path.join(scenarioRoot, 'mods', 'product-probe-pack')
  const preservedPackageBefore = scenario.visibleDisable || scenario.visibleUninstall || scenario.startupGateDisabled
    ? directoryFingerprint(preservedPackageRoot)
    : null
  const preservedPackageContentBefore = scenario.visibleEnable || exercisesVisibleUpgrade
    ? activePackageContentFingerprint(preservedPackageRoot)
    : null
  const preservedPackageManifestBefore = exercisesVisibleUpgrade
    && fs.existsSync(path.join(preservedPackageRoot, 'manifest.json'))
    ? readJson(path.join(preservedPackageRoot, 'manifest.json'))
    : null
  await runProcess(packagedExecutable, [], {
    TAOYUAN_RUNTIME_PROBE_OUTPUT: outputPath,
    TAOYUAN_RUNTIME_PROBE_AUTO_EXIT: '1',
    ...(scenario.fault ? { TAOYUAN_RUNTIME_PROBE_FAULT: scenario.fault } : {}),
    ...(scenario.modLockWriteRead ? { TAOYUAN_RUNTIME_PROBE_MOD_LOCK_WRITE_READ: '1' } : {}),
    ...(scenario.settingsLockfileWriteRead
      ? { TAOYUAN_RUNTIME_PROBE_SETTINGS_LOCKFILE_WRITE_READ: '1' }
      : {}),
    ...(scenario.packageFileWriteRead
      ? { TAOYUAN_RUNTIME_PROBE_PACKAGE_FILE_WRITE_READ: '1' }
      : {}),
    ...(scenario.packageFileRestore
      ? { TAOYUAN_RUNTIME_PROBE_PACKAGE_FILE_RESTORE: '1' }
      : {}),
    ...(scenario.installTransactionCommitFinalization
      ? { TAOYUAN_RUNTIME_PROBE_INSTALL_TRANSACTION_COMMIT_FINALIZATION: '1' }
      : {}),
    ...(scenario.installCommandLifecycle
      ? { TAOYUAN_RUNTIME_PROBE_INSTALL_COMMAND_LIFECYCLE: '1' }
      : {}),
    ...(scenario.installCommandDispatchIpc
      ? { TAOYUAN_RUNTIME_PROBE_INSTALL_COMMAND_DISPATCH_IPC: '1' }
      : {}),
    ...(scenario.ordinaryInstallTerminalConnection
      ? { TAOYUAN_RUNTIME_PROBE_ORDINARY_INSTALL_TERMINAL_CONNECTION: '1' }
      : {}),
    ...(scenario.ordinaryInstallTerminalRollback
      ? { TAOYUAN_RUNTIME_PROBE_ORDINARY_INSTALL_TERMINAL_ROLLBACK: '1' }
      : {}),
    ...(scenario.visibleImportRendererLiveRegistry
      || scenario.visibleEnable
      || exercisesVisibleUpgrade
      || exercisesVisibleFailure
      ? { TAOYUAN_RUNTIME_PROBE_VISIBLE_IMPORT: '1' }
      : {}),
    ...(exercisesVisibleRollback
      ? { TAOYUAN_RUNTIME_PROBE_VISIBLE_IMPORT_ROLLBACK: '1' }
      : {}),
    ...(exercisesVisibleFailure
      ? { TAOYUAN_RUNTIME_PROBE_VISIBLE_IMPORT_FAILURE: '1' }
      : {}),
    ...(scenario.visibleEnable
      ? { TAOYUAN_RUNTIME_PROBE_VISIBLE_ENABLE: '1' }
      : {}),
    ...(exercisesVisibleUpgrade
      ? { TAOYUAN_RUNTIME_PROBE_VISIBLE_UPGRADE: '1' }
      : {}),
    ...(scenario.visibleDisable
      ? { TAOYUAN_RUNTIME_PROBE_VISIBLE_DISABLE: '1' }
      : {}),
    ...(scenario.visibleUninstall
      ? { TAOYUAN_RUNTIME_PROBE_VISIBLE_UNINSTALL: '1' }
      : {}),
    ...(scenario.startupGateReady ? { TAOYUAN_RUNTIME_PROBE_STARTUP_GATE_READY: '1' } : {}),
    ...(scenario.startupPersistentStateReady
      ? { TAOYUAN_RUNTIME_PROBE_STARTUP_PERSISTENT_STATE: '1' }
      : {}),
    ...(scenario.startupPersistentStateUseInstalledState
      ? { TAOYUAN_RUNTIME_PROBE_STARTUP_PERSISTENT_STATE_INSTALLED_STATE: '1' }
      : {}),
    ...(isolated ? { PORTABLE_EXECUTABLE_DIR: scenarioRoot } : {})
  })
  const productReport = readJson(outputPath)
  assert(productReport?.target === 'electron', `${scenario.name}: wrong Electron target`)
  assertRuntimeEnvelope(productReport.runtime, scenario, 'file:')
  assertWebProductSurface(productReport, scenario)
  assert(productReport.electron?.isPackaged === true, `${scenario.name}: app is not packaged`)
  assert(productReport.electron?.userDataLocation === (
    isolated ? 'probe-isolated-directory' : 'executable-directory'
  ), `${scenario.name}: wrong userData location`)
  assert(productReport.electron?.userDataMatchesConfiguredDirectory === true,
    `${scenario.name}: userData did not use configured directory`)
  assert(productReport.electron?.settingsInsideUserData === true,
    `${scenario.name}: settings escaped userData`)
  assert(productReport.electron?.sessionStorageInsideUserData === true,
    `${scenario.name}: save storage escaped userData`)
  assert(productReport.electron?.officialCacheInsideUserData === true,
    `${scenario.name}: official cache escaped userData`)
  assert(productReport.electron?.officialCacheExists === true,
    `${scenario.name}: official cache was not written`)
  assert(productReport.electron?.startupLogChanged === false,
    `${scenario.name}: startup error log changed`)
  assertElectronModLockStorageProbe(productReport.electron?.modLockStorageProbe, scenario, isolated)
  assertElectronSettingsLockfileWriterProbe(
    productReport.electron?.settingsLockfileWriterProbe,
    scenario,
    isolated
  )
  assertElectronPackageFilePersistentStagingProbe(
    productReport.electron?.packageFilePersistentStagingProbe,
    scenario,
    isolated
  )
  assertElectronPackageFileRestoreProbe(
    productReport.electron?.packageFileRestoreProbe,
    scenario,
    isolated
  )
  assertElectronInstallTransactionCommitFinalizationProbe(
    productReport.electron?.installTransactionCommitFinalizationProbe,
    scenario,
    isolated
  )
  assertElectronInstallCommandLifecycleProbe(
    productReport.electron?.installCommandLifecycleProbe,
    scenario,
    isolated
  )
  assertElectronOrdinaryInstallTerminalConnectionProbe(
    productReport.electron?.ordinaryInstallTerminalConnectionProbe,
    productReport.runtime?.thirdPartyStartupGate,
    scenario,
    isolated
  )
  assertOfficialCacheFile(userDataPath, scenario.name)
  if (exercisesSettingsOrLockfileWrite) {
    const lockfileAfter = fileFingerprint(lockfilePath)
    if (scenario.modLockWriteRead) {
      assert(lockfileBefore.exists === false, `${scenario.name}: mod-lock file existed before write/read probe`)
    }
    assert(lockfileAfter.exists === true && lockfileAfter.size > 0,
      `${scenario.name}: mod-lock file was not written in the isolated directory`)
    const lockfileJson = readJson(lockfilePath)
    assert(lockfileJson.kind === 'third-party-data-pack-lockfile-draft',
      `${scenario.name}: mod-lock file has the wrong kind`)
    if (scenario.visibleUninstall) {
      assert(lockfileJson.packages?.length === 0,
        `${scenario.name}: uninstall mod-lock draft retained package records`)
      assert(lockfileJson.selectedPackageIds?.length === 0,
        `${scenario.name}: uninstall mod-lock draft selected a package`)
      assert((lockfileJson.blockedPackageIds ?? []).length === 0,
        `${scenario.name}: uninstall mod-lock draft blocked a package`)
      assert(lockfileJson.loadOrder?.length === 0,
        `${scenario.name}: uninstall mod-lock draft exposed a load order`)
    } else {
      assert(lockfileJson.packages?.[0]?.source?.candidatePath === 'product-probe-pack',
        `${scenario.name}: mod-lock draft did not use the synthetic product probe package`)
    }
    assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify(lockfileJson)),
      `${scenario.name}: mod-lock file leaked an absolute path`)
    if (
      scenario.settingsLockfileWriteRead
      || scenario.installTransactionCommitFinalization
      || scenario.visibleImportRendererLiveRegistry
      || scenario.visibleEnable
      || scenario.visibleDisable
      || scenario.visibleUninstall
      || exercisesVisibleUpgrade
    ) {
      const settingsJson = readJson(path.join(userDataPath, 'settings.json'))
      assert(settingsJson.closeToTray === false,
        `${scenario.name}: settings writer did not preserve closeToTray`)
      assert(settingsJson.autoLaunch === false,
        `${scenario.name}: settings writer did not preserve autoLaunch`)
      assert(settingsJson.thirdPartyDataPacks?.candidateHash === lockfileJson.candidateIdentity?.candidateHash,
        `${scenario.name}: settings candidate hash did not match mod-lock`)
      assert(settingsJson.thirdPartyDataPacks?.lockfileHash === lockfileJson.lockfileHash,
        `${scenario.name}: settings lockfile hash did not match mod-lock`)
      assert(JSON.stringify(settingsJson.thirdPartyDataPacks?.selectedPackageIds)
        === JSON.stringify(lockfileJson.selectedPackageIds),
      `${scenario.name}: settings selected packages did not match mod-lock`)
      assert(JSON.stringify(settingsJson.thirdPartyDataPacks?.loadOrder)
        === JSON.stringify(lockfileJson.loadOrder),
      `${scenario.name}: settings load order did not match mod-lock`)
      if (exercisesVisibleUpgrade) {
        assert(settingsJson.thirdPartyDataPacks?.commandId === 'install',
          `${scenario.name}: replacement settings did not preserve install command semantics`)
        assert(lockfileJson.packages?.[0]?.version === visibleProbePackageFixtures.v2.version,
          `${scenario.name}: replacement mod-lock did not persist v1.1.0`)
      }
      assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify(settingsJson)),
        `${scenario.name}: settings file leaked an absolute path`)
    }
  } else {
    assert(JSON.stringify(fileFingerprint(lockfilePath)) === JSON.stringify(lockfileBefore),
      `${scenario.name}: mod-lock file changed during inspect-only probe`)
  }
  if ((scenario.visibleDisable || scenario.startupGateDisabled) && !scenario.visibleEnable && !scenario.visibleUninstall) {
    assert(preservedPackageBefore !== null && preservedPackageBefore.length > 0,
      `${scenario.name}: disabled package files were not present before restart validation`)
    assert(JSON.stringify(directoryFingerprint(preservedPackageRoot))
      === JSON.stringify(preservedPackageBefore),
    `${scenario.name}: disabled package files were not preserved across the startup boundary`)
    const disabledLockfile = readJson(lockfilePath)
    assert(disabledLockfile.selectedPackageIds?.length === 0,
      `${scenario.name}: disabled package lockfile still selected a package`)
    assert(disabledLockfile.loadOrder?.length === 0,
      `${scenario.name}: disabled package lockfile still exposed a load order`)
    assert(disabledLockfile.packages?.[0]?.packageId === 'product_probe_pack',
      `${scenario.name}: disabled package lockfile lost the installed package record`)
    const settingsJson = readJson(path.join(userDataPath, 'settings.json'))
    assert(settingsJson.thirdPartyDataPacks?.commandId === 'disable',
      `${scenario.name}: disabled package settings did not persist the disable command`)
    assert(settingsJson.thirdPartyDataPacks?.targetPackageId === 'product_probe_pack',
      `${scenario.name}: disabled package settings reported the wrong target`)
    assert(settingsJson.thirdPartyDataPacks?.selectedPackageIds?.length === 0,
      `${scenario.name}: disabled package settings still selected a package`)
    assert(settingsJson.thirdPartyDataPacks?.loadOrder?.length === 0,
      `${scenario.name}: disabled package settings still exposed a load order`)
    assert(JSON.stringify(settingsJson.thirdPartyDataPacks?.blockedPackageIds)
      === JSON.stringify(['product_probe_pack']),
    `${scenario.name}: disabled package settings did not preserve the blocked package`)
    const startupStatePath = path.join(
      userDataPath,
      'mod-startup-state',
      'startup-persistent-state-snapshot.json'
    )
    const startupState = readJson(startupStatePath)
    assert(startupState.packageId === 'product_probe_pack',
      `${scenario.name}: disabled startup state reported the wrong package`)
    assert(startupState.transactionLog?.committed === true,
      `${scenario.name}: disabled startup state did not preserve transaction evidence`)
    assert(startupState.packageState?.matched === true,
      `${scenario.name}: disabled startup state did not preserve package evidence`)
    assert(startupState.settingsState?.matched === true,
      `${scenario.name}: disabled startup state did not preserve settings evidence`)
    assert(startupState.modLockState?.matched === true,
      `${scenario.name}: disabled startup state did not preserve mod-lock evidence`)
    assert(startupState.liveRegistry?.matched === true,
      `${scenario.name}: disabled startup state did not preserve live registry evidence`)
    assert(startupState.saveCache?.isolated === true,
      `${scenario.name}: disabled startup state did not preserve save/cache isolation evidence`)
    assert(!/[A-Za-z]:[\/]/.test(JSON.stringify({ disabledLockfile, settingsJson, startupState })),
      `${scenario.name}: disabled persistent state leaked an absolute path`)
  }
  if (scenario.visibleUninstall) {
    assert(preservedPackageBefore !== null && preservedPackageBefore.length > 0,
      `${scenario.name}: uninstall did not start with package files present`)
    assert(fs.existsSync(preservedPackageRoot) === false,
      `${scenario.name}: uninstall left the package root on disk`)
    const uninstalledLockfile = readJson(lockfilePath)
    assert(uninstalledLockfile.selectedPackageIds?.length === 0,
      `${scenario.name}: uninstall lockfile still selected a package`)
    assert((uninstalledLockfile.blockedPackageIds ?? []).length === 0,
      `${scenario.name}: uninstall lockfile still blocked a package`)
    assert(uninstalledLockfile.loadOrder?.length === 0,
      `${scenario.name}: uninstall lockfile still exposed a load order`)
    assert(uninstalledLockfile.packages?.length === 0,
      `${scenario.name}: uninstall lockfile retained package records`)
    const settingsJson = readJson(path.join(userDataPath, 'settings.json'))
    assert(settingsJson.thirdPartyDataPacks?.commandId === 'uninstall',
      `${scenario.name}: uninstall settings did not persist the uninstall command`)
    assert(settingsJson.thirdPartyDataPacks?.targetPackageId === 'product_probe_pack',
      `${scenario.name}: uninstall settings reported the wrong target`)
    assert(settingsJson.thirdPartyDataPacks?.selectedPackageIds?.length === 0,
      `${scenario.name}: uninstall settings still selected a package`)
    assert(settingsJson.thirdPartyDataPacks?.blockedPackageIds?.length === 0,
      `${scenario.name}: uninstall settings still blocked a package`)
    assert(settingsJson.thirdPartyDataPacks?.loadOrder?.length === 0,
      `${scenario.name}: uninstall settings still exposed a load order`)
    const startupStatePath = path.join(
      userDataPath,
      'mod-startup-state',
      'startup-persistent-state-snapshot.json'
    )
    const startupState = readJson(startupStatePath)
    assert(startupState.packageId === 'product_probe_pack',
      `${scenario.name}: uninstall startup state reported the wrong package`)
    assert(startupState.transactionLog?.committed === true,
      `${scenario.name}: uninstall startup state did not preserve transaction evidence`)
    assert(startupState.packageState?.matched === true,
      `${scenario.name}: uninstall startup state did not preserve package evidence`)
    assert(startupState.packageState?.removed === true,
      `${scenario.name}: uninstall startup state did not record package removal`)
    assert(startupState.settingsState?.matched === true,
      `${scenario.name}: uninstall startup state did not preserve settings evidence`)
    assert(startupState.modLockState?.matched === true,
      `${scenario.name}: uninstall startup state did not preserve mod-lock evidence`)
    assert(startupState.liveRegistry?.matched === true,
      `${scenario.name}: uninstall startup state did not preserve live registry evidence`)
    assert(startupState.saveCache?.isolated === true,
      `${scenario.name}: uninstall startup state did not preserve save/cache isolation evidence`)
    assert(!/[A-Za-z]:[\/]/.test(JSON.stringify({ uninstalledLockfile, settingsJson, startupState })),
      `${scenario.name}: uninstall persistent state leaked an absolute path`)
  }
  if (scenario.visibleEnable) {
    assert(preservedPackageContentBefore !== null && preservedPackageContentBefore.length > 0,
      `${scenario.name}: enabled package files were not present before re-enable validation`)
    assert(JSON.stringify(activePackageContentFingerprint(preservedPackageRoot))
      === JSON.stringify(preservedPackageContentBefore),
    `${scenario.name}: re-enable changed preserved package file contents unexpectedly`)
    const enabledLockfile = readJson(lockfilePath)
    assert(JSON.stringify(enabledLockfile.selectedPackageIds) === JSON.stringify(['product_probe_pack']),
      `${scenario.name}: re-enabled package lockfile did not select the package`)
    assert(JSON.stringify(enabledLockfile.loadOrder) === JSON.stringify(['product_probe_pack']),
      `${scenario.name}: re-enabled package lockfile did not restore load order`)
    assert(enabledLockfile.packages?.[0]?.packageId === 'product_probe_pack',
      `${scenario.name}: re-enabled package lockfile lost the installed package record`)
    const settingsJson = readJson(path.join(userDataPath, 'settings.json'))
    assert(settingsJson.thirdPartyDataPacks?.commandId === 'enable',
      `${scenario.name}: re-enabled package settings did not persist the enable command`)
    assert(settingsJson.thirdPartyDataPacks?.targetPackageId === 'product_probe_pack',
      `${scenario.name}: re-enabled package settings reported the wrong target`)
    assert(JSON.stringify(settingsJson.thirdPartyDataPacks?.selectedPackageIds)
      === JSON.stringify(['product_probe_pack']),
    `${scenario.name}: re-enabled package settings did not select the package`)
    assert(JSON.stringify(settingsJson.thirdPartyDataPacks?.blockedPackageIds ?? [])
      === JSON.stringify([]),
    `${scenario.name}: re-enabled package settings still blocked the package`)
    assert(JSON.stringify(settingsJson.thirdPartyDataPacks?.loadOrder)
      === JSON.stringify(['product_probe_pack']),
    `${scenario.name}: re-enabled package settings did not restore load order`)
    assert(!/[A-Za-z]:[\/]/.test(JSON.stringify({ enabledLockfile, settingsJson })),
      `${scenario.name}: re-enabled persistent state leaked an absolute path`)
  }
  if (exercisesVisibleUpgrade) {
    const paths = packageFileProbePaths(scenarioRoot)
    const manifestJson = readJson(paths.manifest)
    const itemsJson = readJson(paths.itemFile)
    const recipesJson = readJson(path.join(paths.packageRoot, 'data', 'recipes.json'))
    const shopOffersJson = readJson(path.join(paths.packageRoot, 'data', 'shop-offers.json'))
    assert(preservedPackageManifestBefore?.version === visibleProbePackageFixtures.v1.version,
      `${scenario.name}: replacement did not start from v1 package files`)
    assert(preservedPackageContentBefore !== null && preservedPackageContentBefore.length > 0,
      `${scenario.name}: replacement package files were not present before import`)
    assert(JSON.stringify(activePackageContentFingerprint(preservedPackageRoot))
      !== JSON.stringify(preservedPackageContentBefore),
    `${scenario.name}: replacement did not update active package file contents`)
    assert(manifestJson.id === visibleProbePackageId,
      `${scenario.name}: replacement package manifest reported the wrong package`)
    assert(manifestJson.version === visibleProbePackageFixtures.v2.version,
      `${scenario.name}: replacement package manifest did not persist v1.1.0`)
    assert(Array.isArray(itemsJson) && itemsJson[0]?.name?.fallback === visibleProbePackageFixtures.v2.itemNameFallback,
      `${scenario.name}: replacement item payload did not persist v1.1.0 content`)
    assert(Array.isArray(recipesJson) && recipesJson[0]?.name?.fallback === visibleProbePackageFixtures.v2.recipeNameFallback,
      `${scenario.name}: replacement recipe payload did not persist v1.1.0 content`)
    assert(Array.isArray(shopOffersJson)
      && shopOffersJson[0]?.name?.fallback === visibleProbePackageFixtures.v2.shopOfferNameFallback,
    `${scenario.name}: replacement shop offer payload did not persist v1.1.0 content`)
    assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify({ manifestJson, itemsJson, recipesJson, shopOffersJson })),
      `${scenario.name}: replacement package file payload leaked an absolute path`)
  }
  if (exercisesPackageFileWrite && !exercisesVisibleUpgrade) {
    const paths = packageFileProbePaths(scenarioRoot)
    assert(packageFileBefore?.beforeManifest.exists === true,
      `${scenario.name}: package file probe did not start with a previous manifest`)
    assert(packageFileBefore.beforeItemFile.exists === false,
      `${scenario.name}: package file probe item file existed before the write`)
    assert(packageFileBefore.beforeBackupManifest.exists === false,
      `${scenario.name}: package file probe backup existed before the write`)
    if (exercisesPackageFileRestore) {
      assert(fs.readFileSync(paths.manifest, 'utf8') === packageFileBefore.previousManifest,
        `${scenario.name}: package file restore did not restore the previous manifest`)
      assert(fs.existsSync(paths.itemFile) === false,
        `${scenario.name}: package file restore did not remove the newly created item file`)
      if (fs.existsSync(paths.backupManifest)) {
        assert(fs.readFileSync(paths.backupManifest, 'utf8') === packageFileBefore.previousManifest,
          `${scenario.name}: package file restore backup did not preserve the previous manifest`)
      }
    } else {
      const manifestJson = readJson(paths.manifest)
      const itemsJson = readJson(paths.itemFile)
      assert(manifestJson.id === 'product_probe_pack',
        `${scenario.name}: package file probe wrote the wrong manifest`)
      assert(manifestJson.entrypoints?.['taoyuan:item']?.[0] === 'data/items.json',
        `${scenario.name}: package file probe manifest entrypoint mismatch`)
      assert(Array.isArray(itemsJson) && itemsJson[0]?.id === 'product_probe_pack:linen_ribbon',
        `${scenario.name}: package file probe wrote the wrong item payload`)
      assert(fs.readFileSync(paths.backupManifest, 'utf8') === packageFileBefore.previousManifest,
        `${scenario.name}: package file probe did not preserve the previous manifest backup`)
      assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify({ manifestJson, itemsJson })),
        `${scenario.name}: package file payload leaked an absolute path`)
    }
  }
  if (exercisesVisibleRollback || exercisesVisibleFailure) {
    const startupStatePath = path.join(
      userDataPath,
      'mod-startup-state',
      'startup-persistent-state-snapshot.json'
    )
    assert(fs.existsSync(startupStatePath) === false,
      `${scenario.name}: visible non-success import wrote a startup persistent state snapshot`)
  }
  if (
    scenario.installTransactionCommitFinalization
    || scenario.visibleImportRendererLiveRegistry
    || exercisesVisibleUpgrade
  ) {
    const preparedLog = readJson(installTransactionPreparedLogPath(userDataPath))
    const probe = productReport.electron?.installTransactionCommitFinalizationProbe
    assert(preparedLog.kind === 'third-party-data-pack-install-transaction-log-prepared',
      `${scenario.name}: prepared transaction log has the wrong kind`)
    assert(preparedLog.operation === 'prepare-install-transaction',
      `${scenario.name}: prepared transaction log has the wrong operation`)
    if (scenario.installTransactionCommitFinalization) {
      assert(preparedLog.transactionId === probe.transactionId,
        `${scenario.name}: prepared transaction log id did not match the probe`)
    } else {
      assert(typeof preparedLog.transactionId === 'string' && preparedLog.transactionId.length > 0,
        `${scenario.name}: prepared transaction log id was missing`)
    }
    assert(preparedLog.targetPackageId === 'product_probe_pack',
      `${scenario.name}: prepared transaction log target mismatch`)
    assert(
      typeof preparedLog.entryHash === 'string'
        && (
          scenario.installTransactionCommitFinalization
            ? probe.transactionLogEntryHashPresent === true
            : /^sha256:[0-9a-f]{64}$/.test(preparedLog.entryHash)
        ),
      `${scenario.name}: prepared transaction log hash was missing`
    )
    assert(preparedLog.packageFileWriteAcknowledged === true,
      `${scenario.name}: prepared transaction log did not acknowledge package writes`)
    assert(preparedLog.settingsLockfileWriteAcknowledged === true,
      `${scenario.name}: prepared transaction log did not acknowledge settings-lockfile writes`)
    assert(preparedLog.transactionCommitConnectionAcknowledged === true,
      `${scenario.name}: prepared transaction log did not acknowledge transaction connection`)
    assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify(preparedLog)),
      `${scenario.name}: prepared transaction log leaked an absolute path`)
  }
  if (exercisesPersistentWrite) {
    const protectedAfter = modLockProtectedFingerprints(scenarioRoot, userDataPath)
    const omitted = scenario.settingsLockfileWriteRead
      || scenario.installTransactionCommitFinalization
      || scenario.visibleImportRendererLiveRegistry
      || scenario.visibleEnable
      || scenario.visibleDisable
      || scenario.visibleUninstall
      || exercisesVisibleUpgrade
      ? ['settings']
      : []
    assert(JSON.stringify(omitFingerprints(protectedAfter, omitted))
      === JSON.stringify(omitFingerprints(protectedBefore, omitted)),
    `${scenario.name}: persistent write/read probe modified protected non-target files`)
  }
  assert(JSON.stringify(modLockTemporaryNames(userDataPath)) === JSON.stringify(lockfileTempsBefore),
    `${scenario.name}: mod-lock temporary files changed unexpectedly`)
  assert(JSON.stringify(packageFileTemporaryNames(scenarioRoot)) === JSON.stringify(packageFileTempsBefore),
    `${scenario.name}: package file temporary files changed unexpectedly`)
  assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify(productReport)),
    `${scenario.name}: Electron report leaked an absolute path`)
  return { scenario: scenario.name, runtime: productReport.runtime, electron: productReport.electron }
}

const runElectronProbe = async () => {
  assert(fs.existsSync(packagedExecutable),
    'Electron product is missing; run pnpm build:electron')
  const reports = []
  reports.push(await runPackagedScenario(electronScenarios[0], false))

  const formalUserData = path.join(packagedRoot, 'userdata')
  assert(fs.existsSync(formalUserData), 'Packaged app did not create program-local userdata')
  const formalFingerprint = directoryFingerprint(formalUserData)
  for (const scenario of electronScenarios.slice(1)) {
    reports.push(await runPackagedScenario(scenario, scenario.isolated !== false))
  }
  assert(
    JSON.stringify(directoryFingerprint(formalUserData)) === JSON.stringify(formalFingerprint),
    'Fallback probes modified pkg/win-unpacked/userdata'
  )
  return reports
}

const summary = {
  schemaVersion: 1,
  expectedHashes,
  registryCount: metadata.registryCount,
  entryCount: metadata.entryCount,
  ...(target === 'web' || target === 'all' ? { web: await runWebProbe() } : {}),
  ...(target === 'electron' || target === 'all' ? { electron: await runElectronProbe() } : {}),
  ...(target === 'android' ? { android: await runAndroidProbe() } : {})
}

process.stdout.write(JSON.stringify(summary, null, 2) + '\n')

if (process.env.TAOYUAN_KEEP_RUNTIME_PROBE !== '1') {
  assertInside(cacheRoot, runRoot, 'Probe cleanup')
  fs.rmSync(runRoot, { recursive: true, force: true })
} else {
  process.stderr.write(`Kept runtime probe files at ${pathToFileURL(runRoot).href}\n`)
}
