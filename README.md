# MyClinic frontend

Arabic Vue/Vite UI **5173** → [backend](../backend/README.md) **5019**, API `/api/v1/`; assets `/static/`, root history routes.

```bash
./start.sh              # backend + frontend; Ctrl+C stops both
```

Windows: double-click `start.cmd`. Ports/interpreters/browser live in backend `.env`; startup never installs dependencies or initializes schema. Node `^22.18.0 || >=24.12.0`, pnpm and prepared backend/accounts are required. [Setup and VS Code tasks](docs/setup.md) covers first use, frontend-only development and both build tasks.

[Agent guide](AGENTS.md) · [Remaining work](docs/workCurrent.md) · [Evidence](docs/doneCurrent.md) · [UI ownership](docs/ui.md) · [Verification](docs/verification.md) · [API contracts](../backend/docs/contracts.md) · [Hosting](../backend/docs/setup.md#production)
