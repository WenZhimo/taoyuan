import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SECRET_NOTES as LEGACY_SECRET_NOTES } from '@/data/secretNotes'
import {
  getOfficialSecretNoteById,
  getOfficialSecretNoteDef,
  getOfficialSecretNoteDefs,
  getOfficialSecretNotesAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { SecretNoteDefSchema, type SecretNoteDef as SecretNoteContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSecretNoteStore } from '@/stores/useSecretNoteStore'
import type { SecretNoteDef as LegacySecretNoteDef } from '@/types'
import validSecretNotes from '../fixtures/mods/minimal-valid-package/data/secret-notes.json'

const normalizeSecretNote = (note: LegacySecretNoteDef): LegacySecretNoteDef => JSON.parse(JSON.stringify(note))

const expectedSecretNoteContentDef = (note: LegacySecretNoteDef): SecretNoteContentDef => ({
  id: toOfficialContentId(`secret_note/${note.id}`),
  noteId: note.id,
  type: note.type,
  title: { key: `taoyuan.secret_note.${note.id}.title`, fallback: note.title },
  content: { key: `taoyuan.secret_note.${note.id}.content`, fallback: note.content },
  usable: note.usable,
  ...(note.reward
    ? {
        reward: {
          ...(note.reward.money !== undefined ? { money: note.reward.money } : {}),
          ...(note.reward.items
            ? {
                items: note.reward.items.map(item => ({
                  itemId: toOfficialContentId(item.itemId),
                  quantity: item.quantity
                }))
              }
            : {})
        }
      }
    : {})
})

describe('secret note registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external secret note JSON before registration', () => {
    const externalSecretNotes: unknown = validSecretNotes
    const result = validateUnknown(Type.Array(SecretNoteDefSchema), externalSecretNotes, {
      stage: 'test.secret-notes'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid secret note shapes, reward fields and extra properties', () => {
    const base = validSecretNotes[0]!
    const invalidSecretNotes: unknown = [
      { ...base, noteId: 0 },
      { ...base, type: 'rumor' },
      { ...base, title: { ...base.title, key: '' } },
      { ...base, reward: { items: [{ itemId: 'bad id', quantity: 0 }] } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(SecretNoteDefSchema), invalidSecretNotes, {
      stage: 'test.secret-notes.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/noteId',
        '/1/type',
        '/2/title/key',
        '/3/reward/items/0/itemId',
        '/3/reward/items/0/quantity',
        '/4/extra'
      ]))
    }
  })

  it('registers all secret notes in legacy order with equivalent fields and IDs', () => {
    expect(getOfficialSecretNoteDefs()).toHaveLength(LEGACY_SECRET_NOTES.length)
    expect(getOfficialSecretNoteDefs().map(note => note.id)).toEqual(
      LEGACY_SECRET_NOTES.map(note => toOfficialContentId(`secret_note/${note.id}`))
    )
    expect(getOfficialSecretNoteDefs().map(note => note.noteId)).toEqual(LEGACY_SECRET_NOTES.map(note => note.id))
    expect(getOfficialSecretNotesAsLegacy().map(normalizeSecretNote)).toEqual(
      LEGACY_SECRET_NOTES.map(normalizeSecretNote)
    )

    for (const note of LEGACY_SECRET_NOTES) {
      expect(getOfficialSecretNoteDef(note.id)).toEqual(expectedSecretNoteContentDef(note))
      expect(getOfficialSecretNoteDef(String(note.id))).toBe(getOfficialSecretNoteDef(note.id))
      expect(getOfficialSecretNoteDef(`secret_note/${note.id}`)).toBe(getOfficialSecretNoteDef(note.id))
      expect(getOfficialSecretNoteDef(toOfficialContentId(`secret_note/${note.id}`))).toBe(getOfficialSecretNoteDef(note.id))
      expect(getOfficialSecretNoteById(note.id)).toEqual(normalizeSecretNote(note))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstNote = getOfficialSecretNoteDef(1)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<SecretNoteContentDef>(toOfficialRegistryTypeId('secret_note'))

    expect(getOfficialSecretNoteDef(9999)).toBeUndefined()
    expect(getOfficialSecretNoteById(9999)).toBeUndefined()
    expect(Object.isFrozen(firstNote)).toBe(true)
    expect(Object.isFrozen(firstNote?.title)).toBe(true)
    expect(Object.isFrozen(firstNote?.reward)).toBe(true)
    expect(() => registry.register(OFFICIAL_PACKAGE_ID, expectedSecretNoteContentDef(LEGACY_SECRET_NOTES[0]!))).toThrow(
      RegistryError
    )
  })

  it('reports missing reward item references during semantic validation', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const owner = OFFICIAL_PACKAGE_ID
    const missingRewardNote: SecretNoteContentDef = {
      id: toOfficialContentId('secret_note/missing_reward'),
      noteId: 999,
      type: 'treasure',
      title: { key: 'taoyuan.secret_note.missing_reward.title', fallback: 'Missing Reward' },
      content: { key: 'taoyuan.secret_note.missing_reward.content', fallback: 'Missing reward item' },
      usable: true,
      reward: {
        items: [{ itemId: toOfficialContentId('missing_reward_item'), quantity: 1 }]
      }
    }
    registrySet.get<SecretNoteContentDef>(toOfficialRegistryTypeId('secret_note')).register(owner, missingRewardNote)

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === toOfficialContentId('missing_reward_item')
    )

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_reward_item'),
        fieldPath: '/reward/items/0/itemId'
      })
    ])
  })

  it('keeps collection, treasure rewards and old save restore registry-backed', () => {
    const secretNoteStore = useSecretNoteStore()
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()

    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(secretNoteStore.totalNotes).toBe(LEGACY_SECRET_NOTES.length)
    expect(secretNoteStore.tryCollectNote()).toBe(1)
    expect(secretNoteStore.collectedNotes).toEqual([1])

    secretNoteStore.deserialize({ collectedNotes: [2, 5], usedNotes: [] })
    const startingMoney = playerStore.money
    expect(secretNoteStore.useNote(2)).toEqual({ success: true, message: '获得了500文！' })
    expect(playerStore.money).toBe(startingMoney + 500)
    expect(secretNoteStore.isUsed(2)).toBe(true)

    expect(secretNoteStore.useNote(5)).toEqual({ success: true, message: '获得了jade×1！' })
    expect(inventoryStore.getItemCount('jade')).toBe(1)

    const restored = secretNoteStore.serialize()
    secretNoteStore.deserialize(restored)
    expect(secretNoteStore.isCollected(5)).toBe(true)
    expect(secretNoteStore.isUsed(5)).toBe(true)
  })
})
