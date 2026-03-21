# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Logos is a full-stack web application that enables users to have AI-powered conversations with historical philosophers. The project uses a React + TypeScript frontend with a FastAPI Python backend.

## Technology Stack

**Frontend:**
- React 19.0.0 + TypeScript 5.7.2
- Vite 6.3.1 (build tool)
- Material-UI 7.0.2 + Tailwind CSS 4.1.4
- React Router DOM 7.5.3
- Axios 1.9.0

**Backend:**
- FastAPI 0.115.12
- Python (managed via uv)
- Uvicorn 0.34.2 / Gunicorn 23.0.0
- SQLAlchemy 2.x + Alembic (ORM + migrations)
- PostgreSQL (local via Docker, pgvector for RAG embeddings)
- OpenAI API (o4-mini-2025-04-16 for chat, text-embedding-3-small for RAG)
- Pydantic 2.x
- Docker + docker-compose (containerization)
- go-task (Taskfile.yml for dev commands)

## Development Commands

**Python requirement:** >= 3.11

### Frontend (from `/frontend` directory)

```bash
# Development server
npm run dev

# Build for production
npm run build        # TypeScript compilation + Vite build

# Preview production build
npm run preview

# Build and preview
npm run prod

# Linting
npm run lint
```

### Backend (from `/backend` directory)

