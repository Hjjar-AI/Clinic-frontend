# Frontend structure review

Reviewed **2026-11-07**: every file under `src/` and `public/`. **457 files**: 210 Vue, 141 JavaScript, 100 CSS, two generated declarations, three fonts and one JPEG. The [file ledger](structureReviewFiles.md) records an individual disposition for every file. [Pending work](workCurrent.md) · [Evidence and limits](doneCurrent.md) · [Existing UI ownership](ui.md).

The existing feature structure should stay. The useful changes are removing dormant code, correcting three component contracts and mutable form defaults, extracting a few repeated controllers, and moving domain-specific code out of shared folders. A wholesale folder rewrite or a larger generic component framework would add churn without solving the observed problems.

This is a source architecture review, not runtime certification. No application code was changed. Recommendations below are proposed work, not completed fixes.

## Correct these contracts first

### S01 — Scale picker and scale store disagree (high priority)

[ScalePickerModal.vue](../src/features/clinical/components/ScalePickerModal.vue):46–48 awaits `fetchScales()` and assigns `scaleStore.scales`. [scales.js](../src/features/clinical/stores/scales.js) defines no `scales` member; [crudStoreFactory.js](../src/stores/crudStoreFactory.js):148–166 exposes `items`. The picker template then reads `scales.length`. After a successful fetch, its local array becomes `undefined`, so the picker cannot reliably render its options.

Use the existing [scaleLookup.js](../src/stores/scaleLookup.js)/[lookupStoreFactory.js](../src/stores/lookupStoreFactory.js) catalog owner, which also follows all catalog cursors. Give the picker an explicit array/loading/error/retry interface, or connect it directly to that owner. Remove the separate clinical CRUD scale store if it has no remaining consumer. Preserve saved scale definitions/answers in `useVisitScales`; merging lookup ownership does not mean rewriting historical answers. This finding is source-confirmed; the rendered failure was not exercised.

### S02 — Patient columns have two independent owners (high priority)

[PatientsList.vue](../src/features/patients/views/PatientsList.vue):56, 257–288, 399–401 owns `ColumnVisibilityPanel`, `columnVisibility`, export fields and the browser-wide `patients:list-columns` key. [ListView.vue](../src/components/ui/ListView.vue):94–96 also supplies a preference key to [DataTable.vue](../src/components/ui/DataTable.vue):185–195, which maintains another hidden-column list and renders another control.

The table can hide a column that the parent still includes in exports. The two controls can disagree, and the outer preference is not account-scoped. Make column visibility a single controlled state: the same visible keys must drive table rendering, the one chooser, and export fields. Reuse the table's account-scoped preference scheme, preserve fixed identity columns, and remove the redundant patient-specific chooser after its consumers are migrated. This is a state-contract issue, not a reason to create a third column-control component.

### S03 — Form breadcrumbs are supplied through an unrendered slot (medium priority)

Five active forms—[AppointmentForm](../src/features/appointments/views/AppointmentForm.vue), [InvoiceForm](../src/features/billing/views/InvoiceForm.vue), [TemplateForm](../src/features/clinical/views/TemplateForm.vue), [PatientForm](../src/features/patients/views/PatientForm.vue) and [UserForm](../src/features/settings/views/UserForm.vue)—supply `#headerTitle` containing breadcrumbs. [FormWrapper.vue](../src/components/ui/FormWrapper.vue):10–25 renders a prop-based card header and only a default slot. Those breadcrumbs have no rendering outlet.

Define one explicit breadcrumb/header slot in `FormWrapper`, then migrate the five callers to it. Keep its loading/version gate, native fieldset and form-error handling together. The unused `PatientFormLayout` repeats the same mismatch and should be handled under S04 rather than repaired as a second active implementation.

### S09 — Mutable visit defaults can carry goals into another new visit (high priority)

[useVisitForm.js](../src/features/visits/composables/useVisitForm.js):16–59 defines nested arrays/objects at module scope and line 78 shallow-copies that object. [useForm.js](../src/composables/useForm.js) shallow-copies it again into the reactive form; its deep snapshot does not detach the working form. [VisitForm.vue](../src/features/visits/views/VisitForm.vue):260–266 pushes/splices `form.goals` in place. For a fresh create form, those mutations therefore modify the module's default goals array. The next fresh create form in the same loaded application can inherit the previous form's goals, including across patients; unmount only stops the draft watcher.

