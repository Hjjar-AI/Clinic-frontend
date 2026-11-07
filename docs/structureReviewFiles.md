# File-by-file structure review ledger

Review snapshot: **2026-11-07**. Read with the [findings and proposed corrections](structureReview.md). The [current work list](workCurrent.md) tracks pending follow-ups; [completed evidence](doneCurrent.md) records the review limits.

Every file under `src/` and `public/` is listed once below. “Keep” means no immediate structural change is justified, not runtime or defect-free certification. “Review Sxx” points to a concrete proposed change. “Remove candidate S04” means no path from the app entry was found, including configured component auto-imports; it is not a claim about uninspected test/external consumers. “Generated” files stay generator-owned. Binary assets received metadata/reference review; the JPEG was also visually inspected.

Coverage: **457/457 files** — 210 Vue, 141 JavaScript, 100 CSS, two generated declarations, three fonts and one JPEG. **32 Vue + 13 JavaScript removal candidates**, with two associated dormant scoped stylesheets. A separate comment-only spinner stylesheet can be removed. No application code changed.

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
| [cards.css](../public/static/css/components/cards.css) | 119 | Keep | Shared card/panel/KPI shell styling; retain, clarify header ownership rather than adding more wrappers. |
| [charts.css](../public/static/css/components/charts.css) | 51 | Keep | Shared chart card/container presentation; retain with report renderer move, remove dormant mini-chart rules if deleted. |
| [checklist.css](../public/static/css/components/checklist.css) | 57 | Keep | Owned by dormant ChecklistItem; remove with widget after selector check. |
| [collapsible-section.css](../public/static/css/components/collapsible-section.css) | 65 | Keep | Shared disclosure presentation; keep while feature policy moves out of component logic. |
| [content-navigation.css](../public/static/css/components/content-navigation.css) | 75 | Keep | Small list/divider/back/scroll/pagination module; prune unused numbered-pagination rules after candidate removal. |
| [danger-zone.css](../public/static/css/components/danger-zone.css) | 38 | Keep | Destructive recovery presentation; retain component-owned module. |
| [day-grid.css](../public/static/css/components/day-grid.css) | 48 | Keep | Owned by dormant DayGrid widget; remove with widget after selector check. |
| [detail-item.css](../public/static/css/components/detail-item.css) | 36 | Keep | Active detail-item rules plus dormant details-grid family; keep active family and prune unused one. |
| [dropdown-menu.css](../public/static/css/components/dropdown-menu.css) | 11 | Keep | Small owned trigger module for dormant DropdownMenu; tiny size alone is not a merge reason. |
| [filters.css](../public/static/css/components/filters.css) | 47 | Keep | Shared filter-bar layout/variant behavior; retain. |
| [key-value-list.css](../public/static/css/components/key-value-list.css) | 46 | Keep | Active line/grid detail presentation; retain rather than merge scoped/other selector families. |
| [modal.css](../public/static/css/components/modal.css) | 90 | Keep | Global modal/shared variant rules; preserve cascade with scoped BaseModal CSS. |
| [navigation.css](../public/static/css/components/navigation.css) | 175 | Keep | Navigation visuals/RTL/mobile topbar rules; retain separate from shell geometry. |
| [notifications.css](../public/static/css/components/notifications.css) | 141 | Keep | Toast/alert/empty-state global presentation; cohesive feedback group, no new split required solely for count. |
| [overlay.css](../public/static/css/components/overlay.css) | 83 | Keep | App loading/privacy/error/route overlay visuals; retain explicit global ownership. |
| [presentation-widgets.css](../public/static/css/components/presentation-widgets.css) | 141 | Keep | Mixed theme/vertical-event/terms/alert-bar families; prune dormant families, leave active owners explicit. |
| [progress.css](../public/static/css/components/progress.css) | 53 | Keep | Shared progress bar presentation used by file upload; retain. |
| [record-controls.css](../public/static/css/components/record-controls.css) | 69 | Keep | Shared relative-date/signature plus scratchpad/indicator families; prune/move with actual component ownership. |
| [steps.css](../public/static/css/components/steps.css) | 109 | Keep | Active StepIndicator plus dormant StepsCard; prune static-card family if deleted. |
| [tables.css](../public/static/css/components/tables.css) | 131 | Review S15 | Shared table/select/sort/mobile/scroll styling; own table-column controls here after workspace cleanup. |
| [tabs.css](../public/static/css/components/tabs.css) | 48 | Keep | Shared tablist/panel presentation; retain. |
| [tags.css](../public/static/css/components/tags.css) | 38 | Keep | Shared Badge/tag presentation; domain metadata belongs in JS registry, not new CSS components. |
| [tooltips-loading.css](../public/static/css/components/tooltips-loading.css) | 65 | Keep | Shared floating-tooltip/spinner styles; keep global rules distinct from comment-only scoped spinner import. |

## public/static/css/documents

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [pdf.css](../public/static/css/documents/pdf.css) | 122 | Keep | Browser print stylesheet, separate from retained server PDFs; preserve print resets/RTL/fonts and verify rendered output separately. |

## public/static/css/features/appointments

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [day.css](../public/static/css/features/appointments/day.css) | 87 | Keep | Day-grid/time-indicator styling; retain renderer ownership. |
| [month.css](../public/static/css/features/appointments/month.css) | 114 | Keep | Monthly grid/dots/responsiveness; retain separately from day/week. |
| [shared.css](../public/static/css/features/appointments/shared.css) | 208 | Keep | Shared booking/slot/skeleton plus dormant queue/availability families; prune dormant sections before considering splits. |
| [week.css](../public/static/css/features/appointments/week.css) | 31 | Keep | Week/day-card and today/weekend presentation; small coherent owner, retain. |

## public/static/css/features/clinical

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [care-widgets.css](../public/static/css/features/clinical/care-widgets.css) | 109 | Keep | Trigger/severity/audit/goal families correspond to dormant widgets; check remaining generic selectors before retiring module. |
| [cbt-record.css](../public/static/css/features/clinical/cbt-record.css) | 55 | Keep | Dormant CBTRecord owner; removal candidate with component after selector checks. |
| [letter-sheet.css](../public/static/css/features/clinical/letter-sheet.css) | 37 | Review S14 | Referral letter shell styles; move under prescription CSS feature ownership with LetterSheet. |
| [medications.css](../public/static/css/features/clinical/medications.css) | 107 | Review S15 | Active medication variants; own medication-directions rules currently in workspace.css. |
| [substances-labs.css](../public/static/css/features/clinical/substances-labs.css) | 81 | Keep | Active controlled-card plus dormant LabResult rules; prune latter, keep controlled-medication presentation. |

## public/static/css/features

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [patients.css](../public/static/css/features/patients.css) | 100 | Keep | Patient profile/sidebar/link/register styles; prune dormant bulk-action family, retain patient-owned geometry. |
| [visits.css](../public/static/css/features/visits.css) | 133 | Keep | Visit layout/cards and dormant timeline styles; retain active owner, prune timeline after removal. |
| [workspace.css](../public/static/css/features/workspace.css) | 56 | Review S15 | Move generic form/table/medication rules to existing owner modules; keep visit/workspace panel geometry together. |

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
| [feedback-actions.css](../public/static/css/forms/feedback-actions.css) | 24 | Review S15 | Shared error/action styles; consolidate late .form-actions overrides from workspace.css with cascade preserved. |
| [input-widgets.css](../public/static/css/forms/input-widgets.css) | 92 | Keep | Segmented/password/upload presentation; active small owned groups, no immediate count-driven split. |
| [multi-select.css](../public/static/css/forms/multi-select.css) | 112 | Review S05 | Split rich clinical entry styling with S05 while preserving scalar multiselect styles/visibility behavior. |
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
| [default.css](../public/static/css/themes/default.css) | 226 | Review S13 | Base block duplicates all 184 default token declarations; consolidate canonical palette while preserving selector/dark behavior. |
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
| [colors.css](../public/static/css/tokens/colors.css) | 235 | Review S13 | Canonical default semantic/palette declarations; eliminate duplicated default base block carefully under S13. |
| [components.css](../public/static/css/tokens/components.css) | 64 | Keep | Shared elevation/feedback/interaction tokens; retain cohesive semantic layer. |
| [motion.css](../public/static/css/tokens/motion.css) | 64 | Keep | Shared motion durations/keyframe and reduced-motion tokens; keep separate from transition-class rules. |
| [spacing.css](../public/static/css/tokens/spacing.css) | 102 | Keep | Shared scale/layout/radius/z-index tokens; no split needed solely by number of token families. |
| [typography.css](../public/static/css/tokens/typography.css) | 84 | Keep | Type/icon/control-size semantic tokens; retain. |

