# Navigation and interaction findings by file

Reported symptom: interactions cause slight sideways shifting/scroll needed to reveal content. Preserve local table/tab scrolling; find the overflowing element rather than adding another global hide rule. N1–N5/N8 addressed by [interaction regressions](../testing/interactions.md); **N6/N7 remain confirmed open findings**. Prior [shell/layout fixes](layout.md) remain intact.

| ID / priority / status | Sources | Trigger/impact → correction |
| --- | --- | --- |
| N1 / P2 / fixed | `useFloatingPosition.js` | Measured old constrained width then enlarged panel could exceed viewport (400px viewport, 304→360px panel at left 76px reached 436px) → apply width constraints before measurement, hide first unpositioned frame, clamp visual viewport and remeasure growth/resize. |
| N2 / P2 / fixed | `SearchInput.vue`, `useSearch.js` | Debounce-only invalidation let old responses replace typed queries/reopen dismissed panels or finish after unmount → invalidate immediately on input/clear/dismiss/selection/unmount, cancel debounce/request and reject late work. Controlled-selection replacement retains new query. |
| N3 / P2 / fixed | `SearchInput.vue`, `forms/search-select.css` | Empty state entered normal flow and changed fixed topbar height → loading/empty/results share one bounded floating panel; combobox/listbox expanded/control semantics, arrows/wrap/Enter/Escape/focus departure. |
| N4 / P2 / fixed | `useUnreadCount.js`, `NotificationCenter.vue`, notifications store | Copied badge remained stale after read/delete; two polling owners fetched redundantly → reactive store count, one deduplicated polling loop and persistent initial fetch surviving navigation cancellation. |
| N5 / P2 / fixed | `NotificationCenter.vue`, `BaseButton.vue`, `useDropdown.js` | Router-link close callback/focus departure left shell panel open → native event contract retained; close on completed route/focus departure. Dropdown entry waits for rendered visibility, skips disabled controls and restores Escape trigger. |
| N6 / P2 / **open** | `AppNavigation.vue`, `BottomNav.vue`, `src/router/index.js` | Independent sibling detail/create/edit routes lose section highlighting → shared route section identity or permission-aware resolver for both navigation surfaces with correct `aria-current`. |
| N7 / P2 / **open** | `useNavigationItems.js`, `apiClient.js`, `src/stores/loading.js` | Dashboard badge refresh/persistent polling enter global counter; after 200ms pointer-blocking overlay can interrupt typing and replace cards → separate background/foreground loading, minimal cached badge data, preserve cards and avoid duplicate mount fetches. |
| N8 / P1 / fixed | `SearchInput.vue`, auth logout/store boundary | Patient names persisted in shared recent-search localStorage across accounts → remove legacy key, keep labels only in component memory; generic catalogs need separately scoped policy if persistence is introduced. |

## Remaining responsive risks (not confirmed browser defects)

| Source area | Reproduction / expected ownership |
| --- | --- |
| Bell/topbar and bottom-nav badge geometry | Test 0→1→99→100 counts, long labels and 200% text. Nonshrinking action groups/badges can widen; reserve stable footprint/equal bounded tracks and cap/position badges without shifting text. |
| `base/reset.css`, document/local scrollers | `overflow-x:hidden` can conceal overflow while focus scrolls ancestors; inspect both physical edges/RTL negative-left bounds, document/visual-viewport widths and all scroll offsets. |
| Floating panels/native selects | Check first frame, async growth/resize, keyboard focus, both directions, zoom and short landscape. Native popup geometry is independent of the floating composable. |
| Drawer/route motion | Width animation squeezes content and immediate hidden state suppresses closing; prefer fixed-width directional transform with deliberate visibility/focus lifecycle, anchored brand/close and scrollable links. `page-fade` lacks matching CSS states; define route motion/fallback and reduced-motion handling, including explicit smooth scroll. |

Reproduction matrix: mobile 320/360/390px, boundary 768/769px, expanded/collapsed desktop, RTL/LTR, 100/200% text, long labels/counts; compare before/after search selection, badge arrival, panel opening/resizing, Escape, drawer toggle and Back/Forward. No patient labels/content in diagnostics. Controlled handlers reproduced races/state/privacy/width arithmetic; current Chromium RTL matrix covers selected panel/route/focus cases, not all risks above. [Results](../doneCurrent.md), [remaining work](../workCurrent.md).
