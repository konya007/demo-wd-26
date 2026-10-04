# Building the `core.js` renderer

`core.js` is a ~250-line, framework-free core. This file explains each piece so a team can rebuild, extend or debug it.

## Requirements for a White Label renderer

1. Load **before** the page paints to set light/dark mode (no colour flash).
2. Take one data object, turn the theme into CSS variables, set SEO tags.
3. Re-render **every** component when data changes, without reloading.
4. Each component declares how it renders; HTML only places tags.
5. An error in one component never kills the page.

## Piece 1: colour mode, immediately

```js
const saved = (() => { try { return localStorage.getItem('wl-color-mode'); } catch (e) { return null; } })();
const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
```

The script sits in `<head>` **without** `defer`. `try/catch` because `localStorage` may be blocked (private mode).

## Piece 2: utilities

```js
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const get = (obj, path, fb) => {
  const v = String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  return v == null ? fb : v;
};
```

## Piece 3: theme → CSS variables

Map JSON keys to variable names and write them into **one** `<style id="wl-theme">` (it overrides the defaults in `base.css`):

```js
const TOKEN_MAP = { primary: '--c-primary', onPrimary: '--c-on-primary', accent: '--c-accent',
  background: '--c-bg', surface: '--c-surface', text: '--c-text', muted: '--c-muted', border: '--c-border' };

function applyTheme(t = {}) {
  const vars = (c) => Object.entries(c || {}).filter(([k]) => TOKEN_MAP[k]).map(([k, v]) => `${TOKEN_MAP[k]}:${v};`).join('');
  const css = `:root{${vars(t.colors)}` +
    (t.font?.heading ? `--f-heading:${t.font.heading};` : '') +
    (t.font?.body ? `--f-body:${t.font.body};` : '') +
    Object.entries(t.radius || {}).map(([k, v]) => `--r-${k}:${v};`).join('') +
    `}:root[data-theme="dark"]{${vars(t.darkColors)}}`;
  let s = document.getElementById('wl-theme');
  if (!s) { s = document.createElement('style'); s.id = 'wl-theme'; document.head.appendChild(s); }
  s.textContent = css;
  // fonts: one <link id="wl-fonts">, href changed only when different
}
```

Why one `<style>` instead of `style.setProperty` per variable: a single write, it can hold the `[data-theme="dark"]` block, and switching brand only replaces `textContent`.

Derived colours (`--c-primary-soft`, `--c-surface-2`, `--c-brand`…) are written with `color-mix()` / `var()` in `base.css`, so they follow the theme with no JS.

## Piece 4: registering components (Custom Elements)

```js
const registry = new Set();

function define(tag, spec) {
  customElements.define(tag, class extends HTMLElement {
    connectedCallback() { this.classList.add('wl-host'); registry.add(this); if (WL.data) this.update(WL.data); }
    disconnectedCallback() { registry.delete(this); this.teardown(); }
    teardown() { if (this._mounted && spec.unmount) spec.unmount(this); this._mounted = false; }
    attr(n, fb) { const v = this.getAttribute(n); return v == null || v === '' ? fb : v; }
    num(n, fb) { const x = parseInt(this.getAttribute(n), 10); return Number.isFinite(x) ? x : fb; }
    update(data) {
      try {
        this.teardown();
        this.innerHTML = spec.render(data, this);
        if (spec.mount) spec.mount(this, data);
        this._mounted = true;
      } catch (err) {
        console.error(`[WL] render error in <${tag}>:`, err);
        this.innerHTML = '';            // one broken block, the page lives on
      }
    }
  });
}
```

Design decisions:
- **Light DOM, no Shadow DOM**: global CSS and theme variables apply directly; effects.js finds `[data-reveal]` everywhere.
- **Template strings + `innerHTML`**: simple and fast for a few dozen blocks; the price is escaping everything.
- **Tags render themselves when attached**: late or nested tags still get content.
- **`wl-host` class**: one hook for `display:block` and the shared layout attributes (`layout-params.md`).

## Piece 5: boot

```js
function boot(data) {
  if (!data) return;
  const sig = JSON.stringify(data);
  if (sig === WL._sig) return;          // same data → nothing to do
  WL._sig = sig;
  WL.data = data;
  applyTheme(data.theme);
  applySeo(data);                        // title from pages[body.dataset.page], meta, favicon
  [...registry].forEach((el) => { if (el.isConnected) el.update(data); });
  refreshIcons();                        // lucide.createIcons()
  document.documentElement.classList.add('wl-ready');
  document.dispatchEvent(new CustomEvent('wl:rendered', { detail: data }));
}
```

`[...registry]` (a copy) + `isConnected`: see `architecture.md`, nested components.

## Piece 6: connecting a data source

The renderer **does not know** where data comes from. `app.js` connects it:

```js
document.addEventListener('webdesign2026:datachange', (e) => WL.boot(e.detail));
document.addEventListener('wl:rendered', () => runEffects(document));
WebDesign2026.init({ folder: 'assets-web-design', files: BRANDS.map((b) => b.file), defaultIndex: 0 });
setTimeout(WL.failSafe, 4000);
```

To use a real API instead: `fetch(url).then((r) => r.json()).then(WL.boot)`.

## Extending the core correctly

| You want | Where |
|---|---|
| A new theme token (e.g. `success`) | `TOKEN_MAP` + default in `base.css` + key in every JSON |
| A new lifecycle hook | inside `define` → document it in the comment above `define` and in `component-api.md` |
| A new shared layout attribute | CSS only, in `base.css` (`layout-params.md`) |
| A helper used by many components | add to the `WL` object at the end of the file, or to `ui.js` if it returns HTML |
| Something one component needs | **not** in core; keep it in the component file |

Keep the core small: every line runs on every page.
