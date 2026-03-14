import express from 'express'
import cors from 'cors'
import { execFile } from 'child_process'
import { readFile } from 'fs/promises'
import { promisify } from 'util'
import { parseNvidiaSmi, parseMeminfo } from './hardware'

const execFileAsync = promisify(execFile)

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

async function detectGpu() {
  // Try nvidia-smi first
  try {
    const { stdout } = await execFileAsync('nvidia-smi', [
      '--query-gpu=name,memory.total',
      '--format=csv,noheader,nounits',
    ])
    const parsed = parseNvidiaSmi(stdout)
    if (parsed) return parsed
  } catch {
    // nvidia-smi not available
  }

  // Try rocm-smi for AMD
  try {
    const { stdout } = await execFileAsync('rocm-smi', ['--showmeminfo', 'vram', '--json'])
    // rocm-smi JSON: { "card0": { "0 VRAM Total Memory (B)": "8589934592" } }
    const data = JSON.parse(stdout)
    const card = Object.values(data)[0] as Record<string, string>
    const vramBytes = parseInt(Object.values(card)[0] as string, 10)
    return { name: 'AMD GPU', vramGb: Math.round(vramBytes / (1024 ** 3)) }
  } catch {
    // rocm-smi not available
  }

  return { name: 'Unknown', vramGb: 0 }
}

async function detectRam() {
  try {
    const content = await readFile('/proc/meminfo', 'utf-8')
    return parseMeminfo(content)
  } catch {
    return { totalGb: 0 }
  }
}

app.get('/api/hardware', async (_req, res) => {
  const [gpu, ram] = await Promise.all([detectGpu(), detectRam()])
  res.json({ gpu, ram })
})

app.listen(PORT, () => {
  console.log(`Hardware server running on http://localhost:${PORT}`)
})
