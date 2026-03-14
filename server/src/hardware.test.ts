// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { parseNvidiaSmi, parseMeminfo } from './hardware'

describe('parseNvidiaSmi', () => {
  it('parses valid nvidia-smi output', () => {
    const output = 'NVIDIA GeForce RTX 3070 Ti, 8192'
    const result = parseNvidiaSmi(output)
    expect(result).toEqual({ name: 'NVIDIA GeForce RTX 3070 Ti', vramGb: 8 })
  })

  it('rounds VRAM correctly (8192 MB → 8 GB)', () => {
    const result = parseNvidiaSmi('RTX 4090, 24576')
    expect(result?.vramGb).toBe(24)
  })

  it('returns null for empty input', () => {
    expect(parseNvidiaSmi('')).toBeNull()
  })

  it('returns null for malformed input', () => {
    expect(parseNvidiaSmi('not valid output')).toBeNull()
  })
})

describe('parseMeminfo', () => {
  it('parses /proc/meminfo total RAM', () => {
    const output = `MemTotal:       32768000 kB\nMemFree:        16384000 kB\n`
    const result = parseMeminfo(output)
    expect(result.totalGb).toBeCloseTo(32, 0)
  })

  it('returns 0 for empty/malformed input', () => {
    expect(parseMeminfo('').totalGb).toBe(0)
  })
})
