# Naming: classes, attributes, tags

## CSS classes: short BEM

```
.block                 standalone component           .plan  .teaser  .review
.block__element        part of a block                 .plan__price  .review__meta
.block--modifier       variant / layout preset         .plan--featured  .faq--cards  .reviews--rail
.is-state              state toggled by JS             .is-active  .is-open  .is-in  .is-visible
```

Rules:
- Block names are **short nouns**, 1–2 words: `pcard` (product card), `hl` (highlight), `tl` (timeline), `svc` (service), `gal` (gallery). Short names keep HTML readable; explain abbreviations in the CSS comment.
- Landing-only blocks use the `lp-` prefix (`lp-hero`, `lp-story`) to avoid clashing with the home `hero`.
- Plural block for the list, singular for the item when both are needed: `.reviews` / `.review`, `.plans` / `.plan`, `.svcs` / `.svc`.
- **One** element level only: `.plan__perk`, never `.plan__list__perk`.
- A modifier never stands alone: `class="plan plan--featured"`.
- Layout presets are modifiers on the block root: `faq--${layout}`.
- States use `is-*` on the block: `.site-header.is-open .site-nav`. Prefer ARIA attributes when one exists (`[aria-pressed="true"]`, `[aria-selected="true"]`, `[aria-current="page"]`, `[hidden]`).
- Max specificity about (0,2,1). No `#id` for styling, no `!important` (except `[hidden]` and reduced motion).
- Plain child tags may be targeted when simple: `.tl__body p`, `.facts dt`.

## Utility classes (reuse, do not duplicate)

| Class | Purpose |
|---|---|
| `.container`, `.container--narrow` | centred frame, max `--max` / 820px, `--gutter` padding |
| `.sec`, `.sec--surface`, `.sec--tight`, `.sec--tight-top` | section spacing, alternating background |
| `.sec-head`, `.sec-head__title`, `.sec-head__text` | section title |
| `.btn`, `--sm`, `--lg`, `--block`, `--ghost`, `--inverse` | buttons |
| `.icon-btn` | 44×44 icon-only button |
| `.link-under` | thick underline link |
| `.tag`, `.tag--solid` | small pill label |
| `.chip` + `aria-pressed` | filter button |
| `.checklist`, `.checklist--sm` | list with check icons |
| `.stars`, `.stars--sm` | rating (`stars()` in ui.js) |
| `.avatar`, `--sm`, `--lg` | avatar (`avatar()` in ui.js) |
| `.facts` | label/value list (specs) |
| `.plain-list` | unstyled list with gap |
| `.ico` | icon size |
| `.sr-only` | hidden visually, read by screen readers |
| `.hide-mobile`, `.only-dark`, `.only-light` | visibility |

## `data-*` attributes: JavaScript hooks

JS never selects by class. Classes style; `data-*` attach behaviour:

| Attribute | Read by | Meaning |
|---|---|---|
| `data-reveal`, `data-reveal="clip"` | effects.js | fade/rise or curtain-open on scroll |
| `data-parallax="0.3"` | effects.js | moves at a different scroll speed |
| `data-tilt`, `data-tilt-stage` | effects.js | 3D tilt following the pointer |
| `data-rail`, `data-rail-track` | effects.js | horizontal track driven by vertical scroll |
| `data-steps` + `data-line` / `data-timeline` + `data-line-y` | effects.js | connector line grows with scroll |
| `data-expand` | effects.js | CTA expands to full width |
| `data-count` | core.js | number counts up when visible |
| `data-buy-anchor` | wl-sticky-buy | point whose visibility toggles the buy bar |
| `data-step`, `data-plan`, `data-person`, `data-cat`, `data-star`, `data-thumb`, `data-list` | the component's `mount` | index / key / container |

Name `data-<noun>` or `data-<verb>`; the value is data (index, id, URL), never prose.

## Tags and attributes

- Tags: `wl-<block-name>` kebab-case: `wl-landing-offer`, `wl-pdp-tabs`. Group prefixes: `wl-landing-*`, `wl-pdp-*`.
- Attributes: lowercase, one word where possible: `layout`, `variant`, `limit`, `size`, `copy`, `source`, `item`, `media`; boolean flags without value: `more`, `filter`, `featured`, `related`.
- Shared attributes: `align`, `width`, `tone`, `space` (do not reuse these names for anything else).

## JavaScript

- Variables/functions `camelCase`, constants `UPPER_SNAKE` (`THEME_KEY`, `UNITS`).
- Functions returning HTML are named after what they build: `productCard()`, `sectionHead()`, `stars()`, `avatar()`.
- State stored on an element is prefixed `_`: `el._timer`, `el._io`, `card._tilt`.
- Custom events: `wl:<thing>` (`wl:rendered`, `wl:prefill`).
- Storage keys: `wl-<thing>` (`wl-color-mode`, `wl-prefill`).

## Files

- One component file per **group**: `layout.js` (header/footer/…), `landing.js` (all landing blocks), `product-detail.js` (all PDP blocks), `blocks.js` (shared blocks), `ui.js` (atoms as functions).
- Every file starts with a comment listing its tags and their attributes.
