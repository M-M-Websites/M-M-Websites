/* M&M Websites: regression test suite
 * Run:  cd tests && npm install && npx playwright install chromium && npm test
 * (To use a Chromium that's already installed, set CHROME_PATH=/path/to/chrome.)
 *
 * Starts a local static server for the site and checks layout, links, content
 * honesty, the "Start a project" form (with FormSubmit mocked, so no real email
 * is ever sent), accessibility (axe-core), fallbacks, the CSP and the 404 page.
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const AXE = require.resolve('axe-core/axe.min.js');
const HEADERS = fs.readFileSync(path.join(ROOT, '_headers'), 'utf8');
const CSP = (HEADERS.match(/Content-Security-Policy:\s*(.+)/) || [])[1];
const SITE = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
const PAGES = ['/', '/work/legendary-detailing/'];
const PAY_LINK = 'https://buy.stripe.com/7sY28qcdi8Bg29nbfEaEE00';

/* ---------- tiny test runner ---------- */
const results = [];
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const eq = (a, b, msg) => assert(a === b, `${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
async function test(name, fn) {
  const t0 = Date.now();
  try { await fn(); results.push({ name, ok: true }); console.log(`  ✓ ${name} (${Date.now() - t0}ms)`); }
  catch (e) { results.push({ name, ok: false, err: e }); console.log(`  ✗ ${name}\n      ${String(e.message).split('\n').join('\n      ')}`); }
}

/* ---------- static server (serves 404.html with status 404, optional CSP) ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
function startServer(withCsp) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      let file = path.join(ROOT, url.endsWith('/') ? url + 'index.html' : url);
      const headers = {};
      if (withCsp && CSP) headers['Content-Security-Policy'] = CSP;
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory() || /[\\/](tests|scripts)[\\/]/.test(file.slice(ROOT.length))) {
        res.writeHead(404, { ...headers, 'Content-Type': TYPES['.html'] });
        return res.end(fs.readFileSync(path.join(ROOT, '404.html')));
      }
      res.writeHead(200, { ...headers, 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/* ---------- helpers ---------- */
const FULL_CONFIG = {
  formEmail: 'studio@example.com',
  businessEmail: 'hello@example.com',
  phone: '+15550100',
  phoneDisplay: '555-0100',
  bookingUrl: 'https://booking.example.com/intro',
  social: { instagram: 'https://instagram.example.com/mm', linkedin: 'https://linkedin.example.com/mm' },
};

async function openPage(browser, base, { opts = {}, route = '/', config = null, mock = null } = {}) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const problems = [];
  const formRequests = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => { if (!r.url().includes('formsubmit.co')) problems.push(`requestfailed: ${r.url()}`); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('formsubmit.co')) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
  if (config) {
    await page.route('**/assets/js/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: `window.MM_CONFIG = ${JSON.stringify(config)};` }));
  }
  // Never let a test reach the real FormSubmit. Unmocked calls are recorded and aborted.
  await page.route('https://formsubmit.co/**', async (r) => {
    formRequests.push({ url: r.request().url(), body: r.request().postDataJSON() });
    if (mock) return mock(r);
    return r.abort();
  });
  const response = await page.goto(base + route, { waitUntil: 'networkidle' });
  return { ctx, page, problems, formRequests, response };
}
const scrollThrough = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 40)); }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
async function axe(page, label) {
  await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
  await page.addScriptTag({ path: AXE });
  const r = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const out = await axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return out.violations.map((v) => `${v.impact} ${v.id}: ${v.help} -> ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
  assert(r.length === 0, `axe violations (${label}):\n${r.join('\n')}`);
}
async function fillValid(page) {
  await page.fill('#f-name', 'Jordan Rivers');
  await page.fill('#f-business', 'Rivers Plumbing');
  await page.fill('#f-email', 'jordan@example.com');
  await page.fill('#f-phone', '555-0123');
  await page.fill('#f-website', 'riversplumbing.example');
  await page.locator('input[name="needs"][value="A new website"]').check();
  await page.locator('input[name="needs"][value="Booking or quote form"]').check();
  await page.selectOption('#f-timeline', 'Within a month');
  await page.fill('#f-message', 'We want more quote requests from phones.');
}
async function launch() {
  try { return await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}); }
  catch (e) { throw new Error(`Could not start Chromium. Run "npx playwright install chromium" or set CHROME_PATH.\n${e.message}`); }
}

