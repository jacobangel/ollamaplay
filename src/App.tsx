import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { useHardware } from './hooks/useHardware'
import { listModels } from './hooks/useOllama'
import { Header } from './components/Header'

// Views — stubs are created in this task, full implementations in subsequent tasks
import { ChatView } from './components/ChatView'
import { PlaygroundView } from './components/PlaygroundView'
import { ModelsView } from './components/ModelsView'

export default function App() {
  const { theme, currentView, setInstalledModels, setActiveModel } = useAppStore()

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Fetch hardware info on mount
  useHardware()

  // Fetch installed models on mount and after changes
  useEffect(() => {
    listModels()
      .then(models => {
        setInstalledModels(models)
        if (models.length > 0) setActiveModel(models[0].name)
      })
      .catch(() => setInstalledModels([]))
  }, [setInstalledModels, setActiveModel])

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-1 overflow-hidden">
        {currentView === 'chat' && <ChatView />}
        {currentView === 'playground' && <PlaygroundView />}
        {currentView === 'models' && <ModelsView />}
      </main>
    </div>
  )
}
