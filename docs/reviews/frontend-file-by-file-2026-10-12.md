# Frontend file-by-file and workflow review

Reviewed 2026-10-12 against current production source and the supplied quality checklist. Review only: no production fixes, migration inspection, test-suite work, builds, compilation, packaging, dependency changes or clinic-data access. The backend model/relationship review is [here](../../../backend/docs/reviews/models-and-logic-2026-10-12.md).

The source organization is broadly sensible: feature services, shared UI, composables and stores already exist. The highest-value work is correcting the contracts and state ownership below, then simplifying unused alternatives. A framework rewrite or wholesale TypeScript conversion is not needed to address these findings.

## Scope and confidence

431 first-party production/configuration files were read individually: 197 Vue files, 133 JavaScript files, 96 stylesheets and five other configuration/entry files. The file ledger below records coverage and associated findings. Relevant backend production serializers, pagination, permissions and workflow contracts were checked to avoid inventing API behavior. Generated declarations, dependencies, lockfiles, binary assets, runtime data, migrations and test suites are outside the file-by-file scope; documentation was read for instructions and existing findings.

**Confirmed** means the source establishes the issue and its trigger; it does not mean the behavior was reproduced in a browser. **Latent** means a defect in an unused or currently unexercised interface. **Recommendation** means a design/maintenance improvement, not an asserted failure. P1: address first because of clinical-data, privacy or widespread workflow impact. P2: functional correctness/accessibility. P3: narrower maintenance/presentation issue. No production-exploit or full accessibility certification is claimed.

## Prioritized findings

### F01 · P1 · Shared cards suppress normal form keyboard input — confirmed

**Locations:** `src/components/ui/BaseCard.vue:8–9`; active consumers include `FormWrapper.vue`, `BaseModal.vue`, Login and VisitForm.

Both Enter and Space have unconditional `.prevent` handlers on the enclosing section, even when `clickable` is false. Keyboard events from descendant controls bubble to it. Typing a space in an input, entering a newline in a textarea or using native Enter submission can therefore lose its normal action across most forms.

**Correction:** handle activation only on a clickable card when `event.target === event.currentTarget`; prevent default inside that guarded handler. Preserve native child control behavior.

### F02 · P1 · Timeout-preserved drafts are not isolated by account — confirmed

**Locations:** `src/composables/useFormDraft.js` (`memoryDrafts`, `draftKey`); `src/features/auth/stores/auth.js` (`login`, `logout`); `src/composables/useSession.js` (`preserveDrafts`); patient/appointment forms.

Drafts use only the page URL as a key. Timeout logout preserves them but sets `previousUserId = null`; the next login clears drafts only when that previous ID is truthy and differs. A different user logging into the same tab can restore the preceding user's patient or appointment form at the same URL. The visit allow-list reduces copied content, but does not establish account ownership.

**Correction:** associate each draft with the authenticated principal and resource/operation identity. Preserve timeout drafts only for the same principal; clear or refuse restoration on any account change. Keep the previous owner through timeout logout and also enforce ownership inside the draft store.

### F03 · P1 · Patient/query caches and late responses survive session changes — confirmed

**Locations:** auth store; `src/features/patients/stores/patients.js` (`patientCache`, `patientsById`); dashboard `analytics.js` (`dashboard`, `reset`); `src/main.js` (Vue Query installation); lookup/user/visit/task stores; notifications `fetchAllPersistent`.

Logout/reset clears auth and some notification state, but does not clear feature data, the module-level patient LRU or Vue Query data/mutation caches. Dashboard can initially render the last account's patient summaries while a new fetch runs or fails. Stopping notification polling clears the interval, not an already running persistent request; its result can repopulate old-account data after reset. `fetchMe` also has no session generation guard.

**Correction:** centralize principal-change teardown, clear sensitive stores/caches and query state, abort relevant reads, and reject late results using a session generation/owner check. Reset methods must clear their data as well as loading/error flags. Keep clinical data out of browser persistence.

### F04 · P1 · Navigation cancellation loses uncertain mutation retry identity — confirmed

**Locations:** `src/router/index.js` (`cancelAllPending` before each navigation); `src/services/apiClient.js` (`cancelAllPending`, early `axios.isCancel`, `uncertainOperations`).

Navigation cancels pending writes as well as reads and clears their map. The cancellation response exits before uncertain-operation retention and request cleanup. If a create has committed server-side while the client stops observing it, a later retry can receive a new operation key and create a duplicate. Explicitly cancelled persistent requests can also leave bookkeeping retained.

**Correction:** cancel obsolete reads on navigation; let authorized writes finish or retain their operation identity through an uncertain outcome. Clean bookkeeping for every response path without treating cancellation as rollback. Bind retained operation state to its principal and expire entries independently of a repeat request.

### F05 · P1 · Clinical lookup search sees only the first catalog page — confirmed

**Locations:** `src/stores/lookupStoreFactory.js`; diagnosis/medication/scale lookup stores; `src/features/visits/composables/useVisitLookups.js`; `useVisitTemplates.js`; `ScalePickerModal.vue`; `src/stores/lookups.js`.

Lookup/template loads call `getAll()` once, ignore continuation metadata and cache the result as loaded. Backend cursor pagination defaults to 20 rows (`backend/core/pagination.py`). Visit search then filters that small array locally, so later diagnoses/medications cannot be found even with their exact name. Scale/template pickers are similarly incomplete. In addition, the compatibility wrapper captures Pinia-unwrapped arrays at construction; replacing the underlying lookup array does not replace the wrapper alias, so the scale-definition watcher can keep seeing its initial array.

**Correction:** use server search with controlled pagination for large catalogs, or exhaust pagination when a complete bounded catalog is required. Use `storeToRefs`/computed getters for compatibility aliases, one in-flight load promise, and explicit invalidation that coordinates lookup and Vue Query caches. Do not silently describe a first-page cache as the complete catalog.

### F06 · P2 · Calendar wrappers discard rescheduling arguments — confirmed

**Locations:** `src/features/appointments/components/CalendarView.vue`, `CalendarLayout.vue`; `DayViewGrid.vue`, `WeekViewGrid.vue`; `views/AppointmentsCalendar.vue` handlers.

The grids emit `(id, date, time)`. Both wrapper layers forward only `$event`, which is the first argument. The page's three-argument handler therefore sends undefined date/time to the reschedule service.

**Correction:** emit a documented object `{ id, date, time }` end-to-end, or forward all arguments at both layers. Preserve the opening appointment version and the existing successful-refresh behavior.

### F07 · P1 · Day calendar hides normal API bookings and simultaneous appointments — confirmed

**Locations:** `DayViewGrid.vue` (`appointmentForSlot`); `AppointmentBlock.vue` (`appointment.time`); `useCalendar.js`; backend appointment serializer.

Day slots use `HH:MM`, while the API's TimeField supplies `appointment_time` with seconds. Direct equality can fail for a normal `09:00:00` booking. AppointmentBlock displays a nonexistent `time` alias. Even after normalizing time, `find()` renders only one appointment per slot; multiple doctors at the same start time, unaligned starts and occupied duration after the starting slot are not represented. The UI can present booked time as free, although backend booking validation remains authoritative.

**Correction:** normalize the service DTO once, render all bookings in each relevant doctor/time interval, and separate display granularity from actual availability. Use `appointment_time` consistently. Preserve status and permissions.

### F08 · P2 · Month dates sit under the wrong weekday — confirmed

**Locations:** `MonthViewGrid.vue` (`dayHeaders`, `lead`); unused `MiniCalendar.vue` has the same convention mismatch.

Headers start Sunday, but leading cells are calculated with a Monday-first formula. A month beginning on Sunday gets six leading cells and is displayed under Saturday. MiniCalendar also checks an appointment `date` alias instead of `appointment_date`.

**Correction:** choose one week-start convention and share it across headers, padding, weekend marking and week calculations. Normalize the appointment date field.

### F09 · P1 · Busy calendar periods are silently truncated — confirmed

**Locations:** `useCalendar.js` (`per_page: 500`, response extraction); backend `apps/appointments/views.py` offset/limit pagination.

The backend caps this endpoint at 200 rows; the calendar ignores total/offset metadata and never fetches the remaining pages. A busy month can omit bookings with no incomplete-data indicator.

**Correction:** fetch the complete selected range using the endpoint's actual offset contract, or narrow the rendered/fetched range and show an explicit incomplete-data state. Do not increase the client page size beyond the server cap.

### F10 · P2 · Calendar request ownership and lifecycle are incomplete — confirmed

**Locations:** `useCalendar.js` (`fetchController`, `finally`); `AppointmentsCalendar.vue` (`onMounted`, `handleResize`, `navigate`).

An older aborted request's `finally` clears the newer request's controller/loading flag. Failed loads retain prior-period appointments and have no local failure state; the page still marks refresh time. The page attaches its resize listener after awaiting doctors, so unmount during that await can leave a listener attached after cleanup. Its resize debounce is not cancelled. Month navigation retains the day number: advancing March 31 with `setMonth` can skip April.

**Correction:** use a request identity/generation and disposed flag, conditional cleanup, explicit error/retry state and cancellable debounce. Register listeners synchronously or check disposal after awaits. Normalize/clamp month navigation before changing the month; validate route view values.

### F11 · P2 · Date parsing loses offsets and accepts rollover dates — confirmed

**Locations:** `src/composables/useDate.js` (`parseDate`, relative-date helpers, `normalizeFormDates`).

The ISO datetime regex passes only the matched minute prefix to Date, dropping seconds and timezone information. The `YYYY-MM-DD` branch accepts dates such as February 31 and rolls them forward; normalization can then submit a different date. Future dates are described as negative days ago or “now”.

**Correction:** parse full timestamps with their offset, validate date-only year/month/day by round-trip equality, and distinguish past/future formatting. Reject malformed manual form/filter dates with feedback instead of silently converting them.

### F12 · P2 · Lazy date picker initialization has locale, value and teardown gaps — confirmed

**Locations:** `useDate.js` (`loadFlatpickr`, defaults); `DatePicker.vue`; `DateRangePicker.vue`; `FormDate.vue` consumers.

Components compute defaults before Arabic locale has loaded, capturing `locale: 'default'`, then pass it back as an override after loading. The first picker can therefore remain English. The loader has no shared readiness promise, and unmount during import can create an instance after its teardown already ran. Single DatePicker supplies raw ISO strings to a `d/m/Y` parser; the range picker correctly converts to Date first. A disabled single picker still exposes an enabled clear action. DatePicker marks `required` on the wrapper but does not put native `required` on its input, relevant to forms relying on browser validation.

**Correction:** await one module/locale readiness promise, create defaults afterward, parse incoming values explicitly, destroy late instances, and apply disabled/required consistently to all control actions.

### F13 · P2 · Async selectors can lose their active request handle — confirmed

**Locations:** `ApiSelect.vue` (`fetchOptions`, `finally`); unused `AsyncSelect.vue`; active appointment/billing/administrative selectors.

Both selectors cancel a prior request, but its `finally` unconditionally clears the controller and loading flag belonging to the next request. ApiSelect also extracts whichever object property comes first, rather than the explicit list contract, and keeps old options with no local error/retry state. AsyncSelect's error path returns undefined to a search interface expecting an array; its selected value is copied once from props. Those latter defects are latent because no current consumer was found.

**Correction:** use request identity/generation guards and a disposed flag, validate the response list/envelope and show a meaningful failed-load state. Keep controlled model values synchronized. Reuse the identity check already present in TimeSlotPicker rather than weakening it.

### F14 · P2 · MultiSelect combines unguarded search and nested interactive controls — confirmed

**Locations:** `MultiSelect.vue`; active patient-team and visit diagnosis/medication consumers.

Search results have no sequence guard, so an older response can replace newer results or reopen a dismissed panel. Debounced work survives teardown. The dropdown trigger contains remove buttons inside a button, and option buttons contain checkboxes; these nested controls give conflicting keyboard/default activation. Duplicate marking mutates objects from the incoming model.

**Correction:** give trigger and tag removal separate semantic buttons, use one selectable-option interaction, cancel/ignore stale searches, expose search failure separately from no results, and update model rows immutably.

### F15 · P2 · List refreshes can drop new filters and hide failures — confirmed

**Locations:** `usePagination.js` (`refresh`, `loadCursor`); `ListView.vue` (`onFilterChange`, filter watcher, `initialLoad`).

