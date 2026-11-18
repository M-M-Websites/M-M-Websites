# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Owners of small local service businesses (auto detailers, trades, salons, restaurants and similar) who have no website or a poor one. They usually find and judge the studio on a phone, between jobs or after hours, and decide quickly. They want customers to book or call; they do not want to learn or manage website tools.

## Product Purpose

M&M Websites designs, builds, hosts and maintains websites for these businesses. Success for the studio site: a visiting owner understands the offer within seconds, trusts it from real work and plain terms, and either starts checkout or sends project details.

## Positioning

Fully managed for one flat price. Every client pays $600 once for setup and $45 a month for maintenance; M&M builds the site, hosts it, runs the domain and makes updates, so the owner never touches it. Template builders leave the work to the owner; freelancers usually hand off and disappear.

## Operating Context

- Discovery mostly on phones; the decision is often made in one visit.
- Checkout is a Stripe Payment Link (cards, Apple Pay and Link only); billing self-service is Stripe's Customer Portal ("Manage billing").
- Questions come through the "Start a project" form (FormSubmit to `mnmwebsitesforyou@gmail.com`, the only public email).
- Hosting: static HTML/CSS/vanilla JS, no build step, Cloudflare Worker with static assets; `_headers` CSP (script hash, no inline styles).

## Capabilities and Constraints

- Services: custom hand-built websites, booking/quote forms, search basics, launch (domain, hosting, Google Business Profile help), monthly updates.
- Business rules in `CLAUDE.md` are binding: clients do not own the site, code, hosting or domain; non-payment takes the site offline and pauses the domain; payment methods are cards, Apple Pay and Link only.
- Pages: home, Legendary Detailing case study, Terms, Privacy, Refunds, 404.
- The Playwright + axe suite (`tests/`) and Lighthouse 100 for Accessibility, Best Practices and SEO must keep passing.

## Brand Commitments

- Name: M&M Websites. No visual identity is binding; the user chose to start fresh (Nov 2026 redesign).
- Voice: plain, honest, specific; no hype.

## Evidence on Hand

- One real client: Legendary Detailing (mobile auto detailing, Memphis, TN). Real screenshots in `assets/img/work/legendary-detailing/`, verified Lighthouse scores and features described in `work/legendary-detailing/`.
- Absent and never to be invented: testimonials, client counts, years in business, stats, awards, team photos.

## Product Principles

1. Say the price and the deal plainly; nothing hidden.
2. Show real work, described as it is.
3. Every page leads to one next step: start, or ask a question.
4. The owner's time is the scarce thing; the site sells not having to think about the website.

## Accessibility & Inclusion

WCAG 2.2 AA, keyboard-operable, visible focus, 44px tap targets, reduced-motion and no-JS fallbacks (enforced by the test suite).
