# PROMPTS_IMPLEMENTATION.md

This document records prompts, AI suggestions, decisions, and implementation summaries for Project 2. It is maintained so evaluators can review how AI was used as a co-developer.

## Prompt 1

### User Prompt

> I am developing a full stack browser dashboard application as project 2. Refer to the HTML for the Project Delieverables / suggested folder structure. Build file structure scaffold based on suggestion, in accordance with the project_specification.txt. You will then provide a project implementation plan, break down into phases, place the .md document in project 2/ docs folder. You will document every prompt and  a summary of your suggestion, solution given or implementation in projects 2/docs/PROMPTS_IMPLEMENTATION.md. README.md will be written for an audience that is evaluating me as a AI-project developer (for context read HTML), the README.md requirements are specified in HTML. Any questions regarding this prompt be brief.

### Context Reviewed

- `Project_specification.md`
- `PROMPTS_PROJECT_DEVELOPMENT.md`
- `Documents/B1 Builders Programme.html`

### Summary of Requirements Identified

- Project 2 is a team, department, or organisational use project.
- Both frontend and backend components are required.
- The repository should follow the suggested structure:
  - `README.md`
  - `LICENSE`
  - `.gitignore`
  - dependency files
  - `src/`
  - `tests/`
  - `docs/`
  - `scripts/`
  - `assets/`
  - `data/`
- README should include:
  - Project title
  - Overview
  - Problem
  - Outcome
  - Demo
  - Technology stack
  - Development approach with AI
  - Installation
  - Usage
  - Project structure
  - Reflection
- FitHub AI specification requires:
  - Member registration and login
  - Guest limited dashboard access
  - Admin monitoring and override
  - Hourly slots from 9am-9pm
  - Maximum 20 signed-in members per slot
  - Upper Body and Lower Body workout categories
  - AI-selected safe approximately 10-minute workout videos
  - CrewAI agents: Trainer, Safety Checker, Schedule, Admin Assistant
  - Feedback via like/dislike
  - React/Vite frontend
  - Python/FastAPI backend
  - SQLite database
  - SQLAlchemy ORM

### AI Suggestion

Create a lightweight but realistic full stack scaffold that keeps the required top-level deliverable structure while separating implementation code into:

- `src/backend/` for FastAPI, database models, services, and AI agents.
- `src/frontend/` for the React/Vite browser dashboard.
- `docs/` for evaluator-facing planning and prompt documentation.

The scaffold should avoid over-engineering at this stage and keep the project demonstrable for an interview.

### Solution Implemented

- Created the requested folder scaffold.
- Added backend starter package with FastAPI app and API status route.
- Added frontend Vite/React starter files with a FitHub AI dashboard placeholder.
- Added `.env.example`, `.gitignore`, `requirements.txt`, and root `package.json`.
- Added `README.md` written for B1 Builders evaluators.
- Added `docs/IMPLEMENTATION_PLAN.md` with phased delivery plan.
- Added this prompt and implementation log.

### Key Decisions

- Used `src/backend/` and `src/frontend/` inside the required `src/` folder to keep the full stack layout clear.
- Kept the top-level structure aligned with the programme document.
- Included both `requirements.txt` and `package.json` because the project uses Python backend and JavaScript frontend tooling.
- Added placeholder code rather than full features in this scaffold phase so future implementation can proceed in focused phases.
- Treated prompt documentation as a living project artifact, not a final-only report.

## Prompt 2

### User Prompt

> what packages need to be installed? what Applications To Install? Inspect,install yourself if you can, if not list what needs to be installed with installation commands. Remember to document the prompts,  refine outputs, and debug issues.

### Inspection Performed

- Inspected local development tools.
- Installed backend dependencies into `.venv`.
- Checked backend scaffold startup and imports.
- Identified missing frontend system tools.

### Results

- Installed Python backend dependencies successfully.
- Confirmed Python, Git, SQLite, and VS Code CLI are available.
- Confirmed Node.js and npm were missing at that point, so frontend packages were pending then.
- Could not install Node.js/npm automatically because system package installation requires unavailable sudo access.
- Later verification confirmed Node.js and npm became available, and frontend dependencies/build were corrected.

### Debug Issue Found

CrewAI needed workspace-local storage configuration in this restricted environment.

### Refinement / Solution

- Added `CREWAI_STORAGE_DIR=.crewai-storage` and `CREWAI_TRACING_ENABLED=false` to `.env.example`.
- Added `.crewai-storage/` and `.local/` to `.gitignore`.
- Verified backend imports using workspace-local CrewAI storage.

### Documentation Added