Refresh clears cursors, then refuses to fetch while a prior request is loading. Changing filters during a slow load can leave the old-filter response as the visible result. Parent prop synchronization and the debounce also cause redundant refresh attempts. Pagination catches errors internally, so ListView's catch cannot establish an error page; it ignores the returned error ref and lacks a local retry state. Global API notifications still occur, so these are not completely silent failures.

**Correction:** make refresh replace/queue the latest requested filters, guard response generations and maintain independent initial/load-more/error state. Choose one filter refresh owner, expose retry, and cancel the debounce on teardown.

### F16 · P2 · Select-all loses the visible row IDs — confirmed

**Locations:** `DataTable.vue` emits `toggle-all(boolean, ids)`; `ListView.vue` forwards only `$event`; `PatientsList.vue` calls `selectionStore.selectAll(ids)`.

The IDs disappear at the wrapper, and selecting all reaches `...ids` with undefined. ListView also declares selectedIds as Set while the active selection store supplies an array.

**Correction:** forward both arguments or a typed/documented object; align accepted selection types. Keep select-all scoped to the intended visible rows.

### F17 · P2 · Patient/visit deletions leave their rendered list stale — confirmed

**Locations:** `PatientsList.vue` (`deletePatient`); `VisitsList.vue` (`deleteVisit`); `VisitsListLayout.vue`; `ListView.vue` private pagination items.

Patient deletion updates the patient store, but the table is backed by ListView's independently fetched array. Visit deletion likewise has no refresh-key or item removal. Successful archived/deleted rows remain visible and actionable until an unrelated reload. Selection may retain deleted IDs.

**Correction:** refresh/invalidate the actual list owner after success and reconcile selection. Give the visit layout a refresh contract, as billing/catalog/tasks already do.

### F18 · P1 · Failed edit hydration leaves a saveable blank form — confirmed

**Locations:** `InvoiceForm.vue`, `TemplateForm.vue`, `UserForm.vue`, `PatientForm.vue`, `AppointmentForm.vue`, `VisitForm.vue`; `UserPermissions.vue`.

These paths retain editable initial values after a failed resource load. Several catches explicitly say “Keep empty form”; some screens show a toast, but none establishes a durable loaded-resource gate. A version-one resource can accept a newly completed blank replacement form; other versions reject it, but the UI still offers an unsupported edit. UserPermissions renders an empty grant form after failed loading. Users can also start typing before hydration completes and have their input overwritten.

**Correction:** distinguish loading, loaded and failed states; block edit submission until the specific resource and opening version are loaded. Show retry and preserve intentional drafts. Capture lifecycle disposal before creating post-await draft watchers in patient/appointment forms.

### F19 · P2 · Mandatory password-change workflow is not routed — confirmed

**Locations:** `src/router/guards.js`; auth Login/store; `ChangePassword.vue`; backend force-password middleware.

The server blocks ordinary APIs for `force_password_change`, but router/login paths send the user to Dashboard without a corresponding gate or automatic ChangePassword route. The backend remains secure; the user gets forbidden dashboard requests instead of a clear required action.

**Correction:** route flagged users to ChangePassword while allowing logout and the permitted account endpoints. Preserve the existing successful password-change session reset/login redirect, which already matches server revocation.

### F20 · P2 · UI grants every permission to the admin role — confirmed

**Locations:** `src/features/auth/stores/auth.js` (`can`); guards/navigation/action consumers; backend accounts effective-permission implementation.

`role === 'admin'` returns true before considering permissions. The server supports actual group/direct grants and does not make the role alone a blanket bypass. Restricted administrators therefore see routes/actions they cannot execute. This is a frontend permission-contract mismatch, not a server authorization bypass.

**Correction:** use the server's effective grant set and explicit superuser semantics, with role checks only for genuinely role-restricted policy. Add permission gates to shared action surfaces rather than inferring unrelated grants such as manage_users for catalog links.

### F21 · P2 · Theme and dark-mode state have multiple owners — confirmed

**Locations:** `useAppTheme.js`, `src/stores/ui.js`, settings store; `MainLayout.vue`.

MainLayout reads `darkIcon` from useAppTheme's private refs but toggles uiStore.darkMode. Settings changes update a third copy and the body. The icon can remain stale; a later UI-store toggle can apply its old theme again.

**Correction:** keep one reactive theme/dark-mode owner and derive icon, persistence and body application from it. Make settings responses update that owner without copying mutable state into independent composables.

### F22 · P2 · Pinia preference persistence never sees its configuration — confirmed by isolated probe

**Locations:** `src/stores/plugins/persist.js` (`store.$options?.persist`); `src/stores/ui.js` third defineStore argument.

The plugin reads `$options` from the store. The installed Pinia probe reported `storeHasOptions: false`, while `context.options.persist` contained the supplied configuration. Consequently the plugin returns before hydrating/subscribing sidebar and density preferences.

**Correction:** read `options.persist` from the plugin context; keep its explicit safe-path allow-list and storage fallback. This probe used a fresh synthetic store and no mounted DOM or clinic state.

### F23 · P1 · Removing the last treatment goal restores the old goals on save — confirmed

**Locations:** `src/features/visits/composables/useVisitForm.js` (`buildPayload`, `clinical.goals`); active VisitForm goal removal.

The payload begins by copying existing clinical_data, including old goals, then replaces goals only when the current form array has a nonzero length. Removing all goals therefore leaves the previous goals in the saved clinical object.

**Correction:** always assign a cloned current goals array, including `[]`, while preserving unrelated clinical-data keys. Treat empty collection as an intentional update rather than an omitted field.

### F24 · P1 · Scale add/remove controls also submit the visit — confirmed

**Locations:** `src/features/clinical/components/ScaleRenderer.vue` raw buttons; active `VisitClinicalNotes.vue` inside VisitForm's form.

Both raw buttons omit `type="button"`. Their default is submit inside the visit form, so clicking “add scale” or “remove” runs that UI action and also submits the visit. The current form schema requires only visit date, making accidental saves especially plausible.

**Correction:** explicitly mark non-submit buttons as button throughout reusable form controls. Preserve a single intentional submit action. AppTabs/DateRangePicker have the same latent embedded-form default concern.

### F25 · P2 · Scale rehydration needs edit ownership; zero bounds are replaced — mixed finding

**Locations:** `useVisitScales.js` (`rawResponses`, `buildFromRaw`, lookup watcher); `src/stores/lookups.js`; `ScaleRenderer.vue`.

The renderer uses `max_val || 10`, replacing a legitimate zero maximum: this is a confirmed source defect. Separately, the definition watcher rebuilds the entire working scale array from original server responses. F05 currently prevents that watcher from following array replacements; when repairing those aliases, keep a late load/invalidation from restoring removed scales or overwriting unsaved answers. That second point is a correction-design recommendation, not a claim that the currently disconnected watcher overwrites answers in production.

**Correction:** use nullish defaults for numeric bounds. When repairing definition reactivity, hydrate once per visit revision or merge metadata without replacing edited answers/additions/removals. Prefer persisted definition snapshots for historical responses.

### F26 · P1 · Signature editing and saved issuance data diverge — confirmed

**Locations:** `SignaturePad.vue` (`startDraw`, `clear`, `save`); `PrescriptionPreview.vue` (`signatureData`, `onSignatureSave`).

Each mouse/touch stroke replaces previous points/path, retaining only the last stroke of a multi-stroke signature. Clear does not emit a reset; neither does subsequent drawing invalidate the parent's saved PNG. A user can see an empty or changed signature while Generate still submits the earlier saved image.

**Correction:** preserve separate strokes, emit controlled change/clear state that invalidates saved output, and rasterize all strokes only when the current drawing is valid. Retain PNG/JPEG output, which matches the backend; do not return to SVG uploads. Handle unavailable canvas context gracefully.

### F27 · P2 · Visit administrative inputs advertise edits the server ignores — confirmed

**Locations:** `VisitAdministrative.vue`; `useVisitForm.js`; backend `VisitSerializer.Meta.read_only_fields`.

The form offers date_signed and signed_by_id editing and submits them, but both are read-only server signing metadata. The chosen signer/date do not become the authoritative signature. Similar mismatch: AppointmentForm lets users change patient/doctor during edit although the backend rejects those changes.

**Correction:** display signing metadata read-only and use the actual finalization operation/current authorized actor. Disable immutable appointment relations during edits and explain the supported replacement workflow; do not fabricate an API that changes them.

### F28 · P2 · Dashboard converts unknown risk into Low — confirmed

**Locations:** `DashboardLayout.vue` (`getPatientRiskLevel`); other risk displays already use `getRiskInfo`.

Any value not High/Moderate becomes Low, including missing/unassessed risk. A high-risk list entry without a fully populated latest_visit can show a contradictory reassuring badge.

**Correction:** preserve unknown/unassessed as a separate state and use the shared risk helper. Check the dashboard DTO rather than assuming a patient object itself carries visit risk. Keep null clinical measurements visually distinct from zero in ScoreInput as well.

### F29 · P2 · Independent query writers can overwrite filter changes — confirmed source race

**Locations:** `src/composables/useRouteQuery.js`; list pages updating multiple query refs; AppointmentsCalendar.

Each watched field independently calls router.replace with a spread of the currently committed route.query. Multiple field changes in one turn can build separate stale query objects, and the last navigation drops other changes. Calendar only copies route date/view into its working refs on mount; same-path query changes do not update its visible range/view. Patient detail tabs likewise only consume the initial query.

**Correction:** update a complete query object once per action, coalesce watched updates, and avoid rewriting an already-equal query. Establish explicit two-way synchronization for same-path calendar/tab navigation with validated values.

### F30 · P2 · Dashboard refresh can report success after failure — confirmed

**Locations:** `analytics.js` (`fetchDashboard` catch); `Dashboard.vue` (`refreshAll`).

The store swallows the fetch rejection and sets error; refreshAll awaits a fulfilled promise, advances lastUpdated and announces success. The layout does not show that error. Statistics/Reconciliation similarly have no durable failed-load display and can leave old or zero counters presented as current.

**Correction:** return an explicit success result or rethrow; only update freshness on success. Expose loading/error/retry while preserving clearly labelled previous data. Track overlapping requests individually and prevent older reporting results replacing newer filters.

### F31 · P2 · Patient detail hides partial-load failures and completeness limits — confirmed

**Locations:** `PatientDetail.vue` (`loadVisits`, `loadAppointments`, `fetchCareTeam`); detail/sidebar/records panels.

Failed child loads become empty arrays and the parent marks the page content-ready. “No visits”, no team or no appointments can mean failed/forbidden loading. Only ten appointments are fetched with no continuation UI; linked longitudinal-record selectors reuse these lists. After team addition/removal only the team list refreshes, so care-team-dependent completeness/other patient metadata can remain stale.

**Correction:** give each section independent loaded/error/permission state and retry, show pagination/completeness explicitly, and refresh the parent summary after team mutations. Preserve the records panel's existing generation guard and opening parent-version capture.

### F32 · P2 · Import/restore previews can be replaced by stale responses — confirmed conditional path

**Locations:** `ImportData.vue` (`previewFile`); `ImportOptions.vue` (upload/mapping watchers); `BackupView.vue` (file/options/preview state).

Selecting another file/doctor/options while a preview is pending does not invalidate the request's eventual result. An old preview can populate the current selection; medicine file changes do not immediately clear the previously uploaded preview. Backend token/digest binding should reject mismatched execution, but the user can review misleading counts and receive an avoidable conflict. Confirmation values are not consistently reset when selection changes.

**Correction:** snapshot file/options per request, use generation checks, clear previews/tokens/confirmations immediately on every relevant change, and disable conflicting selection/execution during committed actions. Keep mandatory backend preview binding and scope confirmation. Revoke BackupView's downloaded object URL; handle FileReader error/abort and late stamp previews too.

### F33 · P2 · Numeric FormInput constraints land on the wrapper — confirmed

**Locations:** `FormInput.vue` public props/inner input; settings reminder inputs with min/max.

FormInput forwards step but does not declare/forward min/max or general input attributes. Fallthrough reaches FormField's root div, so the rendered input does not enforce the advertised numeric bounds. Settings' save button is also outside a native validating form.

**Correction:** define supported input attributes explicitly or use controlled attribute forwarding to the actual input; retain accessibility attributes. Validate settings ranges before submission and show specific inline feedback.

### F34 · P2 · Administrative modal validation relies on ineffective required attributes — confirmed

**Locations:** `ScalesAdmin.vue`, diagnosis/medication management modals; `BaseModal.vue` footer confirm action; UserForm stamp validation.

