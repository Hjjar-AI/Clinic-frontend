# Remaining work

1. Runtime verification of the [implemented structure review](structureReview.md): scale loading/error/retry and saved answers; fresh visit isolation across create/edit/duplicate/session transitions; rendered form breadcrumbs; one column chooser/table/export agreement and account preference isolation; clinical custom/historical entries and disclosure navigation; catalog editor/import preview/consent flows; preview disposal and route-filter history. Affected tests were updated with permission but not run. Generated component declarations await an authorized regeneration workflow; no manual generated-file edits.
2. Broader width/zoom/overflow/long-text, accessibility and browser-engine checks: [matrix](verification.md#rendered-matrix), including moved CSS/default palette in RTL/LTR and light/dark modes.
3. Actual prescription printer/stock calibration at 100%; native PDF viewers/dialogs.
4. Native Windows downloads/printing if targeted.

Currency policy and conditional model extensions: [backend current](../../backend/docs/workCurrent.md). Schema preparation/deployment validation were removed by request, not certified. Completed source fixes and exercised cases: [evidence](doneCurrent.md).
