# TradeLedgerX Backend

FastAPI backend for TradeLedgerX (Trader Performance & Journaling System).

## Run locally

```bash
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Requires MongoDB and Redis. See project root `README_DEPLOY.md` for full setup.
