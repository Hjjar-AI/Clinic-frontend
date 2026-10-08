# Shell/layout fixes

Implemented 2026-10-08 against [11 findings and responsive risks](shell-layout-review.md).

| Findings | Changes |
| --- | --- |
| S1 | Fixed, focus-revealed skip link; focusable main with topbar scroll offset. |
| S2 | Shared overlay stack/composable for drawer, BaseModal confirmations/shortcuts and critical privacy/session UI. Top priority owns Escape/Tab/focus; fresh visible/enabled control queries, inert background, nested scroll locks, connected focus restoration, idempotent cleanup. Drawer backdrop remains clickable; critical UI blocks lower layers and has an explicit privacy-return button. |
| S3 | Offline/maintenance banners occupy a shell region in normal flow; guest offline banner also reserves space. Existing live announcements retained. |
| S4 | Browser-print rules hide current chrome/banners/overlays and reset shell offsets, widths, container queries, sticky positioning and scroll clipping. Server PDF behavior unchanged. |
| S5 | Patient detail exposes its loader to the error retry action through both component layers; independent child loaders and care-team versions preserved. |
| S6 | Non-passive shortcuts suppress browser defaults only for owned actions; ignore composition/repeats/other modifiers, protect inputs and active overlays. Save targets the focused form or one unambiguous visible form; unavailable/unauthorized actions retain native behavior. |
| S7–S8 | Actual-direction chevrons/back/calendar arrows; named calendar controls, collapsed brand and bottom navigation. |
| S9–S11 | Independent guest/login wrappers; single transitionable route boundary and main-focus policy; nullable String/Object router targets through PageContainer and EmptyState; one dynamic viewport budget, single mobile safe-area clearance, flex page/footer ownership. |

Responsive/ownership cleanup: task/care-team rows shrink, wrap and stack; short account/password/appointment forms use existing 800px width; visit columns stretch. Patient detail uses document scrolling. Global clinical geometry owns visit/sidebar rules; removed two identical scoped copies and their imports. Named route boundaries replace broad main-child width selectors; standard/wide/form constraints remain supported. Login uses dynamic viewport fallback. Static styles remain external; overlay z-index is runtime stack geometry.

Verification: **23 scripts parsed**, **18 Vue template tag structures checked**, **129 isolated overlay/shortcut/source/CSS assertions passed**, including priority, nested/out-of-order cleanup, focus restoration, fresh disabled controls, clickable backdrop, native defaults, IME, retry wiring, router targets and 76 CSS import modules. Earlier API integration probes still pass **10 version-registry assertions**. Helpers: `/tmp/clinic_shell_fix_probe.mjs`, `/tmp/clinic_second_pass_frontend.mjs`; these do not mount Vue or render CSS. Checked scoped asset references and diff whitespace; preserved existing mixed line endings on unchanged lines.

Remaining verification: [rendered matrix](shell-layout-review.md#verification-and-exclusions), especially RTL/LTR arrows, drawer+modal/session flows, screen readers, long clinical pages/short landscape, virtual keyboard/safe areas, zoom and browser print. No browser executable/tools available; no build/compilation/packaging, test-suite access, migrations, dependency/version changes or project-data operations performed.
