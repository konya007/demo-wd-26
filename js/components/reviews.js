/**
 * <wl-reviews item="" layout="split|stack|grid|rail" limit="6" filter>
 * Đánh giá có chấm sao từ data.reviews [{itemId, name, rating, date, title, text, verified}].
 *
 *   item         : không có → mọi đánh giá của thương hiệu (kèm tên sản phẩm)
 *                  item=""  → sản phẩm đang xem (?id=) – dùng trên PDP
 *                  item="landing" → sản phẩm của chiến dịch (data.landing.itemId)
 *                  item="<id>" → một sản phẩm cụ thể
 *   layout split : tóm tắt điểm dính bên trái, danh sách bên phải (mặc định)
 *          stack : tóm tắt nằm ngang phía trên, danh sách một cột
 *          grid  : tóm tắt phía trên, thẻ đánh giá 3 cột
 *          rail  : dãy thẻ vuốt ngang, không có biểu đồ
 *   filter       : thêm nút lọc theo số sao
 * Chữ giao diện: data.sections.reviews {title, text, basedOn, verified, all, empty, about}.
 */
import { sectionHead } from './sections.js';
import { currentItem } from './product-detail.js';
import { stars, avatar, fmtDate, fmtRating } from './ui.js';

const { esc, get, define } = window.WL;

function targetId(data, el) {
  if (!el.hasAttribute('item')) return null;
  const v = el.getAttribute('item');
  if (v === 'landing') return get(data, 'landing.itemId', null);
  if (v) return v;
  const p = currentItem(data);
  return p ? p.id : null;
}

function reviewCard(r, U, itemName, i) {
  return `
    <li class="review" data-reveal style="--d:${(i % 3) * 0.06}s" data-rating="${Math.round(r.rating)}">
      <div class="review__head">
        ${avatar(r.name)}
        <p class="review__who"><strong>${esc(r.name)}</strong>${r.verified ? `<span class="tag">${esc(U.verified)}</span>` : ''}</p>
      </div>
      <p class="review__meta">${stars(r.rating, 'stars--sm')}<time datetime="${esc(r.date)}">${fmtDate(r.date)}</time></p>
      ${r.title ? `<h3 class="review__title">${esc(r.title)}</h3>` : ''}
      <p class="review__text">${esc(r.text)}</p>
      ${itemName ? `<p class="review__item">${esc(U.about)}: <a href="product.html?id=${encodeURIComponent(r.itemId)}">${esc(itemName)}</a></p>` : ''}
    </li>`;
}

define('wl-reviews', {
  render(data, el) {
    const U = get(data, 'sections.reviews', {});
    const id = targetId(data, el);
    const names = Object.fromEntries((data.items || []).map((it) => [it.id, it.name]));
    const all = (data.reviews || []).filter((r) => !id || r.itemId === id)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!all.length && !id) return '';

    const layout = el.attr('layout', 'split');
    const list = all.slice(0, el.num('limit', 99));
    const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
    const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: all.filter((r) => Math.round(r.rating) === n).length }));

    const summary = layout === 'rail' || !all.length ? '' : `
      <div class="reviews__summary" data-reveal>
        <p class="reviews__avg"><b>${fmtRating(avg)}</b>${stars(avg)}<span>${esc(String(U.basedOn || '{n}').replace('{n}', all.length))}</span></p>
        <ul class="reviews__dist">
          ${dist.map((d) => `<li><span>${d.n}★</span><span class="reviews__bar"><i style="width:${all.length ? (d.c / all.length) * 100 : 0}%"></i></span><span>${d.c}</span></li>`).join('')}
        </ul>
        ${el.hasAttribute('filter') ? `
          <div class="chips" role="group">
            <button type="button" class="chip" aria-pressed="true" data-star="">${esc(U.all)}</button>
            ${dist.filter((d) => d.c).map((d) => `<button type="button" class="chip" aria-pressed="false" data-star="${d.n}">${d.n}★</button>`).join('')}
          </div>` : ''}
      </div>`;

    return `
      <section class="sec" id="danh-gia">
        <div class="container reviews reviews--${esc(layout)}">
          <div class="reviews__aside">
            ${sectionHead(data, el, 'reviews')}
            ${summary}
          </div>
          ${all.length
            ? `<ul class="reviews__list" data-list>${list.map((r, i) => reviewCard(r, U, id ? '' : names[r.itemId], i)).join('')}</ul>`
            : `<p class="empty">${esc(U.empty)}</p>`}
        </div>
      </section>`;
  },
  mount(el) {
    const chips = [...el.querySelectorAll('[data-star]')];
    const cards = [...el.querySelectorAll('[data-list] > li')];
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      cards.forEach((c) => { c.hidden = !!chip.dataset.star && c.dataset.rating !== chip.dataset.star; });
    }));
  },
});
