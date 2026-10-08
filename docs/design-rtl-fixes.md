# Frontend layout and RTL fixes

Implemented 2026-10-08 after [the design review](design-rtl-review.md); runtime/API contracts/dependency versions unchanged.

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

Availability grids use runtime doctor-count CSS properties/valid tracks; queue rows have mobile labels; breakpoint docs no longer recommend media-condition custom properties.

## External CSS

- Externalized 20 scoped blocks to mirrored `src/styles/` paths; Vue scoped sources preserve scoping/deep selectors.
- Removed literal template `style`; shared semantic helpers: `public/static/css/`; page/component styles remain external.
- Classes/tokens replace finite collapse-arrow/severity/swatch/signature-color choices; removed cosmetic random skeleton widths.
- Retained runtime floating coordinates/bounds, progress/animation timing, avatar colors, column styles/counts, skeleton heights, calendar geometry; textarea resize/drawer scroll lock also need DOM values.

## Verification and limits

- Changed JS/Vue script syntax passed with module declarations adapted for parser-only checks; no app execution/bundling.
- Audited 80 CSS files: delimiters/media variables/availability tracks; external style references resolve; no literal template styles/embedded CSS/obsolete utilities.
- Eight themes × light/dark: no token cycles/missing base palettes.
- Actual-helper probes with controlled DOM/Vue/Chart adapters passed: drawer state/focus/scroll, chart ownership/concurrent creation/disposal/theme notifications, floating clamping/flipping/resize/scroll cleanup.
- Unverified: real Vue mounting, CSS rendering, accessibility/full browser workflows. Firefox launcher failed; direct headless launch crashed.
- No builds/compilation/packaging, test-suite access, migrations, project DB/dependency/version changes; temporary helpers: `/tmp`.

Pending rendering: 320/375/768/900/1024/1440px, long Arabic/mixed English, international phones, populated charts/theme switches, dropdown scrolling, keyboard navigation.
