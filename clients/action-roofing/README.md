# Action Roofing: website preview

Preview URL: https://mnmwebsitesforyou.com/clients/action-roofing/ (noindex, blocked in robots.txt)

A 9-page static site plus a 404 for Action Roofing, a roofing contractor in Clarksville, Tennessee, led by owner Robert DeBord. It's built to turn visitors into phone calls and estimate requests.

## Site structure

| Page | Path | Purpose |
|---|---|---|
| Home | `/` | Hero with call and estimate buttons over a looping video; proof strip (1985, BBB A+, owner-led, community); four services; **the roof-layers scroll scene**; why us + what customers mention; **"start with what you're seeing" picker**; community story; service area with **ZIP check**; FAQ; estimate form |
| Roof Repair | `/roof-repair/` | Signs, how a repair visit works, repair-or-replace, FAQ, form (pre-set to roof repair) |
| Roof Replacement | `/roof-replacement/` | Signs, four-step process, rental owners note, roof-layers scene, FAQ, form |
| Storm Damage Roof Repair | `/storm-damage-roof-repair/` | Signs, what to do first after a storm, insurance note (neutral), FAQ, form |
| Siding & Gutters | `/siding-gutters/` | Siding and gutter signs side by side, FAQ, form |
| About | `/about/` | Starter copy, facts at a glance with BBB link, how we work, customer themes, community story |
| Service Area | `/service-areas/` | Clarksville, ZIP check, "outside Clarksville? call" |
| Contact | `/contact/` | "Let's Talk About Your Roof", estimate form, other ways to reach them |
| Privacy Policy | `/privacy/` | Draft that matches what the site really does |
| 404 | `/404.html` | Branded, links home and to the main pages |

Not built on purpose: **Projects** and **Reviews** pages (no real photos or approved reviews yet). The review component exists in `scripts/build.py` (`reviews_section`) and renders once `REVIEWS` has entries.

## What's implemented, what's mocked, what's left

**Implemented and tested**
- All pages, navigation (desktop bar, full-screen phone menu with focus handling), sticky phone dock that steps aside for the hero buttons and the form.
- Hero video (tablet and desktop only, paused off-screen, pause button, skipped on phones, reduced motion, Save-Data and slow connections).
- Roof-layers scene: the section pins and a shingle roof builds layer by layer as you scroll (deck, drip edge, underlayment, starter strip, shingles, ridge cap, gutters). With reduced motion or JavaScript off it shows the finished roof and the full list.
- Picker, ZIP check, FAQ (open answers go in the address), estimate form with inline validation, photo upload previews (5 photos, 10 MB each, images only), honeypot and too-fast spam guards.
- SEO: unique titles and descriptions, canonical URLs, Open Graph and Twitter cards, `RoofingContractor`, `Service`, `BreadcrumbList` and `FAQPage` JSON-LD with confirmed facts only, sitemap, robots, llms.txt, manifest and icons.

**Mocked**
- **The form is in preview mode.** It validates everything, then says plainly that nothing was sent and shows the request Action Roofing would get, with a call button. There's no fake success message.
- **All imagery is AI-generated illustration** (see `notes/assets.md`). The footer says so.
- The wordmark is plain text and the favicon is a plain "A". Neither is their logo.

**Left before launch**: see `notes/launch.md` and `notes/owner-checklist.md`.

## Files

- `scripts/build.py` writes every page. Facts, switches and copy live there. Run `python3 clients/action-roofing/scripts/build.py`. `AR_PREVIEW=0` builds the launch version (indexable).
- `assets/css/site.css`, `assets/js/main.js`, `assets/js/config.js` (form setting).
- `tests/site.test.cjs`: 24 end-to-end tests (production CSP, axe on every page at 1440 and 390, overflow at 5 widths, tap targets, links, SEO, banned-claims check, form, spam guards, picker, ZIP check, roof scene, video, menu, keyboard, JS off, 404).
- `notes/`: research and sources, owner checklist, asset provenance, launch list. `micro-ui-checklist.md`: the M&M Micro UI 100.

Run the tests:

```bash
cd clients/action-roofing/tests && node site.test.cjs
```

## Checks run (2026-11-21)

- Test suite: 24/24 pass.
- Lighthouse (home, roof replacement, about, contact): Performance 98–100 mobile, 100 desktop; Accessibility 100; Best Practices 100. SEO is held down only by `is-crawlable`, because the preview is noindex and `/clients/` is disallowed in the M&M robots.txt. Every other SEO audit passes, so on the client's own domain it scores 100.
- tasteskill copy-lint: 0 FAIL on every page; one WARN kept (numbered steps, which are real sequences).
- tasteskill gate: open FAILs remain where the kit's rules conflict with this brief (it wants no real phone number or ZIP code, a different heading than the one the client specified, and every section exactly one or two screens tall). The real bugs it found (a mobile column offset in the roof scene, header alignment) were fixed.
