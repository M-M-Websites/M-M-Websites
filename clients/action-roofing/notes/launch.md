# Action Roofing: missing assets, integrations and launch steps (internal)

## Assets the owner needs to supply

- Logo (any format; we'll redraw as SVG if needed)
- Robert's portrait
- Crew photo
- Truck photos
- 10–20 original project photos
- Before-and-after pairs
- Three project write-ups (where, what was wrong, what was done)
- Approved reviews with names and sources (or permission to quote specific public reviews)

## Integrations to set up

| Integration | Status | What's needed |
|---|---|---|
| Estimate form delivery | Preview mode (`formAction: ''`) | Owner confirms the inbox (proposed actionroofing@gmail.com). Set `formAction` in `assets/js/config.js` to `https://formsubmit.co/<address>`, add `https://formsubmit.co` to the client domain's CSP (`connect-src`, `form-action`), send one test, have the owner click FormSubmit's activation email. No keys live in client code. |
| Form spam protection | Honeypot + minimum fill time in the page; FormSubmit adds its own captcha (`_captcha=true`) | Nothing more unless spam shows up |
| Photo uploads | Checked in the browser (type, 10 MB, 5 max) | FormSubmit attaches them to the email; confirm the size limit with the plan in use |
| Analytics | None | Optional: Cloudflare Web Analytics (cookieless), then update the privacy page |
| Domain | Not chosen | M&M registers and holds the domain; run `AR_PREVIEW=0` build with `SITE_URL` set to it |
| Google Business Profile / Search Console | Not started | After launch, with the confirmed address decision |

## Launch steps

1. Work through `owner-checklist.md`; flip the switches in `scripts/build.py` to match.
2. Swap in the owner's photos (keep the `name-960.webp` / `name-480.webp` sizes), add Projects and Reviews pages only if there's real content.
3. Set `SITE_URL`, build with `AR_PREVIEW=0`, connect the form.
4. Give the client domain its own `_headers` (security headers, a CSP that allows FormSubmit, long cache on `assets/*`) and `www` → apex redirect.
5. Run the tests and Lighthouse; smoke-test on iPhone Safari, Android Chrome, desktop Safari, Firefox and Edge (only Chromium was available while building).
6. Submit the sitemap in Search Console.
