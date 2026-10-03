---
name: wl-builder
description: Cách xây thành phần, khối, trang và landing page cho website White Label (HTML/CSS/JS thuần, web component <wl-*>, dữ liệu JSON đổi thương hiệu). Dùng khi cần tạo hoặc sửa button, avatar, tag, header, sidebar, footer, card, section, hero, landing page chiến dịch; khi thêm khóa mới vào data-N.json; khi đặt tên class, tổ chức biến CSS; khi sửa core.js (trình render) hoặc trình đổi thương hiệu / đổi nội dung nhanh.
---

# WL Builder: xây giao diện cho website White Label

Dự án chạy **nhiều thương hiệu trên một mã nguồn**. Đọc file này trước, sau đó chỉ mở file tham khảo hợp với việc đang làm.

## Bản đồ dự án

```
*.html                    trang = danh sách thẻ <wl-*>, KHÔNG chứa nội dung
assets-web-design/data-N.json   toàn bộ nội dung + theme của thương hiệu N
css/base.css              token (biến), reset, chữ, nút, tiện ích
css/components.css        kiểu từng thành phần (chia khối theo comment)
css/effects.css           chuyển động
js/core.js                trình render: WL.define, WL.boot, theme, SEO
js/app.js                 nạp thành phần, danh sách BRANDS, khởi động wd2026.js
js/effects.js             hiệu ứng theo data-* (reveal, tilt, parallax, GSAP)
js/components/*.js        mỗi file một nhóm thành phần
wd2026.js                 thư viện BTC, KHÔNG sửa
```

## 7 luật vàng

1. **Nội dung ở JSON, bố cục ở HTML, cách vẽ ở JS, giao diện ở CSS.** Không viết chữ cứng vào HTML/JS (trừ nhãn hỗ trợ tiếp cận chung như "Đóng", "Mở menu").
2. **Mọi giá trị từ JSON đi qua `esc()`** trước khi ghép vào HTML. URL trong query dùng `encodeURIComponent`.
3. **Màu, font, bo góc, cỡ chữ chỉ dùng biến CSS** (`var(--c-primary)`, `var(--r-md)`, `var(--t-xl)`…). Không mã màu cứng, trừ chữ trắng trên ảnh tối.
4. **Thiếu dữ liệu thì `render` trả `''`**, trang không được vỡ khi một thương hiệu thiếu khóa.
5. **Render lại phải an toàn:** `render` là hàm thuần (data → chuỗi HTML). Sự kiện gắn trong `mount`. Bộ hẹn giờ và sự kiện trên `window`/`document` phải dọn trong `unmount` (hoặc dùng `WL.onScroll`).
6. **Class theo BEM ngắn**: `block`, `block__element`, `block--modifier`, trạng thái `is-*`, móc JS bằng `data-*`. Không dùng class để JS tìm phần tử.
7. **Hiệu ứng tắt được**: tôn trọng `prefers-reduced-motion`; không có GSAP thì trang vẫn đủ nội dung.

## Quy trình khi được yêu cầu "làm thành phần X"

1. Xác định cấp: **nguyên tử** (button, avatar, tag, countdown) → **cụm** (card, header, sidebar) → **khối** (section) → **trang**.
2. Tìm thành phần có sẵn để tái dùng: `grep "define('wl-" js/components`. Có class tiện ích sẵn: `.btn`, `.icon-btn`, `.link-under`, `.tag`, `.chip`, `.checklist`, `.sec-head`, `.container`, `.sec`.
3. Thiết kế dữ liệu trước (xem `references/json-data.md`): khóa ở đâu, tên gì, có bắt buộc không. Thêm vào **cả 6** file JSON.
4. Viết thành phần bằng `WL.define` (xem `references/component-api.md`).
5. Viết CSS dưới một comment khối mới trong `components.css` (xem `references/css-tokens.md`, `references/naming.md`).
6. Khai báo thẻ là `display: block` trong `base.css` nếu là khối.
7. Đặt thẻ vào trang HTML. Kiểm tra với ít nhất 2 thương hiệu khác nhau, sáng + tối, rộng 390px và 1440px.
8. Chạy danh sách kiểm tra `references/checklist.md`.

## Mở file tham khảo nào?

| Việc cần làm | File |
|---|---|
| Hiểu luồng chạy, vòng đời render → mount → unmount | `references/architecture.md` |
| Viết thành phần mới, API `WL.define`, thẻ lồng nhau | `references/component-api.md` |
| Xây hoặc sửa trình render `core.js` từ đầu | `references/core-renderer.md` |
| Thêm/tổ chức khóa JSON, đặt tên dữ liệu | `references/json-data.md` |
| Đổi thương hiệu / đổi nội dung nhanh, bộ nhớ đệm, View Transition | `references/content-switcher.md` |
| Biến CSS, theme sáng/tối, tổ chức file CSS | `references/css-tokens.md` |
| Đặt tên class, `data-*`, thẻ, thuộc tính | `references/naming.md` |
| Button, icon button, avatar, tag, chip, ô nhập, đếm ngược | `references/atoms.md` |
| Header, footer, sidebar, card, hộp thoại | `references/layout-components.md` |
| Section lớn: hero, lưới thẻ, timeline, bảng giá, FAQ, CTA | `references/sections.md` |
| Tạo landing page chiến dịch / sản phẩm mới / tour mới | `references/landing-page.md` |
| Hiệu ứng cuộn, 3D, tiếp cận, hiệu năng | `references/effects-a11y.md` |
| Kiểm tra trước khi nộp | `references/checklist.md` |
