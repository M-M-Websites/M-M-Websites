---
name: ship-site
description: Ship a change to the M&M Websites site or a client site safely - run the test suite, check the content rules in CLAUDE.md, run Lighthouse, review screenshots, push to main, then verify the live headers, redirects and 404 page. Use whenever a change is ready to go live.
---

# Ship site

## Shared rules (apply to every step)

1. **Nothing goes to clients or prospects without Michael's approval.** Write drafts only; Michael reviews and sends.
2. **The only public email is `mnmwebsitesforyou@gmail.com`.** Never use or write `hello@mnmwebsitesforyou.com`.
3. **Pricing is $999.99 one-time setup + $74.99 a month updates and maintenance, plus optional SEO optimization at $249.99 a month.**
4. **Payments are card, Apple Pay or Link only.** Never mention any other method.
5. **Stripe is fully set up. Don't touch it.** Shipping never changes Stripe; only the site's existing `#pay-link` and "Manage billing" links are used.
6. **One cold email per business, ever.** No follow-ups.
7. **No ownership promises.** Clients do not own the website, code, hosting or domain.
8. **No invented facts.** If you can't point to where a fact came from, it doesn't ship.

## Steps

1. **Sync first.** `git fetch origin` and `git status -sb`. If `main` is behind, rebase onto `origin/main` and re-read anything a teammate changed before continuing. Never force-push `main`.
2. **Run the tests.** `cd tests && npm install && npm test` (set `CHROME_PATH` to an installed Chromium if needed). Every test must pass. If one fails, fix the cause; never skip, delete or weaken a test to get green. If behaviour changed on purpose, update the test and say so.
3. **Check the content rules by hand** across every changed page (and `assets/img/og-image.jpg` if copy changed):
   - Prices appear only as $999.99 setup, $74.99 a month, $1,074.98 due at signup and $249.99 a month for SEO.
   - Payment methods mentioned are only card, Apple Pay and Link.
   - The only email is `mnmwebsitesforyou@gmail.com`; grep for `hello@` and fix any hit.
   - No ownership wording ("you own", "yours to keep", "in your name", "hand over", "move it"). The FAQ, `terms/` section 5 and 7 and `refunds/` section 5 still agree.
   - No testimonials, stats, client counts or claims you can't source.
   - Typographic apostrophes and ellipses, one H1 per page.
4. **If the inline `<head>` script changed,** recompute its `sha256-` hash and update `script-src` in `_headers`. The CSP test will fail until it matches.
5. **Run Lighthouse** on the home page and every changed page, mobile and desktop, against a local server that applies `_headers`. Accessibility, Best Practices and SEO must be 100; Performance should stay where it was (home page currently 99 mobile, 100 desktop). Write down the real numbers.
6. **Review screenshots yourself** at 390px and 1440px, in light and dark themes, for every changed section: look for overflow, clipped text, overlaps, broken images, contrast problems and anything that looks unfinished. Fix and re-run steps 2-6 if anything is wrong.
7. **Commit and push.** Clear commit message describing what changed and why, ending with the attribution lines. `git push origin main`. Don't open a pull request unless Michael asks.
8. **Wait for the deploy.** Cloudflare builds from `main`, usually in 1-2 minutes. If you can't see the Cloudflare dashboard, ask Michael to confirm the deployment for the new commit shows *Success*.
9. **Check the live site** (`https://mnmwebsitesforyou.com` or the client's domain):
   - `curl -sI https://<domain>/` returns 200 with the `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` headers, and the CSP matches `_headers` exactly.
   - `https://www.<domain>/some/path?x=1` 301-redirects to `https://<domain>/some/path?x=1`, and `http://` redirects to `https://`.
   - `https://<domain>/no-such-page` returns **404** with the branded 404 page, not a 200 or a blank page.
   - The page loads in a browser with no console errors, and the changed content is visible. If cached CSS hides it, note that a hard refresh shows it.
   - If the environment blocks outside hosts, say so and list which checks Michael should run instead. Don't report them as passed.
10. **Report to Michael:** commit hash, test count, Lighthouse numbers, what was verified live, and anything that still needs his attention.
