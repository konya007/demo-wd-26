# CSS variables (tokens) and CSS organisation

## Three tiers of variables

```
Tier 1: brand tokens        ← JSON theme, written by core.js into <style id="wl-theme">
        --c-primary --c-on-primary --c-accent --c-bg --c-surface --c-text --c-muted --c-border
        --f-heading --f-body   --r-sm --r-md --r-lg

Tier 2: derived / system    ← base.css; not per brand but computed from tier 1
        --c-primary-soft: color-mix(in srgb, var(--c-primary) 12%, var(--c-bg));
        --c-surface-2:    color-mix(in srgb, var(--c-text) 4%, var(--c-bg));
        --c-brand / --c-brand-on / --c-ink / --c-paper   fixed copies used by tone="…"
        --t-sm … --t-3xl (type scale)   --gutter --max --sec-y --header-h   --ease-out

Tier 3: component-local     ← set with style="" or JS
        --d (reveal delay)  --i (word index)  --rx --ry --px --py (3D tilt)  --rating (stars)  --bc (brand card colour)
```

Rule: components **read** tiers 1 and 2 and **write** only tier 3. The one exception is a scope that re-themes a whole region (`tone`, `.news--card`): it redefines tier-1 tokens locally so every child follows.

## Prefixes

| Prefix | Kind | Example |
|---|---|---|
| `--c-` | colour | `--c-primary`, `--c-muted` |
| `--f-` | font family | `--f-heading` |
| `--r-` | radius | `--r-sm` (buttons, inputs), `--r-md` (cards), `--r-lg` (large images) |
| `--t-` | font size | `--t-base`, `--t-2xl` |
| `--sec-y`, `--gutter`, `--max`, `--header-h` | layout | |
| `--ease-` | easing curve | `--ease-out` |

Name tokens by **role** (`--c-surface`), never by **value** (`--blue-500`). That is why the same CSS is right for every brand and for dark mode.

## Colour by role

| Role | Token |
|---|---|
| Page background | `--c-bg` |
| Cards, forms, raised blocks | `--c-surface` |
| Alternating section background (`.sec--surface`) | `--c-surface-2` |
| Main / secondary text | `--c-text` / `--c-muted` |
| Buttons, links, highlights, selected state | `--c-primary` (text on it: `--c-on-primary`) |
| Soft background for icons, selected chips | `--c-primary-soft` |
| Small decoration (rings, dots, stars, bars) | `--c-accent` |
| Borders | `--c-border` |

Need a new shade → `color-mix()` instead of a new token: `color-mix(in srgb, var(--c-primary) 45%, transparent)`.

Allowed hard-coded colours: white text and dark overlays on photos (`.lp-hero`, `.hero--full`, `.gal__item figcaption`), form error red `#d93025`.

## Light / dark

- Dark values come from `theme.darkColors` → `:root[data-theme="dark"]{…}`.
- Components do **not** restyle for dark mode if they use tokens; add a dark rule only when unavoidable.
- Show/hide by mode: `.only-dark`, `.only-light`.

## Fluid type and spacing

```css
--t-2xl: clamp(2rem, 1.4rem + 2.4vw, 3.25rem);
--sec-y: clamp(72px, 10vw, 136px);
```
Prefer `clamp()` over many media queries. Section title `--t-2xl`; page/hero title `--t-3xl`; card title `--t-lg`/`--t-xl`.

## CSS files

| File | Contains | Does not contain |
|---|---|---|
| `base.css` | default tokens, reset, type, `.container`, `.sec`, `.btn`, `.icon-btn`, `.link-under`, `.sr-only`, `.wl-host` + shared layout attributes | component styles |
| `components.css` | one block per component, opened by `/* ---------- Name ---------- */`, grouped by file (chrome, sections, landing, atoms, PDP, reviews, blocks) | keyframes, scroll-linked motion |
| `effects.css` | `@keyframes`, `[data-reveal]`, entrance animations, View Transitions; all inside `@media (prefers-reduced-motion: no-preference)` | colours, layout |

Inside a component block: block → elements → modifiers/layout presets → states → media queries (mobile first, then `min-width`).

## Shared breakpoints

`640px` (large phone), `768px` (tablet), `960px` (desktop layout), `1024px` (4 columns). Write mobile first and widen with `@media (min-width: …)`. For card grids prefer `repeat(auto-fit, minmax(min(100%, 300px), 1fr))`, which needs no breakpoint.
