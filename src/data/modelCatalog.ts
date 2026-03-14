import type { HardwareInfo } from '../store/useAppStore'

export interface ModelEntry {
  id: string
  name: string
  params: string
  vramGb: number
  maker: string
  description: string
}

export const MODEL_CATALOG: ModelEntry[] = [
  { id: 'llama3.2:1b', name: 'Llama 3.2', params: '1B', vramGb: 0.9, maker: 'Meta', description: 'Smallest Llama, fast and lightweight' },
  { id: 'llama3.2:3b', name: 'Llama 3.2', params: '3B', vramGb: 2.0, maker: 'Meta', description: 'Compact Llama with solid reasoning' },
  { id: 'gemma2:2b', name: 'Gemma 2', params: '2B', vramGb: 1.6, maker: 'Google', description: 'Efficient small model from Google' },
  { id: 'gemma2:9b', name: 'Gemma 2', params: '9B', vramGb: 5.5, maker: 'Google', description: 'Larger Gemma, strong instruction following' },
  { id: 'mistral:7b', name: 'Mistral', params: '7B', vramGb: 4.1, maker: 'Mistral AI', description: 'Fast, capable 7B model' },
  { id: 'llama3.1:8b', name: 'Llama 3.1', params: '8B', vramGb: 4.7, maker: 'Meta', description: 'Well-rounded 8B from Meta' },
  { id: 'deepseek-r1:7b', name: 'DeepSeek R1', params: '7B', vramGb: 4.7, maker: 'DeepSeek', description: 'Reasoning-focused model' },
  { id: 'qwen2.5:7b', name: 'Qwen 2.5', params: '7B', vramGb: 4.4, maker: 'Alibaba', description: 'Strong multilingual model' },
  { id: 'phi4:14b', name: 'Phi 4', params: '14B', vramGb: 8.5, maker: 'Microsoft', description: 'Microsoft small model punching above its weight' },
  { id: 'llama3.1:70b', name: 'Llama 3.1', params: '70B', vramGb: 40.0, maker: 'Meta', description: 'Flagship Meta model — needs serious VRAM' },
]

export function filterByHardware(
  catalog: ModelEntry[],
  hardware: HardwareInfo | null,
  installedIds: string[] = [],
): ModelEntry[] {
  const available = hardware === null || hardware.gpu.vramGb === 0
    ? catalog
    : catalog.filter(m => m.vramGb <= hardware.gpu.vramGb)

  return available.filter(m => !installedIds.includes(m.id))
}
