/**
 * Trang chi tiết sản phẩm / tour (PDP). Sản phẩm chọn theo product.html?id=...
 * Không thấy id (ví dụ vừa đổi thương hiệu) thì dùng item nổi bật đầu tiên.
 *
 *   <wl-product-detail media="gallery|single" specs="false" layout="split|stacked">
 *   <wl-pdp-services layout="row|cards">   dải cam kết dịch vụ (giao hàng, bảo hành…) – data.pdp.services
 *   <wl-pdp-tabs>                          tab Mô tả / Thông số / Giao hàng – item + data.pdp
 *   <wl-pdp-content layout="alternate|stack|cards">  khối nội dung ảnh + chữ (A+) – data.pdp.blocks
 *   <wl-sticky-buy>                        thanh mua dính đáy, hiện khi nút chính khuất khỏi màn hình
 */
import { splitWords } from './hero.js';
import { sectionHead } from './sections.js';
import { stars, fmtRating } from './ui.js';

const { esc, get, icon, define } = window.WL;

/** Item đang xem. Dùng chung cho mọi khối của PDP. */
export function currentItem(data) {
  const id = window.WL.params.get('id');
  const list = data.items || [];
  return list.find((x) => x.id === id) || list.find((x) => x.featured) || list[0] || null;
}

/** Ảnh của item: item.gallery nếu có, không thì ảnh chính + ảnh tính năng của thương hiệu. */
function galleryOf(data, p) {
  const extra = (data.features || []).map((f) => f.image);
  return [...new Set([p.image, ...(p.gallery || extra)])].filter(Boolean).slice(0, 5);
}

/** Điểm trung bình + số đánh giá, dẫn xuống <wl-reviews> (id="danh-gia"). */
function ratingLink(data, p) {
  const rv = (data.reviews || []).filter((r) => r.itemId === p.id);
  if (!rv.length) return '';
  const avg = rv.reduce((s, r) => s + r.rating, 0) / rv.length;
  return `<a class="detail__rating" href="#danh-gia">${stars(avg)}<span>${fmtRating(avg)} · ${rv.length}</span></a>`;
}

const buyHref = (p) => `contact.html?item=${encodeURIComponent(p.id)}#lien-he`;
const specsList = (p) => (p.specs || []).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('');

// ------------------------------------------------------------------ detail
define('wl-product-detail', {
  render(data, el) {
    const p = currentItem(data);
    if (!p) return '';
    const L = get(data, 'pages.product', {});
    document.title = `${p.name} | ${get(data, 'organization.shortName', '')}`;

    const imgs = el.attr('media', 'gallery') === 'gallery' ? galleryOf(data, p) : [p.image];
    const thumbs = imgs.length > 1 ? `
      <div class="thumbs" role="group" aria-label="${esc(p.name)}">
        ${imgs.map((src, i) => `<button type="button" class="thumbs__btn" aria-pressed="${i === 0}" data-thumb="${esc(src)}" aria-label="${i + 1} / ${imgs.length}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}
      </div>` : '';
    const specs = el.attr('specs', 'true') !== 'false' ? specsList(p) : '';
    const layout = el.attr('layout', 'split');

    return `
      <article class="detail detail--${esc(layout)}">
        <div class="container detail__grid">
          <div class="detail__media" data-tilt-stage>
            <div class="detail__stage"><img src="${esc(imgs[0])}" alt="${esc(p.name)}" data-main></div>
            ${thumbs}
          </div>
          <div class="detail__info">
            <a class="back" href="products.html">${icon('arrow-left')}${esc(L.back)}</a>
            <p class="detail__cat">${esc(L.category)}: ${esc(p.category)}</p>
            <h1 class="detail__title" aria-label="${esc(p.name)}"><span aria-hidden="true">${splitWords(p.name)}</span></h1>
            <p class="detail__tag">${esc(p.tagline)}</p>
            ${ratingLink(data, p)}
            <p class="detail__price"><span>${esc(L.price)}</span>${esc(p.price)}</p>
            <p class="detail__desc">${esc(p.description)}</p>
            <div class="detail__actions" data-buy-anchor>
              <a class="btn btn--lg" href="${buyHref(p)}">${esc(get(data, 'cta.text'))}</a>
              ${get(data, 'cta.note') ? `<span class="detail__note">${esc(data.cta.note)}</span>` : ''}
            </div>
            ${specs ? `<h2 class="detail__h">${esc(L.specs)}</h2><dl class="facts">${specs}</dl>` : ''}
          </div>
        </div>
      </article>`;
  },
  mount(el) {
    const main = el.querySelector('[data-main]');
    const btns = [...el.querySelectorAll('[data-thumb]')];
    btns.forEach((b) => b.addEventListener('click', () => {
      main.src = b.dataset.thumb;
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
  },
});

// ------------------------------------------------------------------ services
/** <wl-pdp-services layout="row|cards"> — cam kết dịch vụ ngay dưới phần mua. */
define('wl-pdp-services', {
  render(data, el) {
    const list = get(data, 'pdp.services', []);
    if (!list.length) return '';
    const items = list.map((s) => `
      <li class="svc">${icon(s.icon)}<span><strong>${esc(s.title)}</strong><small>${esc(s.text)}</small></span></li>`).join('');
    return `<section class="sec sec--tight-top"><div class="container"><ul class="svcs svcs--${esc(el.attr('layout', 'row'))}" data-reveal>${items}</ul></div></section>`;
  },
});

// ------------------------------------------------------------------ tabs
/**
 * <wl-pdp-tabs> — Mô tả / Thông số / Giao hàng. Theo mẫu WAI-ARIA Tabs:
 * mũi tên trái/phải chuyển tab, Home/End về đầu/cuối, chỉ tab đang chọn nằm trong thứ tự Tab.
 */
define('wl-pdp-tabs', {
  render(data) {
    const p = currentItem(data);
    if (!p) return '';
    const T = get(data, 'pdp.tabs', {});
    const panels = [
      { key: 'description', html: `<p class="tabs__lead">${esc(p.tagline)}</p><p>${esc(p.description)}</p>` },
      { key: 'specs', html: p.specs && p.specs.length ? `<dl class="facts">${specsList(p)}</dl>` : '' },
      { key: 'shipping', html: (get(data, 'pdp.shipping', [])).length ? `<ul class="checklist">${data.pdp.shipping.map((t) => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>` : '' },
    ].filter((x) => x.html && T[x.key]);
    if (!panels.length) return '';
    return `
      <section class="sec sec--tight">
        <div class="container container--narrow tabs" data-reveal>
          <div class="tabs__list" role="tablist">
            ${panels.map((x, i) => `<button type="button" role="tab" class="tabs__tab" id="tab-${x.key}" aria-controls="panel-${x.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(T[x.key])}</button>`).join('')}
          </div>
          ${panels.map((x, i) => `<div class="tabs__panel" role="tabpanel" id="panel-${x.key}" aria-labelledby="tab-${x.key}" tabindex="0"${i ? ' hidden' : ''}>${x.html}</div>`).join('')}
        </div>
      </section>`;
  },
  mount(el) {
    const tabs = [...el.querySelectorAll('[role="tab"]')];
    const select = (t) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        el.querySelector(`#${x.getAttribute('aria-controls')}`).hidden = !on;
      });
      t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const n = tabs.length;
        const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        select(tabs[to]);
      });
    });
  },
});