Catalog dialogs place required controls in modal content but confirmation is a button action with no form checkValidity/schema gate. ScalesAdmin also discards useApi loading flags for create/add-field, so confirm remains enabled during the operation. The backend still validates, but invalid data produces general API errors rather than inline correction. Invalid user stamp files are silently discarded.

**Correction:** make modal actions validate a real form/schema, surface field errors and bind pending state to confirmation. Give rejected file selections a clear message. Avoid duplicate submissions during pending validation/mutation.

### F35 · P2 · Table and tabs accessibility contracts are incomplete — confirmed

**Locations:** `AppTabs.vue`, `AppTabPanel.vue`, active patient detail; `DataTable.vue`; `BasePagination.vue`.

Panels label themselves with `tab-{id}` but no tab button has that ID. Tabs have no arrow-key/roving-tabindex behavior or unregister operation when conditional panels disappear. DataTable tries to detect its declared row-click listener in `$attrs`, where declared emitted listeners are excluded; rows have no keyboard activation. Pagination icon buttons lack accessible names/current-page state. Patient detail uses empty tab panels with actual content elsewhere, so its tab/panel associations do not describe the visible content.

**Correction:** connect real tab content to stable tab/panel IDs, manage active registration and standard keyboard behavior; provide accessible row links or optional keyboard activation without hijacking child controls. Name pagination/navigation actions and indicate current selection.

### F36 · P2 · Reconciliation revenue uses the wrong currency label — confirmed

**Locations:** `Reconciliation.vue` (`formatMoney` without currency); `src/utils/formatters.js` default `ر.س`; invoice currency defaults SYP.

The reconciliation total is labelled Saudi riyals while standard invoice flows use SYP. The backend total also does not provide a currency breakdown; a single formatter cannot resolve mixed-currency aggregation.

**Correction:** use the configured/returned currency explicitly. If more than one currency is supported, display separate totals from a corresponding backend contract rather than adding unlike amounts.

### F37 · P1 · Dashboard notes persist as plaintext and privacy copy overpromises — confirmed

**Locations:** `EditableNotes.vue`; `DashboardLayout.vue`; `PrivacyPolicyView.vue`.

The active free-form scratchpad stores arbitrary notes in localStorage indefinitely, without logout cleanup, retention policy or a clinical-content boundary. Its user-ID key is organization, not encryption. PrivacyPolicy claims all stored information is encrypted; the source already contradicts that for browser notes and cannot establish deployment/database encryption.

**Correction:** decide whether the scratchpad is clinical content. Use authenticated server storage with access/retention rules if it is, or remove persistence/restrict its purpose and clear it on principal change. Revise product copy to accurately reflect implemented and deployment-verified controls; do not claim encryption based on source review alone.

### F38 · P1 · Production error logging can expose request payloads — confirmed risk path

**Locations:** `src/main.js` error handler; `ErrorBoundary.vue`; `useError.js`; `ApiSelect.vue`; `useCalendar.js`; `TimeSlotPicker.vue`; auth logout catch.

Several unguarded console calls log entire exception objects. Axios errors include request configuration and data; unhandled feature mutations can reach the global handler with patient details or account password payloads. This is a source-established disclosure risk at the reporting boundary, not evidence that a particular password was logged. No actual patient data was read/logged during this review. DEV-only warnings are a different category, but should still be redacted during development.

**Correction:** log only safe error codes, operation names and correlation IDs; redact bodies, headers and user-entered values at a shared reporting boundary. Surface actionable errors to users independently of logging.

### F39 · P2 · Checkbox/radio glyph centering is wrong in RTL — confirmed source geometry

**Locations:** `public/static/css/forms/choices.css` checked pseudo-elements.

Pseudo-elements use `inset-inline-start: 50%` with physical `translateX(-50%)`. In RTL that anchor is from the right, but the transform still moves left, placing the mark/dot off center. Existing toggle-switch RTL mirroring is correct and should be retained.

**Correction:** use physical left:50% for this centering operation or flip the X translation explicitly in RTL. Verify checked states in both directions.

### F40 · P3 · Vue-only deep selectors are shipped in global CSS — confirmed

**Location:** `public/static/css/forms/date-picker.css` (`:deep(.flatpickr-footer)`, today button rules).

This file is delivered as browser CSS through app.css, not compiled as a scoped Vue style. `:deep()` is not a native selector, so these footer rules do not style the injected controls. Scoped statistics deep selectors are appropriate and are not the same issue.

**Correction:** use ordinary selectors in the global stylesheet, retaining the intended widget scope.

### F41 · P2 · Some palette/button combinations have obviously weak contrast — confirmed source colors; rendering unverified

**Locations:** `themes/prussian-orange.css`, `vanilla-tangerine.css`, `deep-space-strawberry.css`; `components/buttons.css`, `components/tags.css`; dark-mode semantic colors.

White inverse text is paired with bright orange `#fca311`, peach `#f19c79` and cream warning `#f2e8cf` on solid buttons/tags. Those combinations are visibly weak from the literals. Dark mode darkens primary/dark semantic foregrounds while several links/headings still use them on a dark surface. This is a focused inferable contrast issue, not a full WCAG audit.

**Correction:** give solid semantic backgrounds their own readable foreground tokens; choose brighter dark-mode foreground/link variants independently from fills. Verify actual states/fonts against rendered backgrounds.

### F42 · P3 · Delayed callbacks and motion still outlive their owners — confirmed

**Locations:** `EditableNotes.vue` save debounce; `RouteProgressBar.vue` finish timeout; `StatCard.vue` animation frames; `NotificationCenter.vue` badge timeout; AppStatusBar announcement timer; `utils/index.js` debounce.

EditableNotes can save after unmount and then create another timer; a previous route finish timeout can hide the next route's progress. StatCard does not cancel/serialize animation frame chains on value changes or teardown. Other finite timers are not cleared. Token-based reduced motion does not disable hardcoded infinite pulse/spinner/splash/time-line animations; some duration aliases include timing functions and are then used in duration-only properties.

**Correction:** provide cancel/flush debounce contracts, keep timeout/frame handles and cancel on replacement/unmount, and guard async continuations. Separate duration/easing tokens and explicitly honor reduced motion for hardcoded animations. Do not describe finite leftover work as an unlimited memory leak.

### F43 · P2 · Existing navigation/background-loading findings remain open — confirmed, carried forward

**Locations:** `AppNavigation.vue`, `BottomNav.vue`, router section identity (**N6**); `useNavigationItems.js`, API client/loading store (**N7**); [existing navigation record](../ui/navigation.md).

Sibling detail/create/edit routes still lose their section highlight. All API requests still activate global loading, including dashboard badges and persistent polling; repeated dashboard requests amplify it. These are the existing N6/N7 findings, not additional duplicates.

**Correction:** share section identity and appropriate aria-current; distinguish blocking foreground operations from background refresh and reuse current dashboard data. Preserve previously completed N1–N5/N8 overlay/search/calendar behavior unless new evidence establishes a regression.

## Latent defects and recommendations

### L01 · Unused alternate layouts and broken import

`PatientFormLayout.vue` evaluates `$emit('cancel')` while rendering its cancel-fn prop; active PatientForm does not use this layout and passes a proper function. `VisitFormLayout.vue` omits scale field-update forwarding and references ScalePickerModal without an explicit import; active VisitForm has correct forwarding and async import. `clinical/components/AuditLog.vue` imports nonexistent `./VerticalEventList.vue`; no active consumer was found. Correct these before reuse or remove them after confirming external usage. Do not count the unused patient layout as current patient-form navigation failure.

### L02 · Shared APIs need narrower documented contracts

The application is JavaScript/Vue, so TypeScript-only rules are N/A to most files. Public interfaces still benefit from JSDoc typedefs and runtime validation: patient/visit/appointment DTOs, paginated results, permission sets, versions, selector options and multi-argument events. `listFetch.js` and `useRouteQuery.js` use broad `any` documentation; generic Object/Array props often omit item shapes. Prefer generics/typedefs around existing interfaces rather than adding loose `any` in a future conversion. Document when empty, null and omitted mean different updates.

### L03 · Latent helper behavior

Unused AsyncSelect defects are in F13. FormGenerator copies modelValue once and lacks incoming reset/hydration synchronization. TimePicker/useTimeSlots do not validate positive step/bounds; zero/negative step can loop forever, and non-divisors of 60 lose minute remainder. Current calendar uses the safe default 30-minute step. BaseButton's disabled anchor/router variants do not block navigation; confirmation does not prevent default link navigation before awaiting approval, and to-variants do not emit click. No active disabled/confirmed-link use was established. Make these interfaces safe before reuse and retain the current route watcher that closes notification panels.

### L04 · Error ownership and user feedback

API interceptor, useApi, form submission and feature catches can announce the same failure/success more than once. Empty catches that deliberately defer to the shared error handler or make optional duplicate detection nonblocking are not automatically defects. Establish one reporting owner per operation and a standard field-error envelope; keep local load errors visible. Capture request inputs before awaiting instead of reading mutable selection again. Add pending guards to destructive/state transitions, and avoid redundant confirmations (task/visit deletion currently confirm at multiple layers).

### L05 · Responsibility and duplication

Retain feature services and the shared cursor-fetch helper. Remove or reconcile unused alternate patient/visit layouts, duplicated cancellation/download/envelope code, redundant analytics caches and dev prototypes. Consider one payload adapter per domain so calendar time normalization, visit inputs and response envelopes cannot diverge. Split the larger orchestration files by behavior only when it makes ownership clearer; do not split cohesive token/theme files solely to meet a line count. Patient-record one-line templates/scripts are difficult to audit despite being small; format them into readable blocks without changing behavior.

### L06 · Comments, TODOs and dead code

No TODO or FIXME markers were found in the 431-file inventory. Other incomplete work is explicit product placeholder text in About/Manual views. `useSession.js` still documents draft options/exports now owned by useFormDraft; useVisitForm comments also still name useSession/useSWR. Auth's “nothing needs to be reset” comment conflicts with principal isolation (F03). ShortcutsModal advertises Alt+Q without an App handler. RoutePerformanceDashboard has no active import, hides its own toggle inside a false outer condition, and installs a router hook without release if instantiated. Numerous FIX/history comments and comments naming former paths can be shortened after retaining useful contract rationale. Delete dead code only after reference/export validation.

### L07 · Responsive, print and CSS ownership follow-up

Ordered CSS imports, mirrored scoped styles, literal media breakpoints, logical shell gutters, minmax(0,1fr), explicit drawer direction and shared overlay focus ownership are good existing foundations. Preserve them. Review fixed-width lab/availability/vertical-event layouts and long medication/identity text at narrow widths; don't assert rendered overflow without rendering. Global/scoped duplicate selectors are not alone evidence that they should be merged. Print CSS forces RTL and uses current theme colors; dark-theme printing and mobile table display require an explicit rendered check. Document print ownership consistently with the scoped referral print-only override. CSS path comments still mention removed layout.css/tokens.css. No token cycle was introduced or theme architecture reopened by this review.

### L08 · SEO and translations applicability

This is an authenticated internal Arabic SPA with no detected i18n runtime. Hardcoded Arabic text is therefore not a translation-system defect. Keep shared terminology/messages consistent; introduce i18n only if multilingual support is actually intended. Router page titles and root charset/viewport metadata exist; index.html has no meta description, and no route description updater was found. Add accurate descriptions to public informational entry points if indexing is intended; page-specific marketing descriptions are low-value for private clinical views. Make a deliberate deployment decision about indexing/noindex and public informational routes, never include patient names/details in searchable metadata. This is not a request to make clinical routes publicly indexable.

### L09 · Release payload/configuration

Vite deliberately disables JS/CSS minification and enables sourcemaps; full Font Awesome style/icon imports and all global CSS/themes are loaded eagerly. This may be appropriate for development but should have an explicit release policy. Inspect actual bundle/network sizes only with build/runtime authorization before claiming measured bloat. Keep heavy widget/chart/date imports lazy where already designed; avoid fetching the entire catalog for a tiny selector without a bounded contract (F05). Environment URL configuration exists; `.gitignore` does not explicitly exclude `.env.local`, so add local-secret hygiene in a follow-up without changing versions or exposing env contents. No secret leak was established.

### L10 · Additional small contract improvements

