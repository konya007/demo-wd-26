/**
 * <wl-advisor> — trợ lý AI chọn sản phẩm rồi tự điền form liên hệ.
 *
 * 1. Người xem chọn đáp án cho các câu hỏi trong data.assistant.questions.
 * 2. Có khóa API Claude → Claude đọc danh mục data.items và trả về JSON
 *    { itemId, alternativeId, reason, message } (ép đúng schema).
 *    Không có khóa / lỗi mạng → chấm điểm theo tags (options[].tags ∩ items[].tags).
 * 3. Bấm "Điền sẵn vào form liên hệ" → sendPrefill() chuyển sang <wl-contact>.
 *
 * Câu hỏi, nhãn, mẫu lời nhắn đều nằm trong JSON nên mỗi thương hiệu có trợ lý riêng.
 */
import { sectionHead } from './sections.js';
import { sendPrefill } from './contact.js';

const { esc, get, icon, define } = window.WL;
const KEY_STORE = 'wl-claude-key';
const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.131.0/+esm';
const MODEL = 'claude-opus-5-5';

function readKey() { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } }
function writeKey(k) { try { k ? localStorage.setItem(KEY_STORE, k) : localStorage.removeItem(KEY_STORE); } catch (e) { /* bỏ qua */ } }

// ------------------------------------------------------------------ gợi ý theo tiêu chí (không AI)
export function ruleRecommend(data, answers) {
  const wanted = answers.flatMap((a) => a.tags);
  const scored = (data.items || []).map((it) => ({
    it,
    score: (it.tags || []).filter((t) => wanted.includes(t)).length + (it.featured ? 0.1 : 0),
  })).sort((a, b) => b.score - a.score);
  const best = scored[0].it;
  const matched = answers.filter((a) => a.tags.some((t) => (best.tags || []).includes(t))).map((a) => a.label.toLowerCase());
  return {
    itemId: best.id,
    alternativeId: scored[1] ? scored[1].it.id : best.id,
    reason: matched.length
      ? `${best.name} hợp với nhu cầu ${matched.join(', ')} của bạn. ${best.tagline}`
      : `${best.name} là lựa chọn được nhiều người chọn nhất. ${best.tagline}`,
    message: fillTemplate(data, best, answers),
  };
}

function fillTemplate(data, item, answers, note) {
  const text = get(data, 'assistant.template', '{item}')
    .replace('{item}', item.name)
    .replace('{answers}', answers.map((a) => a.label.toLowerCase()).join(', '));
  return note ? `${text} Ghi chú: ${note}` : text;
}

// ------------------------------------------------------------------ gợi ý bằng Claude
async function claudeRecommend(data, answers, note, apiKey) {
  const { default: Anthropic } = await import(SDK_URL);
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const items = data.items || [];
  const ids = items.map((it) => it.id);
  const org = data.organization || {};

  const catalog = items.map(({ id, name, category, tagline, price, description, specs, tags }) =>
    ({ id, name, category, tagline, price, description, specs, tags }));

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'low',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            itemId: { type: 'string', enum: ids, description: 'Sản phẩm phù hợp nhất' },
            alternativeId: { type: 'string', enum: ids, description: 'Lựa chọn thứ hai, khác itemId' },
            reason: { type: 'string', description: 'Lý do, tối đa 2 câu, nói trực tiếp với khách' },
            message: { type: 'string', description: 'Lời nhắn khách gửi cho cửa hàng, ngôi thứ nhất, tối đa 60 từ' },
          },
          required: ['itemId', 'alternativeId', 'reason', 'message'],
          additionalProperties: false,
        },
      },
    },
    system: `Bạn là tư vấn viên của ${org.name} (${org.industry}). Chỉ gợi ý sản phẩm có trong danh mục được cung cấp. ` +
      'Viết tiếng Việt tự nhiên, ngắn gọn, không phóng đại, không hứa điều danh mục không ghi. ' +
      'Trường message là lời nhắn khách sẽ gửi qua form liên hệ: nêu sản phẩm, nhu cầu và một câu hỏi cụ thể cho cửa hàng.',
    messages: [{
      role: 'user',
      content: `Danh mục:\n${JSON.stringify(catalog)}\n\nCâu trả lời của khách:\n` +
        answers.map((a) => `- ${a.question} ${a.label}`).join('\n') +
        (note ? `\nKhách ghi thêm: ${note}` : ''),
    }],
  });

  if (response.stop_reason === 'refusal') throw new Error('refusal');
  const text = response.content.find((b) => b.type === 'text');
  if (!text) throw new Error('empty');
  const out = JSON.parse(text.text);
  if (!ids.includes(out.itemId)) throw new Error('unknown item');
  return out;
}

// ------------------------------------------------------------------ giao diện
function resultView(data, rec, mode, notice) {
  const A = data.assistant || {};
  const items = data.items || [];
  const it = items.find((x) => x.id === rec.itemId);
  const alt = items.find((x) => x.id === rec.alternativeId && x.id !== rec.itemId);
  return `
    <div class="adv-result" data-result>
      ${notice ? `<p class="adv-notice">${icon('info')}${esc(notice)}</p>` : ''}
      <span class="adv-badge adv-badge--${mode}">${icon(mode === 'ai' ? 'sparkles' : 'list-checks')}${esc(mode === 'ai' ? A.aiBadge : A.ruleBadge)}</span>
      <a class="adv-pick" href="product.html?id=${encodeURIComponent(it.id)}">
        <img src="${esc(it.image)}" alt="">
        <span>
          <small>${esc(it.category)}</small>
          <strong>${esc(it.name)}</strong>
          <em>${esc(it.price)}</em>
        </span>
      </a>
      <p class="adv-reason">${esc(rec.reason)}</p>
      ${alt ? `<p class="adv-alt">${esc(A.alsoLabel)}: <a href="product.html?id=${encodeURIComponent(alt.id)}">${esc(alt.name)}</a></p>` : ''}
      <label class="adv-msg">
        <span>Lời nhắn sẽ gửi</span>
        <textarea rows="4" data-msg>${esc(rec.message)}</textarea>
      </label>
      <div class="adv-actions">
        <button type="button" class="btn btn--lg" data-apply>${icon('send')}${esc(A.apply)}</button>
        <button type="button" class="link-under" data-again>${esc(A.again)}</button>
      </div>
    </div>`;
}

