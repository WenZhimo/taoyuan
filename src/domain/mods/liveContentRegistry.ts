import * as officialContentBootstrap from './officialContentBootstrap'
import type { RegistrySet } from './registry'
import {
  createThirdPartyDataPackInMemoryLiveRegistryReference,
  type ThirdPartyDataPackInMemoryLiveRegistryReference
} from './thirdPartyDataPackLiveRegistrySwapHost'

let liveContentRegistryReference: ThirdPartyDataPackInMemoryLiveRegistryReference | null = null
let officialBaselineRegistrySet: RegistrySet | null = null

export const publishOfficialContentRegistrySet = (
  registrySet: RegistrySet
): ThirdPartyDataPackInMemoryLiveRegistryReference => {
  if (liveContentRegistryReference === null || officialBaselineRegistrySet !== registrySet) {
    liveContentRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(registrySet)
    officialBaselineRegistrySet = registrySet
  }
  return liveContentRegistryReference
}

export const getLiveContentRegistryReference = (): ThirdPartyDataPackInMemoryLiveRegistryReference =>
  liveContentRegistryReference ?? publishOfficialContentRegistrySet(
    officialContentBootstrap.getOfficialRegistrySet()
  )

export const getOfficialBaselineContentRegistrySet = (): RegistrySet =>
  officialBaselineRegistrySet ?? officialContentBootstrap.getOfficialRegistrySet()

export const getCurrentContentRegistrySet = (): RegistrySet =>
  liveContentRegistryReference?.current ?? officialContentBootstrap.getOfficialRegistrySet()

export const resetLiveContentRegistryForTests = (): void => {
  liveContentRegistryReference = null
  officialBaselineRegistrySet = null
}
