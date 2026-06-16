# Copilot Instructions for StockRadar

## Architecture

This is a **split frontend/backend** project:

- **Frontend**: Next.js 16 (App Router) deployed on Vercel (`/src`). Uses React 19, TanStack Query, Zustand, Tailwind CSS v4, and `lightweight-charts`/`recharts` for charting.
- **Backend**: Express.js API deployed on Railway (`/backend`). Wraps the [Longbridge SDK](https://www.npmjs.com/package/longbridge) to provide stock market data. CommonJS (`require`).

The frontend does **not** call Longbridge directly. All market data flows through the backend API (`/api/*` routes), authenticated via a shared `API_SECRET` bearer token.

### Data flow

1. Frontend calls `/api/*` endpoints using `apiFetch()` (injects auth header) or `useApiQuery()` hook (TanStack Query wrapper around `apiFetch`).
2. Next.js rewrites `/api/*` requests to the backend (configured via Vercel rewrites or local proxy).
3. Backend routes use singleton Longbridge SDK contexts (initialized lazily in `backend/lb.js`).
4. Real-time quotes use Server-Sent Events via `/api/stream` with `@microsoft/fetch-event-source` on the client (`useRealtimeQuotes` hook).

### Key frontend patterns

- **`src/hooks/useApiQuery.ts`**: Preferred way to fetch data. Pass a query key and URL; auth is automatic.
- **`src/lib/api.ts`**: Low-level `apiFetch` for non-GET requests or use outside React Query.
- **`src/components/providers.tsx`**: Client-side QueryClientProvider (staleTime: 30s, no refetch on window focus).
- **`src/lib/constants.ts`**: Financial glossary for beginner-friendly tooltips.
- **`src/lib/scoring.ts`** / **`src/lib/summary-generator.ts`**: Client-side stock scoring and AI summary logic.

### Key backend patterns

- **`backend/lb.js`**: Singleton factory for Longbridge SDK contexts (QuoteContext, TradeContext, etc.). Supports corporate proxy via `https_proxy` env var.
- **`backend/routes/*.js`**: Each file exports a `register*Routes(app)` function that mounts Express routes.
- In-memory rate limiting (60 req/min per IP) and bearer token auth middleware in `index.js`.

## Build / Dev / Lint Commands

### Frontend (root directory)

```bash
npm run dev          # Next.js dev server on :3000
npm run build        # Production build
npm run lint         # ESLint (flat config, includes backend JS files)
```

### Backend (`cd backend`)

```bash
npm run dev          # Express dev server on :4000 (--watch, --env-file=.env)
npm start            # Production start
```

No test framework is configured.

## Environment Variables

- Frontend: copy `.env.local.example` → `.env.local` (keys: `BACKEND_URL`, `API_SECRET`, `NEXT_PUBLIC_APP_URL`)
- Backend: copy `.env.example` → `.env` (Longbridge API keys loaded via `Config.fromApikeyEnv()`, plus `API_SECRET`, `FRONTEND_URL`, `PORT`)

## Conventions

- Frontend is TypeScript with `@/` path alias mapping to `src/`.
- Backend is plain JavaScript (CommonJS). ESLint config disables `no-require-imports` for `backend/**/*.js`.
- UI uses Tailwind CSS v4 with a dark theme (`bg-zinc-950`, `text-white`). No component library — custom components in `src/components/ui/`.
- Stock symbols use Longbridge format (e.g., `US.AAPL`, `US.TSLA`).
- The app targets US stocks and is educational/beginner-focused (not financial advice).
