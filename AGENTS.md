# AGENTS.md

Instructions for AI coding agents (Codex, Claude Code, Cursor, Copilot, Gemini CLI, Jules, Windsurf…) working in this repository.

## Project

A multi-page **White Label** website: one codebase, several fictional brands, each brand is one JSON file. Vanilla HTML/CSS/JS, no framework, no build step. UI is made of `<wl-*>` custom elements rendered from data. Site copy is Vietnamese; code, comments in new files and these docs may be English.

## Run

```bash
python -m http.server 8000      # or VS Code Live Server
# open http://localhost:8000/index.html
```
There is no build, no package.json, no test suite. Opening HTML by double-click cannot load the JSON.

## Map

```
*.html                         pages = lists of <wl-*> tags, never content
assets-web-design/data-N.json  content + theme for brand N (the ONLY place to change copy)
css/base.css                   tokens, reset, buttons, utilities, shared layout attributes
css/components.css             one commented block per component
css/effects.css                motion
js/core.js                     renderer (WL.define, WL.boot, theme, SEO)
js/app.js                      imports components, BRANDS list, starts wd2026.js
js/effects.js                  data-* driven effects (GSAP ScrollTrigger)
js/components/*.js             components grouped by area (layout, hero, sections, landing,
                               product-detail, reviews, blocks, ui helpers, …)
wd2026.js                      organiser's data switcher — DO NOT EDIT
```

## Rules that must not be broken

1. Content in JSON, structure in HTML, rendering in JS, looks in CSS. No hard-coded copy.
2. Escape every JSON value with `WL.esc()`; URL parameters with `encodeURIComponent`.
3. Colours, fonts, radii, type sizes only via CSS variables (`--c-*`, `--f-*`, `--r-*`, `--t-*`).
4. Missing data → the component's `render` returns `''`; never crash on an absent key (`WL.get(data, 'a.b', fallback)`).
5. `render` is pure; events go in `mount`; timers/observers/window listeners are removed in `unmount`.
6. Short BEM classes (`block__el`, `block--mod`, `is-state`); JavaScript selects with `data-*`, never classes.
7. Every motion respects `prefers-reduced-motion`; the page works without GSAP.
8. Keys added to one `data-N.json` are added to **all** of them with the same shape.
9. Do not edit `wd2026.js`.

## Adding a component (short version)

```js
// js/components/<group>.js
const { esc, get, icon, define } = window.WL;
/** <wl-my-block layout="a|b" limit="4"> — what it shows, which data it reads */
define('wl-my-block', {
  render(data, el) {
    const list = get(data, 'myBlock', []);
    if (!list.length) return '';
    return `<section class="sec"><div class="container my-block my-block--${esc(el.attr('layout', 'a'))}">…</div></section>`;
  },
  mount(el, data) {},   // optional
  unmount(el) {},       // optional
});
```
Then import the file in `js/app.js`, add CSS in `components.css`, place the tag in a page, add data to every JSON.

Every tag automatically supports the shared layout attributes `align`, `width`, `tone`, `space` (CSS in `base.css`); many also take a `layout` preset.

## Full guide

The detailed skill lives in **`skills/skills/wl-builder/`**. Read `SKILL.md` first, then only the reference you need:

| Topic | File |
|---|---|
| All tags and attributes | `references/component-catalog.md` |
| `align` / `width` / `tone` / `space` and `layout` presets | `references/layout-params.md` |
| Render lifecycle | `references/architecture.md` |
| `WL.define` API | `references/component-api.md` |
| The `core.js` renderer | `references/core-renderer.md` |
| JSON organisation | `references/json-data.md` |
| Fast brand/content switching | `references/content-switcher.md` |
| CSS tokens, files | `references/css-tokens.md` |
| Naming | `references/naming.md` |
| Atoms (button, avatar, stars, tag, field, countdown) | `references/atoms.md` |
| Header, footer, sidebar, card, tabs, dialog | `references/layout-components.md` |
| Sections and page composition | `references/sections.md` |
| Product page and reviews | `references/pdp-reviews.md` |
| Campaign landing page | `references/landing-page.md` |
| Effects, accessibility, performance | `references/effects-a11y.md` |
| Pre-submit checklist | `references/checklist.md` |

## Verifying a change

- Serve locally and open the affected page; switch brand with the bottom-left **Đổi thương hiệu** button (at least two very different brands), toggle light/dark, check 390px and 1440px wide.
- The browser console must stay free of errors; no `<i data-lucide>` left unconverted (unknown icon name).
- Validate JSON shape across brands with the script in `references/json-data.md`.

## Commits

Small, focused commits with an imperative subject (`add reviews component`, `fix sticky buy bar on mobile`).