## public/static/css/utilities

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [general.css](../public/static/css/utilities/general.css) | 100 | Review S15 | Contains context-menu/banner/feature/signature rules beyond utilities; move to owners while preserving cascade. |
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
| [auto-imports.d.ts](../src/auto-imports.d.ts) | 92 | Generated | Generated Vue/Router/Pinia symbol declarations inspected; keep generator-owned, do not hand-edit. |

## src/bootstrap

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [index.js](../src/bootstrap/index.js) | 15 | Keep | Small early theme bootstrap; retain to preserve initial appearance/order. |
| [registerApiHandlers.js](../src/bootstrap/registerApiHandlers.js) | 77 | Keep | App reactions to transport events/session/conflicts; keep out of generic domain services. |

## src

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [components.d.ts](../src/components.d.ts) | 105 | Generated | Generated component discovery declarations inspected; declarations alone are not runtime usage. |

## src/components/charts

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [MiniBarChart.vue](../src/components/charts/MiniBarChart.vue) | 63 | Remove candidate S04 | Dormant miniature chart; remove before extracting more shared chart components. |
| [StatisticsChart.vue](../src/components/charts/StatisticsChart.vue) | 124 | Review S14 | Report-specific chartDef/stats/month props; move to reports, retain useChart shared. |

## src/components/common

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AppStatusBar.vue](../src/components/common/AppStatusBar.vue) | 85 | Keep | App connectivity/live announcement host; cohesive app-level component. |
| [CriticalOverlay.vue](../src/components/common/CriticalOverlay.vue) | 87 | Keep | Privacy/timeout presentation uses shared top-layer focus ownership; retain. |
| [DuplicateVisitButton.vue](../src/components/common/DuplicateVisitButton.vue) | 30 | Review S14 | Visit route command in shared common folder; move to visits feature. |
| [ErrorBoundary.vue](../src/components/common/ErrorBoundary.vue) | 91 | Keep | App error-capture/recovery host; retain shared app ownership. |
| [FileUpload.vue](../src/components/common/FileUpload.vue) | 144 | Keep | One import consumer selects files without auto upload; consider narrowing unused transport mode after consumer checks. |
| [LoadingScreen.vue](../src/components/common/LoadingScreen.vue) | 16 | Remove candidate S04 | Unused Vue login skeleton duplicates early index.html markup; keep early skeleton CSS instead. |
| [MaintenanceBanner.vue](../src/components/common/MaintenanceBanner.vue) | 25 | Keep | App maintenance read/display adapter; retain app-level ownership. |
| [RouteProgressBar.vue](../src/components/common/RouteProgressBar.vue) | 58 | Keep | Route-hook progress lifecycle; retain separate from write request loading. |
| [ScrollToTop.vue](../src/components/common/ScrollToTop.vue) | 24 | Keep | Small app navigation affordance; no need to revive unused useScrollTo just for this. |
| [SearchInput.vue](../src/components/common/SearchInput.vue) | 239 | Keep | Shared object-select combobox with stale-read/floating/keyboard handling; retain as search primitive. |
| [ShortcutsModal.vue](../src/components/common/ShortcutsModal.vue) | 35 | Keep | App shortcut help; optional future metadata sharing with App shortcuts, not a new UI framework. |
| [SkeletonLoader.vue](../src/components/common/SkeletonLoader.vue) | 134 | Keep | Shared shape renderer; do not merge with inline early HTML skeleton or calendar-specific wrapper. |
| [Spinner.vue](../src/components/common/Spinner.vue) | 18 | Keep | Keep component; remove comment-only external scoped stylesheet/import. |
| [VisitCard.vue](../src/components/common/VisitCard.vue) | 101 | Review S14 | Visit model/status presentation belongs in visits feature. |

