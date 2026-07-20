export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]'

export const compareCodePoints = (a: string, b: string): number => {
  const aPoints = Array.from(a)
  const bPoints = Array.from(b)
  const length = Math.min(aPoints.length, bPoints.length)
  for (let i = 0; i < length; i++) {
    const diff = aPoints[i]!.codePointAt(0)! - bPoints[i]!.codePointAt(0)!
    if (diff !== 0) return diff
  }
  return aPoints.length - bPoints.length
}

export const assertPureJsonValue = (
  value: unknown,
  path = '/',
  ancestors = new Set<object>()
): void => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number' && Number.isFinite(value)) return
  if (!value || typeof value !== 'object') {
    throw new Error(`JSON data contains a non-JSON value at ${path}`)
  }
  if (ancestors.has(value)) throw new Error(`JSON data contains a cycle at ${path}`)

  const isArray = Array.isArray(value)
  const prototype = Object.getPrototypeOf(value)
  if (isArray && prototype !== Array.prototype) {
    throw new Error(`JSON data contains a non-JSON array at ${path}`)
  }
  if (!isArray && prototype !== Object.prototype && prototype !== null) {
    throw new Error(`JSON data contains a non-JSON object at ${path}`)
  }
  const ownKeys = Reflect.ownKeys(value)
  if (ownKeys.some(key => typeof key !== 'string')) {
    throw new Error(`JSON data contains a symbol key at ${path}`)
  }

  ancestors.add(value)
  if (isArray) {
    const invalidKey = ownKeys.find(key =>
      typeof key === 'string'
      && key !== 'length'
      && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)
    )
    if (invalidKey !== undefined) {
      throw new Error(`JSON data contains a non-JSON array property at ${path}/${String(invalidKey)}`)
    }
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new Error(`JSON data contains a sparse array at ${path}/${index}`)
      assertPureJsonValue(value[index], `${path}/${index}`, ancestors)
    }
  } else {
    for (const key of ownKeys as string[]) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (!descriptor?.enumerable || !('value' in descriptor)) {
        throw new Error(`JSON data contains a non-JSON object property at ${path}/${key}`)
      }
      assertPureJsonValue(descriptor.value, `${path}/${key}`, ancestors)
    }
  }
  ancestors.delete(value)
}

export const canonicalizeJson = (value: unknown): string => {
  if (value === null) return 'null'

  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('JCS input contains a non-finite number')
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => canonicalizeJson(item)).join(',')}]`
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => compareCodePoints(a, b))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalizeJson(entryValue)}`)
    return `{${entries.join(',')}}`
  }

  throw new Error(`JCS input contains unsupported value: ${typeof value}`)
}

export const assertJsonValue = (value: unknown): JsonValue => {
  canonicalizeJson(value)
  return value as JsonValue
}
