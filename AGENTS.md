# Frontend agent guide

## Workflow

- Before editing, read [current](docs/workCurrent.md)/[completed](docs/doneCurrent.md) work, relevant plans, and applicable `AGENTS.md`; use [README.md](README.md) for setup. Read backend instructions/handoffs and implementation notes for API changes.
- Keep `README.md`/`AGENTS.md` at root; other documentation, reviews, plans, and handoffs belong in `docs/`. Update local/cross-project references after moves; keep guides compact and link detailed records instead of duplicating them.
- Preserve user changes and completed work. Reviews must identify findings, locations, impact, and corrections; fix requests require authorized implementation and verification, not suggestions alone.
- Keep handoffs current: completions, outstanding work, verification, limitations. Separate confirmed defects from unverified behavior; do not reopen completed findings without evidence.

## Limits

- Unless explicitly requested, do not inspect/review/edit/create migration files or inspect/review test-suite files. The user normally starts with a fresh database.
- No Gradle, builds, compilation, or packaging without explicit permission. Simple development/debugging scripts/tools are allowed. Preserve dependency/application versions and lockfiles unless version changes are explicitly requested.
- At 20% remaining five-hour usage allowance, finish the current step and stop. Do not claim usage visibility when unavailable.

## Application contracts

- Vue/Vite: features in `src/features/`, shared UI in `src/components/`, state in `src/stores/`, API integration in `src/services/`. Use `@/` imports and established Arabic UI patterns.
- Vite: `5173`; `/api` proxies to Django at `5019`. Browser API: `/api/v1`; assets: `/static/`; router history: `/`.
- Use the shared API client/feature services. Preserve session credentials, login CSRF bootstrap, response envelopes, opening resource versions/`If-Match`, and operation keys across uncertain retries.
- Preserve permission-aware navigation, conflict refresh, import/restore previews/scope confirmations, and signed-visit document issuance. Backend authorization remains authoritative.

## CSS, layout, and RTL

- Follow [CSS organization](docs/css-organization.md): shared CSS in `public/static/css/`, grouped by responsibility with kebab-case filenames and one ordered `app.css` entry point. Preserve cascade/third-party order and early font/skeleton links in `index.html`.
- Aim for coherent shared modules of 50–200 readable lines; review above 250 lines or 12 KiB. These are project guidelines, not CSS standards. Split/merge by ownership/purpose; do not fragment coherent tokens/themes or combine unrelated rules to meet counts.
- Keep component CSS in mirrored `src/styles/` paths via external `<style scoped src="...">`. Preserve scoping/deep selectors; tiny owned files are acceptable. Matching selectors alone do not justify merging global/scoped rules.
- Externalize nonessential static inline styles; retain runtime geometry/data bindings (floating coordinates, progress widths, chart heights, data-driven columns/colors).
- Use logical properties and start/end alignment for RTL/LTR. Explicitly check directional icons, transforms, drawers, floating panels, and calendar geometry; browsers do not reverse everything automatically.
- The shell owns page gutters; `PageContainer` owns standard/wide/form width constraints. Avoid duplicate padding/competing max-width overrides; allow grid/flex children to shrink and check distribution, wrapping, tables, and navigation at narrow widths.
- Use semantic tokens with noncyclic theme dependencies and literal media breakpoints, not CSS custom properties. Preserve light/dark and Arabic readability; consult the [layout/RTL fixes record](docs/design-rtl-fixes.md) for existing behavior/pending rendered checks.

## Verification and privacy

- Use focused source/reference checks and isolated development probes within these limits. Exclude migrations, test suites, `dist/`, dependencies, and runtime data from broad searches; do not modify generated assets. `pnpm lint`/`pnpm format` modify files; avoid unrelated changes.
- For CSS moves, verify imports, asset/document links, scoped references, and unchanged rules/cascade order. When browser verification is available, check intentional visual changes across mobile/tablet/desktop, supported RTL/LTR, light/dark, overflow, and keyboard focus.
- Report verification limits: source parsing does not verify browser interactions, rendered layouts, or Arabic/PDF output. Never claim unperformed build/browser checks.
- Never put secrets in `VITE_*`, commit `.env.local`, or expose patient data in debugging output.
