# Frontend tests by layer and file

Tests/tooling and Vue/Vite test transforms are explicitly authorized; production builds are separate. Use synthetic data. Latest counts, full/focused reruns and runtime limits: [completed](../doneCurrent.md); [remaining checks](../workCurrent.md).

## Commands (from frontend)

Supported Node: `^22.18.0 || >=24.12.0` (verified 24.21.0); preserve existing versions/lockfile.

```bash
pnpm install --frozen-lockfile
pnpm test                 # Node + mounted Vue
pnpm test:unit
pnpm test:components
pnpm test:coverage        # imported production JS only
pnpm exec playwright install chromium
CLINIC_TEST_PYTHON=/home/mhmmd/Envs/clinic/bin/python pnpm test:e2e
CLINIC_TEST_PYTHON=/home/mhmmd/Envs/clinic/bin/python pnpm test:all
CLINIC_PDF_ARTIFACT_DIR=/tmp/clinic-browser-pdfs pnpm test:e2e
```

Set `CLINIC_TEST_PYTHON` to an interpreter with backend dependencies; default `python3`. Chromium installation may require network/system libraries. PDF retention/inspection: [PDF guide](../../../backend/docs/testing/pdf.md).

Read-only installed dependency directories: bypass pnpm's install check; keep Vitest token/cache outside the checkout:

```bash
node --import ./tests/setup.js --test --test-isolation=none tests/*.test.js
XDG_DATA_HOME=/tmp/clinic-test-tools node node_modules/vitest/vitest.mjs run \
  --configLoader runner --cache=false --fsModuleCachePath /tmp/clinic-test-module-cache
```

Focused runs accept file arguments (`pnpm test:e2e -- frontend-interactions.spec.js`, or paths after Vitest `run`). Sandbox restrictions in recorded browser runs required temporary Vite/Playwright wrappers using absolute project/server paths, installed Vite CLI, caches/artifacts under `/tmp` and localhost/Chromium permission. They preserved sources/assertions/viewports, emitted no declarations/bundle and did not alter project lockfiles.

## Isolation and interpretation

Playwright starts fresh localhost Vite **5174** / Django **5018**, refuses existing servers, owns temporary SQLite/media and runs sequentially against one synthetic database. SPA history `/`, assets `/static/`; failures produce ignored `.test-artifacts/` screenshots/traces. Actual browser responses are not mocked; per-viewport notification users keep counts independent. Fixture-only quotas accommodate aggregate traffic; production rates are unchanged and HTTP tests verify throttles.

Node loader supplies aliases/auto-imports/minimal browser doubles, blocks unexpected network and resets Pinia/storage. `--test-isolation=none` prevents registration hooks reporting files without executing cases; verify individual output/nonzero counts. Vitest mounts real Vue controls, using controlled HTTP/Chart.js doubles where needed. jsdom has no rendered layout; import checks resolve all 36 views without mounting each view.

## Coverage by test file/source area

Paths in this table are relative to `tests/`; Node files are `*.test.js`, Vue files under `components/`, browser files under `e2e/`.

