# Completed and verified

Latest evidence through **2026-11-07**. Frontend review F01–F43, applicable latent fixes, UI consolidation and model/type integration were source-complete within their recorded scope. [Structure-review changes](structureReview.md) are source-complete within the recorded consumer/verification limits. Durable behavior: [UI](ui.md); pending work: [current](workCurrent.md).

| Check | Latest result |
| --- | --- |
| Structure implementation | S01–S15 rechecked and applied with targeted extractions/moves; current [ledger](structureReviewFiles.md) covers **427/427 files**. Removed **49 files**; six candidates retained for direct test consumers. Source/static checks and isolated synthetic production probes only; affected tests updated with permission, not run. Generated declarations untouched pending regeneration; browser/build certification remains absent. |
| Node | **152 passed**. |
| Mounted Vue | **234 passed**, 28 files; jsdom has no layout. |
| Chromium | **129 distinct cases** have passing evidence across stopped/full/focused runs, **not one clean full-suite run**. Viewports 1280×800, 768×1024, 390×844; synthetic isolated real API/storage. |
| Browser scope | Auth/roles, patient/team/register/files/merge, appointments, signing/amendments, exact document downloads, billing/import/recovery; selected themes/RTL-LTR/focus/reduced-motion/privacy; primary-ID/signed-identity and pinned follow-up revision contracts. |

No exhaustive visual/accessibility/cross-engine/native Windows or physical-print certification; no production build/type-check certification. Schema/deployment tasks were removed, not completed. Read retries cover connection resets only; mutation/status failures are not retried. Logs/traces/PDFs/runtime/browser/evidence audit persist under ignored `tests/tools/`.

[Backend evidence](../../backend/docs/doneCurrent.md) owns API/PostgreSQL/process-kill/PDF and launcher checks. Shared `start.sh`/`start.cmd` use backend `.env` and start both servers; no frontend application source changed or frontend suites repeated. Native Windows launch remains unverified.
