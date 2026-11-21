/* Action Roofing: site behaviour. No dependencies, no inline scripts (strict CSP). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var CFG = window.AR_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = mqReduce.matches;
  var PHONE = '(931) 645-4784';

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- header: border once scrolled ---------- */
  var top = $('.top');
  var onScrollHeader = function () { if (top) top.classList.toggle('is-stuck', window.scrollY > 4); };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = $('.nav__toggle'), panel = $('#nav-panel');
  if (toggle && panel) {
    toggle.hidden = false;
    var wideMQ = window.matchMedia('(min-width: 1140px)');
    var setOpen = function (open, focusBack) {
      toggle.setAttribute('aria-expanded', String(open));
      $('.nav__word', toggle).textContent = open ? 'Close' : 'Menu';
      panel.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      $$('main, footer, .dock, .brand, .top__phone, .top__cta').forEach(function (el) { el.inert = open; });
      if (open) { var a = $('a', panel); if (a) a.focus(); }
      if (!open && focusBack) toggle.focus();
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true); });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    var onWide = function () { if (wideMQ.matches) setOpen(false); };
    if (wideMQ.addEventListener) wideMQ.addEventListener('change', onWide);
  }

  /* ---------- phone dock: hide while the estimate form is on screen ---------- */
  // the page's own call buttons (hero) or the form are on screen: the dock steps aside
  var dock = $('.dock');
  var dockTargets = $$('[data-dock-hide], #estimate-form');
  if (dock && dockTargets.length && 'IntersectionObserver' in window) {
    var onScreenNow = [];
    var dockIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = onScreenNow.indexOf(e.target);
        if (e.isIntersecting && i < 0) onScreenNow.push(e.target);
        if (!e.isIntersecting && i > -1) onScreenNow.splice(i, 1);
      });
      dock.classList.toggle('is-hidden', onScreenNow.length > 0);
    }, { rootMargin: '0px 0px -10% 0px' });
    dockTargets.forEach(function (t) { dockIO.observe(t); });
  }

  /* ---------- hero video: tablets and desktops, after the still has painted; never with reduced
     motion, Save-Data or a slow connection. A pause button is shown while it plays. ---------- */
  var video = $('.hero__video'), pauseBtn = $('.hero__pause');
  var conn = navigator.connection || {};
  var slow = conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || '');
  var wide = window.matchMedia('(min-width: 600px)').matches;
  if (video && wide && !reduceMotion && !slow && 'IntersectionObserver' in window) {
    var loaded = false, onScreen = true, userPaused = false;
    var play = function () { if (userPaused) return; var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    var start = function () {
      if (loaded) return; loaded = true;
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (t) {
        var src = video.getAttribute('data-src-' + t[0]); if (!src) return;
        var s = document.createElement('source'); s.src = src; s.type = t[1]; video.appendChild(s);
      });
      video.addEventListener('playing', function () { video.classList.add('is-playing'); if (pauseBtn) pauseBtn.hidden = false; }, { once: true });
      video.load(); if (onScreen) play();
    };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { onScreen = e.isIntersecting; if (!loaded) return; if (onScreen) play(); else video.pause(); });
    }).observe(video);
    var kick = function () { setTimeout(start, 400); };
    if (document.readyState === 'complete') kick(); else window.addEventListener('load', kick, { once: true });
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      $('.vh', pauseBtn).textContent = userPaused ? 'Play background video' : 'Pause background video';
      if (userPaused) video.pause(); else play();
    });
  }

  /* ---------- the roof goes on, layer by layer, as the section scrolls ---------- */
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  $$('[data-layers]').forEach(function (sec) {
    if (reduceMotion) return; // everything stays built and listed
    sec.classList.add('is-live');
    var track = $('.layers__track', sec);
    var steps = $$('.lsteps__i', sec);
    var order = steps.map(function (s) { return s.getAttribute('data-step'); });
    var layer = function (k) { return $('[data-layer="' + k + '"]', sec); };
    var rolls = $$('.roll', sec), courses = $$('.course', sec);
    courses.sort(function (a, b) { return (+a.getAttribute('data-i')) - (+b.getAttribute('data-i')); });
    var fill = $('.lbar__fill', sec);
    var N = order.length, ticking = false, lastCur = -1;
    var set = function (el, t, y, x, s) {
      if (!el) return;
      el.style.opacity = String(t);
      el.style.transform = 'translate(' + (x || 0) + 'px,' + (y || 0) * (1 - t) + 'px)' + (s != null ? ' scaleX(' + s + ')' : '');
    };
    var render = function () {
      ticking = false;
      var r = track.getBoundingClientRect();
      var span = r.height - window.innerHeight;
      var p = span > 0 ? clamp(-r.top / span) : 1;
      // stage k runs from k/N to (k+1)/N, with a little hold at the end
      var stage = function (k) { return clamp((p * 1.08 * N - k) / 1); };
      order.forEach(function (k, i) {
        var t = stage(i);
        if (k === 'under') {
          set(layer(k), t > 0 ? 1 : 0);
          rolls.forEach(function (g, j) { var tt = clamp(t * rolls.length - j); g.style.opacity = tt > 0 ? '1' : '0'; g.style.transform = 'scaleX(' + easeOut(tt) + ')'; });
        } else if (k === 'shingles') {
          set(layer(k), t > 0 ? 1 : 0);
          courses.forEach(function (g, j) { var tt = easeOut(clamp(t * courses.length * 0.9 - j * 0.9)); g.style.opacity = String(tt); g.style.transform = 'translateY(' + (-14 * (1 - tt)) + 'px)'; });
        } else if (k === 'ridge') {
          set(layer(k), easeOut(t), -18);
        } else if (k === 'gutter') {
          set(layer(k), easeOut(t), 16);
        } else if (k === 'drip') {
          set(layer(k), easeOut(t), 10);
        } else {
          set(layer(k), easeOut(t), -10);
        }
      });
      var cur = Math.min(N - 1, Math.floor(clamp(p * 1.08) * N));
      if (cur !== lastCur) {
        steps.forEach(function (s, i) { s.classList.toggle('is-cur', i === cur); s.classList.toggle('is-done', i < cur); });
        lastCur = cur;
      }
      if (fill) fill.style.transform = 'scaleX(' + clamp(p * 1.08) + ')';
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();
  });

  /* ---------- "start with what you're seeing" ---------- */
  var chips = $('[data-picker]'), pickPanel = $('[data-picker-panel]');
  if (chips && pickPanel) {
    chips.hidden = false; pickPanel.hidden = false;
    var btns = $$('.chip', chips);
    var choose = function (key, fromHash) {
      var tpl = $('template[data-pick-result="' + key + '"]'); if (!tpl) return;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pick') === key)); });
      var box = document.createElement('div'); box.className = 'pick__res';
      box.appendChild(tpl.content.cloneNode(true));
      pickPanel.innerHTML = ''; pickPanel.appendChild(box);
      if (!fromHash && history.replaceState) history.replaceState(null, '', '#see-' + key);
      if (window.innerWidth < 980 && !fromHash) pickPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { choose(b.getAttribute('data-pick')); }); });
    var m = /^#see-(\w+)$/.exec(location.hash); if (m) choose(m[1], true);
  }

  /* ---------- FAQ: an open answer is reflected in the address, so a shared link opens it ---------- */
  $$('details.qa').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open && history.replaceState) history.replaceState(null, '', '#' + d.id);
    });
  });
  var hashQa = location.hash && document.getElementById(location.hash.slice(1));
  if (hashQa && hashQa.matches('details.qa')) hashQa.open = true;

  /* ---------- ZIP check ---------- */
  var CLARKSVILLE = ['37040', '37041', '37042', '37043', '37044'];
  $$('[data-zip]').forEach(function (z) {
    var input = $('input', z), out = $('.zip__out', z);
    input.addEventListener('input', function () { input.value = input.value.replace(/\D/g, '').slice(0, 5); });
    z.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim(); out.className = 'zip__out';
      if (!/^\d{5}$/.test(v)) { out.textContent = 'Enter a 5-digit ZIP code, like 37043.'; out.classList.add('is-bad'); input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      input.setAttribute('aria-invalid', 'false');
      if (CLARKSVILLE.indexOf(v) > -1) { out.textContent = v + ' is in Clarksville, our home base. Call ' + PHONE + ' or request an estimate.'; out.classList.add('is-in'); }
      else { out.textContent = v + ' is outside Clarksville. We also work in surrounding areas, so call ' + PHONE + ' to check your address.'; out.classList.add('is-near'); }
    });
  });

  /* ---------- estimate form ---------- */
  var form = $('#estimate-form');
  if (!form) return;
  var live = typeof CFG.formAction === 'string' && /^https:\/\//.test(CFG.formAction);
  if (live) $$('[data-preview-only]', form).forEach(function (el) { el.hidden = true; });
  var loadedAt = Date.now();
  var maxPhotos = CFG.maxPhotos || 5, maxMB = CFG.maxPhotoMB || 10, maxBytes = maxMB * 1024 * 1024;
  var photos = [];
  var fileInput = $('#f-photos'), thumbs = $('#thumbs'), drop = $('#drop');

  var params = new URLSearchParams(location.search);
  if (params.get('service')) { var o = $('#f-service option[value="' + params.get('service').replace(/"/g, '') + '"]'); if (o) o.selected = true; }

  var digits = function (v) { var d = v.replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); return d; };
  var method = function () { var r = $('input[name="contact_method"]:checked', form); return r ? r.value : ''; };
  var rules = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name so we know who to ask for.'; },
    phone: function (v) { return digits(v).length === 10 ? '' : 'Enter a 10-digit phone number, like 931-555-0123.'; },
    email: function (v) {
      if (!v.trim()) return method() === 'Email' ? 'Enter your email, or choose “Phone call” below.' : '';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Check the email address, like name@example.com.';
    },
    property: function (v) { var t = v.trim(); return /\b\d{5}\b/.test(t) || t.length >= 8 ? '' : 'Enter the property’s 5-digit ZIP code or its street address.'; },
    service: function (v) { return v ? '' : 'Choose a service, or pick “Not sure yet”.'; },
    description: function (v) { return v.trim().length >= 10 ? '' : 'Tell us a little about what you’ve noticed (a sentence is plenty).'; },
  };
  var ids = { name: 'f-name', phone: 'f-phone', email: 'f-email', property: 'f-place', service: 'f-service', description: 'f-desc' };
  var show = function (key, msg) {
    var el = $('#' + ids[key]), err = $('#' + ids[key] + '-err');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg; err.hidden = !msg;
  };
  var check = function (key) { var el = $('#' + ids[key]); var msg = rules[key](el.value, el); show(key, msg); return !msg; };
  Object.keys(ids).forEach(function (key) {
    var el = $('#' + ids[key]);
    el.addEventListener('blur', function () { if (el.value || el.getAttribute('aria-invalid') === 'true') check(key); });
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () { if (el.getAttribute('aria-invalid') === 'true') check(key); });
  });
  var emailOpt = $('#f-email-opt');
  $$('input[name="contact_method"]', form).forEach(function (r) {
    r.addEventListener('change', function () {
      emailOpt.textContent = method() === 'Email' ? '(needed to email you)' : '(optional)';
      if ($('#f-email').getAttribute('aria-invalid') === 'true' || method() !== 'Email') check('email');
    });
  });

  // photos: previews from data: URLs (allowed by the CSP), with remove buttons and size/count checks
  var photoErr = $('#f-photos-err');
  var setPhotoErr = function (m) { photoErr.textContent = m; photoErr.hidden = !m; };
  var syncInput = function () {
    if (!window.DataTransfer) return;
    try { var dt = new DataTransfer(); photos.forEach(function (p) { dt.items.add(p.file); }); fileInput.files = dt.files; } catch (e) { /* keeps the last selection */ }
  };
  var renderThumbs = function () {
    thumbs.innerHTML = '';
    photos.forEach(function (p, i) {
      var li = document.createElement('li'); li.className = 'thumb';
      var im = document.createElement('img'); im.src = p.url || ''; im.alt = 'Photo ' + (i + 1) + ': ' + p.file.name; im.width = 88; im.height = 88;
      var x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      x.addEventListener('click', function () { photos.splice(i, 1); renderThumbs(); syncInput(); setPhotoErr(''); fileInput.focus(); });
      li.append(im, x); thumbs.appendChild(li);
    });
  };
  var addFiles = function (files) {
    var msg = '';
    Array.prototype.forEach.call(files, function (f) {
      if (!/^image\/(jpeg|png|heic|heif|webp)$/.test(f.type) && !/\.(jpe?g|png|heic|heif|webp)$/i.test(f.name)) { msg = f.name + ' isn’t a photo. Add JPG, PNG or HEIC images.'; return; }
      if (f.size > maxBytes) { msg = f.name + ' is over ' + maxMB + ' MB. Try a smaller photo.'; return; }
      if (photos.length >= maxPhotos) { msg = 'You can add up to ' + maxPhotos + ' photos.'; return; }
      var entry = { file: f, url: '' }; photos.push(entry);
      var fr = new FileReader();
      fr.onload = function () { entry.url = String(fr.result); renderThumbs(); };
      fr.readAsDataURL(f);
    });
    renderThumbs(); syncInput(); setPhotoErr(msg);
  };
  fileInput.addEventListener('change', function () {
    var files = Array.prototype.slice.call(fileInput.files).filter(function (f) { return !photos.some(function (p) { return p.file === f; }); });
    addFiles(files);
  });
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });

  var submit = $('#f-submit'), status = $('#f-status'), btnLabel = $('.btn__label', submit);
  var setStatus = function (cls, nodes) {
    status.className = 'status ' + cls; status.innerHTML = '';
    status.setAttribute('role', cls === 'status--warn' ? 'alert' : 'status');
    nodes.forEach(function (n) { status.appendChild(n); });
    status.hidden = false;
  };
  var el = function (tag, text, cls) { var e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };
  var callBtn = function () { var a = el('a', null, 'btn btn--red'); a.href = 'tel:+19316454784'; a.textContent = 'Call ' + PHONE; return a; };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('input[name="_honey"]', form).value) return; // bots fill the hidden field
    var bad = Object.keys(ids).filter(function (k) { return !check(k); });
    if (bad.length) {
      $('#' + ids[bad[0]]).focus();
      if (!reduceMotion) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
      setStatus('status--warn', [el('p', bad.length === 1 ? 'One field needs fixing before this can be sent. It’s marked above.' : bad.length + ' fields need fixing before this can be sent. They’re marked above.')]);
      return;
    }
    if ((Date.now() - loadedAt) / 1000 < (CFG.minSeconds || 3)) {
      setStatus('status--warn', [el('p', 'That was quick. Please check your details and press send again.')]);
      loadedAt = 0; return;
    }
    status.hidden = true;
    submit.disabled = true; submit.classList.add('is-loading'); btnLabel.textContent = 'Checking…'; form.setAttribute('aria-busy', 'true'); submit.setAttribute('aria-busy', 'true');
    if (live) {
      // a normal multipart POST so photos go along; FormSubmit returns to this page with ?sent=1 only after it receives the request
      btnLabel.textContent = 'Sending…';
      form.action = CFG.formAction;
      var next = document.createElement('input'); next.type = 'hidden'; next.name = '_next'; next.value = location.origin + location.pathname + '?sent=1#estimate'; form.appendChild(next);
      HTMLFormElement.prototype.submit.call(form);
      return;
    }
    setTimeout(previewResult, 500);
  });

  // Preview mode: nothing is sent, and the page says so. It shows what the owner would receive.
  var previewResult = function () {
    submit.disabled = false; submit.classList.remove('is-loading'); btnLabel.textContent = 'Send my estimate request'; form.removeAttribute('aria-busy'); submit.removeAttribute('aria-busy');
    var fd = new FormData(form);
    var rows = [['Name', fd.get('name')], ['Phone', fd.get('phone')], ['Email', fd.get('email') || '(not given)'], ['Property', fd.get('property')],
      ['Service', fd.get('service')], ['What they noticed', fd.get('description')], ['Photos', photos.length ? photos.length + ' attached' : 'None'], ['Contact by', fd.get('contact_method') || 'Phone call']];
    var dl = el('dl');
    rows.forEach(function (r) { dl.append(el('dt', r[0]), el('dd', String(r[1] || ''))); });
    setStatus('status--preview', [
      el('h3', 'Not sent: this preview form isn’t connected yet'),
      el('p', 'Your details are valid, but nothing left this page. Once the site goes live, Action Roofing will receive this request:'),
      dl,
      el('p', 'To reach Action Roofing today, call:'),
      callBtn()
    ]);
    status.focus();
  };
  if (params.get('sent') === '1') {
    form.querySelectorAll('input, select, textarea, button').forEach(function (x) { x.disabled = true; });
    setStatus('status--ok', [el('h3', 'Request sent'), el('p', 'Action Roofing has your request and will contact you using the details you gave. Need to talk sooner? Call ' + PHONE + '.')]);
  }
})();
