import { useAppStore } from '../store/useAppStore'

export function Header() {
  const { currentView, setView, theme, setTheme, activeModel, installedModels, setActiveModel } =
    useAppStore()

  return (
    <header className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      {/* Brand */}
      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm tracking-tight">
        ollama<span className="font-normal text-gray-700 dark:text-gray-300">play</span>
      </span>

      {/* Model switcher */}
      <div className="flex items-center gap-1.5">
        {activeModel && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        )}
        <select
          value={activeModel ?? ''}
          onChange={e => setActiveModel(e.target.value || null)}
          className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1 text-xs text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select model...</option>
          {installedModels.map(m => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Nav tabs */}
      <nav className="flex gap-0.5 ml-auto">
        {(['chat', 'playground', 'models'] as const).map(view => (
          <button
            key={view}
            onClick={() => setView(view)}
            className={`px-3 py-1 rounded-md text-xs capitalize transition-colors ${
              currentView === view
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {view}
          </button>
        ))}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="px-2 py-1 rounded-md text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </header>
  )
}
