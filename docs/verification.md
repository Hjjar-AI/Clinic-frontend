# Verification

Run suites only under explicit test authorization; builds remain separate. Outcomes are in [completed](doneCurrent.md), gaps in [current](workCurrent.md). Use synthetic data and an interpreter with backend dependencies; `CLINIC_TEST_PYTHON` overrides default `python3`.

```bash
pnpm test                 # Node + mounted Vue
pnpm test:unit
pnpm test:components
pnpm test:coverage
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:all
CLINIC_PDF_ARTIFACT_DIR=/tmp/clinic-browser-pdfs pnpm test:e2e
```

If installed dependency directories are read-only:

```bash
node --import ./tests/setup.js --test --test-isolation=none tests/*.test.js
XDG_DATA_HOME=/tmp/clinic-test-tools node node_modules/vitest/vitest.mjs run --configLoader runner --cache=false --fsModuleCachePath /tmp/clinic-test-module-cache
```

Vitest uses a separate temporary optimizer cache (`CLINIC_VITEST_CACHE` can override it), avoiding interference with the browser server. Node hooks block unexpected network/reset Pinia/storage; `--test-isolation=none` avoids registration-only false success. Vitest mounts real controls with controlled HTTP/Chart.js doubles; jsdom has no layout. Playwright owns localhost **5174/5018**, temporary SQLite/media, sequential synthetic fixtures, ignored `.test-artifacts/`, and refuses existing servers. Browser API responses are real; fixture quotas do not change production rates. Focused files may be passed to the commands; use backend [verification](../../backend/docs/verification.md) for HTTP/PDF inspection.

## Coverage ownership

| Layer / files under `tests/` | Recorded coverage |
| --- | --- |
| Node services/state | Axios/envelopes/CSRF/pagination/versions/retry keys/cancellation, auth/router/explicit grants, session teardown/late reads, all six cursor catalogs/coalescing/invalidation, pagination races/disposal, dashboard failure/coalescing, feature DTOs/forms/selection/drafts/search/notifications and log privacy. |
| Vue workflows (`components/`) | Patient longitudinal kinds/reasons/history/team/documents/merge; import/recovery preview resets; billing/appointment/task forms, opening versions/dirty state/rejected drafts/refresh; notification ownership and stale availability. All 36 feature views import. Failed hydration/retry, opening versions, last-goal deletion and omitted signing metadata have regressions. |
| Vue interactions | Chart data/theme/disposal, paired date-calendar display/ISO/Escape, search/floating bounds/stale work, dropdown/overlay focus, catalog/scale/admin CRUD. Keyboard cards/rows/tabs, real query synchronization, native constraints, nullable scores, modal submit guards, disabled/confirmed links, multiple signature strokes, 450-booking paging, off-hour/overlap geometry, multi-argument calendar forwarding, late scales and selector races have durable cases. Care-team lookup failure/cancellation/retry/unmount is handled. |
| Browser (`e2e/`) | Guest/auth/roles, operational routes/themes, patient records/documents/team/duplicates/merge, actual appointment availability/reschedule, sign/amend/re-sign, PNG prescription/referral, fractional SYP billing, import and authenticated full recovery/relogin/exact bytes. |
| Browser interactions | Ten added scenarios × three viewports: actual chart pixels/hover/legend/filter, bounded search/keyboard/badges/panel/route closure, drawer/modal focus and catalog/scale/user/template/patient edits. Five further scenarios × three viewports exercise all eight theme solid controls/light-dark (672 color pairs), actual tab relationships/focus with RTL/LTR arrows, normal textarea keys, failed opening-record retry/no writes, scratchpad reload privacy and reduced motion. |

Selected Chromium Arabic RTL viewports: 1280×800, 768×1024, 390×844. Final full/focused runs must remain distinct. No general accessibility, visual or cross-engine certification.

## Remaining rendered matrix

Check 320/360/375/390px, 768/769px boundaries and wider desktops through 1920px; RTL/LTR, expanded/collapsed drawer, eight themes/light-dark, long mixed text/IDs/phones, 0→1→99→100 badges and 200% text/zoom. Inspect both physical edges, visual viewport and each local scroller. Exercise loading/empty/error/retry, search selection, async panel growth, Back/Forward, nested confirmations/session/privacy layers, native popups, virtual keyboard/safe areas, short landscape, print and reduced motion. These are unverified combinations, not asserted defects. Section identity and keyboard tab focus now have rendered Chromium checks. Other combinations remain open.
