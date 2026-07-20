import { Type, type Static } from '@sinclair/typebox'
import { NAMESPACED_ID_PATTERN, PACKAGE_ID_PATTERN } from './ids'

const SnapshotPackageIdSchema = Type.String({ pattern: PACKAGE_ID_PATTERN })
const SnapshotNamespacedIdSchema = Type.String({ pattern: NAMESPACED_ID_PATTERN })
const SnapshotRelativePathSchema = Type.String({
  minLength: 1,
  pattern: '^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.\\.(?:/|$)).+$'
})

export const RegistrySnapshotJsonValueSchema = Type.Recursive(
  This => Type.Union([
    Type.Null(),
    Type.Boolean(),
    Type.Number(),
    Type.String(),
    Type.Array(This),
    Type.Object({}, { additionalProperties: This })
  ]),
  { $id: 'taoyuan.schema.RegistrySnapshotJsonValue' }
)

export const SerializableRegistryEntrySchema = Type.Object(
  {
    owner: SnapshotPackageIdSchema,
    source: Type.Object(
      {
        packageId: SnapshotPackageIdSchema,
        file: Type.Optional(SnapshotRelativePathSchema),
        localId: Type.Optional(Type.String({ minLength: 1 }))
      },
      { additionalProperties: false }
    ),
    entry: Type.Object(
      { id: SnapshotNamespacedIdSchema },
      { additionalProperties: RegistrySnapshotJsonValueSchema }
    )
  },
  { additionalProperties: false }
)

export const SerializableRegistrySnapshotSchema = Type.Object(
  {
    formatVersion: Type.Literal(2),
    registries: Type.Array(Type.Object(
      {
        registryId: SnapshotNamespacedIdSchema,
        schemaName: Type.String({ minLength: 1 }),
        entries: Type.Array(SerializableRegistryEntrySchema)
      },
      { additionalProperties: false }
    )),
    snapshotHash: Type.String({ pattern: '^sha256:[0-9a-f]{64}$' })
  },
  {
    $id: 'taoyuan.schema.SerializableRegistrySnapshotV2',
    additionalProperties: false
  }
)

export type SerializableRegistryEntry = Static<typeof SerializableRegistryEntrySchema>
export type SerializableRegistrySnapshot = Static<typeof SerializableRegistrySnapshotSchema>
