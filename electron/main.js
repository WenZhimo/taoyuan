import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, session } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import pkg from '../package.json'
import officialCacheMetadata from '../src/generated/mods/official-precompiled-metadata.json'
import {
  getOfficialRegistryCacheFilePaths,
  readOfficialRegistryCacheFile,
  writeOfficialRegistryCacheFile
} from '../src/domain/mods/officialRegistryCacheFile'
import { createElectronThirdPartyDataPackModLockStorageProbe } from '../src/domain/mods/electronModLockStorageProbe'
import { hashCanonicalJson } from '../src/domain/mods/hash'

const runtimeProbeOutputPath = typeof process.env.TAOYUAN_RUNTIME_PROBE_OUTPUT === 'string'
  && path.isAbsolute(process.env.TAOYUAN_RUNTIME_PROBE_OUTPUT)
  ? process.env.TAOYUAN_RUNTIME_PROBE_OUTPUT
  : null
const runtimeProbeEnabled = runtimeProbeOutputPath !== null
const runtimeProbeFault = ['missing', 'corrupt', 'environment-mismatch']
  .includes(process.env.TAOYUAN_RUNTIME_PROBE_FAULT)
  ? process.env.TAOYUAN_RUNTIME_PROBE_FAULT
  : null
const runtimeProbeAutoExit = process.env.TAOYUAN_RUNTIME_PROBE_AUTO_EXIT === '1'
const runtimeProbeModLockWriteRead = process.env.TAOYUAN_RUNTIME_PROBE_MOD_LOCK_WRITE_READ === '1'

const getExecutableUserDataPath = () => path.join(
  process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath),
  'userdata'
)

const configurePackagedUserData = () => {
  if (!app.isPackaged) return

  const defaultUserDataPath = app.getPath('userData')
  const localUserDataPath = getExecutableUserDataPath()

  if (path.resolve(defaultUserDataPath) === path.resolve(localUserDataPath)) return

  try {
    fs.mkdirSync(localUserDataPath, { recursive: true })
    fs.accessSync(localUserDataPath, fs.constants.W_OK)
    if (!runtimeProbeEnabled) {
      for (const name of ['Local Storage', 'settings.json']) {
        const source = path.join(defaultUserDataPath, name)
        const target = path.join(localUserDataPath, name)
        if (fs.existsSync(source) && !fs.existsSync(target)) {
          fs.cpSync(source, target, { recursive: true })
        }
      }
    }
    app.setPath('userData', localUserDataPath)
  } catch (e) {
    console.error('Failed to use local user data path, falling back to default:', e)
  }
}

configurePackagedUserData()

// 应用根目录（开发时是项目根目录，打包后是 app.asar）
const appRoot = app.getAppPath()

// preload 路径
const preloadPath = path.join(appRoot, 'dist-electron', 'preload.js')

// 构建产物路径（Vite 输出到 docs/）
const docsPath = path.join(appRoot, 'docs')

// 静态资源路径
const publicPath = path.join(appRoot, 'public')

// 设置文件路径
const settingsPath = path.join(app.getPath('userData'), 'settings.json')
const startupLogPath = path.join(app.getPath('userData'), 'startup.log')
const officialCachePaths = getOfficialRegistryCacheFilePaths(
  app.getPath('userData'),
  officialCacheMetadata.environmentHash
)
const isOfficialRegistryDiskCacheAvailable = () => {
  if (!app.isPackaged) return false
  return path.resolve(app.getPath('userData')) === path.resolve(getExecutableUserDataPath())
}
const startupLogInitialStat = fs.existsSync(startupLogPath)
  ? fs.statSync(startupLogPath)
  : null

const isPathInside = (parent, candidate) => {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate))
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

const probeSha = fill => `sha256:${fill.repeat(64)}`

