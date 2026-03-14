import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore, getInitialState } from './useAppStore'

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState(getInitialState())
})

describe('useAppStore', () => {
  it('starts with dark theme by default', () => {
    expect(useAppStore.getState().theme).toBe('dark')
  })

  it('setTheme updates theme and persists to localStorage', () => {
    useAppStore.getState().setTheme('light')
    expect(useAppStore.getState().theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('setActiveModel updates activeModel', () => {
    useAppStore.getState().setActiveModel('llama3.2:3b')
    expect(useAppStore.getState().activeModel).toBe('llama3.2:3b')
  })

  it('setView updates currentView', () => {
    useAppStore.getState().setView('playground')
    expect(useAppStore.getState().currentView).toBe('playground')
  })

  it('setPullingModel and setPullProgress update pull state', () => {
    useAppStore.getState().setPullingModel('mistral:7b')
    useAppStore.getState().setPullProgress({ completed: 500, total: 1000 })
    expect(useAppStore.getState().pullingModel).toBe('mistral:7b')
    expect(useAppStore.getState().pullProgress).toEqual({ completed: 500, total: 1000 })
  })

  it('setPullingModel resets pullProgress to null', () => {
    useAppStore.getState().setPullingModel('mistral:7b')
    useAppStore.getState().setPullProgress({ completed: 500, total: 1000 })
    useAppStore.getState().setPullingModel(null)
    expect(useAppStore.getState().pullProgress).toBeNull()
  })

  it('setInstalledModels replaces list', () => {
    const models = [{ name: 'llama3.2:3b', size: 2000000000, digest: 'abc', modified_at: '' }]
    useAppStore.getState().setInstalledModels(models)
    expect(useAppStore.getState().installedModels).toEqual(models)
  })
})
