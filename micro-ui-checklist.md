# Micro UI 100 checklist: "The key board" redesign (November 2026)

Checked on the home page, the Legendary Detailing case study, terms, privacy, refunds and 404. Measured with Playwright (Chromium) at 320, 390, 1440 px, light and dark, touch emulation; `tests/site.test.cjs` (35/35 pass, includes axe-core in both themes); Lighthouse 12.8.2 under the production `_headers` (home and case study: Accessibility, Best Practices, SEO 100 on mobile and desktop; Performance 99 mobile, 100 desktop).

| ID | Status | Evidence or reason |
|---|---|---|
| MU-001 | DONE | `site.css` `:focus-visible` outline 3px `--link` with offset; yellow outline on enamel/yellow sections (`.work :focus-visible …`). Only `outline: none` is on `.field input:focus-visible`, replaced by border + 4px ring. |
| MU-002 | DONE | `html { scroll-padding-top: 5rem }` (header is 61px mobile, 69px desktop). |
| MU-003 | DONE | `<a class="skip" href="#main">Skip to content</a>` is the first focusable element on every page, hidden until focused (`.skip:focus`). |
| MU-004 | DONE | One `header.masthead`, `main#main`, `footer` per page; navs labelled Main, Footer, Policies, Breadcrumb. |
| MU-005 | DONE | Measured: one h1 per page, no skipped levels on all 5 content pages. |
| MU-006 | DONE | axe image-alt passes; job tag phone shot is `alt=""` because the link text names the job; case study images have full descriptions. |
| MU-007 | DONE | Copy button `aria-label="Copy email address"`, menu toggle named "Menu"; every inline SVG has `aria-hidden="true"`. |
| MU-008 | DONE | `<html lang="en">` on every template. |
| MU-009 | DONE | No positive `tabindex` (measured 0); honeypot is `tabindex="-1"`; closed menu is `display:none`. |
| MU-010 | DONE | `width=device-width, initial-scale=1, viewport-fit=cover`; no `maximum-scale`/`user-scalable`. |
| MU-011 | DONE | Script at 320px touch: zero controls under 44px tall (inline links inside sentences excluded per WCAG 2.5.8 inline exception); `--h-s: 44px`. |
| MU-012 | DONE | Footer and nav links are 44px rows with `gap: var(--s-2)` (8px); chips `gap: var(--s-2)`. |
| MU-013 | DONE | Every `:hover` rule is inside `@media (hover: hover) and (pointer: fine)` (the one exception is the reduced-motion reset that removes hover transforms). |
| MU-014 | DONE | `.btn:active { transform: scale(0.97); transition-duration: 60ms }`; `touch-action: manipulation` and own tap highlight on a, button, input, label, summary. |
| MU-015 | DONE | Hero job tag is one `<a class="jobtag">` (one tab stop, whole tag clickable); project media is one link. |
| MU-016 | DONE | Navigation is `<a href>`, actions are `<button type="button">`; no `onclick`, no `href="#"`/`javascript:`. |
| MU-017 | DONE | Body `--fs-2` = clamp(17px…19px) in rem; `html { -webkit-text-size-adjust: 100% }`. |
| MU-018 | DONE | Eight tokens `--fs-1 … --fs-8` (ratio ≈1.25); every `font-size` in `site.css` uses one (print `0.85em` excepted). Measured 8 distinct computed sizes on the home page. |
| MU-019 | DONE | Display sizes are `clamp(min, vw + rem, max)`; h1 at 320px measured 34px (home) and 40px (case study, legal). |
| MU-020 | DONE | Paragraph measures capped: ledes 28–40rem, FAQ answers `max-width: 62ch`, policy pages `.legal { max-width: 44rem }` (about 70 characters at 17–19px). |
| MU-021 | DONE | Body `line-height: 1.6`; headings unitless 0.86–1.15 (condensed display face set tight on purpose; Big Shoulders needs it to read as signage). |
| MU-022 | DONE | `h1, h2, h3 { text-wrap: balance }`, `p, li, dd { text-wrap: pretty }`. |
| MU-023 | DONE | `tabular-nums` on tag numbers, prices, totals and step numbers. |
| MU-024 | DONE | Two families, two variable WOFF2 files (Big Shoulders, Overpass); no synthetic styles (no italics used). |
| MU-025 | DONE | Spacing tokens `--s-1…--s-9` (4–96px); sections use `--section` clamp everywhere. |
| MU-026 | DONE | Form: label→input 7px (`.field` gap 0.45rem) < field→field 22px (`.form` gap 1.35rem) < card padding < section padding (`--section`). |
| MU-027 | DONE | One `.wrap` container (max 1200px) with `max(var(--gutter), env(safe-area-inset-*))` gutters. |
| MU-028 | DONE | UI radii use `--r-s` 6px, `--r-m` 10px, `--r-l` 16px plus circles; key tags use `--r-tag`, a drawn object shape, not a container radius. Phone frame is concentric (18 − 5 = 13px). |
| MU-029 | DONE | Elevation tokens `--e-1`, `--e-tag`, `--e-3`, all layered and tinted with `--shadow-rgb` (the ink hue), same top light. |
| MU-030 | DONE | One inline SVG set, 2px strokes, `1.05em` icons in `inline-flex; align-items: center; gap`. |
| MU-031 | DONE | axe color-contrast passes light and dark (test suite); ink on steel 12:1, muted 5.3:1, ink on yellow 10:1. |
| MU-032 | DONE | Field border `--field-border` #6f7d76 is 4.3:1 on white; focus ring cobalt. |
| MU-033 | DONE | Errors use icon + text + border; required fields show * explained above the form; body links underlined. |
| MU-034 | DONE | Every colour in component CSS is a `var(--…)` token; hex values only appear in the `:root` and dark-theme token blocks and `@media print`. Yellow is the primary CTA colour. |
| MU-035 | DONE | `<meta name="color-scheme" content="light dark">`, CSS `color-scheme: dark` in the dark block; all surface tokens swap; screenshots `.impeccable/review/*-dark.png`. |
| MU-036 | DONE | `::selection { background: var(--yellow); color: var(--on-yellow) }` (10:1). |
| MU-037 | DONE | One yellow key-tag button per view (hero, pricing); others are `.btn--line` / `.btn--paper`. |
| MU-038 | DONE | Labels: "Start my website", "Ask a question first", "Read the case study", "Send project details", "Copy". |
| MU-039 | DONE | On click the button gets `aria-busy`, is disabled, shows a spinner and "Sending…" (`main.js`); test "nav and form polish: … loading state on send" passes. It is disabled at load only while no form endpoint is configured, with a note saying so (test "form (not connected)"), so the form never pretends to send. |
| MU-040 | DONE | Every field has a visible `<label for>`; axe label rule passes. |
| MU-041 | DONE | `type="email"` (+ `spellcheck="false"`), `type="tel"`, website `inputmode="url"` + `spellcheck="false"`; no paste blocking. |
| MU-042 | DONE | `autocomplete` name, organization, email, tel, url with matching `name`s. |
| MU-043 | DONE | Text inputs compute 17px at 320px (measured). |
| MU-044 | DONE | `main.js` validates on blur, re-validates on input only once a field is invalid; tests "form validation" and "nav and form polish: … debounced errors" pass. |
| MU-045 | DONE | Error text with icon under each field, `aria-invalid`, `aria-describedby`, first invalid field focused on submit. |
| MU-046 | DONE | Required marked * (explained), optional fields say "(optional)"; 5 short fields + chips + message. |
| MU-047 | DONE | Chips: native checkbox stretched over the whole 44px label, focusable and announced. |
| MU-048 | DONE | Success panel says what happens next; on network error values are kept and email fallback shown (test "form failure: server error and network error keep the details" passes). |
| MU-049 | DONE | `#form-status` and `#toast` are `role="status" aria-live="polite"`. |
| MU-050 | DONE | Portfolio images reserve size via width/height and show a shimmer placeholder until loaded; CLS 0 (Lighthouse). |
| MU-051 | N/A | The site has no lists that can be empty: no filters, search, blog or review feed. |
| MU-052 | DONE | Copy button switches to "Copied" with a check icon on green for 2s (`main.js` copy handler, `.copy.is-copied`) and the live-region toast announces "Email address copied"; test "copy email" passes. |
| MU-053 | DONE | FAQ uses `<details>/<summary>`, chevron rotates, whole row is the target. |
| MU-054 | N/A | No tabs or filters; FAQ items are native `<details>` without per-item anchors, and section anchors (#pricing, #faq, #start) already deep-link. |
| MU-055 | DONE | `prefers-reduced-motion: reduce` disables the hang/swing, view transitions, smooth scroll and hover transforms. |
| MU-056 | DONE | UI transitions 120/200/300ms tokens; hover swing 500ms; the only longer motions are the one-time hang entrance on load/scroll, not user-triggered. |
| MU-057 | DONE | Entrances use `--ease-out` cubic-bezier(0.16, 1, 0.3, 1); dock exit is shorter (200ms); no `ease-in`/`linear` for movement (linear only for spinner and shimmer); tags swing from `transform-origin` at the hook. |
| MU-058 | DONE | Only `transform`/`opacity` (plus colour) animate; no `transition: all`. |
| MU-059 | DONE | All motion is gated by `.js`; the hang keyframes no longer touch opacity, so nothing is hidden at any frame and the LCP image is never delayed (LCP 2.1s mobile). |
| MU-060 | DONE | `scroll-behavior: smooth` only inside `@media (prefers-reduced-motion: no-preference)`. |
| MU-061 | DONE | No carousels or loops; the only infinite animations are the loading spinner and image shimmer, which stop when loading ends. |
| MU-062 | DONE | Every `<img>` has width/height; test "images: width and height match" passes; CLS 0. |
| MU-063 | DONE | `srcset` with 2–3 widths and `sizes` on every portfolio image; Lighthouse "properly size images" passes. |
| MU-064 | DONE | All portfolio images are WebP; largest mobile image well under 150KB. |
| MU-065 | DONE | Only the hero job-tag image is eager with `fetchpriority="high"`; others `loading="lazy" decoding="async"` (test passes). |
| MU-066 | DONE | Phone shots share 390-wide portrait ratio with `object-fit: cover; object-position: top`. |
| MU-067 | N/A | The site has no video, YouTube or map embeds. |
| MU-068 | DONE | Logo is CSS + live text "M&M Websites" with `aria-label`, `translate="no"`, links home; `favicon.svg` vector. |
| MU-069 | DONE | Header measured 61px at 320–390px, 69px desktop. |
| MU-070 | DONE | `scroll-padding-top: 5rem` (header + 16px) applies to every in-page target. |
| MU-071 | DONE | `<button class="nav__toggle" aria-expanded aria-controls="nav-list">` named "Menu", 44px. |
| MU-072 | DONE | Open menu focuses its first link, makes `main`, `footer` and the dock `inert`, locks page scroll (`html.menu-open`), `overscroll-behavior: contain`; Esc closes and returns focus; link tap or outside tap closes (mobile menu test passes). |
| MU-073 | DONE | Scroll-spy sets `aria-current="true"` on the nav link with a yellow bar; breadcrumbs use `aria-current="page"`. |
| MU-074 | DONE | Body links underlined 2px, offset 0.18em, colour changes on hover/focus. |
| MU-075 | DONE | No `target="_blank"` anywhere (measured 0). |
| MU-076 | DONE | Footer repeats the nav and gives the business name, © year, Privacy, Terms, Refunds and Manage billing; the email lives in the contact section (`config.js`). M&M has no public street address, phone or opening hours, so none is shown (no invented facts). |
| MU-077 | DONE | Two self-hosted subset WOFF2 `@font-face` with `font-display: swap`. |
| MU-078 | DONE | Both fonts preloaded (`as="font" type="font/woff2" crossorigin`); no third-party font origin. |
| MU-079 | DONE | Lighthouse mobile: home Perf 99, LCP 2.1s, CLS 0, TBT 0; case study Perf 99, LCP 2.3s, CLS 0, TBT 0. |
| MU-080 | DONE | No cookies set; only Cloudflare Web Analytics (cookieless) as third-party script origin. |
| MU-081 | DONE | Scripts are `defer`; JS 5.2KB + 0.9KB gzipped; nav, contact links and content work without JS (`no-js` class). |
| MU-082 | DONE | Fonts `immutable, max-age=31536000`; CSS/JS/images are not fingerprinted, so they use short `must-revalidate` caches instead of `immutable` (as the rule's "fingerprinted" condition requires); CSS 12.4KB gzipped; Cloudflare serves Brotli. |
| MU-083 | DONE | Unique titles and descriptions per page (test "seo: titles, descriptions, canonicals…" passes). |
| MU-084 | DONE | Absolute self canonicals; `worker.js` 301s www→apex; HTTPS is forced by Cloudflare with an HSTS header in `_headers`; trailing-slash URLs throughout. |
| MU-085 | DONE | Full OG + Twitter tags; `og-image.jpg` regenerated in the new design at 1200×630, says "Fully managed". |
| MU-086 | DONE | `favicon.ico` (16/32/48), `favicon.svg`, 180px `apple-touch-icon.png`, `site.webmanifest` with 192/512 icons, all redrawn as the yellow key tag. |
| MU-087 | DONE | `theme-color` #d8ded5 light / #141b18 dark, matching the header. |
| MU-088 | DONE | `ProfessionalService` JSON-LD (M&M is an online studio with no public address, so `address`/`geo`/hours are omitted rather than invented) plus FAQPage; `robots.txt` names `sitemap.xml`. |
| MU-089 | DONE | At 375×667 the headline, "for local service businesses" and "Start my website" are above the fold (`.impeccable/review/mobile.png`). |
| MU-090 | DONE | $999.99 setup, $74.99/month and optional $249.99/month SEO shown in hero, pricing tags, SEO section and FAQ. |
| MU-091 | DONE | Email is a `mailto:` link built from `config.js` with a copy button; no phone or address is published. |
| MU-092 | DONE | Link text is descriptive ("Read the case study", "See the job", "Manage billing"); no "click here". |
| MU-093 | DONE | Curly quotes and apostrophes, real "…", `&nbsp;` where needed; grep finds no `...` in content. |
| MU-094 | DONE | `scrollWidth <= innerWidth` at 320px on all 5 content pages (measured). |
| MU-095 | N/A | No full-height sections; no `100vh`/`dvh` is used anywhere. |
| MU-096 | DONE | `viewport-fit=cover`; masthead, dock, toast and footer pad with `env(safe-area-inset-*)`. |
| MU-097 | DONE | `body { overflow-wrap: anywhere }`, `minmax(0, 1fr)` tracks and `min-width: 0` hero children, buttons wrap under 520px. Stress test at 320px with a 70-character email in the hero, a 58-character business name in the job tag and project title, and a 45-character button label: no horizontal overflow (`long.cjs`). |
| MU-098 | DONE | Branded `404.html` with header, footer and home link; Worker returns status 404 (test "404: unknown address returns the branded page" passes). |
| MU-099 | DONE | `@media print` hides header, footer, board, form, dock, toast; black on white; external link URLs printed; cards `break-inside: avoid`. |
| MU-100 | DONE (Chromium only) | Chromium desktop and mobile emulation: no console errors, no failed requests (test suite). Firefox, Safari and real iOS/Android were not available in this environment; check them on a device before calling this fully done. |
