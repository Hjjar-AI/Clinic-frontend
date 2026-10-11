# Completed work

Updated: 2026-10-11.

- Requested PDF/full-workflow expansion (2026-10-11): **174 backend / 110 Node / 77 Vue / 60 Chromium / 6 PDF appearance checks passed**. All requested UI workflows run against the real isolated API in three viewports; full ZIP recovery preserves signed revisions, issued-document checksums, paid timestamps and media, and revokes the old session. Reviewed actual downloads and long synthetic documents for Arabic typography, embedded fonts, A4 bounds and page breaks. Fixed evidenced visit unknown-risk/save navigation, router-link/native-click, decimal input/currency, PNG signature, restore precision and PDF font/direction/pagination defects. No production build, clinic-data, migration or dependency-version changes. [Verification and remaining limits](../../backend/docs/pdf-workflow-verification.md).

- Test expansion (2026-10-11): added **41 rendered component tests** for patient records/team/documents/duplicate merge, diagnosis/medication preview-bound imports, recovery scope/consent, billing and appointment forms. Full **110 Node tests + 74 Vue DOM/import checks passed**, including all 36 feature views. Seven additional browser scenarios passed in all three viewports: **42 Chromium cases passed** (21 added). Corrected two CSS declarations that caused mobile sticky-header interception and overlapping tab labels; regression tests use ordinary clicks and assert actual overflow/header geometry. Backend full suite: **173 tests passed**, including 34 new patient HTTP cases and three renderer regressions plus two throttle HTTP checks. Frontend source changes are limited to those two CSS declarations; versions and lockfiles are preserved; test caches/tooling remain in `/tmp`, no production build or clinic-data changes. [Coverage and commands](testing.md).

- Automated test suite (2026-10-11): **110 Node tests**, **33 Vue DOM/import checks** (all 36 feature views resolve), and **21 Chromium browser cases** across desktop/tablet/mobile passed. Actual session/API tests cover patient creation/reload/unknowns, signing, permissions, stale writes/replay, user/template saves, 14 operational pages and dark-mode switching. Fixed evidenced multipart/search/unread-count/auth/form/dirty-save/locale/statistics/visit-link/selection regressions. Existing application/dependency versions and direct resolutions preserved; added test tooling/lock entries explicitly authorized. No production build. [Commands, matrix and limits](testing.md). Historical shell findings and untested interactions remain separately tracked.

- Shell/navigation interaction review: 8 additional findings (floating width growth, search races/empty-state geometry, notification state/polling/closure, section highlighting, background loading, persistent patient-name history), three responsive risks and fluidity recommendations. 16 isolated assertions/9 script parses; no application changes or browser rendering. [Review](shell-navigation-review.md).

- Patient expansion: Arabic profile preferences/year-only birth, optional current team assignment, nonblocking duplicate warnings, structured records with opening patient versions/history, separate documents/corrections/duplicates/team tabs, optional admin merge preview/confirmation, tri-state clinical facts, care-basis separation, action dashboard and configurable completeness. 23 scripts parsed; 196 isolated source/import/schema assertions passed; browser checks pending. [Schema/API](../../backend/docs/patient-record-schema.md), [verification](../../backend/docs/patient-record-verification.md).

- Shell/layout implementation: fixed all 11 findings and three responsive risks; shared overlay ownership, viewport/banner/guest/print layout, retry, shortcuts, RTL controls and responsive forms. Consolidated duplicate clinical geometry. 23 scripts parsed, 18 template structures checked, 129 isolated assertions and 10 existing API version assertions passed; browser verification pending. See [implementation](shell-layout-fixes.md).

- Original deep shell/layout/container review: 11 source findings, three rendering risks and ownership recommendations; 15 source/handler assertions passed, including drawer/modal focus conflict reproduction. Review-stage application sources unchanged; implementation now complete above; browser checks pending. See [review](shell-layout-review.md).

- Backend second-pass integration: explicit care-team patient versions/refresh, corrected member name/role/removal fields, isolated nested document versions and id-less parent response versions. Five changed scripts parsed; 10 version-registry assertions passed. Browser flows remain unchecked; [backend record](../../backend/docs/backend-second-pass.md).

- Enhanced/compacted both root agent guides: agreed limits, docs/handoff locations, review/fix workflow, verification boundaries, model/API and CSS/layout/RTL conventions.

- Moved both projects' handoffs to `docs/`; retained root `README.md`/`AGENTS.md`, updated local/cross-project links. Compacted other Markdown, preserving technical content/verification history.

- Reorganized CSS by purpose, ordered `app.css`, kebab-case names; split large layout/form/clinical/typography modules. Preserved scoping, early fonts/skeletons, shared rules/order, 20 scoped files. See [CSS organization](css-organization.md).

- Fixed 15 layout/RTL findings/latent calendar issues; externalized 20 scoped blocks/static inline styling. Details: [design-rtl-fixes.md](design-rtl-fixes.md).
- Passed JS syntax, CSS/reference/token audits, navigation/chart/floating probes; no app build/browser validation (local launch failed).
- Integrated resource versions/`If-Match`, opening versions, retained idempotency keys for uncertain-network retries.
- Updated referral POST, login CSRF bootstrap, import previews/restore scope.
- Improved shared API duplicate mutations, structured JSON download errors, stale-edit conflicts.
- Created both READMEs/compact handoffs; checked local links.
- Prior checks: changed JS/Vue scripts parsed; no frontend builds/compilation/packaging/browser interactions or dependency/version changes.

Details: [backend implementation record](../../backend/docs/backend-fixes-implementation.md). Unverified: [workCurrent.md](workCurrent.md).
