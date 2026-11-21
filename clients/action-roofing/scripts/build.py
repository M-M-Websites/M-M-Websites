#!/usr/bin/env python3
"""Build the Action Roofing website preview (static HTML) from one source.

Run from anywhere:  python3 clients/action-roofing/scripts/build.py
Edit the facts, switches and copy below, run it, commit the output.

Every fact on the site comes from notes/research.md. Facts that still need the
owner's OK are behind the switches in APPROVED (see notes/owner-checklist.md).
PREVIEW = True adds noindex everywhere and a robots.txt that blocks crawlers.
At launch: set SITE_URL to the real domain, PREVIEW = False, and re-run.
"""
import html, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREVIEW = os.environ.get('AR_PREVIEW', '1') != '0'   # AR_PREVIEW=0 builds the launch version
SITE_URL = 'https://mnmwebsitesforyou.com/clients/action-roofing/'   # the real domain at launch

B = {
    'name': 'Action Roofing',
    'alt_names': ['Action Roofing Company', 'Action Roofing Co.'],
    'owner': 'Robert DeBord',            # some directories write "Debord": confirm (checklist 2)
    'phone': '(931) 645-4784', 'tel': '+19316454784', 'tel_ld': '+1-931-645-4784',
    'email': 'actionroofing@gmail.com',  # supplied by the prospect; confirm before connecting the form
    'city': 'Clarksville', 'region': 'TN', 'state': 'Tennessee', 'zip': '37043',
    'bbb': 'https://www.bbb.org/us/tn/clarksville/profile/roofing-contractors/action-roofing-company-0573-18000680',
    'facebook': 'https://www.facebook.com/actionroofingtn/',
    'story': 'https://clarksvillenow.com/local/veteran-gets-new-roof-from-local-builders-after-being-ghosted-by-contractor-that-revitalized-my-belief-in-people/',
}

# Facts that are supported by public records but still need the owner's OK.
# Shown in the preview so the owner can review them; switch any off with False.
APPROVED = {
    'since_1985': True,       # BBB: business started January 1, 1985 (checklist 3)
    'bbb': True,              # BBB Accredited since July 23, 2019, A+ rating
    'community_story': True,  # Clarksville Now, June 6, 2026 (checklist 16)
    'facebook': True,         # BBB links to it; ownership not confirmed (checklist 13)
}
# Approved, attributable reviews only: (quote, name, source, date). Empty = the section is not rendered.
REVIEWS = []
# Real project photos and write-ups only. Empty = no Projects page and no nav link.
PROJECTS = []

E = html.escape

SERVICES = [  # slug, nav label, title, card text, image
    ('roof-repair', 'Roof Repair', 'Roof repair', 'Leaks, missing shingles and worn spots, found and repaired.', 'repair'),
    ('roof-replacement', 'Roof Replacement', 'Roof replacement', 'When patching stops making sense, the old roof comes off and a new one goes on.', 'replace'),
    ('storm-damage-roof-repair', 'Storm Damage', 'Storm damage roof repair', 'Wind, hail or a fallen limb? Get the damage looked at and the roof put right.', 'storm'),
    ('siding-gutters', 'Siding & Gutters', 'Siding & gutters', 'Siding and gutter work to go with your roof, so water stays out of the walls.', 'siding'),
]
NAV = [(s, l) for s, l, *_ in SERVICES] + [('about', 'About'), ('service-areas', 'Service Area')]

ALT = {
    'hero': 'Two roofers in safety harnesses laying new charcoal shingles on a brick house under tall oak trees.',
    'repair': 'Gloved hands lifting a damaged shingle with a flat bar, roofing nails beside it.',
    'replace': 'A roof half stripped to grey underlayment and half covered in new charcoal shingles, a roofer working near the ridge.',
    'storm': 'A two-story house with shingles torn off near the ridge and a fallen limb on the lawn as storm clouds clear.',
    'siding': 'A two-story house with slate-blue lap siding, white trim and white gutters under a charcoal roof.',
    'gutter': 'Rainwater running off dark shingles into a white gutter and downspout.',
    'sunset': 'A roofer in a harness kneeling on a shingle roof at sunset, green hills behind.',
    'aerial': 'Aerial view of a tree-lined Middle Tennessee neighborhood of shingle roofs at golden hour.',
    'ridge': 'Close-up of charcoal architectural shingles and ridge caps catching low light.',
    'bundles': 'Wrapped bundles of shingles and a nail gun on a roof deck covered in underlayment.',
    'consult': 'A homeowner and a contractor with a clipboard looking up at the roofline of a brick house.',
    'ladder': 'A roofer on a ladder at the eave of a brick house checking the shingle edge and gutter.',
}
WIDE = {'hero', 'aerial', 'ridge'}   # 16:9 sources, the rest are 4:3

