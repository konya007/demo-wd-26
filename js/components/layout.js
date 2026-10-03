/**
 * Thành phần xuất hiện ở mọi trang: header, footer, nút lên đầu trang,
 * thanh kêu gọi hành động trên di động.
 */
const { esc, get, icon, define, onScroll } = window.WL;

/** Logo: ảnh nếu organization.logo có, không thì ô chữ cái đầu + tên ngắn. */
export function brandMark(data) {
  const org = data.organization || {};
  const mark = org.logo
    ? `<img src="${esc(org.logo)}" alt="" class="brand__img">`
    : `<span class="brand__mono" aria-hidden="true">${esc((org.shortName || '?')[0])}</span>`;
  return `<a class="brand" href="index.html" aria-label="${esc(org.name)} – Trang chủ">${mark}<span class="brand__name">${esc(org.shortName)}</span></a>`;
}

/** Trang hiện tại là trang nào trong menu (so theo tên file). */
function isCurrent(href) {
  const file = location.pathname.split('/').pop() || 'index.html';
  if (file === 'product.html') return href === 'products.html';
  return href === file;
}

export function ctaButton(data, cls) {
  return `<a class="btn ${cls || ''}" href="${esc(get(data, 'cta.href', 'contact.html'))}">${esc(get(data, 'cta.text'))}</a>`;
}

// ------------------------------------------------------------------ header
define('wl-header', {
  render(data) {
    const nav = (data.nav || []).map((n) =>
      `<li><a href="${esc(n.href)}"${isCurrent(n.href) ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('');
    return `
      <header class="site-header">
        <div class="container site-header__bar">
          ${brandMark(data)}
          <nav class="site-nav" id="site-nav" aria-label="Menu chính">
            <ul>${nav}</ul>
            ${ctaButton(data, 'site-nav__cta')}
          </nav>
          <div class="site-header__tools">
            <button class="icon-btn" type="button" data-mode-toggle aria-label="Đổi chế độ sáng tối">
              ${icon('sun', 'only-dark')}${icon('moon', 'only-light')}
            </button>
            ${ctaButton(data, 'btn--sm hide-mobile')}
            <button class="icon-btn menu-btn" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Mở menu">
              ${icon('menu', 'when-closed')}${icon('x', 'when-open')}
            </button>
          </div>
        </div>
      </header>`;
  },
  mount(el) {
    const header = el.querySelector('.site-header');
    const menuBtn = el.querySelector('.menu-btn');

    menuBtn.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    });
    el.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => {
      header.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
    }));

    el.querySelector('[data-mode-toggle]').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      window.WL.setMode(next);
    });

    onScroll(el, () => header.classList.toggle('is-scrolled', window.scrollY > 8));
  },
});

// ------------------------------------------------------------------ footer
define('wl-footer', {
  render(data) {
    const org = data.organization || {};
    const c = data.contact || {};
    const nav = (data.nav || []).map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`).join('');
    const socials = Object.entries(c.socials || {}).map(([k, url]) =>
      `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(k[0].toUpperCase() + k.slice(1))}</a></li>`).join('');
    return `
      <footer class="site-footer">
        <div class="container site-footer__grid">
          <div class="site-footer__brand">
            ${brandMark(data)}
            <p>${esc(org.tagline)}</p>
            ${ctaButton(data)}
          </div>
          <nav aria-label="Menu chân trang"><ul class="plain-list">${nav}</ul></nav>
          <ul class="plain-list site-footer__contact">
            <li>${esc(c.address)}</li>
            <li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
            <li><a href="tel:${esc((c.phone || '').replace(/\s/g, ''))}">${esc(c.phone)}</a></li>
            <li>${esc(c.workingHours)}</li>
          </ul>
          <ul class="plain-list">${socials}</ul>
        </div>
        <div class="container site-footer__legal">
          <span>© ${new Date().getFullYear()} ${esc(org.name)}</span>
          <span>Thương hiệu giả tưởng, phục vụ cuộc thi Web Design 2026.</span>
        </div>
      </footer>`;
  },
});

// ------------------------------------------------------------------ back to top
define('wl-back-to-top', {
  render() {
    return `<button class="to-top icon-btn" type="button" aria-label="Lên đầu trang">${icon('arrow-up')}</button>`;
  },
  mount(el) {
    const btn = el.querySelector('.to-top');
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll(el, () => btn.classList.toggle('is-visible', window.scrollY > 600));
  },
});

// ------------------------------------------------------------------ mobile CTA bar
/** Lời kêu gọi hành động luôn trong tầm tay trên điện thoại, hiện sau khi cuộn qua màn hình đầu. */
define('wl-sticky-cta', {
  render(data) {
    return `<div class="sticky-cta">${ctaButton(data, 'btn--block')}</div>`;
  },
  mount(el) {
    const bar = el.querySelector('.sticky-cta');
    onScroll(el, () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 400;
      bar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8 && !nearEnd);
    });
  },
});