Use nullish numeric defaults (zero age/scale limits/progress are real values); distinguish unknown pain/anxiety from visible zero; allow an intentional unknown risk selection after a prior value. Document controlled-medication quantity before showing an empty authorized-quantity line. Use current constants for fallback care levels: Voluntary/Involuntary belong to care_basis, not level_of_care. Clipboard/directive handlers capture initial bindings and need updated handling if their value changes; useFormDirty.stop is a no-op and should not promise cleanup. Toast duration zero currently dismisses immediately unless persistent is set, contrary to its comment. useApi accepts one mutation variables value, not arbitrary execute positional business arguments; query execute currently discards its returned refetch result. Keep these contracts honest and avoid speculative new APIs.

## Checklist disposition

| Supplied criterion | Review outcome / follow-up |
| --- | --- |
| Single-purpose modules and scoped state | Existing structure useful; F03/F21 and L05 identify ownership drift/duplication. |
| Props/events documented and type safety | F06/F16/F27/F33; L02/L03. JS does not require a blanket TS migration. |
| Redundant reactive work and payload/bundle costs | F05/F15/F21/F29/F43; L09. No measured bundle-size claim. |
| Side effects, event listeners, timers and teardown | F10/F12/F13/F14/F18/F42; existing overlay stack listeners/focus cleanup retained. |
| WebSocket reconnect/close | N/A: no WebSocket/EventSource implementation found in reviewed source. Notifications use polling. |
| Async races and stale state | F03/F04/F10/F13/F15/F25/F29/F32. |
| Null/undefined and naming/constants | F07/F11/F28/F36; L02/L06/L10. |
| Comments/dead code/TODO/FIXME | L01/L05/L06; no TODO/FIXME markers detected. |
| Loading/errors and no swallowed actionable failure | F10/F13/F15/F18/F30/F31/F34; L04. Optional/shared-handler catches distinguished. |
| Form validation and clear invalid-submit feedback | F01/F12/F18/F24/F27/F33/F34; retain shared form error summaries. |
| Semantics/labels/keyboard/dialog focus | F01/F14/F35/F39. Overlay stack supplies trapping, inert siblings, Escape and focus return; broader combinations require rendering. |
| Obvious contrast | F41 only; no exhaustive WCAG audit. |
| Translation system | N/A to existing Arabic-only implementation; L08. |
| Page titles/description/SEO | Existing title/root metadata; internal-route applicability in L08. |
| Responsive layout/RTL/print | F08/F39/F40; L07 and pre-existing unverified matrix. |
| Config/magic values | F07/F09/F36; L09/L10. Keep env-based API configuration. |
| Dev-only behavior | L06/L09; demo-data action remains guarded by system config and confirmation. |
| Sensitive logging/storage | F02/F03/F37/F38; secrets not inspected. |
| XSS/unsafe rendering | No v-html/innerHTML/outerHTML sink found in reviewed source; Vue interpolation and notification relative-link filtering retained. Not a penetration test or guarantee against every URL/DOM path. |
| Duplication and bloat/over-fetching | F05/F09/F43; L05/L09. |

## Verification and limits

| Check performed | Result |
| --- | --- |
| Individual source/config/CSS reading | 431 files; ledger below. |
| JavaScript AST parse | 133 JavaScript files and script sections of 197 Vue files: no parse errors. |
| Vue SFC descriptor parse | 197 files: no descriptor parse errors. No template compilation. |
| PostCSS syntax parse | 96 files: no parser errors. Does not validate native selector/value semantics or cascade/rendering. |
| Relative/@ imports and external style references | One missing first-party reference: unused AuditLog import (L01). No additional missing relative/style reference found. |
| TODO/FIXME inventory scan | No markers in scoped files. |
| Installed Pinia synthetic probe | Store has no $options; plugin context options carries persist (F22). |
| Backend contract comparisons | Relevant production code only; no migration/test-suite inspection. |

No new browser, screen-reader, network, live-account, PDF-rendering, production build or test-suite validation was performed. Prior checks in doneCurrent are historical, not rerun evidence for this review. A file with no associated finding is not guaranteed defect-free. Fix verification should first reproduce the concrete trigger using synthetic data, then confirm the correction and related active consumers within separately authorized checks.

## Suggested correction order

1. Account isolation and privacy: F02–F04/F37/F38.
2. Shared form and clinical-data preservation: F01/F18/F23–F26.
3. Scheduling contracts and completeness: F06–F10/F27.
4. Lookup/list/async correctness: F05/F11–F17/F29–F34.
5. Permissions/password/theme/persistence/accessibility: F19–F22/F28/F35/F39–F43.
6. Reconcile unused alternatives, public documentation and release/layout follow-up after active defects are corrected.

These are recommendations for a later fix task, not completed implementation.

## File-by-file coverage ledger

Each entry records the responsibility checked and findings involving that file. “No separate finding” means no independent issue was established during source review, not a runtime pass. Shared consumers can still inherit findings such as F01/F04/F15.


### Root configuration

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [.gitignore](../../.gitignore) | Repository exclusions and local-file hygiene | L09 |
| [eslint.config.js](../../eslint.config.js) | eslint.config configuration and resolution | No separate finding |
| [index.html](../../index.html) | HTML shell, metadata, initial preferences and assets | L08 |
| [jsconfig.json](../../jsconfig.json) | jsconfig configuration and resolution | No separate finding |
| [package.json](../../package.json) | Dependency/scripts/workspace configuration (no versions changed) | No separate finding |
| [pnpm-workspace.yaml](../../pnpm-workspace.yaml) | Dependency/scripts/workspace configuration (no versions changed) | No separate finding |

### public/static

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [public/static/css/app.css](../../public/static/css/app.css) | app styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/base/reset.css](../../public/static/css/base/reset.css) | reset styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/base/splash.css](../../public/static/css/base/splash.css) | splash styles; cascade, sizing, direction and state rules | F42 |
| [public/static/css/base/state.css](../../public/static/css/base/state.css) | state styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/base/typography.css](../../public/static/css/base/typography.css) | typography styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/accordion.css](../../public/static/css/components/accordion.css) | accordion styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/avatar.css](../../public/static/css/components/avatar.css) | avatar styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/buttons.css](../../public/static/css/components/buttons.css) | buttons styles; cascade, sizing, direction and state rules | F41 |
| [public/static/css/components/cards.css](../../public/static/css/components/cards.css) | cards styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/charts.css](../../public/static/css/components/charts.css) | charts styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/checklist.css](../../public/static/css/components/checklist.css) | checklist styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/collapsible-section.css](../../public/static/css/components/collapsible-section.css) | collapsible section styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/content-navigation.css](../../public/static/css/components/content-navigation.css) | content navigation styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/danger-zone.css](../../public/static/css/components/danger-zone.css) | danger zone styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/day-grid.css](../../public/static/css/components/day-grid.css) | day grid styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/detail-item.css](../../public/static/css/components/detail-item.css) | detail item styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/dropdown-menu.css](../../public/static/css/components/dropdown-menu.css) | dropdown menu styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/filters.css](../../public/static/css/components/filters.css) | filters styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/key-value-list.css](../../public/static/css/components/key-value-list.css) | key value list styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/modal.css](../../public/static/css/components/modal.css) | modal styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/navigation.css](../../public/static/css/components/navigation.css) | navigation styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/components/notifications.css](../../public/static/css/components/notifications.css) | notifications styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/overlay.css](../../public/static/css/components/overlay.css) | overlay styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/presentation-widgets.css](../../public/static/css/components/presentation-widgets.css) | presentation widgets styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/components/progress.css](../../public/static/css/components/progress.css) | progress styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/record-controls.css](../../public/static/css/components/record-controls.css) | record controls styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/steps.css](../../public/static/css/components/steps.css) | steps styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/tables.css](../../public/static/css/components/tables.css) | tables styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/tabs.css](../../public/static/css/components/tabs.css) | tabs styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/components/tags.css](../../public/static/css/components/tags.css) | tags styles; cascade, sizing, direction and state rules | F41 |
| [public/static/css/components/tooltips-loading.css](../../public/static/css/components/tooltips-loading.css) | tooltips loading styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/documents/pdf.css](../../public/static/css/documents/pdf.css) | pdf styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/features/appointments/day.css](../../public/static/css/features/appointments/day.css) | day styles; cascade, sizing, direction and state rules | F42 |
| [public/static/css/features/appointments/month.css](../../public/static/css/features/appointments/month.css) | month styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/features/appointments/shared.css](../../public/static/css/features/appointments/shared.css) | shared styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/features/appointments/week.css](../../public/static/css/features/appointments/week.css) | week styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/features/clinical/care-widgets.css](../../public/static/css/features/clinical/care-widgets.css) | care widgets styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/features/clinical/cbt-record.css](../../public/static/css/features/clinical/cbt-record.css) | cbt record styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/features/clinical/letter-sheet.css](../../public/static/css/features/clinical/letter-sheet.css) | letter sheet styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/features/clinical/medications.css](../../public/static/css/features/clinical/medications.css) | medications styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/features/clinical/substances-labs.css](../../public/static/css/features/clinical/substances-labs.css) | substances labs styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/features/patients.css](../../public/static/css/features/patients.css) | patients styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/features/visits.css](../../public/static/css/features/visits.css) | visits styles; cascade, sizing, direction and state rules | L07 |
| [public/static/css/fonts.css](../../public/static/css/fonts.css) | fonts styles; cascade, sizing, direction and state rules | L09 |
| [public/static/css/forms/choices.css](../../public/static/css/forms/choices.css) | choices styles; cascade, sizing, direction and state rules | F39 |
| [public/static/css/forms/controls.css](../../public/static/css/forms/controls.css) | controls styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/forms/date-picker.css](../../public/static/css/forms/date-picker.css) | date picker styles; cascade, sizing, direction and state rules | F40 |
| [public/static/css/forms/feedback-actions.css](../../public/static/css/forms/feedback-actions.css) | feedback actions styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/forms/input-widgets.css](../../public/static/css/forms/input-widgets.css) | input widgets styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/forms/multi-select.css](../../public/static/css/forms/multi-select.css) | multi select styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/forms/score-slider.css](../../public/static/css/forms/score-slider.css) | score slider styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/forms/search-select.css](../../public/static/css/forms/search-select.css) | search select styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/layout/containers.css](../../public/static/css/layout/containers.css) | containers styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/layout/footer-navigation.css](../../public/static/css/layout/footer-navigation.css) | footer navigation styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/layout/helpers.css](../../public/static/css/layout/helpers.css) | helpers styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/layout/responsive-pages.css](../../public/static/css/layout/responsive-pages.css) | responsive pages styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/layout/shell.css](../../public/static/css/layout/shell.css) | shell styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/motion/animations.css](../../public/static/css/motion/animations.css) | animations styles; cascade, sizing, direction and state rules | F42 |
| [public/static/css/motion/transitions.css](../../public/static/css/motion/transitions.css) | transitions styles; cascade, sizing, direction and state rules | F42 |
| [public/static/css/skeleton.css](../../public/static/css/skeleton.css) | skeleton styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/themes/dark-mode.css](../../public/static/css/themes/dark-mode.css) | dark mode palette/semantic overrides; light/dark inheritance | F41 |
| [public/static/css/themes/deep-space-strawberry.css](../../public/static/css/themes/deep-space-strawberry.css) | deep space strawberry palette/semantic overrides; light/dark inheritance | F41 |
| [public/static/css/themes/default.css](../../public/static/css/themes/default.css) | default palette/semantic overrides; light/dark inheritance | No separate finding |
| [public/static/css/themes/dusk-dusty-rosewood.css](../../public/static/css/themes/dusk-dusty-rosewood.css) | dusk dusty rosewood palette/semantic overrides; light/dark inheritance | No separate finding |
| [public/static/css/themes/index.css](../../public/static/css/themes/index.css) | index palette/semantic overrides; light/dark inheritance | L09 |
| [public/static/css/themes/ink-wheat-burnt.css](../../public/static/css/themes/ink-wheat-burnt.css) | ink wheat burnt palette/semantic overrides; light/dark inheritance | No separate finding |
| [public/static/css/themes/ocean-cerulean.css](../../public/static/css/themes/ocean-cerulean.css) | ocean cerulean palette/semantic overrides; light/dark inheritance | No separate finding |
| [public/static/css/themes/prussian-orange.css](../../public/static/css/themes/prussian-orange.css) | prussian orange palette/semantic overrides; light/dark inheritance | F41 |
| [public/static/css/themes/rosewood-crimson.css](../../public/static/css/themes/rosewood-crimson.css) | rosewood crimson palette/semantic overrides; light/dark inheritance | No separate finding |
| [public/static/css/themes/vanilla-tangerine.css](../../public/static/css/themes/vanilla-tangerine.css) | vanilla tangerine palette/semantic overrides; light/dark inheritance | F41 |
| [public/static/css/tokens/breakpoints.css](../../public/static/css/tokens/breakpoints.css) | breakpoints shared tokens and dependencies | No separate finding |
| [public/static/css/tokens/colors.css](../../public/static/css/tokens/colors.css) | colors shared tokens and dependencies | No separate finding |
| [public/static/css/tokens/components.css](../../public/static/css/tokens/components.css) | components shared tokens and dependencies | No separate finding |
| [public/static/css/tokens/motion.css](../../public/static/css/tokens/motion.css) | motion shared tokens and dependencies | F42 |
| [public/static/css/tokens/spacing.css](../../public/static/css/tokens/spacing.css) | spacing shared tokens and dependencies | No separate finding |
| [public/static/css/tokens/typography.css](../../public/static/css/tokens/typography.css) | typography shared tokens and dependencies | No separate finding |
| [public/static/css/utilities/general.css](../../public/static/css/utilities/general.css) | general styles; cascade, sizing, direction and state rules | No separate finding |
| [public/static/css/utilities/text-icons.css](../../public/static/css/utilities/text-icons.css) | text icons styles; cascade, sizing, direction and state rules | F42 |

