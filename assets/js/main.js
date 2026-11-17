/* M&M Websites: interactions
   - applies the owner's settings from config.js (contact links and socials)
   - mobile menu (focus kept inside, page behind inert), sticky header state
   - the two dealt moments: photo chapters (home #work) and picture develops (case study)
   - FAQ answers that open from, and write to, the address bar
   - "Start a project" form: validation and sending through FormSubmit,
     or an honest "not connected yet" state when no form email is set. */
(function () {
  'use strict';

  var raw = window.MM_CONFIG || {};
  var str = function (v) { return typeof v === 'string' ? v.trim() : ''; };
  var CFG = {
    formEmail: str(raw.formEmail),
    businessEmail: str(raw.businessEmail),
    phone: str(raw.phone).replace(/[^\d+]/g, ''),
    phoneDisplay: str(raw.phoneDisplay),
    bookingUrl: /^https:\/\//i.test(str(raw.bookingUrl)) ? str(raw.bookingUrl) : '',
    social: raw.social && typeof raw.social === 'object' ? raw.social : {},
  };
  if (!CFG.phoneDisplay) CFG.phoneDisplay = CFG.phone;

  var SOCIAL_NAMES = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', x: 'X', youtube: 'YouTube', googleBusiness: 'Google Business Profile' };
  var socials = Object.keys(SOCIAL_NAMES).map(function (k) {
    var url = str(CFG.social[k]);
    return /^https:\/\//i.test(url) ? { name: SOCIAL_NAMES[k], url: url } : null;
  }).filter(Boolean);

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var el = function (tag, attrs, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text) n.textContent = text;
    return n;
  };

  /* ---------- contact methods: only the ones that are set ---------- */
  var contacts = [];
  if (CFG.bookingUrl) contacts.push({ key: 'booking', label: 'Book a call', href: CFG.bookingUrl, external: true });
  if (CFG.phone) contacts.push({ key: 'phone', label: 'Call ' + CFG.phoneDisplay, href: 'tel:' + CFG.phone });
  if (CFG.businessEmail) contacts.push({ key: 'email', label: CFG.businessEmail, href: 'mailto:' + CFG.businessEmail });

  contacts.forEach(function (c) {
    var li = $('[data-contact="' + c.key + '"]');
    if (!li) return;
    var a = $('a', li);
    a.href = c.href;
    a.textContent = c.label;
    if (c.external) { a.target = '_blank'; a.rel = 'noopener'; }
    li.hidden = false;
  });
  if (contacts.length && $('#direct')) $('#direct').hidden = false;

  var footerLinks = $('#footer-links');
  if (footerLinks && (contacts.length || socials.length)) {
    contacts.concat(socials.map(function (s) { return { label: s.name, href: s.url, external: true }; })).forEach(function (c) {
      var li = el('li');
      var a = el('a', { href: c.href }, c.label);
      if (c.external) { a.target = '_blank'; a.rel = 'noopener'; }
      li.appendChild(a);
      footerLinks.appendChild(li);
    });
    $('#footer-contact').hidden = false;
  }

  /* Add confirmed details to the structured data, never invented ones */
  var ld = $('#org-jsonld');
  if (ld && (CFG.businessEmail || CFG.phone || socials.length)) {
    try {
      var data = JSON.parse(ld.textContent);
      if (CFG.businessEmail) data.email = CFG.businessEmail;
      if (CFG.phone) data.telephone = CFG.phone;
      if (socials.length) data.sameAs = socials.map(function (s) { return s.url; });
      ld.textContent = JSON.stringify(data);
    } catch (e) { /* leave the static data as it is */ }
  }

  /* ---------- year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- header ---------- */
  var masthead = $('.masthead');
  var onScroll = function () { if (masthead) masthead.classList.toggle('is-stuck', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = $('.nav__toggle');
  var navList = $('#nav-list');
  var scrim = $('#scrim');
  if (toggle && navList) {
    toggle.hidden = false;
    var behind = function () { return $$('main, footer, .dock'); };
    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };
    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      navList.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      behind().forEach(function (n) { if (open) n.setAttribute('inert', ''); else n.removeAttribute('inert'); });
      if (scrim) {
        if (open) { scrim.hidden = false; void scrim.offsetWidth; scrim.classList.add('is-on'); }
        else { scrim.classList.remove('is-on'); scrim.hidden = true; }
      }
      if (open) { var first = $('a', navList); if (first) first.focus({ preventScroll: true }); }
      if (!open && returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', function () { setOpen(!isOpen()); });
    $$('a', navList).forEach(function (a) { a.addEventListener('click', function () { if (isOpen()) setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setOpen(false, true); return; }
      if (e.key === 'Tab') { // keep focus inside the open menu
        var items = [toggle].concat($$('a', navList));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !e.target.closest('.nav')) setOpen(false);
    });
    window.addEventListener('resize', function () { if (isOpen() && getComputedStyle(toggle).display === 'none') setOpen(false); });
  }

  var rq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = function () { return !!(rq && rq.matches); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var headerH = function () { var m = $('.masthead'); return m ? m.getBoundingClientRect().height : 0; };

  /* ---------- moment 1: photo chapters (design-taste-frontend, dealt for the home page) ----------
     The #work section holds on screen while three screenshots uncover each other from the foot
     upward, settling from a slight zoom; a panel on the lower left changes to that chapter. Live only
     on screens 600px or taller without reduced motion; otherwise the chapters stand side by side. */
  $$('[data-moment="photo-chapters"]').forEach(function (root) {
    var article = $('.project', root) || root;
    var list = $('.mo-ph__list', root);
    var chapters = $$('.mo-ph__ch', root);
    var pics = chapters.map(function (c) { return $('.mo-ph__pic', c); });
    if (!list || chapters.length < 2 || pics.some(function (p) { return !p; })) return;
    var n = chapters.length;
    var nameEl = $('.project__name', root);
    var name = nameEl ? nameEl.textContent.trim() : '';
    var stage = el('div', { class: 'mo-ph__stage' });
    var panel = el('div', { class: 'mo-ph__panel' });
    var count = el('p', { class: 'mo-ph__count', 'aria-hidden': 'true' });
    panel.appendChild(count);
    var listHome = list.nextSibling;
    var homes = chapters;
    var live = false, on = -1, ticking = false;
    var pad = function (v) { return (v < 10 ? '0' : '') + v; };
    var show = function (k) {
      if (k === on) return;
      on = k;
      chapters.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
      count.textContent = (name ? name + ' · ' : '') + pad(k + 1) + ' / ' + pad(n);
    };
    var draw = function () {
      ticking = false;
      if (!live) return;
      var r = root.getBoundingClientRect();
      var top = headerH();
      var p = clamp((top - r.top) / Math.max(1, r.height - window.innerHeight + top), 0, 1);
      var seg = 1 / n, k = 0;
      pics.forEach(function (pic, i) {
        var u = i === 0 ? 1 : clamp((p - (i - 0.25) * seg) / (0.45 * seg), 0, 1);
        var e = easeOut(u);
        pic.style.setProperty('--mo-c', ((1 - e) * 100).toFixed(2) + '%');
        pic.style.setProperty('--mo-z', (1.06 - 0.06 * e).toFixed(4));
        if (u >= 0.5) k = i;
      });
      show(k);
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } };
    var go = function () {
      if (live) return;
      live = true;
      pics.forEach(function (p) { stage.appendChild(p); });
      panel.appendChild(list);
      stage.appendChild(panel);
      article.insertBefore(stage, $('.project__cta', article));
      root.classList.add('is-live');
      var box = $('.mo-ph', root); if (box) box.setAttribute('data-edge-free', '');
      pics.forEach(function (p) { var img = $('img', p); if (img) img.loading = 'eager'; });
      draw();
      window.addEventListener('scroll', onScroll, { passive: true });
    };
    var rest = function () {
      if (!live) return;
      live = false;
      window.removeEventListener('scroll', onScroll);
      root.classList.remove('is-live');
      var bx = $('.mo-ph', root); if (bx) bx.removeAttribute('data-edge-free');
      article.insertBefore(list, listHome);
      pics.forEach(function (p, i) { homes[i].insertBefore(p, homes[i].firstChild); p.style.removeProperty('--mo-c'); p.style.removeProperty('--mo-z'); });
      chapters.forEach(function (c) { c.classList.remove('is-on'); });
      if (stage.parentNode) stage.parentNode.removeChild(stage);
      on = -1;
    };
    var sync = function () { if (!reduced() && window.innerHeight >= 600) go(); else rest(); };
    sync();
    var t = 0;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(sync, 120); });
    if (rq && rq.addEventListener) rq.addEventListener('change', sync);
  });

  /* ---------- moment 2: picture develops (film look) ----------
     A large screenshot comes up once, like a print in the developer tray: pale and grey first,
     its darks, then its colour, settling from a slight zoom. About 1.6 s, once. */
  $$('[data-moment="picture-develops"]').forEach(function (root) {
    var img = $('img', root);
    if (!img || reduced() || !('IntersectionObserver' in window) || !img.animate) return;
    root.classList.add('mo-pd');
    var done = false;
    var arm = function () { if (!done) root.classList.add('is-armed'); };
    var run = function () {
      if (done) return;
      done = true;
      var play = function () {
        root.classList.remove('is-armed');
        img.animate([
          { filter: 'grayscale(1) contrast(.55) brightness(1.32)', transform: 'scale(1.06)' },
          { filter: 'grayscale(.8) contrast(.82) brightness(1.14)', offset: 0.3 },
          { filter: 'grayscale(.35) contrast(.95) brightness(1.04)', offset: 0.62 },
          { filter: 'none', transform: 'none' }
        ], { duration: 1600, easing: 'cubic-bezier(.3, .2, .3, 1)' });
      };
      if (img.complete) play(); else { img.addEventListener('load', play, { once: true }); img.addEventListener('error', play, { once: true }); }
    };
    var r0 = root.getBoundingClientRect();
    if (r0.bottom > 0 && r0.top < window.innerHeight * 1.25) arm();
    var near = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { arm(); near.disconnect(); } }, { rootMargin: '0px 0px 25% 0px' });
    var seen = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); seen.disconnect(); } }, { threshold: Math.min(0.25, 0.4 * window.innerHeight / Math.max(1, r0.height)) });
    near.observe(root); seen.observe(root);
    setTimeout(function () { if (!done) { done = true; root.classList.remove('is-armed'); } }, 8000); // never left grey
  });

  /* ---------- FAQ: an open answer is linkable, and a shared link opens it ---------- */
  var openFromHash = function () {
    var id = decodeURIComponent(location.hash.slice(1));
    var d = id && document.getElementById(id);
    if (d && d.tagName === 'DETAILS') { d.open = true; }
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  $$('details.qa[id]').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!window.history || !history.replaceState) return;
      if (d.open) history.replaceState(null, '', '#' + d.id);
      else if (location.hash === '#' + d.id) history.replaceState(null, '', '#faq');
    });
  });

  /* ---------- policy pages: mark the section in view in the contents list ---------- */
  var tocLinks = $$('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tocBy = {};
    tocLinks.forEach(function (a) { tocBy[a.getAttribute('href').slice(1)] = a; });
    var tocSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var h = $('h2[id]', en.target);
        var link = h && tocBy[h.id];
        if (link && en.isIntersecting) { tocLinks.forEach(function (a) { a.removeAttribute('aria-current'); }); link.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.legal__section').forEach(function (sec) { tocSpy.observe(sec); });
  }

  /* ---------- nav: mark the section in view ---------- */
  var navLinks = $$('#nav-list a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var link = byId[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var sec = document.getElementById(id); if (sec) spy.observe(sec); });
  }

  /* ---------- phone action dock: after the hero, out of the way of pricing, the form and the footer ---------- */
  var dock = $('#dock');
  var hero = $('.hero');
  if (dock && hero && 'IntersectionObserver' in window) {
    var state = { pastHero: false, blocked: {} };
    var update = function () {
      var blocked = Object.keys(state.blocked).some(function (k) { return state.blocked[k]; });
      dock.classList.toggle('is-shown', state.pastHero && !blocked);
    };
    new IntersectionObserver(function (entries) {
      state.pastHero = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      update();
    }).observe(hero);
    var bo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { state.blocked[en.target.id || 'footer'] = en.isIntersecting; });
      update();
    });
    ['#pricing', '#start', '.footer'].forEach(function (sel) { var b = $(sel); if (b) bo.observe(b); });
  }

  /* ---------- toast: short confirmations; pauses while hovered ---------- */
  var toastEl = $('#toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    var arm = function () { clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.hidden = true; }, 5000); };
    toastEl.onmouseenter = function () { clearTimeout(toastTimer); };
    toastEl.onmouseleave = arm;
    arm();
  }
  var copyBtn = $('#copy-email');
  if (copyBtn && CFG.businessEmail) {
    copyBtn.addEventListener('click', function () {
      var label = $('.copy__label', copyBtn);
      var ok = function () {
        toast('Email address copied');
        copyBtn.classList.add('is-copied');
        if (label) label.textContent = 'Copied';
        clearTimeout(copyBtn._t);
        copyBtn._t = setTimeout(function () { copyBtn.classList.remove('is-copied'); if (label) label.textContent = 'Copy'; }, 2000);
      };
      var fail = function () { toast('Couldn\u2019t copy. The address is ' + CFG.businessEmail); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(CFG.businessEmail).then(ok, fail);
      else fail();
    });
  } else if (copyBtn) {
    copyBtn.hidden = true;
  }

  /* ---------- Start a project form ---------- */
  var form = $('#project-form');
  if (!form) return;

  var submit = $('#f-submit');
  var status = $('#form-status');
  var connected = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CFG.formEmail) || /^[a-z0-9]{16,}$/i.test(CFG.formEmail);
  form.setAttribute('data-connected', String(connected));
  submit.disabled = false;

  if (!connected) {
    var offline = $('#form-offline');
    offline.hidden = false;
    if (contacts.length) $('.formcard__offline-alt', offline).hidden = false;
    submit.textContent = 'Check my details';
    submit.setAttribute('aria-describedby', 'form-offline');
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var fields = {
    name: { input: $('#f-name'), err: $('#f-name-err'), check: function (v) { return v ? '' : 'Please enter your name.'; } },
    business: { input: $('#f-business'), err: $('#f-business-err'), check: function (v) { return v ? '' : 'Please enter your business name.'; } },
    email: { input: $('#f-email'), err: $('#f-email-err'), check: function (v) {
      if (!v) return 'Please enter your email so we can reply.';
      return EMAIL_RE.test(v) ? '' : 'That email doesn’t look right. Check for a typo, like a missing @ or dot.';
    } },
    website: { input: $('#f-website'), err: $('#f-website-err'), check: function (v) {
      if (!v) return '';
      return /^(https?:\/\/)?[^\s/$.?#]+\.[^\s]{2,}$/i.test(v) ? '' : 'Enter a web address like yourbusiness.com, or leave this empty.';
    } },
  };
  var needsSet = $('.choices', form);
  var needsErr = $('#f-needs-err');

  function showError(f, msg) {
    f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    f.err.textContent = msg;
    f.err.hidden = !msg;
  }
  function validateField(key) {
    var f = fields[key];
    var msg = f.check(f.input.value.trim());
    showError(f, msg);
    return !msg;
  }
  function validateNeeds() {
    var ok = $$('input[name="needs"]:checked', form).length > 0;
    needsSet.setAttribute('aria-invalid', ok ? 'false' : 'true');
    needsErr.textContent = ok ? '' : 'Pick at least one, or choose “Not sure yet”.';
    needsErr.hidden = ok;
    return ok;
  }

  Object.keys(fields).forEach(function (key) {
    var f = fields[key];
    f.input.addEventListener('blur', function () { if (f.input.value.trim() || f.input.getAttribute('aria-invalid') === 'true') validateField(key); });
    var timer = null;
    f.input.addEventListener('input', function () {
      if (f.input.getAttribute('aria-invalid') !== 'true') return;
      clearTimeout(timer);
      timer = setTimeout(function () { validateField(key); }, 250); // debounced, so errors don't flicker per keystroke
    });
  });
  $$('input[name="needs"]', form).forEach(function (c) {
    c.addEventListener('change', function () { if (needsSet.getAttribute('aria-invalid') === 'true') validateNeeds(); });
  });

  function setStatus(kind, nodes) {
    status.className = 'form__status is-' + kind;
    status.textContent = '';
    nodes.forEach(function (n) { status.appendChild(typeof n === 'string' ? document.createTextNode(n) : n); });
    status.hidden = false;
    status.focus();
  }
  function fallbackNodes() {
    if (!contacts.length) return [];
    var nodes = [' You can also reach us directly: '];
    contacts.forEach(function (c, i) {
      var a = el('a', { href: c.href }, c.label);
      if (c.external) { a.target = '_blank'; a.rel = 'noopener'; }
      if (i) nodes.push(i === contacts.length - 1 ? ' or ' : ', ');
      nodes.push(a);
    });
    nodes.push('.');
    return nodes;
  }
  function payload() {
    var get = function (n) { var i = form.elements[n]; return i ? String(i.value || '').trim() : ''; };
    return {
      name: get('name'),
      business: get('business'),
      email: get('email'),
      phone: get('phone'),
      website: get('website'),
      needs: $$('input[name="needs"]:checked', form).map(function (c) { return c.value; }).join(', '),
      timeline: get('timeline'),
      message: get('message'),
      _subject: 'New project request: ' + get('business'),
      _replyto: get('email'),
      _template: 'table',
      _captcha: 'false',
      _honey: get('_honey'),
    };
  }

  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;

    var firstBad = null;
    Object.keys(fields).forEach(function (key) { if (!validateField(key) && !firstBad) firstBad = fields[key].input; });
    if (!validateNeeds() && !firstBad) firstBad = $('input[name="needs"]', form);
    if (firstBad) {
      status.hidden = true;
      firstBad.focus();
      var target = firstBad.closest('.field') || firstBad;
      if (!reduced()) {
        target.classList.toggle('shake', false);
        void target.offsetWidth; // restart the animation
        target.classList.add('shake');
      }
      return;
    }

    var data = payload();
    if (data._honey) return; // a bot filled the hidden field

    if (!connected) {
      var nodes = ['Not sent. This form isn’t connected to an inbox yet, so your details stayed on this page and nothing was sent.'];
      if (CFG.businessEmail) {
        var body = 'Name: ' + data.name + '\nBusiness: ' + data.business + '\nEmail: ' + data.email +
          (data.phone ? '\nPhone: ' + data.phone : '') + (data.website ? '\nWebsite: ' + data.website : '') +
          '\nNeeds: ' + data.needs +
          (data.timeline ? '\nTimeline: ' + data.timeline : '') + (data.message ? '\n\n' + data.message : '');
        var mail = el('a', { href: 'mailto:' + CFG.businessEmail + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(body) }, 'Send these details by email instead');
        nodes.push(' ', mail, '.');
      } else {
        nodes = nodes.concat(fallbackNodes());
      }
      setStatus('warn', nodes);
      return;
    }

    sending = true;
    var label = submit.textContent;
    submit.disabled = true;
    submit.classList.add('is-loading');
    submit.textContent = 'Sending\u2026';
    form.setAttribute('aria-busy', 'true');
    var slow = setTimeout(function () { submit.textContent = 'Still sending\u2026'; }, 4000);

    fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CFG.formEmail), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || 'HTTP ' + res.status);
      });
    }).then(function () {
      var done = $('#form-done');
      $('#done-name').textContent = data.name ? ', ' + data.name.split(/\s+/)[0] : '';
      form.hidden = true;
      done.hidden = false;
      done.focus();
    }).catch(function () {
      setStatus('error', ['Sorry, your details didn’t send. Nothing is lost: everything you typed is still here, so please try again in a moment.'].concat(fallbackNodes()));
    }).then(function () {
      sending = false;
      clearTimeout(slow);
      submit.classList.toggle('is-loading', false);
      submit.disabled = false;
      submit.textContent = label;
      form.removeAttribute('aria-busy');
    });
  });
})();
