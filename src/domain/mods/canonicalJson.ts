export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]'

const compareCodePoints = (a: string, b: string): number => {
  const aPoints = Array.from(a)
  const bPoints = Array.from(b)
  const length = Math.min(aPoints.length, bPoints.length)
  for (let i = 0; i < length; i++) {
    const diff = aPoints[i]!.codePointAt(0)! - bPoints[i]!.codePointAt(0)!
    if (diff !== 0) return diff
  }
  return aPoints.length - bPoints.length
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