Replace the module object with a fresh-default factory or deeply clone working defaults for each instance. This correction should precede the optional mapping extraction described below. Verify create → type a goal → leave → create for another patient, as well as edit/duplicate/session transitions. This is a source-traced shared-reference finding, not a browser reproduction.

## Recommended structural changes

### S04 — Remove dormant implementations before adding abstractions

Static traversal from `src/main.js` and `index.html`, including literal dynamic imports, relative/alias imports, configured UI/common component auto-imports and CSS imports, found **32 Vue files and 13 JavaScript files with no entry-point path**. Two scoped stylesheets are reachable only from those dormant components. Every candidate is identified in the ledger, including indirect-only references.

Particularly useful removals are `PatientFormLayout.vue` and `VisitFormLayout.vue`, which duplicate active page compositions, and `TaskFormInline.vue`, which duplicates the active inline task form. `AsyncSelect.vue` overlaps the active `ApiSelect`/`SearchInput` pair but has no consumer; remove it instead of combining all three controls into a larger mode-based selector. Other candidates include unused clinical display widgets, calendar experiments, pagination/wizard components, old helper modules and the unused backup store.

These are removal candidates, not proof of an external public API or test contract. No test suites were inspected. Before a deletion implementation, check any intended non-app consumers under the repository's explicit test-inspection authorization rule. Generated component declarations are discovery output, not runtime consumers; regenerate them through the authorized workflow rather than editing them manually. Prune corresponding global CSS only after checking actual selectors, including dynamic classes and early HTML.

### S05 — Split `MultiSelect` by value contract

[MultiSelect.vue](../src/components/ui/MultiSelect.vue) supports two different models: dropdown selection of scalar IDs, and inline selection/editing of clinical objects. Its `addCustom()` at line 279 constructs diagnosis-shaped fields (`code`, `arabic_name`, `custom_name`, `custom_code`) inside shared UI. Its live consumers confirm the distinction: patient teams/settings use scalar lists; visit diagnoses/medications use rich records.

Keep `MultiSelect` for scalar selection. Extract `features/clinical/components/CatalogEntrySelect.vue` for rich clinical entries, reusing `SearchInput` for searching and accepting an explicit custom-entry factory. Keep medication/diagnosis mapping with the clinical feature. Preserve existing custom values, duplicate markers, clearing, stale-result protection and selected historical labels. Do not merge this with `ApiSelect`, which owns a native single-select contract.

### S06 — Move visit disclosure policy out of `CollapsibleSection`

[CollapsibleSection.vue](../src/components/ui/CollapsibleSection.vue):53–60 imports the workspace store and recognizes `visit-`, `visit-basic` and `visit-treat`. A generic disclosure component therefore owns visit workflow policy, even when used by settings.

Make the shared section accept controlled/default open state. Let the visit form or a small `features/visits/composables/useVisitSections.js` own progressive-mode defaults and section identifiers. Keep generic user-toggle persistence in the shared component only if its storage policy is explicit. Preserve section navigation's ability to open and focus a collapsed section.

### S07 — Use one mutation owner per form submission

[useFormSubmission.js](../src/composables/useFormSubmission.js):27 creates a Vue Query mutation. All six consumers pass an executor already created by [useApi.js](../src/composables/useApi.js):41, creating nested mutation state/error ownership around one request. This does not itself imply two network writes, but it duplicates pending/error lifecycle and makes responsibility unclear.

Let `useFormSubmission(validate, submitFn)` invoke the service/domain save function directly in those six forms. Keep form validation, submit error and pending state there; leave transport/idempotency/conflict behavior in `apiClient`. Remove inner `useApi` wrappers from the affected forms. Retain `useForm`, `useFormDirty`, `useFormDraft` and `useResourceLoad` as separate concerns. No live caller opts into `useApi` query mode; consider simplifying that unused branch separately, without changing dependencies or query behavior during this cleanup.

