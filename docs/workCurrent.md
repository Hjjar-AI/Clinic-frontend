# Remaining frontend work

| Work | Remaining action |
| --- | --- |
| Browser tests — paused by user | Review/rerun five failures: desktop operational-page loading and textarea readiness (wait corrections already made), tablet medication import, mobile contact history and mobile task lifecycle. Complete interrupted mobile full recovery. Full run: 105 passed/five failed/one interrupted; Node 151 and mounted Vue 207 passed. [Commands](verification.md), [evidence](doneCurrent.md). |
| PDF verification | Repeat `tests/pdf_appearance.py` from backend against retained `/tmp/clinic-browser-pdfs` for all three viewports; no further inspection was run after the stop request. |
| Rendered UI | Broader width/zoom/native-popup/overflow/long-text combinations, other engines and accessibility review. Chromium selected viewports now exercise eight theme solid contrast/light-dark, reduced motion, navigation/tabs and RTL/LTR arrows; this does not certify every layout. |
| Backend coordination | Applying the existing clinic schema still requires explicit schema/migration authorization. Pinned runtime, isolated API/PDF and disposable PostgreSQL suites are exercised. [Backend current](../../backend/docs/workCurrent.md). |
| Deployment | MySQL/MariaDB/Redis/Memcached, arbitrary worker failure, production bundles and physical printing remain unverified. Builds/schema/version changes require their explicit scope. |

Source review implementation is complete; [dispositions](review.md). Test suites are now explicitly authorized; no production build, migration inspection or version change was performed. [Working limits](../AGENTS.md).

Paused on the user’s 2026-10-12 stop request. Test runner exited 130 and its temporary servers stopped. Resume with trace review and focused browser reruns before deciding whether another complete run is necessary; do not infer that timing failures establish product defects.
