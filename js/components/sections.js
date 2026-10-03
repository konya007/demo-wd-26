/**
 * Các khối nội dung dùng lại trên nhiều trang.
 * Tiêu đề từng khối lấy từ data.sections[key]; tham số copy="key" để dùng bộ chữ khác.
 * Thuộc tính data-reveal / data-tilt / data-parallax được effects.js gắn chuyển động.
 */
import { ctaButton } from './layout.js';

const { esc, get, icon, define } = window.WL;

/** Tiêu đề + mô tả ngắn của một khối. */
export function sectionHead(data, el, key, extra) {
  const s = get(data, `sections.${el.attr('copy', key)}`, {});
  if (!s.title) return '';
  return `
    <div class="sec-head" data-reveal>
      <h2 class="sec-head__title">${esc(s.title)}</h2>
      ${s.text ? `<p class="sec-head__text">${esc(s.text)}</p>` : ''}
      ${extra || ''}
    </div>`;
}

function moreLink(data, key, href) {
  const label = get(data, `sections.${key}.more`);
  return label ? `<a class="link-under" href="${href}">${esc(label)}</a>` : '';
}

// ------------------------------------------------------------------ partners
/** <wl-partners> — dải tên đối tác chạy vô hạn (nhân đôi danh sách để nối liền). */
define('wl-partners', {
  render(data) {
    const names = (data.partners || []).map((p) => `<li>${esc(p.name)}</li>`).join('');
    return `
      <section class="partners" aria-label="${esc(get(data, 'sections.partners.title'))}">
        <p class="partners__title container">${esc(get(data, 'sections.partners.title'))}</p>
        <div class="marquee">
          <ul class="marquee__track">${names}</ul>
          <ul class="marquee__track" aria-hidden="true">${names}</ul>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ features
/**
 * <wl-features layout="story|rows" limit="4" more>
 *   story: ảnh dính một bên, đổi theo đoạn chữ đang đọc (trang chủ)
 *   rows : mỗi tính năng một hàng ảnh + chữ, xen kẽ trái phải
 */
define('wl-features', {
  render(data, el) {
    const layout = el.attr('layout', 'story');
    const list = (data.features || []).slice(0, el.num('limit', 99));
    const more = el.hasAttribute('more') ? moreLink(data, 'features', 'features.html') : '';

    if (layout === 'rows') {
      const rows = list.map((f, i) => `
        <article class="feat-row${i % 2 ? ' feat-row--flip' : ''}">
          <div class="feat-row__media" data-reveal="clip"><img src="${esc(f.image)}" alt="" loading="lazy" data-parallax="-0.08"></div>
          <div class="feat-row__body" data-reveal>
            <span class="feat-icon">${icon(f.icon)}</span>
            <h3>${esc(f.title)}</h3>
            <p>${esc(f.description)}</p>
          </div>
        </article>`).join('');
      return `<section class="sec"><div class="container feat-rows">${rows}</div></section>`;
    }

    const media = list.map((f, i) => `<img src="${esc(f.image)}" alt="" loading="lazy" class="${i ? '' : 'is-active'}" data-step-img="${i}">`).join('');
    const steps = list.map((f, i) => `
      <article class="story__step${i ? '' : ' is-active'}" data-step="${i}">
        <img class="story__inline" src="${esc(f.image)}" alt="" loading="lazy">
        <span class="feat-icon">${icon(f.icon)}</span>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.description)}</p>
      </article>`).join('');
    return `
      <section class="sec story">
        <div class="container">
          ${sectionHead(data, el, 'features', more)}
          <div class="story__grid">
            <div class="story__media"><div class="story__frame">${media}<span class="story__count"><b data-step-num>1</b> / ${list.length}</span></div></div>
            <div class="story__steps">${steps}</div>
          </div>
        </div>
      </section>`;
  },
  mount(el) {
    const steps = [...el.querySelectorAll('[data-step]')];
    if (!steps.length || !('IntersectionObserver' in window)) return;
    const imgs = [...el.querySelectorAll('[data-step-img]')];
    const num = el.querySelector('[data-step-num]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = e.target.dataset.step;
        steps.forEach((s) => s.classList.toggle('is-active', s === e.target));
        imgs.forEach((im) => im.classList.toggle('is-active', im.dataset.stepImg === i));
        if (num) num.textContent = Number(i) + 1;
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  },
});

// ------------------------------------------------------------------ products
export function productCard(p, eager) {
  return `
    <article class="pcard" data-tilt>
      <a href="product.html?id=${encodeURIComponent(p.id)}" class="pcard__link">
        <div class="pcard__media"><img src="${esc(p.image)}" alt="" loading="${eager ? 'eager' : 'lazy'}"><span class="pcard__glare" aria-hidden="true"></span></div>
        <div class="pcard__body">
          <p class="pcard__cat">${esc(p.category)}</p>
          <h3 class="pcard__title">${esc(p.name)}</h3>
          <p class="pcard__tag">${esc(p.tagline)}</p>
          <p class="pcard__price">${esc(p.price)}</p>
        </div>
      </a>
    </article>`;
}

/**
 * <wl-products layout="rail|grid" limit="6" featured filter related more>
 *   rail    : dãy thẻ trượt ngang khi người xem cuộn dọc (trang chủ)
 *   grid    : lưới; thêm "filter" để có ô tìm + lọc theo nhóm
 *   featured: chỉ lấy item featured
 *   related : cùng nhóm với item đang xem (?id=), bỏ item đó
 */
define('wl-products', {
  render(data, el) {
    let list = data.items || [];
    if (el.hasAttribute('featured')) list = list.filter((p) => p.featured);
    if (el.hasAttribute('related')) {
      const id = window.WL.params.get('id');
      const cur = list.find((p) => p.id === id) || list[0];
      if (!cur) return '';
      list = list.filter((p) => p.id !== cur.id)
        .sort((a, b) => (b.category === cur.category) - (a.category === cur.category));
    }
    list = list.slice(0, el.num('limit', 99));

    const layout = el.attr('layout', 'grid');
    const more = el.hasAttribute('more') ? moreLink(data, 'products', 'products.html') : '';
    const head = sectionHead(data, el, el.hasAttribute('related') ? 'related' : 'products', more);

    if (layout === 'rail') {
      return `
        <section class="sec rail" data-rail>
          <div class="container">${head}</div>
          <div class="rail__viewport">
            <div class="rail__track" data-rail-track>
              ${list.map((p) => productCard(p, true)).join('')}
              <a class="rail__end" href="products.html">${esc(get(data, 'sections.products.more', ''))}${icon('arrow-right')}</a>
            </div>
          </div>
        </section>`;
    }

    const labels = data.catalog || {};
    const cats = [...new Set(list.map((p) => p.category))];
    const filter = el.hasAttribute('filter') ? `
      <div class="filters" data-reveal>
        <label class="search">
          ${icon('search')}
          <span class="sr-only">${esc(labels.search)}</span>
          <input type="search" placeholder="${esc(labels.search)}" data-search>
        </label>
        <div class="chips" role="group">
          <button type="button" class="chip" aria-pressed="true" data-cat="">${esc(labels.all)}</button>
          ${cats.map((c) => `<button type="button" class="chip" aria-pressed="false" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
        </div>
      </div>` : '';

    return `
      <section class="sec${el.hasAttribute('filter') ? ' sec--tight-top' : ''}">
        <div class="container">
          ${el.hasAttribute('filter') ? '' : head}
          ${filter}
          <div class="pgrid" data-grid>
            ${list.map((p, i) => `<div data-reveal style="--d:${(i % 3) * 0.08}s" data-cat="${esc(p.category)}" data-text="${esc((p.name + ' ' + p.tagline + ' ' + p.category + ' ' + (p.tags || []).join(' ')).toLowerCase())}">${productCard(p)}</div>`).join('')}
          </div>
          <p class="empty" hidden data-empty>${esc(labels.empty)}</p>
        </div>
      </section>`;
  },
  mount(el) {
    const search = el.querySelector('[data-search]');
    if (!search) return;
    const chips = [...el.querySelectorAll('.chip')];
    const items = [...el.querySelectorAll('[data-grid] > div')];
    const empty = el.querySelector('[data-empty]');
    let cat = '';

    const apply = () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((it) => {
        const ok = (!cat || it.dataset.cat === cat) && (!q || it.dataset.text.includes(q));
        it.hidden = !ok;
        shown += ok;
      });
      empty.hidden = shown > 0;
    };
    search.addEventListener('input', apply);
    chips.forEach((chip) => chip.addEventListener('click', () => {
      cat = chip.dataset.cat;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      apply();
    }));
  },
});

