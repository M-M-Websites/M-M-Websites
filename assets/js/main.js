/* M&M Websites: interactions
   - applies the owner's settings from config.js (contact links, prices, budget ranges)
   - mobile menu, sticky header state, scroll reveals
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
    budgetRanges: Array.isArray(raw.budgetRanges) ? raw.budgetRanges.map(str).filter(Boolean) : [],
    startingPrices: Array.isArray(raw.startingPrices) ? raw.startingPrices.filter(function (p) { return p && str(p.service) && str(p.price); }) : [],
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

  /* ---------- optional published prices ---------- */
  var prices = $('#prices');
  if (prices && CFG.startingPrices.length) {
    var list = $('#prices-list');
    CFG.startingPrices.forEach(function (p) {
      var li = el('li');
      li.appendChild(el('span', null, str(p.service)));
      li.appendChild(el('strong', null, str(p.price)));
      if (str(p.note)) li.appendChild(el('small', null, str(p.note)));
      list.appendChild(li);
    });
    prices.hidden = false;
  }

  /* ---------- optional budget ranges ---------- */
  var budget = $('#budget-options');
  if (budget && CFG.budgetRanges.length) {
    budget.textContent = '';
    CFG.budgetRanges.concat(['Not sure, help me decide']).forEach(function (r) {
      var label = el('label', { class: 'chip' });
      label.appendChild(el('input', { type: 'radio', name: 'budget', value: r }));
      label.appendChild(el('span', null, r));
      budget.appendChild(label);
    });
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
  if (toggle && navList) {
    toggle.hidden = false;
    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      navList.classList.toggle('is-open', open);
      if (!open && returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    $$('a', navList).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.nav')) setOpen(false);
    });
  }

  /* ---------- reveals ---------- */
  var revealables = $$('.reveal, .steps');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach(function (n) { io.observe(n); });
  } else {
    revealables.forEach(function (n) { n.classList.add('is-in'); });
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
    f.input.addEventListener('input', function () { if (f.input.getAttribute('aria-invalid') === 'true') validateField(key); });
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
    var budgetPick = $('input[name="budget"]:checked', form);
    return {
      name: get('name'),
      business: get('business'),
      email: get('email'),
      phone: get('phone'),
      website: get('website'),
      needs: $$('input[name="needs"]:checked', form).map(function (c) { return c.value; }).join(', '),
      budget: budgetPick ? budgetPick.value : '',
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
      return;
    }

    var data = payload();
    if (data._honey) return; // a bot filled the hidden field

    if (!connected) {
      var nodes = ['Not sent. This form isn’t connected to an inbox yet, so your details stayed on this page and nothing was sent.'];
      if (CFG.businessEmail) {
        var body = 'Name: ' + data.name + '\nBusiness: ' + data.business + '\nEmail: ' + data.email +
          (data.phone ? '\nPhone: ' + data.phone : '') + (data.website ? '\nWebsite: ' + data.website : '') +
          '\nNeeds: ' + data.needs + (data.budget ? '\nBudget: ' + data.budget : '') +
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
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');

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
      submit.disabled = false;
      submit.textContent = label;
      form.removeAttribute('aria-busy');
    });
  });
})();
