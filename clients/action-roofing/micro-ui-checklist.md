# Micro UI 100: Action Roofing preview

Checked 2026-11-21 in Chromium at 320, 390, 768, 1024, 1440 (tests) plus 1280×720 and 1920 screenshots, keyboard-only, touch emulation (390 `isMobile`/`hasTouch`), light scheme only (the site declares `color-scheme: light`). "tests" = `tests/site.test.cjs` (24/24 pass). "LH" = Lighthouse 12.6.1.

| ID | Status | Evidence or reason |
|---|---|---|
| MU-001 | DONE | `:focus-visible { outline: 3px solid var(--c-focus); outline-offset: 3px }` in site.css; no bare `outline: none` except `main:focus` (programmatic skip target) and inputs, which get a border + 3px ring |
| MU-002 | DONE | `html { scroll-padding-top: calc(var(--header) + var(--s-4)) }`; sticky header 64/72px |
| MU-003 | DONE | `.skip` first in `<body>`; test "keyboard: first Tab shows the skip link" |
| MU-004 | DONE | One `header.top`, `main#main`, `footer.foot` per page; navs labelled Main, Services, Company, Quick contact, Breadcrumb |
| MU-005 | DONE | Test "one h1"; axe `heading-order` clean on every page |
| MU-006 | DONE | Every `<img>` has alt (test "every image has alt…"); decorative hero/card images use `alt=""` |
| MU-007 | DONE | Menu button has visible "Menu" (visually hidden at <380px), phone icon link has `aria-label`, pause button has hidden text, inline SVG icons `aria-hidden="true"` |
| MU-008 | DONE | `<html lang="en-US">` on every page (test) |
| MU-009 | DONE | No positive tabindex (`grep tabindex=` shows only `-1` on main, status, honeypot); closed mobile menu uses `visibility: hidden` |
| MU-010 | DONE | `width=device-width, initial-scale=1, viewport-fit=cover`, no zoom limits |
| MU-011 | DONE | Test "tap targets… at least 44px tall on a phone" on every page |
| MU-012 | DONE | Chips `gap: var(--s-3)`, pills `gap: var(--s-2)`, dock `gap: var(--s-2)`, footer lists `gap: var(--s-2)`, way cards `gap: var(--s-4)` |
| MU-013 | DONE | Every `:hover` rule sits in `@media (hover: hover) and (pointer: fine)` |
| MU-014 | DONE | `.btn:active { transform: scale(0.97) }`, `.chip:active`, `.card__link:active`, `.dock__btn:active`; `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` on buttons and chips |
| MU-015 | DONE | Service cards are one `<a class="card__link">` wrapping image, title and text (single tab stop) |
| MU-016 | DONE | Navigation is `<a href>`, actions are `<button type="button">`; no `href="#"`, no `onclick` |
| MU-017 | DONE | Body `font-size: 1rem` (16px); `-webkit-text-size-adjust: 100%` on `html` |
| MU-018 | DONE | Seven size tokens `--t-0`…`--t-6` (ratio about 1.2–1.33) |
| MU-019 | DONE | `--t-5`/`--t-6`/`.h1--page` use `clamp(rem, rem + vw, rem)`; h1 is 36px at 320 |
| MU-020 | DONE | `.lead { max-width: 62ch }`, doc pages `max-width: 760px` |
| MU-021 | DONE | Body `line-height: 1.6`; headings 1.02–1.25, unitless |
| MU-022 | DONE | `h1, h2, h3 { text-wrap: balance }`, `p { text-wrap: pretty }` |
| MU-023 | DONE | `font-variant-numeric: tabular-nums` on the phone numbers, proof figures, step numbers and facts |
| MU-024 | DONE | One variable font file (Schibsted Grotesk latin, 400–900) |
| MU-025 | DONE | Spacing from `--s-1`…`--s-10` (4–128px); sections use `--section` |
| MU-026 | DONE | Label→input 8px < field→field 24px < form block 48px < section `--section` |
| MU-027 | DONE | `.wrap { max-width: 1240px; padding-inline: var(--gutter) }`, `--gutter: max(20px, env(safe-area-inset-*))` |
| MU-028 | DONE | `--r-1` 6px, `--r-2` 12px, `--r-3` 20px, `--r-pill`; circles use 50% |
| MU-029 | DONE | `--sh-1`…`--sh-3`, each two layers, same light direction, tinted to the ink colour |
| MU-030 | DONE | One icon set drawn on a 24px grid with 2px stroke (`ic()` in build.py), `inline-flex; align-items: center; gap` |
| MU-031 | DONE | axe zero violations on every page at 1440 and 390; LH Accessibility 100; hero text over a scrim of at least 0.62 opacity |
| MU-032 | DONE | Field border `--c-field` #7c8792 (3.6:1 on white), focus ring #1856d8 |
| MU-033 | DONE | Errors have a "!" icon and text, body links underlined, current nav item underlined and bold, pressed chips change fill and icon |
| MU-034 | DONE | All colours are `--c-*` tokens in `:root`; component CSS uses tokens (scrims and shadows use `rgb()` alpha of the ink colour) |
| MU-035 | DONE | `color-scheme: light` in CSS and `<meta name="color-scheme" content="light">`; no dark theme offered |
| MU-036 | DONE | `::selection { background: var(--c-red); color: #fff }` (6.4:1) |
| MU-037 | DONE | One red button per view (hero: red Call + glass outline; form: red submit; picker result: red + text link) |
| MU-038 | DONE | "Call (931) 645-4784", "Request an estimate", "Send my estimate request", "See roof repair" |
| MU-039 | DONE | Submit enabled until clicked, then `disabled`, spinner, "Checking…/Sending…", `aria-busy="true"` on button and form; full-width button so width doesn't change |
| MU-040 | DONE | Every field has a visible `<label for>`; axe `label` clean |
| MU-041 | DONE | `type="tel"`, `type="email"` with `spellcheck="false" autocapitalize="off"`, ZIP check `inputmode="numeric"`; no paste blocking |
| MU-042 | DONE | `autocomplete` name, tel, email, street-address, postal-code |
| MU-043 | DONE | Controls `font-size: max(16px, 1rem)` |
| MU-044 | DONE | Validates on blur; clears on first valid input (test: email error clears on a valid entry) |
| MU-045 | DONE | `.err` under each field with icon, `aria-invalid`, `aria-describedby`; focus moves to the first error (test) |
| MU-046 | N/A | Required fields are starred with a legend and optional ones say "(optional)", but the form has 8 fields because the client brief sets the field list (name, phone, email, property, service, description, photos, contact method) |
| MU-047 | DONE | Contact-method pills are the whole 48px label with the native radio focusable inside |
| MU-048 | DONE | Preview result says nothing was sent and offers a call button; live mode returns with `?sent=1` and says Action Roofing will contact them; values kept on error |
| MU-049 | DONE | `#f-status` is `role="status" aria-live="polite"`, switches to `role="alert"` for blocking errors; picker and ZIP results are live regions |
| MU-050 | N/A | No async widgets (no review feeds, booking embeds or social feeds) |
| MU-051 | DONE | Picker panel has an empty state ("Choose a problem…"); the photo list hides when empty |
| MU-052 | N/A | No copy-to-clipboard buttons on this site |
| MU-053 | DONE | FAQ uses `<details>/<summary>`, whole row is the target, chevron rotates (test "FAQ: details open and close by keyboard") |
| MU-054 | DONE | Picker choice is stored as `#see-<key>` and restored (test); an open FAQ answer sets `#faq-N` and opens on load |
| MU-055 | DONE | Reduced motion: no video, no roof pinning (finished roof shown), no entrance, all transitions ~0 (test "rests fully built with reduced motion") |
| MU-056 | DONE | Press 140ms, hover 160–220ms, menu 200–220ms; the 700ms entrance runs once on load, not on user action |
| MU-057 | DONE | `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`; `linear` only on the loading spinner |
| MU-058 | DONE | No `transition: all`; no width/height/top/left/margin transitions; the roof scene moves layers only with `transform`/`opacity` |
| MU-059 | DONE | No scroll reveals; content visible with JS off (test "JavaScript off"); the hero image (LCP) isn't animated |
| MU-060 | DONE | `scroll-behavior: smooth` only inside `prefers-reduced-motion: no-preference` |
| MU-061 | DONE | No carousels; the looping hero video has a pause button (test); the roof scene only moves while the visitor scrolls |
| MU-062 | DONE | All images and the video have width/height; LH CLS 0 |
| MU-063 | DONE | `srcset` 480/960 (4:3) and 768/1344 (16:9) with `sizes` per slot |
| MU-064 | DONE | WebP everywhere; hero 63 KB at mobile size; every other image ≤ 142 KB |
| MU-065 | DONE | Below-fold images `loading="lazy" decoding="async"`; hero and page-hero photos `fetchpriority="high"` |
| MU-066 | DONE | Cards 4:3 with `object-fit: cover`; page heroes 4:3; signs 4:5 (16:9 on phones) |
| MU-067 | DONE | Hero video `muted loop playsinline`, `poster`, no audio track, `aria-hidden`, not loaded with reduced motion (test) |
| MU-068 | DONE | Text wordmark (sharp at any zoom) linking home, accessible name "Action Roofing Clarksville, TN (home page)" |
| MU-069 | DONE | Header 64px phone, 72px desktop (7–9% of a 667–900px screen) |
| MU-070 | DONE | `:target { scroll-margin-top }` and `scroll-padding-top` = header + 16px |
| MU-071 | DONE | `<button aria-expanded aria-controls="nav-panel">` with "Menu", 44px+ |
| MU-072 | DONE | Focus moves into the menu; main, footer and dock are `inert`; Esc closes and returns focus (test); `overscroll-behavior: contain`; page scroll locked; links close it |
| MU-073 | DONE | `aria-current="page"` with a red underline and bold weight (test) |
| MU-074 | DONE | Body links underlined (`text-underline-offset: 0.18em`, 1.5px), thicker on hover |
| MU-075 | DONE | External links (BBB, Facebook, Clarksville Now) have `rel="noopener"`, an ↗ icon and hidden "(opens in a new tab)" |
| MU-076 | N/A | Footer repeats the nav and shows name, phone, email, © year and Privacy. The street address and hours are left out on purpose until the owner confirms them (sources conflict). There's no Terms page because nothing is sold online |
| MU-077 | DONE | `font-display: swap` plus a metric-matched local fallback (`size-adjust`, `ascent-override`); self-hosted WOFF2 subset |
| MU-078 | DONE | One font preload; no third-party origins |
| MU-079 | DONE | LH mobile: Performance 98–100, LCP 2.0–2.4 s, CLS 0, TBT 0 ms (home, roof replacement, about, contact) |
| MU-080 | DONE | No cookies, no analytics, no third-party scripts |
| MU-081 | DONE | Scripts `defer`; main.js about 7 KB gzipped; content, nav and phone work with JS off (test) |
| MU-082 | N/A | The preview is served from M&M's host, whose `_headers` caches only its own `/assets/*`. The client domain's own `_headers` with immutable asset caching is a launch step (`notes/launch.md`) |
| MU-083 | DONE | Unique titles of 47–60 characters and descriptions of 120–160 characters with a call to action (test) |
| MU-084 | N/A | Self-referencing absolute canonicals are in place (test), but the client domain doesn't exist yet, so the www/https redirects can't be set until launch |
| MU-085 | DONE | og:title/description/url/type/site_name/image (1200×630)/image:alt, `twitter:card` summary_large_image (test) |
| MU-086 | DONE | `favicon.ico`, `favicon.svg`, `favicon-32.png`, 180px `apple-touch-icon.png`, `site.webmanifest` with 192/512 icons |
| MU-087 | DONE | `theme-color` #ffffff matches the white header |
| MU-088 | N/A | `RoofingContractor` JSON-LD has name, phone, email, URL, city/ZIP and area served, and sitemap and robots both exist. The street address, hours and geo are left out on purpose until confirmed (brief: no invented address) |
| MU-089 | DONE | At 390×844 the hero shows what (roof repair and replacement), where (Clarksville, TN) and the Call button without scrolling |
| MU-090 | N/A | The owner hasn't confirmed any prices or ranges, and the brief forbids inventing them |
| MU-091 | DONE | `tel:+19316454784` and `mailto:actionroofing@gmail.com` everywhere (test); no street address to map |
| MU-092 | DONE | Link text says where it goes ("See roof repair", "Read the story on Clarksville Now", "View the BBB profile") |
| MU-093 | DONE | Curly quotes and apostrophes throughout the copy (build.py), "e.g." spelled out, no straight quotes in visible text |
| MU-094 | DONE | Test "no sideways scroll" at 320–1440 on every page |
| MU-095 | DONE | Full-height sections use `100vh` then `100svh` (the stable small viewport, so the hero never jumps when the URL bar moves); no fixed `height: 100vh` |
| MU-096 | DONE | Dock pads with `env(safe-area-inset-bottom)`, gutters use the left/right insets, `viewport-fit=cover` |
| MU-097 | DONE | `overflow-wrap: break-word` on body, `anywhere` on contact values and the preview summary; grid tracks `minmax(0, …)`; buttons wrap on narrow screens |
| MU-098 | DONE | Branded `404.html` returns 404 (test) with header, footer, links home, to services and the estimate page, and the phone |
| MU-099 | DONE | `@media print` hides nav, dock, video, form and picker, prints black on white, adds URLs after links, keeps cards whole |
| MU-100 | N/A | Only Chromium is installed in the build environment; the Safari/Firefox/Edge and real-phone smoke test is listed as a launch step (`notes/launch.md`). Chromium shows no console errors or failed requests on any page (test) |
