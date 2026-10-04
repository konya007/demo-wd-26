---
name: wl-builder
description: How to build components, sections, pages and campaign landing pages for the White Label website (vanilla HTML/CSS/JS, <wl-*> web components, one JSON file per brand). Use when creating or changing a button, avatar, tag, rating, header, sidebar, footer, card, section, hero, product detail (PDP) block, reviews, landing page; when adding keys to data-N.json; when naming classes or organising CSS variables; when adding layout options (align, width, tone, space, layout); when editing core.js (the renderer) or the fast brand/content switcher.
---

# WL Builder: building UI for the White Label site

The project runs **several brands from one codebase**. Read this file first, then open only the reference file that matches the task.

## Project map

```
*.html                         a page = a list of <wl-*> tags, NO content
assets-web-design/data-N.json  all content + theme for brand N (Vietnamese copy)
css/base.css                   tokens, reset, type, buttons, utilities, shared layout params
css/components.css             styles per component (one commented block each)
css/effects.css                motion
js/core.js                     renderer: WL.define, WL.boot, theme, SEO
js/app.js                      imports components, BRANDS list, starts wd2026.js
js/effects.js                  effects driven by data-* (reveal, tilt, parallax, GSAP)
js/components/*.js             one file per group of components
wd2026.js                      organiser's library, DO NOT EDIT
```

## Seven golden rules

1. **Content lives in JSON, structure in HTML, rendering in JS, looks in CSS.** No hard-coded copy in HTML/JS (except generic accessibility labels).
2. **Every JSON value goes through `esc()`** before it is put into HTML. Values in a URL query go through `encodeURIComponent`.
3. **Colour, font, radius and type size come only from CSS variables** (`var(--c-primary)`, `var(--r-md)`, `var(--t-xl)`). No hex codes, except white text on photos.
4. **Missing data → `render` returns `''`.** A brand without a key must not break the page.
5. **Re-rendering must be safe.** `render` is pure (data → HTML string). Events are bound in `mount`. Timers, observers and listeners on `window`/`document` are cleaned up in `unmount` (or use `WL.onScroll`).
6. **Short BEM class names**: `block`, `block__element`, `block--modifier`, state `is-*`, JS hooks `data-*`. JS never finds elements by class.
7. **Motion is optional**: respect `prefers-reduced-motion`; without GSAP the page still shows all content.

## Workflow for "build component X"

1. Pick the level: **atom** (button, avatar, tag, stars, countdown) → **molecule** (card, header, sidebar) → **section** → **page**.
2. Look for something to reuse: `grep "define('wl-" js/components`, and `references/component-catalog.md`.
3. Design the data first (`references/json-data.md`): where the key lives, its name, whether it is optional. Add it to **every** `data-N.json`.
4. Write the component with `WL.define` (`references/component-api.md`). Offer a `layout` attribute when there is more than one sensible arrangement (`references/layout-params.md`).
5. Add CSS under a new commented block in `components.css` (`references/css-tokens.md`, `references/naming.md`).
6. Put the tag on a page. Check at least 2 very different brands, light + dark, 390px and 1440px.
7. Run `references/checklist.md`.

## Which reference to open

| Task | File |
|---|---|
| Every existing tag and its attributes | `references/component-catalog.md` |
| Shared layout attributes (`align`, `width`, `tone`, `space`) and `layout` presets | `references/layout-params.md` |
| Render flow, render → mount → unmount lifecycle | `references/architecture.md` |
| Writing a new component, `WL.define` API, nested components | `references/component-api.md` |
| Building or changing the `core.js` renderer | `references/core-renderer.md` |
| Adding or organising JSON keys | `references/json-data.md` |
| Fast brand/content switching, caching, View Transitions | `references/content-switcher.md` |
| CSS variables, light/dark theme, CSS file layout | `references/css-tokens.md` |
| Class, `data-*`, tag and attribute naming | `references/naming.md` |
| Button, icon button, avatar, stars, tag, chip, field, countdown | `references/atoms.md` |
| Header, footer, sidebar, card, tabs, dialog | `references/layout-components.md` |
| Large sections: hero, grids, timeline, pricing, FAQ, CTA, page composition | `references/sections.md` |
| Product detail page and reviews | `references/pdp-reviews.md` |
| Campaign / product launch / new tour landing page | `references/landing-page.md` |
| Scroll effects, accessibility, performance | `references/effects-a11y.md` |
| Pre-submit checks | `references/checklist.md` |
