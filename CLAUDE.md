# M&M Websites: rules for anyone editing this site

## Business model (do not contradict this anywhere)

- Every client pays **$600 one time** for website setup and **$45 a month** for maintenance (Stripe Payment Link in `index.html`, `#pay-link`).
- **Clients do not own the website, its code, the hosting or the domain.** M&M Websites owns and runs all of it and provides it as a service while the monthly plan is active. Clients cannot transfer it, copy it or hand it to anyone else.
- **If a client stops paying or cancels:** the site is taken offline (no longer public), the domain is paused, updates stop, and there is no access to the code.
- Clients keep the rights to their own business name, logo, photos and the words they supply.
- **Payments:** Stripe checkout takes cards, Apple Pay and Link only. Don't mention any other payment method (Cash App, Klarna, Amazon Pay, bank debit, PayPal...). Checkout requires accepting the Terms; Stripe emails receipts; failed payments are retried automatically.
- **Billing self-service:** Stripe Customer Portal, `https://billing.stripe.com/p/login/7sY28qcdi8Bg29nbfEaEE00`, linked as "Manage billing".
- **Email:** `mnmwebsitesforyou@gmail.com` is the only public email. Never use `hello@mnmwebsitesforyou.com`.

Never write copy, FAQ answers, policy text or marketing that says clients "own" the site, code or domain, that it's "yours to keep", "in your name", or that it can be moved or handed over. `tests/site.test.cjs` (the *ownership* test) fails if such wording appears on any page.

Pages that state these rules and must stay in sync: the home page (hero note, Launch help, Why us, Pricing points, FAQ "Do I own the website?" and "What happens if I stop paying?"), `terms/` (section 5 and 7) and `refunds/` (section 5). The Open Graph image (`assets/img/og-image.jpg`) says "fully managed".

## Other content rules

- No invented facts: no testimonials, client counts, years in business, stats or awards. Only real portfolio work, described as it is.
- Contact settings live in `assets/js/config.js`.
- Run `cd tests && npm test` before pushing; keep Lighthouse Accessibility, Best Practices and SEO at 100.

## Client sites live in this repo

Every client website is built and kept in this repo at `clients/<slug>/`, one self-contained folder per client with its own tests, `wrangler.toml`, `CLAUDE.md` (the client's confirmed facts) and `seo/` folder. The studio site stays at the root, and the root `.assetsignore` lists `clients` so client sites are never published on mnmwebsitesforyou.com. When working on a client, read `clients/<slug>/CLAUDE.md` too and run that folder's tests (`cd clients/<slug>/tests && npm test`).

## SEO skills run on every website build (required)

Whenever a session builds, rebuilds, redesigns or adds pages to any website in this repo, run the `new-client-site` skill (for a new client) and its `hr-*` SEO steps without being asked; they are part of the build, not an extra:

1. Before writing copy: `hr-seo-project-setup`, `hr-seo-context`, `hr-keyword-research`, `hr-keyword-clustering` (keyword map decides titles, H1s and headings).
2. During the build: `hr-schema-markup` and the `hr-ai-search-visibility` basics (answer-first sections, quotable real facts, AI crawlers not blocked).
3. Before launch: `hr-seo-audit` and a `hr-google-business-profile` draft for the client.
4. After launch: one dated follow-up in the site's `seo/README.md` for 28 days later (`hr-seo-audit` and `hr-local-seo` on real Search Console data).

For a new page or redesign on an existing site, run steps 1 to 3 for the pages that change. The SEO folder is `seo/` for the studio site and `clients/<slug>/seo/` for a client; it is never published. Numbers we don't have (search volume, difficulty, Maps positions) stay `unknown`, and these skills never override the business rules above. Say in the final report which `hr-*` steps ran and where their files are, and if one couldn't run (for example no Search Console access yet), say why.

## Design skills for client sites

When building or restyling a client site, use the design skills in `.claude/skills/` (see `.claude/skills/README.md`) so the work does not look like a generic AI website (beige backgrounds, default AI fonts, italic emphasis words). Pick a real brand system with `awesome-design`, pull art direction from real sites with `design-taste-frontend`, polish with `impeccable`, and use Emil Kowalski's skills for animation. Before shipping, verify the design in a real browser with the Playwright MCP server in `.mcp.json`. These skills do not change the business rules above.