define('wl-advisor', {
  render(data, el) {
    const A = data.assistant;
    if (!A) return '';
    const qs = (A.questions || []).map((q, qi) => `
      <fieldset class="adv-q">
        <legend><span class="adv-q__n">${qi + 1}</span>${esc(q.label)}</legend>
        <div class="adv-opts">
          ${q.options.map((o, oi) => `
            <label class="adv-opt">
              <input type="radio" name="q-${esc(q.id)}" value="${oi}">
              <span>${esc(o.label)}</span>
            </label>`).join('')}
        </div>
      </fieldset>`).join('');
    const hasKey = !!readKey();

    return `
      <section class="sec advisor${el.hasAttribute('compact') ? ' advisor--compact' : ''}">
        <div class="container advisor__grid">
          <div class="advisor__intro">
            ${sectionHead(data, el, 'advisor')}
            <div class="advisor__orb" aria-hidden="true"><span></span><span></span><span></span>${icon('sparkles')}</div>
          </div>
          <div class="advisor__panel" data-reveal>
            <form class="adv-form" data-form novalidate>
              <p class="adv-title"><strong>${esc(A.title)}</strong><span>${esc(A.text)}</span></p>
              ${qs}
              <textarea class="adv-note" rows="2" placeholder="${esc(A.notePlaceholder)}" data-note></textarea>
              <details class="adv-key"${hasKey ? '' : ''}>
                <summary>${icon('key-round')}${esc(A.keyLabel)}<span class="adv-key__state">${hasKey ? 'Đã lưu' : 'Chưa có'}</span></summary>
                <div class="adv-key__body">
                  <input type="password" autocomplete="off" placeholder="sk-ant-..." value="${hasKey ? '••••••••' : ''}" data-key>
                  <button type="button" class="btn btn--ghost btn--sm" data-key-save>Lưu</button>
                  <button type="button" class="btn btn--ghost btn--sm" data-key-clear>Xoá</button>
                  <p>${esc(A.keyHelp)}</p>
                </div>
              </details>
              <p class="adv-error" hidden data-error>${esc(A.needAll)}</p>
              <button class="btn btn--lg adv-submit" type="submit">${icon('wand-sparkles')}<span>${esc(A.submit)}</span></button>
            </form>
            <div class="adv-out" data-out aria-live="polite"></div>
          </div>
        </div>
      </section>`;
  },
  mount(el, data) {
    const form = el.querySelector('[data-form]');
    if (!form) return;
    const out = el.querySelector('[data-out]');
    const err = el.querySelector('[data-error]');
    const A = data.assistant;
    const keyInput = el.querySelector('[data-key]');
    const keyState = el.querySelector('.adv-key__state');

    el.querySelector('[data-key-save]').addEventListener('click', () => {
      const v = keyInput.value.trim();
      if (v && !v.startsWith('•')) { writeKey(v); keyInput.value = '••••••••'; keyState.textContent = 'Đã lưu'; }
    });
    el.querySelector('[data-key-clear]').addEventListener('click', () => {
      writeKey(''); keyInput.value = ''; keyState.textContent = 'Chưa có';
    });

    form.addEventListener('change', () => { err.hidden = true; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const answers = [];
      for (const q of A.questions) {
        const picked = form.querySelector(`input[name="q-${CSS.escape(q.id)}"]:checked`);
        if (!picked) { err.hidden = false; return; }
        const o = q.options[Number(picked.value)];
        answers.push({ question: q.label, label: o.label, tags: o.tags });
      }
      const note = el.querySelector('[data-note]').value.trim();
      const apiKey = readKey();

      out.innerHTML = `<div class="adv-loading">${icon('loader-circle', 'spin')}<span>${esc(A.loading)}</span></div>`;
      el.classList.add('is-thinking');
      window.WL.refreshIcons();

      let rec; let mode = 'rule'; let notice = '';
      if (apiKey) {
        try { rec = await claudeRecommend(data, answers, note, apiKey); mode = 'ai'; }
        catch (ex) { console.warn('[advisor] Claude lỗi, dùng gợi ý theo tiêu chí:', ex); notice = A.error; }
      }
      if (!rec) {
        rec = ruleRecommend(data, answers);
        if (note) rec.message += ` Ghi chú: ${note}`;
      }

      el.classList.remove('is-thinking');
      form.hidden = true;
      out.innerHTML = resultView(data, rec, mode, notice);
      window.WL.refreshIcons();

      out.querySelector('[data-apply]').addEventListener('click', () => {
        sendPrefill({ itemId: rec.itemId, message: out.querySelector('[data-msg]').value });
      });
      out.querySelector('[data-again]').addEventListener('click', () => {
        out.innerHTML = '';
        form.hidden = false;
      });
    });
  },
});
