import { describe, expect, it } from 'vitest'

import {
  normalizeThirdPartyDataPackRuntimeCommandAppStartupHandoff,
  type ThirdPartyDataPackRuntimeCommandAppStartupHandoffAcknowledgement
} from '@/domain/mods/thirdPartyDataPackRuntimeCommandState'

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
})
