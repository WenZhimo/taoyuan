import { canonicalizeJson } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson } from './hash'
import {
  requireContentId,
  requirePackageId,
  requireRegistryTypeId,
  type ContentId,
  type PackageId,
  type RegistryTypeId
} from './ids'
import {
  SerializableRegistrySnapshotSchema,
  type SerializableRegistryEntry,
  type SerializableRegistrySnapshot
} from './registrySnapshotSchema'
import { validateUnknown } from './schemaValidation'

export { SerializableRegistrySnapshotSchema } from './registrySnapshotSchema'
export type { SerializableRegistryEntry, SerializableRegistrySnapshot } from './registrySnapshotSchema'

export interface RegistryEntry {
  id: string
}

export interface RegistryEntrySource {
  packageId: PackageId
  file?: string
  localId?: string
}

export interface RegistryRecord<T extends RegistryEntry> {
  owner: PackageId
  source?: RegistryEntrySource
  entry: Readonly<T>
}

export interface RegistryDefinition<T extends RegistryEntry> {
  registryId: RegistryTypeId
  description: string
  schemaName: string
  readonly entryType?: (entry: T) => T
}

export class RegistryError extends Error {
  readonly diagnostic: ModDiagnostic

  constructor(diagnostic: ModDiagnostic) {
    super(`${diagnostic.code}: ${diagnostic.messageKey}`)
    this.diagnostic = diagnostic
  }
}

const cloneSerializable = <T>(value: T): T => JSON.parse(canonicalizeJson(value)) as T

const assertSnapshotJsonValue = (value: unknown, path: string, ancestors = new Set<object>()): void => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number' && Number.isFinite(value)) return
  if (!value || typeof value !== 'object') {
    throw new Error(`Registry snapshot contains non-JSON value at ${path}`)
  }
  if (ancestors.has(value)) throw new Error(`Registry snapshot contains a cycle at ${path}`)

  const isArray = Array.isArray(value)
  const prototype = Object.getPrototypeOf(value)
  if (isArray && prototype !== Array.prototype) {
    throw new Error(`Registry snapshot contains non-JSON array at ${path}`)
  }
  if (!isArray && prototype !== Object.prototype && prototype !== null) {
    throw new Error(`Registry snapshot contains non-JSON object at ${path}`)
  }
  const ownKeys = Reflect.ownKeys(value)
  if (ownKeys.some(key => typeof key !== 'string')) {
    throw new Error(`Registry snapshot contains a symbol key at ${path}`)
  }

  ancestors.add(value)
  if (isArray) {
    const invalidKey = ownKeys.find(key =>
      typeof key === 'string'
      && key !== 'length'
      && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)
    )
    if (invalidKey !== undefined) {
      throw new Error(`Registry snapshot contains a non-JSON array property at ${path}/${String(invalidKey)}`)
    }
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new Error(`Registry snapshot contains a sparse array at ${path}/${index}`)
      assertSnapshotJsonValue(value[index], `${path}/${index}`, ancestors)
    }
  } else {
    for (const key of ownKeys as string[]) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (!descriptor?.enumerable || !('value' in descriptor)) {
        throw new Error(`Registry snapshot contains a non-JSON object property at ${path}/${key}`)
      }
      assertSnapshotJsonValue(descriptor.value, `${path}/${key}`, ancestors)
    }
  }
  ancestors.delete(value)
}

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value as Readonly<T>
}

export class Registry<T extends RegistryEntry> {
  readonly definition: RegistryDefinition<T>
  private readonly records = new Map<ContentId, RegistryRecord<T>>()
  private frozen = false
  private frozenValues: readonly Readonly<T>[] | null = null

  constructor(definition: RegistryDefinition<T>) {
    this.definition = definition
  }

  get registryId(): RegistryTypeId {
    return this.definition.registryId
  }

