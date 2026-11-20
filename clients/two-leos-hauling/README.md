# Two Leos Hauling LLC: website preview

Preview URL: https://mnmwebsitesforyou.com/clients/two-leos-hauling/

A 7-page static site for a Spokane junk removal and hauling business: Home, Junk Removal,
Property Cleanouts, Yard Debris Removal, General Hauling, About, and Contact/Quote, plus a 404 page.

## What's on it

- **Hero:** "Junk Gone. Space Back." over a looping Higgsfield video. The video plays on
  tablets and desktops only, after the photo has painted. It is skipped on phones, with
  reduced motion, with Save-Data and on slow connections.
- **"Will it fit in one trip?":** a trailer calculator. Add items and the 14-yard trailer
  fills, and the load carries into the quote form.
- **Quote form:** name, phone, email, ZIP, service, items, load size, photo uploads,
  preferred date and consent. It has inline validation and a honeypot against spam bots.
- **Sticky Call / Text / Get a quote dock** on phones.
- **SEO:**
  - unique titles and descriptions, canonical URLs, Open Graph and Twitter tags
  - LocalBusiness, Service, Breadcrumb and FAQPage JSON-LD, using verified facts only and no
    street address
  - sitemap.xml, robots.txt and llms.txt
- **Disclosure:** every photo is an illustration, labelled as such, and the footer says so.

## Files

- `scripts/build.py` writes every page. Edit facts and copy there, then run
  `python3 clients/two-leos-hauling/scripts/build.py`.
- `assets/css/site.css`, `assets/js/main.js`
- `assets/js/config.js` holds the form settings (see "Going live").
- `tests/site.test.cjs` is the end-to-end suite (29 tests): every page under the production
  CSP, axe accessibility, overflow at 5 widths, links, images, SEO tags, no invented claims,
  the calculator, form errors, photo uploads, preview mode and live mode (intercepted).

Run the tests:

```
cd clients/two-leos-hauling/tests && NODE_PATH=/opt/node-tools/node_modules node site.test.cjs
```

## Going live (only after the owner agrees)

1. **Form:** in `assets/js/config.js` set
   `formAction: 'https://formsubmit.co/96shadle@gmail.com'`. The first real request makes
   FormSubmit email the owner an "Activate Form" link, and he clicks it once. Until then the
   form runs in preview mode: it validates and shows the exact request he would get, but sends
   nothing.
2. **Domain:** in `scripts/build.py`, set `SITE_URL` to the new domain and `PREVIEW = False`.
   That removes `noindex` and opens robots.txt. Rebuild, then submit the sitemap in Search
   Console.
3. **Real content:** replace the illustrations with real photos and remove the "illustrative
   photo" labels and the footer disclaimer.

## Still needed from the owner

- [ ] Owner name(s) and the story behind "Two Leos" (About page placeholder)
- [ ] Real photos: trailer, truck, crew, before/after jobs (Before & After placeholders)
- [ ] Service area: which cities and ZIP codes beyond Spokane
- [ ] Accepted / not accepted items (mattresses, tires, paint, hazardous materials, concrete, dirt)
- [ ] Pricing approach and whether estimates are free. The site currently says "you'll get a
      price for your job" and makes no "free" claim
- [ ] Logo and brand colors, if he has them. The current mark is a placeholder trailer icon
- [ ] Confirm phone (509) 688-5071, email 96shadle@gmail.com and hours (daily 8 AM–9 PM)
- [ ] Is 1114 E Courtland Ave a public address or a home? It is **not** published right now
- [ ] License: confirm 606 286 589 and its type. Insurance status. Neither is claimed beyond
      "as listed"
- [ ] Google Business Profile link and any real reviews he wants shown
- [ ] Domain name he wants, or one we register
