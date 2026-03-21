# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also the root-level `/CLAUDE.md` for full-stack project context.

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run preview      # Preview production build
npm run prod         # Build + preview combined
```

## Architecture

### Routing

All routes are defined in `src/App.tsx`. The app uses React Router v7 with `BrowserRouter`. Key route patterns:
- `/chat/new/:philosopherId` — new chat with a philosopher
- `/chat/:chatId` — existing chat by ID
- `/voice/:philosopherId` — voice call mode

Unauthenticated users see `GlobalNavigation`; authenticated users do not (chat pages have their own navigation via `ChatHistorySidebar`).

### Authentication

`src/contexts/AuthContext.tsx` exports `AuthProvider` and `useAuth()` hook. Auth state is stored in localStorage for fast hydration on reload.

### Services Layer

API calls are centralized in `src/services/` — never call axios directly from components.

- `ChatService.ts` — CRUD for chats, AI prompting, audio transcription
- `PhilosopherService.ts` — philosopher data with in-memory caching (5-min TTL)

All services use `import.meta.env.VITE_BACKEND_URL` as the API base URL.

### Path Aliases

Configured in both `tsconfig.app.json` and `vite.config.ts`:
- `@/*` maps to `src/*`
- `@/types` maps to `src/constants/types`

Always use `@/` imports instead of relative paths.

### UI Stack

Material-UI + Tailwind CSS 4 + Radix UI primitives. Tailwind is loaded via Vite plugin (`@tailwindcss/vite`), not PostCSS.

## Environment Variables

Required in `.env`:
```
VITE_BACKEND_URL
```

## Conventions

- Functional components with hooks only
- TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters` enabled)
- Toast notifications via `react-toastify` (configured in services, not components)
- Types live in `src/constants/types/`, API response types in `src/constants/responses/`
