# MyClinic frontend

Arabic Vue clinic UI for patients, clinical encounters/documents, scheduling, billing, tasks, reports, imports/recovery and administration. [Django backend](../backend/README.md); [documentation by topic/source area](docs/README.md).

## Run and configure

Node `^22.18.0 || >=24.12.0`, pnpm and initialized backend/accounts. Start Django on **5019**; from `frontend/`:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Vite **5173**; `/api` proxies to `http://localhost:5019`, browser API `/api/v1`, assets `/static/`, root history routes `/login`, `/dashboard`, `/patients`. Keep hostname consistent for session/CSRF cookies.

| Variable | Default / use |
| --- | --- |
| `VITE_BACKEND_URL` | `http://localhost:5019`; `vite.config.js` reads `process.env`, so export it or prefix `VITE_BACKEND_URL=http://localhost:8000 pnpm dev`. |
| `VITE_API_BASE_URL` | `/api/v1`; `src/services/apiClient.js`, optional uncommitted `.env.local`. Browser-visible: no secrets. Separate API origins need matching CORS/CSRF/cookies. |

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server/proxy |
| `pnpm build` | `dist/` assets; explicit build authorization required |
| `pnpm preview` | Existing bundle preview; needs API routing |
| `pnpm lint`, `pnpm format` | ESLint/Prettier automatically modify files; avoid unrelated edits |
| Test commands | [Testing guide](docs/testing/guide.md); test transforms separately authorized |

## Source ownership

| Files | Responsibility |
| --- | --- |
| `src/features/` | Feature views/stores/services |
| `src/components/`, `src/composables/` | Shared UI/charts/interactions |
| `src/services/`, `src/stores/`, `src/bootstrap/` | API/events/shared state/application integration |
| `src/router/`, `src/utils/` | Auth/permission guards; validation/format/download/request helpers |
| `src/styles/`, `public/static/css/` | Mirrored scoped CSS, ordered shared `app.css`; [ownership](docs/ui/css.md), [layout/RTL behavior](docs/ui/layout.md) |
| `src/main.js`, `vite.config.js`, `index.html` | Startup/imports, aliases/plugins/proxy, early fonts/skeleton |

Use `@/` imports; Vue/router/Pinia helpers auto-import. Component auto-registration covers direct UI/common children; import deeper components explicitly. Shell owns gutters, PageContainer standard/wide/form bounds. Keep external scoped CSS/scoping and runtime geometry bindings. [Libraries/scripts](package.json).

## Integration and hosting

Use shared API/feature services: credentials/session, `/system/config/` login CSRF bootstrap, `X-CSRFToken`, `data`/`error` envelopes preserving falsy data, trailing slashes and `limit`→`per_page`, opening resource versions/`If-Match`, conflict refresh and retained operation keys after uncertain responses. UI guards/permissions complement authoritative backend authorization. Imports/restores require bound previews/scope; clinical issuance uses signed visits. [Patient contract](../backend/docs/contracts/patients.md), [backend implementation](../backend/docs/contracts/implementation.md).

Django serves existing `frontend/dist/index.html`/static sources. Host `/static/`, route `/api/v1/` to Django and provide SPA history fallback while preserving `/admin/` and protected document downloads. Vite proxy is dev-only; preview is local. Current Vite build has source maps and JS/CSS minification disabled; account for that in authorized production packaging. [Deployment](../backend/docs/setup/deployment.md).

Before edits read [AGENTS](AGENTS.md), [remaining work](docs/workCurrent.md), [completed verification](docs/doneCurrent.md), and backend handoffs. Migration/test-suite work, builds/compilation/packaging and version changes require explicit authorization. Login issues: check Django/proxy/hostname/CSRF; stale edits: refresh; route-refresh errors: history fallback/assets. [Troubleshooting](../backend/docs/operations/troubleshooting.md).
