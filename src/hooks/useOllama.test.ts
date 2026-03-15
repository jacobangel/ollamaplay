import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listModels, deleteModel, streamChat, streamGenerate } from './useOllama'

beforeEach(() => {
  vi.restoreAllMocks()
})

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
}

function makeErrorStream(): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.error(new Error('stream failed'))
    },
  })
}

describe('listModels', () => {
  it('returns parsed model array from /api/tags', async () => {
    const models = [{ name: 'llama3.2:3b', size: 2000000000, digest: 'abc', modified_at: '' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ models }),
    }))
    const result = await listModels()
    expect(result).toEqual(models)
  })
})

describe('deleteModel', () => {
  it('calls DELETE /api/delete with model name', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', mockFetch)
    await deleteModel('llama3.2:3b')
    expect(mockFetch).toHaveBeenCalledWith(
      '/ollama/api/delete',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('streamChat', () => {
  it('accumulates chunks and calls onChunk for each', async () => {
    const chunks = [
      '{"message":{"content":"Hello"},"done":false}\n',
      '{"message":{"content":" world"},"done":true}\n',
    ]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(chunks),
    }))
    const received: string[] = []
    await streamChat('llama3.2:3b', [], (chunk) => received.push(chunk))
    expect(received).toEqual(['Hello', ' world'])
  })

  it('rejects when stream errors mid-read', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: makeErrorStream(),
    }))
    await expect(streamChat('llama3.2:3b', [], () => {})).rejects.toThrow()
  })
})

describe('streamGenerate', () => {
  it('accumulates response chunks', async () => {
    const chunks = [
      '{"response":"Hi","done":false}\n',
      '{"response":"!","done":true,"eval_count":5,"prompt_eval_count":3,"total_duration":1000000000}\n',
    ]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(chunks),
    }))
    const received: string[] = []
    await streamGenerate('llama3.2:3b', 'Hello', {}, (chunk) => received.push(chunk))
    expect(received).toEqual(['Hi', '!'])
  })
})