## src/components/dev

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [RoutePerformanceDashboard.vue](../src/components/dev/RoutePerformanceDashboard.vue) | 85 | Remove candidate S04 | Dormant developer panel, not mounted by production entry; remove or intentionally integrate later. |

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
| [AsyncSelect.vue](../src/components/ui/AsyncSelect.vue) | 143 | Remove candidate S04 | Dormant dropdown/search wrapper overlaps ApiSelect and SearchInput; prefer deleting over merging modes. |
| [Avatar.vue](../src/components/ui/Avatar.vue) | 49 | Keep | Shared initials/icon/avatar presentation; no new component boundary needed. |
| [BackLink.vue](../src/components/ui/BackLink.vue) | 30 | Keep | Small navigation adapter used by FormWrapper; retain stable interface. |
| [Badge.vue](../src/components/ui/Badge.vue) | 227 | Review S13 | Presentation primitive embeds three domain-status maps; extract shared metadata rather than split visual rendering. |
| [BadgeCell.vue](../src/components/ui/BadgeCell.vue) | 21 | Keep | Small table badge adapter; keep unless its sole consumer is simplified during catalog editing. |
| [BaseButton.vue](../src/components/ui/BaseButton.vue) | 96 | Keep | Shared button/link/loading/confirmation adapter; preserve one confirmation owner and navigation behavior. |
| [BaseCard.vue](../src/components/ui/BaseCard.vue) | 69 | Keep | Shared card/loading/empty/slot shell; retain cohesive primitive. |
| [BaseModal.vue](../src/components/ui/BaseModal.vue) | 154 | Keep | Modal shell using shared overlay stack; retain validation/focus/loading contract together. |
| [BasePagination.vue](../src/components/ui/BasePagination.vue) | 57 | Remove candidate S04 | Dormant numbered-page controls; live lists use cursor load-more. |
| [BaseToast.vue](../src/components/ui/BaseToast.vue) | 75 | Keep | Toast rendering/actions/progress owner; keep separate from queue lifecycle. |
| [Breadcrumb.vue](../src/components/ui/Breadcrumb.vue) | 51 | Keep | Shared explicit/route-derived breadcrumbs; retain. |
| [CardHeader.vue](../src/components/ui/CardHeader.vue) | 36 | Keep | Meaningful card-specific adapter over SectionHeader; no further merge required. |
| [ChartCard.vue](../src/components/ui/ChartCard.vue) | 47 | Keep | Shared chart/empty-state shell; chart lifecycle stays in useChart. |
| [ChecklistItem.vue](../src/components/ui/ChecklistItem.vue) | 43 | Remove candidate S04 | Dormant checklist presentation; no active checklist workflow consumes it. |
| [CollapsibleSection.vue](../src/components/ui/CollapsibleSection.vue) | 72 | Review S06 | Shared disclosure contains visit-key/progressive workspace policy; move that policy to visits. |
| [ConfirmCheckbox.vue](../src/components/ui/ConfirmCheckbox.vue) | 31 | Keep | Explicit destructive-consent control; keep separate from ordinary checkbox intent. |
| [ConfirmDialog.vue](../src/components/ui/ConfirmDialog.vue) | 100 | Keep | Queued confirmation/prompt renderer; keep checkbox/reason semantics and store ownership. |
| [DangerZone.vue](../src/components/ui/DangerZone.vue) | 27 | Keep | Destructive-operation presentation shell for recovery; retain. |
| [DataTable.vue](../src/components/ui/DataTable.vue) | 246 | Review S02 | Table selection/rendering/scrolling is cohesive; consolidate column state with patient parent instead of another chooser. |
| [DateCell.vue](../src/components/ui/DateCell.vue) | 28 | Keep | Shared strict parsed date presentation; retain absolute/relative distinction. |
| [DatePicker.vue](../src/components/ui/DatePicker.vue) | 133 | Keep | Date widget wrapper owns DOM lifecycle; move loader out of pure date utilities, retain wrapper. |
| [DateRangePicker.vue](../src/components/ui/DateRangePicker.vue) | 161 | Keep | Range-specific validation/two-picker lifecycle; keep distinct from single-date control. |
| [DayGrid.vue](../src/components/ui/DayGrid.vue) | 40 | Remove candidate S04 | Dormant adherence/day marker widget; unrelated to appointment calendar renderers. |
| [DetailItem.vue](../src/components/ui/DetailItem.vue) | 20 | Keep | Active labelled detail primitive; retain without forcing array-based renderers. |
| [DetailsGrid.vue](../src/components/ui/DetailsGrid.vue) | 39 | Remove candidate S04 | Dormant array-based detail renderer repeats KeyValueList formatting; remove before attempting a merge. |
| [DropdownMenu.vue](../src/components/ui/DropdownMenu.vue) | 89 | Remove candidate S04 | Dormant action-menu renderer; useDropdown itself is active in notifications and should remain. |
| [DynamicRowList.vue](../src/components/ui/DynamicRowList.vue) | 104 | Keep | Active configurable lab row editor; retain field-driven rows rather than new component per input. |
| [EditableNotes.vue](../src/components/ui/EditableNotes.vue) | 36 | Review S14 | One dashboard scratchpad consumer; move/rename to SessionScratchpad with session-only policy. |
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
| [FormGenerator.vue](../src/components/ui/FormGenerator.vue) | 112 | Remove candidate S04 | Dormant schema-generated form; remove instead of expanding a second form framework. |
| [FormInput.vue](../src/components/ui/FormInput.vue) | 67 | Keep | Ordinary native input adapter with logical direction and constraints; keep. |
| [FormSelect.vue](../src/components/ui/FormSelect.vue) | 61 | Keep | Ordinary native option-list adapter; keep distinct from remote/search selection. |
| [FormTextarea.vue](../src/components/ui/FormTextarea.vue) | 82 | Keep | Text-area/counter/resize control; retain scoped counter ownership. |
| [FormWizard.vue](../src/components/ui/FormWizard.vue) | 67 | Remove candidate S04 | Dormant wizard orchestration; active import uses explicit step/token workflows. |
| [FormWrapper.vue](../src/components/ui/FormWrapper.vue) | 75 | Review S03 | Keep hydration/error/form shell; expose an actual outlet for five callers’ breadcrumb slot. |
| [Icon.vue](../src/components/ui/Icon.vue) | 29 | Keep | Shared semantic icon adapter; retain central alias registry. |
| [KeyValueList.vue](../src/components/ui/KeyValueList.vue) | 39 | Keep | Active lines/grid detail presentation; keep; dormant DetailsGrid need not become another abstraction. |
| [KpiGrid.vue](../src/components/ui/KpiGrid.vue) | 26 | Keep | Repeated KPI layout/StatCard adapter; retain. |
| [ListView.vue](../src/components/ui/ListView.vue) | 203 | Keep | Keep cursor/filter orchestration separate from table renderer; route-filter/preference ownership can be simplified. |
| [LoadingOverlay.vue](../src/components/ui/LoadingOverlay.vue) | 22 | Keep | App-level write-loading presentation; keep distinct from modal/field/read feedback. |
| [MultiSelect.vue](../src/components/ui/MultiSelect.vue) | 303 | Review S05 | Split scalar ID selection from rich clinical custom-entry selection; clinical field creation is misplaced here. |
| [PageHeader.vue](../src/components/ui/PageHeader.vue) | 22 | Keep | Page-specific adapter over SectionHeader; keep. |
| [PasswordStrengthMeter.vue](../src/components/ui/PasswordStrengthMeter.vue) | 37 | Keep | Shared password strength display; pure strength policy remains in validators. |
| [Progress.vue](../src/components/ui/Progress.vue) | 65 | Keep | Shared progress display used by upload; no new progress component needed. |
| [RelativeDate.vue](../src/components/ui/RelativeDate.vue) | 66 | Keep | Relative display/timer owner; keep separate from pure date calculations. |
| [ResourceFeedback.vue](../src/components/ui/ResourceFeedback.vue) | 26 | Keep | Loading/error/read-retry presentation; keep distinct from mutation retry policy. |
| [ResponsiveDetailPanel.vue](../src/components/ui/ResponsiveDetailPanel.vue) | 18 | Keep | Inline/mobile-modal adapter; retain; can reuse useViewport boundary rather than another resize convention. |
| [ScoreInput.vue](../src/components/ui/ScoreInput.vue) | 87 | Keep | Nullable clinical score input; preserve unknown/zero distinction rather than merging with ordinary numbers. |
| [SectionHeader.vue](../src/components/ui/SectionHeader.vue) | 59 | Keep | Existing shared renderer behind page/card adapters; already consolidated. |
| [SectionIndicator.vue](../src/components/ui/SectionIndicator.vue) | 24 | Remove candidate S04 | Dormant completeness marker; its isolated scoped stylesheet is also dormant. |
| [SegmentedControl.vue](../src/components/ui/SegmentedControl.vue) | 39 | Keep | Shared radio-option primitive; retain clinical caller labels/values. |
| [SignaturePad.vue](../src/components/ui/SignaturePad.vue) | 201 | Keep | Stroke capture and PNG serialization are one cohesive control; preserve change invalidation. |
| [StatCard.vue](../src/components/ui/StatCard.vue) | 161 | Keep | KPI value animation/sparkline presentation; no size-based split needed. |
| [StatusCell.vue](../src/components/ui/StatusCell.vue) | 20 | Keep | Useful table adapter to domain-aware Badge; retain. |
| [StepIndicator.vue](../src/components/ui/StepIndicator.vue) | 32 | Keep | Active import progress indicator; not equivalent to dormant FormWizard/StepsCard. |
| [StepsCard.vue](../src/components/ui/StepsCard.vue) | 44 | Remove candidate S04 | Dormant static instructions widget; no active consumer. |
| [TableActions.vue](../src/components/ui/TableActions.vue) | 70 | Keep | Shared row actions/confirmation affordance; retain displayed-version command ownership in callers. |
| [ThemeSwitcher.vue](../src/components/ui/ThemeSwitcher.vue) | 50 | Review S13 | Use central theme id/label registry instead of duplicating supported themes. |
| [TimePicker.vue](../src/components/ui/TimePicker.vue) | 74 | Remove candidate S04 | Dormant local clock option control; avoid merging into availability-aware TimeSlotPicker. |
| [Tooltip.vue](../src/components/ui/Tooltip.vue) | 38 | Keep | Floating accessible description wrapper; positioning already delegated to useFloatingPosition. |
| [VerticalEventList.vue](../src/components/ui/VerticalEventList.vue) | 41 | Remove candidate S04 | Referenced only by dormant AuditLog/Timeline; candidate for removal with that subtree. Source references come only from dormant files. |