# ---------- icons (one set: 24px grid, 2px stroke) ----------
def ic(path, cls='i'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{path}</svg>'
S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
PHONE = ic(f'<path {S} d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>')
ARROW = ic(f'<path {S} d="M5 12h14M13 6l6 6-6 6"/>')
EXT = ic(f'<path {S} d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>')
CHECK = ic(f'<path {S} d="m5 12.5 4.5 4.5L19 7.5"/>')
MAIL = ic(f'<rect {S} x="3" y="5" width="18" height="14" rx="2"/><path {S} d="m4 7 8 6 8-6"/>')
PIN = ic(f'<path {S} d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle {S} cx="12" cy="9.5" r="2.5"/>')
CLOCK = ic(f'<circle {S} cx="12" cy="12" r="9"/><path {S} d="M12 7v5l3 2"/>')
SHIELD = ic(f'<path {S} d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path {S} d="m9 12 2 2 4-4"/>')
CHEV = ic(f'<path {S} d="m6 9 6 6 6-6"/>', 'i chev')
ALERT = ic(f'<circle {S} cx="12" cy="12" r="9"/><path {S} d="M12 7.5v5.5M12 16.5h.01"/>')
CAMERA = ic(f'<path {S} d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle {S} cx="12" cy="13" r="3.5"/>')
HOUSE = ic(f'<path {S} d="M3 11 12 4l9 7M5 9.5V20h14V9.5"/><path {S} d="M10 20v-5h4v5"/>')

ICONS = {'leak': ic(f'<path {S} d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
         'shingle': ic(f'<path {S} d="M3 9h18M3 15h18M8 9v6M16 9v6M12 3v6M12 15v6"/>'),
         'storm': ic(f'<path {S} d="M7 17a5 5 0 1 1 1-9.9A6 6 0 0 1 19 9a4 4 0 0 1-1 7.9"/><path {S} d="m12 13-2 4h3l-2 4"/>'),
         'old': ic(f'<path {S} d="M3 12 12 5l9 7"/><path {S} d="M6 10v9h12v-9"/><path {S} d="M9 15h.01M15 13h.01M12 17h.01"/>'),
         'gutter': ic(f'<path {S} d="M3 7h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path {S} d="M17 12v8M8 15v1M11 17v1"/>'),
         'siding': ic(f'<rect {S} x="4" y="4" width="16" height="16" rx="1"/><path {S} d="M4 9h16M4 14h16"/><path {S} d="m14 14 2 3"/>')}


def link_attr(cur, slug):
    return ' aria-current="page"' if cur == slug else ''


def img(p, name, sizes, eager=False, cls='', alt=None):
    w, h = (1344, 752) if name in WIDE else (960, 723)
    sw = 768 if name in WIDE else 480
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    c = f' class="{cls}"' if cls else ''
    return (f'<img{c} src="{p}assets/img/{name}-{w}.webp" srcset="{p}assets/img/{name}-{sw}.webp {sw}w, {p}assets/img/{name}-{w}.webp {w}w" '
            f'sizes="{sizes}" width="{w}" height="{h}" {load} alt="{E(alt if alt is not None else ALT[name])}">')


def head(p, path, title, desc, ld, kind='service'):
    url = SITE_URL + path
    robots = 'noindex, nofollow' if PREVIEW else 'index, follow, max-image-preview:large'
    lds = ''.join(f'\n  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    return f'''<!doctype html>
<html lang="en-US" class="no-js" data-type="service">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{E(title)}</title>
  <meta name="description" content="{E(desc)}">
  <meta name="robots" content="{robots}">
  <meta name="page-type" content="service">
  <meta name="site-kind" content="other">
  <link rel="canonical" href="{url}">
  <meta name="theme-color" content="#ffffff">
  <meta name="color-scheme" content="light">
  <meta name="geo.region" content="US-TN">
  <meta name="geo.placename" content="Clarksville">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{E(B['name'])}">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="{E(title)}">
  <meta property="og:description" content="{E(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE_URL}assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Action Roofing: roof repair and replacement in Clarksville, TN">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="{p}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="{p}assets/img/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="{p}assets/img/apple-touch-icon.png">
  <link rel="manifest" href="{p}site.webmanifest">
  <link rel="preload" href="{p}assets/fonts/schibsted-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{p}assets/css/site.css">
  <script src="{p}assets/js/config.js" defer></script>
  <script src="{p}assets/js/main.js" defer></script>{lds}
</head>'''


WORDMARK = '<span class="mark"><span class="mark__a">Action</span><span class="mark__b">Roofing</span></span>'


def header(p, cur):
    links = ''.join(f'<li><a class="nav__a" href="{p}{s}/"{link_attr(cur, s)}>{l}</a></li>' for s, l in NAV)
    return f'''<body>
  <a class="skip" href="#main">Skip to main content</a>
  <header class="top" id="top">
    <div class="wrap top__bar">
      <a class="brand" href="{p or './'}"{link_attr(cur, 'home')}>{WORDMARK}<span class="brand__place">Clarksville, TN<span class="vh"> (home page)</span></span></a>
      <nav class="nav" aria-label="Main">
        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-panel" hidden><span class="nav__bars" aria-hidden="true"><span></span><span></span></span><span class="nav__word">Menu</span></button>
        <div class="nav__panel" id="nav-panel">
          <ul class="nav__list">{links}</ul>
          <div class="nav__cta">
            <a class="btn btn--ghost" href="tel:{B['tel']}">{PHONE}Call {B['phone']}</a>
            <a class="btn btn--red" href="{p}contact/">Request an estimate</a>
          </div>
        </div>
      </nav>
      <a class="top__phone" href="tel:{B['tel']}" aria-label="Call {B['phone']}">{PHONE}<span class="top__phone-n">{B['phone']}</span></a>
      <a class="btn btn--red btn--sm top__cta" href="{p}contact/"{link_attr(cur, 'contact')}>Request an estimate</a>
    </div>
  </header>
  <main id="main" tabindex="-1">'''


def footer(p):
    svc = ''.join(f'<li><a href="{p}{s}/">{t}</a></li>' for s, _, t, *_ in SERVICES)
    bbb = f'<li><a href="{B["bbb"]}" rel="noopener" target="_blank">BBB profile{EXT}<span class="vh"> (opens in a new tab)</span></a></li>' if APPROVED['bbb'] else ''
    fb = f'<li><a href="{B["facebook"]}" rel="noopener" target="_blank">Facebook{EXT}<span class="vh"> (opens in a new tab)</span></a></li>' if APPROVED['facebook'] else ''
    since = ' since 1985' if APPROVED['since_1985'] else ''
    return f'''  </main>

  <footer class="foot">
    <div class="wrap foot__grid">
      <div class="foot__brand">
        <a class="brand brand--foot" href="{p or './'}">{WORDMARK}<span class="brand__place">Clarksville, TN<span class="vh"> (home page)</span></span></a>
        <p>Roof repair, roof replacement, storm damage repairs, siding and gutters in Clarksville, Tennessee{since}.</p>
        <a class="foot__phone" href="tel:{B['tel']}">{PHONE}{B['phone']}</a>
      </div>
      <nav aria-label="Services">
        <h2 class="foot__h">Services</h2>
        <ul class="foot__list">{svc}</ul>
      </nav>
      <nav aria-label="Company">
        <h2 class="foot__h">Company</h2>
        <ul class="foot__list"><li><a href="{p}about/">About Action Roofing</a></li><li><a href="{p}service-areas/">Service area</a></li><li><a href="{p}contact/">Request an estimate</a></li><li><a href="{p}privacy/">Privacy policy</a></li>{bbb}{fb}</ul>
      </nav>
      <div>
        <h2 class="foot__h">Contact</h2>
        <ul class="foot__list foot__contact">
          <li><a href="tel:{B['tel']}">{PHONE}Call {B['phone']}</a></li>
          <li><a href="mailto:{B['email']}">{MAIL}{B['email']}</a></li>
          <li>{PIN}{B['city']}, {B['region']} {B['zip']}</li>
          <li>{CLOCK}Contact us to discuss availability</li>
        </ul>
      </div>
    </div>
    <div class="wrap foot__legal">
      <p>© <span data-year>2026</span> {E(B['name'])}, {B['city']}, {B['state']}.</p>
      <p>Photos on this preview are illustrations, not pictures of Action Roofing’s crew or projects.</p>
      <p>Website preview by <a href="https://mnmwebsitesforyou.com/">M&amp;M Websites</a>.</p>
    </div>
  </footer>

  <nav class="dock" aria-label="Quick contact">
    <a class="dock__btn dock__btn--call" href="tel:{B['tel']}">{PHONE}Call now</a>
    <a class="dock__btn dock__btn--est" href="{p}contact/">Request an estimate</a>
  </nav>
</body>
</html>
'''


SERVICE_OPTS = [('', 'Choose one'), ('Roof repair', 'Roof repair'), ('Roof replacement', 'Roof replacement'),
                ('Storm damage roof repair', 'Storm-related roof repair'), ('Siding', 'Siding'), ('Gutters', 'Gutters'),
                ('Not sure', 'Not sure yet')]


def form(p, preset='', title='Request an estimate', tag='h2'):
    o = ''.join(f'<option value="{E(v)}"{" selected" if v == preset and v else ""}>{E(t)}</option>' for v, t in SERVICE_OPTS)
    methods = [('Phone call', 'Phone call'), ('Email', 'Email'), ('Either', 'Either is fine')]
    r = ''.join(f'<label class="pill"><input type="radio" name="contact_method" value="{v}"{" checked" if v == "Phone call" else ""}><span>{t}</span></label>' for v, t in methods)
    return f'''<div class="est" id="estimate">
        <div class="est__intro">
          <{tag} class="h2" id="est-title">{title}</{tag}>
          <p class="lead">Tell us where your property is and what you’ve noticed. Whether you’re planning a replacement or need help with a roofing problem, Action Roofing will get back to you to talk it through.</p>
          <a class="callcard" href="tel:{B['tel']}"><span class="callcard__icon">{PHONE}</span><span><span class="callcard__label">Rather talk now?</span><span class="callcard__n">{B['phone']}</span></span></a>
          <ul class="ticks">
            <li>{CAMERA}Photos taken from the ground help. Please don’t climb onto a damaged roof.</li>
            <li>{CLOCK}Contact us to discuss availability.</li>
          </ul>
        </div>
        <form class="qform" id="estimate-form" method="post" enctype="multipart/form-data" novalidate aria-labelledby="est-title" data-form>
          <div class="notice" id="form-notice" data-preview-only>{ALERT}<p><strong>Preview:</strong> this form isn’t connected yet, so nothing you enter is sent. To reach Action Roofing today, call <a href="tel:{B['tel']}">{B['phone']}</a>.</p></div>
          <p class="fine">Fields marked <span class="req" aria-hidden="true">*</span><span class="vh">with an asterisk</span> are required.</p>
          <div class="hp" aria-hidden="true"><label for="f-company">Company</label><input id="f-company" type="text" name="_honey" tabindex="-1" autocomplete="off"></div>
          <input type="hidden" name="_subject" value="New estimate request from the Action Roofing website">
          <input type="hidden" name="_template" value="table">
          <input type="hidden" name="_captcha" value="true">
          <div class="row row--2">
            <div class="field"><label for="f-name">Your name <span class="req" aria-hidden="true">*</span></label>
              <input id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="f-name-err"><p class="err" id="f-name-err" hidden></p></div>
            <div class="field"><label for="f-phone">Phone <span class="req" aria-hidden="true">*</span></label>
              <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="f-phone-err"><p class="err" id="f-phone-err" hidden></p></div>
          </div>
          <div class="row row--2">
            <div class="field"><label for="f-email">Email <span class="opt" id="f-email-opt">(optional)</span></label>
              <input id="f-email" name="email" type="email" autocomplete="email" spellcheck="false" autocapitalize="off" aria-describedby="f-email-err"><p class="err" id="f-email-err" hidden></p></div>
            <div class="field"><label for="f-place">Property ZIP code or address <span class="req" aria-hidden="true">*</span></label>
              <input id="f-place" name="property" type="text" autocomplete="street-address" required aria-describedby="f-place-err"><p class="err" id="f-place-err" hidden></p></div>
          </div>
          <div class="field"><label for="f-service">Service needed <span class="req" aria-hidden="true">*</span></label>
            <select id="f-service" name="service" required aria-describedby="f-service-err">{o}</select><p class="err" id="f-service-err" hidden></p></div>
          <div class="field"><label for="f-desc">What have you noticed? <span class="req" aria-hidden="true">*</span></label>
            <textarea id="f-desc" name="description" rows="4" required aria-describedby="f-desc-hint f-desc-err"></textarea>
            <p class="hint" id="f-desc-hint">For example: a stain on the bedroom ceiling after last week’s rain, or shingles missing on the back slope.</p><p class="err" id="f-desc-err" hidden></p></div>
          <div class="field drop" id="drop">
            <span class="drop__label" id="f-photos-label">Photos <span class="opt">(optional, up to 5)</span></span>
            <label class="drop__zone" for="f-photos">{CAMERA}<span><strong>Add photos</strong> of the problem<span class="drop__sub">JPG, PNG or HEIC, up to 10 MB each</span></span></label>
            <input class="drop__input" id="f-photos" name="attachment" type="file" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" multiple aria-labelledby="f-photos-label" aria-describedby="f-photos-err">
            <ul class="thumbs" id="thumbs" aria-live="polite"></ul>
            <p class="err" id="f-photos-err" hidden></p>
          </div>
          <fieldset class="field picks"><legend>How should we contact you?</legend><div class="picks__row">{r}</div></fieldset>
          <p class="fine">We use your details only to reply about this request. No mailing lists. See the <a href="{p}privacy/">privacy policy</a>.</p>
          <button class="btn btn--red btn--wide" type="submit" id="f-submit"><span class="btn__label">Send my estimate request</span>{ARROW}</button>
          <div class="status" id="f-status" role="status" aria-live="polite" tabindex="-1" hidden></div>
          <noscript><p class="fine">This form needs JavaScript. Please call {B['phone']} instead.</p></noscript>
        </form>
      </div>'''


def section_head(h2, lead='', id_=None, tag='h2', cls=''):
    idattr = f' id="{id_}"' if id_ else ''
    l = f'<p class="lead">{lead}</p>' if lead else ''
    return f'<div class="shead {cls}"><{tag} class="h2"{idattr}>{h2}</{tag}>{l}</div>'


def cta_band(p, line, sub):
    return f'''<section class="band" aria-labelledby="band-title">
      <div class="wrap band__in">
        <div><h2 class="h2" id="band-title">{line}</h2><p class="lead">{sub}</p></div>
        <div class="band__actions">
          <a class="btn btn--red" href="{p}contact/">Request an estimate{ARROW}</a>
          <a class="btn btn--light" href="tel:{B['tel']}">{PHONE}Call {B['phone']}</a>
        </div>
      </div>
    </section>'''


# ---------- the signature moment: a shingle roof going on, layer by layer ----------
LAYERS = [
    ('deck', 'Roof deck', 'The plywood or plank base that everything else is fastened to.'),
    ('drip', 'Drip edge', 'Metal edging along the eaves and rakes that carries water off the edge and into the gutter.'),
    ('under', 'Underlayment', 'A water-resistant layer rolled out over the deck: a second line of defense under the shingles.'),
    ('starter', 'Starter strip', 'A first row along the eave that seals the bottom edge so wind can’t get under it.'),
    ('shingles', 'Shingles', 'Laid in overlapping courses from the eave up, each row covering the nails of the row below.'),
    ('ridge', 'Ridge cap', 'Caps folded over the peak, where the two slopes meet.'),
    ('gutter', 'Gutters', 'Catch the water at the eave and carry it away from the walls and foundation.'),
]


def roof_svg():
    # A roof slope seen from the street: a trapezoid from the ridge (top) to the eave (bottom).
    T, Bt, L1, R1, L2, R2 = 70, 430, 150, 650, 40, 760
    def xl(y): return L1 + (L2 - L1) * (y - T) / (Bt - T)
    def xr(y): return R1 + (R2 - R1) * (y - T) / (Bt - T)
    poly = f'{L1},{T} {R1},{T} {R2},{Bt} {L2},{Bt}'
    # deck: plywood sheets
    deck = [f'<polygon points="{poly}" fill="#C9A77A"/>']
    for y in range(T + 60, Bt, 60):
        deck.append(f'<line x1="{xl(y):.1f}" y1="{y}" x2="{xr(y):.1f}" y2="{y}" stroke="#A8865B" stroke-width="2"/>')
    for i, y0 in enumerate(range(T, Bt, 60)):
        y1 = min(y0 + 60, Bt)
        for k in range(1, 4):
            f = (k + (0.5 if i % 2 else 0)) / 4
            if f >= 1: continue
            xa = xl(y0) + (xr(y0) - xl(y0)) * f; xb = xl(y1) + (xr(y1) - xl(y1)) * f
            deck.append(f'<line x1="{xa:.1f}" y1="{y0}" x2="{xb:.1f}" y2="{y1}" stroke="#A8865B" stroke-width="2"/>')
    # underlayment rows (rolled from the left)
    under = []
    for i, y0 in enumerate(range(Bt - 72, T - 1, -72)):
        y1 = y0 + 72
        y0c = max(y0 - 8, T)
        pts = f'{xl(y0c):.1f},{y0c} {xr(y0c):.1f},{y0c} {xr(y1):.1f},{y1} {xl(y1):.1f},{y1}'
        under.append(f'<g class="roll" data-i="{i}"><polygon points="{pts}" fill="#5F6B78"/><line x1="{xl(y0c):.1f}" y1="{y0c}" x2="{xr(y0c):.1f}" y2="{y0c}" stroke="#7E8A97" stroke-width="2"/></g>')
    # shingle courses from the eave up
    rows, h = [], 26
    y = Bt - 14 - h
    i = 0
    while y > T + 12:
        y1 = y + h + 10
        pts = f'{xl(y):.1f},{y} {xr(y):.1f},{y} {xr(y1):.1f},{y1} {xl(y1):.1f},{y1}'
        tone = ['#2B3138', '#323942', '#2E353D'][i % 3]
        slots = []
        x = xl(y1) + (24 if i % 2 else 0)
        step = 52
        while x < xr(y1) - 6:
            f = (x - xl(y1)) / (xr(y1) - xl(y1))
            xt = xl(y + 12) + (xr(y + 12) - xl(y + 12)) * f
            slots.append(f'M{xt:.1f} {y + 12}L{x:.1f} {y1}')
            x += step
        rows.append(f'<g class="course" data-i="{i}"><polygon points="{pts}" fill="{tone}"/>'
                    f'<path d="{" ".join(slots)}" stroke="#1B2026" stroke-width="2"/>'
                    f'<line x1="{xl(y1):.1f}" y1="{y1}" x2="{xr(y1):.1f}" y2="{y1}" stroke="#161A1F" stroke-width="3"/></g>')
        y -= h
        i += 1
    rows.reverse()  # paint the top rows first so lower rows overlap them
    starter = f'<polygon points="{xl(Bt-16):.1f},{Bt-16} {xr(Bt-16):.1f},{Bt-16} {R2},{Bt} {L2},{Bt}" fill="#1E2329"/>'
    drip = (f'<path d="M{L2-6},{Bt+6} L{R2+6},{Bt+6}" stroke="#AEB6BF" stroke-width="8" stroke-linecap="round"/>'
            f'<path d="M{L1-4},{T-2} L{L2-6},{Bt+6} M{R1+4},{T-2} L{R2+6},{Bt+6}" stroke="#AEB6BF" stroke-width="7" stroke-linecap="round"/>')
    caps = ''.join(f'<rect x="{x}" y="{T-12}" width="34" height="22" rx="3" fill="{"#252B31" if (x//32)%2 else "#2F363E"}" stroke="#15191E" stroke-width="2"/>'
                   for x in range(L1 - 2, R1 - 20, 32))
    gutter = (f'<rect x="{L2-14}" y="{Bt+10}" width="{R2-L2+28}" height="24" rx="5" fill="#F4F6F8" stroke="#C5CDD5" stroke-width="2"/>'
              f'<rect x="{R2-36}" y="{Bt+30}" width="20" height="74" rx="4" fill="#F4F6F8" stroke="#C5CDD5" stroke-width="2"/>')
    house = (f'<rect x="{L2+20}" y="{Bt+34}" width="{R2-L2-40}" height="86" fill="#9C4A3C"/>'
             + ''.join(f'<line x1="{L2+20}" y1="{y}" x2="{R2-20}" y2="{y}" stroke="#86392D" stroke-width="2"/>' for y in range(Bt + 44, Bt + 120, 10))
             + f'<rect x="{L2+110}" y="{Bt+52}" width="90" height="62" fill="#DCE3EA" stroke="#F4F6F8" stroke-width="6"/>'
             + f'<rect x="{R2-230}" y="{Bt+52}" width="90" height="62" fill="#DCE3EA" stroke="#F4F6F8" stroke-width="6"/>')
    return f'''<svg class="roof" viewBox="0 0 800 560" role="img" aria-labelledby="roof-t">
            <title id="roof-t">Diagram of a shingle roof built up in layers: deck, drip edge, underlayment, starter strip, shingles, ridge cap and gutters.</title>
            <defs><clipPath id="roof-clip"><polygon points="{poly}"/></clipPath></defs>
            <g class="house">{house}</g>
            <g class="ly ly--deck" data-layer="deck">{"".join(deck)}</g>
            <g clip-path="url(#roof-clip)"><g class="ly ly--under" data-layer="under">{"".join(under)}</g>
            <g class="ly ly--starter" data-layer="starter">{starter}</g>
            <g class="ly ly--shingles" data-layer="shingles">{"".join(rows)}</g></g>
            <g class="ly ly--drip" data-layer="drip">{drip}</g>
            <g class="ly ly--ridge" data-layer="ridge">{caps}</g>
            <g class="ly ly--gutter" data-layer="gutter">{gutter}</g>
          </svg>'''


def layers_section(h2='What goes into a shingle roof', lead='A roof is more than the shingles you see from the street. Scroll to watch one go on, layer by layer.'):
    steps = ''.join(f'<li class="lsteps__i" data-step="{k}"><span class="lsteps__n">{n:02d}</span><span><span class="lsteps__t">{t}</span><span class="lsteps__d">{d}</span></span></li>'
                    for n, (k, t, d) in enumerate(LAYERS, 1))
    return f'''<section class="layers" id="layers" aria-labelledby="layers-title" data-layers>
      <div class="layers__track">
        <div class="layers__stick">
          <div class="wrap layers__grid">
            <div class="layers__copy">
              {section_head(h2, lead, 'layers-title')}
              <ol class="lsteps">{steps}</ol>
              <div class="lbar" aria-hidden="true"><span class="lbar__fill"></span></div>
              <p class="fine layers__note">Every roof is different. Ask what yours needs when you request an estimate.</p>
            </div>
            <div class="layers__art">{roof_svg()}</div>
          </div>
        </div>
      </div>
    </section>'''


# ---------- "Where do I start?" picker ----------
PICKS = [
    ('leak', 'A leak or a water stain', 'roof-repair', 'Roof repair', 'Stains on a ceiling or a drip after rain usually mean water is getting past the shingles or flashing somewhere above. The sooner it’s found, the less it spreads.'),
    ('shingle', 'Missing or damaged shingles', 'roof-repair', 'Roof repair', 'A few missing, cracked or curling shingles can often be handled as a repair. Photos from the ground help us see what’s going on.'),
    ('storm', 'Damage after a storm', 'storm-damage-roof-repair', 'Storm damage roof repair', 'Wind, hail and falling limbs can damage a roof in ways you can’t see from the yard. Stay off the roof, take photos from the ground and call.'),
    ('old', 'An old, worn-out roof', 'roof-replacement', 'Roof replacement', 'Widespread curling, bald spots and leaks that keep coming back are signs a roof may be near the end of its life. A replacement may cost less than repeated repairs.'),
    ('gutter', 'Gutters overflowing or sagging', 'siding-gutters', 'Siding & gutters', 'Gutters that overflow, sag or pull away send water down your walls and toward the foundation.'),
    ('siding', 'Loose or damaged siding', 'siding-gutters', 'Siding & gutters', 'Cracked, loose or warped siding lets water into the walls behind it.'),
]
PICK_SERVICE = {'roof-repair': 'Roof repair', 'roof-replacement': 'Roof replacement', 'storm-damage-roof-repair': 'Storm damage roof repair', 'siding-gutters': 'Not sure'}


def picker(p):
    btns = ''.join(f'<li><button class="chip" type="button" aria-pressed="false" data-pick="{k}">{ICONS[k]}<span>{t}</span></button></li>' for k, t, *_ in PICKS)
    data = ''.join(f'<template data-pick-result="{k}"><p class="pick__kicker">Start with</p><h3 class="pick__title">{svc}</h3><p>{why}</p>'
                   f'<div class="pick__actions"><a class="btn btn--red" href="{p}contact/?service={E(PICK_SERVICE[slug])}#estimate">Request an estimate{ARROW}</a>'
                   f'<a class="tlink" href="{p}{slug}/">Read about {svc.lower()}{ARROW}</a></div></template>'
                   for k, t, slug, svc, why in PICKS)
    fallback = ''.join(f'<li><a class="tlink" href="{p}{slug}/">{t}: {svc.lower()}{ARROW}</a></li>' for k, t, slug, svc, why in PICKS)
    return f'''<section class="pick" id="where-to-start" aria-labelledby="pick-title">
      <div class="wrap pick__grid">
        <div>
          {section_head('Not sure what you need? Start with what you’re seeing.', 'Pick the problem that sounds most like yours.', 'pick-title')}
          <ul class="chips" data-picker hidden>{btns}</ul>
          <noscript><ul class="plain">{fallback}</ul></noscript>
        </div>
        <div class="pick__panel" id="pick-panel" aria-live="polite" data-picker-panel hidden>
          <div class="pick__empty">{img(p, 'ladder', '(min-width: 980px) 40vw, 92vw', alt='')}<p>Choose a problem and we’ll point you to the right place to start.</p></div>
        </div>
        {data}
      </div>
    </section>'''


CLARKSVILLE_ZIPS = ['37040', '37041', '37042', '37043', '37044']


def zipcheck(p):
    return f'''<form class="zip" data-zip novalidate aria-labelledby="zip-l">
            <label class="zip__l" id="zip-l" for="zip-in">Check your ZIP code</label>
            <div class="zip__row"><input id="zip-in" name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="e.g. 37043" aria-describedby="zip-out">
            <button class="btn btn--dark" type="submit">Check</button></div>
            <p class="zip__out" id="zip-out" role="status" aria-live="polite"></p>
          </form>'''


def community(p, full=False):
    if not APPROVED['community_story']:
        return ''
    more = '''<p>The project brought together three local businesses: Action Roofing and Windstar Roofing provided the labor, and ABC Supply donated the materials.</p>''' if full else ''
    return f'''<section class="comm" id="community" aria-labelledby="comm-title">
      <div class="wrap comm__grid">
        <div class="comm__h">
          <p class="kicker">In the news · June 2026</p>
          <h2 class="h2 h2--xl" id="comm-title">Local Roofers. A Commitment to Our Community.</h2>
        </div>
        <div class="comm__body">
          <p class="lead">After a contractor stopped returning his calls, Army veteran Keith Cherry got a new roof at no cost to him. Clarksville Now reported that Action Roofing, Windstar Roofing and ABC Supply teamed up to do the job: the two roofing companies contributed the labor, and ABC Supply donated the materials.</p>
          {more}
          <a class="tlink tlink--light" href="{B['story']}" rel="noopener" target="_blank">Read the story on Clarksville Now{EXT}<span class="vh"> (opens in a new tab)</span></a>
        </div>
      </div>
    </section>'''


MENTIONS = ['Robert explaining the work', 'Professional crews', 'Cleanup after the job', 'Fair pricing', 'Good communication', 'Replacements on rental properties', 'Storm-related repairs']


def mentions():
    li = ''.join(f'<li>{CHECK}{m}</li>' for m in MENTIONS)
    return f'''<div class="mentions">
            <h3 class="h3">What customers mention</h3>
            <p>Themes that come up again and again in public reviews of Action Roofing:</p>
            <ul class="mentions__list">{li}</ul>
            <p class="fine">These are past customers’ experiences. Every project is quoted on its own.</p>
          </div>'''


def reviews_section():
    """Approved, attributable reviews only. Renders nothing until REVIEWS has entries."""
    if not REVIEWS:
        return ''
    items = ''.join(f'<li class="rev"><blockquote><p>“{E(q)}”</p></blockquote><p class="rev__by">{E(n)} · {E(src)}, {E(d)}</p></li>' for q, n, src, d in REVIEWS)
    return f'''<section class="revs" aria-labelledby="revs-title"><div class="wrap">{section_head('What customers say', '', 'revs-title')}<ul class="revs__list">{items}</ul></div></section>'''


def faq(items, id_='faq', title='Questions about your roof'):
    qs = ''.join(f'<details class="qa" id="{id_}-{i}"><summary><span>{q}</span>{CHEV}</summary><div class="qa__a"><p>{a}</p></div></details>' for i, (q, a) in enumerate(items, 1))
    ld = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': html.unescape(q), 'acceptedAnswer': {'@type': 'Answer', 'text': html.unescape(a.replace('<a href', '<a href'))}} for q, a in items]}
    # plain-text answers in JSON-LD
    import re
    for qa in ld['mainEntity']:
        qa['acceptedAnswer']['text'] = re.sub('<[^>]+>', '', qa['acceptedAnswer']['text'])
    return f'''<section class="faq" id="{id_}" aria-labelledby="{id_}-title">
      <div class="wrap faq__grid">
        {section_head(title, 'Straight answers to the questions people ask first. Anything else, just call.', id_ + '-title')}
        <div class="faq__list">{qs}</div>
      </div>
    </section>''', ld


BIZ_ID = SITE_URL + '#business'


def biz_ld():
    d = {
        '@context': 'https://schema.org', '@type': 'RoofingContractor', '@id': BIZ_ID,
        'name': B['name'], 'alternateName': B['alt_names'], 'url': SITE_URL,
        'telephone': B['tel_ld'], 'email': B['email'],
        'image': SITE_URL + 'assets/img/og-image.jpg',
        'description': 'Roof repair, roof replacement, storm-related roof repairs, siding and gutters in Clarksville, Tennessee.',
        'address': {'@type': 'PostalAddress', 'addressLocality': B['city'], 'addressRegion': B['region'], 'postalCode': B['zip'], 'addressCountry': 'US'},
        'areaServed': {'@type': 'City', 'name': 'Clarksville', 'containedInPlace': {'@type': 'State', 'name': 'Tennessee'}},
        'knowsAbout': ['Roof repair', 'Roof replacement', 'Storm damage roof repair', 'Siding', 'Gutters'],
    }
    if APPROVED['since_1985']:
        d['foundingDate'] = '1985'
    same = []
    if APPROVED['facebook']: same.append(B['facebook'])
    if APPROVED['bbb']: same.append(B['bbb'])
    if same: d['sameAs'] = same
    return d


def crumbs_ld(name, path):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': SITE_URL + path}]}


def svc_ld(name, path, desc):
    return {'@context': 'https://schema.org', '@type': 'Service', 'name': name, 'serviceType': name, 'description': desc,
            'url': SITE_URL + path, 'provider': {'@id': BIZ_ID},
            'areaServed': {'@type': 'City', 'name': 'Clarksville', 'containedInPlace': {'@type': 'State', 'name': 'Tennessee'}}}


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w') as f:
        f.write(content)


def crumbs(p, name):
    return f'<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="{p}">Home</a></li><li><span aria-current="page">{name}</span></li></ol></nav>'


def services_grid(p, skip=None, h='Roofing, siding and gutters', lead='Four kinds of work from one local contractor. Pick one to see how it works.'):
    cards = ''.join(f'''<li class="card"><a class="card__link" href="{p}{s}/">
            <span class="card__media">{img(p, im, "(min-width: 1100px) 280px, (min-width: 640px) 46vw, 92vw", alt="")}</span>
            <span class="card__body"><span class="card__title">{t}</span><span class="card__text">{d}</span><span class="card__go">See {t.lower()}{ARROW}</span></span>
          </a></li>''' for s, _, t, d, im in SERVICES if s != skip)
    return f'''<section class="svcs" id="services" aria-labelledby="svcs-title">
      <div class="wrap">
        {section_head(h, lead, 'svcs-title')}
        <ul class="cards{' cards--3' if skip else ''}">{cards}</ul>
      </div>
    </section>'''


# =====================================================================================
# HOME
# =====================================================================================
since_line = 'Business started in 1985, according to the BBB' if APPROVED['since_1985'] else ''
proof = []
if APPROVED['since_1985']:
    proof.append(('1985', 'In business since 1985', 'The Better Business Bureau lists Action Roofing’s start date as 1985.', ''))
if APPROVED['bbb']:
    proof.append(('A+', 'BBB rating', 'BBB Accredited in July 2019.', f'<a class="tlink" href="{B["bbb"]}" rel="noopener" target="_blank">View the BBB profile{EXT}<span class="vh"> (opens in a new tab)</span></a>'))
proof.append(('Local', 'Led by the owner', f'Action Roofing is run by {B["owner"]}, here in Clarksville.', '<a class="tlink" href="about/">About Action Roofing' + ARROW + '</a>'))
if APPROVED['community_story']:
    proof.append(('2026', 'Giving back', 'Helped replace an Army veteran’s roof at no cost, with Windstar Roofing and ABC Supply.', '<a class="tlink" href="#community">Read about it' + ARROW + '</a>'))
proof_html = ''.join(f'<li class="proof__i"><span class="proof__big" aria-hidden="true">{b}</span><h3 class="proof__t">{t}</h3><p>{d}</p>{l}</li>' for b, t, d, l in proof)

HOME_FAQ = [
    ('Do you repair roofs, or only replace them?', 'Both. Action Roofing handles roof repairs and full roof replacements. If you’re not sure which one your roof needs, call (931) 645-4784 and describe what you’re seeing.'),
    ('Can you help after a storm?', 'Yes. Storm-related roof repairs are part of the work Action Roofing does. If it’s safe, take photos from the ground, then call or send them with the estimate form. Please don’t climb onto a damaged roof.'),
    ('Do you work on siding and gutters too?', 'Yes. Along with roofing, Action Roofing works on siding and gutters. Tell us what you’re noticing and we’ll talk through it.'),
    ('Where do you work?', 'Clarksville, Tennessee and the surrounding area. If you’re outside Clarksville, call and ask about your address.'),
    ('How do I get an estimate?', 'Call (931) 645-4784 or use the estimate form. Tell us where the property is and what you’ve noticed, and we’ll follow up to talk about your project.'),
    ('When are you available?', 'Contact us to discuss availability. Call (931) 645-4784 and we’ll talk about timing for your project.'),
]
faq_html, faq_ld = faq(HOME_FAQ)

home_desc = 'Contact Action Roofing in Clarksville, TN to discuss roof repairs, roof replacement, siding, and gutters. Call 931-645-4784 or request an estimate.'
home = head('', '', 'Roof Repair & Replacement in Clarksville, TN | Action Roofing', home_desc, [biz_ld(), faq_ld]) + header('', 'home') + f'''

    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__media">
        {img('', 'hero', '100vw', eager=True, cls='hero__img', alt='')}
        <video class="hero__video" muted loop playsinline preload="none" width="1280" height="720" poster="assets/img/hero-1344.webp" aria-hidden="true" data-src-webm="assets/video/hero.webm" data-src-mp4="assets/video/hero.mp4"></video>
        <div class="hero__shade"></div>
      </div>
      <div class="wrap hero__in">
        <p class="kicker kicker--light" data-enter>Action Roofing · {B['city']}, Tennessee</p>
        <h1 class="h1" id="hero-title" data-enter>Roof repair &amp; replacement in Clarksville, TN</h1>
        <p class="hero__lead" data-enter>From one leak to a full tear-off, Action Roofing will look at your roof, explain what’s going on and talk through the next steps for your property.</p>
        <div class="hero__actions" data-enter data-dock-hide>
          <a class="btn btn--red btn--lg" href="tel:{B['tel']}">{PHONE}Call {B['phone']}</a>
          <a class="btn btn--glass btn--lg" href="contact/">Request an estimate{ARROW}</a>
        </div>
        <ul class="hero__facts" data-enter>
          <li>{SHIELD}Led by owner {B['owner']}</li>
          {'<li>' + CHECK + 'BBB Accredited · A+ rating</li>' if APPROVED['bbb'] else ''}
          {'<li>' + HOUSE + 'Started in Clarksville in 1985</li>' if APPROVED['since_1985'] else ''}
        </ul>
      </div>
      <button class="hero__pause" type="button" aria-pressed="false" hidden><span class="vh">Pause background video</span><span class="hero__pause-i" aria-hidden="true"></span></button>
    </section>

    <section class="proof" aria-labelledby="proof-title">
      <div class="wrap">
        <h2 class="vh" id="proof-title">Why you can check us out first</h2>
        <ul class="proof__list">{proof_html}</ul>
      </div>
    </section>

    {services_grid('')}

    {layers_section()}

    <section class="why" aria-labelledby="why-title">
      <div class="wrap why__grid">
        <div class="why__main">
          {section_head('Why Clarksville property owners call Action Roofing', '', 'why-title')}
          <ul class="whys whys--plain">
            <li><h3 class="h3">A record you can look up</h3><p>{'The BBB lists Action Roofing as in business since 1985, accredited by the BBB in 2019, with an A+ rating.' if APPROVED['since_1985'] and APPROVED['bbb'] else 'Action Roofing is a Clarksville business you can look up before you call.'}</p></li>
            <li><h3 class="h3">Owner-led</h3><p>{B['owner']} leads the business. Customers often mention him taking the time to explain the work.</p></li>
            <li><h3 class="h3">Roof, siding and gutters</h3><p>One contractor, and one call, for the roof, the siding and the gutters.</p></li>
            <li><h3 class="h3">Homes and rentals</h3><p>Homeowners and rental property owners both call Action Roofing for repairs and replacements.</p></li>
          </ul>
        </div>
        <div class="why__side">
          <figure class="why__photo">{img('', 'consult', '(min-width: 980px) 40vw, 92vw')}</figure>
          {mentions()}
        </div>
      </div>
    </section>

    {picker('')}

    {community('')}

    {reviews_section()}

    <section class="area" aria-labelledby="area-title">
      <div class="area__media">{img('', 'aerial', '100vw', alt='')}</div>
      <div class="wrap area__in">
        <div class="area__card">
          {section_head('Based in Clarksville, working across the surrounding area', 'Action Roofing works on homes and properties in Clarksville and nearby. Not sure we cover your address? Check your ZIP code or call.', 'area-title')}
          {zipcheck('')}
          <a class="tlink" href="service-areas/">More about our service area{ARROW}</a>
        </div>
      </div>
    </section>

    {faq_html}

    <section class="estimate" aria-label="Request an estimate">
      <div class="wrap">{form('', title='Let’s talk about your roof')}</div>
    </section>
''' + footer('')
write('index.html', home)


# =====================================================================================
# SERVICE PAGES
# =====================================================================================
PAGES = {
    'roof-repair': dict(
        name='Roof repair', h1='Roof repair in Clarksville, TN', img='repair', preset='Roof repair',
        title='Roof Repair in Clarksville, TN | Action Roofing',
        desc='Leak, missing shingles or a worn spot? Action Roofing handles roof repairs in Clarksville, TN. Call (931) 645-4784 or request an estimate online.',
        lead='A small problem on a roof rarely stays small. Call Action Roofing when you notice a leak, missing shingles or a spot that doesn’t look right, and we’ll talk through what it needs.',
        signs_h='Signs your roof needs a repair', signs_img='ladder',
        signs=['Water stains on a ceiling or in the attic', 'Shingles that are missing, cracked or curling', 'Shingle granules collecting in the gutters',
               'A drip or a damp spot after heavy rain', 'Daylight through the roof boards in the attic', 'Damage after wind, hail or a falling limb'],
        steps=[('Tell us what you’re seeing', 'Call or send the estimate form. Photos taken from the ground help.'),
               ('We look at the roof', 'We check the problem area and the roof around it, and explain what we find.'),
               ('You decide what’s next', 'You get an estimate for the repair. If the roof needs more than a repair, we’ll tell you why.')],
        extra=('Repair or replace?', 'Sometimes a repair is all a roof needs. Other times the damage is spread across the roof, or the roof is near the end of its life, and patching it means paying twice. Ask what we’d recommend and why, and decide from there.', 'roof-replacement', 'See roof replacement'),
        faq=[('Can you fix just one part of the roof?', 'Often a repair can focus on the damaged area. Whether that’s the right call depends on the condition of the rest of the roof, which we’ll talk through with you.'),
             ('Should I go up on the roof to look?', 'Please don’t. Roofs are steep and slick, and damaged areas can give way. Take photos from the ground and leave the climbing to us.'),
             ('How soon can you come out?', 'Contact us to discuss availability. Call (931) 645-4784 and we’ll talk about timing.')],
        band=('Noticed a leak or missing shingles?', 'The sooner a roof problem is looked at, the less it can spread.'),
    ),
    'roof-replacement': dict(
        name='Roof replacement', h1='Roof replacement in Clarksville, TN', img='replace', preset='Roof replacement',
        title='Roof Replacement in Clarksville, TN | Action Roofing',
        desc='Planning a new roof in Clarksville? Action Roofing handles full roof replacements for homes and rental properties. Call (931) 645-4784 or request an estimate.',
        lead='When a roof has reached the end of its life, more repairs only put off the bill. Action Roofing replaces roofs for Clarksville homeowners and rental property owners, and talks the project through with you before work starts.',
        signs_h='Signs it may be time for a new roof', signs_img='bundles',
        signs=['Curling, cracked or bald shingles across the roof', 'Leaks in different spots, again and again', 'Sagging along the roofline',
               'Repairs that don’t hold for long', 'Damage across large sections after a storm', 'Daylight or damp boards in the attic'],
        steps=[('Look and talk', 'We look at the roof, explain its condition and answer your questions.'),
               ('Your estimate', 'You get an estimate for the work to review on your own time.'),
               ('A date that works', 'We set a start date with you, weather permitting.'),
               ('Off with the old, on with the new', 'The old roof comes off, the new one goes on, and the site is cleaned up.')],
        extra=('Own a rental property?', 'Customers have used Action Roofing to replace roofs on rental properties. Tell us about the property and anything we should know about tenants or timing when you request an estimate.', 'contact', 'Request an estimate'),
        faq=[('Which roofing materials do you install?', 'It depends on the property and the job. Ask about the options for your roof when you request an estimate.'),
             ('How long does a replacement take?', 'It depends on the size of the roof, the weather and what we find under the old shingles. Ask about timing when you get your estimate.'),
             ('Do I need to be home while you work?', 'Talk it over with us when you schedule. We’ll tell you what to expect on the day, including where to park and what to move.')],
        band=('Thinking about a new roof?', 'Get the facts about your roof’s condition before you decide.'),
        layers=True,
    ),
    'storm-damage-roof-repair': dict(
        name='Storm damage roof repair', h1='Storm damage roof repair in Clarksville', img='storm', preset='Storm damage roof repair',
        title='Storm Damage Roof Repair in Clarksville, TN | Action Roofing',
        desc='Wind, hail or a fallen limb damaged your roof? Call Action Roofing in Clarksville, TN at (931) 645-4784 to talk about storm-related roof repairs.',
        lead='Middle Tennessee storms can tear off shingles, drop limbs onto a roof and open up leaks overnight. Call Action Roofing to talk about the damage and what it will take to repair it.',
        signs_h='Signs of storm damage',
        signs=['Missing, lifted or creased shingles', 'Dents or bruises from hail on shingles, vents and gutters', 'Limbs or debris lying on the roof',
               'A new leak or ceiling stain after the storm', 'Gutters bent or pulled loose', 'Shingle pieces in the yard'],
        steps=[('Stay safe', 'Stay off the roof and well away from any downed power lines.'),
               ('Take photos from the ground', 'Photograph the damage outside and any leaks inside, and note the date of the storm.'),
               ('Limit the water inside', 'Move belongings away from leaks and catch drips in buckets.'),
               ('Call Action Roofing', f'Call {B["phone"]} and describe the damage. We’ll talk about the next steps.')],
        steps_h='After a storm: what to do first',
        extra=('Filing an insurance claim?', 'Your insurance company decides what’s covered. Photos of the damage and the date of the storm help whoever you talk to, so take them before anything is cleaned up.', 'contact', 'Request an estimate'),
        faq=[('Do you offer emergency service?', 'Contact us to discuss availability. Call (931) 645-4784 and describe what happened.'),
             ('Can I wait to fix storm damage?', 'Damage that lets water in tends to get worse with each rain. Even if it looks minor, it’s worth having it looked at soon.'),
             ('Is it safe to stay in the house?', 'If you see sagging ceilings, smell gas or have downed lines nearby, leave and call the right emergency service first. For roof damage alone, call us to talk it through.')],
        band=('Storm hit your roof?', 'Take photos from the ground, then call to talk about the damage.'),
    ),
    'siding-gutters': dict(
        name='Siding & gutters', h1='Siding and gutters in Clarksville, TN', img='siding', preset='Not sure',
        title='Siding & Gutters in Clarksville, TN | Action Roofing',
        desc='Along with roofing, Action Roofing works on siding and gutters in Clarksville, TN. Call (931) 645-4784 or request an estimate for your property.',
        lead='Your roof, siding and gutters work together to keep water out of the house. Along with roofing, Action Roofing works on siding and gutters for Clarksville properties.',
        split=True,
        faq=[('Can you look at the roof, siding and gutters together?', 'Tell us everything you’re noticing when you request an estimate, and we’ll talk through it in one conversation.'),
             ('Do I need new gutters or just a repair?', 'It depends on their condition. Describe what you’re seeing, or send photos, and we’ll talk about it.'),
             ('Which siding and gutter options do you offer?', 'Options vary by job. Ask about them when you request an estimate.')],
        band=('Water where it shouldn’t be?', 'Tell us what you’re seeing on the roof, walls or gutters.'),
    ),
}

for slug, d in PAGES.items():
    p = '../'
    path = slug + '/'
    fq_html, fq_ld = faq(d['faq'], 'faq', f'{d["name"]}: common questions')
    if d.get('split'):
        body = f'''
    <section class="duo" aria-labelledby="duo-title">
      <div class="wrap">
        {section_head('Two parts of the same job: keeping water out', '', 'duo-title')}
        <div class="duo__grid">
          <article class="duo__i">
            <figure class="duo__ph">{img(p, 'siding', '(min-width: 980px) 44vw, 92vw')}</figure>
            <h3 class="h3">Siding</h3>
            <p>Siding protects the walls behind it. Signs it needs attention:</p>
            <ul class="ticklist"><li>{CHECK}Cracked, loose or missing pieces</li><li>{CHECK}Warping, bulging or buckling</li><li>{CHECK}Stains, peeling paint or damp walls inside</li></ul>
          </article>
          <article class="duo__i">
            <figure class="duo__ph">{img(p, 'gutter', '(min-width: 980px) 44vw, 92vw')}</figure>
            <h3 class="h3">Gutters</h3>
            <p>Gutters carry roof water away from the house. Signs they need attention:</p>
            <ul class="ticklist"><li>{CHECK}Overflowing in heavy rain</li><li>{CHECK}Sagging or pulling away from the fascia</li><li>{CHECK}Leaks at the seams, water pooling by the foundation</li></ul>
          </article>
        </div>
        <p class="lead duo__note">Exact siding and gutter options vary by job. Tell us about the property and what you’re noticing, and we’ll talk it through.</p>
      </div>
    </section>'''
    else:
        signs = ''.join(f'<li>{CHECK}{s}</li>' for s in d['signs'])
        steps = ''.join(f'<li class="step"><span class="step__n">{i:02d}</span><h3 class="h3">{t}</h3><p>{x}</p></li>' for i, (t, x) in enumerate(d['steps'], 1))
        ex_h, ex_t, ex_slug, ex_l = d['extra']
        body = f'''
    <section class="signs" aria-labelledby="signs-title">
      <div class="wrap signs__grid">
        <div>{section_head(d['signs_h'], 'If any of these sound familiar, it’s worth a call.', 'signs-title')}
          <ul class="ticklist ticklist--big">{signs}</ul>
        </div>
        <figure class="signs__ph">{img(p, d.get('signs_img', 'ridge'), '(min-width: 980px) 44vw, 92vw')}</figure>
      </div>
    </section>

    <section class="steps" aria-labelledby="steps-title">
      <div class="wrap">
        {section_head(d.get('steps_h', 'How it works'), '', 'steps-title')}
        <ol class="steps__list steps__list--{len(d['steps'])}">{steps}</ol>
        <aside class="aside" aria-labelledby="aside-title"><h3 class="h3" id="aside-title">{ex_h}</h3><p>{ex_t}</p><a class="tlink" href="{p}{ex_slug}/">{ex_l}{ARROW}</a></aside>
      </div>
    </section>'''
        if d.get('layers'):
            body += '\n\n    ' + layers_section('What goes into a new shingle roof', 'Scroll to see a shingle roof go on, from the bare deck to the gutters.')
    page = head(p, path, d['title'], d['desc'], [biz_ld(), svc_ld(d['name'], path, d['desc']), crumbs_ld(d['name'], path), fq_ld]) + header(p, slug) + f'''

    <section class="phero" aria-labelledby="ph-title">
      <div class="wrap phero__grid">
        <div class="phero__copy">
          {crumbs(p, d['name'])}
          <h1 class="h1 h1--page" id="ph-title" data-enter>{d['h1']}</h1>
          <p class="lead" data-enter>{d['lead']}</p>
          <div class="hero__actions" data-enter data-dock-hide>
            <a class="btn btn--red btn--lg" href="tel:{B['tel']}">{PHONE}Call {B['phone']}</a>
            <a class="btn btn--ghost btn--lg" href="#estimate">Request an estimate{ARROW}</a>
          </div>
        </div>
        <figure class="phero__ph" data-enter>{img(p, d['img'], '(min-width: 980px) 50vw, 100vw', eager=True)}</figure>
      </div>
    </section>
{body}

    {fq_html}

    {services_grid(p, skip=slug, h='Other services', lead='Roofing, siding and gutters from one Clarksville contractor.')}

    <section class="estimate" aria-label="Request an estimate">
      <div class="wrap">{form(p, preset=d['preset'], title=d['band'][0])}</div>
    </section>
''' + footer(p)
    write(path + 'index.html', page)


# =====================================================================================
# ABOUT
# =====================================================================================
p = '../'
facts = []
if APPROVED['since_1985']: facts.append(('Business started', '1985'))
if APPROVED['bbb']: facts += [('BBB Accredited since', 'July 23, 2019'), ('BBB rating', 'A+')]
facts += [('Owner', B['owner']), ('Based in', f'{B["city"]}, {B["region"]} {B["zip"]}'), ('Services', 'Roof repair, roof replacement, storm-related roof repairs, siding and gutters')]
facts_html = ''.join(f'<div class="facts__r"><dt>{k}</dt><dd>{v}</dd></div>' for k, v in facts)
about_lead = 'Action Roofing is a Clarksville roofing business led by Robert DeBord. We help property owners address roofing problems and plan exterior improvements, with roofing, siding, and gutter services tailored to the work their property needs.'
if APPROVED['since_1985']:
    about_lead += ' Serving Clarksville since 1985.'
about = head(p, 'about/', 'About Action Roofing | Roofing Contractor in Clarksville, TN',
             'Action Roofing is a Clarksville, TN roofing business led by owner Robert DeBord, offering roof repair, roof replacement, siding and gutters. Call (931) 645-4784.',
             [biz_ld(), crumbs_ld('About', 'about/')]) + header(p, 'about') + f'''

    <section class="phero" aria-labelledby="ph-title">
      <div class="wrap phero__grid">
        <div class="phero__copy">
          {crumbs(p, 'About')}
          <h1 class="h1 h1--page" id="ph-title" data-enter>About Action Roofing</h1>
          <p class="lead" data-enter>{about_lead}</p>
          <div class="hero__actions" data-enter data-dock-hide>
            <a class="btn btn--red btn--lg" href="tel:{B['tel']}">{PHONE}Call {B['phone']}</a>
            <a class="btn btn--ghost btn--lg" href="{p}contact/">Request an estimate{ARROW}</a>
          </div>
        </div>
        <figure class="phero__ph" data-enter>{img(p, 'sunset', '(min-width: 980px) 50vw, 100vw', eager=True)}</figure>
      </div>
    </section>

    <section class="record" aria-labelledby="rec-title">
      <div class="wrap record__grid">
        <div>
          {section_head('Action Roofing at a glance', 'The basics, from public records you can check yourself.', 'rec-title')}
          {'<a class="tlink" href="' + B['bbb'] + '" rel="noopener" target="_blank">View the BBB profile' + EXT + '<span class="vh"> (opens in a new tab)</span></a>' if APPROVED['bbb'] else ''}
        </div>
        <dl class="facts">{facts_html}</dl>
      </div>
    </section>

    <section class="why why--about" aria-labelledby="how-title">
      <div class="wrap why__grid">
        <div class="why__main">
          {section_head('How we work with you', '', 'how-title')}
          <ol class="whys">
            <li><h3 class="h3">You describe the problem</h3><p>Call or send the estimate form with what you’ve noticed, and photos if you have them.</p></li>
            <li><h3 class="h3">We look and explain</h3><p>We look at the roof and tell you what we see, in plain language.</p></li>
            <li><h3 class="h3">You get an estimate</h3><p>You know what the work involves before you decide.</p></li>
            <li><h3 class="h3">The work gets done</h3><p>Roofing, siding or gutters, finished and cleaned up.</p></li>
          </ol>
        </div>
        <div class="why__side">{mentions()}</div>
      </div>
    </section>

    {community(p, full=True)}

    {services_grid(p)}

    {cta_band(p, 'Let’s talk about your roof', f'Call {B["phone"]} or send a request online.')}
''' + footer(p)
write('about/index.html', about)


# =====================================================================================
# SERVICE AREA
# =====================================================================================
area = head(p, 'service-areas/', 'Roofing Service Area: Clarksville, TN | Action Roofing',
            'Action Roofing is based in Clarksville, Tennessee and works on homes and properties in and around the city. Check your ZIP code or call (931) 645-4784.',
            [biz_ld(), crumbs_ld('Service area', 'service-areas/')]) + header(p, 'service-areas') + f'''

    <section class="phero" aria-labelledby="ph-title">
      <div class="wrap phero__grid">
        <div class="phero__copy">
          {crumbs(p, 'Service area')}
          <h1 class="h1 h1--page" id="ph-title" data-enter>Roofing in Clarksville and the surrounding area</h1>
          <p class="lead" data-enter>Action Roofing is based in Clarksville, Tennessee and works on homes and properties in and around the city.</p>
          <div data-enter>{zipcheck(p)}</div>
        </div>
        <figure class="phero__ph" data-enter>{img(p, 'aerial', '(min-width: 980px) 50vw, 100vw', eager=True)}</figure>
      </div>
    </section>

    <section class="steps" aria-labelledby="near-title">
      <div class="wrap">
        {section_head('Outside Clarksville?', 'Action Roofing also works in surrounding areas. The quickest way to find out whether we cover your address is to ask.', 'near-title')}
        <ol class="steps__list steps__list--3">
          <li class="step"><span class="step__n">01</span><h3 class="h3">Call</h3><p>Call <a href="tel:{B['tel']}">{B['phone']}</a> and tell us where the property is.</p></li>
          <li class="step"><span class="step__n">02</span><h3 class="h3">Or send the form</h3><p>Put your ZIP code or address in the <a href="{p}contact/">estimate form</a>.</p></li>
          <li class="step"><span class="step__n">03</span><h3 class="h3">Get a straight answer</h3><p>We’ll tell you whether your address is one we can take on.</p></li>
        </ol>
      </div>
    </section>

    {services_grid(p, h='What we do in and around Clarksville')}

    {cta_band(p, 'In Clarksville or nearby?', f'Call {B["phone"]} to talk about your roof.')}
''' + footer(p)
write('service-areas/index.html', area)


# =====================================================================================
# CONTACT
# =====================================================================================
contact = head(p, 'contact/', 'Request a Roofing Estimate in Clarksville, TN | Action Roofing',
               'Request an estimate from Action Roofing in Clarksville, TN for roof repair, roof replacement, storm damage, siding or gutters. Or call (931) 645-4784.',
               [biz_ld(), crumbs_ld('Request an estimate', 'contact/')]) + header(p, 'contact') + f'''

    <section class="estimate estimate--page" aria-label="Request an estimate">
      <div class="wrap">
        {crumbs(p, 'Request an estimate')}
        {form(p, title='Let’s talk about your roof', tag='h1')}
      </div>
    </section>

    <section class="ways" aria-labelledby="ways-title">
      <div class="wrap">
        <h2 class="h2" id="ways-title">Other ways to reach Action Roofing</h2>
        <ul class="ways__list">
          <li><a class="way" href="tel:{B['tel']}">{PHONE}<span class="way__t">Call</span><span class="way__v">{B['phone']}</span></a></li>
          <li><a class="way" href="mailto:{B['email']}">{MAIL}<span class="way__t">Email</span><span class="way__v">{B['email']}</span></a></li>
          <li><div class="way">{PIN}<span class="way__t">Based in</span><span class="way__v">{B['city']}, {B['state']}</span></div></li>
          <li><div class="way">{CLOCK}<span class="way__t">Availability</span><span class="way__v">Contact us to discuss availability</span></div></li>
        </ul>
      </div>
    </section>
''' + footer(p)
write('contact/index.html', contact)


# =====================================================================================
# PRIVACY (draft: matches what the site actually does today)
# =====================================================================================
privacy = head(p, 'privacy/', 'Privacy Policy | Action Roofing, Clarksville, TN',
               'How the Action Roofing website handles the information you send through the estimate form, and what it does not collect.',
               [crumbs_ld('Privacy policy', 'privacy/')]) + header(p, 'privacy') + f'''

    <section class="doc" aria-labelledby="ph-title">
      <div class="wrap doc__in">
        {crumbs(p, 'Privacy policy')}
        <h1 class="h1 h1--page" id="ph-title">Privacy policy</h1>
        <p class="lead">This page explains what information the Action Roofing website collects and how it’s used. Last updated November 2026.</p>
        <h2 class="h3">What we collect</h2>
        <p>The only personal information this website collects is what you choose to type into the estimate form: your name, phone number, email address, the property’s ZIP code or address, the service you need, your description and any photos you attach, and how you’d like to be contacted.</p>
        <h2 class="h3">How it’s used</h2>
        <p>Action Roofing uses it only to reply to your request and talk with you about your project. We don’t sell it, we don’t add you to a mailing list, and we don’t use it for advertising.</p>
        <h2 class="h3">How the form sends it</h2>
        <p>When the form is connected, your request is delivered to Action Roofing by email through a form-delivery service over an encrypted connection. Until then, the form doesn’t send anything. You can always call <a href="tel:{B['tel']}">{B['phone']}</a> instead.</p>
        <h2 class="h3">Cookies and tracking</h2>
        <p>This website doesn’t set advertising or tracking cookies and doesn’t use third-party analytics. The web host keeps standard server logs, such as IP addresses and the pages requested, to keep the site running and secure.</p>
        <h2 class="h3">Links to other sites</h2>
        <p>Some pages link to other websites, such as the BBB and Clarksville Now. Their own privacy policies apply when you visit them.</p>
        <h2 class="h3">Your choices</h2>
        <p>To ask what we have from a form you sent, or to have it deleted, call <a href="tel:{B['tel']}">{B['phone']}</a> or email <a href="mailto:{B['email']}">{B['email']}</a>.</p>
      </div>
    </section>
''' + footer(p)
write('privacy/index.html', privacy)


# =====================================================================================
# 404
# =====================================================================================
P404 = '/clients/action-roofing/'
nf = head(P404, '404.html', 'Page not found | Action Roofing', 'This page could not be found. Call Action Roofing at (931) 645-4784 or go back to the home page.', []).replace(f'<link rel="canonical" href="{SITE_URL}404.html">\n  ', '') + header(P404, '') + f'''

    <section class="doc doc--404" aria-labelledby="nf-title">
      <div class="wrap doc__in">
        <p class="kicker">Error 404</p>
        <h1 class="h1 h1--page" id="nf-title">This page isn’t here</h1>
        <p class="lead">The link may be old or mistyped. Try one of these instead, or call <a href="tel:{B['tel']}">{B['phone']}</a>.</p>
        <ul class="plain plain--links">
          <li><a class="tlink" href="{P404}">Home{ARROW}</a></li>
          <li><a class="tlink" href="{P404}roof-repair/">Roof repair{ARROW}</a></li>
          <li><a class="tlink" href="{P404}roof-replacement/">Roof replacement{ARROW}</a></li>
          <li><a class="tlink" href="{P404}contact/">Request an estimate{ARROW}</a></li>
        </ul>
      </div>
    </section>
''' + footer(P404)
write('404.html', nf)


# =====================================================================================
# sitemap, robots, manifest, llms.txt
# =====================================================================================
ROUTES = ['', 'roof-repair/', 'roof-replacement/', 'storm-damage-roof-repair/', 'siding-gutters/', 'about/', 'service-areas/', 'contact/', 'privacy/']
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      ''.join(f'  <url><loc>{SITE_URL}{r}</loc><lastmod>2026-11-21</lastmod></url>\n' for r in ROUTES) + '</urlset>\n')
write('robots.txt', ('# Preview: keep crawlers out until launch. At launch set PREVIEW = False in scripts/build.py.\nUser-agent: *\nDisallow: /\n' if PREVIEW
                     else f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n'))
write('site.webmanifest', json.dumps({'name': B['name'], 'short_name': B['name'], 'start_url': './', 'display': 'browser',
                                      'background_color': '#ffffff', 'theme_color': '#ffffff',
                                      'icons': [{'src': 'assets/img/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                                                {'src': 'assets/img/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}]}, indent=2) + '\n')
write('llms.txt', f'''# {B['name']}

> Roofing contractor in {B['city']}, {B['state']}: roof repair, roof replacement, storm-related roof repairs, siding and gutters. Led by owner {B['owner']}.

- Phone: {B['phone']}
- Email: {B['email']}
- Area: {B['city']}, {B['region']} and the surrounding area
- Availability: contact us to discuss availability

## Pages
''' + ''.join(f'- [{t}]({SITE_URL}{s}/)\n' for s, _, t, *_ in SERVICES) + f'''- [About]({SITE_URL}about/)
- [Service area]({SITE_URL}service-areas/)
- [Request an estimate]({SITE_URL}contact/)
''')
print('built', len(ROUTES) + 1, 'pages')
