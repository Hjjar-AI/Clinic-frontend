# Current work

Updated: 2026-10-08. Design/layout/RTL fixes, external CSS extraction, and CSS reorganization are implemented; no implementation task is active. See [fixes and verification](docs/design-rtl-fixes.md) and [CSS organization](docs/css-organization.md).

- Outstanding validation: rendered layouts/RTL at mobile/tablet/desktop widths, light/dark themes, charts and floating panels, plus login/CSRF, stale edits/retries, documents, imports, and restore workflows. Browser launch failed locally; rendered UI and interactions remain unverified.
- Coordinate PDF/Arabic rendering and PostgreSQL concurrency validation with the backend. A frontend production build has not been run.
- Preserve editor opening versions, shared API client contracts, session/CSRF handling, stable operation keys, and preview-bound imports/restores. Keep full recovery distinct from catalog merge.
- Follow `AGENTS.md`: migration work, test-suite access, builds/compilation/packaging, and version changes require explicit authorization.
- Resume using [README.md](README.md), [backend current work](../backend/workCurrent.md), [implementation record](../backend/docs/backend-fixes-implementation.md), and [workflow checklist](../backend/docs/critical-workflow-checklist.md).
