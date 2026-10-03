# Danh sách kiểm tra trước khi nộp

> Cần hỏi N bộ dữ liệu và chủ đề,... là gì để soạn đủ để Demo

## Dữ liệu
- [ ] Khóa mới có trong **cả N** `data-N.json`, cùng cấu trúc.
- [ ] Không có HTML trong JSON; ngày giờ ISO có múi giờ; ảnh trỏ đúng file có thật.
- [ ] Tham chiếu sản phẩm bằng `id` có trong `items`.
- [ ] Xoá thử khóa mới khỏi một file → trang vẫn chạy, khối tự ẩn.

## Thành phần
- [ ] Mọi giá trị JSON qua `esc()`; tham số URL qua `encodeURIComponent`.
- [ ] `render` không gắn sự kiện; `mount` gắn; `unmount` dọn timer / listener ngoài thẻ.
- [ ] Không chữ cứng ngoài nhãn tiếp cận chung.
- [ ] Comment đầu `define` ghi thẻ, tham số, dữ liệu đọc.
- [ ] Thẻ mới có trong danh sách `display: block` (base.css) và được import (app.js).

## CSS
- [ ] Chỉ dùng biến cho màu, font, bo góc, cỡ chữ.
- [ ] Tên class theo BEM ngắn; JS dùng `data-*`.
- [ ] Viết mobile trước; không cuộn ngang ở 360px.
- [ ] Đoạn CSS mới có comment tiêu đề, nằm đúng file.

## Kiểm tra bằng mắt
- [ ] Ít nhất 2 thương hiệu khác hẳn nhau (ví dụ YPhone bo tròn + Nhịp Phố góc vuông).
- [ ] Sáng và tối.
- [ ] 390px và 1440px.
- [ ] Đổi thương hiệu khi đang ở trang → khối render lại đúng, không nhân đôi sự kiện, không lỗi console.
- [ ] Bật "giảm chuyển động" → nội dung vẫn hiện đủ.
- [ ] Dùng bàn phím: Tab tới mọi nút, thấy viền tiêu điểm, Esc đóng hộp thoại.

## Chạy thử
```bash
python -m http.server 8000      # hoặc Live Server trong VS Code
# mở http://localhost:8000/landing-page.html
```
Mở bằng nhấp đúp sẽ không đọc được JSON.
