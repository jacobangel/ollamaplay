export interface GpuInfo {
  name: string
  vramGb: number
}

export interface RamInfo {
  totalGb: number
}

/**
 * Parse output of: nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits
 * Expected format: "NVIDIA GeForce RTX 3070 Ti, 8192"
 */
export function parseNvidiaSmi(output: string): GpuInfo | null {
  const trimmed = output.trim()
  if (!trimmed) return null

  const lastComma = trimmed.lastIndexOf(',')
  if (lastComma === -1) return null

  const name = trimmed.slice(0, lastComma).trim()
  const vramMb = parseInt(trimmed.slice(lastComma + 1).trim(), 10)

  if (!name || isNaN(vramMb)) return null

  return { name, vramGb: Math.round(vramMb / 1024) }
}

/**
 * Parse /proc/meminfo content to extract total RAM in GB.
 */
export function parseMeminfo(content: string): RamInfo {
  const match = content.match(/MemTotal:\s+(\d+)\s+kB/)
  if (!match) return { totalGb: 0 }
  // /proc/meminfo reports kB (kibibytes). Convert: kB → MB (÷1024) → GB (÷1000)
  return { totalGb: parseInt(match[1], 10) / 1024 / 1000 }
}