### src/App.vue

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/App.vue](../../src/App.vue) | App component inputs/events, semantics and cleanup | No separate finding |

### src/bootstrap

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/bootstrap/index.js](../../src/bootstrap/index.js) | index startup/event wiring and ownership | No separate finding |
| [src/bootstrap/registerApiHandlers.js](../../src/bootstrap/registerApiHandlers.js) | register Api Handlers startup/event wiring and ownership | No separate finding |

### src/components

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/components/charts/MiniBarChart.vue](../../src/components/charts/MiniBarChart.vue) | Mini Bar Chart component inputs/events, semantics and cleanup | No separate finding |
| [src/components/charts/StatisticsChart.vue](../../src/components/charts/StatisticsChart.vue) | Statistics Chart component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/AppStatusBar.vue](../../src/components/common/AppStatusBar.vue) | App Status Bar component inputs/events, semantics and cleanup | F42 |
| [src/components/common/CriticalOverlay.vue](../../src/components/common/CriticalOverlay.vue) | Critical Overlay component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/DuplicateVisitButton.vue](../../src/components/common/DuplicateVisitButton.vue) | Duplicate Visit Button component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/ErrorBoundary.vue](../../src/components/common/ErrorBoundary.vue) | Error Boundary component inputs/events, semantics and cleanup | F38 |
| [src/components/common/FileUpload.vue](../../src/components/common/FileUpload.vue) | File Upload component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/LoadingScreen.vue](../../src/components/common/LoadingScreen.vue) | Loading Screen component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/MaintenanceBanner.vue](../../src/components/common/MaintenanceBanner.vue) | Maintenance Banner component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/RouteProgressBar.vue](../../src/components/common/RouteProgressBar.vue) | Route Progress Bar component inputs/events, semantics and cleanup | F42 |
| [src/components/common/ScrollToTop.vue](../../src/components/common/ScrollToTop.vue) | Scroll To Top component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/SearchInput.vue](../../src/components/common/SearchInput.vue) | Search Input component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/ShortcutsModal.vue](../../src/components/common/ShortcutsModal.vue) | Shortcuts Modal component inputs/events, semantics and cleanup | L06 |
| [src/components/common/SkeletonLoader.vue](../../src/components/common/SkeletonLoader.vue) | Skeleton Loader component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/Spinner.vue](../../src/components/common/Spinner.vue) | Spinner component inputs/events, semantics and cleanup | No separate finding |
| [src/components/common/VisitCard.vue](../../src/components/common/VisitCard.vue) | Visit Card component inputs/events, semantics and cleanup | No separate finding |
| [src/components/dev/RoutePerformanceDashboard.vue](../../src/components/dev/RoutePerformanceDashboard.vue) | Route Performance Dashboard component inputs/events, semantics and cleanup | L06 |
| [src/components/filters/DateFilter.vue](../../src/components/filters/DateFilter.vue) | Date Filter component inputs/events, semantics and cleanup | No separate finding |
| [src/components/filters/DoctorFilter.vue](../../src/components/filters/DoctorFilter.vue) | Doctor Filter component inputs/events, semantics and cleanup | No separate finding |
| [src/components/filters/PatientFilter.vue](../../src/components/filters/PatientFilter.vue) | Patient Filter component inputs/events, semantics and cleanup | No separate finding |
| [src/components/filters/StatusFilter.vue](../../src/components/filters/StatusFilter.vue) | Status Filter component inputs/events, semantics and cleanup | No separate finding |
| [src/components/layout/AppFooter.vue](../../src/components/layout/AppFooter.vue) | App Footer shell/container, navigation and lifetime | No separate finding |
| [src/components/layout/AppNavigation.vue](../../src/components/layout/AppNavigation.vue) | App Navigation shell/container, navigation and lifetime | F43 |
| [src/components/layout/BottomNav.vue](../../src/components/layout/BottomNav.vue) | Bottom Nav shell/container, navigation and lifetime | F43 |
| [src/components/layout/MainLayout.vue](../../src/components/layout/MainLayout.vue) | Main Layout shell/container, navigation and lifetime | F21 |
| [src/components/layout/PageContainer.vue](../../src/components/layout/PageContainer.vue) | Page Container shell/container, navigation and lifetime | No separate finding |
| [src/components/ui/AlertBar.vue](../../src/components/ui/AlertBar.vue) | Alert Bar component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ApiSelect.vue](../../src/components/ui/ApiSelect.vue) | Api Select component inputs/events, semantics and cleanup | F13, F38 |
| [src/components/ui/AppTabPanel.vue](../../src/components/ui/AppTabPanel.vue) | App Tab Panel component inputs/events, semantics and cleanup | F35 |
| [src/components/ui/AppTabs.vue](../../src/components/ui/AppTabs.vue) | App Tabs component inputs/events, semantics and cleanup | F35 |
| [src/components/ui/AsyncSelect.vue](../../src/components/ui/AsyncSelect.vue) | Async Select component inputs/events, semantics and cleanup | F13, F38, L03 |
| [src/components/ui/Avatar.vue](../../src/components/ui/Avatar.vue) | Avatar component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/BackLink.vue](../../src/components/ui/BackLink.vue) | Back Link component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/Badge.vue](../../src/components/ui/Badge.vue) | Badge component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/BadgeCell.vue](../../src/components/ui/BadgeCell.vue) | Badge Cell component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/BaseButton.vue](../../src/components/ui/BaseButton.vue) | Base Button component inputs/events, semantics and cleanup | L03 |
| [src/components/ui/BaseCard.vue](../../src/components/ui/BaseCard.vue) | Base Card component inputs/events, semantics and cleanup | F01 |
| [src/components/ui/BaseModal.vue](../../src/components/ui/BaseModal.vue) | Base Modal component inputs/events, semantics and cleanup | F01, F34 |
| [src/components/ui/BasePagination.vue](../../src/components/ui/BasePagination.vue) | Base Pagination component inputs/events, semantics and cleanup | F35 |
| [src/components/ui/BaseToast.vue](../../src/components/ui/BaseToast.vue) | Base Toast component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/Breadcrumb.vue](../../src/components/ui/Breadcrumb.vue) | Breadcrumb component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/CardHeader.vue](../../src/components/ui/CardHeader.vue) | Card Header component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ChartCard.vue](../../src/components/ui/ChartCard.vue) | Chart Card component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ChecklistItem.vue](../../src/components/ui/ChecklistItem.vue) | Checklist Item component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/CollapsibleSection.vue](../../src/components/ui/CollapsibleSection.vue) | Collapsible Section component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ConfirmCheckbox.vue](../../src/components/ui/ConfirmCheckbox.vue) | Confirm Checkbox component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ConfirmDialog.vue](../../src/components/ui/ConfirmDialog.vue) | Confirm Dialog component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/DangerZone.vue](../../src/components/ui/DangerZone.vue) | Danger Zone component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/DataTable.vue](../../src/components/ui/DataTable.vue) | Data Table component inputs/events, semantics and cleanup | F16, F35 |
| [src/components/ui/DateCell.vue](../../src/components/ui/DateCell.vue) | Date Cell component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/DatePicker.vue](../../src/components/ui/DatePicker.vue) | Date Picker component inputs/events, semantics and cleanup | F12 |
| [src/components/ui/DateRangePicker.vue](../../src/components/ui/DateRangePicker.vue) | Date Range Picker component inputs/events, semantics and cleanup | F12 |
| [src/components/ui/DayGrid.vue](../../src/components/ui/DayGrid.vue) | Day Grid component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/DetailItem.vue](../../src/components/ui/DetailItem.vue) | Detail Item component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/DetailsGrid.vue](../../src/components/ui/DetailsGrid.vue) | Details Grid component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/DropdownMenu.vue](../../src/components/ui/DropdownMenu.vue) | Dropdown Menu component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/DynamicRowList.vue](../../src/components/ui/DynamicRowList.vue) | Dynamic Row List component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/EditableNotes.vue](../../src/components/ui/EditableNotes.vue) | Editable Notes component inputs/events, semantics and cleanup | F37, F42 |
| [src/components/ui/EmptyState.vue](../../src/components/ui/EmptyState.vue) | Empty State component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ErrorList.vue](../../src/components/ui/ErrorList.vue) | Error List component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FieldError.vue](../../src/components/ui/FieldError.vue) | Field Error component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FilterBar.vue](../../src/components/ui/FilterBar.vue) | Filter Bar component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FilterField.vue](../../src/components/ui/FilterField.vue) | Filter Field component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormActions.vue](../../src/components/ui/FormActions.vue) | Form Actions component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormCheckbox.vue](../../src/components/ui/FormCheckbox.vue) | Form Checkbox component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormDate.vue](../../src/components/ui/FormDate.vue) | Form Date component inputs/events, semantics and cleanup | F12 |
| [src/components/ui/FormErrorSummary.vue](../../src/components/ui/FormErrorSummary.vue) | Form Error Summary component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormField.vue](../../src/components/ui/FormField.vue) | Form Field component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormGenerator.vue](../../src/components/ui/FormGenerator.vue) | Form Generator component inputs/events, semantics and cleanup | L03 |
| [src/components/ui/FormInput.vue](../../src/components/ui/FormInput.vue) | Form Input component inputs/events, semantics and cleanup | F33 |
| [src/components/ui/FormSelect.vue](../../src/components/ui/FormSelect.vue) | Form Select component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormTextarea.vue](../../src/components/ui/FormTextarea.vue) | Form Textarea component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormWizard.vue](../../src/components/ui/FormWizard.vue) | Form Wizard component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/FormWrapper.vue](../../src/components/ui/FormWrapper.vue) | Form Wrapper component inputs/events, semantics and cleanup | F01 |
| [src/components/ui/Icon.vue](../../src/components/ui/Icon.vue) | Icon component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/KeyValueList.vue](../../src/components/ui/KeyValueList.vue) | Key Value List component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/KpiGrid.vue](../../src/components/ui/KpiGrid.vue) | Kpi Grid component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ListView.vue](../../src/components/ui/ListView.vue) | List View component inputs/events, semantics and cleanup | F15, F16 |
| [src/components/ui/LoadingOverlay.vue](../../src/components/ui/LoadingOverlay.vue) | Loading Overlay component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/MultiSelect.vue](../../src/components/ui/MultiSelect.vue) | Multi Select component inputs/events, semantics and cleanup | F14 |
| [src/components/ui/PageHeader.vue](../../src/components/ui/PageHeader.vue) | Page Header component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/PasswordStrengthMeter.vue](../../src/components/ui/PasswordStrengthMeter.vue) | Password Strength Meter component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/Progress.vue](../../src/components/ui/Progress.vue) | Progress component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/RelativeDate.vue](../../src/components/ui/RelativeDate.vue) | Relative Date component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/ScoreInput.vue](../../src/components/ui/ScoreInput.vue) | Score Input component inputs/events, semantics and cleanup | F28, L10 |
| [src/components/ui/SectionHeader.vue](../../src/components/ui/SectionHeader.vue) | Section Header component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/SectionIndicator.vue](../../src/components/ui/SectionIndicator.vue) | Section Indicator component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/SegmentedControl.vue](../../src/components/ui/SegmentedControl.vue) | Segmented Control component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/SignaturePad.vue](../../src/components/ui/SignaturePad.vue) | Signature Pad component inputs/events, semantics and cleanup | F26 |
| [src/components/ui/StatCard.vue](../../src/components/ui/StatCard.vue) | Stat Card component inputs/events, semantics and cleanup | F42 |
| [src/components/ui/StatusCell.vue](../../src/components/ui/StatusCell.vue) | Status Cell component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/StepIndicator.vue](../../src/components/ui/StepIndicator.vue) | Step Indicator component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/StepsCard.vue](../../src/components/ui/StepsCard.vue) | Steps Card component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/TableActions.vue](../../src/components/ui/TableActions.vue) | Table Actions component inputs/events, semantics and cleanup | L04 |
| [src/components/ui/ThemeSwitcher.vue](../../src/components/ui/ThemeSwitcher.vue) | Theme Switcher component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/TimePicker.vue](../../src/components/ui/TimePicker.vue) | Time Picker component inputs/events, semantics and cleanup | L03 |
| [src/components/ui/Tooltip.vue](../../src/components/ui/Tooltip.vue) | Tooltip component inputs/events, semantics and cleanup | No separate finding |
| [src/components/ui/VerticalEventList.vue](../../src/components/ui/VerticalEventList.vue) | Vertical Event List component inputs/events, semantics and cleanup | No separate finding |

