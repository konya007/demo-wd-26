# Large sections and page composition

## Anatomy of a section

```html
<section class="sec [sec--surface]">           ← vertical padding var(--sec-y); tone/space act here
  <div class="container [my-block my-block--layout]">   ← centred frame; 2-column grid goes here
    <div class="sec-head" data-reveal>         ← sectionHead(data, el, 'myBlock')
      <h2 class="sec-head__title">…</h2>
      <p class="sec-head__text">…</p>
    </div>
    <ul class="my-block__list">…</ul>          ← main content
  </div>
</section>
```
- One `h2` per section. One `h1` per page (hero, page head, or product title).
- Alternate backgrounds: never two `--surface` sections in a row; heavy blocks (CTA) use `--c-primary`. Set this from HTML with `tone` rather than hard-coding `.sec--surface` in new components.
- Full-bleed sections (hero, rail, CTA): no `.container` on the outer level, put it inside.

## Common layouts

| Layout | CSS | Used by |
|---|---|---|
| Title left, content right | `grid-template-columns: 5fr 7fr; gap: 72px` (≥ 960px) | FAQ split, mission, awards, agenda, reviews split, process list |
| Image + text, alternating | `1.1fr .9fr`, `.x--flip .x__media { order: 2 }` | `feat-row`, `lp-story`, `rich--alternate` |
| Self-sizing card grid | `repeat(auto-fill, minmax(min(100%, 300px), 1fr))` | `pgrid`, `plans`, `tgrid`, `reviews--grid` |
| Bento (big first tile) | `1.4fr 1fr 1fr`, first tile `grid-row: span 2` | `hl-grid--bento` |
| Masonry | `grid-auto-rows` + `grid-auto-flow: dense` + some `span 2` | `gal--masonry` |
| Sticky image + scrolling text | `position: sticky` + IntersectionObserver | `story` (features) |
| Horizontal strip | `overflow-x: auto; scroll-snap-type: x mandatory` (+ GSAP pin on desktop for products) | `rail`, `reviews--rail`, `gal--strip` |
| Timeline | time / dot / content columns, connector `<span>` | `tl` |
| Comparison table | `<table>` in a scroll box, first column `position: sticky; left: 0` | `compare` |

## Quick recipes per block type

**Hero** (`<wl-hero>`, `<wl-landing-hero>`): eyebrow/badge → `h1` with `splitWords()` (word-by-word rise, `aria-label` holds the full sentence) → lead → primary button + secondary link → small note. Image `fetchpriority="high"`, **not** lazy.

**Feature / highlight grid**: 3–4 items, each icon + title ≤ 6 words + one sentence. Staggered reveal `style="--d:${i * 0.08}s"`.

**Product lists**: reuse `<wl-products layout="grid|rail" limit featured filter related>`; never rewrite the card, call `productCard(p)`.

**Process / timeline**: `<ol>` because order matters. Numbers or times.

**Pricing** (`<wl-landing-offer>`): 2–4 plans, one `featured` (primary border, flag, solid button; others `btn--ghost`). Old price in `<s>`. Buttons aligned at the bottom with `flex-direction: column` + perks `flex: 1`.

**FAQ**: native `<details>/<summary>`, no JS. First item open (all open in `cards`). `<wl-faq source copy limit layout>`.

**Testimonials**: `spotlight` = one large quote + person buttons (`aria-pressed`), auto-advance 7s, stops on click; `grid` = cards with avatar.

**Reviews**: see `pdp-reviews.md`.

**Comparison table** (`<wl-compare>`): rows are the union of spec labels across the chosen items; missing values show "—". Wrap the table in a focusable scroll region (`tabindex="0" role="region" aria-label`).

**Gallery** (`<wl-gallery source>`): any array with `image` and optional `title` caption.

**Newsletter** (`<wl-newsletter>`): one email field + button, inline validation, success via `role="status"`.

**Final CTA**: `<wl-cta-band copy layout>` one short sentence + one button. Always the last block of `<main>`.

## Composing a page = telling a journey

Home page today:
```
hero (message + action) → partners (who trusts us) → campaign-teaser (what is new)
→ features (why us) → products (which one) → process (how to get it)
→ testimonials + reviews rail (what others say) → advisor (still unsure? ask) → faq → cta-band
```
Product page:
```
product-detail (gallery, price, buy) → pdp-services (risk reducers) → pdp-tabs (details)
→ pdp-content (story with images) → reviews (proof) → related products → cta-band card → sticky-buy
```
Question for every section: what is the visitor thinking at this point, and does this section answer it? If not, drop it.

## Adding a page

1. Copy `_template.html`, change `<body data-page="page-name">`.
2. Add `pages.pageName: { title, heading, text, image? }` to every JSON.
3. Place `<wl-*>` tags in `<main>`, using `layout`/`tone`/`align` to vary rhythm.
4. Needs a menu entry → add it to `nav` in the JSON.
