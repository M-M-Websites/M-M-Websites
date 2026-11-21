# Action Roofing: owner confirmation checklist (internal)

Go through this with Robert before launch. "Site now" is what the preview does today; switches live at the top of `scripts/build.py` (`APPROVED`, `REVIEWS`, `PROJECTS`) and the form setting in `assets/js/config.js`.

| # | Confirm | What we have | Site now |
|---|---|---|---|
| 1 | Preferred business name | Action Roofing / Action Roofing Company / Action Roofing Co. | "Action Roofing"; others only in structured data |
| 2 | Owner name and capitalization | DeBord (some directories: Debord) | "Robert DeBord" |
| 3 | Founding year | BBB: January 1, 1985 (an unrelated preview site says 2001) | Shown as 1985 (`since_1985` switch) |
| 4 | Street address, and whether customers visit it | 1231 vs 1230 Dunbar Cave Road, 37043 | City and ZIP only, no map |
| 5 | Office hours and emergency availability | Mon–Fri 9–6 vs Mon–Sat 24 h | "Contact us to discuss availability" |
| 6 | Actual services and materials | Roofing, repair, replacement, storm repairs, siding, gutters | Those five only, no materials named |
| 7 | Residential vs commercial | Unknown | Homes and rental properties only |
| 8 | Service areas, Kentucky coverage | "Clarksville and surrounding areas" | Clarksville named; others asked to call |
| 9 | Estimate and inspection fees | Unknown | Never says "free" |
| 10 | Workmanship and manufacturer warranties | Unknown | None mentioned |
| 11 | License, insurance, certifications | BuildZoom links license 70499 (unverified) | None mentioned |
| 12 | Financing | Unknown | None mentioned |
| 13 | Domain and existing website ownership | actionroofingtn.com (offline), a Lovable preview of unknown origin, a localsearch page | Preview lives at mnmwebsitesforyou.com/clients/action-roofing/; M&M registers and holds the launch domain |
| 14 | Logo and photos | None supplied | Text wordmark; AI-generated illustrations (see `assets.md`) |
| 15 | Approved testimonials | None | Review section built, not rendered (`REVIEWS = []`) |
| 16 | Community story approval | Clarksville Now article | Shown with link (`community_story` switch) |
| 17 | Inquiry recipient and follow-up | actionroofing@gmail.com proposed | Form in preview mode, sends nothing |
| 18 | Form, storage and analytics setup | None configured | No analytics, no cookies; privacy page is a draft |

Also confirm: the Facebook page is theirs (`facebook` switch), and the FAQ answers on each page read the way Robert would answer.
