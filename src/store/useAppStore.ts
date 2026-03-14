import { create } from 'zustand'

export interface OllamaModel {
  name: string
  size: number
  digest: string
  modified_at: string
}

export interface HardwareInfo {
  gpu: { name: string; vramGb: number }
  ram: { totalGb: number }
}

interface AppState {
  currentView: 'chat' | 'playground' | 'models'
  theme: 'dark' | 'light'
  activeModel: string | null
  installedModels: OllamaModel[]
  hardware: HardwareInfo | null
  pullingModel: string | null
  pullProgress: { completed: number; total: number } | null

  setView: (view: AppState['currentView']) => void
  setTheme: (theme: AppState['theme']) => void
  setActiveModel: (model: string | null) => void
  setInstalledModels: (models: OllamaModel[]) => void
  setHardware: (hardware: HardwareInfo | null) => void
  setPullingModel: (model: string | null) => void
  setPullProgress: (progress: { completed: number; total: number } | null) => void
}

// Exported for test resets — reads localStorage fresh each call so beforeEach({ localStorage.clear() }) works correctly
export function getInitialState() {
  return {
    currentView: 'chat' as const,
    theme: (localStorage.getItem('theme') as AppState['theme']) ?? 'dark',
    activeModel: null as string | null,
    installedModels: [] as OllamaModel[],
    hardware: null as HardwareInfo | null,
    pullingModel: null as string | null,
    pullProgress: null as { completed: number; total: number } | null,
  }
}

export const useAppStore = create<AppState>()((set) => ({
  ...getInitialState(),
  setView: (currentView) => set({ currentView }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
  setActiveModel: (activeModel) => set({ activeModel }),
  setInstalledModels: (installedModels) => set({ installedModels }),
  setHardware: (hardware) => set({ hardware }),
  setPullingModel: (pullingModel) => set({ pullingModel, pullProgress: null }),
  setPullProgress: (pullProgress) => set({ pullProgress }),
}))