// ------------------------------------------------------------------ process
/** <wl-process> — các bước, đánh số vì đây là một trình tự thật. Đường nối chạy theo nhịp cuộn. */
define('wl-process', {
  render(data, el) {
    const steps = (data.process || []).map((s, i) => `
      <li class="step" data-reveal style="--d:${i * 0.1}s">
        <span class="step__num">${i + 1}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
      </li>`).join('');
    return `
      <section class="sec sec--surface">
        <div class="container">
          ${sectionHead(data, el, 'process')}
          <ol class="steps" data-steps><span class="steps__line" aria-hidden="true"><span data-line></span></span>${steps}</ol>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ testimonials
/** <wl-testimonials> — một lời chứng thực lớn, chọn người bằng các nút bên dưới. */
define('wl-testimonials', {
  render(data, el) {
    const list = data.testimonials || [];
    if (!list.length) return '';
    const quotes = list.map((t, i) => `
      <blockquote class="quote" ${i ? 'hidden' : ''} data-quote="${i}">
        <p>${esc(t.quote)}</p>
      </blockquote>`).join('');
    const people = list.map((t, i) => `
      <button type="button" class="person" aria-pressed="${i === 0}" data-person="${i}">
        <span class="person__mono" aria-hidden="true">${esc((t.name.split(' ').pop() || '?')[0])}</span>
        <span><strong>${esc(t.name)}</strong><small>${esc(t.role)}</small></span>
      </button>`).join('');
    return `
      <section class="sec">
        <div class="container testi">
          ${sectionHead(data, el, 'testimonials')}
          <div class="testi__quotes" data-reveal>${quotes}</div>
          <div class="testi__people" data-reveal>${people}</div>
        </div>
      </section>`;
  },
  mount(el) {
    const people = [...el.querySelectorAll('[data-person]')];
    const quotes = [...el.querySelectorAll('[data-quote]')];
    let i = 0;
    const show = (n) => {
      i = n;
      people.forEach((b, k) => b.setAttribute('aria-pressed', String(k === n)));
      quotes.forEach((q, k) => { q.hidden = k !== n; });
    };
    people.forEach((btn, n) => btn.addEventListener('click', () => { show(n); clearInterval(el._timer); }));
    // tự chuyển mỗi 7 giây cho tới khi người xem tự chọn
    clearInterval(el._timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el._timer = setInterval(() => show((i + 1) % people.length), 7000);
    }
  },
});

// ------------------------------------------------------------------ faq
/** <wl-faq limit="4" source="landing.faq" copy="landingFaq"> — source: đường dẫn tới mảng {q, a}, mặc định "faq". */
define('wl-faq', {
  render(data, el) {
    const list = get(data, el.attr('source', 'faq'), []);
    if (!list.length) return '';
    const items = list.slice(0, el.num('limit', 99)).map((f, i) => `
      <details class="faq__item"${i === 0 ? ' open' : ''}>
        <summary>${esc(f.q)}${icon('plus', 'faq__icon')}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('');
    return `
      <section class="sec">
        <div class="container faq">
          ${sectionHead(data, el, 'faq')}
          <div class="faq__list" data-reveal>${items}</div>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ cta band
/** <wl-cta-band> — khối kêu gọi cuối trang; khi cuộn tới nó nở từ thẻ bo góc ra toàn màn hình. */
define('wl-cta-band', {
  render(data, el) {
    const s = get(data, `sections.${el.attr('copy', 'ctaBand')}`, {});
    return `
      <section class="cta-band" data-expand>
        <div class="cta-band__bg" aria-hidden="true"><span></span><span></span></div>
        <div class="container cta-band__inner">
          <h2>${esc(s.title)}</h2>
          <div class="cta-band__side">
            ${s.text ? `<p>${esc(s.text)}</p>` : ''}
            ${ctaButton(data, 'btn--inverse btn--lg')}
          </div>
        </div>
      </section>`;
  },
});
