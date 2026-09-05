const { contextBridge, ipcRenderer } = require('electron')

const electronReadonlyDirectorySource = Object.freeze({
  getEntry: sourcePath => ipcRenderer.invoke('electron-readonly-directory-source-get-entry', sourcePath),
  readDirectory: sourcePath => ipcRenderer.invoke('electron-readonly-directory-source-read-directory', sourcePath),
  readTextFile: sourcePath => ipcRenderer.invoke('electron-readonly-directory-source-read-text-file', sourcePath)
})

const deliverThirdPartyDataPackResponse = envelope =>
  ipcRenderer.invoke('third-party-data-pack-response-delivery', envelope)

const dispatchThirdPartyDataPackInstallCommand = envelope =>
  ipcRenderer.invoke('third-party-data-pack-install-command-dispatch', envelope)

const disableThirdPartyDataPack = envelope =>
  ipcRenderer.invoke('third-party-data-pack-disable-command', envelope)

const enableThirdPartyDataPack = envelope =>
  ipcRenderer.invoke('third-party-data-pack-enable-command', envelope)

const uninstallThirdPartyDataPack = envelope =>
  ipcRenderer.invoke('third-party-data-pack-uninstall-command', envelope)

const readThirdPartyDataPackInstalledState = () =>
  ipcRenderer.invoke('third-party-data-pack-installed-state-read')

const continueThirdPartyDataPackOrdinaryInstallTerminal = envelope =>
  ipcRenderer.invoke('third-party-data-pack-ordinary-install-terminal-continuation', envelope)

const readThirdPartyDataPackStartupPersistentState = request =>
  ipcRenderer.invoke('third-party-data-pack-startup-persistent-state-read', request)

contextBridge.exposeInMainWorld('electronAPI', {
  // 获取设置
  getSettings: () => ipcRenderer.invoke('get-settings'),

  // 保存设置
  setSettings: settings => ipcRenderer.invoke('set-settings', settings),

  // 重启窗口（用于切换边框模式）
  restartWindow: () => ipcRenderer.invoke('restart-window'),

  // 退出应用
  quitApp: () => ipcRenderer.invoke('quit-app'),

  // Report fatal renderer startup failures without exposing filesystem access.
  reportStartupFailure: message => ipcRenderer.send('startup-failure', message),

  // Send a bounded structured report only when the main process enabled a probe run.
  reportContentRuntimeProbe: report => ipcRenderer.send('content-runtime-probe', report),

  // Cache access is restricted to fixed program-local paths in the main process.
  readOfficialRegistryCache: () => ipcRenderer.invoke('official-registry-cache-read'),
  writeOfficialRegistryCache: contents => ipcRenderer.invoke('official-registry-cache-write', contents),

  // Read-only package source operations are fixed to the executable-local mods/ root.
  electronReadonlyDirectorySource,

  // Response delivery is restricted to one fixed acknowledgement channel.
  deliverThirdPartyDataPackResponse,

  // Install command dispatch is restricted to one fixed acknowledgement channel.
  dispatchThirdPartyDataPackInstallCommand,

  // Disable command persistence is restricted to one fixed userdata channel.
  disableThirdPartyDataPack,

  // Enable command persistence is restricted to one fixed userdata channel.
  enableThirdPartyDataPack,

  // Uninstall command persistence is restricted to one fixed userdata channel.
  uninstallThirdPartyDataPack,

  // Installed package management reads a validated state summary from program userdata.
  readThirdPartyDataPackInstalledState,

  // Ordinary install terminal continuation is restricted to one fixed acknowledgement channel.
  continueThirdPartyDataPackOrdinaryInstallTerminal,

  // Startup persistent state reads are restricted to the program-local userdata snapshot.
  readThirdPartyDataPackStartupPersistentState
})
