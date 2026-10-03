# Thành phần nhỏ (nguyên tử)

Nguyên tử là **class CSS + mẩu HTML**, thường không cần `WL.define`. Chỉ tạo thẻ `<wl-*>` khi nó có logic riêng (đếm ngược, đổi trạng thái theo thời gian).

Mọi nguyên tử bấm được: vùng chạm ≥ 44×44px, có `:hover`, `:focus-visible` (đã có chung trong `base.css`), trạng thái đọc được bằng trình đọc màn hình.

## Button

```html
<a class="btn btn--lg" href="contact.html">Đặt trước</a>
<button class="btn btn--ghost" type="button">Chọn lại</button>
```

| Biến thể | Dùng khi |
|---|---|
| `.btn` | hành động chính, **một** nút chính mỗi vùng nhìn |
| `.btn--ghost` | hành động phụ cạnh nút chính |
| `.btn--inverse` | trên nền `--c-primary` (CTA band) |
| `.btn--sm` / `.btn--lg` / `.btn--block` | kích thước / rộng hết khung |
| `.link-under` | hành động thứ ba, điều hướng nhẹ |

Đi trang khác → `<a>`; làm việc tại chỗ → `<button type="button">`. Chữ nút là động từ + kết quả ("Giữ chỗ cho nhóm"), lấy từ JSON (`cta.text`, `plans[].button`). Nút CTA chung: `ctaButton(data, 'btn--lg')`.

Thêm biến thể mới vào `base.css` cạnh các biến thể có sẵn:
```css
.btn--soft { background: var(--c-primary-soft); color: var(--c-primary); border-color: transparent; }
.btn--soft:hover { background: color-mix(in srgb, var(--c-primary) 20%, var(--c-bg)); }
```

## Icon button

```html
<button class="icon-btn" type="button" aria-label="Đóng">${icon('x')}</button>
```
Bắt buộc `aria-label` vì không có chữ. Icon trong nút có `aria-hidden` (hàm `icon()` đã thêm).

## Icon

`icon('arrow-right', 'ten-class')` → Lucide 0.460. Tên tra ở lucide.dev. Kích thước mặc định `.ico` 20px; đổi bằng CSS của block (`.hl__icon .ico { width: 24px }`). Icon đứng trong ô màu: `.feat-icon` / `.hl__icon` (48px, nền `--c-primary-soft`).

## Tag / badge

```html
<span class="tag">Tour mới</span>
<span class="tag tag--solid">Ra mắt</span>
```
Chữ ngắn (1–3 từ), không bấm được. Thứ bấm được để lọc là `.chip`.

## Chip (nút lọc, chọn một)

```html
<div class="chips" role="group">
  <button type="button" class="chip" aria-pressed="true" data-cat="">Tất cả</button>
  <button type="button" class="chip" aria-pressed="false" data-cat="Pro">Pro</button>
</div>
```
Trạng thái nằm trong `aria-pressed`, CSS đọc `[aria-pressed="true"]`: một nguồn sự thật cho cả mắt và trình đọc màn hình.

## Avatar

Dự án không lưu ảnh người, nên avatar là chữ cái đầu (giống `.person__mono`, `.brand__mono`). Mẫu tổng quát:

```js
export function avatar(name, size = 'md', image) {
  const letter = esc((String(name || '?').trim().split(/\s+/).pop() || '?')[0]);  // tên Việt: lấy chữ cái của tên, không phải họ
  return image
    ? `<img class="avatar avatar--${size}" src="${esc(image)}" alt="" loading="lazy">`
    : `<span class="avatar avatar--${size}" aria-hidden="true">${letter}</span>`;
}
```
```css
/* ---------- Avatar ---------- */
.avatar { display: inline-grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 50%;
  object-fit: cover; background: var(--c-primary-soft); color: var(--c-primary);
  font-family: var(--f-heading); font-weight: 700; }
.avatar--sm { width: 32px; height: 32px; font-size: .875rem; }
.avatar--lg { width: 64px; height: 64px; font-size: 1.5rem; }
```
Tên người đặt **cạnh** avatar bằng chữ thật, nên avatar để `alt=""` / `aria-hidden`. Nhóm avatar chồng nhau: `.avatar + .avatar { margin-left: -10px; box-shadow: 0 0 0 2px var(--c-bg); }`.

## Ô nhập (field)

```html
<div class="field">
  <label for="f-phone">Số điện thoại</label>
  <input id="f-phone" name="phone" type="tel" autocomplete="tel" required pattern="[0-9+ ]{9,15}">
  <p class="field__err">Số điện thoại gồm 9 đến 15 chữ số.</p>
</div>
```
`label` luôn hiện (không thay bằng placeholder). Lỗi: thêm `.is-invalid` vào `.field` và `aria-invalid="true"` vào input; câu lỗi nói cách sửa.

## Đếm ngược: nguyên tử có logic → `WL.define`

`js/components/landing.js` → `<wl-countdown source="landing" size="sm|lg">`. Đọc mẫu này khi làm bất kỳ nguyên tử nào có bộ hẹn giờ:

```js
define('wl-countdown', {
  render(data, el) {
    const src = get(data, el.attr('source', 'landing'), {});
    if (!src.deadline) return '';
    // … <ol class="countdown__units" role="timer"> mỗi ô <b data-unit="i">
  },
  mount(el, data) {
    el._timer = setInterval(() => { /* cập nhật textContent của [data-unit] */ }, 1000);
  },
  unmount(el) { clearInterval(el._timer); },   // bắt buộc
});
```
Điểm cần học: tham số `source` cho phép dùng lại với dữ liệu khác; chỉ cập nhật `textContent` mỗi giây (không render lại cả khối); hết giờ thì hiện câu `countdown.ended` thay vì "00:00:00:00".
