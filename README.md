# MyClinic frontend

Arabic Vue/Vite clinic UI. [Backend](../backend/README.md): **5019**, `/api/v1/`; Vite: **5173**, `/api` proxy, `/static/` assets and root history routes.

Node `^22.18.0 || >=24.12.0`, pnpm and initialized backend/accounts. From `frontend/`:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

`VITE_BACKEND_URL` defaults to `http://localhost:5019`; export it for another proxy target. `VITE_API_BASE_URL` defaults to `/api/v1`. Match session hostname/CORS/CSRF; never put secrets in `VITE_*` or commit `.env.local`.

| Need | Document |
| --- | --- |
| Working rules | [AGENTS](AGENTS.md) |
| Remaining work / completed evidence | [Current](docs/workCurrent.md) / [completed](docs/doneCurrent.md) |
| Open source findings | [Review](docs/review.md) |
| CSS, layout, RTL and interaction ownership | [UI](docs/ui.md) |
| Test commands and browser coverage | [Verification](docs/verification.md) |
| API and hosting | [Backend contracts](../backend/docs/contracts.md) / [setup](../backend/docs/setup.md) |

Features/services/stores live in `src/features/`; shared UI/composables in `src/components/` and `src/composables/`; API in `src/services/`. Use `@/` imports and deeper component imports explicitly. [Package scripts](package.json): `lint`/`format` modify files; builds require authorization. Existing production output includes sourcemaps and disables JS/CSS minification. Django serves existing `dist/index.html`; proxy API/admin and protect clinical downloads.
