import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import { createCanonicalFileManifestHash, hashCanonicalJson, hashPayloadJson } from '@/domain/mods/hash'
import { requirePackageId, toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import {
  Registry,
  RegistryError,
  createSerializableRegistrySnapshot,
  registerEntriesInChunks
} from '@/domain/mods/registry'
import { compileSchema, validateUnknown } from '@/domain/mods/schemaValidation'
import { ItemDefSchema, PUBLIC_JSON_SCHEMAS, PackageManifestSchema, type ItemDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import hashGoldenVectors from '../fixtures/mods/hash-golden-vectors.json'
import invalidItems from '../fixtures/mods/minimal-invalid-package/data/items.json'
import invalidManifest from '../fixtures/mods/minimal-invalid-package/manifest.json'
import validItems from '../fixtures/mods/minimal-valid-package/data/items.json'
import validManifest from '../fixtures/mods/minimal-valid-package/manifest.json'
import officialContentSnapshot from '../fixtures/mods/official-content-snapshot.json'

interface HashGoldenVectors {
  vectors: {
    objectKeyOrder: {
      inputA: unknown
      inputB: unknown
      expected: string
    }
    pathNormalization: {
      inputA: Parameters<typeof createCanonicalFileManifestHash>[0]
      inputB: Parameters<typeof createCanonicalFileManifestHash>[0]
      expected: string
    }
    lineEndings: {
      lf: string
      crlf: string
    }
    payloadJson: {
      input: string
      expected: string
    }
  }
}

describe('mod registry contracts', () => {
  it('keeps canonical hash golden vectors stable', () => {
    const { vectors } = hashGoldenVectors as HashGoldenVectors

    expect(hashCanonicalJson(vectors.objectKeyOrder.inputA)).toBe(vectors.objectKeyOrder.expected)
    expect(hashCanonicalJson(vectors.objectKeyOrder.inputB)).toBe(vectors.objectKeyOrder.expected)
    expect(createCanonicalFileManifestHash(vectors.pathNormalization.inputA)).toBe(vectors.pathNormalization.expected)
    expect(createCanonicalFileManifestHash(vectors.pathNormalization.inputB)).toBe(vectors.pathNormalization.expected)
    expect(hashPayloadJson('a\nb\n')).toBe(vectors.lineEndings.lf)
    expect(hashPayloadJson('a\r\nb\r\n')).toBe(vectors.lineEndings.crlf)
    expect(hashPayloadJson(vectors.payloadJson.input)).toBe(vectors.payloadJson.expected)
  })

  it('validates public schemas and reports schema diagnostics for invalid JSON', () => {
    for (const [file, schema] of Object.entries(PUBLIC_JSON_SCHEMAS)) {
      const compiled = compileSchema(schema, { stage: 'test.schema', file })
      expect(compiled.ok, file).toBe(true)
    }

    expect(validateUnknown(PackageManifestSchema, validManifest, { stage: 'test.manifest' }).ok).toBe(true)

    const invalidManifestResult = validateUnknown(PackageManifestSchema, invalidManifest, { stage: 'test.manifest' })
    expect(invalidManifestResult.ok).toBe(false)
    if (!invalidManifestResult.ok) {
      expect(invalidManifestResult.diagnostics.every(diagnostic => diagnostic.code === 'SCHEMA-VALIDATE-001')).toBe(true)
    }

    expect(validateUnknown(Type.Array(ItemDefSchema), validItems, { stage: 'test.items' }).ok).toBe(true)

    const invalidItemResult = validateUnknown(Type.Array(ItemDefSchema), invalidItems, { stage: 'test.items' })
    expect(invalidItemResult.ok).toBe(false)
    if (!invalidItemResult.ok) {
      expect(invalidItemResult.diagnostics.map(diagnostic => diagnostic.code)).toContain('SCHEMA-VALIDATE-001')
    }
  })

  it('enforces registry lifecycle rules and supports chunked registration', async() => {
    const owner = requirePackageId('test_mod')
    const registry = new Registry<ItemDef>({
      registryId: toOfficialRegistryTypeId('item'),
      description: 'test items',
      schemaName: 'item.schema.json'
    })
    const item: ItemDef = {
      id: toOfficialContentId('test_item'),
      name: { key: 'test.item.name', fallback: 'Test Item' },
      category: 'misc',
      description: { key: 'test.item.description', fallback: 'Test item' },
      sellPrice: 1,
      edible: false
    }

    registry.register(owner, item)
    expect(registry.has(toOfficialContentId('test_item'))).toBe(true)

    expect(() => registry.register(owner, item)).toThrow(RegistryError)
    registry.freeze()
    const frozenItem = { ...item, id: toOfficialContentId('other_item') }
    expect(() => registry.register(owner, frozenItem)).toThrow(RegistryError)

    const bulkRegistry = new Registry({
      registryId: toOfficialRegistryTypeId('bulk'),
      description: 'bulk test entries',
      schemaName: 'bulk.schema.json'
    })
    const entries = Array.from({ length: 2500 }, (_, index) => ({ id: toOfficialContentId(`bulk/${index}`) }))
    const progress: number[] = []
    let yields = 0

    await registerEntriesInChunks(bulkRegistry, owner, entries, {
      chunkSize: 1000,
      onProgress: processed => progress.push(processed),
      yieldToMain: async() => {
        yields += 1
      }
    })

    expect(progress).toEqual([1000, 2000, 2500])
    expect(yields).toBe(3)
    expect(bulkRegistry.has(toOfficialContentId('bulk/2499'))).toBe(true)
  })

  it('keeps the official static registry snapshot semantically valid and stable', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const diagnostics = validateRegistrySemantics(registrySet)
    expect(diagnostics).toEqual([])

    const snapshot = createSerializableRegistrySnapshot(registrySet)
    expect(snapshot.snapshotHash).toBe(officialContentSnapshot.snapshotHash)
  })
})
