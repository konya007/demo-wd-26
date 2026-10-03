# Xây trình render `core.js`

`core.js` là lõi khoảng 250 dòng, không framework. Phần này giải thích từng mảnh để đội có thể dựng lại từ đầu, mở rộng hoặc gỡ lỗi.

## Yêu cầu của một trình render cho site White Label

1. Nạp **trước** khi trang vẽ để đặt chế độ sáng/tối (không nháy màu).
2. Nhận một object dữ liệu, áp theme thành biến CSS, đặt SEO.
3. Vẽ lại **mọi** thành phần trên trang khi dữ liệu đổi, không tải lại trang.
4. Mỗi thành phần tự khai báo cách vẽ; HTML chỉ đặt thẻ.
5. Lỗi ở một thành phần không làm chết cả trang.

## Mảnh 1: chế độ sáng/tối chạy ngay

```js
const saved = (() => { try { return localStorage.getItem('wl-color-mode'); } catch (e) { return null; } })();
const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
```

Script đặt trong `<head>` **không** `defer`. `try/catch` vì `localStorage` có thể bị chặn (chế độ riêng tư).

## Mảnh 2: tiện ích

```js
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const get = (obj, path, fb) => {
  const v = String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  return v == null ? fb : v;
};
```

## Mảnh 3: theme → biến CSS

Ánh xạ khóa JSON sang tên biến, ghi vào **một** thẻ `<style id="wl-theme">` (ghi đè giá trị mặc định trong `base.css`):

```js
const TOKEN_MAP = { primary: '--c-primary', onPrimary: '--c-on-primary', accent: '--c-accent',
  background: '--c-bg', surface: '--c-surface', text: '--c-text', muted: '--c-muted', border: '--c-border' };

function applyTheme(t = {}) {
  const vars = (c) => Object.entries(c || {}).filter(([k]) => TOKEN_MAP[k]).map(([k, v]) => `${TOKEN_MAP[k]}:${v};`).join('');
  const css = `:root{${vars(t.colors)}` +
    (t.font?.heading ? `--f-heading:${t.font.heading};` : '') +
    (t.font?.body ? `--f-body:${t.font.body};` : '') +
    Object.entries(t.radius || {}).map(([k, v]) => `--r-${k}:${v};`).join('') +
    `}:root[data-theme="dark"]{${vars(t.darkColors)}}`;
  let s = document.getElementById('wl-theme');
  if (!s) { s = document.createElement('style'); s.id = 'wl-theme'; document.head.appendChild(s); }
  s.textContent = css;
  // font: một <link id="wl-fonts">, chỉ đổi href khi khác
}
```

Vì sao dùng thẻ `<style>` thay cho `style.setProperty` từng biến: ghi một lần, có cả khối `[data-theme="dark"]`, đổi thương hiệu chỉ thay `textContent`.

Màu suy ra (`--c-primary-soft`, `--c-surface-2`) viết bằng `color-mix()` trong `base.css`, nên tự đổi theo theme mà JS không phải tính.

## Mảnh 4: đăng ký thành phần (Custom Elements)

```js
const registry = new Set();

function define(tag, spec) {
  customElements.define(tag, class extends HTMLElement {
    connectedCallback() { registry.add(this); if (WL.data) this.update(WL.data); }
    disconnectedCallback() { registry.delete(this); this.teardown(); }
    teardown() { if (this._mounted && spec.unmount) spec.unmount(this); this._mounted = false; }
    attr(n, fb) { const v = this.getAttribute(n); return v == null || v === '' ? fb : v; }
    num(n, fb) { const x = parseInt(this.getAttribute(n), 10); return Number.isFinite(x) ? x : fb; }
    update(data) {
      try {
        this.teardown();
        this.innerHTML = spec.render(data, this);
        if (spec.mount) spec.mount(this, data);
        this._mounted = true;
      } catch (err) {
        console.error(`[WL] Lỗi khi render <${tag}>:`, err);
        this.innerHTML = '';            // một khối hỏng, cả trang vẫn sống
      }
    }
  });
}
```

Quyết định thiết kế:
- **Light DOM, không Shadow DOM**: CSS toàn cục và biến theme áp thẳng vào, effects.js tìm được `[data-reveal]` ở mọi nơi.
- **Chuỗi template + `innerHTML`**: đơn giản, nhanh với vài chục khối; bù lại phải `esc()` mọi thứ.
- **Thẻ tự render khi được gắn** (`connectedCallback`): thẻ thêm muộn hoặc lồng nhau vẫn có nội dung.

## Mảnh 5: boot

```js
function boot(data) {
  if (!data) return;
  const sig = JSON.stringify(data);
  if (sig === WL._sig) return;          // cùng dữ liệu → không làm lại
  WL._sig = sig;
  WL.data = data;
  applyTheme(data.theme);
  applySeo(data);                        // title theo pages[body.dataset.page], meta, favicon
  [...registry].forEach((el) => { if (el.isConnected) el.update(data); });
  refreshIcons();                        // lucide.createIcons()
  document.documentElement.classList.add('wl-ready');
  document.dispatchEvent(new CustomEvent('wl:rendered', { detail: data }));
}
```

`[...registry]` (bản sao) + `isConnected`: xem `architecture.md`, mục thẻ lồng nhau.

## Mảnh 6: nối với nguồn dữ liệu

Trình render **không biết** dữ liệu từ đâu tới. `app.js` nối:

```js
document.addEventListener('webdesign2026:datachange', (e) => WL.boot(e.detail));
document.addEventListener('wl:rendered', () => runEffects(document));
WebDesign2026.init({ folder: 'assets-web-design', files: BRANDS.map((b) => b.file), defaultIndex: 0 });
setTimeout(WL.failSafe, 4000);
```

Muốn lấy dữ liệu từ API thật: chỉ cần `fetch(url).then(r => r.json()).then(WL.boot)`.

## Mở rộng lõi đúng cách

| Muốn thêm | Làm ở đâu |
|---|---|
| Token theme mới (ví dụ `success`) | `TOKEN_MAP` + giá trị mặc định trong `base.css` + khóa trong 6 JSON |
| Hook vòng đời mới | trong `define` → ghi lại trong comment đầu `define` và trong `component-api.md` |
| Tiện ích dùng chung cho nhiều thành phần | thêm vào object `WL` cuối file |
| Thứ chỉ một thành phần dùng | **không** đặt vào core; để trong file thành phần |

Giữ core nhỏ: mỗi dòng thêm vào core chạy trên mọi trang.
