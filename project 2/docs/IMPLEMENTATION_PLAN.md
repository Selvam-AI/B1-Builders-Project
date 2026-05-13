# FitHub AI Implementation Plan

## Purpose

This plan breaks Project 2 into implementation phases for a small, demonstrable full stack browser dashboard that matches the B1 Builders Programme requirements and the FitHub AI project specification.

## Phase 1: Repository Foundation

Goals:
- Create the suggested project structure from the programme deliverables.
- Add evaluator-facing `README.md`.
- Add dependency manifests for backend and frontend.
- Add prompt and implementation documentation under `docs/`.

Deliverables:
- Top-level scaffold: `README.md`, `LICENSE`, `.gitignore`, `requirements.txt`, `package.json`, `src/`, `tests/`, `docs/`, `scripts/`, `assets/`, `data/`.
- Backend and frontend starter files.
- Initial implementation plan and prompt log.

## Phase 2: Backend Core

Goals:
- Implement FastAPI application structure.
- Configure SQLite and SQLAlchemy.
- Create models for `users`, `time_slots`, `slot_signups`, `workout_categories`, `video_sessions`, and `feedback`.
- Add seed data for 9am-9pm hourly slots and Upper Body / Lower Body categories.

Deliverables:
- Database session setup.
- ORM models and migrations or local schema creation script.
- API health and status endpoints.
- Unit tests for basic backend setup.

## Phase 3: Authentication and Roles

Goals:
- Support Member, Guest, and Admin flows.
- Implement member registration with name, age, and preferred time slots.
- Implement login for member/admin users.
- Restrict admin features to admin users.

Deliverables:
- Auth schemas and services.
- Password hashing for local prototype accounts.
- Role-based endpoint guards.
- Tests for registration, login, and role restrictions.

## Phase 4: Slot Scheduling

Goals:
- Implement hourly slot browsing and reservation.
- Enforce 9am-9pm operating hours.
- Enforce maximum 20 signed-in members per slot.
- Allow admins to monitor occupancy.

Deliverables:
- Slot listing endpoint.
- Reservation create/cancel endpoints.
- Capacity validation.
- Admin occupancy endpoint.
- Tests for capacity and duplicate reservation rules.

## Phase 5: AI Video Recommendation Workflow

Goals:
- Integrate CrewAI-style workflow with Trainer Agent, Safety Checker Agent, Schedule Agent, and Admin Assistant Agent.
- Use YouTube Data API v3 for workout video candidates.
- Use Ollama as the default local LLM for CrewAI reasoning and agent decision-making.
- Keep OpenAI as an optional provider if credits are available later.
- Select approximately 10-minute videos matching Upper Body or Lower Body categories.
- Keep agent coordination internal to the backend; users should not directly interact with CrewAI.
- Avoid blocking normal user actions on slow CPU-only LLM calls.

Deliverables:
- Agent service interfaces.
- Video search service.
- Safety validation step.
- Video session persistence.
- Fallback mock/rule-based recommender mode for demos when no LLM is available.

Workflow rules:
- User actions remain simple: register/login, choose slot, choose workout category, view broadcast, and submit feedback.
- Schedule and capacity enforcement use deterministic database logic, not LLM reasoning.
- Agents run only when a new video recommendation is needed.
- Reuse cached approved videos by `slot + category` instead of recomputing on every request.
- Safety Checker reviews new candidate videos before they become active sessions.
- Save agent decisions in `video_sessions` so the dashboard reads stored state quickly.
- If Ollama is slow or unavailable, fall back to mock/rule-based recommendation when enabled.

## Phase 6: Feedback Loop

Goals:
- Allow members to like or dislike workout videos.
- Store feedback by video session.
- Use feedback to influence future Trainer Agent selection.
- Expose admin feedback summaries.

Deliverables:
- Feedback API endpoints.
- Feedback model and service.
- Recommendation scoring adjustment.
- Tests for feedback capture and summary.

## Phase 7: Frontend Dashboard

Goals:
- Build a browser dashboard for guest, member, and admin use.
- Keep the first screen as the usable application, not a landing page.
- Connect React/Vite frontend to backend APIs.

Deliverables:
- Guest broadcast view.
- Member registration/login views.
- Slot reservation UI.
- Video broadcast panel.
- Like/dislike feedback controls.
- Admin occupancy and override views.

## Phase 8: Testing, Demo, and Evaluation Readiness

Goals:
- Add focused tests for critical backend rules.
- Verify frontend flows manually and with lightweight automated tests if time permits.
- Add screenshots or demo media.
- Update README, implementation plan, and prompt log with final decisions.

Deliverables:
- Test results documented.
- Demo screenshots under `assets/screenshots/`.
- Updated `README.md`.
- Updated `docs/PROMPTS_IMPLEMENTATION.md`.

## Scope Control

In scope:
- Local full stack prototype.
- SQLite persistence.
- Simple auth suitable for demonstration.
- AI-assisted video recommendation workflow.
- Admin monitoring and override.

Out of scope:
- Payment APIs.
- Wearable APIs.
- Google login.
- Calendar integration.
- Mobile application.
- Real-time streaming infrastructure.
- Complex enterprise deployment.
