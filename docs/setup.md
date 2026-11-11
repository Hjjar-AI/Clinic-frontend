# Frontend setup

[Entry point](../README.md) · [Shared launcher/backend setup](../../backend/docs/setup.md) · [Verification](verification.md) · [Evidence](doneCurrent.md).

## Runtime and commands

Node `^22.18.0 || >=24.12.0`, pnpm and prepared backend schema/accounts are required. Use the intended environment; dependency installation, builds and schema work need their own authorization.

- Shared development: `./start.sh` or Windows `start.cmd` starts backend/Vite and owns cleanup. `start.* configure` creates private backend `.env` only when absent; `start.* check` checks prerequisites without DB access.
- Frontend-only: after authorized `pnpm install --frozen-lockfile`, run `pnpm dev`. Development does not require a production build.
- Authorized production build: `pnpm run build` writes ignored `dist/`; Django can serve its existing index. Current Vite settings retain sourcemaps and disable JS/CSS minification. [Hosting](../../backend/docs/setup.md#production) owns proxy/static/collectstatic order.

`VITE_BACKEND_URL` defaults to `http://localhost:5019`; `VITE_API_BASE_URL` to `/api/v1`. The shared launcher supplies its chosen backend target. Match session/CORS/CSRF hostname; never store secrets in `VITE_*` or committed private `.env.local`. Features use `src/features/`, shared UI/services their existing owners, and `@/` imports. Lint/format commands write files.

## VS Code build tasks

The default **Clinic: build frontend** task directly runs `/usr/bin/bash -i -c 'pnpm run build'` on Linux, loading nvm from interactive `~/.bashrc`. Automatic npm tasks need the same environment. Single-folder windows receive it from [.vscode/settings.json](../.vscode/settings.json); multi-root windows need this in the `.code-workspace` file's `settings` object:

```json
{
  "terminal.integrated.automationProfile.linux": {
    "path": "/usr/bin/bash",
    "args": ["-i"]
  }
}
```

Reload the window after changing the profile so old task terminals are replaced. Either automatic npm build or **Clinic: build frontend** can then be used. The named task uses cmd on Windows. Neither installs packages. A successful shell command is not proof that the editor UI applied a setting; record those checks separately.
