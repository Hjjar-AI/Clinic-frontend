# Verification evidence

Updated **2026-11-18**. [Remaining work](workCurrent.md) · [UI ownership](ui.md) · [Procedures](verification.md). Source completion, builds and browser evidence have distinct scopes.

## Workflow maintenance (2026-11-18)

Implemented the approved workflow-only plan in both repositories: Linux static validation, verified full-SHA external action/reusable-workflow references, weekly GitHub-Actions-only grouped Dependabot PRs, pnpm-store/pip-download caches, immediate checkout SHA records and success/failure summaries. Automatic cancellation is scoped by workflow/event/branch or PR; scheduled/manual checks use unique run groups, and release serialization/manual browser behavior remains intact. Existing action major selections, application runtimes, commands, matrices, artifact contracts, reusable inputs and release permissions were preserved. The backend compatibility definition is pinned to the published frontend commit resolved during verification; application source inputs remain independent.

Linux Python **3.14.4**, PyYAML **6.0.3**, checksum-verified actionlint **1.7.7**: all **12 workflows**, the backend composite action and both new helper sources passed static validation. **34 embedded Python blocks** parsed without execution; **seven Bash blocks** passed `bash -n`. Read-only baseline comparisons checked original commands/triggers/matrices/permissions/artifact/reusable interfaces, cache paths/setup order, `always()` summary exception paths and concurrency separation. Isolated temporary validator probes accepted inert Python without executing it and rejected mutable references, duplicate keys, malformed Python and composite run steps without shell. Upstream GitHub API tag resolution verified seven action commit pins and the published frontend reusable workflow commit; the downloaded actionlint archive matched the embedded official checksum. Diff and documentation reference checks passed. Temporary verification material is under `/tmp/clinic-workflow-hardening/` and `/tmp/clinic-verify-workflow-changes.py`.

No application suite inspection/execution/changes, app builds/compilation/packaging, browser run, workflow dispatch, pushes, releases/tags, repository-setting changes, migrations, application dependency/lockfile changes or clinic-storage access. Only CI-tool/action references were added or pinned. Hosted cache behavior, Windows jobs, Dependabot PR creation, summary rendering, scheduled runs and coordinated pinned workflow execution remain unverified; automation documentation owns operation and limits.

## Logic review corrections (2026-11-18)

Implemented the approved source-only fix plan across both repositories. Visit medication rows now expose custom name, dosage, optional brand and explicit instructions without requiring complete drafts; command mapping retains saved medication values and sends only supported lab fields. Lookup search checks both languages and medication brands. Optional selects can return to unknown; inherited grants display as checked while saves contain only direct grants. Date-range synchronization preserves partial manual input, and the audit viewer uses one correctly keyed date range.

Root navigation redirects through the dashboard guards. The authenticated App owner loads clinical metadata; guest startup no longer requests it. Mutation keys use 128 random bits from `getRandomValues`, retaining existing retry reuse; modal labels use Vue IDs. Dashboard risk badges consume the backend's approved-risk projection. Backend corrections and coordinated delivery are recorded in its [evidence](../../backend/docs/doneCurrent.md#logic-review-corrections-2026-11-18).

Linux Node **24.21.0** source checks passed: **12 changed JS/Vue sources** parsed, Vue templates parsed without code generation, and **54 local imports** resolved. Isolated synthetic probes passed lab allowlisting/no form mutation, saved medication roundtrip, 1,000 unique valid mutation keys with no `randomUUID` capability, bilingual/code/brand searches, partial/valid/cleared date synchronization, direct/inherited permission handling, approved risk selection and root route configuration. Guest metadata ownership, medication bindings, optional-select and audit-range configuration were checked in source. Probe: `/tmp/clinic-logic-fix-probe.mjs`. The first probe attempts needed dependency resolution through Vue, removal of a sandbox-denied child process and decoding spaces in reference paths; the corrected probe passed. Both repositories passed diff whitespace and changed-document reference checks.

