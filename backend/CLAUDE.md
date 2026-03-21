# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Python requirement:** >= 3.11. Dependencies managed with `uv`.

```bash
# First-time setup
task bootstrap          # install deps, start DB, run migrations, seed data

# Daily development
task dev                # start DB + migrations + seed + uvicorn --reload
task dev -- test        # same but targeting test environment

# Migrations (Alembic)
task migrate            # run migrations to head (default: local env)
task migrate -- prod    # run against prod
task migrate:new -- "add foo column"   # autogenerate new migration
task migrate:history    # show migration history

# Database
task db:up / db:down    # start/stop local Postgres container
task db:reset           # destroy volume and restart (wipes all data)
task db:shell           # psql into running container

# Seeding
task seed               # seed philosopher data (skips existing)
task seed:reset         # delete extras, update existing, re-seed

# Data scripts
task migrate:content    # migrate legacy chat content JSONB → messages table
task ingest             # ingest philosopher texts into vector DB
task ingest -- --philosopher 'Socrates' --reset

# Testing
task test               # uv run pytest (default: local env)
uv run pytest tests/unit                # unit tests only
uv run pytest tests/integration         # integration tests only
uv run pytest tests/unit/test_foo.py -k "test_bar"  # single test

# Docker (full stack)
task up / task down     # start/stop Postgres + backend containers
task build              # rebuild backend container
task logs               # tail all container logs
```

## Environment Configuration

Environment is selected via `APP_ENV` (default: `local`). The `config.py` module loads `.env.{APP_ENV}` automatically. Required vars:

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
FRONTEND_URL=...
AWS_REGION=...          # for S3 philosopher images
S3_BUCKET_NAME=...
```

## Architecture

### Layered Architecture: Routes → Controllers → DAO → Models

```
routes/          → FastAPI routers (endpoint definitions only)
controllers/     → Business logic (orchestrates DAOs, OpenAI, services)
dao/             → Data Access Objects (all DB queries via SQLAlchemy)
models/          → SQLAlchemy ORM models (mapped to Postgres tables)
services/        → Domain services (prompt building, RAG retrieval, token counting)
```

**Key patterns:**
- Routes receive `DAOFactory` via FastAPI dependency injection (`database.get_dao_factory`)
- `DAOFactory` creates DAO instances bound to a single SQLAlchemy session
- All DAOs extend `BaseDAO` which provides generic CRUD (get_by_id, get_all, create, update, delete)
- Controllers accept `DAOFactory` as a parameter — they never create DB sessions directly

### Database

- **ORM:** SQLAlchemy 2.x with mapped columns (not Supabase client)
- **Migrations:** Alembic (versions in `alembic/versions/`)
- **Session management:** `database.py` creates engine + `SessionLocal`; `get_db()` and `get_dao_factory()` are FastAPI dependencies
- **Models** inherit from `models.base.Base` (SQLAlchemy `DeclarativeBase`)
- **Vector search:** pgvector extension for RAG document embeddings

### Pydantic Models vs SQLAlchemy Models

- `models/models.py` — Pydantic models for API request/response validation (used in routes)
- `models/chat.py`, `models/philosopher.py`, `models/user.py`, etc. — SQLAlchemy ORM models (used by DAOs)

These are separate concerns: Pydantic validates HTTP payloads, SQLAlchemy maps to DB tables.

### AI/Prompting Pipeline

Flow: `routes/prompt.py` → `controllers/prompt_philosopher.py` → `PromptBuilder` + `RetrievalService`

1. **PromptBuilder** (`services/prompt_builder.py`) manages token budgets across system prompt, RAG context, and conversation history (128K context window)
2. **RetrievalService** (`services/retrieval_service.py`) embeds queries via OpenAI `text-embedding-3-small` and searches pgvector for relevant philosopher document chunks
3. **OpenAI Responses API** — uses `openai_client.responses.create()` with `input` (not `messages`) and `instructions` (not `system`). Model constants are centralized in `constants.py` (`OPENAI_CHAT_MODEL`, `OPENAI_EMBEDDING_MODEL`)
4. **Auto-summarization** triggers after 40 messages to manage long conversations
5. **Legacy prompt route** (`routes/prompt_legacy.py`, `/api/v0/prompt`) — older prompting path; current route is `/api/v1/prompt`

### External Services

- **S3** (`s3.py`): Presigned URLs for philosopher images. `S3Service` wraps boto3
- **OpenAI**: Created per-request in controllers (not a singleton)

## Code Conventions

- Follow layered architecture: routes → controllers → DAO. Routes should not contain business logic
- Use `DAOFactory` dependency for DB access, never create sessions manually in controllers
- Pydantic models for request/response validation, SQLAlchemy models for DB
- Environment loading happens via `import config` at module level
- All task runner commands go through `Taskfile.yml` (uses [go-task](https://taskfile.dev/))
- Model IDs live in `constants.py` — update there, not in individual controllers
- API routes are versioned: current is `/api/v1/*`, legacy prompt is `/api/v0/prompt`
