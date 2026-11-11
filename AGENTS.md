# Frontend agent guide

## Start and scope

- Read [remaining work](docs/workCurrent.md), [evidence](docs/doneCurrent.md) and applicable topic guides; check git status and production source before edits. Preserve unrelated work. [Setup](docs/setup.md) · [UI ownership](docs/ui.md).
- Finish authorized scope; reuse authorization within its scope. Explicit permission is required for migration/test-suite inspection/work, builds/compilation/packaging (including Gradle), and version/dependency/lockfile changes. Production study/exam code is not a test suite; isolated development probes are allowed. Documentation cleanup grants none of those permissions.
- If a visible five-hour allowance reaches 20% remaining, finish the current step and stop; never invent visibility. Reopen completed findings only with new evidence. An earlier stop on browser work remains in force until the user resumes that scope.

## Implementation boundaries

- Vue/Vite: `src/features/`, shared `src/components/`, state `src/stores/`, API `src/services/`; `@/` imports and existing Arabic UI patterns. Vite **5173** → backend **5019**, API `/api/v1/`, assets `/static/`, root history `/`. API changes require backend handoffs and [contracts](../backend/docs/contracts.md).
- Reuse the shared client/services for credentials, login CSRF/config, envelopes, opening versions/strict `If-Match`, stable uncertain-write keys and conflict refresh. Server authorization governs; preserve permission-aware UI, preview/scope consent and signed issuance.
- Preserve unknown/year-only birth, unchanged duplicate IDs/nonblocking review, optional explicit merge/access confirmation, clinical unknowns, effective-dated teams, ownership, correction reasons and register parent versions.

## CSS and UI

- Keep kebab-case global modules in `public/static/css/` behind one ordered `app.css`; preserve third-party cascade and early font/skeleton links. Mirrored external scoped styles live in `src/styles/`; retain deep selectors. Do not edit generated declarations/assets manually.
- Prefer cohesive 50–200-line CSS modules; review over 250 lines/12 KiB. Split by ownership, not counts; tiny owned files/tokens are valid. Matching selectors alone do not justify global/scoped merging.
- Externalize static inline styles, retain runtime geometry/data. Use logical edges and inspect RTL icons/transforms/drawers/floating/calendar geometry. Shell owns gutters, PageContainer widths; shrink flex/grid children and retain local table/tab scrolling. Use literal media breakpoints/noncyclic semantic tokens; preserve Arabic readability in light/dark modes.

## Verification, privacy and docs

- Follow [verification](docs/verification.md); use focused source/reference checks and isolated probes. Exclude suites, migrations, dist, dependencies and runtime data from broad searches. CSS moves need import/link/scoped/rule/cascade checks; lint/format commands write files.
- When authorized, check mobile/tablet/desktop, RTL/LTR/themes/overflow/focus. Record date, runtime, checks and limits: parsing/build success cannot prove layout, Arabic/PDF rendering or interaction. Never expose patient values or commit secrets, private `.env.local` or `VITE_*` credentials.
- Reviews identify source/impact/correction; fixes include permitted verification. Do not repeat successful checks without new evidence. Root Markdown: README/AGENTS only; remaining work belongs in `workCurrent`, dated evidence/limits in `doneCurrent`, durable facts in topic guides. Remove resolved tasks/duplicate inventories and repair links/anchors. Documentation-only edits need reference/diff checks, not suites/builds or clinic storage changes.
