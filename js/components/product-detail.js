/**
 * <wl-product-detail> — chi tiết một sản phẩm / tour, chọn theo product.html?id=...
 * Không thấy id (ví dụ vừa đổi thương hiệu) thì hiện item nổi bật đầu tiên.
 */
import { splitWords } from './hero.js';

const { esc, get, icon, define } = window.WL;

define('wl-product-detail', {
  render(data) {
    const id = window.WL.params.get('id');
    const list = data.items || [];
    const p = list.find((x) => x.id === id) || list.find((x) => x.featured) || list[0];
    if (!p) return '';
    const L = get(data, 'pages.product', {});
    document.title = `${p.name} | ${get(data, 'organization.shortName', '')}`;

    const specs = (p.specs || []).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('');
    return `
      <article class="detail">
        <div class="container detail__grid">
          <div class="detail__media" data-tilt-stage>
            <div class="detail__stage"><img src="${esc(p.image)}" alt="${esc(p.name)}"></div>
          </div>
          <div class="detail__info">
            <a class="back" href="products.html">${icon('arrow-left')}${esc(L.back)}</a>
            <p class="detail__cat">${esc(L.category)}: ${esc(p.category)}</p>
            <h1 class="detail__title" aria-label="${esc(p.name)}"><span aria-hidden="true">${splitWords(p.name)}</span></h1>
            <p class="detail__tag">${esc(p.tagline)}</p>
            <p class="detail__price"><span>${esc(L.price)}</span>${esc(p.price)}</p>
            <p class="detail__desc">${esc(p.description)}</p>
            <div class="detail__actions">
              <a class="btn btn--lg" href="contact.html?item=${encodeURIComponent(p.id)}#lien-he">${esc(get(data, 'cta.text'))}</a>
              ${get(data, 'cta.note') ? `<span class="detail__note">${esc(data.cta.note)}</span>` : ''}
            </div>
            ${specs ? `<h2 class="detail__h">${esc(L.specs)}</h2><dl class="facts">${specs}</dl>` : ''}
          </div>
        </div>
      </article>`;
  },
});
