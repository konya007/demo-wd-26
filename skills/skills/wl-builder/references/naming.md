# Đặt tên: class, thuộc tính, thẻ

## Class CSS: BEM rút gọn

```
.block                 thành phần độc lập          .plan  .teaser  .countdown
.block__element        phần bên trong block         .plan__price  .teaser__media
.block--modifier       biến thể của block           .plan--featured  .countdown--sm
.is-state              trạng thái do JS bật/tắt     .is-active  .is-open  .is-in  .is-scrolled
```

Quy tắc:
- Tên block **ngắn, là danh từ**, 1–2 từ: `pcard` (thẻ sản phẩm), `hl` (highlight), `tl` (timeline). Tên ngắn khiến HTML dễ đọc; ghi nghĩa của tên viết tắt trong comment CSS.
- Khối riêng của landing có tiền tố `lp-` (`lp-hero`, `lp-story`) để không đụng `hero` của trang chủ.
- Chỉ **một cấp** element: `.plan__perk`, không `.plan__list__perk`. Phần tử sâu hơn vẫn là `__` của block gốc.
- Modifier không đứng một mình: `class="plan plan--featured"`.
- Trạng thái dùng `is-*`, đặt **trên block**: `.site-header.is-open .site-nav`.
- Độ đặc hiệu tối đa ~(0,2,0). Không dùng `#id` để tạo kiểu, không `!important` (trừ `[hidden]` và giảm chuyển động).
- Thẻ HTML con trong block được phép chọn trực tiếp khi đơn giản: `.tl__body p`, `.facts dt`.

## Class tiện ích có sẵn (dùng lại, đừng tạo trùng)

| Class | Việc |
|---|---|
| `.container` | khung giữa rộng tối đa `--max`, lề `--gutter` |
| `.sec`, `.sec--surface`, `.sec--tight`, `.sec--tight-top` | khoảng dọc khối, nền xen kẽ |
| `.sec-head`, `.sec-head__title`, `.sec-head__text` | tiêu đề khối |
| `.btn`, `.btn--sm`, `.btn--lg`, `.btn--block`, `.btn--ghost`, `.btn--inverse` | nút |
| `.icon-btn` | nút vuông chỉ có icon (44×44) |
| `.link-under` | link gạch chân dày |
| `.tag`, `.tag--solid` | nhãn nhỏ bo tròn |
| `.chip` + `aria-pressed` | nút lọc |
| `.checklist`, `.checklist--sm` | danh sách có dấu tích |
| `.plain-list` | danh sách không chấm, có khoảng cách |
| `.ico` | kích thước icon |
| `.sr-only` | ẩn khỏi mắt, còn cho trình đọc màn hình |
| `.hide-mobile`, `.only-dark`, `.only-light` | hiện/ẩn |

## Thuộc tính `data-*`: móc cho JavaScript

JS **không** tìm phần tử bằng class. Class để tạo kiểu, `data-*` để gắn hành vi:

| Thuộc tính | Ai đọc | Nghĩa |
|---|---|---|
| `data-reveal`, `data-reveal="clip"` | effects.js | hiện dần / mở như rèm khi cuộn tới |
| `data-parallax="0.3"` | effects.js | trôi lệch tốc độ cuộn |
| `data-tilt`, `data-tilt-stage` | effects.js | nghiêng 3D theo con trỏ |
| `data-rail`, `data-rail-track` | effects.js | dãy ngang cuộn theo trục dọc |
| `data-steps` + `data-line` / `data-timeline` + `data-line-y` | effects.js | đường nối dài dần |
| `data-expand` | effects.js | CTA nở toàn màn hình |
| `data-count` | core.js | đếm số khi lọt vào màn hình |
| `data-step`, `data-plan`, `data-person`, `data-cat`… | mount của thành phần | chỉ số / khóa của phần tử |

Đặt tên `data-<danh-từ>` hoặc `data-<động-từ>`; giá trị là dữ liệu (chỉ số, id), không phải câu chữ.

## Thẻ và tham số

- Thẻ: `wl-<tên-khối>` kebab-case: `wl-landing-offer`, `wl-campaign-teaser`.
- Tham số: chữ thường, một từ nếu được: `layout`, `variant`, `limit`, `size`, `copy`, `source`; cờ boolean không giá trị: `more`, `filter`, `featured`.

## JavaScript

- Biến/hàm `camelCase`, hằng số `UPPER_SNAKE` (`THEME_KEY`, `UNITS`).
- Hàm tạo HTML trả chuỗi, đặt tên theo thứ nó tạo: `productCard()`, `sectionHead()`, `ctaButton()`.
- Thuộc tính gắn lên phần tử để nhớ trạng thái có `_`: `el._timer`, `card._tilt`.
- Sự kiện tuỳ biến: `wl:<việc>` (`wl:rendered`, `wl:prefill`).
- Khóa lưu trữ: `wl-<việc>` (`wl-color-mode`, `wl-prefill`).

## File

- Một file thành phần cho một **nhóm** liên quan: `layout.js` (header/footer/…), `landing.js` (mọi khối landing).
- Đầu file có comment liệt kê các thẻ trong file và tham số của chúng.
