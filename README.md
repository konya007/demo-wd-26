# Web Design 2026 — Website White Label

Website nhiều trang, trình bày theo phong cách landing page, chạy **6 thương hiệu giả tưởng trên cùng một mã nguồn**.
HTML, CSS, JavaScript thuần, không framework. Toàn bộ tên, màu, font, menu, nội dung, câu hỏi của trợ lý AI nằm trong một file JSON cho mỗi thương hiệu.

| File | Thương hiệu | Chủ đề | Màu · font · bố cục hero |
|---|---|---|---|
| `data-1.json` | YPhone | Công nghệ · điện thoại | Xanh dương · Manrope · ảnh bên phải |
| `data-2.json` | Meow | Công nghệ · laptop | Tím · Baloo 2 · ảnh bên phải |
| `data-3.json` | Đỉnh Gió | Du lịch · leo núi mạo hiểm | Cam đất · Barlow Condensed · ảnh phủ màn hình |
| `data-4.json` | Mơ Sương | Du lịch · qua đêm Đà Lạt | Xanh sương · Fraunces · ảnh phủ màn hình |
| `data-5.json` | Mộc Nhan | Thời trang · mỹ phẩm | Hồng mận · Playfair Display · ảnh bên phải |
| `data-6.json` | Nhịp Phố | Thời trang · quần áo | Đen · Unbounded · góc vuông |

## Chạy thử

Mở bằng **Live Server** (VS Code) hoặc `python3 -m http.server`. Mở bằng nhấp đúp sẽ không đọc được JSON; trang hiện thông báo hướng dẫn.

Đổi thương hiệu: nút **Đổi thương hiệu** góc dưới bên trái (xem trước màu, font, ảnh của cả 6), hoặc logo tròn góc dưới bên phải của `wd2026.js` (BTC). Lựa chọn được nhớ nên mọi trang đều đổi theo.

## Cấu trúc

```
index.html  features.html  products.html  product.html  about.html  contact.html
landing-page.html         # landing chiến dịch: ra mắt sản phẩm / tour mới / bộ sưu tập mới
_template.html            # khung để tạo trang mới
assets-web-design/
  data-1.json … data-6.json   # bộ dữ liệu cấu hình: nơi DUY NHẤT cần sửa khi đổi thương hiệu
  img/<thương hiệu>/          # ảnh thật CC0, nén sẵn, chạy được khi mất mạng
  img/CREDITS.md              # nguồn và giấy phép từng ảnh
css/
  base.css                # token mặc định, reset, kiểu chữ, nút
  components.css          # kiểu của từng thành phần
  effects.css             # chuyển động
js/
  core.js                 # lõi: áp theme, SEO, đăng ký thành phần
  app.js                  # điểm vào: danh sách thương hiệu, nạp thành phần, khởi tạo wd2026.js
  effects.js              # hiệu ứng cuộn, 3D, hiện dần (GSAP ScrollTrigger)
  components/
    layout.js             # header, footer, thanh tiến độ, đổi thương hiệu, lên đầu trang, CTA di động
    hero.js               # màn hình đầu, đầu trang con
    sections.js           # đối tác, tính năng, sản phẩm, quy trình, đánh giá, hỏi đáp, CTA
    about.js              # sứ mệnh, con số, ghi nhận
    product-detail.js     # chi tiết một sản phẩm / tour
    advisor.js            # trợ lý AI chọn sản phẩm
    contact.js            # thông tin liên hệ + biểu mẫu (nhận dữ liệu điền sẵn)
    landing.js            # teaser chiến dịch, đếm ngược, các khối của landing page
    product-detail.js     # trang chi tiết: ảnh + ảnh nhỏ, dịch vụ, tab, nội dung A+, thanh mua dính đáy
    reviews.js            # đánh giá có chấm sao, biểu đồ phân bố, lọc theo sao
    blocks.js             # bảng so sánh, thư viện ảnh, đăng ký nhận tin
    ui.js                 # nguyên tử dạng hàm: sao đánh giá, avatar, định dạng ngày
tools/find-images.py      # tìm ảnh thật CC0 theo chủ đề (Openverse API)
wd2026.js                 # thư viện chuyển dữ liệu của BTC (không sửa)
skills/skills/wl-builder/ # skill cho AI (tiếng Anh): cách xây thành phần, JSON, CSS, core.js
AGENTS.md  CLAUDE.md  GEMINI.md  .github/copilot-instructions.md  .cursor/rules/   # điểm vào cho từng công cụ AI
```

## Mỗi trang chỉ là danh sách thẻ

File HTML không chứa nội dung, chỉ có thẻ thành phần và tham số bố cục. Ví dụ `index.html`:

