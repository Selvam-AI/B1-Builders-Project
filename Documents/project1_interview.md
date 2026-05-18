# Project 1 Interview

## Opening Pitch (2 minutes)

Say:

> My project is a Geopolitical Market Forecaster. It reads geopolitical news, especially Middle East-related events, and converts them into educational market signals for Singapore-linked sectors like Offshore & Marine and Airlines. The point is not to give financial advice, but to demonstrate an explainable AI-assisted workflow: ingestion, analysis, prediction, governance, persistence, and dashboard display.

---

## Demo Flow (5 minutes)

Run or describe:

```bash
cd "project 1"
source .venv/bin/activate
scripts/run_dashboard.sh
```

Open:

```text
http://127.0.0.1:8000/dashboard
```

Show:

- Dashboard decision cards: BUY, HOLD, AVOID
- Evidence links
- Agent workflow
- Confidence score
- Governance position
- API route: `/api/dashboard`

Then say:

> The dashboard is designed for non-technical review. I wanted evaluators to see the reasoning chain, not just a final AI answer.

---

## Architecture Explanation (4 minutes)

Use this exact flow:

```text
News APIs/RSS
-> NewsIngestionService
-> SQLite
-> Scraper Agent
-> Economic Analyst Agent
-> Predictor Agent
-> Governor Agent
-> FastAPI/Jinja2 dashboard
-> WebSocket refresh
```

Key line:

> I chose plain Python agents instead of a heavy agent framework so the system remains explainable, testable, and easier for a trainee or evaluator to understand.

---

## AI Usage Story (4 minutes)

This is very important. Say:

> I used AI as a co-developer, but I guided it phase by phase. I asked it to scaffold, then implement ingestion, then the pipeline, then dashboard, realtime alerts, and governance. I documented the prompts and decisions in PROMPT_ACTION_LOG.md, because the evaluation is not only about the final code, but how I steered AI intentionally.

Mention examples:

- Chose FastAPI/Jinja2 instead of React to reduce complexity.
- Added `.env` for API keys.
- Added fallback behavior when NewsAPI failed with HTTP 401.
- Added rule-based fallback when LLM providers are unavailable.
- Kept governance basic but documented limitations honestly.

---

## Governance Answer (2 minutes)

Say:

> The Governor Agent is currently a post-forecast review layer. It checks whether evidence exists, flags high-confidence forecasts for manual review, and preserves traceability through source URLs. I deliberately documented that it is not yet a full preventive gate. Future improvements would include source quality scoring, stale article rejection, and pre-analysis evidence checks.

---

## Testing Answer (1 minute)

Say:

> I verified the system with regression tests covering analyst behavior, dashboard data, decisions, governance, ingestion, pipeline, realtime updates, and storage. Current status is 21 tests passed.

---

## Likely Questions

### Why this project?

Because geopolitical news is noisy, and I wanted to show how AI can help convert unstructured news into explainable, bounded decision support.

### Is this financial advice?

No. It is an educational prototype. The dashboard says signals are examples and should not be used as trading advice.

### Where is AI used?

AI was used in development through Codex, and optionally in runtime analysis through OpenAI/Ollama/Gemini configuration. The system can also run rule-based for reliability.

### What did you personally decide?

Project scope, phased implementation, FastAPI/Jinja2 stack, `.env` provider setup, fallback strategy, basic governance, evaluator documentation, and keeping agents plain Python.

### What failed?

NewsAPI returned HTTP 401, so I logged provider errors safely and used Guardian/RSS paths instead. Browser access also needed adjustment because development was inside a VM.

### How would you help a beginner build this?

I would not give them the whole solution. I would help them define the problem, break it into phases, write targeted prompts, inspect AI output, run tests, and reflect on tradeoffs.

---

## Best Closing Line

> What I learned is that AI-assisted development is not about accepting the first generated answer. The value came from steering the AI, constraining the scope, documenting decisions, and making the final system explainable enough for another person to inspect and improve.
