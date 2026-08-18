const { contextBridge, ipcRenderer } = require('electron')

const electronReadonlyDirectorySource = Object.freeze({
  getEntry: sourcePath => ipcRenderer.invoke('electron-readonly-directory-source-get-entry', sourcePath),
  readDirectory: sourcePath => ipcRenderer.invoke('electron-readonly-directory-source-read-directory', sourcePath),
  readTextFile: sourcePath => ipcRenderer.invoke('electron-readonly-directory-source-read-text-file', sourcePath)
})

const deliverThirdPartyDataPackResponse = envelope =>
  ipcRenderer.invoke('third-party-data-pack-response-delivery', envelope)

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
  deliverThirdPartyDataPackResponse
})