```html
<body data-page="home">
  <wl-header></wl-header>
  <main id="main">
    <wl-hero variant="split"></wl-hero>
    <wl-partners></wl-partners>
    <wl-features layout="story" limit="4" more></wl-features>
    <wl-products layout="rail" more></wl-products>
    <wl-process></wl-process>
    <wl-testimonials></wl-testimonials>
    <wl-advisor></wl-advisor>
    <wl-faq limit="4"></wl-faq>
    <wl-cta-band></wl-cta-band>
  </main>
  <wl-footer></wl-footer>
  …
</body>
```

Thứ tự khối trên trang chủ là một hành trình: thông điệp và nút hành động → ai đã tin dùng → vì sao nên chọn → chọn sản phẩm nào → làm thế nào để có → người khác nói gì → chưa chắc thì hỏi trợ lý → giải đáp thắc mắc → nhắc lại lời kêu gọi.

### Thứ tự chạy khi mở một trang

1. `core.js` đặt chế độ sáng/tối đã lưu, trước khi trang hiện ra.
2. `app.js` đăng ký các thẻ `<wl-*>` rồi gọi `WebDesign2026.init()`.
3. `wd2026.js` tải bộ JSON đang chọn, phát sự kiện `webdesign2026:datachange`.
4. `WL.boot(data)`: áp `theme` thành biến CSS, nạp font, đặt tiêu đề, mô tả, favicon.
5. Từng thẻ render lại từ dữ liệu, gắn sự kiện (menu, lọc, biểu mẫu…).
6. `effects.js` gắn chuyển động cho phần vừa render.

### Thành phần và tham số

| Thẻ | Tham số | Dữ liệu dùng |
|---|---|---|
| `<wl-header>` / `<wl-footer>` | — | `organization`, `nav`, `cta`, `contact` |
| `<wl-hero>` | `variant="split\|full"` (JSON `hero.variant` ghi đè) | `hero`, `cta` |
| `<wl-page-head>` | `page="…"`, `image="false"` | `pages[page]` |
| `<wl-partners>` | — | `partners` |
| `<wl-features>` | `layout="story\|rows"`, `limit`, `more` | `features` |
| `<wl-products>` | `layout="rail\|grid"`, `limit`, `featured`, `filter`, `related`, `more` | `items`, `catalog` |
| `<wl-product-detail>` | đọc `?id=` trên URL | `items`, `pages.product` |
| `<wl-process>` / `<wl-testimonials>` / `<wl-faq limit>` | — | `process` / `testimonials` / `faq` |
| `<wl-advisor>` | `compact` | `assistant`, `items` |
| `<wl-contact>` | đọc `?item=` hoặc dữ liệu từ trợ lý | `contact`, `items`, `sections.contact` |
| `<wl-cta-band>` | `copy="…"` | `sections.ctaBand`, `cta` |
| `<wl-mission>` / `<wl-stats>` / `<wl-achievements>` | — | `mission` / `hero.stats` / `achievements` |
| `<wl-scroll-progress>`, `<wl-brand-switcher>`, `<wl-back-to-top>`, `<wl-sticky-cta>` | — | `cta`, danh sách thương hiệu |
| `<wl-campaign-teaser>` | — | `landing.teaser`, `landing.image` |
| `<wl-countdown>` | `source="landing"`, `size="sm\|lg"` | `deadline`, `countdown` tại `source` |
| `<wl-landing-hero>` / `-highlights` / `-story` / `-agenda` / `-offer` | `layout` (highlights: `bento\|grid\|list`) | `landing.*` |
| `<wl-product-detail>` | `media="gallery\|single"`, `specs="false"`, `layout="split\|stacked"` | `items`, `reviews` |
| `<wl-pdp-services>` / `<wl-pdp-tabs>` / `<wl-pdp-content>` | `layout` | `pdp.*`, `sections.pdpContent` |
| `<wl-sticky-buy>` | — | sản phẩm đang xem |
| `<wl-reviews>` | `item`, `layout="split\|stack\|grid\|rail"`, `limit`, `filter` | `reviews`, `sections.reviews` |
| `<wl-compare>` | `limit`, `featured`, `ids` | `items[].specs`, `sections.compare` |
| `<wl-gallery>` | `source`, `layout="masonry\|grid\|strip"`, `limit` | mảng bất kỳ có `image` |
| `<wl-newsletter>` | `layout="inline\|card\|split"` | `sections.newsletter` |

Một số khối cũ có thêm kiểu bố cục: `<wl-faq layout="split|stack|cards">`, `<wl-cta-band layout="split|center|card">`, `<wl-testimonials layout="spotlight|grid">`, `<wl-process layout="row|list">`.

### Tham số bố cục dùng chung

Mọi thẻ `<wl-*>` nhận thêm 4 tham số, xử lý hoàn toàn bằng CSS trong `base.css`:

| Tham số | Giá trị | Tác dụng |
|---|---|---|
| `align` | `start`, `center`, `end` | căn tiêu đề, chữ, hàng nút |
| `width` | `narrow`, `wide`, `full` | độ rộng khung (mặc định 1200px) |
| `tone` | `none`, `surface`, `primary`, `inverse` | nền và bộ màu của khối, các thành phần con tự đổi màu theo |
| `space` | `none`, `tight`, `loose` | khoảng cách trên dưới |

Ví dụ: `<wl-faq layout="stack" align="center" width="narrow" tone="surface">`.

Khối nào có tiêu đề đều đọc `sections.<tên khối>`; thêm `copy="tênKhác"` để dùng bộ chữ khác. `<wl-faq source="landing.faq">` đọc danh sách câu hỏi từ đường dẫn khác.

## Landing page chiến dịch

Mỗi thương hiệu có một chiến dịch trong khóa `landing` của JSON. Trang chủ hiện thẻ giới thiệu (`<wl-campaign-teaser>`) có đồng hồ đếm ngược, bấm vào mở `landing-page.html`.

| Thương hiệu | Chiến dịch | Loại |
|---|---|---|
| YPhone | Ra mắt YPhone 17 Pro Max, mở bán 20/10 | Ra mắt sản phẩm |
| Meow | Meow Book Air cho tân sinh viên, giảm 4 triệu | Chiến dịch |
| Đỉnh Gió | Đêm Ngân Hà trên Bạch Mộc Lương Tử | Tour mới |
| Mơ Sương | Mùa dã quỳ: một đêm, hai buổi bình minh | Tour mới |
| Mộc Nhan | Tinh chất Nghệ 2.0 | Ra mắt sản phẩm |
| Nhịp Phố | Bộ sưu tập Gió Hội An, 200 chiếc | Bộ sưu tập mới |

Trang đi theo hành trình: thông điệp + hạn chót → 4 điểm nổi bật → câu chuyện → lịch trình → chọn gói → hỏi đáp → kêu gọi. Bấm chọn gói sẽ mở form liên hệ đã chọn sẵn sản phẩm và điền lời nhắn có tên gói.

## Đổi thương hiệu nhanh

Hộp **Đổi thương hiệu** tải sẵn JSON, font tiêu đề và ảnh hero của cả 6 thương hiệu khi mở. Bấm chọn thì trang render ngay từ bộ nhớ đệm, có hiệu ứng View Transition, không chờ mạng. `wd2026.js` vẫn được gọi để lưu lựa chọn; `WL.boot` bỏ qua lần render trùng vì dữ liệu giống hệt.

## Skill cho AI

`skills/skills/wl-builder/` (tiếng Anh) hướng dẫn trợ lý AI cách làm việc trong dự án: `SKILL.md` là điểm vào, `references/` chia theo chủ đề (danh mục thành phần, tham số bố cục, vòng đời render, API thành phần, xây `core.js`, tổ chức JSON, trình đổi nội dung, biến CSS, đặt tên class, nguyên tử, khung trang, section, trang chi tiết + đánh giá, landing page, hiệu ứng, danh sách kiểm tra).

Mỗi công cụ AI có một điểm vào riêng, cùng trỏ về `AGENTS.md`:

