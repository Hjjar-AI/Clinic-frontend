# GitHub automation

[Setup](setup.md) · [Verification](verification.md) · [Backend automation](../../backend/docs/automation.md) · [Executable bundles](../../backend/docs/bundles.md).

`.github/workflows/checks.yml` runs unit/component tests and a Vite production build on pushes, pull requests, manual dispatch and Mondays at 03:17 UTC. Windows 2022/Linux Ubuntu 24.04 x64 use Node 24.21.0 and pnpm 12.10.1, installing with `--frozen-lockfile`. Successful builds are downloadable artifacts retained for 14 days. No auto-fixing lint, lockfile edits or publishing occurs.

Component checks use the documented direct-Node Vitest fallback with `--configLoader runner`, caching disabled and isolated runner-temporary cache paths. This avoids relying on a shared local Vite module cache; package scripts remain unchanged.

`.github/workflows/browser.yml` is manual: choose **Actions → Browser checks (manual) → Run workflow** and supply the exact backend commit SHA. It checks out both repositories as siblings, installs backend/native dependencies and Playwright Chromium, and runs the existing desktop/tablet/mobile cases with disposable synthetic backend storage. Failed-run traces/screenshots are retained for seven days. This does not resume local browser work automatically or certify all visual/native printing behavior.

Both repositories are public; no custom checkout secret is needed. The selected backend revision must include its `.github/actions/native-dependencies` composite action. Both repositories' workflow changes must be pushed before using coordinated checks.

`.github/workflows/compatibility.yml` is a manual entry point for testing the selected frontend revision against an exact backend SHA. It reuses the browser workflow, including synthetic API-backed interactions and recorded source revisions. The backend has the corresponding entry point for an exact frontend SHA; push the reusable frontend workflow to `main` before using that backend entry point. Compatibility/browser checks are not scheduled automatically and do not resume local browser work.

`.github/workflows/dependency-audit.yml` runs `pnpm audit --json` on package/lockfile/audit-workflow changes, manual dispatch and Mondays at 03:47 UTC. Reports include production and development dependencies, are retained for 14 days even when findings fail the job, and never apply fixes. Advisory-service/resolution failures also fail the job and must not be treated as a clean scan.

The backend's manual release workflow builds this frontend together with a backend executable for Windows/Linux, downloads/extracts the resulting archives on matching OS runners and checks their retained source revisions and runtime. Supply the frontend commit SHA there; frontend build artifacts alone are web assets, not executables. A separate manual workflow can prepare a draft GitHub Release from reverified archives and an existing matching tag; publishing and deployment remain manual.
