/**
 * Màn hình đầu: <wl-hero> cho trang chủ, <wl-page-head> cho trang con.
 */
import { ctaButton } from './layout.js';

const { esc, get, define } = window.WL;

/** Tách tiêu đề thành từng từ để hiệu ứng chữ trồi lên lần lượt. */
export function splitWords(text) {
  return String(text || '').split(/\s+/).filter(Boolean).map((w, i) =>
    `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
}

/**
 * <wl-hero variant="split|full">
 *   split: chữ trái, ảnh phải đặt trên "sân khấu" 3D nghiêng theo con trỏ
 *   full : ảnh phủ toàn màn hình, trôi chậm khi cuộn
 * data.hero.variant (nếu có) ghi đè tham số: mỗi thương hiệu tự chọn bố cục.
 */
define('wl-hero', {
  render(data, el) {
    const h = data.hero || {};
    const variant = h.variant || el.attr('variant', 'split');
    const second = h.ctaSecondary;
    const stats = (h.stats || []).slice(0, 3).map((s) => `
      <div class="hero__stat">
        <strong data-count="${esc(s.value)}">${esc(s.value)}</strong>
        <span>${esc(s.label)}</span>
      </div>`).join('');

    return `
      <section class="hero hero--${esc(variant)}">
        ${variant === 'full' ? `<div class="hero__bg" data-parallax="0.3"><img src="${esc(h.image)}" alt="" fetchpriority="high"></div>` : ''}
        <div class="container hero__grid">
          <div class="hero__copy">
            ${h.eyebrow ? `<p class="hero__eyebrow">${esc(h.eyebrow)}</p>` : ''}
            <h1 class="hero__title" aria-label="${esc(h.title)}"><span aria-hidden="true">${splitWords(h.title)}</span></h1>
            <p class="hero__lead">${esc(h.subtitle)}</p>
            <div class="hero__actions">
              ${ctaButton(data, 'btn--lg')}
              ${second ? `<a class="link-under" href="${esc(second.link)}">${esc(second.text)}</a>` : ''}
            </div>
            ${get(data, 'cta.note') ? `<p class="hero__note">${esc(data.cta.note)}</p>` : ''}
          </div>
          ${variant === 'full'
            ? (stats ? `<div class="hero__stats hero__stats--bar">${stats}</div>` : '')
            : `<div class="hero__media" data-tilt-stage>
                 <div class="hero__stage">
                   <span class="hero__halo" aria-hidden="true"></span>
                   <img class="hero__img" src="${esc(h.image)}" alt="" fetchpriority="high">
                   ${stats ? `<div class="hero__stats">${stats}</div>` : ''}
                 </div>
               </div>`}
        </div>
        <a class="hero__scroll" href="#main-next" aria-label="Cuộn xuống"><span></span></a>
      </section>
      <span id="main-next"></span>`;
  },
});

/**
 * <wl-page-head page="features" image="false">
 * Đầu trang con. Nội dung lấy từ data.pages[page]; page mặc định = body[data-page].
 */
define('wl-page-head', {
  render(data, el) {
    const key = el.attr('page', document.body.dataset.page);
    const p = get(data, `pages.${key}`, {});
    const showImage = el.attr('image', 'true') !== 'false' && p.image;
    return `
      <section class="page-head">
        <div class="container">
          <nav class="crumbs" aria-label="Đường dẫn">
            <a href="index.html">${esc(get(data, 'nav.0.label', 'Trang chủ'))}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">${esc(p.title)}</span>
          </nav>
          <h1 class="page-head__title" aria-label="${esc(p.heading || p.title)}"><span aria-hidden="true">${splitWords(p.heading || p.title)}</span></h1>
          ${p.text ? `<p class="page-head__lead">${esc(p.text)}</p>` : ''}
        </div>
        ${showImage ? `<div class="container"><div class="page-head__frame" data-reveal="clip"><img class="page-head__img" src="${esc(p.image)}" alt="" data-parallax="-0.12"></div></div>` : ''}
      </section>`;
  },
});
