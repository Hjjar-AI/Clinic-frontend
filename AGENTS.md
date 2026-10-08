# Frontend agent guide

- Before work, read `workCurrent.md`, `doneCurrent.md`, relevant work/plan files, and additional applicable `AGENTS.md`; use `README.md` for setup. For API changes, also read the backend handoffs and implementation notes.
- Do not inspect, review, edit, or create migration files unless explicitly requested; the user normally starts with a fresh database.
- Do not inspect or review test-suite files unless explicitly requested to work on tests.
- Do not run Gradle, builds, compilation, or packaging unless explicitly allowed. Simple development/debugging scripts and tools are allowed.
- Do not change dependency or application versions unless explicitly requested; preserve the dependency lockfile.
- When the five-hour usage allowance reaches 20% remaining, finish the current step and stop; do not claim usage visibility if unavailable.
- Preserve user changes. Keep these handoffs compact and current, and report verification limits honestly. `pnpm lint` and `pnpm format` modify files; avoid unrelated changes.
- Vue/Vite feature code lives in `src/features/`; shared UI in `src/components/`, state in `src/stores/`, API integration in `src/services/`. Use `@/` imports and established Arabic UI patterns.
- Local Vite port: `5173`; `/api` proxies to Django at `5019`. Browser API base: `/api/v1`; asset base: `/static/`; router history uses `/`.
- Use the shared API client and feature services. Preserve session credentials, login CSRF bootstrap, response envelopes, opening resource versions/`If-Match`, and operation keys across uncertain retries.
- Keep permission-aware navigation, conflict refresh behavior, import/restore previews and scope confirmations, and signed-visit document issuance. Backend authorization remains authoritative.
- Never put secrets in `VITE_*` variables, commit `.env.local`, or expose patient data in debugging output. Browser and PDF behavior must not be claimed verified from parser-only checks.
- Keep static styling in external CSS: shared styles in `public/static/css/`, component styles in `src/styles/` via scoped style sources. Keep inline bindings only for runtime geometry/data and preserve component scoping.
- Follow `docs/css-organization.md`: shared entry point `public/static/css/app.css`, kebab-case files grouped by responsibility; preserve cascade order and prefer coherent modules around 50–200 lines (review above 250 lines or 12 KiB).
