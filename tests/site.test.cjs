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
const PAGES = ['/', '/work/legendary-detailing/', '/terms/', '/privacy/', '/refunds/'];
const PAY_LINK = 'https://buy.stripe.com/7sY28qcdi8Bg29nbfEaEE00';
const PORTAL_LINK = 'https://billing.stripe.com/p/login/7sY28qcdi8Bg29nbfEaEE00';

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
  await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) { a.pause(); } }));
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
  await page.locator('input[name="timeline"][value="Within a month"]').check();
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
          const sel = '.btn, .nav__list a, .nav__toggle, summary, .chip span, .field input:not(.hp), .field select, .field textarea, .footer a, .crumbs a, .brand, .direct__link, .copy';
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

  /* 3. Honest content with the shipped settings */
  await test('content: real prices and contact emails, nothing invented, other settings stay empty', async () => {
    const cfg = fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8');
    assert(/\bformEmail: 'mnmwebsitesforyou@gmail\.com'/.test(cfg), 'config.js formEmail should be the business Gmail');
    assert(/\bbusinessEmail: 'mnmwebsitesforyou@gmail\.com'/.test(cfg), 'config.js businessEmail should be mnmwebsitesforyou@gmail.com');
    for (const key of ['phone', 'phoneDisplay', 'bookingUrl', 'instagram', 'facebook', 'linkedin', 'tiktok', 'x', 'youtube', 'googleBusiness']) {
      assert(new RegExp(`\\b${key}: ''`).test(cfg), `config.js ${key} should ship empty`);
    }

    const { ctx, page, problems } = await openPage(browser, base, { opts: { viewport: { width: 1440, height: 900 } } });
    const text = await page.evaluate(() => document.body.innerText);
    const amounts = [...new Set(text.match(/\$\s?\d[\d,.]*/g) || [])].sort();
    eq(JSON.stringify(amounts), JSON.stringify(['$45', '$600', '$645']), 'only the real prices appear');
    assert(!/lorem|ipsum|TODO|FIXME|testimonial|award|years in business/i.test(text), 'placeholder or invented-claim text found');
    eq(await page.locator('a[href^="tel:"], a[href^="sms:"]').count(), 0, 'no phone links while unset');
    assert((await page.locator('a[href="mailto:mnmwebsitesforyou@gmail.com"]').count()) >= 1, 'business email link shown');
    for (const sel of ['#direct', '#footer-contact']) assert(await page.locator(sel).isVisible(), `${sel} should be visible when email is set`);
    assert(!(await page.locator('#form-offline').isVisible()), 'form should show as connected');
    eq((await page.locator('#f-submit').innerText()).trim(), 'Send project details', 'submit label when connected');
    eq(await page.locator('.project').count(), 1, 'exactly one portfolio project');
    eq((await page.locator('.project__name').innerText()).trim(), 'Legendary Detailing', 'portfolio project');
    const ld = JSON.parse(await page.locator('#org-jsonld').textContent());
    eq(ld['@type'], 'ProfessionalService', 'JSON-LD type');
    eq(ld.name, 'M&M Websites', 'JSON-LD name');
    eq(ld.email, 'mnmwebsitesforyou@gmail.com', 'JSON-LD email');
    for (const k of ['address', 'telephone', 'aggregateRating', 'review', 'priceRange', 'foundingDate', 'numberOfEmployees', 'sameAs']) assert(!(k in ld), `JSON-LD must not contain ${k} while unconfirmed`);
    const offers = ld.hasOfferCatalog.itemListElement;
    eq(offers.find((o) => o.price)?.price, '600.00', 'JSON-LD setup price');
    eq(offers.find((o) => o.priceSpecification)?.priceSpecification.price, '45.00', 'JSON-LD monthly price');
    // no unexpected personal or client contact details in published files
    const allowedEmail = /mnmwebsitesforyou@gmail\.com/g;
    const published = execFileSync('git', ['ls-files', '--others', '--cached', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n').filter((f) => /\.(html|js|css|txt|xml|md)$/.test(f) && !f.startsWith('tests/') && !/^(\.claude|seo|outreach)\//.test(f)); // .claude/, seo/ and outreach/ are in .assetsignore (never published)
    for (const f of published) {
      const body = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const leftover = body.replace(allowedEmail, '');
      assert(!/@gmail\.com|@yahoo\.com|@outlook\.com|@hotmail\.com/i.test(leftover), `${f} contains a personal email address`);
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
    const { ctx, page, problems, formRequests } = await openPage(browser, base, { opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, config: { formEmail: '', businessEmail: '' } });
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
    await page.waitForTimeout(300); // let the debounced re-validation settle before clicking
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

  /* 9b. Policy pages */
  await test('policies: terms, privacy and refund pages say the real facts and are linked from every footer', async () => {
    const { ctx, page, problems } = await openPage(browser, base, { opts: { viewport: { width: 1440, height: 900 } } });
    const facts = {
      '/terms/': [/Georgia/, /\$600/, /\$45 a month/, /month to month/i, /cancel/i, /Stripe/],
      '/privacy/': [/FormSubmit/, /Cloudflare Web Analytics/, /Stripe/, /never sell|do not sell/i],
      '/refunds/': [/before (we begin|design work starts)/i, /non-refundable/i, /not prorated/i, /stops all future billing/i],
    };
    for (const [route, checks] of Object.entries(facts)) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const text = await page.evaluate(() => document.querySelector('main').innerText);
      assert(/Last updated November 1[56], 2026/.test(text), `${route} shows the last-updated date`);
      assert(text.includes('mnmwebsitesforyou@gmail.com'), `${route} gives the contact email`);
      for (const re of checks) assert(re.test(text), `${route} should mention ${re}`);
      const amounts = [...new Set(text.match(/\$\s?\d[\d,.]*/g) || [])].filter((a) => !['$45', '$600'].includes(a));
      eq(amounts.length, 0, `${route} only real prices (${amounts})`);
    }
    for (const route of PAGES) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const hrefs = await page.$$eval('.footer__policies a', (a) => a.map((x) => new URL(x.href).pathname));
      eq(hrefs.join('|'), '/terms/|/privacy/|/refunds/', `${route} footer policy links`);
    }
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();
  });

  await test('icons and headers: favicon.ico is a real icon, HSTS is set and the analytics beacon is allowed', async () => {
    const ico = fs.readFileSync(path.join(ROOT, 'favicon.ico'));
    eq(ico.readUInt16LE(0), 0, 'ICO reserved field'); eq(ico.readUInt16LE(2), 1, 'ICO type');
    assert(ico.readUInt16LE(4) >= 2, 'favicon.ico has several sizes');
    assert(/Strict-Transport-Security: max-age=31536000; includeSubDomains\s*$/m.test(HEADERS), 'HSTS header (no preload)');
    assert(/script-src [^;]*https:\/\/static\.cloudflareinsights\.com/.test(CSP), 'CSP allows the beacon script');
    assert(/connect-src [^;]*https:\/\/cloudflareinsights\.com/.test(CSP), 'CSP allows the beacon to report');
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

  /* 12b. Polish: dark theme, typography, the phone dock, copy-to-toast, nav state */
  await test('dark theme: every page is dark, readable and passes axe', async () => {
    for (const route of [...PAGES, '/missing-page/']) {
      for (const opts of [{ viewport: { width: 1440, height: 900 } }, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]) {
        const { ctx, page, problems } = await openPage(browser, base, { opts: { ...opts, colorScheme: 'dark' }, route });
        await scrollThrough(page);
        const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
        const [r, g, b] = bg.match(/\d+/g).map(Number);
        assert(r + g + b < 120, `${route} background should be dark, got ${bg}`);
        await axe(page, `${route} dark @${opts.viewport.width}`);
        const real = route === '/missing-page/' ? problems.filter((p) => !p.includes('/missing-page/') && !/status of 404/.test(p)) : problems;
        eq(real.length, 0, `${route} errors: ${real.join('; ')}`);
        await ctx.close();
      }
    }
  });

  await test('typography: curly apostrophes and real ellipses in visible text, tabular prices', async () => {
    for (const route of [...PAGES, '/missing-page/']) {
      const { ctx, page } = await openPage(browser, base, { route });
      const bad = await page.evaluate(() => {
        const out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
          const n = w.currentNode;
          if (n.parentElement.closest('script, style')) continue;
          if (/[A-Za-z]'[A-Za-z]|\.\.\./.test(n.textContent)) out.push(n.textContent.trim().slice(0, 60));
        }
        document.querySelectorAll('[alt], [placeholder], [aria-label]').forEach((el) => {
          ['alt', 'placeholder', 'aria-label'].forEach((a) => { const v = el.getAttribute(a); if (v && /[A-Za-z]'[A-Za-z]|\.\.\./.test(v)) out.push(`${a}: ${v.slice(0, 60)}`); });
        });
        return out;
      });
      eq(bad.length, 0, `${route} straight apostrophes or "..." found: ${bad.join(' | ')}`);
      if (route === '/') {
        const nums = await page.$$eval('.bill__price strong, .bill__total strong', (n) => n.map((x) => getComputedStyle(x).fontVariantNumeric));
        assert(nums.every((v) => v.includes('tabular-nums')), `prices use tabular numbers: ${nums}`);
        const h2wrap = await page.$eval('h2', (h) => getComputedStyle(h).textWrap || getComputedStyle(h).textWrapStyle);
        assert(/balance/.test(h2wrap), `headings use balanced wrapping: ${h2wrap}`);
      }
      await ctx.close();
    }
  });

  await test('phone dock: appears after the hero, hides at pricing and the form, and links to checkout and the form', async () => {
    const { ctx, page, problems } = await openPage(browser, base, { opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });
    const shown = () => page.evaluate(() => document.getElementById('dock').classList.contains('is-shown'));
    eq(await shown(), false, 'hidden over the hero');
    await page.evaluate(() => { const s = document.getElementById('services'); window.scrollTo({ top: s.offsetTop + 200, behavior: 'instant' }); });
    await page.waitForTimeout(400);
    eq(await shown(), true, 'shown after the hero');
    const hrefs = await page.$$eval('#dock a', (a) => a.map((x) => x.getAttribute('href')));
    eq(JSON.stringify(hrefs), JSON.stringify(['#start', PAY_LINK]), 'dock links');
    const r = await page.$eval('#dock', (d) => d.getBoundingClientRect().bottom);
    eq(Math.round(r), 844, 'sits at the bottom edge, in thumb reach');
    await page.evaluate(() => { const s = document.getElementById('start'); window.scrollTo({ top: s.offsetTop + 100, behavior: 'instant' }); });
    await page.waitForTimeout(400);
    eq(await shown(), false, 'hidden at the form');
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();
    const wide = await openPage(browser, base, { opts: { viewport: { width: 1440, height: 900 } } });
    await wide.page.evaluate(() => window.scrollTo({ top: 2400, behavior: 'instant' }));
    await wide.page.waitForTimeout(300);
    eq(await wide.page.$eval('#dock', (d) => getComputedStyle(d).display), 'none', 'no dock on desktop');
    await wide.ctx.close();
  });

  await test('copy email: copies the address and confirms with a toast that goes away', async () => {
    const { ctx, page } = await openPage(browser, base, { opts: { viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] } });
    await page.click('#copy-email');
    await page.locator('#toast').waitFor({ state: 'visible' });
    eq(await page.locator('#toast').innerText(), 'Email address copied', 'toast text');
    eq(await page.evaluate(() => navigator.clipboard.readText()), 'mnmwebsitesforyou@gmail.com', 'clipboard');
    eq(await page.getAttribute('#toast', 'role'), 'status', 'toast is announced politely');
    await page.waitForTimeout(5300);
    assert(!(await page.locator('#toast').isVisible()), 'toast auto-dismisses');
    await ctx.close();
    const none = await openPage(browser, base, { config: { formEmail: '', businessEmail: '' } });
    assert(!(await none.page.locator('#copy-email').isVisible()), 'no copy button without an email');
    await none.ctx.close();
  });

  await test('nav and form polish: section highlight, debounced errors, loading state on send', async () => {
    const { ctx, page } = await openPage(browser, base, { opts: { viewport: { width: 1440, height: 900 } }, config: { formEmail: 'studio@example.com' }, mock: (r) => new Promise((res) => setTimeout(() => res(r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' })), 800)) });
    await page.evaluate(() => { const s = document.getElementById('pricing'); window.scrollTo({ top: s.offsetTop, behavior: 'instant' }); });
    await page.waitForTimeout(400);
    eq(await page.getAttribute('#nav-list a[href="#pricing"]', 'aria-current'), 'true', 'nav marks the section in view');
    await page.click('#f-submit');
    eq(await page.getAttribute('#f-email', 'aria-invalid'), 'true', 'email invalid');
    await page.fill('#f-email', 'jordan@example.com');
    eq(await page.getAttribute('#f-email', 'aria-invalid'), 'true', 'error stays until typing pauses (debounced)');
    await page.waitForTimeout(350);
    eq(await page.getAttribute('#f-email', 'aria-invalid'), 'false', 'error clears after the pause');
    await fillValid(page);
    await page.click('#f-submit');
    assert(await page.locator('#f-submit.is-loading').count() === 1, 'button shows a loading state');
    assert(await page.locator('#f-submit').isDisabled(), 'button disabled while sending (no double submit)');
    await page.locator('#form-done').waitFor({ state: 'visible' });
    await ctx.close();
  });

  /* 12c. Business rule: clients do not own the site, code or domain */
  await test('ownership: no page promises clients the site, code or domain; the FAQ says what happens if they stop paying', async () => {
    const banned = /you own (the|your) (site|website|domain|code)|yours to keep|in your name|hand (it|them|the files)? ?over|hand it to someone|move it any ?time|code (is|are) yours|website and its code are yours/i;
    for (const route of [...PAGES, '/missing-page/']) {
      const { ctx, page } = await openPage(browser, base, { route });
      const text = await page.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('meta[content], [alt]')].map((m) => m.getAttribute('content') || m.getAttribute('alt')).join(' '));
      const hit = text.match(banned);
      assert(!hit, `${route} promises ownership: "${hit && hit[0]}"`);
      if (route === '/') {
        const faq = await page.$$eval('.qa', (q) => q.map((d) => d.textContent.replace(/\s+/g, ' ')));
        const own = faq.find((t) => /Do I own the website\?/.test(t));
        assert(own && /\bNo\. The website, its code, the hosting and the domain belong to M&M Websites/.test(own), `ownership FAQ: ${own}`);
        const stop = faq.find((t) => /What happens if I stop paying\?/.test(t));
        assert(stop && /taken offline/.test(stop) && /domain is paused/.test(stop) && /updates stop/.test(stop) && /no access to the code/i.test(stop), `stop-paying FAQ: ${stop}`);
      }
      await ctx.close();
    }
  });

  /* 12c2. FAQPage structured data must match the visible FAQ word for word (Google's rule) */
  await test('faq schema: FAQPage JSON-LD matches every visible question and answer exactly', async () => {
    const { ctx, page, problems } = await openPage(browser, base);
    const visible = await page.$$eval('#faq .qa', (ds) => ds.map((d) => [d.querySelector('summary').textContent.replace(/\s+/g, ' ').trim(), d.querySelector('.qa__body').textContent.replace(/\s+/g, ' ').trim()]));
    const ld = JSON.parse(await page.locator('#faq-jsonld').textContent());
    eq(ld['@type'], 'FAQPage', 'FAQ JSON-LD type');
    const schema = ld.mainEntity.map((q) => [q['@type'] === 'Question' && q.name, q.acceptedAnswer['@type'] === 'Answer' && q.acceptedAnswer.text]);
    eq(JSON.stringify(schema), JSON.stringify(visible), 'FAQ JSON-LD questions and answers (same text, same order)');
    const banned = /you own (the|your) (site|website|domain|code)|yours to keep|in your name|hand (it|them|the files)? ?over|hand it to someone|move it any ?time|code (is|are) yours/i;
    assert(!banned.test(JSON.stringify(ld)), 'FAQ JSON-LD promises ownership');
    eq(problems.length, 0, `errors: ${problems.join('; ')}`);
    await ctx.close();
  });

  /* 12c3. Page-to-page cross-fade: only without a reduced-motion preference; anchors and Back still work */
  await test('view transitions: cross-fade between pages, none with reduced motion, anchors and Back unaffected', async () => {
    for (const [rm, want] of [['no-preference', 1], ['reduce', 0]]) {
      const { ctx, page, problems } = await openPage(browser, base, { opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: rm } });
      await page.addInitScript(() => { window.__vt = 0; addEventListener('pagereveal', (e) => { if (e.viewTransition) window.__vt++; }); });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.click('.footer a[href="#faq"]');
      await page.waitForTimeout(900);
      eq(await page.evaluate(() => location.pathname + location.hash), '/#faq', `${rm}: in-page anchor`);
      assert(await page.evaluate(() => Math.abs(document.getElementById('faq').getBoundingClientRect().top) < 120), `${rm}: anchor scrolled to the FAQ`);
      await page.click('.footer a[href="terms/"]');
      await page.waitForLoadState('networkidle');
      eq(await page.evaluate(() => window.__vt), want, `${rm}: view transition on the terms page`);
      await page.goBack({ waitUntil: 'networkidle' });
      eq(await page.evaluate(() => location.pathname + location.hash), '/#faq', `${rm}: Back returns to the FAQ`);
      eq(problems.length, 0, `errors: ${problems.join('; ')}`);
      await ctx.close();
    }
  });

  /* 12c4. Layout stability: images reserve their space; only the first (LCP) image loads eagerly */
  await test('images: width and height match each file, nothing stretched, only the hero image is eager', async () => {
    const { ctx, page, problems } = await openPage(browser, base);
    for (const route of [...PAGES, '/missing-page/']) {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + route, { waitUntil: 'networkidle' });
        // let entrance motion (tags swinging onto their hooks) settle: a rotated box measures larger than the image
        await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))));
        const imgs = await page.$$eval('img', (els) => Promise.all(els.map(async (i, n) => {
          const probe = new Image(); probe.src = i.currentSrc || i.src; await probe.decode();
          const r = i.getBoundingClientRect(); const cs = getComputedStyle(i);
          const px = (...k) => k.reduce((t, x) => t + parseFloat(cs[x]), 0); // content box: the frame (border, padding) isn't the image
          return { n, src: i.getAttribute('src'), w: +i.getAttribute('width'), h: +i.getAttribute('height'), nw: probe.naturalWidth, nh: probe.naturalHeight,
            rw: r.width - px('borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight'), rh: r.height - px('borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'), loading: i.getAttribute('loading'), decoding: i.getAttribute('decoding'), fp: i.getAttribute('fetchpriority') };
        })));
        for (const i of imgs) {
          assert(i.w > 0 && i.h > 0, `${route} ${i.src}: width and height attributes`);
          assert(Math.abs(i.w / i.h - i.nw / i.nh) / (i.nw / i.nh) < 0.01, `${route} ${i.src}: ${i.w}x${i.h} does not match the file (${i.nw}x${i.nh})`);
          if (i.rw > 0) assert(Math.abs(i.rw / i.rh - i.w / i.h) / (i.w / i.h) < 0.02, `${route} ${i.src}: shown stretched at ${width}px`);
          if (i.n === 0) { eq(i.fp, 'high', `${route} first image fetchpriority`); assert(i.loading !== 'lazy', `${route} first image must not be lazy`); }
          else { eq(i.loading, 'lazy', `${route} ${i.src} loading`); eq(i.decoding, 'async', `${route} ${i.src} decoding`); }
        }
      }
    }
    // requests cut off by moving to the next page are expected here; image loading is covered by the layout tests
    const real = problems.filter((p) => !p.startsWith('requestfailed:') && !p.includes('/missing-page/') && !/status of 404/.test(p));
    eq(real.length, 0, `errors: ${real.join('; ')}`);
    await ctx.close();
  });

  /* 12d. Stripe facts: payment methods, terms at checkout, receipts, retries, Manage billing */
  await test('billing: Manage billing on every page, only the payment methods Stripe offers, terms and receipts explained', async () => {
    const otherMethods = /cash ?app|klarna|amazon pay|afterpay|clearpay|affirm|paypal|venmo|google pay|bank (transfer|debit|account)|\bach\b|sepa|ideal|bancontact|crypto|bitcoin/i;
    for (const route of PAGES) {
      const { ctx, page, problems } = await openPage(browser, base, { route });
      const footer = await page.$$eval('.footer__nav a', (a) => a.map((x) => [x.textContent.trim(), x.href]));
      assert(footer.some(([t, h]) => t === 'Manage billing' && h === PORTAL_LINK), `${route} footer links to Manage billing: ${JSON.stringify(footer)}`);
      const text = await page.evaluate(() => document.body.textContent);
      const hit = text.match(otherMethods);
      assert(!hit, `${route} mentions a payment method Stripe checkout doesn't offer: "${hit && hit[0]}"`);
      assert(!/hello@mnmwebsitesforyou/i.test(await page.content()), `${route} still uses the retired hello@ address`);
      eq(problems.length, 0, `${route} errors: ${problems.join('; ')}`);
      await ctx.close();
    }
    const { ctx, page } = await openPage(browser, base, { opts: { viewport: { width: 1440, height: 900 } } });
    const bill = (await page.locator('.bill').innerText()).replace(/\s+/g, ' ');
    assert(/card, Apple Pay or Link/.test(bill), `pricing card names the payment methods: ${bill}`);
    assert(/accept our Terms of Service/.test(bill) && /receipt/.test(bill), 'pricing card mentions terms at checkout and receipts');
    eq(await page.getAttribute('.bill a[href$="terms/"]', 'href'), 'terms/', 'terms link in the pricing card');
    eq(await page.locator(`.bill a[href="${PORTAL_LINK}"]`).count(), 1, 'Manage billing in the pricing card');
    const faq = await page.$$eval('.qa', (q) => q.map((d) => d.textContent.replace(/\s+/g, ' ')));
    const pay = faq.find((t) => /How can I pay\?/.test(t));
    assert(pay && /card, Apple Pay or Link/.test(pay) && /receipt/.test(pay), `payment FAQ: ${pay}`);
    const manage = faq.find((t) => /How do I update my card/.test(t));
    assert(manage && /Manage billing/.test(manage) && /mnmwebsitesforyou@gmail\.com/.test(manage), `billing FAQ: ${manage}`);
    assert(/tries again/.test(faq.find((t) => /stop paying/.test(t))), 'failed payments are retried');
    eq(await page.locator(`.qa a[href="${PORTAL_LINK}"]`).count(), 2, 'Manage billing linked from the FAQ');
    const ld = JSON.parse(await page.locator('#org-jsonld').textContent());
    eq(ld.paymentAccepted, 'Credit card, debit card, Apple Pay, Link', 'JSON-LD payment methods');
    for (const route of ['/terms/', '/refunds/']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      eq(await page.locator(`main a[href="${PORTAL_LINK}"]`).count() >= 1, true, `${route} links Manage billing in the policy text`);
      assert(/Last updated November 15, 2026/.test(await page.locator('main').innerText()), `${route} dated today`);
    }
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
    assert(/Hand us the keys/i.test(await page.locator('h1').innerText()), 'home link works');
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
