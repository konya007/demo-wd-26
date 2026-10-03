# Biến CSS (token) và tổ chức CSS

## Ba tầng biến

```
Tầng 1: token thương hiệu   ← JSON theme, core.js ghi vào <style id="wl-theme">
        --c-primary --c-on-primary --c-accent --c-bg --c-surface --c-text --c-muted --c-border
        --f-heading --f-body   --r-sm --r-md --r-lg

Tầng 2: token suy ra / hệ thống  ← base.css, không đổi theo thương hiệu nhưng tính từ tầng 1
        --c-primary-soft: color-mix(in srgb, var(--c-primary) 12%, var(--c-bg));
        --c-surface-2:    color-mix(in srgb, var(--c-text) 4%, var(--c-bg));
        --t-sm … --t-3xl (thang chữ)   --gutter --max --sec-y --header-h   --ease-out

Tầng 3: biến cục bộ của thành phần  ← đặt bằng style="" hoặc JS
        --d (độ trễ hiện dần)  --i (thứ tự từ)  --rx --ry --px --py (nghiêng 3D)  --bc (màu thẻ thương hiệu)
```

Luật: thành phần **chỉ đọc** tầng 1 và 2, **chỉ ghi** tầng 3.

## Bảng tiền tố

| Tiền tố | Loại | Ví dụ |
|---|---|---|
| `--c-` | màu | `--c-primary`, `--c-muted` |
| `--f-` | họ font | `--f-heading` |
| `--r-` | bo góc | `--r-sm` (nút, ô nhập), `--r-md` (thẻ), `--r-lg` (ảnh lớn) |
| `--t-` | cỡ chữ | `--t-base`, `--t-2xl` |
| `--sec-y`, `--gutter`, `--max`, `--header-h` | bố cục | |
| `--ease-` | đường cong chuyển động | `--ease-out` |

Đặt biến theo **vai trò** (`--c-surface`), không theo **giá trị** (`--blue-500`). Nhờ vậy cùng một CSS đúng cho cả 6 thương hiệu và chế độ tối.

## Dùng màu đúng vai trò

| Vai trò | Biến |
|---|---|
| Nền trang | `--c-bg` |
| Nền thẻ, form, khối nổi | `--c-surface` |
| Nền khối xen kẽ (`.sec--surface`) | `--c-surface-2` |
| Chữ chính / phụ | `--c-text` / `--c-muted` |
| Nút, link, điểm nhấn, trạng thái chọn | `--c-primary` (chữ trên nó: `--c-on-primary`) |
| Nền nhạt cho icon, chip đang chọn | `--c-primary-soft` |
| Trang trí nhỏ (vòng, chấm) | `--c-accent` |
| Viền | `--c-border` |

Biến thể màu mới → dùng `color-mix()` thay cho thêm token: `color-mix(in srgb, var(--c-primary) 45%, transparent)`.

Ngoại lệ được phép mã cứng: chữ trắng và lớp phủ đen trên ảnh (`.lp-hero`, `.hero--full`), màu lỗi form `#d93025`.

## Sáng / tối

- Giá trị tối nằm trong `theme.darkColors` của JSON → `:root[data-theme="dark"]{…}`.
- Thành phần **không** viết lại màu cho chế độ tối nếu đã dùng biến; chỉ thêm quy tắc riêng khi thật cần.
- Hiện/ẩn theo chế độ: class `.only-dark`, `.only-light`.

## Cỡ chữ và khoảng cách co giãn

```css
--t-2xl: clamp(2rem, 1.4rem + 2.4vw, 3.25rem);
--sec-y: clamp(72px, 10vw, 136px);
```
Dùng `clamp()` thay cho nhiều media query. Tiêu đề khối: `--t-2xl`; tiêu đề trang/hero: `--t-3xl`; tiêu đề thẻ: `--t-lg`/`--t-xl`.

## Tổ chức file CSS

| File | Chứa | Không chứa |
|---|---|---|
| `base.css` | token mặc định, reset, kiểu chữ, `.container`, `.sec`, `.btn`, `.icon-btn`, `.link-under`, `.sr-only`, danh sách `wl-* { display:block }` | kiểu riêng của khối |
| `components.css` | mỗi thành phần một đoạn, mở đầu bằng `/* ---------- Tên ---------- */`, xếp theo thứ tự xuất hiện trên trang | keyframes, chuyển động theo cuộn |
| `effects.css` | `@keyframes`, `[data-reveal]`, hiệu ứng vào trang, View Transitions; tất cả trong `@media (prefers-reduced-motion: no-preference)` | màu, bố cục |

Trong một đoạn thành phần: khối → phần tử → biến thể → trạng thái → media query (mobile trước, `min-width` sau).

## Breakpoint dùng chung

`640px` (điện thoại ngang), `768px` (máy tính bảng), `960px` (bố cục máy tính), `1024px` (4 cột). Viết mobile trước, mở rộng bằng `@media (min-width: …)`.
