# FitHub AI

AI-assisted social workout club portal for team and organisational use.

## Overview

FitHub AI is Project 2 for the B1 Builders Programme: a full stack browser dashboard prototype where members reserve hourly workout slots, join shared workout sessions, watch AI-selected workout videos, and give feedback that improves later recommendations.

The project is designed to demonstrate AI-assisted full stack development, multi-user shared-resource coordination, prompt-driven planning, and responsible use of agent workflows.

### Problem

- Team workout groups, student clubs, and small organisations need a simple way to coordinate shared workout sessions without exceeding room, network, or facilitator capacity.
- Manual video selection can be inconsistent, too intense for general users, or unrelated to the session category.
- Admins need visibility into slot occupancy, selected videos, and feedback without managing the session manually.

### Outcome

- Planned prototype for member registration, login, time-slot reservation, authenticated workout broadcast, feedback, and admin monitoring.
- AI workflow design using CrewAI-style agents for training video selection, safety review, scheduling, and admin summaries.
- Scaffolded repository ready for incremental implementation with React/Vite frontend, FastAPI backend, SQLite persistence, and SQLAlchemy models.

---

## Demo

The first implementation target is a browser dashboard with the following user journey:

1. A guest can reach the application but must register or sign in before accessing the dashboard or workout broadcast.
2. A member registers or signs in with name, email, age, and preferred workout slots.
3. The member selects an hourly slot between 9am and 9pm, subject to a 20-member capacity limit.
4. The AI workflow selects a safe, approximately 10-minute workout video for the active category.
5. Members like or dislike the video after the session.
6. An admin views slot occupancy, active video sessions, and feedback summaries.

Screenshots, GIFs, or a demo video will be added under `assets/screenshots/` as the UI is implemented.

---

## Technology Stack

### Frontend components:

- React for dashboard views and user interaction.
- Vite for fast local development.
- Browser-based UI for members, guests, and admins.

### Backend components:

- Python and FastAPI for REST APIs.
- SQLite for local prototype storage.
- SQLAlchemy for ORM-based database access.
- CrewAI for multi-agent orchestration.
- Ollama for free local agent reasoning by default.
- OpenAI API as an optional paid LLM provider.
- YouTube Data API v3 for workout video search and metadata.

---

## Development Approach with AI

- Codex is used as an AI co-developer for repository scaffolding, planning, documentation, implementation, review, and debugging.
- AI work is documented in `docs/PROMPTS_IMPLEMENTATION.md` so evaluators can see the prompts, suggestions, decisions, and implementation summaries.
- Key agents planned for the application:
  - Trainer Agent: selects workout videos and reviews feedback.
  - Safety Checker Agent: rejects unsafe, unrelated, or overly intense videos.
  - Schedule Agent: monitors occupancy and enforces slot capacity.
  - Admin Assistant Agent: generates operational summaries for admins.
- Review points will focus on whether AI output is safe, explainable, scoped to the prototype, and aligned with the B1 Builders evaluation requirements.

---

## Installation

Backend setup:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

Frontend setup:

```bash
cd src/frontend
npm install
```

Create environment configuration:

```bash
cp .env.example .env
```

Then fill in API keys when the AI and YouTube integrations are implemented.

By default, the AI reasoning path is configured for local Ollama:

```bash
AI_LLM_PROVIDER=ollama
MODEL=ollama/llama3
BASE_URL=http://localhost:11434
```

OpenAI can be enabled later by changing `AI_LLM_PROVIDER`, `MODEL`, and `OPENAI_API_KEY`.

Default local admin account:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

This account is seeded only when `SEED_ADMIN=true` and is intended for local prototype evaluation. In production, set `SEED_ADMIN=false`, do not use the default password, and provision admin users through a secure operational process.

Password hashing uses `passlib` with bcrypt. The project pins `bcrypt==4.0.1` to avoid bcrypt 5.x compatibility issues with `passlib`.

---

## Usage

Run the backend API:

```bash
uvicorn src.backend.app.main:app --reload
```

Run the frontend dashboard:

```bash
cd src/frontend
npm run dev
```

Expected prototype behaviour:

- Guests can access public status only; dashboard and broadcast data require login.
- Members can register, sign in, reserve or cancel available slots, and submit video feedback.
- Admins can monitor slot occupancy, review feedback, and override the selected video when required.

Authentication and roles:

- The backend uses JWT bearer tokens for the prototype API. JWTs are a good fit here because the React frontend can send a standard `Authorization: Bearer <token>` header without server-side session storage.
- Member registration requires email so users can sign in again later. Email is validated with Pydantic `EmailStr` and the `email-validator` package.
- Guest access remains separate from member registration and does not require email.
- Roles are enforced in backend dependencies: member routes require a valid token, and admin routes require an admin token.

Slot scheduling:

- Hourly slots run from 9am to 9pm with a maximum capacity of 20 members per slot.
- Members cannot reserve the same slot more than once.
- A full slot returns a clear API conflict response instead of overbooking.
- Slot scheduling uses deterministic database logic, not LLM reasoning.

AI video recommendations:

- The backend creates or returns a cached video session for each `time_slot + workout_category` pair.
- Reserving a slot automatically ensures a video recommendation exists for that slot/category.
- Ollama is the default LLM provider, OpenAI remains optional, and mock fallback keeps the demo working if no LLM or YouTube API is available.
- When provider settings are available, the recommendation service can request a short LiteLLM safety review before saving the video session.
- Recommendation decisions are stored in `video_sessions` with provider, status, safety notes, and agent summary fields.

---

## Project Structure

```text
project 2/
├── README.md
├── LICENSE
├── .gitignore
├── requirements.txt
├── package.json
├── src/
│   ├── backend/
│   │   └── app/
│   │       ├── agents/
│   │       ├── api/
│   │       ├── core/
│   │       ├── models/
│   │       ├── schemas/
│   │       ├── services/
│   │       └── main.py
│   └── frontend/
│       ├── public/
│       └── src/
├── tests/
├── docs/
├── scripts/
├── assets/
└── data/
```

- `src/backend/` contains the FastAPI application, database models, services, and AI agent orchestration.
- `src/frontend/` contains the React/Vite dashboard application.
- `tests/` contains backend and frontend tests.
- `docs/` contains project planning, implementation notes, and AI prompt documentation.
- `scripts/` contains automation and developer utilities.
- `assets/` stores screenshots, demo media, and visual assets.
- `data/` stores local SQLite data or seed files for the prototype.

Initialize the local SQLite schema and seed data without starting the API:

```bash
.venv/bin/python scripts/init_db.py
```

---

## Reflection

This scaffold prioritises a small, demonstrable prototype rather than enterprise architecture. The main design decision is to keep the project easy to explain during interview assessment while still showing a complete full stack path: frontend views, backend APIs, database persistence, AI agent reasoning, external video search, and evaluator-visible prompt documentation.
