# Completed and verified

Latest evidence through **2026-11-07**. Frontend review F01–F43, applicable latent fixes, UI consolidation and model/type integration were source-complete within their recorded scope. New [structure-review findings](structureReview.md) remain unimplemented. Durable behavior: [UI](ui.md); pending work: [current](workCurrent.md).

| Check | Latest result |
| --- | --- |
| Structure review | **457/457 files** in `src`/`public` individually reviewed; [findings](structureReview.md), [ledger](structureReviewFiles.md). Static app reachability identified 32 Vue/13 JS removal candidates and two associated scoped CSS files; no unresolved local references in the resolver. Source findings S01–S03/S09 remain unimplemented in [current](workCurrent.md). No suite inspection/run, build, browser/server launch or clinic storage access; font metadata/JPEG review does not certify rendering/printing. |
| Node | **152 passed**. |
| Mounted Vue | **234 passed**, 28 files; jsdom has no layout. |
| Chromium | **129 distinct cases** have passing evidence across stopped/full/focused runs, **not one clean full-suite run**. Viewports 1280×800, 768×1024, 390×844; synthetic isolated real API/storage. |
| Browser scope | Auth/roles, patient/team/register/files/merge, appointments, signing/amendments, exact document downloads, billing/import/recovery; selected themes/RTL-LTR/focus/reduced-motion/privacy; primary-ID/signed-identity and pinned follow-up revision contracts. |

No exhaustive visual/accessibility/cross-engine/native Windows or physical-print certification; no production build/type-check certification. Schema/deployment tasks were removed, not completed. Read retries cover connection resets only; mutation/status failures are not retried. Logs/traces/PDFs/runtime/browser/evidence audit persist under ignored `tests/tools/`.

[Backend evidence](../../backend/docs/doneCurrent.md) owns API/PostgreSQL/process-kill/PDF and launcher checks. Shared `start.sh`/`start.cmd` use backend `.env` and start both servers; no frontend application source changed or frontend suites repeated. Native Windows launch remains unverified.
