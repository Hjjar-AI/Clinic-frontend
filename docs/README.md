# Frontend documentation

Use topics and source areas below; completed history is consolidated into current behavior.

| Need | Read | Source ownership |
| --- | --- | --- |
| Run/configure the UI | [Root README](../README.md) | `package.json`, `vite.config.js`, `src/main.js` |
| Working rules | [AGENTS](../AGENTS.md) | Scope, authorization, CSS/RTL, privacy |
| Remaining work | [Current](workCurrent.md) | Open findings and verification gaps only |
| Latest verified state | [Completed](doneCurrent.md) | Results, runtime and important limits |
| File-by-file frontend review | [Review](reviews/frontend-file-by-file-2026-10-12.md) | 431-file ledger, checklist, prioritized findings and suggested corrections |
| Backend models and deep relationships review | [Backend review](../../backend/docs/reviews/models-and-logic-2026-10-12.md) | Model invariants, services, cross-model workflows and suggestions |
| CSS ownership/cascade | [CSS](ui/css.md) | `public/static/css/`, `src/styles/` |
| Shell/layout/RTL corrections | [Layout](ui/layout.md) | Layout components, charts, forms, themes, calendars |
| Navigation/panels; open N6/N7 | [Navigation](ui/navigation.md) | Router, search, floating panels, notification/loading state |
| Test commands and file coverage | [Testing](testing/guide.md) | `tests/`, shared services/stores and feature workflows |
| Chart/panel/CRUD/focus details | [Interactions](testing/interactions.md) | Component regressions and actual browser interactions |
| Patient API/retention | [Backend patient contract](../../backend/docs/contracts/patients.md) | Patient/visit facts, team, duplicates, merge, documents |
| Backend rules/operations/PDF | [Backend index](../../backend/docs/README.md) | API, deployment, recovery and PDF inspection |

Keep contracts in their topic guide, results in `doneCurrent.md`, and unresolved work in `workCurrent.md`; update the existing row instead of appending a timeline.
