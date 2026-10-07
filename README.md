# MyClinic frontend

Vue application for the MyClinic clinic management system, with an Arabic interface for patients, visits, appointments, billing, clinical documents, tasks, reports, imports, backups, and administration. It connects to the sibling [Django backend](../backend/README.md).

## Requirements

- Node.js matching `package.json`: `^22.18.0 || >=24.12.0`.
- pnpm, with dependencies resolved through `pnpm-lock.yaml`.
- A configured backend with an initialized database and application accounts.

The main libraries are Vue, Vue Router, Pinia, Axios, TanStack Vue Query, Chart.js, VeeValidate, and Yup. Vite provides the development server and asset pipeline.

## Local development

Start Django on port **5019** using the backend README. In another terminal, from `frontend/`:

```bash
pnpm install
pnpm dev
```

Vite uses port **5173**; open the URL printed by the development server. The configured asset base is `/static/`, while application routes use root-based browser history, such as `/login`, `/dashboard`, and `/patients`.

Requests to `/api` are proxied to `http://localhost:5019`, so the default browser API base `/api/v1` works without frontend environment configuration. Use the same hostname consistently when accessing the app so session and CSRF cookies remain consistent.

To change the development proxy destination, supply an environment variable when starting Vite:

```bash
VITE_BACKEND_URL=http://localhost:8000 pnpm dev
```

## Configuration

| Variable | Default | Where it is used |
| --- | --- | --- |
| `VITE_BACKEND_URL` | `http://localhost:5019` | Development proxy target in `vite.config.js` |
| `VITE_API_BASE_URL` | `/api/v1` | Browser API base in `src/services/apiClient.js` |

`VITE_BACKEND_URL` is read from `process.env` in the Vite configuration; export it in the shell or use the command above. The configuration does not explicitly load it from an `.env` file.

`VITE_API_BASE_URL` follows Vite's client environment handling and can be set in an uncommitted `.env.local`. Its value is exposed to the browser; never put secrets in `VITE_*` variables. Prefer the default same-origin API path. A separate API origin needs compatible backend CORS, CSRF, and cookie settings, and is not a drop-in replacement for the development proxy.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Produce assets in `dist/`; run only when build work is authorized |
| `pnpm preview` | Preview an existing build locally |
| `pnpm lint` | Run ESLint with automatic fixes; modifies files |
| `pnpm format` | Run Prettier over the project; modifies files |

The API proxy is configured for the development server. Preview hosting needs its own API routing arrangement. Preserve dependency versions and the lockfile unless a dependency change is explicitly requested.

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
  main.js         Application startup and stylesheet imports
public/           Static resources, including shared CSS
vite.config.js    Asset base, aliases, plugins, and API proxy
```

Use `@/` for imports from `src/`. Vue, router, and Pinia helpers are auto-imported; components directly inside `src/components/ui` and `src/components/common` are registered through the component plugin. Deeper component directories need explicit imports.

## Backend integration

Use the shared `apiClient` and existing feature services when adding workflows:

- Session authentication uses cookies with credentials enabled. The auth service fetches `/system/config/` before login to bootstrap CSRF; unsafe requests send the `csrftoken` value as `X-CSRFToken`.
- Responses use a `data` envelope. `unwrapResponse` extracts payloads, including valid falsy values. API errors use an `error` object.
- The client adds trailing slashes, maps `limit` to `per_page`, and tracks resource versions for `If-Match`. Pass explicit versions where the workflow requires them and refresh after stale-edit conflicts.
- Covered mutations receive `X-Idempotency-Key`. Reuse the key when retrying the same logical operation after an uncertain response.
- Route guards enforce authentication and permission visibility; the backend remains responsible for authorization.
- Imports and restores require preview steps. Full recovery and catalog merge have different scopes; preserve their confirmation and preview contracts.
- Issued clinical documents depend on signed visit revisions. Document issuance must follow the backend's finalized-visit workflow.

## Hosting

Django reads `frontend/dist/index.html` as the SPA template and includes `frontend/dist/` among its static source directories. The deployed application must serve generated assets under `/static/`, forward `/api/v1/` to Django, and return the SPA entry point for frontend history routes. Preserve the backend's separate `/admin/` and media handling.

The current Vite configuration enables source maps and disables JavaScript/CSS minification. Account for those settings when preparing an authorized production build. Vite preview is a local preview tool, not the production serving arrangement.

## Development notes

Follow the project rules in [backend/AGENTS.md](../backend/AGENTS.md), and check [current work](../backend/workCurrent.md) and [completed work](../backend/doneCurrent.md). Do not inspect test suites, work on migrations, run builds/compilation/packaging, or change versions without explicit authorization.

For login problems, verify that Django is running, the proxy target is correct, cookies are accepted, and the CSRF bootstrap request succeeds. For stale-edit conflicts, refresh the record before retrying. For deployment refresh errors, check the SPA history fallback and `/static/` asset paths.

See the [documentation index](../backend/docs/README.md) and [backend implementation notes](../backend/docs/backend-fixes-implementation.md). Browser workflows, PDF/Arabic rendering, and production database concurrency remain validation items.