| Công cụ | File đọc tự động |
|---|---|
| Codex, Cursor, Copilot, Jules, Windsurf… | `AGENTS.md` |
| Claude Code | `CLAUDE.md` (nhập `@AGENTS.md`) |
| Gemini CLI | `GEMINI.md` (nhập `@AGENTS.md`) |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/wl-builder.mdc` |

## Trợ lý AI: chọn đáp án → tự điền form liên hệ

`<wl-advisor>` hỏi 3 câu (câu hỏi và đáp án nằm trong `assistant.questions` của từng JSON), rồi:

- **Có khóa API Claude** (người dùng tự dán, chỉ lưu trong trình duyệt): gọi `claude-opus-5-5` qua SDK chính thức `@anthropic-ai/sdk` (nạp từ jsDelivr). Claude đọc danh mục `items` và trả về JSON đúng schema `{itemId, alternativeId, reason, message}`. `itemId` bị ràng buộc bằng `enum` nên không thể gợi ý sản phẩm không có thật.
- **Không có khóa hoặc lỗi mạng**: chấm điểm theo nhãn, tức số `tags` của đáp án trùng với `tags` của sản phẩm, và ghép lời nhắn từ `assistant.template`.

Bấm **Điền sẵn vào form liên hệ**: trang liên hệ tự chọn sản phẩm, điền lời nhắn và đặt con trỏ vào ô họ tên. Nút hành động ở trang chi tiết cũng mang sẵn `?item=` sang form.

> Gọi API trực tiếp từ trình duyệt chỉ phù hợp cho demo: khóa nằm ở máy người dùng. Bản thật cần một máy chủ trung gian giữ khóa.

## Hiệu ứng

| Hiệu ứng | Ở đâu | Cách làm |
|---|---|---|
| Chữ tiêu đề trồi lên từng từ | Hero, đầu trang con, chi tiết | CSS, `splitWords()` |
| Sân khấu 3D nghiêng theo con trỏ, các lớp lệch độ sâu | Hero, ảnh chi tiết | CSS `perspective` + biến `--rx/--ry` |
| Ảnh lùi xa và mờ dần khi cuộn qua hero | Hero | GSAP ScrollTrigger |
| Ảnh dính, đổi theo đoạn đang đọc | Tính năng (trang chủ) | `position: sticky` + IntersectionObserver |
| Dãy sản phẩm trượt ngang khi cuộn dọc | Trang chủ (desktop) | ScrollTrigger `pin` + `scrub` |
| Thẻ nghiêng 3D có vệt sáng | Thẻ sản phẩm | pointermove → biến CSS |
| Dải đối tác chạy vô hạn | Đối tác | CSS keyframes |
| Đường nối các bước dài dần | Quy trình | ScrollTrigger `scrub` |
| CTA nở từ thẻ bo góc ra toàn màn hình | Cuối trang | `clip-path` + ScrollTrigger |
| Ảnh trôi lệch tốc độ cuộn, mở như rèm | Ảnh lớn | `data-parallax`, `data-reveal="clip"` |
| Chuyển trang mượt | Giữa các file HTML | View Transitions (`@view-transition`) |

Tất cả tắt khi hệ điều hành bật **giảm chuyển động**. Không tải được GSAP thì trang vẫn đủ nội dung, chỉ bớt hiệu ứng cuộn.

## Đổi thương hiệu: chỉ sửa JSON

| Muốn đổi | Sửa trong JSON |
|---|---|
| Tên, khẩu hiệu, logo | `organization` (`logo` để trống thì dùng chữ cái đầu của `shortName`) |
| Màu sáng / tối | `theme.colors`, `theme.darkColors` |
| Font | `theme.font.heading`, `theme.font.body`, `theme.font.googleFonts` |
| Độ bo góc | `theme.radius.sm/md/lg` |
| Menu | `nav` |
| Lời kêu gọi hành động (header, hero, chi tiết, cuối trang, di động) | `cta` |
| Bố cục hero | `hero.variant` |
| Sản phẩm / tour | `items` |
| Câu hỏi của trợ lý AI | `assistant.questions`, `assistant.template` |
| Tiêu đề từng khối, từng trang | `sections`, `pages` |

**Thêm thương hiệu:** sao chép một `data-N.json`, sửa nội dung, đặt ảnh vào `assets-web-design/img/<tên>/`, thêm một dòng vào `BRANDS` trong `js/app.js`.

**Thêm trang:** sao chép `_template.html`, đổi `data-page`, thêm `pages.<tên>` trong mỗi JSON và một mục trong `nav` nếu cần.

## Ảnh thật, miễn phí

Ảnh lấy từ **StockSnap** (giấy phép CC0) qua **[Openverse API](https://api.openverse.org)**. API này miễn phí, không cần khóa, kết quả có kèm giấy phép. Ảnh được duyệt tay để loại logo thương hiệu thật, rồi nén và lưu trong dự án.

```bash
python3 tools/find-images.py "mountain camping" "pine forest" --n 12
```

Muốn thêm nguồn khác, có thể dùng các API sau (cần đăng ký khóa miễn phí):

- [Unsplash API](https://unsplash.com/developers): ảnh đẹp nhất, 50 lượt/giờ ở chế độ demo.
- [Pexels API](https://www.pexels.com/api/): có cả video, 200 lượt/giờ.
- [Pixabay API](https://pixabay.com/api/docs/): có ảnh vector, minh họa.

## Thư viện

| Tài nguyên | Dùng để | Giấy phép |
|---|---|---|
| [GSAP](https://gsap.com) 3.13 + ScrollTrigger | Hiệu ứng theo thanh cuộn | Miễn phí (GSAP Standard License) |
| [Lucide](https://lucide.dev) 0.460.0 | Icon | ISC |
| [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) 0.131.0 | Gọi Claude cho trợ lý AI | MIT |
| [Google Fonts](https://fonts.google.com) | Manrope, Baloo 2, Nunito, Barlow, Fraunces, Playfair Display, Unbounded, Be Vietnam Pro | SIL OFL |
| StockSnap qua Openverse | Ảnh | CC0 (`assets-web-design/img/CREDITS.md`) |
| `wd2026.js` | Chuyển bộ dữ liệu demo | Do BTC cấp |

Mọi thương hiệu, khách hàng, đối tác trong dữ liệu đều là giả tưởng.
