const fs = require('node:fs')
const path = require('node:path')
const { app, BrowserWindow } = require('electron')

const outputPath = process.env.TAOYUAN_RUNTIME_PROBE_OUTPUT
const targetUrl = process.env.TAOYUAN_RUNTIME_PROBE_URL
const userDataPath = process.env.TAOYUAN_RUNTIME_PROBE_USER_DATA

if (!outputPath || !path.isAbsolute(outputPath)) {
  throw new Error('TAOYUAN_RUNTIME_PROBE_OUTPUT must be an absolute path')
}

const writeOutput = (value, exitCode = 0) => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(value, null, 2) + '\n', 'utf8')
  process.exitCode = exitCode
}

const fail = error => {
  writeOutput({
    schemaVersion: 1,
    target: 'web',
    probeError: error instanceof Error && error.message === 'runtime-report-timeout'
      ? error.message
      : 'web-probe-failed'
  }, 1)
  app.quit()
}

process.on('uncaughtException', fail)
process.on('unhandledRejection', fail)

if (!targetUrl || !targetUrl.startsWith('http://127.0.0.1:')) {
  fail(new Error('TAOYUAN_RUNTIME_PROBE_URL must use the local probe server'))
}
if (!userDataPath || !path.isAbsolute(userDataPath)) {
  fail(new Error('TAOYUAN_RUNTIME_PROBE_USER_DATA must be an absolute path'))
}

app.commandLine.appendSwitch('disable-gpu')
app.setPath('userData', userDataPath)

const waitForReport = async (window, timeoutMs = 120_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const report = await window.webContents.executeJavaScript(
      'globalThis.__TAOYUAN_CONTENT_RUNTIME_REPORT__ ?? null',
      true
    )
    if (report) return report
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('runtime-report-timeout')
}

app.whenReady().then(async () => {
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  })
  await window.loadURL(targetUrl)
  writeOutput(await waitForReport(window))
  app.quit()
}).catch(fail)
