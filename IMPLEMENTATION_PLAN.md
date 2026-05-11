# Geopolitical Market Forecaster - Implementation Plan

Last updated: 2026-05-11

## Project Goal

Build an AI-driven dashboard that identifies, explains, and forecasts potential market shifts from global news, beginning with Middle East geopolitical coverage. The system should demonstrate multi-agent orchestration with clear governance, auditability, and human-in-the-loop oversight.

## Working Architecture

### 1. Scraper Agent

Purpose: collect validated, current news and market-relevant signals.

Initial responsibilities:
- Fetch live news from selected sources or news APIs.
- Focus first on Middle East geopolitical developments.
- Normalize article metadata: source, URL, title, author if available, published time, region, topic, and raw text or summary.
- Record source and extraction details for auditing.

### 2. Economic Analyst Agent

Purpose: convert raw news into market-relevant interpretation.

Initial responsibilities:
- Summarize each news item.
- Extract economic themes such as energy supply, shipping risk, sanctions, defense spending, currency pressure, inflation, and investor sentiment.
- Classify signal importance: Actionable, FYI, or Noise.
- Identify likely affected sectors, assets, or regions.

### 3. Predictor Agent

Purpose: produce transparent, bounded forecasts from analyst outputs.

Initial responsibilities:
- Forecast possible market shifts with confidence bands.
- Link every forecast to source evidence and analyst reasoning.
- Provide time horizon tags such as intraday, weekly, monthly.
- Avoid unsupported claims by clearly separating evidence, inference, and uncertainty.

### 4. Governor Agent

Purpose: enforce governance, quality control, and auditability.

Initial responsibilities:
- Check source provenance.
- Flag missing citations, weak evidence, duplicated articles, stale data, and overconfident predictions.
- Maintain audit logs for each pipeline run.
- Enforce project rules for transparency and human review.

## Proposed Technical Stack

This stack should be validated as implementation begins.

- Backend: Python with FastAPI for API endpoints and orchestration.
- Agent orchestration: start with simple explicit service classes; evaluate CrewAI or AutoGen after the first vertical slice works.
- LLM layer: Gemini API free tier, with provider abstraction so models can be swapped later.
- Data ingestion: RSS feeds and/or zero-cost news APIs first; paid APIs deferred.
- Storage: SQLite for prototype persistence and audit logs.
- Frontend: React/Vite or a lightweight FastAPI-rendered dashboard, depending on project scope chosen next.
- Realtime updates: WebSockets after the basic pipeline is stable.
- Tests: pytest for backend logic and agent governance checks.

## Implementation Phases

### Phase 0 - Repository Setup

Status: Complete

Actions:
- App layout chosen: Python/FastAPI backend scaffold in `project 1/`.
- Added project documentation files.
- Added `.env` and `.env.example` for local API keys and app settings.
- Added dependency and run instructions.
- Added initial test structure.
- Verified source files compile with `python3 -m compileall -q 'project 1/src'`.
- Confirmed local OS prerequisites are installed: `python3.12-venv` and `python3-pip`.
- Created `.venv`, installed dependencies, and installed the local package in editable mode.
- Verified `pytest` passes.
- Verified both `python3 -m geopolitical_market_forecaster.cli run-pipeline` and `gmf run-pipeline` return the placeholder governed forecast.
- Verified SQLite initialization creates `data/geopolitical_market_forecaster.db` with an `audit_events` table.

Deliverable:
- A runnable skeleton with clear setup instructions.

### Phase 1 - First Vertical Slice

Status: Not started

Actions:
- Implement a small ingest pipeline using one or two public sources.
- Store article records and run metadata.
- Add a manual command to fetch and inspect latest items.
- Add basic validation and deduplication.

Deliverable:
- The project can fetch recent Middle East news and persist normalized records.

### Phase 2 - Agent Pipeline

Status: Not started

Actions:
- Implement Scraper, Economic Analyst, Predictor, and Governor as separate modules.
- Define structured inputs and outputs for each agent.
- Add audit events for every handoff.
- Add mocked LLM support for tests.

Deliverable:
- One command can run news ingestion through analysis, forecast, and governance review.

### Phase 3 - Dashboard

Status: Not started

Actions:
- Build a dashboard showing latest news, signal tier, market implications, forecasts, confidence, and audit state.
- Add filters by region, sector, source, confidence, and time horizon.
- Include source links and reasoning traces.

Deliverable:
- A local dashboard usable for reviewing geopolitical market signals.

### Phase 4 - Realtime Alerts

Status: Not started

Actions:
- Add background polling.
- Add WebSocket updates.
- Add alert severity rules.

Deliverable:
- New signals can appear in the dashboard without page refresh.

### Phase 5 - Hardening and Governance

Status: Not started

Actions:
- Add stronger source allowlists and robots/API compliance notes.
- Add regression tests for governance checks.
- Add prompt/version tracking for agent behavior.
- Add deployment notes.

Deliverable:
- A governance-ready prototype with auditable runs and reproducible prompts.

## Immediate Next Actions

1. Choose the Phase 1 ingestion source: RSS feeds, GDELT, or NewsAPI.
2. Implement the first real ingestion command.
3. Persist collected news items and audit events in SQLite.
4. Replace the placeholder scraper output with normalized live or semi-live news records.
