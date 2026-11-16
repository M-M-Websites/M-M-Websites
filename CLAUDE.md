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