## src/composables

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [toastConfig.js](../src/composables/toastConfig.js) | 13 | Keep | Toast constants; inline or move with toast owner if queue is reorganized; no new shared composable needed. |
| [useApi.js](../src/composables/useApi.js) | 136 | Review S07 | Shared imperative API wrapper; six form consumers nest it in another mutation owner; unused query mode can be simplified separately. |
| [useAppTheme.js](../src/composables/useAppTheme.js) | 10 | Keep | UI-store theme adapter; retain one DOM application service. |
| [useAutoCleanup.js](../src/composables/useAutoCleanup.js) | 22 | Keep | Small mounted listener/timer cleanup collection; retain rather than inventing another lifecycle framework. |
| [useBreadcrumbs.js](../src/composables/useBreadcrumbs.js) | 15 | Keep | Reactive router breadcrumb derivation; keep. |
| [useCan.js](../src/composables/useCan.js) | 12 | Keep | Auth-grant adapter; small but used by route guards, no new permission state owner needed. |
| [useChart.js](../src/composables/useChart.js) | 113 | Keep | Reusable chart import/instance/presentation lifecycle; keep shared while report renderer moves. |
| [useConfirmDialog.js](../src/composables/useConfirmDialog.js) | 40 | Keep | Confirmation/prompt convenience adapter; keep store as sole queue owner. |
| [useCopy.js](../src/composables/useCopy.js) | 38 | Review S12 | Active clipboard adapter; share pure fallback if unused registered directive is retained. |
| [useDate.js](../src/composables/useDate.js) | 182 | Review S12 | Separate pure date calculations from Flatpickr module/DOM initialization; preserve parsing semantics. |
| [useDropdown.js](../src/composables/useDropdown.js) | 61 | Keep | Active notification dropdown focus/outside/keyboard owner; retain despite dormant DropdownMenu. |
| [useError.js](../src/composables/useError.js) | 19 | Remove candidate S04 | No app consumer; redundant global error/notification helper candidate for removal. |
| [useFloatingPosition.js](../src/composables/useFloatingPosition.js) | 87 | Keep | Reusable fixed viewport geometry/observers; keep runtime measurements here. |
| [useForm.js](../src/composables/useForm.js) | 251 | Keep | Validation/baseline/dirty state owner; keep separate from submission and route-leave guard. |
| [useFormDirty.js](../src/composables/useFormDirty.js) | 52 | Keep | Unsaved-navigation guard over caller’s dirty ref; retain one dirty source. |
| [useFormDraft.js](../src/composables/useFormDraft.js) | 80 | Review S09 | Generic in-memory draft lifecycle; move visit-only SAFE_DRAFT_FIELDS out to visit feature. |
| [useFormFieldProps.js](../src/composables/useFormFieldProps.js) | 26 | Remove candidate S04 | Unused prop-definition factory and field-id helper; remove instead of replacing existing useId patterns. |
| [useFormSubmission.js](../src/composables/useFormSubmission.js) | 60 | Review S07 | Retain validation/submit error/pending owner; accept service function directly instead of nested useApi mutation. |
| [useFormatters.js](../src/composables/useFormatters.js) | 20 | Keep | Existing pure-function facade; direct utility imports are fine for new code, mass replacement is low value. |
| [useMaintenanceMode.js](../src/composables/useMaintenanceMode.js) | 18 | Keep | Shared app maintenance read state; no domain split required. |
| [useNavigationItems.js](../src/composables/useNavigationItems.js) | 71 | Keep | App navigation/grant/badge orchestration shared by desktop/mobile; keep single menu source. |
| [useNotify.js](../src/composables/useNotify.js) | 14 | Keep | Toast notification adapter; keep one announcement policy with toast host. |
| [useOverlay.js](../src/composables/useOverlay.js) | 14 | Keep | Vue adapter over overlayStack; retain distinct from floating dropdown behavior. |
| [usePageStatus.js](../src/composables/usePageStatus.js) | 12 | Keep | Small page-status adapter; do not substitute it for successful form hydration state. |
| [usePagination.js](../src/composables/usePagination.js) | 288 | Review S12 | Live consumer uses cursor mode; share response normalization; do not add more page/array abstractions without consumers. |
| [useResourceLoad.js](../src/composables/useResourceLoad.js) | 24 | Review S10 | Explicit form hydration/save gate; keep public semantics while sharing internal read lifecycle if useful. |
| [useRouteQuery.js](../src/composables/useRouteQuery.js) | 37 | Review S11 | Coalesced URL query primitive; compose multi-filter adapter around it instead of copying its queue. |
| [useScrollTo.js](../src/composables/useScrollTo.js) | 25 | Remove candidate S04 | Unused scrolling convenience wrapper; removal candidate. |
| [useSearch.js](../src/composables/useSearch.js) | 78 | Keep | Active debounced stale-read search lifecycle; reuse in clinical selector extraction where suitable. |
| [useSession.js](../src/composables/useSession.js) | 144 | Keep | App privacy/timeout lifecycle; keep separate from drafts; stale draft-related JSDoc should follow actual useFormDraft ownership. |
| [useShortcut.js](../src/composables/useShortcut.js) | 15 | Keep | Reusable keyboard shortcut lifecycle; retain app-specific commands at app boundary. |
| [useSort.js](../src/composables/useSort.js) | 43 | Remove candidate S04 | Unused client/server sort helper; live lists already own server sort/filter state. |
| [useSystemConfig.js](../src/composables/useSystemConfig.js) | 46 | Keep | Shared startup/config loading owner; optional explicit service adapter, no second config store needed. |
| [useTimeAgo.js](../src/composables/useTimeAgo.js) | 11 | Remove candidate S04 | Unused pure forwarding wrapper; remove; RelativeDate/useDate already own live behavior. |
| [useToast.js](../src/composables/useToast.js) | 53 | Keep | Shared in-memory toast queue/timeouts; retain separate from rendering. |
| [useUnreadCount.js](../src/composables/useUnreadCount.js) | 8 | Review S14 | Only notification center consumes it; move into notification feature or use store refs directly. |
| [useValidator.js](../src/composables/useValidator.js) | 28 | Keep | Configured identity/phone validation adapter; retain pure validators as single implementations. |
| [useViewport.js](../src/composables/useViewport.js) | 17 | Keep | Shared inclusive 768px reactive boundary; reuse where components duplicate boundary listeners. |

## src/config

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [app.js](../src/config/app.js) | 25 | Keep | App startup flags/preferences/version facade; trim inactive options only with consumer evidence, no new config layer. |

## src/constants

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [statusConstants.js](../src/constants/statusConstants.js) | 127 | Review S13 | Keep wire choices/transitions explicit; consolidate repeated display metadata separately. |
| [storageKeys.js](../src/constants/storageKeys.js) | 9 | Keep | Shared storage-key registry; feature-owned account keys can remain local with explicit policy. |
| [theme.js](../src/constants/theme.js) | 14 | Review S13 | Central supported-theme metadata should also own labels currently copied by ThemeSwitcher. |

## src/directives

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [autoTitle.js](../src/directives/autoTitle.js) | 17 | Keep | Active overflow-title directive registered in main; retain. |
| [autofocus.js](../src/directives/autofocus.js) | 6 | Keep | Mounted form focus adapter; retain registration where used. |
| [clipboard.js](../src/directives/clipboard.js) | 53 | Review S12 | Registered but no v-clipboard templates found; remove if obsolete, otherwise share fallback with useCopy. |
| [debounce.js](../src/directives/debounce.js) | 26 | Keep | Registered but no v-debounce templates found; optional removal after intended-consumer check, keep active utils debounce. |
| [dirty.js](../src/directives/dirty.js) | 16 | Remove candidate S04 | Unregistered unused directive; do not reintroduce competing dirty-state tracking. |

## src/features/appointments/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AppointmentBlock.vue](../src/features/appointments/components/AppointmentBlock.vue) | 50 | Keep | Booking presentation/drag payload; retain feature owner. |
| [AvailabilityGrid.vue](../src/features/appointments/components/AvailabilityGrid.vue) | 59 | Remove candidate S04 | Dormant multi-doctor availability grid; do not grow a new booking abstraction around it. |
| [CalendarLayout.vue](../src/features/appointments/components/CalendarLayout.vue) | 141 | Keep | Calendar page composition/toolbar; keep feature-specific shell. |
| [CalendarLegend.vue](../src/features/appointments/components/CalendarLegend.vue) | 23 | Keep | Shared calendar legend presentation; central status metadata can supply labels later. |
| [CalendarSkeleton.vue](../src/features/appointments/components/CalendarSkeleton.vue) | 31 | Keep | Calendar-specific skeleton composition reuses shared shapes; retain. |
| [CalendarView.vue](../src/features/appointments/components/CalendarView.vue) | 48 | Keep | Small day/week/month dispatcher with explicit event forwarding; retain. |
| [DayViewGrid.vue](../src/features/appointments/components/DayViewGrid.vue) | 161 | Keep | Day slots, overlap display, current-time geometry; keep separate renderer. |
| [MiniCalendar.vue](../src/features/appointments/components/MiniCalendar.vue) | 71 | Remove candidate S04 | Dormant alternate monthly overview; remove before merging with active month renderer. |
| [MonthViewGrid.vue](../src/features/appointments/components/MonthViewGrid.vue) | 193 | Keep | Monthly cell/adjacent-month booking renderer; retain separate from day/week. |
| [QueueTable.vue](../src/features/appointments/components/QueueTable.vue) | 50 | Remove candidate S04 | Dormant queue workflow table; no active queue feature to justify keeping its own abstraction. |
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
| [AppointmentForm.vue](../src/features/appointments/views/AppointmentForm.vue) | 376 | Review S03/S07 | Keep availability/date/draft context; remove nested mutation and use rendered breadcrumb outlet. |
| [AppointmentsCalendar.vue](../src/features/appointments/views/AppointmentsCalendar.vue) | 195 | Keep | Keep navigation/filter controller; merge identical day/week drop handlers locally, retain renderer split. |

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

