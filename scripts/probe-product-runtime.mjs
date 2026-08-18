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
const webScenarios = [
  { name: 'precompiled', fault: null, source: 'precompiled', status: 'official-precompiled-hit' },
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
  const contents = seed === 'corrupt'
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
  packageFile: path.join(programDirectoryPath, 'mods', 'probe-pack', 'manifest.json'),
  transactionLog: path.join(userDataPath, 'mod-transactions', 'pending.json')
})

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

const modLockProtectedFingerprints = (programDirectoryPath, userDataPath) =>
  Object.fromEntries(Object.entries(modLockProtectedPaths(programDirectoryPath, userDataPath))
    .map(([name, filePath]) => [name, fileContentFingerprint(filePath)]))

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

const assertRuntimeEnvelope = (envelope, scenario, protocol) => {
  assert(envelope?.schemaVersion === 1, `${scenario.name}: invalid envelope version`)
  assert(envelope.ui?.locationProtocol === protocol, `${scenario.name}: wrong protocol`)
  assert(envelope.ui?.mainMenuReady === true, `${scenario.name}: main menu not ready`)
  assert(envelope.ui?.startupFailureVisible === false, `${scenario.name}: startup failure visible`)

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
  try {
    for (const scenario of webScenarios) {
      const scenarioRoot = path.join(runRoot, `web-${scenario.name}`)
      const outputPath = path.join(scenarioRoot, 'report.json')
      fs.mkdirSync(scenarioRoot, { recursive: true })
      const url = new URL(baseUrl)
      url.searchParams.set('taoyuanContentProbe', '1')
      if (scenario.fault) url.searchParams.set('taoyuanPrecompiledFault', scenario.fault)
      await runProcess(electronPath, [hostPath], {
        TAOYUAN_RUNTIME_PROBE_OUTPUT: outputPath,
        TAOYUAN_RUNTIME_PROBE_URL: url.href,
        TAOYUAN_RUNTIME_PROBE_USER_DATA: path.join(scenarioRoot, 'userdata')
      })
      const envelope = readJson(outputPath)
      assertRuntimeEnvelope(envelope, scenario, 'http:')
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
  seedElectronCache(path.join(scenarioRoot, 'userdata'), scenario.cacheSeed)
  if (scenario.modLockWriteRead) {
    assert(isolated, `${scenario.name}: mod-lock write/read scenario must be isolated`)
    writeModLockProtectionSentinels(scenarioRoot, userDataPath)
  }
  const protectedBefore = scenario.modLockWriteRead
    ? modLockProtectedFingerprints(scenarioRoot, userDataPath)
    : null
  await runProcess(packagedExecutable, [], {
    TAOYUAN_RUNTIME_PROBE_OUTPUT: outputPath,
    TAOYUAN_RUNTIME_PROBE_AUTO_EXIT: '1',
    ...(scenario.fault ? { TAOYUAN_RUNTIME_PROBE_FAULT: scenario.fault } : {}),
    ...(scenario.modLockWriteRead ? { TAOYUAN_RUNTIME_PROBE_MOD_LOCK_WRITE_READ: '1' } : {}),
    ...(isolated ? { PORTABLE_EXECUTABLE_DIR: scenarioRoot } : {})
  })
  const productReport = readJson(outputPath)
  assert(productReport?.target === 'electron', `${scenario.name}: wrong Electron target`)
  assertRuntimeEnvelope(productReport.runtime, scenario, 'file:')
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
  assertOfficialCacheFile(userDataPath, scenario.name)
  if (scenario.modLockWriteRead) {
    const lockfileAfter = fileFingerprint(lockfilePath)
    assert(lockfileBefore.exists === false, `${scenario.name}: mod-lock file existed before write/read probe`)
    assert(lockfileAfter.exists === true && lockfileAfter.size > 0,
      `${scenario.name}: mod-lock file was not written in the isolated directory`)
    const lockfileJson = readJson(lockfilePath)
    assert(lockfileJson.kind === 'third-party-data-pack-lockfile-draft',
      `${scenario.name}: mod-lock file has the wrong kind`)
    assert(lockfileJson.packages?.[0]?.source?.candidatePath === 'product-probe-pack',
      `${scenario.name}: mod-lock draft did not use the synthetic product probe package`)
    assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify(lockfileJson)),
      `${scenario.name}: mod-lock file leaked an absolute path`)
    assert(JSON.stringify(modLockProtectedFingerprints(scenarioRoot, userDataPath))
      === JSON.stringify(protectedBefore),
    `${scenario.name}: mod-lock write/read probe modified protected player or package files`)
  } else {
    assert(JSON.stringify(fileFingerprint(lockfilePath)) === JSON.stringify(lockfileBefore),
      `${scenario.name}: mod-lock file changed during inspect-only probe`)
  }
  assert(JSON.stringify(modLockTemporaryNames(userDataPath)) === JSON.stringify(lockfileTempsBefore),
    `${scenario.name}: mod-lock temporary files changed unexpectedly`)
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
