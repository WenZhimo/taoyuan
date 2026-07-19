import { canonicalizeJson, type JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import { requireContentId, type ContentId, type PackageId, type RegistryTypeId } from './ids'

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

export interface SerializableRegistryEntry {
  owner: PackageId
  source?: RegistryEntrySource
  entry: JsonValue
}

export interface SerializableRegistrySnapshot {
  formatVersion: 1
  registries: Array<{
    registryId: RegistryTypeId
    schemaName: string
    entries: SerializableRegistryEntry[]
  }>
  snapshotHash: Sha256Hash
}

export const createSerializableRegistrySnapshot = (registrySet: RegistrySet): SerializableRegistrySnapshot => {
  const registries = registrySet.registryIds().map(registryId => {
    const registry = registrySet.get(registryId)
    const entries = registry
      .entries()
      .map(record => ({
        owner: record.owner,
        source: record.source,
        entry: cloneSerializable(record.entry) as JsonValue
      }))
      .sort((a, b) => String((a.entry as { id: string }).id).localeCompare(String((b.entry as { id: string }).id)))
    return {
      registryId,
      schemaName: registry.definition.schemaName,
      entries
    }
  })
  const body = { formatVersion: 1 as const, registries }
  return {
    ...body,
    snapshotHash: hashCanonicalJson(body)
  }
}

export const restoreRegistrySetFromSnapshot = (
  definitions: readonly RegistryDefinition<RegistryEntry>[],
  snapshot: SerializableRegistrySnapshot
): RegistrySet => {
  const body = { formatVersion: snapshot.formatVersion, registries: snapshot.registries }
  if (hashCanonicalJson(body) !== snapshot.snapshotHash) {
    throw new Error('Registry snapshot hash mismatch')
  }

  const set = new RegistrySet()
  for (const definition of definitions) set.defineRegistry(definition)
  set.freezeDefinitions()
  for (const registrySnapshot of snapshot.registries) {
    const registry = set.get(registrySnapshot.registryId)
    for (const record of registrySnapshot.entries) {
      registry.register(record.owner, record.entry as unknown as RegistryEntry, record.source)
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
