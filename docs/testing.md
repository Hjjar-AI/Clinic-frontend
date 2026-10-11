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

Latest run results and environment limitations are recorded in [completed work](doneCurrent.md). Node coverage reports imported JS only, not whole-application or Vue-template coverage; no 100% coverage claim or arbitrary threshold is imposed. The browser suite covers selected workflows and Arabic RTL viewports; it is not exhaustive visual/accessibility certification. Other browsers, LTR layouts, full chart/overlay interactions, remaining CRUD forms, production bundles and PostgreSQL concurrent writers still need dedicated checks.

## Workflow expansion (2026-10-11)

Added **41 rendered component tests** in `tests/components/patient-workflows.spec.js`, `tests/components/import-recovery.spec.js`, `tests/components/billing-form.spec.js` and `tests/components/appointment-form.spec.js`. Together with the existing cases, these comprise **110 Node tests and 74 Vue DOM/import checks**, including all 36 feature-view imports. Combined execution results are recorded in the completed handoff.

- Patient records: opening parent versions survive prop refreshes, stale errors retain drafts, corrections/retirement carry reasons, permission-aware kinds, archived/legacy record controls, paginated history and late-response suppression.
- Care team: numeric member IDs, selected roles, parent versions, dated membership display and permission-aware management.
- Documents: opening document versions, multipart file/provenance, rejected edits, archive cancellation/confirmation and archived-patient download controls.
- Duplicate review/merge: optional dismissal, admin-only controls, required consent/reason and preview-bound source/target versions.
- Diagnosis/medication imports: preview before commit, tokens bound to mappings/modes, reset after mode/mapping changes and failed-preview behavior. The failed-preview test explicitly captures Vue's application error handler; unhandled rejections are not ignored.
- Recovery UI: file/clear confirmation, exact phrase and execution consent, preview tokens, explicit scopes and reset on scope changes. These DOM tests do not execute a real full restore.
- Billing: actual forms/router and VeeValidate check fractional/zero amounts, computed totals, invalid submissions, opening invoice versions, normalized dates, optional visits, rejected saves and clean navigation. Assertions await completed asynchronous validation/mutations to prevent work leaking into subsequent cases.
- Appointments: actual forms/router check cancellation reasons, completed-state transition restrictions, opening versions, normalized scheduling data, retained drafts after rejection and clean navigation. The time-slot child is replaced only for these form-context tests; availability rendering is not established by this double.

Added seven browser scenarios (`tests/e2e/patient-workflows.spec.js`), each passed in all three viewports: record correction/retirement/history, stale drafts, upload/download/metadata/archive, duplicate review, diagnosis import, care-team membership and optional merge. The full **42-case Chromium matrix passed** in the final run (5.1 minutes, no retries). It used the real workspace sources, isolated Django API, Chromium 156 and temporary caches/artifacts. The normal project configs were extended only in `/tmp` to accommodate read-only dependency directories; no production bundle was generated. Runtime/backend limits are in the [backend guide](../../backend/docs/testing.md).

When the installed dependency directory is read-only, run the existing Node tests directly to avoid pnpm's automatic install check. Vitest can keep its token/cache in `/tmp` without changing the lockfile:

```bash
node --import ./tests/setup.js --test --test-isolation=none tests/*.test.js
XDG_DATA_HOME=/tmp/clinic-test-tools node node_modules/vitest/vitest.mjs run \
  --configLoader runner --cache=false --fsModuleCachePath /tmp/clinic-test-module-cache
```

The original native JS coverage figures remain historical measurements; this expansion did not recalculate coverage percentages.

Real browser execution identified a backend 204-response framing defect: document archive committed but its JSON body broke the Vite proxy. The backend renderer correction is covered by empty-body/idempotent-replay regressions and the archive browser scenario. Aggregate browser traffic also required higher quotas only in the disposable backend fixture; production limits remain unchanged, with separate HTTP rate-enforcement tests.

The mobile matrix also confirmed an oversized sticky patient header covering action buttons and shrinking tab labels overlapping. Two CSS declarations correct narrow-header scrolling and preserve tab widths; regression assertions check actual clickability, label overflow, mobile header positioning and whole-page overflow. [Findings and locations](design-rtl-fixes.md).