| Files / area | Covered behavior |
| --- | --- |
| Node service/state suite | Actual Axios envelopes/falsy data, credentials/CSRF/slashes/pagination, parent/document `If-Match`, conflicts, retained retry keys, cancellation/duplicate mutations, blob errors/multipart; auth/permissions/router, CRUD/confirmation/selection/private drafts/search/counts/validation; patient/visit/scheduling/billing/catalog/tasks/settings/report/document/import/recovery service contracts. |
| Shared DOM/forms and feature-view imports | Button native events/router href, labels/direction/models, confirmation/overlay ownership, table selection, uploads, demographic unknowns, actual VeeValidate rules/server errors/reset/dirty navigation, Arabic date picker, statistics values and nested visit patient links; all 36 feature views resolve. |
| `components/patient-workflows.spec.js` | Every longitudinal kind, opening parent versions despite refreshed props, retained stale drafts, reasoned correction/retirement, archived/legacy permissions, paginated history/late responses; numeric team IDs/roles/dates; document provenance/multipart/opening versions/archive/download; dismissible duplicate review and admin consent/reason/preview-bound merge. |
| `components/import-recovery.spec.js` | Diagnosis/medication preview before commit; token reset on mapping/mode change and failed preview; file/clear confirmations, exact recovery phrase/consent/scope/token resets. Application error handler is explicitly captured; no ignored unhandled rejection. DOM recovery does not execute real restore. |
| `components/billing-form.spec.js`, `appointment-form.spec.js` | Real router/VeeValidate: fractional/zero totals/native validation, opening versions/normalized dates/optional visits, cancellation reasons/completed-state restrictions, invalid/failed submissions retain drafts and successful saves navigate cleanly. Availability child replaced only for appointment form context. Await async validation/mutations to prevent leaking work. |
| `components/task-workflows.spec.js` | Null/explicit due dates, blank/rejected creation, inline drafts, status-appropriate controls, opening versions/reasons/confirmation dismissal/stale writes, immediate delete refresh and active filters after transitions. |
| `components/notification-workflows.spec.js` | Envelopes/read-before-navigation, already-read no-op, unsafe/absent links, read/unread deletion/empty states; persistent initial polling fetch and single timer/fetch across repeated owners. |
| `components/time-slot-picker.spec.js` | Real doctor/date/duration requests, normalized dates, occupied options/current booking, unavailable selection clearing, loading, stale/cancelled/cleared-context/unmount/rejected refreshes. |
| `components/chart-interactions.spec.js`, `date-range-interactions.spec.js` | Data copies/in-place/empty transitions, theme recreation, cleanup, RTL/LTR/compact legends/Arabic ticks/palette cycling; displayed D/M/Y versus ISO model, controlled picker reset and paired-calendar Escape. |
| `components/search-interactions.spec.js`, `floating-keyboard.spec.js`, `overlay-focus.spec.js` | Width growth/visual viewport/RTL-LTR bounds, immediate invalidation/debounce/unmount, safe labels/session-local history, controlled-query replacement; disabled items/arrows/Home/End/Escape/restoration/focus departure, nested priority/Tab/inert/scroll lock. |
| `components/catalog-crud.spec.js`, `scale-crud.spec.js`, `admin-forms.spec.js` | Opening versions/cancelled retirement/reactivation/list refresh, cancelled draft reset/rejected-save retention; user required/matching passwords/edit omission, template nested content/conflicts/dirty routing/inherited permissions, change-password session expiry. [Corrections](interactions.md). |
| Base browser matrix | Guest redirect/password visibility/rejected login, patient unknown demographics/reload/overflow, receptionist controls, real CSRF/idempotency/stale writes, signed visits/confirmation, user/template saves, 14 operational routes/dark mode. |
| `e2e/patient-workflows.spec.js` | Real record correction/retirement/history/stale drafts, upload/download/metadata/archive, duplicates/diagnosis import/team/optional merge; ordinary clickability/mobile header/tab/page bounds. |
| `e2e/clinical-workflows.spec.js`, `zz-full-recovery.spec.js` | Real availability booking/reschedule; visit sign/reasoned amend/re-sign; PNG signature prescription/referral/patient/visit PDF; decimal SYP invoice issue/pay/export/reload; patient/medication imports; full ZIP digest/preview/exact consent/safety backup/relogin/exact signed/payment/media recovery. [PDF detail](../../../backend/docs/testing/pdf.md). |
| `e2e/task-workflows.spec.js` | Actual task create/start/complete/reopen/cancel, reason dismissal/confirmation, persisted versions/reasons, confirmed delete/row removal, overflow and permission denial without mutation. |
| `e2e/frontend-interactions.spec.js`, `admin-interactions.spec.js` | Chart pixels/actual hover and legend/theme/date filtering/reset/cleanup; bounded search/empty panel/header geometry/keyboard/badges/route closure; modal/drawer focus; diagnosis/medication lifecycle/reload, scales/slider validation; user create/edit/disable, nested template dirty cancellation/lifecycle and patient edit/unchanged identifiers/unknowns. |

## Regression ownership

| Production sources | Evidenced correction |
| --- | --- |
| Shared API/search/notifications/auth/form utilities | Multipart JSON encoding, stale cleared searches, repeated-read count decrement, anonymous-looking session detection, lost field paths/server errors, dirty successful navigation, flatpickr locale, computed statistics objects, nested patient links and Set/array table mismatch corrected. |
| Task forms/list, `TimeSlotPicker.vue` | Reuse existing store `create`; absent due date becomes `null`; `refreshKey` updates rows/current filters; clearing scheduling context cancels request/options/selection. |
| Search/floating/dropdown/notification/catalog/user/date controls | Source-specific corrections: [interaction record](interactions.md); N1–N5/N8 fixed, N6/N7 open in [navigation](../ui/navigation.md). |
| Clinical controls/PDF/recovery | Version/session/preview contracts retained; BaseButton href/native click, FormInput step, visit unknowns/clean save, PNG signature, currency/font/precision/pagination corrections: [PDF record](../../../backend/docs/testing/pdf.md). |

Historical imported-JS baseline coverage: 84.98% lines / 83.99% branches / 69.76% functions; not recalculated for later additions or whole Vue application. No arbitrary threshold/100% claim. Current matrix is selected Chromium Arabic RTL, not exhaustive CRUD, visual/accessibility certification, other engines/browser LTR, PostgreSQL concurrency or production-bundle verification.
