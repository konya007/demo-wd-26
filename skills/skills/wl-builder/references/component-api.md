# Component API: `WL.define`

## Standard skeleton

```js
/**
 * <wl-my-block layout="a|b" limit="4">   ← document every attribute right above define
 *   a: …
 *   b: …
 */
import { sectionHead } from './sections.js';          // reuse the section title

const { esc, get, icon, define } = window.WL;

define('wl-my-block', {
  render(data, el) {
    const list = get(data, 'myBlock', []);             // always give a fallback
    if (!list.length) return '';                        // no data → render nothing
    const layout = el.attr('layout', 'a');              // string attribute
    const items = list.slice(0, el.num('limit', 99));   // number attribute

    return `
      <section class="sec">
        <div class="container">
          ${sectionHead(data, el, 'myBlock')}
          <ul class="my-block my-block--${esc(layout)}">
            ${items.map((it, i) => `
              <li class="my-block__item" data-reveal style="--d:${i * 0.08}s">
                ${icon(it.icon)}
                <h3>${esc(it.title)}</h3>
              </li>`).join('')}
          </ul>
        </div>
      </section>`;
  },
  mount(el, data) {        // optional: bind events
    el.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => { /* … */ }));
  },
  unmount(el) {            // optional: clean up what lives outside the tag
    clearInterval(el._timer);
  },
});
```

Then import the file in `js/app.js` if it is new. Every tag is `display: block` automatically (class `.wl-host`).

Render a `<section>` as the outer element so the shared `tone` and `space` attributes work.

## Tools on `window.WL`

| Function | Use |
|---|---|
| `esc(v)` | HTML-escape. **Required** for every JSON value. |
| `get(obj, 'a.b.0.c', fallback)` | Safe deep read. |
| `icon(name, cls)` | Lucide icon placeholder `<i data-lucide>`; `WL.boot` turns it into SVG. Icons added after boot (inside `mount`) → call `WL.refreshIcons()`. |
| `el.attr(name, fallback)` / `el.num(name, fallback)` | Read attributes. Boolean flags: `el.hasAttribute('more')`. |
| `WL.onScroll(el, fn)` | Window scroll handler that is replaced, not stacked, on re-render. |
| `WL.params` | `URLSearchParams` of the page. |
| `WL.data` | Data currently shown. |
| `WL.setMode('dark'\|'light')` | Switch colour mode. |

## Attribute conventions

- Attributes describe **arrangement**, never content: `layout`, `variant`, `limit`, `size`, `media`, flags `more`, `filter`, `featured`.
- `copy="otherKey"`: take the section title from `sections.otherKey` → one component, several copy sets.
- `source="landing.faq"`: read the data array from another path → `<wl-faq>` serves the general FAQ and the campaign FAQ; `<wl-gallery>` works on any array with `image`.
- `item`: which product a component is about (`""` = current `?id`, `"landing"`, or an explicit id).
- Defaults are the most common use.
- Shared attributes (`align`, `width`, `tone`, `space`) are handled by CSS; do not re-implement them in a component.

## Nested components

A `<wl-*>` tag may appear inside another component's template:

```js
return `<div class="lp-hero__timer"><wl-countdown size="lg"></wl-countdown></div>`;
```

The child renders when attached and has its own lifecycle (its `unmount` clears the timer when the parent re-renders). Use this for atoms with their own logic (countdown, player, carousel). For static fragments use an exported function (`productCard(p)`, `stars(4.5)`); it is lighter.

## Common mistakes

| Mistake | Result | Fix |
|---|---|---|
| `${it.title}` without `esc` | `<` in data breaks the page / XSS | `${esc(it.title)}` |
| `window.addEventListener` in `mount`, never removed | one extra listener per brand switch | `WL.onScroll` or remove in `unmount` |
| `setInterval` / `IntersectionObserver` not cleaned | runs on detached elements | `unmount(el) { clearInterval(el._timer); el._io?.disconnect(); }` |
| Reading `data.x.y` directly | crash when a brand lacks `x` | `get(data, 'x.y', fallback)` |
| Vietnamese text hard-coded in a template | cannot change per brand | move it to `sections.*` or the block's own key |
| Finding elements by class (`.my-block__btn`) in JS | renaming a class breaks JS | use `data-*` |
| Root element is a `<div>` | `tone`/`space` have no effect | wrap in `<section>` |
