/* M&M Websites: smooth scrolling
   Lenis 1.3.27 (darkroomengineering/lenis, MIT), self-hosted in assets/vendor/lenis/1.3.27/.

   - Off when the visitor prefers reduced motion, or if Lenis didn't load: the page
     then scrolls natively, exactly as before.
   - Smooths the mouse wheel and trackpad only. Touch scrolling stays native.
   - When GSAP's ScrollTrigger is on the page (home), Lenis runs on GSAP's ticker
     and tells ScrollTrigger about every scroll, the way the Lenis README documents.
   - In-page links (#pricing, #faq...) glide to their section and stop under the
     sticky header (Lenis reads html { scroll-padding-top }, as native anchors
     do), put the hash in the address bar and move keyboard focus to the
     section. The skip link stays native and instant.
   - Paused while the phone menu is open (main.js locks the page then). */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (typeof window.Lenis !== 'function' || !reduce || reduce.matches) return;

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var synced = !!(gsap && ST);

  var lenis = new window.Lenis({
    autoRaf: !synced,
    lerp: 0.12,
    smoothWheel: true,
    syncTouch: false,
    // let these scroll on their own: the message box and the open phone menu
    prevent: function (node) { return node.tagName === 'TEXTAREA' || node.id === 'nav-list'; },
  });
  window.MM_LENIS = lenis;

  var tick = function (time) { lenis.raf(time * 1000); };
  if (synced) {
    gsap.registerPlugin(ST);
    lenis.on('scroll', ST.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- in-page links ---------- */
  var headerOffset = function () { return parseFloat(getComputedStyle(root).scrollPaddingTop) || 0; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 4); };
  var focusTarget = function (el) {
    if (!el.matches('a[href], button, input, select, textarea, summary, [tabindex]')) {
      el.setAttribute('tabindex', '-1');
      el.setAttribute('data-scroll-target', '');
    }
    el.focus({ preventScroll: true });
  };

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link || link.classList.contains('skip')) return;
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();

    var toTop = target === document.querySelector('.masthead');
    var distance = Math.abs(toTop ? window.scrollY : target.getBoundingClientRect().top - headerOffset());
    lenis.start();
    // a native scroll whose event hasn't arrived yet (End key, find in page) would leave Lenis a step behind
    if (lenis.isScrolling !== 'smooth') lenis.reset();
    lenis.scrollTo(toTop ? 0 : target, {
      duration: Math.min(1.2, 0.55 + distance / 6000),
      easing: easeOut,
      onComplete: function () { focusTarget(target); },
    });
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  });

  /* ---------- the phone menu locks the page: pause Lenis with it ---------- */
  var locked = false;
  new MutationObserver(function () {
    var open = root.classList.contains('menu-open');
    if (open === locked) return;
    locked = open;
    if (open) lenis.stop(); else lenis.start();
  }).observe(root, { attributes: true, attributeFilter: ['class'] });

  /* ---------- the visitor switches reduced motion on: back to native scrolling ---------- */
  var off = function (e) {
    if (!e.matches) return;
    if (synced) gsap.ticker.remove(tick);
    lenis.destroy();
    window.MM_LENIS = null;
  };
  if (reduce.addEventListener) reduce.addEventListener('change', off);
})();
