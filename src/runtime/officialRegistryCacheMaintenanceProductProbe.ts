interface OfficialRegistryCacheMaintenanceBridge {
  readOfficialRegistryCache?: () => Promise<unknown>
}

type CacheMaintenanceWindow = Window & {
  electronAPI?: OfficialRegistryCacheMaintenanceBridge
}

export interface OfficialRegistryCacheMaintenanceProductProbeResult {
  readonly schemaVersion: 1
  readonly status: 'ready' | 'blocked'
  readonly reason: string
  readonly mainMenuPanelOpened: boolean
  readonly clearButtonClicked: boolean
  readonly clearResultVisible: boolean
  readonly cachePresentBefore: boolean
  readonly cachePresentAfter: boolean
}

const waitForCondition = async<T>(
  read: () => T | null | undefined | false,
  reason: string,
  timeoutMs = 15_000
): Promise<T> => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const value = read()
    if (value !== null && value !== undefined && value !== false) return value
    await new Promise<void>(resolve => window.setTimeout(resolve, 50))
  }
  throw new Error(reason)
}

const findButtonContainingText = (text: string): HTMLButtonElement | null =>
  [...document.querySelectorAll('button')]
    .find(button => button.textContent?.includes(text)) as HTMLButtonElement | undefined
    ?? null

export const runOfficialRegistryCacheMaintenanceProductProbe = async(): Promise<
  OfficialRegistryCacheMaintenanceProductProbeResult
> => {
  let mainMenuPanelOpened = false
  let clearButtonClicked = false
  let clearResultVisible = false
  let cachePresentBefore = false
  let cachePresentAfter = false
  try {
    const bridge = (window as CacheMaintenanceWindow).electronAPI
    if (typeof bridge?.readOfficialRegistryCache !== 'function') {
      throw new Error('official registry cache maintenance requires the Electron cache bridge')
    }
    const mainMenuButton = await waitForCondition(
      () => findButtonContainingText('数据包预检'),
      'cache maintenance probe could not find the MainMenu data-pack preflight button'
    )
    mainMenuButton.click()
    await waitForCondition(
      () => document.querySelector('[data-testid="web-data-pack-import-preflight-panel"]'),
      'cache maintenance probe could not open the data-pack preflight panel'
    )
    mainMenuPanelOpened = true
    cachePresentBefore = typeof await bridge.readOfficialRegistryCache() === 'string'
    if (!cachePresentBefore) throw new Error('official registry cache was not present before clearing')

    const clearButton = await waitForCondition(
      () => document.querySelector('[data-testid="official-registry-cache-clear"]') as HTMLButtonElement | null,
      'cache maintenance probe could not find the clear button'
    )
    clearButtonClicked = true
    clearButton.click()
    await waitForCondition(
      () => {
        const text = document.querySelector(
          '[data-testid="official-registry-cache-clear-result"]'
        )?.textContent ?? ''
        return text.includes('模组、设置、存档未改变') ? text : false
      },
      'cache maintenance probe did not render the successful clear result'
    )
    clearResultVisible = true
    cachePresentAfter = typeof await bridge.readOfficialRegistryCache() === 'string'
    if (cachePresentAfter) throw new Error('official registry cache remained after clearing')

    return Object.freeze({
      schemaVersion: 1 as const,
      status: 'ready' as const,
      reason: 'visible MainMenu panel cleared only the derived official registry cache',
      mainMenuPanelOpened,
      clearButtonClicked,
      clearResultVisible,
      cachePresentBefore,
      cachePresentAfter
    })
  } catch (error) {
    return Object.freeze({
      schemaVersion: 1 as const,
      status: 'blocked' as const,
      reason: error instanceof Error ? error.message : 'cache maintenance product probe failed',
      mainMenuPanelOpened,
      clearButtonClicked,
      clearResultVisible,
      cachePresentBefore,
      cachePresentAfter
    })
  }
}
