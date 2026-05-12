# Geopolitical Market Forecaster

## Overview

The Geopolitical Market Forecaster is a full-stack AI-assisted prototype that ingests global news, identifies market-relevant signals, produces simple forecasts, reviews them through a governance layer, and displays the results in a browser dashboard.

### Problem

- Market watchers, analysts, students, and decision-makers are affected by fast-moving geopolitical news.
- Raw news is noisy, scattered across sources, and difficult to translate into market implications quickly.
- A useful prototype needs ingestion, analysis, forecasting, governance, auditability, and a readable user interface.

### Outcome

- Built a working FastAPI dashboard for geopolitical market signals.
- Implemented news ingestion from Guardian, NewsAPI, and RSS source options.
- Added a multi-agent pipeline: Scraper, Economic Analyst, Predictor, and Governor.
- Persisted news, insights, forecasts, governance reviews, and audit events in SQLite.
- Added realtime dashboard refresh via WebSockets.
- Added a governance report and regression tests.
- Current verification: `17 passed`.

---

## Demo

Start the backend server:

```bash
cd "project 1"
source .venv/bin/activate
uvicorn geopolitical_market_forecaster.main:app --host 0.0.0.0 --port 8000
```

Open the dashboard:

```text
http://127.0.0.1:8000/dashboard
```

Main user flow:

1. Ingest news using `gmf ingest-news --source guardian`.
2. Run the agent pipeline using `gmf run-pipeline`.
3. Open the dashboard to review signals, forecasts, governance status, and source links.
4. Use the manual refresh endpoint or WebSocket updates for realtime dashboard changes.

Screenshots or demo video can be added later under an `assets/` folder if needed.

---

## Technology Stack

### Frontend components

- Jinja2 templates for server-rendered dashboard pages.
- CSS for a quiet operational dashboard layout.
- Browser JavaScript for WebSocket-based realtime updates.

### Backend components

- Python 3.12.
- FastAPI backend application.
- Uvicorn ASGI server.
- SQLite for local persistence.
- Pydantic models for structured agent data.
- httpx and feedparser for API/RSS ingestion.
- pytest for regression tests.

FastAPI is the backend application framework. Uvicorn is the server process that runs the FastAPI app locally and listens for browser/API requests.

---

## Development Approach with AI

AI tools and services used:

- Codex: project planning, implementation, debugging, refactoring, and documentation.
- Guardian Open Platform: verified live news ingestion.
- NewsAPI: client implemented, but live key verification returned `HTTP 401`.
- Gemini: planned analysis provider; currently configured as a placeholder until `GEMINI_API_KEY` is available.

AI agents in the application:

- Scraper Agent: collects and normalizes market-relevant news.
- Economic Analyst Agent: creates market-oriented insights.
- Predictor Agent: creates bounded forecasts from insights.
- Governor Agent: performs basic post-forecast governance checks.

Key prompts and decisions are recorded in:

```text
docs/PROMPT_ACTION_LOG.md
```

Key review points:

- Use FastAPI/Jinja2 first instead of React/Vite to keep the dashboard aligned with the Python backend.
- Keep governance basic for this prototype and document future active governance improvements.
- Default to rule-based analysis and reserve Gemini for future API-backed analysis.
- Keep background polling disabled by default to avoid unwanted API usage.

---

## Installation

System prerequisites:

```bash
sudo apt install python3.12-venv python3-pip
```

Project environment:

