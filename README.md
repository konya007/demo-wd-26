# 🎨 Web Design 2026 — White-Label Landing Page

Dự án tham gia cuộc thi **Web Design 2026**. Landing page SPA thuần HTML/CSS/JS, hỗ trợ **3 bộ dữ liệu** khác nhau, **Dark/Light mode**, **count-up animation**, và **horizontal scroll** casual UI.

---

## 🚀 Demo trực tiếp

Mở file `index.html` bằng Live Server hoặc trình duyệt.

3 bộ dữ liệu tích hợp sẵn — bấm nút **"Đổi dữ liệu demo"** góc phải dưới màn hình:

| Data | Thương hiệu | Màu chủ đạo |
|---|---|---|
| Data 1 | Aurora Studio (Digital Agency) | 🔵 Xanh dương `#2563EB` |
| Data 2 | Codevify (IT Outsourcing) | 🟠 Cam `#EA580C` |
| Data 3 | TOEIC Master (Trung tâm Anh ngữ) | 🟢 Xanh lá `#059669` |

---

## 📁 Cấu trúc dự án

```
wd-demo/
├── index.html              # SPA shell (navbar, footer, #app viewport)
├── style.css               # Custom styles, dark mode, animations
├── main.js                 # Router, render engine, theme injection
├── wd2026.js               # Multi-tenant data switcher (do BTC cấp)
├── README.md               # Tài liệu này
└── assets-web-design/
    ├── data-1.json         # Aurora Studio (Agency)
    ├── data-2.json         # Codevify (IT Outsource)
    └── data-3.json         # TOEIC Master (Giáo dục)
```

---

## 🧩 Các trang (SPA Hash Router)

| Route | Trang |
|---|---|
| `#/` | **Landing** — Hero, Services (cuộn ngang), 3 dự án nổi bật, Partners, Contact |
| `#/projects` | **Tất cả dự án** — Grid + search + filter category + sort |
| `#/projects/:id` | **Chi tiết dự án** — Ảnh lớn, info, tags, dự án liên quan |
| `#/about` | **Về chúng tôi** — Mission, Vision, Values, thống kê, Services |
| `#/achievements` | **Thành tích** — Grid thành tựu với count-up animation |
| `#/contact` | **Liên hệ** — Contact info + form |

---

## ⚙️ Công nghệ sử dụng

| Công nghệ | Mục đích | Link |
|---|---|---|
| **HTML5 + CSS3 + Vanilla JS** | Nền tảng chính | — |
| **Tailwind CSS** (CDN) | Utility-first CSS framework | [tailwindcss.com](https://tailwindcss.com) |
| **Lucide Icons** | Icon set miễn phí | [lucide.dev](https://lucide.dev) |
| **Google Fonts** | Be Vietnam Pro + Inter | [fonts.google.com](https://fonts.google.com) |
| **Intersection Observer** | Scroll reveal, count-up trigger | Native API |
| **Hash-based Router** | SPA navigation | Tự viết |

---

## 🔑 Cách dùng

### 1. Mở trang
```bash
# Dùng Live Server (VS Code) hoặc mở trực tiếp
open index.html
```

### 2. Đổi bộ dữ liệu
- Bấm logo tròn góc phải dưới → **"Đổi dữ liệu demo"**
- Chọn Data 1 / 2 / 3
- Toàn bộ nội dung + màu sắc tự động cập nhật

### 3. Thêm bộ dữ liệu mới
1. Tạo file `assets-web-design/data-4.json` theo cấu trúc mẫu
2. Sửa `<script>` cuối `index.html`:
```js
WebDesign2026.init({
    folder: 'assets-web-design',
    files: ['data-1.json', 'data-2.json', 'data-3.json', 'data-4.json'],
    labels: ['Aurora', 'Codevify', 'TOEIC Master', 'Tên mới'],
    defaultIndex: 0,
    overrideCss: true,
});
```

### 4. Cấu trúc data-N.json

```json
{
  "theme": {
    "colors": {
      "primary": "#EA580C",
      "primary-light": "#F97316",
      "primary-dark": "#C2410C"
    }
  },
  "seo": { "title": "...", "description": "...", "favicon": "...", "themeColor": "..." },
  "organization": { "name": "...", "shortName": "...", "tagline": "...", "foundedYear": 2020 },
  "hero": { "eyebrow": "...", "title": "...", "subtitle": "...", "stats": [...] },
  "mission": { "title": "...", "description": "...", "vision": "...", "values": [...] },
  "services": [{ "icon": "code-2", "title": "...", "description": "..." }],
  "projects": [{ "id": "...", "title": "...", "category": "...", "client": "...", "year": 2025, "thumbnail": "...", "description": "...", "tags": [...], "link": "...", "featured": true }],
  "partners": [{ "name": "...", "logo": "..." }],
  "achievements": [{ "title": "...", "value": "...", "description": "..." }],
  "contact": { "address": "...", "email": "...", "phone": "...", "socials": {...} }
}
```

---

## 🎯 Tính năng nổi bật

- ✅ **White-Label**: Một codebase, nhiều bộ dữ liệu — đổi data là đổi toàn bộ thương hiệu
- ✅ **Dark/Light mode**: Toggle + tự động detect `prefers-color-scheme`, lưu localStorage
- ✅ **Count-up animation**: Số liệu tự chạy khi scroll đến (hero stats, achievements)
- ✅ **Horizontal scroll**: Services & Projects dạng cuộn ngang casual, có nút điều hướng
- ✅ **Search + Filter + Sort**: Trang Projects có tìm kiếm, lọc danh mục, sắp xếp
- ✅ **Project Detail + Related**: Xem chi tiết dự án + gợi ý dự án cùng danh mục
- ✅ **Responsive**: Mobile-first, tương thích mọi kích thước màn hình
- ✅ **Không backend**: Tất cả render phía client, deploy tĩnh trên GitHub Pages

---

## 📜 License

Dự án phục vụ cuộc thi Web Design 2026. Mã nguồn sử dụng các thư viện miễn phí, hợp pháp.

---

## 👥 Tác giả

Sinh viên tham dự — Cuộc thi Web Design 2026
