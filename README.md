# MyClinic frontend

Arabic Vue clinic UI: patients, visits, appointments, billing, clinical documents, tasks, reports, imports, backups, administration. API: sibling [Django backend](../backend/README.md).

## Requirements

- Node.js per `package.json`: `^22.18.0 || >=24.12.0`.
- pnpm with `pnpm-lock.yaml`.
- Configured backend, initialized database, application accounts.

Libraries: Vue, Vue Router, Pinia, Axios, TanStack Vue Query, Chart.js, VeeValidate, Yup; Vite dev server/asset pipeline.

## Local development

Start Django on **5019** per backend README; second terminal, from `frontend/`:

```bash
pnpm install
pnpm dev
```

Open Vite's printed URL (port **5173**). Asset base: `/static/`; root-based history routes: `/login`, `/dashboard`, `/patients`.

`/api` proxies to `http://localhost:5019`; default `/api/v1` needs no frontend environment configuration. Use a consistent hostname for session/CSRF cookies.

Override the dev proxy when starting Vite:

```bash
VITE_BACKEND_URL=http://localhost:8000 pnpm dev
```

## Configuration

| Variable | Default | Where it is used |
| --- | --- | --- |
| `VITE_BACKEND_URL` | `http://localhost:5019` | Development proxy target in `vite.config.js` |
| `VITE_API_BASE_URL` | `/api/v1` | Browser API base in `src/services/apiClient.js` |

Vite reads `VITE_BACKEND_URL` from `process.env`, not explicitly from `.env`; export it or use the command above.

Set client `VITE_API_BASE_URL` in uncommitted `.env.local`; browser-visible `VITE_*` must contain no secrets. Prefer same-origin defaults: a separate API origin requires compatible CORS/CSRF/cookies and cannot simply replace the dev proxy.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Produce assets in `dist/`; run only when build work is authorized |
| `pnpm preview` | Preview an existing build locally |
| `pnpm lint` | Run ESLint with automatic fixes; modifies files |
| `pnpm format` | Run Prettier over the project; modifies files |

The proxy is dev-only; preview hosting needs API routing. Preserve versions/lockfile unless dependency changes are explicitly requested.

## Project structure

```text
src/
  features/       Feature views, stores, and services
  components/     Shared UI, common components, and charts
  services/       API client, CRUD helpers, and API events
  stores/         Shared state and lookup stores
  router/         Routes and authentication/permission guards
  bootstrap/      Application integration and event handlers
  utils/          Validation, formatting, downloads, and request helpers
  styles/         External component CSS, loaded through scoped style sources
  main.js         Application startup and stylesheet imports
public/           Static resources, including shared CSS
vite.config.js    Asset base, aliases, plugins, and API proxy
```

Use `@/` for `src/` imports. Vue/router/Pinia helpers auto-import; the component plugin registers direct `src/components/ui`/`src/components/common` children. Import deeper components explicitly.

External CSS: shared tokens/layouts/utilities in `public/static/css/`; component styles in `src/styles/` via `<style scoped src="...">`. Inline bindings only for runtime coordinates, progress widths, data-driven columns. Shell owns gutters; `PageContainer` widths: `standard`/`wide`/`form`.

Shared entry: `public/static/css/app.css`; preserve cascade order, responsibility groups, kebab-case names. Ownership/sizes/scoping: [CSS organization](docs/css-organization.md).

## Backend integration

Use shared `apiClient`/feature services:

- Session cookies require credentials; auth fetches `/system/config/` before login for CSRF. Unsafe requests send `csrftoken` as `X-CSRFToken`.
- Responses: `data`; `unwrapResponse` preserves valid falsy payloads. Errors: `error`.
- Client adds trailing slashes, maps `limit` to `per_page`, tracks `If-Match` versions. Pass explicit versions where required; refresh stale-edit conflicts.
- Covered mutations receive `X-Idempotency-Key`; uncertain-response retries reuse the logical operation's key.
- Route guards enforce auth/permission visibility; backend authorizes.
- Imports/restores require previews; preserve distinct full-recovery/catalog-merge scopes and confirmation contracts.
- Issue clinical documents from signed revisions through the backend finalized-visit workflow.

## Hosting

Django uses SPA template `frontend/dist/index.html` and static source `frontend/dist/`. Hosting must serve `/static/`, forward `/api/v1/` to Django, and return SPA entry for history routes; preserve separate `/admin/`/media handling.

Vite enables source maps and disables JavaScript/CSS minification; account for this in authorized production builds. Vite preview is local, not production hosting.

## Development notes

Before edits: [AGENTS.md](AGENTS.md), [current work](docs/workCurrent.md), [completed work](docs/doneCurrent.md). API coordination: [backend guide](../backend/AGENTS.md), [backend current work](../backend/docs/workCurrent.md), [backend completed work](../backend/docs/doneCurrent.md). Test-suite inspection, migrations, builds/compilation/packaging, version changes require explicit authorization.

Login failures: check Django, proxy, cookies, CSRF bootstrap. Stale edits: refresh before retrying. Deployment refresh errors: check SPA history fallback and `/static/` paths.

References: [documentation index](../backend/docs/README.md), [backend implementation notes](../backend/docs/backend-fixes-implementation.md). Unverified: browser workflows, PDF/Arabic rendering, production database concurrency.
