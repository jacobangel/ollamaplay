# OllamaPlay

A web UI for running and chatting with local Ollama models — featuring streaming chat, a parameter playground, and hardware-aware model management.

## Features

- **Chat** — Streaming conversation interface with any locally available Ollama model
- **Playground** — Adjust generation parameters (temperature, top-p, top-k, repeat penalty, seed) and view real-time performance stats (tokens/sec, eval duration)
- **Models** — Browse, pull, and delete models; hardware-aware filtering recommends models based on detected NVIDIA/AMD GPU or CPU-only setup
- **Dark mode** — Full dark theme support
- **Model catalog** — 10 curated models with metadata (size, tags, description)

## Prerequisites

- **Node.js 18+**
- **Ollama** running locally on port `11434` — [install Ollama](https://ollama.com)

## Getting Started

```bash
git clone <repo-url>
cd ollamaplay
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

The hardware detection server starts automatically on port `3001`.

## Project Structure

```
src/
  components/      # Shared UI components
  views/
    Chat/          # Streaming chat interface
    Playground/    # Params panel + streaming + perf stats
    Models/        # Pull/delete + hardware-aware catalog
  stores/          # Zustand state (chat, models, playground)
  hooks/           # Shared React hooks
server/
  hardware.ts      # Express server for GPU detection (port 3001)
e2e/               # Playwright end-to-end tests
```

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server + hardware API server |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run test` | Run Vitest unit tests |
| `npm run verify` | Lint + type-check + unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Vite) | `5173` | React SPA |
| Hardware API (Express) | `3001` | NVIDIA/AMD GPU detection via `nvidia-smi` / `rocm-smi` |
| Ollama | `11434` | Local LLM inference server (external dependency) |

The frontend proxies `/api/hardware` to port `3001` and calls Ollama's REST API directly.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **Express** for the hardware detection sidecar
- **Vitest** for unit tests
- **Playwright** for end-to-end tests
