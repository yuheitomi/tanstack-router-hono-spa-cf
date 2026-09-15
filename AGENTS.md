# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Commands

- **Dev server**: `vp dev` (runs on port 3000)
- **Build**: `vp build` (runs the Vite production build)
- **Deploy**: `vp run deploy` (builds and deploys to Cloudflare Workers)
- **Check**: `vp check` (Oxfmt, Oxlint, and TypeScript)
- **Lint fix**: `vp lint --fix`
- **Format**: `vp fmt`
- **Test**: `vp test` (Vitest with the Cloudflare Workers plugin)
- **Generate CF types**: `vp run cf-typegen` (generates `worker-configuration.d.ts`)

## Architecture

This is a full-stack SPA template deploying to Cloudflare Workers. It uses a unified codebase with separate frontend and backend concerns.

### Directory Structure

- `src/api/` - Hono API backend (runs on Cloudflare Workers)
- `src/web/` - React SPA frontend (TanStack Router + Query)

### Key Patterns

**API (Hono)**:

- Entry point: `src/api/index.ts` - mounts routes under `/api` base path
- Routes: `src/api/routes/` - individual route modules
- Type export: `src/api/types.ts` - exports `AppType` for client type inference

**Frontend (React)**:

- Entry point: `src/web/main.tsx`
- Routes: `src/web/routes/` - file-based routing via TanStack Router plugin
- Route tree is auto-generated at `src/web/routeTree.gen.ts`
- Hono client: `src/web/lib/hono.ts` - type-safe API client using `AppType`

**Type-Safe API Calls**:
The frontend uses Hono's RPC client for end-to-end type safety:

```typescript
import { honoClient } from "@/web/lib/hono";
// Types inferred from API routes
const res = await honoClient.api.demo.todos.$get();
```

### TypeScript Configuration

- `tsconfig.json` - references web and worker configs
- `tsconfig.web.json` - frontend (includes `src/web` and `src/api`)
- `tsconfig.worker.json` - worker runtime (includes `src/api`)
- Path alias: `@/*` maps to `./src/*`

### Cloudflare Workers

- Config: `wrangler.jsonc`
- Routes matching `/api/*` run worker first; other routes serve the SPA
- Environment bindings typed in `worker-configuration.d.ts` (auto-generated)
- Access env via `c.env` in Hono handlers (e.g., `c.env.TEST_VAR`)

### Testing

Vitest uses `@cloudflare/vitest-plugin` to run tests in a Workers-like environment with Wrangler configuration.
