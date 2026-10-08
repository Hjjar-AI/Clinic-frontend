# CSS organization

[main.js](../src/main.js) imports shared [app.css](../public/static/css/app.css) once; import order defines cascade, followed by third-party CSS. Keep early fonts/skeletons separately linked in `index.html`.

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

Reorganization replaced root underscore-prefixed token/form/calendar/component names, removed `components_misc.css`, split large layout/form/clinical/typography files at section boundaries. Small related widgets stay grouped; extract further for ownership/reuse needs.

Verified expanded shared selectors/declarations/quoted values/at-rules/order unchanged except comments/formatting; scoped contents byte-identical. Development scripts checked import graphs/references/sizes/delimiters/light-dark token dependencies. No build/compilation/browser rendering.

Shell follow-up: duplicate visit/sidebar geometry now lives only in shared feature CSS; two scoped copies/imports removed. See [fixes](shell-layout-fixes.md).
