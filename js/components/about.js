/**
 * Khối cho trang Giới thiệu: sứ mệnh, con số, ghi nhận.
 */
import { sectionHead } from './sections.js';

const { esc, get, define } = window.WL;

/** <wl-mission> — sứ mệnh, tầm nhìn và giá trị cốt lõi. */
define('wl-mission', {
  render(data, el) {
    const m = data.mission || {};
    const values = (m.values || []).map((v) => `
      <li class="value" data-reveal><h3>${esc(v.title)}</h3><p>${esc(v.description)}</p></li>`).join('');
    return `
      <section class="sec">
        <div class="container mission">
          ${sectionHead(data, el, 'mission')}
          <div class="mission__body" data-reveal>
            <p class="mission__lead">${esc(m.description)}</p>
            ${m.vision ? `<p class="mission__vision">${esc(m.vision)}</p>` : ''}
          </div>
          <ul class="values">${values}</ul>
        </div>
      </section>`;
  },
});

/** <wl-stats> — các con số trong hero.stats, cộng năm thành lập. */
define('wl-stats', {
  render(data, el) {
    const stats = (get(data, 'hero.stats', [])).map((s) => `
      <li><strong data-count="${esc(s.value)}">${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join('');
    return `
      <section class="sec sec--surface">
        <div class="container">
          ${sectionHead(data, el, 'stats')}
          <ul class="stats" data-reveal>${stats}</ul>
        </div>
      </section>`;
  },
});

/** <wl-achievements> — giải thưởng / chứng nhận. */
define('wl-achievements', {
  render(data, el) {
    const items = (data.achievements || []).map((a) => `
      <li class="award" data-reveal>
        <strong class="award__value">${esc(a.value)}</strong>
        <div><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></div>
      </li>`).join('');
    return `
      <section class="sec">
        <div class="container awards">
          ${sectionHead(data, el, 'achievements')}
          <ul class="awards__list">${items}</ul>
        </div>
      </section>`;
  },
});
