# FitHub AI Implementation Plan

## Purpose

This plan breaks Project 2 into implementation phases for a small, demonstrable full stack browser dashboard that matches the B1 Builders Programme requirements and the FitHub AI project specification.

## Implementation Progress

Current status:
- Phase 1: Complete
- Phase 2: Complete
- Phase 3: Complete
- Phase 4: Complete
- Phase 5: Complete
- Phase 6: Complete
- Next phase: Phase 7, Frontend Dashboard

Completed so far:
- Repository scaffold, evaluator-facing README, documentation, dependency files, and environment templates.
- Backend core with FastAPI, SQLAlchemy, SQLite setup, project models, seed data, core read APIs, DB init script, and Phase 2 tests.
- Authentication and role handling with JWT bearer tokens, validated member email, seeded local admin, protected dashboard/broadcast routes, and Phase 3 tests.
- Slot scheduling with member reserve/cancel endpoints, duplicate prevention, 20-member capacity enforcement, admin occupancy summary, and Phase 4 tests.
- AI video recommendation workflow with cached `video_sessions`, provider-aware mock fallback, automatic recommendation creation after reservation, and Phase 5 tests.
- Feedback loop with member like/dislike create/update, reservation validation, admin feedback summaries, and Phase 6 tests.

Next focus:
- Connect React/Vite frontend to backend auth, scheduling, recommendations, and feedback APIs.
- Replace static dashboard scaffold with usable member/admin workflows.
- Keep guest access limited to entry/login.
- Verify browser behavior manually and with focused frontend tests if practical.

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

Status: Complete.

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

Status: Complete.

Implemented:
- SQLAlchemy database engine, session dependency, and table initialization.
- ORM models for `users`, `time_slots`, `slot_signups`, `workout_categories`, `video_sessions`, and `feedback`.
- Seed data for hourly slots from 9am-9pm and Upper Body / Lower Body categories.
- Startup database initialization and seed flow.
- Local database initialization script at `scripts/init_db.py`.
- Backend read APIs for status, time slots, workout categories, and video sessions.
- Phase 2 ASGI HTTP tests covering status, seeded slots, seeded categories, and empty video-session state.

Testing note:
- Starlette `TestClient` hangs in this sandbox because its AnyIO cross-thread portal does not complete.
- Backend route tests use `httpx.ASGITransport` instead, which still exercises the FastAPI app through ASGI without relying on the broken threaded test path.

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

Status: Complete.

Implemented:
- Member registration with name, age, required email, password, and preferred time slots.
- Email validation using Pydantic `EmailStr` backed by `email-validator`.
- Password hashing with `passlib[bcrypt]`.
- JWT bearer-token login for member and admin users.
- Seeded local admin account for prototype evaluation.
- Role guards for authenticated dashboard data and admin-only summary data.
- Guest access limited to public status/auth routes; dashboard and broadcast data require login.
- Phase 3 ASGI tests covering registration, email validation, login, current-user lookup, admin access, member restriction, and guest restriction.

Security rationale:
- JWT bearer tokens are used because they are simple for a React/FastAPI prototype and avoid server-side session storage.
- This is demo-appropriate security, not production-ready identity management.
- In production, seeded admin accounts should be disabled with `SEED_ADMIN=false`; admins should be provisioned securely, secrets should be rotated, HTTPS should be required, and password reset / email verification / audit logging should be added.

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

Status: Complete.

Implemented:
- `POST /api/reservations` for authenticated members to reserve a time slot and workout category.
- `GET /api/reservations/me` for authenticated members to view their reservations.
- `DELETE /api/reservations/{reservation_id}` for authenticated members to cancel their own reservations.
- `GET /api/admin/occupancy` for admins to view slot occupancy, remaining capacity, and full-slot status.
- Duplicate reservation prevention for the same member and time slot.
- Capacity enforcement using deterministic database counts; LLM agents are not involved in scheduling.
- Phase 4 ASGI tests covering reserve, cancel, duplicate rejection, full-slot rejection, admin occupancy, and member restriction.

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

Status: Complete.

Implemented:
- `POST /api/video-sessions/recommend` to create or return a cached video session for a time slot and workout category.
- Automatic recommendation creation when a member reserves a slot/category pair for the first time.
- Cached reuse by `time_slot + workout_category` so normal dashboard reads do not trigger repeated AI work.
- Provider-aware recommendation service that respects Ollama/OpenAI/mock configuration, can request a short LiteLLM safety review, and falls back to mock video metadata when YouTube/LLM work is unavailable.
- Mock Trainer/Safety output stored in `video_sessions` as `agent_summary`, `safety_notes`, `provider`, and `status`.
- Phase 5 ASGI tests covering recommendation creation, cache reuse, reservation-triggered creation, and guest restriction.

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

Status: Complete.

Implemented:
- `POST /api/feedback` for authenticated members to submit `like` or `dislike`.
- One feedback record per member and video session; repeated submissions update the existing record.
- Feedback requires the member to have a matching reservation for the video session's time slot and workout category.
- `GET /api/admin/feedback-summary` for admin-only likes, dislikes, total feedback, and score per video session.
- Recommendation scoring signal is represented by `score = likes - dislikes` for later Trainer Agent use.
- Phase 6 ASGI tests covering create/update, reservation requirement, allowed values, admin summary, guest restriction, and member restriction.

## Phase 7: Frontend Dashboard

Goals:
- Build a browser dashboard for guest, member, and admin use.
- Keep the first screen as the usable application, not a landing page.
- Connect React/Vite frontend to backend APIs.

Deliverables:
- Guest entry/login view.
- Authenticated broadcast view.
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