(async () => {
  const server = await startServer(false);
  const cspServer = await startServer(true);
  const base = `http://127.0.0.1:${server.address().port}`;
  const cspBase = `http://127.0.0.1:${cspServer.address().port}`;
  const browser = await launch();
  console.log(`\nM&M Websites test suite (${base})\n`);

  /* 1. Layout at every common screen size, on every page */
  const viewports = [
    ['320', { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true }],
    ['390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
    ['768', { viewport: { width: 768, height: 1024 } }],
    ['1024', { viewport: { width: 1024, height: 768 } }],
    ['1440', { viewport: { width: 1440, height: 900 } }],
    ['1920', { viewport: { width: 1920, height: 1080 } }],
  ];
  for (const [name, opts] of viewports) {
    await test(`layout ${name}px: no sideways scroll, images load, no errors, tap targets >= 44px`, async () => {
      for (const route of PAGES) {
        const { ctx, page, problems } = await openPage(browser, base, { opts, route });
        await scrollThrough(page);
        await page.waitForTimeout(300);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        eq(overflow, 0, `${route} horizontal overflow (px)`);
        const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
        eq(broken.length, 0, `${route} broken images ${broken.join(', ')}`);
        eq(await page.locator('h1').count(), 1, `${route} exactly one h1`);
        const offscreen = await page.evaluate(() => [...document.querySelectorAll('a, button, input, select, textarea, summary')].filter((el) => {
          const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
          return r.width > 0 && s.visibility !== 'hidden' && !el.classList.contains('hp') && !el.classList.contains('skip') && (r.right > window.innerWidth + 1 || r.left < -1);
        }).map((el) => el.outerHTML.slice(0, 80)));
        eq(offscreen.length, 0, `${route} controls outside the viewport: ${offscreen.join(' | ')}`);
        const small = await page.evaluate(() => {
          const sel = '.btn, .nav__list a, .nav__toggle, summary, .chip span, .field input:not(.hp), .field select, .field textarea, .footer a, .crumbs a, .brand, .direct__link';
          return [...document.querySelectorAll(sel)].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5);
          }).map((el) => `${el.className || el.tagName} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
        });
        eq(small.length, 0, `${route} tap targets under 44px: ${small.join(', ')}`);
        eq(problems.length, 0, `${route} errors: ${problems.join('; ')}`);
        await ctx.close();
      }
    });
  }

  /* 2. Links */
  await test('links: every in-page anchor has a target and every internal link loads', async () => {
    const { ctx, page } = await openPage(browser, base);
    const checked = new Set();
    for (const route of PAGES) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const missing = await page.$$eval('a[href^="#"]', (a) => a.map((x) => x.getAttribute('href')).filter((h) => h.length > 1 && !document.getElementById(h.slice(1))));
      eq(missing.length, 0, `${route} in-page links with no target: ${missing}`);
      const internal = await page.$$eval('a[href]', (a) => a.map((x) => x.href).filter((h) => h.startsWith(location.origin)));
      for (const href of internal) {
        const [url, hash] = href.split('#');
        if (!checked.has(url)) {
          checked.add(url);
          const res = await page.request.get(url);
          eq(res.status(), 200, `link ${url} from ${route}`);
        }
        if (hash) {
          const html = await (await page.request.get(url)).text();
          assert(new RegExp(`id="${hash}"`).test(html), `link ${href} from ${route}: no element with id "${hash}"`);
        }
      }
    }
    await ctx.close();
  });

  /* 3. Honest content with the default (empty) settings */
  await test('content: real prices only, no contact details and nothing invented while settings are empty', async () => {
    const cfg = fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8');
    for (const key of ['formEmail', 'businessEmail', 'phone', 'phoneDisplay', 'bookingUrl', 'instagram', 'facebook', 'linkedin', 'tiktok', 'x', 'youtube', 'googleBusiness']) {
      assert(new RegExp(`\\b${key}: ''`).test(cfg), `config.js ${key} should ship empty`);
    }

    const { ctx, page, problems } = await openPage(browser, base, { opts: { viewport: { width: 1440, height: 900 } } });
    const text = await page.evaluate(() => document.body.innerText);
    const amounts = [...new Set(text.match(/\$\s?\d[\d,.]*/g) || [])].sort();
    eq(JSON.stringify(amounts), JSON.stringify(['$45', '$600', '$645']), 'only the real prices appear');
    assert(!/lorem|ipsum|TODO|FIXME|testimonial|award|years in business/i.test(text), 'placeholder or invented-claim text found');
    eq(await page.locator('a[href^="tel:"], a[href^="mailto:"], a[href^="sms:"]').count(), 0, 'contact links while unset');
    for (const sel of ['#direct', '#footer-contact']) assert(!(await page.locator(sel).isVisible()), `${sel} should be hidden`);
    eq(await page.locator('.project').count(), 1, 'exactly one portfolio project');
    eq((await page.locator('.project__name').innerText()).trim(), 'Legendary Detailing', 'portfolio project');
    const ld = JSON.parse(await page.locator('#org-jsonld').textContent());
    eq(ld['@type'], 'ProfessionalService', 'JSON-LD type');
    eq(ld.name, 'M&M Websites', 'JSON-LD name');
    for (const k of ['address', 'telephone', 'email', 'aggregateRating', 'review', 'priceRange', 'foundingDate', 'numberOfEmployees', 'sameAs']) assert(!(k in ld), `JSON-LD must not contain ${k} while unconfirmed`);
    const offers = ld.hasOfferCatalog.itemListElement;
    eq(offers.find((o) => o.price)?.price, '600.00', 'JSON-LD setup price');
    eq(offers.find((o) => o.priceSpecification)?.priceSpecification.price, '45.00', 'JSON-LD monthly price');
    // no personal or client contact details anywhere in the published files
    const published = execFileSync('git', ['ls-files', '--others', '--cached', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n').filter((f) => /\.(html|js|css|txt|xml|md)$/.test(f) && !f.startsWith('tests/'));
    for (const f of published) {
      const body = fs.readFileSync(path.join(ROOT, f), 'utf8');
      assert(!/@gmail\.com|@yahoo\.com|@outlook\.com|@hotmail\.com/i.test(body), `${f} contains a personal email address`);
      assert(!/\(?\d{3}\)?[ .-]\d{3}-\d{4}/.test(body.replace(/\(901\) 555-0123/g, '')), `${f} contains a phone number`);
    }
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();
  });

  /* 4. SEO basics on every page */
  await test('seo: titles, descriptions, canonicals, Open Graph, headings, robots and sitemap', async () => {
    assert(/^https:\/\/[^/]+\/$/.test(SITE || ''), `canonical should be an absolute https URL, got ${SITE}`);
    const { ctx, page } = await openPage(browser, base);
    const titles = new Set();
    for (const route of PAGES) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const m = await page.evaluate(() => ({
        title: document.title,
        desc: document.querySelector('meta[name="description"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
        ogUrl: document.querySelector('meta[property="og:url"]')?.content || '',
        lang: document.documentElement.lang,
        levels: [...document.querySelectorAll('h1, h2, h3, h4')].map((h) => +h.tagName[1]),
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      }));
      assert(m.title.length >= 20 && m.title.length <= 70, `${route} title length ${m.title.length}`);
      assert(!titles.has(m.title), `${route} title is not unique`); titles.add(m.title);
      assert(m.desc.length >= 70 && m.desc.length <= 170, `${route} description length ${m.desc.length}`);
      eq(m.canonical, SITE.replace(/\/$/, '') + route, `${route} canonical`);
      eq(m.ogUrl, m.canonical, `${route} og:url`);
      assert(m.ogTitle && m.ogImage.startsWith(SITE.replace(/\/$/, '')), `${route} Open Graph tags`);
      const ogPath = m.ogImage.slice(SITE.length - 1);
      assert(fs.existsSync(path.join(ROOT, ogPath)), `${route} og:image file ${ogPath} exists`);
      eq(m.lang, 'en', `${route} lang`);
      eq(m.levels[0], 1, `${route} first heading is h1`);
      for (let i = 1; i < m.levels.length; i++) assert(m.levels[i] <= m.levels[i - 1] + 1, `${route} heading level skipped at #${i}: h${m.levels[i - 1]} -> h${m.levels[i]}`);
      m.ld.forEach((s) => JSON.parse(s));
    }
    const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
    assert(robots.includes(`Sitemap: ${SITE}sitemap.xml`), 'robots.txt points to the sitemap');
    const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
    eq(JSON.stringify(locs), JSON.stringify(PAGES.map((p) => SITE.replace(/\/$/, '') + p)), 'sitemap URLs');
    await ctx.close();
  });

  /* 5. The form while no form email is set */
  await test('form (not connected): says so up front and never pretends to send', async () => {
    const { ctx, page, problems, formRequests } = await openPage(browser, base, { opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });
    assert(await page.locator('#form-offline').isVisible(), 'not-connected notice visible');
    assert(/isn.t connected yet/i.test(await page.locator('#form-offline').innerText()), 'notice wording');
    eq((await page.locator('#f-submit').innerText()).trim(), 'Check my details', 'button does not say "Send" while unconnected');
    assert(await page.locator('#f-submit').isEnabled(), 'button enabled with JS');
    await fillValid(page);
    await page.click('#f-submit');
    await page.waitForTimeout(300);
    const status = await page.locator('#form-status').innerText();
    assert(/not sent/i.test(status) && /isn.t connected/i.test(status), `status: ${status}`);
    eq(formRequests.length, 0, 'requests to FormSubmit');
    assert(await page.locator('#project-form').isVisible() && !(await page.locator('#form-done').isVisible()), 'no fake success screen');
    eq(await page.inputValue('#f-name'), 'Jordan Rivers', 'typed details are kept');
    await axe(page, 'not-connected form after submit');
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();

    // With only a business email set, the honest fallback is a pre-filled email
    const o = await openPage(browser, base, { config: { businessEmail: 'hello@example.com' } });
    assert(await o.page.locator('#form-offline .formcard__offline-alt').isVisible(), 'notice points to other contact options');
    await fillValid(o.page);
    await o.page.click('#f-submit');
    const href = await o.page.locator('#form-status a').getAttribute('href');
    assert(href.startsWith('mailto:hello@example.com?subject=') && decodeURIComponent(href).includes('Rivers Plumbing'), `mailto fallback: ${href}`);
    eq(o.formRequests.length, 0, 'requests to FormSubmit');
    await o.ctx.close();
  });

  /* 6. Validation */
  await test('form validation: required fields, email and website checks, focus and recovery', async () => {
    const { ctx, page, formRequests } = await openPage(browser, base, { config: { formEmail: 'studio@example.com' } });
    eq((await page.locator('#f-submit').innerText()).trim(), 'Send project details', 'button label when connected');
    assert(!(await page.locator('#form-offline').isVisible()), 'no not-connected notice when connected');
    await page.click('#f-submit');
    for (const id of ['f-name', 'f-business', 'f-email']) eq(await page.getAttribute(`#${id}`, 'aria-invalid'), 'true', `${id} invalid`);
    assert(await page.locator('#f-needs-err').isVisible(), 'needs error shown');
    eq(await page.evaluate(() => document.activeElement.id), 'f-name', 'focus moves to the first problem');
    await page.fill('#f-name', 'Jordan');
    await page.fill('#f-business', 'Rivers Plumbing');
    await page.fill('#f-email', 'jordan@example');
    await page.fill('#f-website', 'not a site');
    await page.click('#f-submit');
    assert(/doesn.t look right/i.test(await page.locator('#f-email-err').innerText()), 'bad email message');
    assert(await page.locator('#f-website-err').isVisible(), 'bad website message');
    eq(await page.getAttribute('#f-name', 'aria-invalid'), 'false', 'fixed field clears');
    await axe(page, 'form with errors');
    await page.fill('#f-email', 'jordan@example.com');
    await page.fill('#f-website', '');
    await page.locator('input[name="needs"][value="Not sure yet"]').check();
    assert(!(await page.locator('#f-needs-err').isVisible()), 'needs error clears when one is picked');
    assert(!(await page.locator('#f-email-err').isVisible()), 'email error clears while typing');
    eq(formRequests.length, 0, 'nothing sent while invalid');
    await ctx.close();
  });

  /* 7. Success */
  await test('form success: sends the right data to the mocked endpoint and confirms', async () => {
    const mock = (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true","message":"The form was submitted successfully."}' });
    const { ctx, page, formRequests, problems } = await openPage(browser, base, { config: { formEmail: 'studio@example.com' }, mock });
    await fillValid(page);
    await page.click('#f-submit');
    await page.locator('#form-done').waitFor({ state: 'visible' });
    eq(formRequests.length, 1, 'one request');
    eq(formRequests[0].url, 'https://formsubmit.co/ajax/studio%40example.com', 'endpoint');
    const b = formRequests[0].body;
    eq(b.name, 'Jordan Rivers', 'name'); eq(b.business, 'Rivers Plumbing', 'business'); eq(b.email, 'jordan@example.com', 'email');
    eq(b.website, 'riversplumbing.example', 'website'); eq(b.needs, 'A new website, Booking or quote form', 'needs');
    assert(!('budget' in b), 'no budget field'); eq(b.timeline, 'Within a month', 'timeline');
    eq(b._replyto, 'jordan@example.com', 'reply-to'); eq(b._subject, 'New project request: Rivers Plumbing', 'subject'); eq(b._honey, '', 'honeypot empty');
    assert(!(await page.locator('#project-form').isVisible()), 'form replaced by confirmation');
    eq(await page.evaluate(() => document.activeElement.id), 'form-done', 'focus on confirmation');
    assert(/Thanks, Jordan/.test(await page.locator('#form-done').innerText()), 'personal thank-you');
    await axe(page, 'form success');
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();
  });

  /* 8. Failure */
  await test('form failure: server error and network error keep the details and offer other routes', async () => {
    for (const [label, mock] of [
      ['HTTP 500', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"success":"false","message":"oops"}' })],
      ['network', (r) => r.abort('failed')],
    ]) {
      const { ctx, page, formRequests } = await openPage(browser, base, { config: FULL_CONFIG, mock });
      await fillValid(page);
      await page.click('#f-submit');
      await page.locator('#form-status.is-error').waitFor({ state: 'visible' });
      eq(formRequests.length, 1, `${label}: one request`);
      const s = await page.locator('#form-status').innerText();
      assert(/didn.t send/i.test(s) && /still here/i.test(s), `${label} status: ${s}`);
      const links = await page.$$eval('#form-status a', (a) => a.map((x) => x.getAttribute('href')));
      assert(links.includes('tel:+15550100') && links.includes('mailto:hello@example.com') && links.includes(FULL_CONFIG.bookingUrl), `${label} fallback links: ${links}`);
      eq(await page.inputValue('#f-message'), 'We want more quote requests from phones.', `${label}: message kept`);
      assert(await page.locator('#f-submit').isEnabled(), `${label}: can retry`);
      assert(!(await page.locator('#form-done').isVisible()), `${label}: no success screen`);
      await ctx.close();
    }
  });

  /* 9. Owner settings turn things on */
  await test('config: contact methods, socials and JSON-LD appear when set', async () => {
    const { ctx, page, problems } = await openPage(browser, base, { config: FULL_CONFIG });
    assert(await page.locator('#direct').isVisible(), 'direct contact block');
    eq(await page.locator('#direct a[href="tel:+15550100"]').innerText(), 'Call 555-0100', 'phone link');
    eq(await page.locator('#direct a[href="mailto:hello@example.com"]').count(), 1, 'email link');
    eq(await page.locator(`#direct a[href="${FULL_CONFIG.bookingUrl}"][target="_blank"][rel="noopener"]`).count(), 1, 'booking link');
    eq(await page.locator('[data-contact="email"]').count(), 1, 'one email slot');
    const footer = await page.$$eval('#footer-links a', (a) => a.map((x) => x.textContent));
    eq(footer.join('|'), 'Book a call|Call 555-0100|hello@example.com|Instagram|LinkedIn', 'footer links (unset socials hidden)');
    const ld = JSON.parse(await page.locator('#org-jsonld').textContent());
    eq(ld.email, 'hello@example.com', 'JSON-LD email'); eq(ld.telephone, '+15550100', 'JSON-LD telephone');
    eq(JSON.stringify(ld.sameAs), JSON.stringify(['https://instagram.example.com/mm', 'https://linkedin.example.com/mm']), 'JSON-LD sameAs');
    await axe(page, 'fully configured');
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();

    // Bad values are ignored rather than rendered
    const bad = await openPage(browser, base, { config: { bookingUrl: 'javascript:alert(1)', social: { instagram: 'http://insecure.example.com' } } });
    eq(await bad.page.locator('a[href^="javascript:"], a[href^="http:"]').count(), 0, 'unsafe or non-https links ignored');
    assert(!(await bad.page.locator('#direct').isVisible()), 'nothing to show');
    await bad.ctx.close();
  });

  /* 9b. Pricing and the Stripe payment link */
  await test('pricing: both prices, the total and a working link to the Stripe payment page', async () => {
    const { ctx, page, problems } = await openPage(browser, base, { opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });
    const bill = await page.locator('#pricing').innerText();
    assert(/Website setup[\s\S]*\$600[\s\S]*one time/.test(bill), `setup line: ${bill}`);
    assert(/Website maintenance[\s\S]*\$45[\s\S]*a month/.test(bill), `maintenance line: ${bill}`);
    assert(/Due at signup[\s\S]*\$645/.test(bill), 'total due at signup');
    eq(await page.getAttribute('#pay-link', 'href'), PAY_LINK, 'payment link');
    const links = await page.$$eval('a[href*="buy.stripe.com"]', (a) => [...new Set(a.map((x) => x.href))]);
    eq(JSON.stringify(links), JSON.stringify([PAY_LINK]), 'one payment link used everywhere');
    let navigated = '';
    await page.route('https://buy.stripe.com/**', (r) => { navigated = r.request().url(); return r.fulfill({ contentType: 'text/html', body: '<title>stub</title>' }); });
    await page.click('#pay-link');
    await page.waitForLoadState();
    eq(navigated, PAY_LINK, 'Get started opens the Stripe payment page');
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();
  });

  /* 10. Mobile menu */
  await test('mobile menu: opens, closes on link, Escape and outside tap, and restores focus', async () => {
    const { ctx, page } = await openPage(browser, base, { opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });
    const toggle = page.locator('.nav__toggle');
    assert(await toggle.isVisible(), 'menu button visible');
    assert(!(await page.locator('#nav-list').isVisible()), 'menu closed at start');
    await toggle.click();
    eq(await toggle.getAttribute('aria-expanded'), 'true', 'expanded');
    await page.locator('#nav-list a[href="#process"]').click();
    eq(await toggle.getAttribute('aria-expanded'), 'false', 'closes after choosing a link');
    await toggle.click();
    await page.keyboard.press('Escape');
    eq(await toggle.getAttribute('aria-expanded'), 'false', 'Escape closes');
    eq(await page.evaluate(() => document.activeElement.classList.contains('nav__toggle')), true, 'focus back on the button');
    await toggle.click();
    await page.mouse.click(200, 700);
    eq(await toggle.getAttribute('aria-expanded'), 'false', 'outside tap closes');
    await ctx.close();
  });

  /* 11. Accessibility */
  await test('accessibility: zero axe-core violations on every page at phone and desktop sizes', async () => {
    for (const opts of [{ viewport: { width: 1440, height: 900 } }, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]) {
      for (const route of [...PAGES, '/missing-page/']) {
        const { ctx, page } = await openPage(browser, base, { opts, route });
        await scrollThrough(page);
        await page.waitForTimeout(3600); // let entrance animations finish
        await axe(page, `${route} @${opts.viewport.width}`);
        await ctx.close();
      }
    }
  });

  await test('accessibility: keyboard reaches and operates the form; focus is visible', async () => {
    const { ctx, page } = await openPage(browser, base, { config: { formEmail: 'studio@example.com' } });
    await page.keyboard.press('Tab');
    eq(await page.evaluate(() => document.activeElement.className), 'skip', 'first Tab reaches the skip link');
    assert(await page.locator('.skip').isVisible(), 'skip link becomes visible');
    await page.focus('#f-website');
    await page.keyboard.press('Tab');
    eq(await page.evaluate(() => document.activeElement.value), 'A new website', 'Tab moves to the first checkbox');
    await page.keyboard.press('Space');
    assert(await page.locator('input[name="needs"][value="A new website"]').isChecked(), 'Space checks it');
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement.nextElementSibling).outlineStyle);
    eq(outline, 'solid', 'visible focus ring on the chip');
    const faq = page.locator('.qa summary').first();
    await faq.focus();
    await page.keyboard.press('Enter');
    assert(await page.locator('.qa').first().evaluate((d) => d.open), 'Enter opens a FAQ answer');
    await ctx.close();
  });

  /* 12. Fallbacks */
  await test('fallback: with JavaScript off everything shows and the form is honestly disabled', async () => {
    const { ctx, page } = await openPage(browser, base, { opts: { javaScriptEnabled: false, viewport: { width: 1024, height: 768 } } });
    eq(await page.evaluate(() => document.documentElement.className), 'no-js', 'html class');
    const hidden = await page.$$eval('.rise, .reveal, .proof__notes li', (n) => n.filter((x) => getComputedStyle(x).opacity !== '1').length);
    eq(hidden, 0, 'content hidden without JS');
    assert(await page.locator('#nav-list').isVisible(), 'nav visible');
    assert(await page.locator('#f-submit').isDisabled(), 'submit disabled without JS');
    assert(/needs JavaScript/i.test(await page.locator('.formcard').innerText()), 'noscript explanation');
    await ctx.close();
    const small = await openPage(browser, base, { opts: { javaScriptEnabled: false, viewport: { width: 320, height: 640 } } });
    eq(await small.page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, 'no overflow at 320px without JS');
    assert(await small.page.locator('#nav-list a[href="#faq"]').isVisible(), 'all nav links reachable without JS on phones');
    await small.ctx.close();
  });

  await test('fallback: reduced motion gives a still, complete page', async () => {
    const { ctx, page } = await openPage(browser, base, { opts: { reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } } });
    await page.waitForTimeout(150);
    const st = await page.evaluate(() => ({
      faded: [...document.querySelectorAll('.rise, .reveal, .proof__notes li, .proof__marks circle')].filter((x) => getComputedStyle(x).opacity !== '1').length,
      undrawn: [...document.querySelectorAll('.proof__marks .pencil path, .marked__line path')].filter((p) => !['0px', '0'].includes(getComputedStyle(p).strokeDashoffset)).length,
      running: document.getAnimations().filter((a) => a.playState === 'running').length,
      smooth: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    eq(st.faded, 0, 'elements still faded');
    eq(st.undrawn, 0, 'pencil marks not drawn');
    eq(st.running, 0, 'running animations');
    eq(st.smooth, 'auto', 'scroll behaviour');
    await ctx.close();
  });

  /* 13. CSP */
  await test('security: pages work under the exact Content-Security-Policy from _headers', async () => {
    assert(CSP && /script-src 'self' 'sha256-/.test(CSP) && !/unsafe-inline|unsafe-eval/.test(CSP), `CSP is strict: ${CSP}`);
    for (const route of [...PAGES, '/missing-page/']) {
      const mock = (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
      const { ctx, page, problems, response } = await openPage(browser, cspBase, { route, config: route === '/' ? { formEmail: 'studio@example.com' } : null, mock });
      assert((response.headers()['content-security-policy'] || '') === CSP, 'server sent the CSP');
      const violations = await page.evaluate(() => new Promise((res) => {
        const v = []; document.addEventListener('securitypolicyviolation', (e) => v.push(`${e.violatedDirective} ${e.blockedURI}`));
        setTimeout(() => res(v), 300);
      }));
      eq(violations.length, 0, `${route} CSP violations: ${violations}`);
      const real = route === '/missing-page/' ? problems.filter((p) => !p.includes('/missing-page/') && !/status of 404/.test(p)) : problems;
      eq(real.length, 0, `${route} errors under CSP: ${real.join('; ')}`);
      if (route !== '/missing-page/') eq(await page.evaluate(() => document.documentElement.className), 'js', `${route} inline script allowed by its hash`);
      if (route === '/') {
        await fillValid(page);
        await page.click('#f-submit');
        await page.locator('#form-done').waitFor({ state: 'visible' });
        eq(problems.length, 0, `form under CSP: ${problems.join('; ')}`);
      }
      await ctx.close();
    }
    for (const h of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy:', 'Permissions-Policy:', '/assets/fonts/*', 'immutable']) assert(HEADERS.includes(h), `_headers has ${h}`);
  });

  /* 14. 404 */
  await test('404: unknown address returns the branded page with a way home', async () => {
    const { ctx, page, response } = await openPage(browser, base, { route: '/no/such/page' });
    eq(response.status(), 404, 'status');
    eq(await page.title(), 'Page Not Found | M&M Websites', 'title');
    eq(await page.locator('h1').count(), 1, 'one h1');
    eq(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex', 'noindex');
    const broken = await page.evaluate(() => [...document.styleSheets].length);
    assert(broken >= 1, 'stylesheet loaded on a nested path');
    await page.click('text=Go to the home page');
    await page.waitForLoadState('networkidle');
    assert(/Hand-built websites/.test(await page.locator('h1').innerText()), 'home link works');
    await ctx.close();
  });

  /* 15. Domain script */
  await test('scripts/set-domain.sh rewrites every absolute URL', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-domain-'));
    for (const f of ['index.html', '404.html', 'sitemap.xml', 'robots.txt', 'scripts/set-domain.sh', 'work/legendary-detailing/index.html']) {
      fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true });
      fs.copyFileSync(path.join(ROOT, f), path.join(tmp, f));
    }
    execFileSync('bash', [path.join(tmp, 'scripts/set-domain.sh'), 'https://Example-Studio.com/'], { encoding: 'utf8' });
    const old = SITE.replace(/\/$/, '');
    for (const f of ['index.html', 'sitemap.xml', 'robots.txt', 'work/legendary-detailing/index.html']) {
      const body = fs.readFileSync(path.join(tmp, f), 'utf8');
      assert(!body.includes(old), `${f} still has ${old}`);
      assert(body.includes('https://example-studio.com/'), `${f} has the new domain`);
    }
    eq(fs.readFileSync(path.join(tmp, 'CNAME'), 'utf8').trim(), 'example-studio.com', 'CNAME');
    const again = execFileSync('bash', [path.join(tmp, 'scripts/set-domain.sh'), 'example-studio.com'], { encoding: 'utf8' });
    assert(/already points/.test(again), 'safe to run twice');
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  await browser.close();
  server.close();
  cspServer.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? `, ${failed.length} failed` : ''}\n`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
