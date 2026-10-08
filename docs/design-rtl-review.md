# Frontend design, layout, and RTL review

Reviewed: 2026-10-08. Scope: application shell, containers, shared UI, patient/visit layouts, statistics/charts, calendars, tables, forms, themes, and floating elements.

Implementation status: the findings below were subsequently addressed; see [fixes and verification](design-rtl-fixes.md). This document preserves the original review evidence.

Method: source inspection and selector/caller tracing. No builds, compilation, packaging, test-suite access, database changes, or dependency changes. Browser rendering has not been verified. The findings below identify source defects and their expected consequences; exact visual severity still needs browser confirmation.

## Findings, ordered by priority

### 1. High — Mobile navigation cannot open; collapsed styles also override mobile geometry

Sources: [MainLayout.vue](../src/components/layout/MainLayout.vue#L29), [layout.css](../public/static/css/layout/shell.css#L24), [useViewport.js](../src/composables/useViewport.js#L14).

`mobileOpen` starts false and is only assigned false. The menu button toggles the desktop collapsed state, so users cannot open the drawer to reach routes absent from the five-item bottom navigation. The higher-specificity collapsed sidebar/content/topbar selectors override mobile width and offset resets, potentially retaining a 64px sidebar/gutter on a phone. CSS includes 768px as mobile while JavaScript excludes it.

Fix: route the button to drawer state on mobile and collapse state on desktop; restrict desktop collapsed geometry to desktop media queries; align the breakpoint boundary. Put the backdrop below the drawer (currently they share a stacking level and the backdrop follows it), and support Escape, focus restoration, scroll locking, and labelled expanded state.

### 2. High — Guest/login pages retain the desktop sidebar margin

Sources: [App.vue](../src/App.vue#L24), [layout.css](../public/static/css/layout/shell.css#L28), [full-width override](../public/static/css/layout/containers.css#L28).

The guest wrapper receives `app-content`, which sets `margin-inline-start: 240px`. `app-content--full` clears inline-end instead. With RTL, login keeps an empty right gutter and centers within the remaining width even though there is no sidebar.

Fix: clear the inline-start margin, preferably both inline margins, or give the guest shell its own layout class.

### 3. High — Dark-mode color tokens reference themselves

Source: [dark-mode.css](../public/static/css/themes/dark-mode.css#L5).

Declarations such as `--color-surface: color-mix(... var(--color-surface) ...)` create custom-property cycles on the same element. They do not read the previous light-theme value. Core surface, text, border, and status tokens therefore become invalid in browsers using the main color-mix branch; the fallback only applies when color-mix is unsupported.

Fix: separate base palette tokens from semantic dark-mode tokens, or assign explicit dark palette values. Check every theme's backgrounds, text, controls, and clinical status badges after correcting the token graph.

### 4. High — Statistics charts have no reliable initial/update render path

Sources: [StatisticsChart.vue](../src/components/charts/StatisticsChart.vue#L63), [Statistics.vue](../src/features/reports/views/Statistics.vue#L32), [useChart.js](../src/composables/useChart.js#L134).

The chart watcher is shallow and watches stable reactive object/array references supplied by the parent. In-place updates do not reliably trigger it; there is no mounted creation call or immediate watcher. When data changes from empty to populated, the conditional canvas may also not exist until after DOM update. Separately, unmounting any `useChart` consumer calls a module-wide `destroyAll`, which can destroy charts owned by other components.

Fix: observe derived labels/data and canvas readiness after DOM update, create/update on initial mount and subsequent data changes, and destroy only the consumer's chart instances.

### 5. Medium — Shared page headers have no layout styling

Source: [SectionHeader.vue](../src/components/ui/SectionHeader.vue#L4).

The shared page header emits `page-header-new`, but no matching CSS definition exists in the inspected frontend styles. Titles and actions consequently lack the intended shared distribution, alignment, and mobile wrapping policy.

Fix: define one shared header layout with a shrinkable title block, wrapping action group, spacing below the header, and stacked mobile presentation.

### 6. Medium — Frequently used spacing/alignment classes are undefined

Sources: [SectionHeader.vue](../src/components/ui/SectionHeader.vue#L15), [TableActions.vue](../src/components/ui/TableActions.vue#L2), [WeekViewGrid.vue](../src/features/appointments/components/WeekViewGrid.vue#L19), [layout helpers](../public/static/css/layout/helpers.css#L13).

Templates use `flex--gap-1/2/3`, `flex--align-center/end`, and `flex-grid--column/justify-between`; the styles define `gap-*`, `flex--center/end`, and other differently named helpers. These missing classes silently remove gaps/alignment; weekly appointment groups intended as columns remain wrapping rows.

Fix: normalize templates to the supported helpers or provide a documented compatibility layer, then remove duplicated inline spacing overrides deliberately.

### 7. Medium — Container padding is applied twice and differs by page

Sources: [shell padding](../public/static/css/layout/shell.css#L28), [page padding](../public/static/css/layout/footer-navigation.css#L67), [PageContainer.vue](../src/components/layout/PageContainer.vue#L2), [StatisticsLayout.vue](../src/features/reports/components/StatisticsLayout.vue#L2).

The shell supplies 24px horizontal padding and `PageContainer` adds another 24px; mobile supplies 16px at each layer. Other pages, including statistics, render directly within the shell. Content edges therefore differ across routes, and wrapped pages lose 64px of horizontal space on mobile before card padding. The `page-wrapper--padded` modifier has no definition. `PageContainer` also adds a nested `main` inside the existing main landmark.

Fix: assign page gutters to one layer, introduce explicit standard/wide/form container variants, and use a neutral element inside the shell's main landmark. Keep narrow form/prose widths separate from wide clinical tables.

### 8. Medium — The statistics page puts four KPIs into half a row

Source: [StatisticsLayout.vue](../src/features/reports/components/StatisticsLayout.vue#L57).

A two-column grid contains a single four-column `KpiGrid`, leaving the other outer column empty. Above the mobile breakpoint, these KPIs receive roughly half the width of the first KPI row, despite including long medication/diagnosis labels.

Fix: remove the outer two-column wrapper or make the KPI grid span both columns. Use consistent 4/2/1 distribution based on available content width.

### 9. Medium — Grids and the topbar do not account sufficiently for usable width

Sources: [grid helpers](../public/static/css/layout/shell.css#L98), [profile grid](../public/static/css/features/patients.css#L27), [topbar groups](../public/static/css/components/navigation.css#L103), [MainLayout.vue](../src/components/layout/MainLayout.vue#L24), [reset.css](../public/static/css/base/reset.css#L30).

Grid breakpoints use viewport width without accounting for the 240px sidebar, repeated page gutters, or the 280px profile sidebar. Plain `1fr` tracks and flex items retain intrinsic minimums. At smaller desktop/tablet widths, four-column content and long labels can outgrow the usable area. The topbar keeps search plus all account actions in a fixed-height row without a small-screen redistribution rule. Global `overflow-x: hidden` can conceal overflow rather than resolve it.

Fix: use `minmax(0, 1fr)` and `min-inline-size: 0` for shrinkable content; choose intermediate layouts from available width. Reduce or relocate secondary topbar actions on narrow screens while preserving labelled access.

### 10. Medium — Table header offset uses the wrong scroll container

Source: [tables.css](../public/static/css/components/tables.css#L6).

Tables scroll inside a height-limited `table-wrapper`, but sticky headers use the application's 56px topbar offset. The header is offset relative to the wrapper, producing a gap/overlap instead of sticking to the wrapper's top edge.

Fix: use `top: 0` for headers inside the table scroller. Give viewport-scrolling tables a separate variant if they genuinely need the application topbar offset. Review mobile action/select cells, whose generated label space is currently blank.

### 11. Medium — Tooltips remain hidden when mounted

Sources: [Tooltip.vue](../src/components/ui/Tooltip.vue#L12), [tooltip styles](../public/static/css/components/tooltips-loading.css#L3).

The base tooltip rule sets opacity to zero and visibility to hidden; `.tooltip.visible` enables display. The component mounts only `.tooltip`, never `.visible`, and the transition does not override visibility. Hover/focus therefore cannot reveal the tooltip through the current styles.

Fix: let conditional mounting/transition own visibility or bind the expected visible class. Link trigger and tooltip with an accessible description. Consider teleporting tooltips to avoid clipping by card overflow.

### 12. Medium — Floating placement uses estimated geometry and misses scroll updates

Sources: [useFloatingPosition.js](../src/composables/useFloatingPosition.js#L49), [useDropdown.js](../src/composables/useDropdown.js#L22).

Placement assumes a 360px width and 200px height instead of measuring the rendered panel. Small viewports can still overflow, and short panels may flip too far above their trigger. Only trigger size changes are observed; scrolling a table/page or resizing the viewport does not necessarily update fixed panel coordinates. Placement is always physically right-aligned rather than supporting logical start/end.

Fix: measure the actual panel after mount; clamp width/height to viewport space, track viewport/ancestor scrolling while open, and support explicit logical placement. Keep deliberate RTL right-edge anchoring where appropriate.

### 13. Medium — Mixed Arabic and phone/identifier content lacks bidi isolation

Sources: [PatientIdentity.vue](../src/features/patients/components/PatientIdentity.vue#L17), [phone input](../src/features/patients/components/PatientFormDemographics.vue#L44), [FormInput.vue](../src/components/ui/FormInput.vue#L10), [numeric styles](../public/static/css/base/typography.css#L109).

Phone strings, IDs, punctuation, and dates are interpolated into RTL text without isolated direction. Numeric styling changes fonts but does not establish direction. The phone control uses the generic text input without telephone semantics. International prefixes and mixed identifiers are especially susceptible to confusing visual ordering/caret placement.

Fix: use isolated LTR spans or `bdi` for machine-formatted identifiers/phone numbers, retain RTL Arabic labels, and add appropriate `type`, input mode, and control-level direction support. Do not force all clinical narrative or all numbers to LTR indiscriminately.

### 14. Medium — Mobile toast sizing and fixed navigation lack safe-area handling

Sources: [notifications.css](../public/static/css/components/notifications.css#L13), [toast sizing tokens](../public/static/css/tokens/components.css#L24), [bottom navigation](../public/static/css/layout/footer-navigation.css#L24), [bulk actions](../public/static/css/features/patients.css#L74).

The toast container is 100% wide while inset 16px from the edge; the toast itself has a 320px minimum width. At a 320px viewport it extends outside the viewport. Fixed bottom navigation and dependent bulk-action offsets do not account for device safe-area insets. Footer groups also stay on one unwrapped row.

Fix: bound toast width by viewport minus both gutters and remove conflicting minimums. Include safe-area space in bottom navigation height, content clearance, and stacked fixed-action offsets. Wrap or stack footer groups on mobile.

### 15. Medium — Chart colors and layout do not follow the active presentation

Sources: [useChart.js](../src/composables/useChart.js#L11), [body-scoped theme](../public/static/css/themes/ocean-cerulean.css#L2), [StatisticsChart.vue](../src/components/charts/StatisticsChart.vue#L123), [charts.css](../public/static/css/components/charts.css#L11).

Chart helpers read tokens from `documentElement`, while alternate themes and dark mode override tokens on `body`. Tooltip colors are resolved once at module load. Charts can therefore retain default colors when the surrounding interface changes. Every legend uses the physical right side, with no explicit legend RTL/text-direction policy or narrow-card alternative; aspect-ratio sizing is mixed with minimum-height card bodies.

Fix: resolve colors from the canvas/body after theme application and update existing charts when presentation changes. Make legend direction explicit; move long legends below small charts and use a predictable dedicated chart sizing wrapper.

## Additional component-level issues

- [Availability grid](../public/static/css/features/appointments/shared.css#L72): `repeat(auto-fit, 1fr)` is not a valid auto-repeat track definition. The [component](../src/features/appointments/components/AvailabilityGrid.vue) needs an explicit column count from its doctor list or a valid track sizing strategy. No current `.vue` caller was found, so treat this as a latent shared-component defect.
- [Queue rows](../public/static/css/features/appointments/shared.css#L119) keep four columns including fixed 80px/100px tracks without a mobile layout. No current `.vue` caller was found; add a narrow-screen presentation before integrating it.
- [Breakpoint token comments](../public/static/css/tokens/breakpoints.css#L30) suggest using custom properties inside media conditions, despite active styles correctly using literal breakpoints. Replace these misleading examples to prevent reintroducing invalid responsive rules.
- Navigation arrows already follow the Arabic RTL convention; do not mirror them globally without distinguishing direction-sensitive navigation from nondirectional icons.

## Suggested implementation sequence

1. Restore reliable shell behavior: guest margins, mobile opening/collapse rules, breakpoint boundary, drawer stacking/focus, and dark tokens.
2. Repair shared primitives: header styles, utility names, container ownership, table sticky positioning, tooltip visibility, and measured floating placement.
3. Correct page distribution: full-width statistics KPIs, chart lifecycle/ownership/themes, shrinkable grids, responsive topbar, footer, and safe-area clearances.
4. Add consistent bidi handling for mixed patient identifiers and phone controls, then verify affected workflows in the browser.

Suggested browser coverage: 320, 375, 768, 900, 1024, and 1440px; expanded/collapsed sidebar; long Arabic names and English clinical terms; international phone prefixes; empty/populated charts; open dropdowns during scrolling; light/dark themes; and keyboard navigation. Browser verification remains outstanding. No application fixes were applied during this review.