### src/composables

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/composables/toastConfig.js](../../src/composables/toastConfig.js) | toast Config reactive API, async/lifetime and callers | L10 |
| [src/composables/useApi.js](../../src/composables/useApi.js) | use Api reactive API, async/lifetime and callers | L04, L10 |
| [src/composables/useAppTheme.js](../../src/composables/useAppTheme.js) | use App Theme reactive API, async/lifetime and callers | F21 |
| [src/composables/useAutoCleanup.js](../../src/composables/useAutoCleanup.js) | use Auto Cleanup reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useBreadcrumbs.js](../../src/composables/useBreadcrumbs.js) | use Breadcrumbs reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useCan.js](../../src/composables/useCan.js) | use Can reactive API, async/lifetime and callers | F20 |
| [src/composables/useChart.js](../../src/composables/useChart.js) | use Chart reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useConfirmDialog.js](../../src/composables/useConfirmDialog.js) | use Confirm Dialog reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useCopy.js](../../src/composables/useCopy.js) | use Copy reactive API, async/lifetime and callers | L10 |
| [src/composables/useDate.js](../../src/composables/useDate.js) | use Date reactive API, async/lifetime and callers | F11, F12 |
| [src/composables/useDropdown.js](../../src/composables/useDropdown.js) | use Dropdown reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useError.js](../../src/composables/useError.js) | use Error reactive API, async/lifetime and callers | F38 |
| [src/composables/useFloatingPosition.js](../../src/composables/useFloatingPosition.js) | use Floating Position reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useForm.js](../../src/composables/useForm.js) | use Form reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useFormDirty.js](../../src/composables/useFormDirty.js) | use Form Dirty reactive API, async/lifetime and callers | L10 |
| [src/composables/useFormDraft.js](../../src/composables/useFormDraft.js) | use Form Draft reactive API, async/lifetime and callers | F02 |
| [src/composables/useFormFieldProps.js](../../src/composables/useFormFieldProps.js) | use Form Field Props reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useFormSubmission.js](../../src/composables/useFormSubmission.js) | use Form Submission reactive API, async/lifetime and callers | L04 |
| [src/composables/useFormatters.js](../../src/composables/useFormatters.js) | use Formatters reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useMaintenanceMode.js](../../src/composables/useMaintenanceMode.js) | use Maintenance Mode reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useNavigationItems.js](../../src/composables/useNavigationItems.js) | use Navigation Items reactive API, async/lifetime and callers | F43 |
| [src/composables/useNotify.js](../../src/composables/useNotify.js) | use Notify reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useOverlay.js](../../src/composables/useOverlay.js) | use Overlay reactive API, async/lifetime and callers | No separate finding |
| [src/composables/usePageStatus.js](../../src/composables/usePageStatus.js) | use Page Status reactive API, async/lifetime and callers | No separate finding |
| [src/composables/usePagination.js](../../src/composables/usePagination.js) | use Pagination reactive API, async/lifetime and callers | F15 |
| [src/composables/useRouteQuery.js](../../src/composables/useRouteQuery.js) | use Route Query reactive API, async/lifetime and callers | F29, L02 |
| [src/composables/useScrollTo.js](../../src/composables/useScrollTo.js) | use Scroll To reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useSearch.js](../../src/composables/useSearch.js) | use Search reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useSession.js](../../src/composables/useSession.js) | use Session reactive API, async/lifetime and callers | F02, L06 |
| [src/composables/useShortcut.js](../../src/composables/useShortcut.js) | use Shortcut reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useSort.js](../../src/composables/useSort.js) | use Sort reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useSystemConfig.js](../../src/composables/useSystemConfig.js) | use System Config reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useTimeAgo.js](../../src/composables/useTimeAgo.js) | use Time Ago reactive API, async/lifetime and callers | F11 |
| [src/composables/useToast.js](../../src/composables/useToast.js) | use Toast reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useUnreadCount.js](../../src/composables/useUnreadCount.js) | use Unread Count reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useValidator.js](../../src/composables/useValidator.js) | use Validator reactive API, async/lifetime and callers | No separate finding |
| [src/composables/useViewport.js](../../src/composables/useViewport.js) | use Viewport reactive API, async/lifetime and callers | No separate finding |

### src/config

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/config/app.js](../../src/config/app.js) | app field/application configuration | L09 |

### src/constants

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/constants/statusConstants.js](../../src/constants/statusConstants.js) | status Constants pure/shared contract and boundary handling | No separate finding |
| [src/constants/storageKeys.js](../../src/constants/storageKeys.js) | storage Keys pure/shared contract and boundary handling | No separate finding |
| [src/constants/theme.js](../../src/constants/theme.js) | theme pure/shared contract and boundary handling | No separate finding |

### src/directives

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/directives/autoTitle.js](../../src/directives/autoTitle.js) | auto Title DOM binding/update and teardown | No separate finding |
| [src/directives/autofocus.js](../../src/directives/autofocus.js) | autofocus DOM binding/update and teardown | No separate finding |
| [src/directives/clipboard.js](../../src/directives/clipboard.js) | clipboard DOM binding/update and teardown | L10 |
| [src/directives/debounce.js](../../src/directives/debounce.js) | debounce DOM binding/update and teardown | L10 |
| [src/directives/dirty.js](../../src/directives/dirty.js) | dirty DOM binding/update and teardown | No separate finding |

### src/features/appointments

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/appointments/components/AppointmentBlock.vue](../../src/features/appointments/components/AppointmentBlock.vue) | Appointment Block component inputs/events, semantics and cleanup | F07 |
| [src/features/appointments/components/AvailabilityGrid.vue](../../src/features/appointments/components/AvailabilityGrid.vue) | Availability Grid component inputs/events, semantics and cleanup | No separate finding |
| [src/features/appointments/components/CalendarLayout.vue](../../src/features/appointments/components/CalendarLayout.vue) | Calendar Layout component inputs/events, semantics and cleanup | F06 |
| [src/features/appointments/components/CalendarLegend.vue](../../src/features/appointments/components/CalendarLegend.vue) | Calendar Legend component inputs/events, semantics and cleanup | No separate finding |
| [src/features/appointments/components/CalendarSkeleton.vue](../../src/features/appointments/components/CalendarSkeleton.vue) | Calendar Skeleton component inputs/events, semantics and cleanup | No separate finding |
| [src/features/appointments/components/CalendarView.vue](../../src/features/appointments/components/CalendarView.vue) | Calendar View component inputs/events, semantics and cleanup | F06 |
| [src/features/appointments/components/DayViewGrid.vue](../../src/features/appointments/components/DayViewGrid.vue) | Day View Grid component inputs/events, semantics and cleanup | F06, F07 |
| [src/features/appointments/components/MiniCalendar.vue](../../src/features/appointments/components/MiniCalendar.vue) | Mini Calendar component inputs/events, semantics and cleanup | F08 |
| [src/features/appointments/components/MonthViewGrid.vue](../../src/features/appointments/components/MonthViewGrid.vue) | Month View Grid component inputs/events, semantics and cleanup | F08 |
| [src/features/appointments/components/QueueTable.vue](../../src/features/appointments/components/QueueTable.vue) | Queue Table component inputs/events, semantics and cleanup | No separate finding |
| [src/features/appointments/components/SlotToken.vue](../../src/features/appointments/components/SlotToken.vue) | Slot Token component inputs/events, semantics and cleanup | No separate finding |
| [src/features/appointments/components/TimeSlotPicker.vue](../../src/features/appointments/components/TimeSlotPicker.vue) | Time Slot Picker component inputs/events, semantics and cleanup | F38 |
| [src/features/appointments/components/WeekViewGrid.vue](../../src/features/appointments/components/WeekViewGrid.vue) | Week View Grid component inputs/events, semantics and cleanup | F06 |
| [src/features/appointments/composables/useCalendar.js](../../src/features/appointments/composables/useCalendar.js) | use Calendar reactive API, async/lifetime and callers | F07, F09, F10, F38 |
| [src/features/appointments/composables/useTimeSlots.js](../../src/features/appointments/composables/useTimeSlots.js) | use Time Slots reactive API, async/lifetime and callers | L03 |
| [src/features/appointments/services/appointmentService.js](../../src/features/appointments/services/appointmentService.js) | appointment Service request/response and mutation contract | No separate finding |
| [src/features/appointments/stores/appointments.js](../../src/features/appointments/stores/appointments.js) | appointments state ownership, cache, mutations and reset | No separate finding |
| [src/features/appointments/views/AppointmentForm.vue](../../src/features/appointments/views/AppointmentForm.vue) | Appointment Form page workflow, loading/errors, permissions and inputs | F02, F18, F27 |
| [src/features/appointments/views/AppointmentsCalendar.vue](../../src/features/appointments/views/AppointmentsCalendar.vue) | Appointments Calendar page workflow, loading/errors, permissions and inputs | F06, F10, F29 |

### src/features/auth

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/auth/services/authService.js](../../src/features/auth/services/authService.js) | auth Service request/response and mutation contract | No separate finding |
| [src/features/auth/stores/auth.js](../../src/features/auth/stores/auth.js) | auth state ownership, cache, mutations and reset | F02, F03, F19, F20, F38, L06 |
| [src/features/auth/views/Login.vue](../../src/features/auth/views/Login.vue) | Login page workflow, loading/errors, permissions and inputs | F19 |

### src/features/backup

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/backup/components/BackupLayout.vue](../../src/features/backup/components/BackupLayout.vue) | Backup Layout component inputs/events, semantics and cleanup | F32 |
| [src/features/backup/services/backupService.js](../../src/features/backup/services/backupService.js) | backup Service request/response and mutation contract | No separate finding |
| [src/features/backup/stores/backup.js](../../src/features/backup/stores/backup.js) | backup state ownership, cache, mutations and reset | No separate finding |
| [src/features/backup/views/BackupView.vue](../../src/features/backup/views/BackupView.vue) | Backup View page workflow, loading/errors, permissions and inputs | F32 |

### src/features/billing

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/billing/services/invoiceService.js](../../src/features/billing/services/invoiceService.js) | invoice Service request/response and mutation contract | No separate finding |
| [src/features/billing/views/InvoiceForm.vue](../../src/features/billing/views/InvoiceForm.vue) | Invoice Form page workflow, loading/errors, permissions and inputs | F18 |
| [src/features/billing/views/InvoicesList.vue](../../src/features/billing/views/InvoicesList.vue) | Invoices List page workflow, loading/errors, permissions and inputs | No separate finding |

