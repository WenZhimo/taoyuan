import { decodeSaveJson, encodeSaveJson, isCompressedSave } from './saveCodecCore'

type CodecOperation = 'encode' | 'decode'

type CodecResponse = {
  id: number
  result: string | null
  error?: string
}

let codecWorker: Worker | null = null
let nextRequestId = 0
const pendingRequests = new Map<
  number,
  {
    resolve: (result: string | null) => void
    reject: (error: Error) => void
  }
>()

const disposeWorker = () => {
  codecWorker?.terminate()
  codecWorker = null
  for (const pending of pendingRequests.values()) {
    pending.reject(new Error('存档后台线程已停止'))
  }
  pendingRequests.clear()
}

const getWorker = (): Worker | null => {
  if (typeof Worker === 'undefined') return null
  if (codecWorker) return codecWorker

  try {
    codecWorker = new Worker(new URL('../workers/saveCodec.worker.ts', import.meta.url), { type: 'module' })
    codecWorker.onmessage = (event: MessageEvent<CodecResponse>) => {
      const pending = pendingRequests.get(event.data.id)
      if (!pending) return
      pendingRequests.delete(event.data.id)
      if (event.data.error) pending.reject(new Error(event.data.error))
      else pending.resolve(event.data.result)
    }
    codecWorker.onerror = () => disposeWorker()
    return codecWorker
  } catch {
    codecWorker = null
    return null
  }
}

const runCodec = async (operation: CodecOperation, value: string): Promise<string | null> => {
  const worker = getWorker()
  if (!worker) return operation === 'encode' ? encodeSaveJson(value) : decodeSaveJson(value)

  const id = ++nextRequestId
  try {
    return await new Promise<string | null>((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject })
      worker.postMessage({ id, operation, value })
    })
  } catch {
    disposeWorker()
    return operation === 'encode' ? encodeSaveJson(value) : decodeSaveJson(value)
  }
}

export const encodeSaveData = async (data: Record<string, unknown>): Promise<string> => {
  const encoded = await runCodec('encode', JSON.stringify(data))
  if (!encoded) throw new Error('存档编码失败')
  return encoded
}

export const parseSaveData = async (raw: string): Promise<Record<string, any> | null> => {
  const json = await runCodec('decode', raw)
  if (!json) return null
  try {
    return JSON.parse(json) as Record<string, any>
  } catch {
    return null
  }
}

export const normalizeSaveData = async (
  raw: string
): Promise<{ data: Record<string, any>; encoded: string } | null> => {
  const json = await runCodec('decode', raw)
  if (!json) return null

  let data: Record<string, any>
  try {
    data = JSON.parse(json) as Record<string, any>
  } catch {
    return null
  }

  const encoded = isCompressedSave(raw) ? raw : await runCodec('encode', json)
  if (!encoded) return null
  return { data, encoded }
}