### S08 — Split the two import workflows

[ImportOptions.vue](../src/features/import/views/ImportOptions.vue) contains independent diagnosis preview/execute and medication upload/map/preview/execute state machines. It also renders five nearly identical column-mapping selects. This is a responsibility split, not a line-count split.

Extract `DiagnosisImportPanel.vue` and `MedicationImportPanel.vue` under the import feature. Render medication column choices from a local field descriptor array. Extract a panel-local composable only if separating logic from markup helps further. Keep each preview token bound to its file, mapping, merge mode, invalidation generation and explicit destructive consent. Patient import and authenticated full recovery remain separate workflows.

### S09 follow-up — Extract pure visit-form mapping; keep the existing visit composables

[useVisitForm.js](../src/features/visits/composables/useVisitForm.js):16, 93, 166, 207 combines defaults, hydration, duplication policy, command construction, form validation, drafts, submission and routing. Move fresh defaults plus `hydrate`/duplicate/command adapters into `features/visits/model/visitForm.js`, returning fresh nested arrays/objects for every form. Keep the composable as the state/lifecycle coordinator.

Move the visit-only draft allowlist from [useFormDraft.js](../src/composables/useFormDraft.js):4 into the visit feature. The generic draft composable should accept that allowlist, not define clinical policy. Keep `useVisitScales`, `useVisitLookups` and `useVisitTemplates` separate: their answer-preservation, catalog-loading and template-provenance rules differ. Preserve opening versions, nullable clinical values, follow-up reasons and server-owned signing fields in the adapters.

### S10 — Share read disposal and Blob URL ownership

[ApprovedVisitReference.vue](../src/features/visits/components/ApprovedVisitReference.vue):29–41 and [VisitRecordPreview.vue](../src/features/visits/components/VisitRecordPreview.vue):22–32 repeat almost the same generation/session/disposal/load machinery. [ClinicalHandover.vue](../src/features/visits/components/ClinicalHandover.vue):21–36, [PrescriptionHistory.vue](../src/features/prescription/components/PrescriptionHistory.vue):48–90 and [PrescriptionPreview.vue](../src/features/prescription/views/PrescriptionPreview.vue):160–176 repeat object-URL cleanup and session invalidation.

Introduce a small `useLatestResource` for replaceable reads, with explicit resource keys, current-generation checks, session reset, unmount disposal and error/retry state. It can share internal lifecycle code with `useResourceLoad`, but must not replace that form's explicit successful-hydration save gate. Introduce `useObjectUrl` for owned URL replacement/revocation. These are the strongest new shared composable candidates. They must not own issuance, consume preview tokens, retry writes or regenerate signed PDFs.

Ordinary one-shot downloads should reuse existing [downloadBlob](../src/utils/download.js) instead of repeating anchor creation in lists, patient detail, billing, referrals, reports and backup. Keep persistent preview URLs separate from one-shot download URLs.

### S11 — Extract repeated catalog editing and route-filter assembly

[DiagnosesManage.vue](../src/features/clinical/views/DiagnosesManage.vue) and [MedicationsManage.vue](../src/features/clinical/views/MedicationsManage.vue) repeat modal open/edit/create/save state, opening-version capture, close-on-success, lookup invalidation and list refresh. Extract `features/clinical/composables/useCatalogEditor.js`; keep each field form and service explicit. Scales and templates have different commands and should not be forced into the same editor.

Nine list/task screens repeat writable computed objects over several `useRouteQuery` refs. Add `useRouteFilters(defaults, mapping)` around the existing query primitive if that repetition is addressed; preserve defaults, URL key aliases, same-turn coalescing and back/forward navigation. Keep per-feature columns/filters in local config only where the page has substantial metadata, especially patients and the two catalogs. Do not generate every page from one universal CRUD schema.

### S12 — Consolidate pure helpers without expanding the public API

The clipboard fallback is copied verbatim in [useCopy.js](../src/composables/useCopy.js):3 and [directives/clipboard.js](../src/directives/clipboard.js):3. The directive is registered but has no template usage in `src`. Remove its unused registration/module if it is obsolete; if retained, both adapters should call one pure `utils/clipboard.js` helper.

