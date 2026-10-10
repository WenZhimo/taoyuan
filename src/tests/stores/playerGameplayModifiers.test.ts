import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { PackageManifest } from '@/domain/mods/schemas'
import {
  publishThirdPartyGameplayModifiers,
  resetThirdPartyGameplayModifiersForTests
} from '@/domain/mods/thirdPartyGameplayModifiers'
import { usePlayerStore } from '@/stores/usePlayerStore'

const manifest: PackageManifest = {
  id: 'gameplay_test_pack',
  name: { key: 'gameplay_test_pack.name', fallback: 'Gameplay test pack' },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'test' }],
  license: 'MIT',
  gameplayModifiers: { unlimitedMoney: true },
  entrypoints: {}
}

describe('player store gameplay modifiers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    publishThirdPartyGameplayModifiers([manifest])
  })

  afterEach(() => {
    resetThirdPartyGameplayModifiersForTests()
  })

  it('allows spending without reducing the published money balance', () => {
    const playerStore = usePlayerStore()
    playerStore.setMoney(500)

    expect(playerStore.spendMoney(500000)).toBe(true)
    expect(playerStore.money).toBe(500)
  })

  it('does not apply the pass-out money penalty while unlimited money is active', () => {
    const playerStore = usePlayerStore()
    playerStore.setMoney(500)

    expect(playerStore.dailyReset('passout')).toMatchObject({
      moneyLost: 0
    })
    expect(playerStore.money).toBe(500)
  })
})
