# MyClinic frontend

Arabic Vue/Vite UI: **5173**, `/api` → [backend](../backend/README.md) **5019**, `/api/v1/`; assets `/static/`, root history routes. Node `^22.18.0 || >=24.12.0`, pnpm and initialized backend/accounts.

```bash
./start.sh              # Linux: backend + frontend, browser, Ctrl+C cleanup
```

Windows: double-click `start.cmd`. First-time prerequisites/dependency installation and backend `.env`: [launcher setup](../backend/docs/setup.md#local-launcher). `start.* configure` creates config/keys only when missing; `start.* check` diagnoses startup prerequisites without DB access. Ports/browser/interpreters are configured once in backend `.env`; schema/accounts remain an explicit setup step.

For frontend-only development, use `pnpm dev` after `pnpm install --frozen-lockfile`.

The frontend VS Code build task (`Terminal → Run Build Task`) runs `pnpm run build`. On Linux it uses interactive Bash so Node/pnpm installed through nvm in `~/.bashrc` are available even when VS Code's inherited PATH omits them. No installation is performed by the task.

`VITE_BACKEND_URL` defaults `http://localhost:5019`; `VITE_API_BASE_URL` defaults `/api/v1`. Match session/CORS/CSRF hostname; never store secrets in `VITE_*`/committed `.env.local`.

[Rules](AGENTS.md) · [Remaining](docs/workCurrent.md) · [Evidence](docs/doneCurrent.md) · [UI](docs/ui.md) · [Verification](docs/verification.md) · [API](../backend/docs/contracts.md) · [Hosting](../backend/docs/setup.md)

Use `@/` imports. Features in `src/features/`, shared components/composables and API in their `src/` directories. `pnpm lint`/`format` write files; builds need authorization. Django serves existing `dist/index.html`; current build settings expose sourcemaps/disable minification.
