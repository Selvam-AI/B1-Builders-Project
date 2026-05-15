# FitHub AI

Deterministic social workout club portal for team and organisational use, with optional AI-assisted video review.

## Overview

FitHub AI is Project 2 for the B1 Builders Programme: a full stack browser dashboard prototype where members reserve hourly workout slots, join shared workout sessions, watch curated workout videos, and give feedback that improves later recommendations.

The project is designed to demonstrate AI-assisted development practice, multi-user shared-resource coordination, prompt-driven planning, and deterministic backend services.

### Problem

- Team workout groups, student clubs, and small organisations need a simple way to coordinate shared workout sessions without exceeding room, network, or facilitator capacity.
- Manual video selection can be inconsistent, too intense for general users, or unrelated to the session category.
- Admins need visibility into slot occupancy, selected videos, and feedback without managing the session manually.

### Outcome

- Planned prototype for member registration, login, time-slot reservation, authenticated workout broadcast, feedback, and admin monitoring.
- Deterministic video-curation workflow for training video selection, playback confirmation, cache rotation, scheduling, and admin summaries.
- Scaffolded repository ready for incremental implementation with React/Vite frontend, FastAPI backend, SQLite persistence, and SQLAlchemy models.

---

## Demo

The first implementation target is a browser dashboard with the following user journey:

1. A visitor can reach the landing page but must register or sign in before accessing the dashboard or workout broadcast.
2. A member registers or signs in with name, email, age, and preferred workout slots.
3. The member selects an hourly slot between 9am and 9pm, subject to a 20-member capacity limit.
4. The video curator selects a safe, approximately 10-minute workout video for the active category.
5. Members like or dislike the video after the session.
6. An admin views slot occupancy, active video sessions, and feedback summaries.

Screenshots, GIFs, or a demo video will be added under `assets/screenshots/` as the UI is implemented.

---

## Technology Stack

### Frontend components:

- React for dashboard views and user interaction.
- Vite for fast local development.
- Browser-based UI for members and admins.

### Backend components:

- Python and FastAPI for REST APIs.
- SQLite for local prototype storage.
- SQLAlchemy for ORM-based database access.
- LiteLLM/Ollama for optional local safety-review summaries.
- OpenAI API as an optional paid LLM provider.
- YouTube Data API v3 for workout video search and metadata.

---

## Development Approach with AI

- Codex is used as an AI co-developer for repository scaffolding, planning, documentation, implementation, review, and debugging.
- AI work is documented in `docs/PROMPTS_IMPLEMENTATION.md` so evaluators can see the prompts, suggestions, decisions, and implementation summaries.
- CrewAI was considered earlier, but the implementation now keeps core behaviour deterministic for reliability, testability, and faster local demos.
- The main service roles are:
  - Member Experience services: auth, reservations, broadcast join/exit, and feedback.
  - Video Curator service: deterministic YouTube candidate search, playable cache, least-played selection, play-count rotation, and playback confirmation.
  - Admin Oversight services: occupancy, feedback summaries, member management, and video-cache visibility.
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

Then fill in API keys for YouTube and optional OpenAI use.

Set `DEBUG=true` during local demos when you want `[FitHub AI]` diagnostic logs in the backend terminal and browser console. Set it to `false` when you want quieter output.

Optional LLM review can be configured for local Ollama:

```bash
AI_RECOMMENDER_MODE=llm
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

Start a new local demo session from the project root with two terminals.

Terminal 1, backend API on port `8000`:

```bash
./scripts/start_backend_local.sh
```

Terminal 2, React SPA on port `5173`:

```bash
./scripts/start_frontend_local.sh
```

Open the application:

```text
Local frontend SPA: http://127.0.0.1:5173/
Local backend API docs: http://127.0.0.1:8000/docs
Local backend health check: http://127.0.0.1:8000/health
```

For a LAN/VM demo that another computer can open, start both servers on `0.0.0.0`:

```bash
./scripts/start_backend_lan.sh
```

```bash
./scripts/start_frontend_lan.sh
```

Then open the printed LAN URL from the host machine or another computer on the same reachable network:

```text
LAN frontend SPA: http://<VM_IP>:5173/
LAN backend API docs: http://<VM_IP>:8000/docs
LAN backend health check: http://<VM_IP>:8000/health
```

Use the actual VM IP address printed by the start scripts in place of `<VM_IP>`. For example:

```text
Frontend SPA: http://10.0.2.15:5173/
Backend API docs: http://10.0.2.15:8000/docs
```

If `http://<VM_IP>:5173/` does not open from the host machine, check the VM network mode first. NAT addresses such as `10.0.2.15` are often reachable inside the VM but not directly reachable from the host or another computer. Use bridged networking, or configure VM port forwarding for ports `5173` and `8000`.

External access from another computer was not tested in this development VM because NAT port forwarding was not configured. An evaluator should be able to connect from an external host if their VM or machine allows inbound access to ports `5173` and `8000`, the servers are started with the LAN scripts, and any firewall rules permit those ports.

