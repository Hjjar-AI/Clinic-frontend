# CSS organization

Shared application CSS starts at [app.css](../public/static/css/app.css), imported once by [main.js](../src/main.js). Its import order defines the existing cascade. Keep third-party CSS after this entry point. Fonts and initial skeleton styles remain separate links in `index.html` for early loading.

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

Component-specific styles remain under `src/styles/`, mirroring the owning Vue component path with kebab-case CSS filenames. Each component uses an external `<style scoped src="...">`; these files must not be imported into the global entry point. Tiny scoped files are intentional when they preserve component ownership and specificity.

Use descriptive kebab-case names. Aim for roughly 50–200 readable lines per shared module; review a file before it exceeds 250 lines or about 12 KiB. These are maintenance guidelines, not CSS standards. Keep coherent themes/tokens intact and avoid splitting rules or media queries merely to meet a count. Keep responsive rules beside the widget they affect; cross-component page composition belongs in `layout/responsive-pages.css`.

Add shared modules explicitly to `app.css` at the appropriate cascade position. Its order is not alphabetical: themes override tokens, feature styles retain their later position, and existing shared helpers may override earlier components. Do not merge separate global and scoped definitions just because class names match. Inline bindings are reserved for runtime values such as measured coordinates and data-driven widths.

The reorganization replaces the root underscore-prefixed token/form/calendar/component filenames and removes the `components_misc.css` wrapper. Large layout, form, clinical, and typography files were split at complete section boundaries. Existing small related widget groups remain together; further extraction should follow an actual ownership or reuse need.

Verification compared expanded shared CSS before and after, preserving every selector, declaration, quoted value, at-rule, and their order (ignoring comments/formatting). Scoped file contents were preserved byte for byte. Import graphs, style references, file sizes, delimiter balance, and light/dark token dependencies were checked with development scripts. No build, compilation, or browser rendering was performed.