const createSyntheticModLockDraft = () => {
  const packageId = 'product_probe_pack'
  const itemId = `${packageId}:linen_ribbon`
  const body = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: officialCacheMetadata.artifactHash,
      contentHash: officialCacheMetadata.contentHash,
      schemaSetHash: officialCacheMetadata.schemaSetHash,
      environmentHash: officialCacheMetadata.environmentHash,
      snapshotHash: officialCacheMetadata.snapshotHash,
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity: {
      formatVersion: 1,
      contentHash: probeSha('a'),
      snapshotHash: probeSha('b'),
      candidateHash: probeSha('c')
    },
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
          candidatePath: 'product-probe-pack',
          manifestPath: 'product-probe-pack/manifest.json',
          contentFiles: ['product-probe-pack/data/items.json']
        },
        manifestHash: probeSha('d'),
        contentHash: probeSha('e'),
        configurationHash: probeSha('f'),
        resolvedDependencies: [],
        contentFiles: [
          {
            registryId: 'taoyuan:item',
            path: 'data/items.json',
            entryCount: 1,
            entries: [
              {
                registryId: 'taoyuan:item',
                contentId: itemId,
                index: 0,
                canonicalHash: probeSha('1')
              }
            ]
          }
        ]
      }
    ]
  }

  return {
    ...body,
    lockfileHash: hashCanonicalJson(body)
  }
}

const createModLockProbe = () => createElectronThirdPartyDataPackModLockStorageProbe({
  host: {
    isPackaged: app.isPackaged,
    executablePath: process.execPath,
    portableExecutableDirectory: process.env.PORTABLE_EXECUTABLE_DIR || null,
    configuredUserDataPath: app.getPath('userData')
  }
})

const createPathFreeModLockProbeReport = (report, options = {}) => {
  const userDataPath = app.getPath('userData')
  const paths = report.paths
  const modLockUserDataPath = paths?.userDataPath
  const modLockPath = paths?.filePath

  return {
    status: report.status,
    operation: options.operation ?? report.operation,
    storageKind: report.storageKind,
    programDirectorySource: report.programDirectorySource ?? null,
    diagnosticsCount: report.diagnostics.length,
    configuredUserDataObserved: typeof report.configuredUserDataPath === 'string',
    programDirectoryUserDataResolved: typeof modLockUserDataPath === 'string',
    programDirectoryUserDataMatchesConfiguredUserData:
      typeof modLockUserDataPath === 'string'
        && path.resolve(modLockUserDataPath) === path.resolve(userDataPath),
    modLockInsideProgramUserData:
      typeof modLockUserDataPath === 'string'
        && typeof modLockPath === 'string'
        && isPathInside(modLockUserDataPath, modLockPath),
    modLockInsideConfiguredUserData:
      typeof modLockPath === 'string' && isPathInside(userDataPath, modLockPath),
    effects: {
      officialRegistryPublished: report.effects.officialRegistryPublished,
      thirdPartyRegistryPublished: report.effects.thirdPartyRegistryPublished,
      runtimeEnablementAllowed: report.effects.runtimeEnablementAllowed,
      electronIpcExposed: report.effects.electronIpcExposed,
      packageFilesWritten: report.effects.packageFilesWritten,
      packageBackupsWritten: report.effects.packageBackupsWritten,
      lockfileWritten: options.lockfileWritten ?? report.effects.lockfileWritten,
      settingsWritten: report.effects.settingsWritten,
      savesWritten: report.effects.savesWritten,
      cacheWritten: report.effects.cacheWritten,
      transactionLogWritten: report.effects.transactionLogWritten,
      electronMainProcessBoundaryInspected: report.effects.electronMainProcessBoundaryInspected,
      configuredUserDataPathUsed: report.effects.configuredUserDataPathUsed,
      systemUserDataFallbackAllowed: report.effects.systemUserDataFallbackAllowed,
      desktopStartupChanged: report.effects.desktopStartupChanged
    },
    ...options.extra
  }
}

const createModLockStorageProbeReport = async () => {
  const probe = createModLockProbe()
  const shouldExerciseWriteRead = runtimeProbeModLockWriteRead && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseWriteRead) {
    return createPathFreeModLockProbeReport(await probe.inspect())
  }

  const draft = createSyntheticModLockDraft()
  const writeResult = await probe.write(draft)
  const readResult = await probe.read()
  const report = writeResult.report.status === 'written'
    ? readResult.report
    : writeResult.report

  return createPathFreeModLockProbeReport(report, {
    operation: 'write-read',
    lockfileWritten: writeResult.report.effects.lockfileWritten,
    extra: {
      writeStatus: writeResult.report.status,
      readStatus: readResult.report.status,
      draftRoundTripMatched: JSON.stringify(readResult.draft) === JSON.stringify(draft)
    }
  })
}

