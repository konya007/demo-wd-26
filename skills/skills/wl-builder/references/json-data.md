# Organising the JSON data

Each brand is **one** file `assets-web-design/data-N.json`. All files must share **the same structure**; only values differ. Copy is Vietnamese; keys are English.

## Top-level key map

Group by **role**, not by page:

| Group | Keys | Role |
|---|---|---|
| Identity | `seo`, `organization`, `theme` | who, how it looks |
| Navigation | `nav`, `cta` | where to go, main action |
| Frame copy | `sections.<block>`, `pages.<page>`, `catalog` | titles, intros, UI labels |
| Record lists | `features`, `items`, `process`, `testimonials`, `faq`, `partners`, `achievements`, `reviews` | arrays of same-shaped records |
| Feature objects | `hero`, `mission`, `contact`, `assistant`, `landing`, `pdp` | one object per large feature |

Where does a new key go?
- **Title/intro of a block** → `sections.<blockName>` (`{title, text, more, …labels}`), so `sectionHead()` and `copy="…"` work. Small UI labels for that block live there too (`sections.reviews.verified`, `sections.newsletter.submit`).
- **Title of a page** → `pages.<data-page>` (`{title, heading, text, image}`).
- **List of records** → top-level plural array (`items`, `reviews`).
- **A whole feature** (campaign, AI assistant, product page extras) → one top-level object holding everything it needs (`landing`, `assistant`, `pdp`). Removing the feature = removing one key.

## Naming

- `camelCase`, English nouns: `featuredLabel`, `darkColors`, `workingHours`, `buyLabel`.
- Arrays plural (`plans`, `steps`, `blocks`), objects singular (`offer`, `story`).
- Booleans as adjectives: `featured`, `verified`.
- Same meaning, same name everywhere: `title` (heading), `text` (short paragraph), `description` (long text), `image` (path), `icon` (Lucide name), `label` (short label), `href`/`link` (URL), `date` (ISO date), `rating` (number 0–5).
- Record `id`: ASCII slug, stable, used in URLs (`"y17-pro-max"`, `"bach-moc"`).

## Reference by id, never copy

```json
"landing": { "itemId": "bach-moc" },
"reviews": [ { "itemId": "bach-moc", "name": "…", "rating": 5, "date": "2026-01-18", "title": "…", "text": "…", "verified": true } ]
```
Components look up `items` for name, price and image. Do not repeat names or prices elsewhere; two copies drift apart.

Derived values are computed, not stored: average rating, rating distribution, the list of spec rows in the compare table.

## Plain content, no HTML

- No HTML tags, CSS or class names in JSON. Need emphasis → split fields (`price` + `was` instead of `<s>`).
- Templates use named slots: `"message": "Tôi muốn đặt {plan} cho {campaign}."`, `"basedOn": "Dựa trên {n} đánh giá"`.
- Dates in ISO 8601; deadlines with timezone: `"deadline": "2026-11-13T05:00:00+07:00"`.
- Images: path from site root `assets-web-design/img/<brand>/<name>.jpg`.
- Display numbers stay preformatted strings (`"48MP"`, `"34.990.000đ"`); `countUp` extracts the number. Numbers used in calculations stay numbers (`rating`).

## Optional keys and fallbacks

- Any optional field must be safe when missing: `${p.was ? `<s>${esc(p.was)}</s>` : ''}`.
- Whole block missing → `render` returns `''`.
- Optional per-record overrides: `item.gallery` replaces the default gallery (item image + feature images).

## Example: product page extras

```json
"pdp": {
  "services": [ { "icon": "truck", "title": "Giao 2 giờ", "text": "Nội thành TP. HCM và Hà Nội" } ],
  "blocks":   [ { "image": "assets-web-design/img/yphone/f1.jpg", "title": "…", "text": "…" } ],
  "shipping": [ "…", "…" ],
  "tabs":     { "description": "Mô tả", "specs": "Thông số", "shipping": "Giao hàng & đổi trả" },
  "buyLabel": "Đặt trước"
}
```
Plus `sections.pdpContent`, `sections.reviews`, `sections.compare`, `sections.gallery`, `sections.newsletter`. The campaign object `landing` is documented in `landing-page.md`.

## Add one key to every file

Manual edits miss files. Use a script that keeps 2-space indentation, UTF-8, and unescaped Vietnamese:

```python
import json, pathlib
for p in sorted(pathlib.Path('assets-web-design').glob('data-*.json')):
    d = json.loads(p.read_text(encoding='utf-8'))
    d.setdefault('sections', {})['newBlock'] = {'title': 'TODO'}
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
```

## Check that every file has the same shape

```python
import json, pathlib
def shape(v):
    if isinstance(v, dict): return {k: shape(x) for k, x in sorted(v.items())}
    if isinstance(v, list): return [shape(v[0])] if v else []
    return type(v).__name__
files = sorted(pathlib.Path('assets-web-design').glob('data-*.json'))
base = shape(json.loads(files[0].read_text(encoding='utf-8')))
for f in files[1:]:
    s = shape(json.loads(f.read_text(encoding='utf-8')))
    if s != base: print('Different shape:', f.name, [k for k in set(base) | set(s) if base.get(k) != s.get(k)])
```
Optional fields present on only some records (`featured`, the keys of `contact.socials`) are reported too; review before "fixing".

## Keep files light

- Keep one JSON under ~60KB (currently ~29KB): it is downloaded on every brand switch.
- No base64 images. No repeated long strings; reference by `id`.
- Images pre-compressed: ~1600px wide for full-screen, ~960px for cards.
