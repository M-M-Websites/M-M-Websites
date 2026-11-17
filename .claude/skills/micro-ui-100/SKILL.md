---
name: micro-ui-100
description: The shared M&M Websites list of 100 checkable micro UI design practices. Use on every site build or redesign; every item must be implemented or marked N/A with a reason in a checklist.
---
# Micro UI 100

This is the M&M Websites standard for the small details on our static marketing sites (HTML/CSS/JS on Cloudflare Pages or GitHub Pages). Every item is a single rule you can check on a live page or in the source. Most come from WCAG 2.2, Apple HIG, Material, NN/g, Baymard, web.dev and the Vercel Web Interface Guidelines; sources are listed at the end.

**How to use**

1. Read this list before you start any build or redesign, and design with it in mind. Don't leave it for a final audit.
2. Every redesign must include a checklist file in the site repo, `micro-ui-checklist.md`. It lists **all 100 IDs** (MU-001 … MU-100) in order, one row each:
   `| MU-0xx | DONE | evidence |` or `| MU-0xx | N/A | reason |`
   - **DONE** needs evidence: a file:line, CSS selector, test result (Lighthouse, axe, a measured value), or screenshot name.
   - **N/A** needs a concrete reason, e.g. "MU-057: the site has no dynamic lists, filters or search". "Not needed" is not a reason.
3. No ID may be left out, left blank, or marked "partial". If an item is partly done, it is not DONE. Fix it or explain the N/A.
4. Run the checks at 320px, 375px, 768px, 1280px and 1920px widths, with keyboard only, on one touch device (or touch emulation), and in light and dark OS settings.

Each item reads: **ID Title**: the rule. *Verify:* how to check it.

## Accessibility & focus

- **MU-001 Visible focus ring**: Every interactive element has a `:focus-visible` style: an outline at least 2px thick with ≥3:1 contrast against its surroundings. `outline: none` is never used without a replacement. *Verify:* Tab through every page and check that focus is always visible. Grep CSS for `outline: none`/`outline: 0`.
- **MU-002 Focus not obscured**: A sticky header, cookie bar or chat widget never fully hides the focused element (WCAG 2.4.11). Use `scroll-padding-top` on `html` equal to the sticky header height. *Verify:* Shift+Tab up through a long page with the header stuck. The focused element is never hidden under it.
- **MU-003 Skip link**: The first focusable element is a "Skip to main content" link to `#main`. It is visually hidden until focused, then visible. *Verify:* Load the page and press Tab once. The link appears; pressing Enter moves focus to main.
- **MU-004 Landmarks**: Each page has exactly one `<header>`, one `<main id="main">` and one `<footer>`. Each `<nav>` has an `aria-label` if there is more than one. *Verify:* Use the axe DevTools or Landmarks extension, or grep the HTML.
- **MU-005 Heading order**: Each page has exactly one `<h1>`, and heading levels never skip (no h2→h4). Headings are never chosen for their font size. *Verify:* Check the outline with the HeadingsMap extension or `document.querySelectorAll('h1,h2,h3,h4,h5,h6')`.
- **MU-006 Alt text**: Every `<img>` has an `alt` attribute. Informative images describe their content or purpose without "image of…". Decorative images use `alt=""`. *Verify:* Run axe with zero image-alt violations, then read each alt manually.
- **MU-007 Icon-only controls named**: Icon-only buttons and links (menu, social, close) have an accessible name (`aria-label` or visually hidden text). Decorative inline SVGs have `aria-hidden="true"`. *Verify:* Check the Accessibility tree in DevTools: no control has an empty name.
- **MU-008 Page language**: `<html lang="…">` is set to the content language (e.g. `en-US`). *Verify:* View source on every template.
- **MU-009 Logical tab order**: Focus order follows visual reading order. No positive `tabindex` is used, and hidden or off-canvas content can't be focused. *Verify:* Tab through the page. Grep for `tabindex="[1-9]`.
- **MU-010 Zoom allowed**: The viewport meta is `width=device-width, initial-scale=1`, with no `user-scalable=no` and no `maximum-scale` below 5. Content works at 200% browser zoom. *Verify:* View source. Pinch-zoom on a phone. Test Ctrl/Cmd + to 200%.

