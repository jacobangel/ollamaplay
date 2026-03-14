interface Props {
  onNavigateToModels: () => void
}

export function EmptyModelState({ onNavigateToModels }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <p className="text-gray-400 dark:text-gray-500 text-lg">No model selected</p>
      <p className="text-gray-500 dark:text-gray-600 text-sm">Go to Models to install one</p>
      <button
        onClick={onNavigateToModels}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 transition-colors"
      >
        Go to Models
      </button>
    </div>
  )
}
