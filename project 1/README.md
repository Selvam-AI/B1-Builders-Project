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
```

## Run

```bash
uvicorn geopolitical_market_forecaster.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Run the placeholder pipeline:

```bash
python3 -m geopolitical_market_forecaster.cli run-pipeline
```

Or, after `pip install -e .`:

```bash
gmf run-pipeline
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
1 passed
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
