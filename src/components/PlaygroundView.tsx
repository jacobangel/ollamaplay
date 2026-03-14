import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { streamGenerate } from '../hooks/useOllama'
import { EmptyModelState } from './EmptyModelState'
import type { GenerateParams, GenerateStats } from '../hooks/useOllama'

const DEFAULT_PARAMS: GenerateParams = {
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  num_predict: 512,
  system: '',
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

function ParamSlider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  )
}

export function PlaygroundView() {
  const { activeModel, setView } = useAppStore()
  const [params, setParams] = useState<GenerateParams>(DEFAULT_PARAMS)
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<GenerateStats | null>(null)

  if (!activeModel) {
    return <EmptyModelState onNavigateToModels={() => setView('models')} />
  }

  const setParam = <K extends keyof GenerateParams>(key: K, value: GenerateParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const handleRun = async () => {
    if (!prompt.trim() || streaming) return
    setOutput('')
    setError(null)
    setStats(null)
    setStreaming(true)

    try {
      const result = await streamGenerate(activeModel, prompt, params, (chunk) => {
        setOutput(prev => prev + chunk)
      })
      setStats(result)
    } catch {
      setError('Response interrupted — model may have unloaded. Try again.')
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: prompt + output */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800">
        {/* System prompt */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
            System prompt
          </label>
          <textarea
            value={params.system}
            onChange={e => setParam('system', e.target.value)}
            placeholder="You are a helpful assistant..."
            rows={2}
            className="w-full resize-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Prompt */}
        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-hidden">
          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="flex-1 resize-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Output */}
          {(output || streaming || error) && (
            <div className="flex-1 min-h-0">
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Output</label>
              <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 overflow-y-auto whitespace-pre-wrap">
                {output}
                {streaming && (
                  <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
                )}
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setPrompt(''); setOutput(''); setError(null); setStats(null) }}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleRun}
              disabled={!prompt.trim() || streaming}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs transition-colors"
            >
              Run ▶
            </button>
          </div>
        </div>
      </div>

      {/* Right: params */}
      <div className="w-52 flex flex-col bg-gray-50 dark:bg-gray-950 p-4 gap-4 overflow-y-auto">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider">Parameters</h3>
        <ParamSlider
          label="Temperature"
          value={params.temperature ?? 0.7}
          min={0} max={2} step={0.05}
          onChange={v => setParam('temperature', v)}
        />
        <ParamSlider
          label="Top-p"
          value={params.top_p ?? 0.9}
          min={0} max={1} step={0.05}
          onChange={v => setParam('top_p', v)}
        />
        <ParamSlider
          label="Top-k"
          value={params.top_k ?? 40}
          min={1} max={100} step={1}
          onChange={v => setParam('top_k', v)}
        />
        <ParamSlider
          label="Max tokens"
          value={params.num_predict ?? 512}
          min={64} max={4096} step={64}
          onChange={v => setParam('num_predict', v)}
        />

        {/* Stats */}
        {stats && (
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <p className="text-xs text-gray-400">{stats.promptEvalCount} in / {stats.evalCount} out tokens</p>
            <p className="text-xs text-gray-400">{stats.totalDurationMs.toFixed(0)}ms</p>
            <p className="text-xs text-gray-400">{stats.tokensPerSecond.toFixed(1)} tok/s</p>
          </div>
        )}
      </div>
    </div>
  )
}
