import { describe, expect, it } from 'vitest'
import {
  createEmptyPersistedPluginData,
  MAX_PLUGIN_DATA_GROWTH_BYTES,
  MAX_PLUGIN_DATA_JSON_DEPTH,
  MAX_PLUGIN_DATA_JSON_NODES,
  MAX_PLUGIN_DATA_TOTAL_BYTES,
  MAX_PLUGIN_PAYLOAD_BYTES,
  replacePersistedPluginDataForOwner,
  migratePersistedPluginDataForOwners,
  normalizePersistedPluginData,
  SavePluginDataError,
  type PluginSaveDataOwner
} from '@/domain/save/savePluginData'
import { hashPayloadJson } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'

const packageId = 'example_pack' as PackageId

const createEnvelope = (payloadJson = '{"name":"桃"}') => ({
  schemaVersion: '1',
  encoding: 'json' as const,
  payloadJson,
  payloadHash: hashPayloadJson(payloadJson)
})

describe('persisted plugin data', () => {
  it('keeps a valid envelope and its original JSON string', () => {
    const payloadJson = '{"z":1,"message":"保留原始 Unicode"}'
    const input = { [packageId]: createEnvelope(payloadJson) }

    const normalized = normalizePersistedPluginData(input)

    expect(normalized[packageId]).toEqual({
      schemaVersion: '1',
      encoding: 'json',
      payloadJson,
      payloadHash: hashPayloadJson(payloadJson)
    })
    expect(normalized[packageId]?.payloadJson).toBe(payloadJson)
    expect(input).toEqual({ [packageId]: createEnvelope(payloadJson) })
  })

  it('hashes UTF-8 payload bytes rather than JavaScript code units', () => {
    const payloadJson = '{"emoji":"😀","text":"桃源"}'
    const normalized = normalizePersistedPluginData({
      [packageId]: createEnvelope(payloadJson)
    })

    expect(normalized[packageId]?.payloadHash).toBe(hashPayloadJson(payloadJson))
    expect(normalized[packageId]?.payloadHash).not.toBe(hashPayloadJson('{"emoji":"?","text":"桃源"}'))
  })

  it.each([
    ['invalid package ID', { Bad: createEnvelope() }],
    ['non-object container', []],
    ['non-object envelope', { [packageId]: null }],
    ['unknown envelope field', { [packageId]: { ...createEnvelope(), extra: true } }],
    ['missing schema version', { [packageId]: { ...createEnvelope(), schemaVersion: '' } }],
    ['unsupported encoding', { [packageId]: { ...createEnvelope(), encoding: 'json-lines' } }],
    ['invalid JSON payload', { [packageId]: { ...createEnvelope('not-json') } }],
    ['missing payload hash', { [packageId]: { ...createEnvelope(), payloadHash: undefined } }],
    ['mismatched payload hash', { [packageId]: { ...createEnvelope(), payloadHash: hashPayloadJson('{}') } }]
  ])('rejects %s without accepting the candidate', (_reason, value) => {
    expect(() => normalizePersistedPluginData(value)).toThrow(SavePluginDataError)
  })

  it('provides a stable diagnostic for a rejected envelope', () => {
    try {
      normalizePersistedPluginData({ [packageId]: { ...createEnvelope(), extra: true } })
      throw new Error('Expected invalid plugin data to be rejected')
    } catch (error) {
      expect(error).toMatchObject({
        name: 'SavePluginDataError',
        diagnostics: [{ code: 'SAVE-PLUGIN-DATA-001' }]
      })
    }
  })

  it('rejects payloads that exceed the per-plugin byte quota', () => {
    const payloadJson = JSON.stringify('a'.repeat(MAX_PLUGIN_PAYLOAD_BYTES - 1))

    expect(() => normalizePersistedPluginData({
      [packageId]: createEnvelope(payloadJson)
    })).toThrow(SavePluginDataError)
  })

  it('rejects payloads that exceed JSON depth and node quotas', () => {
    let deepJson = '0'
    for (let depth = 0; depth <= MAX_PLUGIN_DATA_JSON_DEPTH; depth += 1) {
      deepJson = `[${deepJson}]`
    }
    expect(() => normalizePersistedPluginData({
      [packageId]: createEnvelope(deepJson)
    })).toThrow(SavePluginDataError)

    const manyNodes = JSON.stringify(Array.from({ length: MAX_PLUGIN_DATA_JSON_NODES + 1 }, () => 0))
    expect(() => normalizePersistedPluginData({
      [packageId]: createEnvelope(manyNodes)
    })).toThrow(SavePluginDataError)
  })

  it('rejects total plugin data and single-write growth overages', () => {
    const payloadJson = JSON.stringify('a'.repeat(MAX_PLUGIN_PAYLOAD_BYTES - 2))
    const totalOverage = Object.fromEntries(
      Array.from({
        length: Math.floor(MAX_PLUGIN_DATA_TOTAL_BYTES / MAX_PLUGIN_PAYLOAD_BYTES) + 1
      }, (_, index) => [`pack_${index}`, createEnvelope(payloadJson)])
    )
    expect(() => normalizePersistedPluginData(totalOverage)).toThrow(SavePluginDataError)

    const previous = normalizePersistedPluginData({
      [packageId]: createEnvelope('""')
    })
    expect(() => normalizePersistedPluginData({
      [packageId]: createEnvelope(JSON.stringify('a'.repeat(MAX_PLUGIN_DATA_GROWTH_BYTES + 1)))
    }, { previous, enforceGrowth: true })).toThrow(SavePluginDataError)
  }, 30_000)

  it('allows importing an existing payload larger than the per-write growth quota', () => {
    const payloadJson = JSON.stringify('a'.repeat(MAX_PLUGIN_DATA_GROWTH_BYTES + 1))

    expect(normalizePersistedPluginData({
      [packageId]: createEnvelope(payloadJson)
    })[packageId]?.payloadJson).toBe(payloadJson)
  }, 30_000)

  it('uses an empty immutable container when pluginData is absent', () => {
    const normalized = normalizePersistedPluginData(undefined)

    expect(normalized).toEqual(createEmptyPersistedPluginData())
    expect(Object.isFrozen(normalized)).toBe(true)
  })

  it('migrates and validates only data owned by a registered plugin', () => {
    const owner: PluginSaveDataOwner = {
      packageId,
      schemaVersion: '2',
      validate: payload => {
        if (
          payload === null ||
          typeof payload !== 'object' ||
          !('migrated' in payload) ||
          (payload as { migrated?: unknown }).migrated !== true
        ) throw new Error('migrated marker is required')
      },
      migrations: [{
        fromSchemaVersion: '1',
        toSchemaVersion: '2',
        migrate: payload => ({
          ...(payload as Record<string, unknown>),
          migrated: true
        })
      }]
    }
    const payloadJson = '{"name":"桃","order":[2,1]}'
    const input = {
      [packageId]: createEnvelope(payloadJson)
    }

    const migrated = normalizePersistedPluginData(input, { owners: [owner] })

    expect(migrated[packageId]).toMatchObject({
      schemaVersion: '2',
      encoding: 'json'
    })
    expect(JSON.parse(migrated[packageId]!.payloadJson)).toEqual({
      name: '桃',
      order: [2, 1],
      migrated: true
    })
    expect(input).toEqual({ [packageId]: createEnvelope(payloadJson) })
  })

  it('keeps an unowned envelope byte-for-byte opaque', () => {
    const payloadJson = '{"z":1,"a":[2,1]}'
    const input = normalizePersistedPluginData({
      [packageId]: createEnvelope(payloadJson)
    })
    const otherOwner: PluginSaveDataOwner = {
      packageId: 'other_pack' as PackageId,
      schemaVersion: '1',
      validate: () => undefined
    }

    const preserved = migratePersistedPluginDataForOwners(input, [otherOwner])

    expect(preserved[packageId]?.payloadJson).toBe(payloadJson)
    expect(preserved[packageId]?.payloadHash).toBe(hashPayloadJson(payloadJson))
  })

  it('rejects a missing migration path or failed Schema without changing the candidate', () => {
    const input = normalizePersistedPluginData({
      [packageId]: createEnvelope()
    })
    const ownerWithoutMigration: PluginSaveDataOwner = {
      packageId,
      schemaVersion: '2',
      validate: () => undefined
    }

    expect(() => migratePersistedPluginDataForOwners(input, [ownerWithoutMigration])).toThrow(SavePluginDataError)
    expect(input[packageId]?.schemaVersion).toBe('1')

    const rejectingOwner: PluginSaveDataOwner = {
      packageId,
      schemaVersion: '1',
      validate: () => false
    }
    expect(() => migratePersistedPluginDataForOwners(input, [rejectingOwner])).toThrow(SavePluginDataError)
    expect(input[packageId]?.payloadJson).toBe('{"name":"桃"}')
  })

  it('replaces only the envelope owned by the calling plugin', () => {
    const secondPackageId = 'other_pack' as PackageId
    const current = normalizePersistedPluginData({
      [packageId]: createEnvelope('{"first":true}'),
      [secondPackageId]: {
        ...createEnvelope('{"second":true}'),
        schemaVersion: '4'
      }
    })
    const owner: PluginSaveDataOwner = {
      packageId,
      schemaVersion: '2',
      validate: () => undefined
    }

    const updated = replacePersistedPluginDataForOwner(current, owner, { first: false })

    expect(JSON.parse(updated[packageId]!.payloadJson)).toEqual({ first: false })
    expect(updated[secondPackageId]).toEqual(current[secondPackageId])
  })
})
