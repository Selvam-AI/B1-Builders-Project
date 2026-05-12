# Geopolitical Market Forecaster

Prototype app for a multi-agent geopolitical market forecasting dashboard.

## Current Scope

- FastAPI backend scaffold
- `.env` based configuration for API keys
- Agent modules for scraping, economic analysis, prediction, and governance
- Pipeline orchestration placeholder
- SQLite-ready storage module
- Initial test structure

## Setup

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

Alternative dependency-only install from `requirements.txt`:

```bash
pip install -r requirements.txt
```

If you use the alternative path, also install the local package before running module commands:

```bash
pip install -e .
```

Update `.env` with API keys when needed:

```text
GEMINI_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
GUARDIAN_API_KEY=your_key_here
CURRENTS_API_KEY=your_key_here
ANALYSIS_PROVIDER=rule_based
GEMINI_MODEL=gemini-1.5-flash
ENABLE_BACKGROUND_POLLING=false
ALERT_POLL_SECONDS=300
```

Analysis providers:

- `rule_based` - default, no LLM key required.
- `gemini` - reserved for Gemini-powered analysis once `GEMINI_API_KEY` is available and LLM execution is implemented.

## Run

```bash
uvicorn geopolitical_market_forecaster.main:app --reload
```

FastAPI is the backend application framework. Uvicorn is the server process that runs the FastAPI app locally and listens for browser/API requests.

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Dashboard:

```text
http://127.0.0.1:8000/dashboard
```

Dashboard JSON:

```text
http://127.0.0.1:8000/api/dashboard
```

Realtime WebSocket:

```text
ws://127.0.0.1:8000/ws/alerts
```

Manual refresh endpoint:

```bash
curl -X POST "http://127.0.0.1:8000/api/ingest/run?source=guardian"
```

Background polling is disabled by default to avoid unwanted API usage. Set `ENABLE_BACKGROUND_POLLING=true` to let the server periodically ingest, run the pipeline, and broadcast dashboard updates every `ALERT_POLL_SECONDS`.

Run the placeholder pipeline:

```bash
python3 -m geopolitical_market_forecaster.cli run-pipeline
```

Or, after `pip install -e .`:

```bash
gmf run-pipeline
```

The pipeline reads stored news from SQLite first, then writes economic insights, forecasts, governance reviews, and audit events back to SQLite.
Latest agent outputs are refreshed per news URL; audit events preserve the run history.

Use `gmf run-pipeline --verbose` only when you need the full nested JSON response.

Fetch and store news for Phase 1:

```bash
gmf ingest-news --source auto
```

Available sources:

- `auto` - tries Guardian, then NewsAPI, then RSS.
- `guardian` - uses `GUARDIAN_API_KEY`.
- `newsapi` - uses `NEWS_API_KEY`.
- `rss` - uses public RSS feeds and no API key.

Provider/API failures do not crash the application. Sanitized failures are appended to the root `ERROR_LOG.txt`, and `auto` mode continues to the next available source.

View stored news:

```bash
gmf show-news --limit 5
```

View database table counts:

```bash
gmf show-status
```

## Test

```bash
pytest
```

## Phase 0 Verification

The source tree compiles:

```bash
python3 -m compileall -q src
```

The test suite runs:

```bash
pytest
```

Expected result:

```text
4 passed
```

The placeholder agent pipeline returns one governed forecast:

```bash
gmf run-pipeline
```

You should see JSON with:

```text
"items_collected": 1
"approved": true
```

The SQLite database is initialized at `data/geopolitical_market_forecaster.db` with an `audit_events` table.

Phase 1 also creates a `news_items` table when ingestion runs. Phase 2 creates `economic_insights`, `market_forecasts`, and `governance_reviews` tables when the pipeline runs.

Known provider note: Guardian ingestion has been verified. NewsAPI returned `HTTP 401`, so that key may need to be checked or regenerated before NewsAPI can be used.
