# Current work

Updated: 2026-10-08. Shell/layout/container fixes complete for **all 11 findings plus three responsive risks**; [implementation/checks](shell-layout-fixes.md), [original review](shell-layout-review.md). Passed 23 script parses, 18 template structure checks, 129 isolated assertions and 10 existing API version assertions. Rendered verification remains pending. Earlier design/layout/RTL fixes and CSS reorganization remain complete. See [fixes and verification](design-rtl-fixes.md) and [CSS organization](css-organization.md).

- Unverified (local browser launch failed): mobile/tablet/desktop RTL layouts, light/dark, charts/floating panels, login/CSRF, stale edits/retries, documents, imports/restores; rendered UI/interactions remain unchecked.
- Latest API integration: [backend second-pass record](../../backend/docs/backend-second-pass.md); care-team mutations now require patient versions, document updates/deletes require document versions.
- Coordinate PDF/Arabic/PostgreSQL concurrency checks with backend. No frontend production build run.
- Preserve opening versions, shared API/session/CSRF contracts, stable operation keys, preview-bound imports/restores; distinguish full recovery/catalog merge.
- Per `../AGENTS.md`, migrations, test-suite access, builds/compilation/packaging, version changes require explicit authorization.
- Resume: [README.md](../README.md), [backend current work](../../backend/docs/workCurrent.md), [implementation record](../../backend/docs/backend-fixes-implementation.md), and [workflow checklist](../../backend/docs/critical-workflow-checklist.md).
