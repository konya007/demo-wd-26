/**
 * Landing page chiến dịch: ra mắt sản phẩm, tour mới, bộ sưu tập mới…
 * Toàn bộ nội dung nằm trong data.landing của từng thương hiệu; landing-page.html chỉ xếp thẻ.
 *
 *   <wl-campaign-teaser>     thẻ giới thiệu chiến dịch trên trang chủ → landing-page.html
 *   <wl-countdown>           đồng hồ đếm ngược (thành phần nhỏ, dùng lại trong teaser và hero)
 *   <wl-landing-hero>        màn hình đầu của landing
 *   <wl-landing-highlights>  3–4 điểm nổi bật dạng bento
 *   <wl-landing-story>       ảnh + câu chuyện + danh sách điểm chính
 *   <wl-landing-agenda>      dòng thời gian: lịch ra mắt / lịch trình tour / liệu trình
 *   <wl-landing-offer>       các gói giá; bấm chọn → điền sẵn form liên hệ
 *
 * Mọi thẻ trả về '' khi thương hiệu chưa có data.landing, trang không vỡ.
 */
import { splitWords } from './hero.js';
import { sendPrefill } from './contact.js';

const { esc, get, icon, define } = window.WL;

/** Sản phẩm / tour mà chiến dịch đang quảng bá. */
function campaignItem(data) {
  const id = get(data, 'landing.itemId');
  return (data.items || []).find((it) => it.id === id) || null;
}

function contactHref(data) {
  const id = get(data, 'landing.itemId');
  return `contact.html${id ? `?item=${encodeURIComponent(id)}` : ''}#lien-he`;
}

// ------------------------------------------------------------------ countdown
const UNITS = ['ngày', 'giờ', 'phút', 'giây'];
const pad = (n) => String(n).padStart(2, '0');

function remaining(deadline) {
  const s = Math.max(0, Math.floor((new Date(deadline) - Date.now()) / 1000));
  return { done: s === 0, parts: [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60] };
}

/**
 * <wl-countdown source="landing" size="sm|lg">
 * Đọc {deadline, countdown: {label, ended, units?}} tại đường dẫn source.
 * Hết giờ thì thay bằng câu countdown.ended. unmount dọn setInterval.
 */
define('wl-countdown', {
  render(data, el) {
    const src = get(data, el.attr('source', 'landing'), {});
    if (!src.deadline) return '';
    const c = src.countdown || {};
    const units = c.units || UNITS;
    const { done, parts } = remaining(src.deadline);
    const date = new Date(src.deadline).toLocaleDateString('vi-VN');
    return `
      <div class="countdown countdown--${esc(el.attr('size', 'lg'))}">
        <p class="countdown__label">${esc(c.label)} <time datetime="${esc(src.deadline)}">(${esc(date)})</time></p>
        <ol class="countdown__units" role="timer" aria-label="${esc(c.label)}" ${done ? 'hidden' : ''}>
          ${parts.map((v, i) => `<li><b data-unit="${i}">${pad(v)}</b><span>${esc(units[i])}</span></li>`).join('')}
        </ol>
        <p class="countdown__ended" ${done ? '' : 'hidden'}>${esc(c.ended)}</p>
      </div>`;
  },
  mount(el, data) {
    const src = get(data, el.attr('source', 'landing'), {});
    const nums = [...el.querySelectorAll('[data-unit]')];
    if (!src.deadline || !nums.length) return;
    el._timer = setInterval(() => {
      const { done, parts } = remaining(src.deadline);
      nums.forEach((b, i) => { b.textContent = pad(parts[i]); });
      if (done) {
        clearInterval(el._timer);
        el.querySelector('.countdown__units').hidden = true;
        el.querySelector('.countdown__ended').hidden = false;
      }
    }, 1000);
  },
  unmount(el) { clearInterval(el._timer); },
});

