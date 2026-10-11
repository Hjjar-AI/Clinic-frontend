# Automated test suite plan

Updated 2026-10-11. Authorized tests, test tooling and Vue/Vite test transforms; preserve existing application versions and clinic data. Implementation and repeatable runners are complete; [guide](testing.md), [results](doneCurrent.md).

Remaining environment verification:

- Verify pinned Django/DRF on a supported Python runtime; the Python 3.14 probe encounters Django 5 template-context errors.
- PostgreSQL concurrent writers/locking, production build, other browser engines/LTR layouts, and workflows outside the documented matrix remain unverified. Requested Arabic PDF/static-font/print checks are complete; [record](../../backend/docs/pdf-workflow-verification.md).
- Remaining UI targets: charts/floating panels, additional CRUD forms and exhaustive keyboard/focus/accessibility checks. Task, notification and availability coverage is described in [the test guide](testing.md).
