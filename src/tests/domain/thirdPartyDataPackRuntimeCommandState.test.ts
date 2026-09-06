import { describe, expect, it } from 'vitest'

import {
  normalizeThirdPartyDataPackRuntimeCommandAppStartupHandoff,
  runtimeCommandTargetPackageId,
  type ThirdPartyDataPackRuntimeCommandAppStartupHandoffAcknowledgement
} from '@/domain/mods/thirdPartyDataPackRuntimeCommandState'
import type { PackageId } from '@/domain/mods/ids'

describe('third-party data-pack runtime command state', () => {
  it('keeps legacy boolean acceptance separate from real mounted app-startup evidence', () => {
    expect(normalizeThirdPartyDataPackRuntimeCommandAppStartupHandoff(true)).toEqual({
      appStartupHandoffAccepted: true,
      realAppStartupHostCalled: false,
      gameAppCreated: false,
      piniaCreated: false,
      routerMounted: false
    })
  })

  it('requires explicit real host evidence before surfacing mounted app-startup fields', () => {
    const summary = normalizeThirdPartyDataPackRuntimeCommandAppStartupHandoff(Object.freeze({
      realAppStartupHostCalled: true,
      gameAppCreated: true,
      piniaCreated: true,
      routerMounted: true
    }))

    expect(summary).toEqual({
      appStartupHandoffAccepted: true,
      realAppStartupHostCalled: true,
      gameAppCreated: true,
      piniaCreated: true,
      routerMounted: true
    })
  })

  it('does not promote startup bootstrap flags into real mounted app-startup host evidence', () => {
    const looseAcknowledgement = Object.freeze({
      officialContentBootstrapped: true,
      runtimeContentRegistryPublished: true,
      gameAppCreated: true,
      piniaCreated: true,
      routerMounted: true
    }) as unknown as ThirdPartyDataPackRuntimeCommandAppStartupHandoffAcknowledgement

    expect(normalizeThirdPartyDataPackRuntimeCommandAppStartupHandoff(looseAcknowledgement)).toEqual({
      appStartupHandoffAccepted: false,
      realAppStartupHostCalled: false,
      gameAppCreated: false,
      piniaCreated: false,
      routerMounted: false
    })
  })

  it('uses the explicit target when install selection includes dependency packages first', () => {
    const dependencyPackageId = 'a_dependency_pack' as PackageId
    const targetPackageId = 'z_player_selected_pack' as PackageId

    expect(runtimeCommandTargetPackageId(
      'install',
      [dependencyPackageId, targetPackageId],
      [],
      targetPackageId
    )).toBe(targetPackageId)
  })

  it('falls back to the selected package for legacy install targets without explicit identity', () => {
    const packageId = 'legacy_install_pack' as PackageId

    expect(runtimeCommandTargetPackageId('install', [packageId], [])).toBe(packageId)
  })
})