End the demo session by pressing `Ctrl+C` in both terminals. If a port is already in use, stop the old terminal session first, then rerun the command.

Each start script stops the matching old dev server first. If the old terminal is no longer visible, you can also stop existing dev servers manually from the project root:

```bash
pkill -f uvicorn
pkill -f vite
```

Then restart the backend and frontend scripts.

Expected prototype behaviour:

- Visitors can access the landing page only; dashboard and broadcast data require login.
- Members can register, sign in, reserve or cancel available slots, and submit video feedback.
- Admins can monitor slot occupancy, review feedback, and override the selected video when required.
- The browser client is a React single page application; member and admin workflows render inside the same app shell.

Authentication and roles:

- The backend uses JWT bearer tokens for the prototype API. JWTs are a good fit here because the React frontend can send a standard `Authorization: Bearer <token>` header without server-side session storage.
- Member registration requires email so users can sign in again later. Email is validated with Pydantic `EmailStr` and the `email-validator` package.
- The earlier guest-preview UI was removed to keep the prototype flow focused on authenticated member and admin testing.
- Roles are enforced in backend dependencies: member routes require a valid token, and admin routes require an admin token.

Slot scheduling:

- Hourly slots run from 9am to 9pm with a maximum capacity of 20 members per slot.
- Members cannot reserve the same slot more than once.
- A full slot returns a clear API conflict response instead of overbooking.
- Slot scheduling uses deterministic database logic, not LLM reasoning.

AI video recommendations:

- The backend creates or returns a cached video session for each `time_slot + workout_category` pair.
- Reserving a regular future slot only stores the reservation and category; video preparation waits until the slot time arrives.
- The `Demo time slot` is the immediate-play exception for local demonstration.
- When `YOUTUBE_API_KEY` exists, the backend searches YouTube with `videoEmbeddable=true` and stores a real embeddable video.
- The deterministic Video Curator maintains `video_cache_entries`, targeting five confirmed playable videos per workout category.
- Confirmed cache videos are selected least-played first.
- A cached video is marked for replacement after three plays, but it remains available until a replacement is found and confirmed.
- Fresh YouTube candidates are marked pending until the browser confirms playback through the YouTube IFrame Player API; only confirmed videos are reused as playable cache videos.
- If the confirmed cache is empty, the recommender can search YouTube, reuse older approved session videos, or use mock fallback for no-key/no-network demos.
- Ollama/OpenAI via LiteLLM remain optional for short safety-review summaries; CrewAI is not used in the current implementation.
- Recommendation decisions are stored in `video_sessions` with provider, status, safety notes, and agent summary fields.

Broadcast session sync:

- Members join a backend-managed broadcast session before the fullscreen player opens.
- The backend stores a shared session start time in runtime memory and returns a shared playback offset.
- Late joiners start near the current shared offset instead of starting from the beginning.
- Active clients poll the backend during playback and nudge the YouTube player toward the shared offset.
- The frontend uses the YouTube IFrame Player API to detect playback start and YouTube player errors. If playback does not start within five seconds, the app asks the backend for a replacement candidate.
- Members who exit a broadcast are blocked from rejoining that same runtime session.

Feedback loop:

- Logged-in members can submit `like` or `dislike` feedback for video sessions they reserved.
- Repeated feedback updates the member's existing response for that video session.
- Admins can view likes, dislikes, total feedback, and score per video session.

Frontend dashboard:

- The React/Vite SPA connects to the FastAPI backend at `http://127.0.0.1:8000`.
- The first screen includes login/register controls and a workout hero visual inspired by the supplied mockup.
- Member and admin views are role-aware after login.
- The sign-in/register panel is placed in the hero on desktop and stacks below the hero copy on smaller screens.
- The member slot selector includes a `Demo time slot` option for quick local demonstration.
- Demo reservations use a separate seeded demo slot and are displayed as `Demo time slot`, not as a regular 9am booking.
- The workout broadcast panel stays empty until an active broadcast starts; playback happens in the fullscreen/minimized broadcast player.

Known limitations and unresolved issues:

- Broadcast session state is stored in backend runtime memory for the prototype. Restarting the backend clears active broadcast sessions.
- The broadcast sync loop is demo-grade. It periodically corrects playback offset, but it is not production-grade real-time streaming.
- YouTube can still reject an embed at playback time even after `videoEmbeddable=true`; the prototype now attempts replacement, but availability still depends on YouTube/network access.
- The video cache is prototype-grade and depends on frontend playback confirmation; server-side YouTube metadata alone cannot prove browser playback.
- External host/LAN access was not tested in this development VM. It should work when the evaluator's VM or host has bridged networking or port forwarding configured for ports `5173` and `8000`.

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

- `src/backend/` contains the FastAPI application, database models, deterministic services, and optional LLM review hooks.
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

This scaffold prioritises a small, demonstrable prototype rather than enterprise architecture. The main design decision is to keep the project easy to explain during interview assessment while still showing a complete full stack path: frontend views, backend APIs, database persistence, deterministic service design, external video search, and evaluator-visible prompt documentation.
