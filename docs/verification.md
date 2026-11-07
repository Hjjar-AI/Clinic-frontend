# Verification

[Results/limits](doneCurrent.md) · [Remaining](workCurrent.md) · [Backend/PDF](../../backend/docs/verification.md). Explicit test authorization required; builds separate.

```bash
pnpm test                 # Node + mounted Vue
pnpm test:coverage
pnpm test:e2e
pnpm test:all
CLINIC_PDF_ARTIFACT_DIR=/tmp/clinic-browser-pdfs pnpm test:e2e
```

Playwright needs installed Chromium/backend Python dependencies; `CLINIC_TEST_PYTHON` overrides `python3`. Owned ports **5174/5018**, temporary SQLite/media/synthetic fixtures; refuses existing servers. Real API responses; fixture rates are not production capacity. Node isolation must remain `--test-isolation=none`; Vitest uses separate temp cache (`CLINIC_VITEST_CACHE`), HTTP/Chart doubles and jsdom, which has no layout.

Ignored `tests/tools/` retains helpers/logs/browser/artifacts. Local interpreter `../backend/tests/tools/runtime/python/bin/python3.12`; set absolute `CLINIC_TEST_PYTHON` and `PLAYWRIGHT_BROWSERS_PATH` (frontend `tests/tools/browsers`). Standalone probe: `node --experimental-vm-modules tests/tools/standalone_frontend_probe.mjs`; supplements real suites. Read-only `apiGet` retries only ECONNRESET (max two), never HTTP status failures/writes; await enabled forms before assertions.

Read-only dependency-directory fallback:

```bash
node --import ./tests/setup.js --test --test-isolation=none tests/*.test.js
XDG_DATA_HOME=/tmp/clinic-test-tools node node_modules/vitest/vitest.mjs run --configLoader runner --cache=false --fsModuleCachePath /tmp/clinic-test-module-cache
```

## Rendered matrix

Use 320/360/375/390px, 768/769px boundaries through 1920px; RTL/LTR, drawer states, eight themes/light-dark, mixed long text/IDs/phones, badge boundaries and 200% zoom. Inspect both physical edges/local scrollers, loading/error/retry, async search growth, history navigation, nested focus/consent/session layers, native popups/keyboards/safe areas, short landscape, reduced motion and print. Matrix coverage is selective, not whole-app certification; counts/results live only in [completed](doneCurrent.md).
