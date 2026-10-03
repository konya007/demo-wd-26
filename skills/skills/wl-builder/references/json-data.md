# Tổ chức dữ liệu JSON

Mỗi thương hiệu là **một** file `assets-web-design/data-N.json`. Sáu file phải có **cùng cấu trúc**; chỉ giá trị khác nhau.

## Bản đồ khóa cấp cao

Nhóm theo **vai trò**, không theo trang:

| Nhóm | Khóa | Vai trò |
|---|---|---|
| Nhận diện | `seo`, `organization`, `theme` | ai, trông thế nào |
| Điều hướng | `nav`, `cta` | đi đâu, hành động chính |
| Chữ của khung | `sections.<khối>`, `pages.<trang>`, `catalog` | tiêu đề, mô tả, nhãn giao diện |
| Danh sách nội dung | `features`, `items`, `process`, `testimonials`, `faq`, `partners`, `achievements` | mảng bản ghi cùng dạng |
| Khối độc lập | `hero`, `mission`, `contact`, `assistant`, `landing` | object riêng cho một tính năng lớn |

Quy tắc chọn chỗ đặt khóa mới:
- Là **tiêu đề/mô tả của một khối** → `sections.<tênKhối>` (`{title, text, more}`), để `sectionHead()` và `copy="…"` dùng được.
- Là **tiêu đề của trang** → `pages.<data-page>` (`{title, heading, text, image}`).
- Là **danh sách bản ghi** → mảng cấp cao, tên số nhiều (`items`, `faq`).
- Là **cả một tính năng** (chiến dịch, trợ lý) → một object cấp cao gom mọi thứ của nó (`landing`, `assistant`). Xoá tính năng = xoá một khóa.

## Đặt tên

- `camelCase`, tiếng Anh, danh từ: `featuredLabel`, `darkColors`, `workingHours`.
- Mảng số nhiều (`plans`, `steps`), object số ít (`offer`, `story`).
- Boolean dạng tính từ/`isX`: `featured`.
- Cùng ý nghĩa thì cùng tên ở mọi nơi: `title` (tiêu đề), `text` (đoạn mô tả ngắn), `description` (mô tả dài), `image` (đường dẫn ảnh), `icon` (tên Lucide), `label` (nhãn ngắn), `href`/`link` (đường dẫn).
- `id` của bản ghi: slug không dấu, ổn định, dùng trong URL (`"y17-pro-max"`, `"bach-moc"`).

## Tham chiếu bằng id, không chép dữ liệu

```json
"landing": { "itemId": "bach-moc", ... }
```
Thành phần tra `items` để lấy tên, giá, ảnh. Không chép lại tên/giá vào `landing`, tránh hai nơi lệch nhau.

## Nội dung thuần, không HTML

- Không đặt thẻ HTML, CSS, class trong JSON. Cần nhấn mạnh → tách trường (`price` + `was` thay vì `<s>`).
- Chuỗi mẫu dùng chỗ trống có tên: `"message": "Tôi muốn đặt {plan} cho {campaign}."`.
- Ngày giờ theo ISO 8601 có múi giờ: `"deadline": "2026-11-13T05:00:00+07:00"`.
- Ảnh: đường dẫn tương đối từ gốc site `assets-web-design/img/<thương hiệu>/<tên>.jpg`.
- Số liệu hiển thị giữ dạng chuỗi đã định dạng (`"48MP"`, `"34.990.000đ"`); `countUp` tự tách số.

## Khóa tuỳ chọn và giá trị dự phòng

- Trường nào không bắt buộc thì thành phần phải chạy khi thiếu: `${p.was ? `<s>${esc(p.was)}</s>` : ''}`.
- Cả khối thiếu → `render` trả `''`.
- Không để chuỗi rỗng thay cho "không có" khi có thể bỏ khóa; nếu cấu trúc yêu cầu, chuỗi rỗng được coi là không có (`"logo": ""` → dùng chữ cái đầu).

## Ví dụ: khối chiến dịch

```json
"landing": {
  "kind": "Tour mới",
  "itemId": "bach-moc",
  "image": "assets-web-design/img/peak/i5.jpg",
  "badge": "Khởi hành 13/11/2026",
  "title": "…", "subtitle": "…",
  "deadline": "2026-11-13T05:00:00+07:00",
  "countdown": { "label": "Đoàn đầu khởi hành sau", "ended": "…" },
  "secondary": "Xem chi tiết cung đường",
  "teaser":     { "eyebrow": "…", "title": "…", "text": "…", "button": "…" },
  "highlights": [ { "icon": "sparkles", "title": "…", "text": "…" } ],
  "story":      { "title": "…", "text": "…", "image": "…", "points": ["…"] },
  "agenda":     { "title": "…", "text": "…", "steps": [ { "time": "Ngày 1", "title": "…", "text": "…" } ] },
  "offer":      { "title": "…", "text": "…", "featuredLabel": "…", "message": "… {plan} … {campaign}",
                  "plans": [ { "name": "…", "price": "…", "was": "", "note": "…", "perks": ["…"], "featured": true, "button": "…" } ] },
  "faq":        [ { "q": "…", "a": "…" } ]
}
```
Kèm theo: `sections.landingFaq`, `sections.landingCta`, `pages.landing`.

## Thêm một khóa vào cả 6 file

Sửa tay dễ sót. Dùng script, giữ định dạng 2 dấu cách, UTF-8, không thoát tiếng Việt:

```python
import json, pathlib
for p in sorted(pathlib.Path('assets-web-design').glob('data-*.json')):
    d = json.loads(p.read_text(encoding='utf-8'))
    d.setdefault('sections', {})['newBlock'] = {'title': 'TODO'}
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
```

## Kiểm tra cấu trúc giống nhau

```python
import json, pathlib
def shape(v):
    if isinstance(v, dict): return {k: shape(x) for k, x in sorted(v.items())}
    if isinstance(v, list): return [shape(v[0])] if v else []
    return type(v).__name__
files = sorted(pathlib.Path('assets-web-design').glob('data-*.json'))
base = shape(json.loads(files[0].read_text(encoding='utf-8')))
for f in files[1:]:
    if shape(json.loads(f.read_text(encoding='utf-8'))) != base: print('Khác cấu trúc:', f.name)
```
(Trường tuỳ chọn như `featured` chỉ có ở vài bản ghi sẽ bị báo; xem kỹ trước khi sửa.)

## Giữ file nhẹ

- Một JSON nên dưới ~60KB: mỗi lần đổi thương hiệu đều tải lại nó.
- Không nhúng ảnh base64. Không lặp chuỗi dài; tham chiếu bằng `id`.
- Ảnh nén sẵn, rộng tối đa ~1600px cho ảnh phủ màn hình, ~960px cho ảnh thẻ.
