# CSS organization

[main.js](../../src/main.js) imports shared [app.css](../../public/static/css/app.css) once; import order defines cascade, followed by third-party CSS. Keep early fonts/skeletons separately linked in `index.html`.

| Location under `public/static/css/` | Responsibility |
| --- | --- |
| `tokens/` | Colors, component values, motion, spacing, typography, breakpoint guidance |
| `themes/` | Palette variants and dark overrides; `index.css` orders them |
| `base/` | Reset, document typography, application state, splash screen |
| `layout/` | Shell, grid/flex/spacing helpers, footer/navigation, containers, responsive page composition |
| `forms/` | Controls, choices, feedback/actions, input widgets, search/select, dates, multi-select, score sliders |
| `components/` | Shared widgets and their variants |
| `features/` | Appointment views, clinical widgets, patient and visit styling |
| `utilities/` | General helpers and text/icon presentation |
| `motion/` | Animations and Vue transition classes |
| `documents/` | PDF/document styling |

Component CSS: mirrored `src/styles/` paths, kebab-case filenames, external `<style scoped src="...">`; never import globally. Tiny scoped files preserve ownership/specificity.

Use descriptive kebab-case; target 50–200 readable lines, review above 250 lines/12 KiB (maintenance guidelines, not CSS standards). Keep coherent themes/tokens/rules/media queries intact. Widget-responsive rules stay with widgets; page composition: `layout/responsive-pages.css`.

Add modules explicitly to `app.css` by cascade, not alphabetically: themes override tokens, features remain later, helpers may override components. Matching classes do not justify global/scoped merging. Inline bindings only for runtime coordinates/data-driven widths.

Source reorganization preserved expanded rules/cascade and byte-identical scoped contents; import/reference/delimiter/theme-cycle probes passed. Duplicate visit/sidebar geometry now belongs only to shared feature CSS; two redundant scoped copies were removed. Twenty scoped blocks were externalized; runtime geometry/data bindings remain inline. [Layout corrections](layout.md), [current runtime evidence](../doneCurrent.md). No production bundle was run.