```bash
cd "project 1"
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Alternative dependency-only install:

```bash
pip install -r requirements.txt
pip install -e .
```

Create or update `.env`:

```text
GEMINI_API_KEY=
NEWS_API_KEY=your_key_here
GUARDIAN_API_KEY=your_key_here
CURRENTS_API_KEY=
APP_ENV=local
DATABASE_URL=sqlite:///data/geopolitical_market_forecaster.db
DEFAULT_REGION=Middle East
DEFAULT_NEWS_QUERY=Middle East geopolitics oil shipping markets
INGEST_PAGE_SIZE=10
ANALYSIS_PROVIDER=rule_based
GEMINI_MODEL=gemini-1.5-flash
ERROR_LOG_PATH=ERROR_LOG.txt
ENABLE_BACKGROUND_POLLING=false
ALERT_POLL_SECONDS=300
```

---

## Usage

### Run The Application

From the project folder, activate the virtual environment:

```bash
cd "project 1"
source .venv/bin/activate
```

Start the backend server:

```bash
uvicorn geopolitical_market_forecaster.main:app --host 0.0.0.0 --port 8000
```

Open the dashboard in a browser:

```text
http://127.0.0.1:8000/dashboard
```

`source .venv/bin/activate` activates the Python environment for this terminal. `uvicorn` is the local web server that runs the FastAPI backend. `geopolitical_market_forecaster.main:app` points Uvicorn to the app. `--host 0.0.0.0` makes the server reachable inside the VM, and `--port 8000` uses browser port 8000.

Stop the dashboard server by pressing `Ctrl + C` in the terminal where Uvicorn is running.

You can also start the dashboard using the helper script:

```bash
scripts/run_dashboard.sh
```

If you are inside the `scripts/` folder, run:

```bash
./run_dashboard.sh
```

### Basic Checks

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Dashboard JSON:

```text
http://127.0.0.1:8000/api/dashboard
```

Realtime WebSocket:

```text
ws://127.0.0.1:8000/ws/alerts
```

### Run The Pipeline

Fetch news:

```bash
gmf ingest-news --source guardian
gmf ingest-news --source newsapi
gmf ingest-news --source rss
gmf ingest-news --source auto
```

Run the agent pipeline:

```bash
gmf run-pipeline
```

Refresh the dashboard manually:

```bash
curl -X POST "http://127.0.0.1:8000/api/ingest/run?source=guardian"
```

View stored news:

```bash
gmf show-news --limit 5
```

View database table counts:

```bash
gmf show-status
```

Provider/API failures do not crash the application. Sanitized failures are appended to `ERROR_LOG.txt`.

### Developer Tests

`pytest` runs the automated test suite. Use it to check that ingestion, agents, storage, governance, realtime behavior, and dashboard data still work after code changes.

```bash
pytest
```

The helper script runs the same test command from the project folder:

```bash
scripts/run_tests.sh
```

If you are inside the `scripts/` folder, run:

```bash
./run_tests.sh
```

If a server is running in another terminal and you need to stop it:

```bash
ps -ef | grep uvicorn
kill <PID>
```

---

## Project Structure

```text
project 1/
├── README.md
├── LICENSE
├── .gitignore
├── requirements.txt
├── pyproject.toml
├── src/
├── tests/
├── docs/
├── scripts/
├── data/
└── ERROR_LOG.txt
```

Key folders:

- `src/`: application source code.
- `tests/`: pytest regression tests.
- `docs/`: implementation plan, prompt log, governance report, tooling notes, and concept documents.
- `scripts/`: small local automation helpers.
- `data/`: local SQLite runtime database.

`scripts/` is useful but intentionally small because most automation is exposed through the `gmf` CLI. `LICENSE` is included because the programme deliverables suggest it; it currently uses a conservative all-rights-reserved notice rather than an open-source license.

---

## Governance

The Governor Agent is currently a basic post-forecast review layer. It checks whether forecasts include evidence, flags high-confidence forecasts for manual review, preserves uncertainty notes, and keeps source URLs attached for traceability.

Governance output is visible in the dashboard Governance column and persisted in SQLite tables such as `governance_reviews` and `audit_events`. It does not yet prevent the Analyst Agent from using weak or unverified source material before analysis.

Readable governance report:

```text
docs/GOVERNANCE_REPORT.md
```

---

## Reflection

What worked:

- Building the backend, agents, database, and dashboard in Python kept the prototype cohesive.
- FastAPI/Jinja2 provided a proper backend and usable dashboard without adding Node tooling.
- Prompt/action logging made the development process traceable.
- Basic governance and audit tables make the workflow explainable.

What failed or needed adjustment:

- NewsAPI returned `HTTP 401`, so Guardian became the verified live ingestion provider.
- Browser access required running Uvicorn outside the Codex sandbox because development is inside a VM.
- The first dashboard route test using FastAPI TestClient hung in the sandbox, so tests were adjusted to validate dashboard data and assets directly.

Changes made:

- Moved the deliverable project structure into `project 1/`.
- Added `docs/`, `scripts/`, and `LICENSE`.
- Kept governance basic for now while documenting future active governance enhancements.

Rationale:

- The project now matches the programme deliverable structure while preserving the working prototype and development record.