  register(owner: PackageId, entry: T, source?: Omit<RegistryEntrySource, 'packageId'>): void {
    const contentId = requireContentId(entry.id)
    if (this.frozen) {
      throw new RegistryError(
        createDiagnostic('REG-FROZEN-001', {
          stage: 'registry.entries',
          registryId: this.registryId,
          contentId
        })
      )
    }
    if (this.records.has(contentId)) {
      throw new RegistryError(
        createDiagnostic('REG-DUPLICATE-001', {
          stage: 'registry.entries',
          registryId: this.registryId,
          contentId,
          packageId: owner
        })
      )
    }
    const cloned = cloneSerializable(entry)
    this.records.set(contentId, {
      owner,
      source: source ? { ...source, packageId: owner } : { packageId: owner },
      entry: cloned
    })
  }

  get(id: ContentId): Readonly<T> | undefined {
    return this.records.get(id)?.entry
  }

  require(id: ContentId): Readonly<T> {
    const entry = this.get(id)
    if (!entry) throw new Error(`Missing registry entry ${this.registryId} ${id}`)
    return entry
  }

  has(id: ContentId): boolean {
    return this.records.has(id)
  }

  values(): readonly Readonly<T>[] {
    if (this.frozenValues) return this.frozenValues
    return Array.from(this.records.values(), record => record.entry)
  }

  entries(): readonly RegistryRecord<T>[] {
    return Array.from(this.records.values())
  }

  freeze(): void {
    if (this.frozen) return
    for (const record of this.records.values()) {
      deepFreeze(record.entry)
      if (record.source) deepFreeze(record.source)
      Object.freeze(record)
    }
    this.frozenValues = Object.freeze(Array.from(this.records.values(), record => record.entry))
    this.frozen = true
  }

  get isFrozen(): boolean {
    return this.frozen
  }
}

export type RegistrySetPhase = 'defining-registries' | 'registering-entries' | 'frozen'

export class RegistrySet {
  private readonly registries = new Map<RegistryTypeId, Registry<RegistryEntry>>()
  private phase: RegistrySetPhase = 'defining-registries'

  defineRegistry<T extends RegistryEntry>(definition: RegistryDefinition<T>): Registry<T> {
    if (this.phase !== 'defining-registries') {
      throw new RegistryError(
        createDiagnostic('REG-FROZEN-001', {
          stage: 'registry.definitions',
          registryId: definition.registryId
        })
      )
    }
    if (this.registries.has(definition.registryId)) {
      throw new RegistryError(
        createDiagnostic('REG-DUPLICATE-001', {
          stage: 'registry.definitions',
          registryId: definition.registryId
        })
      )
    }
    const registry = new Registry<T>(definition)
    this.registries.set(definition.registryId, registry as unknown as Registry<RegistryEntry>)
    return registry
  }

  get<T extends RegistryEntry>(registryId: RegistryTypeId): Registry<T> {
    const registry = this.registries.get(registryId)
    if (!registry) throw new Error(`Unknown registry type: ${registryId}`)
    return registry as unknown as Registry<T>
  }

  hasRegistry(registryId: RegistryTypeId): boolean {
    return this.registries.has(registryId)
  }

  registryIds(): readonly RegistryTypeId[] {
    return Array.from(this.registries.keys()).sort()
  }

  freezeDefinitions(): void {
    if (this.phase !== 'defining-registries') return
    this.phase = 'registering-entries'
  }

  freezeEntries(): void {
    if (this.phase === 'frozen') return
    for (const registry of this.registries.values()) registry.freeze()
    this.phase = 'frozen'
  }

  get currentPhase(): RegistrySetPhase {
    return this.phase
  }
}

export type RegistrySnapshotErrorKind = 'format-version' | 'structure' | 'hash' | 'registry-set'

export class RegistrySnapshotError extends Error {
  readonly kind: RegistrySnapshotErrorKind
  readonly diagnostics: readonly ModDiagnostic[]

  constructor(kind: RegistrySnapshotErrorKind, message: string, diagnostics: readonly ModDiagnostic[]) {
    super(message)
    this.name = 'RegistrySnapshotError'
    this.kind = kind
    this.diagnostics = diagnostics
  }
}

