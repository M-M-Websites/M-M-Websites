---
name: new-client-site
description: Set up a new client website repo from the M&M Websites / Legendary Detailing pattern (settings file, standard sections, Playwright + axe test suite, security headers, domain script, Cloudflare Worker config, Lighthouse target). Use when Michael says a new client has signed up or asks to start a client's site.
---

# New client site

## Shared rules (apply to every step)

1. **Nothing goes to clients or prospects without Michael's approval.** Write drafts only; Michael reviews and sends. Never send email, post, or submit forms on anyone's behalf.
2. **The only public email is `mnmwebsitesforyou@gmail.com`.** Never use or write `hello@mnmwebsitesforyou.com`.
3. **Pricing is $600 one-time setup + $45 a month maintenance.** Never quote anything else unless Michael says so.
4. **Payments are card, Apple Pay or Link only.** Never mention Cash App, Klarna, Amazon Pay, bank debit, PayPal or any other method.
5. **Stripe is fully set up. Don't touch it**: no new products, prices, payment links, portal or branding changes.
6. **One cold email per business, ever.** No follow-ups.
7. **No ownership promises.** Clients do not own the website, code, hosting or domain; if they stop paying, the site goes offline, the domain is paused and updates stop. They keep their own name, logo, photos and words. Never write "you own", "yours to keep", "in your name" or "hand it over", on the client's site or anywhere else.
8. **No invented facts**: no testimonials, reviews, client counts, years in business, stats, results, awards, prices, hours, addresses or phone numbers that the client hasn't confirmed in writing. Missing facts stay empty and hidden; never fill them with placeholders that look real.

## Steps

1. **Collect the brief before writing anything.** You need: business name, trade, city/service area, the client's own services and prices (if they publish prices), contact methods (phone, email, booking link, socials), photos they supplied, logo, and the one action visitors should take (call, book, request a quote). List anything missing and ask Michael; don't guess.
2. **Pick a slug and a repo.** Use the business name in kebab case (e.g. `legendary-detailing`). Michael creates the GitHub repo under `M-M-Websites/`; clone it next to this one.
3. **Start from the pattern, not from scratch.** Use `M-M-Websites/legendary-detailing` (client site) and this repo (studio site) as references for structure only. Copy the mechanics, never the content or the look:
   - `index.html`, `404.html` (root-relative asset paths), `robots.txt`, `sitemap.xml`, `.nojekyll`, `.gitignore`, `.assetsignore`
   - `assets/css/`, `assets/js/main.js`, self-hosted fonts in `assets/fonts/` with their `OFL.txt` (or other licence)
   - `scripts/set-domain.sh` (rewrites the canonical, Open Graph, JSON-LD, sitemap and robots URLs and writes `CNAME`)
   - `tests/package.json` and `tests/site.test.cjs`
   - `wrangler.toml` + `worker.js` (Cloudflare Worker with Static Assets, `not_found_handling = "404-page"`, `html_handling = "auto-trailing-slash"`)
4. **Create one owner settings file** (`assets/js/content.js` or `config.js`) holding contact details, socials, hours, reviews and the form email. Every value starts empty unless confirmed. Anything empty must be hidden on the page, and the form must say plainly that it isn't connected yet instead of pretending to send.
5. **Build the standard sections**, adapted to the trade: hero with one clear offer and CTA, services (with the client's real prices only if they gave them), work/gallery from their own photos, why choose them (from facts they gave), service area, booking or quote form, FAQ, footer. Reviews stay hidden until real ones exist, word for word.
6. **Give the client their own visual identity.** Don't reuse M&M's paper/ink/red or Legendary's black/gold. One signature element, deliberate type, restrained motion, `prefers-reduced-motion` respected, and the page works with JavaScript off.
7. **SEO basics:** unique title and description, exactly one H1 naming the service and city, logical H2/H3s, absolute canonical (placeholder domain until `set-domain.sh` runs), Open Graph tags and image, `LocalBusiness`-type JSON-LD with only confirmed fields (no address if they come to the customer).
8. **Security headers in `_headers`:** `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS, caching rules for `assets/*`, and a strict CSP with no `unsafe-inline` or `unsafe-eval`. Allow only the hosts the site really uses (e.g. `formsubmit.co`, `static.cloudflareinsights.com`). If there is an inline `no-js`→`js` script, put its `sha256-` hash in `script-src`.
9. **Write the test suite** covering: layout at 320/390/768/1024/1440/1920px with no horizontal overflow, no console errors or failed requests, tap targets ≥ 44px, in-page and internal links, form validation plus success and failure with FormSubmit mocked (never send real email), the unconnected-form state, axe-core with zero violations (light and dark if the site has a dark theme), JS-off and reduced-motion fallbacks, the exact CSP from `_headers`, the 404 page, `set-domain.sh`, and a content check that fails on invented or placeholder text.
10. **Take the client's own wording rules into the repo:** add a `CLAUDE.md` with their confirmed facts, prices and anything they don't want said.
11. **Hit the Lighthouse target:** Accessibility, Best Practices and SEO = 100 on mobile and desktop; Performance as high as practical (aim ≥ 90 mobile). Use responsive WebP images with width/height, preload the main font, lazy-load below-the-fold images.
12. **Ship it with the `ship-site` skill.** Once Michael has the client's domain, run `bash scripts/set-domain.sh <domain>` before the first live push.
13. **Report back to Michael:** what was built, test and Lighthouse results, every empty setting the client still needs to supply, and a draft handover message for Michael to review and send. Don't send it.
