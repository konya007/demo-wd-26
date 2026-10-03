# Thành phần khung: header, footer, sidebar, card, hộp thoại

## Header (`<wl-header>`, layout.js)

Cấu trúc:
```
.site-header (fixed, cao var(--header-h), nền mờ)
  .container.site-header__bar
    .brand                  logo / chữ cái đầu + tên ngắn → index.html
    nav.site-nav#site-nav   menu từ data.nav; trên di động thành panel toàn màn hình
    .site-header__tools     nút sáng/tối, CTA (ẩn < 640px), nút menu (ẩn ≥ 960px)
```
Điểm quan trọng:
- Mục đang xem: `aria-current="page"` (CSS tạo kiểu theo thuộc tính này).
- Nút menu: `aria-controls="site-nav"`, `aria-expanded` cập nhật khi mở; mở menu thì khoá cuộn `body.no-scroll`.
- Đổ bóng/viền khi cuộn: `WL.onScroll(el, () => header.classList.toggle('is-scrolled', scrollY > 8))`.
- `wl-header { height: var(--header-h) }` giữ chỗ để nội dung không nhảy.

Thêm mục menu: sửa `nav` trong JSON, không sửa JS.

## Footer (`<wl-footer>`)

Lưới 4 cột ≥ 768px: thương hiệu + câu khẩu hiệu + CTA | menu | liên hệ | mạng xã hội. Mọi thứ từ `organization`, `nav`, `contact`. Liên kết ngoài: `target="_blank" rel="noopener"`.

## Sidebar (mẫu chuẩn, dùng khi cần)

Dự án chưa có sidebar. Khi cần (bộ lọc sản phẩm, mục lục trang dài, menu tài khoản), làm theo mẫu: **dính bên trái trên máy tính, ngăn kéo trượt ra trên di động**.

```js
/**
 * <wl-sidebar source="catalogNav" title-copy="sidebar">
 * Danh sách liên kết lấy từ data[source] = [{ label, href, icon }].
 * ≥ 960px: cột dính bên trái. < 960px: nút mở ngăn kéo (dialog).
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
    const desktop = matchMedia('(min-width: 960px)');
    const sync = () => { if (desktop.matches) { dlg.close(); dlg.setAttribute('open', ''); } else dlg.removeAttribute('open'); };
    el._mq = sync;
    desktop.addEventListener('change', sync);
    sync();
    el.querySelector('[data-side-open]').addEventListener('click', () => dlg.showModal());
    el.querySelector('[data-side-close]').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // bấm nền để đóng
  },
  unmount(el) { matchMedia('(min-width: 960px)').removeEventListener('change', el._mq); },
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
Bố cục trang có sidebar: `.container` chứa lưới `grid-template-columns: 260px 1fr` ở ≥ 960px, `<wl-sidebar>` ở cột trái. Dùng `<dialog>` vì nó có sẵn bẫy tiêu điểm, phím Esc và lớp nền.

## Card

Mẫu tham khảo: `productCard(p)` trong sections.js (`.pcard`). Cấu trúc chuẩn:

```
article.card                 (data-tilt nếu muốn nghiêng 3D)
  a.card__link               CẢ thẻ là một liên kết, chỉ một <a>
    .card__media > img       tỉ lệ cố định bằng aspect-ratio, object-fit: cover
    .card__body
      p.card__cat            nhãn nhóm
      h3.card__title
      p.card__text
      p.card__price          margin-top:auto → luôn dính đáy, các thẻ thẳng hàng
```
Thẻ trong lưới: `.pgrid` dùng `grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr))`, không cần media query.

## Hộp thoại

Dùng `<dialog>` gốc + `showModal()` như `<wl-brand-switcher>`: có `aria-labelledby` trỏ tới tiêu đề, nút đóng có `aria-label`, bấm nền để đóng, `::backdrop` làm mờ nền.
