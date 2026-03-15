import { useAppStore } from '../store/useAppStore'

export function OllamaBanner() {
  const ollamaStatus = useAppStore(s => s.ollamaStatus)

  if (ollamaStatus !== 'offline') return null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 text-sm">
      <span className="text-base">⚠</span>
      <span>
        Ollama is not reachable. Start it with{' '}
        <code className="font-mono bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">ollama serve</code>
        {' '}then refresh.
      </span>
    </div>
  )
}
