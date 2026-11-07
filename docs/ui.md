# UI ownership

[API contracts](../../backend/docs/contracts.md) · [Evidence](doneCurrent.md) · [Remaining](workCurrent.md).

## CSS and layout

`src/main.js` imports `public/static/css/app.css` once: tokens/themes → base/layout → forms/components/features → utilities/motion/documents; preserve third-party order and early font/skeleton links. Global CSS uses native selectors/kebab-case modules; mirrored `src/styles/` uses external scoped `<style src>`, never global imports. Preserve deep selectors. Static styles belong in CSS; runtime coordinates/colors/heights/columns/resizing/scroll locks retain bindings.

Shell owns gutters/safe-area budget, PageContainer widths. Shrink flex/grid children; wrap actions; tables/tabs scroll locally. Literal breakpoints/noncyclic semantic tokens; never mask overflow globally. Mobile drawer/desktop collapse are independent, inclusive 768px boundary; narrow patient header is static. Print hides chrome/overlays and resets fixed/sticky/clipping geometry; server PDF has its own font/layout contract.

## Shared presentation contracts

| Owner | Rule |
| --- | --- |
| Confirmation/forms | One confirmation owner/action; retain checkbox/reason/preview/scope consent. Task page confirms deletion; TableActions confirms draft archive with displayed version, retains failed rows/refreshes success. Require successful hydration/opening version before saves; retain dirty/error/pending/native validity guards. |
| Feedback/status | ResourceFeedback owns loading/error/read retry, never write retry; form errors use AlertBar. Badge uses domain `statusType`, unknown is not cancelled. |
| Fields/dates | Shared ordinary inputs; specialized clinical/nullable controls stay distinct. Machine values LTR. DateCell uses strict offset-aware dates, rejects rollovers, optional time/context absence and source title. Only null/undefined/empty string is missing; preserve zero/no/unknown/year-only birth. |
| Pages/workspace | PageContainer/Breadcrumb/PageHeader; short FormWrapper forms, visit sidebar/sections. Read-only approved references show date/revision; gaps are hints, not mandatory fields. Server table sorting, fixed identity columns, inline desktop/mobile-dialog previews. Medication directions expand; never infer duration. |
| Focus/overlays | Top layer alone owns Tab/Escape; refresh enabled/visible targets, preserve nested locks/focus return/out-of-order cleanup. Cards/rows/tabs work by keyboard without hijacking nested controls; skip link focuses main. |
| Floating/search | Bound width before measurement; clamp visual viewport, hide unpositioned frame, observe growth/scroll/resize. Immediately invalidate stale input/dismissed/unmounted reads; expose bounded loading/error/empty/results and keyboard/trigger focus. |
| Charts/calendar | Consumer-local post-DOM charts; guard async disposal/update theme/direction/RTL legends. Calendar forwards event arguments, handles overlapping/off-hour bookings and actual paged/time data. |
| Session/privacy | Clear account/resource drafts/stores/catalog/LRU/queries/previews/polls on session change; reject late work. Cancel page-departure reads, retain same-page query reads. One unread poll; close panels on route/focus departure. Scratchpad session-only, recent patient labels memory-only; log static operation/status only. |
| Catalogs/scales | Follow real cursors, coalesce/invalidate lookups. Preserve existing answers/removals until late definitions resolve; zero bounds and nullable scores remain meaningful. |

## Model commands and documents

`src/services/contracts.js` defines wire types/write allowlists; services map reads/forms to explicit commands, preserving versions/nulls and shared CSRF/retry ownership. UI grants reflect server authority. Invoice rows edit description/quantity/unit price; totals derive from lines, omitted lines remain intact. API uses decimal strings; `decimalMoney.js` uses integer-hundredth half-up arithmetic. Marital codes have local Arabic labels; `select_primary` needs opening patient version/reason. Follow-up outcome actor/time/completion revision are read-only; record choices come from backend metadata.

Preferences (density/split reference/progressive display, columns/sort) are account/browser-owned and contain no clinical facts. Signatures retain strokes and invalidate saved PNG after edits. Paper defaults A6, supports A4/custom mm; preprinted reference is screen-only, offsets physical right/down independent of RTL. Print 100%, match stock, measure calibration's 50 mm ruler. Persist only normalized paper settings per account.

Print/Download/Open/reprint use exact retained PDFs; another issuance needs fresh preview. Blob/pending windows stay memory-only, revoke on replacement/navigation/session change and reject late responses. Patient/visit history reprints without issuance; separate A4 Arabic handout uses issued snapshot only, no inferred schedule/duration. [Backend document rules](../../backend/docs/contracts.md#encounters-documents-and-operations).