## Touch & interaction

- **MU-011 Touch target size**: On touch devices every interactive target is at least 44×44 CSS px (Apple 44pt, Material 48dp). Use padding or a pseudo-element to grow small icons. Nothing is ever under the WCAG 2.5.8 floor of 24×24. *Verify:* Measure hit boxes in DevTools device mode, including footer links, social icons and the hamburger.
- **MU-012 Target spacing**: Adjacent tap targets have at least 8px between their hit areas, so a tap never lands on a neighbor. *Verify:* Measure gaps between stacked footer links, pagination, and inline buttons on a 375px viewport.
- **MU-013 Hover only where hover exists**: Hover-only effects (lifts, color changes, reveals) are wrapped in `@media (hover: hover) and (pointer: fine)`, so taps don't leave a "stuck" hover. Nothing is reachable only by hover. *Verify:* Grep CSS for `:hover` outside such a query. Tap cards on a phone and check that no state sticks.
- **MU-014 Pressed state**: Buttons and tappable cards show `:active` feedback within about 100ms, e.g. `transform: scale(0.97)` or a darker fill. Controls have `touch-action: manipulation`, and the default `-webkit-tap-highlight-color` is replaced by your own active state. *Verify:* Tap each button type on a phone and check for instant visible feedback. Grep CSS.
- **MU-015 No dead zones**: If a card looks clickable, its whole visible area is the hit target, using one stretched link (`a::after { inset: 0 }`) rather than nested links. It has a single tab stop. *Verify:* Click card corners and padding. Tab through cards and count one stop per card.
- **MU-016 Semantic controls**: Navigation uses `<a href>`, so Cmd/Ctrl-click, middle-click and right-click all work. Actions use `<button type="button">`. No `div`/`span` has a click handler. *Verify:* Grep for `onclick` on non-interactive elements and `href="#"`/`javascript:` links.

## Typography

- **MU-017 Body size**: Body text is at least 16px and set in `rem`. `html` has `-webkit-text-size-adjust: 100%`, so iOS doesn't inflate text in landscape. *Verify:* Check the computed `font-size` on `p`. Rotate an iPhone and confirm the text keeps its size.
- **MU-018 Type scale**: All font sizes come from one modular scale (ratio ≈1.2–1.333) stored as CSS custom properties, with no more than 8 distinct sizes site-wide. *Verify:* Check Chrome DevTools › CSS Overview › Font info for unique sizes. Grep for raw `font-size: …px`.
- **MU-019 Fluid headings**: Display headings use `clamp(min, calc(rem + vw), max)`. The preferred value includes a `rem` term so text still scales with zoom, and h1 is ≤40px at 320px wide. *Verify:* Resize from 320px to 1920px and check for no jumps and no overflow. Zoom to 200% and check the heading grows.
- **MU-020 Line length**: Body paragraphs are 45–75 characters per line, using `max-width: 65ch` or similar. *Verify:* Count characters in a full line at 1280px and 1920px.
- **MU-021 Line height**: Body line-height is 1.5–1.7, and headings are 1.1–1.3. Line height is unitless. *Verify:* Check computed styles on `p`, `h1`, `h2`.
- **MU-022 Balanced headings**: Headings use `text-wrap: balance`, and paragraphs use `text-wrap: pretty` to avoid one-word last lines (orphans). *Verify:* Grep CSS. Check hero and section headings at 375px for orphans.
- **MU-023 Tabular numbers**: Prices, tables, stats, counters and hours use `font-variant-numeric: tabular-nums`, so digits line up and don't shift width. *Verify:* Inspect price and number elements. Check a price column visually.
- **MU-024 Limited font files**: There are no more than 2 families and no more than 4 weight/style files in total (or one variable font). Synthetic bold/italic are not triggered. *Verify:* Filter the Network panel by "Font" and count files.