### src/features/clinical

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/clinical/components/AuditLog.vue](../../src/features/clinical/components/AuditLog.vue) | Audit Log component inputs/events, semantics and cleanup | L01 |
| [src/features/clinical/components/CBTRecord.vue](../../src/features/clinical/components/CBTRecord.vue) | CBTRecord component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/Callout.vue](../../src/features/clinical/components/Callout.vue) | Callout component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/ClinicalTextArea.vue](../../src/features/clinical/components/ClinicalTextArea.vue) | Clinical Text Area component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/ControlledSubstanceCard.vue](../../src/features/clinical/components/ControlledSubstanceCard.vue) | Controlled Substance Card component inputs/events, semantics and cleanup | L10 |
| [src/features/clinical/components/DiagnosisList.vue](../../src/features/clinical/components/DiagnosisList.vue) | Diagnosis List component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/LabResult.vue](../../src/features/clinical/components/LabResult.vue) | Lab Result component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/LetterSheet.vue](../../src/features/clinical/components/LetterSheet.vue) | Letter Sheet component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/MedicationList.vue](../../src/features/clinical/components/MedicationList.vue) | Medication List component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/ProgressGoal.vue](../../src/features/clinical/components/ProgressGoal.vue) | Progress Goal component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/RiskLevelBadge.vue](../../src/features/clinical/components/RiskLevelBadge.vue) | Risk Level Badge component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/ScalePickerModal.vue](../../src/features/clinical/components/ScalePickerModal.vue) | Scale Picker Modal component inputs/events, semantics and cleanup | F05 |
| [src/features/clinical/components/ScaleRenderer.vue](../../src/features/clinical/components/ScaleRenderer.vue) | Scale Renderer component inputs/events, semantics and cleanup | F24, F25 |
| [src/features/clinical/components/ScrollableTerms.vue](../../src/features/clinical/components/ScrollableTerms.vue) | Scrollable Terms component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/SeverityPills.vue](../../src/features/clinical/components/SeverityPills.vue) | Severity Pills component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/components/TriggerList.vue](../../src/features/clinical/components/TriggerList.vue) | Trigger List component inputs/events, semantics and cleanup | No separate finding |
| [src/features/clinical/services/diagnosisService.js](../../src/features/clinical/services/diagnosisService.js) | diagnosis Service request/response and mutation contract | No separate finding |
| [src/features/clinical/services/medicationService.js](../../src/features/clinical/services/medicationService.js) | medication Service request/response and mutation contract | No separate finding |
| [src/features/clinical/services/scaleService.js](../../src/features/clinical/services/scaleService.js) | scale Service request/response and mutation contract | No separate finding |
| [src/features/clinical/services/templateService.js](../../src/features/clinical/services/templateService.js) | template Service request/response and mutation contract | No separate finding |
| [src/features/clinical/stores/scales.js](../../src/features/clinical/stores/scales.js) | scales state ownership, cache, mutations and reset | F05 |
| [src/features/clinical/views/DiagnosesManage.vue](../../src/features/clinical/views/DiagnosesManage.vue) | Diagnoses Manage page workflow, loading/errors, permissions and inputs | F34 |
| [src/features/clinical/views/MedicationsManage.vue](../../src/features/clinical/views/MedicationsManage.vue) | Medications Manage page workflow, loading/errors, permissions and inputs | F34 |
| [src/features/clinical/views/ScalesAdmin.vue](../../src/features/clinical/views/ScalesAdmin.vue) | Scales Admin page workflow, loading/errors, permissions and inputs | F34 |
| [src/features/clinical/views/TemplateForm.vue](../../src/features/clinical/views/TemplateForm.vue) | Template Form page workflow, loading/errors, permissions and inputs | F18 |
| [src/features/clinical/views/TemplatesList.vue](../../src/features/clinical/views/TemplatesList.vue) | Templates List page workflow, loading/errors, permissions and inputs | No separate finding |

### src/features/dashboard

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/dashboard/components/DashboardLayout.vue](../../src/features/dashboard/components/DashboardLayout.vue) | Dashboard Layout component inputs/events, semantics and cleanup | F28, F37 |
| [src/features/dashboard/components/DashboardNextAppointment.vue](../../src/features/dashboard/components/DashboardNextAppointment.vue) | Dashboard Next Appointment component inputs/events, semantics and cleanup | No separate finding |
| [src/features/dashboard/services/dashboardService.js](../../src/features/dashboard/services/dashboardService.js) | dashboard Service request/response and mutation contract | No separate finding |
| [src/features/dashboard/stores/analytics.js](../../src/features/dashboard/stores/analytics.js) | analytics state ownership, cache, mutations and reset | F03, F30 |
| [src/features/dashboard/views/Dashboard.vue](../../src/features/dashboard/views/Dashboard.vue) | Dashboard page workflow, loading/errors, permissions and inputs | F30 |

### src/features/import

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/import/services/importService.js](../../src/features/import/services/importService.js) | import Service request/response and mutation contract | No separate finding |
| [src/features/import/views/ImportData.vue](../../src/features/import/views/ImportData.vue) | Import Data page workflow, loading/errors, permissions and inputs | F32 |
| [src/features/import/views/ImportOptions.vue](../../src/features/import/views/ImportOptions.vue) | Import Options page workflow, loading/errors, permissions and inputs | F32 |

### src/features/notifications

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/notifications/components/NotificationCenter.vue](../../src/features/notifications/components/NotificationCenter.vue) | Notification Center component inputs/events, semantics and cleanup | F42 |
| [src/features/notifications/services/notificationService.js](../../src/features/notifications/services/notificationService.js) | notification Service request/response and mutation contract | No separate finding |
| [src/features/notifications/stores/notifications.js](../../src/features/notifications/stores/notifications.js) | notifications state ownership, cache, mutations and reset | F03 |
| [src/features/notifications/views/Notifications.vue](../../src/features/notifications/views/Notifications.vue) | Notifications page workflow, loading/errors, permissions and inputs | No separate finding |

### src/features/patients

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/patients/components/BulkActionsBar.vue](../../src/features/patients/components/BulkActionsBar.vue) | Bulk Actions Bar component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/ColumnVisibilityPanel.vue](../../src/features/patients/components/ColumnVisibilityPanel.vue) | Column Visibility Panel component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientCareTeamTab.vue](../../src/features/patients/components/PatientCareTeamTab.vue) | Patient Care Team Tab component inputs/events, semantics and cleanup | F31 |
| [src/features/patients/components/PatientDetailLayout.vue](../../src/features/patients/components/PatientDetailLayout.vue) | Patient Detail Layout component inputs/events, semantics and cleanup | F29, F31, F35 |
| [src/features/patients/components/PatientDocumentsPanel.vue](../../src/features/patients/components/PatientDocumentsPanel.vue) | Patient Documents Panel component inputs/events, semantics and cleanup | L05 |
| [src/features/patients/components/PatientDuplicatePanel.vue](../../src/features/patients/components/PatientDuplicatePanel.vue) | Patient Duplicate Panel component inputs/events, semantics and cleanup | L05 |
| [src/features/patients/components/PatientFormDemographics.vue](../../src/features/patients/components/PatientFormDemographics.vue) | Patient Form Demographics component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientFormLayout.vue](../../src/features/patients/components/PatientFormLayout.vue) | Patient Form Layout component inputs/events, semantics and cleanup | L01, L05 |
| [src/features/patients/components/PatientFormMedical.vue](../../src/features/patients/components/PatientFormMedical.vue) | Patient Form Medical component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientFormSocial.vue](../../src/features/patients/components/PatientFormSocial.vue) | Patient Form Social component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientHistoryPanel.vue](../../src/features/patients/components/PatientHistoryPanel.vue) | Patient History Panel component inputs/events, semantics and cleanup | L05 |
| [src/features/patients/components/PatientIdentity.vue](../../src/features/patients/components/PatientIdentity.vue) | Patient Identity component inputs/events, semantics and cleanup | L10 |
| [src/features/patients/components/PatientLink.vue](../../src/features/patients/components/PatientLink.vue) | Patient Link component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientProfileFields.vue](../../src/features/patients/components/PatientProfileFields.vue) | Patient Profile Fields component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientRecordsPanel.vue](../../src/features/patients/components/PatientRecordsPanel.vue) | Patient Records Panel component inputs/events, semantics and cleanup | F31, L05 |
| [src/features/patients/components/PatientSidebar.vue](../../src/features/patients/components/PatientSidebar.vue) | Patient Sidebar component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientSummarySidebar.vue](../../src/features/patients/components/PatientSummarySidebar.vue) | Patient Summary Sidebar component inputs/events, semantics and cleanup | No separate finding |
| [src/features/patients/components/PatientVisitsList.vue](../../src/features/patients/components/PatientVisitsList.vue) | Patient Visits List component inputs/events, semantics and cleanup | F17, F31, L04 |
| [src/features/patients/config/recordFields.js](../../src/features/patients/config/recordFields.js) | record Fields field/application configuration | No separate finding |
| [src/features/patients/services/patientService.js](../../src/features/patients/services/patientService.js) | patient Service request/response and mutation contract | No separate finding |
| [src/features/patients/stores/patients.js](../../src/features/patients/stores/patients.js) | patients state ownership, cache, mutations and reset | F03 |
| [src/features/patients/views/PatientDetail.vue](../../src/features/patients/views/PatientDetail.vue) | Patient Detail page workflow, loading/errors, permissions and inputs | F31 |
| [src/features/patients/views/PatientForm.vue](../../src/features/patients/views/PatientForm.vue) | Patient Form page workflow, loading/errors, permissions and inputs | F02, F18 |
| [src/features/patients/views/PatientsList.vue](../../src/features/patients/views/PatientsList.vue) | Patients List page workflow, loading/errors, permissions and inputs | F16, F17 |

### src/features/prescription

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/prescription/services/prescriptionService.js](../../src/features/prescription/services/prescriptionService.js) | prescription Service request/response and mutation contract | No separate finding |
| [src/features/prescription/services/referralService.js](../../src/features/prescription/services/referralService.js) | referral Service request/response and mutation contract | No separate finding |
| [src/features/prescription/views/PrescriptionPreview.vue](../../src/features/prescription/views/PrescriptionPreview.vue) | Prescription Preview page workflow, loading/errors, permissions and inputs | F26, F32 |
| [src/features/prescription/views/ReferralLetter.vue](../../src/features/prescription/views/ReferralLetter.vue) | Referral Letter page workflow, loading/errors, permissions and inputs | No separate finding |

### src/features/reports

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/reports/components/StatisticsLayout.vue](../../src/features/reports/components/StatisticsLayout.vue) | Statistics Layout component inputs/events, semantics and cleanup | No separate finding |
| [src/features/reports/services/statisticsService.js](../../src/features/reports/services/statisticsService.js) | statistics Service request/response and mutation contract | No separate finding |
| [src/features/reports/views/AboutView.vue](../../src/features/reports/views/AboutView.vue) | About View page workflow, loading/errors, permissions and inputs | L06, L08 |
| [src/features/reports/views/ErrorPage.vue](../../src/features/reports/views/ErrorPage.vue) | Error Page page workflow, loading/errors, permissions and inputs | No separate finding |
| [src/features/reports/views/ManualView.vue](../../src/features/reports/views/ManualView.vue) | Manual View page workflow, loading/errors, permissions and inputs | L06, L08 |
| [src/features/reports/views/PrivacyPolicyView.vue](../../src/features/reports/views/PrivacyPolicyView.vue) | Privacy Policy View page workflow, loading/errors, permissions and inputs | F37, L08 |
| [src/features/reports/views/Reconciliation.vue](../../src/features/reports/views/Reconciliation.vue) | Reconciliation page workflow, loading/errors, permissions and inputs | F30, F36 |
| [src/features/reports/views/Statistics.vue](../../src/features/reports/views/Statistics.vue) | Statistics page workflow, loading/errors, permissions and inputs | F30 |
| [src/features/reports/views/TermsView.vue](../../src/features/reports/views/TermsView.vue) | Terms View page workflow, loading/errors, permissions and inputs | L08 |

### src/features/settings

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/settings/services/settingsService.js](../../src/features/settings/services/settingsService.js) | settings Service request/response and mutation contract | No separate finding |
| [src/features/settings/services/userService.js](../../src/features/settings/services/userService.js) | user Service request/response and mutation contract | No separate finding |
| [src/features/settings/stores/settings.js](../../src/features/settings/stores/settings.js) | settings state ownership, cache, mutations and reset | F21 |
| [src/features/settings/stores/users.js](../../src/features/settings/stores/users.js) | users state ownership, cache, mutations and reset | F03 |
| [src/features/settings/views/ChangePassword.vue](../../src/features/settings/views/ChangePassword.vue) | Change Password page workflow, loading/errors, permissions and inputs | F19 |
| [src/features/settings/views/Settings.vue](../../src/features/settings/views/Settings.vue) | Settings page workflow, loading/errors, permissions and inputs | F20, F33 |
| [src/features/settings/views/UserForm.vue](../../src/features/settings/views/UserForm.vue) | User Form page workflow, loading/errors, permissions and inputs | F18, F32, F34 |
| [src/features/settings/views/UserPermissions.vue](../../src/features/settings/views/UserPermissions.vue) | User Permissions page workflow, loading/errors, permissions and inputs | F18 |
| [src/features/settings/views/UsersList.vue](../../src/features/settings/views/UsersList.vue) | Users List page workflow, loading/errors, permissions and inputs | No separate finding |

