import { decodeSaveJson, encodeSaveJson } from '@/utils/saveCodecCore'

type CodecRequest = {
  id: number
  operation: 'encode' | 'decode'
  value: string
}

type CodecResponse = {
  id: number
  result: string | null
  error?: string
}

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<CodecRequest>) => void) | null
  postMessage: (message: CodecResponse) => void
}

workerScope.onmessage = event => {
  const { id, operation, value } = event.data
  try {
    const result = operation === 'encode' ? encodeSaveJson(value) : decodeSaveJson(value)
    workerScope.postMessage({ id, result })
  } catch (error) {
    workerScope.postMessage({
      id,
      result: null,
      error: error instanceof Error ? error.message : '存档编解码失败'
    })
  }
}