Uses [go-task](https://taskfile.dev/) — see `Taskfile.yml` for all commands.

```bash
# First-time setup
task bootstrap          # install deps, start DB, run migrations, seed

# Daily development
task dev                # start DB + migrate + seed + uvicorn --reload

# Migrations (Alembic)
task migrate            # run to head
task migrate:new -- "description"   # autogenerate new migration

# Database
task db:up / db:down    # start/stop local Postgres
task db:reset           # wipe and restart
task db:shell           # psql shell

# Seeding
task seed               # seed philosopher data
task seed:reset         # reset and re-seed

# Data scripts
task ingest             # ingest philosopher texts into vector DB
```

```bash
# Dependency management
uv sync                 # install from lockfile
uv add <package>        # add dependency
uv add --group dev <package>  # add dev dependency
```

### Docker (from `/backend` directory)

```bash
task up                 # start Postgres + backend containers
task down               # stop all
task build              # rebuild backend container
```

### Testing

```bash
task test                               # Run all tests
uv run pytest tests/unit                # Unit tests only
uv run pytest tests/integration         # Integration tests only
uv run pytest tests/unit/test_foo.py -k "test_bar"  # Single test
```

## Architecture

### Backend: Layered Architecture

The backend follows a strict layered separation. **See `/backend/CLAUDE.md` for full details.**

```
routes/          → FastAPI routers (endpoint definitions, prefix /api/v1/*)
controllers/     → Business logic (orchestrates DAOs, OpenAI, services)
dao/             → Data Access Objects (all DB queries via SQLAlchemy)
models/          → SQLAlchemy ORM models + Pydantic request/response models
services/        → Domain services (PromptBuilder, RetrievalService, token counting)
```

**Key patterns:**
- `DAOFactory` is injected via FastAPI dependency — creates DAO instances bound to a single session
- All DAOs extend `BaseDAO` with generic CRUD
- Pydantic models (`models/models.py`) validate HTTP payloads; SQLAlchemy models (`models/*.py`) map to DB tables
- Environment selected via `APP_ENV` env var, loads `.env.{APP_ENV}` via `config.py`

### Frontend: Component-Based Architecture

```
frontend/src/
├── components/          # Reusable UI components
├── pages/              # Route-level components
├── contexts/           # React Context providers (AuthContext)
├── services/           # API abstraction layer
│   ├── chat/ChatService.ts
│   └── philosophers/PhilosopherService.ts  (has 5-min TTL cache)
├── lib/               # Third-party service singletons
└── constants/
    ├── types/         # TypeScript type definitions
    └── responses/     # API response types
```

**Frontend Routes** (defined in `App.tsx`):
- `/` → HomePage, `/login` → LoginPage, `/register` → RegisterPage
- `/forgot-password` → ForgotPasswordPage
- `/philosophers` → PhilosopherSelectionPage
- `/chats` → ChatListPage
- `/chat/new/:philosopherId` → PhilosopherChatPage (new chat)
- `/chat/:chatId` → PhilosopherChatPage (existing chat)
- `/voice/:philosopherId` → VoiceCallPage
- `/settings` → UserSettingsPage

**Additional frontend details** are in `/frontend/CLAUDE.md`.

### Database Access

**Backend:** Uses SQLAlchemy + `DAOFactory` pattern. DB sessions are managed via FastAPI dependencies in `database.py`. Never create sessions manually in controllers.

### Path Aliases (Frontend)

TypeScript is configured with path aliases in `tsconfig.app.json`:

```typescript
// Use these import patterns:
import Component from '@/components/Component'
import { User } from '@/types'

// Instead of:
import Component from '../../../components/Component'
```

Configured paths:
- `@/*` → `src/*`
- `@/types` → `src/constants/types`

### Authentication

**Frontend:** Uses `AuthContext` (`/frontend/src/contexts/AuthContext.tsx`)
- Provides: `signIn`, `signUp`, `signOut`, `resetPassword`
- Persists session to localStorage

## Environment Variables

### Frontend (`.env.local` in `/frontend`, see `.env.local.example`)
```
VITE_BACKEND_URL=your_backend_api_url
```

### Backend (`.env.{APP_ENV}` in `/backend`, e.g. `.env.local`)
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=your_frontend_url
AWS_REGION=us-west-1
S3_BUCKET_NAME=your_bucket
```

## API Structure

All API routes are prefixed with `/api`. Main endpoints:

- `GET /health` - Health check
- `GET /api/v1/chat/` - Get all chats (optional `user_id` query param)
- `GET /api/v1/chat/{chat_id}` - Get specific chat
- `POST /api/v1/chat/` - Create new chat
- `DELETE /api/v1/chat/` - Delete chat
- `GET /api/v1/philosophers/` - Get all philosophers
- `GET /api/v1/philosophers/{philosopher_id}` - Get specific philosopher
- `POST /api/v1/philosophers/` - Create philosopher
- `POST /api/v1/prompt/` - Prompt AI philosopher
- `POST /api/v1/prompt/transcribe` - Transcribe audio (OpenAI Whisper)

CORS is configured to allow all origins (`allow_origins=["*"]`) with credentials support.

## AI Integration

The application uses OpenAI's `o4-mini-2025-04-16` model for philosopher conversations:
- Uses `openai_client.responses.create()` (not the chat completions API)
- Uses `input` parameter (not `messages`) and `instructions` for system prompts
- High reasoning effort configuration (`reasoning={"effort": "high"}`)
- System prompts are stored per-philosopher in the `philosophers.config` column
- RAG pipeline: user queries are embedded via `text-embedding-3-small`, matched against pgvector philosopher document chunks, and injected into the system prompt
- `PromptBuilder` manages token budgets (128K context) across system prompt, RAG, history, and response
- Auto-summarization triggers after 40 messages per chat
- Prompting logic is in `/backend/controllers/prompt_philosopher.py`

## Database Schema (PostgreSQL)

Primary tables (SQLAlchemy models in `/backend/models/`):
- `users` - User accounts
- `philosophers` - Philosopher configurations, system prompts, metadata
- `chats` - Chat sessions (linked to user + philosopher)
- `messages` - Individual messages within chats (role, content, token_count, metadata)
- `philosopher_documents` - RAG document chunks with pgvector embeddings

## Code Conventions

1. **Frontend:**
   - Use functional components with hooks
   - Use TypeScript strict mode
   - Import from `@/*` aliases, not relative paths
   - Services abstract all API calls (don't call axios directly from components)

2. **Backend:**
   - Follow layered architecture: routes → controllers → DAO → models
   - Use Pydantic models for request/response validation, SQLAlchemy models for DB
   - Controllers handle business logic, routes only define endpoints
   - Use `DAOFactory` via FastAPI dependency injection for all DB access

3. **Dependency Management:**
   - Frontend: Standard `npm install` workflow
   - Backend: Use `uv add <package>` to add dependencies (updates `pyproject.toml` + `uv.lock`)
   - Backend: Use `uv sync` to install dependencies from lockfile