[useDate.js](../src/composables/useDate.js):11–135 contains pure date operations; lines 137–166 load and initialize a DOM widget. Move pure date functions into `utils/date.js` and Flatpickr loading/defaults into a narrow browser adapter; keep a compatibility facade during consumer migration. Do not merge date-only parsing with native datetime conversion or change year-only birth semantics.

Response extraction is repeated in [usePagination](../src/composables/usePagination.js):97, [listFetch](../src/utils/listFetch.js):35, [crudStoreFactory](../src/stores/crudStoreFactory.js):6 and [tasks store](../src/features/tasks/stores/tasks.js):40. After removing unused `utils/pagination.js`/`normalizeList` alternatives as appropriate, share one explicit cursor-response normalizer that delegates envelope handling to `unwrapResponse`. Retain named response keys and catalog cursor validation; retain rejection of malformed catalogs instead of silently returning empty options. Do not add another generic normalization layer alongside the existing ones.

### S13 — Keep one presentation registry for statuses and themes

[Badge.vue](../src/components/ui/Badge.vue):47–160 keeps three parallel status maps while [statusConstants.js](../src/constants/statusConstants.js), filter definitions and [Reconciliation.vue](../src/features/reports/views/Reconciliation.vue):71 repeat labels. Consolidate label/color/icon metadata into a domain-keyed presentation registry consumed by badges and reports; keep transition permissions/server authority separate. Unknown status and clinical unknown must remain explicit. `StatusCell` and `RiskLevelBadge` remain useful small adapters.

[ThemeSwitcher.vue](../src/components/ui/ThemeSwitcher.vue):36 repeats the identifiers in [constants/theme.js](../src/constants/theme.js):5. Keep label/id metadata together there. `tokens/colors.css` and the base block in `themes/default.css` have the same **184 declarations**; keep one canonical default palette and preserve swatch/default selectors and dark overrides. Other theme files are distinct palette variants and should remain separate. This proposal needs cascade/rendered checks; identical text alone does not authorize merging scoped and global rules.

### S14 — Make a few ownership moves; preserve feature folders

| Current owner | Proposed owner | Reason |
| --- | --- | --- |
| `components/common/VisitCard.vue`, `DuplicateVisitButton.vue` | `features/visits/components/` | Visit-specific models and route commands. |
| `features/visits/components/PatientWorkspaceHeader.vue` | `features/patients/components/` | Loads patient profile/allergy records; used by both patient and visit screens. |
| `features/prescription/components/PrescriptionPdfPreview.vue` | `components/documents/PdfPreview.vue` | Already renders both prescriptions and clinical handovers; use explicit title/label props with feature defaults supplied by callers. |
| `components/charts/StatisticsChart.vue` | `features/reports/components/StatisticsChart.vue` | Its props/config contract is report-specific; keep reusable `useChart` shared. |
| `stores/{diagnosisLookup,medicationLookup,scaleLookup,lookups,constants}.js` | `features/clinical/stores/` (lookup facade may be a composable) | Concrete clinical catalog ownership. Keep generic factories shared. |
| `composables/useUnreadCount.js` | Notifications feature, or direct store refs | Only notification UI consumes it; the store already owns the count/poll. |
| `components/ui/EditableNotes.vue` | `features/dashboard/components/SessionScratchpad.vue` | One dashboard consumer and session-only scratchpad policy. |
| `features/clinical/components/LetterSheet.vue` | `features/prescription/components/LetterSheet.vue` | Only referral document composition consumes it. |
| `features/reports/views/{AboutView,ManualView,PrivacyPolicyView,TermsView}.vue` | `features/help/views/` | App help/legal content is unrelated to analytical reporting. |
| `features/reports/views/ErrorPage.vue` | `views/ErrorPage.vue` | App-wide error route. |

Move mirrored scoped CSS with its owner. Update every explicit import/router import; UI/common are the only configured auto-discovery directories. Preserve route names/URLs and `/static/` asset paths. `common` versus `ui` naming cleanup is optional after these domain moves; moving every remaining component into many new subfolders is unnecessary.

