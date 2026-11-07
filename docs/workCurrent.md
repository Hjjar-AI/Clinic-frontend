# Remaining work

1. Review follow-ups, not implemented: [structure review](structureReview.md), [457-file ledger](structureReviewFiles.md). Correct scale-picker/store interface (S01), duplicate patient column/export ownership (S02), unrendered form breadcrumb slot (S03) and shared mutable visit defaults (S09). Optional staged refactors/removal candidates are detailed there; the review itself did not authorize implementation or test-suite work.
2. Broader width/zoom/overflow/long-text, accessibility and browser-engine checks: [matrix](verification.md#rendered-matrix).
3. Actual prescription printer/stock calibration at 100%; native PDF viewers/dialogs.
4. Native Windows downloads/printing if targeted.

Currency policy and conditional model extensions: [backend current](../../backend/docs/workCurrent.md). Schema preparation/deployment validation were removed by request, not certified. Completed source fixes and exercised cases: [evidence](doneCurrent.md).
