---
name: awesome-design
description: >
  Pick and apply a real brand design system from the vendored awesome-design-md
  collection (84 DESIGN.md files). Use when building or restyling a client
  website so the look comes from a coherent real-world system instead of a
  generic AI palette (beige backgrounds, default AI fonts, italic emphasis words).
---

# Awesome design

This skill vendors [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT). It is a library of `DESIGN.md` files extracted from real brand sites, not a code generator.

## When to use

Use this whenever you start or restyle a client site for M&M Websites. Pick one system that fits the client's trade and personality, then treat that `DESIGN.md` as the visual spec.

Do not invent a generic palette. Do not default to Inter, beige canvases, purple-to-blue gradients, or italicized emphasis words.

## How to pick a system

1. Read the client's business, audience, and tone (trade, city, photos, existing colors if they have a logo).
2. Open [catalog.md](catalog.md) and shortlist 2–3 slugs whose mood matches. For local service businesses (detailers, cleaners, painters, shops), prefer photography-forward or product brands (`apple`, `nike`, `airbnb`, `starbucks`, `tesla`, `bmw`) over developer-tool systems (`linear.app`, `vercel`, `stripe`) unless the client is actually a software company.
3. Load `design-md/<slug>/DESIGN.md` and use its color roles, typography, components, spacing, and elevation as a hard spec.
4. Adapt, don't clone. Keep the structure and quality of the system, but do not copy trademarks, logos, or proprietary font files. Substitute a close open font (Google Fonts or system fonts) when the brand typeface is proprietary. Never claim the site is "made by" or "officially" that brand.
5. Stay inside M&M business rules in `CLAUDE.md`: no invented testimonials, stats, or awards; $600 setup + $45/mo; clients do not own the site; public email is `mnmwebsitesforyou@gmail.com` only.

## After applying

- Keep typography and color tokens consistent across every page.
- Use the Impeccable skill to critique and polish.
- Use the Taste skill (`design-taste-frontend`) when the page still feels generic or needs art direction from real sites.
- Use Emil Kowalski's skills (`emil-design-eng`, `animate`, `review-animations`) for motion.
- Before shipping, verify the design in a real browser with the Playwright MCP server and the `ship-site` skill.

## Source

- Upstream: https://github.com/VoltAgent/awesome-design-md
- License: MIT (see `LICENSE`)
- Collection path: `design-md/<slug>/DESIGN.md`
