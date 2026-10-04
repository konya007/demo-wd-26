# Atoms (small components)

An atom is a **CSS class + an HTML fragment**, usually produced by a helper function (`ui.js`), not a `WL.define`. Create a `<wl-*>` tag only when it has its own logic (countdown, timed state).

Every clickable atom: touch target ≥ 44×44px, `:hover`, `:focus-visible` (shared in `base.css`), state readable by screen readers.

## Button

```html
<a class="btn btn--lg" href="contact.html">Đặt trước</a>
<button class="btn btn--ghost" type="button">Chọn lại</button>
```

| Variant | Use |
|---|---|
| `.btn` | primary action, **one** per visible area |
| `.btn--ghost` | secondary action next to the primary |
| `.btn--inverse` | on a `--c-primary` background (CTA band) |
| `.btn--sm` / `.btn--lg` / `.btn--block` | size / full width |
| `.link-under` | tertiary action, light navigation |

Going to another page → `<a>`; acting in place → `<button type="button">`. Label = verb + outcome ("Giữ chỗ cho nhóm"), from JSON (`cta.text`, `plans[].button`, `pdp.buyLabel`). Shared CTA: `ctaButton(data, 'btn--lg')`.

A new variant goes into `base.css` next to the existing ones:
```css
.btn--soft { background: var(--c-primary-soft); color: var(--c-primary); border-color: transparent; }
.btn--soft:hover { background: color-mix(in srgb, var(--c-primary) 20%, var(--c-bg)); }
```

## Icon button

```html
<button class="icon-btn" type="button" aria-label="Đóng">${icon('x')}</button>
```
`aria-label` is mandatory because there is no text. `icon()` already marks the icon `aria-hidden`.

## Icon

`icon('arrow-right', 'extra-class')` → Lucide 0.460 (names at lucide.dev). Default size `.ico` 20px; resize from the block CSS (`.hl__icon .ico { width: 24px }`). Icon in a coloured square: `.feat-icon` / `.hl__icon` (48px, `--c-primary-soft`).

Not every name exists in 0.460 (e.g. `calendar-sync` does not). After adding icon names to JSON, check the page for leftover `<i data-lucide>` elements: those are unknown icons.

## Tag / badge

```html
<span class="tag">Tour mới</span>
<span class="tag tag--solid">Ra mắt</span>
```
Short (1–3 words), not clickable. Clickable filters are `.chip`.

## Chip (filter, single choice)

```html
<div class="chips" role="group">
  <button type="button" class="chip" aria-pressed="true" data-cat="">Tất cả</button>
  <button type="button" class="chip" aria-pressed="false" data-cat="Pro">Pro</button>
</div>
```
State lives in `aria-pressed` and CSS reads `[aria-pressed="true"]`: one source of truth for eyes and screen readers.

## Avatar: `avatar(name, size, image)` in `ui.js`

```js
import { avatar } from './ui.js';
avatar('Lê Minh Châu');            // <span class="avatar avatar--md" aria-hidden="true">C</span>
avatar('Lê Minh Châu', 'lg', url); // <img class="avatar avatar--lg" …>
```
- Vietnamese names: the letter comes from the **given name (last word)**, not the family name.
- Sizes `sm` 32px, `md` 44px, `lg` 64px.
- The person's name is always written next to the avatar, so the avatar is decorative (`alt=""` / `aria-hidden`).
- Overlapping group: `.avatar + .avatar { margin-left: -10px; box-shadow: 0 0 0 2px var(--c-bg); }`.

## Stars: `stars(rating, cls)` in `ui.js`

```js
stars(4.5)               // <span class="stars" role="img" aria-label="4,5 / 5" style="--rating:4.5"></span>
stars(r.rating, 'stars--sm')
```
Five `★` characters in `::before`, painted with a gradient that stops at `--rating / 5 * 100%`. One element, any fraction, colour from `--c-accent`/`--c-border`, so it follows every theme and `tone`. Use `fmtRating(4.666)` → `"4,7"` for the number next to it.

## Field (form input)

```html
<div class="field">
  <label for="f-phone">Số điện thoại</label>
  <input id="f-phone" name="phone" type="tel" autocomplete="tel" required pattern="[0-9+ ]{9,15}">
  <p class="field__err">Số điện thoại gồm 9 đến 15 chữ số.</p>
</div>
```
`label` always visible (a placeholder is not a label). Error: add `.is-invalid` on `.field` and `aria-invalid="true"` on the input; the message says how to fix it. Inline forms with one field (newsletter) may use a `.sr-only` label.

## Countdown: an atom with logic → `WL.define`

`js/components/landing.js` → `<wl-countdown source="landing" size="sm|lg">`. Use it as the model for any atom with a timer:

```js
define('wl-countdown', {
  render(data, el) {
    const src = get(data, el.attr('source', 'landing'), {});
    if (!src.deadline) return '';
    // … <ol class="countdown__units" role="timer"> each cell <b data-unit="i">
  },
  mount(el, data) {
    el._timer = setInterval(() => { /* update textContent of [data-unit] */ }, 1000);
  },
  unmount(el) { clearInterval(el._timer); },   // required
});
```
Lessons: `source` makes it reusable with other data; it updates only `textContent` every second (no re-render); when time is up it shows `countdown.ended` instead of "00:00:00:00".
