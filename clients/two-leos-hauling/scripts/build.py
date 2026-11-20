#!/usr/bin/env python3
"""Build the Two Leos Hauling website (static HTML) from one source.

Run from anywhere:  python3 clients/two-leos-hauling/scripts/build.py
Edit the BUSINESS facts and page copy below, run it, commit the output.

PREVIEW = True adds noindex and a robots.txt that blocks crawlers, so the demo
isn't indexed before the owner signs up. Set SITE_URL to the real domain and
PREVIEW = False when the site goes live.
"""
import html, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREVIEW = True
SITE_URL = 'https://mnmwebsitesforyou.com/clients/two-leos-hauling/'   # change to the real domain at launch

B = {  # facts from the public Nextdoor listing; confirm with the owner
    'name': 'Two Leos Hauling LLC', 'short': 'Two Leos Hauling',
    'phone': '(509) 688-5071', 'tel': '+15096885071',
    'email': '96shadle@gmail.com',
    'city': 'Spokane', 'region': 'WA', 'state': 'Washington',
    'hours': 'Daily, 8 AM–9 PM', 'license': '606 286 589',
}
E = html.escape

SERVICES = [  # slug, nav label, card title, card text, image
    ('junk-removal', 'Junk Removal', 'Junk removal', 'Household junk, furniture and appliances, loaded and hauled away.', 'junk'),
    ('property-cleanouts', 'Cleanouts', 'Property cleanouts', 'Move-outs, garages and rooms full of clutter, cleared out.', 'cleanout'),
    ('yard-debris-removal', 'Yard Debris', 'Yard debris removal', 'Branches, leaves and landscaping debris, gone from the yard.', 'yard'),
    ('general-hauling', 'Hauling', 'General hauling', 'Landscape supply transport and other hauling jobs by request.', 'hauling'),
]
HOME_CARDS = [  # title, text, link, image
    ('Junk removal', 'Unwanted household items, boxes and clutter, loaded and hauled away.', 'junk-removal/', 'junk'),
    ('Furniture & appliances', 'Couches, tables, mattresses, fridges and washers taken off your hands.', 'junk-removal/#furniture', 'appliance'),
    ('Property cleanouts', 'Move-out cleanups, garages and spare rooms cleared out.', 'property-cleanouts/', 'cleanout'),
    ('Yard debris removal', 'Branches, leaves and landscaping debris, gone from your yard.', 'yard-debris-removal/', 'yard'),
    ('Landscape supply transport', 'Approved landscaping materials moved where you need them.', 'general-hauling/#landscape', 'hauling'),
    ('General hauling', 'Something else to move? Tell us about it and we’ll take a look.', 'general-hauling/', 'load'),
]
ALT = {
    'load': 'Illustrative photo: a worker strapping down a dump trailer loaded with old fence boards, a treadmill and boxes.',
    'clean': 'Illustrative photo: an empty dump trailer with its gate open at the curb, in front of a house with a cleared-out garage.',
    'junk': 'Illustrative photo: two workers carrying an old sofa down front steps toward a dump trailer.',
    'cleanout': 'Illustrative photo: a garage half cleared, with boxes and bikes on one side and bare swept concrete on the other.',
    'yard': 'Illustrative photo: pine branches and bagged leaves being loaded into a dump trailer in a backyard.',
    'appliance': 'Illustrative photo: an old refrigerator on a hand truck being wheeled toward a dump trailer.',
    'hauling': 'Illustrative photo: a dump trailer tipping a load of bark mulch beside a new garden bed.',
}

ARROW = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
PHONE_I = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>'
TEXT_I = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8M8 12.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
CHECK_I = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
MARK = '<svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="8" fill="#E87524"/><path d="M7 24h20l6-8h-6l-3 4H7z" fill="#171A1E"/><circle cx="13" cy="29" r="3" fill="#171A1E"/><circle cx="24" cy="29" r="3" fill="#171A1E"/><path d="M9 12h6M12 12v8M19 12v8h5" stroke="#171A1E" stroke-width="2.6" stroke-linecap="square" fill="none"/></svg>'


def img(p, name, alt, sizes, eager=False, cls=''):
    w, h = {'hero': (1344, 752)}.get(name, (960, 723))
    small = 768 if name == 'hero' else 480
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return (f'<img{" class=" + chr(34) + cls + chr(34) if cls else ""} src="{p}assets/img/{name}-{w}.webp" '
            f'srcset="{p}assets/img/{name}-{small}.webp {small}w, {p}assets/img/{name}-{w}.webp {w}w" sizes="{sizes}" '
            f'width="{w}" height="{h}" {load} alt="{E(alt)}">')


