/* Shiny Text: a vanilla-JS port of React Bits' <ShinyText> text animation.
   Source: https://github.com/DavidHDev/react-bits, src/content/TextAnimations/ShinyText
   (ShinyText.jsx + ShinyText.css at commit d01aa914dcbe76da8b2923ebf872b5c8b1066e4c).
   Copyright (c) 2026 David Haz. MIT + Commons Clause License Condition v1.0, see
   assets/vendor/react-bits/LICENSE.txt. Used here as part of this website, which
   that license allows; the component itself is not sold or redistributed.

   What changed from the original:
   - No React. MMShinyText(el, options) returns { sweep, destroy }.
   - Only the "view" (once, when it scrolls into view) and "hover" triggers. No
     endless loop, no pointer following and no blur glow: the M&M design system
     keeps motion to one-off moments and has no glows.
   - The gradient is only painted while a sweep is running. At rest the element is
     plain text again (selectable, readable in forced-colors mode).
   - Does nothing when the visitor prefers reduced motion.
   The colour maths (gamma-correct blend, smoothstep falloff) is the original's. */
(function () {
  'use strict';

  var FALLOFF = [0, 0.2, 0.4, 0.6, 0.8, 1];
  var EASE = function (t) { return 0.5 - Math.cos(Math.PI * t) / 2; }; // the original's "smooth"
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };

  var paint = null;
  function parseColor(value) {
    if (!paint) paint = document.createElement('canvas').getContext('2d');
    if (!paint) return null;
    paint.fillStyle = '#000000';
    paint.fillStyle = value;
    var resolved = String(paint.fillStyle);
    if (resolved.charAt(0) === '#') return [1, 3, 5].map(function (i) { return parseInt(resolved.slice(i, i + 2), 16); }).concat(1);
    var parts = resolved.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return null;
    return [+parts[0], +parts[1], +parts[2], parts.length > 3 ? +parts[3] : 1];
  }
  function blend(from, to, amount) {
    var ch = function (a, b) { return Math.round(Math.pow(Math.pow(a / 255, 2.2) * (1 - amount) + Math.pow(b / 255, 2.2) * amount, 1 / 2.2) * 255); };
    return 'rgb(' + ch(from[0], to[0]) + ', ' + ch(from[1], to[1]) + ', ' + ch(from[2], to[2]) + ')';
  }

  window.MMShinyText = function (el, options) {
    var o = Object.assign({ shineColor: '#ffffff', speed: 1.8, delay: 0, angle: 120, shineWidth: 40, softness: 0.8, trigger: 'view', direction: 'left' }, options || {});
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var noop = { sweep: function () {}, destroy: function () {} };
    if (!el || reduce) return noop;

    var sign = o.direction === 'right' ? 1 : -1;
    var width = clamp(o.shineWidth, 2, 200);
    var softness = clamp(o.softness, 0, 1);
    var extent = width / 2 + 2;
    var entry = sign > 0 ? -extent : 100 + extent;
    var exit = sign > 0 ? 100 + extent : -extent;
    var raf = 0, timer = 0, start = 0, alive = true, base = null, shine = null;

    function gradient(pos) {
      var half = width / 2, core = half * (1 - softness), fade = half - core, stops = [];
      [-1, 1].forEach(function (side) {
        FALLOFF.forEach(function (f) {
          stops.push([pos + side * (core + fade * (1 - f)), f * f * (3 - 2 * f)]);
        });
      });
      stops.sort(function (a, b) { return a[0] - b[0]; });
      var list = stops.map(function (s) { return blend(base, shine, s[1]) + ' ' + s[0].toFixed(2) + '%'; });
      return 'linear-gradient(' + o.angle + 'deg, ' + blend(base, shine, 0) + ' 0%, ' + list.join(', ') + ', ' + blend(base, shine, 0) + ' 100%)';
    }
    function rest() {
      el.classList.remove('is-shining');
      el.style.backgroundImage = '';
    }
    function tick(now) {
      raf = 0;
      if (!alive) return;
      var t = clamp((now - start) / (o.speed * 1000), 0, 1);
      el.style.backgroundImage = gradient(entry + (exit - entry) * EASE(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else rest();
    }
    function sweep() {
      if (!alive || raf) return;
      // read the colour at sweep time, so a theme switch is picked up
      base = parseColor(getComputedStyle(el).color);
      shine = parseColor(o.shineColor);
      if (!base || !shine) return;
      start = performance.now();
      el.style.backgroundImage = gradient(entry);
      el.classList.add('is-shining');
      raf = requestAnimationFrame(tick);
    }

    var io = null;
    if (o.trigger === 'view' && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        if (!entries.some(function (en) { return en.isIntersecting; })) return;
        io.disconnect();
        timer = setTimeout(sweep, o.delay * 1000);
      });
      io.observe(el);
    }
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var onEnter = function () { sweep(); };
    if (o.hover && fine) el.addEventListener('pointerenter', onEnter);

    return {
      sweep: sweep,
      destroy: function () {
        alive = false;
        cancelAnimationFrame(raf);
        clearTimeout(timer);
        if (io) io.disconnect();
        el.removeEventListener('pointerenter', onEnter);
        rest();
      },
    };
  };
})();
