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

Completed behavior above has selected source/component/browser evidence, not exhaustive rendering. The 2026-10-12 review corrections cover cards, selectors, dates, permissions, theme ownership and other controls; their current evidence is source checks and isolated probes, pending rendered verification.
