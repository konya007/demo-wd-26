# Hiệu ứng, tiếp cận, hiệu năng

## Hiệu ứng: khai báo bằng `data-*`, thực thi ở `effects.js`

Thành phần **không** tự viết code chuyển động; nó chỉ gắn thuộc tính. `runEffects(document)` chạy sau mỗi `wl:rendered`.

| Muốn | Gắn |
|---|---|
| Hiện dần khi cuộn tới | `data-reveal` (+ `style="--d:.1s"` để so le) |
| Ảnh mở như rèm | `data-reveal="clip"` trên khung ảnh có `overflow:hidden` |
| Ảnh trôi lệch tốc độ | `data-parallax="-0.08"` trên `<img>` cao hơn khung (~120%) |
| Thẻ nghiêng 3D + vệt sáng | `data-tilt` (CSS đọc `--rx --ry --gx --gy`) |
| Khung ảnh nghiêng, lớp con lệch sâu | `data-tilt-stage` (CSS đọc `--px --py`) |
| Đường nối dài theo cuộn | `data-steps` + `data-line` (ngang), `data-timeline` + `data-line-y` (dọc) |
| CTA nở ra toàn màn hình | `data-expand` |
| Số đếm lên | `data-count="48MP"` |
| Chữ tiêu đề trồi lên | `splitWords(text)` trong `h1` có `aria-label` |

### Thêm một hiệu ứng mới

```js
// effects.js, trong scrollFx(root) (cần GSAP) hoặc thành hàm riêng gọi từ runEffects (không cần GSAP)
root.querySelectorAll('[data-spin]').forEach((el) => {
  gsap.to(el, { rotate: 360, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
});
```
Rồi ghi thuộc tính mới vào comment đầu `effects.js` và bảng trên.

Luật chuyển động:
- Chỉ động `transform`, `opacity`, `clip-path` (rẻ, không gây tính lại bố cục).
- CSS animation đặt trong `@media (prefers-reduced-motion: no-preference)`.
- JS kiểm tra `reduce` trước khi chạy; `effects.js` đã kết thúc sớm khi người dùng bật giảm chuyển động.
- Không GSAP (mất mạng) → nội dung vẫn hiện đủ: trạng thái "đã hiện" không được phụ thuộc GSAP.
- Nhịp: vào trang 0.6–1.2s, phản hồi rê chuột 0.15–0.3s.

## Tiếp cận (a11y)

- Một `h1` mỗi trang, `h2` mỗi section, `h3` mỗi thẻ; không nhảy cấp.
- Ảnh trang trí `alt=""`; ảnh mang thông tin (ảnh sản phẩm ở trang chi tiết) `alt` = tên.
- Nút không chữ có `aria-label`. Icon có `aria-hidden="true"`.
- Trạng thái bằng thuộc tính ARIA, CSS đọc theo: `aria-pressed`, `aria-expanded`, `aria-current="page"`.
- Vùng chạm ≥ 44px. Tiêu điểm thấy rõ (`:focus-visible` trong base.css), không `outline: none` mà không thay thế.
- Độ tương phản chữ ≥ 4.5:1; kiểm tra cả 6 thương hiệu × sáng/tối khi thêm màu nền mới.
- Thông báo động dùng `role="status"` (form gửi thành công), đếm ngược `role="timer"`.
- Có link "Bỏ qua menu" (`.skip`) và `<main id="main">`.
- Form: `<label for>` thật, `autocomplete`, câu lỗi chỉ cách sửa.

## Hiệu năng

- Ảnh hero: `fetchpriority="high"`; còn lại `loading="lazy"`.
- Ảnh có tỉ lệ cố định (`aspect-ratio`) → không nhảy bố cục khi tải.
- Script ngoài `defer`; app là `type="module"`.
- Sự kiện cuộn `{ passive: true }` (đã có trong `WL.onScroll`).
- IntersectionObserver thay cho đo vị trí trong sự kiện cuộn.
- Render lại toàn trang mỗi lần đổi thương hiệu: giữ `render` rẻ (không vòng lặp lồng lớn, không đo DOM).
