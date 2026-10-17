# TanStack Router + Hono SPA on Cloudflare Workers

A full-stack single-page app template that deploys a React frontend and a Hono API as a single Cloudflare Worker, with end-to-end type safety between them.

## Stack

| Layer     | Tools                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| Frontend  | React 19, [TanStack Router](https://tanstack.com/router) (file-based), [TanStack Query](https://tanstack.com/query) |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)-ready                              |
| API       | [Hono](https://hono.dev/) with the RPC client                                                                       |
| Runtime   | [Cloudflare Workers](https://developers.cloudflare.com/workers/) + Static Assets                                    |
| Toolchain | [Vite+](https://viteplus.dev/) (Vite, Vitest, Oxlint, Oxfmt), TypeScript 7, pnpm                                    |

## Getting Started

```bash
vp install
vp dev        # http://localhost:3000
```

The dev server runs the Worker in `workerd` through `@cloudflare/vite-plugin`, so `/api/*` requests and bindings behave the same as in production.

## Commands

| Command             | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `vp dev`            | Start the dev server on port 3000                            |
| `vp build`          | Production build                                             |
| `vp run deploy`     | Build and deploy to Cloudflare Workers                       |
| `vp check`          | Format check, lint, and type check                           |
| `vp lint --fix`     | Fix lint issues                                              |
| `vp fmt`            | Format the code                                              |
| `vp test`           | Run tests with Vitest in a Workers runtime                   |
| `vp run cf-typegen` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc` |

## Architecture

```
src/
├── api/                    # Hono API (runs in the Worker)
│   ├── index.ts            # Worker entry; mounts routes under /api
│   ├── types.ts            # Exports AppType for the RPC client
│   └── routes/             # One Hono app per route module
└── web/                    # React SPA
    ├── main.tsx            # Router + QueryClient setup
    ├── routes/             # File-based routes (TanStack Router)
    ├── routeTree.gen.ts    # Auto-generated, do not edit
    ├── integrations/       # TanStack Query provider and devtools
    ├── components/
    └── lib/
        ├── hono.ts         # Typed API client factory
        └── utils.ts        # cn() helper for shadcn/ui
```

### Request flow

One Worker serves both the API and the SPA. `wrangler.jsonc` configures this:

- `/api/*` runs the Worker first (`run_worker_first`), so Hono handles it.
- Every other path is served from the built assets in `dist/`. Unknown paths fall back to `index.html` (`not_found_handling: "single-page-application"`) so client-side routing works on refresh.

### Type-safe API calls

API routes are chained Hono apps, so their types flow to the frontend through `AppType`. No code generation is needed:

```ts
// src/api/routes/todos.ts
const route = new Hono<{ Bindings: Env }>().get("/", (c) => c.json({ todos: [] }));
export default route;

// src/api/index.ts
const api = new Hono().basePath("/api").route("/todos", todosRoute);

// src/web/routes/todos.tsx — the client comes from router context
export const Route = createFileRoute("/todos")({
  loader: async ({ context }) => {
    const res = await context.hono.api.todos.$get(); // fully typed
    return res.json();
  },
});

// inside a component
const { hono } = Route.useRouteContext();
```

Keep routes chained (`new Hono().get(...).post(...)`) rather than calling `app.get(...)` on separate lines, or the route types are lost.

### Data loading

The router context carries the `QueryClient`, so route loaders can prefetch queries while components read them with `useSuspenseQuery`. See `src/web/routes/demo/tanstack-query.tsx` for an example that covers loading, mutations, and cache invalidation.

### Environment and bindings

- Add variables and bindings (KV, D1, R2, and others) to `wrangler.jsonc`, then run `vp run cf-typegen` to update the `Env` type.
- Read them in handlers with `c.env`, for example `c.env.TEST_VAR`.
- Put local secrets in `.dev.vars`, which must not be committed.

### TypeScript projects

| Config                 | Covers                      | Purpose                               |
| ---------------------- | --------------------------- | ------------------------------------- |
| `tsconfig.web.json`    | `src/web`, `src/api`        | Browser code (DOM types)              |
| `tsconfig.worker.json` | `src/api`, `vite.config.ts` | Worker runtime types and build config |

The `@/*` path alias maps to `src/*`.

## Adding things

- **API route:** create `src/api/routes/<name>.ts` and mount it in `src/api/index.ts` with `.route("/<name>", ...)`.
- **Page:** add a file to `src/web/routes/`. The route tree regenerates automatically while the dev server runs.
- **UI component:** `vp dlx shadcn@latest add button`.

## Testing

`vp test` runs Vitest through `@cloudflare/vitest-plugin`, which loads `wrangler.jsonc` so tests run in `workerd` with real bindings. The template ships without tests; add `*.test.ts` files next to the code they cover.

## Demo files

Everything under `demo` can be deleted:

- `src/api/routes/demo.ts`
- `src/web/routes/demo/`

Also remove the `/demo` mount in `src/api/index.ts` and the demo links in `src/web/components/header.tsx`.
