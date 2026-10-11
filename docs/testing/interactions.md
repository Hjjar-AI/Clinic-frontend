# Frontend interaction verification

Tests use synthetic records, temporary SQLite/media, actual workspace Vue source and the real Django API. No production build, migration-file, clinic-data, application/dependency-version or lockfile changes.

## Added coverage

| Area | Component checks | Real browser checks |
| --- | --- | --- |
| Charts | Data copies, in-place updates, empty transitions, theme recreation, RTL/LTR options, compact legends, Arabic ticks, palette cycling, cleanup | Canvas painting, actual tooltip hover/legend click, theme recreation, date typing/blur, keyboard calendar dismissal, filtering/reset, route cleanup |
| Floating/search panels | Width growth, visual viewport offsets, RTL/LTR bounds, controlled selection replacement, immediate search invalidation, late response suppression, debounce cancellation, safe label rendering, session-local history | Bounded result/empty panels, stable header height, keyboard selection/dismissal, badge mutations, panel resizing and route closure |
| Keyboard/focus | Disabled actions, arrows/Home/End, Escape/trigger restoration, focus departure, nested overlay priority, Tab wrapping, inert background, scroll lock | Modal trapping/restoration, mobile/tablet drawer trapping/restoration, notification and search controls |
| Catalog CRUD | Opening versions, cancelled retirement, reactivation/list refresh, cancelled draft reset and retained rejected saves | Diagnosis/medication create/edit/retire/reactivate/reload; scale create, invalid/valid slider question and retirement/reactivation |
| Admin/patient forms | User required/matching passwords, edit without password changes, template nested content/conflicts/dirty navigation, inherited permissions, change-password session expiry | User validation/create/edit/disable; template nested edit/dirty cancellation/retire/reactivate; patient demographic edit/reload with unchanged identifiers/unknowns |

Eight new component files add 62 cases. One additional notification-store case verifies persistent initial fetching and one timer/fetch across repeated polling starts. Two new browser files add ten scenarios, each configured for desktop/tablet/mobile Arabic RTL Chromium.

## Confirmed defects corrected

- Search reused the shared race-safe search composable; dismissal/input/unmount invalidate old work. Typing over a controlled selection retains the new query. Empty/loading content now stays inside the same fixed results panel. Combobox/listbox semantics, initial ArrowUp/ArrowDown selection, wrapping, Enter/Escape and focus departure are covered. Historical patient labels are removed from browser storage; recent labels stay in component memory.
- Floating positioning applies width constraints before measuring a growing panel and hides the first unpositioned frame.
- Dropdowns skip disabled actions, support keyboard entry/navigation and restore the trigger on Escape. Keyboard entry waits until computed panel visibility reaches the DOM; shared button transitions exclude visibility so inherited panel hiding cannot delay focus; focus departure closes the panel.
- The notification bell reads the store count reactively. Completed route changes close its panel. Initial polling uses a persistent request so navigation cannot abort it; repeated owners reuse one polling loop.
- TableActions now exposes edit buttons for modal-based catalogs while rejecting incomplete edit routes. Catalog/scale save handlers consume errors already reported by shared API handling, preserving drafts without unhandled promise rejections; catalog submit buttons reflect saving state.
- Date-range inputs display day/month/year while their models remain ISO; blur no longer reparses an ISO display using flatpickr’s day/month/year format. Initial dates use Date objects and model changes/clearing synchronize the picker selection. Escape closes both range calendars, including when keyboard focus opened both.
- User creation requires both password fields. Change-password confirmation compares against the new password.

## Results and limits

Latest full/focused run counts and final-calendar rerun limits: [completed](../doneCurrent.md); [commands/file coverage](guide.md). jsdom verifies DOM/contracts, not rendered geometry; chart component tests use a controlled Chart.js double, supplemented by real browser canvas interactions. Browser CRUD uses actual API responses rather than mocked routes. Existing PDF appearance results remain historical.

This matrix covers the listed interactions, not every CRUD permutation or an accessibility certification. Other browser engines, browser LTR, text zoom, native popup behavior, broader visual comparison, PostgreSQL concurrency and production bundles remain unverified. Historical navigation-section highlighting/background-loading findings N6/N7 and untested responsive risks remain open in [the shell review](../ui/navigation.md).