const createSnapshotDiagnostic = (
  code: 'CACHE-INVALID-001' | 'CACHE-RESTORE-001',
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic(code, { stage, details })

const throwSnapshotError = (
  kind: RegistrySnapshotErrorKind,
  message: string,
  code: 'CACHE-INVALID-001' | 'CACHE-RESTORE-001',
  stage: string,
  details: Record<string, string | number | boolean | null> = {}
): never => {
  throw new RegistrySnapshotError(kind, message, [createSnapshotDiagnostic(code, stage, details)])
}

const getSnapshotBody = (snapshot: SerializableRegistrySnapshot) => ({
  formatVersion: snapshot.formatVersion,
  registries: snapshot.registries
})

const assertSnapshotInputIsJson = (value: unknown): void => {
  try {
    assertSnapshotJsonValue(value, '/')
  } catch (error) {
    throw new RegistrySnapshotError(
      'structure',
      error instanceof Error ? error.message : String(error),
      [createDiagnostic('SCHEMA-VALIDATE-001', {
        stage: 'registry.snapshot.structure',
        details: { message: error instanceof Error ? error.message : String(error) }
      })]
    )
  }
}

const parseRegistrySnapshot = (value: unknown): SerializableRegistrySnapshot => {
  assertSnapshotInputIsJson(value)
  if (
    value
    && typeof value === 'object'
    && 'formatVersion' in value
    && (value as { formatVersion?: unknown }).formatVersion !== 2
  ) {
    throwSnapshotError(
      'format-version',
      `Unsupported registry snapshot formatVersion: ${String((value as { formatVersion?: unknown }).formatVersion)}`,
      'CACHE-INVALID-001',
      'registry.snapshot.format',
      { expected: 2, actual: String((value as { formatVersion?: unknown }).formatVersion) }
    )
  }

  const result = validateUnknown(SerializableRegistrySnapshotSchema, value, {
    stage: 'registry.snapshot.structure'
  })
  if (!result.ok) {
    throw new RegistrySnapshotError(
      'structure',
      `Registry snapshot structure invalid at ${result.diagnostics[0]?.fieldPath ?? '/'}`,
      result.diagnostics
    )
  }

  const snapshot = result.data
  if (hashCanonicalJson(getSnapshotBody(snapshot)) !== snapshot.snapshotHash) {
    throwSnapshotError(
      'hash',
      'Registry snapshot hash mismatch',
      'CACHE-INVALID-001',
      'registry.snapshot.hash',
      { actual: snapshot.snapshotHash }
    )
  }
  return snapshot
}

const validateSnapshotRegistrySet = (
  definitions: readonly RegistryDefinition<RegistryEntry>[],
  snapshot: SerializableRegistrySnapshot
): void => {
  const definitionsById = new Map<RegistryTypeId, RegistryDefinition<RegistryEntry>>()
  for (const definition of definitions) {
    if (definitionsById.has(definition.registryId)) {
      throwSnapshotError(
        'registry-set',
        `Duplicate registry definition: ${definition.registryId}`,
        'CACHE-RESTORE-001',
        'registry.snapshot.definitions',
        { registryId: definition.registryId }
      )
    }
    definitionsById.set(definition.registryId, definition)
  }

  const expectedIds = [...definitionsById.keys()].sort()
  const actualIds = snapshot.registries.map(registry => requireRegistryTypeId(registry.registryId))
  const duplicateIds = actualIds.filter((id, index) => actualIds.indexOf(id) !== index)
  const unknownIds = actualIds.filter(id => !definitionsById.has(id))
  const missingIds = expectedIds.filter(id => !actualIds.includes(id))
  if (duplicateIds.length > 0 || unknownIds.length > 0 || missingIds.length > 0) {
    throwSnapshotError(
      'registry-set',
      'Registry snapshot definition set mismatch',
      'CACHE-RESTORE-001',
      'registry.snapshot.registries',
      {
        duplicateRegistryIds: duplicateIds.join(','),
        unknownRegistryIds: unknownIds.join(','),
        missingRegistryIds: missingIds.join(',')
      }
    )
  }
  if (actualIds.some((id, index) => id !== expectedIds[index])) {
    throwSnapshotError(
      'registry-set',
      'Registry snapshot registry order is not canonical',
      'CACHE-RESTORE-001',
      'registry.snapshot.registry-order',
      { expected: expectedIds.join(','), actual: actualIds.join(',') }
    )
  }

  for (const registrySnapshot of snapshot.registries) {
    const registryId = requireRegistryTypeId(registrySnapshot.registryId)
    const definition = definitionsById.get(registryId)!
    if (registrySnapshot.schemaName !== definition.schemaName) {
      throwSnapshotError(
        'registry-set',
        `Registry snapshot schema mismatch for ${registryId}`,
        'CACHE-RESTORE-001',
        'registry.snapshot.schema-name',
        { registryId, expected: definition.schemaName, actual: registrySnapshot.schemaName }
      )
    }

    const entryIds = registrySnapshot.entries.map(record => requireContentId(record.entry.id))
    const duplicateEntryIds = entryIds.filter((id, index) => entryIds.indexOf(id) !== index)
    if (duplicateEntryIds.length > 0) {
      throwSnapshotError(
        'registry-set',
        `Registry snapshot contains duplicate entries in ${registryId}`,
        'CACHE-RESTORE-001',
        'registry.snapshot.entries',
        { registryId, duplicateEntryIds: duplicateEntryIds.join(',') }
      )
    }
    registrySnapshot.entries.forEach((record, index) => {
      if (record.source.packageId !== record.owner) {
        throwSnapshotError(
          'registry-set',
          `Registry snapshot owner/source mismatch in ${registryId}`,
          'CACHE-RESTORE-001',
          'registry.snapshot.source',
          { registryId, index, owner: record.owner, sourcePackageId: record.source.packageId }
        )
      }
    })
  }
}

export const createSerializableRegistrySnapshot = (registrySet: RegistrySet): SerializableRegistrySnapshot => {
  const registries = registrySet.registryIds().map(registryId => {
    const registry = registrySet.get(registryId)
    const entries = registry.entries().map((record, index): SerializableRegistryEntry => {
      assertSnapshotJsonValue(record.entry, `/registries/${registryId}/entries/${index}/entry`)
      const source = record.source ?? { packageId: record.owner }
      return {
        owner: record.owner,
        source: cloneSerializable(source),
        entry: cloneSerializable(record.entry)
      }
    })
    return {
      registryId,
      schemaName: registry.definition.schemaName,
      entries
    }
  })
  const body = { formatVersion: 2 as const, registries }
  return parseRegistrySnapshot({
    ...body,
    snapshotHash: hashCanonicalJson(body)
  })
}

export const restoreRegistrySetFromSnapshot = (
  definitions: readonly RegistryDefinition<RegistryEntry>[],
  value: unknown
): RegistrySet => {
  const snapshot = parseRegistrySnapshot(value)
  validateSnapshotRegistrySet(definitions, snapshot)

  const set = new RegistrySet()
  for (const definition of definitions) set.defineRegistry(definition)
  set.freezeDefinitions()
  for (const registrySnapshot of snapshot.registries) {
    const registry = set.get(requireRegistryTypeId(registrySnapshot.registryId))
    for (const record of registrySnapshot.entries) {
      const owner = requirePackageId(record.owner)
      registry.register(owner, record.entry as RegistryEntry, {
        file: record.source.file,
        localId: record.source.localId
      })
    }
  }
  set.freezeEntries()
  return set
}

export const registerEntriesInChunks = async<T extends RegistryEntry>(
  registry: Registry<T>,
  owner: PackageId,
  entries: readonly T[],
  options?: {
    chunkSize?: number
    onProgress?: (processed: number, total: number) => void
    yieldToMain?: () => Promise<void>
  }
): Promise<void> => {
  const chunkSize = Math.max(1, options?.chunkSize ?? 1000)
  const yieldToMain = options?.yieldToMain ?? (() => Promise.resolve())
  for (let index = 0; index < entries.length; index += chunkSize) {
    const chunk = entries.slice(index, index + chunkSize)
    for (const entry of chunk) registry.register(owner, entry)
    options?.onProgress?.(Math.min(index + chunk.length, entries.length), entries.length)
    await yieldToMain()
  }
}