## Spacing & layout

- **MU-025 4/8pt spacing scale**: Every margin, padding and gap comes from a token scale (4, 8, 12, 16, 24, 32, 48, 64, 96px as `--space-*`). Section vertical padding uses one or two tokens consistently across the site. *Verify:* Grep CSS for spacing values that aren't tokens. Compare section padding between pages.
- **MU-026 Proximity groups**: There is less space within a group than between groups: label→input < field→field < group→group < section→section. *Verify:* Measure a form and a card grid and check the gaps strictly increase.
- **MU-027 Container and gutters**: Content sits in one container with a fixed max-width (e.g. 1200px). Side gutters are at least 16px on mobile and use `max()` with safe-area insets. All sections align to the same left edge. *Verify:* Overlay a vertical guide at 375px and 1440px. Text never touches the screen edge.
- **MU-028 Radius scale**: There are no more than 3 border-radius tokens (e.g. 4/8/16px + pill). Nested radii are concentric: inner = outer − padding. *Verify:* Check CSS Overview for unique radius values. Inspect cards that contain buttons or images.
- **MU-029 Elevation system**: There are no more than 4 shadow tokens, each layered (ambient + direct light) with the same light direction. Higher elevation means a larger blur and offset. Shadows are tinted toward the background hue. *Verify:* Grep `box-shadow` to confirm all values use tokens. Compare cards, the sticky header and the menu.
- **MU-030 Icon sizing and alignment**: All icons come from one set with one stroke width. They are sized 16/20/24px (or `1em` inline) and vertically centered with adjacent text (`display: inline-flex; align-items: center; gap`). Optical tweaks (±1px) are allowed. *Verify:* Zoom into icon+label pairs at 400% and check that baselines and centers line up.

## Color & contrast

- **MU-031 Text contrast**: Normal text has ≥4.5:1 contrast, and large text (≥24px, or ≥18.66px bold) has ≥3:1. This includes placeholder text and text over images, gradients or video, where you test the lightest area or add a scrim. *Verify:* Run axe or the DevTools contrast picker on every text style and on every hero image at each breakpoint.
- **MU-032 Non-text contrast**: Input borders, focus rings, checkbox and radio outlines, and meaningful icons have ≥3:1 contrast against adjacent colors (WCAG 1.4.11). *Verify:* Use the contrast checker on form field borders and icon colors.
- **MU-033 Not color alone**: Errors, required fields, active tabs and in-text links are signaled by something more than color: an icon, text, underline, or weight. *Verify:* View in grayscale (DevTools › Rendering › Emulate vision deficiency › achromatopsia). Every state is still clear.
- **MU-034 Color tokens**: All colors are CSS custom properties (`--color-*`) from a defined palette, with no stray hex values in component CSS. One accent color is reserved for primary CTAs. *Verify:* Grep component CSS for `#[0-9a-f]{3,8}`/`rgb(` outside the token file.
- **MU-035 Color scheme**: `color-scheme` is declared, as CSS `color-scheme` plus `<meta name="color-scheme">`, matching the themes the site supports. If dark mode exists, every token swaps under `prefers-color-scheme: dark`, and logos, form controls and scrollbars stay legible. *Verify:* Toggle OS dark mode (or DevTools emulation) and look for white flashes, unreadable inputs, or invisible logos.
- **MU-036 Selection color**: `::selection` uses brand colors with ≥4.5:1 text contrast. *Verify:* Select text on light and dark sections.

## Buttons & forms

