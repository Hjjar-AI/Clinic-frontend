# Remaining work

[Evidence and limits](doneCurrent.md) · [Structure decisions](structureReview.md) · [Backend work](../../backend/docs/workCurrent.md).

1. Review-fix source changes are complete. When separately authorized, verify coordinated session expiry/activity, replayed file references/recovery, collection paging and new screens; source-only evidence is in [the log](doneCurrent.md#review-fixes-and-missing-workflows-2026-11-18). The [remaining logic corrections](doneCurrent.md#logic-review-corrections-2026-11-18) also need runtime checks for medication entry/signing, partial date typing, public/root navigation, HTTP LAN writes/modals, demographic clearing, permission display and approved risk badges. Tests/builds were expressly excluded; browser work remains stopped.

2. Browser verification was stopped at the user's request on **2026-11-07**; resume only when requested. Rerun corrected chart-readiness/scale-picker cases, complete the interrupted tablet workflow and remaining mobile/tablet cases, then run focused width/direction/theme checks. Prior counts belong in evidence; no S01–S15 implementation/removal candidate remains open.
3. Broaden widths/zoom/overflow/long text, accessibility and browser engines: [rendered matrix](verification.md#rendered-matrix), including moved CSS/default palette in RTL/LTR and light/dark modes.
4. Calibrate actual prescription printer/stock at 100%; check native PDF viewers/dialogs.
5. Verify native Windows downloads/printing if targeted.
6. Run the new [GitHub workflows](automation.md) after both repositories are pushed; verify Windows jobs, static validation, download caches, summaries, Dependabot action updates and the backend-owned downloadable bundles. The [maintenance evidence](doneCurrent.md#workflow-maintenance-2026-11-18) is source-only. Manual browser workflow dispatch remains opt-in.
7. Review dependency audit findings, including critical DOMPurify `GHSA-cg2g-xh64-v4q7`; dependency/version changes need separate authorization.

The local build/task issue is resolved. Backend owns currency policy, conditional model extensions and fresh local setup; broader storage upgrades/deployment validation remain outside scope.
