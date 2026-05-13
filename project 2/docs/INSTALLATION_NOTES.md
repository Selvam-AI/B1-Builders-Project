# Installation Notes

## Applications To Install

Available:

- Python 3.12.3
- Git 2.43.0
- SQLite CLI 3.50.6
- VS Code CLI 1.119.0
- Node.js 18.19.1
- npm 9.2.0

Still needed for Ollama reasoning:

- Ollama
- Local model, currently `llama3`

Optional:

- SQLite Browser
- Modern browser

## Python Packages Installed

Installed into `.venv`:

- FastAPI / Uvicorn
- SQLAlchemy / SQLite support
- Pydantic / Pydantic Settings
- Authentication helpers
- CrewAI / LiteLLM
- Ollama as the default local LLM provider
- OpenAI as an optional paid LLM provider
- YouTube API client
- pytest / httpx

## Local LLM Setup

Default AI reasoning provider:

- Ollama
- Model setting: `MODEL=ollama/llama3`
- Base URL: `BASE_URL=http://localhost:11434`

Install and prepare Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3
ollama serve
```

If `ollama serve` returns `bind: address already in use`, Ollama is usually already running on `127.0.0.1:11434`. Confirm with:

```bash
curl http://127.0.0.1:11434/api/tags
```

CPU-only mode is acceptable for this prototype, but responses can be slow. Keep prompts short, cache selected video recommendations by slot/category, and keep mock fallback enabled for demo reliability.

OpenAI remains optional. To switch later, set:

```bash
AI_LLM_PROVIDER=openai
MODEL=openai/gpt-4o-mini
OPENAI_API_KEY=your_key_here
```

If no LLM is available during a demo, use the mock/rule-based recommender fallback:

```bash
AI_RECOMMENDER_MODE=mock
AI_ALLOW_MOCK_FALLBACK=true
```

## Frontend Packages

Installed through `src/frontend/package.json`:

- React / React DOM
- Vite / TypeScript
- lucide-react
- Vitest

Refresh frontend dependencies with:

```bash
cd src/frontend
npm install
```

## System Installation Commands

Optional:

```bash
sudo apt install -y sqlitebrowser
```

## Debug Notes

CrewAI needs workspace-local storage in this environment:

```bash
CREWAI_STORAGE_DIR=.crewai-storage
CREWAI_TRACING_ENABLED=false
```

LiteLLM is pinned at `1.82.6` because newer `1.83.x` releases conflict with the installed CrewAI/OpenAI dependency combination.