// ------------------------------------------------------------------ rich content
/**
 * <wl-pdp-content layout="alternate|stack|cards" copy="pdpContent">
 *   alternate: ảnh + chữ xen kẽ trái phải (mặc định)
 *   stack    : ảnh rộng trên, chữ dưới, cột hẹp – kiểu bài viết
 *   cards    : các khối thành thẻ 3 cột
 */
define('wl-pdp-content', {
  render(data, el) {
    const blocks = get(data, 'pdp.blocks', []);
    if (!blocks.length) return '';
    const layout = el.attr('layout', 'alternate');
    const rows = blocks.map((b, i) => `
      <article class="rich__item${layout === 'alternate' && i % 2 ? ' rich__item--flip' : ''}">
        <div class="rich__media" data-reveal="clip"><img src="${esc(b.image)}" alt="" loading="lazy"${layout === 'cards' ? '' : ' data-parallax="-0.06"'}></div>
        <div class="rich__body" data-reveal>
          <h3>${esc(b.title)}</h3>
          <p>${esc(b.text)}</p>
        </div>
      </article>`).join('');
    return `
      <section class="sec">
        <div class="container">
          ${sectionHead(data, el, 'pdpContent')}
          <div class="rich rich--${esc(layout)}">${rows}</div>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ sticky buy bar
/** <wl-sticky-buy> — hiện khi nút mua trong <wl-product-detail> đã cuộn khuất. Thay cho <wl-sticky-cta> trên PDP. */
define('wl-sticky-buy', {
  render(data) {
    const p = currentItem(data);
    if (!p) return '';
    return `
      <div class="sticky-buy" aria-hidden="true">
        <div class="container sticky-buy__bar">
          <img class="sticky-buy__img" src="${esc(p.image)}" alt="">
          <p class="sticky-buy__name"><strong>${esc(p.name)}</strong><span>${esc(p.price)}</span></p>
          <a class="btn" href="${buyHref(p)}" tabindex="-1">${esc(get(data, 'pdp.buyLabel') || get(data, 'cta.text'))}</a>
        </div>
      </div>`;
  },
  mount(el) {
    const bar = el.querySelector('.sticky-buy');
    const anchor = document.querySelector('[data-buy-anchor]');
    if (!bar || !anchor || !('IntersectionObserver' in window)) return;
    el._io = new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting && e.boundingClientRect.top < 0;   // đã cuộn qua, không phải chưa tới
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', String(!show));
      bar.querySelector('a').tabIndex = show ? 0 : -1;
    });
    el._io.observe(anchor);
  },
  unmount(el) { if (el._io) el._io.disconnect(); },
});
