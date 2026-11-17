---
name: case-study
description: Add a finished client site to the M&M Websites portfolio - take screenshots, build a work/<slug>/ case study page from verified facts only, add the home page project card, a sitemap entry and a test route, then ship with ship-site. Use when Michael says a client site is live and should go in the portfolio.
---

# Case study

## Shared rules (apply to every step)

1. **Nothing goes to clients or prospects without Michael's approval.** If the client should be told about the case study, draft the message for Michael; don't send it. Get Michael's confirmation that the client agreed to be featured.
2. **The only public email is `mnmwebsitesforyou@gmail.com`.** Never use or write `hello@mnmwebsitesforyou.com`.
3. **Pricing is $600 one-time setup + $45 a month maintenance.** The client's own prices may appear only inside their screenshots.
4. **Payments are card, Apple Pay or Link only.**
5. **Stripe is fully set up. Don't touch it.**
6. **One cold email per business, ever.** No follow-ups.
7. **No ownership promises.** Don't describe the client as owning the site, code or domain.
8. **No invented facts.** Describe only what the client's site actually contains. No traffic, bookings, revenue, rankings or quotes unless the client provided them in writing and Michael approved using them.

## Steps

1. **Gather verified facts.** Clone or open the client's repo and read its README, `CLAUDE.md` and code. Write a short fact list with a source for each line (file or check): business type and city, sections, form behaviour, stack, test suite size, accessibility and fallbacks. Nothing goes on the page that isn't on this list.
2. **Measure, don't copy claims.** Serve the client site locally (or use the live URL) and run Lighthouse mobile and desktop yourself. Only quote scores you measured, and say they're from your latest run.
3. **Take screenshots** with Playwright at deviceScaleFactor 2: desktop 1440×900 (hero, a key section like services or the form) and phone 390×844 (hero, the main action or form). Wait for animations, scroll to load lazy images, and crop out anything private (personal emails or addresses not shown publicly as business details).
4. **Convert to WebP** at responsive widths (desktop 720/1200/1800, phone 390/780, plus 560 if used in a hero), quality ~78, into `assets/img/work/<slug>/`. Make a 1200×630 JPG for Open Graph (`og-<slug>.jpg`).
5. **Build `work/<slug>/index.html`** by copying `work/legendary-detailing/index.html` and rewriting it: unique title and meta description, absolute canonical and `og:*` URLs on `https://mnmwebsitesforyou.com`, BreadcrumbList JSON-LD, one H1, the meta row (business, what we built, stack), figures with honest alt text and captions, and the closing call to action using the standard pricing wording. Keep the same nav, footer (policy links and "Manage billing") and inline `no-js` script so the CSP hash still matches.
6. **Add the home page card.** In `index.html` inside `#work`, copy the `<article class="project">` block between the `PORTFOLIO PROJECT` and `END PROJECT` comments, then update the name, kind, summary, four verified facts, images, alt text, link and a unique heading `id` with matching `aria-labelledby`.
7. **Add the sitemap entry** `https://mnmwebsitesforyou.com/work/<slug>/` with today's `lastmod`.
8. **Add the test route.** Append `'/work/<slug>/'` to `PAGES` in `tests/site.test.cjs` so layout, links, SEO, dark theme, typography, ownership, CSP and axe checks all cover the new page. Update any test that counts portfolio projects. Run the suite until everything passes.
9. **Ship it with the `ship-site` skill**: tests, content rules, Lighthouse on the new page, screenshot review in light and dark, push and live checks (including that the new page returns 200).
10. **Report to Michael:** the page link, the fact list with sources, Lighthouse numbers, the commit hash, and a draft note to the client if one is wanted (not sent).
