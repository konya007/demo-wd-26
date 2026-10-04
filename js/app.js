/**
 * app.js — điểm vào của mọi trang.
 * Nạp toàn bộ thành phần, sau đó để wd2026.js (thư viện BTC) đọc bộ dữ liệu đang chọn.
 */
import './components/layout.js';
import './components/hero.js';
import './components/sections.js';
import './components/about.js';
import './components/contact.js';
import './components/product-detail.js';
import './components/advisor.js';
import './components/landing.js';
import './components/reviews.js';
import './components/blocks.js';
import { runEffects } from './effects.js';

// Danh sách thương hiệu. Thêm thương hiệu mới = thêm 1 file JSON + 1 dòng ở đây.
const BRANDS = [
  { file: 'data-1.json', label: 'YPhone', topic: 'Công nghệ · Điện thoại' },
  { file: 'data-2.json', label: 'Meow', topic: 'Công nghệ · Laptop' },
  { file: 'data-3.json', label: 'Đỉnh Gió', topic: 'Du lịch · Leo núi' },
  { file: 'data-4.json', label: 'Mơ Sương', topic: 'Du lịch · Đà Lạt' },
  { file: 'data-5.json', label: 'Mộc Nhan', topic: 'Thời trang · Mỹ phẩm' },
  { file: 'data-6.json', label: 'Nhịp Phố', topic: 'Thời trang · Quần áo' },
];
window.WL.brands = BRANDS;

document.addEventListener('webdesign2026:datachange', (e) => window.WL.boot(e.detail));
document.addEventListener('wl:rendered', () => runEffects(document));

window.WebDesign2026.init({
  folder: 'assets-web-design',
  files: BRANDS.map((b) => b.file),
  labels: BRANDS.map((b) => b.label),
  defaultIndex: 0,
  overrideCss: false,
});

setTimeout(window.WL.failSafe, 4000);
