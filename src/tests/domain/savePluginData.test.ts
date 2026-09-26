import { describe, expect, it } from 'vitest'
import {
  createEmptyPersistedPluginData,
  normalizePersistedPluginData,
  SavePluginDataError
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

  it('uses an empty immutable container when pluginData is absent', () => {
    const normalized = normalizePersistedPluginData(undefined)

    expect(normalized).toEqual(createEmptyPersistedPluginData())
    expect(Object.isFrozen(normalized)).toBe(true)
  })
})
