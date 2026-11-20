#!/usr/bin/env node
/* Two Leos Hauling: end-to-end tests.
 *
 * Serves the whole M&M repo with the security headers from /_headers (same CSP as
 * Cloudflare), then drives every page in Chromium with Playwright and axe-core.
 *
 *   cd clients/two-leos-hauling/tests && node site.test.cjs
 *
 * Uses the playwright and axe-core installed in the M&M tests folder (../../../tests).
 */
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '..');
const ROOT = path.resolve(SITE, '../..');
const BASE_PATH = '/clients/two-leos-hauling/';
const req = (m) => { try { return require(m); } catch (e) { return require(path.join(ROOT, 'tests/node_modules', m)); } };
const { chromium } = req('playwright');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [__dirname, path.join(ROOT, 'tests')] }), 'utf8');

const PAGES = ['', 'junk-removal/', 'property-cleanouts/', 'yard-debris-removal/', 'general-hauling/', 'about/', 'contact/'];
const PHONE = '(509) 688-5071', TEL = 'tel:+15096885071', SMS = 'sms:+15096885071', EMAIL = '96shadle@gmail.com';
const WIDTHS = [320, 390, 768, 1024, 1440];

/* ---------- a small server that applies /_headers like Cloudflare ---------- */
const rules = []; let cur = null;
for (const l of fs.readFileSync(path.join(ROOT, '_headers'), 'utf8').split('\n')) {
  if (!l.trim() || l.startsWith('#')) continue;
  if (!/^\s/.test(l)) { cur = { pat: l.trim(), h: {} }; rules.push(cur); } else { const i = l.indexOf(':'); cur.h[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
}
const match = (p, u) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(u);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webm': 'video/webm', '.mp4': 'video/mp4' };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  let f = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u), st = 200;
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { f = path.join(SITE, '404.html'); st = 404; }
  const h = { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' };
  for (const x of rules) if (match(x.pat, u)) Object.assign(h, x.h);
  const body = fs.readFileSync(f);
  const range = q.headers.range && /bytes=(\d*)-(\d*)/.exec(q.headers.range);
  if (range && /^video/.test(h['Content-Type'])) {
    const s = +range[1] || 0, e = range[2] ? +range[2] : body.length - 1;
    Object.assign(h, { 'Content-Range': `bytes ${s}-${e}/${body.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': e - s + 1 });
    r.writeHead(206, h); return r.end(body.subarray(s, e + 1));
  }
  r.writeHead(st, h); r.end(body);
});

/* ---------- tiny test runner ---------- */
let passed = 0; const failures = [];
async function test(name, fn) {
  try { await fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { failures.push(name); console.log('  FAIL ' + name + '\n       ' + String(e && e.message || e).split('\n').join('\n       ')); }
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const eq = (a, b, m) => assert(a === b, (m || 'expected equal') + `: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);

(async () => {
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  const ORIGIN = `http://127.0.0.1:${server.address().port}`;
  const URL0 = ORIGIN + BASE_PATH;
  const browser = await chromium.launch();

  async function open(route, opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: opts.w || 1440, height: opts.h || 900 }, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage(); const problems = []; const requests = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push('console ' + m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    page.on('requestfailed', (r) => { const f = r.failure() && r.failure().errorText; if (!/ERR_ABORTED/.test(f || '')) problems.push('failed: ' + r.url() + ' ' + f); });
    page.on('response', (r) => { if (r.status() >= 400 && !(opts.allow404 && r.url() === URL0 + route)) problems.push(r.status() + ' ' + r.url()); });
    page.on('request', (r) => requests.push(r.url()));
    const resp = await page.goto(URL0 + route, { waitUntil: 'networkidle' });
    return { ctx, page, problems, requests, resp };
  }
  const html = (route) => fs.readFileSync(path.join(SITE, route, 'index.html'), 'utf8');

  console.log('Two Leos Hauling site tests');

  /* ---------- static content checks ---------- */
  await test('every page exists with one h1, lang, viewport, charset and preview noindex', async () => {
    for (const p of PAGES) {
      const s = html(p);
      eq((s.match(/<h1[\s>]/g) || []).length, 1, p + ' h1 count');
      assert(/<html lang="en(-US)?"/.test(s), p + ' lang');
      assert(/<meta name="viewport"/.test(s) && /<meta charset="utf-8">/i.test(s), p + ' meta');
      assert(/<meta name="robots" content="noindex/.test(s), p + ' preview noindex');
    }
  });

  await test('titles and meta descriptions are unique and the right length', async () => {
    const titles = new Set(), descs = new Set();
    for (const p of PAGES) {
      const s = html(p);
      const t = ((s.match(/<title>([^<]+)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&'), d = (s.match(/<meta name="description" content="([^"]+)"/) || [])[1];
      assert(t && d, p + ' missing title/description');
      assert(t.length <= 65, `${p} title is ${t.length} chars`); assert(d.length >= 70 && d.length <= 165, `${p} description is ${d.length} chars`);
      assert(!titles.has(t) && !descs.has(d), p + ' duplicate title/description'); titles.add(t); descs.add(d);
    }
    eq((html('').match(/<title>([^<]+)/) || [])[1].replace('&amp;', '&'), 'Junk Removal & Hauling in Spokane, WA | Two Leos Hauling LLC', 'home title');
  });

  await test('canonical, Open Graph and Twitter tags point at the page itself', async () => {
    for (const p of PAGES) {
      const s = html(p);
      const canon = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      eq(canon, 'https://mnmwebsitesforyou.com' + BASE_PATH + p, p + ' canonical');
      eq((s.match(/<meta property="og:url" content="([^"]+)"/) || [])[1], canon, p + ' og:url');
      for (const tag of ['og:title', 'og:description', 'og:image', 'og:type']) assert(s.includes(`property="${tag}"`), p + ' ' + tag);
      assert(s.includes('name="twitter:card" content="summary_large_image"'), p + ' twitter card');
    }
    assert(fs.existsSync(path.join(SITE, 'assets/img/og-image.jpg')), 'og image file');
  });

  await test('JSON-LD parses, uses only verified facts and never publishes the street address', async () => {
    for (const p of PAGES) {
      const blocks = [...html(p).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
      assert(blocks.length, p + ' has JSON-LD');
      const all = JSON.stringify(blocks);
      assert(!/streetAddress|Courtland|aggregateRating|"review"|foundingDate|founder/i.test(all), p + ' JSON-LD has an unverified field');
      const biz = blocks.flatMap((b) => b['@graph'] || [b]).find((b) => /LocalBusiness|MovingCompany|HomeAndConstructionBusiness/.test([].concat(b['@type']).join()));
      if (p === '') {
        assert(biz, 'home has a LocalBusiness');
        eq(biz.telephone, '+1-509-688-5071', 'telephone'); eq(biz.email, EMAIL, 'email');
        assert(/Spokane/.test(JSON.stringify(biz.areaServed)), 'areaServed Spokane');
        assert(/08:00/.test(JSON.stringify(biz.openingHoursSpecification)) && /21:00/.test(JSON.stringify(biz.openingHoursSpecification)), 'hours 8-9');
      }
    }
  });

  await test('FAQ structured data matches the visible questions word for word', async () => {
    for (const p of PAGES) {
      const s = html(p);
      const faq = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).flatMap((b) => b['@graph'] || [b]).find((b) => b['@type'] === 'FAQPage');
      if (!faq) continue;
      const visible = [...s.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim());
      eq(faq.mainEntity.length, visible.length, p + ' FAQ count');
      faq.mainEntity.forEach((q, i) => eq(q.name, visible[i], p + ' FAQ question ' + (i + 1)));
      for (const q of faq.mainEntity) {
        const plain = s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
        assert(plain.includes(q.acceptedAnswer.text), p + ' FAQ answer not visible: ' + q.name);
      }
    }
  });

  await test('no invented claims: reviews, ratings, free/same-day, insured, eco, awards, guarantees, years', async () => {
    const banned = [/free (estimate|quote)s?/i, /same[- ]day/i, /\binsured\b/i, /\bbonded\b/i, /\breviews?\b/i, /★|⭐|\b\d(\.\d)? stars?\b/i, /eco[- ]?friendly|recycl|donat/i, /\baward/i, /guarantee/i, /\byears? (of )?experience\b/i, /since (19|20)\d\d/i, /\btestimonial/i, /\bhappy customers\b/i, /Courtland/i, /99207 (E|e)/];
    const files = [...PAGES.map((p) => path.join(p, 'index.html')), '404.html', 'llms.txt'];
    for (const f of files) {
      const text = fs.readFileSync(path.join(SITE, f), 'utf8').replace(/<script[\s\S]*?<\/script>/g, (m) => m.includes('ld+json') ? m : '');
      for (const b of banned) assert(!b.test(text), `${f} contains ${b}`);
    }
  });

  await test('sitemap lists all 7 pages and robots.txt blocks crawling during the preview', async () => {
    const sm = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    eq(locs.length, PAGES.length, 'sitemap URL count');
    for (const p of PAGES) assert(locs.includes('https://mnmwebsitesforyou.com' + BASE_PATH + p), 'sitemap has ' + p);
    const rb = fs.readFileSync(path.join(SITE, 'robots.txt'), 'utf8');
    assert(/Disallow: \/\s/.test(rb) && /Sitemap: https:\/\/mnmwebsitesforyou\.com\/clients\/two-leos-hauling\/sitemap\.xml/.test(rb), 'robots preview rules');
  });

  /* ---------- every page in a browser ---------- */
  await test('every page loads under the production CSP with no errors or failed requests (desktop and phone)', async () => {
    for (const p of PAGES) for (const o of [{}, { w: 390, h: 844, mobile: true }]) {
      const { ctx, page, problems, resp } = await open(p, o);
      eq(resp.status(), 200, p + ' status');
      assert(/script-src 'self'/.test(resp.headers()['content-security-policy'] || ''), 'CSP header served');
      await page.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
      await page.waitForTimeout(400);
      assert(!problems.length, p + ' ' + (o.mobile ? 'phone' : 'desktop') + ':\n' + problems.join('\n'));
      await ctx.close();
    }
  });

  await test('no horizontal scrolling at 320, 390, 768, 1024 and 1440 px', async () => {
    for (const p of [...PAGES, '404.html']) {
      const { ctx, page } = await open(p, { allow404: true });
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert(wide <= 0, `${p || 'home'} overflows by ${wide}px at ${w}px`);
      }
      await ctx.close();
    }
  });

  await test('axe-core finds no accessibility violations (desktop and phone)', async () => {
    for (const p of [...PAGES, '404.html']) for (const o of [{}, { w: 390, h: 844, mobile: true }]) {
      const { ctx, page } = await open(p, { ...o, reduced: true, allow404: true });
      await page.evaluate(AXE);
      const v = await page.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations.map((x) => x.id + ': ' + x.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')));
      assert(!v.length, `${p || 'home'} ${o.mobile ? 'phone' : 'desktop'}:\n` + v.join('\n'));
      await ctx.close();
    }
  });

  await test('internal links and in-page anchors all resolve', async () => {
    const seen = new Set();
    for (const p of [...PAGES, '404.html']) {
      const { ctx, page } = await open(p, { allow404: true });
      const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
      for (const l of links) {
        const u = new URL(l);
        if (u.origin !== ORIGIN) continue;
        const key = u.pathname + u.hash; if (seen.has(key)) continue; seen.add(key);
        assert(u.pathname.startsWith(BASE_PATH) || u.pathname === '/', 'link leaves the client folder: ' + l);
        const r = await page.request.get(ORIGIN + u.pathname);
        eq(r.status(), 200, 'link ' + u.pathname + ' on ' + (p || 'home'));
        if (u.hash.length > 1) {
          const body = await r.text();
          assert(body.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`), 'missing anchor ' + key);
        }
      }
      await ctx.close();
    }
  });

  await test('call, text and email links use the verified contact details everywhere', async () => {
    for (const p of PAGES) {
      const s = html(p);
      const tels = [...s.matchAll(/href="(tel:[^"]+)"/g)].map((m) => m[1]), sms = [...s.matchAll(/href="(sms:[^"]+)"/g)].map((m) => m[1]);
      const mails = [...s.matchAll(/href="mailto:([^"?]+)/g)].map((m) => m[1]);
      assert(tels.length >= 2 && tels.every((t) => t === TEL), p + ' tel links ' + tels);
      assert(sms.length >= 1 && sms.every((t) => t === SMS), p + ' sms links ' + sms);
      assert(mails.every((m) => m === EMAIL), p + ' mailto ' + mails);
      const phones = s.replace(/<[^>]+>/g, ' ').match(/\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/g) || [];
      assert(phones.every((x) => x.replace(/\D/g, '') === '5096885071' || x.replace(/\D/g, '') === '5095550123'), p + ' unexpected phone: ' + phones);
      assert(!/hello@|mnmwebsitesforyou@/.test(s), p + ' has a wrong email');
    }
  });

  await test('every image loads, has alt text and the width/height it is drawn at', async () => {
    for (const p of PAGES) {
      const { ctx, page } = await open(p);
      await page.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; } for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
      await page.waitForLoadState('networkidle');
      const bad = await page.$$eval('img', (is) => is.filter((i) => !i.complete || !i.naturalWidth || !i.hasAttribute('alt') || !i.getAttribute('width') || !i.getAttribute('height') || Math.abs(i.naturalWidth / i.naturalHeight - i.width / i.height) > 0.05 * (i.naturalWidth / i.naturalHeight) && getComputedStyle(i).objectFit !== 'cover').map((i) => i.currentSrc || i.src));
      assert(!bad.length, (p || 'home') + ' bad images: ' + bad.join(', '));
      await ctx.close();
    }
  });

  await test('buttons and controls are at least 44 px tall on a phone', async () => {
    for (const p of PAGES) {
      const { ctx, page } = await open(p, { w: 390, h: 844, mobile: true });
      const small = await page.$$eval('a.btn, button, .dock a, .nav__cta, input:not([type=hidden]):not(.hp):not(.drop__input), select, textarea, .pick, .consent', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && cs.visibility !== 'hidden' && !e.closest('[hidden]') && e.type !== 'radio' && e.type !== 'checkbox' && r.height < 44; }).map((e) => (e.id || e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().height)));
      assert(!small.length, (p || 'home') + ' small targets: ' + small.join(', '));
      await ctx.close();
    }
  });

  await test('hidden things stay hidden: error messages and the sent panel', async () => {
    const { ctx, page } = await open('contact/');
    const shown = await page.$$eval('.err, #q-sent, #sent-demo', (els) => els.filter((e) => e.getBoundingClientRect().height > 0).map((e) => e.id));
    assert(!shown.length, 'visible before use: ' + shown);
    await ctx.close();
  });

  /* ---------- behaviour ---------- */
  await test('mobile menu opens, traps the page behind it and closes with Escape', async () => {
    const { ctx, page } = await open('', { w: 390, h: 844, mobile: true });
    const t = page.locator('.nav__toggle');
    assert(await t.isVisible(), 'menu button visible');
    await t.click();
    eq(await t.getAttribute('aria-expanded'), 'true', 'expanded');
    assert(await page.locator('#nav-list a', { hasText: 'Junk Removal' }).isVisible(), 'links visible');
    assert(await page.evaluate(() => document.querySelector('main').inert === true), 'main is inert while open');
    await page.keyboard.press('Escape');
    eq(await t.getAttribute('aria-expanded'), 'false', 'closed by Escape');
    assert(await page.evaluate(() => document.activeElement.classList.contains('nav__toggle')), 'focus returns to the button');
    await t.click(); await page.locator('#nav-list a', { hasText: 'About' }).click();
    await page.waitForURL(/about\/$/); eq(await page.locator('h1').count(), 1, 'navigated to about');
    await ctx.close();
  });

  await test('desktop nav marks the current page', async () => {
    for (const [p, label] of [['junk-removal/', 'Junk Removal'], ['about/', 'About'], ['general-hauling/', 'Hauling']]) {
      const { ctx, page } = await open(p);
      eq(await page.locator('#nav-list [aria-current="page"]').innerText(), label, p);
      await ctx.close();
    }
  });

  await test('trailer calculator fills, counts cubic yards and carries the load into the quote form', async () => {
    const { ctx, page } = await open('');
    await page.locator('#trailer').scrollIntoViewIfNeeded();
    await page.click('[data-item="sofa"][data-delta="1"]'); await page.click('[data-item="sofa"][data-delta="1"]');
    await page.click('[data-item="fridge"][data-delta="1"]');
    eq(await page.textContent('#load-yd'), '6.5', 'cubic yards'); eq(await page.textContent('#trailer-pct'), '46%', 'percent');
    eq(await page.textContent('#n-sofa'), '2', 'sofa count');
    const fill = await page.$eval('#trailer-fill', (e) => parseFloat(e.style.transform.replace('scaleY(', ''))); eq(fill, 0.464, 'fill');
    await page.click('[data-item="sofa"][data-delta="-1"]'); eq(await page.textContent('#load-yd'), '4', 'after removing one');
    await page.click('[data-item="sofa"][data-delta="-1"]');
    eq(await page.textContent('#n-sofa'), '0', 'back to zero');
    assert(await page.locator('[data-item="sofa"][data-delta="-1"]').isDisabled(), 'minus disabled at zero');
    for (let i = 0; i < 6; i++) await page.click('[data-item="branches"][data-delta="1"]');
    assert(/more than one load/.test(await page.textContent('#load-trips')), 'over capacity message');
    eq(await page.$eval('#trailer-fill', (e) => parseFloat(e.style.transform.replace('scaleY(', ''))), 1, 'fill caps at full');
    for (let i = 0; i < 6; i++) await page.click('[data-item="branches"][data-delta="-1"]');
    await page.click('[data-item="sofa"][data-delta="1"]'); await page.click('[data-item="fridge"][data-delta="1"]'); await page.click('[data-item="boxes"][data-delta="1"]');
    await page.click('#load-quote');
    await page.waitForURL(/contact\/\?/);
    const items = await page.inputValue('#q-items');
    assert(/Sofa/.test(items) && /Fridge/.test(items) && /10 boxes/.test(items), 'items carried over: ' + items);
    eq(await page.locator('input[name="load_size"]:checked').getAttribute('value'), 'Half a trailer', 'load size carried over');
    await ctx.close();
  });

  await test('service pages preselect their service in the quote form', async () => {
    for (const [p, v] of [['junk-removal/', 'Junk removal'], ['property-cleanouts/', 'Property cleanout'], ['yard-debris-removal/', 'Yard debris removal'], ['general-hauling/', 'General hauling']]) {
      const { ctx, page } = await open(p);
      eq(await page.inputValue('#q-service'), v, p);
      await ctx.close();
    }
  });

  await test('quote form shows clear errors, focuses the first problem and checks phone and ZIP', async () => {
    const { ctx, page } = await open('contact/');
    await page.click('#q-submit');
    for (const id of ['q-name', 'q-phone', 'q-zip', 'q-service', 'q-items', 'q-consent']) {
      assert(await page.locator('#' + id + '-err').isVisible(), id + ' error visible');
      eq(await page.getAttribute('#' + id, 'aria-invalid'), 'true', id + ' aria-invalid');
    }
    assert(!(await page.locator('#q-email-err').isVisible()), 'email is optional');
    eq(await page.evaluate(() => document.activeElement.id), 'q-name', 'focus on first problem');
    assert(/6 things need fixing/.test(await page.textContent('#q-status')), 'status message');
    await page.fill('#q-phone', '555-12'); await page.locator('#q-phone').blur();
    assert(/10-digit/.test(await page.textContent('#q-phone-err')), 'phone message');
    await page.fill('#q-phone', '(509) 555-0123'); eq(await page.getAttribute('#q-phone', 'aria-invalid'), 'false', 'phone fixed while typing');
    await page.fill('#q-zip', '99207-1234'); eq(await page.inputValue('#q-zip'), '99207', 'ZIP keeps five digits');
    await page.fill('#q-zip', ''); await page.locator('#q-zip').pressSequentially('9a9b2'); eq(await page.inputValue('#q-zip'), '992', 'ZIP drops letters');
    await page.fill('#q-email', 'nope@'); await page.locator('#q-email').blur();
    assert(await page.locator('#q-email-err').isVisible(), 'bad email flagged');
    await ctx.close();
  });

  await test('photos: previews, remove button, wrong file type and the 6-photo limit', async () => {
    const { ctx, page } = await open('contact/');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
    const pic = (n) => ({ name: `junk-${n}.png`, mimeType: 'image/png', buffer: png });
    await page.setInputFiles('#q-photos', [pic(1), pic(2)]);
    await page.waitForFunction(() => document.querySelectorAll('#thumbs img[src^="data:"]').length === 2);
    await page.setInputFiles('#q-photos', [pic(3)]);
    await page.waitForFunction(() => document.querySelectorAll('#thumbs img').length === 3);
    eq(await page.$eval('#q-photos', (i) => i.files.length), 3, 'input holds all photos for upload');
    await page.click('[aria-label="Remove photo 2"]');
    eq(await page.locator('#thumbs img').count(), 2, 'removed one');
    await page.setInputFiles('#q-photos', [{ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') }]);
    assert(/isn’t a photo/.test(await page.textContent('#q-photos-err')), 'rejects non-images');
    await page.setInputFiles('#q-photos', [4, 5, 6, 7, 8].map(pic));
    assert(/up to 6 photos/.test(await page.textContent('#q-photos-err')), 'limit message');
    await page.waitForFunction(() => document.querySelectorAll('#thumbs img').length === 6);
    await ctx.close();
  });

  await test('a valid request in preview mode shows the owner’s copy and sends nothing anywhere', async () => {
    const { ctx, page, requests, problems } = await open('contact/');
    await page.fill('#q-name', 'Sam Rivera'); await page.fill('#q-phone', '509-555-0123'); await page.fill('#q-zip', '99201');
    await page.selectOption('#q-service', 'Junk removal');
    await page.fill('#q-items', 'Old couch and a mattress in the garage, easy driveway access.');
    await page.check('input[name="load_size"][value="A few items"]', { force: true });
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
    await page.setInputFiles('#q-photos', [{ name: 'couch.png', mimeType: 'image/png', buffer: png }]);
    await page.waitForSelector('#thumbs img');
    await page.check('#q-consent', { force: true });
    const before = requests.length;
    await page.click('#q-submit');
    await page.waitForSelector('#q-sent:not([hidden])');
    assert(await page.locator('#quote-form').isHidden(), 'form hidden after send');
    assert(/Thanks, Sam/.test(await page.textContent('.sent__title')), 'thanks uses first name');
    const inbox = await page.textContent('#inbox');
    for (const s of ['to 96shadle@gmail.com', 'Sam Rivera', '509-555-0123', '99201', 'Junk removal', 'Old couch', 'A few items', '1 attached']) assert(inbox.includes(s), 'inbox shows ' + s);
    eq(await page.locator('.inbox__pics img').count(), 1, 'photo in inbox preview');
    const sentOut = requests.slice(before).filter((u) => !u.startsWith('data:') && !u.startsWith(ORIGIN));
    assert(!sentOut.length, 'preview mode sent requests: ' + sentOut);
    await page.click('#q-again');
    assert(await page.locator('#quote-form').isVisible(), 'form back');
    eq(await page.inputValue('#q-name'), '', 'form reset'); eq(await page.locator('#thumbs img').count(), 0, 'photos cleared');
    assert(!problems.length, problems.join('\n'));
    await ctx.close();
  });

  await test('the honeypot silently drops bot submissions', async () => {
    const { ctx, page } = await open('contact/');
    await page.fill('#q-name', 'Bot'); await page.fill('#q-phone', '5095550123'); await page.fill('#q-zip', '99201');
    await page.selectOption('#q-service', 'Not sure'); await page.fill('#q-items', 'spam spam spam'); await page.check('#q-consent', { force: true });
    await page.$eval('input[name="_honey"]', (i) => { i.value = 'http://spam.example'; });
    await page.click('#q-submit'); await page.waitForTimeout(1000);
    assert(await page.locator('#q-sent').isHidden(), 'bot request not accepted');
    await ctx.close();
  });

  await test('live mode posts the form with photos to FormSubmit over HTTPS (intercepted, nothing really sent)', async () => {
    const ctx = await browser.newContext(); const page = await ctx.newPage(); let post = null;
    await page.route('**/assets/js/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: "window.TL_CONFIG={formAction:'https://formsubmit.co/96shadle@gmail.com',maxPhotos:6,maxPhotoMB:10};" }));
    await page.route('https://formsubmit.co/**', (r) => { post = { url: r.request().url(), method: r.request().method(), type: r.request().headers()['content-type'] || '', body: r.request().postDataBuffer() }; r.fulfill({ status: 200, contentType: 'text/html', body: '<p>ok</p>' }); });
    await page.goto(URL0 + 'contact/', { waitUntil: 'networkidle' });
    await page.fill('#q-name', 'Sam Rivera'); await page.fill('#q-phone', '509-555-0123'); await page.fill('#q-zip', '99201');
    await page.selectOption('#q-service', 'Junk removal'); await page.fill('#q-items', 'Old couch in the garage.'); await page.check('#q-consent', { force: true });
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
    await page.setInputFiles('#q-photos', [{ name: 'couch.png', mimeType: 'image/png', buffer: png }]);
    await page.waitForSelector('#thumbs img');
    await Promise.all([page.waitForRequest('https://formsubmit.co/**'), page.click('#q-submit')]);
    await page.waitForTimeout(300);
    assert(post, 'form posted'); eq(post.method, 'POST', 'method'); eq(post.url, 'https://formsubmit.co/96shadle@gmail.com', 'endpoint');
    assert(/multipart\/form-data/.test(post.type), 'multipart so photos go along');
    const b = post.body ? post.body.toString('latin1') : '';
    if (b) for (const s of ['name="name"', 'Sam Rivera', 'name="attachment"; filename="couch.png"', 'name="_next"', 'sent=1']) assert(b.includes(s), 'post has ' + s);
    await ctx.close();
  });

  await test('returning from FormSubmit with ?sent=1 shows the thank-you message', async () => {
    const { ctx, page } = await open('contact/?sent=1');
    assert(await page.locator('#q-sent').isVisible() && await page.locator('#sent-demo').isHidden(), 'thanks shown without preview');
    await ctx.close();
  });

  await test('hero video waits for the page, plays muted inline, and is skipped with reduced motion and on phones', async () => {
    const a = await open('');
    await a.page.waitForFunction(() => { const v = document.querySelector('.hero video'); return v && v.currentSrc; }, null, { timeout: 8000 });
    const v = await a.page.$eval('.hero video', (v) => ({ muted: v.muted, inline: v.playsInline, loop: v.loop, still: !!document.querySelector('.hero__img') }));
    assert(v.muted && v.inline && v.loop && v.still, 'video attrs ' + JSON.stringify(v));
    await a.ctx.close();
    const b = await open('', { reduced: true });
    await b.page.waitForTimeout(1500);
    eq(await b.page.$eval('.hero video', (v) => v.currentSrc), '', 'no video with reduced motion');
    assert(!b.requests.some((u) => /\.(webm|mp4)$/.test(u)), 'video not downloaded');
    const c = await open('', { w: 390, h: 844, mobile: true });
    await c.page.waitForTimeout(2500);
    assert(!c.requests.some((u) => /\.(webm|mp4)$/.test(u)), 'phones keep the still photo');
    await c.ctx.close();
    eq(await b.page.$eval('.reveal', (e) => getComputedStyle(e).opacity), '1', 'content visible without animation');
    await b.ctx.close();
  });

  await test('the sticky call/text dock shows on phones and steps aside at the quote form', async () => {
    const { ctx, page } = await open('', { w: 390, h: 844, mobile: true });
    await page.evaluate(() => scrollTo(0, 900)); await page.waitForTimeout(500);
    assert(await page.locator('.dock').isVisible(), 'dock visible');
    eq(await page.locator('.dock a[href^="tel:"]').getAttribute('href'), TEL, 'dock call');
    eq(await page.locator('.dock a[href^="sms:"]').getAttribute('href'), SMS, 'dock text');
    await page.locator('#q-name').scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
    assert(await page.locator('.dock').evaluate((d) => d.classList.contains('is-away') || getComputedStyle(d).opacity === '0' || d.getBoundingClientRect().top >= innerHeight), 'dock steps aside at the form');
    await ctx.close();
  });

  await test('the 404 page returns 404 and links home', async () => {
    const { ctx, page, resp } = await open('no-such-page/', { allow404: true });
    eq(resp.status(), 404, 'status');
    assert(await page.locator('a[href$="/clients/two-leos-hauling/"], a[href="./"], a[href="/clients/two-leos-hauling/"]').count() > 0, 'link home');
    await ctx.close();
  });

  await test('keyboard users get a skip link and a visible focus ring', async () => {
    const { ctx, page } = await open('');
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { text: a.textContent.trim(), href: a.getAttribute('href'), outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: cs.boxShadow }; });
    assert(/skip/i.test(f.text) && f.href === '#main', 'first tab is the skip link: ' + JSON.stringify(f));
    assert(f.outline !== 'none 0px' || f.shadow !== 'none', 'focus visible');
    await ctx.close();
  });

  await browser.close(); server.close();
  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) { console.log('Failed:\n  ' + failures.join('\n  ')); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
