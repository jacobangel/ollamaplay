import type { OllamaModel } from '../store/useAppStore'

const OLLAMA_BASE = 'http://localhost:11434'

export type { OllamaModel }

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GenerateParams {
  temperature?: number
  top_p?: number
  top_k?: number
  num_predict?: number
  system?: string
}

export interface GenerateStats {
  evalCount: number
  promptEvalCount: number
  totalDurationMs: number
  tokensPerSecond: number
}

async function readNDJSONStream(
  body: ReadableStream<Uint8Array>,
  onLine: (line: string) => void,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.trim()) onLine(line)
      }
    }
    if (buffer.trim()) onLine(buffer)
  } finally {
    reader.releaseLock()
  }
}

export async function listModels(): Promise<OllamaModel[]> {
  const res = await fetch(`${OLLAMA_BASE}/api/tags`)
  const data = await res.json() as { models: OllamaModel[] }
  return data.models
}

export async function deleteModel(name: string): Promise<void> {
  await fetch(`${OLLAMA_BASE}/api/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export async function streamChat(
  model: string,
  messages: ChatMessage[],
  onChunk: (content: string) => void,
): Promise<void> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  })

  if (!res.body) throw new Error('No response body')

  await readNDJSONStream(res.body, (line) => {
    const data = JSON.parse(line) as { message: { content: string }; done: boolean }
    if (data.message?.content) onChunk(data.message.content)
  })
}

export async function streamGenerate(
  model: string,
  prompt: string,
  params: GenerateParams,
  onChunk: (content: string) => void,
): Promise<GenerateStats | null> {
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: true,
      system: params.system,
      options: {
        temperature: params.temperature,
        top_p: params.top_p,
        top_k: params.top_k,
        num_predict: params.num_predict,
      },
    }),
  })

  if (!res.body) throw new Error('No response body')

  let stats: GenerateStats | null = null

  await readNDJSONStream(res.body, (line) => {
    const data = JSON.parse(line) as {
      response: string
      done: boolean
      eval_count?: number
      prompt_eval_count?: number
      total_duration?: number
    }
    if (data.response) onChunk(data.response)
    if (data.done && data.eval_count) {
      stats = {
        evalCount: data.eval_count,
        promptEvalCount: data.prompt_eval_count ?? 0,
        totalDurationMs: (data.total_duration ?? 0) / 1_000_000,
        tokensPerSecond: data.eval_count / ((data.total_duration ?? 1) / 1_000_000_000),
      }
    }
  })

  return stats
}

export async function pullModel(
  name: string,
  onProgress: (completed: number, total: number) => void,
): Promise<void> {
  const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, stream: true }),
  })

  if (!res.body) throw new Error('No response body')

  await readNDJSONStream(res.body, (line) => {
    const data = JSON.parse(line) as { status: string; completed?: number; total?: number }
    if (data.completed !== undefined && data.total !== undefined) {
      onProgress(data.completed, data.total)
    }
  })
}
