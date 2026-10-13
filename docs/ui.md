# UI ownership

Review dispositions live in [review](review.md), results in [completed](doneCurrent.md), future checks in [verification](verification.md). D1–D15/S1–S11 and N1–N5/N8 have source corrections; do not reopen them without evidence.

## CSS and layout

`src/main.js` imports `public/static/css/app.css` once. Its ordered imports own cascade: tokens/themes, base, layout, forms/components, feature rules, utilities/motion/documents, with existing third-party order preserved. `index.html` keeps early font/skeleton links. Files use descriptive kebab-case; coherent 50–200 line modules are preferred, above 250 lines/12 KiB reviewed rather than mechanically split.

Component rules stay in mirrored `src/styles/` through external scoped `<style src>`; never globally import them. Preserve scoping/deep selectors; global CSS uses native selectors. Runtime floating coordinates, chart/progress heights, data-driven colors/columns, textarea resizing and scroll locks retain bindings; static style belongs in owned CSS.

Shell owns gutters and viewport/safe-area budget; PageContainer owns standard/wide/form bounds. Flex/grid children shrink, actions wrap and tables/tabs own their local horizontal scrolling. Do not conceal overflow with another global hide rule. Media breakpoints are literal; semantic tokens/themes noncyclic. Keep Arabic readability and light/dark ownership.

## Completed behavior by owner

| Owner | Behavior to retain |
| --- | --- |
| MainLayout/useViewport/shell | Independent mobile drawer and desktop collapse, inclusive 768px boundary, backdrop/inert state, scroll lock and focus restoration; public wrappers have no sidebar offsets. |
| Overlay stack/BaseModal/confirmations | Only top layer owns Tab/Escape; query fresh visible/enabled targets, preserve nested scroll locks, connected focus return and out-of-order cleanup. Skip link focuses main without shifting chrome. |
| Chart composables/StatisticsChart | Consumer-local instance, post-DOM creation/update, async teardown guards, palette/theme/direction updates, RTL legends and responsive canvas bounds. |
| Floating/search/dropdown controls | Constrain width before measuring, clamp visual viewport, hide first unpositioned frame and observe growth/scroll/resize. Immediate search invalidation prevents stale input/dismiss/unmount results; bounded loading/empty/result panel, keyboard navigation and trigger restoration. |
| Notifications | Store-reactive unread count, one deduplicated persistent poll; completed route/focus departure closes panel. Patient recent-search labels stay in component memory, legacy persisted key removed. |
| Shared forms/tables | Native button event/href/number-step contracts, error/dirty-state handling, LTR-isolated machine values, zero local sticky-table offset and RTL scroll edges. At narrow widths patient context becomes static and tabs retain local scroll width. |
| Documents/print | Current chrome/banners/overlays hidden; widths/offsets/sticky/fixed/clipping reset. Server PDF uses a separate renderer/font contract. |

Completed behavior above has selected source/component/browser evidence, not exhaustive rendering. The 2026-10-12 corrections have durable component and selected Chromium evidence; latest counts and runtime limits stay in completed.

## Shared presentation contracts

| Concern | Standard |
| --- | --- |
| Confirmation | One owner per action: button/TableActions or page handler. Retain required checkbox/reason and clinical scope/preview steps. Task deletion confirms in its page handler; draft archiving confirms in TableActions and sends the displayed opening version. |
| Feedback | `ResourceFeedback` presents loading or errors with status/alert semantics and optional explicit read retry. It never retries writes. Forms keep their readiness fieldset; submission errors use `AlertBar`. Specialized picker/table skeletons remain owned by their controls. |
| Status | `Badge` with explicit domain `statusType` owns labels/colors/icons. Task labels consistently use the feminine form; unknown states do not become cancelled. |
| Fields | Reuse FormInput/FormSelect/FormTextarea for ordinary fields; retain specialized clinical/nullable/choice controls. Numeric/contact/date/time controls isolate machine values in LTR. |
| Pages | PageContainer owns width, followed by Breadcrumb/PageHeader/content. Short forms use FormWrapper; the visit form keeps its patient sidebar and clinical sections. Shell alone owns gutters. |
| Dates / absence | DateCell supports relative or exact dates, optional time and a context-specific empty label; exact dates use the shared strict parser and LTR isolation, with source timestamps retained in the title. `formatDisplayValue` treats only null/undefined/empty strings as missing; zero and explicit no remain values. Unknown, not recorded and not applicable remain distinct. Never parse a year-only birth as a full date. |

Prescription paper controls default to blank A6 and offer A4/custom millimetres. Preprinted mode uses the supplied reference only as a screen alignment guide; offsets are physical right/down, independent of RTL. Print PDFs at actual size (100%) with matching printer paper dimensions; calibrate on a trial sheet. Paper settings are persisted per authenticated account in this browser; only normalized paper fields are stored. Issuance opens the actual saved PDF, with separate Print/Download/Open controls using the same bytes. Blob previews remain in memory and are revoked on replacement, navigation or session change; late responses cannot restore them. Another issued copy obtains a fresh preview while retaining selected settings/signature. Calibration is a patient-free sheet with a 50 mm ruler and alignment crosses; measure the ruler before adjusting offsets. [Backend print contract](../../backend/docs/contracts.md#encounters-documents-and-operations).

Saved prescriptions appear in the patient’s prescriptions tab and in visit/issuance views. Reprint opens the exact retained PDF without another issuance; a separate A4 Arabic patient handout reproduces medication names, doses and instructions from that issued snapshot. It does not infer timing/duration or include later treatment changes. History/handout bytes stay in memory; previews and pending windows clear on navigation/session change.
