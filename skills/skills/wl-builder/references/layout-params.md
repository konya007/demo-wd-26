# Layout parameters

Two kinds of attributes change how a component is arranged **without touching content**:

1. **Shared attributes**, available on every `<wl-*>` tag, implemented once in CSS.
2. **`layout` presets**, defined per component when it has several good arrangements.

```html
<wl-faq layout="stack" align="center" width="narrow" tone="surface" space="tight"></wl-faq>
```

## 1. Shared attributes

`core.js` adds the class `wl-host` to every component; `css/base.css` styles `.wl-host[attr="value"]`. Nothing in the component's JS is needed.

| Attribute | Values | Effect |
|---|---|---|
| `align` | `start` (default), `center`, `end` | text alignment; centres section titles, hero copy, button rows, chips. Cards, forms, tables, FAQ items stay left-aligned for readability. |
| `width` | `narrow` (820px), default (1200px), `wide` (1440px), `full` | max width of every `.container` inside |
| `tone` | `none`, `surface`, `primary`, `inverse` | background **and colour set** of the section |
| `space` | `none`, `tight` (×0.5), default, `loose` (×1.4) | vertical padding of the section |

They act on the component's **root `<section>`** (`.wl-host > section`), so a component must render a `<section>` as its outer element for `tone`/`space` to work.

### How `tone` works

`tone` redefines the colour tokens locally instead of styling each child:

```css
.wl-host[tone="primary"] > section {
  --c-bg: var(--c-brand);  --c-text: var(--c-brand-on);
  --c-primary: var(--c-brand-on);  --c-on-primary: var(--c-brand);
  --c-muted: color-mix(in srgb, var(--c-brand-on) 78%, var(--c-brand));
  /* + border, surface, surface-2, primary-soft */
}
```

`--c-brand`, `--c-brand-on`, `--c-ink` and `--c-paper` are fixed copies of the root colours declared in `base.css`. They exist so `--c-primary` can be swapped with `--c-on-primary` without a circular reference. Every child that uses tokens (buttons, stars, tags, borders) recolours automatically.

Do not combine `tone` with components that already paint their own brand background (`wl-cta-band`, `wl-landing-hero`).

### Adding a new shared attribute

1. Pick a name that describes intent (`gap`, `media`), not a CSS property value.
2. Add `.wl-host[name="value"] …` rules in the shared-parameters block of `base.css`.
3. Document it in the table above and in `component-catalog.md`.

## 2. `layout` presets per component

Read with `el.attr('layout', 'default')`, then add it as a BEM modifier on the root of the component (`faq--stack`). All CSS for a layout is in `components.css` under that component's block.

| Component | Presets |
|---|---|
| `wl-hero` | `variant="split\|full"` |
| `wl-features` | `story` (sticky image), `rows` (alternating) |
| `wl-products` | `rail` (horizontal), `grid` |
| `wl-process` | `row` (horizontal with animated line), `list` (title left, steps stacked) |
| `wl-testimonials` | `spotlight` (one big quote), `grid` (cards with avatars) |
| `wl-faq` | `split` (title left), `stack` (title above, narrow list), `cards` (2-column cards, all open) |
| `wl-cta-band` | `split`, `center`, `card` (contained rounded box, no expand effect) |
| `wl-landing-highlights` | `bento` (big first tile), `grid` (equal tiles), `list` (icon rows) |
| `wl-reviews` | `split` (sticky summary), `stack`, `grid`, `rail` |
| `wl-product-detail` | `split`, `stacked`; `media="gallery\|single"` |
| `wl-pdp-services` | `row`, `cards` |
| `wl-pdp-content` | `alternate`, `stack` (article), `cards` |
| `wl-gallery` | `masonry`, `grid`, `strip` |
| `wl-newsletter` | `inline`, `card`, `split` |

### Writing a new preset

```js
const layout = el.attr('layout', 'split');                 // default = most common use
return `<div class="container faq faq--${esc(layout)}">…`;  // always esc() attribute values
```
```css
/* components.css, inside the FAQ block */
.faq--cards .faq__list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 16px; }
```

Rules:
- The same markup should serve every preset where possible; change CSS, not HTML. Use a different template only when the structure really differs (`wl-testimonials` grid vs spotlight).
- Presets must not change which content is shown, only how it is arranged.
- Default rules that only make sense for one preset are scoped to it (`.steps--row .steps__line`), so other presets start clean.
- Unknown values fall back to the default styling, so a typo never breaks the page.

## Recipes

| Look | Markup |
|---|---|
| Centred FAQ, reading width | `<wl-faq layout="stack" align="center" width="narrow">` |
| Brand-coloured stats band | `<wl-stats tone="primary">` |
| Dark testimonials | `<wl-testimonials layout="grid" tone="inverse">` |
| Compact reviews strip on the home page | `<wl-reviews layout="rail" limit="6" space="tight">` |
| Boxed CTA at the end of a sub page | `<wl-cta-band layout="card">` |
| Full-width image strip | `<wl-gallery layout="strip" width="full">` |
