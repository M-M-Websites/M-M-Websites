/* M&M Websites: home page motion
   GSAP 3.15.1 with ScrollTrigger and SplitText (GreenSock / Webflow, standard
   "no charge" license), three.js r134 and Vanta 0.5.24 (both MIT), all
   self-hosted in assets/vendor/. Shiny Text is ported from React Bits
   (assets/js/shiny-text.js).

   Rules this file keeps:
   - Nothing runs when the visitor prefers reduced motion, or if GSAP didn't load.
     The page is then exactly the still, complete page it is without JavaScript.
   - CSS never hides content. Only this script hides a block, only when that block
     is below the fold, and only until it scrolls in. Anything already on screen
     is left alone, so nothing visible ever disappears.
   - The hero headline is never hidden: its words drop onto their hooks with
     transforms only, so the largest text paints at once.
   - Every reveal clears its inline styles when it finishes, so hover effects
     and layout go back to the stylesheet. */
(function () {
  'use strict';

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (!gsap || !ST || !reduce || reduce.matches) return;
  gsap.registerPlugin(ST);
  if (Split) gsap.registerPlugin(Split);

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var EASE = 'expo.out'; // close to the site's --ease-out, cubic-bezier(0.16, 1, 0.3, 1)

  /* ---------- hero headline: words drop onto their hooks, then a shine passes ---------- */
  var big = $('.hero__big');
  var shiny = big && window.MMShinyText ? window.MMShinyText(big, {
    shineColor: getComputedStyle(document.documentElement).getPropertyValue('--shine').trim() || '#ffffff',
    speed: 1.6, delay: 0, angle: 115, shineWidth: 36, direction: 'right', trigger: 'manual', hover: true,
  }) : null;
  // only animate the entrance if this runs before or right at first paint;
  // on a slow load the headline has already been read, so it just gets the shine
  var early = performance.now() < 1500;
  if (big && Split && early) {
    var words = new Split(big, { type: 'words', wordsClass: 'hero__word', aria: 'none' });
    var tl = gsap.timeline({
      onComplete: function () {
        words.revert();
        if (shiny) shiny.sweep();
      },
    });
    tl.from(words.words, { yPercent: -28, duration: 0.7, ease: EASE, stagger: 0.07 }, 0)
      .from(words.words, { rotation: -6, transformOrigin: '50% 0%', duration: 1.1, ease: 'elastic.out(1, 0.4)', stagger: 0.07 }, 0)
      .to({}, { duration: 0.15 });
  } else if (shiny) {
    setTimeout(shiny.sweep, 400);
  }

  /* ---------- scroll reveals (below the fold only) ---------- */
  var pending = [];
  var below = function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.92; };

  function reveal(selector, from, opts) {
    opts = opts || {};
    var els = $$(selector).filter(below);
    if (!els.length) return;
    gsap.set(els, from);
    pending = pending.concat(els);
    var show = function (batch) {
      var to = Object.assign({ duration: 0.8, ease: EASE, stagger: opts.stagger === undefined ? 0.08 : opts.stagger, overwrite: true, clearProps: 'opacity,transform,transformOrigin' }, opts.to || {});
      Object.keys(from).forEach(function (k) { if (!(k in to)) to[k] = k === 'opacity' ? 1 : (k === 'transformOrigin' ? from[k] : 0); });
      gsap.to(batch, to);
      pending = pending.filter(function (el) { return batch.indexOf(el) < 0; });
    };
    // onLeave too: a jump straight past a block (find in page, restored scroll) still reveals it
    ST.batch(els, { start: opts.start || 'top 88%', once: true, onEnter: show, onLeave: show, onEnterBack: show });
  }

  function sectionTitles() {
    // section titles rise out of a mask, line by line
    $$('.section h2').filter(below).forEach(function (h2) {
      if (!Split) return;
      var split = new Split(h2, { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'none' });
      gsap.set(split.lines, { yPercent: 105 });
      pending.push(h2);
      var done = false;
      var show = function () {
        if (done) return;
        done = true;
        gsap.to(split.lines, { yPercent: 0, duration: 0.9, ease: EASE, stagger: 0.08, onComplete: function () { split.revert(); } });
        pending = pending.filter(function (el) { return el !== h2; });
      };
      ST.create({ trigger: h2, start: 'top 88%', once: true, onEnter: show, onLeave: show, onEnterBack: show });
      h2._mmSplit = split;
    });
  }

  function reveals() {
    var up = { opacity: 0, y: 24 };
    reveal('.section__head > p, .pricing__intro > p, .start__intro > p, .why__statement', up);
    reveal('.ledger__row', up);
    reveal('.project__media', { opacity: 0, y: 40 }, { to: { duration: 1 } });
    reveal('.project__body > *', { opacity: 0, y: 18 }, { stagger: 0.06 });
    reveal('.step', up);
    reveal('.why__list > div', up, { stagger: 0.06 });
    reveal('.pricing__points li', { opacity: 0, y: 14 }, { stagger: 0.06 });
    // price tags drop onto their hooks and settle, like the key tags in the hero
    reveal('.bill__tag', { opacity: 0, y: -16, rotation: -5, transformOrigin: '50% 0%' }, { stagger: 0.12, to: { ease: 'elastic.out(1, 0.45)', duration: 1.2 } });
    reveal('.bill__checkout', up);
    reveal('.qa', { opacity: 0, y: 16 }, { stagger: 0.05, to: { duration: 0.6 } });
    reveal('.formcard', { opacity: 0, y: 32 });
  }

  /* ---------- the phone screenshot drifts against the desktop one as you scroll ---------- */
  function parallax() {
    var phone = $('.project .shot--phone');
    if (!phone) return;
    gsap.fromTo(phone, { '--drift': '24px' }, {
      '--drift': '-24px', ease: 'none',
      scrollTrigger: { trigger: phone.closest('.project'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  // printing shows everything, finished
  window.addEventListener('beforeprint', function () {
    pending.forEach(function (el) { if (el._mmSplit) el._mmSplit.revert(); });
    gsap.set(pending, { clearProps: 'opacity,transform,transformOrigin' });
    pending = [];
  });

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    sectionTitles(); // after the fonts, so lines are measured in the real typeface
    reveals();
    parallax();
    ST.refresh();
  });

  /* ---------- Vanta DOTS behind the hero: the pegboard runs on into the distance ----------
     Loaded after the page has finished loading and the browser is idle, only on
     screens 760px and wider with WebGL and no data saver. Phones, reduced motion
     and anything without WebGL keep the plain steel hero, which is also what
     shows while it loads. It moves for 5 seconds after it appears, then holds
     still, and only moves again while the mouse moves (so nothing animates on its
     own for more than 5 seconds: WCAG 2.2.2, and no idle GPU work). Paused while
     the hero is off screen, rebuilt when the colour scheme changes, and destroyed
     (WebGL context released) on pagehide. */
  var host = $('.hero__fx');
  var hero = $('.hero');
  var VENDOR = (document.currentScript && document.currentScript.src || '').replace(/js\/motion\.js.*$/, 'vendor/');
  var fx = null;
  var visible = true;
  var loading = null;
  var idleTimer = 0;
  var RUN_MS = 5000;

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return false;
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return true;
    } catch (e) { return false; }
  }
  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function hex(name) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return /^#[0-9a-f]{6}$/i.test(v) ? parseInt(v.slice(1), 16) : 0x8a948f;
  }
  var wanted = function () {
    var conn = navigator.connection;
    return window.innerWidth >= 760 && !(conn && conn.saveData) && !reduce.matches;
  };

  function startFx() {
    if (fx || !host || !wanted()) return;
    if (!loading) {
      loading = load(VENDOR + 'three/0.134.0/three.min.js').then(function () { return load(VENDOR + 'vanta/0.5.24/vanta.dots.min.js'); });
    }
    loading.then(function () {
      if (fx || !wanted() || !window.VANTA || !window.VANTA.DOTS) return;
      fx = window.VANTA.DOTS({
        el: host,
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: Math.max(1, (window.devicePixelRatio || 1) / 1.5), // render at 1.5x at most
        scaleMobile: 1,
        color: hex('--fx-dot'),
        color2: hex('--fx-dot'),
        backgroundColor: hex('--steel'),
        backgroundAlpha: 0, // see-through: the hammertone steel stays the ground
        size: 3,
        spacing: 30,
        showLines: false,
      });
      if (!fx || !fx.renderer) { fx = null; return; }
      // Vanta flies the camera in from straight overhead; start it most of the way
      // there so the field has settled into perspective within its 5 seconds
      if (fx.camera) fx.camera.position.set(0, 120, 250);
      if (visible) wake(); else pauseFx();
      requestAnimationFrame(function () { host.classList.add('is-live'); });
    }).catch(function () { /* no 3D: the static steel hero stays */ });
  }
  function pauseFx() { clearTimeout(idleTimer); if (fx && fx.req) { cancelAnimationFrame(fx.req); fx.req = 0; } }
  function resumeFx() { if (fx && !fx.req) { fx.prevNow = 0; fx.animationLoop(); } }
  function wake() {
    if (!fx || !visible) return;
    resumeFx();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(pauseFx, RUN_MS);
  }
  function drawOnce() { if (fx && !fx.req && fx.renderer && fx.scene && fx.camera) fx.renderer.render(fx.scene, fx.camera); }
  function stopFx() {
    if (!fx) return;
    var renderer = fx.renderer;
    host.classList.remove('is-live');
    fx.destroy();
    if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
    fx = null;
  }

  if (host && hero && hasWebGL()) {
    var boot = function () {
      var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 200); };
      idle(startFx, { timeout: 2500 });
    };
    if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot, { once: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (!visible) pauseFx();
      }).observe(hero);
    }
    // the hero changes height without a window resize (fonts, wrapping): keep the canvas matched
    // (resizing clears the canvas, so a paused field draws its frame again)
    if ('ResizeObserver' in window) new ResizeObserver(function () { if (fx) { fx.resize(); drawOnce(); } }).observe(host);
    // the field follows the mouse: moving it wakes the animation for another few seconds
    window.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') wake(); }, { passive: true });
    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (wanted()) startFx(); else stopFx(); }, 250);
    });
    var dark = window.matchMedia('(prefers-color-scheme: dark)');
    var rebuild = function () { stopFx(); startFx(); };
    if (dark.addEventListener) dark.addEventListener('change', rebuild);
    if (reduce.addEventListener) reduce.addEventListener('change', function (e) { if (e.matches) stopFx(); });
    window.addEventListener('pagehide', stopFx);
    window.addEventListener('pageshow', function (e) { if (e.persisted) startFx(); });
  }
})();