## src/features/backup/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [backup.js](../src/features/backup/stores/backup.js) | 65 | Remove candidate S04 | No app consumer; duplicates direct service workflow in BackupView and has a divergent restore signature. |

## src/features/backup/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [BackupView.vue](../src/features/backup/views/BackupView.vue) | 70 | Keep | Active backup/restore controller; keep token/options binding, reuse ordinary download helper. |

## src/features/billing/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [invoiceService.js](../src/features/billing/services/invoiceService.js) | 17 | Keep | Invoice command/transition/PDF boundary; retain. |

## src/features/billing/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [InvoiceForm.vue](../src/features/billing/views/InvoiceForm.vue) | 283 | Review S03/S07 | Keep line/decimal calculation policy; remove nested mutation and render breadcrumb slot; line editor split optional as workflow grows. |
| [InvoicesList.vue](../src/features/billing/views/InvoicesList.vue) | 263 | Keep | Cohesive invoice list/transition page; use route-filter adapter and existing download helper. |

## src/features/clinical/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AuditLog.vue](../src/features/clinical/components/AuditLog.vue) | 36 | Remove candidate S04 | Dormant audit table adapter; only indirect consumer of dormant VerticalEventList. |
| [CBTRecord.vue](../src/features/clinical/components/CBTRecord.vue) | 29 | Remove candidate S04 | Dormant CBT display scaffold; no active production composition consumes it. |
| [Callout.vue](../src/features/clinical/components/Callout.vue) | 27 | Remove candidate S04 | Dormant alternative feedback shell; active AlertBar covers current consumers. |
| [ClinicalTextArea.vue](../src/features/clinical/components/ClinicalTextArea.vue) | 36 | Keep | Established clinical textarea adapter; thin but not an urgent merge target. |
| [ControlledSubstanceCard.vue](../src/features/clinical/components/ControlledSubstanceCard.vue) | 39 | Keep | Active prescription controlled-medication notice; keep clinical semantics. |
| [DiagnosisList.vue](../src/features/clinical/components/DiagnosisList.vue) | 22 | Keep | Shared clinical diagnosis display used across feature boundaries; keep. |
| [LabResult.vue](../src/features/clinical/components/LabResult.vue) | 46 | Remove candidate S04 | Dormant alternative lab display; current visit detail uses its own richer lab contract. |
| [LetterSheet.vue](../src/features/clinical/components/LetterSheet.vue) | 30 | Review S14 | Only referral document consumes it; move to prescription/document feature ownership. |
| [MedicationList.vue](../src/features/clinical/components/MedicationList.vue) | 117 | Keep | Active schedule/prescription/pill presentation variants share one medication model; no immediate split needed. |
| [ProgressGoal.vue](../src/features/clinical/components/ProgressGoal.vue) | 24 | Remove candidate S04 | Dormant alternative goal progress display; no active consumer. |
| [RiskLevelBadge.vue](../src/features/clinical/components/RiskLevelBadge.vue) | 18 | Keep | Small clinical unknown/risk adapter over Badge; keep. |
| [ScalePickerModal.vue](../src/features/clinical/components/ScalePickerModal.vue) | 52 | Review S01 | Reads nonexistent scaleStore.scales; consolidate onto existing full-catalog lookup and expose error/retry. |
| [ScaleRenderer.vue](../src/features/clinical/components/ScaleRenderer.vue) | 77 | Keep | Editable scale fields/nullable slider rendering; retain separate from approved-history rendering. |
| [ScrollableTerms.vue](../src/features/clinical/components/ScrollableTerms.vue) | 8 | Remove candidate S04 | Dormant single-wrapper terms widget; help pages do not consume it. |
| [SeverityPills.vue](../src/features/clinical/components/SeverityPills.vue) | 41 | Remove candidate S04 | Dormant numeric choice widget; no reason to merge active SegmentedControl into it. |
| [TriggerList.vue](../src/features/clinical/components/TriggerList.vue) | 33 | Remove candidate S04 | Dormant trigger display scaffold; removal candidate. |

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
| [scales.js](../src/features/clinical/stores/scales.js) | 25 | Review S01 | Second scale owner exposes items while picker reads scales; consolidate onto shared clinical catalog owner. |

## src/features/clinical/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [DiagnosesManage.vue](../src/features/clinical/views/DiagnosesManage.vue) | 296 | Review S11 | Extract repeated catalog modal/save/version/refresh controller; keep diagnosis fields explicit. |
| [MedicationsManage.vue](../src/features/clinical/views/MedicationsManage.vue) | 329 | Review S11 | Same catalog controller extraction as diagnoses; keep medication fields and exports explicit. |
| [ScalesAdmin.vue](../src/features/clinical/views/ScalesAdmin.vue) | 348 | Keep | Question-add/create modal workflows differ from ordinary catalogs; retain, optionally isolate question editor later. |
| [TemplateForm.vue](../src/features/clinical/views/TemplateForm.vue) | 229 | Review S03/S07 | Keep template mapping/provenance domain; remove nested mutation and use actual breadcrumb outlet. |
| [TemplatesList.vue](../src/features/clinical/views/TemplatesList.vue) | 145 | Keep | Small template list/reactivation controller; route-filter assembly may be shared. |

## src/features/dashboard/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [DashboardLayout.vue](../src/features/dashboard/components/DashboardLayout.vue) | 188 | Keep | Dashboard-specific card composition; no need one component per small card. |
| [DashboardNextAppointment.vue](../src/features/dashboard/components/DashboardNextAppointment.vue) | 24 | Remove candidate S04 | Dormant countdown/StatCard composition; no active next-appointment widget consumes it. |

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

## src/features/import/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [importService.js](../src/features/import/services/importService.js) | 59 | Keep | Distinct patient/diagnosis/medication preview commands; retain token binding and mapping semantics. |

## src/features/import/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [ImportData.vue](../src/features/import/views/ImportData.vue) | 244 | Keep | Patient import step/preview/doctor binding; retain distinct from catalog import and recovery; reuse download helper. |
| [ImportOptions.vue](../src/features/import/views/ImportOptions.vue) | 449 | Review S08 | Split independent diagnosis and medication workflows into feature panels; render repeated mapping controls from descriptors. |

