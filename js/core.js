/**
 * core.js — lõi White Label.
 *
 * Nạp trong <head> (không defer) để đặt chế độ sáng/tối trước khi trang vẽ.
 *
 * Luồng chạy của mọi trang:
 *   1. wd2026.js đọc bộ dữ liệu đang chọn → window.DATA_WEB_DESIGN + event.
 *   2. WL.boot(data): áp theme (màu, font, bo góc), SEO, tiêu đề trang.
 *   3. Mọi thẻ <wl-*> trên trang tự render lại từ data.
 *   4. Gắn hiệu ứng chung (đếm số, nút lên đầu trang).
 *
 * File HTML chỉ chứa các thẻ thành phần + tham số bố cục, KHÔNG chứa nội dung.
 */
(function () {
  'use strict';

  // ---------- Chế độ sáng / tối: chạy ngay, trước khi body hiển thị ----------
  const THEME_KEY = 'wl-color-mode';
  function readMode() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  const prefersDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = readMode() || (prefersDark ? 'dark' : 'light');

  // ---------- Tiện ích ----------
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /** Lấy giá trị theo đường dẫn "a.b.c", trả fallback nếu thiếu. */
  function get(obj, path, fallback) {
    const v = String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
    return v == null ? fallback : v;
  }

  const icon = (name, cls) => `<i data-lucide="${esc(name)}" class="ico ${cls || ''}" aria-hidden="true"></i>`;

  // ---------- Áp theme từ data.theme ----------
  const TOKEN_MAP = {
    primary: '--c-primary', onPrimary: '--c-on-primary', accent: '--c-accent',
    background: '--c-bg', surface: '--c-surface', text: '--c-text',
    muted: '--c-muted', border: '--c-border',
  };

  function tokens(colors) {
    return Object.entries(colors || {})
      .filter(([k]) => TOKEN_MAP[k])
      .map(([k, v]) => `${TOKEN_MAP[k]}:${v};`).join('');
  }

  function applyTheme(theme) {
    theme = theme || {};
    const font = theme.font || {};
    const radius = theme.radius || {};
    const css =
      `:root{${tokens(theme.colors)}` +
      (font.heading ? `--f-heading:${font.heading};` : '') +
      (font.body ? `--f-body:${font.body};` : '') +
      Object.entries(radius).map(([k, v]) => `--r-${k}:${v};`).join('') +
      `}:root[data-theme="dark"]{${tokens(theme.darkColors)}}`;

    let style = document.getElementById('wl-theme');
    if (!style) {
      style = document.createElement('style');
      style.id = 'wl-theme';
      document.head.appendChild(style);
    }
    style.textContent = css;

    let fontLink = document.getElementById('wl-fonts');
    if (font.googleFonts) {
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = 'wl-fonts';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      if (fontLink.href !== font.googleFonts) fontLink.href = font.googleFonts;
    }
  }

  function setMeta(attr, key, value) {
    if (!value) return;
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute(attr, key);
      document.head.appendChild(m);
    }
    m.setAttribute('content', value);
  }

  /** Favicon: dùng seo.favicon nếu có, không thì vẽ chữ cái đầu bằng màu primary. */
  function faviconFor(data) {
    const url = get(data, 'seo.favicon');
    if (url) return url;
    const letter = esc((get(data, 'organization.shortName', '?'))[0]);
    const color = get(data, 'theme.colors.primary', '#333');
    const fg = get(data, 'theme.colors.onPrimary', '#fff');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${color}"/><text x="32" y="44" font-size="36" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="${fg}">${letter}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function applySeo(data) {
    const page = document.body.dataset.page || 'home';
    const brand = get(data, 'organization.shortName', '');
    const pageTitle = get(data, `pages.${page}.title`, '');
    document.title = pageTitle ? `${pageTitle} | ${brand}` : get(data, 'seo.title', brand);
    document.documentElement.lang = (get(data, 'seo.locale', 'vi')).slice(0, 2);

    setMeta('name', 'description', get(data, 'seo.description'));
    setMeta('name', 'theme-color', get(data, 'theme.colors.primary'));
    setMeta('property', 'og:title', document.title);
    setMeta('property', 'og:description', get(data, 'seo.description'));
    setMeta('property', 'og:image', get(data, 'seo.thumbnail'));

    let link = document.head.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconFor(data);
  }

  // ---------- Đăng ký thành phần ----------
  const registry = new Set();

  /**
   * WL.define('wl-hero', {
   *   render(data, el) → chuỗi HTML (đọc tham số qua el.attr('variant', 'split'))
   *   mount(el, data)  → (tuỳ chọn) gắn sự kiện sau khi render
   *   unmount(el)      → (tuỳ chọn) dọn bộ hẹn giờ / sự kiện trên window trước khi render lại hoặc bị gỡ
   * })
   */
  function define(tag, spec) {
    class WLElement extends HTMLElement {
      connectedCallback() {
        registry.add(this);
        if (WL.data) this.update(WL.data);
      }
      disconnectedCallback() {
        registry.delete(this);
        this.teardown();
      }
      teardown() {
        if (this._mounted && spec.unmount) spec.unmount(this);
        this._mounted = false;
      }
      attr(name, fallback) {
        const v = this.getAttribute(name);
        return v == null || v === '' ? fallback : v;
      }
      num(name, fallback) {
        const n = parseInt(this.getAttribute(name), 10);
        return Number.isFinite(n) ? n : fallback;
      }
      update(data) {
        try {
          this.teardown();
          this.innerHTML = spec.render(data, this);
          if (spec.mount) spec.mount(this, data);
          this._mounted = true;
        } catch (err) {
          console.error(`[WL] Lỗi khi render <${tag}>:`, err);
          this.innerHTML = '';
        }
      }
    }
    customElements.define(tag, WLElement);
  }

  // ---------- Hiệu ứng chung ----------
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Đếm số từ 0 khi phần tử [data-count] lọt vào màn hình. Giữ nguyên hậu tố như "+", "%". */
  function countUp(root) {
    const els = root.querySelectorAll('[data-count]');
    if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const raw = el.dataset.count;
        const m = raw.match(/^(\D*)([\d.,]+)(.*)$/);
        if (!m) return;
        const target = parseFloat(m[2].replace(/[.,]/g, ''));
        if (!target || target < 10) return;
        const start = performance.now();
        const dur = 1200;
        const fmt = (n) => n.toLocaleString('vi-VN');
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = m[1] + fmt(Math.round(target * eased)) + m[3];
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        })(start);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  function refreshIcons() {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  // ---------- Khởi động ----------
  function boot(data) {
    if (!data) return;
    // Trình đổi thương hiệu đã render sẵn từ bộ nhớ đệm; wd2026.js tải lại đúng bộ đó thì bỏ qua.
    const sig = JSON.stringify(data);
    if (sig === WL._sig) return;
    WL._sig = sig;
    WL.data = data;
    applyTheme(data.theme);
    applySeo(data);
    // Duyệt bản sao: thẻ con sinh ra trong lúc render đã tự render khi gắn vào trang,
    // thẻ con cũ bị thay thế thì đã rời trang → bỏ qua cả hai, mỗi thẻ render đúng 1 lần.
    [...registry].forEach((el) => { if (el.isConnected) el.update(data); });
    refreshIcons();
    countUp(document);
    document.documentElement.classList.add('wl-ready');
    document.dispatchEvent(new CustomEvent('wl:rendered', { detail: data }));
  }

  /** Không tải được JSON (thường do mở file bằng nhấp đúp) → báo rõ cách sửa. */
  function failSafe() {
    if (WL.data) return;
    document.documentElement.classList.add('wl-ready');
    const box = document.createElement('div');
    box.className = 'wl-fatal';
    box.innerHTML = '<strong>Không tải được dữ liệu thương hiệu.</strong>' +
      '<p>Trình duyệt chặn đọc file JSON khi mở trang bằng nhấp đúp. Hãy chạy bằng Live Server (VS Code) hoặc một web server tĩnh.</p>';
    document.body.prepend(box);
  }

  /** Gắn 1 hàm theo dõi cuộn cho phần tử; render lại thì thay hàm cũ, không cộng dồn. */
  function onScroll(el, fn) {
    if (el._wlScroll) window.removeEventListener('scroll', el._wlScroll);
    el._wlScroll = fn;
    window.addEventListener('scroll', fn, { passive: true });
    fn();
  }

  function setMode(mode) {
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* chế độ riêng tư */ }
  }

  const WL = {
    data: null, esc, get, icon, define, boot, failSafe, refreshIcons, countUp, setMode, onScroll,
    params: new URLSearchParams(location.search),
  };
  window.WL = WL;
})();