// ------------------------------------------------------------------ scroll progress
/** Thanh mảnh trên đỉnh trang cho biết người xem đã đọc tới đâu. */
define('wl-scroll-progress', {
  render() {
    return '<div class="progress" aria-hidden="true"><span></span></div>';
  },
  mount(el) {
    const bar = el.querySelector('span');
    onScroll(el, () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    });
  },
});

// ------------------------------------------------------------------ brand switcher
/**
 * <wl-brand-switcher> — nút nổi + hộp thoại chọn thương hiệu.
 * Danh sách lấy từ WL.brands (khai báo trong app.js); bản xem trước đọc thẳng từ từng file JSON.
 * Chọn xong gọi WebDesign2026.load(i): lưu lựa chọn và render lại toàn bộ trang, không tải lại.
 */
const previews = new Map();
function preview(file) {
  if (!previews.has(file)) {
    previews.set(file, fetch(`assets-web-design/${file}`).then((r) => r.json()).catch(() => null));
  }
  return previews.get(file);
}

define('wl-brand-switcher', {
  render(data) {
    const color = get(data, 'theme.colors.primary');
    return `
      <button class="switch-fab" type="button" aria-haspopup="dialog" aria-label="Đổi thương hiệu">
        <span class="switch-fab__dot" style="background:${esc(color)}"></span>
        <span class="switch-fab__label">Đổi thương hiệu</span>
      </button>
      <dialog class="switcher" aria-labelledby="switcher-title">
        <div class="switcher__head">
          <div>
            <h2 id="switcher-title">Chọn thương hiệu</h2>
            <p>Cùng một mã nguồn. Chỉ đổi bộ dữ liệu JSON.</p>
          </div>
          <button class="icon-btn" type="button" data-close aria-label="Đóng">${icon('x')}</button>
        </div>
        <ul class="switcher__grid" data-grid></ul>
      </dialog>`;
  },
  mount(el, data) {
    const dialog = el.querySelector('dialog');
    const grid = el.querySelector('[data-grid]');
    const brands = window.WL.brands || [];
    const current = window.WebDesign2026 && window.WebDesign2026._activeIndex;

    async function fill() {
      const all = await Promise.all(brands.map((b) => preview(b.file)));
      // tải trước ảnh hero để khi chọn, màn hình đầu hiện ngay
      all.forEach((d) => { if (d && d.hero && d.hero.image) new Image().src = d.hero.image; });
      grid.innerHTML = all.map((d, i) => {
        if (!d) return '';
        const c = d.theme.colors;
        return `
          <li>
            <button type="button" class="brand-card${i === current ? ' is-current' : ''}" data-index="${i}"
              style="--bc:${esc(c.primary)};--bc-on:${esc(c.onPrimary)}">
              <img src="${esc(d.hero.image)}" alt="" loading="lazy">
              <span class="brand-card__body">
                <span class="brand-card__topic">${esc(brands[i].topic)}</span>
                <strong style="font-family:${esc(d.theme.font.heading)}">${esc(d.organization.shortName)}</strong>
                <span class="brand-card__tag">${esc(d.organization.tagline)}</span>
                <span class="brand-card__swatches">${['primary', 'accent', 'background', 'text'].map((k) => `<i style="background:${esc(c[k])}"></i>`).join('')}</span>
              </span>
              ${i === current ? '<span class="brand-card__now">Đang xem</span>' : ''}
            </button>
          </li>`;
      }).join('');
      // nạp trước font tiêu đề để thẻ hiển thị đúng chất thương hiệu
      all.forEach((d) => {
        if (!d || document.querySelector(`link[href="${d.theme.font.googleFonts}"]`)) return;
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = d.theme.font.googleFonts;
        document.head.appendChild(l);
      });
    }

    el.querySelector('.switch-fab').addEventListener('click', () => { fill(); dialog.showModal(); });
    el.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    // Đổi nhanh: render ngay từ JSON đã có trong bộ nhớ đệm (không chờ mạng), bọc trong
    // View Transition để chuyển màu mượt; wd2026.js vẫn được gọi để lưu lựa chọn.
    grid.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-index]');
      if (!card) return;
      const i = Number(card.dataset.index);
      const cached = await preview(brands[i].file);
      dialog.close();
      const swap = () => {
        if (cached) window.WL.boot(cached);
        window.scrollTo({ top: 0 });
      };
      const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.startViewTransition && motionOk) document.startViewTransition(swap);
      else swap();
      window.WebDesign2026.load(i);
    });
  },
});