## src/features/notifications/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [NotificationCenter.vue](../src/features/notifications/components/NotificationCenter.vue) | 205 | Keep | Dropdown/grouped notification rendering; keep; read count directly or move count adapter into feature. |

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
| [BulkActionsBar.vue](../src/features/patients/components/BulkActionsBar.vue) | 37 | Remove candidate S04 | Dormant patient bulk-actions UI; selection state currently has no visible bulk action consumer. |
| [ColumnVisibilityPanel.vue](../src/features/patients/components/ColumnVisibilityPanel.vue) | 32 | Review S02 | Competing chooser beside DataTable controls; consolidate controlled column ownership, then retire redundant chooser. |
| [PatientCareTeamTab.vue](../src/features/patients/components/PatientCareTeamTab.vue) | 135 | Keep | Effective team/candidate/add/remove rendering; keep domain boundary with parent versions. |
| [PatientDetailLayout.vue](../src/features/patients/components/PatientDetailLayout.vue) | 204 | Keep | Patient tabs/panels composition; keep per-panel permissions/versions, avoid a universal detail schema. |
| [PatientDocumentsPanel.vue](../src/features/patients/components/PatientDocumentsPanel.vue) | 46 | Keep | Document metadata/file/own-version/archive workflow; retain; ordinary downloads can reuse helper. |
| [PatientDuplicatePanel.vue](../src/features/patients/components/PatientDuplicatePanel.vue) | 49 | Keep | Optional duplicate review and preview-bound merge consent; keep separate from ordinary records editor. |
| [PatientFormDemographics.vue](../src/features/patients/components/PatientFormDemographics.vue) | 80 | Keep | Cohesive demographic form section; keep optional unknown/year-only fields. |
| [PatientFormLayout.vue](../src/features/patients/components/PatientFormLayout.vue) | 55 | Remove candidate S04 | Unused duplicate of active PatientForm composition, missing current profile/load wiring; remove rather than revive. |
| [PatientFormMedical.vue](../src/features/patients/components/PatientFormMedical.vue) | 31 | Keep | Small permission-aware medical section; retain domain boundary rather than fold into generic form fields. |
| [PatientFormSocial.vue](../src/features/patients/components/PatientFormSocial.vue) | 44 | Keep | Social/identity registration section; no size-based merge warranted. |
| [PatientHistoryPanel.vue](../src/features/patients/components/PatientHistoryPanel.vue) | 36 | Keep | Correction/merge history projection and offset paging; keep immutable-history display distinct. |
| [PatientIdentity.vue](../src/features/patients/components/PatientIdentity.vue) | 128 | Keep | Patient identity/action display; keep distinct from visit workspace/allergy summary. |
| [PatientLink.vue](../src/features/patients/components/PatientLink.vue) | 36 | Keep | Patient-specific link/tooltip label adapter; correctly feature-owned. |
| [PatientProfileFields.vue](../src/features/patients/components/PatientProfileFields.vue) | 30 | Keep | Identity verification/preferences/correction-reason section; keep domain-specific controls. |
| [PatientRecordsPanel.vue](../src/features/patients/components/PatientRecordsPanel.vue) | 130 | Keep | Schema-driven longitudinal register editor; retain reason/opening-version and type-specific semantics. |
| [PatientSidebar.vue](../src/features/patients/components/PatientSidebar.vue) | 102 | Keep | Patient completeness/family/risk summary; differs from compact visit summary sidebar. |
| [PatientSummarySidebar.vue](../src/features/patients/components/PatientSummarySidebar.vue) | 85 | Keep | Compact patient context for visit editing; retain in patient feature, preserve model identity semantics. |
| [PatientVisitsList.vue](../src/features/patients/components/PatientVisitsList.vue) | 93 | Keep | Patient-owned visit collection/actions composition; import visit-specific cards from visits after move. |

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
| [PatientDetail.vue](../src/features/patients/views/PatientDetail.vue) | 221 | Keep | Patient section-load/version/actions controller; feature-local loader/export helper extraction is optional after shared lifecycle work. |
| [PatientForm.vue](../src/features/patients/views/PatientForm.vue) | 275 | Review S03/S07 | Retain sections/identity preparation/duplicate warning; move reusable controller pieces only with their version/draft policy intact. |
| [PatientsList.vue](../src/features/patients/views/PatientsList.vue) | 493 | Review S02 | First consolidate columns/exports; extract feature list metadata/export actions and route filters instead of more visual wrappers. |

## src/features/prescription/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [PrescriptionHistory.vue](../src/features/prescription/components/PrescriptionHistory.vue) | 93 | Review S10 | Keep retained-document paging/reprint/instructions policy; share URL/read disposal primitives. |
| [PrescriptionPaperOptions.vue](../src/features/prescription/components/PrescriptionPaperOptions.vue) | 55 | Keep | Paper settings/alignment reference belong here; no generic geometry component needed. |
| [PrescriptionPdfPreview.vue](../src/features/prescription/components/PrescriptionPdfPreview.vue) | 46 | Review S14 | Already displays handovers too; move/rename shared PdfPreview with caller-provided document labels. |

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
| [PrescriptionPreview.vue](../src/features/prescription/views/PrescriptionPreview.vue) | 299 | Review S10 | Keep issuance/token/signature policy in feature; share Blob URL lifecycle instead of splitting by line count. |
| [ReferralLetter.vue](../src/features/prescription/views/ReferralLetter.vue) | 123 | Keep | Referral narrative/reason issuance composition; keep separate from prescription preview, reuse ordinary download helper. |

## src/features/reports/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [StatisticsLayout.vue](../src/features/reports/components/StatisticsLayout.vue) | 141 | Keep | Report chart/KPI/date/export composition; correct feature owner; move StatisticsChart here. |

## src/features/reports/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [statisticsService.js](../src/features/reports/services/statisticsService.js) | 21 | Keep | Reporting endpoint adapter; retain; use central envelope helper during normalization cleanup. |

## src/features/reports/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [AboutView.vue](../src/features/reports/views/AboutView.vue) | 14 | Review S14 | App help content misplaced under reports; move to help/views. |
| [ErrorPage.vue](../src/features/reports/views/ErrorPage.vue) | 68 | Review S14 | App error route misplaced under reports; move to src/views/ErrorPage.vue. |
| [ManualView.vue](../src/features/reports/views/ManualView.vue) | 25 | Review S14 | App help content; move to help/views together with mirrored scoped style. |
| [PrivacyPolicyView.vue](../src/features/reports/views/PrivacyPolicyView.vue) | 22 | Review S14 | App legal/help content; move to help/views without changing route URL. |
| [Reconciliation.vue](../src/features/reports/views/Reconciliation.vue) | 117 | Review S13 | Administrative report projection; reuse central status presentation metadata. |
| [Statistics.vue](../src/features/reports/views/Statistics.vue) | 151 | Keep | Report projections/definitions/downloads controller; optionally extract chart definitions, use existing download helper. |
| [TermsView.vue](../src/features/reports/views/TermsView.vue) | 21 | Review S14 | App legal/help content; move to help/views without changing route URL. |

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
| [UserForm.vue](../src/features/settings/views/UserForm.vue) | 217 | Review S03/S07 | Account edit/stamp form; remove nested mutation and render breadcrumb slot; stamp-reader helper optional. |
| [UserPermissions.vue](../src/features/settings/views/UserPermissions.vue) | 145 | Keep | Permission-table/opening-version workflow; keep distinct from account profile form. |
| [UsersList.vue](../src/features/settings/views/UsersList.vue) | 160 | Keep | Account list controller; reuse route-filter adapter; preserve deactivation confirmation. |
| [WorkspaceSettings.vue](../src/features/settings/views/WorkspaceSettings.vue) | 6 | Keep | Intentionally tiny route wrapper for shared WorkspacePreferences; keep. |

## src/features/tasks/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [TaskFormInline.vue](../src/features/tasks/components/TaskFormInline.vue) | 69 | Remove candidate S04 | Dormant alternative task-add implementation; active form lives in TasksLayout. |
| [TasksLayout.vue](../src/features/tasks/components/TasksLayout.vue) | 143 | Keep | Task list/add rendering; keep with TasksPage actions; no reason to maintain duplicate inline form. |

## src/features/tasks/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [taskService.js](../src/features/tasks/services/taskService.js) | 41 | Keep | Explicit task lifecycle/reorder/delete API boundary; retain. |

## src/features/tasks/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [tasks.js](../src/features/tasks/stores/tasks.js) | 107 | Review S12 | Task list/actions owner; reuse cursor normalizer rather than duplicate listFetch extraction. |

## src/features/tasks/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [TasksPage.vue](../src/features/tasks/views/TasksPage.vue) | 217 | Keep | Reasoned lifecycle/confirmation actions controller; keep; shared route-filter assembly can reduce repetition. |