- **MU-037 One primary CTA per view**: Each section has at most one filled primary button. Secondary actions use outline or ghost styles, so the hierarchy is clear at a glance. *Verify:* Squint test or blur screenshot: one element per viewport clearly dominates.
- **MU-038 Action-specific labels**: Buttons say verb + object ("Get a free quote", "Call (555) 123-4567"), never "Submit", "Click here", or "Learn more" alone. *Verify:* List every button and CTA label and confirm each makes sense out of context.
- **MU-039 Loading state**: Submit stays enabled until clicked, so it's never pre-disabled. On submit, the button is disabled to prevent double submission, shows a spinner with "Sending…", and sets `aria-busy="true"`. Its width doesn't change. *Verify:* Throttle to Slow 3G, submit, and double-click. Only one request is sent and the button doesn't jump.
- **MU-040 Visible labels**: Every input, select and textarea has a visible `<label for>`. A placeholder is never the only label. Clicking the label focuses the field. *Verify:* Use axe "label" rules. Click each label.
- **MU-041 Correct input types**: Inputs use `type="email"`, `type="tel"`, `type="url"` and `type="date"`. Postal codes use `inputmode="numeric"`. Email fields have `spellcheck="false"` and `autocapitalize="off"`. Paste is never blocked. *Verify:* Focus each field on a phone and check that the matching keyboard appears. Grep for `onpaste`.
- **MU-042 Autocomplete**: Fields have standard `autocomplete` and `name` tokens (`name`, `email`, `tel`, `street-address`, `postal-code`, `organization`), so the browser can autofill the form. *Verify:* Autofill the form in Chrome and Safari. Every field fills correctly.
- **MU-043 No iOS input zoom**: Form controls have a computed font-size of at least 16px on mobile. *Verify:* Tap each input on an iPhone and check the page doesn't zoom.
- **MU-044 Inline validation timing**: Each field is validated on blur, not while the user is still typing. Once an error shows, it clears on the first valid keystroke (Baymard). Submit still runs full validation. *Verify:* Type a partial email: no error appears. Tab away: an error appears. Fix it: the error disappears immediately.
- **MU-045 Inline error messages**: Each error sits directly under its field with an icon and text. The text says how to fix it ("Enter a phone number like 555-123-4567"). The field gets `aria-invalid="true"` and is linked with `aria-describedby`. On submit, focus moves to the first invalid field. *Verify:* Submit an empty form, then check placement, wording, focus, and screen-reader output.
- **MU-046 Required vs optional**: Required and optional fields are marked consistently. Optional fields say "(optional)", or required fields use an asterisk explained above the form. Forms ask only for what's needed (≤5 fields for a contact form). *Verify:* Read the form and count fields. Every required field is marked and matches the `required` attribute.
- **MU-047 Checkbox and radio hit area**: The label and control form one clickable area, at least 44px tall on touch. Custom-styled controls keep the native input focusable and announced. *Verify:* Tap the label text. Tab to the control and press Space.
- **MU-048 Submission outcome**: After success, an in-page message says what happens next and when ("We'll reply within 1 business day"). After an error, all entered values are kept and a phone or email fallback is offered. *Verify:* Submit successfully, then block the request in DevTools and submit again. Inputs stay filled.

## Feedback & states

- **MU-049 Status announcements**: Form results and toasts are in an `aria-live="polite"` region (`role="status"`). Blocking errors use `role="alert"`. *Verify:* Submit with a screen reader running (VoiceOver/NVDA) and check the result is announced.
- **MU-050 Skeletons match layout**: Any async content (reviews widget, booking embed, Instagram feed) reserves its final size with a skeleton or `min-height`. The skeleton appears only after about 150–300ms and stays at least 300ms, so it doesn't flicker. *Verify:* Throttle the network. There is no layout jump when content arrives (CLS 0 in the Performance panel).
- **MU-051 Empty states**: Every list that can be empty (filtered gallery, search, blog category, reviews) shows an explanation and a next action instead of a blank area. *Verify:* Force zero results (filter or query) and check the message and link.
- **MU-052 Copy feedback**: Copy-to-clipboard buttons (email, address, promo code) change to "Copied" with a check icon for about 2s and announce it through a live region. *Verify:* Click copy, then paste somewhere. Check the visual and announced confirmation.
- **MU-053 Disclosure state**: Accordions and FAQs use `<details>/<summary>`, or a `<button aria-expanded>`. A chevron rotates to show open/closed state, and the whole row is the hit target. *Verify:* Toggle with mouse, Enter and Space. `aria-expanded` and the icon update.
- **MU-054 Linkable state**: Tabs, open FAQ items and gallery filters are reflected in the URL hash, so refresh, Back and shared links restore the same view. *Verify:* Open a tab or filter, copy the URL into a new window, and check the same state appears.

