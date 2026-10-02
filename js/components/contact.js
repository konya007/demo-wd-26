/**
 * <wl-contact> — thông tin liên hệ + biểu mẫu. Không có backend:
 * biểu mẫu kiểm tra dữ liệu rồi hiện thông báo thành công lấy từ data.sections.contact.success.
 *
 * Điền sẵn (để "tự liên hệ"):
 *   - contact.html?item=<id>            → chọn sẵn sản phẩm
 *   - sessionStorage 'wl-prefill'        → trợ lý AI ở trang khác gửi sang {itemId, message}
 *   - sự kiện 'wl:prefill' trên document → trợ lý AI ở cùng trang
 */
import { sectionHead } from './sections.js';

const { esc, get, icon, define } = window.WL;
const PREFILL_KEY = 'wl-prefill';

export function sendPrefill(detail) {
  try { sessionStorage.setItem(PREFILL_KEY, JSON.stringify(detail)); } catch (e) { /* bỏ qua */ }
  if (document.querySelector('wl-contact')) {
    document.dispatchEvent(new CustomEvent('wl:prefill', { detail }));
  } else {
    location.href = 'contact.html#lien-he';
  }
}

define('wl-contact', {
  render(data, el) {
    const c = data.contact || {};
    const s = get(data, 'sections.contact', {});
    const options = (data.items || []).map((it) => `<option value="${esc(it.id)}">${esc(it.name)}</option>`).join('');
    const row = (ic, html) => `<li>${icon(ic)}<span>${html}</span></li>`;
    return `
      <section class="sec" id="lien-he">
        <div class="container contact">
          <div class="contact__info">
            ${sectionHead(data, el, 'contact')}
            <ul class="contact__list" data-reveal>
              ${row('map-pin', esc(c.address))}
              ${row('mail', `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`)}
              ${row('phone', `<a href="tel:${esc((c.phone || '').replace(/\s/g, ''))}">${esc(c.phone)}</a>`)}
              ${row('clock', esc(c.workingHours))}
            </ul>
          </div>
          <form class="form" novalidate data-reveal>
            <p class="form__filled field--full" role="status" hidden>${icon('sparkles')}<span>Trợ lý đã điền sẵn lựa chọn và lời nhắn. Bạn chỉ cần thêm tên và số điện thoại.</span></p>
            <div class="field">
              <label for="f-name">Họ và tên</label>
              <input id="f-name" name="name" autocomplete="name" required>
              <p class="field__err">Nhập họ và tên để chúng tôi biết cách xưng hô.</p>
            </div>
            <div class="field">
              <label for="f-phone">Số điện thoại</label>
              <input id="f-phone" name="phone" type="tel" autocomplete="tel" required pattern="[0-9+ ]{9,15}">
              <p class="field__err">Số điện thoại gồm 9 đến 15 chữ số.</p>
            </div>
            <div class="field">
              <label for="f-email">Email</label>
              <input id="f-email" name="email" type="email" autocomplete="email">
              <p class="field__err">Email chưa đúng định dạng, ví dụ ten@email.vn.</p>
            </div>
            <div class="field">
              <label for="f-topic">Bạn quan tâm</label>
              <select id="f-topic" name="topic">${options}</select>
            </div>
            <div class="field field--full">
              <label for="f-msg">Lời nhắn</label>
              <textarea id="f-msg" name="message" rows="4"></textarea>
            </div>
            <button class="btn btn--lg field--full" type="submit">${esc(s.submit || get(data, 'cta.text'))}</button>
            <p class="form__ok field--full" role="status" hidden>${icon('circle-check')}<span>${esc(s.success)}</span></p>
          </form>
        </div>
      </section>`;
  },
  mount(el) {
    const form = el.querySelector('form');
    const ok = form.querySelector('.form__ok');
    const filled = form.querySelector('.form__filled');

    const apply = (p) => {
      if (!p) return;
      if (p.itemId && form.topic.querySelector(`option[value="${CSS.escape(p.itemId)}"]`)) form.topic.value = p.itemId;
      if (p.message) form.message.value = p.message;
      if (p.message) filled.hidden = false;
      form.classList.add('is-flash');
      setTimeout(() => form.classList.remove('is-flash'), 1200);
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.name.focus({ preventScroll: true });
    };

    const item = window.WL.params.get('item');
    if (item) apply({ itemId: item });
    try {
      const saved = JSON.parse(sessionStorage.getItem(PREFILL_KEY) || 'null');
      if (saved) { sessionStorage.removeItem(PREFILL_KEY); apply(saved); }
    } catch (e) { /* bỏ qua */ }

    if (el._onPrefill) document.removeEventListener('wl:prefill', el._onPrefill);
    el._onPrefill = (e) => { sessionStorage.removeItem(PREFILL_KEY); apply(e.detail); };
    document.addEventListener('wl:prefill', el._onPrefill);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('input').forEach((input) => {
        const bad = !input.checkValidity();
        input.closest('.field').classList.toggle('is-invalid', bad);
        input.setAttribute('aria-invalid', String(bad));
        if (bad && valid) { input.focus(); valid = false; }
      });
      if (!valid) return;
      form.reset();
      filled.hidden = true;
      ok.hidden = false;
    });
  },
});
