# Remaining frontend work

| Area / files | Remaining action |
| --- | --- |
| `AppNavigation.vue`, `BottomNav.vue`, `src/router/index.js` | **N6 confirmed:** detail/create/edit sibling routes lose section highlighting; share section identity and correct `aria-current`. |
| `useNavigationItems.js`, `apiClient.js`, `src/stores/loading.js` | **N7 confirmed:** background badge/poll requests can activate blocking loading; separate background refresh, preserve visible cards and avoid duplicate dashboard fetches. |
| Topbar/bottom navigation, drawer, floating panels | Reproduce remaining badge-width/overflow/animation risks at 320/360/390px and 768/769px, expanded/collapsed desktop, RTL/LTR, 100/200% text and long labels/counts; inspect both edges/scroll owners without logging patient content. [Details](ui/navigation.md). |
| Browser/component matrix | Repeat the complete suites after final paired-calendar correction; prior full/focused outcomes are distinguished in [completed](doneCurrent.md). |
| Broader rendering/accessibility | Other engines, browser LTR, screen readers, exhaustive CRUD/keyboard permutations, native popups, virtual keyboard/safe areas, landscape/zoom and print permutations remain unverified. [Layout matrix](ui/layout.md), [coverage](testing/guide.md). |
| Cross-project environment | Pinned Django/DRF on supported Python and PostgreSQL concurrent writers/locking; coordinate with [backend current](../../backend/docs/workCurrent.md). Production bundles remain unverified and require explicit build authorization. |

Requested chart/panel/CRUD/focus expansion is implemented. No other implementation task is active. Existing authorization covers tests/tooling and Vue/Vite test transforms; migration files, production builds and version changes still require explicit requests. Preserve contracts in [AGENTS](../AGENTS.md).
