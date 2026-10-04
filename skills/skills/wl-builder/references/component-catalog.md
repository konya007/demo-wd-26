# Component catalog

Every tag also accepts the shared layout attributes `align`, `width`, `tone`, `space` (see `layout-params.md`).
"Data" is the path read from the brand JSON.

## Global chrome (`layout.js`)

| Tag | Attributes | Data |
|---|---|---|
| `<wl-header>` | — | `organization`, `nav`, `cta` |
| `<wl-footer>` | — | `organization`, `nav`, `contact` |
| `<wl-scroll-progress>` | — | — |
| `<wl-back-to-top>` | — | — |
| `<wl-sticky-cta>` | — (mobile only) | `cta` |
| `<wl-brand-switcher>` | — | `WL.brands` + every brand JSON (preview) |

## Page openers (`hero.js`)

| Tag | Attributes | Data |
|---|---|---|
| `<wl-hero>` | `variant="split\|full"` (JSON `hero.variant` wins) | `hero`, `cta` |
| `<wl-page-head>` | `page`, `image="false"` | `pages[page]` |

## Content sections (`sections.js`, `about.js`)

| Tag | Attributes | Data |
|---|---|---|
| `<wl-partners>` | — | `partners`, `sections.partners` |
| `<wl-features>` | `layout="story\|rows"`, `limit`, `more` | `features` |
| `<wl-products>` | `layout="rail\|grid"`, `limit`, `featured`, `filter`, `related`, `more` | `items`, `catalog` |
| `<wl-process>` | `layout="row\|list"` | `process` |
| `<wl-testimonials>` | `layout="spotlight\|grid"` | `testimonials` |
| `<wl-faq>` | `layout="split\|stack\|cards"`, `limit`, `source`, `copy` | `faq` (or `source`) |
| `<wl-cta-band>` | `layout="split\|center\|card"`, `copy` | `sections.ctaBand`, `cta` |
| `<wl-mission>` / `<wl-stats>` / `<wl-achievements>` | — | `mission` / `hero.stats` / `achievements` |
| `<wl-advisor>` | `compact` | `assistant`, `items` |
| `<wl-contact>` | reads `?item=` and prefill | `contact`, `items`, `sections.contact` |

## Shared blocks (`blocks.js`)

| Tag | Attributes | Data |
|---|---|---|
| `<wl-compare>` | `limit="4"`, `featured`, `ids="a,b,c"` | `items[].specs`, `sections.compare` |
| `<wl-gallery>` | `source="features"`, `layout="masonry\|grid\|strip"`, `limit`, `copy` | any array with `image` (+`title`) |
| `<wl-newsletter>` | `layout="inline\|card\|split"`, `copy` | `sections.newsletter` |

## Product detail (`product-detail.js`)

| Tag | Attributes | Data |
|---|---|---|
| `<wl-product-detail>` | `media="gallery\|single"`, `specs="false"`, `layout="split\|stacked"` | item from `?id=`, `pages.product`, `reviews` (rating) |
| `<wl-pdp-services>` | `layout="row\|cards"` | `pdp.services` |
| `<wl-pdp-tabs>` | — | item, `pdp.tabs`, `pdp.shipping` |
| `<wl-pdp-content>` | `layout="alternate\|stack\|cards"`, `copy` | `pdp.blocks`, `sections.pdpContent` |
| `<wl-sticky-buy>` | — (replaces `wl-sticky-cta` on the PDP) | item, `pdp.buyLabel` |

## Reviews (`reviews.js`)

| Tag | Attributes | Data |
|---|---|---|
| `<wl-reviews>` | `item` (empty = current `?id`, `"landing"`, or an id), `layout="split\|stack\|grid\|rail"`, `limit`, `filter` | `reviews`, `sections.reviews` |

## Campaign landing (`landing.js`)

| Tag | Attributes | Data |
|---|---|---|
| `<wl-campaign-teaser>` | — | `landing.teaser`, `landing.image` |
| `<wl-countdown>` | `source="landing"`, `size="sm\|lg"` | `deadline`, `countdown` under `source` |
| `<wl-landing-hero>` | — | `landing` |
| `<wl-landing-highlights>` | `layout="bento\|grid\|list"` | `landing.highlights` |
| `<wl-landing-story>` | — | `landing.story` |
| `<wl-landing-agenda>` | — | `landing.agenda` |
| `<wl-landing-offer>` | — | `landing.offer` |

## JS helpers you can import

| From | Export | Returns |
|---|---|---|
| `ui.js` | `stars(rating, cls)`, `avatar(name, size, image)`, `fmtDate(iso)`, `fmtRating(n)` | HTML / string |
| `sections.js` | `sectionHead(data, el, key, extra)`, `productCard(p, eager)` | HTML |
| `layout.js` | `ctaButton(data, cls)`, `brandMark(data)` | HTML |
| `hero.js` | `splitWords(text)` | HTML (word-by-word title animation) |
| `product-detail.js` | `currentItem(data)` | item for `?id=` |
| `contact.js` | `sendPrefill({itemId, message})` | fills the contact form (same or other page) |
