#!/usr/bin/env node
/* Action Roofing: end-to-end tests.
 *
 * Serves the whole M&M repo with the security headers from /_headers (the same CSP
 * Cloudflare sends), then drives every page in Chromium with Playwright and axe-core.
 *
 *   cd clients/action-roofing/tests && node site.test.cjs
 *
 * Uses the Playwright that is installed globally (or in ../../../tests) and axe-core
 * from the M&M tests folder (../../../tests/node_modules).
 */
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '..');
const ROOT = path.resolve(SITE, '../..');
const BASE_PATH = '/clients/action-roofing/';
const req = (m) => { try { return require(m); } catch (e) { return require(path.join(ROOT, 'tests/node_modules', m)); } };
const { chromium } = req('playwright');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [__dirname, path.join(ROOT, 'tests')] }), 'utf8');

const PAGES = ['', 'roof-repair/', 'roof-replacement/', 'storm-damage-roof-repair/', 'siding-gutters/', 'about/', 'service-areas/', 'contact/', 'privacy/'];
const PHONE = '(931) 645-4784', TEL = 'tel:+19316454784', EMAIL = 'actionroofing123@gmail.com';
const WIDTHS = [320, 390, 768, 1024, 1440];

/* ---------- a small server that applies /_headers like Cloudflare ---------- */
const rules = []; let cur = null;
for (const l of fs.readFileSync(path.join(ROOT, '_headers'), 'utf8').split('\n')) {
  if (!l.trim() || l.startsWith('#')) continue;
  if (!/^\s/.test(l)) { cur = { pat: l.trim(), h: {} }; rules.push(cur); } else { const i = l.indexOf(':'); cur.h[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
}
const CSP = rules.find((r) => r.pat === '/*').h['Content-Security-Policy'];
const match = (p, u) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(u);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webm': 'video/webm', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
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
const html = (route) => fs.readFileSync(path.join(SITE, route, route.endsWith('.html') ? '' : 'index.html'), 'utf8');
const CSS = { escape: (s) => s.replace(/[^\w-]/g, (c) => '\\' + c) };
const text = (s) => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

(async () => {
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  const ORIGIN = `http://127.0.0.1:${server.address().port}`;
  const URL0 = ORIGIN + BASE_PATH;
  const browser = await chromium.launch();

  async function open(route, opts = {}) {
    const ctx = await browser.newContext({
      viewport: { width: opts.w || 1440, height: opts.h || 900 }, isMobile: !!opts.mobile, hasTouch: !!opts.mobile,
      reducedMotion: opts.reduced ? 'reduce' : 'no-preference', javaScriptEnabled: !opts.nojs,
    });
    const page = await ctx.newPage(); const problems = []; const requests = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push('console ' + m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    page.on('requestfailed', (r) => { const f = r.failure() && r.failure().errorText; if (!/ERR_ABORTED/.test(f || '')) problems.push('failed: ' + r.url() + ' ' + f); });
    page.on('response', (r) => { if (r.status() >= 400 && !opts.allow404) problems.push(r.status() + ' ' + r.url()); });
    page.on('request', (r) => requests.push({ url: r.url(), method: r.method() }));
    const resp = await page.goto(URL0 + route, { waitUntil: 'networkidle' });
    return { ctx, page, problems, requests, resp };
  }

  console.log('Action Roofing site tests');

  /* ================= static checks ================= */
  await test('every page: one h1, lang, viewport, unique title and description, canonical, share tags, preview noindex', async () => {
    const titles = new Set(), descs = new Set();
    for (const p of PAGES) {
      const s = html(p);
      eq((s.match(/<h1[\s>]/g) || []).length, 1, p + ' h1 count');
      assert(/<html lang="en-US"/.test(s), p + ' lang');
      assert(/<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">/.test(s), p + ' viewport');
      assert(/<meta name="robots" content="noindex, nofollow">/.test(s), p + ' must be noindex while in preview');
      const t = (s.match(/<title>([^<]+)<\/title>/) || [])[1]; assert(t && t.length >= 30 && t.length <= 66, p + ' title length ' + (t || '').length + ': ' + t);
      const d = (s.match(/<meta name="description" content="([^"]+)"/) || [])[1]; assert(d && d.length >= 100 && d.length <= 170, p + ' description length ' + (d || '').length);
      assert(!titles.has(t) && !descs.has(d), p + ' duplicate title or description'); titles.add(t); descs.add(d);
      assert(s.includes(`<link rel="canonical" href="https://mnmwebsitesforyou.com${BASE_PATH}${p}">`), p + ' canonical');
      for (const m of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'og:site_name']) assert(s.includes(`property="${m}"`), p + ' missing ' + m);
      assert(s.includes('name="twitter:card" content="summary_large_image"'), p + ' twitter card');
    }
    eq(html('').match(/<title>([^<]+)<\/title>/)[1], 'Roof Repair &amp; Replacement in Clarksville, TN | Action Roofing', 'home title');
    assert(fs.readFileSync(path.join(SITE, 'robots.txt'), 'utf8').includes('Disallow: /'), 'preview robots.txt blocks crawlers');
  });

  await test('structured data parses, uses only supported facts: no street address, rating, review or license', async () => {
    for (const p of PAGES) {
      const blocks = [...html(p).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
      const all = JSON.stringify(blocks);
      for (const bad of ['aggregateRating', 'review', 'streetAddress', 'priceRange', 'openingHours', 'hasCredential', '70499', 'Dunbar', 'geo']) assert(!all.includes(bad), p + ' JSON-LD must not include ' + bad);
      if (p !== 'privacy/') {
        const biz = blocks.find((b) => b['@type'] === 'RoofingContractor'); assert(biz, p + ' RoofingContractor');
        eq(biz.telephone, '+1-931-645-4784'); eq(biz.address.addressLocality, 'Clarksville'); eq(biz.address.postalCode, '37043');
      }
    }
    const faq = [...html('').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((b) => b['@type'] === 'FAQPage');
    const visible = text(html(''));
    for (const q of faq.mainEntity) { assert(visible.includes(q.name), 'FAQ question visible: ' + q.name); assert(visible.includes(q.acceptedAnswer.text), 'FAQ answer visible: ' + q.name); }
  });

  await test('content rules: no unverified claims, invented reviews, hours, address, license or guarantees anywhere', async () => {
    const banned = [
      /licensed\s*(and|&)\s*insured/i, /\binsured\b/i, /\bbonded\b/i, /licen[cs]e (#|no|number)/i, /70499/, /24\/7|24 hours|open 24/i,
      /free (estimate|inspection|quote)/i, /no[- ]cost (estimate|inspection)/i, /guarantee/i, /warrant(y|ies)/i, /lifetime/i,
      /#1|number one|best roof/i, /lowest price/i, /same[- ]day/i, /one[- ]day/i, /30[- ]minute/i, /since 2001/i, /5\.0|4\.7|99\+?\s*(reviews|five)/i,
      /five[- ]star/i, /thousands of/i, /veteran[- ]owned/i, /free roof program/i, /\bstandard seam\b|\bstanding seam\b|\bTPO\b|\bEPDM\b|\bskylight/i,
      /\bwindow (install|tint|repair)/i, /\btarp/i, /\bfinancing\b/i, /\bcommercial roof/i, /Dunbar Cave/i, /Mon(day)?[–-]Fri/i, /9 ?AM/i,
      /Hopkinsville|Oak Grove|Sango|Woodlawn|Pleasant View|Springfield|Adams,|Kentucky|statewide/i, /certified|certification/i,
      /insurance (claim )?(help|assistance|approval)/i, /we work with (your )?insurance/i, /you own|yours to keep|in your name/i, /lorem|TODO|placeholder/i, /555-/,
    ];
    const files = [...PAGES.map((p) => [p, html(p)]), ['404.html', html('404.html')], ['llms.txt', fs.readFileSync(path.join(SITE, 'llms.txt'), 'utf8')]];
    for (const [p, s] of files) {
      const t = text(s);
      for (const re of banned) { const m = t.match(re); assert(!m, `${p}: banned wording "${m && m[0]}" (${re})`); }
    }
  });

  await test('contact details are the confirmed ones and appear consistently', async () => {
    for (const p of PAGES) {
      const s = html(p);
      assert(s.includes(`href="${TEL}"`), p + ' tel link');
      assert(s.includes(PHONE), p + ' phone number shown');
      assert(s.includes(`mailto:${EMAIL}`), p + ' email in footer');
      for (const m of s.matchAll(/href="tel:([^"]+)"/g)) eq(m[1], '+19316454784', p + ' every tel link');
      for (const m of s.matchAll(/mailto:([^"?]+)/g)) eq(m[1], EMAIL, p + ' every mailto');
      assert(/Contact us to discuss availability/.test(s), p + ' availability line');
      assert(!/hello@/.test(s), p + ' no hello@ address');
    }
  });

  await test('unbuilt content stays out: no reviews section, no projects page or link, BBB credited as a link only', async () => {
    for (const p of PAGES) {
      const s = html(p);
      assert(!/class="revs"/.test(s), p + ' reviews section must not render without approved reviews');
      assert(!/projects\//.test(s), p + ' no projects link');
      assert(!/<img[^>]+bbb/i.test(s), p + ' no BBB badge image');
    }
    assert(!fs.existsSync(path.join(SITE, 'projects')) && !fs.existsSync(path.join(SITE, 'reviews')), 'no empty pages');
    assert(html('about/').includes('https://www.bbb.org/us/tn/clarksville/profile/roofing-contractors/action-roofing-company-0573-18000680'), 'BBB profile link');
    const story = html('');
    assert(story.includes('Local Roofers. A Commitment to Our Community.'), 'community section title');
    for (const n of ['Action Roofing', 'Windstar Roofing', 'ABC Supply', 'Keith Cherry', 'clarksvillenow.com']) assert(story.includes(n), 'community story credits ' + n);
  });

  await test('sitemap lists every page; every image has alt, width and height that match the file', async () => {
    const sm = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
    for (const p of PAGES) assert(sm.includes(`<loc>https://mnmwebsitesforyou.com${BASE_PATH}${p}</loc>`), 'sitemap ' + p);
    const sizeOf = (f) => { const b = fs.readFileSync(f); const i = b.indexOf('VP8'); if (b.toString('ascii', i, i + 4) === 'VP8X') return [1 + b.readUIntLE(i + 12, 3), 1 + b.readUIntLE(i + 15, 3)]; if (b.toString('ascii', i, i + 4) === 'VP8 ') return [b.readUInt16LE(i + 14) & 0x3fff, b.readUInt16LE(i + 16) & 0x3fff]; return null; };
    for (const p of PAGES) {
      for (const m of html(p).matchAll(/<img\b[^>]*>/g)) {
        const tag = m[0];
        assert(/\salt="/.test(tag), p + ' img without alt: ' + tag.slice(0, 80));
        const w = +(tag.match(/width="(\d+)"/) || [])[1], h = +(tag.match(/height="(\d+)"/) || [])[1];
        assert(w && h, p + ' img without size');
        const src = tag.match(/src="([^"]+)"/)[1]; const file = path.resolve(SITE, p, src);
        assert(fs.existsSync(file), p + ' missing image ' + src);
        const d = sizeOf(file); if (d) eq(d.join('x'), w + 'x' + h, p + ' ' + src + ' size');
      }
    }
  });

  /* ================= browser checks ================= */
  await test('every page loads under the production CSP with no console errors or failed requests', async () => {
    for (const p of PAGES) {
      const { ctx, page, problems, resp } = await open(p);
      eq(resp.status(), 200, p + ' status'); eq(resp.headers()['content-security-policy'], CSP, p + ' CSP header');
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
      await page.waitForTimeout(300);
      assert(!problems.length, p + ':\n' + problems.join('\n'));
      await ctx.close();
    }
  });

  await test('axe-core: zero accessibility violations on every page at desktop and phone widths', async () => {
    for (const w of [1440, 390]) for (const p of PAGES) {
      const { ctx, page } = await open(p, { w, h: w > 500 ? 900 : 844, reduced: true });
      await page.evaluate(AXE); // evaluated by the test driver, so the page's CSP stays as served
      const res = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map((v) => v.id + ': ' + v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')));
      assert(!res.length, `${p} @${w}:\n` + res.join('\n'));
      await ctx.close();
    }
  });

  await test('no sideways scroll at 320, 390, 768, 1024 and 1440 on any page', async () => {
    for (const p of PAGES) for (const w of WIDTHS) {
      const { ctx, page } = await open(p, { w, h: 800 });
      const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(o <= 0, `${p} overflows by ${o}px at ${w}`);
      await ctx.close();
    }
  });

  await test('tap targets: links and buttons outside running text are at least 44px tall on a phone', async () => {
    for (const p of PAGES) {
      const { ctx, page } = await open(p, { w: 390, h: 844, mobile: true, reduced: true });
      const small = await page.evaluate(() => [...document.querySelectorAll('a, button, summary, input:not([type=hidden]):not(.drop__input):not([name=_honey]), select, textarea')]
        .filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); if (!r.width || s.visibility === 'hidden' || e.closest('[hidden], .vh, .hp, .skip, noscript')) return false; if (e.matches('p a, li > p a, .crumbs a, .fine a, .notice a, .lead a, .qa__a a, .step p a, .foot__legal a')) return false; if (e.matches('input[type=radio]')) return false; return r.height < 44; })
        .map((e) => e.outerHTML.slice(0, 90) + ' h=' + Math.round(e.getBoundingClientRect().height)));
      assert(!small.length, p + ':\n' + small.join('\n'));
      await ctx.close();
    }
  });

  await test('every internal link and in-page anchor resolves', async () => {
    const seen = new Set();
    for (const p of PAGES) {
      const { ctx, page } = await open(p);
      const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href, raw: a.getAttribute('href') })));
      for (const { href, raw } of links) {
        if (!href.startsWith('http://127.0.0.1')) continue;
        const u = new URL(href);
        if (u.hash && u.pathname === new URL(page.url()).pathname) { const id = u.hash.slice(1); if (id) assert(await page.$('#' + CSS.escape(id)), `${p}: anchor ${raw} has no target`); continue; }
        if (seen.has(u.pathname)) continue; seen.add(u.pathname);
        const r = await page.request.get(u.origin + u.pathname); eq(r.status(), 200, `${p}: ${raw}`);
      }
      await ctx.close();
    }
  });

  await test('navigation: current page marked, mobile menu opens, traps the page, closes on Escape and returns focus', async () => {
    for (const [p, label] of [['roof-repair/', 'Roof Repair'], ['about/', 'About'], ['service-areas/', 'Service Area']]) {
      const { ctx, page } = await open(p);
      eq(await page.getAttribute(`.nav__a[aria-current="page"]`, 'href').then((h) => h), `../${p}`, 'aria-current on ' + label);
      await ctx.close();
    }
    const { ctx, page } = await open('', { w: 390, h: 844, mobile: true });
    const t = page.locator('.nav__toggle');
    eq(await t.getAttribute('aria-expanded'), 'false');
    await t.click(); await page.waitForTimeout(300);
    eq(await t.getAttribute('aria-expanded'), 'true');
    assert(await page.locator('.nav__panel').isVisible(), 'panel visible');
    assert(await page.evaluate(() => document.querySelector('main').inert), 'main is inert while the menu is open');
    assert(await page.evaluate(() => document.activeElement.closest('#nav-panel') !== null), 'focus moved into the menu');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    eq(await t.getAttribute('aria-expanded'), 'false');
    assert(await page.evaluate(() => document.activeElement.classList.contains('nav__toggle')), 'focus back on the toggle');
    await ctx.close();
  });

  await test('keyboard: first Tab shows the skip link, which moves focus to main', async () => {
    const { ctx, page } = await open('');
    await page.keyboard.press('Tab');
    eq(await page.evaluate(() => document.activeElement.className), 'skip');
    const top = await page.evaluate(() => document.activeElement.getBoundingClientRect().top); assert(top >= 0, 'skip link on screen');
    await page.keyboard.press('Enter'); await page.waitForTimeout(200);
    assert(await page.evaluate(() => location.hash === '#main'), 'jumped to main');
    await ctx.close();
  });

  await test('phone dock: shown on phones once the hero buttons scroll away, hidden at the form; never on desktop', async () => {
    const { ctx, page } = await open('', { w: 390, h: 844, mobile: true });
    const hidden = () => page.evaluate(() => document.querySelector('.dock').classList.contains('is-hidden'));
    assert(await hidden(), 'dock steps aside while the hero call buttons are visible');
    await page.evaluate(() => scrollTo(0, innerHeight * 1.6)); await page.waitForTimeout(500);
    assert(!(await hidden()), 'dock visible after the hero');
    eq(await page.getAttribute('.dock__btn--call', 'href'), TEL);
    await page.locator('#estimate-form').scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    assert(await hidden(), 'dock hidden over the form');
    await ctx.close();
    const d = await open('');
    eq(await d.page.evaluate(() => getComputedStyle(document.querySelector('.dock')).display), 'none', 'no dock on desktop');
    await d.ctx.close();
  });

  await test('hero video: loads on desktop with a pause button, never on phones or with reduced motion', async () => {
    const { ctx, page, requests } = await open('');
    await page.waitForFunction(() => document.querySelector('.hero__video').classList.contains('is-playing'), null, { timeout: 8000 });
    const btn = page.locator('.hero__pause'); assert(await btn.isVisible(), 'pause button visible');
    await btn.click(); eq(await btn.getAttribute('aria-pressed'), 'true');
    assert(await page.evaluate(() => document.querySelector('.hero__video').paused), 'video paused');
    await ctx.close();
    for (const opts of [{ w: 390, h: 844, mobile: true }, { reduced: true }]) {
      const o = await open('', opts); await o.page.waitForTimeout(1200);
      assert(!o.requests.some((r) => /hero\.(mp4|webm)/.test(r.url)), 'no video request for ' + JSON.stringify(opts));
      await o.ctx.close();
    }
  });

  await test('roof scene: builds layer by layer as you scroll, and rests fully built with reduced motion', async () => {
    const { ctx, page } = await open('');
    assert(await page.evaluate(() => document.querySelector('[data-layers]').classList.contains('is-live')), 'live mode');
    const at = async (f) => { await page.evaluate((f) => { const t = document.querySelector('.layers__track'); const top = t.getBoundingClientRect().top + scrollY; scrollTo({ top: top + (t.offsetHeight - innerHeight) * f, behavior: 'instant' }); }, f); await page.waitForTimeout(250);
      return page.evaluate(() => ({ cur: document.querySelector('.lsteps__i.is-cur').dataset.step, ridge: +getComputedStyle(document.querySelector('[data-layer="ridge"]')).opacity, deck: +getComputedStyle(document.querySelector('[data-layer="deck"]')).opacity })); };
    const a = await at(0.02); eq(a.cur, 'deck', 'starts at the deck'); assert(a.ridge < 0.05, 'ridge not on yet');
    const b = await at(0.5); assert(['starter', 'shingles', 'under'].includes(b.cur), 'mid-way step ' + b.cur);
    const c = await at(1); eq(c.cur, 'gutter', 'ends at the gutters'); assert(c.ridge > 0.95 && c.deck > 0.95, 'all layers on at the end');
    await ctx.close();
    const r = await open('', { reduced: true });
    assert(!(await r.page.evaluate(() => document.querySelector('[data-layers]').classList.contains('is-live'))), 'no pinning with reduced motion');
    const vis = await r.page.evaluate(() => [...document.querySelectorAll('.roof .ly')].every((g) => getComputedStyle(g).opacity === '1'));
    assert(vis, 'every layer drawn with reduced motion');
    await r.ctx.close();
  });

  await test('"start with what you\'re seeing": each problem points to the right page and pre-fills the form', async () => {
    const { ctx, page } = await open('');
    await page.click('[data-pick="storm"]');
    eq(await page.getAttribute('[data-pick="storm"]', 'aria-pressed'), 'true');
    assert((await page.textContent('#pick-panel')).includes('Storm damage roof repair'), 'storm result shown');
    eq(await page.getAttribute('#pick-panel .tlink', 'href'), 'storm-damage-roof-repair/');
    await page.click('[data-pick="gutter"]');
    eq(await page.getAttribute('[data-pick="storm"]', 'aria-pressed'), 'false');
    assert((await page.textContent('#pick-panel')).includes('Siding & gutters'), 'gutter result shown');
    await page.click('[data-pick="leak"]');
    await Promise.all([page.waitForNavigation(), page.click('#pick-panel .btn--red')]);
    eq(await page.inputValue('#f-service'), 'Roof repair', 'service pre-filled from the picker');
    await ctx.close();
    const h = await open('#see-old'); assert((await h.page.textContent('#pick-panel')).includes('Roof replacement'), 'hash restores the choice'); await h.ctx.close();
  });

  await test('ZIP check: Clarksville ZIPs, nearby ZIPs and bad input', async () => {
    const { ctx, page } = await open('service-areas/');
    const run = async (v) => { await page.fill('#zip-in', v); await page.click('.zip button'); return page.textContent('#zip-out'); };
    assert((await run('37043')).includes('in Clarksville'), '37043');
    assert((await run('37040')).includes('in Clarksville'), '37040');
    assert((await run('37188')).includes('call (931) 645-4784 to check'), 'outside Clarksville asks to call');
    assert(!/(we serve|we cover) 37188/i.test(await run('37188')), 'never claims coverage outside Clarksville');
    assert((await run('12')).includes('5-digit'), 'bad input');
    eq(await page.getAttribute('#zip-in', 'aria-invalid'), 'true');
    await ctx.close();
  });

  await test('estimate form: errors under each field, then preview mode says plainly that nothing was sent', async () => {
    const { ctx, page, requests } = await open('contact/');
    assert(await page.locator('#form-notice').isVisible(), 'preview notice visible above the form');
    await page.waitForTimeout(3100);
    await page.click('#f-submit');
    for (const id of ['f-name', 'f-phone', 'f-place', 'f-service', 'f-desc']) {
      eq(await page.getAttribute('#' + id, 'aria-invalid'), 'true', id + ' invalid');
      assert(await page.locator(`#${id}-err`).isVisible(), id + ' error shown');
    }
    eq(await page.evaluate(() => document.activeElement.id), 'f-name', 'focus on the first error');
    assert((await page.textContent('#f-status')).includes('need fixing'), 'summary status');
    // email becomes required when the visitor asks to be emailed
    await page.check('input[name="contact_method"][value="Email"]');
    await page.fill('#f-name', 'Pat Example'); await page.fill('#f-phone', '931-555-0142'); await page.fill('#f-place', '37043');
    await page.selectOption('#f-service', 'Roof repair'); await page.fill('#f-desc', 'Water stain on the bedroom ceiling after the last storm.');
    await page.click('#f-submit');
    eq(await page.getAttribute('#f-email', 'aria-invalid'), 'true', 'email needed to be emailed');
    await page.fill('#f-email', 'pat@example.com');
    eq(await page.getAttribute('#f-email', 'aria-invalid'), 'false', 'error clears on a valid entry');
    // photo upload: one good image, one rejected file
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await page.setInputFiles('#f-photos', [{ name: 'roof.png', mimeType: 'image/png', buffer: png }]);
    await page.waitForSelector('.thumb img');
    await page.setInputFiles('#f-photos', [{ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') }]);
    assert((await page.textContent('#f-photos-err')).includes('isn’t a photo'), 'non-image rejected');
    eq(await page.locator('.thumb').count(), 1, 'good photo kept');
    const before = requests.length;
    await page.click('#f-submit');
    await page.waitForSelector('#f-status.status--preview');
    const st = await page.textContent('#f-status');
    assert(/Not sent/.test(st) && /isn’t connected/.test(st), 'says nothing was sent');
    assert(!/thank|received|we’ll be in touch/i.test(st), 'no fake success wording');
    assert(st.includes('Pat Example') && st.includes('1 attached'), 'shows what would be received');
    assert(!requests.slice(before).some((r) => r.method === 'POST'), 'no POST in preview mode');
    eq(await page.getAttribute('#f-status a.btn', 'href'), TEL, 'call button offered');
    await ctx.close();
  });

  await test('estimate form: spam guards (honeypot and too-fast submit) block sending', async () => {
    const { ctx, page } = await open('contact/');
    await page.fill('#f-name', 'Bot'); await page.fill('#f-phone', '9315550142'); await page.fill('#f-place', '37043');
    await page.selectOption('#f-service', 'Gutters'); await page.fill('#f-desc', 'Gutters overflowing at the back.');
    await page.click('#f-submit');
    assert((await page.textContent('#f-status')).includes('That was quick'), 'too-fast submit caught');
    await page.evaluate(() => { document.querySelector('input[name="_honey"]').value = 'x'; });
    await page.click('#f-submit'); await page.waitForTimeout(700);
    assert(!(await page.locator('#f-status.status--preview').count()), 'honeypot stops the request');
    await ctx.close();
  });

  await test('service pages pre-select their service in the form', async () => {
    for (const [p, v] of [['roof-repair/', 'Roof repair'], ['roof-replacement/', 'Roof replacement'], ['storm-damage-roof-repair/', 'Storm damage roof repair']]) {
      const { ctx, page } = await open(p); eq(await page.inputValue('#f-service'), v, p); await ctx.close();
    }
  });

  await test('FAQ: details open and close by keyboard', async () => {
    const { ctx, page } = await open('');
    const s = page.locator('#faq-1 summary'); await s.focus(); await page.keyboard.press('Enter');
    assert(await page.evaluate(() => document.querySelector('#faq-1').open), 'opens'); await page.keyboard.press('Enter');
    assert(!(await page.evaluate(() => document.querySelector('#faq-1').open)), 'closes');
    await ctx.close();
  });

  await test('JavaScript off: all content, nav links and the phone number still work', async () => {
    for (const p of ['', 'roof-replacement/', 'contact/']) {
      const { ctx, page } = await open(p, { nojs: true });
      assert(await page.locator('.nav__list a').first().isVisible(), p + ' nav visible');
      assert(await page.locator(`a[href="${TEL}"]:visible`).count() > 0, p + ' call link visible');
      if (p !== 'contact/') { const all = await page.evaluate(() => [...document.querySelectorAll('.roof .ly')].every((g) => getComputedStyle(g).opacity === '1')); if (await page.$('.roof')) assert(all, p + ' roof drawn'); }
      await ctx.close();
    }
  });

  await test('404: unknown address returns status 404 with the branded page and links home', async () => {
    const { ctx, page, resp } = await open('no-such-page/', { allow404: true });
    eq(resp.status(), 404);
    assert((await page.textContent('h1')).includes('isn’t here'));
    assert(await page.locator('a[href="/clients/action-roofing/"]').count(), 'link home');
    await ctx.close();
  });

  await browser.close(); server.close();
  console.log(`\n${passed}/${passed + failures.length} passed`);
  if (failures.length) { console.log('Failed: ' + failures.join('; ')); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
