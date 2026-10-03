# Landing page chiến dịch

Mỗi thương hiệu có **một** chiến dịch nổi bật: ra mắt sản phẩm, tour mới, bộ sưu tập mới, ưu đãi theo mùa. Trang chủ có thẻ `<wl-campaign-teaser>` dẫn tới `landing-page.html`. Cùng một file HTML phục vụ cả 6 thương hiệu; nội dung nằm ở `data.landing`.

## Các mảnh đã có

| Thẻ | Dữ liệu | Việc |
|---|---|---|
| `<wl-campaign-teaser>` (index.html) | `landing.teaser`, `image`, `kind`, `deadline` | thẻ lớn ảnh + tiêu đề + đếm ngược nhỏ |
| `<wl-landing-hero>` | `kind`, `badge`, `title`, `subtitle`, `image`, `secondary`, `itemId` | ảnh phủ màn hình, nút chính sang form (mang `?item=`), link phụ sang chi tiết |
| `<wl-countdown source size>` | `deadline`, `countdown.{label, ended, units?}` | đếm ngược; hết giờ hiện câu `ended` |
| `<wl-landing-highlights>` | `highlights[]` | bento 4 ô |
| `<wl-landing-story>` | `story` | ảnh mở như rèm + đoạn văn + danh sách tích |
| `<wl-landing-agenda>` | `agenda.steps[]` | dòng thời gian: lịch ra mắt, lịch trình tour, liệu trình |
| `<wl-landing-offer>` | `offer.plans[]`, `offer.message` | bảng gói; bấm → `sendPrefill` điền sẵn form liên hệ |
| `<wl-faq source="landing.faq" copy="landingFaq">` | `landing.faq`, `sections.landingFaq` | hỏi đáp riêng của chiến dịch |
| `<wl-cta-band copy="landingCta">` | `sections.landingCta` | lời kêu gọi cuối |

## Hành trình của trang

```
1. Hero        Cái gì mới? Khi nào? (hạn chót tạo lý do hành động ngay)
2. Highlights  Vì sao đáng quan tâm? (4 lý do, quét trong 5 giây)
3. Story       Tin được không? (câu chuyện + bằng chứng cụ thể)
4. Agenda      Diễn ra thế nào? (mốc thời gian / lịch trình)
5. Offer       Tôi chọn gói nào, giá bao nhiêu?
6. FAQ         Gỡ nỗi lo cuối cùng
7. CTA         Nhắc lại hành động
```

## Viết chiến dịch mới cho một thương hiệu

1. Chọn **một** sản phẩm/tour trong `items` làm trung tâm → `itemId`.
2. Đặt `kind` theo loại: "Ra mắt sản phẩm", "Tour mới", "Bộ sưu tập mới", "Chiến dịch".
3. Hạn chót thật trong tương lai, ISO có múi giờ (`+07:00`). `countdown.label` nói rõ đếm tới việc gì ("Mở bán sau", "Đoàn đầu khởi hành sau").
4. Tiêu đề hero ≤ 10 từ, có tên sản phẩm hoặc lợi ích cụ thể. Phụ đề 1–2 câu, có con số.
5. `highlights`: đúng 4 mục (bento được thiết kế cho 4), tiêu đề ≤ 4 từ, icon Lucide khác nhau.
6. `agenda.steps`: 3–4 mốc. Ra mắt sản phẩm → ngày; tour → "Ngày 1/2/3" hoặc giờ; mỹ phẩm → "Tuần 1…4".
7. `offer.plans`: 3 gói, gói giữa `featured: true`. `was` để `""` nếu không giảm giá. `message` có `{plan}` và `{campaign}`.
8. `faq`: 3 câu về nỗi lo **riêng** của chiến dịch (đổi ý, thời tiết, giới hạn số lượng).
9. Thêm `sections.landingFaq.title`, `sections.landingCta.{title, text}`, `pages.landing.title` (tiêu đề tab).
10. Ảnh: dùng ảnh có sẵn của thương hiệu; ảnh hero nên khác ảnh hero trang chủ.

## Thêm khối mới cho landing

Ví dụ khối "Số lượng còn lại" (`landing.stock = { total: 200, left: 46, label: "Còn lại" }`):

```js
/** <wl-landing-stock> — thanh tiến độ số lượng còn lại. */
define('wl-landing-stock', {
  render(data) {
    const s = get(data, 'landing.stock');
    if (!s || !s.total) return '';
    const pct = Math.round((1 - s.left / s.total) * 100);
    return `
      <section class="sec sec--tight">
        <div class="container stock" data-reveal>
          <p class="stock__label">${esc(s.label)}: <b>${esc(s.left)}</b> / ${esc(s.total)}</p>
          <div class="stock__bar" role="progressbar" aria-valuemin="0" aria-valuemax="${esc(s.total)}" aria-valuenow="${esc(s.total - s.left)}">
            <span style="width:${pct}%"></span>
          </div>
        </div>
      </section>`;
  },
});
```
Rồi: CSS `.stock…` trong components.css (đoạn Landing), `wl-landing-stock` vào danh sách `display:block`, đặt thẻ vào `landing-page.html`, thêm `landing.stock` vào JSON (thương hiệu nào không có thì khối tự ẩn).

## Nhiều chiến dịch cho một thương hiệu

Đổi `landing` thành mảng `campaigns[]` có `id`, và cho các thẻ đọc chiến dịch theo `?c=<id>`:
```js
const id = WL.params.get('c');
const l = (data.campaigns || []).find((c) => c.id === id) || (data.campaigns || [])[0];
```
Teaser trên trang chủ khi đó lặp qua `campaigns` và trỏ `landing-page.html?c=<id>`.
