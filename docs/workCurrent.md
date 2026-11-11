# Remaining work

Stopped at the user’s request on **2026-11-07**; active browser runners were terminated. Resume only on request.

1. Finish browser verification for the [implemented structure review](structureReview.md): rerun the corrected chart readiness and scale-picker locator cases, complete the interrupted tablet workflow and remaining tablet/mobile cases, then run the focused width/direction/theme checks. The broad run stopped with **27 passed, 2 failed, 1 interrupted, 36 not run**; the focused rerun stopped with **1 interrupted, 3 not run**. No implementation/removal candidate remains open from S01–S15. Passing checks and limits: [completed](doneCurrent.md).
2. Broader width/zoom/overflow/long-text, accessibility and browser-engine checks: [matrix](verification.md#rendered-matrix), including moved CSS/default palette in RTL/LTR and light/dark modes.
3. Actual prescription printer/stock calibration at 100%; native PDF viewers/dialogs.
4. Native Windows downloads/printing if targeted.

Currency policy and conditional model extensions: [backend current](../../backend/docs/workCurrent.md). Schema preparation/deployment validation were removed by request, not certified. Completed source fixes and exercised cases: [evidence](doneCurrent.md).
