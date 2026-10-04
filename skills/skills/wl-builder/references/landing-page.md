# Campaign landing page

Each brand has **one** featured campaign: product launch, new tour, new collection, seasonal offer. The home page shows `<wl-campaign-teaser>`, which links to `landing-page.html`. The same HTML file serves every brand; content lives in `data.landing`.

## Building blocks

| Tag | Data | Job |
|---|---|---|
| `<wl-campaign-teaser>` (index.html) | `landing.teaser`, `image`, `kind`, `deadline` | big card: image + title + small countdown |
| `<wl-landing-hero>` | `kind`, `badge`, `title`, `subtitle`, `image`, `secondary`, `itemId` | full-screen image, primary button to the form (with `?item=`), secondary link to the product page |
| `<wl-countdown source size>` | `deadline`, `countdown.{label, ended, units?}` | countdown; shows `ended` when time is up |
| `<wl-landing-highlights layout>` | `highlights[]` | 4 reasons (`bento`, `grid`, `list`) |
| `<wl-landing-story>` | `story` | curtain-reveal image + paragraph + checklist |
| `<wl-landing-agenda>` | `agenda.steps[]` | timeline: launch dates, tour itinerary, treatment weeks |
| `<wl-landing-offer>` | `offer.plans[]`, `offer.message` | plans; click → `sendPrefill` fills the contact form |
| `<wl-reviews item="landing" layout="grid" limit="3">` | `reviews` of the campaign product | proof |
| `<wl-faq source="landing.faq" copy="landingFaq">` | `landing.faq`, `sections.landingFaq` | campaign-specific FAQ |
| `<wl-cta-band copy="landingCta">` | `sections.landingCta` | final call to action |

## Page journey

```
1. Hero        What is new? When? (the deadline gives a reason to act now)
2. Highlights  Why care? (4 reasons, scannable in 5 seconds)
3. Story       Can I believe it? (story + concrete evidence)
4. Agenda      How does it unfold? (dates / itinerary)
5. Offer       Which plan, what price?
6. Reviews     What did buyers say?
7. FAQ         Remove the last worries
8. CTA         Repeat the action
```

## Data shape

```json
"landing": {
  "kind": "Tour mới",
  "itemId": "bach-moc",
  "image": "assets-web-design/img/peak/i5.jpg",
  "badge": "Khởi hành 13/11/2026",
  "title": "…", "subtitle": "…",
  "deadline": "2026-11-13T05:00:00+07:00",
  "countdown": { "label": "Đoàn đầu khởi hành sau", "ended": "…" },
  "secondary": "Xem chi tiết cung đường",
  "teaser":     { "eyebrow": "…", "title": "…", "text": "…", "button": "…" },
  "highlights": [ { "icon": "sparkles", "title": "…", "text": "…" } ],
  "story":      { "title": "…", "text": "…", "image": "…", "points": ["…"] },
  "agenda":     { "title": "…", "text": "…", "steps": [ { "time": "Ngày 1", "title": "…", "text": "…" } ] },
  "offer":      { "title": "…", "text": "…", "featuredLabel": "…", "message": "… {plan} … {campaign}",
                  "plans": [ { "name": "…", "price": "…", "was": "", "note": "…", "perks": ["…"], "featured": true, "button": "…" } ] },
  "faq":        [ { "q": "…", "a": "…" } ]
}
```
Plus `sections.landingFaq`, `sections.landingCta`, `pages.landing` (tab title).

## Writing a new campaign for a brand

1. Choose **one** item from `items` as the centre → `itemId`.
2. `kind`: "Ra mắt sản phẩm", "Tour mới", "Bộ sưu tập mới", "Chiến dịch".
3. A real future deadline, ISO with timezone (`+07:00`). `countdown.label` says what is counted ("Mở bán sau", "Đoàn đầu khởi hành sau").
4. Hero title ≤ 10 words with the product name or a concrete benefit. Subtitle 1–2 sentences with numbers.
5. `highlights`: exactly 4 (the bento layout is designed for 4), titles ≤ 4 words, different Lucide icons.
6. `agenda.steps`: 3–4 milestones. Launch → dates; tour → "Ngày 1/2/3" or hours; skincare → "Tuần 1…4".
7. `offer.plans`: 3 plans, the middle one `featured: true`. `was: ""` when there is no discount. `message` contains `{plan}` and `{campaign}`.
8. `faq`: 3 questions about worries **specific** to this campaign (changing your mind, weather, limited stock).
9. Add `sections.landingFaq.title`, `sections.landingCta.{title, text}`, `pages.landing.title`.
10. Images: reuse the brand's images; the landing hero should differ from the home hero.

## Adding a new landing block

Example: "units left" bar (`landing.stock = { total: 200, left: 46, label: "Còn lại" }`):

```js
/** <wl-landing-stock> — progress bar of remaining units. */
define('wl-landing-stock', {
  render(data) {
    const s = get(data, 'landing.stock');
    if (!s || !s.total) return '';
    const pct = Math.round((1 - s.left / s.total) * 100);
    return `
      <section class="sec sec--tight">
        <div class="container stock" data-reveal>
          <p class="stock__label">${esc(s.label)}: <b>${esc(s.left)}</b> / ${esc(s.total)}</p>
          <div class="stock__bar" role="progressbar" aria-valuemin="0" aria-valuemax="${esc(s.total)}" aria-valuenow="${esc(s.total - s.left)}">
            <span style="width:${pct}%"></span>
          </div>
        </div>
      </section>`;
  },
});
```
Then: `.stock…` CSS in the Landing block of components.css, place the tag in `landing-page.html`, add `landing.stock` to the JSON (brands without it simply hide the block).

## Several campaigns per brand

Turn `landing` into an array `campaigns[]` with an `id`, and read the campaign from `?c=<id>`:
```js
const id = WL.params.get('c');
const l = (data.campaigns || []).find((c) => c.id === id) || (data.campaigns || [])[0];
```
The home teaser then loops over `campaigns` and links to `landing-page.html?c=<id>`.
