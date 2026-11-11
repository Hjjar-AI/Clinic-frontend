# Verification evidence

Updated **2026-11-11**. [Remaining work](workCurrent.md) · [UI ownership](ui.md) · [Procedures](verification.md). Source completion, builds and browser evidence have distinct scopes.

## Build and editor tasks (2026-11-11)

Linux Node **24.21.0**, pnpm **12.10.1**, Vite **8.2.2**: production build passed, **1,435 modules**, output in ignored `dist/`. No dependency/lockfile changes or manual generated-file edits.

Automatic npm tasks had used non-interactive Bash without nvm. The default **Clinic: build frontend** process task now directly invokes interactive Bash. Folder automation settings cover single-folder windows; the active Desktop `Clinic.code-workspace` received the equivalent workspace setting for multi-root tasks, preserving unrelated values. [Setup](setup.md#vs-code-build-tasks) owns the portable configuration.

Both configured Linux command paths built successfully with `COREPACK_ENABLE_NETWORK=0`; task/settings JSON and diff checks passed. Commands were executed directly, not through the VS Code UI. Windows uses cmd and remains unverified. Logs: `/tmp/clinic-vscode-build.log`, `/tmp/clinic-auto-task-build.log`; temporary files may disappear. No suites or clinic storage changes accompanied these checks.

## Structure and browser work (2026-11-07)

Reviews F01–F43 and S01–S15 were source-complete within their recorded scope. The [review](structureReview.md) owns source/impact/corrections; the compact [path inventory](structureReviewFiles.md) retains moved/deleted owners. Counts below are historical snapshots, not a live inventory.

| Check | Result and scope |
| --- | --- |
| Implementation | **416/416 files** reviewed after cleanup, **60 removed**; six initially retained candidates and test-only legacy owners subsequently retired. Original review: 457 files; retained inventory: 180 Vue, 136 JS, 94 CSS, two generated declarations, three fonts, one JPEG. |
| Source/style checks | **102 production files** linted, zero errors/warnings; **1,419** local references resolved; **94 CSS files** parsed. 184 palette declarations/dark overrides, 19 moved rule groups and two scoped-style moves retained their recorded cascade. |
| Node | **148/148 passed**; four obsolete helper tests intentionally retired. |
| Mounted Vue | **234/234 passed**, 29 files; catalog cursor/error/retry, latest-read/session/disposal, visit mapping, columns/forms covered. jsdom has no layout. |
| Production build | Passed to `/tmp/clinic-structure-build`; generator refreshed component declarations. A malformed calendar event expression was corrected. No dependency/lockfile changes. |
| Browser follow-up | Stopped by user: **27 passed, 2 failed, 1 interrupted, 36 not run**. Chart-readiness timing and scale-picker locator corrected afterward. Focused rerun: **1 interrupted, 3 not run**, no passing cases; corrected full cases remain unverified. |
| Browser diagnostic | Report API responded; 10 canvases/no page errors. Does not prove chart painting or interaction. |
| Historical Chromium | **129 distinct passing cases**, not one clean full-suite run; 1280×800, 768×1024, 390×844, synthetic real API/storage. Auth/roles, patient/register/team/merge, appointments, signing/exact files, billing/import/recovery and selected theme/focus/privacy/version contracts covered. |

Browser fixtures used disposable SQLite/media and separately authorized temporary schema creation, without clinic configuration/storage. Readiness used `/api/v1/system/config/`; read retries covered connection resets only, never status failures or writes. Temporary structure logs: `/tmp/clinic-structure-{unit-final,components-final,build-final,browser-r2,browser-focused}.log`; traces under `.test-artifacts/`. Retained helpers live in ignored `tests/tools/`.

No exhaustive visual/accessibility/cross-engine checks, native Windows, physical printing or separate type-check certification. Earlier schema/deployment exclusions did not certify those operations. [Backend evidence](../../backend/docs/doneCurrent.md) owns runtime upgrades, fresh local database/login, API/PostgreSQL/PDF/process checks; browser follow-up remains stopped.

## Documentation review (2026-11-11)

[Setup](setup.md) now owns runtime/editor instructions; agent/UI guides own implementation rules, the structure review owns historical decisions, and its path inventory retains all moves/deletions without per-file “Keep” repetition. Current work contains only unfinished scope and preserves the user's browser stop. All project Markdown/local heading references and diffs checked; no suites, builds, source/generated-asset edits or clinic storage changes during this cleanup. [Backend evidence](../../backend/docs/doneCurrent.md#documentation-review-2026-11-11) owns the shared review summary and operational correction.