## src/features/visits/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [ApprovedVisitReference.vue](../src/features/visits/components/ApprovedVisitReference.vue) | 43 | Review S10 | Approved immutable reference projection; share read lifecycle with preview, not clinical semantics. |
| [ClinicalHandover.vue](../src/features/visits/components/ClinicalHandover.vue) | 38 | Review S10 | Approved handover PDF workflow; use neutral PdfPreview and shared owned URL lifecycle. |
| [InstructionAcknowledgement.vue](../src/features/visits/components/InstructionAcknowledgement.vue) | 31 | Keep | Nullable explanation/recipient/timestamp input block; keep clinical feature ownership. |
| [PatientWorkspaceHeader.vue](../src/features/visits/components/PatientWorkspaceHeader.vue) | 58 | Review S14 | Patient profile/allergy context used by patients and visits; move to patient feature. |
| [Timeline.vue](../src/features/visits/components/Timeline.vue) | 67 | Remove candidate S04 | Dormant alternative visit timeline; remove with indirect VerticalEventList subtree. |
| [VisitAdministrative.vue](../src/features/visits/components/VisitAdministrative.vue) | 45 | Keep | Visit documentation/supervision/acknowledgement section; keep, move disclosure policy to visit coordinator. |
| [VisitBasicInfo.vue](../src/features/visits/components/VisitBasicInfo.vue) | 114 | Keep | Visit history/date/score section; cohesive and worth keeping. |
| [VisitClinicalNotes.vue](../src/features/visits/components/VisitClinicalNotes.vue) | 70 | Keep | Examination/formulation/risk notes/scale section; keep domain section. |
| [VisitDiagnosesLabs.vue](../src/features/visits/components/VisitDiagnosesLabs.vue) | 56 | Keep | Diagnosis/lab section; use clinical rich-entry selector after MultiSelect split. |
| [VisitFormLayout.vue](../src/features/visits/components/VisitFormLayout.vue) | 140 | Remove candidate S04 | Dormant duplicate of active VisitForm composition; remove before extracting new layouts. |
| [VisitRecordPreview.vue](../src/features/visits/components/VisitRecordPreview.vue) | 34 | Review S10 | Working-record preview differs from approved reference; share read lifecycle only. |
| [VisitSectionNavigator.vue](../src/features/visits/components/VisitSectionNavigator.vue) | 24 | Keep | Feature-specific disclosure navigation/missing hints; retain and coordinate shared section identifiers. |
| [VisitTreatmentPlan.vue](../src/features/visits/components/VisitTreatmentPlan.vue) | 184 | Keep | Plan currently includes medications/goals/risk/follow-up/templates; optional future risk/goal subsection extraction, not required by size alone. |
| [VisitsListLayout.vue](../src/features/visits/components/VisitsListLayout.vue) | 103 | Keep | List/detail-preview presentation; correctly separate from actions/controller. |

## src/features/visits/composables

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [useVisitForm.js](../src/features/visits/composables/useVisitForm.js) | 343 | Review S09 | Module-level nested defaults are shallow-copied; mutable goals can carry into another create form. Use fresh defaults before mapping extraction. |
| [useVisitLookups.js](../src/features/visits/composables/useVisitLookups.js) | 59 | Keep | Feature-specific diagnosis/medication search adapter over catalog owner; retain. |
| [useVisitScales.js](../src/features/visits/composables/useVisitScales.js) | 142 | Keep | Saved answers/late definitions/removal/payload policy is cohesive; keep separate from catalog/picker reads. |
| [useVisitTemplates.js](../src/features/visits/composables/useVisitTemplates.js) | 75 | Keep | Template application/provenance owner; keep separate from visit mapping and catalog editor. |

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
| [VisitDetail.vue](../src/features/visits/views/VisitDetail.vue) | 279 | Keep | Clinical detail/sign/amend/lock composition; optional future section extraction, preserve distinction from read-only approved references. |
| [VisitForm.vue](../src/features/visits/views/VisitForm.vue) | 268 | Review S09 | Goal push/splice mutates shared default array on create; fix fresh-form isolation, then retain sections and retire obsolete layout. |
| [VisitsList.vue](../src/features/visits/views/VisitsList.vue) | 179 | Keep | Visit list/action controller; route filters/download handling can share existing infrastructure. |

## src

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [main.js](../src/main.js) | 97 | Keep | App/plugin/directive/bootstrap order owner; retain, remove obsolete registered clipboard adapter only after decision. |

## src/router

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [guards.js](../src/router/guards.js) | 39 | Keep | Session/grant/forced-password guards; retain explicit server-grant checks. |
| [index.js](../src/router/index.js) | 296 | Keep | Route metadata/lazy imports/navigation cancellation; correct misplaced view imports when moving owners, no per-feature split required now. |

## src/services

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [apiClient.js](../src/services/apiClient.js) | 339 | Keep | Keep central CSRF/version/idempotency/session/cancellation policy; no split based on line count. |
| [apiEvents.js](../src/services/apiEvents.js) | 61 | Keep | Transport-to-app event bridge; retain separate from UI actions. |
| [baseCrudService.js](../src/services/baseCrudService.js) | 36 | Keep | Shared allowlist-aware CRUD service factory; retain. |
| [contracts.js](../src/services/contracts.js) | 29 | Keep | Wire types/command allowlists inspected; keep single command boundary, not a form generator schema. |
| [overlayStack.js](../src/services/overlayStack.js) | 79 | Keep | Single cross-component focus/inert/body-lock owner; preserve nested-layer semantics. |
| [sessionState.js](../src/services/sessionState.js) | 38 | Keep | Principal generation/store cleanup owner; retain explicit infrastructure boundary. |
| [themeService.js](../src/services/themeService.js) | 46 | Keep | DOM theme/browser preference adapter; keep one application owner, centralize theme registry metadata. |

## src/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [colors.js](../src/stores/colors.js) | 20 | Remove candidate S04 | Unused doctor-color assignment store; remove before adding new chart/color state. |
| [confirm.js](../src/stores/confirm.js) | 62 | Keep | Sole confirmation/prompt queue owner; retain. |
| [constants.js](../src/stores/constants.js) | 65 | Review S14 | Concrete clinical metadata/fallback owner; move into clinical feature with catalog stores. |
| [crudStoreFactory.js](../src/stores/crudStoreFactory.js) | 169 | Review S12 | Generic resource/action state factory; retain, share response extraction rather than adding more factories. |
| [diagnosisLookup.js](../src/stores/diagnosisLookup.js) | 15 | Review S14 | Concrete clinical catalog instance; move into clinical/stores, keep generic factory shared. |
| [loading.js](../src/stores/loading.js) | 36 | Keep | Global write-request count/visible delay owner; keep distinct from read loading. |
| [lookupStoreFactory.js](../src/stores/lookupStoreFactory.js) | 79 | Review S01 | Generic coalesced full-catalog/invalidation factory; keep shared and reuse for scale picker. |
| [lookups.js](../src/stores/lookups.js) | 47 | Review S14 | Clinical aggregate ref facade, not a Pinia store definition; move to clinical and optionally rename as composable. |
| [medicationLookup.js](../src/stores/medicationLookup.js) | 15 | Review S14 | Concrete clinical catalog instance; move into clinical/stores. |

## src/stores/plugins

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [persist.js](../src/stores/plugins/persist.js) | 51 | Keep | Allowlisted browser preference persistence; keep explicit opt-in paths, no generic clinical-state persistence. |

## src/stores

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [refresh.js](../src/stores/refresh.js) | 12 | Keep | App freshness indicator state; retain small explicit owner. |
| [scaleLookup.js](../src/stores/scaleLookup.js) | 15 | Review S01/S14 | Full clinical scale catalog owner; consolidate picker here and move to clinical/stores. |
| [selection.js](../src/stores/selection.js) | 29 | Keep | Only patient list consumes global selection; prefer page-local selection if bulk actions remain absent. |
| [ui.js](../src/stores/ui.js) | 57 | Keep | App theme/sidebar UI owner; workspace preference state already delegated, keep that separation. |
| [workspace.js](../src/stores/workspace.js) | 19 | Keep | Per-account/browser density/split/progressive preferences; retain shared UI policy, avoid clinical content persistence. |

## src/styles/components/common

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [spinner.css](../src/styles/components/common/spinner.css) | 1 | Review S15 | Comment-only stylesheet, no CSS rules; remove external scoped import and file while keeping global spinner styling. |

