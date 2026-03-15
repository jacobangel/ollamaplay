# Backlog

## Done

- [x] fix: dark mode class strategy (Tailwind v4 `@custom-variant`)
- [x] fix: pull model progress NaN guard (division by zero when `total: 0`)
- [x] fix: pull model error feedback (no error shown on failure)

## Open

### Features

- [ ] **Markdown rendering in chat** — Assistant messages render markdown (headers, bold, code blocks, tables) via `react-markdown` + `remark-gfm` + `rehype-highlight`. User messages stay plain text.

- [ ] **Per-model chat contexts** — Each model maintains its own independent conversation history. Switching models shows that model's history (empty on first use). Requires moving message state from `ChatView` local state into the Zustand store, keyed by model name.

- [ ] **Side-by-side LLM comparison in Playground** — Add a second model selector to the Playground. When a second model is chosen, the output area splits into two columns and both models stream in parallel with the same prompt and params. Reverts to single-column when second model is cleared.

- [ ] **Containerization** — Docker Compose setup with three services: Nginx (frontend, port 80), hardware API (Node, port 3001), Ollama (port 11434). Nginx proxies `/api/hardware` and `/ollama` so the frontend has no hardcoded `localhost` references. NVIDIA GPU passthrough supported optionally. `npm run dev` unchanged.
