# M&M Websites

The studio website for **M&M Websites**, a small web design studio that designs and hand-builds fast, mobile-first websites for local service businesses: detailers, trades, salons, restaurants and similar.

- **Stack:** hand-written HTML, CSS and vanilla JavaScript. No framework, no build step. Live as a Cloudflare Worker with Static Assets (`mnm-websites`). Wrangler can deploy it; Netlify still works as an alternative.
- **Pages:** home (`index.html`), the Legendary Detailing case study (`work/legendary-detailing/`), the Terms of Service (`terms/`), Privacy Policy (`privacy/`) and Refund and Cancellation Policy (`refunds/`) pages, and a branded `404.html`.
- **Quality:** 36-test Playwright + axe-core suite, all passing. Lighthouse 100 for Accessibility, Best Practices and SEO on every page, mobile and desktop (see *Testing*).

---

## Settings still to fill in → `assets/js/config.js`

This is the only file the owner needs to edit. **`formEmail` and `businessEmail` are already set.** Anything left empty is hidden, so the site looks finished as it is. Fill a value in, save, deploy, and the matching link or section appears on its own.

| Setting | What it does while empty | What it does once set |
|---|---|---|
| `formEmail` | The *Start a project* form says plainly **"This form isn't connected yet"**, the button reads *Check my details*, and submitting shows *Not sent* (it never pretends to send) | Set to `mnmwebsitesforyou@gmail.com`. Requests go to that inbox through [FormSubmit](https://formsubmit.co). See *Launch checklist* step 4 |
| `businessEmail` | No email link anywhere | Set to `mnmwebsitesforyou@gmail.com`. Email link in *Prefer to talk first?* and the footer; added to structured data. |
| `phone` + `phoneDisplay` | No phone link anywhere | Tap-to-call link; `phone` (like `+19015550123`) is added to structured data |
| `bookingUrl` | No booking link | *Book a call* link (Calendly, Cal.com, etc.). Must start with `https://` |
| `social.instagram`, `social.facebook`, `social.linkedin`, `social.tiktok`, `social.x`, `social.youtube`, `social.googleBusiness` | Hidden | Footer links, plus `sameAs` in structured data. Must start with `https://` |

Also still placeholder, outside `config.js`:

- **The domain** is set: every absolute URL uses `https://mnmwebsitesforyou.com` (the bare domain; `www` should redirect to it, see *Hosting on Cloudflare*).
- **A live link to the Legendary Detailing site.** The case study doesn't link to the live site yet. Once it has its permanent domain, add a link in `work/legendary-detailing/index.html` and in the project block in `index.html`.

Nothing on the site states client counts, years in business, testimonials, addresses or awards. Keep it that way unless they're real.

## Ownership (business rule)

Clients **do not** own the website, its code, the hosting or the domain: M&M Websites provides them as a service while the $45 monthly plan is active, and they can't be transferred or handed to anyone else. If a client stops paying or cancels, the site goes offline, the domain is paused, updates stop and there's no access to the code. Clients keep the rights to their own logo, photos and words. The home page FAQ, `terms/` and `refunds/` all say this, and the *ownership* test fails if any page promises otherwise. See `CLAUDE.md` for the full list of content rules.

## Pricing and payments (Stripe)

The *Pricing* section on the home page shows the two real prices, which every client pays:

| Stripe product | Price | Stripe price ID |
|---|---|---|
| Website setup | $600, one time | `price_1UbzNXAhdcfBYyxakwU9CyVi` |
| Website maintenance | $45 a month | `price_1UbzNiAhdcfBYyxa5o85qYoq` |

**Start my website** (in the Pricing section and the phone action bar) opens a Stripe Payment Link (`https://buy.stripe.com/7sY28qcdi8Bg29nbfEaEE00`) that charges $645 at signup (setup plus the first month), then $45 every month. It also asks for the client's business name and phone number. No API keys or server code are involved.

**To change a price:** create a new Price in Stripe and a new Payment Link (prices can't be edited in place), then update the `PRICING` block in `index.html`, the FAQ answer *How much does a website cost?*, the hero note, the JSON-LD offers in the `<head>`, the case study's closing paragraph, and `PAY_LINK` in `tests/site.test.cjs`. The tests check that the amounts on the page are exactly $45, $600 and $645, so they'll flag anything you miss.

**Checkout** accepts cards, Apple Pay and Link only, asks the client to accept the Terms of Service, and Stripe emails a receipt for every payment. Failed monthly payments are retried automatically (Smart Retries). The site says exactly this; don't mention other payment methods unless they're turned on in Stripe.

**Manage billing:** clients manage their subscription in Stripe's Customer Portal: `https://billing.stripe.com/p/login/7sY28qcdi8Bg29nbfEaEE00`. It's linked in every footer, the pricing card, the FAQ and the Terms and Refunds pages. The tests check it's there (`PORTAL_LINK` in `tests/site.test.cjs`).

**Not handled by the site:** sales tax (no Stripe Tax yet; check with an accountant).

---

## Policy pages (Terms, Privacy, Refunds)

`terms/`, `privacy/` and `refunds/` hold plain-language Terms of Service, Privacy Policy and Refund and Cancellation Policy pages (last updated November 15, 2026). They are linked in every footer, listed in `sitemap.xml` and covered by the tests. The Terms page URL is also the one to set as the Stripe account's Terms of Service link.

> **Have a lawyer review these pages.** They were written from the business facts (Georgia sole proprietor, $600 setup plus $45 a month through Stripe, month to month, FormSubmit form, Cloudflare analytics, the refund rules) as a sensible starting point, not as legal advice. If any of those facts change, update the pages and their "Last updated" date.

## Hosting on Cloudflare (mnmwebsitesforyou.com)

The site is a Cloudflare Worker named `mnm-websites` with Static Assets. The Worker serves the pages and redirects `www` to the bare domain. Live addresses:

- `https://mnmwebsitesforyou.com`
- `https://www.mnmwebsitesforyou.com` (301 to the bare domain, handled in `worker.js`)
- Preview: `https://mnm-websites.mnmwebsitesforyou.workers.dev`

Config is in `wrangler.toml` and `worker.js`. `.assetsignore` keeps `tests/`, `scripts/`, the README, Wrangler files and similar off the live site. `_headers` is applied as the Worker's asset headers (HSTS, CSP and caching). The CSP allows the Cloudflare Web Analytics beacon (`static.cloudflareinsights.com` script, `cloudflareinsights.com` reporting). HSTS is `max-age=31536000; includeSubDomains` without `preload`. `CNAME` is only for GitHub Pages and is ignored here.

Pushes to GitHub do **not** redeploy the Worker automatically. After a change, either run `npx wrangler deploy` from this repo (needs a Cloudflare login with access to the account), or use the redeploy kit documented alongside this project.

One-time setup already done:

1. The domain is on Cloudflare (Free plan). Namecheap nameservers are Cloudflare's: `mimi.ns.cloudflare.com` and `sterling.ns.cloudflare.com`.
2. The Worker was created with Static Assets, `not_found_handling = "404-page"`, `html_handling = "auto-trailing-slash"`, and `run_worker_first = true` so `worker.js` can see `www` requests.
3. Both custom domains were attached to the Worker. Cloudflare created the proxied DNS records and issues HTTPS.

**Check it:** open `https://mnmwebsitesforyou.com`, `https://www.mnmwebsitesforyou.com` (should land on the bare domain) and a made-up address like `/nope` (should show the branded 404).

## Launch checklist

1. **Host it.** This site is already live as the `mnm-websites` Cloudflare Worker (see *Hosting on Cloudflare*). To start over or deploy a copy:
   - **Cloudflare Workers:** `npx wrangler deploy` from this repo (uses `wrangler.toml`).
   - **Netlify:** *Add new site → Import from Git →* this repo. Build command: empty. Publish directory: `/`.

   Both read `_headers` (caching and security headers, including the Content-Security-Policy). GitHub Pages also works but ignores `_headers`, and its terms say Pages isn't meant for running a business's website.
2. **Connect the domain** in the host's domain settings (already done for `mnmwebsitesforyou.com`).
3. **Point the site at the domain:**
   ```bash
   bash scripts/set-domain.sh yourdomain.com
   ```
   This rewrites every absolute URL (canonical, Open Graph, structured data) in every page, plus `sitemap.xml` and `robots.txt`, refreshes the sitemap dates and writes `CNAME`. Safe to run again. Commit and push. Then redeploy the Worker.
4. **Connect the form.** `formEmail` is already set to `mnmwebsitesforyou@gmail.com`. After a deploy, submit one real test request on the live site. FormSubmit emails that inbox an *Activate Form* link: click it once. Mark the first FormSubmit email *Not spam*. Optional: after activation FormSubmit offers a random alias; put that in `formEmail` instead to keep the address away from spam bots.
5. **Fill in the rest of `config.js`** (phone, booking link, socials) as each is ready.
6. **Submit the sitemap** in Google Search Console: `https://yourdomain.com/sitemap.xml`.

---

## Adding a portfolio project

1. **Screenshots:** take them with Playwright at `deviceScaleFactor: 2` (desktop 1440×900, phone 390×844), convert to WebP at a few widths (the Legendary ones are 720/1200/1800 for desktop, 390/780 for phone) and put them in `assets/img/work/<slug>/`.
2. **Home page card:** in `index.html`, find the `PORTFOLIO PROJECT` comment inside `#work`. Copy the whole `<article class="project">` down to `END PROJECT`, paste it below, and change the name, kind, summary, facts, images, alt text and link. Give its heading a new `id` and update `aria-labelledby` to match.
3. **Case study page:** copy `work/legendary-detailing/` to `work/<slug>/` and rewrite it. Update the `<title>`, description, canonical, `og:*` tags and breadcrumb data.
4. **Sitemap:** add the new URL to `sitemap.xml`, and add the route to `PAGES` at the top of `tests/site.test.cjs` so it's tested too.
5. Describe only what the site actually contains. No invented results.

---

## Design notes

The identity is **the key board** on a service shop's wall: owners hand M&M the keys (website, domain, hosting, updates) and every job hangs, numbered, on a hook. The full system is recorded in [`DESIGN.md`](DESIGN.md) (tokens + rules) with a machine-readable sidecar in `.impeccable/design.json`; `.interface-design/system.md` is the short consistency file, `PRODUCT.md` the product brief.

- **Palette:** pale hammertone steel (`--steel`), pegboard panels (`--panel`), enamel plates and dark enamel bands, ink text, and four key-tag colours: yellow (primary action), cobalt (links), green, tomato (errors). Yellow always carries ink text.
- **Type:** Big Shoulders (condensed signage, variable) for the headline, section titles and stencil-cut numbers; Overpass (variable) for everything else. Eight size tokens `--fs-1 … --fs-8`. Both fonts are self-hosted in `assets/fonts/` under the SIL Open Font License (`OFL.txt`).
- **Light and dark themes** follow the visitor's system setting. Dark is the same board after hours: deep grey-green steel, a visible mid-steel pegboard, tags keep their colours.
- **Motion:** one authored moment. Tags drop onto their hooks on load (staggered) and swing from the hook on hover or focus. UI feedback runs 120–300ms. Everything is still under `prefers-reduced-motion`, and without JavaScript the page is complete.
- **Details:** punched holes and split rings on every tag, a key-shaped primary button, a pegboard hole grid, rivets on the form plate, tag-shaped choice chips, a phone-only action bar, a copy button that flips to "Copied", a shimmer on screenshots until they load, inline errors with an icon, and print styles.
- **Checks:** `micro-ui-checklist.md` records all 100 micro-UI items with evidence.

---

## Testing

```bash
cd tests
npm install
npx playwright install chromium   # or set CHROME_PATH to an existing Chrome/Chromium
npm test
```

The suite starts its own static server and checks:

- **Layout** at 320, 390, 768, 1024, 1440 and 1920px on every page: no sideways scrolling, every image loads, one H1, no console errors or failed requests, and tap targets at least 44×44px.
- **Links:** every in-page anchor has a target and every internal link loads.
- **Honest content:** `formEmail` and `businessEmail` are the real inboxes, other `config.js` values stay empty, the only dollar amounts are the real prices, one portfolio project, JSON-LD has no unconfirmed fields, and published files don't contain unexpected personal email addresses or phone numbers.
- **SEO:** unique titles, description lengths, absolute canonicals, Open Graph, heading order, valid JSON-LD, robots.txt and sitemap.
- **The form, not connected:** the notice shows, nothing is sent, typed details are kept, and the email fallback works when only `businessEmail` is set.
- **The form, connected** (FormSubmit is always mocked, so tests never send real email): validation and recovery, the exact payload on success, and both server-error and network-error failures with call/email/booking fallbacks.
- **Settings:** contact links, socials and JSON-LD appear when set; unsafe or non-https links are ignored.
- **Pricing:** both prices and the total show, and *Start my website* opens the Stripe payment link (stubbed in tests).
- **Polish:** every page passes axe in the dark theme too; typography (curly apostrophes, ellipses, tabular prices, balanced headings); the phone action bar's show/hide rules; copy-email and its toast; the nav's section highlight, debounced errors and the loading state while sending.
- **Mobile menu**, **keyboard use** and **visible focus**.
- **axe-core:** zero violations (WCAG 2.0–2.2 A/AA plus best practices) on every page, at phone and desktop sizes, and in each form state.
- **Fallbacks:** JavaScript off and reduced motion.
- **Security:** every page under the exact CSP from `_headers`, with no violations.
- **404 page** and **`scripts/set-domain.sh`**.

### Lighthouse (12.8, local server applying `_headers`, gzip on)

| Page | Device | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| Home | Mobile | 99 | 100 | 100 | 100 |
| Home | Desktop | 100 | 100 | 100 | 100 |
| Legendary Detailing case study | Mobile | 99 | 100 | 100 | 100 |
| Legendary Detailing case study | Desktop | 100 | 100 | 100 | 100 |

Mobile uses Lighthouse's simulated slow 4G. Real-world numbers depend on the host.

---

## Files

```
index.html                      home page
work/legendary-detailing/       case study
terms/, privacy/, refunds/      Terms of Service, Privacy Policy, Refund and Cancellation Policy
favicon.ico                     16/32/48px icon made from assets/img/favicon.svg
404.html                        branded not-found page (root-relative paths)
assets/css/site.css             all styles and design tokens
assets/js/config.js             owner settings (form and business email are set)
assets/js/main.js               settings, menu, reveals, the project form
assets/fonts/                   self-hosted fonts + OFL.txt
assets/img/                     favicon, touch icon, Open Graph image, case study screenshots
_headers                        caching + security headers (Netlify, Cloudflare Workers)
wrangler.toml                   Cloudflare Worker + Static Assets config
worker.js                       www → bare-domain redirect, then static assets
.assetsignore                   keeps tests, scripts, README and similar off the live site
robots.txt, sitemap.xml
scripts/set-domain.sh           switches every absolute URL to the real domain
tests/                          Playwright + axe-core suite
```

If you change the one-line inline script in a page's `<head>`, update its `sha256-` hash in `_headers`. The CSP test will fail until you do.

## Credits

- **Case study screenshots:** taken from the Legendary Detailing site; photography is Legendary Detailing's own.
- **Typefaces:** Big Shoulders (The Big Shoulders Project Authors) and Overpass (The Overpass Project Authors), both SIL OFL 1.1.
