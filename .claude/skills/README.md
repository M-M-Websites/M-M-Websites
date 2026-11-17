# Claude skills for M&M Websites

Business skills (client sites, shipping, changes, audits, case studies) and design skills live in this folder. **Existing business rules in `CLAUDE.md` still win.** Do not invent testimonials, stats, or awards. Pricing stays $600 setup + $45/month. Clients do not own the site, code, hosting, or domain. The only public email is `mnmwebsitesforyou@gmail.com`. Drafts only go out after Michael approves them.

## Design skills

Use these whenever you build or restyle a client site. The goal is to avoid the generic "AI website" look: beige backgrounds, default AI fonts, and italic emphasis words.

1. **awesome-design** — Curated brand design systems (84 `DESIGN.md` files) from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). Pick one system that fits the client and apply its tokens.
2. **design-taste-frontend** (Taste Skill) — Art direction drawn from real websites, real photographs, and a real-browser check, from [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill). Use this so pages look designed, not generated.
3. **impeccable** — Clean visual design, critique, polish, and anti-slop review from [pbakaus/impeccable](https://github.com/pbakaus/impeccable). The markdown playbooks are installed; the official engine binary was not downloaded (see `impeccable/SOURCE.md`).
4. **Emil Kowalski animation and design skills** from [emilkowalski/skills](https://github.com/emilkowalski/skills): `emil-design-eng` (main design-engineering skill), plus `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `choreograph`, `animation-performance`, `animation-vocabulary`, `apple-design`, `gestures`, `pick-ui-library`, `prototype`, `mobile-native`, `break-ui`, and `learn-taste`. Skipped as not relevant to M&M web client sites: `animate-expo`, `write-swift`, `ask-emil`, `ask-sonner`.

## Playwright

The Playwright MCP server is registered in the repo-root `.mcp.json` ([microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)). Use it to open the site in a real browser and verify layout, typography, spacing, motion, and mobile widths before shipping. Pair this with the `ship-site` skill.

## Business skills

`new-client-site`, `ship-site`, `client-change`, `prospect-audit`, and `case-study` are unchanged.
