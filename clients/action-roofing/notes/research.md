# Action Roofing: research notes (internal, not published)

Everything on the site comes from this page. "Supported" means a public source says it; "Needs owner" means it must be confirmed before launch. `*.md` files are excluded from publishing by the repo's `.assetsignore`.

## Facts used on the site

| Fact | Status | Source | Where it shows |
|---|---|---|---|
| Name: Action Roofing (also published as Action Roofing Company, Action Roofing Co.) | Supported; preferred name needs owner | BBB, directories | Everywhere; alternates only in JSON-LD `alternateName` |
| Owner: Robert DeBord | Supported; spelling needs owner (some sources write "Debord") | BBB, Clarksville Now | Hero facts, proof strip, About, why section |
| Phone (931) 645-4784 | Supported | Directories, BBB | Everywhere |
| Email actionroofing@gmail.com | Supplied by the prospect | Brief | Footer, contact page, privacy page, JSON-LD |
| Clarksville, TN 37043 | Supported (city and ZIP only) | Directories | Footer, JSON-LD |
| Business started January 1, 1985 | Supported by BBB; needs owner OK | BBB | Proof strip, why, About, footer, JSON-LD `foundingDate` (switch `since_1985` in `scripts/build.py`) |
| BBB Accredited since July 23, 2019, A+ rating | Supported | BBB profile | Proof strip, hero facts, About (switch `bbb`); text link only, no badge |
| Community roof for Army veteran Keith Cherry with Windstar Roofing and ABC Supply (labor from both roofers, materials donated by ABC Supply) | Supported; needs owner OK | Clarksville Now, June 6, 2026 | Home and About community section (switch `community_story`); original summary + link, no article text or photos |
| Services: roof repair, roof replacement, storm-related roof repairs, siding, gutters | Supported (scope and materials need owner) | Business description, customer accounts | Service pages |
| Customer themes: Robert explaining the work, professional crews, cleanup, fair pricing, communication, rental property replacements, storm-related work | Reported experiences | Public reviews (Birdeye, Yellow Pages, BestProsInTown) | "What customers mention" box, labelled as past customers' experiences |
| Facebook page | Linked by BBB; ownership unconfirmed | BBB | Footer link, JSON-LD `sameAs` (switch `facebook`) |

## Kept off the site on purpose

- **Street address:** sources disagree (1231 vs 1230 Dunbar Cave Road). City only, no map pin.
- **Hours:** sources disagree (Mon–Fri 9–6 vs Mon–Sat 24 hours). Site says "Contact us to discuss availability". No emergency or 24/7 wording.
- **License 70499, "licensed and insured", bonding, certifications, warranties:** not verified.
- **Ratings and review counts:** Birdeye's 4.7 from 99 reviews spans several platforms; other directories differ. No rating, count, quote or reviewer name is shown, and none is in structured data.
- **The Lovable site (actionroofingclarksville.lovable.app):** ownership unknown; its "since 2001", 5.0 rating, 99+ reviews, same-day, one-day and 30-minute claims conflict with the record. Nothing copied.
- **Unconfirmed services:** metal/standing seam, commercial, flat/TPO/EPDM, skylights, soffit and fascia, ventilation and decking repair, windows, tarping, insurance claim help, gutter cleaning/guards/seamless. Not advertised. (The roof-layers diagram explains the parts of a typical shingle roof as general education; it doesn't advertise decking or ventilation work.)
- **Service-area towns** (Sango, Adams, Woodlawn, Pleasant View, Springfield, Oak Grove, Hopkinsville) and Kentucky: not confirmed, not named. The ZIP checker only says "in Clarksville" for 37040–37044 and asks everyone else to call.
- **Free estimates or inspections:** not confirmed, never said.

## Sources

- BBB: https://www.bbb.org/us/tn/clarksville/profile/roofing-contractors/action-roofing-company-0573-18000680
- Clarksville Now, June 6, 2026: https://clarksvillenow.com/local/veteran-gets-new-roof-from-local-builders-after-being-ghosted-by-contractor-that-revitalized-my-belief-in-people/
- Birdeye: https://reviews.birdeye.com/action-roofing-149533164111625
- Yellow Pages: https://www.yellowpages.com/clarksville-tn/mip/action-roofing-co-465735102
- BestProsInTown: https://www.bestprosintown.com/tn/clarksville/action-roofing-/
- BuildZoom (license reference, unverified): https://www.buildzoom.com/contractor/robert-debord-dba-action-roofing
- Tennessee license lookup (official): https://search.cloud.commerce.tn.gov/
- Facebook: https://www.facebook.com/actionroofingtn/
- Older domain (inaccessible during research): https://www.actionroofingtn.com/
- Directory page: http://actionroofingcotn.localsearch.com
- Google LocalBusiness guidance: https://developers.google.com/search/docs/appearance/structured-data/local-business
