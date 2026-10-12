# Remaining frontend work

| Work | Remaining action |
| --- | --- |
| Runtime verification | Under explicit test authorization, repeat component/browser coverage after the 2026-10-12 source corrections: account changes/drafts/retries, clinical catalogs/scales/signatures, forms, calendar paging, preview consent and keyboard contracts. [Coverage and rendered matrix](verification.md), [source evidence](doneCurrent.md). |
| Rendered UI | Check contrast across eight themes/light-dark, reduced motion, narrow layouts, RTL/LTR, engines, zoom/native popups, focus/tabs/rows, long clinical text and print. Source color arithmetic does not certify rendering. |
| Backend coordination | After authorized schema application, verify per-currency totals, scale limits, unknown age, clinical permissions and import notices with the paired API. [Backend current](../../backend/docs/workCurrent.md). |
| Deployment | Pinned backend runtime, external DB/cache concurrency and production bundles remain unverified; builds/schema/version changes require their explicit scope. |

Source review implementation is complete; [dispositions](review.md). No build, suite, migration or version work was performed in this fix pass. [Working limits](../AGENTS.md).
