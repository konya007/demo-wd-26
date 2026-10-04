/**
 * Mẩu giao diện nhỏ dùng chung (nguyên tử). Hàm thuần: nhận dữ liệu, trả chuỗi HTML.
 *   stars(rating)              hàng sao đánh giá, tô theo phần trăm (4,5 → 90%)
 *   avatar(name, size, image)  ảnh đại diện hoặc chữ cái đầu của tên
 *   fmtDate(iso)               ngày theo định dạng vi-VN
 *   fmtRating(n)               4.666 → "4,7"
 */
const { esc } = window.WL;

export const fmtRating = (n) => (Math.round(n * 10) / 10).toLocaleString('vi-VN');

export function stars(rating, cls = '') {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return `<span class="stars ${cls}" role="img" aria-label="${fmtRating(r)} / 5" style="--rating:${r}"></span>`;
}

/** Tên Việt: chữ cái của tên (từ cuối), không phải họ. */
export function avatar(name, size = 'md', image) {
  if (image) return `<img class="avatar avatar--${size}" src="${esc(image)}" alt="" loading="lazy">`;
  const letter = (String(name || '?').trim().split(/\s+/).pop() || '?')[0];
  return `<span class="avatar avatar--${size}" aria-hidden="true">${esc(letter)}</span>`;
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? esc(iso) : d.toLocaleDateString('vi-VN');
}
