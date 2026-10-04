# Effects, accessibility, performance

## Effects: declared with `data-*`, executed in `effects.js`

Components do **not** write motion code; they only add attributes. `runEffects(document)` runs after every `wl:rendered`.

| Want | Add |
|---|---|
| Fade/rise on scroll | `data-reveal` (+ `style="--d:.1s"` to stagger) |
| Image opens like a curtain | `data-reveal="clip"` on an `overflow:hidden` frame |
| Image drifts at a different speed | `data-parallax="-0.08"` on an `<img>` taller than its frame (~115–120%) |
| 3D card tilt + glare | `data-tilt` (CSS reads `--rx --ry --gx --gy`) |
| Image stage tilt with layered depth | `data-tilt-stage` (CSS reads `--px --py`) |
| Connector grows with scroll | `data-steps` + `data-line` (horizontal), `data-timeline` + `data-line-y` (vertical) |
| CTA expands to full width | `data-expand` |
| Number counts up | `data-count="48MP"` |
| Title words rise | `splitWords(text)` inside an `h1` with `aria-label` |

### Adding an effect

```js
// effects.js, inside scrollFx(root) (needs GSAP) or as its own function called from runEffects (no GSAP)
root.querySelectorAll('[data-spin]').forEach((el) => {
  gsap.to(el, { rotate: 360, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
});
```
Then document the attribute in the comment at the top of `effects.js` and in the table above.

Motion rules:
- Animate only `transform`, `opacity`, `clip-path` (cheap, no layout).
- CSS animations live inside `@media (prefers-reduced-motion: no-preference)`.
- JS checks `reduce` first; `effects.js` already exits early when reduced motion is on.
- Without GSAP (offline) content is still fully visible: the "shown" state must never depend on GSAP.
- Timing: entrances 0.6–1.2s, hover feedback 0.15–0.3s.
- Element-level CSS `transform` conflicts with `[data-reveal].is-in { transform: none }`. Use the individual `translate`/`scale` properties for static offsets (see `.plan--featured { translate: 0 -12px }`).

## Accessibility (a11y)

- One `h1` per page, `h2` per section, `h3` per card; no skipped levels.
- Decorative images `alt=""`; informative images (main product photo) `alt` = name.
- Icon-only buttons have `aria-label`. Icons are `aria-hidden="true"`.
- State through ARIA that CSS reads: `aria-pressed`, `aria-expanded`, `aria-selected`, `aria-current="page"`.
- Hidden-but-present UI (sticky buy bar off screen) is `aria-hidden="true"` with `tabindex="-1"` links.
- Touch targets ≥ 44px. Visible focus (`:focus-visible` in base.css); never `outline: none` without a replacement.
- Text contrast ≥ 4.5:1; check every brand × light/dark × every `tone` when adding a background.
- Live messages `role="status"` (form success), countdown `role="timer"`, rating `role="img"` with `aria-label`.
- Scrollable regions (comparison table) are focusable: `tabindex="0" role="region" aria-label`.
- "Skip to content" link (`.skip`) and `<main id="main">`.
- Forms: real `<label for>`, `autocomplete`, error messages that explain the fix.

## Performance

- Hero image `fetchpriority="high"`; everything else `loading="lazy"`.
- Fixed image ratios (`aspect-ratio`) → no layout shift while loading.
- External scripts `defer`; the app is `type="module"`.
- Scroll listeners `{ passive: true }` (built into `WL.onScroll`).
- IntersectionObserver instead of measuring positions in scroll handlers.
- The whole page re-renders on brand switch: keep `render` cheap (no big nested loops, no DOM measuring).
- In-place updates (gallery thumbnails, review filter, countdown) change attributes or `textContent`, not `innerHTML`.