No suite inspection/execution/changes, builds/compilation/packaging, browser work, migrations, dependencies/lockfiles, or clinic-storage operations. Probes are not a mounted application or browser/database check; medication interaction, Arabic layout, actual HTTP/upload handling and date-picker behavior remain unverified. The browser stop remains in force. No CSS/generated assets changed.

## Review fixes and missing workflows (2026-11-18)

Implemented the coordinated backend contract handoff: reference-based file receipts, explicit opening versions, session activity/expiry, operation-specific waits/errors, common collection metadata, visibility/backoff-aware polling, backend workflow/clinical metadata and centralized feature services. Added visit attachments, approved revisions and issued-document downloads; archived-patient restoration and explicit identity restriction; approved risk history/timeline/next appointment; admin audit viewer, read-notification clearing, searchable invoice patients and server-provided version display. Receptionist drafts and clinician-only signing remain unchanged. New UI uses existing Arabic/shared components and source-owned styles.

Source-only verification on Linux Node **24.21.0**: **327 JS/Vue files**, **1,129 local imports/style links** and **two changed CSS modules** parsed/resolved. Read-only ESLint reported **zero errors**; style warnings remain. Backend records Python/contract checks. An empty-file-list formatting mistake temporarily formatted additional source/config/suite files; test/config changes were restored byte-for-byte without content review, and formatting-only unrelated source changes were reversed. Final suite/config diff is empty.

No tests, builds, compilation, packaging, browser run, migration changes or clinic-storage operations. Source completion does not verify interaction, layout, Arabic/PDF rendering, session timing, concurrency, memory or hosting. The earlier browser stop remains in force; backend/frontend API changes require coordinated delivery. Temporary source reports are under `/tmp/clinic-review-*`.

## GitHub workflows (2026-11-17)

Added automatic Windows/Linux unit/component/build jobs and 14-day frontend artifacts, plus manual Chromium desktop/tablet/mobile checks against an exact backend SHA. Backend owns the manual Windows/Linux executable recipe and its regression gates. Both repositories are public; custom checkout secrets/variables are unnecessary. [Automation](automation.md) owns usage and coordination.

Follow-up: added Monday regression/audit schedules, a manual compatibility entry point and reusable browser workflow with explicit frontend/backend SHAs. The backend now downloads/verifies archives and supports manual draft releases. Actionlint, YAML/inline-Python/helper syntax and document reference checks passed; prior successful suites/builds were not repeated for these workflow-only changes. Local `pnpm audit --json` completed with a failing findings status: metadata reported 4 low, 11 moderate, 13 high and 1 critical finding, including DOMPurify `GHSA-cg2g-xh64-v4q7`. No versions/lockfiles changed. Report: `/tmp/clinic-workflows-frontend-dependency-audit.json`; hosted audits and reusable compatibility execution remain unverified.

Linux Node **24.21.0**, pnpm **12.10.1**, Vite **8.2.2**, Vitest **5.0.3**: **148/148** Node tests passed; production build passed with **1,435 modules**. Normal Vitest invocations stalled; the documented direct-Node/runner-loader/isolated-cache fallback completed **234 passing cases across 29 files**, across a bounded partial run and a successful remaining-file run. The interrupted file was rerun completely; these are combined results, not one clean full-suite run. CI uses that fallback. Existing Vue/router warnings were emitted; no dependency/lockfile or package-script changes.

Actionlint **1.7.7**, YAML/Python source validation, new documentation references and diffs passed. No local browser run, migration inspection/changes or clinic storage operations. GitHub-hosted/Windows execution and downloaded archives remain unverified; the backend [log](../../backend/docs/doneCurrent.md#github-workflows-and-linux-bundle-2026-11-17) records successful Linux frozen-runtime/PDF/HTTP checks. The previous browser stop remains in force. Temporary evidence: `/tmp/clinic-workflows-*`.

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
