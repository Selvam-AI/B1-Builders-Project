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

## Prompt 7

### User Prompt

> I accept recommendations 1. to 4. Complete pending in Phase 1 and Phase 2

### Decision Made

- Accepted the recommended AI behaviour:
  - Ollama-first real LLM mode.
  - Mock fallback enabled for demo safety.
  - Generate/cache recommendations by `slot + category`.
  - Keep LLM reasoning limited to video recommendation and safety review.

### Implementation Summary

- Completed Phase 1 documentation/scaffold cleanup.
- Completed Phase 2 backend core.
- Added SQLAlchemy database setup and session handling.
- Added ORM models for all project-specified tables.
- Added seed data for 9am-9pm hourly slots and Upper Body / Lower Body categories.
- Added backend status, time-slot, workout-category, and video-session read endpoints.
- Added `scripts/init_db.py` for local schema creation and seed setup.
- Added focused backend tests for Phase 2 core behaviour.

### Debug / Verification

- FastAPI `TestClient` hung in this environment, so tests were later adjusted to use `httpx.ASGITransport` for HTTP-style ASGI testing.
- Backend tests pass with `4 passed`.

## Prompt 8

### User Prompt

> 1.

### Context

The user chose option 1 from the previous recommendation: investigate and resolve the FastAPI `TestClient` issue before progressing into Phase 3.

### Debug Summary

- Reproduced the hang with a minimal FastAPI app, confirming the issue was not caused by this project's database, lifespan, or route code.
- The hang occurs inside Starlette `TestClient` through AnyIO's cross-thread portal.
- Downgrading Starlette from `1.0.0` to `0.52.1` and AnyIO from `4.13.0` to `4.9.0` did not make `TestClient` usable in this sandbox.
- `httpx.ASGITransport` works for async ASGI app testing and avoids the broken threaded portal.

### Implementation Summary

- Pinned `starlette==0.52.1` and `anyio==4.9.0` for a more stable FastAPI test/runtime stack.
- Converted current backend route handlers and database dependency to async-compatible definitions.
- Reworked Phase 2 tests to use `httpx.ASGITransport` for HTTP-style ASGI tests instead of Starlette `TestClient`.
- Verified backend tests pass and `pip check` reports no broken requirements.

## Prompt 9

### User Prompt

> do you validate email? how? If not validate, then we could keep it for future improvements.  guess access not permit dashboard/broadcast without login. yes to seed one local admin account. But what happens to it in production?  Update default admin account email and password in README.md. What it Token style, I think I am not concerned with it, choose what is best suited but document it with rationale. Member registration keep email optional. yes to Role handling.Yes to keep prototype security demo-appropriate. And yes to rest of prototype security level. Go ahead with next phase.

### Decision Summary

- Member email initially remained optional during registration; this was later superseded in Prompt 12 so member registration supports future login.
- If email is provided, it is validated with Pydantic `EmailStr` and `email-validator`.
- Dashboard and broadcast data require login; guests are limited to public status/auth routes.
- One local admin account is seeded for prototype evaluation.
- JWT bearer tokens are used for the prototype because they are simple for React/FastAPI API calls and avoid server-side sessions.
- Security remains demo-appropriate, with production hardening documented as future work.

### Implementation Summary

- Added auth schemas, security helpers, auth service functions, and seeded admin support.
- Added member registration, login, current-user, and admin-summary endpoints.
- Protected dashboard/broadcast data routes with authenticated-user guards.
- Added role-based admin restrictions.
- Updated README, installation notes, and the implementation plan with admin credentials, token rationale, email validation behaviour, and production notes.
- Added Phase 3 tests for registration, email validation, login, admin access, member restriction, and guest restriction.
- Superseded by Prompt 12: member registration now requires email.

### Debug / Refinement

- Changed the default admin email to `admin@example.com` because `.local` domains can fail strict email validation.
- Pinned `bcrypt==4.0.1` because newer bcrypt releases removed metadata that `passlib` expects, causing noisy startup warnings.