## Motion

- **MU-055 Reduced motion**: Under `@media (prefers-reduced-motion: reduce)`, parallax, scroll reveals, auto-advancing elements, smooth scrolling and large transforms are removed or replaced with simple opacity fades. *Verify:* Enable "Reduce motion" in the OS or DevTools and scroll the whole site. Nothing slides, zooms, or parallaxes.
- **MU-056 UI durations**: Interface transitions take 100–300ms: press feedback 100–160ms, hover and tooltips 150–200ms, menus and dropdowns ≤250ms. Nothing triggered by the user exceeds 500ms. *Verify:* Grep `transition`/`animation` durations. Check with the DevTools Animations panel.
- **MU-057 Easing**: Entering elements use a strong ease-out curve (e.g. `cubic-bezier(0.23, 1, 0.32, 1)`). Exits are shorter. `ease-in` and `linear` are never used for UI movement; linear is only for progress or marquees. Popovers scale from their trigger (`transform-origin`), and scale animations never start from 0. *Verify:* Grep easing values. Watch menus open in slow motion in the Animations panel.
- **MU-058 Compositor-only animation**: Only `transform` and `opacity` are animated. There is no `transition: all`, and no `width`, `height`, `top`, `left` or `margin` is animated. *Verify:* Grep for `transition: all` and for transitions on layout properties.
- **MU-059 Safe scroll reveals**: Content is visible without JavaScript, so nothing depends on JS to remove `opacity: 0`. Reveals run once, move ≤24px, and never apply to the hero or LCP element. *Verify:* Disable JS and check all content is visible. Run Lighthouse and confirm the LCP element isn't delayed by an animation.
- **MU-060 Gated smooth scrolling**: `scroll-behavior: smooth` is set only inside `@media (prefers-reduced-motion: no-preference)`. *Verify:* Grep CSS. With reduced motion on, anchor links jump instantly.
- **MU-061 No unstoppable motion**: There are no auto-advancing carousels. Any motion that runs longer than 5s has a visible pause control (WCAG 2.2.2), and nothing flashes more than 3 times per second. *Verify:* Wait 10s on every page and check for movement without a pause button.

## Images & media

- **MU-062 Dimensions set**: Every `<img>`, `<video>` and `<iframe>` has `width`/`height` attributes or a CSS `aspect-ratio`, with `height: auto` in CSS, so the browser reserves the space. *Verify:* Grep `<img` without `width=`. CLS is ≤0.1 in Lighthouse.
- **MU-063 Responsive images**: Content images use `srcset` with 2–4 widths and an accurate `sizes`. No image is downloaded at more than twice its rendered size. *Verify:* Check the Lighthouse "Properly size images" audit. In the Network panel, compare intrinsic and rendered size at 375px and 1440px.
- **MU-064 Modern formats and weight**: Photos are served as AVIF or WebP (via `<picture>` with a JPEG fallback). The hero is ≤200KB at mobile size and other images are ≤150KB. *Verify:* Check file types and transfer sizes in the Network panel.
- **MU-065 Lazy vs priority**: Images below the fold have `loading="lazy" decoding="async"`. The LCP or hero image is never lazy-loaded and has `fetchpriority="high"`. *Verify:* Check the Lighthouse LCP element and its attributes. Grep for `loading="lazy"` on the first image.
- **MU-066 Consistent aspect ratios**: Images in a card or gallery set share one `aspect-ratio`, with `object-fit: cover` and an `object-position` chosen so faces and products aren't cropped. *Verify:* View the grid at 375px and 1440px. All cards line up and subjects stay in frame.
- **MU-067 Video and embeds**: Background video is `muted playsinline loop`, has a `poster`, has no audio, and is paused under reduced motion. Speech video has captions. YouTube and Maps iframes have a `title` and `loading="lazy"`, or use a click-to-load facade. *Verify:* Inspect attributes. Run Lighthouse "Reduce impact of third-party code".
- **MU-068 Crisp logo**: The logo is SVG (or a 2× raster) with an accessible name of the business name. In the header it links to `/`. *Verify:* Zoom to 300% and check it stays sharp. Check the accessible name in DevTools.

