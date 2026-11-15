# M&M Websites

The studio website for **M&M Websites**, a small web design studio that designs and hand-builds fast, mobile-first websites for local service businesses: detailers, trades, salons, restaurants and similar.

- **Stack:** hand-written HTML, CSS and vanilla JavaScript. No framework, no build step. Deploys as-is to Netlify, Cloudflare Pages or GitHub Pages.
- **Pages:** home (`index.html`), the Legendary Detailing case study (`work/legendary-detailing/`), and a branded `404.html`.
- **Quality:** 23-test Playwright + axe-core suite, all passing. Lighthouse 100 for Accessibility, Best Practices and SEO on every page, mobile and desktop (see *Testing*).

---

## Settings still to fill in → `assets/js/config.js`

This is the only file the owner needs to edit. **Every value ships empty**, and the site hides anything that isn't set, so it looks finished as it is. Fill a value in, save, deploy, and the matching link or section appears on its own.

| Setting | What it does while empty | What it does once set |
|---|---|---|
| `formEmail` | The *Start a project* form says plainly **"This form isn't connected yet"**, the button reads *Check my details*, and submitting shows *Not sent* (it never pretends to send) | Requests go to this inbox through [FormSubmit](https://formsubmit.co). See *Launch checklist* step 4 |
| `businessEmail` | No email link anywhere | Email link in *Prefer to talk first?* and the footer; added to structured data. Also offered as a pre-filled email if the form isn't connected |
| `phone` + `phoneDisplay` | No phone link anywhere | Tap-to-call link; `phone` (like `+19015550123`) is added to structured data |
| `bookingUrl` | No booking link | *Book a call* link (Calendly, Cal.com, etc.). Must start with `https://` |
| `social.instagram`, `social.facebook`, `social.linkedin`, `social.tiktok`, `social.x`, `social.youtube`, `social.googleBusiness` | Hidden | Footer links, plus `sameAs` in structured data. Must start with `https://` |

Also still placeholder, outside `config.js`:

- **The domain** is set: every absolute URL uses `https://mnmwebsitesforyou.com` (the bare domain; `www` should redirect to it, see *Hosting on Cloudflare Pages*).
- **A live link to the Legendary Detailing site.** The case study doesn't link to the live site yet. Once it has its permanent domain, add a link in `work/legendary-detailing/index.html` and in the project block in `index.html`.

Nothing on the site states client counts, years in business, testimonials, addresses or awards. Keep it that way unless they're real.

## Pricing and payments (Stripe)

The *Pricing* section on the home page shows the two real prices, which every client pays:

| Stripe product | Price | Stripe price ID |
|---|---|---|
| Website setup | $600, one time | `price_1UbzNXAhdcfBYyxakwU9CyVi` |
| Website maintenance | $45 a month | `price_1UbzNiAhdcfBYyxa5o85qYoq` |

**Get started** opens a Stripe Payment Link (`https://buy.stripe.com/7sY28qcdi8Bg29nbfEaEE00`) that charges $645 at signup (setup plus the first month), then $45 every month. It also asks for the client's business name and phone number. No API keys or server code are involved.

**To change a price:** create a new Price in Stripe and a new Payment Link (prices can't be edited in place), then update the `PRICING` block in `index.html`, the FAQ answer *How much does a website cost?*, the hero note, the JSON-LD offers in the `<head>`, the case study's closing paragraph, and `PAY_LINK` in `tests/site.test.cjs`. The tests check that the amounts on the page are exactly $45, $600 and $645, so they'll flag anything you miss.

**Not handled by the site:** sales tax (no Stripe Tax yet; check with an accountant), and clients managing their subscription. For that, turn on Stripe's no-code Customer Portal login link (Stripe Dashboard → Settings → Billing → Customer portal) and share it with clients.

---

## Hosting on Cloudflare Pages (mnmwebsitesforyou.com)

The site is hosted on Cloudflare Pages straight from this repo: every push to `main` redeploys it. One-time setup:

1. **Add the domain to Cloudflare.** Cloudflare dashboard → *Add a domain* → `mnmwebsitesforyou.com` → Free plan. Cloudflare lists two nameservers (like `xxx.ns.cloudflare.com`).
2. **Point Namecheap at Cloudflare.** Namecheap → Domain List → *Manage* → *Nameservers* → change *Namecheap BasicDNS* to **Custom DNS**, paste the two Cloudflare nameservers and save. Namecheap's redirect and parking page stop applying once this takes effect, which can take up to a day (usually under an hour). Cloudflare emails you when the domain is active.
3. **Create the Pages project.** Cloudflare → *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → authorise GitHub → pick `M-M-Websites/M-M-Websites`. Production branch: `main`. Framework preset: **None**. Build command: **empty**. Build output directory: **`/`**. Save and deploy. You get a `*.pages.dev` preview address.
4. **Attach the domain.** In the Pages project → *Custom domains* → add `mnmwebsitesforyou.com`, then add `www.mnmwebsitesforyou.com`. Cloudflare creates the DNS records and the HTTPS certificate.
5. **Redirect www to the bare domain.** Cloudflare → the domain → *Rules* → *Redirect Rules* → *Create rule* from the template **Redirect from WWW to root** (301, keep the path and query string).
6. **Check it:** open `https://mnmwebsitesforyou.com`, `https://www.mnmwebsitesforyou.com` (should land on the bare domain) and a made-up address like `/nope` (should show the branded 404).

`_headers` (security policy and caching) is applied automatically by Cloudflare Pages. `CNAME` is only for GitHub Pages and is ignored here.

## Launch checklist

1. **Host it.**
   - **Netlify:** *Add new site → Import from Git →* this repo. Build command: empty. Publish directory: `/`.
   - **Cloudflare Pages:** *Create → Pages → Connect to Git →* this repo. Framework preset: None. Build command: empty. Output directory: `/`.

   Both read `_headers` (caching and security headers, including the Content-Security-Policy). GitHub Pages also works but ignores `_headers`, and its terms say Pages isn't meant for running a business's website.
2. **Connect the domain** in the host's domain settings.
3. **Point the site at the domain:**
   ```bash
   bash scripts/set-domain.sh yourdomain.com
   ```
   This rewrites every absolute URL (canonical, Open Graph, structured data) in every page, plus `sitemap.xml` and `robots.txt`, refreshes the sitemap dates and writes `CNAME`. Safe to run again. Commit and push.
4. **Connect the form.** Put the inbox in `formEmail`, deploy, and submit one real test request on the live site. FormSubmit emails that inbox an *Activate Form* link: click it once. Mark the first FormSubmit email *Not spam*. Optional: after activation FormSubmit offers a random alias; put that in `formEmail` instead to keep the address away from spam bots.
5. **Fill in the rest of `config.js`** (email, phone, booking link, socials) as each is ready.
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

The identity is a **printer's proof**: warm paper (`--paper`), near-black ink (`--ink`) and one red pencil (`--red`) used for markup. The signature element is the hero's *proof*: a real screenshot of client work on a phone, with crop marks and red-pencil annotations that draw themselves in. The same red pencil underlines the headline, numbers the process steps and marks list items.

- **Type:** Bricolage Grotesque (variable, optical sizes) for everything, JetBrains Mono for annotations and captions. Both are self-hosted in `assets/fonts/` under the SIL Open Font License (`OFL.txt`).
- **Motion:** headline rise, pencil marks drawing, gentle scroll reveals. All of it is skipped for `prefers-reduced-motion`, and without JavaScript the page is complete and still.
- **Colours and spacing** are tokens at the top of `assets/css/site.css`. Text colours meet WCAG AA contrast (the red used for text is `--red-ink`, 5.2:1 on paper).

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
- **Honest content:** `config.js` ships empty, the only dollar amounts are the real prices, no contact links, hidden contact sections, one portfolio project, JSON-LD with no unconfirmed fields, and no personal email addresses or phone numbers in published files.
- **SEO:** unique titles, description lengths, absolute canonicals, Open Graph, heading order, valid JSON-LD, robots.txt and sitemap.
- **The form, not connected:** the notice shows, nothing is sent, typed details are kept, and the email fallback works when only `businessEmail` is set.
- **The form, connected** (FormSubmit is always mocked, so tests never send real email): validation and recovery, the exact payload on success, and both server-error and network-error failures with call/email/booking fallbacks.
- **Settings:** contact links, socials and JSON-LD appear when set; unsafe or non-https links are ignored.
- **Pricing:** both prices and the total show, and *Get started* opens the Stripe payment link (stubbed in tests).
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
404.html                        branded not-found page (root-relative paths)
assets/css/site.css             all styles and design tokens
assets/js/config.js             owner settings (all empty by default)
assets/js/main.js               settings, menu, reveals, the project form
assets/fonts/                   self-hosted fonts + OFL.txt
assets/img/                     favicon, touch icon, Open Graph image, case study screenshots
_headers                        caching + security headers (Netlify, Cloudflare Pages)
robots.txt, sitemap.xml
scripts/set-domain.sh           switches every absolute URL to the real domain
tests/                          Playwright + axe-core suite
```

If you change the one-line inline script in a page's `<head>`, update its `sha256-` hash in `_headers`. The CSP test will fail until you do.

## Credits

- **Case study screenshots:** taken from the Legendary Detailing site; photography is Legendary Detailing's own.
- **Typefaces:** Bricolage Grotesque (The Bricolage Grotesque Project Authors) and JetBrains Mono (The JetBrains Mono Project Authors), both SIL OFL 1.1.
