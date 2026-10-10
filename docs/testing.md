# Automated tests

The suite uses synthetic records. Backend tests never load the clinic `.env`, database, media, backups or external cache. User authorization on 2026-10-11 permits test tooling and Vue/Vite test transforms; no production build was run.

## Run

Use the existing supported Node environment (verified with Node 24.21.0), then:

```bash
pnpm install --frozen-lockfile
pnpm test                 # Node service/state tests + rendered Vue tests
pnpm test:unit            # Node tests alone
pnpm test:components      # Vitest + Vue Test Utils + jsdom
pnpm test:coverage        # Native Node coverage of imported production JS
pnpm exec playwright install chromium
CLINIC_TEST_PYTHON=/home/mhmmd/Envs/clinic/bin/python pnpm test:e2e
CLINIC_TEST_PYTHON=/home/mhmmd/Envs/clinic/bin/python pnpm test:all
```

Set `CLINIC_TEST_PYTHON` to the Python interpreter for your backend environment; the default is `python3`. Backend dependencies must already be installed. Browser installation may need network access and Linux browser system libraries.

Playwright starts fresh localhost servers at **5174** and **5018**, refuses existing servers, and uses a temporary SQLite database/media directory. It does not use the usual development ports or demo data. Its Vite configuration serves SPA routes at `/` and assets at `/static/`, without emitting generated declaration files. Runs are sequential because the test server owns one synthetic database. Screenshots/traces appear in ignored `.test-artifacts/` only on failure.

## Coverage map

| Layer | Tested behavior |
| --- | --- |
| Node | Actual Axios interceptors and adapters: envelopes, credentials/CSRF, trailing slashes, parent/document versions, stale conflicts, stable retry keys, cancellation, duplicate mutations, blob errors and multipart uploads |
| Feature services | Authentication, patients/team/records/merge, visits, scheduling, billing, users/permissions, clinical catalogs, tasks, notifications, settings, dashboard/reports, document downloads and preview-bound import/recovery request contracts |
| State/composables | Actual Pinia authentication/permissions, route guards, CRUD state, confirmation queues, selection, private in-memory drafts, pagination, search races, notification counts and utility validation |
| Vue DOM | Buttons/confirmation/router links, labels/directions/model updates, modal/overlay ownership, table selection, uploads, demographic unknowns, real VeeValidate rules/server errors/reset, Arabic date picker, statistics values and visit patient links |
| SFC import check | All 36 feature views transform and resolve imports; this check does not mount every view |
| Browser | Chromium desktop 1280×800, tablet 768×1024, mobile 390×844: guest redirects/password visibility/rejected login, patient creation with unknown demographics/reload/overflow, receptionist permissions, real CSRF/idempotency/stale writes, signed visits/confirmation, user/template saves, 14 operational pages and dark-mode switching |

The Node loader supplies aliases/auto-imports and minimal browser doubles, denies unexpected network requests and resets Pinia/storage per case. `--test-isolation=none` is intentional: this Node version's default isolated mode with registration hooks reported files without executing registered cases. The runner's output must show individual tests and nonzero test counts. Vitest mounts real components; jsdom does not perform layout. Browser scenarios use the real Django API without mocked responses.

## Confirmed corrections

Regression tests exposed and now cover multipart bodies being JSON-encoded; cleared searches accepting old responses; already-read notifications reducing counts again; anonymous-looking session payloads; custom form errors losing their field path; server errors failing to clear; successful saves triggering dirty-route prompts; flatpickr locale registration; computed objects in statistics cards; nested patient IDs in visit links; and selection Sets passed to array-only tables. Backend auth permission and default-export corrections are documented in [backend testing](../../backend/docs/testing.md).

Existing application/dependency declarations and existing direct dependency resolutions were preserved. Only test dependencies/scripts and necessary lockfile entries were added. Historical shell/navigation findings are still tracked separately in [the review](shell-navigation-review.md).

## Verification limits

Latest run results and environment limitations are recorded in [completed work](doneCurrent.md). Node coverage reports imported JS only, not whole-application or Vue-template coverage; no 100% coverage claim or arbitrary threshold is imposed. The browser suite covers selected workflows and Arabic RTL viewports; it is not exhaustive visual/accessibility certification. Other browsers, LTR layouts, full chart/overlay interactions, every CRUD form, import/recovery UI, PDF typography/font assets, production bundles and PostgreSQL concurrent writers still need dedicated checks.
