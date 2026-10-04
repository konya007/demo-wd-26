# Architecture and render lifecycle

## Three separate layers

| Layer | Where | Contains | Edited when switching brand |
|---|---|---|---|
| Data | `data-N.json` | copy, images, prices, colours, fonts, menu | **only this one** |
| Structure | `*.html` | order of `<wl-*>` tags + layout attributes (`layout="grid"`, `limit="4"`, `tone="surface"`) | no |
| Presentation | `js/components/*.js` + `css/*.css` | how data becomes HTML and how it looks | no |

A page is only a list of tags:

```html
<body data-page="landing">
  <wl-header></wl-header>
  <main id="main">
    <wl-landing-hero></wl-landing-hero>
    <wl-faq source="landing.faq" copy="landingFaq" layout="stack" align="center"></wl-faq>
  </main>
  <wl-footer></wl-footer>
</body>
```

`data-page` on `<body>` is the key `core.js` uses to read `pages.<page>.title` for the tab title.

## Boot order

```
<head>  core.js (not deferred)  → sets data-theme light/dark immediately, no colour flash
        lucide, gsap, wd2026.js (defer)
        app.js (module)         → imports component files → customElements.define
                                → WebDesign2026.init({...})
wd2026.js  fetch data-N.json    → fires 'webdesign2026:datachange' (detail = data)
app.js     listens              → WL.boot(data)
WL.boot    applyTheme → applySeo → render every registered tag → lucide icons → countUp
           → html.wl-ready (page becomes visible) → fires 'wl:rendered'
app.js     on 'wl:rendered'     → runEffects(document) (reveal, tilt, GSAP)
```

If the JSON cannot be read within 4 seconds (page opened by double-click), `WL.failSafe()` shows how to run a local server.

## Lifecycle of one `<wl-*>` tag

```
connectedCallback    → add class wl-host, add to registry; if WL.data exists, update now
update(data)         → teardown() → innerHTML = render(data, el) → mount(el, data)
teardown()           → calls unmount(el) if the previous render was mounted
disconnectedCallback → remove from registry, teardown()
```

- `render` runs **on every brand switch**, so it must be pure and must not bind events.
- `mount` runs after every `render`. Child elements are brand new, so their listeners disappear with them; only things attached **outside** the tag (window, document, intervals, observers) need cleaning.
- `WL.boot` iterates over a **copy** of the registry and skips tags that left the page. Nested tags (e.g. `<wl-countdown>` inside `<wl-landing-hero>`) therefore render exactly once: the new child renders itself when attached, the replaced child is skipped.
- `WL.boot` returns early when the data is identical to the previous call (compared with `JSON.stringify`). The brand switcher relies on this (see `content-switcher.md`).
- Render order equals DOM order. A component that reads another component's DOM (e.g. `<wl-sticky-buy>` observes `[data-buy-anchor]` inside `<wl-product-detail>`) must come **after** it in the HTML.

## How components talk to each other

| Mechanism | Use for | Example |
|---|---|---|
| Exported helper | repeated HTML fragments | `sectionHead`, `productCard`, `ctaButton`, `splitWords`, `stars`, `avatar` |
| URL parameter | carrying context to another page | `product.html?id=…`, `contact.html?item=…` (`WL.params`) |
| `sessionStorage` + CustomEvent | sending data to a component on this or another page | `sendPrefill({itemId, message})` → `<wl-contact>` |
| `document` event | global state | `wl:rendered`, `wl:prefill` |
| `data-*` anchor | one component observing a known point in another | `[data-buy-anchor]` |

Component A never reaches into component B's markup by class name.
