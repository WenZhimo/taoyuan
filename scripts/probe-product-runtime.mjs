import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const require = createRequire(import.meta.url)
const targetArg = process.argv.find(argument => argument.startsWith('--target='))
const target = targetArg?.slice('--target='.length) ?? 'all'
if (!['web', 'electron', 'all'].includes(target)) {
  throw new Error('Expected --target=web, --target=electron, or --target=all')
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
  seedElectronCache(path.join(scenarioRoot, 'userdata'), scenario.cacheSeed)
  await runProcess(packagedExecutable, [], {
    TAOYUAN_RUNTIME_PROBE_OUTPUT: outputPath,
    TAOYUAN_RUNTIME_PROBE_AUTO_EXIT: '1',
    ...(scenario.fault ? { TAOYUAN_RUNTIME_PROBE_FAULT: scenario.fault } : {}),
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
  assertOfficialCacheFile(
    isolated ? path.join(scenarioRoot, 'userdata') : path.join(packagedRoot, 'userdata'),
    scenario.name
  )
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
  ...(target === 'electron' || target === 'all' ? { electron: await runElectronProbe() } : {})
}

process.stdout.write(JSON.stringify(summary, null, 2) + '\n')

if (process.env.TAOYUAN_KEEP_RUNTIME_PROBE !== '1') {
  assertInside(cacheRoot, runRoot, 'Probe cleanup')
  fs.rmSync(runRoot, { recursive: true, force: true })
} else {
  process.stderr.write(`Kept runtime probe files at ${pathToFileURL(runRoot).href}\n`)
}
