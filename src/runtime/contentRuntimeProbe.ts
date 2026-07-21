import {
  createOfficialContentRuntimeReport,
  type OfficialContentRuntimeReport
} from '@/domain/mods/officialContentRuntimeReport'

export interface ContentRuntimeProbeEnvelope {
  schemaVersion: 1
  runtime: OfficialContentRuntimeReport
  ui: {
    documentTitle: string
    locationProtocol: string
    mainMenuReady: boolean
    startupFailureVisible: boolean
  }
}

interface ElectronRuntimeProbeReporter {
  reportContentRuntimeProbe?: (report: ContentRuntimeProbeEnvelope) => void
}

type ProbeWindow = Window & {
  electronAPI?: ElectronRuntimeProbeReporter
  __TAOYUAN_CONTENT_RUNTIME_REPORT__?: ContentRuntimeProbeEnvelope
}

export const isContentRuntimeProbeRequested = (
  search: string = typeof location === 'undefined' ? '' : location.search
): boolean => new URLSearchParams(search).get('taoyuanContentProbe') === '1'

export const publishContentRuntimeProbe = (): ContentRuntimeProbeEnvelope | null => {
  if (!isContentRuntimeProbeRequested() || typeof window === 'undefined') return null

  const buttonTexts = [...document.querySelectorAll('button')]
    .map(button => button.textContent?.trim() ?? '')
  const report: ContentRuntimeProbeEnvelope = {
    schemaVersion: 1,
    runtime: createOfficialContentRuntimeReport(),
    ui: {
      documentTitle: document.title,
      locationProtocol: location.protocol,
      mainMenuReady: ['新的旅程', '导入存档', '关于游戏']
        .every(label => buttonTexts.includes(label)),
      startupFailureVisible: document.querySelector('.startup-failure') !== null
    }
  }

  const probeWindow = window as ProbeWindow
  Object.defineProperty(probeWindow, '__TAOYUAN_CONTENT_RUNTIME_REPORT__', {
    value: report,
    configurable: true
  })
  probeWindow.electronAPI?.reportContentRuntimeProbe?.(report)
  return report
}
