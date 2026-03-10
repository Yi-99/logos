# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Logos is a full-stack web application that enables users to have AI-powered conversations with historical philosophers. The project uses a React + TypeScript frontend with a FastAPI Python backend, both connected to Supabase for authentication and data persistence.

## Technology Stack

**Frontend:**
- React 19.0.0 + TypeScript 5.7.2
- Vite 6.3.1 (build tool)
- Material-UI 7.0.2 + Tailwind CSS 4.1.4
- React Router DOM 7.5.3
- Supabase Auth (@supabase/supabase-js 2.57.4)
- Axios 1.9.0

**Backend:**
- FastAPI 0.115.12
- Python (managed via uv)
- Uvicorn 0.34.2 / Gunicorn 23.0.0
- Supabase 2.15.1 (PostgreSQL-based)
- OpenAI API 1.76.2 (using o4-mini-2025-04-16 model)
- Pydantic 2.11.3
- Docker + docker-compose (containerization)

## Development Commands

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

```bash
# 1. Install dependencies (uv creates .venv automatically)
uv sync

# 2. Run development server (choose one)
uv run fastapi run main:app --reload    # FastAPI CLI (recommended)
uv run uvicorn main:app --reload        # Uvicorn

# Add a new dependency
uv add <package>

# Add a dev dependency
uv add --group dev <package>

# Update lockfile after manual pyproject.toml edits
uv lock
```

### Docker (from `/backend` directory)

```bash
# Build and run
docker compose up --build

# Run in background
docker compose up -d

# Rebuild after dependency changes
docker compose build

# Stop
docker compose down
```

### Testing

```bash
# Backend tests (from /backend)
uv run pytest                           # Run all tests
uv run pytest tests/unit                # Unit tests only
uv run pytest tests/integration         # Integration tests only
```

## Architecture

### Backend: Layered Architecture

The backend follows a strict 3-tier separation:

1. **Routes** (`/backend/routes/`) - API endpoint definitions
   - `chat.py` - Chat endpoints (prefix: `/api/v1/chat`)
   - `philosophers.py` - Philosopher endpoints (prefix: `/api/v1/philosophers`)
   - `prompt.py` - AI prompting endpoints (prefix: `/api/v1/prompt`)
   - All routers are included in `main.py` with `/api` prefix

2. **Controllers** (`/backend/controllers/`) - Business logic
   - `create_chat.py`, `get_chat_by_id.py`, `get_chats.py`
   - `prompt_philosopher.py` - Handles OpenAI API interaction
   - `get_philosopher_by_id.py`, `get_philosophers.py`, `create_philosopher.py`
   - Controllers orchestrate external service calls (OpenAI, Supabase)

3. **Models** (`/backend/models/models.py`) - Pydantic data validation
   - `History`, `PromptRequest`, `Philosopher`, `Chat`

**Key Pattern:** Routes define endpoints → Controllers implement logic → Models validate data

### Frontend: Component-Based Architecture

```
frontend/src/
├── components/          # Reusable UI components
│   ├── GlobalNavigation.tsx
│   ├── ChatHistorySidebar.tsx
│   ├── Chatbar.tsx
│   └── ProfileDropdown.tsx
├── pages/              # Route-level components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── PhilosopherSelectionPage.tsx
│   ├── PhilosopherChatPage.tsx
│   ├── VoiceCallPage.tsx
│   └── UserSettingsPage.tsx
├── contexts/           # React Context providers
│   └── AuthContext.tsx
├── services/           # API abstraction layer
│   ├── chat/ChatService.ts
│   └── philosophers/PhilosopherService.ts
├── lib/               # Third-party service singletons
│   └── supabase.ts
└── constants/
    ├── types/         # TypeScript type definitions
    └── responses/     # API response types
```

### Singleton Pattern for Database Clients

**Critical:** Both frontend and backend use singleton pattern for Supabase clients to ensure single instances:

**Backend** (`/backend/db.py`):
```python
class SupabaseService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseService, cls).__new__(cls)
            # Initialize Supabase client
        return cls._instance
```

**Frontend** (`/frontend/src/lib/supabase.ts`):
```typescript
class SupabaseService {
  private static instance: SupabaseService;

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }
}
```

Always use the singleton instance, never create new Supabase clients directly.

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
- Integrates with Supabase Auth

**Backend:** Supabase handles authentication; backend uses service role key

## Environment Variables

### Frontend (`.env` in `/frontend`)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_BACKEND_URL=your_backend_api_url
```

### Backend (`.env` in `/backend`)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=your_frontend_url
```

## API Structure

All API routes are prefixed with `/api`. Main endpoints:

- `GET /health` - Health check
- `GET /api/v1/chat/` - Get all chats
- `GET /api/v1/chat/{chat_id}` - Get specific chat
- `POST /api/v1/chat/` - Create new chat
- `GET /api/v1/philosophers/` - Get all philosophers
- `GET /api/v1/philosophers/{philosopher_id}` - Get specific philosopher
- `POST /api/v1/philosophers/` - Create philosopher
- `POST /api/v1/prompt/` - Prompt AI philosopher

CORS is configured to allow all origins (`allow_origins=["*"]`) with credentials support.

## AI Integration

The application uses OpenAI's `o4-mini-2025-04-16` model for philosopher conversations:
- High reasoning effort configuration
- System prompts are stored per-philosopher in the Supabase database
- Prompting logic is in `/backend/controllers/prompt_philosopher.py`

## Database Schema (Supabase)

Primary tables:
- `Philosopher` - Stores philosopher configurations and system prompts
- `Chat` - Stores chat history and messages
- Authentication managed by Supabase Auth

## Code Conventions

1. **Frontend:**
   - Use functional components with hooks
   - Use TypeScript strict mode
   - Import from `@/*` aliases, not relative paths
   - Services abstract all API calls (don't call axios directly from components)

2. **Backend:**
   - Follow layered architecture: routes → controllers → models
   - Use Pydantic models for all request/response validation
   - Controllers handle business logic, routes only define endpoints
   - Use the SupabaseService singleton from `db.py`, never create new clients

3. **Dependency Management:**
   - Frontend: Standard `npm install` workflow
   - Backend: Use `uv add <package>` to add dependencies (updates `pyproject.toml` + `uv.lock`)
   - Backend: Use `uv sync` to install dependencies from lockfile
