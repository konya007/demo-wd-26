# Trình đổi nội dung nhanh (đổi thương hiệu)

Mục tiêu: bấm chọn thương hiệu → màu, font, chữ, ảnh đổi **gần như tức thì**, không tải lại trang, không nháy trắng, vẫn nhớ lựa chọn khi sang trang khác.

## Luồng hiện tại

```
<wl-brand-switcher>  mở hộp thoại → fill()
   ├─ preview(file): fetch mọi data-N.json MỘT lần, giữ trong Map (bộ nhớ đệm)
   ├─ tải trước font tiêu đề của từng thương hiệu (thẻ xem trước đúng chất)
   └─ tải trước ảnh hero (new Image().src) → màn hình đầu hiện ngay khi chọn

bấm thẻ thương hiệu i
   ├─ cached = await preview(file)            (đã có sẵn → không chờ mạng)
   ├─ document.startViewTransition(() => WL.boot(cached))   chuyển cảnh mượt
   └─ WebDesign2026.load(i)                   lưu lựa chọn (localStorage) + tải lại JSON
         └─ 'webdesign2026:datachange' → WL.boot(data) → trùng chữ ký → bỏ qua
```

Đo bằng trình duyệt headless: chuyển xong trong < 1 giây, phần lớn là thời gian hiệu ứng chuyển cảnh, và chỉ **1** lần render.

## Năm kỹ thuật làm đổi nhanh

### 1. Đổi dữ liệu, không đổi trang
Toàn bộ giao diện là hàm của dữ liệu: `WL.boot(data)` vẽ lại mọi thẻ. Không `location.reload()`.

### 2. Bộ nhớ đệm dữ liệu
```js
const previews = new Map();
function preview(file) {
  if (!previews.has(file)) {
    previews.set(file, fetch(`assets-web-design/${file}`).then((r) => r.json()).catch(() => null));
  }
  return previews.get(file);   // lưu Promise → gọi nhiều lần chỉ fetch một lần
}
```
`wd2026.js` (của BTC, không sửa) luôn tải với `cache: 'no-store'`, nên bộ nhớ đệm phải nằm ở phía mình.

### 3. Bỏ render trùng
`WL.boot` so `JSON.stringify(data)` với lần trước; giống thì thoát. Nhờ vậy được render ngay từ bộ đệm mà không phải render lần hai khi `wd2026.js` trả về cùng dữ liệu.

### 4. Theme là biến CSS
Đổi màu = thay nội dung một thẻ `<style id="wl-theme">`. Trình duyệt chỉ tính lại style, không dựng lại bố cục từ đầu. Mọi màu phụ suy ra bằng `color-mix()` nên tự đổi theo.

### 5. Chuyển cảnh bằng View Transitions
```js
const swap = () => { WL.boot(cached); scrollTo({ top: 0 }); };
const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;
document.startViewTransition && motionOk ? document.startViewTransition(swap) : swap();
```
Trình duyệt chụp ảnh trạng thái cũ, chạy `swap`, rồi hoà dần sang trạng thái mới; tránh khoảnh khắc trang vẽ dở. CSS trong `effects.css` (`::view-transition-old/new(root)`) quyết định kiểu chuyển.

## Tải trước

| Tài nguyên | Khi nào | Cách |
|---|---|---|
| JSON các thương hiệu | mở hộp thoại | `preview()` |
| Font tiêu đề | mở hộp thoại | thêm `<link rel="stylesheet">` một lần cho mỗi URL |
| Ảnh hero | mở hộp thoại | `new Image().src = d.hero.image` |
| Ảnh còn lại | không | để `loading="lazy"` lo |

Không tải trước mọi ảnh của mọi thương hiệu: tốn băng thông người xem.

## Chuyển trang vẫn giữ thương hiệu

`wd2026.js` lưu tên file vào `localStorage['wd2026_active_file']`; trang sau tự tải đúng bộ đó. Thêm `@view-transition { navigation: auto; }` (trong `base.css`) để chuyển giữa các file HTML cũng mượt.

## Chống nháy khi mở trang

- `html:not(.wl-ready) body { opacity: 0 }` cho tới khi `boot` xong lần đầu.
- Chế độ sáng/tối đặt ngay trong `<head>` bởi `core.js`.
- Header có chiều cao cố định `var(--header-h)` → nội dung không nhảy khi header render.
- `preconnect` tới Google Fonts trong `<head>`.

## Thêm thương hiệu mới

1. Sao chép một `data-N.json`, sửa giá trị, giữ nguyên cấu trúc (xem `json-data.md`).
2. Ảnh vào `assets-web-design/img/<tên>/`.
3. Thêm một dòng vào `BRANDS` trong `js/app.js`: `{ file, label, topic }`.

## Khi đổi bị chậm, kiểm tra

- [ ] Thành phần nào làm việc nặng trong `render` (sắp xếp lớn, tính toán lặp)? Dời ra ngoài hoặc ghi nhớ kết quả.
- [ ] Có `window.addEventListener` cộng dồn sau mỗi lần đổi? (Performance → Event listeners)
- [ ] `ScrollTrigger.getAll().forEach(t => t.kill())` có chạy trước khi tạo hiệu ứng mới? (đã có trong `effects.js`)
- [ ] Ảnh hero quá lớn (> 400KB)?
- [ ] Font mới tải lâu? Thêm `display=swap` vào URL Google Fonts.
