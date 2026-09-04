import type { PackageId } from './ids'
import type { ThirdPartyDataPackModManagementCommandId } from './thirdPartyDataPackModManagementReadModel'

export type ThirdPartyDataPackRuntimeCommandId =
  Extract<ThirdPartyDataPackModManagementCommandId, 'install' | 'disable' | 'uninstall'>

export const isThirdPartyDataPackRuntimeCommandId = (
  value: unknown
): value is ThirdPartyDataPackRuntimeCommandId =>
  value === 'install' || value === 'disable' || value === 'uninstall'

export const runtimeCommandTargetPackageId = (
  commandId: ThirdPartyDataPackRuntimeCommandId | undefined,
  selectedPackageIds: readonly PackageId[],
  blockedPackageIds: readonly PackageId[],
  explicitTargetPackageId?: PackageId
): PackageId | undefined => {
  if (commandId === 'uninstall') return explicitTargetPackageId
  if (commandId === 'disable') return blockedPackageIds[0]
  if (commandId === 'install') return selectedPackageIds[0]
  return undefined
}

export const runtimeCommandTargetMatchesPackageState = (
  commandId: ThirdPartyDataPackRuntimeCommandId | undefined,
  targetPackageId: PackageId | undefined,
  selectedPackageIds: readonly PackageId[],
  blockedPackageIds: readonly PackageId[],
  loadOrder: readonly PackageId[]
): boolean => {
  if (targetPackageId === undefined) return false
  if (commandId === 'install') {
    return selectedPackageIds.includes(targetPackageId)
      && loadOrder.includes(targetPackageId)
      && !blockedPackageIds.includes(targetPackageId)
  }
  if (commandId === 'disable') {
    return blockedPackageIds.includes(targetPackageId)
      && !selectedPackageIds.includes(targetPackageId)
      && !loadOrder.includes(targetPackageId)
  }
  if (commandId === 'uninstall') {
    return !selectedPackageIds.includes(targetPackageId)
      && !blockedPackageIds.includes(targetPackageId)
      && !loadOrder.includes(targetPackageId)
  }
  return false
}

export const runtimeCommandSuccessMessageKey = (
  commandId: ThirdPartyDataPackRuntimeCommandId
): string => `mods.ui.ipc.result.${commandId}.success`
