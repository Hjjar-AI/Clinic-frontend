# Frontend layout and RTL fixes

Implemented: 2026-10-08, following [the design review](design-rtl-review.md). Runtime/API contracts and dependency versions are unchanged.

## Changes

| Finding | Implemented behavior |
| --- | --- |
| 1 | Mobile drawer opens independently of desktop collapse. Inclusive 768px boundary, desktop-only collapsed geometry, backdrop layering, inert background/closed drawer, Escape, focus trapping/restoration, and scroll locking. |
| 2 | Guest content clears both sidebar margins. |
| 3 | Themes expose separate base palette tokens; dark colors derive from those without self-reference. Theme swatches use the same external palette. |
| 4 | Charts observe initial canvas availability and in-place data changes after DOM updates. Consumer-local chart ownership, asynchronous creation guards, and disposal prevent sibling destruction and duplicate canvas ownership. |
| 5 | Shared page headers distribute titles/actions with gaps and responsive wrapping. |
| 6 | Templates use the existing gap/alignment/column helpers consistently. |
| 7 | The shell owns page gutters. PageContainer has standard/wide/form widths and a neutral content element; patient detail no longer nests another main landmark. |
| 8 | The second statistics KPI row spans the available page width. |
| 9 | Shrinkable grid tracks/content, content-width container queries, aligned route widths, and two-row mobile topbar reduce narrow-screen crowding. |
| 10 | Table headers stick to their own scroller at zero offset. Mobile unlabelled cells no longer reserve empty label space; scroll-edge calculation handles RTL offsets. |
| 11 | Conditionally mounted tooltips are visible, teleported outside clipping containers, and describe the actual trigger control. |
| 12 | Floating panels measure rendered geometry, clamp to viewport bounds, flip when necessary, follow viewport/ancestor scrolling, and clean up observers/listeners. Alignment supports logical start/end. |
| 13 | Phone/identifier/date displays use bidi isolation. FormInput supports control direction and appropriate LTR input types; the patient phone field uses telephone semantics. |
| 14 | Toast width fits narrow screens. Bottom navigation, content clearance, bulk-action offsets, and scroll-to-top clearance include safe-area space; footer groups wrap. |
| 15 | Chart presentation resolves colors from the active element/body, responds to theme/direction changes, uses RTL-aware legends, moves legends below narrow charts, and uses dedicated responsive sizing wrappers. |

Availability grids now derive the doctor column count through a runtime CSS custom property and use valid tracks. Queue rows have a labelled mobile presentation. Breakpoint documentation no longer recommends custom properties inside media conditions.

## External CSS

- Moved all 20 embedded scoped style blocks to mirrored paths under `src/styles/`; Vue components reference them through external scoped style sources. Existing scoping and deep selectors are preserved.
- Removed all literal template `style` attributes. Shared semantic helpers live in `public/static/css/`; page/component styles remain external.
- Converted finite presentation choices (collapse arrows, trigger severity, theme swatches, signature color) to classes/CSS tokens. Removed cosmetic random skeleton widths.
- Retained data-dependent bindings: floating coordinates/bounds, progress/animation timing, generated avatar colors, column styles/counts, skeleton chart height, and calendar geometry. Textarea resizing and drawer scroll locking also require runtime DOM values.

## Verification and limits

- JavaScript syntax checks passed for changed JS files and Vue script sections, with module declarations adapted for parser-only checking; no application execution or bundling was involved in those checks.
- Audited 80 CSS files for balanced delimiters, invalid media-variable usage, and the availability-track issue. All external component style references resolve; no literal template styles, embedded CSS, or obsolete utility names remain.
- Audited all eight themes in light/dark combinations: no custom-property dependency cycles or missing base palette references.
- Standalone probes using the actual helper source with controlled DOM/Vue/Chart adapters passed for drawer state separation, focus/scroll handling, chart ownership/concurrent creation/disposal/theme notifications, and floating-panel clamping/flipping/resize/scroll cleanup.
- These probes do not establish real Vue mounting, CSS rendering, accessibility conformance, or complete browser workflow correctness. The local Firefox launcher failed and direct headless launch crashed; browser verification remains outstanding.
- No builds, compilation/packaging tasks, test-suite access, migrations, project database operations, or dependency/version changes were performed. Temporary verification helpers lived under `/tmp`.

Next validation: render 320/375/768/900/1024/1440px widths with long Arabic names, mixed English terms, international phone numbers, populated charts, theme switches, dropdown scrolling, and keyboard navigation.
