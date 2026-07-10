import CryptoJS from 'crypto-js'
import { gzipSync, gunzipSync, strFromU8, strToU8 } from 'fflate'

export const SAVE_FORMAT_PREFIX = 'TYX2:'

const ENCRYPTION_KEY = 'taoyuanxiang_2024_secret'
const BASE64_CHUNK_SIZE = 0x8000

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + BASE64_CHUNK_SIZE))
  }
  return btoa(binary)
}

const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const encrypt = (value: string): string => CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString()

const decrypt = (cipher: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8) || null
  } catch {
    return null
  }
}

export const isCompressedSave = (raw: string): boolean => raw.startsWith(SAVE_FORMAT_PREFIX)

export const encodeSaveJson = (json: string): string => {
  const compressed = gzipSync(strToU8(json), { level: 6 })
  return SAVE_FORMAT_PREFIX + encrypt(bytesToBase64(compressed))
}

export const decodeSaveJson = (raw: string): string | null => {
  const compressed = isCompressedSave(raw)
  const cipher = compressed ? raw.slice(SAVE_FORMAT_PREFIX.length) : raw
  const decrypted = decrypt(cipher)
  if (!decrypted) return null
  if (!compressed) return decrypted

  try {
    return strFromU8(gunzipSync(base64ToBytes(decrypted)))
  } catch {
    return null
  }
}
