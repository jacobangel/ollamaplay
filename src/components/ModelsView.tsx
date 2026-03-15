import { useCallback, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { MODEL_CATALOG, filterByHardware } from '../data/modelCatalog'
import { deleteModel, pullModel, listModels } from '../hooks/useOllama'

export function ModelsView() {
  const {
    hardware,
    installedModels,
    setInstalledModels,
    setActiveModel,
    activeModel,
    pullingModel,
    pullProgress,
    setPullingModel,
    setPullProgress,
  } = useAppStore()

  const [pullError, setPullError] = useState<string | null>(null)

  const installedIds = installedModels.map(m => m.name)
  const available = filterByHardware(MODEL_CATALOG, hardware, installedIds)
  const tooLarge = hardware && hardware.gpu.vramGb > 0
    ? MODEL_CATALOG.filter(m => m.vramGb > hardware.gpu.vramGb && !installedIds.includes(m.id))
    : []

  const refreshModels = useCallback(async () => {
    const models = await listModels()
    setInstalledModels(models)
    if (models.length > 0 && !activeModel) setActiveModel(models[0].name)
  }, [setInstalledModels, setActiveModel, activeModel])

  const handlePull = async (modelId: string) => {
    setPullingModel(modelId)
    setPullError(null)
    try {
      await pullModel(modelId, (completed, total) => setPullProgress({ completed, total }))
      await refreshModels()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pull failed'
      const isConnectionError = msg.includes('ECONNREFUSED') || msg.includes('Failed to fetch') || msg.includes('NetworkError')
      setPullError(isConnectionError ? 'Cannot reach Ollama. Is it running? Try: ollama serve' : msg)
    } finally {
      setPullingModel(null)
    }
  }

  const handleDelete = async (name: string) => {
    try {
      await deleteModel(name)
      if (activeModel === name) setActiveModel(null)
      await refreshModels()
    } catch {
      // silently ignore delete errors for now — model may not exist
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Hardware banner */}
      <div className="flex gap-6 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">GPU</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {hardware?.gpu.name ?? 'Detecting...'}
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">
            {hardware ? `${hardware.gpu.vramGb} GB VRAM` : '—'}
          </p>
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-800" />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">RAM</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {hardware ? `${hardware.ram.totalGb} GB` : 'Detecting...'}
          </p>
        </div>
        {hardware && hardware.gpu.vramGb === 0 && (
          <p className="ml-auto self-center text-xs text-yellow-600 dark:text-yellow-500">
            GPU not detected — showing all models
          </p>
        )}
      </div>

      {/* Installed models */}
      {installedModels.length > 0 && (
        <section>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Installed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {installedModels.map(model => (
              <div
                key={model.name}
                className={`p-4 rounded-xl border bg-white dark:bg-gray-900 ${
                  activeModel === model.name
                    ? 'border-indigo-400 dark:border-indigo-600'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{model.name}</p>
                    <p className="text-xs text-gray-400">{(model.size / 1e9).toFixed(1)} GB</p>
                  </div>
                  {activeModel === model.name && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                      active
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveModel(model.name)}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleDelete(model.name)}
                    className="px-2.5 py-1.5 border border-red-200 dark:border-red-900 text-red-500 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pullError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          Pull failed: {pullError}
        </div>
      )}

      {/* Available models */}
      {available.length > 0 && (
        <section>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Available for your hardware
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {available.map(model => {
              const isPulling = pullingModel === model.id
              const progress = isPulling && pullProgress
                ? Math.round((pullProgress.completed / Math.max(pullProgress.total, 1)) * 100)
                : 0

              return (
                <div
                  key={model.id}
                  className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-0.5">
                    {model.name} <span className="font-normal text-gray-400">{model.params}</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-1">{model.vramGb} GB VRAM • {model.maker}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 line-clamp-1">
                    {model.description}
                  </p>
                  {isPulling ? (
                    <div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">{progress}%</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePull(model.id)}
                      disabled={pullingModel !== null}
                      className="w-full py-1.5 border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ↓ Pull
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Too large models */}
      {tooLarge.length > 0 && (
        <section>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Requires more VRAM</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tooLarge.map(model => (
              <div
                key={model.id}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 opacity-50"
              >
                <p className="font-semibold text-sm text-gray-500 mb-0.5">
                  {model.name} <span className="font-normal">{model.params}</span>
                </p>
                <p className="text-xs text-gray-400 mb-3">{model.vramGb} GB VRAM needed</p>
                <button
                  disabled
                  className="w-full py-1.5 border border-gray-200 dark:border-gray-800 text-gray-400 text-xs rounded-lg cursor-not-allowed"
                >
                  Needs {model.vramGb} GB VRAM
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