## Navigation

- **MU-069 Sticky header restraint**: A sticky header is ≤64px tall on mobile (≤72px on desktop) and never covers more than about 15% of the viewport. It may hide when scrolling down and reappear when scrolling up. *Verify:* Measure at 375×667. Scroll down and back up.
- **MU-070 Anchor offsets**: In-page targets have `scroll-margin-top` equal to the header height plus about 16px, so headings land fully visible under the sticky header. *Verify:* Click every in-page link and load each `#hash` URL directly. Each heading is visible.
- **MU-071 Menu toggle**: The mobile menu button is a `<button>` with `aria-expanded`, `aria-controls`, a visible or accessible "Menu" name, and a ≥44px target. *Verify:* Inspect it. Toggle it and watch `aria-expanded` change.
- **MU-072 Mobile menu behavior**: When the menu is open, focus moves into it and is trapped (or the rest of the page is `inert`). Esc closes it and returns focus to the toggle. Body scroll is locked, with `overscroll-behavior: contain` on the panel. Tapping a link or the backdrop closes it. *Verify:* Open the menu with the keyboard, Tab past the last item, press Esc, and try scrolling the page behind it.
- **MU-073 Current page indicated**: The active nav item has `aria-current="page"` and a visible non-color indicator, such as an underline, bar, or weight. *Verify:* Visit each page and inspect its nav link.
- **MU-074 Link affordance**: Links in body copy are underlined (`text-underline-offset: 0.15em` or more, a deliberate thickness) and change on hover and focus. Nav and buttons may drop the underline if their context makes them obviously clickable. *Verify:* Find every link in paragraphs and confirm each is underlined.
- **MU-075 External links**: Links open in the same tab by default. If `target="_blank"` is used (PDFs, booking platforms), the link has `rel="noopener"`, a ↗ icon, and visually hidden "(opens in new tab)" text. *Verify:* Grep `target="_blank"` and check each one for rel and a notice.
- **MU-076 Footer essentials**: The footer repeats the main nav and gives name, address and phone (identical to the Google Business Profile), opening hours, the © year, and Privacy and Terms links. *Verify:* Read the footer on every page template.

## Performance & loading

- **MU-077 Font display**: Every `@font-face` sets `font-display`: `swap` for headings and branding, and `optional` (or `swap` with a metric-matched fallback using `size-adjust`/`ascent-override`) for body text. Fonts are self-hosted, subset WOFF2 files. *Verify:* Grep `@font-face`. Fonts load from your own domain in the Network panel, as `.woff2` only.
- **MU-078 Preload critical fonts**: Only the 1–2 fonts used above the fold are preloaded (`<link rel="preload" as="font" type="font/woff2" crossorigin>`). Any required third-party origin gets `preconnect`. *Verify:* View `<head>`. Lighthouse shows no "preload key requests" warning.
- **MU-079 Core Web Vitals**: Mobile Lighthouse/PageSpeed results: LCP ≤2.5s, CLS ≤0.1, TBT ≤200ms (and INP ≤200ms in field data), and Performance score ≥90. *Verify:* Run PageSpeed Insights on Home and one inner page and save the scores as evidence.
- **MU-080 Cookie-free by default**: No tracking cookies are set, so no consent banner is needed. Analytics are cookieless (e.g. Cloudflare Web Analytics), and there are at most 2 third-party script origins. *Verify:* On first load, DevTools › Application › Cookies is empty. Count third-party domains in the Network panel.
- **MU-081 Lean JavaScript**: No JS blocks rendering (`defer` or `type="module"` only). Total JS is ≤50KB compressed. Core content, nav links and contact details work with JS disabled. *Verify:* Lighthouse shows no "render-blocking resources" warning. Check transfer size. Browse with JS disabled.
- **MU-082 Caching and compression**: Fingerprinted CSS, JS, fonts and images are served with `Cache-Control: public, max-age=31536000, immutable` (Cloudflare `_headers`). HTML is Brotli or gzip compressed, and CSS is ≤50KB compressed. *Verify:* Check response headers with `curl -I` or in the Network panel.

