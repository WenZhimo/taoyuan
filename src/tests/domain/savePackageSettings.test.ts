import { describe, expect, it } from 'vitest'
import {
  createEmptyPersistedPackageSettings,
  normalizePersistedPackageSettings,
  SavePackageSettingsError
} from '@/domain/save/savePackageSettings'
import type { PackageId } from '@/domain/mods/ids'

const packageId = 'example_pack' as PackageId
const settingId = 'example_pack:feature_enabled'

describe('persisted package settings', () => {
  it('keeps unknown package settings as an immutable save-owned container', () => {
    const normalized = normalizePersistedPackageSettings({
      [packageId]: {
        schemaVersion: '2',
        values: {
          [settingId]: { enabled: true, choices: ['a', 2] }
        }
      }
    })

    expect(normalized[packageId]).toEqual({
      schemaVersion: '2',
      values: { [settingId]: { enabled: true, choices: ['a', 2] } }
    })
    expect(Object.isFrozen(normalized)).toBe(true)
    expect(Object.isFrozen(normalized[packageId])).toBe(true)
    expect(Object.isFrozen(normalized[packageId]?.values)).toBe(true)
  })

  it('uses an empty container when the root field is absent', () => {
    const normalized = normalizePersistedPackageSettings(undefined)

    expect(normalized).toEqual(createEmptyPersistedPackageSettings())
    expect(Object.isFrozen(normalized)).toBe(true)
  })

  it.each([
    ['invalid package ID', { Bad: { schemaVersion: '1', values: {} } }],
    ['non-object entry', { [packageId]: null }],
    ['missing schema version', { [packageId]: { schemaVersion: '', values: {} } }],
    ['unknown entry field', { [packageId]: { schemaVersion: '1', values: {}, extra: true } }],
    ['non-namespaced setting ID', { [packageId]: { schemaVersion: '1', values: { enabled: true } } }],
    ['non-JSON value', { [packageId]: { schemaVersion: '1', values: { [settingId]: undefined } } }]
  ])('rejects %s without accepting the candidate', (_reason, value) => {
    expect(() => normalizePersistedPackageSettings(value)).toThrow(SavePackageSettingsError)
  })

  it('provides a stable diagnostic for invalid settings', () => {
    try {
      normalizePersistedPackageSettings({
        [packageId]: { schemaVersion: '1', values: { [settingId]: undefined } }
      })
      throw new Error('Expected invalid package settings to be rejected')
    } catch (error) {
      expect(error).toMatchObject({
        name: 'SavePackageSettingsError',
        diagnostics: [expect.objectContaining({ code: 'SAVE-PACKAGE-SETTINGS-001' })]
      })
    }
  })
})
