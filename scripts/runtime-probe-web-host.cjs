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
      : 'web-probe-failed',
    ...(error && typeof error === 'object' && 'probeDetails' in error
      ? { probeDetails: error.probeDetails }
      : {})
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

const waitForReport = async (window, consoleMessages, timeoutMs = 120_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const report = await window.webContents.executeJavaScript(
      'globalThis.__TAOYUAN_CONTENT_RUNTIME_REPORT__ ?? null',
      true
    )
    if (report) return report
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  const error = new Error('runtime-report-timeout')
  const probeDetails = await window.webContents.executeJavaScript(
    `(() => {
      const text = node => typeof node?.textContent === 'string'
        ? node.textContent.replace(/\\s+/g, ' ').trim()
        : null
      const startupFailure = document.querySelector('.startup-failure')
      return {
        locationHref: location.href,
        documentTitle: document.title,
        readyState: document.readyState,
        startupFailureVisible: startupFailure !== null,
        startupFailureText: text(startupFailure),
        startupFailureDetail: startupFailure?.getAttribute('data-runtime-probe-startup-error') ?? null,
        bodyText: text(document.body)?.slice(0, 1000) ?? null
      }
    })()`,
    true
  ).catch(diagnosticError => ({
    diagnosticError: diagnosticError instanceof Error ? diagnosticError.message : String(diagnosticError)
  }))
  error.probeDetails = {
    ...probeDetails,
    consoleMessages
  }
  throw error
}

const readWebProductSurface = async window => window.webContents.executeJavaScript(
  `(() => {
    const text = node => typeof node?.textContent === 'string'
      ? node.textContent.replace(/\\s+/g, ' ').trim()
      : null
    const importPanel = document.querySelector('[data-testid="web-data-pack-import-preflight-panel"]')
    const responseSummary = document.querySelector('[data-testid="web-mod-response-delivery-summary"]')
    return {
      schemaVersion: 1,
      webDataPackImportPanelVisible: importPanel !== null,
      responseDeliverySummaryVisible: responseSummary !== null,
      responseDeliverySummaryText: text(responseSummary)
    }
  })()`,
  true
)

const waitForWebProductSurface = async (window, timeoutMs = 10_000) => {
  const deadline = Date.now() + timeoutMs
  let latest = null
  while (Date.now() < deadline) {
    latest = await readWebProductSurface(window)
    if (latest?.responseDeliverySummaryVisible === true) return latest
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  return latest
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
  const consoleMessages = []
  window.webContents.on('console-message', (_event, level, message, lineNumber, sourceId) => {
    consoleMessages.push({ level, message, lineNumber, sourceId })
    if (consoleMessages.length > 50) consoleMessages.shift()
  })
  await window.loadURL(targetUrl)
  const report = await waitForReport(window, consoleMessages)
  writeOutput({
    ...report,
    webProductSurface: await waitForWebProductSurface(window)
  })
  app.quit()
}).catch(fail)
