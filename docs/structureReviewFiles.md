# File-by-file structure review ledger

Updated **2026-11-07** after the [implemented review](structureReview.md). [Remaining verification](workCurrent.md) · [Evidence and limits](doneCurrent.md).

Current inventory: **427/427 files** — 183 Vue, 141 JavaScript, 97 CSS, two generated declarations, three fonts and one JPEG. Original review: 457 files. Every current `src/`/`public/` file is listed once. “Applied” is source completion, not runtime certification; “Keep” is an architecture disposition. Generated declarations remain untouched pending authorized regeneration.

## public/static/css

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [app.css](../public/static/css/app.css) | 69 | Keep | Single ordered global stylesheet import manifest; preserve order and asset ownership. |
## public/static/css/base

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [reset.css](../public/static/css/base/reset.css) | 105 | Keep | Global baseline/focus/native element rules; no component split needed. |
| [splash.css](../public/static/css/base/splash.css) | 67 | Keep | Early/app splash visual rules; preserve startup consumers before pruning selectors. |
| [state.css](../public/static/css/base/state.css) | 66 | Keep | Semantic state-token aliases and state selectors; retain cohesive module. |
| [typography.css](../public/static/css/base/typography.css) | 128 | Keep | Global type/text utilities; repeated text-color/heading definitions can be consolidated only with cascade checks. |
## public/static/css/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [accordion.css](../public/static/css/components/accordion.css) | 56 | Keep | Only legacy accordion selector family, absent from active templates; prune with dormant-code review, do not merge by visual similarity. |
| [avatar.css](../public/static/css/components/avatar.css) | 73 | Keep | Shared avatar plus legacy patient-avatar selectors; retain active primitive, prune obsolete families after reference checks. |
| [buttons.css](../public/static/css/components/buttons.css) | 76 | Keep | Shared button/link variants and interaction styles; retain cohesive module. |
| [cards.css](../public/static/css/components/cards.css) | 165 | Keep | Shared card/panel/KPI shell styling; retain, clarify header ownership rather than adding more wrappers. |
| [charts.css](../public/static/css/components/charts.css) | 51 | Keep | Shared chart card/container presentation; retain with report renderer move, remove dormant mini-chart rules if deleted. |
| [collapsible-section.css](../public/static/css/components/collapsible-section.css) | 65 | Keep | Shared disclosure presentation; keep while feature policy moves out of component logic. |
| [content-navigation.css](../public/static/css/components/content-navigation.css) | 75 | Keep | Small list/divider/back/scroll/pagination module; prune unused numbered-pagination rules after candidate removal. |
| [context-menu.css](../public/static/css/components/context-menu.css) | 32 | Added S15 | Context-menu component styling at the original utility cascade position. |
| [danger-zone.css](../public/static/css/components/danger-zone.css) | 38 | Keep | Destructive recovery presentation; retain component-owned module. |
| [detail-item.css](../public/static/css/components/detail-item.css) | 36 | Keep | Active detail-item rules plus dormant details-grid family; keep active family and prune unused one. |
| [dropdown-menu.css](../public/static/css/components/dropdown-menu.css) | 11 | Keep | Small owned trigger module for dormant DropdownMenu; tiny size alone is not a merge reason. |
| [filters.css](../public/static/css/components/filters.css) | 47 | Keep | Shared filter-bar layout/variant behavior; retain. |
| [key-value-list.css](../public/static/css/components/key-value-list.css) | 46 | Keep | Active line/grid detail presentation; retain rather than merge scoped/other selector families. |
| [modal.css](../public/static/css/components/modal.css) | 119 | Keep | Global modal/shared variant rules; preserve cascade with scoped BaseModal CSS. |
| [navigation.css](../public/static/css/components/navigation.css) | 245 | Keep | Navigation visuals/RTL/mobile topbar rules; retain separate from shell geometry. |
| [notifications.css](../public/static/css/components/notifications.css) | 141 | Keep | Toast/alert/empty-state global presentation; cohesive feedback group, no new split required solely for count. |
| [overlay.css](../public/static/css/components/overlay.css) | 83 | Keep | App loading/privacy/error/route overlay visuals; retain explicit global ownership. |
| [presentation-widgets.css](../public/static/css/components/presentation-widgets.css) | 110 | Keep | Mixed theme/vertical-event/terms/alert-bar families; prune dormant families, leave active owners explicit. |
| [progress.css](../public/static/css/components/progress.css) | 53 | Keep | Shared progress bar presentation used by file upload; retain. |
| [record-controls.css](../public/static/css/components/record-controls.css) | 69 | Keep | Shared relative-date/signature plus scratchpad/indicator families; prune/move with actual component ownership. |
| [steps.css](../public/static/css/components/steps.css) | 54 | Keep | Active StepIndicator plus dormant StepsCard; prune static-card family if deleted. |
| [system-banner.css](../public/static/css/components/system-banner.css) | 26 | Added S15 | System-banner component styling at the original utility cascade position. |
| [tables.css](../public/static/css/components/tables.css) | 274 | Applied S15 | Styles moved to owning modules; dormant rules pruned with cascade/scoped/import boundaries preserved. |
| [tabs.css](../public/static/css/components/tabs.css) | 48 | Keep | Shared tablist/panel presentation; retain. |
| [tags.css](../public/static/css/components/tags.css) | 38 | Keep | Shared Badge/tag presentation; domain metadata belongs in JS registry, not new CSS components. |
| [tooltips-loading.css](../public/static/css/components/tooltips-loading.css) | 65 | Keep | Shared floating-tooltip/spinner styles; keep global rules distinct from comment-only scoped spinner import. |
## public/static/css/documents

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [pdf.css](../public/static/css/documents/pdf.css) | 249 | Keep | Browser print stylesheet, separate from retained server PDFs; preserve print resets/RTL/fonts and verify rendered output separately. |
## public/static/css/features/appointments

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [day.css](../public/static/css/features/appointments/day.css) | 87 | Keep | Day-grid/time-indicator styling; retain renderer ownership. |
| [month.css](../public/static/css/features/appointments/month.css) | 114 | Keep | Monthly grid/dots/responsiveness; retain separately from day/week. |
| [shared.css](../public/static/css/features/appointments/shared.css) | 163 | Keep | Shared booking/slot/skeleton plus dormant queue/availability families; prune dormant sections before considering splits. |
| [week.css](../public/static/css/features/appointments/week.css) | 31 | Keep | Week/day-card and today/weekend presentation; small coherent owner, retain. |
## public/static/css/features/clinical

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [catalog-entry-select.css](../public/static/css/features/clinical/catalog-entry-select.css) | 12 | Added S05 | Clinical entry chips/removal styles; shared scalar dropdown styles remain separate. |
| [medications.css](../public/static/css/features/clinical/medications.css) | 113 | Applied S15 | Styles moved to owning modules; dormant rules pruned with cascade/scoped/import boundaries preserved. |
| [substances-labs.css](../public/static/css/features/clinical/substances-labs.css) | 81 | Keep | Active controlled-card plus dormant LabResult rules; prune latter, keep controlled-medication presentation. |
## public/static/css/features

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [import.css](../public/static/css/features/import.css) | 3 | Added S08 | Full-width medication mapping row within the import grid. |
| [patients.css](../public/static/css/features/patients.css) | 129 | Keep | Patient profile/sidebar/link/register styles; prune dormant bulk-action family, retain patient-owned geometry. |
## public/static/css/features/prescription

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [letter-sheet.css](../public/static/css/features/prescription/letter-sheet.css) | 36 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `public/static/css/features/clinical/letter-sheet.css`. |
## public/static/css/features

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [visits.css](../public/static/css/features/visits.css) | 178 | Keep | Visit layout/cards and dormant timeline styles; retain active owner, prune timeline after removal. |
| [workspace.css](../public/static/css/features/workspace.css) | 123 | Applied S15 | Styles moved to owning modules; dormant rules pruned with cascade/scoped/import boundaries preserved. |
## public/static/css

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [fonts.css](../public/static/css/fonts.css) | 33 | Keep | Early font-face declarations referenced by index.html; retain public/static URLs and preload order. |
## public/static/css/forms

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [choices.css](../public/static/css/forms/choices.css) | 138 | Keep | Native checkbox/radio/toggle and shared form-section presentation; keep active rules, check legacy selectors when pruning. |
| [controls.css](../public/static/css/forms/controls.css) | 107 | Keep | Ordinary shared native form controls/field state rules; retain. |
| [date-picker.css](../public/static/css/forms/date-picker.css) | 65 | Keep | Date and range picker widget/extension styles; retain browser widget ownership. |
| [feedback-actions.css](../public/static/css/forms/feedback-actions.css) | 46 | Applied S15 | Styles moved to owning modules; dormant rules pruned with cascade/scoped/import boundaries preserved. |
| [input-widgets.css](../public/static/css/forms/input-widgets.css) | 103 | Keep | Segmented/password/upload presentation; active small owned groups, no immediate count-driven split. |
| [multi-select.css](../public/static/css/forms/multi-select.css) | 71 | Applied S05 | Scalar selection stays shared; rich clinical entries/search/factories and styles have clinical ownership. |
| [score-slider.css](../public/static/css/forms/score-slider.css) | 72 | Keep | Shared nullable-score widget presentation; preserve scoped overrides, not a blind global merge. |
| [search-select.css](../public/static/css/forms/search-select.css) | 121 | Keep | Native API selector/search combobox presentation; prune dormant AsyncSelect spinner family if removed. |
## public/static/css/layout

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [containers.css](../public/static/css/layout/containers.css) | 48 | Keep | Page/form/KPI width constraints; keep shell/container responsibilities explicit. |
| [footer-navigation.css](../public/static/css/layout/footer-navigation.css) | 77 | Keep | Footer/mobile bottom navigation placement; retain safe-area/RTL rules. |
| [helpers.css](../public/static/css/layout/helpers.css) | 162 | Keep | Generic grid/flex/spacing/layout utilities; coherent below review threshold, no component extraction needed. |
| [responsive-pages.css](../public/static/css/layout/responsive-pages.css) | 53 | Keep | Container/page responsiveness plus feature-specific task/team overrides; move feature tails only during owner cleanup with cascade checks. |
| [shell.css](../public/static/css/layout/shell.css) | 136 | Keep | App sidebar/topbar/content/gutter/guest geometry; retain shell ownership. |
## public/static/css/motion

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [animations.css](../public/static/css/motion/animations.css) | 62 | Keep | Shared animation utilities and reduced-motion override; retain. |
| [transitions.css](../public/static/css/motion/transitions.css) | 45 | Keep | Vue transition class families; retain separately from keyframe/token declarations. |
## public/static/css

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [skeleton.css](../public/static/css/skeleton.css) | 102 | Keep | Early HTML and Vue skeleton styles; retain despite dormant LoadingScreen.vue. |
## public/static/css/themes

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [dark-mode.css](../public/static/css/themes/dark-mode.css) | 213 | Keep | Shared dark palette derivation/fallback and text overrides; retain separate from light palette files. |
| [deep-space-strawberry.css](../public/static/css/themes/deep-space-strawberry.css) | 161 | Keep | Distinct palette and contrast overrides; retain one file per theme. |
| [default.css](../public/static/css/themes/default.css) | 23 | Applied S13 | One status presentation registry and theme metadata/default palette owner; transitions/dark variants retained. |
| [dusk-dusty-rosewood.css](../public/static/css/themes/dusk-dusty-rosewood.css) | 161 | Keep | Distinct palette variant; per-file declarations/aliases/dark overrides compared, retain. |
| [index.css](../public/static/css/themes/index.css) | 10 | Keep | Ordered palette/dark import manifest; retain order. |
| [ink-wheat-burnt.css](../public/static/css/themes/ink-wheat-burnt.css) | 161 | Keep | Distinct palette variant; retain, no theme-file merge warranted. |
| [ocean-cerulean.css](../public/static/css/themes/ocean-cerulean.css) | 161 | Keep | Distinct palette variant; retain, no theme-file merge warranted. |
| [prussian-orange.css](../public/static/css/themes/prussian-orange.css) | 161 | Keep | Distinct palette variant including contrasting secondary colors; retain. |
| [rosewood-crimson.css](../public/static/css/themes/rosewood-crimson.css) | 161 | Keep | Distinct palette variant; retain independent theme owner. |
| [vanilla-tangerine.css](../public/static/css/themes/vanilla-tangerine.css) | 161 | Keep | Distinct palette/contrast values; retain independent theme owner. |
## public/static/css/tokens

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [breakpoints.css](../public/static/css/tokens/breakpoints.css) | 31 | Keep | Documentation/JS-alignment tokens; retain literal media conditions rather than CSS-variable media queries. |
| [colors.css](../public/static/css/tokens/colors.css) | 252 | Applied S13 | One status presentation registry and theme metadata/default palette owner; transitions/dark variants retained. |
| [components.css](../public/static/css/tokens/components.css) | 64 | Keep | Shared elevation/feedback/interaction tokens; retain cohesive semantic layer. |
| [motion.css](../public/static/css/tokens/motion.css) | 64 | Keep | Shared motion durations/keyframe and reduced-motion tokens; keep separate from transition-class rules. |
| [spacing.css](../public/static/css/tokens/spacing.css) | 102 | Keep | Shared scale/layout/radius/z-index tokens; no split needed solely by number of token families. |
| [typography.css](../public/static/css/tokens/typography.css) | 84 | Keep | Type/icon/control-size semantic tokens; retain. |
## public/static/css/utilities

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [general.css](../public/static/css/utilities/general.css) | 75 | Applied S15 | Styles moved to owning modules; dormant rules pruned with cascade/scoped/import boundaries preserved. |
| [text-icons.css](../public/static/css/utilities/text-icons.css) | 99 | Keep | Text/icon/directional utility rules; consolidate duplicate global text utilities only with explicit cascade review. |
## public/static/fonts

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [Cairo-VariableFont_slnt,wght.ttf](../public/static/fonts/Cairo-VariableFont_slnt,wght.ttf) | — | Keep | TrueType variable font container inspected; referenced by early preload/font-face, retain URL; glyph rendering not certified. |
| [Inter-VariableFont_opsz,wght.ttf](../public/static/fonts/Inter-VariableFont_opsz,wght.ttf) | — | Keep | TrueType variable font container inspected; referenced by early preload/font-face, retain URL; glyph rendering not certified. |
| [NotoNaskhArabic-VariableFont_wght.ttf](../public/static/fonts/NotoNaskhArabic-VariableFont_wght.ttf) | — | Keep | TrueType variable font container inspected; font-face/print fallback owner, retain URL; shaping/printing not certified. |
## public/static

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [prescription-paper-reference.jpeg](../public/static/prescription-paper-reference.jpeg) | — | Keep | 404×760 JPEG visually inspected; blank preprinted alignment reference used by paper options, retain screen-only public asset. |
## src

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [App.vue](../src/App.vue) | 153 | Keep | App shell/session/confirmation/shortcut composition; retain as explicit app boundary. |
| [auto-imports.d.ts](../src/auto-imports.d.ts) | 92 | Generated | Generator-owned discovery declarations; historical mappings may name removed/moved files until authorized regeneration. |
## src/bootstrap

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [index.js](../src/bootstrap/index.js) | 15 | Keep | Small early theme bootstrap; retain to preserve initial appearance/order. |
| [registerApiHandlers.js](../src/bootstrap/registerApiHandlers.js) | 77 | Keep | App reactions to transport events/session/conflicts; keep out of generic domain services. |
## src/components/charts

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [MiniBarChart.vue](../src/components/charts/MiniBarChart.vue) | 63 | Retain S04 | No production entry path; retained because an existing test imports this module directly. |
## src/components/common

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AppStatusBar.vue](../src/components/common/AppStatusBar.vue) | 85 | Keep | App connectivity/live announcement host; cohesive app-level component. |
| [CriticalOverlay.vue](../src/components/common/CriticalOverlay.vue) | 87 | Keep | Privacy/timeout presentation uses shared top-layer focus ownership; retain. |
| [ErrorBoundary.vue](../src/components/common/ErrorBoundary.vue) | 91 | Keep | App error-capture/recovery host; retain shared app ownership. |
| [FileUpload.vue](../src/components/common/FileUpload.vue) | 144 | Keep | One import consumer selects files without auto upload; consider narrowing unused transport mode after consumer checks. |
| [MaintenanceBanner.vue](../src/components/common/MaintenanceBanner.vue) | 25 | Keep | App maintenance read/display adapter; retain app-level ownership. |
| [RouteProgressBar.vue](../src/components/common/RouteProgressBar.vue) | 58 | Keep | Route-hook progress lifecycle; retain separate from write request loading. |
| [ScrollToTop.vue](../src/components/common/ScrollToTop.vue) | 24 | Keep | Small app navigation affordance; no need to revive unused useScrollTo just for this. |
| [SearchInput.vue](../src/components/common/SearchInput.vue) | 316 | Keep | Shared object-select combobox with stale-read/floating/keyboard handling; retain as search primitive. |
| [ShortcutsModal.vue](../src/components/common/ShortcutsModal.vue) | 35 | Keep | App shortcut help; optional future metadata sharing with App shortcuts, not a new UI framework. |
| [SkeletonLoader.vue](../src/components/common/SkeletonLoader.vue) | 134 | Keep | Shared shape renderer; do not merge with inline early HTML skeleton or calendar-specific wrapper. |
| [Spinner.vue](../src/components/common/Spinner.vue) | 16 | Keep | Keep component; remove comment-only external scoped stylesheet/import. |
## src/components/documents

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [PdfPreview.vue](../src/components/documents/PdfPreview.vue) | 101 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/prescription/components/PrescriptionPdfPreview.vue`. |
## src/components/filters

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [DateFilter.vue](../src/components/filters/DateFilter.vue) | 49 | Keep | Filter-key date-pair adapter; retain distinct from explicit range apply UI. |
| [DoctorFilter.vue](../src/components/filters/DoctorFilter.vue) | 22 | Keep | Domain-labelled native API-select adapter; keep in filter integration layer unless later feature ownership is clarified. |
| [PatientFilter.vue](../src/components/filters/PatientFilter.vue) | 61 | Keep | Patient search filter adapter; shared SearchInput remains generic. |
| [StatusFilter.vue](../src/components/filters/StatusFilter.vue) | 28 | Keep | Simple status option adapter; use central presentation metadata where appropriate. |
## src/components/layout

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AppFooter.vue](../src/components/layout/AppFooter.vue) | 33 | Keep | App legal/navigation footer; help routes can move without changing URLs. |
| [AppNavigation.vue](../src/components/layout/AppNavigation.vue) | 79 | Keep | Desktop/mobile navigation presentation; retain shared menu source. |
| [BottomNav.vue](../src/components/layout/BottomNav.vue) | 40 | Keep | Distinct mobile navigation presentation over same menu; do not merge templates. |
| [MainLayout.vue](../src/components/layout/MainLayout.vue) | 194 | Keep | Shell/sidebar/search/banner composition; keep shell gutters/focus ownership. |
| [PageContainer.vue](../src/components/layout/PageContainer.vue) | 70 | Keep | Page width/resource presentation shell; retain separate from form hydration readiness. |
## src/components/ui

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AlertBar.vue](../src/components/ui/AlertBar.vue) | 51 | Keep | Severity/title/content feedback primitive; retain alongside resource-state adapters. |
| [ApiSelect.vue](../src/components/ui/ApiSelect.vue) | 118 | Keep | Active native remote single-select with cancellation/retry; keep its value contract distinct from search and multiselect. |
| [AppTabPanel.vue](../src/components/ui/AppTabPanel.vue) | 29 | Keep | Tab registration/panel partner; retain with AppTabs. |
| [AppTabs.vue](../src/components/ui/AppTabs.vue) | 96 | Keep | Owns tab registry, controlled active tab and keyboard navigation; cohesive. |
| [Avatar.vue](../src/components/ui/Avatar.vue) | 49 | Keep | Shared initials/icon/avatar presentation; no new component boundary needed. |
| [BackLink.vue](../src/components/ui/BackLink.vue) | 30 | Keep | Small navigation adapter used by FormWrapper; retain stable interface. |
| [Badge.vue](../src/components/ui/Badge.vue) | 104 | Applied S13 | One status presentation registry and theme metadata/default palette owner; transitions/dark variants retained. |
| [BadgeCell.vue](../src/components/ui/BadgeCell.vue) | 21 | Keep | Small table badge adapter; keep unless its sole consumer is simplified during catalog editing. |
| [BaseButton.vue](../src/components/ui/BaseButton.vue) | 96 | Keep | Shared button/link/loading/confirmation adapter; preserve one confirmation owner and navigation behavior. |
| [BaseCard.vue](../src/components/ui/BaseCard.vue) | 69 | Keep | Shared card/loading/empty/slot shell; retain cohesive primitive. |
| [BaseModal.vue](../src/components/ui/BaseModal.vue) | 154 | Keep | Modal shell using shared overlay stack; retain validation/focus/loading contract together. |
| [BaseToast.vue](../src/components/ui/BaseToast.vue) | 75 | Keep | Toast rendering/actions/progress owner; keep separate from queue lifecycle. |
| [Breadcrumb.vue](../src/components/ui/Breadcrumb.vue) | 51 | Keep | Shared explicit/route-derived breadcrumbs; retain. |
| [CardHeader.vue](../src/components/ui/CardHeader.vue) | 36 | Keep | Meaningful card-specific adapter over SectionHeader; no further merge required. |
| [ChartCard.vue](../src/components/ui/ChartCard.vue) | 47 | Keep | Shared chart/empty-state shell; chart lifecycle stays in useChart. |
| [CollapsibleSection.vue](../src/components/ui/CollapsibleSection.vue) | 90 | Applied S06 | Generic disclosure defaults stay shared; visit progressive workflow policy moved to visits. |
| [ConfirmCheckbox.vue](../src/components/ui/ConfirmCheckbox.vue) | 31 | Keep | Explicit destructive-consent control; keep separate from ordinary checkbox intent. |
| [ConfirmDialog.vue](../src/components/ui/ConfirmDialog.vue) | 100 | Keep | Queued confirmation/prompt renderer; keep checkbox/reason semantics and store ownership. |
| [DangerZone.vue](../src/components/ui/DangerZone.vue) | 27 | Keep | Destructive-operation presentation shell for recovery; retain. |
| [DataTable.vue](../src/components/ui/DataTable.vue) | 347 | Applied S02 | One account-scoped visible-key contract drives the table chooser, rendering and patient export fields. |
| [DateCell.vue](../src/components/ui/DateCell.vue) | 28 | Keep | Shared strict parsed date presentation; retain absolute/relative distinction. |
| [DatePicker.vue](../src/components/ui/DatePicker.vue) | 133 | Keep | Date widget wrapper owns DOM lifecycle; move loader out of pure date utilities, retain wrapper. |
| [DateRangePicker.vue](../src/components/ui/DateRangePicker.vue) | 161 | Keep | Range-specific validation/two-picker lifecycle; keep distinct from single-date control. |
| [DetailItem.vue](../src/components/ui/DetailItem.vue) | 20 | Keep | Active labelled detail primitive; retain without forcing array-based renderers. |
| [DropdownMenu.vue](../src/components/ui/DropdownMenu.vue) | 89 | Retain S04 | No production entry path; retained because an existing test imports this module directly. |
| [DynamicRowList.vue](../src/components/ui/DynamicRowList.vue) | 104 | Keep | Active configurable lab row editor; retain field-driven rows rather than new component per input. |
| [EmptyState.vue](../src/components/ui/EmptyState.vue) | 86 | Keep | Shared entity empty-state presentation; retain. |
| [ErrorList.vue](../src/components/ui/ErrorList.vue) | 49 | Keep | List-based import feedback; keep distinct input contract from field map/form summary. |
| [FieldError.vue](../src/components/ui/FieldError.vue) | 14 | Keep | Field-level error primitive; retain. |
| [FilterBar.vue](../src/components/ui/FilterBar.vue) | 55 | Keep | Shared field iteration/actions shell; keep per-feature filter definitions local. |
| [FilterField.vue](../src/components/ui/FilterField.vue) | 94 | Keep | Filter type dispatcher; retain without making a universal page generator. |
| [FormActions.vue](../src/components/ui/FormActions.vue) | 57 | Keep | Form submit/cancel/save feedback; shared CSS rules should be owned by feedback-actions module. |
| [FormCheckbox.vue](../src/components/ui/FormCheckbox.vue) | 37 | Keep | Ordinary boolean form control; keep. |
| [FormDate.vue](../src/components/ui/FormDate.vue) | 26 | Keep | Established thin form-date interface over DatePicker; no urgent merge needed. |
| [FormErrorSummary.vue](../src/components/ui/FormErrorSummary.vue) | 30 | Keep | Form-map error adapter; retain alongside ErrorList rather than combining all feedback contracts. |
| [FormField.vue](../src/components/ui/FormField.vue) | 76 | Keep | Label/control association and help/error layout; cohesive shared field owner. |
| [FormInput.vue](../src/components/ui/FormInput.vue) | 67 | Keep | Ordinary native input adapter with logical direction and constraints; keep. |
| [FormSelect.vue](../src/components/ui/FormSelect.vue) | 61 | Keep | Ordinary native option-list adapter; keep distinct from remote/search selection. |
| [FormTextarea.vue](../src/components/ui/FormTextarea.vue) | 82 | Keep | Text-area/counter/resize control; retain scoped counter ownership. |
| [FormWrapper.vue](../src/components/ui/FormWrapper.vue) | 90 | Applied S03 | Breadcrumb outlet/callers are connected; form hydration and error gates are retained. |
| [Icon.vue](../src/components/ui/Icon.vue) | 29 | Keep | Shared semantic icon adapter; retain central alias registry. |
| [KeyValueList.vue](../src/components/ui/KeyValueList.vue) | 39 | Keep | Active lines/grid detail presentation; keep; dormant DetailsGrid need not become another abstraction. |
| [KpiGrid.vue](../src/components/ui/KpiGrid.vue) | 26 | Keep | Repeated KPI layout/StatCard adapter; retain. |
| [ListView.vue](../src/components/ui/ListView.vue) | 282 | Keep | Keep cursor/filter orchestration separate from table renderer; route-filter/preference ownership can be simplified. |
| [LoadingOverlay.vue](../src/components/ui/LoadingOverlay.vue) | 22 | Keep | App-level write-loading presentation; keep distinct from modal/field/read feedback. |
| [MultiSelect.vue](../src/components/ui/MultiSelect.vue) | 239 | Applied S05 | Scalar selection stays shared; rich clinical entries/search/factories and styles have clinical ownership. |
| [PageHeader.vue](../src/components/ui/PageHeader.vue) | 22 | Keep | Page-specific adapter over SectionHeader; keep. |
| [PasswordStrengthMeter.vue](../src/components/ui/PasswordStrengthMeter.vue) | 37 | Keep | Shared password strength display; pure strength policy remains in validators. |
| [Progress.vue](../src/components/ui/Progress.vue) | 65 | Keep | Shared progress display used by upload; no new progress component needed. |
| [RelativeDate.vue](../src/components/ui/RelativeDate.vue) | 66 | Keep | Relative display/timer owner; keep separate from pure date calculations. |
| [ResourceFeedback.vue](../src/components/ui/ResourceFeedback.vue) | 26 | Keep | Loading/error/read-retry presentation; keep distinct from mutation retry policy. |
| [ResponsiveDetailPanel.vue](../src/components/ui/ResponsiveDetailPanel.vue) | 18 | Keep | Inline/mobile-modal adapter; retain; can reuse useViewport boundary rather than another resize convention. |
| [ScoreInput.vue](../src/components/ui/ScoreInput.vue) | 87 | Keep | Nullable clinical score input; preserve unknown/zero distinction rather than merging with ordinary numbers. |
| [SectionHeader.vue](../src/components/ui/SectionHeader.vue) | 59 | Keep | Existing shared renderer behind page/card adapters; already consolidated. |
| [SegmentedControl.vue](../src/components/ui/SegmentedControl.vue) | 39 | Keep | Shared radio-option primitive; retain clinical caller labels/values. |
| [SignaturePad.vue](../src/components/ui/SignaturePad.vue) | 201 | Keep | Stroke capture and PNG serialization are one cohesive control; preserve change invalidation. |
| [StatCard.vue](../src/components/ui/StatCard.vue) | 161 | Keep | KPI value animation/sparkline presentation; no size-based split needed. |
| [StatusCell.vue](../src/components/ui/StatusCell.vue) | 20 | Keep | Useful table adapter to domain-aware Badge; retain. |
| [StepIndicator.vue](../src/components/ui/StepIndicator.vue) | 32 | Keep | Active import progress indicator; not equivalent to dormant FormWizard/StepsCard. |
| [TableActions.vue](../src/components/ui/TableActions.vue) | 70 | Keep | Shared row actions/confirmation affordance; retain displayed-version command ownership in callers. |
| [ThemeSwitcher.vue](../src/components/ui/ThemeSwitcher.vue) | 40 | Applied S13 | One status presentation registry and theme metadata/default palette owner; transitions/dark variants retained. |
| [Tooltip.vue](../src/components/ui/Tooltip.vue) | 38 | Keep | Floating accessible description wrapper; positioning already delegated to useFloatingPosition. |
## src

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [components.d.ts](../src/components.d.ts) | 105 | Generated | Generator-owned discovery declarations; historical mappings may name removed/moved files until authorized regeneration. |
## src/composables

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [toastConfig.js](../src/composables/toastConfig.js) | 13 | Keep | Toast constants; inline or move with toast owner if queue is reorganized; no new shared composable needed. |
| [useApi.js](../src/composables/useApi.js) | 136 | Keep S07 | Form callers no longer nest this adapter; optional query mode retained without changing its contract. |
| [useAppTheme.js](../src/composables/useAppTheme.js) | 10 | Keep | UI-store theme adapter; retain one DOM application service. |
| [useAutoCleanup.js](../src/composables/useAutoCleanup.js) | 22 | Keep | Small mounted listener/timer cleanup collection; retain rather than inventing another lifecycle framework. |
| [useBreadcrumbs.js](../src/composables/useBreadcrumbs.js) | 15 | Keep | Reactive router breadcrumb derivation; keep. |
| [useCan.js](../src/composables/useCan.js) | 12 | Keep | Auth-grant adapter; small but used by route guards, no new permission state owner needed. |
| [useChart.js](../src/composables/useChart.js) | 113 | Keep | Reusable chart import/instance/presentation lifecycle; keep shared while report renderer moves. |
| [useConfirmDialog.js](../src/composables/useConfirmDialog.js) | 40 | Keep | Confirmation/prompt convenience adapter; keep store as sole queue owner. |
| [useCopy.js](../src/composables/useCopy.js) | 38 | Keep S12 | Active clipboard implementation remains; its unused duplicate directive/registration was removed. |
| [useDate.js](../src/composables/useDate.js) | 6 | Applied S12 | Pure dates/browser widget and live cursor normalization have explicit owners; strict catalog handling retained. |
| [useDropdown.js](../src/composables/useDropdown.js) | 61 | Keep | Active notification dropdown focus/outside/keyboard owner; retain despite dormant DropdownMenu. |
| [useFloatingPosition.js](../src/composables/useFloatingPosition.js) | 87 | Keep | Reusable fixed viewport geometry/observers; keep runtime measurements here. |
| [useForm.js](../src/composables/useForm.js) | 251 | Keep | Validation/baseline/dirty state owner; keep separate from submission and route-leave guard. |
| [useFormDirty.js](../src/composables/useFormDirty.js) | 52 | Keep | Unsaved-navigation guard over caller’s dirty ref; retain one dirty source. |
| [useFormDraft.js](../src/composables/useFormDraft.js) | 72 | Applied S09 | Fresh defaults and pure mapping live in the visit model; lifecycle and saved scale policy stay separate. |
| [useFormSubmission.js](../src/composables/useFormSubmission.js) | 60 | Applied S07 | Six forms supply direct saves to the existing single form mutation owner. |
| [useFormatters.js](../src/composables/useFormatters.js) | 20 | Keep | Existing pure-function facade; direct utility imports are fine for new code, mass replacement is low value. |
| [useLatestResource.js](../src/composables/useLatestResource.js) | 51 | Added S10 | Replaceable reads with generation/session invalidation, retry state and unmount disposal. |
| [useMaintenanceMode.js](../src/composables/useMaintenanceMode.js) | 18 | Keep | Shared app maintenance read state; no domain split required. |
| [useNavigationItems.js](../src/composables/useNavigationItems.js) | 71 | Keep | App navigation/grant/badge orchestration shared by desktop/mobile; keep single menu source. |
| [useNotify.js](../src/composables/useNotify.js) | 14 | Keep | Toast notification adapter; keep one announcement policy with toast host. |
| [useObjectUrl.js](../src/composables/useObjectUrl.js) | 24 | Added S10 | Persistent preview URL replacement/revocation; callers guard asynchronous results and issuance. |
| [useOverlay.js](../src/composables/useOverlay.js) | 14 | Keep | Vue adapter over overlayStack; retain distinct from floating dropdown behavior. |
| [usePageStatus.js](../src/composables/usePageStatus.js) | 12 | Keep | Small page-status adapter; do not substitute it for successful form hydration state. |
| [usePagination.js](../src/composables/usePagination.js) | 242 | Applied S12 | Pure dates/browser widget and live cursor normalization have explicit owners; strict catalog handling retained. |
| [useResourceLoad.js](../src/composables/useResourceLoad.js) | 24 | Keep S10 | Successful-hydration form/save gate retained independently from replaceable preview reads. |
| [useRouteFilters.js](../src/composables/useRouteFilters.js) | 22 | Added S11 | Writable multi-filter projection over the existing coalesced route-query primitive. |
| [useRouteQuery.js](../src/composables/useRouteQuery.js) | 37 | Keep S11 | Existing coalesced query/history primitive retained; multi-field adapter composes it. |
| [useSearch.js](../src/composables/useSearch.js) | 78 | Keep | Active debounced stale-read search lifecycle; reuse in clinical selector extraction where suitable. |
| [useSession.js](../src/composables/useSession.js) | 144 | Keep | App privacy/timeout lifecycle; keep separate from drafts; stale draft-related JSDoc should follow actual useFormDraft ownership. |
| [useShortcut.js](../src/composables/useShortcut.js) | 15 | Keep | Reusable keyboard shortcut lifecycle; retain app-specific commands at app boundary. |
| [useSystemConfig.js](../src/composables/useSystemConfig.js) | 46 | Keep | Shared startup/config loading owner; optional explicit service adapter, no second config store needed. |
| [useTableColumns.js](../src/composables/useTableColumns.js) | 52 | Added S02 | Account/browser column preference owner; fixed identity keys remain visible. |
| [useToast.js](../src/composables/useToast.js) | 53 | Keep | Shared in-memory toast queue/timeouts; retain separate from rendering. |
| [useValidator.js](../src/composables/useValidator.js) | 28 | Keep | Configured identity/phone validation adapter; retain pure validators as single implementations. |
| [useViewport.js](../src/composables/useViewport.js) | 17 | Keep | Shared inclusive 768px reactive boundary; reuse where components duplicate boundary listeners. |
## src/config

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [app.js](../src/config/app.js) | 25 | Keep | App startup flags/preferences/version facade; trim inactive options only with consumer evidence, no new config layer. |
## src/constants

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [statusConstants.js](../src/constants/statusConstants.js) | 119 | Applied S13 | One status presentation registry and theme metadata/default palette owner; transitions/dark variants retained. |
| [statusPresentation.js](../src/constants/statusPresentation.js) | 198 | Added S13 | Domain-keyed display label/color/icon/risk-bar registry; no transition authority. |
| [storageKeys.js](../src/constants/storageKeys.js) | 9 | Keep | Shared storage-key registry; feature-owned account keys can remain local with explicit policy. |
| [theme.js](../src/constants/theme.js) | 14 | Applied S13 | One status presentation registry and theme metadata/default palette owner; transitions/dark variants retained. |
## src/directives

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [autoTitle.js](../src/directives/autoTitle.js) | 17 | Keep | Active overflow-title directive registered in main; retain. |
| [autofocus.js](../src/directives/autofocus.js) | 6 | Keep | Mounted form focus adapter; retain registration where used. |
| [debounce.js](../src/directives/debounce.js) | 26 | Keep | Registered but no v-debounce templates found; optional removal after intended-consumer check, keep active utils debounce. |
## src/features/appointments/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AppointmentBlock.vue](../src/features/appointments/components/AppointmentBlock.vue) | 50 | Keep | Booking presentation/drag payload; retain feature owner. |
| [CalendarLayout.vue](../src/features/appointments/components/CalendarLayout.vue) | 141 | Keep | Calendar page composition/toolbar; keep feature-specific shell. |
| [CalendarLegend.vue](../src/features/appointments/components/CalendarLegend.vue) | 23 | Keep | Shared calendar legend presentation; central status metadata can supply labels later. |
| [CalendarSkeleton.vue](../src/features/appointments/components/CalendarSkeleton.vue) | 31 | Keep | Calendar-specific skeleton composition reuses shared shapes; retain. |
| [CalendarView.vue](../src/features/appointments/components/CalendarView.vue) | 48 | Keep | Small day/week/month dispatcher with explicit event forwarding; retain. |
| [DayViewGrid.vue](../src/features/appointments/components/DayViewGrid.vue) | 161 | Keep | Day slots, overlap display, current-time geometry; keep separate renderer. |
| [MonthViewGrid.vue](../src/features/appointments/components/MonthViewGrid.vue) | 193 | Keep | Monthly cell/adjacent-month booking renderer; retain separate from day/week. |
| [SlotToken.vue](../src/features/appointments/components/SlotToken.vue) | 18 | Keep | Active availability marker owned by day grid; retain feature-local. |
| [TimeSlotPicker.vue](../src/features/appointments/components/TimeSlotPicker.vue) | 126 | Keep | Availability-aware remote selection; route reads through existing appointmentService during cleanup, not a new service. |
| [WeekViewGrid.vue](../src/features/appointments/components/WeekViewGrid.vue) | 76 | Keep | Weekly day-card layout; preserve independent presentation/event contract. |
## src/features/appointments/composables

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [useCalendar.js](../src/features/appointments/composables/useCalendar.js) | 149 | Keep | Calendar resource loading/local projection lifecycle; keep feature-local; raw endpoint access can move to existing service. |
| [useTimeSlots.js](../src/features/appointments/composables/useTimeSlots.js) | 9 | Keep | Small slot generation helper; no composable split warranted. |
## src/features/appointments/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [appointmentService.js](../src/features/appointments/services/appointmentService.js) | 43 | Keep | Existing booking API boundary; reuse for availability/raw-calendar calls rather than duplicating request paths. |
## src/features/appointments/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [appointments.js](../src/features/appointments/stores/appointments.js) | 58 | Keep | Booking mutation/store adapters; retain server versions/results instead of creating another calendar store. |
## src/features/appointments/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AppointmentForm.vue](../src/features/appointments/views/AppointmentForm.vue) | 401 | Applied S03/S07 | Breadcrumb outlet/callers are connected; form hydration and error gates are retained. Six forms supply direct saves to the existing single form mutation owner. |
| [AppointmentsCalendar.vue](../src/features/appointments/views/AppointmentsCalendar.vue) | 281 | Keep | Keep navigation/filter controller; merge identical day/week drop handlers locally, retain renderer split. |
## src/features/auth/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [authService.js](../src/features/auth/services/authService.js) | 23 | Keep | Session/CSRF/login/password API boundary; retain. |
## src/features/auth/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [auth.js](../src/features/auth/stores/auth.js) | 111 | Keep | Principal/grants/draft/session authority; keep explicit infrastructure integration. |
## src/features/auth/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [Login.vue](../src/features/auth/views/Login.vue) | 169 | Keep | Small auth view with native password flow; no new login components needed. |
## src/features/backup/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [BackupLayout.vue](../src/features/backup/components/BackupLayout.vue) | 210 | Keep | Recovery consent/options/preview rendering; keep distinct from catalog import and signed preview ownership. |
## src/features/backup/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [backupService.js](../src/features/backup/services/backupService.js) | 25 | Keep | Authenticated backup/recovery API adapter; retain separate from bulk import. |
## src/features/backup/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [BackupView.vue](../src/features/backup/views/BackupView.vue) | 90 | Keep | Active backup/restore controller; keep token/options binding, reuse ordinary download helper. |
## src/features/billing/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [invoiceService.js](../src/features/billing/services/invoiceService.js) | 17 | Keep | Invoice command/transition/PDF boundary; retain. |
## src/features/billing/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [InvoiceForm.vue](../src/features/billing/views/InvoiceForm.vue) | 359 | Applied S03/S07 | Breadcrumb outlet/callers are connected; form hydration and error gates are retained. Six forms supply direct saves to the existing single form mutation owner. |
| [InvoicesList.vue](../src/features/billing/views/InvoicesList.vue) | 247 | Keep | Cohesive invoice list/transition page; use route-filter adapter and existing download helper. |
## src/features/clinical/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [CatalogEntrySelect.vue](../src/features/clinical/components/CatalogEntrySelect.vue) | 108 | Added S05 | Clinical object selection over SearchInput, explicit custom factories and detached duplicate markers. |
| [ClinicalTextArea.vue](../src/features/clinical/components/ClinicalTextArea.vue) | 36 | Keep | Established clinical textarea adapter; thin but not an urgent merge target. |
| [ControlledSubstanceCard.vue](../src/features/clinical/components/ControlledSubstanceCard.vue) | 39 | Keep | Active prescription controlled-medication notice; keep clinical semantics. |
| [DiagnosisList.vue](../src/features/clinical/components/DiagnosisList.vue) | 22 | Keep | Shared clinical diagnosis display used across feature boundaries; keep. |
| [MedicationList.vue](../src/features/clinical/components/MedicationList.vue) | 117 | Keep | Active schedule/prescription/pill presentation variants share one medication model; no immediate split needed. |
| [RiskLevelBadge.vue](../src/features/clinical/components/RiskLevelBadge.vue) | 18 | Keep | Small clinical unknown/risk adapter over Badge; keep. |
| [ScalePickerModal.vue](../src/features/clinical/components/ScalePickerModal.vue) | 60 | Applied S01 | Full-catalog scale lookup with explicit loading/error/retry; saved answers keep their own owner. |
| [ScaleRenderer.vue](../src/features/clinical/components/ScaleRenderer.vue) | 77 | Keep | Editable scale fields/nullable slider rendering; retain separate from approved-history rendering. |
## src/features/clinical/composables

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [useCatalogEditor.js](../src/features/clinical/composables/useCatalogEditor.js) | 46 | Added S11 | Shared opening-version/modal/save/invalidation/list-refresh lifecycle for two catalogs. |
## src/features/clinical/model

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [catalogEntries.js](../src/features/clinical/model/catalogEntries.js) | 23 | Added S05 | Explicit diagnosis/medication custom-entry factories; no clinical shape in scalar UI. |
## src/features/clinical/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [diagnosisService.js](../src/features/clinical/services/diagnosisService.js) | 16 | Keep | Small diagnosis CRUD/export/reactivation adapter; retain with catalog editor extraction. |
| [medicationService.js](../src/features/clinical/services/medicationService.js) | 15 | Keep | Small medication CRUD/export/reactivation adapter; keep distinct commands from diagnosis. |
| [scaleService.js](../src/features/clinical/services/scaleService.js) | 21 | Keep | Scale/question commands differ from catalog item editing; retain explicit service. |
| [templateService.js](../src/features/clinical/services/templateService.js) | 12 | Keep | Clinical template command boundary; retain. |
## src/features/clinical/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [constants.js](../src/features/clinical/stores/constants.js) | 69 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/stores/constants.js`. |
| [diagnosisLookup.js](../src/features/clinical/stores/diagnosisLookup.js) | 15 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/stores/diagnosisLookup.js`. |
| [lookups.js](../src/features/clinical/stores/lookups.js) | 48 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/stores/lookups.js`. |
| [medicationLookup.js](../src/features/clinical/stores/medicationLookup.js) | 15 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/stores/medicationLookup.js`. |
| [scaleLookup.js](../src/features/clinical/stores/scaleLookup.js) | 15 | Applied S01/S14 | Full-catalog scale lookup with explicit loading/error/retry; saved answers keep their own owner. Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/stores/scaleLookup.js`. |
## src/features/clinical/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [DiagnosesManage.vue](../src/features/clinical/views/DiagnosesManage.vue) | 264 | Applied S11 | Catalog modal lifecycle and multi-filter URL projections use focused shared controllers. |
| [MedicationsManage.vue](../src/features/clinical/views/MedicationsManage.vue) | 300 | Applied S11 | Catalog modal lifecycle and multi-filter URL projections use focused shared controllers. |
| [ScalesAdmin.vue](../src/features/clinical/views/ScalesAdmin.vue) | 354 | Keep | Question-add/create modal workflows differ from ordinary catalogs; retain, optionally isolate question editor later. |
| [TemplateForm.vue](../src/features/clinical/views/TemplateForm.vue) | 241 | Applied S03/S07 | Breadcrumb outlet/callers are connected; form hydration and error gates are retained. Six forms supply direct saves to the existing single form mutation owner. |
| [TemplatesList.vue](../src/features/clinical/views/TemplatesList.vue) | 148 | Keep | Small template list/reactivation controller; route-filter assembly may be shared. |
## src/features/dashboard/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [DashboardLayout.vue](../src/features/dashboard/components/DashboardLayout.vue) | 230 | Keep | Dashboard-specific card composition; no need one component per small card. |
| [SessionScratchpad.vue](../src/features/dashboard/components/SessionScratchpad.vue) | 46 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/components/ui/EditableNotes.vue`. |
## src/features/dashboard/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [dashboardService.js](../src/features/dashboard/services/dashboardService.js) | 17 | Keep | Dashboard endpoint adapter; retain; trim unused methods only after consumer checks. |
## src/features/dashboard/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [analytics.js](../src/features/dashboard/stores/analytics.js) | 116 | Keep | Dashboard/badge read owner; keep coalescing/session lifecycle; report page has independent statistics state. |
## src/features/dashboard/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [Dashboard.vue](../src/features/dashboard/views/Dashboard.vue) | 91 | Keep | Thin dashboard projection/actions controller; keep. |
## src/features/help/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AboutView.vue](../src/features/help/views/AboutView.vue) | 14 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/reports/views/AboutView.vue`. |
| [ManualView.vue](../src/features/help/views/ManualView.vue) | 28 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/reports/views/ManualView.vue`. |
| [PrivacyPolicyView.vue](../src/features/help/views/PrivacyPolicyView.vue) | 27 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/reports/views/PrivacyPolicyView.vue`. |
| [TermsView.vue](../src/features/help/views/TermsView.vue) | 27 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/reports/views/TermsView.vue`. |
## src/features/import/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [DiagnosisImportPanel.vue](../src/features/import/components/DiagnosisImportPanel.vue) | 157 | Added S08 | Diagnosis preview/execute file/mode/token/consent owner. |
| [MedicationImportPanel.vue](../src/features/import/components/MedicationImportPanel.vue) | 304 | Added S08 | Medication upload/map/preview/execute owner with descriptor-based column controls. |
## src/features/import/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [importService.js](../src/features/import/services/importService.js) | 59 | Keep | Distinct patient/diagnosis/medication preview commands; retain token binding and mapping semantics. |
## src/features/import/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [ImportData.vue](../src/features/import/views/ImportData.vue) | 258 | Keep | Patient import step/preview/doctor binding; retain distinct from catalog import and recovery; reuse download helper. |
| [ImportOptions.vue](../src/features/import/views/ImportOptions.vue) | 17 | Applied S08 | Independent diagnosis/medication panels retain preview tokens, mappings, invalidation and consent. |
## src/features/notifications/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [NotificationCenter.vue](../src/features/notifications/components/NotificationCenter.vue) | 228 | Keep | Dropdown/grouped notification rendering; keep; read count directly or move count adapter into feature. |
## src/features/notifications/composables

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [useUnreadCount.js](../src/features/notifications/composables/useUnreadCount.js) | 12 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/composables/useUnreadCount.js`. |
## src/features/notifications/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [notificationService.js](../src/features/notifications/services/notificationService.js) | 29 | Keep | Persistent polling/read-state API boundary; retain. |
## src/features/notifications/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [notifications.js](../src/features/notifications/stores/notifications.js) | 132 | Keep | Single unread-count/poll/action owner; retain; avoid new polling composables. |
## src/features/notifications/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [Notifications.vue](../src/features/notifications/views/Notifications.vue) | 85 | Keep | Full notification list/navigation differs from compact dropdown; no forced template merge. |
## src/features/patients/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [PatientCareTeamTab.vue](../src/features/patients/components/PatientCareTeamTab.vue) | 135 | Keep | Effective team/candidate/add/remove rendering; keep domain boundary with parent versions. |
| [PatientDetailLayout.vue](../src/features/patients/components/PatientDetailLayout.vue) | 314 | Keep | Patient tabs/panels composition; keep per-panel permissions/versions, avoid a universal detail schema. |
| [PatientDocumentsPanel.vue](../src/features/patients/components/PatientDocumentsPanel.vue) | 258 | Keep | Document metadata/file/own-version/archive workflow; retain; ordinary downloads can reuse helper. |
| [PatientDuplicatePanel.vue](../src/features/patients/components/PatientDuplicatePanel.vue) | 49 | Keep | Optional duplicate review and preview-bound merge consent; keep separate from ordinary records editor. |
| [PatientFormDemographics.vue](../src/features/patients/components/PatientFormDemographics.vue) | 80 | Keep | Cohesive demographic form section; keep optional unknown/year-only fields. |
| [PatientFormMedical.vue](../src/features/patients/components/PatientFormMedical.vue) | 31 | Keep | Small permission-aware medical section; retain domain boundary rather than fold into generic form fields. |
| [PatientFormSocial.vue](../src/features/patients/components/PatientFormSocial.vue) | 44 | Keep | Social/identity registration section; no size-based merge warranted. |
| [PatientHistoryPanel.vue](../src/features/patients/components/PatientHistoryPanel.vue) | 36 | Keep | Correction/merge history projection and offset paging; keep immutable-history display distinct. |
| [PatientIdentity.vue](../src/features/patients/components/PatientIdentity.vue) | 128 | Keep | Patient identity/action display; keep distinct from visit workspace/allergy summary. |
| [PatientLink.vue](../src/features/patients/components/PatientLink.vue) | 36 | Keep | Patient-specific link/tooltip label adapter; correctly feature-owned. |
| [PatientProfileFields.vue](../src/features/patients/components/PatientProfileFields.vue) | 30 | Keep | Identity verification/preferences/correction-reason section; keep domain-specific controls. |
| [PatientRecordsPanel.vue](../src/features/patients/components/PatientRecordsPanel.vue) | 421 | Keep | Schema-driven longitudinal register editor; retain reason/opening-version and type-specific semantics. |
| [PatientSidebar.vue](../src/features/patients/components/PatientSidebar.vue) | 102 | Keep | Patient completeness/family/risk summary; differs from compact visit summary sidebar. |
| [PatientSummarySidebar.vue](../src/features/patients/components/PatientSummarySidebar.vue) | 85 | Keep | Compact patient context for visit editing; retain in patient feature, preserve model identity semantics. |
| [PatientVisitsList.vue](../src/features/patients/components/PatientVisitsList.vue) | 95 | Keep | Patient-owned visit collection/actions composition; import visit-specific cards from visits after move. |
| [PatientWorkspaceHeader.vue](../src/features/patients/components/PatientWorkspaceHeader.vue) | 159 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/visits/components/PatientWorkspaceHeader.vue`. |
## src/features/patients/config

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [recordFields.js](../src/features/patients/config/recordFields.js) | 13 | Keep | Existing longitudinal record descriptors/defaults are appropriate; no new form generator needed. |
## src/features/patients/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [patientService.js](../src/features/patients/services/patientService.js) | 89 | Keep | Patient identity/register/team/document/export API boundary; keep namespace, avoid splits solely for method count. |
## src/features/patients/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [patients.js](../src/features/patients/stores/patients.js) | 200 | Keep | Normalized cache/current/highlight/export extensions sit beside factory items/current; clarify one patient data owner before future expansion. |
## src/features/patients/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [PatientDetail.vue](../src/features/patients/views/PatientDetail.vue) | 250 | Keep | Patient section-load/version/actions controller; feature-local loader/export helper extraction is optional after shared lifecycle work. |
| [PatientForm.vue](../src/features/patients/views/PatientForm.vue) | 383 | Applied S03/S07 | Breadcrumb outlet/callers are connected; form hydration and error gates are retained. Six forms supply direct saves to the existing single form mutation owner. |
| [PatientsList.vue](../src/features/patients/views/PatientsList.vue) | 450 | Applied S02 | One account-scoped visible-key contract drives the table chooser, rendering and patient export fields. |
## src/features/prescription/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [LetterSheet.vue](../src/features/prescription/components/LetterSheet.vue) | 30 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/clinical/components/LetterSheet.vue`. |
| [PrescriptionHistory.vue](../src/features/prescription/components/PrescriptionHistory.vue) | 271 | Applied S10 | Shared read/URL/download ownership; issuance and successful-form-hydration policy stay with their owners. |
| [PrescriptionPaperOptions.vue](../src/features/prescription/components/PrescriptionPaperOptions.vue) | 55 | Keep | Paper settings/alignment reference belong here; no generic geometry component needed. |
## src/features/prescription/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [prescriptionPaper.js](../src/features/prescription/services/prescriptionPaper.js) | 32 | Keep | Pure paper normalization plus per-account preferences; feature-local owner is appropriate. |
| [prescriptionPrint.js](../src/features/prescription/services/prescriptionPrint.js) | 26 | Keep | Popup/print transport helper; keep separate from issuance; optional neutral labels if reused elsewhere. |
| [prescriptionService.js](../src/features/prescription/services/prescriptionService.js) | 25 | Keep | Retained prescription/history/calibration/issuance endpoints; keep explicit. |
| [referralService.js](../src/features/prescription/services/referralService.js) | 10 | Keep | Referral issuance endpoint adapter; retain separate command contract. |
## src/features/prescription/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [PrescriptionPreview.vue](../src/features/prescription/views/PrescriptionPreview.vue) | 411 | Applied S10 | Shared read/URL/download ownership; issuance and successful-form-hydration policy stay with their owners. |
| [ReferralLetter.vue](../src/features/prescription/views/ReferralLetter.vue) | 137 | Keep | Referral narrative/reason issuance composition; keep separate from prescription preview, reuse ordinary download helper. |
## src/features/reports/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [StatisticsChart.vue](../src/features/reports/components/StatisticsChart.vue) | 153 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/components/charts/StatisticsChart.vue`. |
| [StatisticsLayout.vue](../src/features/reports/components/StatisticsLayout.vue) | 151 | Keep | Report chart/KPI/date/export composition; correct feature owner; move StatisticsChart here. |
## src/features/reports/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [statisticsService.js](../src/features/reports/services/statisticsService.js) | 21 | Keep | Reporting endpoint adapter; retain; use central envelope helper during normalization cleanup. |
## src/features/reports/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [Reconciliation.vue](../src/features/reports/views/Reconciliation.vue) | 175 | Applied S13 | One status presentation registry and theme metadata/default palette owner; transitions/dark variants retained. |
| [Statistics.vue](../src/features/reports/views/Statistics.vue) | 324 | Keep | Report projections/definitions/downloads controller; optionally extract chart definitions, use existing download helper. |
## src/features/settings/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [WorkspacePreferences.vue](../src/features/settings/components/WorkspacePreferences.vue) | 17 | Keep | Reusable account/browser display-preferences editor for settings and personal page; keep. |
## src/features/settings/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [settingsService.js](../src/features/settings/services/settingsService.js) | 31 | Keep | Clinic settings/config/theme command adapter; retain. |
| [userService.js](../src/features/settings/services/userService.js) | 22 | Keep | Account/doctor/permission service; account feature relocation optional, not required now. |
## src/features/settings/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [settings.js](../src/features/settings/stores/settings.js) | 83 | Keep | Clinic settings owner plus theme synchronization; retain clear distinction from browser workspace preferences. |
| [users.js](../src/features/settings/stores/users.js) | 142 | Keep | Account and doctor-list owner; avoid another lookup owner unless replacing this one. |
## src/features/settings/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [ChangePassword.vue](../src/features/settings/views/ChangePassword.vue) | 136 | Keep | Small account password flow; no form split needed; service/auth contracts remain authoritative. |
| [Settings.vue](../src/features/settings/views/Settings.vue) | 251 | Keep | Clinic settings plus shared personal preferences; no immediate split by section needed. |
| [UserForm.vue](../src/features/settings/views/UserForm.vue) | 241 | Applied S03/S07 | Breadcrumb outlet/callers are connected; form hydration and error gates are retained. Six forms supply direct saves to the existing single form mutation owner. |
| [UserPermissions.vue](../src/features/settings/views/UserPermissions.vue) | 145 | Keep | Permission-table/opening-version workflow; keep distinct from account profile form. |
| [UsersList.vue](../src/features/settings/views/UsersList.vue) | 153 | Keep | Account list controller; reuse route-filter adapter; preserve deactivation confirmation. |
| [WorkspaceSettings.vue](../src/features/settings/views/WorkspaceSettings.vue) | 6 | Keep | Intentionally tiny route wrapper for shared WorkspacePreferences; keep. |
## src/features/tasks/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [TaskFormInline.vue](../src/features/tasks/components/TaskFormInline.vue) | 69 | Retain S04 | No production entry path; retained because an existing test imports this module directly. |
| [TasksLayout.vue](../src/features/tasks/components/TasksLayout.vue) | 143 | Keep | Task list/add rendering; keep with TasksPage actions; no reason to maintain duplicate inline form. |
## src/features/tasks/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [taskService.js](../src/features/tasks/services/taskService.js) | 41 | Keep | Explicit task lifecycle/reorder/delete API boundary; retain. |
## src/features/tasks/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [tasks.js](../src/features/tasks/stores/tasks.js) | 90 | Applied S12 | Pure dates/browser widget and live cursor normalization have explicit owners; strict catalog handling retained. |
## src/features/tasks/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [TasksPage.vue](../src/features/tasks/views/TasksPage.vue) | 202 | Keep | Reasoned lifecycle/confirmation actions controller; keep; shared route-filter assembly can reduce repetition. |
## src/features/visits/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [ApprovedVisitReference.vue](../src/features/visits/components/ApprovedVisitReference.vue) | 99 | Applied S10 | Shared read/URL/download ownership; issuance and successful-form-hydration policy stay with their owners. |
| [ClinicalHandover.vue](../src/features/visits/components/ClinicalHandover.vue) | 78 | Applied S10 | Shared read/URL/download ownership; issuance and successful-form-hydration policy stay with their owners. |
| [DuplicateVisitButton.vue](../src/features/visits/components/DuplicateVisitButton.vue) | 30 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/components/common/DuplicateVisitButton.vue`. |
| [InstructionAcknowledgement.vue](../src/features/visits/components/InstructionAcknowledgement.vue) | 31 | Keep | Nullable explanation/recipient/timestamp input block; keep clinical feature ownership. |
| [VisitAdministrative.vue](../src/features/visits/components/VisitAdministrative.vue) | 77 | Keep | Visit documentation/supervision/acknowledgement section; keep, move disclosure policy to visit coordinator. |
| [VisitBasicInfo.vue](../src/features/visits/components/VisitBasicInfo.vue) | 117 | Keep | Visit history/date/score section; cohesive and worth keeping. |
| [VisitCard.vue](../src/features/visits/components/VisitCard.vue) | 108 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/components/common/VisitCard.vue`. |
| [VisitClinicalNotes.vue](../src/features/visits/components/VisitClinicalNotes.vue) | 73 | Keep | Examination/formulation/risk notes/scale section; keep domain section. |
| [VisitDiagnosesLabs.vue](../src/features/visits/components/VisitDiagnosesLabs.vue) | 70 | Keep | Diagnosis/lab section; use clinical rich-entry selector after MultiSelect split. |
| [VisitRecordPreview.vue](../src/features/visits/components/VisitRecordPreview.vue) | 64 | Applied S10 | Shared read/URL/download ownership; issuance and successful-form-hydration policy stay with their owners. |
| [VisitSectionNavigator.vue](../src/features/visits/components/VisitSectionNavigator.vue) | 24 | Keep | Feature-specific disclosure navigation/missing hints; retain and coordinate shared section identifiers. |
| [VisitTreatmentPlan.vue](../src/features/visits/components/VisitTreatmentPlan.vue) | 224 | Keep | Plan currently includes medications/goals/risk/follow-up/templates; optional future risk/goal subsection extraction, not required by size alone. |
| [VisitsListLayout.vue](../src/features/visits/components/VisitsListLayout.vue) | 103 | Keep | List/detail-preview presentation; correctly separate from actions/controller. |
## src/features/visits/composables

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [useVisitForm.js](../src/features/visits/composables/useVisitForm.js) | 151 | Applied S09 | Fresh defaults and pure mapping live in the visit model; lifecycle and saved scale policy stay separate. |
| [useVisitLookups.js](../src/features/visits/composables/useVisitLookups.js) | 68 | Keep | Feature-specific diagnosis/medication search adapter over catalog owner; retain. |
| [useVisitScales.js](../src/features/visits/composables/useVisitScales.js) | 164 | Keep | Saved answers/late definitions/removal/payload policy is cohesive; keep separate from catalog/picker reads. |
| [useVisitSections.js](../src/features/visits/composables/useVisitSections.js) | 13 | Added S06 | Visit-only progressive disclosure defaults. |
| [useVisitTemplates.js](../src/features/visits/composables/useVisitTemplates.js) | 75 | Keep | Template application/provenance owner; keep separate from visit mapping and catalog editor. |
## src/features/visits/model

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [visitForm.js](../src/features/visits/model/visitForm.js) | 259 | Added S09 | Fresh defaults, detached hydration/duplication, command mapping and visit draft allowlist. |
## src/features/visits/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [visitService.js](../src/features/visits/services/visitService.js) | 43 | Keep | Visit commands/transitions/attachments/handover endpoints; retain explicit API boundary. |
## src/features/visits/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [visits.js](../src/features/visits/stores/visits.js) | 31 | Keep | Working visit mutation/resource store; keep, trim unused aliases only with consumer evidence. |
## src/features/visits/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [VisitDetail.vue](../src/features/visits/views/VisitDetail.vue) | 381 | Keep | Clinical detail/sign/amend/lock composition; optional future section extraction, preserve distinction from read-only approved references. |
| [VisitForm.vue](../src/features/visits/views/VisitForm.vue) | 331 | Applied S09 | Fresh defaults and pure mapping live in the visit model; lifecycle and saved scale policy stay separate. |
| [VisitsList.vue](../src/features/visits/views/VisitsList.vue) | 163 | Keep | Visit list/action controller; route filters/download handling can share existing infrastructure. |
## src

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [main.js](../src/main.js) | 98 | Keep | App/plugin/directive/bootstrap order owner; retain, remove obsolete registered clipboard adapter only after decision. |
## src/router

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [guards.js](../src/router/guards.js) | 39 | Keep | Session/grant/forced-password guards; retain explicit server-grant checks. |
| [index.js](../src/router/index.js) | 485 | Keep | Route metadata/lazy imports/navigation cancellation; correct misplaced view imports when moving owners, no per-feature split required now. |
## src/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [apiClient.js](../src/services/apiClient.js) | 339 | Keep | Keep central CSRF/version/idempotency/session/cancellation policy; no split based on line count. |
| [apiEvents.js](../src/services/apiEvents.js) | 61 | Keep | Transport-to-app event bridge; retain separate from UI actions. |
| [baseCrudService.js](../src/services/baseCrudService.js) | 36 | Keep | Shared allowlist-aware CRUD service factory; retain. |
| [contracts.js](../src/services/contracts.js) | 29 | Keep | Wire types/command allowlists inspected; keep single command boundary, not a form generator schema. |
| [datePicker.js](../src/services/datePicker.js) | 47 | Added S12 | Flatpickr lazy loading, locale and browser widget initialization. |
| [overlayStack.js](../src/services/overlayStack.js) | 79 | Keep | Single cross-component focus/inert/body-lock owner; preserve nested-layer semantics. |
| [sessionState.js](../src/services/sessionState.js) | 38 | Keep | Principal generation/store cleanup owner; retain explicit infrastructure boundary. |
| [themeService.js](../src/services/themeService.js) | 46 | Keep | DOM theme/browser preference adapter; keep one application owner, centralize theme registry metadata. |
## src/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [confirm.js](../src/stores/confirm.js) | 62 | Keep | Sole confirmation/prompt queue owner; retain. |
| [crudStoreFactory.js](../src/stores/crudStoreFactory.js) | 158 | Applied S12 | Pure dates/browser widget and live cursor normalization have explicit owners; strict catalog handling retained. |
| [loading.js](../src/stores/loading.js) | 36 | Keep | Global write-request count/visible delay owner; keep distinct from read loading. |
| [lookupStoreFactory.js](../src/stores/lookupStoreFactory.js) | 79 | Keep S01 | Existing full-catalog/coalescing/invalidation owner now also supplies the scale picker. |
## src/stores/plugins

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [persist.js](../src/stores/plugins/persist.js) | 51 | Keep | Allowlisted browser preference persistence; keep explicit opt-in paths, no generic clinical-state persistence. |
## src/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [refresh.js](../src/stores/refresh.js) | 12 | Keep | App freshness indicator state; retain small explicit owner. |
| [selection.js](../src/stores/selection.js) | 29 | Keep | Only patient list consumes global selection; prefer page-local selection if bulk actions remain absent. |
| [ui.js](../src/stores/ui.js) | 57 | Keep | App theme/sidebar UI owner; workspace preference state already delegated, keep that separation. |
| [workspace.js](../src/stores/workspace.js) | 19 | Keep | Per-account/browser density/split/progressive preferences; retain shared UI policy, avoid clinical content persistence. |
## src/styles/components/documents

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [pdf-preview.css](../src/styles/components/documents/pdf-preview.css) | 14 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/styles/features/prescription/components/prescription-pdf-preview.css`. |
## src/styles/components/ui

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [base-modal.css](../src/styles/components/ui/base-modal.css) | 40 | Keep | External scoped styles owned by BaseModal.vue; retain scope and mirrored owner path. |
| [breadcrumb.css](../src/styles/components/ui/breadcrumb.css) | 25 | Keep | External scoped styles owned by Breadcrumb.vue; retain scope and mirrored owner path. |
| [form-field.css](../src/styles/components/ui/form-field.css) | 15 | Keep | External scoped styles owned by FormField.vue; retain scope and mirrored owner path. |
| [form-textarea.css](../src/styles/components/ui/form-textarea.css) | 4 | Keep | External scoped styles owned by FormTextarea.vue; retain scope and mirrored owner path. |
| [score-input.css](../src/styles/components/ui/score-input.css) | 25 | Keep | External scoped styles owned by ScoreInput.vue; retain scope and mirrored owner path. |
| [signature-pad.css](../src/styles/components/ui/signature-pad.css) | 26 | Keep | External scoped styles owned by SignaturePad.vue; retain scope and mirrored owner path. |
## src/styles/features/auth/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [login.css](../src/styles/features/auth/views/login.css) | 4 | Keep | External scoped styles owned by Login.vue; retain scope and mirrored owner path. |
## src/styles/features/dashboard/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [dashboard-layout.css](../src/styles/features/dashboard/components/dashboard-layout.css) | 1 | Keep | Tiny owned scoped padding rule; valid small file, no merge solely to increase module size. |
## src/styles/features/help/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [manual-view.css](../src/styles/features/help/views/manual-view.css) | 4 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/styles/features/reports/views/manual-view.css`. |
## src/styles/features/notifications/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [notification-center.css](../src/styles/features/notifications/components/notification-center.css) | 112 | Keep | External scoped styles owned by NotificationCenter.vue; retain scope and mirrored owner path. |
## src/styles/features/notifications/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [notifications.css](../src/styles/features/notifications/views/notifications.css) | 11 | Keep | External scoped styles owned by Notifications.vue; retain scope and mirrored owner path. |
## src/styles/features/patients/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [patient-identity.css](../src/styles/features/patients/components/patient-identity.css) | 11 | Keep | External scoped styles owned by PatientIdentity.vue; retain scope and mirrored owner path. |
## src/styles/features/prescription/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [prescription-history.css](../src/styles/features/prescription/components/prescription-history.css) | 3 | Keep | External scoped styles owned by PrescriptionHistory.vue; retain scope and mirrored owner path. |
| [prescription-paper-options.css](../src/styles/features/prescription/components/prescription-paper-options.css) | 5 | Keep | External scoped styles owned by PrescriptionPaperOptions.vue; retain scope and mirrored owner path. |
## src/styles/features/prescription/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [referral-letter.css](../src/styles/features/prescription/views/referral-letter.css) | 4 | Keep | External scoped styles owned by ReferralLetter.vue; retain scope and mirrored owner path. |
## src/styles/features/reports/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [statistics-layout.css](../src/styles/features/reports/components/statistics-layout.css) | 9 | Keep | Report layout scoped styles include :deep chart adjustment; retain deep selector and scope when chart owner moves. |
## src/styles/features/tasks/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [tasks-layout.css](../src/styles/features/tasks/components/tasks-layout.css) | 1 | Keep | Tiny scoped completed-task text rule; retain owned scope, not global utility merge by text equality. |
## src/utils

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [announce.js](../src/utils/announce.js) | 5 | Keep | Small live-region bridge; retain one host policy. |
| [apiErrorHandler.js](../src/utils/apiErrorHandler.js) | 99 | Keep | Transport status/error UI policy; reuse existing error messages/extraction instead of new competing handlers. |
| [asyncStore.js](../src/utils/asyncStore.js) | 25 | Retain S04 | No production entry path; retained because an existing test imports this module directly. |
| [businessRules.js](../src/utils/businessRules.js) | 81 | Keep S12 | Age forwards to pure date owner; tested risk/interval helpers retained, unused phone/ID alternatives removed. |
| [catalogFetch.js](../src/utils/catalogFetch.js) | 23 | Keep | Full-cursor traversal/repetition guard; retain and reuse for catalog-owned reads. |
| [confirmMessages.js](../src/utils/confirmMessages.js) | 15 | Keep | Active shared confirmation text; keep domain-specific consent/reasons explicit. |
| [cursorResponse.js](../src/utils/cursorResponse.js) | 40 | Added S12 | Single live cursor/list response normalizer delegating envelope extraction to unwrapResponse. |
| [date.js](../src/utils/date.js) | 157 | Added S12 | Pure established date parsing/formatting/arithmetic/normalization and year-only age operations. |
| [decimalMoney.js](../src/utils/decimalMoney.js) | 34 | Keep | Exact integer-hundredth billing arithmetic; retain separate from display formatters. |
| [download.js](../src/utils/download.js) | 13 | Applied S10 | Shared read/URL/download ownership; issuance and successful-form-hydration policy stay with their owners. |
| [errorExtractor.js](../src/utils/errorExtractor.js) | 42 | Keep | Form error-envelope extraction; retain explicit form error contract, consolidate other copies when changing them. |
| [errorMessages.js](../src/utils/errorMessages.js) | 19 | Keep | Active error-message constants; unused MSG registry should not become a competing source. |
| [fallbackText.js](../src/utils/fallbackText.js) | 15 | Keep | Small unknown/empty display vocabulary; retain clinical unknown distinction. |
| [formatters.js](../src/utils/formatters.js) | 57 | Keep | Pure number/money/identity/display functions; retain single implementations and optional composable facade. |
| [iconMap.js](../src/utils/iconMap.js) | 94 | Keep | Semantic icon aliases; retain shared presentation registry. |
| [idempotency.js](../src/utils/idempotency.js) | 8 | Keep | Logical-operation UUID generation; retain key lifecycle ownership in apiClient. |
| [index.js](../src/utils/index.js) | 11 | Keep | Active debounce implementation imported through @/utils; rename debounce.js optionally, avoid expanding barrel. |
| [listFetch.js](../src/utils/listFetch.js) | 45 | Applied S12 | Pure dates/browser widget and live cursor normalization have explicit owners; strict catalog handling retained. |
| [lruCache.js](../src/utils/lruCache.js) | 53 | Keep | Patient cache primitive; correctly generic, retain. |
| [normalize.js](../src/utils/normalize.js) | 19 | Keep S12 | fullName remains active; normalizeList is retained for its direct test consumer. |
| [optionList.js](../src/utils/optionList.js) | 20 | Applied S12 | Pure dates/browser widget and live cursor normalization have explicit owners; strict catalog handling retained. |
| [pagination.js](../src/utils/pagination.js) | 41 | Retain S04 | No production entry path; retained because an existing test imports this module directly. |
| [queryBuilder.js](../src/utils/queryBuilder.js) | 47 | Retain S04 | No production entry path; retained because an existing test imports this module directly. |
| [reportError.js](../src/utils/reportError.js) | 5 | Keep | Static operation/status logging boundary; keep privacy-preserving behavior. |
| [riskLevels.js](../src/utils/riskLevels.js) | 6 | Keep | Active clinical risk label/color/icon metadata; unify with status presentation while keeping unknown explicit. |
| [storage.js](../src/utils/storage.js) | 54 | Keep | Safe browser storage primitive; retain, feature policy must stay with owners. |
| [validationRules.js](../src/utils/validationRules.js) | 87 | Keep | Rule-object factories for useForm; keep wire/optional clinical semantics distinct from presentation. |
| [validators.js](../src/utils/validators.js) | 151 | Keep | Pure configured identity/phone/password validation; retain single active implementations. |
## src/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [ErrorPage.vue](../src/views/ErrorPage.vue) | 84 | Applied S14 | Moved to the domain owner; explicit imports and mirrored scoped styles updated. Previous path: `src/features/reports/views/ErrorPage.vue`. |

