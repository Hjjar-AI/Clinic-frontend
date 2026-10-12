# Remaining frontend work

| Work | Remaining action |
| --- | --- |
| Rendered UI | Broader width/zoom/native-popup/overflow/long-text combinations, other engines and accessibility review. Chromium selected viewports now exercise eight theme solid contrast/light-dark, reduced motion, navigation/tabs and RTL/LTR arrows; this does not certify every layout. |
| Backend coordination | Applying the existing clinic schema still requires explicit schema/migration authorization. Pinned runtime, isolated API/PDF and disposable PostgreSQL suites are exercised. [Backend current](../../backend/docs/workCurrent.md). |
| Prescription paper | Use the built-in calibration sheet on the actual printer at 100% scale; confirm custom sheet dimensions and offsets using a trial sheet. Digital A6/custom geometry is exercised; physical alignment is not. |
| Deployment | MySQL/MariaDB/Redis/Memcached, arbitrary worker failure, production bundles and physical printing remain unverified. Builds/schema/version changes require their explicit scope. |

Source review implementation is complete; [dispositions](review.md). Test suites are now explicitly authorized; no production build, migration inspection or version change was performed. [Working limits](../AGENTS.md).