// ------------------------------------------------------------------ teaser (trang chủ)
/** <wl-campaign-teaser> — thẻ lớn trên trang chủ, dẫn sang landing-page.html. */
define('wl-campaign-teaser', {
  render(data) {
    const l = data.landing;
    if (!l) return '';
    const t = l.teaser || {};
    return `
      <section class="sec sec--tight">
        <div class="container">
          <a class="teaser" href="landing-page.html" data-reveal>
            <div class="teaser__media"><img src="${esc(l.image)}" alt="" loading="lazy" data-parallax="-0.1"></div>
            <div class="teaser__body">
              <p class="teaser__kicker"><span class="tag">${esc(l.kind)}</span>${esc(t.eyebrow)}</p>
              <h2 class="teaser__title">${esc(t.title || l.title)}</h2>
              ${t.text ? `<p class="teaser__text">${esc(t.text)}</p>` : ''}
              <wl-countdown size="sm"></wl-countdown>
              <span class="teaser__go">${esc(t.button)}${icon('arrow-right')}</span>
            </div>
          </a>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ hero
/** <wl-landing-hero> — ảnh phủ màn hình, tiêu đề, đếm ngược, 2 hành động. */
define('wl-landing-hero', {
  render(data) {
    const l = data.landing;
    if (!l) return '';
    const item = campaignItem(data);
    return `
      <section class="lp-hero">
        <div class="lp-hero__bg" data-parallax="0.25"><img src="${esc(l.image)}" alt="" fetchpriority="high"></div>
        <div class="container lp-hero__grid">
          <div class="lp-hero__copy">
            <p class="lp-hero__badge"><span class="tag tag--solid">${esc(l.kind)}</span>${esc(l.badge)}</p>
            <h1 class="lp-hero__title" aria-label="${esc(l.title)}"><span aria-hidden="true">${splitWords(l.title)}</span></h1>
            <p class="lp-hero__lead">${esc(l.subtitle)}</p>
            <div class="lp-hero__actions">
              <a class="btn btn--lg" href="${contactHref(data)}">${esc(get(data, 'cta.text'))}</a>
              ${item && l.secondary ? `<a class="link-under" href="product.html?id=${encodeURIComponent(item.id)}">${esc(l.secondary)}</a>` : ''}
            </div>
          </div>
          <div class="lp-hero__timer"><wl-countdown></wl-countdown></div>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ highlights
/**
 * <wl-landing-highlights layout="bento|grid|list">
 *   bento: ô đầu to, nền màu thương hiệu (mặc định)   grid: các ô bằng nhau   list: hàng ngang icon + chữ
 */
define('wl-landing-highlights', {
  render(data, el) {
    const list = get(data, 'landing.highlights', []);
    if (!list.length) return '';
    const cards = list.map((h, i) => `
      <li class="hl${i === 0 ? ' hl--lead' : ''}" data-reveal style="--d:${i * 0.08}s">
        <span class="hl__icon">${icon(h.icon)}</span>
        <h3 class="hl__title">${esc(h.title)}</h3>
        <p class="hl__text">${esc(h.text)}</p>
      </li>`).join('');
    return `<section class="sec"><div class="container"><ul class="hl-grid hl-grid--${esc(el.attr('layout', 'bento'))}">${cards}</ul></div></section>`;
  },
});

// ------------------------------------------------------------------ story
/** <wl-landing-story> — ảnh lớn mở như rèm + câu chuyện + điểm chính có dấu tích. */
define('wl-landing-story', {
  render(data) {
    const s = get(data, 'landing.story');
    if (!s) return '';
    const points = (s.points || []).map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('');
    return `
      <section class="sec sec--surface">
        <div class="container lp-story">
          <div class="lp-story__media" data-reveal="clip"><img src="${esc(s.image)}" alt="" loading="lazy" data-parallax="-0.08"></div>
          <div class="lp-story__body" data-reveal>
            <h2 class="sec-head__title">${esc(s.title)}</h2>
            <p class="lp-story__text">${esc(s.text)}</p>
            ${points ? `<ul class="checklist">${points}</ul>` : ''}
          </div>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ agenda
/** <wl-landing-agenda> — dòng thời gian dọc; đường nối dài dần theo nhịp cuộn (effects.js: data-timeline). */
define('wl-landing-agenda', {
  render(data) {
    const a = get(data, 'landing.agenda');
    if (!a || !(a.steps || []).length) return '';
    const steps = a.steps.map((s, i) => `
      <li class="tl__item" data-reveal style="--d:${i * 0.06}s">
        <span class="tl__time">${esc(s.time)}</span>
        <span class="tl__dot" aria-hidden="true"></span>
        <div class="tl__body"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>
      </li>`).join('');
    return `
      <section class="sec">
        <div class="container lp-agenda">
          <div class="sec-head" data-reveal>
            <h2 class="sec-head__title">${esc(a.title)}</h2>
            ${a.text ? `<p class="sec-head__text">${esc(a.text)}</p>` : ''}
          </div>
          <ol class="tl" data-timeline><span class="tl__line" aria-hidden="true"><span data-line-y></span></span>${steps}</ol>
        </div>
      </section>`;
  },
});

// ------------------------------------------------------------------ offer
/** <wl-landing-offer> — các gói; gói featured nổi bật. Bấm chọn → sendPrefill sang form liên hệ. */
define('wl-landing-offer', {
  render(data) {
    const o = get(data, 'landing.offer');
    if (!o || !(o.plans || []).length) return '';
    const href = contactHref(data);
    const plans = o.plans.map((p, i) => `
      <li class="plan${p.featured ? ' plan--featured' : ''}" data-reveal style="--d:${i * 0.08}s">
        ${p.featured && o.featuredLabel ? `<span class="plan__flag">${esc(o.featuredLabel)}</span>` : ''}
        <h3 class="plan__name">${esc(p.name)}</h3>
        <p class="plan__price">${esc(p.price)}${p.was ? ` <s>${esc(p.was)}</s>` : ''}</p>
        ${p.note ? `<p class="plan__note">${esc(p.note)}</p>` : ''}
        <ul class="checklist checklist--sm">${(p.perks || []).map((k) => `<li>${icon('check')}<span>${esc(k)}</span></li>`).join('')}</ul>
        <a class="btn btn--block${p.featured ? '' : ' btn--ghost'}" href="${href}" data-plan="${i}">${esc(p.button || get(data, 'cta.text'))}</a>
      </li>`).join('');
    return `
      <section class="sec sec--surface" id="goi">
        <div class="container">
          <div class="sec-head" data-reveal>
            <h2 class="sec-head__title">${esc(o.title)}</h2>
            ${o.text ? `<p class="sec-head__text">${esc(o.text)}</p>` : ''}
          </div>
          <ul class="plans">${plans}</ul>
        </div>
      </section>`;
  },
  mount(el, data) {
    const l = data.landing || {};
    el.querySelectorAll('[data-plan]').forEach((btn) => btn.addEventListener('click', (e) => {
      const plan = l.offer.plans[Number(btn.dataset.plan)];
      const message = (l.offer.message || '{plan} — {campaign}')
        .replace('{plan}', plan.name)
        .replace('{campaign}', get(data, 'pages.landing.title', l.title));
      e.preventDefault();
      sendPrefill({ itemId: l.itemId, message });
    }));
  },
});
