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
