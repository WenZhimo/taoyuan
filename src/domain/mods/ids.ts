declare const brandSymbol: unique symbol

export type Brand<T, Name extends string> = T & { readonly [brandSymbol]: Name }

export type NamespacedId = Brand<string, 'NamespacedId'>
export type ContentId = Brand<string, 'ContentId'>
export type PackageId = Brand<string, 'PackageId'>
export type RegistryTypeId = Brand<string, 'RegistryTypeId'>

export const NAMESPACED_ID_PATTERN = '^[a-z0-9_.-]+:[a-z0-9_./-]+$'
export const PACKAGE_ID_PATTERN = '^[a-z0-9_.-]+$'
export const OFFICIAL_NAMESPACE = 'taoyuan'

const namespacedIdRegex = new RegExp(NAMESPACED_ID_PATTERN)
const packageIdRegex = new RegExp(PACKAGE_ID_PATTERN)

export const isNamespacedId = (value: unknown): value is NamespacedId =>
  typeof value === 'string' && namespacedIdRegex.test(value)

export const isContentId = (value: unknown): value is ContentId => isNamespacedId(value)

export const isRegistryTypeId = (value: unknown): value is RegistryTypeId => isNamespacedId(value)

export const isPackageId = (value: unknown): value is PackageId =>
  typeof value === 'string' && packageIdRegex.test(value)

export const parseContentId = (value: unknown): ContentId | null => (isContentId(value) ? value : null)

export const parseRegistryTypeId = (value: unknown): RegistryTypeId | null =>
  isRegistryTypeId(value) ? value : null

export const parsePackageId = (value: unknown): PackageId | null => (isPackageId(value) ? value : null)

export const requireContentId = (value: unknown): ContentId => {
  const parsed = parseContentId(value)
  if (!parsed) throw new Error(`Invalid ContentId: ${String(value)}`)
  return parsed
}

export const requireRegistryTypeId = (value: unknown): RegistryTypeId => {
  const parsed = parseRegistryTypeId(value)
  if (!parsed) throw new Error(`Invalid RegistryTypeId: ${String(value)}`)
  return parsed
}

export const requirePackageId = (value: unknown): PackageId => {
  const parsed = parsePackageId(value)
  if (!parsed) throw new Error(`Invalid PackageId: ${String(value)}`)
  return parsed
}

export const toOfficialContentId = (rawId: string): ContentId =>
  requireContentId(rawId.includes(':') ? rawId : `${OFFICIAL_NAMESPACE}:${rawId}`)

export const toOfficialRegistryTypeId = (localId: string): RegistryTypeId =>
  requireRegistryTypeId(localId.includes(':') ? localId : `${OFFICIAL_NAMESPACE}:${localId}`)

export const getNamespace = (id: NamespacedId): string => id.split(':', 1)[0]!

export const getLocalId = (id: NamespacedId): string => id.slice(id.indexOf(':') + 1)
