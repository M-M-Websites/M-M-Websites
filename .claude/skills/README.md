# Claude skills for M&M Websites

Business skills (client sites, shipping, changes, audits, case studies) and design skills live in this folder. **Existing business rules in `CLAUDE.md` still win.** Do not invent testimonials, stats, or awards. Pricing is $999.99 setup + $74.99/month, with optional SEO at $249.99/month. Clients do not own the site, code, hosting, or domain. The only public email is `mnmwebsitesforyou@gmail.com`. Drafts only go out after Michael approves them.

## Design skills

Use these whenever you build or restyle a client site. The goal is to avoid the generic "AI website" look: beige backgrounds, default AI fonts, and italic emphasis words.

1. **awesome-design** — Curated brand design systems (84 `DESIGN.md` files) from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). Pick one system that fits the client and apply its tokens.
2. **design-taste-frontend** (Taste Skill) — Art direction drawn from real websites, real photographs, and a real-browser check, from [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill). Use this so pages look designed, not generated.
3. **impeccable** — Clean visual design, critique, polish, and anti-slop review from [pbakaus/impeccable](https://github.com/pbakaus/impeccable). The markdown playbooks are installed; the official engine binary was not downloaded (see `impeccable/SOURCE.md`).
4. **Emil Kowalski animation and design skills** from [emilkowalski/skills](https://github.com/emilkowalski/skills): `emil-design-eng` (main design-engineering skill), plus `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `choreograph`, `animation-performance`, `animation-vocabulary`, `apple-design`, `gestures`, `pick-ui-library`, `prototype`, `mobile-native`, `break-ui`, and `learn-taste`. Skipped as not relevant to M&M web client sites: `animate-expo`, `write-swift`, `ask-emil`, `ask-sonner`.

## Micro UI 100

**micro-ui-100** — The shared list of 100 checkable micro UI practices (MU-001 to MU-100). Every build or redesign implements all of them where applicable and ships a `micro-ui-checklist.md` marking each DONE (with evidence) or N/A (with a reason).

## Playwright

The Playwright MCP server is registered in the repo-root `.mcp.json` ([microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)). Use it to open the site in a real browser and verify layout, typography, spacing, motion, and mobile widths before shipping. Pair this with the `ship-site` skill.

## Business skills

`new-client-site`, `ship-site`, `client-change`, `prospect-audit`, and `case-study` are unchanged.

## SEO skills

Free, MIT-licensed. Use them on our site and every client site; the business rules above still apply (real facts only, no invented reviews, ratings or stats in schema or copy).

1. **SearchFit SEO** (`searchfit-*`, from [searchfit/searchfit-seo](https://github.com/searchfit/searchfit-seo)): `searchfit-seo-audit`, `searchfit-technical-seo`, `searchfit-on-page-seo`, `searchfit-schema-markup`, `searchfit-ai-visibility`, `searchfit-keyword-clustering`, `searchfit-content-strategy`, `searchfit-content-brief`, `searchfit-internal-linking`, `searchfit-broken-links`, `searchfit-content-translation`. Markdown only, no account. Each skill ends with a pitch for the paid SearchFit.ai service; ignore it.
2. **search-visibility-kit** (`svk-*`, from [PapiScholz/search-visibility-kit](https://github.com/PapiScholz/search-visibility-kit)): `svk-setup-google-access`, `svk-onboard-site`, `svk-seo-audit` (live Search Console and GA4 data) and `svk-indexnow`. The Search Console and GA4 parts need the `gsc` and `analytics` MCP servers and a Google service account JSON key on the machine running Claude (see the kit's SETUP.md). Never commit that key or paste it into chat. IndexNow needs no account: our key file is `/<key>.txt` at the site root.
