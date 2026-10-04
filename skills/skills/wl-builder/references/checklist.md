# Pre-submit checklist

## Data
- [ ] New keys exist in **every** `data-N.json`, same structure (run the shape check in `json-data.md`).
- [ ] No HTML in JSON; dates ISO (deadlines with timezone); every image path points to a real file.
- [ ] Products referenced by an `id` that exists in `items`.
- [ ] Lucide icon names exist in v0.460 (no leftover `<i data-lucide>` on the page).
- [ ] Remove the new key from one file → the page still works and the block hides itself.

## Component
- [ ] Every JSON value through `esc()`; URL parameters through `encodeURIComponent`.
- [ ] `render` binds no events; `mount` binds; `unmount` cleans timers / observers / outside listeners.
- [ ] No hard-coded copy except generic accessibility labels.
- [ ] Comment above `define` lists tag, attributes, layouts and data read.
- [ ] Outer element is a `<section>` (so `tone`/`space` work) unless it is chrome (header, bars).
- [ ] New file imported in `app.js`; tag added to `component-catalog.md`.

## CSS
- [ ] Only tokens for colour, font, radius, type size.
- [ ] Short BEM class names; JS uses `data-*`.
- [ ] Every `layout` preset has its rules scoped with the modifier.
- [ ] Mobile first; no horizontal page scroll at 360px.
- [ ] New CSS block has a title comment and sits in the right file.

## Visual check
- [ ] At least 2 very different brands (e.g. YPhone rounded + Nhịp Phố square).
- [ ] Light and dark.
- [ ] 390px and 1440px.
- [ ] Each `layout` preset and at least `tone="surface"` / `tone="primary"` / `align="center"`.
- [ ] Switch brand while on the page → re-renders correctly, no doubled events, no console errors.
- [ ] Reduced motion on → all content still visible.
- [ ] Keyboard: Tab reaches every control, visible focus, Esc closes dialogs, arrows move tabs.

## Run locally
```bash
python -m http.server 8000      # or Live Server in VS Code
# open http://localhost:8000/landing-page.html
```
Opening the file by double-click cannot read the JSON.