const writeRuntimeProbeOutput = (value, exitCode = 0) => {
  if (!runtimeProbeOutputPath) return
  try {
    const serialized = JSON.stringify(value, null, 2) + '\n'
    if (Buffer.byteLength(serialized, 'utf8') > 1_000_000) {
      throw new Error('Runtime probe report exceeded the size limit')
    }
    fs.mkdirSync(path.dirname(runtimeProbeOutputPath), { recursive: true })
    const temporaryPath = `${runtimeProbeOutputPath}.tmp-${process.pid}`
    fs.writeFileSync(temporaryPath, serialized, 'utf8')
    fs.renameSync(temporaryPath, runtimeProbeOutputPath)
    process.exitCode = exitCode
  } catch (error) {
    console.error('Failed to write runtime probe output:', error)
    process.exitCode = 1
  }
  if (runtimeProbeAutoExit) {
    isQuitting = true
    setImmediate(() => app.quit())
  }
}

const writeRuntimeProbeFailure = code => {
  writeRuntimeProbeOutput({
    schemaVersion: 1,
    target: 'electron',
    probeError: code
  }, 1)
}

const appendStartupLog = message => {
  try {
    fs.appendFileSync(startupLogPath, `[${new Date().toISOString()}] ${message}\n`, 'utf8')
  } catch (e) {
    console.error('Failed to write startup log:', e)
  }
}

// 默认设置
const defaultSettings = {
  closeToTray: false, // 关闭窗口时隐藏到托盘
  autoLaunch: false // 开机自启动
}

// 读取设置
const loadSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return { ...defaultSettings }
}

// 保存设置
const saveSettings = s => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

let settings = loadSettings()
let win = null
let tray = null
let isQuitting = false

// 销毁托盘
const destroyTray = () => {
  if (tray) {
    tray.destroy()
    tray = null
  }
}

// 设置开机自启动
const setAutoLaunch = enable => {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  })
}

// 创建托盘
const createTray = () => {
  if (tray) return

  const iconPath = path.join(publicPath, 'favicon.ico')
  const trayIcon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty()

  tray = new Tray(trayIcon)
  tray.setToolTip(pkg.title)

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => win?.show() },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => win?.show())
}

// 创建应用菜单
const createAppMenu = () => {
  const template = [
    {
      label: '设置',
      submenu: [
        {
          label: '关闭时最小化到托盘',
          type: 'checkbox',
          checked: settings.closeToTray,
          click: menuItem => {
            settings.closeToTray = menuItem.checked
            saveSettings(settings)
            if (settings.closeToTray) {
              createTray()
            } else {
              destroyTray()
            }
          }
        },
        {
          label: '开机自动启动',
          type: 'checkbox',
          checked: settings.autoLaunch,
          click: menuItem => {
            settings.autoLaunch = menuItem.checked
            saveSettings(settings)
            setAutoLaunch(settings.autoLaunch)
          }
        },
        {
          label: '退出游戏',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            isQuitting = true
            app.quit()
          }
        }
      ]
    },
    {
      label: '开发',
      submenu: [
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => win?.webContents.toggleDevTools()
        },
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => win?.webContents.reload()
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 创建窗口
const createWindow = () => {
  win = new BrowserWindow({
    title: pkg.title,
    icon: path.join(publicPath, 'favicon.ico'),
    width: 1024,
    height: 768,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  })

  createAppMenu()
  const loadOptions = runtimeProbeEnabled
    ? {
        query: {
          taoyuanContentProbe: '1',
          ...(runtimeProbeFault ? { taoyuanPrecompiledFault: runtimeProbeFault } : {})
        }
      }
    : undefined
  void win.loadFile(path.join(docsPath, 'index.html'), loadOptions)
  if (runtimeProbeEnabled) {
    win.webContents.once('did-fail-load', () => writeRuntimeProbeFailure('renderer-load-failed'))
  }

  // WebDAV CORS 绕过：对所有非同源请求注入 CORS 响应头
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders }
    headers['access-control-allow-origin'] = ['*']
    headers['access-control-allow-methods'] = ['GET, PUT, DELETE, PROPFIND, HEAD, OPTIONS']
    headers['access-control-allow-headers'] = ['Authorization, Content-Type, Depth']
    // 剥离 WWW-Authenticate 防止浏览器弹出原生认证对话框（由应用自行处理认证错误）
    delete headers['www-authenticate']
    delete headers['WWW-Authenticate']
    callback({ responseHeaders: headers })
  })

  // 窗口关闭事件
  win.on('close', e => {
    if (settings.closeToTray && !isQuitting) {
      e.preventDefault()
      win.hide()
      createTray()
    }
  })
}

