# Section lớn và cách ghép trang

## Giải phẫu chuẩn của một section

```html
<section class="sec [sec--surface]">           ← khoảng dọc var(--sec-y), nền xen kẽ
  <div class="container [ten-khoi]">           ← khung giữa; lưới 2 cột đặt ở đây
    <div class="sec-head" data-reveal>         ← sectionHead(data, el, 'tenKhoi')
      <h2 class="sec-head__title">…</h2>
      <p class="sec-head__text">…</p>
    </div>
    <ul class="ten-khoi__list">…</ul>          ← nội dung chính
  </div>
</section>
```
- Mỗi section có **một** `h2`. Trang có **một** `h1` (hero hoặc page-head).
- Xen kẽ nền: không để hai `.sec--surface` liền nhau; khối "nặng" (CTA) dùng `--c-primary`.
- Section rộng tràn màn hình (hero, rail, CTA): bỏ `.container` ở lớp ngoài, đặt nó ở lớp trong.

## Bố cục hay dùng

| Bố cục | CSS | Ở đâu trong dự án |
|---|---|---|
| Tiêu đề trái, nội dung phải | `grid-template-columns: 5fr 7fr; gap: 72px` (≥ 960px) | FAQ, sứ mệnh, giải thưởng, agenda |
| Ảnh + chữ, xen kẽ trái phải | `1.1fr .9fr`, `.x--flip .x__media { order: 2 }` | `feat-row`, `lp-story` |
| Lưới thẻ tự co | `repeat(auto-fill, minmax(min(100%, 300px), 1fr))` | `pgrid`, `plans` |
| Bento (ô đầu lớn) | `1.4fr 1fr 1fr`, ô đầu `grid-row: span 2` | `hl-grid` |
| Ảnh dính + chữ cuộn | `position: sticky` + IntersectionObserver | `story` (features) |
| Dãy ngang | `overflow-x: auto; scroll-snap-type: x mandatory` (+ GSAP pin trên máy tính) | `rail` |
| Dòng thời gian | cột thời gian / chấm / nội dung, đường nối `::before` hoặc `<span>` | `tl` |

## Mẫu nhanh cho từng loại khối

**Hero** (`<wl-hero>`, `<wl-landing-hero>`): eyebrow/badge → `h1` dùng `splitWords()` (chữ trồi lên từng từ, có `aria-label` chứa câu đầy đủ) → lead → nút chính + link phụ → ghi chú nhỏ. Ảnh: `fetchpriority="high"`, **không** `loading="lazy"`.

**Lưới tính năng / điểm nổi bật**: 3–4 mục, mỗi mục icon + tiêu đề ≤ 6 từ + một câu. Độ trễ hiện dần so le `style="--d:${i * 0.08}s"`.

**Danh sách sản phẩm**: dùng lại `<wl-products layout="grid|rail" limit featured filter related>`; đừng viết lại thẻ, gọi `productCard(p)`.

**Quy trình / timeline**: dùng `<ol>` vì thứ tự có nghĩa. Đánh số hoặc ghi thời gian.

**Bảng giá** (`<wl-landing-offer>`): 2–4 gói, một gói `featured` (viền màu chính, cờ nhãn, nút đặc; gói khác nút `btn--ghost`). Giá cũ bằng `<s>`. Nút đều đáy nhờ `flex-direction: column` + danh sách quyền lợi `flex: 1`.

**FAQ**: `<details>/<summary>` gốc, không cần JS. Câu đầu mở sẵn. `<wl-faq source="…" copy="…" limit>`.

**Lời chứng thực**: một câu lớn + nút chọn người (`aria-pressed`), tự chuyển 7 giây, dừng khi người xem bấm.

**CTA cuối trang**: `<wl-cta-band copy="…">` một câu ngắn + một nút. Luôn là khối cuối của `<main>`.

## Ghép trang = kể một hành trình

Trang chủ hiện tại:
```
hero (thông điệp + hành động) → partners (ai đã tin) → campaign-teaser (có gì mới)
→ features (vì sao chọn) → products (chọn gì) → process (làm sao để có)
→ testimonials (người khác nói gì) → advisor (chưa chắc thì hỏi) → faq → cta-band
```
Câu hỏi khi thêm một section: người xem đang nghĩ gì ở điểm này, và section này trả lời câu đó? Không trả lời được thì bỏ.

## Thêm trang mới

1. Sao chép `_template.html`, đổi `<body data-page="ten-trang">`.
2. Thêm `pages.tenTrang: { title, heading, text, image? }` vào 6 JSON.
3. Xếp các thẻ `<wl-*>` trong `<main>`.
4. Cần trên menu → thêm vào `nav` của JSON.