### S15 — Restore CSS ownership where late feature rules have spread

[features/workspace.css](../public/static/css/features/workspace.css):20–40 contains generic form actions, table-column controls, table actions and medication directions alongside visit/patient workspace geometry. Move those rules to their existing owner modules (`forms/feedback-actions`, `components/tables`, clinical medications); keep workspace rules about split references/panels together. [utilities/general.css](../public/static/css/utilities/general.css):15–70 contains context-menu and system-banner components, and lines 89–100 contain feature/signature rules. Relocate those to explicit component/feature owners while retaining genuine utilities.

After S04, prune obsolete sections from mixed modules such as `presentation-widgets.css`, `features/appointments/shared.css` and `features/clinical/care-widgets.css`; entire unused widget modules may then disappear. `src/styles/components/common/spinner.css` contains only a comment and its scoped import can be removed. Keep the remaining small scoped files with their components, even when tiny. Matching global/scoped selectors in modal, signature, score and field styles are not sufficient evidence for merging their scopes.

Preserve the ordered `app.css`, third-party import order, early `fonts.css`/`skeleton.css`, deep selectors, RTL geometry, print overrides and asset URLs. Check specificity/cascade before relocating overrides. The review does not recommend moving all public CSS into `src` or creating components for CSS-only utility classes.

## Changes that are not needed

- Keep the day/week/month calendar renderers separate; they represent different layouts. Merge the identical `handleDropSlot`/`handleDropWeek` controller bodies locally instead of combining renderers. `useTimeSlots` is a small cohesive helper; an independent `TimePicker` is currently dormant.
- Keep patient records, documents, duplicate/merge review and correction history as domain panels. Their permissions, versions, reasons, pagination and consent contracts differ. The existing record-field schema is more suitable than one component per tiny register input.
- Keep primitive inputs separate from clinical nullable controls. Keep `FormField`, `FieldError`, form summary and resource feedback distinct. `PageHeader`/`CardHeader` already delegate to `SectionHeader`; another merge offers little value. `FormDate` and `ClinicalTextArea` are thin, established adapters, not urgent refactors.
- Keep `apiClient`, session state, overlay stack, service write allowlists, CRUD factory and lookup factory as explicit infrastructure owners. Their size alone does not justify scattering concurrency/idempotency/session policy into more modules.
- Keep fonts and prescription reference artwork in `public/static`; inspect real font rendering/printing separately. The image is a screen alignment reference, not issued PDF artwork.
- No blanket `Base` prefix rename, barrel-export expansion, new state library, dependency change, per-feature route-file proliferation, or feature-wide folder reorganization is justified by this review.

## Suggested execution order and verification

1. Correct S01–S03 and S09 mutable defaults with focused production/reference checks; authorized mounted/browser checks are needed to certify the scale picker, fresh-visit isolation, form breadcrumbs, column/export agreement and account preference isolation.
2. Resolve S04 candidates and their owned styles. Check imports, dynamic component use, discovery configuration and intentional external consumers before deletion.
3. Apply S05–S07, S09 and the narrowly shared helpers in S10–S12. Preserve mutation/idempotency, disposal, nullable data and opening-version behavior. Verify each change independently before broad adoption.
4. Split the import panels with their preview/consent state intact. Do the ownership moves and presentation/CSS cleanup last, keeping imports/cascade reviewable.

The new abstractions with the clearest current consumers are `CatalogEntrySelect`, `useLatestResource`, `useObjectUrl`, `useCatalogEditor` and `useRouteFilters`. The import panels and visit mapping module are feature extractions. They are proposed names, not files already created.

Performed: source-by-source inspection, import/tag/cursor/slot/state-contract tracing, static entry-point reachability, stylesheet/asset link resolution, default-palette comparison, font-container metadata inspection and visual inspection of the reference JPEG. No unresolved local references were found by the static resolver. No suites were inspected or run, no builds/compilation/packaging/dependency changes occurred, no server/browser was started and no clinic storage was accessed. Static reference analysis is conservative and cannot certify runtime layout, accessibility, font shaping, PDF viewers, printing or behavior. The ledger's “keep” decisions concern architecture, not defect-free certification.
