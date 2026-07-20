import { describe, expect, it } from 'vitest'
import { hashCanonicalJson } from '@/domain/mods/hash'
import { requirePackageId, toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import {
  RegistrySet,
  RegistrySnapshotError,
  createSerializableRegistrySnapshot,
  restoreRegistrySetFromSnapshot,
  type RegistryDefinition,
  type RegistryEntry
} from '@/domain/mods/registry'

interface MutableSnapshot {
  formatVersion: number
  registries: Array<{
    registryId: string
    schemaName: string
    entries: Array<{
      owner: string
      source: { packageId: string; file?: string; localId?: string }
      entry: Record<string, unknown>
    }>
  }>
  snapshotHash: string
}

const registryId = toOfficialRegistryTypeId('snapshot_order_test')
const definition: RegistryDefinition<RegistryEntry> = {
  registryId,
  description: 'snapshot order test',
  schemaName: 'snapshot-order-test.schema.json'
}
const definitions = [definition]
const owner = requirePackageId('snapshot_test')

const cloneMutable = (value: unknown): MutableSnapshot =>
  JSON.parse(JSON.stringify(value)) as MutableSnapshot

const rehash = (snapshot: MutableSnapshot): MutableSnapshot => {
  snapshot.snapshotHash = hashCanonicalJson({
    formatVersion: snapshot.formatVersion,
    registries: snapshot.registries
  })
  return snapshot
}

const buildSet = (order: readonly string[]): RegistrySet => {
  const set = new RegistrySet()
  const registry = set.defineRegistry(definition)
  set.freezeDefinitions()
  for (const localId of order) {
    const entry: RegistryEntry & { label: string } = {
      id: toOfficialContentId(`snapshot/${localId}`),
      label: localId
    }
    registry.register(owner, entry, {
      file: 'data/snapshot-order.json',
      localId
    })
  }
  set.freezeEntries()
  return set
}

const expectSnapshotError = (value: unknown, kind: RegistrySnapshotError['kind']): RegistrySnapshotError => {
  try {
    restoreRegistrySetFromSnapshot(definitions, value)
  } catch (error) {
    expect(error).toBeInstanceOf(RegistrySnapshotError)
    expect((error as RegistrySnapshotError).kind).toBe(kind)
    return error as RegistrySnapshotError
  }
  throw new Error(`Expected registry snapshot error: ${kind}`)
}

describe('registry snapshot v2 order-preserving codec', () => {
  it('preserves z, a, m registration order through create, restore, and recreate', () => {
    const built = buildSet(['z', 'a', 'm'])
    const snapshot = createSerializableRegistrySnapshot(built)

    expect(snapshot.formatVersion).toBe(2)
    expect(snapshot.registries[0]?.entries.map(record => record.entry.id)).toEqual([
      'taoyuan:snapshot/z',
      'taoyuan:snapshot/a',
      'taoyuan:snapshot/m'
    ])

    const restored = restoreRegistrySetFromSnapshot(definitions, snapshot as unknown)
    const builtRegistry = built.get<RegistryEntry>(registryId)
    const restoredRegistry = restored.get<RegistryEntry>(registryId)

    expect(restored.registryIds()).toEqual(built.registryIds())
    expect(restoredRegistry.entries()).toEqual(builtRegistry.entries())
    expect(restoredRegistry.values()).toEqual(builtRegistry.values())
    expect(restoredRegistry.entries().map(record => record.owner)).toEqual([owner, owner, owner])
    expect(restoredRegistry.entries().map(record => record.source)).toEqual(builtRegistry.entries().map(record => record.source))
    expect(restoredRegistry.isFrozen).toBe(true)
    expect(createSerializableRegistrySnapshot(restored)).toEqual(snapshot)
  })

  it('includes entry order in snapshotHash and restores the declared order', () => {
    const original = createSerializableRegistrySnapshot(buildSet(['z', 'a', 'm']))
    const reordered = rehash(cloneMutable(original))
    reordered.registries[0]!.entries.reverse()
    rehash(reordered)

    expect(reordered.snapshotHash).not.toBe(original.snapshotHash)
    expect(restoreRegistrySetFromSnapshot(definitions, reordered).get<RegistryEntry>(registryId).values().map(entry => entry.id))
      .toEqual(['taoyuan:snapshot/m', 'taoyuan:snapshot/a', 'taoyuan:snapshot/z'])

    const independentlyBuilt = createSerializableRegistrySnapshot(buildSet(['m', 'a', 'z']))
    expect(reordered).toEqual(independentlyBuilt)
  })

  it('rejects content, order, and hash tampering before restoration', () => {
    const snapshot = createSerializableRegistrySnapshot(buildSet(['z', 'a', 'm']))

    const contentTampered = cloneMutable(snapshot)
    contentTampered.registries[0]!.entries[0]!.entry.label = 'changed'
    expectSnapshotError(contentTampered, 'hash')

    const orderTampered = cloneMutable(snapshot)
    orderTampered.registries[0]!.entries.reverse()
    expectSnapshotError(orderTampered, 'hash')

    const hashTampered = cloneMutable(snapshot)
    hashTampered.snapshotHash = `sha256:${'0'.repeat(64)}`
    expectSnapshotError(hashTampered, 'hash')
  })

  it('rejects v1 and malformed non-JSON or unsafe path inputs explicitly', () => {
    const snapshot = cloneMutable(createSerializableRegistrySnapshot(buildSet(['z', 'a', 'm'])))

    const v1 = rehash(cloneMutable(snapshot))
    v1.formatVersion = 1
    rehash(v1)
    const versionError = expectSnapshotError(v1, 'format-version')
    expect(versionError.diagnostics[0]?.code).toBe('CACHE-INVALID-001')

    const missingFormat = cloneMutable(snapshot) as MutableSnapshot & { formatVersion?: number }
    Reflect.deleteProperty(missingFormat, 'formatVersion')
    expectSnapshotError(missingFormat, 'structure')

    const missingEntry = cloneMutable(snapshot)
    delete (missingEntry.registries[0]!.entries[0] as { entry?: Record<string, unknown> }).entry
    expectSnapshotError(missingEntry, 'structure')

    const invalidEntryId = cloneMutable(snapshot)
    invalidEntryId.registries[0]!.entries[0]!.entry.id = 'not-namespaced'
    expectSnapshotError(invalidEntryId, 'structure')

    const absolutePath = cloneMutable(snapshot)
    absolutePath.registries[0]!.entries[0]!.source.file = 'C:\\private\\snapshot.json'
    expectSnapshotError(absolutePath, 'structure')

    const functionEntry = cloneMutable(snapshot)
    functionEntry.registries[0]!.entries[0]!.entry.runtime = () => true
    expectSnapshotError(functionEntry, 'structure')

    const dateEntry = cloneMutable(snapshot)
    dateEntry.registries[0]!.entries[0]!.entry.runtime = new Date(0)
    expectSnapshotError(dateEntry, 'structure')

    const cyclicEntry = cloneMutable(snapshot)
    cyclicEntry.registries[0]!.entries[0]!.entry.runtime = cyclicEntry
    expectSnapshotError(cyclicEntry, 'structure')
  })

  it('rejects invalid registry sets, schemas, owners, and duplicate entries with valid hashes', () => {
    const snapshot = createSerializableRegistrySnapshot(buildSet(['z', 'a', 'm']))

    const duplicateRegistry = cloneMutable(snapshot)
    duplicateRegistry.registries.push(cloneMutable(snapshot).registries[0]!)
    expectSnapshotError(rehash(duplicateRegistry), 'registry-set')

    const missingRegistry = cloneMutable(snapshot)
    missingRegistry.registries = []
    expectSnapshotError(rehash(missingRegistry), 'registry-set')

    const unknownRegistry = cloneMutable(snapshot)
    unknownRegistry.registries[0]!.registryId = 'taoyuan:unknown_snapshot_registry'
    expectSnapshotError(rehash(unknownRegistry), 'registry-set')

    const schemaMismatch = cloneMutable(snapshot)
    schemaMismatch.registries[0]!.schemaName = 'wrong.schema.json'
    expectSnapshotError(rehash(schemaMismatch), 'registry-set')

    const duplicateEntry = cloneMutable(snapshot)
    duplicateEntry.registries[0]!.entries.push(cloneMutable(snapshot).registries[0]!.entries[0]!)
    expectSnapshotError(rehash(duplicateEntry), 'registry-set')

    const ownerMismatch = cloneMutable(snapshot)
    ownerMismatch.registries[0]!.entries[0]!.source.packageId = 'different_owner'
    expectSnapshotError(rehash(ownerMismatch), 'registry-set')
  })
})
