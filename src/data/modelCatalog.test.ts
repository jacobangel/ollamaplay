import { describe, it, expect } from 'vitest'
import { filterByHardware, MODEL_CATALOG } from './modelCatalog'
import type { HardwareInfo } from '../store/useAppStore'

const hardware8gb: HardwareInfo = { gpu: { name: 'RTX 3070 Ti', vramGb: 8 }, ram: { totalGb: 32 } }
const hardwareUnknown: HardwareInfo = { gpu: { name: 'Unknown', vramGb: 0 }, ram: { totalGb: 16 } }

describe('filterByHardware', () => {
  it('returns models that fit in available VRAM', () => {
    const result = filterByHardware(MODEL_CATALOG, hardware8gb)
    expect(result.every(m => m.vramGb <= 8)).toBe(true)
  })

  it('excludes models that exceed VRAM', () => {
    const result = filterByHardware(MODEL_CATALOG, hardware8gb)
    const tooLarge = MODEL_CATALOG.filter(m => m.vramGb > 8)
    tooLarge.forEach(m => {
      expect(result.find(r => r.id === m.id)).toBeUndefined()
    })
  })

  it('returns full catalog when vramGb is 0 (unknown GPU)', () => {
    const result = filterByHardware(MODEL_CATALOG, hardwareUnknown)
    expect(result.length).toBe(MODEL_CATALOG.length)
  })

  it('returns full catalog when hardware is null', () => {
    const result = filterByHardware(MODEL_CATALOG, null)
    expect(result.length).toBe(MODEL_CATALOG.length)
  })

  it('excludes installed models by id', () => {
    const installed = [MODEL_CATALOG[0].id]
    const result = filterByHardware(MODEL_CATALOG, hardware8gb, installed)
    expect(result.find(m => m.id === installed[0])).toBeUndefined()
  })
})