## SEO, meta & sharing

- **MU-083 Title and description**: Each page has a unique `<title>` of about 50–60 characters ("Service in Town | Business") and a unique meta description of about 120–160 characters that includes a call to action. *Verify:* Crawl with Screaming Frog or a script and check for duplicates and lengths.
- **MU-084 Canonical URL**: Every page has an absolute, self-referencing `<link rel="canonical">`. HTTP→HTTPS and www/apex variants 301-redirect to a single host, and trailing-slash style is consistent. *Verify:* `curl -I` each variant, then view source.
- **MU-085 Open Graph and Twitter cards**: Pages have `og:title`, `og:description`, `og:url`, `og:type` and `og:site_name`, plus `og:image` as an absolute URL at 1200×630 with `og:image:alt`. Twitter uses `twitter:card="summary_large_image"`. *Verify:* Paste the URL into opengraph.xyz or the Facebook and LinkedIn inspectors. The preview renders correctly.
- **MU-086 Favicon set**: The site has `favicon.ico` (32px), `icon.svg` (with a dark-mode media query if needed), a 180×180 `apple-touch-icon.png`, and a `site.webmanifest` with 192 and 512px icons. *Verify:* Request each file (200 status). Check browser tabs in light and dark mode. Add to the iOS home screen.
- **MU-087 Theme color**: `<meta name="theme-color">` matches the header background, with separate `media="(prefers-color-scheme: dark)"` values if dark mode exists. *Verify:* View source. Check the browser chrome color in Android Chrome or Safari.
- **MU-088 Local structured data**: The site has `LocalBusiness` (or a subtype) JSON-LD with name, address, phone, hours, URL and geo, matching visible content. `sitemap.xml` and `robots.txt` exist and reference each other. *Verify:* Run Google Rich Results Test with zero errors. Fetch `/robots.txt` and `/sitemap.xml`.

## Content & copy

- **MU-089 Clear hero CTA**: Above the fold at 375×667, the hero states what the business does, where, and for whom, and shows the primary CTA button without scrolling. *Verify:* Take a screenshot at 375×667 and check the headline, location and CTA are all visible.
- **MU-090 Visible prices**: Prices or "from $X" ranges are shown on the page for the main services. If pricing truly varies, show what drives the price and a typical range. *Verify:* Find a price or range for each listed service.
- **MU-091 Contact links**: Phone numbers are `tel:+1XXXXXXXXXX` links, emails are `mailto:` links, and addresses link to a maps search. All are displayed in readable formats ("(555) 123-4567"). *Verify:* Tap each on a phone: the dialer, mail app or maps app opens. Grep for phone numbers that aren't links.
- **MU-092 Descriptive link text**: Link text makes sense out of context ("See bathroom remodel prices"), with no bare "click here", "read more" or raw URLs. Repeated "Learn more" links get a visually hidden suffix. *Verify:* List links with the screen reader rotor or axe "link-name". Each one is unique and descriptive.
- **MU-093 Typographic details**: Copy uses curly quotes (’ “ ”), a real ellipsis (…), en dashes for ranges (9–5, $50–$80), and a non-breaking space between numbers and units or in short names (10&nbsp;min, Dr.&nbsp;Lee). *Verify:* Grep content for `...`, straight `'`/`"` in text nodes, and hyphens between numbers.

## Robustness & edge cases

