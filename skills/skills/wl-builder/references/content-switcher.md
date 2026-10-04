# Fast content switcher (brand switching)

Goal: pick a brand → colours, fonts, copy and images change **almost instantly**, no reload, no white flash, and the choice is remembered on other pages.

## Current flow

```
<wl-brand-switcher>  open the dialog → fill()
   ├─ preview(file): fetch every data-N.json ONCE, keep the Promise in a Map (cache)
   ├─ preload each brand's heading font (cards show the real typeface)
   └─ preload each hero image (new Image().src) → first screen appears at once

click brand i
   ├─ cached = await preview(file)                  (already loaded → no network wait)
   ├─ document.startViewTransition(() => WL.boot(cached))   smooth cross-fade
   └─ WebDesign2026.load(i)                         saves the choice (localStorage) + refetches JSON
         └─ 'webdesign2026:datachange' → WL.boot(data) → same signature → skipped
```

Measured in headless Chrome: done in < 1 second, mostly the transition animation, and exactly **one** render.

## Five techniques that make it fast

### 1. Change data, not pages
The whole UI is a function of data: `WL.boot(data)` re-renders every tag. Never `location.reload()`.

### 2. Cache the data
```js
const previews = new Map();
function preview(file) {
  if (!previews.has(file)) {
    previews.set(file, fetch(`assets-web-design/${file}`).then((r) => r.json()).catch(() => null));
  }
  return previews.get(file);   // storing the Promise → many calls, one fetch
}
```
`wd2026.js` (organiser's file, not editable) always fetches with `cache: 'no-store'`, so the cache must live on our side.

### 3. Skip duplicate renders
`WL.boot` compares `JSON.stringify(data)` with the previous call and returns when equal. That is what allows rendering from the cache first without a second render when `wd2026.js` delivers the same data.

### 4. Theme is CSS variables
Changing colours = replacing the text of one `<style id="wl-theme">`. The browser only recalculates styles. Derived colours use `color-mix()` and follow automatically, including those redefined by `tone="…"`.

### 5. View Transitions
```js
const swap = () => { WL.boot(cached); scrollTo({ top: 0 }); };
const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;
document.startViewTransition && motionOk ? document.startViewTransition(swap) : swap();
```
The browser snapshots the old state, runs `swap`, then cross-fades to the new one, hiding the half-painted moment. `::view-transition-old/new(root)` in `effects.css` defines the animation.

## Preloading

| Resource | When | How |
|---|---|---|
| Every brand JSON | dialog opens | `preview()` |
| Heading fonts | dialog opens | add `<link rel="stylesheet">` once per URL |
| Hero images | dialog opens | `new Image().src = d.hero.image` |
| Other images | never | `loading="lazy"` handles it |

Do not preload every image of every brand: it wastes the visitor's bandwidth.

## Keeping the brand across pages

`wd2026.js` stores the file name in `localStorage['wd2026_active_file']`; the next page loads the same set. `@view-transition { navigation: auto; }` in `base.css` makes navigation between HTML files smooth too.

## No flash on first load

- `html:not(.wl-ready) body { opacity: 0 }` until the first `boot`.
- Colour mode set in `<head>` by `core.js`.
- Fixed header height `var(--header-h)` → content does not jump when the header renders.
- `preconnect` to Google Fonts in `<head>`.

## Adding a brand

1. Copy a `data-N.json`, change values, keep the structure (`json-data.md`).
2. Images in `assets-web-design/img/<name>/`.
3. One line in `BRANDS` in `js/app.js`: `{ file, label, topic }`.

## If switching gets slow, check

- [ ] Heavy work inside `render` (big sorts, nested loops, DOM measurements)? Move it out or memoise.
- [ ] Listeners on `window` stacking up after each switch? (DevTools → Event listeners)
- [ ] `ScrollTrigger.getAll().forEach((t) => t.kill())` runs before new effects? (already in `effects.js`)
- [ ] Hero image heavier than ~400KB?
- [ ] Slow new font? Make sure the Google Fonts URL has `display=swap`.