## src/styles/components/ui

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [base-modal.css](../src/styles/components/ui/base-modal.css) | 40 | Keep | External scoped styles owned by BaseModal.vue; retain scope and mirrored owner path. |
| [breadcrumb.css](../src/styles/components/ui/breadcrumb.css) | 25 | Keep | External scoped styles owned by Breadcrumb.vue; retain scope and mirrored owner path. |
| [form-field.css](../src/styles/components/ui/form-field.css) | 15 | Keep | External scoped styles owned by FormField.vue; retain scope and mirrored owner path. |
| [form-textarea.css](../src/styles/components/ui/form-textarea.css) | 4 | Keep | External scoped styles owned by FormTextarea.vue; retain scope and mirrored owner path. |
| [form-wizard.css](../src/styles/components/ui/form-wizard.css) | 8 | Remove candidate S04 | Scoped style of dormant FormWizard; remove with its component after intended-consumer check. Source references come only from dormant files. |
| [score-input.css](../src/styles/components/ui/score-input.css) | 25 | Keep | External scoped styles owned by ScoreInput.vue; retain scope and mirrored owner path. |
| [section-indicator.css](../src/styles/components/ui/section-indicator.css) | 11 | Remove candidate S04 | Scoped style of dormant SectionIndicator; remove with its component after intended-consumer check. Source references come only from dormant files. |
| [signature-pad.css](../src/styles/components/ui/signature-pad.css) | 26 | Keep | External scoped styles owned by SignaturePad.vue; retain scope and mirrored owner path. |

## src/styles/features/auth/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [login.css](../src/styles/features/auth/views/login.css) | 4 | Keep | External scoped styles owned by Login.vue; retain scope and mirrored owner path. |

## src/styles/features/dashboard/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [dashboard-layout.css](../src/styles/features/dashboard/components/dashboard-layout.css) | 1 | Keep | Tiny owned scoped padding rule; valid small file, no merge solely to increase module size. |

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
| [prescription-pdf-preview.css](../src/styles/features/prescription/components/prescription-pdf-preview.css) | 14 | Review S14 | Scoped PDF viewer styles; move/mirror with proposed shared documents/PdfPreview owner, preserve scope. |

## src/styles/features/prescription/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [referral-letter.css](../src/styles/features/prescription/views/referral-letter.css) | 4 | Keep | External scoped styles owned by ReferralLetter.vue; retain scope and mirrored owner path. |

## src/styles/features/reports/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [statistics-layout.css](../src/styles/features/reports/components/statistics-layout.css) | 9 | Keep | Report layout scoped styles include :deep chart adjustment; retain deep selector and scope when chart owner moves. |

## src/styles/features/reports/views

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [manual-view.css](../src/styles/features/reports/views/manual-view.css) | 4 | Review S14 | Scoped help-page typography; move/mirror with ManualView under proposed help feature. |

## src/styles/features/tasks/components

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [tasks-layout.css](../src/styles/features/tasks/components/tasks-layout.css) | 1 | Keep | Tiny scoped completed-task text rule; retain owned scope, not global utility merge by text equality. |

## src/utils

| File | Lines | Disposition | Rationale |
| --- | ---: | --- | --- |
| [announce.js](../src/utils/announce.js) | 5 | Keep | Small live-region bridge; retain one host policy. |
| [apiErrorHandler.js](../src/utils/apiErrorHandler.js) | 99 | Keep | Transport status/error UI policy; reuse existing error messages/extraction instead of new competing handlers. |
| [asyncStore.js](../src/utils/asyncStore.js) | 25 | Remove candidate S04 | Unused alternative async-state mutation helper; removal candidate. |
| [businessRules.js](../src/utils/businessRules.js) | 92 | Keep | Only calculateAge is consumed; retain used age operation in date/domain utility, retire unused competing phone/ID/risk helpers after checks. |
| [cacheKeys.js](../src/utils/cacheKeys.js) | 45 | Remove candidate S04 | No production consumer for legacy cache-name helpers; removal candidate. |
| [catalogFetch.js](../src/utils/catalogFetch.js) | 17 | Keep | Full-cursor traversal/repetition guard; retain and reuse for catalog-owned reads. |
| [confirmMessages.js](../src/utils/confirmMessages.js) | 15 | Keep | Active shared confirmation text; keep domain-specific consent/reasons explicit. |
| [decimalMoney.js](../src/utils/decimalMoney.js) | 34 | Keep | Exact integer-hundredth billing arithmetic; retain separate from display formatters. |
| [download.js](../src/utils/download.js) | 13 | Review S10 | Existing one-shot Blob download helper; adopt across repeated anchor code before adding helpers. |
| [errorExtractor.js](../src/utils/errorExtractor.js) | 42 | Keep | Form error-envelope extraction; retain explicit form error contract, consolidate other copies when changing them. |
| [errorMessages.js](../src/utils/errorMessages.js) | 19 | Keep | Active error-message constants; unused MSG registry should not become a competing source. |
| [fallbackText.js](../src/utils/fallbackText.js) | 15 | Keep | Small unknown/empty display vocabulary; retain clinical unknown distinction. |
| [formatters.js](../src/utils/formatters.js) | 57 | Keep | Pure number/money/identity/display functions; retain single implementations and optional composable facade. |
| [iconMap.js](../src/utils/iconMap.js) | 94 | Keep | Semantic icon aliases; retain shared presentation registry. |
| [idempotency.js](../src/utils/idempotency.js) | 8 | Keep | Logical-operation UUID generation; retain key lifecycle ownership in apiClient. |
| [index.js](../src/utils/index.js) | 11 | Keep | Active debounce implementation imported through @/utils; rename debounce.js optionally, avoid expanding barrel. |
| [listFetch.js](../src/utils/listFetch.js) | 57 | Review S12 | Active cursor service adapter; share normalization with pagination/stores rather than copy. |
| [lruCache.js](../src/utils/lruCache.js) | 53 | Keep | Patient cache primitive; correctly generic, retain. |
| [messages.js](../src/utils/messages.js) | 61 | Remove candidate S04 | Unused broad Arabic message registry overlaps active message/constants owners; removal candidate. |
| [normalize.js](../src/utils/normalize.js) | 19 | Review S12 | fullName is active; normalizeList is an unused competing list shape helper; narrow exports during normalization cleanup. |
| [optionList.js](../src/utils/optionList.js) | 6 | Review S12 | Remote option-array extraction with invalid-response rejection; preserve strict option semantics during shared response work. |
| [pagination.js](../src/utils/pagination.js) | 41 | Remove candidate S04 | Unused alternative response/list/meta normalization; remove before adding another normalizer. |
| [queryBuilder.js](../src/utils/queryBuilder.js) | 47 | Remove candidate S04 | Unused query/search param builder; live lists use listFetch and feature params. |
| [reportError.js](../src/utils/reportError.js) | 5 | Keep | Static operation/status logging boundary; keep privacy-preserving behavior. |
| [riskLevels.js](../src/utils/riskLevels.js) | 31 | Keep | Active clinical risk label/color/icon metadata; unify with status presentation while keeping unknown explicit. |
| [storage.js](../src/utils/storage.js) | 54 | Keep | Safe browser storage primitive; retain, feature policy must stay with owners. |
| [validationRules.js](../src/utils/validationRules.js) | 87 | Keep | Rule-object factories for useForm; keep wire/optional clinical semantics distinct from presentation. |
| [validators.js](../src/utils/validators.js) | 151 | Keep | Pure configured identity/phone/password validation; retain single active implementations. |

## Verification boundary

Inspected text source individually for ownership, interfaces and duplication, then traced imports and template consumers. Static reference traversal resolved local import/style/asset paths without unresolved references. It conservatively includes template branches and registered directives regardless of current runtime props. Generated declarations were inspected as mappings and excluded as runtime consumers. Every theme variant was inspected/compared for selectors, declarations, aliases and dark overrides; default-palette duplicate declarations were compared directly. Font containers and their references were inspected, without glyph/rendering certification.

No test-suite inspection/execution, build, compiler, bundler, package/dependency/lockfile change, server/browser launch, API probe or clinic storage operation was performed. Browser interactions/layout/RTL, accessibility, PDF viewers and physical printing remain unverified by this review. All Sxx changes remain proposals.
