'use strict'

const visibleDataPackOperationProbeParams = Object.freeze([
  'taoyuanThirdPartyVisibleImportProbe',
  'taoyuanThirdPartyVisibleImportRollbackProbe',
  'taoyuanThirdPartyVisibleImportFailureProbe',
  'taoyuanThirdPartyVisibleDisableProbe',
  'taoyuanThirdPartyVisibleUninstallProbe',
  'taoyuanThirdPartyVisibleEnableProbe',
  'taoyuanThirdPartyVisibleUpgradeProbe'
])

const isVisibleDataPackOperationRequested = searchParams =>
  visibleDataPackOperationProbeParams.some(paramName => searchParams.get(paramName) === '1')

module.exports = {
  isVisibleDataPackOperationRequested,
  visibleDataPackOperationProbeParams
}
