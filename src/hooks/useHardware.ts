import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useHardware() {
  const setHardware = useAppStore(s => s.setHardware)

  useEffect(() => {
    fetch('http://localhost:3001/api/hardware')
      .then(r => r.json())
      .then(setHardware)
      .catch(() => setHardware(null)) // treat detection failure as unknown hardware
  }, [setHardware])
}
