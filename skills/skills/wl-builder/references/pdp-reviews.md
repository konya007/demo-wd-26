# Product detail page (PDP) and reviews

`product.html?id=<item id>` shows one product or tour. All PDP components call `currentItem(data)` (product-detail.js), which falls back to the first featured item when `?id` is missing or belongs to another brand.

## Page structure

```html
<wl-product-detail media="gallery" specs="false"></wl-product-detail>
<wl-pdp-services></wl-pdp-services>
<wl-pdp-tabs></wl-pdp-tabs>
<wl-pdp-content layout="alternate"></wl-pdp-content>
<wl-reviews item filter tone="surface"></wl-reviews>
<wl-products layout="grid" related limit="3"></wl-products>
<wl-cta-band layout="card"></wl-cta-band>
…
<wl-sticky-buy></wl-sticky-buy>   <!-- instead of <wl-sticky-cta> -->
```

| Component | What it does | Data |
|---|---|---|
| `wl-product-detail` | gallery with thumbnails (`aria-pressed`), category, `h1`, tagline, rating link, price, description, buy button (`?item=` to the contact form), optional specs | item, `pages.product`, `reviews` |
| `wl-pdp-services` | 3–4 risk reducers (delivery, returns, warranty, instalments) | `pdp.services[] {icon, title, text}` |
| `wl-pdp-tabs` | Description / Specs / Shipping, ARIA tabs | item, `pdp.tabs`, `pdp.shipping[]` |
| `wl-pdp-content` | image + text story blocks ("A+ content") | `pdp.blocks[] {image, title, text}`, `sections.pdpContent` |
| `wl-sticky-buy` | bottom bar with thumbnail, name, price, button; appears once `[data-buy-anchor]` scrolls above the viewport | item, `pdp.buyLabel` |

Design notes:
- Gallery images: `item.gallery` if present, else item image + brand feature images (max 5). Thumbnails swap `src` of the main image; no re-render.
- With `specs="false"` the specs are shown only in the tab, avoiding duplication.
- Rating under the title is computed from `reviews` for this item and links to `#danh-gia` (the reviews section id).
- `wl-sticky-buy` uses an IntersectionObserver (disconnected in `unmount`). Its link has `tabindex="-1"` and the bar `aria-hidden="true"` while hidden, so keyboard users do not tab into an invisible bar. It must be placed after `wl-product-detail` in the HTML.
- `body:has(.sticky-buy.is-visible)` lifts the back-to-top and brand-switch buttons.

## Reviews (`<wl-reviews>`)

```html
<wl-reviews></wl-reviews>                          <!-- all reviews of the brand, with product names -->
<wl-reviews item filter></wl-reviews>              <!-- current product (?id), star filter chips -->
<wl-reviews item="landing" layout="grid" limit="3"></wl-reviews>   <!-- campaign product -->
<wl-reviews layout="rail" limit="6" space="tight"></wl-reviews>    <!-- home strip -->
```

Data:
```json
"reviews": [ { "itemId": "y17-pro-max", "name": "Lê Minh Châu", "rating": 5, "date": "2026-09-12",
               "title": "Zoom 5x đáng tiền", "text": "…", "verified": true } ],
"sections": { "reviews": { "title": "…", "text": "…", "basedOn": "Dựa trên {n} đánh giá",
              "verified": "Đã mua hàng", "all": "Tất cả", "empty": "Chưa có đánh giá cho mục này.", "about": "Về" } }
```

Behaviour:
- Sorted newest first; `limit` applies after sorting.
- Average, distribution bars (5→1) and the "based on N" line are computed from the filtered list.
- `filter` adds chips only for star values that exist; filtering toggles `hidden` on cards (no re-render).
- An item with no reviews shows `sections.reviews.empty`; without `item` and with no reviews the component renders nothing.
- Each card: avatar (initial), name, "verified" tag, stars, `<time datetime>`, title, text, and "About: <product>" when listing several products.

Layouts: `split` (sticky summary left), `stack`, `grid`, `rail` (no summary). See `layout-params.md`.

## Writing reviews for a new brand

- 6–8 reviews, at least one per item, ratings mostly 4–5 with concrete details (a place, a number, a situation).
- Mix `verified: true/false`.
- Dates in the past, ISO format.
- Mention one small drawback in 4★ reviews: it makes the set believable.
