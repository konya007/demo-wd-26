/**
 * Khối nội dung dùng chung cho nhiều trang.
 *
 *   <wl-compare limit="4" featured>                bảng so sánh thông số các item
 *   <wl-gallery source="features" layout="masonry|grid|strip" limit="6">  lưới ảnh có chú thích
 *   <wl-newsletter layout="inline|card|split">     đăng ký nhận tin (không backend, chỉ kiểm tra email)
 */
import { sectionHead } from './sections.js';

const { esc, get, icon, define } = window.WL;

// ------------------------------------------------------------------ compare
/**
 * <wl-compare limit="4" featured ids="a,b,c">
 * Hàng = hợp các nhãn specs của những item được chọn, theo thứ tự xuất hiện. Thiếu giá trị → "—".
 * Cột đầu dính khi cuộn ngang trên điện thoại.
 */
define('wl-compare', {
  render(data, el) {
    let list = data.items || [];
    const ids = el.attr('ids', '').split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length) list = ids.map((id) => list.find((it) => it.id === id)).filter(Boolean);
    else if (el.hasAttribute('featured')) list = list.filter((it) => it.featured);
    list = list.slice(0, el.num('limit', 4));
    if (list.length < 2) return '';

    const labels = [...new Set(list.flatMap((it) => (it.specs || []).map((s) => s.label)))];
    const val = (it, label) => ((it.specs || []).find((s) => s.label === label) || {}).value;
    const L = get(data, 'pages.product', {});
    const S = get(data, 'sections.compare', {});

    return `
      <section class="sec">
        <div class="container">
          ${sectionHead(data, el, 'compare')}
          <div class="compare" data-reveal tabindex="0" role="region" aria-label="${esc(S.title)}">
            <table class="compare__table">
              <thead>
                <tr>
                  <th scope="col"><span class="sr-only">${esc(S.feature)}</span></th>
                  ${list.map((it) => `
                    <th scope="col">
                      <a class="compare__item" href="product.html?id=${encodeURIComponent(it.id)}">
                        <img src="${esc(it.image)}" alt="" loading="lazy">
                        <strong>${esc(it.name)}</strong>
                      </a>
                    </th>`).join('')}
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">${esc(L.price)}</th>${list.map((it) => `<td class="compare__price">${esc(it.price)}</td>`).join('')}</tr>
                <tr><th scope="row">${esc(L.category)}</th>${list.map((it) => `<td>${esc(it.category)}</td>`).join('')}</tr>
                ${labels.map((lb) => `<tr><th scope="row">${esc(lb)}</th>${list.map((it) => `<td>${esc(val(it, lb) || '—')}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ gallery
/**
 * <wl-gallery source="features" layout="masonry|grid|strip" limit="6" copy="gallery">
 * source: đường dẫn tới mảng bất kỳ có trường image (+ title làm chú thích): features, items, pdp.blocks…
 *   masonry: ô cao thấp xen kẽ (mặc định)   grid: ô vuông đều   strip: một hàng vuốt ngang
 */
define('wl-gallery', {
  render(data, el) {
    const list = get(data, el.attr('source', 'features'), []).filter((x) => x && x.image).slice(0, el.num('limit', 6));
    if (!list.length) return '';
    const layout = el.attr('layout', 'masonry');
    const figs = list.map((x, i) => `
      <figure class="gal__item" data-reveal style="--d:${(i % 3) * 0.08}s">
        <img src="${esc(x.image)}" alt="" loading="lazy">
        ${x.title || x.name ? `<figcaption>${esc(x.title || x.name)}</figcaption>` : ''}
      </figure>`).join('');
    return `
      <section class="sec">
        <div class="container">${sectionHead(data, el, 'gallery')}</div>
        <div class="container${layout === 'strip' ? ' gal-wrap--strip' : ''}"><div class="gal gal--${esc(layout)}">${figs}</div></div>
      </section>`;
  },
});

// ------------------------------------------------------------------ newsletter
/**
 * <wl-newsletter layout="inline|card|split" copy="newsletter">
 *   inline: tiêu đề trên, ô email + nút cùng hàng (mặc định)
 *   card  : thẻ nền màu thương hiệu nằm trong khung
 *   split : chữ trái, form phải
 */
define('wl-newsletter', {
  render(data, el) {
    const n = get(data, `sections.${el.attr('copy', 'newsletter')}`);
    if (!n) return '';
    const layout = el.attr('layout', 'inline');
    return `
      <section class="sec">
        <div class="container">
          <div class="news news--${esc(layout)}" data-reveal>
            <div class="news__copy">
              <h2 class="news__title">${esc(n.title)}</h2>
              ${n.text ? `<p class="news__text">${esc(n.text)}</p>` : ''}
            </div>
            <form class="news__form" novalidate>
              <label class="sr-only" for="news-email">${esc(n.placeholder)}</label>
              <input id="news-email" type="email" name="email" autocomplete="email" required placeholder="${esc(n.placeholder)}">
              <button class="btn" type="submit">${esc(n.submit)}</button>
              ${n.note ? `<p class="news__note">${esc(n.note)}</p>` : ''}
              <p class="news__ok" role="status" hidden>${icon('circle-check')}<span>${esc(n.success)}</span></p>
            </form>
          </div>
        </div>
      </section>`;
  },
  mount(el) {
    const form = el.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = form.email.checkValidity();
      form.email.setAttribute('aria-invalid', String(!ok));
      if (!ok) { form.email.focus(); return; }
      form.reset();
      form.querySelector('.news__ok').hidden = false;
    });
  },
});
