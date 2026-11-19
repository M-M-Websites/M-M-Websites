# Legendary Detailing: rules for anyone editing this client site

This is an M&M Websites client site, kept in the M&M Websites repo at `clients/legendary-detailing/`. The repo-root `CLAUDE.md` (business model, pricing, no ownership wording, no invented facts, required `hr-*` SEO steps) applies here too and wins over anything below.

## Confirmed facts (from this folder's README and pages; don't add any that aren't here)

- Business: **Legendary Detailing**, a mobile auto detailing business in **Memphis, Tennessee**. The copy, service-area section and structured data target the Memphis area.
- Prices and packages: as written in `index.html` (services section, booking form `data-price`, FAQ "How much does a detail cost?" and the `hasOfferCatalog` JSON-LD). They match the business flyer. A price change means updating all of them (see `client-change`).
- Service area neighborhoods: `index.html` `.area__list` and the FAQ "What areas of Memphis do you serve?". Keep both in sync.
- Booking form: FormSubmit, sending to the address in the form `action` in `index.html` (see README step 4 for activation).
- Owner settings (hours, socials, analytics, reviews): `assets/js/content.js`. Empty values stay empty and hidden.

## Content rules for this site

- Reviews only if real, word for word. The reviews section stays hidden until one exists. No `aggregateRating` or `review` in JSON-LD unless real reviews are shown.
- No hours, address, years in business, stats or awards until the owner confirms them in writing.
- `docs/SEO.md` is the existing SEO guide for this site; SEO work now also uses the repo's `hr-*` skills and keeps its files in `seo/` here (never published).

## Testing and shipping

- `cd clients/legendary-detailing/tests && npm install && npm test` before pushing; ship with `ship-site`.
- The site isn't on its own domain yet. Before the first live push on a domain, run `bash scripts/set-domain.sh <domain>` from this folder (it also fixes the `/legendary-detailing/` paths in `404.html` left from the GitHub Pages preview).
- Hosting: Cloudflare Worker `legendary-detailing` (`wrangler.toml` here, assets directory is this folder). Workers Build settings: this repo, root directory `clients/legendary-detailing`, watch path `clients/legendary-detailing/*`.