- Created `docs/INSTALLATION_NOTES.md` with the installation status and remaining setup commands.

## Prompt 3

### User Prompt

> I have obtianed YOUTUBE_API_KEY and OPEN_API_KEY, but my openAI credits are $0, so API request will fail. Another Agent recommended I use Ollama locally, completely free, CrewAI can connect to local Ollama instead of OpenAI API. Is this a correct suggestion? Will my application be able to perform - AI reasoning, Agent decision-making without OpenAI API key? Do I even need OpenAI API key or Ollama in the first place?

### Summary of Guidance

- Confirmed from the installed CrewAI package that CrewAI supports Ollama through its `LLM` configuration and LiteLLM-style provider routing.
- Recommended treating the LLM provider as configurable rather than hard-coding OpenAI.
- Clarified that real CrewAI reasoning needs some LLM provider, but it does not have to be OpenAI.
- Clarified that the prototype can still run core dashboard features with deterministic or mock recommendation logic if no LLM is available.
- Added safe placeholder LLM provider settings to `.env.example` without reading or exposing local secrets from `.env`.

## Prompt 4

### User Prompt

> Alright  I agree with you suggestion. At this juncture I make the decision to use Ollama inplace of OpenAI inorder for CrewAI to perform real reasoning. Update PROMPTS_IMPLEMENATION about the decision made and reason why. Update requirements.txt , Installation_note.md etc about. In .env and config add flag options to swtich between OpenAI and Ollama, but the default being Ollama. So the fallback could be mock/rule-based recommender for this prototype.  Remember to keep .env and .envexample same (except .envexample secrets are empty). What is the next step to take?

### Decision Made

- Ollama is now the default LLM provider for CrewAI reasoning.
- OpenAI remains an optional provider for later use if credits are available.
- The prototype will support mock/rule-based recommendation fallback for demos when no LLM is available.

### Reason

- OpenAI API calls may fail because the available OpenAI credits are currently `$0`.
- Ollama allows local, free LLM execution, which keeps the prototype demonstrable while still supporting real CrewAI agent reasoning.
- A mock fallback protects the demo from local model, API key, or connectivity issues.

### Implementation Summary

- Added provider flags to `.env`, `.env.example`, and backend config.
- Set Ollama as the default provider with `MODEL=ollama/llama3`.
- Added `litellm==1.82.6` to `requirements.txt` because CrewAI uses LiteLLM for provider routing such as Ollama.
- Updated installation notes, README, and implementation plan to reflect Ollama-first AI reasoning with OpenAI optional fallback.

### Debug / Verification

- Initial `litellm>=1.70.0` install selected a newer LiteLLM release that conflicted with CrewAI's OpenAI dependency.
- Pinned `litellm==1.82.6`, which works with `openai>=2.30.0,<3`.
- Verified `pip check` reports no broken requirements.
- Verified `.env` and `.env.example` have the same keys, with `.env.example` keeping secret values empty.
- Verified backend config reads Ollama as the default provider.

## Prompt 5

### User Prompt

> I have installed ollama , with WARNING: No NVIDIA/AMD GPU detected. Ollama will run in CPU-only mode. How will this issue affect performance of this application. hwo to resolve this?  ollama pull ...,  done with success. ollama serve - ollama serve returned - Error: listen tcp 127.0.0.1:11434: bind: address already in use

### Guidance / Debug Summary

- Confirmed Ollama is already responding on `127.0.0.1:11434`.
- Confirmed `llama3:latest` is installed.
- Explained that `bind: address already in use` means another Ollama server is already listening, so the app can use the existing server.
- Confirmed CPU-only Ollama works but can be slow; a tiny generation test completed successfully but took about 58 seconds.
- Recommended short prompts, caching recommendations by slot/category, and keeping mock/rule-based fallback enabled for demo reliability.
- Updated installation notes with the `ollama serve` explanation and CPU-only performance guidance.

## Prompt 6

### User Prompt

> Take note of the rules in the agent workflow as suggested above for implementation. The next development step is to implement the backend AI service wrapper: one interface that can call Ollama via CrewAI/LiteLLM, optionally switch to OpenAI, and fall back to mock/rule-based recommendation when needed. Are there decisions I must make at this stage? At what stage are we in the implementation plan / phases after this?

### Decision / Planning Summary

- Recorded the internal agent workflow rules in the implementation plan.
- Confirmed users should not interact directly with CrewAI.
- Confirmed normal user actions should read stored/cached state instead of waiting for LLM calls.
- Identified the next implementation unit as the backend AI service wrapper with provider switching and mock fallback.
