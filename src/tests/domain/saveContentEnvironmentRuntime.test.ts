import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  createOfficialSaveContentEnvironment,
  createSaveContentEnvironment
} from '@/domain/save/saveContentEnvironment'
import {
  getCurrentSaveContentEnvironment,
  resetCurrentSaveContentEnvironmentForTests,
  setCurrentSaveContentEnvironment
} from '@/domain/save/saveContentEnvironmentRuntime'
import { useSaveStore } from '@/stores/useSaveStore'

describe('save content environment runtime publication', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    resetCurrentSaveContentEnvironmentForTests()
  })

  it('publishes a normalized environment for stores created after startup handoff', () => {
    const official = createOfficialSaveContentEnvironment()
    const published = createSaveContentEnvironment({
      gameVersion: official.gameVersion,
      engineApiVersion: official.engineApiVersion,
      contentSchemaVersion: official.contentSchemaVersion,
      loaderVersion: official.loaderVersion,
      contentCompilerVersion: official.contentCompilerVersion,
      schemaSetHash: official.schemaSetHash,
      cacheFormatVersion: official.cacheFormatVersion,
      trustPolicyVersion: official.trustPolicyVersion,
      packages: official.packages.map(pkg => ({
        ...pkg,
        configurationHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }))
    })

    expect(setCurrentSaveContentEnvironment(published)).toBe(true)
    expect(getCurrentSaveContentEnvironment()).toEqual(published)
    expect(Object.isFrozen(getCurrentSaveContentEnvironment())).toBe(true)
  })

  it('makes the published environment the initial Store environment', () => {
    const official = createOfficialSaveContentEnvironment()
    const published = createSaveContentEnvironment({
      gameVersion: official.gameVersion,
      engineApiVersion: official.engineApiVersion,
      contentSchemaVersion: official.contentSchemaVersion,
      loaderVersion: official.loaderVersion,
      contentCompilerVersion: official.contentCompilerVersion,
      schemaSetHash: official.schemaSetHash,
      cacheFormatVersion: official.cacheFormatVersion,
      trustPolicyVersion: official.trustPolicyVersion,
      packages: official.packages.map(pkg => ({
        ...pkg,
        configurationHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }))
    })

    expect(setCurrentSaveContentEnvironment(published)).toBe(true)
    expect(useSaveStore().contentEnvironment).toEqual(published)
  })

  it('rejects invalid publication without replacing the previous environment', () => {
    const official = createOfficialSaveContentEnvironment()
    expect(setCurrentSaveContentEnvironment(official)).toBe(true)

    expect(setCurrentSaveContentEnvironment({
      ...official,
      environmentHash: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })).toBe(false)
    expect(getCurrentSaveContentEnvironment()).toEqual(official)
  })
})
