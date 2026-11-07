# Completed and verified

Latest evidence through **2026-11-07**. Frontend review F01–F43, applicable latent fixes, UI consolidation and model/type integration were source-complete within their recorded scope. [Structure-review changes](structureReview.md) are source-complete within the recorded consumer/verification limits. Durable behavior: [UI](ui.md); pending work: [current](workCurrent.md).

| Check | Latest result |
| --- | --- |
| Structure implementation | S01–S15 rechecked and applied with targeted extractions/moves; current [ledger](structureReviewFiles.md) covers **427/427 files**. Removed **49 files**; six candidates retained for direct test consumers. Source/static checks and isolated synthetic production probes only; affected tests updated with permission, not run. Generated declarations untouched pending regeneration; browser/build certification remains absent. |
| Structure checks | **101 production files** linted: zero errors, 46 nonfatal prop/accessibility warnings. **1,430** local source/style/test references resolve; **97 CSS files** parse. The 184 default declarations/dark overrides, 19 moved rule groups and two scoped-style moves match their recorded originals. Eight affected test modules parse; no suites ran. Tables (274 lines/5,780 bytes) and palette tokens (252 lines/10,832 bytes) were reviewed as coherent existing owners. |
| Isolated probes | Synthetic production checks passed for fresh/edit/duplicate visit mapping, nullable/zero/signing/version/follow-up fields, date semantics, cursor/catalog validation, statuses, account column keys, latest-read/session/unmount disposal, preview URL ownership and route filter aliases/defaults/navigation. Transport substituted; no clinic data/API access. |
| Historical Node | **152 passed**. |
| Historical mounted Vue | **234 passed**, 28 files; jsdom has no layout. |
| Historical Chromium | **129 distinct cases** have passing evidence across stopped/full/focused runs, **not one clean full-suite run**. Viewports 1280×800, 768×1024, 390×844; synthetic isolated real API/storage. |
| Historical browser scope | Auth/roles, patient/team/register/files/merge, appointments, signing/amendments, exact document downloads, billing/import/recovery; selected themes/RTL-LTR/focus/reduced-motion/privacy; primary-ID/signed-identity and pinned follow-up revision contracts. |

No exhaustive visual/accessibility/cross-engine/native Windows or physical-print certification; no production build/type-check certification. Schema/deployment tasks were removed, not completed. Read retries cover connection resets only; mutation/status failures are not retried. Logs/traces/PDFs/runtime/browser/evidence audit persist under ignored `tests/tools/`.

[Backend evidence](../../backend/docs/doneCurrent.md) owns API/PostgreSQL/process-kill/PDF and launcher checks. Shared `start.sh`/`start.cmd` use backend `.env` and start both servers; that earlier launcher check did not change frontend source or repeat frontend suites. Native Windows launch remains unverified.