### src/features/tasks

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/tasks/components/TaskFormInline.vue](../../src/features/tasks/components/TaskFormInline.vue) | Task Form Inline component inputs/events, semantics and cleanup | No separate finding |
| [src/features/tasks/components/TasksLayout.vue](../../src/features/tasks/components/TasksLayout.vue) | Tasks Layout component inputs/events, semantics and cleanup | No separate finding |
| [src/features/tasks/services/taskService.js](../../src/features/tasks/services/taskService.js) | task Service request/response and mutation contract | No separate finding |
| [src/features/tasks/stores/tasks.js](../../src/features/tasks/stores/tasks.js) | tasks state ownership, cache, mutations and reset | No separate finding |
| [src/features/tasks/views/TasksPage.vue](../../src/features/tasks/views/TasksPage.vue) | Tasks Page page workflow, loading/errors, permissions and inputs | L04 |

### src/features/visits

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/features/visits/components/Timeline.vue](../../src/features/visits/components/Timeline.vue) | Timeline component inputs/events, semantics and cleanup | No separate finding |
| [src/features/visits/components/VisitAdministrative.vue](../../src/features/visits/components/VisitAdministrative.vue) | Visit Administrative component inputs/events, semantics and cleanup | F27 |
| [src/features/visits/components/VisitBasicInfo.vue](../../src/features/visits/components/VisitBasicInfo.vue) | Visit Basic Info component inputs/events, semantics and cleanup | No separate finding |
| [src/features/visits/components/VisitClinicalNotes.vue](../../src/features/visits/components/VisitClinicalNotes.vue) | Visit Clinical Notes component inputs/events, semantics and cleanup | F24 |
| [src/features/visits/components/VisitDiagnosesLabs.vue](../../src/features/visits/components/VisitDiagnosesLabs.vue) | Visit Diagnoses Labs component inputs/events, semantics and cleanup | F14 |
| [src/features/visits/components/VisitFormLayout.vue](../../src/features/visits/components/VisitFormLayout.vue) | Visit Form Layout component inputs/events, semantics and cleanup | L01, L05 |
| [src/features/visits/components/VisitTreatmentPlan.vue](../../src/features/visits/components/VisitTreatmentPlan.vue) | Visit Treatment Plan component inputs/events, semantics and cleanup | F14 |
| [src/features/visits/components/VisitsListLayout.vue](../../src/features/visits/components/VisitsListLayout.vue) | Visits List Layout component inputs/events, semantics and cleanup | F17 |
| [src/features/visits/composables/useVisitForm.js](../../src/features/visits/composables/useVisitForm.js) | use Visit Form reactive API, async/lifetime and callers | F23, F27, L06 |
| [src/features/visits/composables/useVisitLookups.js](../../src/features/visits/composables/useVisitLookups.js) | use Visit Lookups reactive API, async/lifetime and callers | F05 |
| [src/features/visits/composables/useVisitScales.js](../../src/features/visits/composables/useVisitScales.js) | use Visit Scales reactive API, async/lifetime and callers | F25, L06 |
| [src/features/visits/composables/useVisitTemplates.js](../../src/features/visits/composables/useVisitTemplates.js) | use Visit Templates reactive API, async/lifetime and callers | F05 |
| [src/features/visits/services/visitService.js](../../src/features/visits/services/visitService.js) | visit Service request/response and mutation contract | No separate finding |
| [src/features/visits/stores/visits.js](../../src/features/visits/stores/visits.js) | visits state ownership, cache, mutations and reset | F03 |
| [src/features/visits/views/VisitDetail.vue](../../src/features/visits/views/VisitDetail.vue) | Visit Detail page workflow, loading/errors, permissions and inputs | No separate finding |
| [src/features/visits/views/VisitForm.vue](../../src/features/visits/views/VisitForm.vue) | Visit Form page workflow, loading/errors, permissions and inputs | F18, F23, F24 |
| [src/features/visits/views/VisitsList.vue](../../src/features/visits/views/VisitsList.vue) | Visits List page workflow, loading/errors, permissions and inputs | F17, L04 |

### src/main.js

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/main.js](../../src/main.js) | main application wiring and public interface | F03, F38, L09 |

### src/router

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/router/guards.js](../../src/router/guards.js) | guards route identity, guards and navigation effects | F19, F20 |
| [src/router/index.js](../../src/router/index.js) | index route identity, guards and navigation effects | F04, F43, L08 |

### src/services

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/services/apiClient.js](../../src/services/apiClient.js) | api Client request/response and mutation contract | F04, F43 |
| [src/services/apiEvents.js](../../src/services/apiEvents.js) | api Events request/response and mutation contract | F38, L02 |
| [src/services/baseCrudService.js](../../src/services/baseCrudService.js) | base Crud Service request/response and mutation contract | L02, L05 |
| [src/services/overlayStack.js](../../src/services/overlayStack.js) | overlay Stack request/response and mutation contract | No separate finding |
| [src/services/themeService.js](../../src/services/themeService.js) | theme Service request/response and mutation contract | F21 |

### src/stores

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/stores/colors.js](../../src/stores/colors.js) | colors state ownership, cache, mutations and reset | No separate finding |
| [src/stores/confirm.js](../../src/stores/confirm.js) | confirm state ownership, cache, mutations and reset | No separate finding |
| [src/stores/constants.js](../../src/stores/constants.js) | constants state ownership, cache, mutations and reset | L10 |
| [src/stores/crudStoreFactory.js](../../src/stores/crudStoreFactory.js) | crud Store Factory state ownership, cache, mutations and reset | L02, L05 |
| [src/stores/diagnosisLookup.js](../../src/stores/diagnosisLookup.js) | diagnosis Lookup state ownership, cache, mutations and reset | F05 |
| [src/stores/loading.js](../../src/stores/loading.js) | loading state ownership, cache, mutations and reset | F43 |
| [src/stores/lookupStoreFactory.js](../../src/stores/lookupStoreFactory.js) | lookup Store Factory state ownership, cache, mutations and reset | F03, F05 |
| [src/stores/lookups.js](../../src/stores/lookups.js) | lookups state ownership, cache, mutations and reset | F05, F25 |
| [src/stores/medicationLookup.js](../../src/stores/medicationLookup.js) | medication Lookup state ownership, cache, mutations and reset | F05 |
| [src/stores/plugins/persist.js](../../src/stores/plugins/persist.js) | persist state ownership, cache, mutations and reset | F22 |
| [src/stores/refresh.js](../../src/stores/refresh.js) | refresh state ownership, cache, mutations and reset | No separate finding |
| [src/stores/scaleLookup.js](../../src/stores/scaleLookup.js) | scale Lookup state ownership, cache, mutations and reset | F05 |
| [src/stores/selection.js](../../src/stores/selection.js) | selection state ownership, cache, mutations and reset | F16 |
| [src/stores/ui.js](../../src/stores/ui.js) | ui state ownership, cache, mutations and reset | F21, F22 |

### src/styles

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/styles/components/common/spinner.css](../../src/styles/components/common/spinner.css) | spinner styles; cascade, sizing, direction and state rules | L07 |
| [src/styles/components/ui/base-modal.css](../../src/styles/components/ui/base-modal.css) | base modal styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/components/ui/breadcrumb.css](../../src/styles/components/ui/breadcrumb.css) | breadcrumb styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/components/ui/form-field.css](../../src/styles/components/ui/form-field.css) | form field styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/components/ui/form-textarea.css](../../src/styles/components/ui/form-textarea.css) | form textarea styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/components/ui/form-wizard.css](../../src/styles/components/ui/form-wizard.css) | form wizard styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/components/ui/score-input.css](../../src/styles/components/ui/score-input.css) | score input styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/components/ui/section-indicator.css](../../src/styles/components/ui/section-indicator.css) | section indicator styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/components/ui/signature-pad.css](../../src/styles/components/ui/signature-pad.css) | signature pad styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/auth/views/login.css](../../src/styles/features/auth/views/login.css) | login styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/dashboard/components/dashboard-layout.css](../../src/styles/features/dashboard/components/dashboard-layout.css) | dashboard layout styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/notifications/components/notification-center.css](../../src/styles/features/notifications/components/notification-center.css) | notification center styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/notifications/views/notifications.css](../../src/styles/features/notifications/views/notifications.css) | notifications styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/patients/components/patient-identity.css](../../src/styles/features/patients/components/patient-identity.css) | patient identity styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/prescription/views/referral-letter.css](../../src/styles/features/prescription/views/referral-letter.css) | referral letter styles; cascade, sizing, direction and state rules | L07 |
| [src/styles/features/reports/components/statistics-layout.css](../../src/styles/features/reports/components/statistics-layout.css) | statistics layout styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/reports/views/manual-view.css](../../src/styles/features/reports/views/manual-view.css) | manual view styles; cascade, sizing, direction and state rules | No separate finding |
| [src/styles/features/tasks/components/tasks-layout.css](../../src/styles/features/tasks/components/tasks-layout.css) | tasks layout styles; cascade, sizing, direction and state rules | No separate finding |

### src/utils

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [src/utils/announce.js](../../src/utils/announce.js) | announce pure/shared contract and boundary handling | No separate finding |
| [src/utils/apiErrorHandler.js](../../src/utils/apiErrorHandler.js) | api Error Handler pure/shared contract and boundary handling | L04 |
| [src/utils/asyncStore.js](../../src/utils/asyncStore.js) | async Store pure/shared contract and boundary handling | No separate finding |
| [src/utils/businessRules.js](../../src/utils/businessRules.js) | business Rules pure/shared contract and boundary handling | No separate finding |
| [src/utils/cacheKeys.js](../../src/utils/cacheKeys.js) | cache Keys pure/shared contract and boundary handling | No separate finding |
| [src/utils/confirmMessages.js](../../src/utils/confirmMessages.js) | confirm Messages pure/shared contract and boundary handling | No separate finding |
| [src/utils/download.js](../../src/utils/download.js) | download pure/shared contract and boundary handling | L05 |
| [src/utils/errorExtractor.js](../../src/utils/errorExtractor.js) | error Extractor pure/shared contract and boundary handling | L04 |
| [src/utils/errorMessages.js](../../src/utils/errorMessages.js) | error Messages pure/shared contract and boundary handling | No separate finding |
| [src/utils/fallbackText.js](../../src/utils/fallbackText.js) | fallback Text pure/shared contract and boundary handling | No separate finding |
| [src/utils/formatters.js](../../src/utils/formatters.js) | formatters pure/shared contract and boundary handling | F36, L10 |
| [src/utils/iconMap.js](../../src/utils/iconMap.js) | icon Map pure/shared contract and boundary handling | No separate finding |
| [src/utils/idempotency.js](../../src/utils/idempotency.js) | idempotency pure/shared contract and boundary handling | No separate finding |
| [src/utils/index.js](../../src/utils/index.js) | index pure/shared contract and boundary handling | F42 |
| [src/utils/listFetch.js](../../src/utils/listFetch.js) | list Fetch pure/shared contract and boundary handling | L02 |
| [src/utils/lruCache.js](../../src/utils/lruCache.js) | lru Cache pure/shared contract and boundary handling | No separate finding |
| [src/utils/messages.js](../../src/utils/messages.js) | messages pure/shared contract and boundary handling | No separate finding |
| [src/utils/normalize.js](../../src/utils/normalize.js) | normalize pure/shared contract and boundary handling | No separate finding |
| [src/utils/pagination.js](../../src/utils/pagination.js) | pagination pure/shared contract and boundary handling | No separate finding |
| [src/utils/queryBuilder.js](../../src/utils/queryBuilder.js) | query Builder pure/shared contract and boundary handling | No separate finding |
| [src/utils/riskLevels.js](../../src/utils/riskLevels.js) | risk Levels pure/shared contract and boundary handling | No separate finding |
| [src/utils/storage.js](../../src/utils/storage.js) | storage pure/shared contract and boundary handling | No separate finding |
| [src/utils/validationRules.js](../../src/utils/validationRules.js) | validation Rules pure/shared contract and boundary handling | No separate finding |
| [src/utils/validators.js](../../src/utils/validators.js) | validators pure/shared contract and boundary handling | No separate finding |

### Root configuration

| File | Responsibility checked | Finding references |
| --- | --- | --- |
| [vite.config.js](../../vite.config.js) | vite.config configuration and resolution | L09 |
