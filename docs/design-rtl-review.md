# Frontend design, layout, and RTL review

Reviewed: 2026-10-08. Scope: application shell, containers, shared UI, patient/visit layouts, statistics/charts, calendars, tables, forms, themes, and floating elements.

Historical review; findings subsequently addressed: [fixes and verification](design-rtl-fixes.md). Original evidence retained.

Method: source/selector/caller tracing; no builds/compilation/packaging, test-suite access, DB/dependency changes. Rendering unverified: source defects/expected effects identified, visual severity needs browser confirmation.

## Findings, ordered by priority

### 1. High — Mobile navigation cannot open; collapsed styles also override mobile geometry

Sources: [MainLayout.vue](../src/components/layout/MainLayout.vue#L29), [layout.css](../public/static/css/layout/shell.css#L24), [useViewport.js](../src/composables/useViewport.js#L14).

- **Issue:** `mobileOpen` is initialized/assigned false; the button toggles desktop collapse, preventing access beyond five bottom-nav routes. Higher-specificity collapsed rules retain 64px phone sidebar/gutters. CSS includes 768px; JS excludes it.
- **Fix:** Toggle mobile drawer versus desktop collapse; restrict collapsed geometry to desktop and align breakpoints. Put backdrop below drawer (same stacking level/follows drawer currently); support Escape, focus restoration, scroll lock, labelled expanded state.

### 2. High — Guest/login pages retain the desktop sidebar margin

Sources: [App.vue](../src/App.vue#L24), [layout.css](../public/static/css/layout/shell.css#L28), [full-width override](../public/static/css/layout/containers.css#L28).

- **Issue:** Guest `app-content` sets `margin-inline-start: 240px`; `app-content--full` clears inline-end instead, leaving RTL login centered beside an empty right gutter.
- **Fix:** Clear inline-start/both margins or use a dedicated guest layout class.

### 3. High — Dark-mode color tokens reference themselves

Source: [dark-mode.css](../public/static/css/themes/dark-mode.css#L5).

- **Issue:** `--color-surface: color-mix(... var(--color-surface) ...)` self-references on one element rather than reading a prior value. Surface/text/border/status tokens become invalid in color-mix-capable browsers; fallback covers unsupported browsers only.
- **Fix:** Separate base/semantic dark palettes or assign explicit dark values; check every theme's backgrounds/text/controls/clinical badges.

### 4. High — Statistics charts have no reliable initial/update render path

Sources: [StatisticsChart.vue](../src/components/charts/StatisticsChart.vue#L63), [Statistics.vue](../src/features/reports/views/Statistics.vue#L32), [useChart.js](../src/composables/useChart.js#L134).

- **Issue:** Shallow watchers observe stable parent references, missing in-place data changes; no mounted creation/immediate watcher. Empty→populated canvases appear after DOM update. Module-wide `destroyAll` on `useChart` consumer unmount destroys sibling charts.
- **Fix:** Observe derived labels/data and post-DOM canvas readiness; create/update initially and on changes, destroy only consumer-owned instances.

### 5. Medium — Shared page headers have no layout styling

Source: [SectionHeader.vue](../src/components/ui/SectionHeader.vue#L4).

- **Issue:** `page-header-new` has no matching CSS; shared titles/actions lack distribution, alignment, and mobile wrapping.
- **Fix:** Define shrinkable titles, wrapping actions, gaps/bottom spacing, and stacked mobile layout.

### 6. Medium — Frequently used spacing/alignment classes are undefined

Sources: [SectionHeader.vue](../src/components/ui/SectionHeader.vue#L15), [TableActions.vue](../src/components/ui/TableActions.vue#L2), [WeekViewGrid.vue](../src/features/appointments/components/WeekViewGrid.vue#L19), [layout helpers](../public/static/css/layout/helpers.css#L13).

- **Issue:** Templates use undefined `flex--gap-1/2/3`, `flex--align-center/end`, `flex-grid--column/justify-between`; styles define `gap-*`, `flex--center/end` and other names. Gaps/alignment vanish; weekly columns wrap as rows.
- **Fix:** Normalize to supported helpers or document compatibility aliases; deliberately remove duplicated inline spacing overrides.

### 7. Medium — Container padding is applied twice and differs by page

Sources: [shell padding](../public/static/css/layout/shell.css#L28), [page padding](../public/static/css/layout/footer-navigation.css#L67), [PageContainer.vue](../src/components/layout/PageContainer.vue#L2), [StatisticsLayout.vue](../src/features/reports/components/StatisticsLayout.vue#L2).

- **Issue:** Shell and `PageContainer` each add 24px gutters (16px mobile), while statistics renders directly. Wrapped mobile pages lose 64px before card padding; edges differ. `page-wrapper--padded` is undefined; nested `main` duplicates the landmark.
- **Fix:** Give gutters one owner, explicit standard/wide/form variants, and neutral inner element; separate narrow forms/prose from wide clinical tables.

### 8. Medium — The statistics page puts four KPIs into half a row

Source: [StatisticsLayout.vue](../src/features/reports/components/StatisticsLayout.vue#L57).

- **Issue:** A two-column wrapper contains one four-column `KpiGrid`, leaving half empty; above mobile, long medication/diagnosis KPIs get half the first row's width.
- **Fix:** Remove outer wrapper or span both columns; use consistent available-width 4/2/1 distribution.

### 9. Medium — Grids and the topbar do not account sufficiently for usable width

Sources: [grid helpers](../public/static/css/layout/shell.css#L98), [profile grid](../public/static/css/features/patients.css#L27), [topbar groups](../public/static/css/components/navigation.css#L103), [MainLayout.vue](../src/components/layout/MainLayout.vue#L24), [reset.css](../public/static/css/base/reset.css#L30).

- **Issue:** Viewport breakpoints ignore 240px shell/280px profile sidebars and repeated gutters. `1fr`/flex intrinsic minimums overflow narrow desktop/tablet content. Fixed-height topbar lacks search/account redistribution; `overflow-x: hidden` conceals overflow.
- **Fix:** Use `minmax(0, 1fr)`/`min-inline-size: 0`, choose intermediate layouts by usable width, and reduce/relocate secondary mobile actions while retaining labelled access.

### 10. Medium — Table header offset uses the wrong scroll container

Source: [tables.css](../public/static/css/components/tables.css#L6).

- **Issue:** Height-limited `table-wrapper` scrolls locally, but sticky headers use 56px app-topbar offset, causing wrapper-relative gaps/overlap.
- **Fix:** Use `top: 0` inside table scrollers; separate viewport-scrolling offset variant if needed. Review blank generated mobile action/select labels.

### 11. Medium — Tooltips remain hidden when mounted

Sources: [Tooltip.vue](../src/components/ui/Tooltip.vue#L12), [tooltip styles](../public/static/css/components/tooltips-loading.css#L3).

- **Issue:** Base tooltip is transparent/hidden; `.tooltip.visible` enables display, but mounted `.tooltip` lacks `.visible` and transitions never override visibility. Hover/focus cannot reveal it.
- **Fix:** Let mounting/transition control visibility or bind the visible class; describe triggers accessibly and consider teleporting beyond card clipping.

### 12. Medium — Floating placement uses estimated geometry and misses scroll updates

Sources: [useFloatingPosition.js](../src/composables/useFloatingPosition.js#L49), [useDropdown.js](../src/composables/useDropdown.js#L22).

- **Issue:** Placement assumes 360×200px instead of measured panels, overflowing small screens/misflipping short panels. Only trigger resizing is observed; page/table scroll and viewport resize leave stale fixed coordinates. Alignment is always physical right.
- **Fix:** Measure after mount; clamp viewport width/height, observe viewport/ancestor scrolling while open, support logical start/end; retain deliberate RTL right anchoring.

### 13. Medium — Mixed Arabic and phone/identifier content lacks bidi isolation

Sources: [PatientIdentity.vue](../src/features/patients/components/PatientIdentity.vue#L17), [phone input](../src/features/patients/components/PatientFormDemographics.vue#L44), [FormInput.vue](../src/components/ui/FormInput.vue#L10), [numeric styles](../public/static/css/base/typography.css#L109).

- **Issue:** RTL phone/ID/date/punctuation interpolation lacks bidi isolation. Numeric fonts do not establish direction; generic phone text input lacks telephone semantics, confusing prefixes, identifiers, and carets.
- **Fix:** Use isolated LTR spans/`bdi` for machine IDs/phones; retain Arabic labels, add `type`/inputmode/control direction. Do not force all narrative/numbers LTR.

### 14. Medium — Mobile toast sizing and fixed navigation lack safe-area handling

Sources: [notifications.css](../public/static/css/components/notifications.css#L13), [toast sizing tokens](../public/static/css/tokens/components.css#L24), [bottom navigation](../public/static/css/layout/footer-navigation.css#L24), [bulk actions](../public/static/css/features/patients.css#L74).

- **Issue:** Toast width 100% plus 16px inset and 320px minimum overflows a 320px viewport. Bottom nav/bulk-action offsets omit safe-area insets; footer groups never wrap.
- **Fix:** Limit toast width to viewport minus both gutters/remove conflicting minimums. Include safe areas in nav height/content clearance/stacked actions; wrap/stack mobile footer.

### 15. Medium — Chart colors and layout do not follow the active presentation

Sources: [useChart.js](../src/composables/useChart.js#L11), [body-scoped theme](../public/static/css/themes/ocean-cerulean.css#L2), [StatisticsChart.vue](../src/components/charts/StatisticsChart.vue#L123), [charts.css](../public/static/css/components/charts.css#L11).

- **Issue:** Charts read `documentElement` tokens while themes/dark mode override `body`; module-load tooltips retain stale colors. Legends always use physical right without RTL/text-direction/narrow alternatives; aspect ratios conflict with minimum-height bodies.
- **Fix:** Resolve canvas/body colors after theme application and update existing charts. Set legend direction, place long legends below small charts, and use dedicated predictable sizing wrappers.


## Additional component-level issues

- [Availability grid](../public/static/css/features/appointments/shared.css#L72): `repeat(auto-fit, 1fr)` is invalid; [component](../src/features/appointments/components/AvailabilityGrid.vue) needs doctor-based columns or valid tracks. No `.vue` caller found: latent shared-component defect.
- [Queue rows](../public/static/css/features/appointments/shared.css#L119) use four columns with fixed 80px/100px tracks and no mobile layout. No `.vue` caller found; add narrow-screen styling before integration.
- [Breakpoint token comments](../public/static/css/tokens/breakpoints.css#L30) incorrectly suggest media-condition custom properties; active styles use valid literals. Correct examples to prevent regression.
- Arrows already follow Arabic RTL; distinguish directional navigation from nondirectional icons before global mirroring.

## Suggested implementation sequence

1. Restore reliable shell behavior: guest margins, mobile opening/collapse rules, breakpoint boundary, drawer stacking/focus, and dark tokens.
2. Repair shared primitives: header styles, utility names, container ownership, table sticky positioning, tooltip visibility, and measured floating placement.
3. Correct page distribution: full-width statistics KPIs, chart lifecycle/ownership/themes, shrinkable grids, responsive topbar, footer, and safe-area clearances.
4. Add consistent bidi handling for mixed patient identifiers and phone controls, then verify affected workflows in the browser.

Browser coverage (outstanding): 320/375/768/900/1024/1440px, expanded/collapsed sidebar, long Arabic/English clinical text, international phones, empty/populated charts, scrolling open dropdowns, light/dark, keyboard navigation. This review applied no app fixes.
