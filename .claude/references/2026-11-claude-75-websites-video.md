# Reference: "You Won't Believe the Websites Claude Can Build Now" (Skill Leap AI)

- **Video:** https://youtu.be/6m9Wihe9sJ8 (14:29, published 2026-11-05)
- **Reviewed:** 2026-11-21, from the full transcript and a scene-by-scene visual walkthrough.
- **Why it's here:** Michael flagged it as a reference for future client sites. This note keeps what fits our business and design rules and says plainly what doesn't. `CLAUDE.md` and the skills in `.claude/skills/` still win over anything below.

## What the video shows

The presenter had Claude Code build 75 one-page sites from 75 fill-in-the-blank prompts (a free library behind a HubSpot form, which we did not open or copy). Each prompt has three parts: the business details as placeholders, a design spec (named fonts and brand colours), and about six build steps, including "use the `photos/` folder if there is one, otherwise skip it" and "check the site at phone, tablet and desktop sizes". They used the best model with the effort turned up high.

Seven builds were demoed. Each is built around **one big idea tied to the trade**:

| Site | Trade | The one idea |
|---|---|---|
| Plumbing company | Local service | Water runs down a pipe as you scroll and fills the logo at the end. Prices broken down on the page, the call button at the top, a short quote form. |
| Cold brew brand | Drinks | Moving cans and big animated type. A lot of motion. |
| Interior design | Studio | Real photographs (Unsplash stand-ins) in an editorial layout. |
| Black Friday sale | Shop promo | Split screen: left and right panels scroll differently. Strong mobile menu. |
| Jewellery | Product | A 3D gold ring, drawn in code with no images, turns as you scroll. |
| Video production | Agency | An editing-timeline animation; accordion FAQ. |
| Copywriting course | Education | Vintage editorial look; a pencil moves through sample copy. |
| SaaS launch | Tech | A rocket launches through mission stages as you scroll, with live readouts. |

Publishing: a private Claude artifact link for a quick preview, then drag-and-drop to Netlify with a GoDaddy domain.

## What we take

1. **One signature moment that comes from the trade.** The plumbing site is the right model for our clients: the animation *is* the plumber's work (water through a pipe), not decoration. This is the "one signature element" in `new-client-site` step 6 and a "dealt moment" in `design-taste-frontend`. Rules for doing it our way:
   - It lives in **its own section** (or the hero). It doesn't take over the whole page's scrolling.
   - It respects `prefers-reduced-motion` (show the finished state) and still makes sense with JavaScript off.
   - It's CSS or SVG, light enough to keep Lighthouse Performance high on a phone.
   - Ideas for the trades we serve: detailing (a shine sweeping across a panel, water beading off), hauling (a truck bed filling up, then driving off clean), lawn care (mowing stripes drawn in as you scroll), cleaning (a before/after wipe), roofing (shingles laying in rows), pressure washing (a clean strip cutting through grime).
2. **Brief first, in three parts.** Before building, write the brief the way their prompts are laid out. This matches `new-client-site` step 1:
   - **Business facts:** name, trade, city/area, services and *their* prices, phone, email, booking link, hours, the one action visitors should take. Missing facts stay empty and hidden.
   - **Design spec:** the brand system picked with `awesome-design`, two named fonts (self-hosted), brand colours from the client's logo, the signature moment from point 1.
   - **Build steps:** sections, the photo source, checks at 320 to 1920 px, tests, Lighthouse.
3. **Sales-page basics they got right.** The main CTA (call or quote) is at the top, prices are laid out clearly (only prices the client gave us), and the quote form is short. Mobile gets a real, easy-to-read menu, not a squeezed desktop one.
4. **Photos in one folder.** Put the client's photos in the repo before the build (then into `assets/img/` as responsive WebP). If the client has none yet, use licensed stand-ins (Unsplash) the way `design-taste-frontend` allows, list each one in the report, and swap them for the client's real photos as soon as they arrive.
5. **Layout ideas worth keeping on file:** the split-screen scroll for promo or seasonal pages; editorial layouts with big photos for studios and visual trades; accordion FAQs.
6. **Effort and review.** Use the strongest model at high effort for design builds. Claude Code's Remote Control lets Michael review progress and give feedback from his phone.
7. **Private preview links.** Publishing a draft as a private Claude artifact and sharing it is a quick way for Michael to show a client or prospect a preview before launch. It's a preview only; the real site always ships through our pipeline.

## What we don't take

1. **Netlify, GoDaddy or any client-held domain.** Our sites run on Cloudflare Workers with Static Assets, the domain is registered and held by M&M Websites, and launches go through `scripts/set-domain.sh` and the `ship-site` skill. Clients don't own the site, code, hosting or domain.
2. **3D objects and big scroll scenes on local-service sites.** The gold ring and the rocket fit product and tech pages. `design-taste-frontend` keeps WebGL and big scenes to tech pages, or to a 3D render the brief asks for. On a plumber's or detailer's site they cost speed and accessibility and don't help anyone call.
3. **Animation everywhere.** The cold-brew site moves constantly. We use one signature moment and quiet micro-interactions, and no fade-in on every section.
4. **Placeholder or invented facts.** The plumbing demo used a fake 555 number, and the video-production site shows sample metric cards (view duration, click-through rate). We never show placeholder contact details or made-up stats, results or reviews.
5. **Copying their template prompts.** With tens of thousands of views, those 75 designs will show up everywhere. Each client gets its own look from `awesome-design`, `design-taste-frontend` and `impeccable`.
6. **A bare `index.html` + `style.css` + `script.js` with no tests.** We keep the full pattern: test suite, axe, strict CSP with no inline scripts, security headers, and Lighthouse Accessibility, Best Practices and SEO at 100.

## Checklist for the next client build

- [ ] Brief written in three parts (facts / design spec / build steps), gaps listed for Michael.
- [ ] One signature moment that comes from the client's trade, in its own section, with a reduced-motion and no-JS fallback.
- [ ] Main CTA at the top; real prices only; short quote form; a proper mobile menu.
- [ ] Client photos in the repo (stand-ins listed for replacement if needed).
- [ ] No 3D or scroll scenes unless the client is tech or the brief asks for a product render.
- [ ] Checked in a real browser at phone, tablet and desktop widths; tests and Lighthouse pass.
- [ ] Optional: private artifact preview link for Michael to share before launch.
