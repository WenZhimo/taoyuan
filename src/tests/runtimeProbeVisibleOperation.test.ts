import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

interface RuntimeProbeVisibleOperationModule {
  readonly isVisibleDataPackOperationRequested: (searchParams: URLSearchParams) => boolean
  readonly visibleDataPackOperationProbeParams: readonly string[]
}

const require = createRequire(import.meta.url)
const {
  isVisibleDataPackOperationRequested,
  visibleDataPackOperationProbeParams
} = require('../../scripts/runtime-probe-visible-operation.cjs') as RuntimeProbeVisibleOperationModule

describe('runtime probe visible operation detection', () => {
  it.each([
    'taoyuanThirdPartyVisibleImportProbe',
    'taoyuanThirdPartyVisibleImportRollbackProbe',
    'taoyuanThirdPartyVisibleImportFailureProbe',
    'taoyuanThirdPartyVisibleDisableProbe',
    'taoyuanThirdPartyVisibleUninstallProbe',
    'taoyuanThirdPartyVisibleEnableProbe',
    'taoyuanThirdPartyVisibleUpgradeProbe'
  ])('treats %s as a visible data-pack operation', paramName => {
    expect(
      isVisibleDataPackOperationRequested(new URLSearchParams([[paramName, '1']]))
    ).toBe(true)
  })

  it('ignores non-operation modifiers and disabled flags', () => {
    expect(
      isVisibleDataPackOperationRequested(new URLSearchParams([
        ['taoyuanThirdPartyVisibleArchiveImportProbe', '1'],
        ['taoyuanThirdPartyVisibleUpgradeProbe', '0']
      ]))
    ).toBe(false)
  })

  it('keeps the exported parameter list aligned with the detector', () => {
    const params = new URLSearchParams()
    for (const paramName of visibleDataPackOperationProbeParams) {
      params.set(paramName, '1')
    }

    expect(isVisibleDataPackOperationRequested(params)).toBe(true)
    expect(visibleDataPackOperationProbeParams).toContain(
      'taoyuanThirdPartyVisibleUpgradeProbe'
    )
  })
})
