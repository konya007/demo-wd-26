# Frame components: header, footer, sidebar, card, tabs, dialog

## Header (`<wl-header>`, layout.js)

```
.site-header (fixed, height var(--header-h), blurred background)
  .container.site-header__bar
    .brand                  logo / initial + short name → index.html
    nav.site-nav#site-nav   menu from data.nav; full-screen panel on mobile
    .site-header__tools     light/dark toggle, CTA (hidden < 640px), menu button (hidden ≥ 960px)
```
Key points:
- Current item: `aria-current="page"` (CSS styles the attribute).
- Menu button: `aria-controls="site-nav"`, `aria-expanded` updated; opening the menu locks scroll with `body.no-scroll`.
- Border on scroll: `WL.onScroll(el, () => header.classList.toggle('is-scrolled', scrollY > 8))`.
- `wl-header { height: var(--header-h) }` reserves space so content does not jump.

Adding a menu item: edit `nav` in the JSON, not the JS.

## Footer (`<wl-footer>`)

4-column grid ≥ 768px: brand + tagline + CTA | menu | contact | socials. Everything from `organization`, `nav`, `contact`. External links: `target="_blank" rel="noopener"`.

## Sidebar (reference pattern)

The project has no sidebar yet. When one is needed (product filters, table of contents, account menu), use this pattern: **sticky column on desktop, slide-in drawer on mobile**.

```js
/**
 * <wl-sidebar source="nav" title-copy="sidebar">
 * Links from data[source] = [{ label, href, icon }].
 * ≥ 960px: sticky left column. < 960px: button opens a drawer (<dialog>).
 */
define('wl-sidebar', {
  render(data, el) {
    const list = get(data, el.attr('source', 'nav'), []);
    if (!list.length) return '';
    const title = get(data, `sections.${el.attr('title-copy', 'sidebar')}.title`, '');
    const links = list.map((n) => `
      <li><a class="side__link" href="${esc(n.href)}"${location.pathname.endsWith(n.href) ? ' aria-current="page"' : ''}>
        ${n.icon ? icon(n.icon) : ''}<span>${esc(n.label)}</span></a></li>`).join('');
    return `
      <button class="btn btn--ghost side__open" type="button" data-side-open aria-haspopup="dialog">${icon('panel-left')}${esc(title)}</button>
      <dialog class="side" data-side aria-label="${esc(title)}">
        <div class="side__head">
          <strong>${esc(title)}</strong>
          <button class="icon-btn side__close" type="button" data-side-close aria-label="Đóng">${icon('x')}</button>
        </div>
        <ul class="side__list">${links}</ul>
      </dialog>`;
  },
  mount(el) {
    const dlg = el.querySelector('[data-side]');
    el._mq = matchMedia('(min-width: 960px)');
    el._sync = () => { if (el._mq.matches) { dlg.close(); dlg.setAttribute('open', ''); } else dlg.removeAttribute('open'); };
    el._mq.addEventListener('change', el._sync);
    el._sync();
    el.querySelector('[data-side-open]').addEventListener('click', () => dlg.showModal());
    el.querySelector('[data-side-close]').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // click backdrop to close
  },
  unmount(el) { el._mq.removeEventListener('change', el._sync); },
});
```

```css
/* ---------- Sidebar ---------- */
.side__list { display: grid; gap: 2px; }
.side__link { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 8px 12px; border-radius: var(--r-sm); color: var(--c-muted); }
.side__link:hover { color: var(--c-text); background: var(--c-surface-2); }
.side__link[aria-current="page"] { color: var(--c-primary); background: var(--c-primary-soft); font-weight: 600; }
.side__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
@media (max-width: 959px) {
  .side { margin: 0; height: 100dvh; max-height: none; width: min(320px, 86vw); padding: 20px; border: 0; background: var(--c-surface); color: var(--c-text); }
  .side::backdrop { background: rgba(10, 10, 20, .5); }
  .side[open] { animation: side-in .3s var(--ease-out); }
}
@media (min-width: 960px) {
  .side__open, .side__close { display: none; }
  .side { position: sticky; top: calc(var(--header-h) + 24px); display: block; margin: 0; padding: 0; border: 0; background: none; color: inherit; }
}
/* effects.css */
@keyframes side-in { from { transform: translateX(-100%); } }
```
Page with a sidebar: a `.container` holding a grid `grid-template-columns: 260px 1fr` at ≥ 960px, `<wl-sidebar>` in the left column. `<dialog>` gives focus trapping, Esc and a backdrop for free.

## Card

Reference: `productCard(p)` in sections.js (`.pcard`). Standard structure:

```
article.card                 (data-tilt for 3D tilt)
  a.card__link               the WHOLE card is one link, only one <a>
    .card__media > img       fixed ratio via aspect-ratio, object-fit: cover
    .card__body
      p.card__cat            group label
      h3.card__title
      p.card__text
      p.card__price          margin-top:auto → always at the bottom, cards align
```
Card grid: `repeat(auto-fill, minmax(min(100%, 300px), 1fr))`, no media query needed. Other cards in the project: `.review`, `.plan`, `.tcard`, `.hl`, `.rich--cards .rich__item`.

## Tabs (`<wl-pdp-tabs>`)

WAI-ARIA tabs pattern, copy it for any tab UI:
- `role="tablist"` container; each tab `role="tab"`, `aria-selected`, `aria-controls="panel-x"`, `tabindex` 0 for the selected one and -1 for others.
- Each panel `role="tabpanel"`, `aria-labelledby="tab-x"`, `tabindex="0"`, `hidden` when inactive.
- Keys: ← → move between tabs, Home/End jump to first/last; selecting also moves focus.
- Style from ARIA: `.tabs__tab[aria-selected="true"]`.
- Tabs whose content is empty are not rendered.

## Dialog

Native `<dialog>` + `showModal()` as in `<wl-brand-switcher>`: `aria-labelledby` pointing at its heading, a close button with `aria-label`, click on the backdrop closes, `::backdrop` dims the page.
