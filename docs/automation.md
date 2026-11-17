# GitHub automation

[Setup](setup.md) · [Verification](verification.md) · [Backend automation](../../backend/docs/automation.md) · [Executable bundles](../../backend/docs/bundles.md).

`.github/workflows/checks.yml` runs unit/component tests and a Vite production build on pushes, pull requests and manual dispatch. Windows 2022/Linux Ubuntu 24.04 x64 use Node 24.21.0 and pnpm 12.10.1, installing with `--frozen-lockfile`. Successful builds are downloadable artifacts retained for 14 days. No auto-fixing lint, lockfile edits or publishing occurs.

`.github/workflows/browser.yml` is manual: choose **Actions → Browser checks (manual) → Run workflow** and supply the exact backend commit SHA. It checks out both repositories as siblings, installs backend/native dependencies and Playwright Chromium, and runs the existing desktop/tablet/mobile cases with disposable synthetic backend storage. Failed-run traces/screenshots are retained for seven days. This does not resume local browser work automatically or certify all visual/native printing behavior.

If the backend repository is private, configure the frontend repository Actions secret `CLINIC_REPOSITORY_TOKEN` with read-only Contents access to it. See the [backend access instructions](../../backend/docs/automation.md#repository-access). The selected backend revision must include its `.github/actions/native-dependencies` composite action. Both repositories' workflow changes must be pushed before using coordinated checks.

The backend's manual release workflow builds this frontend together with a backend executable for Windows/Linux. Supply the frontend commit SHA there; frontend build artifacts alone are web assets, not executables. Nothing publishes a GitHub Release or deploys clinic software automatically.
