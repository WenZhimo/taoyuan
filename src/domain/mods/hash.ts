import CryptoJS from 'crypto-js'
import { canonicalizeJson, compareCodePoints } from './canonicalJson'

export type Sha256Hash = `sha256:${string}`

const formatSha256 = (hex: string): Sha256Hash => `sha256:${hex.toLowerCase()}`

export const sha256Utf8 = (value: string): Sha256Hash =>
  formatSha256(CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(value)).toString(CryptoJS.enc.Hex))

export const hashCanonicalJson = (value: unknown): Sha256Hash => sha256Utf8(canonicalizeJson(value))

export interface CanonicalFileEntry {
  path: string
  size: number
  sha256: Sha256Hash
}

export const normalizePackagePath = (path: string): string => {
  const normalized = path.replace(/\\/g, '/').normalize('NFC')
  if (
    normalized.startsWith('/') ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized.includes('\0')
  ) {
    throw new Error(`Invalid package path: ${path}`)
  }

  const segments = normalized.split('/')
  if (segments.some(segment => segment === '' || segment === '.' || segment === '..')) {
    throw new Error(`Invalid package path: ${path}`)
  }
  return segments.join('/')
}

export const createCanonicalFileManifestHash = (entries: readonly CanonicalFileEntry[]): Sha256Hash => {
  const normalized = entries
    .map(entry => ({
      path: normalizePackagePath(entry.path),
      size: entry.size,
      sha256: entry.sha256
    }))
    .sort((a, b) => compareCodePoints(a.path, b.path))
  return hashCanonicalJson(normalized)
}

export const hashPayloadJson = (payloadJson: string): Sha256Hash => sha256Utf8(payloadJson)