// IPC 处理
ipcMain.handle('get-settings', () => settings)

ipcMain.handle('set-settings', (_, newSettings) => {
  settings = { ...settings, ...newSettings }
  saveSettings(settings)

  // 处理开机自启动
  setAutoLaunch(settings.autoLaunch)

  // 处理托盘
  if (settings.closeToTray) {
    createTray()
  } else {
    destroyTray()
  }

  return { needRestart: false }
})

ipcMain.handle('restart-window', () => {
  if (win) {
    const bounds = win.getBounds()
    win.destroy()
    createWindow()
    win.setBounds(bounds)
  }
})

ipcMain.handle('quit-app', () => {
  isQuitting = true
  app.quit()
})

ipcMain.handle('official-registry-cache-read', async () => {
  if (!isOfficialRegistryDiskCacheAvailable()) return null
  return await readOfficialRegistryCacheFile(officialCachePaths)
})

ipcMain.handle('official-registry-cache-write', async (_event, contents) => {
  if (!isOfficialRegistryDiskCacheAvailable()) {
    throw new Error('Official registry disk cache is unavailable outside executable userdata')
  }
  if (typeof contents !== 'string') {
    throw new TypeError('Official registry disk cache contents must be JSON text')
  }
  await writeOfficialRegistryCacheFile(
    officialCachePaths,
    contents,
    officialCacheMetadata
  )
  return { status: 'written' }
})

ipcMain.on('startup-failure', (_event, message) => {
  if (typeof message !== 'string') return
  appendStartupLog(`[taoyuan-core] ${message.slice(0, 100_000)}`)
})

ipcMain.on('content-runtime-probe', (_event, report) => {
  if (!runtimeProbeEnabled) return
  if (
    !report
    || typeof report !== 'object'
    || report.schemaVersion !== 1
    || !report.runtime
    || typeof report.runtime !== 'object'
  ) {
    writeRuntimeProbeFailure('invalid-renderer-report')
    return
  }

  void (async() => {
    const userDataPath = app.getPath('userData')
    const expectedUserDataPath = getExecutableUserDataPath()
    const storagePath = session.defaultSession.storagePath
    const startupLogCurrentStat = fs.existsSync(startupLogPath)
      ? fs.statSync(startupLogPath)
      : null
    const startupLogChanged = startupLogInitialStat === null
      ? startupLogCurrentStat !== null
      : startupLogCurrentStat === null
        || startupLogInitialStat.size !== startupLogCurrentStat.size
        || startupLogInitialStat.mtimeMs !== startupLogCurrentStat.mtimeMs
    const modLockStorageProbe = await createModLockStorageProbeReport()

    writeRuntimeProbeOutput({
      schemaVersion: 1,
      target: 'electron',
      runtime: report,
      electron: {
        isPackaged: app.isPackaged,
        userDataLocation: process.env.PORTABLE_EXECUTABLE_DIR
          ? 'probe-isolated-directory'
          : 'executable-directory',
        userDataMatchesConfiguredDirectory:
          path.resolve(userDataPath) === path.resolve(expectedUserDataPath),
        settingsInsideUserData: isPathInside(userDataPath, settingsPath),
        sessionStorageInsideUserData:
          typeof storagePath === 'string' && isPathInside(userDataPath, storagePath),
        officialCacheInsideUserData: isPathInside(userDataPath, officialCachePaths.filePath),
        officialCacheExists: fs.existsSync(officialCachePaths.filePath),
        startupLogChanged,
        modLockStorageProbe
      }
    })
  })().catch(error => {
    console.error('Failed to create Electron runtime probe report:', error)
    writeRuntimeProbeFailure('electron-runtime-probe-failed')
  })
})

app.whenReady().then(() => {
  createWindow()

  if (runtimeProbeEnabled) {
    setTimeout(() => writeRuntimeProbeFailure('runtime-report-timeout'), 120_000)
  }

  // 如果启用了托盘功能，创建托盘
  if (settings.closeToTray) {
    createTray()
  }

  // 应用开机自启动设置
  setAutoLaunch(settings.autoLaunch)
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win) {
    win.show()
  } else {
    createWindow()
  }
})