def head(p, path, title, desc, ld):
    url = SITE_URL + path
    robots = '<meta name="robots" content="noindex, follow">' if PREVIEW else '<meta name="robots" content="index, follow, max-image-preview:large">'
    lds = ''.join(f'\n  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    return f'''<!doctype html>
<html lang="en-US" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{E(title)}</title>
  <meta name="description" content="{E(desc)}">
  {robots}
  <link rel="canonical" href="{url}">
  <meta name="theme-color" content="#171A1E">
  <meta name="color-scheme" content="light">
  <meta name="geo.region" content="US-WA">
  <meta name="geo.placename" content="Spokane">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{E(B['short'])}">
  <meta property="og:title" content="{E(title)}">
  <meta property="og:description" content="{E(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE_URL}assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Two Leos Hauling: junk removal and hauling in Spokane, WA">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="{p}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="{p}assets/fonts/barlow-condensed-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="{p}assets/fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{p}assets/css/site.css">
  <script src="{p}assets/js/config.js" defer></script>
  <script src="{p}assets/js/main.js" defer></script>{lds}
</head>'''


def header(p, current):
    links = ''.join(
        f'<li><a href="{p}{slug}/"{" aria-current=" + chr(34) + "page" + chr(34) if current == slug else ""}>{label}</a></li>'
        for slug, label, *_ in SERVICES)
    links += f'<li><a href="{p}about/"{" aria-current=" + chr(34) + "page" + chr(34) if current == "about" else ""}>About</a></li>'
    return f'''<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="top">
    <div class="wrap top__bar">
      <a class="brand" href="{p or './'}" aria-label="{E(B['short'])}, home">{MARK}<span class="brand__name">Two Leos <span>Hauling</span></span></a>
      <nav class="nav" aria-label="Main">
        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-list" hidden><span class="nav__bars" aria-hidden="true"></span><span class="nav__word">Menu</span></button>
        <ul class="nav__list" id="nav-list">{links}</ul>
      </nav>
      <a class="btn btn--ghost btn--sm top__call" aria-label="Call (509) 688-5071" href="tel:{B['tel']}">{PHONE_I}<span class="top__call-text">{B['phone']}</span></a>
      <a class="btn btn--orange btn--sm top__quote" href="{p}contact/"{" aria-current=" + chr(34) + "page" + chr(34) if current == "contact" else ""}>Get a quote</a>
    </div>
  </header>
  <main id="main">'''


def footer(p):
    svc = ''.join(f'<li><a href="{p}{slug}/">{title}</a></li>' for slug, _, title, *_ in SERVICES)
    return f'''  </main>

  <footer class="foot">
    <div class="stripe" aria-hidden="true"></div>
    <div class="wrap foot__grid">
      <div class="foot__brand">
        <a class="brand brand--foot" href="{p or './'}" aria-label="{E(B['short'])}, home">{MARK}<span class="brand__name">Two Leos <span>Hauling</span></span></a>
        <p>Junk removal, cleanouts, yard debris and hauling in {B['city']}, {B['state']}. We load it and haul it away.</p>
        <p class="foot__cta"><a class="btn btn--orange" href="{p}contact/">Request a quote{ARROW}</a></p>
      </div>
      <div>
        <h2 class="foot__h">Services</h2>
        <ul class="foot__list">{svc}<li><a href="{p}about/">About Two Leos</a></li><li><a href="{p}contact/">Request a quote</a></li></ul>
      </div>
      <div>
        <h2 class="foot__h">Contact</h2>
        <ul class="foot__list">
          <li><a href="tel:{B['tel']}">Call {B['phone']}</a></li>
          <li><a href="sms:{B['tel']}">Text {B['phone']}</a></li>
          <li><a href="mailto:{B['email']}">{B['email']}</a></li>
          <li>Open {B['hours']}</li>
          <li>Serving {B['city']}, {B['region']}</li>
        </ul>
      </div>
    </div>
    <div class="wrap foot__legal">
      <p>© <span data-year>2026</span> {E(B['name'])}. Business license {B['license']} (as listed).</p>
      <p>Photos on this site are illustrations, not photos of Two Leos’ team, equipment or jobs.</p>
      <p class="foot__made">Website preview by <a href="https://mnmwebsitesforyou.com/">M&amp;M Websites</a>.</p>
    </div>
  </footer>

  <nav class="dock" aria-label="Quick contact">
    <a class="dock__btn" href="tel:{B['tel']}">{PHONE_I}Call</a>
    <a class="dock__btn" href="sms:{B['tel']}">{TEXT_I}Text</a>
    <a class="dock__btn dock__btn--quote" href="{p}contact/">Get a quote</a>
  </nav>
</body>
</html>
'''


def form(p, preset=''):
    opts = [('', 'Choose a service'), ('Junk removal', 'Junk removal'), ('Furniture removal', 'Furniture removal'),
            ('Appliance removal', 'Appliance removal'), ('Property cleanout', 'Property cleanout / move-out'),
            ('Yard debris removal', 'Yard debris removal'), ('Landscape supply transport', 'Landscape supply transport'),
            ('General hauling', 'General hauling'), ('Not sure', 'Not sure yet')]
    o = ''.join(f'<option value="{E(v)}"{" selected" if v == preset else ""}>{E(t)}</option>' for v, t in opts)
    sizes = [('A few items', 'A few items'), ('Pickup-truck load', 'About a pickup-truck load'),
             ('Half a trailer', 'About half the trailer'), ('Full trailer', 'About a full trailer'), ('Not sure', 'Not sure')]
    r = ''.join(f'<label class="pick"><input type="radio" name="load_size" value="{E(v)}"><span>{E(t)}</span></label>' for v, t in sizes)
    return f'''<div class="quote" id="quote">
        <div class="quote__intro">
          <h2 id="quote-title">Request a quote</h2>
          <p>Tell us what needs to go and where it is. Photos help the most: snap a few and add them below.</p>
          <ul class="ticks">
            <li>{CHECK_I}We load it and haul it away</li>
            <li>{CHECK_I}14-yard dump trailer</li>
            <li>{CHECK_I}Prefer to talk? <a href="tel:{B['tel']}">Call</a> or <a href="sms:{B['tel']}">text</a> {B['phone']}</li>
          </ul>
        </div>
        <form class="qform" id="quote-form" method="post" enctype="multipart/form-data" novalidate aria-labelledby="quote-title">
          <p class="qform__fine">Fields marked <span class="req" aria-hidden="true">*</span> are required.</p>
          <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <input type="hidden" name="_subject" value="New hauling quote request">
          <input type="hidden" name="_template" value="table">
          <div class="row row--2">
            <div class="field"><label for="q-name">Your name <span class="req" aria-hidden="true">*</span></label>
              <input id="q-name" name="name" type="text" autocomplete="name" required aria-describedby="q-name-err"><p class="err" id="q-name-err" hidden></p></div>
            <div class="field"><label for="q-phone">Phone <span class="req" aria-hidden="true">*</span></label>
              <input id="q-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="q-phone-err"><p class="err" id="q-phone-err" hidden></p></div>
          </div>
          <div class="row row--2">
            <div class="field"><label for="q-email">Email <span class="opt">(optional)</span></label>
              <input id="q-email" name="email" type="email" autocomplete="email" spellcheck="false" aria-describedby="q-email-err"><p class="err" id="q-email-err" hidden></p></div>
            <div class="field"><label for="q-zip">ZIP code <span class="req" aria-hidden="true">*</span></label>
              <input id="q-zip" name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" required aria-describedby="q-zip-err"><p class="err" id="q-zip-err" hidden></p></div>
          </div>
          <div class="field"><label for="q-service">What do you need hauled? <span class="req" aria-hidden="true">*</span></label>
            <select id="q-service" name="service" required aria-describedby="q-service-err">{o}</select><p class="err" id="q-service-err" hidden></p></div>
          <div class="field"><label for="q-items">Describe the items and where they are <span class="req" aria-hidden="true">*</span></label>
            <textarea id="q-items" name="items" rows="4" required aria-describedby="q-items-err q-items-hint" placeholder="e.g. Old sectional and a mattress in the basement, 1 flight of stairs…"></textarea>
            <p class="hint" id="q-items-hint">Stairs, a long walk or a tight driveway? Mention it here.</p><p class="err" id="q-items-err" hidden></p></div>
          <fieldset class="field picks"><legend>Roughly how much is there?</legend><div class="picks__grid">{r}</div></fieldset>
          <div class="field drop" id="drop">
            <span class="drop__label" id="q-photos-label">Photos <span class="opt">(optional, up to 6)</span></span>
            <label class="drop__zone" for="q-photos">
              <svg class="drop__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h3l2-2.5h6L17 7h3v12H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
              <span><strong>Add photos</strong> of the junk<br><span class="drop__sub">Tap to take or choose photos · JPG, PNG or HEIC, 10 MB each</span></span>
            </label>
            <input class="drop__input" id="q-photos" name="attachment" type="file" accept="image/*" multiple aria-labelledby="q-photos-label" aria-describedby="q-photos-err">
            <ul class="thumbs" id="thumbs" aria-live="polite"></ul>
            <p class="err" id="q-photos-err" hidden></p>
          </div>
          <div class="field"><label for="q-date">Preferred date <span class="opt">(optional)</span></label>
            <input id="q-date" name="preferred_date" type="date" aria-describedby="q-date-err"><p class="err" id="q-date-err" hidden></p></div>
          <label class="consent"><input type="checkbox" name="consent" id="q-consent" value="Yes" required aria-describedby="q-consent-err"><span>It’s OK for Two Leos Hauling to call, text or email me about this request. <span class="req" aria-hidden="true">*</span></span></label>
          <p class="err" id="q-consent-err" hidden></p>
          <button class="btn btn--orange btn--wide" type="submit" id="q-submit">Send my quote request{ARROW}</button>
          <p class="qform__status" id="q-status" role="status" aria-live="polite" tabindex="-1" hidden></p>
          <noscript><p class="qform__fine">This form needs JavaScript. Please call or text {B['phone']} instead.</p></noscript>
        </form>
        <div class="sent" id="q-sent" tabindex="-1" hidden>
          <p class="sent__badge">{CHECK_I}Request received</p>
          <h3 class="sent__title">Thanks<span id="sent-name"></span>. We’ll be in touch.</h3>
          <p>Two Leos Hauling will reply by phone or text using the number you gave. Need it sooner? Call {B['phone']}.</p>
          <div class="sent__demo" id="sent-demo" hidden>
            <p class="sent__demo-label">Preview mode · this is the request Two Leos receives</p>
            <div class="inbox" id="inbox"></div>
          </div>
          <button class="btn btn--ghost-dark" type="button" id="q-again">Send another request</button>
        </div>
      </div>'''


def cta_band(p, line):
    return f'''<section class="band" aria-label="Get a quote">
      <div class="stripe" aria-hidden="true"></div>
      <div class="wrap band__in">
        <p class="band__line">{line}</p>
        <div class="band__actions">
          <a class="btn btn--orange" href="{p}contact/">Request a quote{ARROW}</a>
          <a class="btn btn--ghost" href="tel:{B['tel']}">{PHONE_I}Call {B['phone']}</a>
        </div>
      </div>
    </section>'''


BIZ_ID = SITE_URL + '#business'
def biz_ld():
    return {
        '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': BIZ_ID,
        'name': B['name'], 'url': SITE_URL, 'telephone': '+1-509-688-5071', 'email': B['email'],
        'image': SITE_URL + 'assets/img/og-image.jpg', 'logo': SITE_URL + 'assets/img/favicon.svg',
        'description': 'Junk removal, yard debris removal, property cleanouts, furniture and appliance disposal, landscape supply transport and general hauling in Spokane, Washington. We load the items and haul them away.',
        'address': {'@type': 'PostalAddress', 'addressLocality': 'Spokane', 'addressRegion': 'WA', 'addressCountry': 'US'},
        'areaServed': {'@type': 'City', 'name': 'Spokane', 'containedInPlace': {'@type': 'State', 'name': 'Washington'}},
        'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'opens': '08:00', 'closes': '21:00'}],
        'knowsAbout': ['Junk removal', 'Yard debris removal', 'Move-out cleanup', 'Appliance disposal', 'Furniture disposal', 'Landscape supply transport', 'General hauling'],
        'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Hauling services', 'itemListElement': [
            {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': n, 'areaServed': 'Spokane, WA'}} for n in
            ['Junk removal', 'Furniture removal', 'Appliance removal', 'Property cleanouts and move-out cleanup', 'Yard debris removal', 'Landscape supply transport', 'General hauling']]},
    }


def crumbs_ld(name, path):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': SITE_URL + path}]}


def svc_ld(name, path, desc):
    return {'@context': 'https://schema.org', '@type': 'Service', 'name': name, 'serviceType': name, 'description': desc,
            'url': SITE_URL + path, 'areaServed': {'@type': 'City', 'name': 'Spokane, WA'},
            'provider': {'@type': 'LocalBusiness', '@id': BIZ_ID, 'name': B['name'], 'telephone': '+1-509-688-5071'}}


def faq(items):
    vis = ''.join(f'<details class="qa"><summary>{E(q)}</summary><div class="qa__a"><p>{a}</p></div></details>' for q, a in items)
    import re
    ld = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': html.unescape(re.sub(r'<[^>]+>', '', a))}} for q, a in items]}
    return vis, ld


def write(path, content):
    full = os.path.join(ROOT, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w').write(content)


# ---------------------------------------------------------------- home
HOME_FAQ = [
    ('What do you haul?', 'Household junk, furniture, appliances, move-out leftovers, yard debris and landscaping debris, plus landscape supply transport and other hauling jobs by request. Not sure about something? Send a photo and ask.'),
    ('Do you do the loading?', 'Yes. Two Leos loads the items and takes them away. You don’t have to drag anything to the curb.'),
    ('How much does it cost?', 'Every job is different: how much there is, what it’s made of and how far it has to be carried all matter. Send a few photos with the quote form, or call or text, and Two Leos will give you a price for your job.'),
    ('How big is the trailer?', 'Two Leos hauls with a 14-cubic-yard dump trailer. That measures space, not weight, so heavy materials can fill it up faster. Ask if you’re not sure your load will fit.'),
    ('Is there anything you can’t take?', 'Some items and materials may not be accepted, depending on what they are and how much they weigh. Tell us what you have and you’ll know before the job.'),
    ('What areas do you serve?', 'Two Leos Hauling is based in Spokane, Washington. If you’re outside Spokane, ask: include your ZIP code in the quote form.'),
    ('When are you available?', 'Two Leos is listed as open daily from 8 AM to 9 PM. Pick a preferred date in the quote form and you’ll hear back to confirm a time.'),
    ('How do I send photos?', 'Add them to the quote form on this site, or text them to (509) 688-5071.'),
]
faq_html, faq_ld = faq(HOME_FAQ)

cards = ''.join(f'''<li class="card reveal"><a class="card__link" href="{link}">
            <span class="card__media">{img("", im, ALT[im], "(min-width: 1100px) 360px, (min-width: 700px) 46vw, 92vw")}</span>
            <span class="card__body"><span class="card__title">{t}</span><span class="card__text">{d}</span><span class="card__go">Learn more{ARROW}</span></span>
          </a></li>''' for t, d, link, im in HOME_CARDS)

def AN(t):
    t = t.lower()
    return t if t[0].isdigit() else 'one ' + t

ITEMS = [  # key, label, cubic yards (rough guide), icon path
    ('sofa', 'Sofa', 2.5), ('mattress', 'Mattress set', 1.5), ('fridge', 'Fridge', 1.5), ('washer', 'Washer or dryer', 1),
    ('table', 'Table & chairs', 2), ('boxes', '10 boxes', 1), ('yard', '10 yard bags', 2), ('branches', 'Branch pile', 3),
]
item_btns = ''.join(f'''<li class="load__item"><span class="load__name">{t}<span class="load__vol">≈ {v:g} yd³</span></span>
              <span class="step"><button class="step__btn" type="button" data-item="{k}" data-delta="-1" aria-label="Remove {AN(t)}">−</button><output class="step__n" id="n-{k}" aria-live="polite">0</output><button class="step__btn" type="button" data-item="{k}" data-delta="1" aria-label="Add {AN(t)}">+</button></span></li>''' for k, t, v in ITEMS)
items_json = json.dumps({k: {'label': t, 'yd': v} for k, t, v in ITEMS})

home = head('', '', 'Junk Removal & Hauling in Spokane, WA | Two Leos Hauling LLC',
            'Need junk removed in Spokane? Two Leos Hauling LLC handles furniture, appliances, yard debris, move-out cleanups and general hauling. Call or text 509-688-5071.',
            [biz_ld(), faq_ld]) + header('', 'home') + f'''

    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__media" aria-hidden="true">
        {img("", "hero", "", "100vw", eager=True, cls="hero__img")}
        <video class="hero__video" muted loop playsinline preload="none" width="1280" height="720" data-src-webm="assets/video/hero.webm" data-src-mp4="assets/video/hero.mp4"></video>
        <div class="hero__shade"></div>
      </div>
      <div class="wrap hero__in">
        <p class="hero__place">Spokane, Washington</p>
        <h1 id="hero-title" class="hero__title"><span class="hero__line">Junk gone.</span> <span class="hero__line hero__line--o">Space back.</span></h1>
        <p class="hero__sub">Junk removal, yard debris cleanup, furniture and appliance hauling in Spokane, Washington.</p>
        <div class="hero__actions">
          <a class="btn btn--orange btn--lg" href="contact/">Request a quote{ARROW}</a>
          <a class="btn btn--ghost btn--lg" href="tel:{B['tel']}">{PHONE_I}Call or text {B['phone']}</a>
        </div>
        <ul class="hero__facts">
          <li>{CHECK_I}14-yard dump trailer</li>
          <li>{CHECK_I}We load it and haul it away</li>
          <li>{CHECK_I}Open {B['hours']}</li>
        </ul>
      </div>
      <p class="hero__credit">Illustrative photo</p>
    </section>

    <section class="section" id="services" aria-labelledby="services-title">
      <div class="wrap">
        <div class="head">
          <h2 id="services-title">What we haul away</h2>
          <p>From one old couch to a whole garage, Two Leos does the lifting. Pick what you need, or just send photos and ask.</p>
        </div>
        <ul class="cards">{cards}</ul>
      </div>
    </section>

    <section class="section section--dark load" id="trailer" aria-labelledby="trailer-title">
      <div class="wrap load__grid">
        <div class="load__copy">
          <h2 id="trailer-title">Will it fit in one trip?</h2>
          <p>Two Leos hauls with a <strong>14-cubic-yard dump trailer</strong>. Add what you’ve got and watch it fill.</p>
          <ul class="load__items" id="load-items">{item_btns}</ul>
          <p class="load__note">A rough guide to space only, not a price. Weight and material decide what fits, so heavy loads like dirt or concrete fill it faster.</p>
        </div>
        <div class="load__viz">
          <svg class="trailer" viewBox="0 0 600 330" role="img" aria-labelledby="trailer-svg-title">
            <title id="trailer-svg-title">A 14-cubic-yard dump trailer, filling up as you add items</title>
            <defs>
              <clipPath id="bed"><path d="M70 80h440v150H70z"/></clipPath>
              <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="#E87524"/><rect width="7" height="18" fill="#F2954F"/></pattern>
            </defs>
            <g clip-path="url(#bed)"><rect class="trailer__fill" id="trailer-fill" x="70" y="80" width="440" height="150" fill="url(#hatch)"/></g>
            <path d="M64 74h452v162H64z" fill="none" stroke="#F5F3ED" stroke-width="8" stroke-linejoin="round"/>
            <path d="M64 120h452M64 170h452" stroke="#F5F3ED" stroke-opacity=".18" stroke-width="3"/>
            <path d="M516 200h40l18 22" fill="none" stroke="#F5F3ED" stroke-width="8" stroke-linecap="round"/>
            <circle cx="574" cy="224" r="9" fill="#F5F3ED"/>
            <path d="M90 236h400v14H90z" fill="#68777A"/>
            <circle cx="190" cy="270" r="34" fill="#0E1013" stroke="#68777A" stroke-width="10"/><circle cx="190" cy="270" r="9" fill="#68777A"/>
            <circle cx="290" cy="270" r="34" fill="#0E1013" stroke="#68777A" stroke-width="10"/><circle cx="290" cy="270" r="9" fill="#68777A"/>
            <text class="trailer__pct" id="trailer-pct" x="290" y="168" text-anchor="middle">0%</text>
          </svg>
          <p class="load__meter"><strong id="load-yd">0</strong> of 14 cubic yards <span class="load__trips" id="load-trips"></span></p>
          <a class="btn btn--orange btn--wide" id="load-quote" href="contact/">Get a quote for this load{ARROW}</a>
        </div>
      </div>
      <script type="application/json" id="load-data">{items_json}</script>
    </section>

    <section class="section" id="how" aria-labelledby="how-title">
      <div class="wrap">
        <div class="head">
          <h2 id="how-title">How it works</h2>
          <p>No dragging things to the curb, no renting a truck. Four steps and it’s gone.</p>
        </div>
        <ol class="steps">
          <li class="steps__item reveal"><span class="steps__no">1</span><h3>Send photos</h3><p>Use the quote form or text a few pictures of what needs to go.</p></li>
          <li class="steps__item reveal"><span class="steps__no">2</span><h3>Get your quote</h3><p>Two Leos looks at the load and gets back to you with a price and a time.</p></li>
          <li class="steps__item reveal"><span class="steps__no">3</span><h3>We load it up</h3><p>The crew does the lifting and loads everything into the 14-yard trailer.</p></li>
          <li class="steps__item reveal"><span class="steps__no">4</span><h3>Space back</h3><p>The junk is hauled away and you get your garage, yard or room back.</p></li>
        </ol>
      </div>
    </section>

    <section class="section section--alt" id="why" aria-labelledby="why-title">
      <div class="wrap why">
        <div class="why__media reveal">{img("", "clean", ALT["clean"], "(min-width: 960px) 520px, 92vw")}<span class="tag">Illustrative photo</span></div>
        <div>
          <h2 id="why-title">Why Spokane calls Two Leos</h2>
          <ul class="why__list">
            <li class="reveal"><strong>Loading is included.</strong> You point, Two Leos lifts, loads and hauls it away.</li>
            <li class="reveal"><strong>A 14-yard dump trailer.</strong> Room for big jobs, from furniture to yard debris.</li>
            <li class="reveal"><strong>Open every day.</strong> Listed hours are {B['hours']}.</li>
            <li class="reveal"><strong>Easy to reach.</strong> Call, text or send photos with the quote form, whatever’s easiest.</li>
            <li class="reveal"><strong>Local to Spokane.</strong> A Spokane hauling business, not a national call center.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section" id="gallery" aria-labelledby="gallery-title">
      <div class="wrap">
        <div class="head">
          <h2 id="gallery-title">Before &amp; after</h2>
          <p>Real photos from Two Leos jobs go here: the trailer, the before and the after.</p>
        </div>
        <ul class="slots">
          <li class="slot"><span class="slot__icon" aria-hidden="true">01</span><span>Trailer photo</span></li>
          <li class="slot"><span class="slot__icon" aria-hidden="true">02</span><span>Garage before &amp; after</span></li>
          <li class="slot"><span class="slot__icon" aria-hidden="true">03</span><span>Yard cleanup</span></li>
          <li class="slot"><span class="slot__icon" aria-hidden="true">04</span><span>Furniture haul-away</span></li>
        </ul>
      </div>
    </section>

    <section class="section section--alt" id="request" aria-label="Quote request">
      <div class="wrap">{form("")}</div>
    </section>

    <section class="section" id="area" aria-labelledby="area-title">
      <div class="wrap area">
        <div>
          <h2 id="area-title">Serving Spokane, Washington</h2>
          <p>Two Leos Hauling is a Spokane business. Outside the city? Put your ZIP code in the quote form and ask.</p>
          <p class="area__links"><a class="btn btn--ink" href="contact/">Check my ZIP code{ARROW}</a></p>
        </div>
        <div class="area__map" aria-hidden="true">
          <svg viewBox="0 0 320 220"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#E87524" stop-opacity=".45"/><stop offset="1" stop-color="#E87524" stop-opacity="0"/></radialGradient></defs>
            <rect width="320" height="220" rx="18" fill="#171A1E"/>
            <path d="M0 150 C 60 120, 110 160, 160 130 S 260 90, 320 110" fill="none" stroke="#68777A" stroke-width="10" stroke-opacity=".5"/>
            <path d="M40 0v220M120 0v220M200 0v220M280 0v220M0 50h320M0 100h320M0 170h320" stroke="#F5F3ED" stroke-opacity=".07" stroke-width="2"/>
            <circle class="area__pulse" cx="160" cy="110" r="70" fill="url(#g)"/>
            <circle cx="160" cy="110" r="9" fill="#E87524" stroke="#F5F3ED" stroke-width="4"/>
            <text x="160" y="150" text-anchor="middle" fill="#F5F3ED" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="22" letter-spacing="2">SPOKANE, WA</text></svg>
        </div>
      </div>
    </section>

    <section class="section section--alt" id="faq" aria-labelledby="faq-title">
      <div class="wrap faq">
        <h2 id="faq-title">Questions</h2>
        <div class="faq__list">{faq_html}</div>
      </div>
    </section>

    {cta_band("", "Got junk? Send a photo and get a quote.")}
''' + footer('')
write('index.html', home)

# ---------------------------------------------------------------- service pages
PAGES = {
 'junk-removal': dict(
   title='Junk Removal in Spokane, WA | Furniture & Appliances | Two Leos',
   desc='Junk removal in Spokane, WA: Two Leos Hauling loads and hauls away household junk, couches, mattresses, tables and appliances. Call or text 509-688-5071.',
   h1='Junk removal in Spokane', lede='Old furniture, worn-out appliances and the junk that piles up. Two Leos loads it into a 14-yard dump trailer and hauls it away.',
   img='junk', preset='Junk removal', name='Junk removal',
   body=f'''<div class="prose">
          <h2>Household junk, gone</h2>
          <p>Boxes in the basement, a broken chair on the porch, the stuff that never made it to the dump. Point at it, and Two Leos does the lifting, loading and hauling.</p>
          <ul class="ticks ticks--cols"><li>{CHECK_I}Household junk and clutter</li><li>{CHECK_I}Boxes and bagged items</li><li>{CHECK_I}Old furniture</li><li>{CHECK_I}Appliances</li><li>{CHECK_I}Mattresses</li><li>{CHECK_I}Other unwanted items</li></ul>
          <h2 id="furniture">Furniture removal</h2>
          <p>Couches, sectionals, tables, dressers, chairs and bed frames. Heavy, awkward and down a flight of stairs? Tell us in the quote form so the crew comes ready.</p>
          <h2 id="appliances">Appliance removal</h2>
          <p>Refrigerators, washers, dryers and other appliances, hauled away. Let us know what the appliance is when you ask, so Two Leos can confirm it can be taken.</p>
          <h2>Good to know</h2>
          <p>Some items may not be accepted, depending on the material and weight. Photos are the fastest way to find out: send a few and you’ll know before the job.</p>
        </div>'''),
 'property-cleanouts': dict(
   title='Move-Out Cleanouts & Property Cleanups in Spokane, WA | Two Leos',
   desc='Moving out or clearing a garage in Spokane? Two Leos Hauling removes the unwanted items left behind and hauls them away in a 14-yard dump trailer.',
   h1='Property cleanouts in Spokane', lede='Moving out, clearing a garage or finally tackling the spare room? Two Leos hauls away what you leave behind.',
   img='cleanout', preset='Property cleanout', name='Property cleanouts',
   body=f'''<div class="prose">
          <h2>Move-out cleanup</h2>
          <p>Moving day leaves things behind: furniture that won’t fit the new place, boxes of odds and ends, the stuff nobody wants to move. Two Leos loads it up and takes it away, so you can hand over the keys.</p>
          <h2>Garages, basements and spare rooms</h2>
          <p>Years of accumulated clutter can be cleared in one visit. The 14-yard dump trailer has room for big cleanouts. Not sure how much you have? Add photos to the quote form.</p>
          <ul class="ticks ticks--cols"><li>{CHECK_I}Move-out leftovers</li><li>{CHECK_I}Garage cleanouts</li><li>{CHECK_I}Basements and attics</li><li>{CHECK_I}Spare rooms and storage</li><li>{CHECK_I}Furniture and appliances</li><li>{CHECK_I}Boxes and clutter</li></ul>
          <h2>Make it easy on yourself</h2>
          <p>Tell us which rooms, how many stairs and where the trailer can park. The more Two Leos knows up front, the smoother the day goes.</p>
        </div>'''),
 'yard-debris-removal': dict(
   title='Yard Debris Removal in Spokane, WA | Branches & Leaves | Two Leos',
   desc='Yard debris removal in Spokane: Two Leos Hauling loads and hauls away branches, leaves and landscaping debris. Send photos for a quote or call 509-688-5071.',
   h1='Yard debris removal in Spokane', lede='Branches after a storm, a season of leaves, the pile left from a landscaping project. Two Leos loads it up and hauls it off.',
   img='yard', preset='Yard debris removal', name='Yard debris removal',
   body=f'''<div class="prose">
          <h2>What we clear</h2>
          <ul class="ticks ticks--cols"><li>{CHECK_I}Branches and limbs</li><li>{CHECK_I}Leaves and bagged yard waste</li><li>{CHECK_I}Shrub and hedge trimmings</li><li>{CHECK_I}Landscaping debris</li></ul>
          <p>Spokane’s pines drop a lot of needles, cones and branches. When the pile gets bigger than your yard-waste bin, send a photo and ask.</p>
          <h2>Good to know</h2>
          <p>Yard debris is accepted depending on the material and how much it weighs. Heavy materials like dirt, rock or sod fill a trailer much faster than branches. Mention them in your request so Two Leos can tell you what fits.</p>
        </div>'''),
 'general-hauling': dict(
   title='Hauling & Landscape Supply Transport in Spokane, WA | Two Leos',
   desc='Hauling services in Spokane, WA: landscape supply transport and general hauling with a 14-yard dump trailer from Two Leos Hauling. Call or text 509-688-5071.',
   h1='General hauling in Spokane', lede='Landscape supplies to move, or a load that doesn’t fit anywhere else? Two Leos takes a look at hauling jobs by request.',
   img='load', preset='General hauling', name='General hauling',
   body=f'''<div class="prose">
          <h2 id="landscape">Landscape supply transport</h2>
          <p>Need approved landscaping materials moved to your project? Two Leos can haul them in the 14-yard dump trailer. Tell us what the material is and how much, and you’ll hear back about what can be carried.</p>
          <h2>Other hauling jobs</h2>
          <p>Have something else that needs moving or hauling away? Describe it in the quote form, add photos, and Two Leos will let you know whether it’s a fit.</p>
          <h2>Good to know</h2>
          <p>The trailer holds 14 cubic yards. That’s a measure of space, not weight, and each material is different, so every hauling job is confirmed before it’s booked.</p>
        </div>'''),
}
for slug, d in PAGES.items():
    path = slug + '/'
    page = head('../', path, d['title'], d['desc'], [svc_ld(d['name'], path, d['desc']), crumbs_ld(d['name'], path)]) + header('../', slug) + f'''

    <section class="phero">
      <div class="phero__media" aria-hidden="true">{img("../", d['img'], "", "100vw", eager=True, cls="phero__img")}<div class="phero__shade"></div></div>
      <div class="wrap phero__in">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="../">Home</a></li><li><span aria-current="page">{d['name']}</span></li></ol></nav>
        <h1 class="phero__title">{d['h1']}</h1>
        <p class="phero__lede">{d['lede']}</p>
        <div class="hero__actions">
          <a class="btn btn--orange btn--lg" href="#request">Request a quote{ARROW}</a>
          <a class="btn btn--ghost btn--lg" href="tel:{B['tel']}">{PHONE_I}Call or text {B['phone']}</a>
        </div>
      </div>
      <p class="hero__credit">Illustrative photo</p>
    </section>

    <section class="section">
      <div class="wrap svc">
        {d['body']}
        <aside class="svc__side">
          <div class="side">
            <p class="side__h">Two Leos Hauling</p>
            <ul class="ticks"><li>{CHECK_I}We load it and haul it away</li><li>{CHECK_I}14-yard dump trailer</li><li>{CHECK_I}Open {B['hours']}</li></ul>
            <a class="btn btn--orange btn--wide" href="tel:{B['tel']}">{PHONE_I}Call {B['phone']}</a>
            <a class="btn btn--ink btn--wide" href="sms:{B['tel']}">{TEXT_I}Text photos</a>
          </div>
          <div class="side side--links">
            <p class="side__h">More services</p>
            <ul>{''.join(f'<li><a href="../{s}/">{t}</a></li>' for s, _, t, *_ in SERVICES if s != slug)}</ul>
          </div>
        </aside>
      </div>
    </section>

    <section class="section section--alt" id="request" aria-label="Quote request">
      <div class="wrap">{form("../", d['preset'])}</div>
    </section>

    {cta_band("../", "Ready when you are. Call, text or send photos.")}
''' + footer('../')
    write(path + 'index.html', page)

# ---------------------------------------------------------------- about
about = head('../', 'about/', 'About Two Leos Hauling LLC | Spokane Junk Removal & Hauling',
             'Two Leos Hauling LLC is a Spokane, WA junk removal and hauling business with a 14-yard dump trailer. We load your items and haul them away. Call 509-688-5071.',
             [crumbs_ld('About', 'about/')]) + header('../', 'about') + f'''

    <section class="phero phero--short">
      <div class="phero__media" aria-hidden="true">{img("../", "hero", "", "100vw", eager=True, cls="phero__img")}<div class="phero__shade"></div></div>
      <div class="wrap phero__in">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="../">Home</a></li><li><span aria-current="page">About</span></li></ol></nav>
        <h1 class="phero__title">About Two Leos Hauling</h1>
        <p class="phero__lede">A Spokane junk removal and hauling business. You show us what needs to go; we load it and haul it away.</p>
      </div>
      <p class="hero__credit">Illustrative photo</p>
    </section>

    <section class="section">
      <div class="wrap svc">
        <div class="prose">
          <h2>What Two Leos does</h2>
          <p>Two Leos Hauling LLC takes on the jobs nobody wants to do themselves: junk removal, yard debris, move-out cleanups, furniture and appliance disposal, landscape supply transport and general hauling around Spokane, Washington.</p>
          <p>The difference is the work is included. This isn’t a trailer rental. The crew loads the items and takes them away.</p>
          <h2>The equipment</h2>
          <p>Jobs are hauled in a 14-cubic-yard dump trailer, big enough for furniture, appliances, cleanouts and yard debris. Remember that 14 yards is space, not weight: what fits depends on the material.</p>
          <div class="note" role="note">
            <p class="note__h">Owner story and photos</p>
            <p>The story of how Two Leos started, the people behind it and real photos of the truck and trailer will go here once the owner shares them.</p>
          </div>
        </div>
        <aside class="svc__side">
          <div class="side">
            <p class="side__h">At a glance</p>
            <dl class="facts">
              <div><dt>Business</dt><dd>{E(B['name'])}</dd></div>
              <div><dt>Based in</dt><dd>{B['city']}, {B['state']}</dd></div>
              <div><dt>Equipment</dt><dd>14-yard dump trailer</dd></div>
              <div><dt>Hours</dt><dd>{B['hours']}</dd></div>
              <div><dt>License</dt><dd>{B['license']} (as listed)</dd></div>
            </dl>
            <a class="btn btn--orange btn--wide" href="../contact/">Request a quote{ARROW}</a>
          </div>
        </aside>
      </div>
    </section>

    {cta_band("../", "Junk gone. Space back.")}
''' + footer('../')
write('about/index.html', about)

# ---------------------------------------------------------------- contact
contact = head('../', 'contact/', 'Request a Hauling Quote in Spokane, WA | Two Leos Hauling',
               'Request a junk removal or hauling quote from Two Leos Hauling in Spokane, WA. Upload photos of your items, or call or text 509-688-5071.',
               [crumbs_ld('Request a quote', 'contact/')]) + header('../', 'contact') + f'''

    <section class="section section--first">
      <div class="wrap">
        <nav class="crumbs crumbs--dark" aria-label="Breadcrumb"><ol><li><a href="../">Home</a></li><li><span aria-current="page">Request a quote</span></li></ol></nav>
        <h1 class="page-title">Get a hauling quote</h1>
        <p class="page-lede">Upload a few photos and tell us where the junk is. You’ll hear back with a price and a time.</p>
        <ul class="ways">
          <li><a class="way" href="tel:{B['tel']}">{PHONE_I}<span><strong>Call</strong>{B['phone']}</span></a></li>
          <li><a class="way" href="sms:{B['tel']}">{TEXT_I}<span><strong>Text photos</strong>{B['phone']}</span></a></li>
          <li><a class="way" href="mailto:{B['email']}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 7 9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/></svg><span><strong>Email</strong>{B['email']}</span></a></li>
          <li><span class="way way--static"><svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span><strong>Hours</strong>{B['hours']}</span></span></li>
        </ul>
      </div>
    </section>

    <section class="section section--alt section--tight" id="request" aria-label="Quote request">
      <div class="wrap">{form("../")}</div>
    </section>
''' + footer('../')
write('contact/index.html', contact)

# ---------------------------------------------------------------- 404, sitemap, robots, llms
nf = head('./', '404.html', 'Page Not Found | Two Leos Hauling', 'That page doesn’t exist. Head back to Two Leos Hauling, junk removal and hauling in Spokane, WA.', []).replace(
    '<link rel="canonical" href="' + SITE_URL + '404.html">\n', '').replace(
    '<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex">') + header('./', '') + f'''
    <section class="section section--first nf">
      <div class="wrap">
        <p class="nf__code" aria-hidden="true">404</p>
        <h1 class="page-title">This page got hauled away.</h1>
        <p class="page-lede">The page you’re looking for isn’t here. Try one of these instead.</p>
        <p class="nf__actions"><a class="btn btn--orange" href="./">Back to home{ARROW}</a> <a class="btn btn--ink" href="./contact/">Request a quote</a></p>
      </div>
    </section>
''' + footer('./')
write('404.html', nf)

paths = ['', 'junk-removal/', 'property-cleanouts/', 'yard-debris-removal/', 'general-hauling/', 'about/', 'contact/']
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      ''.join(f'  <url>\n    <loc>{SITE_URL}{u}</loc>\n    <lastmod>2026-11-20</lastmod>\n  </url>\n' for u in paths) + '</urlset>\n')
write('robots.txt', ('# Preview: keep crawlers out until launch. At launch set PREVIEW = False in scripts/build.py.\nUser-agent: *\nDisallow: /\n' if PREVIEW
                     else 'User-agent: *\nAllow: /\nDisallow: /tests/\nDisallow: /scripts/\n') + f'\nSitemap: {SITE_URL}sitemap.xml\n')
write('llms.txt', f'''# {B['name']}

> Junk removal and hauling business in Spokane, Washington. The crew loads the items and hauls them away using a 14-cubic-yard dump trailer.

## Services
- Junk removal (household junk and unwanted items)
- Furniture disposal (couches, tables and other furniture)
- Appliance disposal
- Property cleanouts and move-out cleanup
- Yard debris removal (branches, leaves, landscaping debris), subject to acceptance
- Landscape supply transport (approved landscaping materials)
- General hauling, assessed by request

## Details
- Area: Spokane, WA
- Hours (as listed): {B['hours']}
- Equipment: 14-cubic-yard dump trailer (volume, not weight; acceptance depends on material and weight)
- Pricing: quoted per job; send photos with the quote form or by text

## Contact
- Phone and text: {B['phone']}
- Email: {B['email']}
- Request a quote: {SITE_URL}contact/
''')
print('built', len(paths), 'pages + 404, sitemap, robots, llms')