## Removed owners

**49 files removed**: 41 original dormant candidates, three superseded implementation modules, the empty spinner stylesheet and four unused global stylesheet modules. The six tested candidates above are retained. Paths below describe deleted files and intentionally are not links.

| Former file | Reason |
| --- | --- |
| `public/static/css/components/checklist.css` | All rules belonged to removed dormant widgets; no remaining class/prefix consumer found. |
| `public/static/css/components/day-grid.css` | All rules belonged to removed dormant widgets; no remaining class/prefix consumer found. |
| `public/static/css/features/clinical/care-widgets.css` | All rules belonged to removed dormant widgets; no remaining class/prefix consumer found. |
| `public/static/css/features/clinical/cbt-record.css` | All rules belonged to removed dormant widgets; no remaining class/prefix consumer found. |
| `src/components/common/LoadingScreen.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/dev/RoutePerformanceDashboard.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/AsyncSelect.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/BasePagination.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/ChecklistItem.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/DayGrid.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/DetailsGrid.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/FormGenerator.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/FormWizard.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/SectionIndicator.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/StepsCard.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/TimePicker.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/components/ui/VerticalEventList.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/composables/useError.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/composables/useFormFieldProps.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/composables/useScrollTo.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/composables/useSort.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/composables/useTimeAgo.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/directives/clipboard.js` | No directive template consumer; active clipboard composable retained. |
| `src/directives/dirty.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/appointments/components/AvailabilityGrid.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/appointments/components/MiniCalendar.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/appointments/components/QueueTable.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/backup/stores/backup.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/AuditLog.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/CBTRecord.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/Callout.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/LabResult.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/ProgressGoal.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/ScrollableTerms.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/SeverityPills.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/components/TriggerList.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/clinical/stores/scales.js` | Scale picker now uses the existing clinical catalog lookup. |
| `src/features/dashboard/components/DashboardNextAppointment.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/patients/components/BulkActionsBar.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/patients/components/ColumnVisibilityPanel.vue` | Superseded competing chooser; table uses the same controlled keys as exports. |
| `src/features/patients/components/PatientFormLayout.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/visits/components/Timeline.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/features/visits/components/VisitFormLayout.vue` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/stores/colors.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/styles/components/common/spinner.css` | Comment-only scoped stylesheet; global spinner rules retained. |
| `src/styles/components/ui/form-wizard.css` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/styles/components/ui/section-indicator.css` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/utils/cacheKeys.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |
| `src/utils/messages.js` | No app path or intended test consumer found; owned dormant implementation/style removed. |

## Verification boundary

Current source and import/style references were checked; affected existing test imports/contracts were updated with permission. Isolated production probes use synthetic memory-only data and a substituted transport boundary. No suites/build/compilation/browser/server/API or clinic storage checks ran. Prior font/JPEG review is unchanged and does not certify Arabic rendering or printing. Exact evidence and pending runtime checks are owned by [completed](doneCurrent.md) and [current](workCurrent.md).
