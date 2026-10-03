# API thành phần: `WL.define`

## Khung chuẩn

```js
/**
 * <wl-ten-khoi layout="a|b" limit="4">  ← ghi tham số và ý nghĩa ngay trên define
 *   a: …
 *   b: …
 */
import { sectionHead } from './sections.js';        // tái dùng tiêu đề khối

const { esc, get, icon, define } = window.WL;

define('wl-ten-khoi', {
  render(data, el) {
    const list = get(data, 'tenKhoi', []);          // luôn có giá trị dự phòng
    if (!list.length) return '';                      // thiếu dữ liệu → không vẽ gì
    const layout = el.attr('layout', 'a');            // tham số chuỗi
    const items = list.slice(0, el.num('limit', 99)); // tham số số

    return `
      <section class="sec">
        <div class="container">
          ${sectionHead(data, el, 'tenKhoi')}
          <ul class="ten-khoi ten-khoi--${esc(layout)}">
            ${items.map((it, i) => `
              <li class="ten-khoi__item" data-reveal style="--d:${i * 0.08}s">
                ${icon(it.icon)}
                <h3>${esc(it.title)}</h3>
              </li>`).join('')}
          </ul>
        </div>
      </section>`;
  },
  mount(el, data) {        // tuỳ chọn: gắn sự kiện
    el.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => { /* … */ }));
  },
  unmount(el) {            // tuỳ chọn: dọn thứ gắn ngoài thẻ
    clearInterval(el._timer);
  },
});
```

Sau đó:
1. `import './components/ten-file.js';` trong `js/app.js` (nếu là file mới).
2. Thêm `wl-ten-khoi` vào danh sách `display: block` trong `css/base.css`.

## Công cụ có sẵn trên `window.WL`

| Hàm | Dùng để |
|---|---|
| `esc(v)` | Thoát ký tự HTML. **Bắt buộc** cho mọi giá trị từ JSON. |
| `get(obj, 'a.b.0.c', fallback)` | Đọc đường dẫn sâu an toàn. |
| `icon(name, cls)` | Thẻ icon Lucide `<i data-lucide>`; `WL.boot` tự vẽ SVG. Icon thêm sau khi boot (ví dụ trong mount) → gọi `WL.refreshIcons()`. |
| `el.attr(name, fallback)` / `el.num(name, fallback)` | Đọc tham số thẻ. Cờ boolean dùng `el.hasAttribute('more')`. |
| `WL.onScroll(el, fn)` | Gắn hàm cuộn trang, render lại không cộng dồn. |
| `WL.params` | `URLSearchParams` của trang. |
| `WL.data` | Dữ liệu đang hiển thị. |
| `WL.setMode('dark'|'light')` | Đổi chế độ sáng/tối. |

## Quy ước tham số thẻ

- Tham số là **bố cục**, không phải nội dung: `layout`, `variant`, `limit`, `size`, cờ `more`, `filter`, `featured`.
- `copy="khoaKhac"`: lấy tiêu đề khối từ `sections.khoaKhac` thay cho mặc định → một thành phần, nhiều bộ chữ.
- `source="landing.faq"`: lấy mảng dữ liệu từ đường dẫn khác → `<wl-faq>` dùng cho cả FAQ chung lẫn FAQ chiến dịch.
- Giá trị mặc định phải là trường hợp dùng nhiều nhất.

## Thành phần lồng nhau

Được phép đặt thẻ `<wl-*>` trong chuỗi `render` của thẻ khác:

```js
return `<div class="lp-hero__timer"><wl-countdown size="lg"></wl-countdown></div>`;
```

Thẻ con tự render khi được gắn vào DOM và có vòng đời riêng (`unmount` của nó dọn bộ hẹn giờ khi cha render lại). Dùng cách này cho nguyên tử có logic riêng (đếm ngược, trình phát video, carousel). Mẩu HTML tĩnh thì dùng hàm export (`productCard(p)`), nhẹ hơn.

## Lỗi hay gặp

| Lỗi | Hậu quả | Sửa |
|---|---|---|
| `${it.title}` không `esc` | Dữ liệu có `<` làm vỡ trang / XSS | `${esc(it.title)}` |
| `window.addEventListener` trong `mount` không dọn | Mỗi lần đổi thương hiệu cộng thêm 1 listener | `WL.onScroll` hoặc gỡ trong `unmount` |
| `setInterval` không dọn | Bộ hẹn giờ chạy trên phần tử đã mất | `unmount(el) { clearInterval(el._timer) }` |
| Đọc `data.x.y` trực tiếp | Lỗi khi thương hiệu thiếu `x` | `get(data, 'x.y', fallback)` |
| Viết chữ tiếng Việt cứng trong template | Không đổi được theo thương hiệu | Đưa vào `sections.*` / khóa của khối |
| Tìm phần tử bằng class (`.ten-khoi__btn`) trong JS | Đổi tên class làm hỏng JS | Dùng `data-*` |