## Prompt 10

### User Prompt

> update Default local admin information README.md. Regarding harmless passlib deprecation warning, did you  install bcrypt version 4.x, not 5.x. Example dependency: bcrypt<5
> passlib ? My Codex message says rate limit resets on 5:31 pm, does this mean you won't be able to process this prompt?

### Response / Implementation Summary

- Confirmed the local environment uses `bcrypt 4.0.1` and `passlib 1.7.4`; bcrypt 5.x is not installed.
- Kept the stricter dependency pin `bcrypt==4.0.1` because it avoids compatibility warnings better than the broader `bcrypt<5` range.
- Updated README default local admin information to show the seeded environment variables, prototype-only warning, and bcrypt/passlib note.
- Clarified that the Codex rate-limit message is an account/product quota notice, not a blocker for the current processed prompt.

## Prompt 11

### User Prompt

> what are pending unresolved issues? what decision are pending to move to next phase?

### Response Summary

- Reviewed implementation plan, README, prompt log, and current worktree state.
- Identified no blocking unresolved issue for moving into Phase 4.
- Listed known non-blocking technical notes and the small Phase 4 decisions needed before implementation.

## Prompt 12

### User Prompt

> Decision regarding unresolved issue:
> Proceed to Phase 4. Authentication is acceptable for prototype use.
>
> Resolved:
> - Default admin email changed to admin@example.com.
> - bcrypt pinned to 4.0.1.
> - TestClient replaced by httpx.ASGITransport.
>
> Accepted limitations:
> - passlib Python 3.12 warning is non-blocking.
> - Production-grade auth features are deferred.
> - Member registration will require email to support future login.
> - Guest access remains separate and does not require email.
>
> Worktree has many Phase 1-3 changes, commit it. Will resolve pending decisions for Phase 4 in next prompt.

### Decision / Implementation Summary

- Recorded Phase 3 authentication as acceptable for prototype use.
- Updated member registration to require email while keeping guest access separate.
- Kept accepted limitations documented: passlib warning is non-blocking and production-grade auth is deferred.
- Prepared the Phase 1-3 worktree for commit after verification.

## Prompt 13

### User Prompt

> my last git commit : commit e5501f3b8e526967e5858e56298edb89e03e9ef1 , if this true, continue wtih git commit and push.

### Response / Implementation Summary

- Verified `e5501f3b8e526967e5858e56298edb89e03e9ef1` is the current `HEAD`.
- Confirmed Phase 1-3 changes were staged on `main`.
- Proceeded with commit and push workflow.

## Prompt 14

### User Prompt

> I agree with suggested Phase 4 default: implement reserve/cancel endpoints, enforce 20-member capacity, prevent duplicate reservations for the same member and slot, and add admin occupancy summary. Continue

### Decision / Implementation Summary

- Implemented Phase 4 slot scheduling using deterministic backend/database rules.
- Added member reservation create, list, and cancel endpoints.
- Added admin occupancy summary endpoint.
- Enforced one reservation per member per time slot.
- Enforced slot capacity using the seeded capacity value, defaulting to 20.
- Added Phase 4 tests for reserve/cancel, duplicate prevention, capacity rejection, admin occupancy, and member/admin access control.

## Prompt 15

### User Prompt

> If the unresolved issues do not obstruct next phase, keep moving. git commit after phase 5 implementation. I agree with suggestion for phase 5. proceed.

### Decision / Implementation Summary

- Proceeded to Phase 5 because the remaining issues were non-blocking.
- Implemented cached video recommendation creation through `video_sessions`.
- Added provider-aware recommendation service with a LiteLLM review hook and mock fallback for demo reliability.
- Added direct recommendation endpoint and automatic recommendation creation after reservation.
- Added tests for recommendation creation, cache reuse, reservation-triggered creation, and guest access restriction.
- Prepared to commit after Phase 5 verification.
