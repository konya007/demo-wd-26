# Kiến trúc và vòng đời render

## Ba lớp tách biệt

| Lớp | Ở đâu | Chứa gì | Ai sửa khi đổi thương hiệu |
|---|---|---|---|
| Dữ liệu | `data-N.json` | chữ, ảnh, giá, màu, font, menu | **chỉ lớp này** |
| Bố cục | `*.html` | thứ tự thẻ `<wl-*>` + tham số (`layout="grid"`, `limit="4"`) | không |
| Trình bày | `js/components/*.js` + `css/*.css` | cách biến dữ liệu thành HTML, cách nó trông | không |

Một trang chỉ là danh sách thẻ:

```html
<body data-page="landing">
  <wl-header></wl-header>
  <main id="main">
    <wl-landing-hero></wl-landing-hero>
    <wl-faq source="landing.faq" copy="landingFaq"></wl-faq>
  </main>
  <wl-footer></wl-footer>
</body>
```

`data-page` trên `<body>` là khóa để `core.js` đọc `pages.<page>.title` làm tiêu đề tab.

## Thứ tự chạy khi mở trang

```
<head>  core.js (không defer)  → đặt data-theme sáng/tối ngay, tránh nháy màu
        lucide, gsap, wd2026.js (defer)
        app.js (module)        → import các file component → customElements.define
                                → WebDesign2026.init({...})
wd2026.js  fetch data-N.json   → phát 'webdesign2026:datachange' (detail = data)
app.js     nghe sự kiện        → WL.boot(data)
WL.boot    applyTheme → applySeo → render mọi thẻ đã đăng ký → lucide icons → countUp
           → html.wl-ready (hiện trang) → phát 'wl:rendered'
app.js     nghe 'wl:rendered'  → runEffects(document) (reveal, tilt, GSAP)
```

Không đọc được JSON sau 4 giây (mở bằng nhấp đúp) → `WL.failSafe()` hiện hướng dẫn chạy server.

## Vòng đời một thẻ `<wl-*>`

```
connectedCallback  → thêm vào registry; nếu WL.data đã có thì update ngay
update(data)       → teardown() → innerHTML = render(data, el) → mount(el, data)
teardown()         → gọi unmount(el) nếu lần trước đã mount
disconnectedCallback → bỏ khỏi registry, teardown()
```

- `render` chạy **mỗi lần đổi thương hiệu**, nên phải là hàm thuần, không gắn sự kiện.
- `mount` chạy sau mỗi `render`. Phần tử con là mới tinh nên sự kiện gắn trên chúng tự mất khi render lại; chỉ cần dọn những gì gắn **ngoài** thẻ (window, document, setInterval).
- `WL.boot` duyệt **bản sao** của registry và bỏ thẻ đã rời trang. Nhờ vậy thẻ lồng (ví dụ `<wl-countdown>` trong `<wl-landing-hero>`) render đúng 1 lần: thẻ con mới tự render khi được gắn, thẻ con cũ đã bị thay thì bị bỏ qua.
- `WL.boot` bỏ qua khi dữ liệu y hệt lần trước (so `JSON.stringify`). Trình đổi thương hiệu tận dụng điều này để render trước từ bộ nhớ đệm (xem `content-switcher.md`).

## Giao tiếp giữa các thành phần

| Cách | Khi nào | Ví dụ |
|---|---|---|
| Hàm export dùng chung | Mẩu HTML lặp lại | `sectionHead`, `productCard` (sections.js), `ctaButton`, `brandMark` (layout.js), `splitWords` (hero.js) |
| Tham số URL | Chuyển trang mang theo ngữ cảnh | `product.html?id=…`, `contact.html?item=…` (`WL.params`) |
| `sessionStorage` + CustomEvent | Gửi dữ liệu sang thành phần ở trang khác/cùng trang | `sendPrefill({itemId, message})` → `<wl-contact>` |
| Sự kiện `document` | Báo trạng thái chung | `wl:rendered`, `wl:prefill` |

Không để thành phần A truy cập thẳng DOM bên trong thành phần B.