## Complete clinical workflows and PDF/print (2026-10-11)

The full **60-case Chromium matrix passed**, without retries, across desktop/tablet/mobile. Added booking/rescheduling, actual visit creation/signing/reasoned amendments, signature-based prescription/referral issuance, decimal invoice issuance/payment/export, patient and medication import wizards, and full ZIP download/preview/restore/relogin. Tests retain six PDFs per viewport when `CLINIC_PDF_ARTIFACT_DIR` is set. Three final print-font assertions also passed in a focused rerun. Full component suite: **77 Vue DOM/import checks**; Node suite remains **110 tests**. Shared control regressions check decimal step/native validity, click-event forwarding and router-link href, with a real visit payload test for clinical unknowns.

```bash
CLINIC_PDF_ARTIFACT_DIR=/tmp/clinic-browser-pdfs pnpm test:e2e
```

[Detailed PDF/workflow verification, defects corrected and remaining limits](../../backend/docs/pdf-workflow-verification.md).

## Tasks, notifications and scheduling availability (2026-10-11)

Added **32 rendered cases** in `tests/components/task-workflows.spec.js`, `notification-workflows.spec.js` and `time-slot-picker.spec.js`, plus **six Chromium cases** in `tests/e2e/task-workflows.spec.js` across desktop/tablet/mobile. The new DOM cases use actual stores/services and controls; HTTP adapters return synthetic responses. Browser cases use the real isolated Django API.

Final full runs: **110 Node / 109 Vue DOM/import / 66 Chromium cases passed**, plus **193 backend tests**. Chromium ran all cases without retries in 7.6 minutes. The PDF appearance inspector was not rerun; earlier appearance results remain recorded separately.

- Tasks: creation with optional/null or explicit due date, failed/blank submissions, inline draft retention, status-appropriate controls, opening versions and cancellation reasons, dismissed confirmations, stale writes, immediate list refresh after deletion and reapplication of active filters after transitions.
- Notifications: real list envelopes, read-before-navigation, already-read navigation without repeat mutations, unsafe/absent links, deletion of read/unread rows and empty states.
- Availability: actual doctor/date/duration requests, date normalization, occupied options, preservation of the existing booking time, clearing newly unavailable selections, disabled loading, cancelled/stale responses, cleared scheduling context, unmount cancellation and rejected refreshes.
- Browser: actual task creation without a due date, start/complete/reopen/cancel, reason dismissal/confirmation, persisted versions/reasons, confirmed deletion with immediate row removal, narrow-width overflow, and permission denial without changing the task.

Regressions confirmed and corrected: both task forms called nonexistent store actions; blank optional due dates were sent as invalid empty strings; successful mutations left the list's separate row array/filter results stale; clearing doctor/date failed to cancel pending availability or clear old options/selection. Forms now reuse the existing `create` action, send `null` for absent dates, retain failed drafts and refresh through `ListView`'s existing `refreshKey`. The availability picker clears its request/state when context is missing.

Focused commands (existing installed tooling, no production bundle):

```bash
XDG_DATA_HOME=/tmp/clinic-test-tools node node_modules/vitest/vitest.mjs run \
  tests/components/task-workflows.spec.js tests/components/notification-workflows.spec.js \
  tests/components/time-slot-picker.spec.js --configLoader runner --cache=false \
  --fsModuleCachePath /tmp/clinic-test-module-cache
CLINIC_TEST_PYTHON=/home/mhmmd/Envs/clinic/bin/python pnpm test:e2e -- task-workflows.spec.js
```

This session used temporary Vite/Playwright config wrappers: absolute project root/server working directories, Vite dependency cache and failure artifacts under `/tmp`, and the installed Vite CLI instead of pnpm's install check. Test settings, assertions, viewports and sources were preserved. Localhost servers/Chromium required sandbox escalation. No application/dependency version or lockfile changes, production build, clinic-data mutation or migration-file work were performed. Full-suite results are in [completed work](doneCurrent.md); jsdom does not verify layout, and Chromium RTL checks do not verify other engines/LTR/accessibility exhaustively.
