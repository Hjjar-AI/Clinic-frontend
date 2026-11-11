# Structure review path inventory

Historical ownership/removal record for the **2026-11-07** [structure review](structureReview.md). This replaces repetitive per-file “Keep” rows and stale line counts. Architecture rules belong in [UI ownership](ui.md); dated counts and verification limits belong in [evidence](doneCurrent.md). This is not a fresh runtime or reachability audit.

## Moved owners

Paths are relative to frontend. Routes/URLs were preserved; scoped styles moved with their owners.

| Former path | Final owner |
| --- | --- |
| `public/static/css/features/clinical/letter-sheet.css` | [public/static/css/features/prescription/letter-sheet.css](../public/static/css/features/prescription/letter-sheet.css) |
| `src/features/prescription/components/PrescriptionPdfPreview.vue` | [src/components/documents/PdfPreview.vue](../src/components/documents/PdfPreview.vue) |
| `src/stores/constants.js` | [src/features/clinical/stores/constants.js](../src/features/clinical/stores/constants.js) |
| `src/stores/diagnosisLookup.js` | [src/features/clinical/stores/diagnosisLookup.js](../src/features/clinical/stores/diagnosisLookup.js) |
| `src/stores/lookups.js` | [src/features/clinical/stores/lookups.js](../src/features/clinical/stores/lookups.js) |
| `src/stores/medicationLookup.js` | [src/features/clinical/stores/medicationLookup.js](../src/features/clinical/stores/medicationLookup.js) |
| `src/stores/scaleLookup.js` | [src/features/clinical/stores/scaleLookup.js](../src/features/clinical/stores/scaleLookup.js) |
| `src/components/ui/EditableNotes.vue` | [src/features/dashboard/components/SessionScratchpad.vue](../src/features/dashboard/components/SessionScratchpad.vue) |
| `src/features/reports/views/AboutView.vue` | [src/features/help/views/AboutView.vue](../src/features/help/views/AboutView.vue) |
| `src/features/reports/views/ManualView.vue` | [src/features/help/views/ManualView.vue](../src/features/help/views/ManualView.vue) |
| `src/features/reports/views/PrivacyPolicyView.vue` | [src/features/help/views/PrivacyPolicyView.vue](../src/features/help/views/PrivacyPolicyView.vue) |
| `src/features/reports/views/TermsView.vue` | [src/features/help/views/TermsView.vue](../src/features/help/views/TermsView.vue) |
| `src/composables/useUnreadCount.js` | [src/features/notifications/composables/useUnreadCount.js](../src/features/notifications/composables/useUnreadCount.js) |
| `src/features/visits/components/PatientWorkspaceHeader.vue` | [src/features/patients/components/PatientWorkspaceHeader.vue](../src/features/patients/components/PatientWorkspaceHeader.vue) |
| `src/features/clinical/components/LetterSheet.vue` | [src/features/prescription/components/LetterSheet.vue](../src/features/prescription/components/LetterSheet.vue) |
| `src/components/charts/StatisticsChart.vue` | [src/features/reports/components/StatisticsChart.vue](../src/features/reports/components/StatisticsChart.vue) |
| `src/components/common/DuplicateVisitButton.vue` | [src/features/visits/components/DuplicateVisitButton.vue](../src/features/visits/components/DuplicateVisitButton.vue) |
| `src/components/common/VisitCard.vue` | [src/features/visits/components/VisitCard.vue](../src/features/visits/components/VisitCard.vue) |
| `src/styles/features/prescription/components/prescription-pdf-preview.css` | [src/styles/components/documents/pdf-preview.css](../src/styles/components/documents/pdf-preview.css) |
| `src/styles/features/reports/views/manual-view.css` | [src/styles/features/help/views/manual-view.css](../src/styles/features/help/views/manual-view.css) |
| `src/features/reports/views/ErrorPage.vue` | [src/views/ErrorPage.vue](../src/views/ErrorPage.vue) |

## Removed owners

The historical review removed dormant production alternatives, superseded owners and unused styles after consumer checks; obsolete test consumers were retired or migrated with the authorization recorded in [evidence](doneCurrent.md). These are intentionally plain paths, not links to deleted files. The detailed S01–S15 source/impact/corrections remain in the [review](structureReview.md).

| Former directory | Removed files |
| --- | --- |
| `public/static/css/components/` | `accordion.css`, `checklist.css`, `context-menu.css`, `day-grid.css`, `dropdown-menu.css` |
| `public/static/css/features/clinical/` | `care-widgets.css`, `cbt-record.css` |
| `src/components/charts/` | `MiniBarChart.vue` |
| `src/components/common/` | `LoadingScreen.vue` |
| `src/components/dev/` | `RoutePerformanceDashboard.vue` |
| `src/components/ui/` | `AsyncSelect.vue`, `BasePagination.vue`, `ChecklistItem.vue`, `DayGrid.vue`, `DetailsGrid.vue`, `DropdownMenu.vue`, `FormGenerator.vue`, `FormWizard.vue`, `SectionIndicator.vue`, `StepsCard.vue`, `TimePicker.vue`, `VerticalEventList.vue` |
| `src/composables/` | `useError.js`, `useFormFieldProps.js`, `useScrollTo.js`, `useSort.js`, `useTimeAgo.js` |
| `src/directives/` | `clipboard.js`, `debounce.js`, `dirty.js` |
| `src/features/appointments/components/` | `AvailabilityGrid.vue`, `MiniCalendar.vue`, `QueueTable.vue` |
| `src/features/backup/stores/` | `backup.js` |
| `src/features/clinical/components/` | `AuditLog.vue`, `CBTRecord.vue`, `Callout.vue`, `LabResult.vue`, `ProgressGoal.vue`, `ScrollableTerms.vue`, `SeverityPills.vue`, `TriggerList.vue` |
| `src/features/clinical/stores/` | `scales.js` |
| `src/features/dashboard/components/` | `DashboardNextAppointment.vue` |
| `src/features/patients/components/` | `BulkActionsBar.vue`, `ColumnVisibilityPanel.vue`, `PatientFormLayout.vue` |
| `src/features/tasks/components/` | `TaskFormInline.vue` |
| `src/features/visits/components/` | `Timeline.vue`, `VisitFormLayout.vue` |
| `src/stores/` | `colors.js` |
| `src/styles/components/common/` | `spinner.css` |
| `src/styles/components/ui/` | `form-wizard.css`, `section-indicator.css` |
| `src/utils/` | `asyncStore.js`, `businessRules.js`, `cacheKeys.js`, `messages.js`, `pagination.js`, `queryBuilder.js` |

The initially retained MiniBarChart, DropdownMenu, TaskFormInline, asyncStore, pagination and queryBuilder candidates were subsequently removed. No old “keep for tests” candidate remains open. New implementation and reusable-owner details are recorded once in the review; selective browser verification remains [pending](workCurrent.md).
