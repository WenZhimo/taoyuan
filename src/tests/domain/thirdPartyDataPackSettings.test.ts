import { describe, expect, it } from 'vitest'
import {
  resolveInstallationPackageSettings,
  validatePackageSettingDefinitions
} from '@/domain/mods/thirdPartyDataPackSettings'
import type { PackageId } from '@/domain/mods/ids'

const packageId = 'example_pack' as PackageId

describe('third-party data pack settings', () => {
  it('validates definitions, applies installation defaults and excludes save-scoped values', () => {
    const definitions = validatePackageSettingDefinitions([
      {
        id: 'example_pack:save_note',
        scope: 'save',
        default: 'save-only',
        schema: { type: 'string' }
      },
      {
        id: 'example_pack:spawn_rate',
        scope: 'installation',
        default: 2,
        schema: { type: 'integer', minimum: 1 }
      }
    ], {
      packageId
    })

    expect(definitions.ok).toBe(true)
    if (!definitions.ok) return

    const resolved = resolveInstallationPackageSettings(definitions.definitions, undefined, {
      packageId
    })
    expect(resolved).toMatchObject({
      ok: true,
      values: { 'example_pack:spawn_rate': 2 }
    })
    if (!resolved.ok) return
    expect(resolved.values).not.toHaveProperty('example_pack:save_note')
  })

  it('changes the identity for an explicit installation value and rejects unknown values', () => {
    const definitions = validatePackageSettingDefinitions([{
      id: 'example_pack:spawn_rate',
      scope: 'installation',
      default: 2,
      schema: { type: 'integer', minimum: 1 }
    }])
    expect(definitions.ok).toBe(true)
    if (!definitions.ok) return

    const defaults = resolveInstallationPackageSettings(definitions.definitions, undefined)
    const explicit = resolveInstallationPackageSettings(definitions.definitions, {
      'example_pack:spawn_rate': 7
    })
    const unknown = resolveInstallationPackageSettings(definitions.definitions, {
      'example_pack:not_declared': true
    })

    expect(defaults.ok).toBe(true)
    expect(explicit.ok).toBe(true)
    if (defaults.ok && explicit.ok) {
      expect(explicit.configurationHash).not.toBe(defaults.configurationHash)
    }
    expect(unknown).toMatchObject({ ok: false })
    if (!unknown.ok) {
      expect(unknown.diagnostics[0]).toMatchObject({ code: 'CFG-SCOPE-001' })
    }
  })

  it('rejects defaults that do not satisfy their declared JSON schema', () => {
    const result = validatePackageSettingDefinitions([{
      id: 'example_pack:spawn_rate',
      scope: 'installation',
      default: 'wrong',
      schema: { type: 'integer' }
    }], {
      packageId
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.diagnostics[0]).toMatchObject({
      code: 'SCHEMA-VALIDATE-001',
      packageId: 'example_pack'
    })
  })
})
