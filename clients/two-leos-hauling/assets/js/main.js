/* Two Leos Hauling: site behaviour. No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var CFG = window.TL_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- mobile menu ---------- */
  var toggle = $('.nav__toggle'), list = $('#nav-list');
  if (toggle && list) {
    toggle.hidden = false;
    var setOpen = function (open, focusBack) {
      toggle.setAttribute('aria-expanded', String(open));
      list.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      $$('main, footer, .dock').forEach(function (el) { el.inert = open; });
      if (open) { var a = $('a', list); if (a) a.focus(); }
      if (!open && focusBack) toggle.focus();
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true); });
    document.addEventListener('click', function (e) { if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.nav')) setOpen(false); });
    $$('a', list).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 980) setOpen(false); });
  }

  /* ---------- scroll reveals ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- hero video: tablets and desktops only, after the photo has painted, never with
     reduced motion, Save-Data or a slow connection. Phones keep the still photo (it loads faster). ---------- */
  var video = $('.hero__video');
  var conn = navigator.connection || {};
  var slow = conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || '');
  var wide = window.matchMedia && window.matchMedia('(min-width: 600px)').matches;
  if (video && wide && !reduceMotion && !slow && 'IntersectionObserver' in window) {
    var loaded = false, onScreen = true;
    var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    var start = function () {
      if (loaded) return; loaded = true;
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (t) {
        var src = video.getAttribute('data-src-' + t[0]); if (!src) return;
        var s = document.createElement('source'); s.src = src; s.type = t[1]; video.appendChild(s);
      });
      video.addEventListener('playing', function () { video.classList.add('is-playing'); }, { once: true });
      video.load(); if (onScreen) play();
    };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        onScreen = e.isIntersecting;
        if (!loaded) return;
        if (onScreen) play(); else video.pause();
      });
    }).observe(video);
    var later = function () { setTimeout(start, 1200); };
    if (document.readyState === 'complete') later(); else window.addEventListener('load', later);
  }

  /* ---------- phone dock: out of the way while the quote form is on screen ---------- */
  var dock = $('.dock'), req = $('#request');
  if (dock && req && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { dock.classList.toggle('is-hidden', e[0].isIntersecting); }, { threshold: 0.15 }).observe(req);
  }

  /* ---------- "Will it fit?" trailer calculator ---------- */
  var dataEl = $('#load-data');
  if (dataEl) {
    var ITEMS = JSON.parse(dataEl.textContent), CAP = 14, counts = {};
    Object.keys(ITEMS).forEach(function (k) { counts[k] = 0; });
    var fill = $('#trailer-fill'), pct = $('#trailer-pct'), yd = $('#load-yd'), trips = $('#load-trips'), quote = $('#load-quote');
    var render = function () {
      var total = 0, parts = [];
      Object.keys(counts).forEach(function (k) {
        total += counts[k] * ITEMS[k].yd;
        if (counts[k]) parts.push(counts[k] + ' × ' + ITEMS[k].label);
        $('#n-' + k).textContent = counts[k];
        var minus = $('.step__btn[data-item="' + k + '"][data-delta="-1"]'); if (minus) minus.disabled = !counts[k];
      });
      var share = Math.min(total / CAP, 1);
      fill.style.transform = 'scaleY(' + share.toFixed(3) + ')';
      pct.textContent = Math.round(total / CAP * 100) + '%';
      yd.textContent = (Math.round(total * 10) / 10).toString();
      trips.textContent = total > CAP ? 'That’s more than one load. Two Leos can tell you how many trips.' : (total ? 'Should fit in one trip by space alone.' : '');
      var size = total === 0 ? '' : total <= 2 ? 'A few items' : total <= 4 ? 'Pickup-truck load' : total <= 8 ? 'Half a trailer' : total <= CAP ? 'Full trailer' : 'Not sure';
      var q = new URLSearchParams();
      if (parts.length) q.set('items', parts.join(', '));
      if (size) q.set('size', size);
      quote.href = 'contact/' + (parts.length ? '?' + q.toString() : '') + '#request';
    };
    $$('.step__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-item');
        counts[k] = Math.max(0, Math.min(20, counts[k] + Number(b.getAttribute('data-delta'))));
        render();
      });
    });
    render();
  }

  /* ---------- quote form ---------- */
  var form = $('#quote-form');
  if (!form) return;
  var live = typeof CFG.formAction === 'string' && /^https:\/\//.test(CFG.formAction);
  var maxPhotos = CFG.maxPhotos || 6, maxBytes = (CFG.maxPhotoMB || 10) * 1024 * 1024;
  var photos = []; // { file, url }
  var fileInput = $('#q-photos'), thumbs = $('#thumbs'), drop = $('#drop');

  // prefill from the trailer calculator or a service link: ?items=…&size=…&service=…
  var params = new URLSearchParams(location.search);
  if (params.get('items')) $('#q-items').value = 'Items: ' + params.get('items') + '\n';
  if (params.get('size')) { var r = $('input[name="load_size"][value="' + params.get('size') + '"]', form); if (r) r.checked = true; }
  if (params.get('service')) { var o = $('#q-service option[value="' + params.get('service') + '"]'); if (o) o.selected = true; }

  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  $('#q-date').min = today.toISOString().slice(0, 10);

  var rules = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name so Two Leos knows who to ask for.'; },
    phone: function (v) { var d = v.replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); return d.length === 10 ? '' : 'Enter a 10-digit phone number, like 509-555-0123.'; },
    email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Check the email address, like name@example.com, or leave it blank.'; },
    zip: function (v) { return /^\d{5}$/.test(v.trim()) ? '' : 'Enter your 5-digit ZIP code, like 99207.'; },
    service: function (v) { return v ? '' : 'Choose the kind of job, or pick “Not sure yet”.'; },
    items: function (v) { return v.trim().length >= 8 ? '' : 'Tell us a little about what needs to go and where it is.'; },
    preferred_date: function (v) { return !v || v >= $('#q-date').min ? '' : 'Pick today or a later date.'; },
    consent: function (v, el) { return el.checked ? '' : 'Please tick the box so Two Leos can contact you about this request.'; },
  };
  var ids = { name: 'q-name', phone: 'q-phone', email: 'q-email', zip: 'q-zip', service: 'q-service', items: 'q-items', preferred_date: 'q-date', consent: 'q-consent' };
  var show = function (key, msg) {
    var el = $('#' + ids[key]), err = $('#' + ids[key] + '-err');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg; err.hidden = !msg;
  };
  var check = function (key) { var el = $('#' + ids[key]); var msg = rules[key](el.value, el); show(key, msg); return !msg; };
  Object.keys(ids).forEach(function (key) {
    var el = $('#' + ids[key]);
    el.addEventListener('blur', function () { if (el.value || el.getAttribute('aria-invalid') === 'true') check(key); });
    el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', function () { if (el.getAttribute('aria-invalid') === 'true') check(key); });
  });
  $('#q-zip').addEventListener('input', function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5); });

  // photos: previews from data: URLs (works under a strict CSP), remove buttons, size and count checks
  var photoErr = $('#q-photos-err');
  var setPhotoErr = function (m) { photoErr.textContent = m; photoErr.hidden = !m; };
  var renderThumbs = function () {
    thumbs.innerHTML = '';
    photos.forEach(function (p, i) {
      var li = document.createElement('li'); li.className = 'thumb';
      var im = document.createElement('img'); im.src = p.url; im.alt = 'Photo ' + (i + 1) + ': ' + p.file.name; im.width = 120; im.height = 120;
      var x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      x.addEventListener('click', function () { photos.splice(i, 1); renderThumbs(); setPhotoErr(''); fileInput.focus(); });
      li.append(im, x); thumbs.appendChild(li);
    });
    if (window.DataTransfer) { try { var dt = new DataTransfer(); photos.forEach(function (p) { dt.items.add(p.file); }); fileInput.files = dt.files; } catch (e) { /* older browsers keep the last selection */ } }
  };
  var addFiles = function (files) {
    var msg = '';
    Array.prototype.forEach.call(files, function (f) {
      if (!/^image\//.test(f.type) && !/\.(heic|heif)$/i.test(f.name)) { msg = f.name + ' isn’t a photo. Add JPG, PNG or HEIC images.'; return; }
      if (f.size > maxBytes) { msg = f.name + ' is over ' + (CFG.maxPhotoMB || 10) + ' MB. Try a smaller photo.'; return; }
      if (photos.length >= maxPhotos) { msg = 'You can add up to ' + maxPhotos + ' photos. Text any extras to (509) 688-5071.'; return; }
      var entry = { file: f, url: '' }; photos.push(entry);
      var fr = new FileReader();
      fr.onload = function () { entry.url = fr.result; renderThumbs(); };
      fr.readAsDataURL(f);
    });
    setPhotoErr(msg);
  };
  fileInput.addEventListener('change', function () {
    // the browser replaces the input's selection; keep earlier photos and add only the new ones
    var files = Array.prototype.slice.call(fileInput.files).filter(function (f) { return !photos.some(function (p) { return p.file === f; }); });
    addFiles(files);
    if (!files.length) renderThumbs();
  });
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });

  var submit = $('#q-submit'), status = $('#q-status'), sent = $('#q-sent');
  var label = submit.innerHTML;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('input[name="_honey"]', form).value) return; // bots fill the hidden field
    var bad = Object.keys(ids).filter(function (k) { return !check(k); });
    if (bad.length) {
      var first = $('#' + ids[bad[0]]); first.focus();
      if (!reduceMotion) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
      status.textContent = bad.length === 1 ? 'One thing needs fixing before this can be sent.' : bad.length + ' things need fixing before this can be sent.';
      status.hidden = false; return;
    }
    status.hidden = true;
    submit.disabled = true; submit.classList.add('is-loading'); submit.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
    if (live) {
      // a normal multipart POST so photos go along; FormSubmit returns to this page with ?sent=1
      form.action = CFG.formAction;
      var next = document.createElement('input'); next.type = 'hidden'; next.name = '_next'; next.value = location.origin + location.pathname + '?sent=1#request'; form.appendChild(next);
      HTMLFormElement.prototype.submit.call(form);
      return;
    }
    setTimeout(function () { done(true); }, 700);
  });

  var done = function (demo) {
    var fd = new FormData(form), name = (fd.get('name') || '').toString().trim();
    $('#sent-name').textContent = name ? ', ' + name.split(/\s+/)[0] : '';
    if (demo) {
      var rows = [['Name', fd.get('name')], ['Phone', fd.get('phone')], ['Email', fd.get('email') || '(not given)'], ['ZIP code', fd.get('zip')],
        ['Service', fd.get('service')], ['Items', fd.get('items')], ['Load size', fd.get('load_size') || '(not given)'],
        ['Preferred date', fd.get('preferred_date') || '(flexible)'], ['Photos', photos.length ? photos.length + ' attached' : 'None'], ['OK to contact', 'Yes']];
      var box = $('#inbox'); box.innerHTML = '';
      var h = document.createElement('p'); h.className = 'inbox__head';
      var s1 = document.createElement('strong'); s1.textContent = 'New hauling quote request'; h.append(s1, document.createTextNode(' · to 96shadle@gmail.com'));
      var dl = document.createElement('dl');
      rows.forEach(function (r) { var d = document.createElement('div'), t = document.createElement('dt'), v = document.createElement('dd'); t.textContent = r[0]; v.textContent = String(r[1] || ''); d.append(t, v); dl.appendChild(d); });
      box.append(h, dl);
      if (photos.length) {
        var pics = document.createElement('div'); pics.className = 'inbox__pics';
        photos.forEach(function (p, i) { if (!p.url) return; var im = document.createElement('img'); im.src = p.url; im.alt = 'Attached photo ' + (i + 1); im.width = 72; im.height = 72; pics.appendChild(im); });
        box.appendChild(pics);
      }
      $('#sent-demo').hidden = false;
    }
    form.hidden = true; sent.hidden = false; sent.focus();
    sent.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };
  if (params.get('sent') === '1') done(false);

  $('#q-again').addEventListener('click', function () {
    form.reset(); photos = []; renderThumbs(); setPhotoErr('');
    Object.keys(ids).forEach(function (k) { show(k, ''); });
    submit.disabled = false; submit.classList.remove('is-loading'); submit.innerHTML = label; form.removeAttribute('aria-busy');
    sent.hidden = true; $('#sent-demo').hidden = true; form.hidden = false; $('#q-name').focus();
  });
})();