- **MU-094 No horizontal scroll at 320px**: There is no horizontal overflow at 320px width (WCAG 1.4.10 Reflow). Tables and code blocks scroll inside their own container. *Verify:* Run DevTools at 320px and check `document.documentElement.scrollWidth <= innerWidth`. Swipe sideways on each page.
- **MU-095 Dynamic viewport units**: Full-height sections use `min-height: 100dvh` (with `100vh` declared first as a fallback), never a fixed `height: 100vh`. *Verify:* Grep for `100vh`. On iOS Safari, nothing hides behind the URL bar and the hero doesn't jump when the bar collapses.
- **MU-096 Safe-area insets**: With `viewport-fit=cover`, fixed or sticky bars and full-bleed sections pad with `env(safe-area-inset-*)`, so nothing sits under the notch or home indicator. *Verify:* Check iPhone landscape (or the simulator). The bottom CTA bar clears the home indicator.
- **MU-097 Long content resilience**: Long words, emails and URLs wrap (`overflow-wrap: anywhere`). Buttons, cards and nav survive labels and names twice the expected length, and flex children have `min-width: 0`. *Verify:* Temporarily paste a 60-character email and a long business name into the hero, a card and a button at 320px.
- **MU-098 Custom 404 page**: A branded `404.html` returns HTTP status 404 (not 200), keeps the header and footer, and offers links to Home, Services and Contact plus the phone number. *Verify:* `curl -I https://site/nope` returns 404. Visit it in a browser.
- **MU-099 Print styles**: `@media print` hides the nav, menus, video and cookie or chat widgets. Text prints black on white, link URLs print after their text (`a[href^="http"]::after { content: " (" attr(href) ")" }`), and cards don't split across pages. *Verify:* Use print preview on the Services and Contact pages.
- **MU-100 Cross-browser smoke test**: The site works in the latest iOS Safari, Android Chrome, desktop Safari, Chrome, Firefox and Edge, with no console errors and no failed (4xx/5xx) requests. *Verify:* Load every page in each browser, check the Console and Network panels, and record the browsers tested.

## Sources

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WCAG 2.4.11 Focus Not Obscured: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- WCAG 2.4.7 Focus Visible: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- WCAG 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- WCAG 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- WCAG 2.2.2 Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- WAI-ARIA APG, Dialog (Modal) pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WAI-ARIA APG, Disclosure pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- Apple Human Interface Guidelines, Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Google/Material touch target size (48dp): https://support.google.com/accessibility/android/answer/7101858
- Material 3, Easing and duration: https://m3.material.io/styles/motion/easing-and-duration
- Vercel Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines
- Emil Kowalski, Great animations: https://emilkowal.ski/ui/great-animations
- Refactoring UI: https://www.refactoringui.com/
- Nielsen Norman Group, Error-message guidelines: https://www.nngroup.com/articles/error-message-guidelines/
- Nielsen Norman Group, Hostile error messages: https://www.nngroup.com/articles/hostile-error-messages/
- Nielsen Norman Group, Opening links in new windows and tabs: https://www.nngroup.com/articles/new-browser-windows-and-tabs/
- Nielsen Norman Group, Guidelines for visualizing links: https://www.nngroup.com/articles/guidelines-for-visualizing-links/
- Baymard Institute, Inline form validation: https://baymard.com/blog/inline-form-validation
- Smashing Magazine, Should links open in new windows?: https://www.smashingmagazine.com/2008/07/should-links-open-in-new-windows/
- web.dev, Optimize CLS: https://web.dev/articles/optimize-cls
- web.dev, Font best practices: https://web.dev/articles/font-best-practices
- web.dev, Web Vitals: https://web.dev/articles/vitals
- web.dev, Browser-level image lazy loading: https://web.dev/articles/browser-level-image-lazy-loading
- web.dev, Fetch Priority: https://web.dev/articles/fetch-priority
- web.dev, Learn Forms, autofill: https://web.dev/learn/forms/autofill
- MDN, text-wrap: https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
- MDN, prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- MDN, scroll-margin-top: https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top
- MDN, env() safe-area insets: https://developer.mozilla.org/en-US/docs/Web/CSS/env
- The Open Graph protocol: https://ogp.me/
- Google Search Central, Canonical URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central, LocalBusiness structured data: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Evil Martians, How to favicon (six files): https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
